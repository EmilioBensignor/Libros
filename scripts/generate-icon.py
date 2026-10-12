from PIL import Image, ImageDraw, ImageFilter, ImageChops
import sys
OUT = sys.argv[1]
N = 1024
VIOLET, LIMA, CELESTE = (130, 10, 255), (201, 242, 28), (0, 247, 230)

bg = Image.new('RGB', (N, N), (8, 8, 12))
smoke = Image.new('RGB', (N, N), (0, 0, 0))
d = ImageDraw.Draw(smoke)
for (cx, cy, r, col) in [(250, 260, 430, VIOLET), (820, 330, 330, CELESTE), (560, 900, 360, VIOLET), (880, 860, 220, LIMA), (180, 760, 230, CELESTE)]:
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col)
smoke = smoke.filter(ImageFilter.GaussianBlur(170))
bg = Image.blend(bg, smoke, 0.82)

book = Image.new('RGBA', (N, N), (0, 0, 0, 0))
b = ImageDraw.Draw(book)
x0, y0, x1, y1 = 330, 230, 700, 794
b.rounded_rectangle((x0 + 26, y0 + 26, x1 + 26, y1 + 22), 40, fill=(0, 0, 0, 90))
book = book.filter(ImageFilter.GaussianBlur(24))
b = ImageDraw.Draw(book)
b.rounded_rectangle((x0, y0, x1, y1), 38, fill=(250, 250, 250, 255))
b.rounded_rectangle((x0, y0, x0 + 58, y1), 38, fill=(222, 222, 228, 255))
b.rectangle((x0 + 40, y0, x0 + 58, y1), fill=(222, 222, 228, 255))
b.line((x0 + 58, y0 + 6, x0 + 58, y1 - 6), fill=(196, 196, 204, 255), width=4)
for i, y in enumerate((y1 - 34, y1 - 20)):
    b.line((x0 + 70, y, x1 - 18, y), fill=(232, 232, 236, 255), width=6)

iso = Image.open('/Users/lio/Desktop/Motix/Logo/Isotipo.jpg').convert('L')
bbox = iso.point(lambda v: 255 if v > 128 else 0).getbbox()
iso = iso.crop(bbox)
size = 220
iso = iso.resize((size, size), Image.LANCZOS)
mask = iso.point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(0.6))
cx = (x0 + 58 + x1) // 2
cy = (y0 + y1) // 2 - 20
book.paste((12, 12, 16, 255), (cx - size // 2, cy - size // 2), mask)

img = bg.convert('RGBA')
img.alpha_composite(book)
img = img.convert('RGB')
img.resize((512, 512), Image.LANCZOS).save(f'{OUT}/icon-512.png', optimize=True)
img.resize((192, 192), Image.LANCZOS).save(f'{OUT}/icon-192.png', optimize=True)
img.resize((180, 180), Image.LANCZOS).save(f'{OUT}/icon-180.png', optimize=True)


ico = img.resize((64, 64), Image.LANCZOS)
ico.save(f'{OUT}/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print('ok')
