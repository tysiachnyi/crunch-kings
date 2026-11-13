import type { EngineId, Focus, Genre, PlatformId, RegionId, ResearchId, Skill, Tag, Topic, Trait } from './types'

export const SKILLS: Skill[] = ['design', 'tech', 'art', 'sound', 'story', 'polish']

export type PhaseAspect = { label: string; text: string; skill: Skill }

export const PHASES: { label: string; text: string; aspects: [PhaseAspect, PhaseAspect, PhaseAspect] }[] = [
  {
    label: 'Foundation',
    text: 'Build the base that the rest of the game stands on.',
    aspects: [
      { label: 'Code base', text: 'Engine, tools and fast loading.', skill: 'tech' },
      { label: 'Core loop', text: 'The one thing the player does again and again.', skill: 'design' },
      { label: 'Plot', text: 'The story, the hero and the world.', skill: 'story' },
    ],
  },
  {
    label: 'Content',
    text: 'Fill the game with things to see and hear.',
    aspects: [
      { label: 'Levels', text: 'Maps, puzzles and challenges.', skill: 'design' },
      { label: 'Artwork', text: 'Sprites, backgrounds and animation.', skill: 'art' },
      { label: 'Music', text: 'Tunes and sound effects.', skill: 'sound' },
    ],
  },
  {
    label: 'Finish',
    text: 'Make the game ready for the shop shelf.',
    aspects: [
      { label: 'Bug hunt', text: 'Find the bugs and fix them.', skill: 'polish' },
      { label: 'Visual effects', text: 'Explosions, sparks and screen shake.', skill: 'art' },
      { label: 'Audio mix', text: 'Balance the volume of every sound.', skill: 'sound' },
    ],
  },
]

export const GENRES: Record<Genre, { label: string; year: number; tags: Tag[]; ideal: Focus }> = {
  arcade: { label: 'Arcade Action', year: 1980, tags: ['action'], ideal: { design: 25, tech: 25, art: 20, sound: 15, story: 0, polish: 15 } },
  platformer: { label: 'Platformer', year: 1980, tags: ['action', 'world'], ideal: { design: 25, tech: 20, art: 25, sound: 15, story: 0, polish: 15 } },
  puzzle: { label: 'Puzzle', year: 1980, tags: ['brains'], ideal: { design: 40, tech: 15, art: 10, sound: 10, story: 5, polish: 20 } },
  sports: { label: 'Sports', year: 1980, tags: ['action', 'social'], ideal: { design: 20, tech: 30, art: 20, sound: 10, story: 0, polish: 20 } },
  racing: { label: 'Racing', year: 1985, tags: ['action'], ideal: { design: 15, tech: 35, art: 20, sound: 15, story: 0, polish: 15 } },
  shooter: { label: 'Shooter', year: 1985, tags: ['action'], ideal: { design: 20, tech: 30, art: 20, sound: 15, story: 0, polish: 15 } },
  adventure: { label: 'Adventure', year: 1985, tags: ['story', 'brains', 'world'], ideal: { design: 22, tech: 8, art: 22, sound: 12, story: 26, polish: 10 } },
  rpg: { label: 'RPG', year: 1985, tags: ['story', 'world', 'brains'], ideal: { design: 28, tech: 10, art: 17, sound: 12, story: 23, polish: 10 } },
}

export const TOPICS: Record<Topic, { label: string; year: number; tags: Tag[] }> = {
  fantasy: { label: 'Fantasy', year: 1980, tags: ['world', 'story'] },
  space: { label: 'Space', year: 1980, tags: ['world', 'action'] },
  pirates: { label: 'Pirates', year: 1980, tags: ['action', 'story'] },
  ninjas: { label: 'Ninjas', year: 1980, tags: ['action'] },
  robots: { label: 'Robots', year: 1980, tags: ['brains', 'action'] },
  zombies: { label: 'Zombies', year: 1982, tags: ['action'] },
  detectives: { label: 'Detectives', year: 1982, tags: ['brains', 'story'] },
  dinosaurs: { label: 'Dinosaurs', year: 1983, tags: ['world'] },
  cooking: { label: 'Cooking', year: 1984, tags: ['social', 'brains'] },
  office: { label: 'Office Life', year: 1985, tags: ['social'] },
  aliens: { label: 'Aliens', year: 1986, tags: ['action', 'world'] },
  cowboys: { label: 'Cowboys', year: 1987, tags: ['action', 'story'] },
}

