# Overview

## The idea

Crunch Kings is a cozy 3D tycoon game about running a game studio. The player starts in a garage in January 1980 with one friend and $20,000 from selling a car. Over 50 in-game years the studio grows from the garage to a campus.

Slogan: "Start in a garage. End in the history books."

The reference is Game Dev Tycoon. Crunch Kings wants to be better in three places:

1. The score bar rises with the calendar, not with your own best score. A great game is never punished for being great.
2. Rivals are real studios. They release games into the same charts as you.
3. Every run has a seed that friends can share.

Two signature features:

- **Angry fans.** Fans have a mood and a memory. They demand sequels, sign petitions, write letters in caps lock, review-bomb you and forgive you after a hit.
- **The garage friend.** A named friend works with you from day one and stays for decades.

The name is a joke about crunch. The game never forces crunch and it rewards a humane studio.

## Tone

Warm comedy. We joke about the industry and its habits, never about the people in it. There are no dark villains. The main rival, Giga Gorilla, is loud and rude but not evil.

## Target platforms

1. The browser, first. Friends play a free demo from a static host.
2. iOS and macOS later. They wrap the same web build (see [ADR 0001](../adr/0001-monorepo-and-stack.md)).

## The demo

The free demo covers the **garage years, 1980-1989** (bible chapters 1 and 2). It ends in January 1990 with a teaser for Giga Gorilla. The full game covers 1980-2030 in seven chapters.

Demo content:

- 3 founder archetypes, each with its own garage friend.
- 8 genres and 12 topics that unlock over the decade.
- 3 platforms, 3 licensed engines and an own engine with 2 levels.
- 13 research nodes, 5 rivals plus generated ones, a yearly awards show and a yearly game jam.
- The angry fans demo slice.
- 2 offices: the garage (2 seats) and the small office (6 seats).

## Decisions on top of the bible

The bible is the creative source. [ADR 0002](../adr/0002-bible-decisions.md) lists where the repository wins. In short:

- The art is a 3D low-poly toon diorama, not the hand-drawn 2D of bible section 9.
- The start money is a fixed $20,000. There is no difficulty choice in the demo.
- The demo has UI sounds only. There is no music yet.
- The 1980s platform names are our own: Vector 64, Kestrel PC and Funbox.
