import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { VehiclePosition, VehicleStopStatus } from '@/types/subway';

interface LeafletMapProps {
    vehicles?: VehiclePosition[];
}

// Create icon only on client side
const icon = new Icon({
    iconUrl: '/images/subway-marker.png',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});

const LeafletMap: React.FC<LeafletMapProps> = ({ vehicles }) => {
    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
            <MapContainer
                center={[40.7128, -74.0060]} // NYC coordinates
                zoom={12}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {vehicles?.map(vehicle => (
                    <Marker
                        key={vehicle.id}
                        position={[vehicle.latitude, vehicle.longitude]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg">
                                    Route {vehicle.trip?.route_id}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Status: {VehicleStopStatus[vehicle.current_status]}
                                </p>
                                {vehicle.current_stop_id && (
                                    <p className="text-sm text-gray-600">
                                        Stop: {vehicle.current_stop_id}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Last updated: {new Date(vehicle.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LeafletMap; 