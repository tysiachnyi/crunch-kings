# ADR 0002: Decisions on top of the game bible

Date: 2026-11-13
Status: accepted

## Context

The game bible ("Crunch Kings - библия игры", 13 November 2026) holds the idea, the world, the story, the characters and the systems. It lives outside this repository. Some parts of it conflict with what the repository already builds. This record says which side wins.

## Decisions

1. **Title.** The game is called **Crunch Kings**. The repository folder name stays as it is.
2. **Art direction.** The 3D low-poly toon diorama from this repository wins over bible section 9 (hand-drawn 2D, ink outlines, puppet animation). The bible palette (mustard, navy, olive, suit blue, tie red, cream, teal) can enter `PALETTE` in `assets/blender/kit/core.py`, one named color at a time. The bible rules for era looks still apply: each era changes the materials and props of the same room.
3. **Angry fans.** Fans are their own system with mood, demands and reactions, not only a review outlet. See `docs/design/angry-fans.md`.
4. **Demo team.** The demo starts with two people: the founder (the player) and the garage friend. The founder archetype (Coder, Designer, Artist) picks the friend: Coder → Maggie Lee (artist), Artist → Danny Cobb (coder), Designer → Roy Pak (sound).
5. **Start money.** The demo starts with a fixed $20,000, as in the bible story. There is no difficulty choice in the demo. The bible difficulty table (90k/60k/40k/30k) waits for the full game.
6. **Sound.** The demo has UI sounds only (WebAudio, made in code). There is no music yet. Bible open question 9 stays open.
7. **Platform names.** The 1980s platforms are fictional: Vector 64 (home computer, 1980), Kestrel PC (business computer, 1983) and Funbox (cartridge console, 1985). The names live in `packages/game-core/src/content.ts`.
8. **Demo scope.** The free demo covers 1980-1989 (bible chapters 1-2). We build that slice first and to a finished quality, before any later era.
9. **Open questions from the bible.**
   - Fixed start in January 1980. A short 1995-2020 run comes later.
   - Giga Gorilla keeps the gorilla in sunglasses.
   - The tone stays warm and funny.
   - The archetypes are Coder, Designer and Artist.
   - The proposed names stay: Maggie, Danny, Roy, Gigo, Chuck Bramley, Mr Hawk.
   - The player can accept the Giga Gorilla buyout. It gives the early "Absorbed" ending.
   - The alliance against Crimson Comet in chapter 7 is optional.
   - The last office is the campus. The towers are a cosmetic upgrade.

## Consequences

- Bible section 9 is out of date. Update it in the bible so that the two documents agree.
- Game rules in `packages/game-core` use the six bible skills, the eight traits, the 1980s genres, engines and rivals, the rescue ladder and the bible events that fit the 1980s.
