import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface CharacterState {
  characterName: string;
  selectedCharacterType: string;
  specialAbility: string;
  characterImageUrl: string;
  
  selectedStyle: string;
  
  selectedWorld: string;
  selectedAdventure: string;
  
  selectedTitle: string;
  selectedCoverDesign: string;
  
  selectedEnhancement: string;
}

const defaultCharacterState: CharacterState = {
  characterName: '',
  selectedCharacterType: 'person',
  specialAbility: '',
  characterImageUrl: '',
  selectedStyle: 'cartoon',
  selectedWorld: 'underwater',
  selectedAdventure: 'treasure',
  selectedTitle: '',
  selectedCoverDesign: 'Classic Storybook',
  selectedEnhancement: 'normal'
};

function createCharacterStore() {
  const { subscribe, set, update } = writable<CharacterState>(defaultCharacterState);

  return {
    subscribe,
    
    init: () => {
      if (browser) {
        const stored = sessionStorage.getItem('characterState');
        if (stored) {
          try {
            const parsedState = JSON.parse(stored);
            set({ ...defaultCharacterState, ...parsedState });
          } catch (error) {
            console.error('Error parsing stored character state:', error);
            set(defaultCharacterState);
          }
        } else {
          const characterName = sessionStorage.getItem('characterName') || '';
          const selectedCharacterType = sessionStorage.getItem('selectedCharacterType') || 'person';
          const specialAbility = sessionStorage.getItem('specialAbility') || '';
          const characterImageUrl = sessionStorage.getItem('characterImageUrl') || '';
          const selectedStyle = sessionStorage.getItem('selectedStyle') || 'cartoon';
          const selectedWorld = sessionStorage.getItem('selectedWorld') || 'underwater';
          const selectedAdventure = sessionStorage.getItem('selectedAdventure') || 'treasure';
          const selectedEnhancement = sessionStorage.getItem('selectedEnhancement') || 'normal';

          const state: CharacterState = {
            ...defaultCharacterState,
            characterName,
            selectedCharacterType,
            specialAbility,
            characterImageUrl,
            selectedStyle,
            selectedWorld,
            selectedAdventure,
            selectedEnhancement
          };

          set(state);
          sessionStorage.setItem('characterState', JSON.stringify(state));
        }
      }
    },

    save: (state: CharacterState) => {
      if (browser) {
        sessionStorage.setItem('characterState', JSON.stringify(state));
        sessionStorage.setItem('characterName', state.characterName);
        sessionStorage.setItem('selectedCharacterType', state.selectedCharacterType);
        sessionStorage.setItem('specialAbility', state.specialAbility);
        sessionStorage.setItem('characterImageUrl', state.characterImageUrl);
        sessionStorage.setItem('selectedStyle', state.selectedStyle);
        sessionStorage.setItem('selectedWorld', state.selectedWorld);
        sessionStorage.setItem('selectedAdventure', state.selectedAdventure);
        sessionStorage.setItem('selectedEnhancement', state.selectedEnhancement);
      }
      set(state);
    },

    updateCharacterInfo: (name: string, type: string, ability: string) => {
      update(state => {
        const newState = { ...state, characterName: name, selectedCharacterType: type, specialAbility: ability };
        if (browser) {
          sessionStorage.setItem('characterState', JSON.stringify(newState));
          sessionStorage.setItem('characterName', name);
          sessionStorage.setItem('selectedCharacterType', type);
          sessionStorage.setItem('specialAbility', ability);
        }
        return newState;
      });
    },

    updateStyle: (style: string) => {
      update(state => {
        const newState = { ...state, selectedStyle: style };
        if (browser) {
          sessionStorage.setItem('characterState', JSON.stringify(newState));
          sessionStorage.setItem('selectedStyle', style);
        }
        return newState;
      });
    },

    updateEnhancement: (enhancement: string) => {
      update(state => {
        const newState = { ...state, selectedEnhancement: enhancement };
        if (browser) {
          sessionStorage.setItem('characterState', JSON.stringify(newState));
          sessionStorage.setItem('selectedEnhancement', enhancement);
        }
        return newState;
      });
    },

    updateWorld: (world: string) => {
      update(state => {
        const newState = { ...state, selectedWorld: world };
        if (browser) {
          sessionStorage.setItem('characterState', JSON.stringify(newState));
          sessionStorage.setItem('selectedWorld', world);
        }
        return newState;
      });
    },

    updateAdventure: (adventure: string) => {
      update(state => {
        const newState = { ...state, selectedAdventure: adventure };
        if (browser) {
          sessionStorage.setItem('characterState', JSON.stringify(newState));
          sessionStorage.setItem('selectedAdventure', adventure);
        }
        return newState;
      });
    },

    updateTitle: (title: string) => {
      update(state => {
        const newState = { ...state, selectedTitle: title };
        if (browser) {
          sessionStorage.setItem('characterState', JSON.stringify(newState));
        }
        return newState;
      });
    },

    updateCoverDesign: (design: string) => {
      update(state => {
        const newState = { ...state, selectedCoverDesign: design };
        if (browser) {
          sessionStorage.setItem('characterState', JSON.stringify(newState));
        }
        return newState;
      });
    },

    updateImageUrl: (url: string) => {
      update(state => {
        const newState = { ...state, characterImageUrl: url };
        if (browser) {
          sessionStorage.setItem('characterState', JSON.stringify(newState));
          sessionStorage.setItem('characterImageUrl', url);
        }
        return newState;
      });
    },

    clear: () => {
      if (browser) {
        sessionStorage.removeItem('characterState');
        sessionStorage.removeItem('characterName');
        sessionStorage.removeItem('selectedCharacterType');
        sessionStorage.removeItem('specialAbility');
        sessionStorage.removeItem('characterImageUrl');
        sessionStorage.removeItem('selectedStyle');
        sessionStorage.removeItem('selectedWorld');
        sessionStorage.removeItem('selectedAdventure');
        sessionStorage.removeItem('selectedEnhancement');
      }
      set(defaultCharacterState);
    },

    reset: () => set(defaultCharacterState)
  };
}

export const characterStore = createCharacterStore();

export const styleNames = {
  "3d": "3D Realistic",
  "cartoon": "Cartoon", 
  "anime": "Anime"
} as const;

export const worldNames = {
  forest: "Enchanted Forest",
  outspace: "Outer Space",
  underwater: "Underwater Kingdom"
} as const;

export const adventureNames = {
  treasure: "Treasure Hunt",
  helping: "Helping a Friend"
} as const;

export const enhancementNames = {
  minimal: "Minimal Enhancement",
  normal: "Normal Enhancement", 
  high: "High Enhancement"
} as const;

export function getStyleDisplayName(styleId: string): string {
  return styleNames[styleId as keyof typeof styleNames] || styleId;
}

export function getWorldDisplayName(worldId: string): string {
  return worldNames[worldId as keyof typeof worldNames] || worldId;
}

export function getAdventureDisplayName(adventureId: string): string {
  return adventureNames[adventureId as keyof typeof adventureNames] || adventureId;
}

export function getEnhancementDisplayName(enhancementId: string): string {
  return enhancementNames[enhancementId as keyof typeof enhancementNames] || enhancementId;
}
