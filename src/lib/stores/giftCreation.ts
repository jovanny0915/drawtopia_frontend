/**
 * Gift Creation Store
 * Manages the gift creation state throughout the gift flow
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Gift } from '../database/gifts';

export interface GiftCreationState {
  // Step 1 data
  childName?: string;
  ageGroup?: string;
  relationship?: string;
  
  // Step 2 data
  occasion?: string;
  selectedStory?: {
    id: number;
    title: string;
    description: string;
  };
  
  // Step 3 data
  specialMsg?: string;
  deliveryEmail?: string;
  deliveryTime?: string;
  deliveryOption?: 'surprise' | 'scheduled';
  
  // Additional data
  childProfileId?: string;
  giftId?: string;
}

// Create the store
const createGiftCreationStore = () => {
  const { subscribe, set, update } = writable<GiftCreationState>({});

  return {
    subscribe,
    set,
    update,
    
    // Initialize from sessionStorage
    init: () => {
      if (browser) {
        const childName = sessionStorage.getItem('gift_child_name');
        const ageGroup = sessionStorage.getItem('gift_age_group');
        const relationship = sessionStorage.getItem('gift_relationship');
        const occasion = sessionStorage.getItem('gift_occasion');
        const specialMsg = sessionStorage.getItem('gift_special_msg');
        const deliveryEmail = sessionStorage.getItem('gift_delivery_email');
        const deliveryTime = sessionStorage.getItem('gift_delivery_time');
        const deliveryOption = sessionStorage.getItem('gift_delivery_option');
        const childProfileId = sessionStorage.getItem('gift_child_profile_id');
        const giftId = sessionStorage.getItem('gift_id');
        
        const selectedStoryData = sessionStorage.getItem('gift_selected_story');
        let selectedStory;
        try {
          selectedStory = selectedStoryData ? JSON.parse(selectedStoryData) : undefined;
        } catch (e) {
          console.warn('Failed to parse selected story from sessionStorage');
        }
        
        const newState: GiftCreationState = {
          childName: childName || undefined,
          ageGroup: ageGroup || undefined,
          relationship: relationship || undefined,
          occasion: occasion || undefined,
          selectedStory: selectedStory || undefined,
          specialMsg: specialMsg || undefined,
          deliveryEmail: deliveryEmail || undefined,
          deliveryTime: deliveryTime || undefined,
          deliveryOption: deliveryOption as any || undefined,
          childProfileId: childProfileId || undefined,
          giftId: giftId || undefined
        };
        
        console.log('Initializing gift creation state from sessionStorage:', newState);
        set(newState);
      }
    },

    // Step 1: Set recipient details
    setRecipientDetails: (details: {
      childName?: string;
      ageGroup?: string;
      relationship?: string;
      childProfileId?: string;
    }) => {
      update(state => ({ ...state, ...details }));
      if (browser) {
        if (details.childName) sessionStorage.setItem('gift_child_name', details.childName);
        if (details.ageGroup) sessionStorage.setItem('gift_age_group', details.ageGroup);
        if (details.relationship) sessionStorage.setItem('gift_relationship', details.relationship);
        if (details.childProfileId) sessionStorage.setItem('gift_child_profile_id', details.childProfileId);
      }
    },

    // Step 2: Set occasion and story
    setOccasionAndStory: (details: {
      occasion?: string;
      selectedStory?: {
        id: number;
        title: string;
        description: string;
      };
    }) => {
      update(state => ({ ...state, ...details }));
      if (browser) {
        if (details.occasion) sessionStorage.setItem('gift_occasion', details.occasion);
        if (details.selectedStory) {
          sessionStorage.setItem('gift_selected_story', JSON.stringify(details.selectedStory));
        }
      }
    },

    // Step 3: Set delivery details
    setDeliveryDetails: (details: {
      specialMsg?: string;
      deliveryEmail?: string;
      deliveryTime?: string;
      deliveryOption?: 'surprise' | 'scheduled';
    }) => {
      update(state => ({ ...state, ...details }));
      if (browser) {
        if (details.specialMsg) sessionStorage.setItem('gift_special_msg', details.specialMsg);
        if (details.deliveryEmail) sessionStorage.setItem('gift_delivery_email', details.deliveryEmail);
        if (details.deliveryTime) sessionStorage.setItem('gift_delivery_time', details.deliveryTime);
        if (details.deliveryOption) sessionStorage.setItem('gift_delivery_option', details.deliveryOption);
      }
    },

    // Set gift ID after creation
    setGiftId: (id: string) => {
      update(state => ({ ...state, giftId: id }));
      if (browser) {
        sessionStorage.setItem('gift_id', id);
      }
    },

    // Clear all data
    clear: () => {
      set({});
      if (browser) {
        sessionStorage.removeItem('gift_child_name');
        sessionStorage.removeItem('gift_age_group');
        sessionStorage.removeItem('gift_relationship');
        sessionStorage.removeItem('gift_occasion');
        sessionStorage.removeItem('gift_selected_story');
        sessionStorage.removeItem('gift_special_msg');
        sessionStorage.removeItem('gift_delivery_email');
        sessionStorage.removeItem('gift_delivery_time');
        sessionStorage.removeItem('gift_delivery_option');
        sessionStorage.removeItem('gift_child_profile_id');
        sessionStorage.removeItem('gift_id');
      }
    },

    // Convert current state to Gift object for database
    toGiftObject: (state: GiftCreationState): Gift => {
      if (!state.childName || !state.ageGroup || !state.relationship || 
          !state.occasion || !state.deliveryEmail) {
        throw new Error('Missing required gift data');
      }
      
      // Determine delivery time based on option
      let deliveryTime = state.deliveryTime || '';
      if (state.deliveryOption === 'surprise') {
        // For surprise/immediate delivery, use current time in ISO format
        deliveryTime = new Date().toISOString();
      }
      
      return {
        child_name: state.childName,
        age_group: state.ageGroup,
        relationship: state.relationship,
        occasion: state.occasion,
        special_msg: state.specialMsg || '',
        delivery_email: state.deliveryEmail,
        delivery_time: deliveryTime,
        child_profile_id: state.childProfileId,
        status: 'generating'
      };
    }
  };
};

export const giftCreation = createGiftCreationStore();

// Auto-initialize the store when the module is loaded (handles page refreshes)
if (browser) {
  giftCreation.init();
}
