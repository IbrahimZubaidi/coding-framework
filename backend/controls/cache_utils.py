import base64
import zlib

from controls.config import settings


def build_cache_key(*parts: object) -> str:
    return f"{settings.CACHE_KEY_PREFIX}{':'.join(str(part) for part in parts)}"


def compress_payload(payload: str, *, level: int = 1) -> str:
    compressed = zlib.compress(payload.encode("utf-8"), level=level)
    return base64.b64encode(compressed).decode("ascii")


def decompress_payload(payload: str) -> str:
    compressed = base64.b64decode(payload.encode("ascii"))
    return zlib.decompress(compressed).decode("utf-8")
