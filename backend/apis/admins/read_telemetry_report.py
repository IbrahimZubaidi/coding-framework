from fastapi import APIRouter, Depends, Query

from controls.auth import get_admin
from controls.responses import success_response
from controls.telemetry import get_report, reset_report


router = APIRouter()


@router.get("/telemetry/report")
async def read_telemetry_report(
    limit: int = Query(default=100, ge=1, le=1000),
    admin=Depends(get_admin),
):
    return success_response(get_report(limit=limit), status_code=200)


@router.post("/telemetry/report/reset")
async def reset_telemetry_report(
    admin=Depends(get_admin),
):
    reset_report()
    return success_response({"reset": True}, status_code=200)
