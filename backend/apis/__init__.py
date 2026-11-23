from fastapi import APIRouter
from .users import router as users
from .admins import router as admins

router = APIRouter(prefix="/api/v1")

router.include_router(users)
router.include_router(admins, prefix="/admins")
