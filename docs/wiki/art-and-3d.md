# Art and 3D

## Style

- A warm, cozy, cluttered low-poly toon **diorama**: a cut-away room seen from a fixed isometric camera.
- Dense clutter tells the story: papers, cables, sticky notes, mugs, cans, pizza boxes. An empty room reads as sad. The owner rejected the first, emptier version for that reason.
- Retro 1980s props: beige CRT monitors, PC towers, a water cooler, posters with pixel aliens.
- Characters are blocky chibi people, about 1.3 m tall. Every skin part has one even tone. The owner rejected faceted "wooden toy" skin.
- Colors come only from `PALETTE` in `assets/blender/kit/core.py`.
- The bible says each era changes the room: wood and beige in the 80s, grey and chrome in the 90s, glass and neon in the 2000s, flat and clean from the 2010s.

## Pipeline

Python script → Blender headless → `.glb` + PNG renders → meshopt compression → React Three Fiber.

- Run `pnpm scene`. It calls `assets/blender/build_all.sh`. Add `--no-render` to skip renders.
- The scripts are the source of truth. The `.blend` files are build output.
- Full rules are in the project skill `.claude/skills/blender-pipeline/SKILL.md`.

| Script | Output | Content |
| --- | --- | --- |
| `build_characters.py` | `characters.glb`, `renders/characters.png` | One sitting **character** per **look**. |
| `build_stage1.py` | `stage1.glb`, `renders/stage1*.png` | The garage **stage**: 5 m room, 2 workstations. |
| `build_stage2.py` | `stage2.glb`, `renders/stage2*.png` | The small office stage: 6.4 × 5.6 m, carpet, 6 workstations, sofa, arcade cabinet, whiteboard. |

The kit:

- `kit/core.py`: palette, material cache, shape helpers, `group`, `join_all`.
- `kit/props.py`: furniture and clutter.
- `kit/characters.py`: the character builder and `STYLES` (the looks).
- `kit/stage.py`: room builder, workstation with a seat, world, lights, cameras, render settings, export.

## Seats and looks

- A stage holds no people. Each workstation has an empty node `Seat_NN`.
- The browser puts employee number N into `Seat_NN`, in team order: the founder in seat 1, the friend in seat 2, hires after them.
- `lookFor()` in `packages/scene/src/Stage.tsx` maps an employee to a look:
  - founder → `founder_coder`, `founder_designer` or `founder_artist`
  - garage friend → `maggie`, `danny` or `roy`
  - hire → `hire_<role>` (coders alternate between `hire_coder` and `hire_coder2`)
- Each character node is `Char_<look>` with the sub-nodes `_Body`, `_Head` (pivot at the neck), `_ArmL` and `_ArmR` (pivot at the shoulder).

## Animation

Code animation in `Stage.tsx`, no skeleton:

- Working: arms tap like typing, the head bobs. Crunch makes it faster.
- Idle: slow head turns and a small sway.
- Burnout: the head hangs down and the arms stop.

## Selection

The browser selects the first ancestor whose name starts with a prefix in `SELECTABLE_PREFIXES` and ends in `_NN`. A click on a character (`Dev_NN`) opens the Team tab and highlights that employee. A click on a prop shows a joke line.

## Sizes

After meshopt: `stage1.glb` about 0.5 MB, `stage2.glb` about 0.8 MB, `characters.glb` about 0.8 MB. drei `useGLTF` decodes meshopt by default. Do not use Draco: it loads its decoder from a CDN.
