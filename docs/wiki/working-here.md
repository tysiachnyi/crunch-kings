# Working here

Rules for every agent and model in this repository. [CLAUDE.md](../../CLAUDE.md) has the short form.

## Before you start

1. Read [glossary.md](glossary.md). Use its words in code, UI text, docs and chat.
2. Read [status.md](status.md) to see what exists.
3. For a rule change, read the matching section of [game-systems.md](game-systems.md) and the file it names.

## Where code goes

- Game rules: `packages/game-core`. Pure TypeScript. No React, three.js, DOM, `Date.now()` or `Math.random()`. Use `createRng(state.seed)` and store the new seed.
- Tuning numbers: `balance.ts`. Content tables: `content.ts`. Never inline numbers in rules.
- Every rule change gets a Vitest test. For balance changes, run the bot in `testkit.ts` (`autoplay`) and compare the result with [status.md](status.md).
- 3D code that more than one app uses: `packages/scene`.
- UI, timer, save, sounds: `apps/web`.
- Experiments: a new folder under `prototyping/`.
- 3D assets: the `blender-pipeline` skill. Edit the Python scripts, never the `.blend` files.
- Keep browser-only APIs out of `packages/*`, so iOS and macOS wrappers can reuse them.

## Done means

- `pnpm typecheck` and `pnpm test` pass.
- You checked the change in the browser with the preview server `web` or `lab` from `.claude/launch.json`.
- You updated [history.md](history.md), [status.md](status.md) and, for new words, [glossary.md](glossary.md).

## Owner rules

- Do not commit, push, tag, merge or open a pull request unless the owner asks in the current conversation.
- Never add AI attribution to commits or pull requests.
- Write English in Simplified Technical English: active voice, short sentences, no semicolons, no em-dashes, no phrasal verbs, one word for one thing.
- Talk to the owner in Russian, short.
- Ask the owner before a decision that changes the game design, the art direction or the scope. Record the answer in an ADR or in [ADR 0002](../adr/0002-bible-decisions.md).

## Naming rules

- One word for one thing. The glossary decides the word. Words under _Avoid_ must not appear in new code, UI text or docs.
- Code identifiers may differ from the glossary word only where the glossary says so (for example `staff` in code means the team).
- If you need a new word, add it to the glossary in the same change.
