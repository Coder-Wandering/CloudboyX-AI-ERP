/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { UniversalGateway } from '../gateway';
import { CanonicalOrder } from '../canonical';

describe('Canonical Schema Normalization Logic', () => {
  describe('UniversalGateway.fromShopifyWebhook', () => {
    it('should normalize a standard Shopify webhook into CanonicalOrder with integer cent amounts', () => {
      const shopifyPayload = {
        id: 9402128,
        currency: 'USD',
        email: 'customer@ecommerce.com',
        total_price: '179.89',
        total_tax: '14.90',
        created_at: '2026-06-18T10:30:00Z',
        line_items: [
          {
            id: 101,
            sku: 'CLTH-SWEATER-0',
            name: 'Autumn Cashmere Sweater',
            price: '120.00',
            quantity: 1,
          },
          {
            id: 102,
            sku: 'ACC-LEATHER-BELT',
            name: 'Full Grain Leather Belt',
            price: '44.99',
            quantity: 1,
          },
        ],
      };

      const canonical: CanonicalOrder = UniversalGateway.fromShopifyWebhook(shopifyPayload);

      expect(canonical.sourceSystem).toBe('shopify');
      expect(canonical.sourceOrderId).toBe('9402128');
      expect(canonical.customerEmail).toBe('customer@ecommerce.com');
      expect(canonical.totalAmount).toBe(17989); // $179.89 in cents
      expect(canonical.taxAmount).toBe(1490);    // $14.90 in cents
      expect(canonical.createdAt).toEqual(new Date('2026-06-18T10:30:00Z'));

      expect(canonical.items).toHaveLength(2);
      expect(canonical.items[0]).toEqual({
        sku: 'CLTH-SWEATER-0',
        quantity: 1,
        unitPrice: 12000,
        currency: 'USD',
      });
      expect(canonical.items[1]).toEqual({
        sku: 'ACC-LEATHER-BELT',
        quantity: 1,
        unitPrice: 4499,
        currency: 'USD',
      });
    });

    it('should handle missing email and missing skus gracefully with safe defaults', () => {
      const payloadWithoutEmail = {
        order_number: 55432,
        line_items: [
          { price: '19.99', quantity: '2' }
        ],
        total_price: '39.98',
        total_tax: '0.00',
      };

      const canonical = UniversalGateway.fromShopifyWebhook(payloadWithoutEmail);

      expect(canonical.sourceOrderId).toBe('55432');
      expect(canonical.customerEmail).toBe('customer@shopify.store');
      expect(canonical.items[0].sku).toBe('unknown-sku');
      expect(canonical.items[0].quantity).toBe(2);
      expect(canonical.items[0].unitPrice).toBe(1999);
      expect(canonical.totalAmount).toBe(3998);
      expect(canonical.taxAmount).toBe(0);
    });

    it('should throw an error on null or malformed payloads', () => {
      expect(() => {
        UniversalGateway.fromShopifyWebhook(null);
      }).toThrow();
    });
  });

  describe('UniversalGateway.fromLegacyCSVRow', () => {
    it('should normalize a standard supplier CSV row with PartNum, Qty, and UnitPrice', () => {
      const csvRow = {
        RecordID: 'INV-10255',
        PartNum: 'IND-STEEL-BRCKT',
        Qty: '4',
        UnitPrice: '49.99',
        OrderTotal: '199.96',
        CustEmail: 'purchasing@industrial.corp',
        Date: '2026-06-15',
      };

      const canonical = UniversalGateway.fromLegacyCSVRow(csvRow);

      expect(canonical.sourceSystem).toBe('legacy_csv');
      expect(canonical.sourceOrderId).toBe('INV-10255');
      expect(canonical.customerEmail).toBe('purchasing@industrial.corp');
      expect(canonical.items[0].sku).toBe('IND-STEEL-BRCKT');
      expect(canonical.items[0].quantity).toBe(4);
      expect(canonical.items[0].unitPrice).toBe(4999);
      expect(canonical.totalAmount).toBe(19996);
      expect(canonical.taxAmount).toBe(0); // Legacy flat files default tax to 0
    });

    it('should calculate totalAmount dynamically from unitPrice * quantity if OrderTotal is missing', () => {
      const csvRowWithoutTotal = {
        OrderNum: 'ORD-8819',
        SKU: 'WIDGET-X',
        Quantity: '3',
        Price: '25.00',
        Email: 'ops@widgetco.net',
      };

      const canonical = UniversalGateway.fromLegacyCSVRow(csvRowWithoutTotal);

      expect(canonical.sourceOrderId).toBe('ORD-8819');
      expect(canonical.customerEmail).toBe('ops@widgetco.net');
      expect(canonical.items[0].sku).toBe('WIDGET-X');
      expect(canonical.items[0].quantity).toBe(3);
      expect(canonical.items[0].unitPrice).toBe(2500);
      expect(canonical.totalAmount).toBe(7500); // 3 * 2500
    });

    it('should support alternative legacy headers like ItemNumber, Cost, InvoiceNo', () => {
      const altRow = {
        InvoiceNo: 'TX-9901',
        ItemNumber: 'CABLE-CAT6-100FT',
        Qty: '2',
        Cost: '18.50',
      };

      const canonical = UniversalGateway.fromLegacyCSVRow(altRow);

      expect(canonical.sourceOrderId).toBe('TX-9901');
      expect(canonical.items[0].sku).toBe('CABLE-CAT6-100FT');
      expect(canonical.items[0].unitPrice).toBe(1850);
      expect(canonical.totalAmount).toBe(3700);
    });
  });

  describe('UniversalGateway.fromEDIPayload', () => {
    it('should normalize ANSI X12 EDI 850 Purchase Order payload into CanonicalOrder', () => {
      const ediPayload = {
        transaction_sets: [
          {
            heading: {
              beginning_segment_for_purchase_order: {
                purchase_order_number: 'PO-EDI-904128',
              },
              po1_loop: [
                {
                  baseline_item_data: {
                    product_service_id: 'BULK-PALLET-A',
                    quantity_ordered: '5',
                    unit_price: '250.00',
                  },
                },
                {
                  baseline_item_data: {
                    product_service_id: 'PACK-STRAP-HEAVY',
                    quantity_ordered: '10',
                    unit_price: '15.50',
                  },
                },
              ],
            },
          },
        ],
      };

      const canonical = UniversalGateway.fromEDIPayload(ediPayload);

      expect(canonical.sourceSystem).toBe('edi');
      expect(canonical.sourceOrderId).toBe('PO-EDI-904128');
      expect(canonical.customerEmail).toBe('edi-partner@b2b.system');
      expect(canonical.items).toHaveLength(2);

      // Line 1: 5 * 25000 = 125000
      expect(canonical.items[0].sku).toBe('BULK-PALLET-A');
      expect(canonical.items[0].quantity).toBe(5);
      expect(canonical.items[0].unitPrice).toBe(25000);

      // Line 2: 10 * 1550 = 15500
      expect(canonical.items[1].sku).toBe('PACK-STRAP-HEAVY');
      expect(canonical.items[1].quantity).toBe(10);
      expect(canonical.items[1].unitPrice).toBe(1550);

      // Total = 125000 + 15500 = 140500
      expect(canonical.totalAmount).toBe(140500);
      expect(canonical.taxAmount).toBe(0);
    });

    it('should throw an error on malformed EDI payload lacking transaction sets', () => {
      expect(() => {
        UniversalGateway.fromEDIPayload({});
      }).toThrow();
    });
  });

  describe('UniversalGateway.getCanonicalSchemaDefinition & Sync', () => {
    it('should return authoritative CanonicalSchemaDefinition v2.5.0-canonical', () => {
      const schema = UniversalGateway.getCanonicalSchemaDefinition();
      expect(schema.version).toBe('2.5.0-canonical');
      expect(schema.entity).toBe('CanonicalOrder');
      expect(schema.sourceSystemsSupported).toContain('shopify');
      expect(schema.sourceSystemsSupported).toContain('legacy_csv');
      expect(schema.sourceSystemsSupported).toContain('edi');
      expect(schema.fields).toHaveProperty('sourceOrderId');
      expect(schema.fields).toHaveProperty('totalAmount');
      expect(schema.fields.totalAmount.unit).toBe('cents (USD)');
      expect(schema.fields).toHaveProperty('items');
      expect(schema.fields.items.subFields).toHaveProperty('sku');
    });
  });
});

