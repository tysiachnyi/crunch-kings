import math

from .core import box, cable, cone, crumple, cylinder, group, material, rng, sphere, torus

DESK_H = 0.74


def keyboard(g, loc):
    x0, y0, z0 = loc
    box("Kb_Base", (0.46, 0.17, 0.03), (x0, y0, z0 + 0.015), "beige", g, bevel=0.008, rot=(4, 0, 0))
    for row in range(4):
        for col in range(12):
            box(
                f"Kb_Key{row}_{col}", (0.03, 0.03, 0.014),
                (x0 - 0.19 + col * 0.0345, y0 - 0.055 + row * 0.036, z0 + 0.036 + row * 0.0025),
                "beige_dark" if (row + col) % 7 else "coral", g, bevel=0.0,
            )
    box("Kb_Space", (0.2, 0.03, 0.014), (x0, y0 - 0.083, z0 + 0.034), "beige_dark", g, bevel=0.0)


def crt_monitor(g, loc, code=True):
    x, y, z = loc
    box("Crt_Base", (0.36, 0.3, 0.05), (x, y + 0.02, z + 0.025), "beige", g, bevel=0.01)
    box("Crt_Neck", (0.12, 0.1, 0.05), (x, y + 0.04, z + 0.07), "beige_dark", g, bevel=0.005)
    box("Crt_Body", (0.44, 0.42, 0.38), (x, y + 0.04, z + 0.29), "beige", g, bevel=0.025)
    box("Crt_Back", (0.32, 0.18, 0.28), (x, y + 0.3, z + 0.27), "beige_dark", g, bevel=0.03)
    box("Crt_Bezel", (0.36, 0.02, 0.29), (x, y - 0.175, z + 0.3), "beige_dark", g, bevel=0.01)
    box("Crt_Screen", (0.31, 0.02, 0.24), (x, y - 0.18, z + 0.305), material("screen", emission=2.5), g, bevel=0.012)
    if code:
        for i in range(7):
            width = 0.05 + rng.random() * 0.16
            indent = 0.02 * rng.randint(0, 3)
            box(
                f"Crt_Code{i}", (width, 0.005, 0.012),
                (x - 0.13 + indent + width / 2, y - 0.192, z + 0.4 - i * 0.03),
                material("coral", emission=1.5) if i % 3 == 1 else "ui_dark", g, bevel=0.0,
            )
    box("Crt_Led", (0.02, 0.01, 0.01), (x + 0.15, y - 0.18, z + 0.13), material("green", emission=4), g, bevel=0.0)


def desk(name, parent, loc, rot_z, drawers=True):
    g = group(name, parent, loc, rot_z)
    box("Desk_Top", (1.4, 0.75, 0.06), (0, 0, DESK_H - 0.03), "wood", g, bevel=0.012)
    if drawers:
        box("Desk_Drawers", (0.42, 0.68, DESK_H - 0.06), (0.47, 0, (DESK_H - 0.06) / 2), "wood_dark", g, bevel=0.01)
        for i in range(3):
            z = 0.14 + i * 0.22
            box(f"Desk_Drawer{i}", (0.38, 0.02, 0.19), (0.47, -0.345, z), "wood", g, bevel=0.006)
            box(f"Desk_Handle{i}", (0.1, 0.02, 0.02), (0.47, -0.36, z + 0.05), "beige", g, bevel=0.004)
        legs = [(-0.65, -0.32), (-0.65, 0.32)]
    else:
        legs = [(-0.65, -0.32), (-0.65, 0.32), (0.65, -0.32), (0.65, 0.32)]
    for i, (x, y) in enumerate(legs):
        box(f"Desk_Leg{i}", (0.06, 0.06, DESK_H - 0.06), (x, y, (DESK_H - 0.06) / 2), "wood_dark", g, bevel=0.006)
    box("Desk_Modesty", (0.9 if drawers else 1.24, 0.03, 0.35), (-0.18 if drawers else 0, 0.34, 0.5), "wood_dark", g, bevel=0.005)
    return g


