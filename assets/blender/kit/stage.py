import math
import os
import sys

import bpy
from mathutils import Vector

from . import props
from .core import PALETTE, box, cable, group, hex_rgba, join_all, look_at, rng

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WALL_H = 2.8
WAINSCOT_H = 0.95


def build_room(width, depth, floor=("floor_a", "floor_b"), wall=("wall_top", "wall_low"), carpet=None):
    hw, hd = width / 2, depth / 2
    room = group("Room")
    box("Room_Base", (width + 0.3, depth + 0.3, 0.25), (0, 0, -0.2), "ui_dark", room, bevel=0.04)
    if carpet:
        box("Room_Carpet", (width, depth, 0.08), (0, 0, -0.04), carpet, room, bevel=0.004)
        tile = 0.5
        for i in range(int(width / tile)):
            for j in range(int(depth / tile)):
                if (i + j) % 2 == 0:
                    box(f"Room_Tile{i}_{j}", (tile - 0.01, tile - 0.01, 0.004), (-hw + tile * (i + 0.5), -hd + tile * (j + 0.5), 0.002), carpet + "_dark", room, bevel=0.0)
    else:
        plank_w = 0.25
        for i in range(int(width / plank_w)):
            x = -hw + plank_w * (i + 0.5)
            seg = rng.uniform(1.2, depth - 1.2)
            box(f"Room_PlankA{i}", (plank_w - 0.008, seg, 0.08), (x, -hd + seg / 2, -0.04), floor[i % 2], room, bevel=0.004)
            rest = depth - seg
            box(f"Room_PlankB{i}", (plank_w - 0.008, rest - 0.008, 0.08), (x, hd - rest / 2, -0.04), floor[(i + 1) % 2], room, bevel=0.004)

    t = 0.15
    top, low = wall
    box("Room_WallBack", (width + t, t, WALL_H), (-t / 2, hd + t / 2, WALL_H / 2), top, room, bevel=0.0)
    box("Room_WallLeft", (t, depth, WALL_H), (-hw - t / 2, 0, WALL_H / 2), top, room, bevel=0.0)
    box("Room_WainBack", (width, 0.03, WAINSCOT_H), (0, hd - 0.015, WAINSCOT_H / 2), low, room, bevel=0.0)
    box("Room_WainLeft", (0.03, depth, WAINSCOT_H), (-hw + 0.015, 0, WAINSCOT_H / 2), low, room, bevel=0.0)
    box("Room_RailBack", (width, 0.05, 0.05), (0, hd - 0.025, WAINSCOT_H), "trim", room, bevel=0.01)
    box("Room_RailLeft", (0.05, depth, 0.05), (-hw + 0.025, 0, WAINSCOT_H), "trim", room, bevel=0.01)
    box("Room_BaseBack", (width, 0.05, 0.1), (0, hd - 0.025, 0.05), "baseboard", room, bevel=0.005)
    box("Room_BaseLeft", (0.05, depth, 0.1), (-hw + 0.025, 0, 0.05), "baseboard", room, bevel=0.005)
    box("Room_CapBack", (width + t + 0.02, t + 0.04, 0.05), (-t / 2, hd + t / 2, WALL_H), "trim", room, bevel=0.01)
    box("Room_CapLeft", (t + 0.04, depth, 0.05), (-hw - t / 2, 0, WALL_H), "trim", room, bevel=0.01)
    return room


def workstation(index, loc, rot_z, kind, chair_color):
    nn = f"{index:02d}"
    station = group(f"Station_{nn}", None, loc, rot_z)
    d = props.desk(f"Desk_{nn}", station, (0, 0, 0), 0)
    props.workstation_props(d, kind)
    props.office_chair(f"Chair_{nn}", station, (0, -0.72, 0), 180, chair_color)
    group(f"Seat_{nn}", station, (0, -0.7, 0), 180)
    cable(f"Station_{nn}_Cable", [(-0.4, 0.3, 0.3), (-0.5, 0.45, 0.02), (-0.7, 0.6, 0.02), (-0.9, 0.7, 0.3)], 0.012, "mustard", d)
    return station


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


def setup_iso_camera(ortho_scale):
    iso = bpy.data.cameras.new("IsoCamera")
    iso.type = "ORTHO"
    iso.ortho_scale = ortho_scale
    cam = bpy.data.objects.new("IsoCamera", iso)
    cam.rotation_euler = (math.radians(60), 0, math.radians(45))
    cam.location = (15.3, -15.3, 13.7)
    bpy.context.scene.collection.objects.link(cam)
    return cam


def setup_close_camera(location, target):
    close = bpy.data.cameras.new("CloseCamera")
    close.lens = 50
    close.dof.use_dof = True
    close.dof.aperture_fstop = 1.6
    cam = bpy.data.objects.new("CloseCamera", close)
    cam.location = location
    look_at(cam, target)
    close.dof.focus_distance = (cam.location - Vector(target)).length
    bpy.context.scene.collection.objects.link(cam)
    return cam


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


def export(name, cameras, before_render=None):
    blend_path = os.path.join(ROOT, "blender", f"{name}.blend")
    glb_path = os.path.join(ROOT, "public", "models", f"{name}.glb")
    os.makedirs(os.path.dirname(glb_path), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "renders"), exist_ok=True)
    bpy.context.scene.camera = cameras[0][1]
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format="GLB",
        export_apply=True,
        export_cameras=False,
        export_lights=False,
        export_yup=True,
    )
    if "--no-render" in sys.argv:
        return
    if before_render:
        before_render()
    for suffix, cam in cameras:
        render(cam, os.path.join(ROOT, "renders", f"{name}{suffix}.png"))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def finish():
    join_all()
    setup_world()
    setup_render()
