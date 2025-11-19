import VolumeChart from '@/components/VolumeChart';
import EventDistributionChart from '@/components/EventDistributionChart';
import StatsCards from '@/components/StatsCards';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Aave Protocol Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Dune-style analytics dashboard powered by Arkiv DB-chain
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>
        <StatsCards />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <VolumeChart />
        <EventDistributionChart />
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span>💡</span>
          About This Dashboard
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          This is a Dune Analytics-style dashboard that queries blockchain events directly from
          Arkiv&apos;s DB-chain. All data is queryable, verifiable, and stored on-chain.
        </p>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="font-semibold">Data Source:</span> Arkiv DB-chain
          </div>
          <div>
            <span className="font-semibold">Protocol:</span> Aave V3
          </div>
          <div>
            <span className="font-semibold">Chain:</span> Ethereum
          </div>
        </div>
      </div>
    </div>
  );
}

// Revalidate every 30 seconds
export const revalidate = 30;
