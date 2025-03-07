from google.transit import gtfs_realtime_pb2
import requests
from fastapi import HTTPException
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class MTAService:
    """
    Service for handling MTA GTFS-realtime feed interactions
    """
    
    # Public GTFS feed URL
    FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs"

    def __init__(self):
        """
        Initialize the MTA service
        """
        self.feed = gtfs_realtime_pb2.FeedMessage()

    async def get_feed_data(self, line_group: str = None) -> Dict:
        """
        Fetch real-time feed data
        """
        try:
            response = requests.get(
                self.FEED_URL,
                headers={'Accept': 'application/x-google-protobuf'}
            )
            response.raise_for_status()
            
            # Parse the protocol buffer
            self.feed.ParseFromString(response.content)
            
            return self._process_feed_data(self.feed)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching MTA data: {str(e)}")
            raise HTTPException(status_code=503, detail="Unable to fetch MTA data")
        except Exception as e:
            logger.error(f"Error processing MTA data: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing MTA data: {str(e)}")

    def _process_feed_data(self, feed: gtfs_realtime_pb2.FeedMessage) -> Dict:
        """
        Process the GTFS feed data into a more usable format
        """
        processed_data = {
            'header': {
                'timestamp': feed.header.timestamp,
                'version': feed.header.gtfs_realtime_version
            },
            'entities': []
        }

        for entity in feed.entity:
            processed_entity = {'id': entity.id}
            
            # Process trip updates
            if entity.HasField('trip_update'):
                trip_data = self._process_trip_update(entity.trip_update)
                if trip_data:
                    processed_entity['trip'] = trip_data
            
            # Process vehicle positions
            if entity.HasField('vehicle'):
                vehicle_data = self._process_vehicle(entity.vehicle)
                if vehicle_data:
                    processed_entity['vehicle'] = vehicle_data
            
            # Process alerts
            if entity.HasField('alert'):
                alert_data = self._process_alert(entity.alert)
                if alert_data:
                    processed_entity['alert'] = alert_data
            
            if len(processed_entity) > 1:  # Only add if we have more than just the ID
                processed_data['entities'].append(processed_entity)

        return processed_data

    def _process_trip_update(self, trip_update: gtfs_realtime_pb2.TripUpdate) -> Optional[Dict]:
        """
        Process trip update data
        """
        try:
            if not trip_update or not trip_update.trip:
                return None

            result = {
                'trip_id': trip_update.trip.trip_id,
                'route_id': trip_update.trip.route_id,
                'start_time': trip_update.trip.start_time,
                'start_date': trip_update.trip.start_date
            }

            # Add schedule relationship if present
            if trip_update.trip.HasField('schedule_relationship'):
                result['schedule_relationship'] = trip_update.trip.schedule_relationship

            # Process stop time updates
            if hasattr(trip_update, 'stop_time_update'):
                result['stop_time_updates'] = []
                for update in trip_update.stop_time_update:
                    stop_update = {'stop_id': update.stop_id}
                    
                    if update.HasField('arrival'):
                        stop_update['arrival'] = {
                            'time': update.arrival.time
                        }
                        if update.arrival.HasField('delay'):
                            stop_update['arrival']['delay'] = update.arrival.delay
                    
                    if update.HasField('departure'):
                        stop_update['departure'] = {
                            'time': update.departure.time
                        }
                        if update.departure.HasField('delay'):
                            stop_update['departure']['delay'] = update.departure.delay
                    
                    if update.HasField('schedule_relationship'):
                        stop_update['schedule_relationship'] = update.schedule_relationship
                    
                    result['stop_time_updates'].append(stop_update)

            return result
        except Exception as e:
            logger.error(f"Error processing trip update: {str(e)}")
            return None

    def _process_vehicle(self, vehicle: gtfs_realtime_pb2.VehiclePosition) -> Optional[Dict]:
        """
        Process vehicle position data
        """
        try:
            result = {}
            
            if vehicle.HasField('trip'):
                result['trip'] = {
                    'trip_id': vehicle.trip.trip_id,
                    'route_id': vehicle.trip.route_id,
                    'start_time': vehicle.trip.start_time,
                    'start_date': vehicle.trip.start_date
                }
            
            if vehicle.HasField('position'):
                result['position'] = {
                    'latitude': vehicle.position.latitude,
                    'longitude': vehicle.position.longitude,
                    'bearing': vehicle.position.bearing if vehicle.position.HasField('bearing') else None,
                    'speed': vehicle.position.speed if vehicle.position.HasField('speed') else None
                }
            
            if vehicle.HasField('current_stop_sequence'):
                result['current_stop_sequence'] = vehicle.current_stop_sequence
            
            if vehicle.HasField('stop_id'):
                result['stop_id'] = vehicle.stop_id
            
            if vehicle.HasField('current_status'):
                result['current_status'] = vehicle.current_status
            
            if vehicle.HasField('timestamp'):
                result['timestamp'] = vehicle.timestamp

            return result if result else None
        except Exception as e:
            logger.error(f"Error processing vehicle position: {str(e)}")
            return None

    def _process_alert(self, alert: gtfs_realtime_pb2.Alert) -> Optional[Dict]:
        """
        Process alert data
        """
        try:
            result = {'effect': alert.effect}
            
            if alert.header_text.translation:
                result['header_text'] = alert.header_text.translation[0].text
            
            if alert.description_text.translation:
                result['description_text'] = alert.description_text.translation[0].text
            
            if alert.informed_entity:
                result['informed_entity'] = []
                for entity in alert.informed_entity:
                    informed_entity = {}
                    if entity.HasField('trip'):
                        informed_entity['trip'] = {
                            'trip_id': entity.trip.trip_id,
                            'route_id': entity.trip.route_id
                        }
                    if entity.HasField('stop_id'):
                        informed_entity['stop_id'] = entity.stop_id
                    result['informed_entity'].append(informed_entity)

            return result
        except Exception as e:
            logger.error(f"Error processing alert: {str(e)}")
            return None 