import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { SubwayAPI } from '../lib/api';
import { VehicleStopStatus, AlertEffect } from '../types/subway';
import type { Icon } from 'leaflet';

// Create a dynamic Map component that includes all Leaflet components
const Map = dynamic(
    () => import('./map/LeafletMap'),
    { 
        ssr: false,
        loading: () => (
            <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }
);

const SUBWAY_LINES = [
    { id: '123', lines: ['1', '2', '3'], color: '#EE352E' },
    { id: '456', lines: ['4', '5', '6'], color: '#00933C' },
    { id: '7', lines: ['7'], color: '#B933AD' },
    { id: 'ACE', lines: ['A', 'C', 'E'], color: '#0039A6' },
    { id: 'BDFM', lines: ['B', 'D', 'F', 'M'], color: '#FF6319' },
    { id: 'NQRW', lines: ['N', 'Q', 'R', 'W'], color: '#FCCC0A' },
    { id: 'G', lines: ['G'], color: '#6CBE45' },
    { id: 'JZ', lines: ['J', 'Z'], color: '#996633' },
    { id: 'L', lines: ['L'], color: '#A7A9AC' },
    { id: 'S', lines: ['S'], color: '#808183' },
];

export const SubwayMap: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedLines, setSelectedLines] = useState<string[]>(['123']);

    const { data: vehicles } = useQuery({
        queryKey: ['vehicles', selectedLines],
        queryFn: () => SubwayAPI.getVehiclePositions(selectedLines.join(',')),
        refetchInterval: 10000 // Refresh every 10 seconds
    });

    const { data: alerts } = useQuery({
        queryKey: ['alerts', selectedLines],
        queryFn: () => SubwayAPI.getActiveAlerts(selectedLines.join(',')),
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    const toggleLine = (lineId: string) => {
        setSelectedLines(prev =>
            prev.includes(lineId)
                ? prev.filter(id => id !== lineId)
                : [...prev, lineId]
        );
    };

    return (
        <div className="map-container">
            {/* Sidebar */}
            <div className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                    {sidebarOpen ? '←' : '→'}
                </button>

                <div className="line-selector">
                    <h3 className="text-lg font-semibold mb-4">Subway Lines</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {SUBWAY_LINES.map(line => (
                            <button
                                key={line.id}
                                className={`line-button ${selectedLines.includes(line.id) ? 'active' : ''}`}
                                style={{ backgroundColor: line.color }}
                                onClick={() => toggleLine(line.id)}
                                title={line.lines.join(', ')}
                            >
                                {line.lines[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Alerts Panel */}
                {alerts && alerts.length > 0 && (
                    <div className="alerts-panel">
                        <h3 className="text-lg font-semibold mb-2">Service Alerts</h3>
                        <div className="space-y-2">
                            {alerts.map(alert => (
                                <div
                                    key={alert.id}
                                    className={`p-2 rounded ${alert.effect === AlertEffect.SIGNIFICANT_DELAYS
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-yellow-50 text-yellow-700'
                                    }`}
                                >
                                    <div className="font-medium">{alert.header_text}</div>
                                    {alert.description_text && (
                                        <div className="text-sm mt-1">{alert.description_text}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Map Controls */}
            <div className="map-controls">
                <div className="space-y-2">
                    <button className="bg-white hover:bg-gray-50 p-2 rounded shadow-sm w-full text-sm font-medium text-gray-700">
                        Reset View
                    </button>
                    <button className="bg-white hover:bg-gray-50 p-2 rounded shadow-sm w-full text-sm font-medium text-gray-700">
                        Find Nearest
                    </button>
                </div>
            </div>

            {/* Map */}
            <Map vehicles={vehicles} selectedLines={selectedLines} />
        </div>
    );
}; 