'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ParsedEvent } from '@/lib/types';

interface VolumeData {
  asset: string;
  volume: string;
}

interface VolumeChartProps {
  events: ParsedEvent[];
}

export default function VolumeChart({ events }: VolumeChartProps) {
  // Calculate volume by asset from events
  const volumeByAsset: Record<string, bigint> = {};

  events.forEach(event => {
    const data = event as any;

    try {
      // For Withdraw/Supply events (reserve field)
      if (data.reserve && data.amount) {
        const current = volumeByAsset[data.reserve] || BigInt(0);
        volumeByAsset[data.reserve] = current + BigInt(data.amount);
      }

      // For FlashLoan events (asset field)
      if (data.asset && data.amount && !data.reserve) {
        const current = volumeByAsset[data.asset] || BigInt(0);
        volumeByAsset[data.asset] = current + BigInt(data.amount);
      }

      // For LiquidationCall events
      if (data.collateralAsset && data.liquidatedCollateralAmount) {
        const current = volumeByAsset[data.collateralAsset] || BigInt(0);
        volumeByAsset[data.collateralAsset] = current + BigInt(data.liquidatedCollateralAmount);
      }

      if (data.debtAsset && data.debtToCover) {
        const current = volumeByAsset[data.debtAsset] || BigInt(0);
        volumeByAsset[data.debtAsset] = current + BigInt(data.debtToCover);
      }
    } catch (error) {
      // Skip events with invalid BigInt values
    }
  });

  // Transform data for recharts (convert BigInt to numbers for display)
  const chartData: VolumeData[] = Object.entries(volumeByAsset)
    .map(([asset, volume]) => ({
      asset: asset.substring(0, 8) + '...' + asset.substring(asset.length - 6), // Shorten address
      fullAsset: asset,
      volume: (Number(volume) / 1e18).toFixed(2), // Convert to ETH equivalent
    }))
    .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
    .slice(0, 10); // Top 10 assets

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Volume by Asset</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No volume data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Volume by Asset</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Top 10 assets by total transaction volume (ETH equivalent)
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="asset"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Volume (ETH)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any) => [`${value} ETH`, 'Volume']}
            labelFormatter={(label: string, payload: any) => {
              if (payload && payload[0]) {
                return `Asset: ${payload[0].payload.fullAsset}`;
              }
              return label;
            }}
          />
          <Legend />
          <Bar dataKey="volume" fill="#3b82f6" name="Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
