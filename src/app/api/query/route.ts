import { NextRequest, NextResponse } from 'next/server';
import { getArkivPublicClient } from '@/lib/arkiv';
import { eq } from '@arkiv-network/sdk/query';
import type { ParsedEvent } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, asset, user, minAmount, maxAmount, limit } = body;

    const client = getArkivPublicClient();

    // Build query based on filters
    let query = client.buildQuery();

    // Priority: specific filters over general protocol filter
    if (eventType && eventType !== 'all') {
      query = query.where(eq('eventType', eventType));
    } else if (asset) {
      query = query.where(eq('reserve', asset));
    } else if (user) {
      query = query.where(eq('user', user));
    } else {
      query = query.where(eq('protocol', 'aave-v3'));
    }

    const result = await query
      .withAttributes(true)
      .withPayload(true)
      .fetch();

    // Parse and filter results
    let events: ParsedEvent[] = result.entities.map(entity => {
      const payload = JSON.parse(new TextDecoder().decode(entity.payload));
      return {
        ...payload,
        entityKey: entity.key,
      };
    });

    // Client-side filtering
    if (asset && eventType && eventType !== 'all') {
      events = events.filter(e => e.reserve === asset);
    }

    if (user && (eventType && eventType !== 'all' || asset)) {
      events = events.filter(e => e.user === user);
    }

    if (minAmount) {
      const min = parseFloat(minAmount);
      events = events.filter(e => parseFloat(e.amount) >= min);
    }

    if (maxAmount) {
      const max = parseFloat(maxAmount);
      events = events.filter(e => parseFloat(e.amount) <= max);
    }

    // Sort by timestamp descending
    events.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply limit
    const resultLimit = limit || 100;
    events = events.slice(0, resultLimit);

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
      query: {
        eventType,
        asset,
        user,
        minAmount,
        maxAmount,
        limit: resultLimit,
      },
    });
  } catch (error) {
    console.error('Query API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute query' },
      { status: 500 }
    );
  }
}
