import math
import random

import bpy
from mathutils import Vector

PALETTE = {
    "backdrop": "#1C1A26",
    "floor_a": "#C98F5E",
    "floor_b": "#B97F50",
    "wall_top": "#F2D3A8",
    "wall_low": "#C8643B",
    "baseboard": "#7A3B22",
    "trim": "#F6E7D0",
    "wood": "#B8693A",
    "wood_dark": "#8A4A27",
    "beige": "#E8DCC0",
    "beige_dark": "#C9BC9C",
    "screen": "#7FD6FF",
    "screen_code": "#B8FFCF",
    "ui_dark": "#2B2540",
    "metal": "#5A5670",
    "coral": "#FF7A59",
    "red": "#D9443A",
    "yellow": "#FFD166",
    "mustard": "#E8B23A",
    "blue": "#5B8DEF",
    "navy": "#2F4A8A",
    "mint": "#8FD3C6",
    "leaf": "#4FA85A",
    "leaf_light": "#7CCB6B",
    "cardboard": "#C89A63",
    "tape": "#E3C48F",
    "paper": "#F7F3EA",
    "cork": "#C79A6A",
    "black": "#1E1A2B",
    "white": "#FFFFFF",
    "water": "#7FB8FF",
    "pink": "#FF9EB5",
    "green": "#3FBF6F",
    "night": "#24305C",
    "pizza": "#F2B25C",
    "sauce": "#C9442E",
    "skin_a": "#F6C9A0",
    "skin_b": "#C98B5E",
    "skin_c": "#8D5A3B",
    "hair_brown": "#4A2F23",
    "hair_black": "#1F1B24",
    "hair_ginger": "#C8582A",
    "hair_purple": "#7A4FC9",
    "denim": "#3D5A8C",
    "pants_dark": "#3A3548",
    "shoe": "#F2EDE4",
    "shoe_dark": "#2B2540",
}

rng = random.Random(7)


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(hex_color):
    h = hex_color.lstrip("#")
    return tuple(srgb_to_linear(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1.0,)


_materials = {}


def material(name, emission=0.0, alpha=1.0, roughness=0.8):
    key = (name, emission, alpha)
    if key in _materials:
        return _materials[key]
    suffix = ("_emit" if emission else "") + ("_alpha" if alpha < 1 else "")
    mat = bpy.data.materials.new(f"M_{name}{suffix}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    color = hex_rgba(PALETTE[name])
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.25
    if emission:
        bsdf.inputs["Emission Color"].default_value = color
        bsdf.inputs["Emission Strength"].default_value = emission
    if alpha < 1:
        bsdf.inputs["Alpha"].default_value = alpha
        if hasattr(mat, "surface_render_method"):
            mat.surface_render_method = "BLENDED"
        if hasattr(mat, "blend_method"):
            mat.blend_method = "BLEND"
    mat.diffuse_color = color
    _materials[key] = mat
    return mat


def group(name, parent=None, loc=(0, 0, 0), rot_z=0.0):
    empty = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(empty)
    empty.parent = parent
    empty.location = tuple(loc) + (0,) * (3 - len(loc))
    empty.rotation_euler = (0, 0, math.radians(rot_z))
    return empty


def _finish(obj, name, mat, parent, bevel, smooth, rot):
    obj.name = name
    obj.data.materials.append(mat if not isinstance(mat, str) else material(mat))
    if rot:
        obj.rotation_euler = tuple(math.radians(r) for r in rot)
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 8 if bevel >= 0.05 else 4 if bevel >= 0.015 else 2
        mod.limit_method = "ANGLE"
        mod.harden_normals = True
        smooth = True
    for poly in obj.data.polygons:
        poly.use_smooth = smooth
    obj.parent = parent
    return obj


def _apply_scale(obj, scale):
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def box(name, size, loc, mat, parent=None, bevel=0.01, rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    _apply_scale(obj, size)
    return _finish(obj, name, mat, parent, bevel, False, rot)


def cylinder(name, radius, depth, loc, mat, parent=None, verts=16, rot=None, bevel=0.005, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc)
    obj = bpy.context.active_object
    if scale != (1, 1, 1):
        _apply_scale(obj, scale)
    return _finish(obj, name, mat, parent, bevel, True, rot)


def cone(name, r1, r2, depth, loc, mat, parent=None, verts=16, rot=None):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc)
    return _finish(bpy.context.active_object, name, mat, parent, 0.004, True, rot)


def sphere(name, radius, loc, mat, parent=None, scale=(1, 1, 1), segments=16, rings=10, rot=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=loc)
    obj = bpy.context.active_object
    _apply_scale(obj, scale)
    return _finish(obj, name, mat, parent, 0.0, True, rot)


def torus(name, major, minor, loc, mat, parent=None, rot=None, major_seg=24, minor_seg=8):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major, minor_radius=minor, location=loc,
        major_segments=major_seg, minor_segments=minor_seg,
    )
    return _finish(bpy.context.active_object, name, mat, parent, 0.0, True, rot)


def crumple(name, radius, loc, mat, parent=None):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=radius, location=loc)
    obj = bpy.context.active_object
    for v in obj.data.vertices:
        v.co *= 0.75 + rng.random() * 0.5
    return _finish(obj, name, mat, parent, 0.0, False, None)


def cable(name, points, radius, mat, parent=None):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new("NURBS")
    spline.points.add(len(points) - 1)
    for p, co in zip(spline.points, points):
        p.co = (*co, 1.0)
    spline.use_endpoint_u = True
    spline.order_u = 3
    spline.resolution_u = 8
    obj = bpy.data.objects.new(name, curve)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(material(mat))
    obj.parent = parent
    return obj


def join_children(empty):
    meshes = [c for c in empty.children if c.type in {"MESH", "CURVE"}]
    if not meshes:
        return None
    bpy.ops.object.select_all(action="DESELECT")
    for m in meshes:
        m.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.convert(target="MESH")
    if len(meshes) > 1:
        bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = f"{empty.name}_Mesh"
    return joined


def join_all():
    empties = [o for o in bpy.context.scene.objects if o.type == "EMPTY"]
    for empty in empties:
        join_children(empty)


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
