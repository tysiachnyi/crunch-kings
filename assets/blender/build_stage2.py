import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "blender"))

from kit import props  # noqa: E402
from kit.characters import STYLES, character  # noqa: E402
from kit.core import PALETTE, box, cylinder, group, rng  # noqa: E402
from kit.stage import add_light, build_room, export, finish, reset, setup_close_camera, setup_iso_camera, workstation  # noqa: E402

W = 6.4
D = 5.6
HW, HD = W / 2, D / 2

PALETTE.update({
    "carpet": "#8E6B4A",
    "carpet_dark": "#7D5C3E",
    "panel_wood": "#9C5B33",
    "office_wall": "#EBD9B4",
    "rubber": "#3A3548",
})


def build_scene():
    room = build_room(W, D, wall=("office_wall", "panel_wood"), carpet="carpet")
    props.blinds_window(group("Window", room, (0.9, HD - 0.02, 1.65)), (0, 0, 0))
    props.blinds_window(group("Window2", room, (2.3, HD - 0.02, 1.65)), (0, 0, 0))
    deco = group("WallDeco", room)
    props.game_poster(deco, (-0.6, HD - 0.03, 1.75))
    props.game_poster(deco, (-2.2, HD - 0.03, 1.8))
    props.cork_board(deco, (-HW + 0.04, 1.4, 1.75))
    props.wall_clock(deco, (-HW + 0.05, -0.2, 2.1), (0, 90, 0))
    props.calendar(deco, (-HW + 0.03, 0.55, 1.6))
    box("Room_Whiteboard", (0.04, 1.4, 0.9), (-HW + 0.05, -1.5, 1.55), "white", deco, bevel=0.01)
    box("Room_WhiteboardFrame", (0.05, 1.46, 0.96), (-HW + 0.04, -1.5, 1.55), "metal", deco, bevel=0.01)
    for i in range(5):
        box(f"Room_Scribble{i}", (0.01, rng.uniform(0.3, 0.9), 0.03), (-HW + 0.075, -1.5 + rng.uniform(-0.2, 0.2), 1.3 + i * 0.12), rng.choice(["red", "blue", "green"]), deco, bevel=0.0)

    positions = [
        (1, (-1.9, 1.6), 180, "dev", "red"),
        (2, (-0.3, 1.6), 180, "art", "blue"),
        (3, (1.3, 1.6), 180, "dev", "mustard"),
        (4, (-1.9, -0.4), 180, "art", "leaf"),
        (5, (-0.3, -0.4), 180, "dev", "coral"),
        (6, (1.3, -0.4), 180, "art", "navy"),
    ]
    for index, loc, rot, kind, chair in positions:
        workstation(index, loc, rot, kind, chair)

    props.water_cooler("Cooler_01", None, (2.75, 2.35, 0), -20)
    props.big_plant("Plant_01", None, (-2.75, 2.35, 0), 0)
    props.big_plant("Plant_02", None, (2.8, -2.3, 0), 40)
    props.bookshelf("Shelf_01", None, (-HW + 0.18, -0.9, 0), 90)
    props.trash_bin("Bin_01", None, (2.3, 0.6, 0))
    props.pizza_box("Pizza_01", None, (2.4, -1.2, 0), 25)
    props.cardboard_box("Box_01", None, (-2.6, -2.3, 0), 10, (0.55, 0.45, 0.42))
    props.cardboard_box("Box_02", None, (-2.55, -2.25, 0.42), -5, (0.45, 0.38, 0.3))
    sofa = group("Sofa_01", None, (2.55, 1.0, 0), -90)
    box("Sofa_Base", (1.4, 0.7, 0.4), (0, 0, 0.2), "rubber", sofa, bevel=0.06)
    box("Sofa_Seat", (1.3, 0.6, 0.12), (0, -0.03, 0.46), "coral", sofa, bevel=0.05)
    box("Sofa_Back", (1.4, 0.2, 0.5), (0, 0.27, 0.6), "coral", sofa, bevel=0.07)
    for sx in (-1, 1):
        box(f"Sofa_Arm{sx}", (0.18, 0.7, 0.3), (sx * 0.65, 0, 0.55), "coral", sofa, bevel=0.06)
    arcade = group("Arcade_01", None, (2.6, -1.0, 0), 0)
    box("Arcade_Body", (0.6, 0.6, 1.7), (0, 0, 0.85), "navy", arcade, bevel=0.03)
    box("Arcade_Screen", (0.48, 0.05, 0.4), (0, -0.31, 1.25), "screen", arcade, bevel=0.01)
    box("Arcade_Panel", (0.6, 0.3, 0.06), (0, -0.4, 0.95), "black", arcade, bevel=0.01)
    cylinder("Arcade_Stick", 0.02, 0.1, (-0.1, -0.42, 1.02), "red", arcade, verts=8)
    box("Arcade_Marquee", (0.6, 0.06, 0.18), (0, -0.28, 1.6), "yellow", arcade, bevel=0.01)
    clutter = group("Clutter")
    props.floor_clutter(clutter, ((-1.0, 0.6), (0.6, 0.6)))
    props.can(clutter, (0.5, -1.4, 0), "green")
    props.paper_stack(clutter, (-1.2, -1.6, 0), 6, 20)


def lights():
    add_light("Key", "AREA", (0.6, -0.4, 5.0), 1300, (1.0, 0.82, 0.62), size=5.0, target=(0, 0.3, 0))
    add_light("Rim", "AREA", (4.5, -4.5, 3.8), 300, (0.75, 0.8, 1.0), size=3.0, target=(0, 0, 0.8))
    add_light("Window", "AREA", (1.6, HD - 0.3, 1.7), 90, (0.55, 0.65, 1.0), size=2.0, target=(1.6, 0, 1.0))


def populate():
    import bpy
    keys = ["founder_coder", "maggie", "hire_coder", "hire_artist", "hire_sound", "hire_designer"]
    for i, key in enumerate(keys):
        character(f"Preview_{i}", bpy.data.objects[f"Seat_{i + 1:02d}"], (0, 0, 0), 0, STYLES[key], "sit")


def main():
    reset()
    build_scene()
    finish()
    lights()
    iso = setup_iso_camera(10.2)
    close = setup_close_camera((3.0, -2.6, 1.9), (-0.3, 0.6, 0.9))
    export("stage2", [("", iso), ("_closeup", close)], populate)


main()
