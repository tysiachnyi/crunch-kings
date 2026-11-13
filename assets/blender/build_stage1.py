import math
import os
import sys

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "blender"))

from kit import props  # noqa: E402
from kit.characters import STYLES, character  # noqa: E402
from kit.core import PALETTE, box, cable, group, hex_rgba, join_all, look_at, material, rng  # noqa: E402

BLEND_PATH = os.path.join(ROOT, "blender", "stage1.blend")
GLB_PATH = os.path.join(ROOT, "public", "models", "stage1.glb")
RENDER_ISO = os.path.join(ROOT, "renders", "stage1.png")
RENDER_CLOSE = os.path.join(ROOT, "renders", "stage1_closeup.png")

ROOM = 5.0
HALF = ROOM / 2
WALL_H = 2.8
WAINSCOT_H = 0.95


def build_room():
    room = group("Room")
    box("Room_Base", (ROOM + 0.3, ROOM + 0.3, 0.25), (0, 0, -0.2), "ui_dark", room, bevel=0.04)
    plank_w = 0.25
    for i in range(int(ROOM / plank_w)):
        x = -HALF + plank_w * (i + 0.5)
        seg = rng.uniform(1.2, 2.4)
        box(f"Room_PlankA{i}", (plank_w - 0.008, seg, 0.08), (x, -HALF + seg / 2, -0.04), "floor_a" if i % 2 else "floor_b", room, bevel=0.004)
        rest = ROOM - seg
        box(f"Room_PlankB{i}", (plank_w - 0.008, rest - 0.008, 0.08), (x, HALF - rest / 2, -0.04), "floor_b" if i % 2 else "floor_a", room, bevel=0.004)

    t = 0.15
    box("Room_WallBack", (ROOM + t, t, WALL_H), (-t / 2, HALF + t / 2, WALL_H / 2), "wall_top", room, bevel=0.0)
    box("Room_WallLeft", (t, ROOM, WALL_H), (-HALF - t / 2, 0, WALL_H / 2), "wall_top", room, bevel=0.0)
    box("Room_WainBack", (ROOM, 0.03, WAINSCOT_H), (0, HALF - 0.015, WAINSCOT_H / 2), "wall_low", room, bevel=0.0)
    box("Room_WainLeft", (0.03, ROOM, WAINSCOT_H), (-HALF + 0.015, 0, WAINSCOT_H / 2), "wall_low", room, bevel=0.0)
    box("Room_RailBack", (ROOM, 0.05, 0.05), (0, HALF - 0.025, WAINSCOT_H), "trim", room, bevel=0.01)
    box("Room_RailLeft", (0.05, ROOM, 0.05), (-HALF + 0.025, 0, WAINSCOT_H), "trim", room, bevel=0.01)
    box("Room_BaseBack", (ROOM, 0.05, 0.1), (0, HALF - 0.025, 0.05), "baseboard", room, bevel=0.005)
    box("Room_BaseLeft", (0.05, ROOM, 0.1), (-HALF + 0.025, 0, 0.05), "baseboard", room, bevel=0.005)
    box("Room_CapBack", (ROOM + t + 0.02, t + 0.04, 0.05), (-t / 2, HALF + t / 2, WALL_H), "trim", room, bevel=0.01)
    box("Room_CapLeft", (t + 0.04, ROOM, 0.05), (-HALF - t / 2, 0, WALL_H), "trim", room, bevel=0.01)

    pipe_y = HALF - 0.08
    cable("Room_PipeBack", [(-HALF, pipe_y, 2.45), (0.4, pipe_y, 2.45), (0.5, pipe_y, 2.4), (0.5, pipe_y, 0.0)], 0.04, "beige", room)
    box("Room_PipeClamp", (0.12, 0.06, 0.04), (0.5, pipe_y + 0.02, 1.6), "beige_dark", room, bevel=0.005)
    box("Room_Outlet", (0.1, 0.02, 0.14), (-1.0, HALF - 0.04, 0.35), "white", room, bevel=0.006)
    box("Room_OutletL", (0.02, 0.1, 0.14), (-HALF + 0.04, 0.0, 0.35), "white", room, bevel=0.006)

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
    return room


def workstation(name, loc, rot_z, kind, style, chair_color):
    station = group(name, None, loc, rot_z)
    d = props.desk(f"Desk_{name[-2:]}", station, (0, 0, 0), 0)
    props.workstation_props(d, kind)
    props.office_chair(f"Chair_{name[-2:]}", station, (0, -0.72, 0), 180, chair_color)
    character(f"Dev_{name[-2:]}", station, (0, -0.7, 0), 180, STYLES[style], "sit")
    cable(f"{name}_Cable", [(-0.4, 0.3, 0.3), (-0.5, 0.45, 0.02), (-0.7, 0.6, 0.02), (-0.9, 0.7, 0.3)], 0.012, "mustard", d)
    return station


