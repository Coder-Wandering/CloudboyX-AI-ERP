/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CanonicalLineItem {
  sku: string;
  quantity: number;
  unitPrice: number; // Stored in cents to avoid floating-point issues (e.g., $10.50 -> 1050)
  currency: string;
}

export interface CanonicalOrder {
  sourceSystem: 'shopify' | 'legacy_csv' | 'edi' | 'manual' | 'ai_mapped';
  sourceOrderId: string;
  customerEmail: string;
  items: CanonicalLineItem[];
  totalAmount: number; // Stored in cents
  taxAmount: number;   // Stored in cents
  createdAt: Date;
}

export interface RecentScanItem {
  id: string;
  rawData: string;
  sourceSystem: string;
  sourceOrderId: string;
  customerEmail: string;
  totalAmount: number; // Stored in cents
  taxAmount: number;   // Stored in cents
  itemsCount: number;
  timestamp: string; // ISO string
  isFavorite?: boolean; // Flag for frequently scanned order patterns
  favorite?: boolean;
}

export interface CanonicalFieldDefinition {
  field: string;
  type: 'string' | 'number' | 'date' | 'array' | 'enum' | 'boolean';
  description: string;
  example: string | number;
  required: boolean;
  unit?: string;
  enumValues?: string[];
  subFields?: Record<string, CanonicalFieldDefinition>;
}

export interface CanonicalSchemaDefinition {
  version: string;
  entity: string;
  description: string;
  sourceSystemsSupported: Array<'shopify' | 'legacy_csv' | 'edi' | 'manual' | 'ai_mapped'>;
  fields: Record<string, CanonicalFieldDefinition>;
  lastUpdated: string;
}
