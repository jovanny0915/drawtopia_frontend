
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Gift } from '../database/gifts';

export interface GiftCreationState {
  childName?: string;
  ageGroup?: string;
  relationship?: string;
  
  occasion?: string;
  selectedStory?: {
    id: number;
    title: string;
    description: string;
  };
  
  specialMsg?: string;
  deliveryEmail?: string;
  deliveryTime?: string;
  deliveryOption?: 'surprise' | 'scheduled';
  
  childProfileId?: string;
  giftId?: string;
}

const createGiftCreationStore = () => {
  const { subscribe, set, update } = writable<GiftCreationState>({});

  return {
    subscribe,
    set,
    update,
    
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

    setGiftId: (id: string) => {
      update(state => ({ ...state, giftId: id }));
      if (browser) {
        sessionStorage.setItem('gift_id', id);
      }
    },

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

    toGiftObject: (state: GiftCreationState): Gift => {
      if (!state.childName || !state.ageGroup || !state.relationship || 
          !state.occasion || !state.deliveryEmail) {
        throw new Error('Missing required gift data');
      }
      
      let deliveryTime = state.deliveryTime || '';
      if (state.deliveryOption === 'surprise') {
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

if (browser) {
  giftCreation.init();
}