export const PLATFORMS: Record<PlatformId, { label: string; kind: string; year: number; license: number; unitCost: number; audience: number[]; likes: Tag[] }> = {
  vector64: {
    label: 'Vector 64',
    kind: 'Home computer',
    year: 1980,
    license: 0,
    unitCost: 0,
    audience: [300, 450, 650, 800, 820, 780, 700, 600, 480, 360],
    likes: ['brains', 'action'],
  },
  kestrel: {
    label: 'Kestrel PC',
    kind: 'Business computer',
    year: 1983,
    license: 3000,
    unitCost: 0,
    audience: [0, 0, 0, 200, 380, 560, 760, 950, 1150, 1350],
    likes: ['brains', 'story'],
  },
  funbox: {
    label: 'Funbox',
    kind: 'Cartridge console',
    year: 1985,
    license: 15000,
    unitCost: 3,
    audience: [0, 0, 0, 0, 0, 400, 900, 1400, 1800, 2000],
    likes: ['action', 'world'],
  },
}

export const ENGINES: Record<Exclude<EngineId, 'own'>, { label: string; year: number; tech: number; fee: number; royalty: number }> = {
  tinker: { label: 'Tinker Kit', year: 1980, tech: 1, fee: 0, royalty: 0 },
  pixelpal: { label: 'Pixel Pal', year: 1984, tech: 1.7, fee: 4000, royalty: 0 },
  scrollmaster: { label: 'Scroll Master', year: 1988, tech: 2.4, fee: 10000, royalty: 0.03 },
}

export const OWN_ENGINE_TECH = [0, 2, 2.6]

export const RESEARCH: Record<ResearchId, { label: string; text: string; rp: number; cost: number; requires?: ResearchId }> = {
  mediumGames: { label: 'Medium games', text: 'Unlocks size M. Needs 3 people.', rp: 8, cost: 1000 },
  largeGames: { label: 'Large games', text: 'Unlocks size L. Needs 5 people.', rp: 35, cost: 6000, requires: 'mediumGames' },
  engineBasics: { label: 'Engine basics', text: 'Build your own engine, level 1 (tech 2.0). No royalties.', rp: 20, cost: 3000 },
  engineTools: { label: 'Engine tools', text: 'Upgrade your own engine to level 2 (tech 2.6).', rp: 45, cost: 8000, requires: 'engineBasics' },
  trainingRoom: { label: 'Training room', text: 'Train people: +1 skill for $1,500.', rp: 15, cost: 2000 },
  recruiter: { label: 'Recruiter', text: '5 candidates a month instead of 3.', rp: 20, cost: 3000 },
  teamSpirit: { label: 'Team spirit', text: '+1 morale a week for everyone.', rp: 25, cost: 2000 },
  marketing: { label: 'Marketing', text: 'Unlocks the big ad campaign.', rp: 15, cost: 1000 },
  pressKit: { label: 'Press kit', text: 'Every new game starts with +8 hype.', rp: 20, cost: 1500, requires: 'marketing' },
  marketResearch: { label: 'Market research', text: 'Shows how well a genre and topic fit before you start.', rp: 10, cost: 500 },
  testLab: { label: 'Test lab', text: 'The test week removes 75% of bugs, not 50%.', rp: 25, cost: 4000 },
  playtests: { label: 'Playtests', text: 'Shows the expected score while you build. Polish +10%.', rp: 30, cost: 3000, requires: 'testLab' },
  soundStudio: { label: 'Sound studio', text: 'Sound work +20%.', rp: 20, cost: 3000 },
}

export const TRAITS: Record<Trait, { label: string; text: string }> = {
  fastLearner: { label: 'Fast learner', text: 'Training gives +50%.' },
  workaholic: { label: 'Workaholic', text: 'Crunch gives half the stress. Normal weeks: -1 morale.' },
  perfectionist: { label: 'Perfectionist', text: 'Output x0.9, bugs x0.7.' },
  teamPlayer: { label: 'Team player', text: '+2 morale to the team every week.' },
  diva: { label: 'Diva', text: 'Skills +20%, salary +35%. Leaves after a flop.' },
  nightOwl: { label: 'Night owl', text: 'Output x1.1, but only in crunch.' },
  cheap: { label: 'Cheap', text: 'Salary x0.8, skills x0.9.' },
  loyal: { label: 'Loyal', text: 'Never poached. Leaves only below 10 morale.' },
}

