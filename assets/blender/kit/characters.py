from .core import box, cylinder, group, material, sphere, torus

HEAD_W, HEAD_D, HEAD_H = 0.36, 0.32, 0.34


def _head(g, s, z):
    box("Head", (HEAD_W, HEAD_D, HEAD_H), (0, 0, z), s["skin"], g, bevel=0.09)
    sphere("EarL", 0.045, (-HEAD_W / 2 + 0.005, 0.02, z - 0.01), s["skin"], g, scale=(0.6, 0.8, 1.0), segments=16, rings=10)
    sphere("EarR", 0.045, (HEAD_W / 2 - 0.005, 0.02, z - 0.01), s["skin"], g, scale=(0.6, 0.8, 1.0), segments=16, rings=10)
    face_y = -HEAD_D / 2
    for side, sx in (("L", -1), ("R", 1)):
        cylinder(f"EyeWhite{side}", 0.042, 0.01, (sx * 0.075, face_y - 0.002, z + 0.01), "white", g, verts=16, rot=(90, 0, 0), bevel=0.0, scale=(1, 1.15, 1))
        cylinder(f"Pupil{side}", 0.026, 0.01, (sx * 0.072, face_y - 0.007, z + 0.004), "black", g, verts=12, rot=(90, 0, 0), bevel=0.0, scale=(1, 1.2, 1))
        cylinder(f"Shine{side}", 0.008, 0.01, (sx * 0.064, face_y - 0.011, z + 0.017), "white", g, verts=8, rot=(90, 0, 0), bevel=0.0)
        box(f"Brow{side}", (0.07, 0.012, 0.016), (sx * 0.075, face_y - 0.004, z + 0.075), s["hair"], g, bevel=0.004, rot=(0, sx * -s.get("brow_tilt", 6), 0))
        sphere(f"Cheek{side}", 0.025, (sx * 0.115, face_y + 0.003, z - 0.05), "pink", g, scale=(1, 0.3, 0.6), segments=10, rings=6)
    sphere("Nose", 0.026, (0, face_y - 0.004, z - 0.025), s["skin"], g, scale=(1.0, 0.8, 0.9), segments=16, rings=10)
    mouth = s.get("mouth", "smile")
    if mouth == "smile":
        smile = torus("Mouth", 0.03, 0.008, (0, face_y - 0.002, z - 0.06), "black", g, rot=(90, 0, 0), major_seg=16, minor_seg=6)
        _keep_lower_half(smile)
    else:
        box("Mouth", (0.06, 0.01, 0.012), (0, face_y - 0.002, z - 0.085), "black", g, bevel=0.004)


def _keep_lower_half(obj):
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > 0.004], context="VERTS")
    bm.to_mesh(obj.data)
    bm.free()


def _keep_upper_half(obj):
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y < -0.01], context="VERTS")
    bm.to_mesh(obj.data)
    bm.free()


