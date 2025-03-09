from google.transit import gtfs_realtime_pb2
from google.protobuf.message import DecodeError
import requests
from fastapi import HTTPException
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class MTAService:
    """
    Service for handling MTA GTFS-realtime feed interactions
    """
    
    # MTA feed URLs for different subway lines (GTFS-RT feeds)
    FEED_URLS = {
        "1-2-3": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",  # IRT feed
        "4-5-6": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",  # IRT feed
        "7": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",      # IRT feed
        "A-C-E": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",  # IND feed
        "N-Q-R-W": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",  # BMT feed
        "B-D-F-M": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",  # IND feed
        "L": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l",    # BMT Canarsie feed
        "G": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",    # IND Crosstown feed
        "J-Z": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",  # BMT feed
        "S": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si"    # Staten Island feed
    }

    def __init__(self):
        """
        Initialize the MTA service
        """
        self.feed = gtfs_realtime_pb2.FeedMessage()

    async def get_feed_data(self, line_group: str = None, data_type: str = None) -> Dict:
        """
        Fetch real-time feed data
        Args:
            line_group: The subway line group to fetch data for
            data_type: Type of data to return (vehicle_positions, alerts, trip_updates, or None for all)
        """
        try:
            # Get the feed URL for the requested line group
            feed_url = self.FEED_URLS.get(line_group)
            if not feed_url:
                raise HTTPException(status_code=400, detail=f"Invalid line group: {line_group}")

            response = requests.get(
                feed_url,
                headers={'Accept': 'application/x-google-protobuf'}
            )
            response.raise_for_status()
            
            try:
                # Parse the protocol buffer
                self.feed.ParseFromString(response.content)
                
                # Process based on requested data type
                if data_type == 'vehicle_positions':
                    return self._process_vehicle_positions(self.feed)
                elif data_type == 'alerts':
                    return self._process_alerts(self.feed)
                elif data_type == 'trip_updates':
                    return self._process_trip_updates(self.feed)
                else:
                    return self._process_feed_data(self.feed)
            except DecodeError as e:
                logger.error(f"Failed to decode GTFS-RT data: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to decode GTFS-RT data from MTA feed"
                )
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching MTA data: {str(e)}")
            raise HTTPException(status_code=503, detail="Unable to fetch MTA data")
        except Exception as e:
            logger.error(f"Error processing MTA data: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing MTA data: {str(e)}")

    def _process_feed_data(self, feed: gtfs_realtime_pb2.FeedMessage) -> Dict:
        """
        Process all GTFS feed data into a more usable format
        """
        return {
            'header': {
                'timestamp': feed.header.timestamp,
                'version': feed.header.gtfs_realtime_version
            },
            'vehicle_positions': self._process_vehicle_positions(feed),
            'alerts': self._process_alerts(feed),
            'trip_updates': self._process_trip_updates(feed)
        }

    def _process_vehicle_positions(self, feed: gtfs_realtime_pb2.FeedMessage) -> List[Dict]:
        """
        Process only vehicle position data
        """
        vehicles = []
        for entity in feed.entity:
            if entity.HasField('vehicle'):
                vehicle_data = self._process_vehicle(entity.vehicle)
                if vehicle_data:
                    vehicles.append({'id': entity.id, **vehicle_data})
        return vehicles

    def _process_alerts(self, feed: gtfs_realtime_pb2.FeedMessage) -> List[Dict]:
        """
        Process only alert data
        """
        alerts = []
        for entity in feed.entity:
            if entity.HasField('alert'):
                alert_data = self._process_alert(entity.alert)
                if alert_data:
                    alerts.append({'id': entity.id, **alert_data})
        return alerts

    def _process_trip_updates(self, feed: gtfs_realtime_pb2.FeedMessage) -> List[Dict]:
        """
        Process only trip update data
        """
        updates = []
        for entity in feed.entity:
            if entity.HasField('trip_update'):
                trip_data = self._process_trip_update(entity.trip_update)
                if trip_data:
                    updates.append({'id': entity.id, **trip_data})
        return updates

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