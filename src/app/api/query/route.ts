import { NextRequest, NextResponse } from 'next/server';
import { queryEventsWithFilters } from '@/lib/queries';
import type { EventFilters } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, asset, user, minAmount, maxAmount, limit } = body;

    const filters: EventFilters = {
      eventType: eventType === 'all' ? undefined : eventType,
      asset,
      user,
      minAmount,
      maxAmount,
      limit: limit || 100,
    };

    const events = await queryEventsWithFilters(filters);

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
      query: filters,
    });
  } catch (error) {
    console.error('Query API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute query' },
      { status: 500 }
    );
  }
}
