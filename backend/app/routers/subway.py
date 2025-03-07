from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from ..services.mta_service import MTAService

router = APIRouter(
    prefix="/api/subway",
    tags=["subway"]
)

@router.get("/lines")
async def get_available_lines() -> Dict[str, List[str]]:
    """
    Get list of available subway lines grouped by line group
    """
    return {
        "line_groups": list(MTAService.FEED_URLS.keys())
    }

@router.get("/feed/{line_group}")
async def get_line_feed(
    line_group: str,
    mta_service: MTAService = Depends(MTAService)
) -> Dict:
    """
    Get real-time feed data for a specific line group
    """
    return await mta_service.get_feed_data(line_group)

@router.get("/status")
async def get_service_status(
    mta_service: MTAService = Depends(MTAService)
) -> Dict:
    """
    Get overall subway service status
    """
    try:
        # Get status for a sample line to check service health
        sample_data = await mta_service.get_feed_data("1-2-3")
        return {
            "status": "operational",
            "message": "Subway feed service is running normally",
            "last_update": sample_data["header"]["timestamp"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail="Subway feed service is currently unavailable"
        ) 