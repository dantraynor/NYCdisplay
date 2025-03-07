import asyncio
from app.services.mta_service import MTAService
from app.services.db_service import DBService
from app.db.session import SessionLocal
from app.db.init_db import init_db, clear_db

async def test_db_setup():
    """
    Test database setup and data storage
    """
    try:
        print("\nInitializing database...")
        init_db()
        
        # Get MTA data
        print("\nFetching MTA data...")
        mta_service = MTAService()
        feed_data = await mta_service.get_feed_data()
        
        # Store in database
        print("\nStoring data in database...")
        db = SessionLocal()
        db_service = DBService(db)
        feed_update = db_service.store_feed_data(feed_data)
        
        # Print results
        print("\nData stored successfully!")
        print(f"Timestamp: {feed_update.timestamp}")
        print(f"Total entities processed: {feed_update.processed_count}")
        print(f"Trips: {feed_update.trips_count}")
        print(f"Vehicles: {feed_update.vehicles_count}")
        print(f"Alerts: {feed_update.alerts_count}")
        
        # Test retrieval
        print("\nRetrieving stored data...")
        active_trips = db_service.get_active_trips()
        vehicle_positions = db_service.get_vehicle_positions()
        active_alerts = db_service.get_active_alerts()
        
        print(f"\nRetrieved data:")
        print(f"Active trips: {len(active_trips)}")
        print(f"Vehicle positions: {len(vehicle_positions)}")
        print(f"Active alerts: {len(active_alerts)}")
        
        if active_alerts:
            print("\nExample alert:")
            alert = active_alerts[0]
            print(f"Effect: {alert.effect}")
            print(f"Header: {alert.header_text}")
            print(f"Description: {alert.description_text}")
        
        db.close()
        print("\nDatabase test completed successfully!")
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        raise e

if __name__ == "__main__":
    asyncio.run(test_db_setup()) 