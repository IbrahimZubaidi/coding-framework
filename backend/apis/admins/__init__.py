from fastapi import APIRouter
from .clear_cache import router as clear_cache
from .read_telemetry_report import router as read_telemetry_report

router = APIRouter()

router.include_router(clear_cache, tags=["Admin - Cache"])
router.include_router(read_telemetry_report, tags=["Admin - Telemetry"])