export const OUTLETS = [
  { name: 'Pixel Post', aspect: 'balanced' },
  { name: 'Joystick Gazette', aspect: 'tech' },
  { name: 'Cartridge Weekly', aspect: 'action' },
  { name: 'Byte Herald', aspect: 'brains' },
  { name: 'Quest Log', aspect: 'story' },
  { name: 'Fan Voice', aspect: 'fans' },
] as const

export type OutletAspect = (typeof OUTLETS)[number]['aspect']

export const REVIEW_QUOTES: Record<OutletAspect, [good: string[], mid: string[], bad: string[]]> = {
  balanced: [
    ['"{title}" is the reason we still own a joystick.', 'A rare game that respects your time and your wallet.'],
    ['Solid, honest, a little forgettable. Like a good sandwich.', 'Fine. We played it. It was fine.'],
    ['We wanted to like {title}. It did not let us.', 'Somebody shipped this on purpose.'],
  ],
  tech: [
    ['The sprites move like butter. Warm butter.', 'We counted the frames per second and ran out of fingers.'],
    ['The engine wheezes, but it gets there.', 'Technically a game. Technically.'],
    ['Our Vector 64 asked us to stop.', 'The loading time let us read a whole novel.'],
  ],
  action: [
    ['Our thumbs hurt and we are happy.', 'Pure adrenaline in a little plastic box.'],
    ['Some fun fights, some long walks.', 'Good action if you squint.'],
    ['The most exciting part is the box art.', 'We fell asleep during the boss.'],
  ],
  brains: [
    ['Our brains feel bigger now.', 'Clever in the way that makes you text your friends.'],
    ['Smart ideas, half finished.', 'It makes you think. Mostly about other games.'],
    ['The only puzzle is why it exists.', 'Brain food with no food in it.'],
  ],
  story: [
    ['We cried at a {topic} game. Twice.', 'The writing has more heart than our editor.'],
    ['A story with a beginning and an end. The middle is missing.', 'The {topic} lore is fun, the dialog less so.'],
    ['The plot reads like a shopping list.', 'Every character is named Steve. Even the dragon.'],
  ],
  fans: [
    ['WE LOVE YOU {studio}!!!', 'Instant classic. Do a sequel. DO IT.'],
    ['Good, but we expected more from {studio}.', 'Mixed feelings. Mostly feelings.'],
    ['{studio} has forgotten its fans.', 'THIS IS NOT WHAT WE ASKED FOR.'],
  ],
}

export const FIRST_NAMES = [
  'Alice', 'Ben', 'Carla', 'Dev', 'Eddie', 'Fran', 'Gus', 'Hana', 'Ivan', 'Jules', 'Kim', 'Leo', 'Mona', 'Nate', 'Olga', 'Pete',
  'Quinn', 'Rosa', 'Sam', 'Tina', 'Ugo', 'Vera', 'Walt', 'Xena', 'Yuri', 'Zoe', 'Marty', 'Debbie', 'Ronnie', 'Sandy',
]

export const LAST_NAMES = [
  'Byte', 'Carter', 'Diaz', 'Evans', 'Fox', 'Gold', 'Hale', 'Ito', 'Jones', 'Klein', 'Lopez', 'Moss', 'Novak', 'Orr', 'Price',
  'Reed', 'Stone', 'Tran', 'Vance', 'Wong', 'Yates', 'Zane', 'Becker', 'Kowalski', 'Okafor', 'Silva',
]

export const RIVAL_SEEDS = [
  { id: 'brickyard', name: 'Brickyard Games', genres: ['platformer', 'puzzle'] as Genre[], quality: 6.2, pace: 22, openYear: 1980 },
  { id: 'moonlit', name: 'Moonlit Bytes', genres: ['adventure', 'rpg', 'puzzle'] as Genre[], quality: 7.2, pace: 34, openYear: 1980 },
  { id: 'oldoak', name: 'Old Oak Interactive', genres: ['sports', 'racing'] as Genre[], quality: 5.6, pace: 18, openYear: 1980 },
  { id: 'hexagon', name: 'Hexagon Hounds', genres: ['puzzle', 'racing', 'sports'] as Genre[], quality: 6.6, pace: 26, openYear: 1982 },
  { id: 'neonpigeon', name: 'Neon Pigeon', genres: ['arcade', 'shooter'] as Genre[], quality: 5.8, pace: 16, openYear: 1986 },
]