def build_scene():
    build_room()
    workstation("Station_01", (-2.05, 0.55), 90, "dev", "coder", "red")
    workstation("Station_02", (0.75, 1.35), 180, "art", "artist", "blue")
    character("Dev_03", None, (1.85, -0.15, 0), 35, STYLES["producer"], "stand")

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


def setup_world():
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    mix = nt.nodes.new("ShaderNodeMixShader")
    path = nt.nodes.new("ShaderNodeLightPath")
    ambient = nt.nodes.new("ShaderNodeBackground")
    ambient.inputs["Color"].default_value = hex_rgba("#6A5C9A")
    ambient.inputs["Strength"].default_value = 0.35
    backdrop = nt.nodes.new("ShaderNodeBackground")
    backdrop.inputs["Color"].default_value = hex_rgba(PALETTE["backdrop"])
    backdrop.inputs["Strength"].default_value = 1.0
    nt.links.new(path.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(ambient.outputs["Background"], mix.inputs[1])
    nt.links.new(backdrop.outputs["Background"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])


def add_light(name, kind, loc, energy, color, size=None, target=None):
    data = bpy.data.lights.new(name, kind)
    data.energy = energy
    data.color = color
    if size is not None:
        if kind == "AREA":
            data.size = size
        else:
            data.shadow_soft_size = size
    obj = bpy.data.objects.new(name, data)
    obj.location = loc
    bpy.context.scene.collection.objects.link(obj)
    if target:
        look_at(obj, target)
    return obj


def setup_lights():
    add_light("Key", "AREA", (0.6, -0.4, 4.6), 900, (1.0, 0.8, 0.6), size=3.5, target=(0, 0.3, 0))
    add_light("Rim", "AREA", (4.0, -4.0, 3.5), 250, (0.75, 0.8, 1.0), size=3.0, target=(0, 0, 0.8))
    add_light("Window", "AREA", (1.45, HALF - 0.3, 1.7), 60, (0.55, 0.65, 1.0), size=1.0, target=(1.45, 0, 1.0))
    add_light("DeskLamp", "POINT", (0.25, 1.17, 1.05), 40, (1.0, 0.75, 0.45), size=0.1)
    add_light("Screen1", "POINT", (-1.8, 0.4, 1.05), 8, (0.5, 0.85, 1.0), size=0.2)
    add_light("Screen2", "POINT", (0.9, 1.6, 1.05), 8, (0.5, 0.85, 1.0), size=0.2)


def setup_cameras():
    iso = bpy.data.cameras.new("IsoCamera")
    iso.type = "ORTHO"
    iso.ortho_scale = 8.4
    cam = bpy.data.objects.new("IsoCamera", iso)
    cam.rotation_euler = (math.radians(60), 0, math.radians(45))
    cam.location = (15.3, -15.3, 13.7)
    bpy.context.scene.collection.objects.link(cam)

    close = bpy.data.cameras.new("CloseCamera")
    close.lens = 50
    close.dof.use_dof = True
    close.dof.aperture_fstop = 1.6
    closeup = bpy.data.objects.new("CloseCamera", close)
    closeup.location = (2.3, -0.3, 1.75)
    focus = Vector((0.75, 2.05, 1.2))
    look_at(closeup, (0.75, 1.75, 1.0))
    close.dof.focus_distance = (closeup.location - focus).length
    bpy.context.scene.collection.objects.link(closeup)
    return cam, closeup


def setup_render():
    scene = bpy.context.scene
    for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            scene.render.engine = engine
            break
        except TypeError:
            continue
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1200
    scene.view_settings.view_transform = "AgX"
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    eevee = scene.eevee
    if hasattr(eevee, "taa_render_samples"):
        eevee.taa_render_samples = 96
    if hasattr(eevee, "use_raytracing"):
        eevee.use_raytracing = True
    if hasattr(eevee, "fast_gi_method"):
        eevee.use_fast_gi = True


def render(camera, path):
    scene = bpy.context.scene
    scene.camera = camera
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_scene()
    join_all()
    setup_world()
    setup_lights()
    iso, closeup = setup_cameras()
    setup_render()

    os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(RENDER_ISO), exist_ok=True)
    bpy.context.scene.camera = iso
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format="GLB",
        export_apply=True,
        export_cameras=False,
        export_lights=False,
        export_yup=True,
    )
    if "--no-render" not in sys.argv:
        render(iso, RENDER_ISO)
        render(closeup, RENDER_CLOSE)


main()
