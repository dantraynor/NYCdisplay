import React from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { SubwayAPI } from '../lib/api';
import { VehicleStopStatus } from '../types/subway';
import type { Icon } from 'leaflet';

// Create a dynamic Map component that includes all Leaflet components
const Map = dynamic(
    () => import('./map/LeafletMap'),
    { 
        ssr: false,
        loading: () => (
            <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }
);

export const SubwayMap: React.FC = () => {
    const { data: vehicles } = useQuery({
        queryKey: ['vehicles'],
        queryFn: SubwayAPI.getVehiclePositions,
        refetchInterval: 10000 // Refresh every 10 seconds
    });

    return <Map vehicles={vehicles} />;
}; 