from fastapi import APIRouter
# from fastapi import Depends

from controls.cache import cache_flush_all
# from controls.auth import get_admin
from controls.responses import success_response


router = APIRouter()


@router.post("/cache/clear")
async def clear_cache(
    # admin=Depends(get_admin),
):
    cleared_keys = await cache_flush_all()
    return success_response(
        {
            "cleared": True,
            "keys_before": cleared_keys,
        },
        status_code=200,
    )
