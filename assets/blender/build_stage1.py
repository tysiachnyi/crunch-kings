import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "blender"))

from kit import props  # noqa: E402
from kit.characters import STYLES, character  # noqa: E402
from kit.core import box, group, rng  # noqa: E402
from kit.stage import add_light, build_room, export, finish, reset, setup_close_camera, setup_iso_camera, workstation  # noqa: E402

ROOM = 5.0
HALF = ROOM / 2


def build_scene():
    room = build_room(ROOM, ROOM)
    props.blinds_window(group("Window", room, (1.45, HALF - 0.02, 1.65)), (0, 0, 0))
    deco = group("WallDeco", room)
    props.game_poster(deco, (-1.35, HALF - 0.03, 1.75))
    props.cork_board(deco, (-HALF + 0.04, 0.7, 1.75))
    props.wall_clock(deco, (-HALF + 0.05, -1.3, 2.05), (0, 90, 0))
    props.calendar(deco, (-HALF + 0.03, -0.55, 1.6))
    for i in range(6):
        props.sticky(deco, (-HALF + 0.035, -0.95 + rng.uniform(-0.15, 0.15), 1.35 + rng.uniform(-0.15, 0.2)), (90, 0, 90 + rng.uniform(-15, 15)))
    box("Room_Rug", (2.0, 1.4, 0.015), (0.65, 0.5, 0.008), "navy", room, bevel=0.0)
    box("Room_RugIn", (1.8, 1.2, 0.017), (0.65, 0.5, 0.009), "blue", room, bevel=0.0)

    workstation(1, (-2.05, 0.55), 90, "dev", "red")
    workstation(2, (0.75, 1.35), 180, "art", "blue")

    props.water_cooler("Cooler_01", None, (2.05, 2.1, 0), -20)
    props.big_plant("Plant_01", None, (-2.05, 2.05, 0), 0)
    props.bookshelf("Shelf_01", None, (-0.55, HALF - 0.17, 0), 0)
    props.trash_bin("Bin_01", None, (-1.05, -0.65, 0))
    props.pizza_box("Pizza_01", None, (0.35, -0.6, 0), 25)
    props.cardboard_box("Box_01", None, (-1.7, -1.75, 0), 10, (0.55, 0.45, 0.42))
    props.cardboard_box("Box_02", None, (-1.65, -1.72, 0.42), -5, (0.45, 0.38, 0.3))
    props.cardboard_box("Box_03", None, (-0.95, -1.95, 0), 30, (0.5, 0.42, 0.36), open_flaps=True)
    props.cardboard_box("Box_04", None, (1.9, 1.25, 0), -12, (0.42, 0.36, 0.3))
    clutter = group("Clutter")
    props.floor_clutter(clutter, ((-1.2, 1.3), (-1.6, 0.4)))
    props.can(clutter, (0.8, -0.9, 0), "green")
    props.can(clutter, (0.95, -0.82, 0), "coral")
    props.paper_stack(clutter, (-0.3, -1.2, 0), 8, 20)


def lights():
    add_light("Key", "AREA", (0.6, -0.4, 4.6), 900, (1.0, 0.8, 0.6), size=3.5, target=(0, 0.3, 0))
    add_light("Rim", "AREA", (4.0, -4.0, 3.5), 250, (0.75, 0.8, 1.0), size=3.0, target=(0, 0, 0.8))
    add_light("Window", "AREA", (1.45, HALF - 0.3, 1.7), 60, (0.55, 0.65, 1.0), size=1.0, target=(1.45, 0, 1.0))
    add_light("DeskLamp", "POINT", (0.25, 1.17, 1.05), 40, (1.0, 0.75, 0.45), size=0.1)
    add_light("Screen1", "POINT", (-1.8, 0.4, 1.05), 8, (0.5, 0.85, 1.0), size=0.2)
    add_light("Screen2", "POINT", (0.9, 1.6, 1.05), 8, (0.5, 0.85, 1.0), size=0.2)


def populate():
    import bpy
    for seat, key in (("Seat_01", "founder_coder"), ("Seat_02", "maggie")):
        character(f"Preview_{seat}", bpy.data.objects[seat], (0, 0, 0), 0, STYLES[key], "sit")


def main():
    reset()
    build_scene()
    finish()
    lights()
    iso = setup_iso_camera(8.4)
    close = setup_close_camera((2.3, -0.3, 1.75), (0.75, 1.75, 1.0))
    export("stage1", [("", iso), ("_closeup", close)], populate)


main()