def _hair(g, s, z):
    style = s["hair_style"]
    color = s["hair"]
    top = z + HEAD_H / 2
    if style == "messy":
        box("Hair_Cap", (HEAD_W + 0.03, HEAD_D + 0.03, 0.13), (0, 0.01, top - 0.02), color, g, bevel=0.05)
        box("Hair_Back", (HEAD_W + 0.03, 0.08, 0.24), (0, HEAD_D / 2 - 0.01, z + 0.05), color, g, bevel=0.035)
        for i, (x, rz, ry) in enumerate([(-0.12, 20, -25), (-0.03, -10, 15), (0.07, 15, -10), (0.14, -25, 30)]):
            box(f"Hair_Tuft{i}", (0.09, 0.08, 0.11), (x, -HEAD_D / 2 + 0.03, top - 0.05), color, g, bevel=0.03, rot=(-25, ry, rz))
        box("Hair_Spike", (0.07, 0.07, 0.12), (0.04, 0.02, top + 0.06), color, g, bevel=0.025, rot=(15, 20, 30))
    elif style == "bun":
        box("Hair_Cap", (HEAD_W + 0.03, HEAD_D + 0.03, 0.12), (0, 0.01, top - 0.02), color, g, bevel=0.05)
        box("Hair_Back", (HEAD_W + 0.03, 0.09, 0.3), (0, HEAD_D / 2 - 0.015, z + 0.02), color, g, bevel=0.04)
        box("Hair_Fringe", (HEAD_W + 0.02, 0.08, 0.08), (0.02, -HEAD_D / 2 + 0.03, top - 0.05), color, g, bevel=0.03, rot=(0, -8, 0))
        sphere("Hair_Bun", 0.1, (0, 0.06, top + 0.07), color, g, segments=12, rings=8)
    elif style == "beanie":
        box("Beanie", (HEAD_W + 0.04, HEAD_D + 0.04, 0.17), (0, 0, top - 0.02), s["accent"], g, bevel=0.06)
        box("Beanie_Cuff", (HEAD_W + 0.06, HEAD_D + 0.06, 0.06), (0, 0, top - 0.09), s["accent2"], g, bevel=0.025)
        sphere("Beanie_Pom", 0.05, (0, 0, top + 0.08), s["accent2"], g, segments=10, rings=6)
        box("Hair_Side", (HEAD_W + 0.03, 0.08, 0.12), (0, HEAD_D / 2 - 0.02, z - 0.03), color, g, bevel=0.03)


def _headphones(g, z, color):
    band = torus("Phones_Band", HEAD_W / 2 + 0.035, 0.016, (0, 0.0, z + 0.02), color, g, rot=(90, 0, 0), major_seg=24, minor_seg=6)
    _keep_upper_half(band)
    for side, sx in (("L", -1), ("R", 1)):
        cylinder(f"Phones_Cup{side}", 0.07, 0.05, (sx * (HEAD_W / 2 + 0.03), 0.01, z - 0.01), color, g, verts=16, rot=(0, 90, 0), bevel=0.012)
        cylinder(f"Phones_Pad{side}", 0.055, 0.02, (sx * (HEAD_W / 2 + 0.06), 0.01, z - 0.01), "coral", g, verts=16, rot=(0, 90, 0), bevel=0.006)


def _glasses(g, z):
    y = -HEAD_D / 2 - 0.02
    for side, sx in (("L", -1), ("R", 1)):
        torus(f"Glass{side}", 0.052, 0.008, (sx * 0.075, y, z + 0.008), "black", g, rot=(90, 0, 0), major_seg=16, minor_seg=4)
    box("Glass_Bridge", (0.05, 0.01, 0.01), (0, y, z + 0.02), "black", g, bevel=0.0)


def _torso(g, s, z_hip, lean=0):
    box("Torso", (0.36, 0.24, 0.34), (0, 0.01, z_hip + 0.2), s["top"], g, bevel=0.07, rot=(lean, 0, 0))
    box("Hood", (0.3, 0.1, 0.1), (0, 0.11, z_hip + 0.36), s["top"], g, bevel=0.04)
    box("Pocket", (0.2, 0.02, 0.08), (0, -0.11, z_hip + 0.1), s["top_dark"], g, bevel=0.015)
    if s.get("logo"):
        box("Logo", (0.08, 0.02, 0.08), (0.06, -0.115, z_hip + 0.24), s["logo"], g, bevel=0.01)
    cylinder("Neck", 0.055, 0.06, (0, 0.01, z_hip + 0.39), s["skin"], g, verts=12)
    box("Hips", (0.32, 0.22, 0.12), (0, 0.01, z_hip), s["pants"], g, bevel=0.04)


