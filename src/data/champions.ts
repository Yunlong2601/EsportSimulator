import { Champion } from '../types/game';

export const CHAMPIONS_DATABASE: Champion[] = [
  // TOP LANE
  {
    id: 'aatrox',
    name: 'Aatrox, Darkin Blade',
    role: 'TOP',
    icon: '🗡️',
    archetype: 'Dive/Assassin',
    tier: 'S+',
    power: 94,
    counters: ['sion', 'ornn', 'chogath'],
    counteredBy: ['fiora', 'gnar', 'camille'],
    signatureMove: 'World Ender 1v4 Pentakill Flank'
  },
  {
    id: 'ksante',
    name: "K'Sante, Pride of Nazumah",
    role: 'TOP',
    icon: '🛡️',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 91,
    counters: ['jax', 'camille', 'jayce'],
    counteredBy: ['fiora', 'gwen', 'rumble'],
    signatureMove: 'All Out Wall Kidnap & Solo Kill'
  },
  {
    id: 'gnar',
    name: 'Gnar, Missing Link',
    role: 'TOP',
    icon: '🐾',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 89,
    counters: ['aatrox', 'renekton', 'darius'],
    counteredBy: ['irelia', 'yasuo', 'jayce'],
    signatureMove: 'Mega-Gnar 5-Man River Wall Stun'
  },
  {
    id: 'jax',
    name: 'Jax, Grandmaster at Arms',
    role: 'TOP',
    icon: '🏮',
    archetype: 'Splitpusher',
    tier: 'A',
    power: 87,
    counters: ['fiora', 'camille', 'tryndamere'],
    counteredBy: ['ksante', 'malphite', 'gragas'],
    signatureMove: 'Counter Strike Flash Inhibit Dive'
  },
  {
    id: 'rumble',
    name: 'Rumble, Mechanized Menace',
    role: 'TOP',
    icon: '🔥',
    archetype: 'Teamfight Wombo' as unknown as 'Dive/Assassin',
    tier: 'S',
    power: 92,
    counters: ['ksante', 'sion', 'chogath'],
    counteredBy: ['aatrox', 'gnar'],
    signatureMove: 'Equalizer Chokepoint Carpet Bomb'
  },

  // JUNGLE
  {
    id: 'leesin',
    name: 'Lee Sin, Blind Monk',
    role: 'JUG',
    icon: '🥋',
    archetype: 'Dive/Assassin',
    tier: 'S+',
    power: 96,
    counters: ['sejuani', 'maokai', 'zac'],
    counteredBy: ['poppy', 'viego', 'jarvan'],
    signatureMove: 'InSec Flash Kick into Carry'
  },
  {
    id: 'jarvan',
    name: 'Jarvan IV, Exemplar of Demacia',
    role: 'JUG',
    icon: '🚩',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 90,
    counters: ['vi', 'xin', 'nocturne'],
    counteredBy: ['poppy', 'viego'],
    signatureMove: 'EQ Flash Cataclysm Pit Trap'
  },
  {
    id: 'viego',
    name: 'Viego, Ruined King',
    role: 'JUG',
    icon: '👑',
    archetype: 'Hypercarry',
    tier: 'S',
    power: 93,
    counters: ['leesin', 'jarvan'],
    counteredBy: ['rammus', 'sejuani', 'maokai'],
    signatureMove: 'Possession Reset Chain Clean Up'
  },
  {
    id: 'sejuani',
    name: 'Sejuani, Fury of the North',
    role: 'JUG',
    icon: '🐗',
    archetype: 'Engage Tank',
    tier: 'A',
    power: 86,
    counters: ['viego', 'khazix'],
    counteredBy: ['leesin', 'graves'],
    signatureMove: 'Glacial Prison Across Screen Snipe'
  },
  {
    id: 'nidalee',
    name: 'Nidalee, Bestial Huntress',
    role: 'JUG',
    icon: '🐆',
    archetype: 'Poke',
    tier: 'A',
    power: 88,
    counters: ['sejuani', 'maokai'],
    counteredBy: ['jarvan', 'poppy'],
    signatureMove: 'Fog of War Spear One-Shot'
  },

  // MID LANE
  {
    id: 'ahri',
    name: 'Ahri, Nine-Tailed Fox',
    role: 'MID',
    icon: '🦊',
    archetype: 'Dive/Assassin',
    tier: 'S',
    power: 93,
    counters: ['syndra', 'orianna', 'viktor'],
    counteredBy: ['yasuo', 'galio', 'leblanc'],
    signatureMove: 'Spirit Rush Charm Blind Flank'
  },
  {
    id: 'azir',
    name: 'Azir, Emperor of the Sands',
    role: 'MID',
    icon: '🦅',
    archetype: 'Control Mage',
    tier: 'S+',
    power: 97,
    counters: ['orianna', 'viktor', 'ryze'],
    counteredBy: ['sylas', 'leblanc', 'ahri'],
    signatureMove: 'Shurima Shuffle Into Fountain'
  },
  {
    id: 'orianna',
    name: 'Orianna, Lady of Clockwork',
    role: 'MID',
    icon: '⚙️',
    archetype: 'Control Mage',
    tier: 'S',
    power: 92,
    counters: ['ryze', 'galio', 'vladimir'],
    counteredBy: ['ahri', 'azir', 'syndra'],
    signatureMove: '5-Man Shockwave Ball Delivery'
  },
  {
    id: 'sylas',
    name: 'Sylas, Unshackled',
    role: 'MID',
    icon: '⛓️',
    archetype: 'Dive/Assassin',
    tier: 'S',
    power: 94,
    counters: ['azir', 'malphite', 'galio'],
    counteredBy: ['cassiopeia', 'orianna'],
    signatureMove: 'Hijack Enemy Ultimates Outplay'
  },
  {
    id: 'yone',
    name: 'Yone, Unforgotten',
    role: 'MID',
    icon: '⚔️',
    archetype: 'Hypercarry',
    tier: 'S',
    power: 91,
    counters: ['viktor', 'syndra', 'hwei'],
    counteredBy: ['renekton', 'pantheon'],
    signatureMove: 'Fate Sealed Multiman Teleport Slash'
  },

  // ADC / BOT
  {
    id: 'kaisa',
    name: "Kai'Sa, Daughter of the Void",
    role: 'ADC',
    icon: '🦋',
    archetype: 'Dive/Assassin',
    tier: 'S+',
    power: 95,
    counters: ['jinx', 'aphelios', 'varus'],
    counteredBy: ['caitlyn', 'draven', 'lucian'],
    signatureMove: 'Killer Instinct Dive into Backline'
  },
  {
    id: 'jinx',
    name: 'Jinx, Loose Cannon',
    role: 'ADC',
    icon: '🚀',
    archetype: 'Hypercarry',
    tier: 'S',
    power: 93,
    counters: ['ezreal', 'zeri', 'sivir'],
    counteredBy: ['kaisa', 'samira', 'tristana'],
    signatureMove: 'Get Excited Rocket Pentakill'
  },
  {
    id: 'varus',
    name: 'Varus, Arrow of Retribution',
    role: 'ADC',
    icon: '🏹',
    archetype: 'Poke',
    tier: 'A',
    power: 89,
    counters: ['caitlyn', 'ashe', 'lucian'],
    counteredBy: ['kaisa', 'zeri'],
    signatureMove: 'Piercing Arrow Objective Steal'
  },
  {
    id: 'ezreal',
    name: 'Ezreal, Prodigal Explorer',
    role: 'ADC',
    icon: '✨',
    archetype: 'Poke',
    tier: 'A',
    power: 88,
    counters: ['blitzcrank', 'nautilus'],
    counteredBy: ['jinx', 'caitlyn'],
    signatureMove: 'Arcane Shift Trueshot Barrage Snipe'
  },
  {
    id: 'kalista',
    name: 'Kalista, Spear of Vengeance',
    role: 'ADC',
    icon: '⚡',
    archetype: 'Hypercarry',
    tier: 'S',
    power: 91,
    counters: ['ezreal', 'jhin', 'ashe'],
    counteredBy: ['nautilus', 'ashe'],
    signatureMove: 'Fate’s Call Objective Secure Rend'
  },

  // SUPPORT
  {
    id: 'nautilus',
    name: 'Nautilus, Titan of the Depths',
    role: 'SUP',
    icon: '⚓',
    archetype: 'Engage Tank',
    tier: 'S+',
    power: 94,
    counters: ['lulu', 'nami', 'soraka', 'sona'],
    counteredBy: ['morgana', 'braum', 'thresh'],
    signatureMove: 'Depth Charge Point-and-Click CC'
  },
  {
    id: 'thresh',
    name: 'Thresh, Chain Warden',
    role: 'SUP',
    icon: '🏮',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 92,
    counters: ['leona', 'alistar', 'nautilus'],
    counteredBy: ['morgana', 'zyra'],
    signatureMove: 'Death Sentence Blind Prediction Hook'
  },
  {
    id: 'rakan',
    name: 'Rakan, Charmer',
    role: 'SUP',
    icon: '🦚',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 93,
    counters: ['braum', 'alistar', 'tahm'],
    counteredBy: ['poppy', 'janna'],
    signatureMove: 'The Quickness Grand Entrance W Combo'
  },
  {
    id: 'renata',
    name: 'Renata Glasc, Chem-Baroness',
    role: 'SUP',
    icon: '🧪',
    archetype: 'Enchanter',
    tier: 'A',
    power: 90,
    counters: ['kaisa', 'jinx', 'samira'],
    counteredBy: ['blitzcrank', 'pyke'],
    signatureMove: 'Hostile Takeover Enemy Friendly Fire'
  },
  {
    id: 'lulu',
    name: 'Lulu, Fae Sorceress',
    role: 'SUP',
    icon: '🧚',
    archetype: 'Enchanter',
    tier: 'A',
    power: 87,
    counters: ['zed', 'talon', 'leblanc'],
    counteredBy: ['nautilus', 'blitzcrank', 'pyke'],
    signatureMove: 'Wild Growth Hypercarry Shield Deny'
  }
];