def office_chair(name, parent, loc, rot_z, color="red"):
    g = group(name, parent, loc, rot_z)
    box("Chair_Seat", (0.46, 0.44, 0.1), (0, 0, 0.47), color, g, bevel=0.045)
    box("Chair_Back", (0.42, 0.09, 0.42), (0, 0.24, 0.8), color, g, bevel=0.045, rot=(-8, 0, 0))
    box("Chair_Spine", (0.05, 0.04, 0.3), (0, 0.23, 0.55), "black", g, bevel=0.01)
    cylinder("Chair_Pole", 0.03, 0.3, (0, 0, 0.27), "metal", g)
    for i in range(5):
        a = math.radians(i * 72)
        box(f"Chair_Spoke{i}", (0.05, 0.28, 0.035), (math.sin(a) * 0.13, math.cos(a) * 0.13, 0.08), "black", g, bevel=0.008, rot=(0, 0, -i * 72))
        sphere(f"Chair_Wheel{i}", 0.035, (math.sin(a) * 0.26, math.cos(a) * 0.26, 0.035), "black", g, segments=8, rings=6)
    return g


def mug(g, loc, color="coral", pens=False):
    x, y, z = loc
    cylinder("Mug_Body", 0.04, 0.09, (x, y, z + 0.045), color, g, verts=12)
    torus("Mug_Handle", 0.025, 0.008, (x + 0.045, y, z + 0.045), color, g, rot=(90, 0, 0), major_seg=12, minor_seg=6)
    if pens:
        for i, c in enumerate(["blue", "red", "black"]):
            cylinder(f"Pen{i}", 0.006, 0.16, (x - 0.01 + i * 0.012, y, z + 0.12), c, g, verts=6, rot=(rng.uniform(-12, 12), rng.uniform(-12, 12), 0))
    else:
        cylinder("Mug_Coffee", 0.035, 0.005, (x, y, z + 0.08), "wood_dark", g, verts=12)


def can(g, loc, color="green"):
    x, y, z = loc
    cylinder("Can", 0.033, 0.12, (x, y, z + 0.06), color, g, verts=12, bevel=0.003)
    cylinder("Can_Top", 0.03, 0.004, (x, y, z + 0.121), "metal", g, verts=12, bevel=0.0)


def paper_stack(g, loc, count=5, rot_z=0):
    x, y, z = loc
    for i in range(count):
        box(f"Paper{i}", (0.21, 0.29, 0.006), (x + rng.uniform(-0.01, 0.01), y + rng.uniform(-0.01, 0.01), z + 0.003 + i * 0.007), "paper", g, bevel=0.0, rot=(0, 0, rot_z + rng.uniform(-6, 6)))


def sticky(g, loc, rot, color=None):
    color = color or rng.choice(["yellow", "pink", "mint", "coral"])
    box("Sticky", (0.075, 0.075, 0.004), loc, color, g, bevel=0.0, rot=rot)


def desk_lamp(g, loc):
    x, y, z = loc
    cylinder("Lamp_Base", 0.07, 0.025, (x, y, z + 0.012), "navy", g, verts=16)
    box("Lamp_Arm1", (0.02, 0.02, 0.3), (x, y + 0.04, z + 0.15), "navy", g, bevel=0.004, rot=(-15, 0, 0))
    box("Lamp_Arm2", (0.02, 0.02, 0.24), (x, y - 0.02, z + 0.33), "navy", g, bevel=0.004, rot=(50, 0, 0))
    cone("Lamp_Shade", 0.08, 0.03, 0.12, (x, y - 0.12, z + 0.38), "navy", g, rot=(-60, 0, 0))
    sphere("Lamp_Bulb", 0.03, (x, y - 0.15, z + 0.35), material("yellow", emission=6), g, segments=8, rings=6)


