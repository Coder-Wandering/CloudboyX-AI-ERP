/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanonicalOrderAuditCard } from '../components/CanonicalOrderAuditCard';
import { CanonicalOrder } from '../canonical';

describe('CanonicalOrderAuditCard (React Testing Library Component Tests)', () => {
  const sampleOrder: CanonicalOrder = {
    sourceSystem: 'shopify',
    sourceOrderId: 'SH-84920',
    customerEmail: 'alice.miller@icloud.com',
    items: [
      { sku: 'VNTG-TEE-BLK', quantity: 2, unitPrice: 3500, currency: 'USD' },
      { sku: 'DENIM-JKT-L', quantity: 1, unitPrice: 8990, currency: 'USD' }
    ],
    totalAmount: 17480, // $174.80 total in cents
    taxAmount: 1490,    // $14.90 tax in cents (Revenue = $159.90 -> 15990 cents)
    createdAt: new Date('2026-06-25T11:20:00Z'),
  };

  it('should render normalized order header, source system badge, and customer email', () => {
    render(<CanonicalOrderAuditCard order={sampleOrder} />);

    expect(screen.getByTestId('source-badge')).toHaveTextContent('shopify');
    expect(screen.getByTestId('order-id')).toHaveTextContent('#SH-84920');
    expect(screen.getByTestId('customer-email')).toHaveTextContent('alice.miller@icloud.com');
  });

  it('should render all normalized line items with formatted unit prices and totals', () => {
    render(<CanonicalOrderAuditCard order={sampleOrder} />);

    expect(screen.getByTestId('line-item-0')).toHaveTextContent('VNTG-TEE-BLK');
    expect(screen.getByTestId('line-item-0')).toHaveTextContent('× 2');
    expect(screen.getByTestId('line-item-0')).toHaveTextContent('$35.00 ea ($70.00)');

    expect(screen.getByTestId('line-item-1')).toHaveTextContent('DENIM-JKT-L');
    expect(screen.getByTestId('line-item-1')).toHaveTextContent('× 1');
    expect(screen.getByTestId('line-item-1')).toHaveTextContent('$89.90 ea ($89.90)');
  });

  it('should render revenue subtotal, tax amount, and total amount breakdown in dollars', () => {
    render(<CanonicalOrderAuditCard order={sampleOrder} />);

    expect(screen.getByTestId('subtotal-revenue')).toHaveTextContent('$159.90');
    expect(screen.getByTestId('tax-amount')).toHaveTextContent('$14.90');
    expect(screen.getByTestId('total-amount')).toHaveTextContent('$174.80');
  });

  it('should verify GAAP Balanced status and equal totals for debits and credits', () => {
    render(<CanonicalOrderAuditCard order={sampleOrder} postedToCash={true} />);

    expect(screen.getByTestId('balance-badge')).toHaveTextContent('GAAP BALANCED');
    expect(screen.getByTestId('total-debits')).toHaveTextContent('$174.80');
    expect(screen.getByTestId('total-credits')).toHaveTextContent('$174.80');
  });

  it('should toggle SQL script preview when the inspect button is clicked', () => {
    render(<CanonicalOrderAuditCard order={sampleOrder} />);

    // Initially SQL preview is hidden
    expect(screen.queryByTestId('sql-preview')).toBeNull();

    // Click toggle button
    const toggleButton = screen.getByTestId('toggle-sql-button');
    fireEvent.click(toggleButton);

    // SQL preview is now visible
    const sqlPreview = screen.getByTestId('sql-preview');
    expect(sqlPreview).toBeInTheDocument();
    expect(sqlPreview).toHaveTextContent('BEGIN;');
    expect(sqlPreview).toHaveTextContent('INSERT INTO transactions');
    expect(sqlPreview).toHaveTextContent('COMMIT;');

    // Click again to hide
    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('sql-preview')).toBeNull();
  });

  it('should trigger onPost callback with complete posting calculation result when button is pressed', () => {
    const handlePost = vi.fn();
    render(<CanonicalOrderAuditCard order={sampleOrder} onPost={handlePost} />);

    const postBtn = screen.getByTestId('post-to-ledger-btn');
    fireEvent.click(postBtn);

    expect(handlePost).toHaveBeenCalledTimes(1);
    const result = handlePost.mock.calls[0][0];
    expect(result.isBalanced).toBe(true);
    expect(result.sourceOrderId).toBe('SH-84920');
    expect(result.totalDebits).toBe(17480);
    expect(result.totalCredits).toBe(17480);
  });
});
