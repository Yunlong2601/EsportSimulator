import { PatchNote } from '../types/game';

export const PATCH_NOTES_HISTORY: PatchNote[] = [
  {
    version: 'Patch 14.20: Worlds Championship Meta',
    headline: 'The Official Worlds Championship Tournament Patch',
    description: 'Targeted changes to ensure exciting playmaking, high-skill ceiling assassins, and deep teamfight wombo-combos under the global spotlight.',
    changes: [
      {
        champId: 'ahri',
        champName: 'Ahri',
        type: 'BUFF',
        changeText: 'Spirit Rush cooldown reduced by 15s; Charm missile speed increased by 10%.',
        powerDelta: 4
      },
      {
        champId: 'ksante',
        champName: "K'Sante",
        type: 'NERF',
        changeText: 'All Out armor conversion reduced by 12%; W kidnap cast delay increased.',
        powerDelta: -5
      },
      {
        champId: 'azir',
        champName: 'Azir',
        type: 'BUFF',
        changeText: "Emperor's Divide wall width widened by 1 soldier; Soldier AP ratio increased.",
        powerDelta: 3
      },
      {
        champId: 'kaisa',
        champName: "Kai'Sa",
        type: 'BUFF',
        changeText: 'Killer Instinct shield value increased by 20% when diving enemy backline.',
        powerDelta: 4
      },
      {
        champId: 'leesin',
        champName: 'Lee Sin',
        type: 'BUFF',
        changeText: 'Dragon Rage kick base damage increased by 75 at all ranks.',
        powerDelta: 3
      },
      {
        champId: 'sejuani',
        champName: 'Sejuani',
        type: 'NERF',
        changeText: 'Permafrost stun duration reduced by 0.25 seconds.',
        powerDelta: -3
      }
    ]
  },
  {
    version: 'Patch 14.19: Play-Ins Hotfix',
    headline: 'Swiss Stage Emergent Meta Shift',
    description: 'Hotfix addressing excessive poke dominance in bot lane and restoring agency to engage supports.',
    changes: [
      {
        champId: 'nautilus',
        champName: 'Nautilus',
        type: 'BUFF',
        changeText: 'Dredge Line mana cost flattened to 50 at all ranks.',
        powerDelta: 3
      },
      {
        champId: 'varus',
        champName: 'Varus',
        type: 'NERF',
        changeText: 'Piercing Arrow lethal lethality scaling reduced by 8%.',
        powerDelta: -4
      }
    ]
  }
];
