import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { VehiclePosition, VehicleStopStatus } from '@/types/subway';

interface LeafletMapProps {
    vehicles?: VehiclePosition[];
    selectedLines: string[];
}

// Create icon only on client side
const icon = new Icon({
    iconUrl: '/images/subway-marker.png',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});

const LeafletMap: React.FC<LeafletMapProps> = ({ vehicles, selectedLines }) => {
    return (
        <div className="h-screen w-full">
            <MapContainer
                center={[40.7734168, -73.9699871]} // MTA map default center
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // We'll add custom controls
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>'
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