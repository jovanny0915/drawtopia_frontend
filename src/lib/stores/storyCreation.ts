/**
 * Story Creation Store
 * Manages the story creation state throughout the character creation flow
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Story } from '../database/stories';

export interface StoryCreationState {
  selectedChildProfileId?: string;
  selectedChildProfileName?: string;
  characterId?: number;
  characterName?: string;
  characterType?: 'person' | 'animal' | 'magical_creature';
  specialAbility?: string;
  characterStyle?: '3d' | 'cartoon' | 'anime';
  selectedFormat?: 'interactive' | 'story';
  storyWorld?: 'forest' | 'space' | 'underwater';
  adventureType?: 'treasure_hunt' | 'helping_friend';
  originalImageUrl?: string;
  enhancedImages?: string[];
  storyTitle?: string;
  coverDesign?: string;
  storyCover?: string;
  storyId?: string;
}

// Create the store
const createStoryCreationStore = () => {
  const { subscribe, set, update } = writable<StoryCreationState>({});

  return {
    subscribe,
    set,
    update,
    
    // Initialize from sessionStorage
    init: () => {
      if (browser) {
        const selectedChildProfileId = sessionStorage.getItem('selectedChildProfileId');
        const selectedChildProfileName = sessionStorage.getItem('selectedChildProfileName');
        const characterIdStr = sessionStorage.getItem('characterId');
        const characterName = sessionStorage.getItem('characterName');
        const characterType = sessionStorage.getItem('selectedCharacterType');
        const specialAbility = sessionStorage.getItem('specialAbility');
        const characterStyle = sessionStorage.getItem('selectedStyle');
        const selectedFormat = sessionStorage.getItem('selectedFormat');
        const storyWorld = sessionStorage.getItem('selectedWorld');
        const adventureType = sessionStorage.getItem('selectedAdventure');
        const originalImageUrl = sessionStorage.getItem('characterImageUrl')
          || sessionStorage.getItem('selectedCharacterEnhancedImage');
        const storyTitle = sessionStorage.getItem('storyTitle');
        const coverDesign = sessionStorage.getItem('coverDesign');
        const storyCover = sessionStorage.getItem('storyCover')
          || sessionStorage.getItem('selectedImage_step6');
        const storyId = sessionStorage.getItem('currentStoryId');
        console.log(selectedChildProfileId);
        // Load enhanced images if they exist
        const enhancedImages: string[] = [];
        if (characterStyle) {
          const enhancements = ['minimal', 'normal', 'high'];
          enhancements.forEach(enhancement => {
            const enhancementKey = `enhancementImage_${characterStyle}_${enhancement}`;
            const enhancedImageUrl = sessionStorage.getItem(enhancementKey);
            if (enhancedImageUrl) {
              enhancedImages.push(enhancedImageUrl.split('?')[0]);
            }
          });
        }
        
        const newState = {
          selectedChildProfileId: selectedChildProfileId ? selectedChildProfileId : "undefined",
          selectedChildProfileName: selectedChildProfileName || undefined,
          characterId: characterIdStr ? parseInt(characterIdStr) : undefined,
          characterName: characterName || undefined,
          characterType: characterType as any || undefined,
          specialAbility: specialAbility || undefined,
          characterStyle: characterStyle as any || undefined,
          selectedFormat: selectedFormat as any || undefined,
          storyWorld: storyWorld as any || undefined,
          adventureType: adventureType as any || undefined,
          originalImageUrl: originalImageUrl || undefined,
          enhancedImages: enhancedImages.length > 0 ? enhancedImages : undefined,
          storyTitle: storyTitle || undefined,
          coverDesign: coverDesign || undefined,
          storyCover: storyCover || undefined,
          storyId: storyId || undefined
        };
        
        console.log('Initializing story creation state from sessionStorage:', newState);
        set(newState);
      }
    },

    // Update selected child profile
    setSelectedChild: (childId: string, childName: string) => {
      update(state => ({ ...state, selectedChildProfileId: childId, selectedChildProfileName: childName }));
      if (browser) {
        sessionStorage.setItem('selectedChildProfileId', childId);
        sessionStorage.setItem('selectedChildProfileName', childName);
      }
    },

    // Update character details
    setCharacterDetails: (details: {
      characterName?: string;
      characterType?: 'person' | 'animal' | 'magical_creature';
      specialAbility?: string;
    }) => {
      update(state => ({ ...state, ...details }));
      if (browser) {
        if (details.characterName) sessionStorage.setItem('characterName', details.characterName);
        if (details.characterType) sessionStorage.setItem('selectedCharacterType', details.characterType);
        if (details.specialAbility) sessionStorage.setItem('specialAbility', details.specialAbility);
      }
    },

    // Update style selection
    setCharacterStyle: (style: '3d' | 'cartoon' | 'anime') => {
      update(state => ({ ...state, characterStyle: style }));
      if (browser) {
        sessionStorage.setItem('selectedStyle', style);
      }
    },

    // Update format selection
    setSelectedFormat: (format: 'interactive' | 'story') => {
      update(state => ({ ...state, selectedFormat: format }));
      if (browser) {
        sessionStorage.setItem('selectedFormat', format);
      }
    },

    // Update world selection
    setStoryWorld: (world: 'forest' | 'space' | 'underwater') => {
      update(state => ({ ...state, storyWorld: world }));
      if (browser) {
        sessionStorage.setItem('selectedWorld', world);
      }
    },

    // Update adventure type
    setAdventureType: (adventure: 'treasure_hunt' | 'helping_friend') => {
      update(state => ({ ...state, adventureType: adventure }));
      if (browser) {
        sessionStorage.setItem('selectedAdventure', adventure);
      }
    },

    // Update original image URL
    setOriginalImageUrl: (url: string) => {
      update(state => ({ ...state, originalImageUrl: url }));
      if (browser) {
        sessionStorage.setItem('characterImageUrl', url);
      }
    },

    // Update enhanced images
    setEnhancedImages: (images: string[]) => {
      update(state => ({ ...state, enhancedImages: images }));
    },

    // Update story title and cover design
    setStoryPresentation: (title: string, coverDesign: string, storyCover?: string) => {
      update(state => ({ ...state, storyTitle: title, coverDesign, storyCover }));
      if (browser) {
        sessionStorage.setItem('storyTitle', title);
        sessionStorage.setItem('coverDesign', coverDesign);
        if (storyCover) {
          sessionStorage.setItem('storyCover', storyCover);
        }
      }
    },

    // Set story ID after creation
    setStoryId: (id: string) => {
      update(state => ({ ...state, storyId: id }));
      if (browser) sessionStorage.setItem('currentStoryId', id);
    },

    /** Hydrate store and sessionStorage from a Supabase story row (e.g. when editing a draft from dashboard). */
    hydrateFromStory: (row: Record<string, any>) => {
      if (!row || !browser) return;
      const s = row;
      const childProfileId = s.child_profile_id ?? s.childProfileId ?? '';
      const characterId = s.character_id ?? s.characterId;
      const characterName = s.character_name ?? s.characterName ?? '';
      const characterType = (s.character_type ?? s.characterType ?? 'person') as 'person' | 'animal' | 'magical_creature';
      const specialAbility = s.special_ability ?? s.specialAbility ?? '';
      const characterStyle = (s.character_style ?? s.characterStyle ?? 'cartoon') as '3d' | 'cartoon' | 'anime';
      const storyWorld = (s.story_world ?? s.storyWorld ?? 'forest') as 'forest' | 'space' | 'underwater';
      const adventureType = (s.adventure_type ?? s.adventureType ?? 'treasure_hunt') as 'treasure_hunt' | 'helping_friend';
      const originalImageUrl = (s.original_image_url ?? s.originalImageUrl ?? '').split('?')[0];
      const enhancedImages: string[] = Array.isArray(s.enhanced_images) ? s.enhanced_images.map((u: string) => (u || '').split('?')[0]) : (s.enhancedImages ?? []);
      const storyTitle = s.story_title ?? s.storyTitle ?? '';
      const coverDesign = s.cover_design ?? s.coverDesign ?? '';
      const storyCover = (s.story_cover ?? s.storyCover ?? '').split('?')[0];
      const storyType = s.story_type ?? s.storyType ?? 'story';
      const selectedFormat = (storyType === 'search' || storyType === 'interactive_search' ? 'interactive' : 'story') as 'interactive' | 'story';
      const storyId = s.uid ?? s.id ?? s.storyId ?? '';

      sessionStorage.setItem('selectedChildProfileId', String(childProfileId));
      sessionStorage.setItem('characterId', characterId != null ? String(characterId) : '');
      sessionStorage.setItem('characterName', characterName);
      sessionStorage.setItem('selectedCharacterType', characterType);
      sessionStorage.setItem('specialAbility', specialAbility);
      sessionStorage.setItem('selectedStyle', characterStyle);
      sessionStorage.setItem('selectedWorld', storyWorld);
      sessionStorage.setItem('selectedAdventure', adventureType);
      sessionStorage.setItem('characterImageUrl', originalImageUrl);
      sessionStorage.setItem('selectedCharacterEnhancedImage', originalImageUrl);
      sessionStorage.setItem('storyTitle', storyTitle);
      sessionStorage.setItem('coverDesign', coverDesign);
      if (storyCover) {
        sessionStorage.setItem('storyCover', storyCover);
        sessionStorage.setItem('selectedImage_step6', storyCover);
      }
      sessionStorage.setItem('selectedFormat', selectedFormat);
      sessionStorage.setItem('currentStoryId', String(storyId));

      set({
        selectedChildProfileId: String(childProfileId),
        characterId: characterId != null ? Number(characterId) : undefined,
        characterName: characterName || undefined,
        characterType,
        specialAbility: specialAbility || undefined,
        characterStyle,
        storyWorld,
        adventureType,
        originalImageUrl: originalImageUrl || undefined,
        enhancedImages: enhancedImages.length > 0 ? enhancedImages : undefined,
        storyTitle: storyTitle || undefined,
        coverDesign: coverDesign || undefined,
        storyCover: storyCover || undefined,
        selectedFormat,
        storyId: storyId ? String(storyId) : undefined
      });
    },

    // Clear all data
    clear: () => {
      set({});
      if (browser) {
        sessionStorage.removeItem('selectedChildProfileId');
        sessionStorage.removeItem('selectedChildProfileName');
        sessionStorage.removeItem('characterName');
        sessionStorage.removeItem('selectedCharacterType');
        sessionStorage.removeItem('specialAbility');
        sessionStorage.removeItem('selectedStyle');
        sessionStorage.removeItem('selectedFormat');
        sessionStorage.removeItem('selectedWorld');
        sessionStorage.removeItem('selectedAdventure');
        sessionStorage.removeItem('characterImageUrl');
        sessionStorage.removeItem('storyTitle');
        sessionStorage.removeItem('coverDesign');
        sessionStorage.removeItem('storyCover');
      }
    },

    // Convert current state to Story object for database
    toStoryObject: (state: StoryCreationState): Partial<Story> => {
      if (!state.selectedChildProfileId || !state.characterName || !state.characterType ||
          !state.characterStyle || !state.storyWorld || !state.adventureType || !state.originalImageUrl) {
        throw new Error('Missing required story data');
      }
      console.log(state);
      return {
        child_profile_id: state.selectedChildProfileId,
        character_id: state.characterId || undefined,
        character_name: state.characterName,
        character_type: state.characterType,
        special_ability: state.specialAbility,
        character_style: state.characterStyle,
        story_world: state.storyWorld,
        adventure_type: state.adventureType,
        original_image_url: state.originalImageUrl,
        enhanced_images: state.enhancedImages || [],
        story_title: state.storyTitle,
        cover_design: state.coverDesign,
        story_cover: state.storyCover,
        story_type: state.selectedFormat,
        status: 'generating'
      };
    }
  };
};

export const storyCreation = createStoryCreationStore();

// Auto-initialize the store when the module is loaded (handles page refreshes)
if (browser) {
  storyCreation.init();
}
