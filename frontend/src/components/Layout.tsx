import React from 'react';
import { AlertEffect } from '../types/subway';
import { useQuery } from '@tanstack/react-query';
import { SubwayAPI } from '../lib/api';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { data: alerts } = useQuery({
        queryKey: ['alerts'],
        queryFn: SubwayAPI.getActiveAlerts,
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            NYC Subway Live
                        </h1>
                        <div className="text-white text-sm">
                            Live Transit Updates
                        </div>
                    </div>
                </div>
            </header>

            {/* Alerts Banner */}
            {alerts && alerts.length > 0 && (
                <div className="bg-yellow-50 border-b border-yellow-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex flex-col space-y-2">
                            {alerts.map(alert => (
                                <div 
                                    key={alert.id}
                                    className={`flex items-center ${
                                        alert.effect === AlertEffect.SIGNIFICANT_DELAYS
                                            ? 'text-red-700'
                                            : 'text-yellow-700'
                                    }`}
                                >
                                    <span className="font-medium">{alert.header_text}</span>
                                    {alert.description_text && (
                                        <span className="ml-2">- {alert.description_text}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="text-center text-sm">
                        Data provided by MTA. Updated in real-time.
                    </div>
                </div>
            </footer>
        </div>
    );
}; 