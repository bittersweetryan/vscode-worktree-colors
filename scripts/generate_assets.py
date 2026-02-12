import os
import struct
import zlib


ROOT = os.path.dirname(os.path.dirname(__file__))
IMAGES_DIR = os.path.join(ROOT, "images")
SCREENSHOTS_DIR = os.path.join(IMAGES_DIR, "screenshots")


def write_png(path, width, height, rgb_bytes):
    def chunk(tag, data):
        return (
            struct.pack("!I", len(data))
            + tag
            + data
            + struct.pack("!I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(
        b"IHDR",
        struct.pack("!IIBBBBB", width, height, 8, 2, 0, 0, 0),
    )
    rows = []
    stride = width * 3
    for y in range(height):
        rows.append(b"\x00" + rgb_bytes[y * stride : (y + 1) * stride])
    idat = chunk(b"IDAT", zlib.compress(b"".join(rows), 9))
    iend = chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(sig + ihdr + idat + iend)


def new_image(width, height, color):
    r, g, b = color
    data = bytearray(width * height * 3)
    for i in range(0, len(data), 3):
        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
    return data


def set_px(data, width, x, y, color):
    if x < 0 or y < 0:
        return
    idx = (y * width + x) * 3
    if idx + 2 >= len(data):
        return
    data[idx] = color[0]
    data[idx + 1] = color[1]
    data[idx + 2] = color[2]


def fill_rect(data, width, height, x, y, w, h, color):
    x2 = min(width, x + w)
    y2 = min(height, y + h)
    for yy in range(max(0, y), y2):
        row = yy * width * 3
        for xx in range(max(0, x), x2):
            idx = row + xx * 3
            data[idx] = color[0]
            data[idx + 1] = color[1]
            data[idx + 2] = color[2]


def draw_rounded_rect(data, width, height, x, y, w, h, r, color):
    fill_rect(data, width, height, x + r, y, w - 2 * r, h, color)
    fill_rect(data, width, height, x, y + r, r, h - 2 * r, color)
    fill_rect(data, width, height, x + w - r, y + r, r, h - 2 * r, color)
    for yy in range(r):
        for xx in range(r):
            dx = r - xx - 1
            dy = r - yy - 1
            if dx * dx + dy * dy <= r * r:
                set_px(data, width, x + xx, y + yy, color)
                set_px(data, width, x + w - r + xx, y + yy, color)
                set_px(data, width, x + xx, y + h - r + yy, color)
                set_px(data, width, x + w - r + xx, y + h - r + yy, color)


def draw_window(data, width, height, x, y, w, h, status_color):
    border = (56, 62, 74)
    chrome = (33, 38, 47)
    body = (19, 23, 30)
    sidebar = (23, 28, 36)
    panel = (16, 20, 27)

    draw_rounded_rect(data, width, height, x, y, w, h, 8, border)
    fill_rect(data, width, height, x + 2, y + 2, w - 4, h - 4, body)
    fill_rect(data, width, height, x + 2, y + 2, w - 4, 28, chrome)
    fill_rect(data, width, height, x + 2, y + h - 24, w - 4, 22, status_color)
    fill_rect(data, width, height, x + 2, y + 30, 52, h - 56, sidebar)
    fill_rect(data, width, height, x + 56, y + 30, w - 58, h - 92, panel)
    fill_rect(data, width, height, x + 56, y + h - 58, w - 58, 26, (34, 40, 50))

    for i in range(5):
        fill_rect(data, width, height, x + 8 + i * 12, y + 10, 8, 8, (100, 108, 121))

    for i in range(6):
        fill_rect(data, width, height, x + 64, y + 42 + i * 24, w - 90, 12, (54, 64, 80))


def build_icon():
    width = 128
    height = 128
    data = new_image(width, height, (17, 22, 30))

    draw_rounded_rect(data, width, height, 8, 8, 112, 112, 22, (34, 41, 52))
    draw_rounded_rect(data, width, height, 18, 18, 92, 92, 16, (44, 53, 66))
    fill_rect(data, width, height, 24, 24, 80, 76, (24, 31, 41))

    # Horizontal "code" lines in the upper half.
    fill_rect(data, width, height, 30, 34, 58, 6, (248, 250, 252))
    fill_rect(data, width, height, 30, 46, 66, 6, (248, 250, 252))
    fill_rect(data, width, height, 30, 58, 54, 6, (248, 250, 252))
    fill_rect(data, width, height, 30, 70, 70, 6, (248, 250, 252))

    # Bottom status bar split into three pastel segments.
    fill_rect(data, width, height, 24, 88, 26, 12, (173, 216, 230))
    fill_rect(data, width, height, 51, 88, 26, 12, (219, 203, 245))
    fill_rect(data, width, height, 78, 88, 26, 12, (184, 236, 222))

    write_png(os.path.join(IMAGES_DIR, "icon.png"), width, height, data)


def build_screenshot(name, accent_left, accent_right):
    width = 1440
    height = 900
    data = new_image(width, height, (10, 13, 19))

    fill_rect(data, width, height, 0, 0, width, 120, (14, 18, 25))
    fill_rect(data, width, height, 0, 120, width, 40, (17, 21, 29))
    fill_rect(data, width, height, 0, 160, width, 740, (12, 16, 23))

    draw_window(data, width, height, 90, 110, 600, 680, accent_left)
    draw_window(data, width, height, 750, 110, 600, 680, accent_right)

    write_png(os.path.join(SCREENSHOTS_DIR, name), width, height, data)


def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    build_icon()
    build_screenshot("screenshot-1.png", (173, 216, 230), (200, 228, 186))
    build_screenshot("screenshot-2.png", (245, 214, 184), (197, 214, 250))
    build_screenshot("screenshot-3.png", (219, 203, 245), (184, 236, 222))

    print("Generated icon and screenshots under images/")


if __name__ == "__main__":
    main()