def pc_tower(g, loc):
    x, y, z = loc
    box("Pc_Body", (0.2, 0.42, 0.42), (x, y, z + 0.21), "beige", g, bevel=0.015)
    box("Pc_Drive", (0.15, 0.01, 0.04), (x, y - 0.212, z + 0.33), "beige_dark", g, bevel=0.003)
    box("Pc_Led", (0.015, 0.01, 0.015), (x + 0.06, y - 0.212, z + 0.24), material("red", emission=5), g, bevel=0.0)


def workstation_props(g, kind):
    top = DESK_H
    crt_monitor(g, (-0.15, 0.12, top), code=(kind == "dev"))
    keyboard(g, (-0.15, -0.2, top))
    box("Mouse", (0.06, 0.1, 0.03), (0.18, -0.2, top + 0.015), "beige", g, bevel=0.012)
    box("Mousepad", (0.2, 0.18, 0.004), (0.18, -0.2, top + 0.002), "navy", g, bevel=0.0)
    mug(g, (0.45, 0.15, top), pens=True)
    if kind == "dev":
        can(g, (0.55, -0.15, top), "green")
        can(g, (0.42, -0.25, top), "blue")
        paper_stack(g, (-0.52, -0.1, top), 4, 15)
        for i in range(4):
            sticky(g, (-0.33 + i * 0.07 if i < 2 else 0.04, -0.075, top + 0.29 + (i % 2) * 0.08), (90, 0, rng.uniform(-10, 10)))
    else:
        box("Tablet", (0.3, 0.22, 0.012), (-0.5, -0.12, top + 0.006), "black", g, bevel=0.004, rot=(0, 0, 12))
        cylinder("Stylus", 0.006, 0.15, (-0.48, -0.12, top + 0.02), "white", g, verts=6, rot=(90, 0, 70))
        paper_stack(g, (0.52, -0.2, top), 3, -10)
        desk_lamp(g, (0.5, 0.18, top))
    pc_tower(g, (-0.4, 0.1, 0.0))


def cardboard_box(name, parent, loc, rot_z, size=(0.5, 0.4, 0.38), open_flaps=False):
    g = group(name, parent, loc, rot_z)
    w, d, h = size
    box("Box_Body", (w, d, h), (0, 0, h / 2), "cardboard", g, bevel=0.008)
    if open_flaps:
        box("Box_Inner", (w - 0.03, d - 0.03, 0.01), (0, 0, h - 0.005), "wood_dark", g, bevel=0.0)
        box("Box_FlapA", (w, 0.01, d * 0.5), (0, -d / 2 - d * 0.18, h + d * 0.18), "cardboard", g, bevel=0.0, rot=(-50, 0, 0))
        box("Box_FlapB", (w, 0.01, d * 0.5), (0, d / 2 + d * 0.2, h + d * 0.15), "cardboard", g, bevel=0.0, rot=(60, 0, 0))
        box("Box_FlapC", (0.01, d, w * 0.35), (w / 2 + w * 0.12, 0, h + w * 0.1), "cardboard", g, bevel=0.0, rot=(0, 55, 0))
        crumple("Box_Junk", 0.06, (0.05, 0.02, h + 0.02), "paper", g)
    else:
        box("Box_Tape", (0.08, d + 0.004, 0.004), (0, 0, h + 0.002), "tape", g, bevel=0.0)
        box("Box_TapeF", (0.08, 0.004, 0.12), (0, -d / 2 - 0.002, h - 0.06), "tape", g, bevel=0.0)
        box("Box_Seam", (0.004, d + 0.002, 0.002), (0, 0, h + 0.005), "wood_dark", g, bevel=0.0)
    return g


