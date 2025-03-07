from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class TripScheduleRelationship(enum.Enum):
    """
    Enum for trip schedule relationships
    """
    SCHEDULED = 0
    ADDED = 1
    UNSCHEDULED = 2
    CANCELED = 3

class StopTimeScheduleRelationship(enum.Enum):
    """
    Enum for stop time schedule relationships
    """
    SCHEDULED = 0
    SKIPPED = 1
    NO_DATA = 2

class VehicleStopStatus(enum.Enum):
    """
    Enum for vehicle stop status
    """
    INCOMING_AT = 0
    STOPPED_AT = 1
    IN_TRANSIT_TO = 2

class AlertEffect(enum.Enum):
    """
    Enum for alert effects
    """
    NO_SERVICE = 1
    REDUCED_SERVICE = 2
    SIGNIFICANT_DELAYS = 3
    DETOUR = 4
    ADDITIONAL_SERVICE = 5
    MODIFIED_SERVICE = 6
    OTHER_EFFECT = 7
    UNKNOWN_EFFECT = 8
    STOP_MOVED = 9

class Trip(Base, TimestampMixin):
    """
    Model for subway trips
    """
    __tablename__ = 'trips'

    id = Column(Integer, primary_key=True)
    trip_id = Column(String, nullable=False, index=True)
    route_id = Column(String, nullable=False, index=True)
    start_time = Column(String)
    start_date = Column(String)
    schedule_relationship = Column(Enum(TripScheduleRelationship))
    
    # Relationships
    stop_time_updates = relationship("StopTimeUpdate", back_populates="trip", cascade="all, delete-orphan")
    vehicle_position = relationship("VehiclePosition", back_populates="trip", uselist=False)

class StopTimeUpdate(Base, TimestampMixin):
    """
    Model for stop time updates
    """
    __tablename__ = 'stop_time_updates'

    id = Column(Integer, primary_key=True)
    trip_id = Column(Integer, ForeignKey('trips.id'), nullable=False)
    stop_id = Column(String, nullable=False, index=True)
    arrival_time = Column(DateTime, index=True)
    arrival_delay = Column(Integer)
    departure_time = Column(DateTime, index=True)
    departure_delay = Column(Integer)
    schedule_relationship = Column(Enum(StopTimeScheduleRelationship))

    # Relationships
    trip = relationship("Trip", back_populates="stop_time_updates")

class VehiclePosition(Base, TimestampMixin):
    """
    Model for vehicle positions
    """
    __tablename__ = 'vehicle_positions'

    id = Column(Integer, primary_key=True)
    trip_id = Column(Integer, ForeignKey('trips.id'), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    bearing = Column(Float)
    speed = Column(Float)
    current_stop_sequence = Column(Integer)
    current_stop_id = Column(String, index=True)
    current_status = Column(Enum(VehicleStopStatus))
    timestamp = Column(DateTime, index=True)

    # Relationships
    trip = relationship("Trip", back_populates="vehicle_position")

class Alert(Base, TimestampMixin):
    """
    Model for service alerts
    """
    __tablename__ = 'alerts'

    id = Column(Integer, primary_key=True)
    effect = Column(Enum(AlertEffect), nullable=False)
    header_text = Column(String)
    description_text = Column(String)
    active = Column(Boolean, default=True, index=True)
    
    # Store informed entities as JSON
    informed_entities = Column(JSON)

class FeedUpdate(Base, TimestampMixin):
    """
    Model to track feed updates
    """
    __tablename__ = 'feed_updates'

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    version = Column(String)
    processed_count = Column(Integer)
    trips_count = Column(Integer)
    vehicles_count = Column(Integer)
    alerts_count = Column(Integer) 