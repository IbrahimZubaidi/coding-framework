from fastapi import APIRouter
from .auth    import router as auth
from .account import router as account

router = APIRouter()

router.include_router(auth,    tags=["Auth"])
router.include_router(account, tags=["Account"])