def water_cooler(name, parent, loc, rot_z):
    g = group(name, parent, loc, rot_z)
    box("Cooler_Body", (0.34, 0.34, 0.95), (0, 0, 0.475), "beige", g, bevel=0.02)
    box("Cooler_Panel", (0.26, 0.02, 0.24), (0, -0.17, 0.78), "beige_dark", g, bevel=0.01)
    box("Cooler_TapBlue", (0.04, 0.05, 0.05), (-0.06, -0.19, 0.8), "blue", g, bevel=0.008)
    box("Cooler_TapRed", (0.04, 0.05, 0.05), (0.06, -0.19, 0.8), "red", g, bevel=0.008)
    box("Cooler_Tray", (0.24, 0.1, 0.02), (0, -0.2, 0.62), "metal", g, bevel=0.004)
    cylinder("Cooler_Bottle", 0.15, 0.38, (0, 0, 1.15), material("water", alpha=0.55, roughness=0.15), g, verts=20, bevel=0.03)
    for i, z in enumerate((1.02, 1.15, 1.28)):
        torus(f"Cooler_Ring{i}", 0.15, 0.012, (0, 0, z), material("water", alpha=0.7, roughness=0.15), g, major_seg=20, minor_seg=6)
    cylinder("Cooler_Neck", 0.05, 0.08, (0, 0, 0.97), "blue", g, verts=12)
    for i in range(3):
        cone(f"Cup{i}", 0.03, 0.022, 0.07, (0.24, -0.05, 0.035 + i * 0.012), "paper", g, verts=10, rot=(180, 0, 0))
    return g


def big_plant(name, parent, loc, rot_z):
    g = group(name, parent, loc, rot_z)
    cone("Plant_Pot", 0.2, 0.26, 0.42, (0, 0, 0.21), "coral", g, verts=16)
    cylinder("Plant_Rim", 0.27, 0.06, (0, 0, 0.43), "red", g, verts=16)
    cylinder("Plant_Soil", 0.24, 0.02, (0, 0, 0.45), "wood_dark", g, verts=16)
    for i in range(9):
        angle = i * 40 + rng.uniform(-10, 10)
        tilt = 35 + rng.uniform(0, 30)
        length = 0.32 + rng.uniform(0, 0.18)
        a = math.radians(angle)
        reach = 0.12 + length * 0.45
        sphere(
            f"Plant_Leaf{i}", 1.0,
            (math.cos(a) * reach, math.sin(a) * reach, 0.62 + rng.uniform(0, 0.45)),
            "leaf" if i % 2 else "leaf_light", g,
            scale=(length, 0.12, 0.018), segments=12, rings=6,
            rot=(0, -tilt, angle),
        )
        box(f"Plant_Stem{i}", (0.015, 0.015, 0.4), (math.cos(a) * 0.06, math.sin(a) * 0.06, 0.6), "leaf", g, bevel=0.0, rot=(0, -tilt * 0.4, angle))
    return g


def trash_bin(name, parent, loc):
    g = group(name, parent, loc)
    cone("Bin_Body", 0.13, 0.16, 0.34, (0, 0, 0.17), "black", g, verts=8)
    torus("Bin_Rim", 0.16, 0.012, (0, 0, 0.34), "metal", g, major_seg=8, minor_seg=4)
    for i in range(4):
        crumple(f"Bin_Paper{i}", 0.055, (rng.uniform(-0.06, 0.06), rng.uniform(-0.06, 0.06), 0.34 + rng.uniform(0, 0.05)), "paper", g)
    crumple("Bin_Miss", 0.05, (0.25, -0.12, 0.04), "paper", g)
    return g


def pizza_box(name, parent, loc, rot_z):
    g = group(name, parent, loc, rot_z)
    box("Pizza_Base", (0.4, 0.4, 0.04), (0, 0, 0.02), "cardboard", g, bevel=0.004)
    box("Pizza_Lid", (0.4, 0.4, 0.01), (0, 0.2 + 0.03, 0.2), "cardboard", g, bevel=0.002, rot=(-100, 0, 0))
    box("Pizza_Logo", (0.18, 0.004, 0.1), (0, 0.235 + 0.01, 0.22), "red", g, bevel=0.0, rot=(-100, 0, 0))
    for i in range(3):
        a = 90 + i * 60 + 30
        slice_ = cylinder(f"Pizza_Slice{i}", 0.17, 0.02, (0, 0, 0.05), "pizza", g, verts=3, rot=(0, 0, a), bevel=0.0)
        slice_.scale = (1.0, 0.55, 1.0)
        sphere(f"Pizza_Pep{i}", 0.022, (math.cos(math.radians(a)) * 0.06, math.sin(math.radians(a)) * 0.06, 0.062), "sauce", g, scale=(1, 1, 0.3), segments=8, rings=4)
    return g


