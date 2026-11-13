# Glossary

The language of Crunch Kings. Each concept has one word. Use that word in code, UI text, docs and chat. Words under _Avoid_ mean the same thing and must not appear in new work.

When you add a concept, add its word here in the same change. Keep each definition to one or two sentences.

## The project

**Crunch Kings**:
The game that this repository builds.
_Avoid_: Crunchy Fellos (the old name), the app, the tycoon

**Bible**:
The owner's design document for Crunch Kings. It lives outside the repository.
_Avoid_: design doc, spec, GDD

**Demo**:
The free, playable slice of Crunch Kings that covers 1980-1989.
_Avoid_: beta, prototype, vertical slice

**Owner**:
The person who decides the game design, the art direction and the scope.
_Avoid_: client, boss, the user (in docs)

**Chapter**:
One of the seven story parts of a run, each tied to a span of years. The demo holds chapters 1 and 2.
_Avoid_: level, act (an act groups chapters), era (see Era)

**Era**:
The look and technology of a span of years, for example the 1980s with wood, beige and cartridges.
_Avoid_: age, period, epoch

## Studio and run

**Run**:
One play-through from founding the studio to an ending.
_Avoid_: save, playthrough, campaign, session

**Studio**:
The player's game company.
_Avoid_: company, firm, team (see Team)

**Seed**:
The number that fixes all randomness of a run. The same seed and the same choices give the same run.

**Week**:
One step of game time.
_Avoid_: tick, turn, day (see Day)

**Day**:
One seventh of a week. Only the sales display uses it. The game rules never step by day.
_Avoid_: game day, turn

**Ending**:
The way a run finishes. The demo has two: demo complete and bankrupt.
_Avoid_: game over, finale

**Milestone**:
A first-time achievement of the studio that the log announces, for example the first profitable year.
_Avoid_: achievement (reserved for the future achievement list), goal

**Office**:
The room where the team works, at one level: the garage or the small office.
_Avoid_: building, HQ, workplace

## People

**Founder**:
The employee who is the player. The founder never quits and cannot be fired.
_Avoid_: player character, boss, CEO

**Archetype**:
The founder type chosen at the start: Coder, Designer or Artist. It sets the founder's skills and picks the garage friend.
_Avoid_: class, role (see Role), background

**Garage friend**:
The named employee who starts with the founder: Maggie Lee, Danny Cobb or Roy Pak.
_Avoid_: buddy, co-founder, sidekick, partner

**Employee**:
One person who works for the studio: the founder, the garage friend or a hire.
_Avoid_: staff member, worker, dev, person (in code), character (see Character)

**Hire**:
An employee who joined from the candidate list or by an event.
_Avoid_: recruit, new guy

**Team**:
All employees of the studio together.
_Avoid_: staff (except the `staff` field in code), crew, roster

**Candidate**:
A person on this month's list whom the player can hire.
_Avoid_: applicant, recruit

**Role**:
The job of an employee: coder, artist, designer, sound or writer.
_Avoid_: job, class, profession

**Skill**:
One of six abilities of an employee: design, tech, art, sound, story, polish.
_Avoid_: stat, attribute, ability

**Trait**:
A personality feature with a game effect, for example perfectionist or loyal.
_Avoid_: perk, quirk, flaw

**Morale**:
How happy an employee is, from 0 to 100. Low morale for weeks makes a hire quit.
_Avoid_: happiness, mood (see Fan mood)

**Stress**:
How tired an employee is, from 0 to 100. It rises in crunch.
_Avoid_: fatigue, tiredness

**Burnout**:
A period of 8 weeks when an employee does no work because stress went too high.
_Avoid_: sick leave, breakdown

**Crunch**:
A mode the player turns on for a game project: more output, more bugs, more stress.
_Avoid_: overtime, sprint, rush

**Training**:
Paying money to raise one skill of one employee.
_Avoid_: course, upgrade, level up

## Making games

**Game project**:
A game that the studio is building now.
_Avoid_: project (alone, in docs), build, WIP, current game

**Release**:
A game that the studio has shipped, with its reviews and sales.
_Avoid_: launch, published game, title (see Title)

**Title**:
The name of a game project or a release.
_Avoid_: game name, label

**Genre**:
The kind of game, for example Platformer or RPG.
_Avoid_: type, category (see Category)

**Topic**:
What a game is about, for example Pirates or Space.
_Avoid_: theme, setting, subject

**Combo**:
How well a genre and a topic fit together: great, good or bad.
_Avoid_: match, synergy, pairing

**Size**:
The scale of a game project: S, M or L. Bigger games take longer, need more employees and sell more.
_Avoid_: scope, budget, tier

**Focus**:
The split of work over the six skills for a game project. It always adds up to 100. The game computes it from the weights of the three phases.
_Avoid_: sliders, priorities, allocation