def _arm(g, s, side, shoulder, elbow, hand):
    sx = -1 if side == "L" else 1
    sphere(f"Shoulder{side}", 0.065, shoulder, s["top"], g, segments=12, rings=8)
    _limb(g, f"UpperArm{side}", shoulder, elbow, 0.058, s["top"])
    _limb(g, f"Forearm{side}", elbow, hand, 0.05, s["top"])
    cylinder(f"Cuff{side}", 0.052, 0.03, _lerp(elbow, hand, 0.85), s["top_dark"], g, verts=12, rot=_limb_rot(elbow, hand))
    sphere(f"Hand{side}", 0.052, hand, s["skin"], g, scale=(0.9, 1.05, 0.8), segments=12, rings=8)
    thumb = (hand[0] - sx * 0.04, hand[1] - 0.015, hand[2] + 0.015)
    sphere(f"Thumb{side}", 0.022, thumb, s["skin"], g, segments=8, rings=6)


def _leg(g, s, side, hip, knee, foot):
    _limb(g, f"Thigh{side}", hip, knee, 0.07, s["pants"])
    _limb(g, f"Shin{side}", knee, (foot[0], foot[1], foot[2] + 0.06), 0.062, s["pants"])
    box(f"Shoe{side}", (0.13, 0.22, 0.08), (foot[0], foot[1] - 0.04, foot[2] + 0.04), s["shoes"], g, bevel=0.03)
    box(f"Sole{side}", (0.135, 0.225, 0.025), (foot[0], foot[1] - 0.04, foot[2] + 0.012), "white", g, bevel=0.008)


def _lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def _limb_rot(a, b):
    from mathutils import Vector
    d = Vector(b) - Vector(a)
    q = d.to_track_quat("Z", "Y").to_euler()
    import math
    return tuple(math.degrees(v) for v in q)


def _limb(g, name, a, b, radius, mat):
    from mathutils import Vector
    length = (Vector(b) - Vector(a)).length
    cylinder(name, radius, length + radius * 0.6, _lerp(a, b, 0.5), mat, g, verts=12, rot=_limb_rot(a, b), bevel=radius * 0.45)


def _shift(p, o):
    return (p[0] - o[0], p[1] - o[1], p[2] - o[2])


def character(name, parent, loc, rot_z, style, pose="sit"):
    g = group(name, parent, loc, rot_z)
    s = dict(style)
    s["skin"] = material(style["skin"], emission=0.35, roughness=1.0)
    body = group(f"{name}_Body", g)
    if pose == "sit":
        z_hip = 0.6
        _torso(body, s, z_hip, lean=6)
        for side, sx in (("L", -1), ("R", 1)):
            hip = (sx * 0.09, -0.02, z_hip - 0.02)
            knee = (sx * 0.1, -0.38, z_hip - 0.02)
            foot = (sx * 0.11, -0.42, 0.0)
            _leg(body, s, side, hip, knee, foot)
            shoulder = (sx * 0.2, 0.0, z_hip + 0.31)
            elbow = (sx * 0.24, -0.16, z_hip + 0.16)
            hand = (sx * 0.15, -0.4, z_hip + 0.2)
            arm = group(f"{name}_Arm{side}", g, shoulder)
            _arm(arm, s, side, (0, 0, 0), _shift(elbow, shoulder), _shift(hand, shoulder))
    else:
        z_hip = 0.56
        _torso(body, s, z_hip)
        for side, sx in (("L", -1), ("R", 1)):
            hip = (sx * 0.09, 0.0, z_hip - 0.02)
            knee = (sx * 0.1, -0.01, 0.3)
            foot = (sx * 0.11, 0.02, 0.0)
            _leg(body, s, side, hip, knee, foot)
        _arm(body, s, "L", (-0.2, 0.0, z_hip + 0.31), (-0.25, 0.02, z_hip + 0.1), (-0.25, -0.02, z_hip - 0.06))
        _arm(body, s, "R", (0.2, 0.0, z_hip + 0.31), (0.26, -0.03, z_hip + 0.12), (0.14, -0.2, z_hip + 0.2))
        cylinder("HeldMug", 0.042, 0.1, (0.12, -0.27, z_hip + 0.26), "mint", body, verts=12)
        cylinder("HeldCoffee", 0.036, 0.005, (0.12, -0.27, z_hip + 0.31), "wood_dark", body, verts=12, bevel=0.0)
    neck_z = z_hip + 0.4
    head = group(f"{name}_Head", g, (0, 0, neck_z))
    head_z = z_hip + 0.42 + HEAD_H / 2 - neck_z
    _head(head, s, head_z)
    _hair(head, s, head_z)
    if s.get("headphones"):
        _headphones(head, head_z, s["headphones"])
    if s.get("glasses"):
        _glasses(head, head_z)
    return g


