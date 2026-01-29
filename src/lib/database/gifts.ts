/**
 * Gifts Database Operations
 */

import { getCurrentUser, checkUserExists } from '$lib/auth';
import { supabase } from '../supabase';
import { env } from '../env';

export interface Gift {
  id?: string;
  created_at?: string;
  user_id?: string; // Deprecated - use from_user_id instead
  status: 'generating' | 'completed' | 'failed';
  occasion: string;
  relationship: string;
  delivery_time: string;
  child_profile_id?: string;
  special_msg?: string;
  delivery_email: string;
  child_name: string;
  age_group: string;
  from_user_id?: string; // User ID of the sender
  to_user_id?: string; // User ID of the recipient (if they exist in system)
  checked?: boolean; // Whether the notification has been checked/viewed
  notification_sent?: boolean; // Whether push notification has been sent
  notification_sent_at?: string; // Timestamp when notification was sent
  notification_scheduled?: boolean; // Whether notification has been scheduled
  gift_type?: string; // Type of gift: "story" for created stories, or other types for link gifts
  story_id?: string; // Story ID when gift_type is "story"
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Create a new gift
 * @param gift - The gift data to insert
 * @returns Promise with operation result
 */
export async function createGift(gift: Gift): Promise<DatabaseResult> {
  console.log('Creating gift:', gift);
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Normalize recipient email
    const recipientEmail = gift.delivery_email?.toLowerCase().trim();

    // Try to find recipient user by email
    let recipientUserId: string | null = null;
    try {
      const userCheck = await checkUserExists(recipientEmail);
      if (userCheck.exists && userCheck.user) {
        recipientUserId = userCheck.user.id || null;
      }
    } catch (err) {
      console.log('Could not check recipient user, will store email only:', err);
    }

    // Determine gift_type and story_id based on gift_mode
    // Check gift_mode from sessionStorage (client-side only)
    let giftType: string | undefined = gift.gift_type;
    let storyId: string | undefined = gift.story_id;
    
    if (typeof window !== 'undefined') {
      const giftMode = sessionStorage.getItem('gift_mode');
      
      if (giftMode === 'create') {
        // For create mode: set gift_type to "story" and story_id to current story ID
        giftType = 'story';
        const currentStoryId = sessionStorage.getItem('currentStoryId');
        if (currentStoryId) {
          storyId = currentStoryId;
        }
      } else if (giftMode === 'link') {
        // For link mode: set gift_type to "link" so recipient gets +1 credit when they check the notification
        giftType = gift.gift_type || 'link';
        storyId = undefined; // No story_id for link mode
      }
    }

    const { data, error } = await supabase
      .from('gifts')
      .insert([{
        user_id: user.id, // Keep for backward compatibility
        from_user_id: user.id, // Sender's user ID
        to_user_id: recipientUserId, // Recipient's user ID (if exists)
        status: gift.status || 'generating',
        occasion: gift.occasion,
        relationship: gift.relationship,
        delivery_time: gift.delivery_time,
        child_profile_id: gift.child_profile_id,
        special_msg: gift.special_msg,
        delivery_email: recipientEmail, // Keep for backward compatibility
        child_name: gift.child_name,
        age_group: gift.age_group,
        checked: false, // Notification not checked yet
        gift_type: giftType, // Set gift_type based on gift_mode
        story_id: storyId // Set story_id only for create mode
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating gift:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Queue gift notification email
    try {
      const { queueGiftNotificationEmail } = await import('../emails');
      
      // Get user's name for the email
      const giverName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'Someone special';

      // Determine scenario and optional delivery date/time for email template
      let scenario: 'giver_creating' | 'another_adult_creating' | 'scheduled_delivery' | undefined;
      let deliveryDate: string | undefined;
      let deliveryTime: string | undefined;
      if (typeof window !== 'undefined') {
        const giftMode = sessionStorage.getItem('gift_mode');
        if (giftMode === 'link') {
          scenario = 'another_adult_creating';
        } else if (gift.delivery_time) {
          const delivery = new Date(gift.delivery_time);
          const now = new Date();
          if (delivery.getTime() > now.getTime() + 60 * 1000) {
            scenario = 'scheduled_delivery';
            deliveryDate = delivery.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            deliveryTime = delivery.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
          }
        }
      }
      if (!scenario) scenario = 'giver_creating';

      const emailResult = await queueGiftNotificationEmail(
        recipientEmail,
        gift.child_name,
        giverName,
        gift.occasion,
        gift.special_msg || '',
        {
          giftOrderId: data?.id,
          scenario,
          deliveryDate,
          deliveryTime,
        }
      );
      
      if (emailResult.success) {
        console.log('✅ Gift notification email queued');
      } else {
        console.warn('⚠️ Failed to queue gift notification email:', emailResult.error);
        // Don't fail the gift creation if email fails
      }
    } catch (emailError) {
      console.error('Error queueing gift notification email:', emailError);
      // Don't fail the gift creation if email fails
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error creating gift:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the gift'
    };
  }
}

/**
 * Update a gift
 * @param giftId - The gift ID to update
 * @param updates - The fields to update
 * @returns Promise with operation result
 */
export async function updateGift(giftId: string, updates: Partial<Gift>): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .update(updates)
      .eq('id', giftId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating gift:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error updating gift:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the gift'
    };
  }
}

/**
 * Get gifts for current user (gifts sent by the user)
 * @returns Promise with gifts data
 */
export async function getGiftsForUser(): Promise<DatabaseResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .or(`from_user_id.eq.${user.id},user_id.eq.${user.id}`) // Support both new and old format
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gifts:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    console.error('Unexpected error fetching gifts:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching gifts'
    };
  }
}

