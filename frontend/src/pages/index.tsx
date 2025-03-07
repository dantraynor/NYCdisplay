import React from 'react';
import { Layout } from '../components/Layout';
import { SubwayMap } from '../components/SubwayMap';
import { TripList } from '../components/TripList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // Consider data stale after 1 minute
            retry: 3,
            retryDelay: 1000,
        },
    },
});

export default function Home() {
    return (
        <QueryClientProvider client={queryClient}>
            <Layout>
                <div className="space-y-8">
                    {/* Map Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Live Train Locations
                        </h2>
                        <SubwayMap />
                    </section>

                    {/* Trip List Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Active Trips
                        </h2>
                        <TripList />
                    </section>
                </div>
            </Layout>
        </QueryClientProvider>
    );
} 