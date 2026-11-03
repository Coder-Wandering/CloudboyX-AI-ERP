/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UniversalGateway } from '../../gateway';
import { CanonicalSchemaDefinition, CanonicalFieldDefinition } from '../../canonical';
import { BlockInstance } from '../types';

export const CANONICAL_SCHEMA_STORAGE_KEY = 'cloudboyx_design_canonical_schema';
export const CANONICAL_SCHEMA_LAST_SYNC_KEY = 'cloudboyx_design_canonical_last_sync';

export interface CanonicalSyncResult {
  success: boolean;
  schema: CanonicalSchemaDefinition;
  syncedAt: string;
  fieldsCount: number;
  message: string;
}

export interface CanonicalDataToken {
  token: string;
  label: string;
  field: string;
  type: string;
  example: string;
  description: string;
}

/**
 * Retrieve the currently stored Canonical Schema in the Design Studio.
 * Fallback to the latest Universal Gateway definition if not yet cached.
 */
export function getStoredCanonicalSchema(): CanonicalSchemaDefinition {
  try {
    const raw = localStorage.getItem(CANONICAL_SCHEMA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.fields && parsed.version) {
        return parsed;
      }
    }
  } catch {
    // ignore json parse errors
  }
  return UniversalGateway.getCanonicalSchemaDefinition();
}

/**
 * Automated Sync function that pulls the latest canonical schema definition from the Gateway
 * and updates the Design Studio's internal schema types and storage to match.
 */
export async function syncCanonicalSchemaWithGateway(): Promise<CanonicalSyncResult> {
  // Simulate network/pipeline handshake delay for realistic UI micro-feedback
  await new Promise((resolve) => setTimeout(resolve, 350));

  const latestGatewaySchema = UniversalGateway.getCanonicalSchemaDefinition();
  const timestamp = new Date().toISOString();

  // Update storage
  try {
    localStorage.setItem(CANONICAL_SCHEMA_STORAGE_KEY, JSON.stringify(latestGatewaySchema));
    localStorage.setItem(CANONICAL_SCHEMA_LAST_SYNC_KEY, timestamp);
  } catch {
    // ignore storage quota issues
  }

  // Count total fields including subfields
  let totalCount = Object.keys(latestGatewaySchema.fields).length;
  if (latestGatewaySchema.fields.items?.subFields) {
    totalCount += Object.keys(latestGatewaySchema.fields.items.subFields).length;
  }

  return {
    success: true,
    schema: latestGatewaySchema,
    syncedAt: timestamp,
    fieldsCount: totalCount,
    message: `Synchronized ${totalCount} canonical fields from Gateway (v${latestGatewaySchema.version})`,
  };
}

/**
 * Get the timestamp of the last successful schema synchronization.
 */
export function getLastCanonicalSyncTime(): string | null {
  try {
    return localStorage.getItem(CANONICAL_SCHEMA_LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

/**
 * Return a list of available data binding tokens that can be inserted into block parameters.
 */
export function getAvailableCanonicalDataTokens(
  schema: CanonicalSchemaDefinition = getStoredCanonicalSchema()
): CanonicalDataToken[] {
  const tokens: CanonicalDataToken[] = [];

  for (const [key, fieldDef] of Object.entries(schema.fields)) {
    if (key === 'items' && fieldDef.subFields) {
      // Add parent items token
      tokens.push({
        token: `{{order.items.length}}`,
        label: `Order Items Count`,
        field: `items.length`,
        type: `number`,
        example: `2`,
        description: `Total count of items in the order`,
      });
      // Add line item property tokens
      for (const [subKey, subDef] of Object.entries(fieldDef.subFields)) {
        tokens.push({
          token: `{{order.item.${subKey}}}`,
          label: `Item ${subKey.charAt(0).toUpperCase() + subKey.slice(1)}`,
          field: `items[].${subKey}`,
          type: subDef.type,
          example: String(subDef.example),
          description: subDef.description,
        });
      }
    } else {
      tokens.push({
        token: `{{order.${key}}}`,
        label: fieldDef.field.charAt(0).toUpperCase() + fieldDef.field.slice(1),
        field: key,
        type: fieldDef.type,
        example: String(fieldDef.example),
        description: fieldDef.description,
      });

      // Provide formatted currency tokens for cents fields
      if (key === 'totalAmount' || key === 'taxAmount') {
        const formattedKey = key === 'totalAmount' ? 'totalAmountFormatted' : 'taxAmountFormatted';
        const formattedExample = key === 'totalAmount' ? '$174.80' : '$14.90';
        tokens.push({
          token: `{{order.${formattedKey}}}`,
          label: `${fieldDef.field} (Formatted Currency)`,
          field: formattedKey,
          type: 'string',
          example: formattedExample,
          description: `Formatted dollar currency string of ${fieldDef.description}`,
        });
      }
    }
  }

  return tokens;
}

/**
 * Bind a block's content parameter to a Canonical Schema attribute.
 */
export function bindBlockParameterToCanonical(
  block: BlockInstance,
  blockContentKey: string,
  canonicalToken: string
): BlockInstance {
  const updatedContent = {
    ...block.content,
    [blockContentKey]: canonicalToken,
  };

  // Also record schema bindings metadata on the block
  const updatedMetadata = {
    ...(block.content._schemaBindings || {}),
    [blockContentKey]: canonicalToken,
  };
  updatedContent._schemaBindings = updatedMetadata;

  return {
    ...block,
    content: updatedContent,
  };
}