def bookshelf(name, parent, loc, rot_z):
    g = group(name, parent, loc, rot_z)
    w, d, h = 0.9, 0.3, 1.6
    box("Shelf_SideL", (0.04, d, h), (-w / 2, 0, h / 2), "wood_dark", g, bevel=0.006)
    box("Shelf_SideR", (0.04, d, h), (w / 2, 0, h / 2), "wood_dark", g, bevel=0.006)
    box("Shelf_Back", (w, 0.02, h), (0, d / 2 - 0.01, h / 2), "wood", g, bevel=0.0)
    colors = ["blue", "red", "yellow", "navy", "mint", "coral", "ui_dark", "mustard"]
    for s in range(5):
        z = s * 0.38 + 0.02
        box(f"Shelf_Board{s}", (w, d, 0.03), (0, 0, z), "wood_dark", g, bevel=0.004)
        if s == 4:
            break
        x = -w / 2 + 0.05
        while x < w / 2 - 0.12:
            bw = rng.uniform(0.035, 0.06)
            bh = rng.uniform(0.22, 0.3)
            lean = rng.choice([0, 0, 0, 12])
            box(f"Book{s}_{x:.2f}", (bw, 0.2, bh), (x + bw / 2, -0.02, z + 0.015 + bh / 2), rng.choice(colors), g, bevel=0.004, rot=(0, lean, 0))
            x += bw + 0.008 + (0.05 if lean else 0)
    box("Shelf_Console", (0.3, 0.2, 0.08), (0.15, -0.02, 1.56 + 0.04), "ui_dark", g, bevel=0.01)
    box("Shelf_Cart", (0.1, 0.03, 0.12), (-0.25, -0.02, 1.56 + 0.06), "red", g, bevel=0.006)
    return g


def wall_clock(g, loc, rot):
    cylinder("Clock_Rim", 0.2, 0.05, loc, "black", g, verts=24, rot=rot)
    x, y, z = loc
    cylinder("Clock_Face", 0.17, 0.02, (x + 0.02, y, z), "white", g, verts=24, rot=rot)
    box("Clock_HandH", (0.012, 0.012, 0.1), (x + 0.035, y - 0.02, z + 0.03), "black", g, bevel=0.0, rot=(40, 0, 0))
    box("Clock_HandM", (0.01, 0.01, 0.14), (x + 0.035, y + 0.0, z + 0.06), "black", g, bevel=0.0, rot=(-5, 0, 0))


def calendar(g, loc):
    x, y, z = loc
    box("Cal_Body", (0.01, 0.32, 0.4), (x, y, z), "paper", g, bevel=0.002)
    box("Cal_Head", (0.012, 0.32, 0.08), (x + 0.002, y, z + 0.16), "red", g, bevel=0.0)
    for r in range(4):
        for c in range(5):
            color = "red" if (r, c) in {(1, 3), (2, 1), (3, 4)} else "beige_dark"
            box(f"Cal_Day{r}{c}", (0.013, 0.045, 0.045), (x + 0.004, y - 0.12 + c * 0.06, z + 0.07 - r * 0.07), color, g, bevel=0.0)