**Phase**:
One of three parts of a game project: Foundation, Content and Finish. Before each phase the player sets the weights of its three aspects, and the game waits for that decision.
_Avoid_: stage, step, milestone (see Milestone), sprint

**Aspect**:
One of the three parts of work inside a phase, for example Code base or Levels. Each aspect feeds one skill. The player sets a weight from 0 to 100 for it, and its share is its weight divided by the total of the phase.
_Avoid_: task, slider, category, focus area

**Ideal focus**:
The focus that suits a genre best. The game never shows it before the first release in that genre.
_Avoid_: recipe, perfect mix

**Focus fit**:
How close a focus is to the ideal focus of the genre.
_Avoid_: balance, alignment

**Work points**:
The amount of work done per skill on a game project.
_Avoid_: progress points, design points, tech points (as separate concepts)

**Bug**:
A flaw in a game project that lowers quality. The test week removes some bugs.
_Avoid_: defect, error, glitch

**Test week**:
The last week of a game project, when the team removes bugs instead of adding work.
_Avoid_: QA phase, polish week

**Quality**:
How good a finished game project is, from 1 to 100, before the reviews.
_Avoid_: rating, score (see Score)

**Quality bar**:
The amount of work per week that a game needs in a given year to be average. It rises with the calendar.
_Avoid_: difficulty, market standard

**Platform**:
A machine that games run on: Vector 64, Kestrel PC or Funbox.
_Avoid_: console (only Funbox is a console), system, device

**License**:
The right to make games for a platform or to use an engine, bought once.
_Avoid_: devkit (only for consoles), permit

**Engine**:
The technology a game project uses. A licensed engine or the own engine.
_Avoid_: framework, tech, toolkit

**Own engine**:
The engine that the studio builds through research. It has no royalties.
_Avoid_: in-house engine, custom engine

**Sequel**:
A game project that continues an earlier release. It sells more and can fulfil a sequel demand.
_Avoid_: follow-up, part 2

**Hype**:
Public excitement. The studio has hype, and each game project has its own hype. Hype raises sales.
_Avoid_: buzz, awareness, marketing points

**Ad campaign**:
Money spent to raise the hype of a game project: small or big.
_Avoid_: marketing (the research node has this name), promotion, ads (alone)

**Dev diary**:
A public post about a game project. It costs a little work and raises fan mood and hype.
_Avoid_: blog post, devlog, update

## Release day

**Release day**:
The moment a game ships, and the screen that shows its reviews.
_Avoid_: launch day, release screen

**Outlet**:
One of six fictional magazines that review every release, for example Pixel Post.
_Avoid_: press, magazine, critic, reviewer

**Review**:
One outlet's score and quote for one release.
_Avoid_: rating, critique

**Score**:
The average of the six review scores of a release, from 1 to 10.
_Avoid_: rating, grade, metascore, quality (see Quality)

**Hint**:
One line on release day that says what held the score back.
_Avoid_: tip (see Tip), feedback, advice

**Chart rank**:
The place of a release among rival releases of the same weeks.
_Avoid_: position, ranking, top list

**Sales**:
Copies of a release sold, paid week by week after release.
_Avoid_: revenue (revenue is the money from sales), income, units

**Sales desk**:
The panel at the top left of the play screen. It shows the sales of the newest release day by day, with its sales badges.
_Avoid_: sales widget, sales tracker, ticker (see Ticker)

**Sales badge**:
A stamp that a release earns for its sales, once per release, for example New record or Big seller. The unit tiers are Cult favorite, Big seller, Smash hit and Legend. They are not the same as Hit, which is about the score.
_Avoid_: achievement (see Milestone), trophy, award (see Awards show), label

**Region**:
One of six sales areas: the USA, Japan, Germany, the United Kingdom, France and Brazil. Each has a market share and a taste for genres and topics.
_Avoid_: country, market, territory

**Hit**:
A release with a score of 8 or more.
_Avoid_: success, blockbuster, smash

**Flop**:
A release with a score below 5.
_Avoid_: failure, bomb (see Review bomb)

## Fans

**Fans**:
The people who follow the studio. More fans give more sales.
_Avoid_: players, audience (see Audience), community, followers

**Fan mood**:
How the fans feel about the studio now, from 0 to 100.
_Avoid_: mood (alone, in docs), happiness, sentiment, morale (see Morale)

**Expectation**:
The score that fans expect from the next release.
_Avoid_: hype (see Hype), anticipation

**Demand**:
An open request from the fans, for example a sequel to a hit.
_Avoid_: request, wish, ask

**Petition**:
An event where fans sign a funny request, for example "ADD A HORSE". The player fulfils or ignores it.
_Avoid_: poll, campaign

**Review bomb**:
A period after a release while angry fans lower the Fan Voice review and cut sales.
_Avoid_: shitstorm, backlash, boycott

**Angry letter**:
A caps-lock letter from a fan after a big fan mood drop. Pure flavor.
_Avoid_: hate mail, complaint

