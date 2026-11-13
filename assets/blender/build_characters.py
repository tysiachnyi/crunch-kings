import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "blender"))

from kit.characters import STYLES, character  # noqa: E402
from kit.stage import add_light, export, finish, reset, setup_close_camera  # noqa: E402


def main():
    reset()
    for i, key in enumerate(STYLES):
        character(f"Char_{key}", None, (i * 0.8 - len(STYLES) * 0.4, 0, 0), 0, STYLES[key], "sit")
    finish()
    add_light("Key", "AREA", (0, -4, 4), 900, (1.0, 0.85, 0.7), size=6, target=(0, 0, 0.8))
    cam = setup_close_camera((0, -9.5, 2.2), (0, 0, 0.75))
    export("characters", [("", cam)])


main()
