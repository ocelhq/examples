import io

from PIL import Image

SIZE = (256, 256)


def make_thumbnail(original: bytes) -> bytes:
    with Image.open(io.BytesIO(original)) as image:
        image.thumbnail(SIZE)
        out = io.BytesIO()
        image.convert("RGB").save(out, format="JPEG", quality=85)
        return out.getvalue()
