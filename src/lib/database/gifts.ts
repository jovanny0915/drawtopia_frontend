/**
 * Gifts Database Operations
 */

import { getCurrentUser, checkUserExists } from '$lib/auth';
import { supabase } from '../supabase';

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
        checked: false // Notification not checked yet
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
      
      // Determine delivery method
      const deliveryMethod = gift.delivery_time ? 'scheduled_delivery' : 'immediate_email';
      
      const emailResult = await queueGiftNotificationEmail(
        recipientEmail,
        gift.child_name,
        giverName,
        gift.occasion,
        gift.special_msg || '',
        deliveryMethod,
        gift.delivery_time // ISO datetime string
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
 * Get gifts received by current user (gifts where user is the recipient)
 * Only returns unchecked gifts (checked = false or null) where delivery_time has passed
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

    // Get user email for matching
    const userEmail = user.email?.toLowerCase().trim();

    // Query gifts where user is recipient (by user_id or email) and not checked
    // Build the query with proper filtering
    let query = supabase
      .from('gifts')
      .select('*')
      .or(`to_user_id.eq.${user.id},delivery_email.eq.${userEmail}`)
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;

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
