import math
from PIL import Image, ImageDraw

BG = (14, 21, 19, 255)       # panel
BORDER = (50, 70, 64, 255)   # border2
AMBER = (255, 122, 60, 255)
GOLD = (255, 194, 75, 255)
MINT = (79, 224, 176, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


def draw_mark(size, bg_fill_edge_to_edge, pad_ratio):
    """Draws the Cortex synaptic mark. If bg_fill_edge_to_edge, the rounded
    panel fills the whole canvas (for 'any' icons). Otherwise it sits inside
    a safe-zone padding (for 'maskable' icons, background still edge-to-edge
    but the mark itself is inset further)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if bg_fill_edge_to_edge:
        # rounded-square panel background, edge to edge (maskable requirement)
        radius = int(size * 0.22)
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=BG)
    else:
        inset = int(size * 0.045)
        radius = int(size * 0.24)
        d.rounded_rectangle([inset, inset, size - 1 - inset, size - 1 - inset], radius=radius, fill=BG, outline=BORDER, width=max(1, size // 90))

    cx = cy = size / 2
    R = size * (pad_ratio)

    # 5 node points around the center, matching the web logo's angles
    angles_deg = [180 + 25, -25, 200, -20 + 180, 270]  # rough spread
    # simpler: 5 evenly-inspired points approximating the original SVG layout
    pts = [
        (cx - R * 0.62, cy - R * 0.62),  # upper-left
        (cx + R * 0.62, cy - R * 0.62),  # upper-right
        (cx - R * 0.72, cy + R * 0.62),  # lower-left
        (cx + R * 0.62, cy + R * 0.72),  # lower-right
        (cx, cy - R * 0.95),             # top
    ]

    line_w = max(2, size // 110)
    for (x, y) in pts:
        # amber->gold gradient approximation via multi-segment line
        steps = 12
        for i in range(steps):
            t0 = i / steps
            t1 = (i + 1) / steps
            xa, ya = cx + (x - cx) * t0, cy + (y - cy) * t0
            xb, yb = cx + (x - cx) * t1, cy + (y - cy) * t1
            d.line([xa, ya, xb, yb], fill=lerp(GOLD, AMBER, t0), width=line_w)

    node_r = size * 0.028
    for (x, y) in pts:
        d.ellipse([x - node_r, y - node_r, x + node_r, y + node_r], fill=MINT)

    # center gradient core (concentric circles amber->gold)
    core_r = size * 0.075
    steps = 16
    for i in range(steps, 0, -1):
        t = i / steps
        r = core_r * t
        col = lerp(AMBER, GOLD, 1 - t)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)

    return img


# Standard "any" icons — mark fills most of the canvas
for size, name in [(192, "icon-192.png"), (512, "icon-512.png")]:
    img = draw_mark(size, bg_fill_edge_to_edge=False, pad_ratio=size * 0.30)
    img.save(f"/home/claude/cortex/public/{name}")

# Maskable icon — background edge-to-edge, mark kept within the ~80% safe zone
img = draw_mark(512, bg_fill_edge_to_edge=True, pad_ratio=512 * 0.24)
img.save("/home/claude/cortex/public/icon-maskable-512.png")

# Favicon
fav = draw_mark(64, bg_fill_edge_to_edge=False, pad_ratio=64 * 0.32)
fav.save("/home/claude/cortex/public/favicon.png")

print("done")
