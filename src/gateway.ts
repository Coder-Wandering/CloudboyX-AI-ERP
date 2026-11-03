/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalOrder, CanonicalLineItem, CanonicalSchemaDefinition } from './canonical';

export class UniversalGateway {
  
  // 0. Latest Canonical Schema Definition for Universal Gateway
  static getCanonicalSchemaDefinition(): CanonicalSchemaDefinition {
    return {
      version: '2.5.0-canonical',
      entity: 'CanonicalOrder',
      description: 'Normalized universal order definition for multi-channel commerce, double-entry ERP posting, and visual template parameter binding',
      lastUpdated: '2026-11-02T13:30:00.000Z',
      sourceSystemsSupported: ['shopify', 'legacy_csv', 'edi', 'manual', 'ai_mapped'],
      fields: {
        sourceSystem: {
          field: 'sourceSystem',
          type: 'enum',
          description: 'Origin ingestion channel adapter name',
          example: 'shopify',
          required: true,
          enumValues: ['shopify', 'legacy_csv', 'edi', 'manual', 'ai_mapped'],
        },
        sourceOrderId: {
          field: 'sourceOrderId',
          type: 'string',
          description: 'Unique external order/invoice identifier from originating source system',
          example: 'SH-84920',
          required: true,
        },
        customerEmail: {
          field: 'customerEmail',
          type: 'string',
          description: 'Validated customer primary contact email address',
          example: 'customer@store.com',
          required: true,
        },
        totalAmount: {
          field: 'totalAmount',
          type: 'number',
          unit: 'cents (USD)',
          description: 'Grand total payable transaction amount in cents to eliminate floating-point rounding errors',
          example: 17480,
          required: true,
        },
        taxAmount: {
          field: 'taxAmount',
          type: 'number',
          unit: 'cents (USD)',
          description: 'Total calculated sales, VAT, or GST tax in cents',
          example: 1490,
          required: true,
        },
        createdAt: {
          field: 'createdAt',
          type: 'date',
          description: 'Standardized ISO-8601 creation timestamp normalized across all channels',
          example: '2026-06-25T11:20:00.000Z',
          required: true,
        },
        items: {
          field: 'items',
          type: 'array',
          description: 'Normalized line items breakdown array',
          example: '2 line items',
          required: true,
          subFields: {
            sku: {
              field: 'sku',
              type: 'string',
              description: 'Stock Keeping Unit unique product code',
              example: 'VNTG-TEE-BLK',
              required: true,
            },
            quantity: {
              field: 'quantity',
              type: 'number',
              description: 'Item unit purchase count',
              example: 2,
              required: true,
            },
            unitPrice: {
              field: 'unitPrice',
              type: 'number',
              unit: 'cents (USD)',
              description: 'Unit item price in cents',
              example: 3500,
              required: true,
            },
            currency: {
              field: 'currency',
              type: 'string',
              description: 'ISO-4217 three-letter currency code',
              example: 'USD',
              required: true,
            },
          },
        },
      },
    };
  }
  
  // 1. Adapter for Modern Webhooks (e.g., Shopify)
  static fromShopifyWebhook(payload: any): CanonicalOrder {
    try {
      const lineItems = payload?.line_items || [];
      const items: CanonicalLineItem[] = lineItems.map((item: any) => ({
        sku: item.sku || 'unknown-sku',
        quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || '0', 10),
        unitPrice: Math.round(parseFloat(item.price || '0') * 100), // convert to cents
        currency: payload.currency || 'USD',
      }));

      const total = Math.round(parseFloat(payload.total_price || '0') * 100);
      const tax = Math.round(parseFloat(payload.total_tax || '0') * 100);

      return {
        sourceSystem: 'shopify',
        sourceOrderId: (payload.id || payload.order_number || 'unknown-shopify-id').toString(),
        customerEmail: payload.email || 'customer@shopify.store',
        items,
        totalAmount: total,
        taxAmount: tax,
        createdAt: payload.created_at ? new Date(payload.created_at) : new Date(),
      };
    } catch (e: any) {
      throw new Error(`Failed to parse Shopify Webhook: ${e.message}`);
    }
  }

  // 2. Adapter for Legacy CSVs (e.g., flat supplier file)
  static fromLegacyCSVRow(row: any): CanonicalOrder {
    try {
      // CSV rows can have varying mappings
      const sku = row['PartNum'] || row['SKU'] || row['ItemNumber'] || 'unknown-sku';
      const quantity = parseInt(row['Qty'] || row['Quantity'] || '1', 10);
      const unitPriceRaw = row['UnitPrice'] || row['Price'] || row['Cost'] || '0';
      const unitPrice = Math.round(parseFloat(unitPriceRaw) * 100);
      const currency = row['Currency'] || 'USD';

      const items: CanonicalLineItem[] = [
        {
          sku,
          quantity,
          unitPrice,
          currency,
        }
      ];

      const totalRaw = row['OrderTotal'] ?? row['Total'];
      const total = (totalRaw !== undefined && totalRaw !== null && totalRaw !== '') 
        ? Math.round(parseFloat(totalRaw) * 100) 
        : (unitPrice * quantity);

      return {
        sourceSystem: 'legacy_csv',
        sourceOrderId: (row['RecordID'] || row['OrderNum'] || row['InvoiceNo'] || Math.floor(Math.random() * 100000).toString()).toString(),
        customerEmail: row['CustEmail'] || row['Email'] || 'unknown@legacy.system',
        items,
        totalAmount: total,
        taxAmount: 0, // Legacy CSVs often lack discrete tax detail
        createdAt: row['Date'] || row['OrderDate'] ? new Date(row['Date'] || row['OrderDate']) : new Date(),
      };
    } catch (e: any) {
      throw new Error(`Failed to parse Legacy CSV Row: ${e.message}`);
    }
  }

  // 3. Adapter for API-Translated EDI (e.g., converted via Stedi/Orderful)
  // Even translated EDI has weird structures (like loops, segments, qualifiers).
  static fromEDIPayload(payload: any): CanonicalOrder {
    try {
      if (!payload || !payload.transaction_sets || !Array.isArray(payload.transaction_sets) || payload.transaction_sets.length === 0) {
        throw new Error('Invalid EDI 850 payload: Missing transaction_sets');
      }

      const rawItems = payload.transaction_sets?.[0]?.heading?.po1_loop || [];
      
      const items: CanonicalLineItem[] = rawItems.map((item: any) => ({
        sku: item.baseline_item_data?.product_service_id || 'unknown-sku',
        quantity: parseInt(item.baseline_item_data?.quantity_ordered || '0', 10),
        unitPrice: Math.round(parseFloat(item.baseline_item_data?.unit_price || '0') * 100),
        currency: 'USD', // Standard EDI defaults
      }));

      // Calculate sum of lines if header total is deep in another loop
      const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      const poNumber = payload.transaction_sets?.[0]?.heading?.beginning_segment_for_purchase_order?.purchase_order_number || 'unknown-edi-po';

      return {
        sourceSystem: 'edi',
        sourceOrderId: poNumber,
        customerEmail: 'edi-partner@b2b.system',
        items,
        totalAmount: total,
        taxAmount: 0, 
        createdAt: new Date(),
      };
    } catch (e: any) {
      throw new Error(`Failed to parse EDI 850 Payload: ${e.message}`);
    }
  }
}
