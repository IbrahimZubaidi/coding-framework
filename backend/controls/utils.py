import base64
import math
from typing import Optional, Dict, Any

def build_paginated_response(page: int, limit: Optional[int], total: int) -> Dict[str, Any]:
    total_pages = math.ceil(total / limit) if (limit and total) else 1 if (total > 0) else 0
    return {
        "current_page": page if limit else 1,
        "total_pages": total_pages,
        "total_rows": total,
        "rows_per_page": (limit if limit else total),
        "has_next_page": (page < total_pages) if limit else False,
        "has_previous_page": (page > 1) if limit else False,
    }


def normalize_image_input(value: str, field_name: str = "image", allow_image_url: bool = True) -> str:
    value = value.strip()
    if allow_image_url and value.startswith(("http://", "https://", "data:image/")):
        return value
    # if value.startswith(("http://", "https://", "data:image/")):
    #     return value

    payload = value.split(",", 1)[-1] if ";base64," in value else value
    payload = "".join(payload.split())

    try:
        image_bytes = base64.b64decode(payload, validate=True)
    except Exception as exc:
        raise ValueError(f"{field_name} must be a valid base64 image string") from exc

    mime_type = "image/png"
    if image_bytes.startswith(b"\xff\xd8\xff"):
        mime_type = "image/jpeg"
    elif image_bytes.startswith((b"GIF87a", b"GIF89a")):
        mime_type = "image/gif"
    elif image_bytes.startswith(b"RIFF") and image_bytes[8:12] == b"WEBP":
        mime_type = "image/webp"

    return f"data:{mime_type};base64,{payload}"
