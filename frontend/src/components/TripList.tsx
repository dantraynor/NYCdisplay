import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SubwayAPI } from '../lib/api';
import { format } from 'date-fns';
import { TripScheduleRelationship } from '../types/subway';

export const TripList: React.FC = () => {
    const { data: trips, isLoading } = useQuery({
        queryKey: ['active-trips'],
        queryFn: SubwayAPI.getActiveTrips,
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Active Trips
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Real-time subway trip information
                </p>
            </div>
            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {trips?.map(trip => (
                        <li key={trip.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`
                                        w-10 h-10 flex items-center justify-center rounded-full
                                        ${getRouteColor(trip.route_id)}
                                    `}>
                                        <span className="text-white font-bold">
                                            {trip.route_id}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            Trip {trip.trip_id}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {TripScheduleRelationship[trip.schedule_relationship]}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-sm text-gray-900">
                                        Started: {format(new Date(`${trip.start_date}T${trip.start_time}`), 'h:mm a')}
                                    </div>
                                    {trip.stop_time_updates[0] && (
                                        <div className="text-sm text-gray-500">
                                            Next: {trip.stop_time_updates[0].stop_id} at{' '}
                                            {format(new Date(trip.stop_time_updates[0].arrival_time!), 'h:mm a')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

function getRouteColor(routeId: string): string {
    const colors: { [key: string]: string } = {
        '1': 'bg-red-600',
        '2': 'bg-red-600',
        '3': 'bg-red-600',
        '4': 'bg-green-600',
        '5': 'bg-green-600',
        '6': 'bg-green-600',
        '7': 'bg-purple-600',
        'A': 'bg-blue-600',
        'C': 'bg-blue-600',
        'E': 'bg-blue-600',
        'B': 'bg-orange-600',
        'D': 'bg-orange-600',
        'F': 'bg-orange-600',
        'M': 'bg-orange-600',
        'N': 'bg-yellow-500',
        'Q': 'bg-yellow-500',
        'R': 'bg-yellow-500',
        'W': 'bg-yellow-500',
        'L': 'bg-gray-600',
        'G': 'bg-lime-600',
        'J': 'bg-brown-600',
        'Z': 'bg-brown-600',
    };

    return colors[routeId] || 'bg-gray-400';
} 