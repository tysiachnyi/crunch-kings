#!/bin/sh
set -e
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
DIR="$(cd "$(dirname "$0")" && pwd)"
for script in build_characters build_stage1 build_stage2; do
  "$BLENDER" --background --factory-startup --python "$DIR/$script.py" -- "$@"
done
for model in stage1 stage2 characters; do
  pnpm exec gltf-transform meshopt "$DIR/../public/models/$model.glb" "$DIR/../public/models/$model.glb" --level medium
done
