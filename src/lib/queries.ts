import { getArkivPublicClient } from './arkiv';
import { eq } from '@arkiv-network/sdk/query';
import type {
  EntityData,
  ParsedEntity,
  ParsedEvent,
  EventFilters,
  EventStats,
  ArkivEntity,
} from './types';

// ============================================================================
// PAYLOAD PARSING
// ============================================================================

// Parse entity payload from Uint8Array to JSON
export function parseEntityPayload<T extends EntityData = EntityData>(payload: Uint8Array): T {
  const text = new TextDecoder().decode(payload);
  return JSON.parse(text);
}

// Parse Arkiv entity to typed entity with key
export function parseEntity<T extends EntityData = EntityData>(entity: ArkivEntity): ParsedEntity<T> {
  if (!entity.payload) {
    throw new Error(`Entity ${entity.key} has no payload`);
  }
  const data = parseEntityPayload<T>(entity.payload);
  return {
    ...data,
    entityKey: entity.key,
  };
}

// ============================================================================
// AAVE V3 EVENT QUERIES
// ============================================================================

/**
 * Query all Aave V3 events
 */
export async function queryAllEvents(limit = 100): Promise<ParsedEvent[]> {
  const client = getArkivPublicClient();

  const result = await client
    .buildQuery()
    .where(eq('protocol', 'aave-v3'))
    .withAttributes(true)
    .withPayload(true)
    .fetch();

  return result.entities.slice(0, limit).map(parseEntity);
}

/**
 * Query events by specific event type
 */
export async function queryEventsByType(
  eventType: string,
  limit = 100
): Promise<ParsedEvent[]> {
  const client = getArkivPublicClient();

  const result = await client
    .buildQuery()
    .where(eq('eventType', eventType))
    .withAttributes(true)
    .withPayload(true)
    .fetch();

  return result.entities.slice(0, limit).map(parseEntity);
}

/**
 * Query events by asset
 * Note: Only works for 'reserve' attribute (Withdraw, Supply)
 * For FlashLoan use queryEventsByType('FlashLoan') and filter client-side
 * For LiquidationCall use queryEventsByType('LiquidationCall') and filter client-side
 */
export async function queryEventsByAsset(
  asset: string,
  limit = 100
): Promise<ParsedEvent[]> {
  const client = getArkivPublicClient();

  const result = await client
    .buildQuery()
    .where(eq('reserve', asset))
    .withAttributes(true)
    .withPayload(true)
    .fetch();

  return result.entities.slice(0, limit).map(parseEntity);
}

/**
 * Query events by user address
 */
export async function queryEventsByUser(
  userAddress: string,
  limit = 100
): Promise<ParsedEvent[]> {
  const client = getArkivPublicClient();

  const result = await client
    .buildQuery()
    .where(eq('user', userAddress))
    .withAttributes(true)
    .withPayload(true)
    .fetch();

  return result.entities.slice(0, limit).map(parseEntity);
}

/**
 * Query events by transaction hash
 */
export async function queryEventsByTxHash(
  txHash: string
): Promise<ParsedEvent[]> {
  const client = getArkivPublicClient();

  const result = await client
    .buildQuery()
    .where(eq('txHash', txHash))
    .withAttributes(true)
    .withPayload(true)
    .fetch();

  return result.entities.map(parseEntity);
}

/**
 * Query events with complex filters
 *
 * IMPORTANT: Arkiv only supports ONE .where() clause per query.
 * We use priority-based filtering:
 * 1. eventType (most specific)
 * 2. user (if no eventType)
 * 3. asset via reserve (if no eventType or user)
 * 4. txHash (if specified)
 * 5. protocol='aave-v3' (default)
 *
 * All other filters are applied client-side.
 */
