import { SoloQueueEvent } from '../types/game';

export const SOLO_QUEUE_EVENTS: SoloQueueEvent[] = [
  {
    id: 'baron_coinflip',
    title: '36-Minute Baron Standoff',
    scenario: 'The enemy team rushed Baron Nashor in the fog of war. It is at 3,200 HP. Your jungler is dead, but you have Flash and your Ultimate ready!',
    contextTag: 'Baron Fight',
    options: [
      {
        label: 'Blind Flash-In for 50/50 Steal',
        description: 'Trust your raw mechanics and burst combo to steal the buff and kill their carry.',
        risk: 'High',
        mechanicsReq: 45,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mechanics * 0.8 + stats.mental * 0.2);
          if (success) {
            return {
              success: true,
              log: 'HOLY S***! You Flash over the pit wall, smite-burst Baron at 400 HP, and execute their ADC! Solo carry pentakill!',
              lpDelta: 28,
              mechanicsDelta: 2,
              mentalDelta: 5,
              fameDelta: 6,
              moneyDelta: 30
            };
          } else {
            return {
              success: false,
              log: 'You Flashed into 4 CC skillshots and got vaporized in 0.2 seconds. Enemy took Baron and ended the game.',
              lpDelta: -20,
              mechanicsDelta: 1,
              mentalDelta: -6,
              fameDelta: -2
            };
          }
        }
      },
      {
        label: 'Zone From River & Poke Safely',
        description: 'Choke them in the river entrance to delay until teammates respawn.',
        risk: 'Medium',
        mentalReq: 35,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mental * 0.7 + stats.mechanics * 0.3);
          if (success) {
            return {
              success: true,
              log: 'Disciplined play! You zoned 2 squishies, forced them off Baron, and your team cleaned up.',
              lpDelta: 22,
              mechanicsDelta: 1,
              mentalDelta: 4,
              fameDelta: 3
            };
          } else {
            return {
              success: false,
              log: 'Enemy tank flashed forward with hard CC. You had to burn Flash and they secured Baron cleanly.',
              lpDelta: -16,
              mechanicsDelta: 0,
              mentalDelta: -3,
              fameDelta: 0
            };
          }
        }
      },
      {
        label: 'Cross-Map Base Rush',
        description: 'Abandon Baron and sprint down bot lane to trade their inhibitor tower.',
        risk: 'Low',
        execute: () => {
          return {
            success: true,
            log: 'Macro trade! You took bot inhib, forcing 2 enemies to recall. The game stays alive.',
            lpDelta: 18,
            mechanicsDelta: 0,
            mentalDelta: 2,
            fameDelta: 1
          };
        }
      }
    ]
  },
  {
    id: 'toxic_teammate',
    title: 'Teammate Mental Boom in Chat',
    scenario: 'Your Top laner died twice before 4 minutes, pinged your Summoner Spells 20 times, and is typing: "FF 15 open mid rep jungle".',
    contextTag: 'Team Comms',
    options: [
      {
        label: '/mute all & 1v9 Solo Carry',
        description: 'Keep your composure, disable toxic chat, and farm every jungle camp to carry.',
        risk: 'Medium',
        mentalReq: 40,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mental * 0.8 + 20);
          if (success) {
            return {
              success: true,
              log: 'Stone cold composure. You went 11/1/6 while ignoring the clown fiesta. Your team won in 27m!',
              lpDelta: 24,
              mechanicsDelta: 2,
              mentalDelta: 6,
              fameDelta: 4
            };
          } else {
            return {
              success: false,
              log: 'You played your heart out, but the 0/9 feeder gifted enemy hypercarry too many bounties.',
              lpDelta: -15,
              mechanicsDelta: 1,
              mentalDelta: -4,
              fameDelta: 0
            };
          }
        }
      },
      {
        label: 'Type a Motivational Speech',
        description: 'Encourage the team: "Guys we scale late, just peel for me and we easily win!"',
        risk: 'Low',
        execute: () => {
          const worked = Math.random() > 0.45;
          if (worked) {
            return {
              success: true,
              log: 'Incredible leadership! The feeder calmed down, locked in, and actually landed a crucial ultimate!',
              lpDelta: 25,
              mechanicsDelta: 0,
              mentalDelta: 8,
              fameDelta: 5
            };
          } else {
            return {
              success: false,
              log: 'They replied: "ok clown enjoy losing LP" and went AFK at fountain.',
              lpDelta: -18,
              mechanicsDelta: 0,
              mentalDelta: -8,
              fameDelta: 0
            };
          }
        }
      },
      {
        label: 'Flame Back with Spicy Comebacks',
        description: 'Unleash your spicy keyboard warrior skills in all-chat.',
        risk: 'High',
        execute: () => {
          return {
            success: false,
            log: 'You spent 5 minutes typing essays instead of farming. You lost the game and got a 1-game chat warning!',
            lpDelta: -22,
            mechanicsDelta: 0,
            mentalDelta: -14,
            fameDelta: -3
          };
        }
      }
    ]
  },
  {
    id: 'tower_dive_defense',
    title: 'Level 3 1v2 Tower Dive Defense',
    scenario: 'Enemy mid laner pushed a 12-minion stacked wave under your tower, and their jungler appears from the raptor bush for a 2v1 dive!',
    contextTag: 'Laning Phase',
    options: [
      {
        label: 'Flash Under Tower & Turn Aggro',
        description: 'Bait their first skillshot, Flash into tower range, and stun them under turret.',
        risk: 'Medium',
        mechanicsReq: 40,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mechanics * 0.9);
          if (success) {
            return {
              success: true,
              log: 'FAKER-LEVEL OUTPLAY! You dodged the stun, CC’d the jungler under tower, and picked up a Double Kill + First Blood!',
              lpDelta: 26,
              mechanicsDelta: 3,
              mentalDelta: 5,
              fameDelta: 7,
              moneyDelta: 50
            };
          } else {
            return {
              success: false,
              log: 'Miscalculated the cooldown! You took tower shot and died without getting the trade.',
              lpDelta: -17,
              mechanicsDelta: 1,
              mentalDelta: -4,
              fameDelta: -1
            };
          }
        }
      },
      {
        label: 'Give Up Wave & Retreat Safely',
        description: 'Walk back to tier-2 tower. Lose 12 minions of gold and XP, but stay alive.',
        risk: 'Low',
        execute: () => {
          return {
            success: true,
            log: 'Safe macro patience. You sacrificed 300 gold in CS, but avoided feeding kills. You stabilize at 15 min.',
            lpDelta: 19,
            mechanicsDelta: 0,
            mentalDelta: 3,
            fameDelta: 1
          };
        }
      }
    ]
  },
  {
    id: 'scout_watching',
    title: 'Pro Scout Spectating Your Ranked Game',
    scenario: 'Twitch chat informs you: "OMG BRO CLOUD9 AND T1 SCOUTS ARE IN CHAT WATCHING YOUR GAME RIGHT NOW!!"',
    contextTag: 'Early Game',
    options: [
      {
        label: 'Lock In Your Signature High-Skill Carry',
        description: 'Show off 400 APM mechanics and explosive mechanical dominance.',
        risk: 'High',
        mechanicsReq: 50,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mechanics * 0.85);
          if (success) {
            return {
              success: true,
              log: 'HIGHLIGHT REEL VIRAL CLIP! You dropped a 17/2/8 masterclass. The scouts immediately sent a direct message!',
              lpDelta: 32,
              mechanicsDelta: 4,
              mentalDelta: 8,
              fameDelta: 15,
              moneyDelta: 100
            };
          } else {
            return {
              success: false,
              log: 'Stage fright! You over-forced aggressive trades, got ganked 4 times, and chat spammed "SCOUT DIFF".',
              lpDelta: -19,
              mechanicsDelta: 1,
              mentalDelta: -10,
              fameDelta: 2
            };
          }
        }
      },
      {
        label: 'Play Solid Macro Roaming Champ',
        description: 'Showcase map awareness, wave control, and team utility.',
        risk: 'Low',
        execute: () => {
          return {
            success: true,
            log: 'Clean performance! The scouts took notes: "Extremely reliable shotcalling, calm temperament under spotlight."',
            lpDelta: 24,
            mechanicsDelta: 1,
            mentalDelta: 6,
            fameDelta: 8,
            moneyDelta: 40
          };
        }
      }
    ]
  },
  {
    id: 'nexus_last_stand',
    title: '1-HP Nexus Defense',
    scenario: 'All 3 of your inhibitors are down. Enemy has 5 members charging your naked Nexus at 42 minutes! 30 seconds until teammates respawn!',
    contextTag: 'Mid Game',
    options: [
      {
        label: '1v5 Heroic Teleport Backline Dive',
        description: 'Teleport behind the minion wave and assassinate their 6-item ADC before they hit the Nexus.',
        risk: 'High',
        mechanicsReq: 55,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mechanics * 0.75 + stats.mental * 0.25);
          if (success) {
            return {
              success: true,
              log: 'UNBELIEVABLE MIRACLE! You one-shot their carry with 10 HP left on your Nexus, held off super minions, and your team pushed down mid for the WIN!',
              lpDelta: 35,
              mechanicsDelta: 5,
              mentalDelta: 10,
              fameDelta: 18,
              moneyDelta: 120
            };
          } else {
            return {
              success: false,
              log: 'Heartbreaking! You killed their ADC, but their tank auto-attacked the Nexus once. DEFEAT.',
              lpDelta: -21,
              mechanicsDelta: 2,
              mentalDelta: -8,
              fameDelta: 2
            };
          }
        }
      },
      {
        label: 'Spam Waveclear & Stall for Respawn',
        description: 'Focus entirely on clearing super-minions from maximum range.',
        risk: 'Medium',
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mental * 0.7 + stats.mechanics * 0.3);
          if (success) {
            return {
              success: true,
              log: 'Disciplined defense! Super minions died before reaching range. Teammates respawned and counter-aced!',
              lpDelta: 26,
              mechanicsDelta: 1,
              mentalDelta: 7,
              fameDelta: 6
            };
          } else {
            return {
              success: false,
              log: 'Enemy support dove to CC you, allowing minion autos to chip the final 200 HP off Nexus.',
              lpDelta: -18,
              mechanicsDelta: 1,
              mentalDelta: -5,
              fameDelta: 0
            };
          }
        }
      }
    ]
  }
];
