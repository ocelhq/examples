import ocel

from thumbnails import make_thumbnail

db = ocel.postgres("media")
images = ocel.bucket("images")
uploaded = ocel.topic("image-uploaded")


@uploaded.consumer("thumbnail", retry=ocel.Retry(max_attempts=3))
async def thumbnail(payload: dict, ctx: ocel.RunContext) -> None:
    image_id = payload["image_id"]
    try:
        async with await images.get_async(f"originals/{image_id}") as original:
            data = await original.bytes()
        await images.put_async(
            f"thumbnails/{image_id}.jpg", make_thumbnail(data), content_type="image/jpeg"
        )
    except Exception as error:
        await db.fetch(
            "update images set status = 'failed', error = $2 where id = $1::uuid",
            image_id,
            str(error),
        )
        raise ocel.AbortTaskRunError(str(error)) from error
    await db.fetch("update images set status = 'ready' where id = $1::uuid", image_id)
