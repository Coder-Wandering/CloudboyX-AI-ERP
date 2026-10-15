/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalOrder, CanonicalLineItem } from './canonical';

export class UniversalGateway {
  
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

      const totalRaw = row['OrderTotal'] || row['Total'] || '0';
      const total = totalRaw ? Math.round(parseFloat(totalRaw) * 100) : (unitPrice * quantity);

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
