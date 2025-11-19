import { getArkivPublicClient } from './arkiv';
import { eq } from '@arkiv-network/sdk/query';
import type { AaveEvent, ParsedEvent, EventFilters, EventStats } from './types';

// Parse entity payload
export function parseEventPayload(payload: Uint8Array): AaveEvent {
  const text = new TextDecoder().decode(payload);
  return JSON.parse(text);
}

// Parse entity to event
export function parseEntity(entity: any): ParsedEvent {
  const event = parseEventPayload(entity.payload);
  return {
    ...event,
    entityKey: entity.key,
  };
}

// Query all blockchain events
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

// Query events by type
export async function queryEventsByType(
  eventType: string,
  limit = 50
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

// Query events by asset
export async function queryEventsByAsset(
  asset: string,
  limit = 50
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

// Query events by user
export async function queryEventsByUser(
  userAddress: string,
  limit = 50
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

// Query events with filters
export async function queryEventsWithFilters(
  filters: EventFilters
): Promise<ParsedEvent[]> {
  const client = getArkivPublicClient();

  let query = client.buildQuery();

  // Apply filters
  if (filters.eventType) {
    query = query.where(eq('eventType', filters.eventType));
  } else if (filters.asset) {
    query = query.where(eq('reserve', filters.asset));
  } else if (filters.user) {
    query = query.where(eq('user', filters.user));
  } else {
    // Default: get all Aave events
    query = query.where(eq('protocol', 'aave-v3'));
  }

  const result = await query
    .withAttributes(true)
    .withPayload(true)
    .fetch();

  let events = result.entities.map(parseEntity);

  // Client-side filtering for date ranges (Arkiv doesn't support complex queries yet)
  if (filters.startDate) {
    const startTime = new Date(filters.startDate).getTime();
    events = events.filter(e => new Date(e.timestamp).getTime() >= startTime);
  }

  if (filters.endDate) {
    const endTime = new Date(filters.endDate).getTime();
    events = events.filter(e => new Date(e.timestamp).getTime() <= endTime);
  }

  // Sort by timestamp descending
  events.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply limit
  const limit = filters.limit || 100;
  return events.slice(0, limit);
}

// Calculate statistics
export async function calculateEventStats(): Promise<EventStats> {
  const events = await queryAllEvents(1000); // Get more events for stats

  const stats: EventStats = {
    totalEvents: events.length,
    eventsByType: {
      Supply: 0,
      Borrow: 0,
      Withdraw: 0,
      Repay: 0,
      LiquidationCall: 0,
    },
    totalVolume: {},
    uniqueUsers: new Set(events.map(e => e.user)).size,
    recentEvents: events.slice(0, 10),
  };

  events.forEach(event => {
    // Count by type
    stats.eventsByType[event.eventType]++;

    // Sum volume by asset
    const amount = parseFloat(event.amount);
    if (!isNaN(amount)) {
      if (!stats.totalVolume[event.reserve]) {
        stats.totalVolume[event.reserve] = 0;
      }
      stats.totalVolume[event.reserve] += amount;
    }
  });

  return stats;
}
