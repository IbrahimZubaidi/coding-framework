import asyncio

import cloudinary
import cloudinary.uploader


def _upload_image_sync(image):
    result = cloudinary.uploader.upload(
        image,
        folder="questions",
        quality="auto",
        fetch_format="auto",
    )
    return result["secure_url"], result["public_id"]


def _delete_image_sync(public_id):
    cloudinary.uploader.destroy(public_id)


async def upload_image(image):
    return await asyncio.to_thread(_upload_image_sync, image)


async def delete_image(public_id):
    await asyncio.to_thread(_delete_image_sync, public_id)