**Forgiveness**:
A big fan mood jump when the studio ships a hit while fan mood is low.
_Avoid_: redemption, comeback

## Money and business

**Money**:
The studio's cash.
_Avoid_: cash, funds, balance (see Balance), budget

**Monthly costs**:
All salaries plus the office rent, paid when a month starts.
_Avoid_: payday, burn rate, expenses, upkeep

**Contract**:
Paid outside work that the team does instead of a game project.
_Avoid_: job, gig, side project, commission

**Research**:
Spending research points and money to unlock a research node.
_Avoid_: tech tree (as a verb), R&D (except in bible quotes), upgrades

**Research node**:
One unlockable item of research, for example Test lab.
_Avoid_: upgrade, perk, tech

**Research points**:
The currency of research. Releases and idle weeks give them.
_Avoid_: RP (allowed only in tight UI), science, XP

**Audience**:
How many people own a platform in a given year.
_Avoid_: install base, market size, users

**Inflation**:
The yearly rise of prices and salaries, 3% a year.

**Rescue ladder**:
The three steps after long negative money: a rescue loan, a publisher takeover, then bankruptcy.
_Avoid_: bailout, game over sequence

**Rescue loan**:
Money from Mr Hawk's bank, paid back every week for a year with interest.
_Avoid_: credit, debt

## World

**Rival**:
Another game studio that releases games into the same charts.
_Avoid_: competitor, enemy, AI studio, opponent

**Giga Gorilla**:
The main rival of the full game. It appears in 1990. The demo ends with its teaser.
_Avoid_: GG, the gorilla studio

**Awards show**:
The Golden Cartridge Awards in December, with nominations two weeks before.
_Avoid_: ceremony, competition (see Game jam), contest

**Game jam**:
A yearly spring competition that the team can enter.
_Avoid_: hackathon, contest, competition (alone)

**Event**:
Something that happens to the studio and shows in the log or as a choice.
_Avoid_: incident, random card, story card

**Pending event**:
An event that waits for the player's choice. Time stops until the player chooses.
_Avoid_: popup, dialog, prompt

**Story beat**:
A scheduled event of the story, for example the market crash of 1983.
_Avoid_: cutscene, scripted event

**Trend**:
A genre or topic that is popular for a year and gives extra quality.
_Avoid_: fad, hot topic, buff

**Modifier**:
A temporary effect on sales or quality with a number of weeks left, for example the market crash.
_Avoid_: buff, debuff, effect (alone)

**Log**:
The list of dated lines that tell what happened.
_Avoid_: feed, news, history (see the wiki page of that name)

**Mr Hawk**:
The banker who comes with bad news and cookies.

## 3D and art

**Diorama**:
The cut-away 3D room that shows the office from a fixed isometric camera.
_Avoid_: level, map, scene (in design talk)

**Stage**:
One 3D model of an office level, without people.
_Avoid_: level, map, room model

**Seat**:
A place in a stage where one employee sits. Seats are numbered in team order.
_Avoid_: slot, spot, desk (a desk is a prop)

**Look**:
One visual design of a character, for example `maggie` or `hire_coder`.
_Avoid_: skin, outfit, model, style (in game talk)

**Character**:
The 3D figure that shows an employee in the diorama.
_Avoid_: avatar, model, NPC, employee (see Employee)

**Prop**:
A 3D object in a stage that is not a character, for example the water cooler.
_Avoid_: item, asset, object (in design talk)

**Kit**:
The Blender Python helpers that build props, characters and stages.
_Avoid_: library, toolkit, framework

**Palette**:
The fixed list of named colors that every model uses.
_Avoid_: colors, swatches, theme

## UI

**HUD**:
The top bar with date, money, fans, hype, research points and speed.
_Avoid_: top bar, header, status bar

**Side panel**:
The panel with tabs on the right side.
_Avoid_: sidebar, drawer, menu

**Tip**:
A short help card for a new player.
_Avoid_: tutorial step, hint (see Hint), guide

**Ticker**:
The last three log entries at the bottom left of the play screen.
_Avoid_: news bar, feed

**Toast**:
A short red message when an action is not allowed.
_Avoid_: alert, error popup, notification

## Words in code that differ

Code may keep a different identifier only where this list says so.

| Glossary word | Code identifier |
| --- | --- |
| Team | `staff` |
| Game project | `project`, `GameProject` |
| Fan mood | `fandom.mood` |
| Monthly costs | `monthlyCosts` (the log line says "Salaries and rent") |
| Office level | `OfficeLevel` values `garage`, `smallOffice` |
| Pending event | `pendingEvents`, `PendingEvent` |
| Look | `STYLES` keys in `characters.py`, `lookFor()` in `Stage.tsx` |
| Character in the diorama | node names `Char_<look>` in the model and `Dev_NN` in the browser |
| Research points | `researchPoints`, UI short form "RP" |
