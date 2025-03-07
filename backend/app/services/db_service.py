from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, List
from ..models.subway import (
    Trip, StopTimeUpdate, VehiclePosition, Alert, FeedUpdate,
    TripScheduleRelationship, StopTimeScheduleRelationship, VehicleStopStatus, AlertEffect
)

class DBService:
    """
    Service for handling database operations
    """
    
    def __init__(self, db: Session):
        self.db = db

    def store_feed_data(self, data: Dict) -> FeedUpdate:
        """
        Store a complete feed update
        """
        # Create feed update record
        feed_update = FeedUpdate(
            timestamp=datetime.fromtimestamp(data['header']['timestamp']),
            version=data['header']['version'],
            processed_count=len(data['entities']),
            trips_count=sum(1 for e in data['entities'] if 'trip' in e),
            vehicles_count=sum(1 for e in data['entities'] if 'vehicle' in e),
            alerts_count=sum(1 for e in data['entities'] if 'alert' in e)
        )
        self.db.add(feed_update)
        
        # Process each entity
        for entity in data['entities']:
            if 'trip' in entity:
                self._store_trip(entity['trip'], entity['id'])
            if 'vehicle' in entity:
                self._store_vehicle_position(entity['vehicle'], entity['id'])
            if 'alert' in entity:
                self._store_alert(entity['alert'], entity['id'])
        
        self.db.commit()
        return feed_update

    def _store_trip(self, trip_data: Dict, entity_id: str) -> Trip:
        """
        Store trip and its stop time updates
        """
        # Check if trip exists
        trip = self.db.query(Trip).filter(Trip.trip_id == trip_data['trip_id']).first()
        
        if not trip:
            trip = Trip(
                trip_id=trip_data['trip_id'],
                route_id=trip_data['route_id'],
                start_time=trip_data['start_time'],
                start_date=trip_data['start_date'],
                schedule_relationship=TripScheduleRelationship(trip_data.get('schedule_relationship', 0))
            )
            self.db.add(trip)
            self.db.flush()  # Get ID without committing
        
        # Update stop times
        if 'stop_time_updates' in trip_data:
            # Remove old updates
            self.db.query(StopTimeUpdate).filter(StopTimeUpdate.trip_id == trip.id).delete()
            
            # Add new updates
            for update in trip_data['stop_time_updates']:
                stop_update = StopTimeUpdate(
                    trip_id=trip.id,
                    stop_id=update['stop_id'],
                    arrival_time=datetime.fromtimestamp(update['arrival']['time']) if update.get('arrival') else None,
                    arrival_delay=update.get('arrival', {}).get('delay'),
                    departure_time=datetime.fromtimestamp(update['departure']['time']) if update.get('departure') else None,
                    departure_delay=update.get('departure', {}).get('delay'),
                    schedule_relationship=StopTimeScheduleRelationship(update.get('schedule_relationship', 0))
                )
                self.db.add(stop_update)
        
        return trip

    def _store_vehicle_position(self, vehicle_data: Dict, entity_id: str) -> VehiclePosition:
        """
        Store vehicle position
        """
        # Get associated trip
        trip = None
        if 'trip' in vehicle_data:
            trip = self.db.query(Trip).filter(Trip.trip_id == vehicle_data['trip']['trip_id']).first()
            if not trip:
                trip = self._store_trip(vehicle_data['trip'], entity_id)
        
        if not trip:
            return None
        
        # Update or create vehicle position
        vehicle = self.db.query(VehiclePosition).filter(VehiclePosition.trip_id == trip.id).first()
        
        if not vehicle:
            vehicle = VehiclePosition(trip_id=trip.id)
        
        # Update position data
        if 'position' in vehicle_data:
            vehicle.latitude = vehicle_data['position']['latitude']
            vehicle.longitude = vehicle_data['position']['longitude']
            vehicle.bearing = vehicle_data['position'].get('bearing')
            vehicle.speed = vehicle_data['position'].get('speed')
        
        vehicle.current_stop_sequence = vehicle_data.get('current_stop_sequence')
        vehicle.current_stop_id = vehicle_data.get('stop_id')
        vehicle.current_status = VehicleStopStatus(vehicle_data.get('current_status', 0))
        vehicle.timestamp = datetime.fromtimestamp(vehicle_data['timestamp']) if 'timestamp' in vehicle_data else datetime.utcnow()
        
        self.db.add(vehicle)
        return vehicle

    def _store_alert(self, alert_data: Dict, entity_id: str) -> Alert:
        """
        Store service alert
        """
        alert = Alert(
            effect=AlertEffect(alert_data['effect']),
            header_text=alert_data.get('header_text'),
            description_text=alert_data.get('description_text'),
            informed_entities=alert_data.get('informed_entity', [])
        )
        self.db.add(alert)
        return alert

    def get_active_trips(self) -> List[Trip]:
        """
        Get all active trips with their latest updates
        """
        return self.db.query(Trip)\
            .join(StopTimeUpdate)\
            .filter(StopTimeUpdate.arrival_time >= datetime.utcnow())\
            .distinct()\
            .all()

    def get_active_alerts(self) -> List[Alert]:
        """
        Get all active service alerts
        """
        return self.db.query(Alert)\
            .filter(Alert.active == True)\
            .order_by(Alert.created_at.desc())\
            .all()

    def get_vehicle_positions(self) -> List[VehiclePosition]:
        """
        Get all current vehicle positions
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)  # Last 5 minutes
        return self.db.query(VehiclePosition)\
            .filter(VehiclePosition.timestamp >= cutoff_time)\
            .all() 