export async function queryEventsWithFilters(
  filters: EventFilters
): Promise<ParsedEvent[]> {
  const client = getArkivPublicClient();

  let query = client.buildQuery();

  // Priority-based query selection (only ONE where clause allowed)
  if (filters.txHash) {
    // TxHash is most specific
    query = query.where(eq('txHash', filters.txHash));
  } else if (filters.eventType && filters.eventType !== 'all') {
    // EventType is very selective
    query = query.where(eq('eventType', filters.eventType));
  } else if (filters.user) {
    // User address filter
    query = query.where(eq('user', filters.user));
  } else if (filters.asset) {
    // Asset filter (only works for reserve attribute)
    query = query.where(eq('reserve', filters.asset));
  } else {
    // Default: get all Aave V3 events
    query = query.where(eq('protocol', 'aave-v3'));
  }

  const result = await query
    .withAttributes(true)
    .withPayload(true)
    .fetch();

  let events = result.entities.map(parseEntity);

  // ========================================================================
  // CLIENT-SIDE FILTERING
  // ========================================================================

  // Filter by event type (if not used in main query)
  if (filters.eventType && filters.eventType !== 'all' && !filters.txHash && filters.eventType !== filters.eventType) {
    events = events.filter(e => e.eventType === filters.eventType);
  }

  // Filter by asset (check multiple fields)
  if (filters.asset && !filters.txHash) {
    events = events.filter(e => {
      const data = e as any;
      return (
        data.reserve === filters.asset ||          // Withdraw, Supply
        data.asset === filters.asset ||            // FlashLoan
        data.collateralAsset === filters.asset ||  // LiquidationCall
        data.debtAsset === filters.asset           // LiquidationCall
      );
    });
  }

  // Filter by user (check multiple fields)
  if (filters.user && filters.eventType && filters.eventType !== 'all') {
    events = events.filter(e => {
      const data = e as any;
      return (
        data.user === filters.user ||         // Withdraw, Supply, LiquidationCall
        data.initiator === filters.user ||    // FlashLoan
        data.liquidator === filters.user      // LiquidationCall
      );
    });
  }

  // Filter by amount range (convert BigInt strings to numbers for comparison)
  if (filters.minAmount) {
    const min = BigInt(filters.minAmount);
    events = events.filter(e => {
      const data = e as any;
      const amount = data.amount || data.debtToCover || '0';
      try {
        return BigInt(amount) >= min;
      } catch {
        return false;
      }
    });
  }

  if (filters.maxAmount) {
    const max = BigInt(filters.maxAmount);
    events = events.filter(e => {
      const data = e as any;
      const amount = data.amount || data.debtToCover || '0';
      try {
        return BigInt(amount) <= max;
      } catch {
        return false;
      }
    });
  }

  // Apply limit
  const limit = filters.limit || 100;
  return events.slice(0, limit);
}

// ============================================================================
// STATISTICS CALCULATION
// ============================================================================

/**
 * Calculate aggregate statistics from events
 */
export async function calculateEventStats(): Promise<EventStats> {
  const events = await queryAllEvents(1000);

  const stats: EventStats = {
    totalEvents: events.length,
    eventsByType: {},
    totalVolume: {},
    uniqueUsers: 0,
    recentEvents: events.slice(0, 10),
  };

  const uniqueUserSet = new Set<string>();

  events.forEach(event => {
    // Count by event type
    stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;

    // Track unique users
    const data = event as any;
    if (data.user) uniqueUserSet.add(data.user);
    if (data.initiator) uniqueUserSet.add(data.initiator);
    if (data.liquidator) uniqueUserSet.add(data.liquidator);

    // Sum volume by asset (track BigInt amounts)
    try {
      // For Withdraw/Supply events
      if (data.reserve && data.amount) {
        const currentVolume = stats.totalVolume[data.reserve] || BigInt(0);
        stats.totalVolume[data.reserve] = currentVolume + BigInt(data.amount);
      }

      // For FlashLoan events
      if (data.asset && data.amount) {
        const currentVolume = stats.totalVolume[data.asset] || BigInt(0);
        stats.totalVolume[data.asset] = currentVolume + BigInt(data.amount);
      }

      // For LiquidationCall events (track both collateral and debt)
      if (data.collateralAsset && data.liquidatedCollateralAmount) {
        const currentVolume = stats.totalVolume[data.collateralAsset] || BigInt(0);
        stats.totalVolume[data.collateralAsset] = currentVolume + BigInt(data.liquidatedCollateralAmount);
      }

      if (data.debtAsset && data.debtToCover) {
        const currentVolume = stats.totalVolume[data.debtAsset] || BigInt(0);
        stats.totalVolume[data.debtAsset] = currentVolume + BigInt(data.debtToCover);
      }
    } catch (error) {
      // Skip events with invalid BigInt values
      console.warn('Failed to parse amount for event:', event.entityKey, error);
    }
  });

  stats.uniqueUsers = uniqueUserSet.size;

  return stats;
}