STYLES = {
    "founder_coder": {
        "skin": "skin_a", "hair": "hair_ginger", "hair_style": "messy",
        "top": "navy", "top_dark": "ui_dark", "pants": "pants_dark", "shoes": "red",
        "headphones": "black", "glasses": True, "logo": "yellow", "mouth": "flat", "brow_tilt": -10,
    },
    "founder_designer": {
        "skin": "skin_c", "hair": "hair_black", "hair_style": "messy",
        "top": "coral", "top_dark": "red", "pants": "denim", "shoes": "shoe",
        "glasses": True, "logo": "yellow", "brow_tilt": 4,
    },
    "founder_artist": {
        "skin": "skin_b", "hair": "hair_brown", "hair_style": "bun",
        "top": "leaf", "top_dark": "green", "pants": "pants_dark", "shoes": "red",
        "logo": "yellow",
    },
    "maggie": {
        "skin": "skin_b", "hair": "hair_purple", "hair_style": "bun",
        "top": "mustard", "top_dark": "wood", "pants": "denim", "shoes": "shoe",
        "logo": "coral",
    },
    "danny": {
        "skin": "skin_c", "hair": "hair_black", "hair_style": "beanie",
        "accent": "coral", "accent2": "red",
        "top": "leaf", "top_dark": "green", "pants": "pants_dark", "shoes": "shoe",
        "mouth": "flat", "brow_tilt": 4,
    },
    "roy": {
        "skin": "skin_a", "hair": "hair_brown", "hair_style": "messy",
        "top": "red", "top_dark": "baseboard", "pants": "denim", "shoes": "shoe_dark",
        "headphones": "mustard", "logo": "white",
    },
    "hire_coder": {
        "skin": "skin_b", "hair": "hair_black", "hair_style": "messy",
        "top": "blue", "top_dark": "navy", "pants": "pants_dark", "shoes": "shoe",
        "glasses": True, "mouth": "flat",
    },
    "hire_coder2": {
        "skin": "skin_a", "hair": "hair_brown", "hair_style": "beanie",
        "accent": "navy", "accent2": "blue",
        "top": "beige_dark", "top_dark": "wood", "pants": "denim", "shoes": "red",
    },
    "hire_artist": {
        "skin": "skin_c", "hair": "hair_ginger", "hair_style": "bun",
        "top": "pink", "top_dark": "coral", "pants": "pants_dark", "shoes": "shoe",
        "logo": "white",
    },
    "hire_designer": {
        "skin": "skin_a", "hair": "hair_black", "hair_style": "bun",
        "top": "mint", "top_dark": "leaf", "pants": "denim", "shoes": "shoe_dark",
        "glasses": True,
    },
    "hire_sound": {
        "skin": "skin_b", "hair": "hair_ginger", "hair_style": "messy",
        "top": "ui_dark", "top_dark": "black", "pants": "denim", "shoes": "red",
        "headphones": "coral",
    },
    "hire_writer": {
        "skin": "skin_c", "hair": "hair_brown", "hair_style": "beanie",
        "accent": "mustard", "accent2": "wood",
        "top": "white", "top_dark": "beige_dark", "pants": "pants_dark", "shoes": "shoe",
        "glasses": True, "brow_tilt": -6,
    },
}
