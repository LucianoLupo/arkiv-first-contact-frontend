'use client';

import { useEffect, useState } from 'react';
import VolumeChart from '@/components/VolumeChart';
import EventDistributionChart from '@/components/EventDistributionChart';
import StatsCards from '@/components/StatsCards';
import { queryAllEvents } from '@/lib/queries';
import type { ParsedEvent } from '@/lib/types';

export default function AnalyticsPage() {
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch Aave V3 events
        const eventsData = await queryAllEvents(100);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Aave V3 Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time Aave V3 events stored on Arkiv DB-chain, powered by live blockchain listeners
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Data
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Protocol: <strong>Aave V3</strong>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Events: <strong>{events.length}</strong>
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <span>⚠️</span>
            No Events Found
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            No Aave V3 events have been detected yet. This could mean:
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
            <li>The backend event listener is not running</li>
            <li>No transactions have occurred on the monitored Aave V3 contract</li>
            <li>Entities have expired (TTL reached) on Arkiv DB-chain</li>
          </ul>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
            Make sure the backend is running: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm run start</code>
          </p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <>
          {/* Key Metrics */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>
            <StatsCards events={events} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <VolumeChart events={events} />
            <EventDistributionChart events={events} />
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              About This Dashboard
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              This dashboard displays real Aave V3 events captured from blockchain transactions and stored on Arkiv&apos;s DB-chain.
              The backend uses ethers.js to listen to contract events and stores them as queryable entities.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold">Data Source:</span> Arkiv Mendoza Testnet
              </div>
              <div>
                <span className="font-semibold">Protocol:</span> Aave V3
              </div>
              <div>
                <span className="font-semibold">Event Types:</span> 4
              </div>
              <div>
                <span className="font-semibold">Total Events:</span> {events.length}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Event Types:</strong> Supply, Withdraw, FlashLoan, LiquidationCall
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
