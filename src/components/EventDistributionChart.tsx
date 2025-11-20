'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ParsedEvent } from '@/lib/types';

interface EventDistribution {
  eventType: string;
  count: number;
  percentage: string;
}

const COLORS = {
  Supply: '#10b981',          // green
  Withdraw: '#f59e0b',        // yellow
  FlashLoan: '#f97316',       // orange
  LiquidationCall: '#ef4444', // red
};

interface EventDistributionChartProps {
  events: ParsedEvent[];
}

export default function EventDistributionChart({ events }: EventDistributionChartProps) {
  // Calculate event type distribution
  const eventTypeCounts = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEvents = events.length;

  const chartData = Object.entries(eventTypeCounts).map(([eventType, count]) => ({
    eventType,
    count,
    percentage: ((count / totalEvents) * 100).toFixed(1) + '%',
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Event Type Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No events to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Event Type Distribution</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Breakdown of events by type
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.eventType}: ${entry.percentage}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.eventType as keyof typeof COLORS] || '#6366f1'}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [`${value} events`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-400">
              <th className="pb-2">Event Type</th>
              <th className="pb-2 text-right">Count</th>
              <th className="pb-2 text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item) => (
              <tr key={item.eventType} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-2 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[item.eventType as keyof typeof COLORS] || '#6366f1' }}
                  ></span>
                  {item.eventType}
                </td>
                <td className="py-2 text-right font-semibold">{item.count}</td>
                <td className="py-2 text-right text-gray-600 dark:text-gray-400">{item.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
