import cloudinary
import cloudinary.uploader
import os


def init_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )


def upload_image(file):
    result = cloudinary.uploader.upload(
        file,
        folder="phibia/frogs",
        resource_type="image",
    )
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
    }


def delete_image(public_id):
    return cloudinary.uploader.destroy(public_id)


def upload_audio(file):
    result = cloudinary.uploader.upload(
        file,
        folder="phibia/audios",
        resource_type="video",
    )
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
    }


def delete_audio(public_id):
    return cloudinary.uploader.destroy(public_id, resource_type="video")