export const RIVAL_NAME_PARTS = {
  first: ['Lucky', 'Rusty', 'Purple', 'Turbo', 'Sleepy', 'Cosmic', 'Tiny', 'Angry', 'Golden', 'Fuzzy'],
  second: ['Badger', 'Toaster', 'Pixel', 'Llama', 'Rocket', 'Waffle', 'Comet', 'Goose', 'Cactus', 'Walrus'],
  third: ['Games', 'Soft', 'Studios', 'Interactive', 'Works'],
}

export const RIVAL_TITLE_PARTS = {
  first: ['Super', 'Mega', 'Night', 'Turbo', 'Crystal', 'Iron', 'Lost', 'Galactic', 'Tiny', 'Final'],
  second: ['Quest', 'Racer', 'Blaster', 'Legends', 'Tower', 'Kingdom', 'Hero', 'Rally', 'Panic', 'Saga'],
}

export const PETITIONS = ['ADD A HORSE', 'MORE CATS', 'BRING BACK THE DUCK', 'MAKE THE HAT BIGGER', 'LET US PET THE DOG', 'GIVE THE VILLAIN A HUG']

export const ANGRY_LETTERS = [
  'DEAR {studio}. I SAVED MY ALLOWANCE FOR 3 MONTHS. I WANT IT BACK. ALSO PLEASE MAKE A SEQUEL.',
  'My little brother says your last game is bad. I said he is wrong. Now I think he is right. Please fix this.',
  'I HAVE WRITTEN THIS LETTER IN CAPS SO YOU KNOW I AM SERIOUS.',
  'Your game made my cat leave the room. My cat likes everything.',
]

export const FAN_LETTERS = [
  'Dear {studio}, I drew your hero on my school bag. My teacher was not happy. I was.',
  'My dad and I play your game every Sunday. He always loses. Thank you.',
  'I named my hamster after your studio. He is very fast.',
]

export const REGIONS: Record<RegionId, { label: string; short: string; share: number; genres: Partial<Record<Genre, number>>; tags: Partial<Record<Tag, number>> }> = {
  usa: {
    label: 'the USA',
    short: 'USA',
    share: 0.34,
    genres: { arcade: 1.15, sports: 1.3, shooter: 1.2, puzzle: 0.85, platformer: 0.95 },
    tags: { action: 1.15, social: 1.1 },
  },
  japan: {
    label: 'Japan',
    short: 'Japan',
    share: 0.2,
    genres: { rpg: 1.45, platformer: 1.35, puzzle: 1.2, arcade: 1.15, adventure: 1.15, sports: 0.7, racing: 0.85, shooter: 0.8 },
    tags: { story: 1.2, world: 1.2, action: 0.95 },
  },
  germany: {
    label: 'Germany',
    short: 'Germany',
    share: 0.14,
    genres: { puzzle: 1.3, racing: 1.25, adventure: 1.15, rpg: 1.1, sports: 0.9, arcade: 0.85, shooter: 0.8 },
    tags: { brains: 1.2, story: 1.1, action: 0.9 },
  },
  uk: {
    label: 'the United Kingdom',
    short: 'United Kingdom',
    share: 0.12,
    genres: { sports: 1.3, adventure: 1.25, arcade: 1.1, puzzle: 1.05, shooter: 0.9 },
    tags: { social: 1.15, story: 1.1 },
  },
  france: {
    label: 'France',
    short: 'France',
    share: 0.1,
    genres: { adventure: 1.35, puzzle: 1.2, rpg: 1.1, sports: 0.9, shooter: 0.85 },
    tags: { story: 1.2, brains: 1.1, action: 0.9 },
  },
  brazil: {
    label: 'Brazil',
    short: 'Brazil',
    share: 0.1,
    genres: { sports: 1.5, racing: 1.25, arcade: 1.1, platformer: 1.1, puzzle: 0.8, rpg: 0.8 },
    tags: { social: 1.2, action: 1.1 },
  },
}

export const UNIT_TIERS: { id: string; label: string; text: string }[] = [
  { id: 'cult', label: 'Cult favorite', text: 'A small crowd loves it.' },
  { id: 'big', label: 'Big seller', text: 'Shops cannot keep it on the shelf.' },
  { id: 'smash', label: 'Smash hit', text: 'Everybody has a copy.' },
  { id: 'legend', label: 'Legend', text: 'People will talk about it for years.' },
]
