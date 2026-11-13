---
name: blender-pipeline
description: Build and change 3D assets for Crunchy Fellos with Blender Python scripts, export them to .glb, and show them in the React Three Fiber scene. Use when you add or edit a prop, character, room or office stage, change materials, lights or the camera, or a model looks wrong in Blender or in the browser.
---

# Blender pipeline

The pipeline is: Python script → Blender (headless) → `.glb` + PNG renders → R3F page. Scripts are the source of truth. Treat `assets/blender/*.blend` as build output. The user can open it to look, but your edits go into the scripts.

## Steps

1. Read `assets/blender/kit/core.py`, then the kit module you will change: `props.py` for props, `characters.py` for people. The stage script (`assets/blender/build_stage1.py`) only places kit parts.
2. Write the change in the kit. Follow the style rules below.
3. Run `pnpm run scene`. It saves the `.blend`, exports `assets/public/models/stage1.glb`, and renders `assets/renders/stage1.png` and `assets/renders/stage1_closeup.png`. To export without renders, run `pnpm run scene -- --no-render`.
4. Read both PNGs. Compare them with the style rules. Fix and run again until every changed part passes.
5. Reload the browser preview (`.claude/launch.json`, server `lab` for the scene viewer or `web` for the game). Make sure the model loads, the console shows no new errors, and a click on each new selectable object opens its panel.

The task is done when the renders and the browser both show the change, and every rule below holds for every changed part.

## Style rules

- **Look:** a warm, cozy, low-poly toon diorama with dense clutter: papers, cables, sticky notes, mugs, cans. An empty room reads as sad. Each surface tells a small story about a game studio in crunch.
- **Palette:** use only the named colors in `PALETTE` (`assets/blender/kit/core.py`). Add a new name there before you use a new color. Use the `material(name, emission, alpha, roughness)` cache. Do not create raw materials.
- **Shapes:** chunky boxes with soft bevels. `box(..., bevel=...)` sets harden normals and smooth shading, and it picks more segments for larger bevels. A low segment count on a large bevel makes visible bands.
- **Characters:** blocky chibi people, about 1.3 m tall, head 0.36 m wide. Every skin part (head, nose, ears, neck, hands) has ONE even tone. `character()` gives skin a matte material with emission 0.35. Make face parts smooth spheres or discs. Do not put a skin-colored box on the face to hide geometry, because it shows as a patch. To cut geometry, use bmesh (see `_keep_lower_half`). For a new look, add an entry to `STYLES`.
- **Scale and axes:** 1 unit = 1 m. Z is up in Blender. The glTF export makes Y up, so a Blender point `(x, y, z)` is `(x, z, -y)` in three.js. Use this mapping for every light or camera that you copy to `packages/scene/src`.
- **Camera:** a fixed isometric orthographic camera. Its rotation is (60°, 0, 45°) and it looks toward −X+Y. The visible walls are at −X (left) and +Y (right). A character must face −Y or +X to show its face to the camera.

## Names and grouping

- Every logical object is an empty with a name like `Prefix_NN` (`Dev_01`, `Desk_02`). `join_all()` joins the direct mesh children of each empty into `<Empty>_Mesh`. This keeps the draw-call count low. Nested empties stay separate, so a character inside a station stays its own object.
- The browser selects an object when it finds the first ancestor whose name starts with a prefix in `SELECTABLE_PREFIXES` (`packages/scene/src/Stage.tsx`) and ends with `_NN`. When you add a new clickable kind, add its prefix there.
- Build each part in the local space of its group, then place the group with `group(name, parent, loc, rot_z)`.

## Gotchas

- Blender 5.x: the Eevee engine id is `BLENDER_EEVEE`. `setup_render()` tries both ids. Guard any version-specific setting with `hasattr`.
- `box()`, `sphere()` and the other helpers accept a palette name or a `Material`. Pass a `Material` from `material(...)` for emissive or transparent parts. Do not edit `obj.data.materials` after creation.
- The browser does not import Blender lights (area lights do not exist in glTF). After you change the lights in the stage script, copy them by hand to `packages/scene/src/OfficeLights.tsx`.
- After you add an npm package, Vite can serve two React copies, which gives an "Invalid hook call" error. Stop the dev server, delete `node_modules/.vite`, and start it again.
- `stage1.glb` is about 2 MB. Keep new props light: no hidden faces, and few segments on small parts.
