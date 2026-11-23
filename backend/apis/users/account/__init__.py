from fastapi import APIRouter
from .read_me import router as read_me

router = APIRouter()

router.include_router(read_me, tags=["Account"])
