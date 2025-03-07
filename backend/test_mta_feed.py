import asyncio
from app.services.mta_service import MTAService
import json
from datetime import datetime

async def test_mta_feed():
    """
    Test function to fetch and display MTA feed data
    """
    try:
        # Initialize the MTA service
        mta_service = MTAService()
        
        print("\nFetching subway feed data...")
        data = await mta_service.get_feed_data()
        
        # Convert timestamp to readable format
        timestamp = datetime.fromtimestamp(data['header']['timestamp'])
        
        # Print formatted results
        print("\nFeed Information:")
        print(f"Timestamp: {timestamp}")
        print(f"GTFS Version: {data['header']['version']}")
        print(f"\nNumber of entities: {len(data['entities'])}")
        
        # Analyze the types of data we're getting
        trips = sum(1 for e in data['entities'] if 'trip' in e)
        vehicles = sum(1 for e in data['entities'] if 'vehicle' in e)
        alerts = sum(1 for e in data['entities'] if 'alert' in e)
        
        print(f"\nData Overview:")
        print(f"Trips: {trips}")
        print(f"Vehicle Positions: {vehicles}")
        print(f"Service Alerts: {alerts}")
        
        # Find interesting examples
        trip_example = next((e for e in data['entities'] if 'trip' in e and e['trip']['stop_time_updates']), None)
        vehicle_example = next((e for e in data['entities'] if 'vehicle' in e and e.get('vehicle', {}).get('position')), None)
        alert_example = next((e for e in data['entities'] if 'alert' in e), None)
        
        if trip_example:
            print("\nExample Trip Update:")
            print(json.dumps(trip_example, indent=2))
            
            if trip_example['trip']['stop_time_updates']:
                print("\nDetailed Stop Updates:")
                for update in trip_example['trip']['stop_time_updates'][:3]:  # Show first 3 stops
                    stop_id = update['stop_id']
                    arrival = datetime.fromtimestamp(update['arrival']['time']) if update.get('arrival', {}).get('time') else None
                    departure = datetime.fromtimestamp(update['departure']['time']) if update.get('departure', {}).get('time') else None
                    print(f"\nStop ID: {stop_id}")
                    print(f"Arrival: {arrival}")
                    print(f"Departure: {departure}")
        
        if vehicle_example:
            print("\nExample Vehicle Position:")
            print(json.dumps(vehicle_example, indent=2))
        
        if alert_example:
            print("\nExample Service Alert:")
            print(json.dumps(alert_example, indent=2))

    except Exception as e:
        print(f"\nError: {str(e)}")

if __name__ == "__main__":
    # Run the async test function
    asyncio.run(test_mta_feed()) 