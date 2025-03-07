export enum TripScheduleRelationship {
    SCHEDULED = 0,
    ADDED = 1,
    UNSCHEDULED = 2,
    CANCELED = 3
}

export enum StopTimeScheduleRelationship {
    SCHEDULED = 0,
    SKIPPED = 1,
    NO_DATA = 2
}

export enum VehicleStopStatus {
    INCOMING_AT = 0,
    STOPPED_AT = 1,
    IN_TRANSIT_TO = 2
}

export enum AlertEffect {
    NO_SERVICE = 1,
    REDUCED_SERVICE = 2,
    SIGNIFICANT_DELAYS = 3,
    DETOUR = 4,
    ADDITIONAL_SERVICE = 5,
    MODIFIED_SERVICE = 6,
    OTHER_EFFECT = 7,
    UNKNOWN_EFFECT = 8,
    STOP_MOVED = 9
}

export interface StopTimeUpdate {
    stop_id: string;
    arrival_time: string | null;
    arrival_delay: number | null;
    departure_time: string | null;
    departure_delay: number | null;
    schedule_relationship: StopTimeScheduleRelationship;
}

export interface Trip {
    id: number;
    trip_id: string;
    route_id: string;
    start_time: string;
    start_date: string;
    schedule_relationship: TripScheduleRelationship;
    stop_time_updates: StopTimeUpdate[];
    vehicle_position?: VehiclePosition;
}

export interface VehiclePosition {
    id: number;
    trip_id: number;
    trip?: {
        route_id: string;
    };
    latitude: number;
    longitude: number;
    bearing: number | null;
    speed: number | null;
    current_stop_sequence: number | null;
    current_stop_id: string | null;
    current_status: VehicleStopStatus;
    timestamp: string;
}

export interface Alert {
    id: number;
    effect: AlertEffect;
    header_text: string | null;
    description_text: string | null;
    active: boolean;
    informed_entities: Array<{
        trip?: {
            trip_id: string;
            route_id: string;
        };
        stop_id?: string;
    }>;
}

export interface FeedUpdate {
    id: number;
    timestamp: string;
    version: string;
    processed_count: number;
    trips_count: number;
    vehicles_count: number;
    alerts_count: number;
} 