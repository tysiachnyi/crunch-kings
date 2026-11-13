# Crunch Kings wiki

This wiki explains the project to a new reader: a person, an agent or another model. It says what the game is, what is built, how the code is laid out, and which words we use.

Read the pages in this order:

| Page | What it answers |
| --- | --- |
| [overview.md](overview.md) | What is Crunch Kings? Who is it for? What does the demo contain? |
| [glossary.md](glossary.md) | Which word do we use for each thing? Read it before you name anything. |
| [architecture.md](architecture.md) | How is the repository built? Where does each kind of code go? |
| [game-systems.md](game-systems.md) | How do the game rules work? Which file holds each rule? |
| [art-and-3d.md](art-and-3d.md) | How do the 3D style and the Blender pipeline work? |
| [ui.md](ui.md) | Which screens, panels, keys and sounds does the browser game have? |
| [history.md](history.md) | What work is done, in which order, and why? |
| [status.md](status.md) | What works, what is not verified, what is open, what comes next? |
| [working-here.md](working-here.md) | Which rules must an agent follow in this repository? |

## Other sources of truth

- The game bible: `Crunch Kings — библия игры.pdf`. It lives outside the repository, on the owner's machine. It holds the story, the characters, the eras and the system ideas.
- [docs/adr](../adr): architecture decision records. [ADR 0002](../adr/0002-bible-decisions.md) says where the repository differs from the bible.
- [docs/design](../design): design notes, for example [angry-fans.md](../design/angry-fans.md).
- [README.md](../../README.md): the folder layout and the commands.
- [CLAUDE.md](../../CLAUDE.md): short rules for agents.

## Keep the wiki current

- When you finish a piece of work, add a line to [history.md](history.md) and update [status.md](status.md).
- When you add a new concept or a new word, add it to [glossary.md](glossary.md) first. Then use that word in code, UI text and docs.
- When a page and the code disagree, the code wins. Fix the page.