/**
 * Get all gifts where current user is sender (from_user_id) OR recipient (to_user_id).
 * Used by Gift Tracking to show both sent and received gifts.
 * @returns Promise with gifts data
 */
export async function getGiftsForCurrentUser(): Promise<DatabaseResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id},user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gifts for current user:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Unexpected error fetching gifts for current user:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching gifts'
    };
  }
}

/**
 * Get gifts received by current user (matched by delivery_email only, not to_user_id).
 * Only returns unchecked gifts (checked = false or null) where delivery_time has passed.
 * @returns Promise with gifts data
 */
export async function getGiftsReceivedByUser(): Promise<DatabaseResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Get user email for matching (fetch by delivery_email only, not to_user_id)
    const userEmail = user.email?.toLowerCase().trim();
    if (!userEmail) {
      return {
        success: true,
        data: []
      };
    }

    // Query gifts where delivery_email matches current user's email
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('delivery_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching received gifts:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Get current time
    const now = new Date();
    
    // Filter to only unchecked gifts where delivery_time has passed
    const uncheckedGifts = (data || []).filter((gift: Gift) => {
      const isUnchecked = gift.checked === false || gift.checked === null || gift.checked === undefined;
      
      // Only show gifts where delivery_time exists AND has passed
      // If delivery_time is missing/null/empty, don't show the gift
      if (!gift.delivery_time) {
        return false; // Skip gifts without delivery_time
      }
      
      const deliveryDate = new Date(gift.delivery_time);
      const isDelivered = deliveryDate <= now;
      
      return isUnchecked && isDelivered;
    });

    return {
      success: true,
      data: uncheckedGifts
    };

  } catch (error) {
    console.error('Unexpected error fetching received gifts:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching received gifts'
    };
  }
}

/**
 * Check gift notification and add 1 credit to the recipient (to_user_id).
 * Calls backend API which marks the gift as checked and adds 1 credit to the current user (recipient).
 * @param giftId - The gift ID
 * @param accessToken - Supabase session access token for auth
 * @returns Promise with operation result
 */
export async function checkGiftNotificationAndAddCredit(
  giftId: string,
  accessToken: string
): Promise<DatabaseResult & { credit_added?: boolean; remaining_credits?: number }> {
  try {
    if (!giftId || !accessToken) {
      return {
        success: false,
        error: 'Gift ID and access token are required'
      };
    }
    const API_BASE_URL = (env.API_BASE_URL || '').replace('/api', '') || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/gifts/check-notification-and-add-credit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ gift_id: giftId })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || `Request failed: ${response.status}`
      };
    }
    return {
      success: data.success !== false,
      data: data,
      credit_added: data.credit_added,
      remaining_credits: data.remaining_credits
    };
  } catch (err) {
    console.error('Error in checkGiftNotificationAndAddCredit:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to check notification and add credit'
    };
  }
}

/**
 * Mark a gift as checked (notification viewed)
 * @param giftId - The gift ID to mark as checked
 * @returns Promise with operation result
 */
export async function markGiftAsChecked(giftId: string): Promise<DatabaseResult> {
  try {
    if (!giftId) {
      return {
        success: false,
        error: 'Gift ID is required'
      };
    }

    console.log('Updating gift checked status:', giftId);
    const { data, error } = await supabase
      .from('gifts')
      .update({ checked: true })
      .eq('id', giftId)
      .select('*')
      .single();

    if (error) {
      console.error('Error marking gift as checked:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('Successfully marked gift as checked:', data?.id);
    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error marking gift as checked:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while marking gift as checked'
    };
  }
}

/**
 * Get a single gift by ID
 * @param giftId - The gift ID
 * @returns Promise with gift data
 */
export async function getGiftById(giftId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single();

    if (error) {
      console.error('Error fetching gift:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error fetching gift:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the gift'
    };
  }
}

/**
 * Delete a gift
 * @param giftId - The gift ID to delete
 * @returns Promise with operation result
 */
export async function deleteGift(giftId: string): Promise<DatabaseResult> {
  try {
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', giftId);

    if (error) {
      console.error('Error deleting gift:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Unexpected error deleting gift:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the gift'
    };
  }
}
