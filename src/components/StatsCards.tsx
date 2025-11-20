'use client';

import type { ParsedEvent } from '@/lib/types';

interface StatsCardsProps {
  events: ParsedEvent[];
}

export default function StatsCards({ events }: StatsCardsProps) {
  // Calculate statistics from events
  const totalEvents = events.length;

  // Count unique users (handle user, initiator, liquidator fields)
  const uniqueUsers = new Set(
    events.flatMap(e => {
      const data = e as any;
      return [data.user, data.initiator, data.liquidator].filter(Boolean);
    })
  ).size;

  // Count by event type
  const eventTypeCounts = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total volume (sum all amounts in Wei)
  let totalVolume = BigInt(0);
  events.forEach(event => {
    const data = event as any;
    try {
      if (data.amount) {
        totalVolume += BigInt(data.amount);
      } else if (data.debtToCover) {
        totalVolume += BigInt(data.debtToCover);
      }
    } catch {
      // Skip invalid BigInt values
    }
  });

  // Format BigInt for display (convert to ETH equivalent for readability)
  const volumeInEth = Number(totalVolume) / 1e18;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Events"
        value={totalEvents}
        color="blue"
      />
      <StatCard
        title="Unique Users"
        value={uniqueUsers}
        color="green"
      />
      <StatCard
        title="Supply Events"
        value={eventTypeCounts.Supply || 0}
        color="purple"
      />
      <StatCard
        title="Flash Loans"
        value={eventTypeCounts.FlashLoan || 0}
        color="orange"
      />
      <StatCard
        title="Withdraw Events"
        value={eventTypeCounts.Withdraw || 0}
        color="indigo"
      />
      <StatCard
        title="Liquidations"
        value={eventTypeCounts.LiquidationCall || 0}
        color="red"
      />
      <StatCard
        title="Total Volume"
        value={volumeInEth.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        subtitle="ETH equivalent"
        color="teal"
      />
      <StatCard
        title="Avg Events/Type"
        value={(totalEvents / Object.keys(eventTypeCounts).length || 0).toFixed(1)}
        color="cyan"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

function StatCard({ title, value, subtitle, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    red: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    teal: 'border-teal-500 bg-teal-50 dark:bg-teal-900/20',
    cyan: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  };

  return (
    <div className={`rounded-lg shadow p-6 border-l-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div className="w-full">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