def cork_board(g, loc):
    x, y, z = loc
    box("Cork_Frame", (0.04, 0.95, 0.65), (x, y, z), "wood_dark", g, bevel=0.008)
    box("Cork_Board", (0.045, 0.87, 0.57), (x + 0.004, y, z), "cork", g, bevel=0.0)
    pins = []
    for i in range(8):
        py = y - 0.35 + (i % 4) * 0.23 + rng.uniform(-0.03, 0.03)
        pz = z + (0.13 if i < 4 else -0.12) + rng.uniform(-0.04, 0.04)
        sticky(g, (x + 0.03, py, pz), (90, 0, 90 + rng.uniform(-12, 12)), rng.choice(["yellow", "paper", "pink", "mint"]))
        sphere(f"Pin{i}", 0.012, (x + 0.04, py, pz + 0.03), "red", g, segments=6, rings=4)
        pins.append((x + 0.04, py, pz + 0.03))
    for i in range(len(pins) - 1):
        if i % 2 == 0:
            cable(f"String{i}", [pins[i], ((pins[i][0] + 0.01), (pins[i][1] + pins[i + 1][1]) / 2, (pins[i][2] + pins[i + 1][2]) / 2 - 0.02), pins[i + 1]], 0.003, "red", g)


def game_poster(g, loc):
    x, y, z = loc
    box("Poster_Frame", (0.7, 0.03, 0.9), (x, y, z), "ui_dark", g, bevel=0.006)
    box("Poster_Bg", (0.62, 0.032, 0.82), (x, y - 0.002, z), "navy", g, bevel=0.0)
    blob = [
        "..XXXX..",
        ".XXXXXX.",
        "XX.XX.XX",
        "XXXXXXXX",
        ".X.XX.X.",
        "X......X",
    ]
    px = 0.055
    for r, row in enumerate(blob):
        for c, ch in enumerate(row):
            if ch == "X":
                box(f"Px{r}{c}", (px, 0.036, px), (x - 3.5 * px + c * px, y - 0.004, z + 0.2 - r * px), "yellow", g, bevel=0.0)
    for i in range(3):
        box(f"Poster_Title{i}", (0.12 + i * 0.05, 0.036, 0.03), (x, y - 0.004, z - 0.22 - i * 0.05), "coral", g, bevel=0.0)


def blinds_window(g, loc, width=1.2, height=1.0):
    x, y, z = loc
    box("Win_Frame", (width + 0.1, 0.1, height + 0.1), (x, y, z), "trim", g, bevel=0.01)
    box("Win_Night", (width, 0.11, height), (x, y + 0.004, z), material("night", emission=0.6), g, bevel=0.0)
    for i in range(3):
        sphere(f"Win_Star{i}", 0.012, (x - 0.4 + i * 0.35, y - 0.06, z + 0.3 - i * 0.12), material("white", emission=4), g, segments=6, rings=4)
    slats = 11
    for i in range(slats):
        sz = z + height / 2 - 0.06 - i * (height * 0.62 / slats)
        box(f"Win_Slat{i}", (width - 0.02, 0.07, 0.012), (x, y - 0.07, sz), "beige", g, bevel=0.0, rot=(25, 0, 0))
    box("Win_Rail", (width + 0.04, 0.08, 0.04), (x, y - 0.07, z + height / 2 + 0.01), "beige", g, bevel=0.006)
    box("Win_Sill", (width + 0.2, 0.16, 0.04), (x, y - 0.08, z - height / 2 - 0.03), "trim", g, bevel=0.008)
    cylinder("Win_Cord", 0.004, 0.5, (x + width / 2 - 0.06, y - 0.11, z + 0.15), "beige_dark", g, verts=6)


def floor_clutter(g, area):
    (x0, x1), (y0, y1) = area
    for i in range(14):
        x, y = rng.uniform(x0, x1), rng.uniform(y0, y1)
        box(f"Floor_Paper{i}", (0.21, 0.29, 0.004), (x, y, 0.003 + i * 0.0005), "paper", g, bevel=0.0, rot=(rng.uniform(-3, 3), rng.uniform(-3, 3), rng.uniform(0, 180)))
    for i in range(6):
        crumple(f"Floor_Ball{i}", 0.045, (rng.uniform(x0, x1), rng.uniform(y0, y1), 0.04), "paper", g)
