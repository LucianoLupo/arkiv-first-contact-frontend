'use client';

import { useState } from 'react';
import type { EventType } from '@/lib/types';

export interface QueryConfig {
  eventType?: EventType | 'all';
  asset?: string;
  user?: string;
  minAmount?: string;
  maxAmount?: string;
  limit?: number;
  chartType?: 'table' | 'bar' | 'pie' | 'line';
}

interface QueryBuilderProps {
  onExecute: (config: QueryConfig) => void;
  loading?: boolean;
}

export default function QueryBuilder({ onExecute, loading = false }: QueryBuilderProps) {
  const [config, setConfig] = useState<QueryConfig>({
    eventType: 'all',
    asset: '',
    user: '',
    minAmount: '',
    maxAmount: '',
    limit: 100,
    chartType: 'table',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute(config);
  };

  const handleReset = () => {
    setConfig({
      eventType: 'all',
      asset: '',
      user: '',
      minAmount: '',
      maxAmount: '',
      limit: 100,
      chartType: 'table',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Query Builder</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Query real Aave V3 events stored on Arkiv DB-chain
      </p>
      <p className="text-xs text-blue-600 dark:text-blue-400 mb-6">
        Protocol: <strong>Aave V3</strong> • Listening to live blockchain events
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Type Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Event Type</label>
          <select
            value={config.eventType}
            onChange={(e) => setConfig({ ...config, eventType: e.target.value as any })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 px-4 py-2"
          >
            <option value="all">All Event Types</option>
            <option value="Supply">Supply</option>
            <option value="Withdraw">Withdraw</option>
            <option value="FlashLoan">FlashLoan</option>
            <option value="LiquidationCall">LiquidationCall</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {config.eventType === 'Supply' && 'Events when users supply assets to Aave'}
            {config.eventType === 'Withdraw' && 'Events when users withdraw assets from Aave'}
            {config.eventType === 'FlashLoan' && 'Flash loan events with no collateral required'}
            {config.eventType === 'LiquidationCall' && 'Liquidation events for undercollateralized positions'}
            {config.eventType === 'all' && 'Query all Aave V3 event types'}
          </p>
        </div>

        {/* Asset Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Asset Address (optional)</label>
          <input
            type="text"
            value={config.asset}
            onChange={(e) => setConfig({ ...config, asset: e.target.value })}
            placeholder="0x... (reserve, asset, collateralAsset, or debtAsset)"
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 px-4 py-2"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Filter by asset contract address. Matches reserve, asset, collateralAsset, or debtAsset fields.
          </p>
        </div>

        {/* User Address Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">User Address (optional)</label>
          <input
            type="text"
            value={config.user}
            onChange={(e) => setConfig({ ...config, user: e.target.value })}
            placeholder="0x..."
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 px-4 py-2"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Filter by user wallet address. Matches user, initiator, or liquidator fields.
          </p>
        </div>

        {/* Amount Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Amount (Wei)</label>
            <input
              type="text"
              value={config.minAmount}
              onChange={(e) => setConfig({ ...config, minAmount: e.target.value })}
              placeholder="0"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Amount (Wei)</label>
            <input
              type="text"
              value={config.maxAmount}
              onChange={(e) => setConfig({ ...config, maxAmount: e.target.value })}
              placeholder="Unlimited"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 px-4 py-2"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4">
          Amounts are stored as BigInt strings (in Wei). Example: 1000000 = 1 USDC (6 decimals)
        </p>

        {/* Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">Result Limit</label>
          <select
            value={config.limit}
            onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 px-4 py-2"
          >
            <option value="10">10 results</option>
            <option value="25">25 results</option>
            <option value="50">50 results</option>
            <option value="100">100 results</option>
            <option value="500">500 results</option>
          </select>
        </div>

        {/* Visualization Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Visualization</label>
          <div className="grid grid-cols-4 gap-2">
            {(['table', 'bar', 'pie', 'line'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setConfig({ ...config, chartType: type })}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  config.chartType === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Executing...
              </span>
            ) : (
              '🔍 Execute Query'
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Query Preview */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Query Preview (Arkiv attributes):</h3>
        <code className="text-xs text-gray-700 dark:text-gray-300 block">
          {generateQueryPreview(config)}
        </code>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ⚠️ Arkiv only supports ONE .where() clause. Additional filters applied client-side.
        </p>
      </div>

      {/* Example Queries */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">💡 Example Queries:</h3>
        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
          <li>• <strong>All Supply events:</strong> eventType = "Supply"</li>
          <li>• <strong>Flash loans only:</strong> eventType = "FlashLoan"</li>
          <li>• <strong>User activity:</strong> user = "0x123..."</li>
          <li>• <strong>Large transactions:</strong> minAmount = "1000000000000000000" (1 ETH in Wei)</li>
          <li>• <strong>Liquidations:</strong> eventType = "LiquidationCall"</li>
        </ul>
      </div>
    </div>
  );
}

function generateQueryPreview(config: QueryConfig): string {
  const conditions = [];

  // Protocol (always aave-v3)
  conditions.push('protocol = "aave-v3"');

  // Event type
  if (config.eventType && config.eventType !== 'all') {
    conditions.push(`eventType = "${config.eventType}"`);
  }

  // Asset
  if (config.asset) {
    conditions.push(`asset MATCHES "${config.asset}" (reserve/asset/collateralAsset/debtAsset)`);
  }

  // User
  if (config.user) {
    conditions.push(`user MATCHES "${config.user}" (user/initiator/liquidator)`);
  }

  // Amount range
  if (config.minAmount) {
    conditions.push(`amount >= ${config.minAmount} Wei`);
  }
  if (config.maxAmount) {
    conditions.push(`amount <= ${config.maxAmount} Wei`);
  }

  const primaryFilter = config.eventType && config.eventType !== 'all'
    ? `eventType = "${config.eventType}"`
    : 'protocol = "aave-v3"';

  return `Main query: WHERE ${primaryFilter} | Client-side filters: ${conditions.slice(1).join(', ') || 'none'} | LIMIT ${config.limit}`;
}
