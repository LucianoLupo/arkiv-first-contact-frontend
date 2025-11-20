import StatsCards from '@/components/StatsCards';
import EventsTable from '@/components/EventsTable';
import { queryAllEvents } from '@/lib/queries';
import type { ParsedEvent } from '@/lib/types';

export default async function HomePage() {
  // Fetch data on the server
  let events: ParsedEvent[] = [];
  try {
    events = await queryAllEvents(100);
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Arkiv Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time analytics for Aave protocol events on Arkiv Network
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Querying Arkiv Directly
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {events.length} events loaded from Arkiv Mendoza
          </span>
        </div>
      </div>

      <div className="mb-8">
        <StatsCards events={events} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Events</h2>
        <EventsTable initialEvents={events} />
      </div>
    </div>
  );
}

// Revalidate every 30 seconds
export const revalidate = 30;
