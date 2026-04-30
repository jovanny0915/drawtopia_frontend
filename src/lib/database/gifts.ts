
import { getCurrentUser, checkUserExists } from '$lib/auth';
import { supabase } from '../supabase';
import { env } from '../env';
import { formatDate } from '../dateUtils';

export interface Gift {
  id?: string;
  created_at?: string;
  user_id?: string;
  status: 'generating' | 'completed' | 'failed';
  occasion: string;
  relationship: string;
  delivery_time: string;
  child_profile_id?: string;
  special_msg?: string;
  delivery_email: string;
  child_name: string;
  age_group: string;
  from_user_id?: string;
  to_user_id?: string;
  checked?: boolean;
  notification_sent?: boolean;
  notification_sent_at?: string;
  notification_scheduled?: boolean;
  gift_type?: string;
  story_id?: string;
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

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

    const recipientEmail = gift.delivery_email?.toLowerCase().trim();

    let recipientUserId: string | null = null;
    try {
      const userCheck = await checkUserExists(recipientEmail);
      if (userCheck.exists && userCheck.user) {
        recipientUserId = userCheck.user.id || null;
      }
    } catch (err) {
      console.log('Could not check recipient user, will store email only:', err);
    }

    let giftType: string | undefined = gift.gift_type;
    let storyId: string | undefined = gift.story_id;
    
    if (typeof window !== 'undefined') {
      const giftMode = sessionStorage.getItem('gift_mode');
      
      if (giftMode === 'create') {
        giftType = 'story';
        const currentStoryId = sessionStorage.getItem('currentStoryId');
        if (currentStoryId) {
          storyId = currentStoryId;
        }
      } else if (giftMode === 'link') {
        giftType = gift.gift_type || 'link';
        storyId = undefined;
      }
    }

    const { data, error } = await supabase
      .from('gifts')
      .insert([{
        user_id: user.id,
        from_user_id: user.id,
        to_user_id: recipientUserId,
        status: gift.status || 'generating',
        occasion: gift.occasion,
        relationship: gift.relationship,
        delivery_time: gift.delivery_time,
        child_profile_id: gift.child_profile_id,
        special_msg: gift.special_msg,
        delivery_email: recipientEmail,
        child_name: gift.child_name,
        age_group: gift.age_group,
        checked: false,
        gift_type: giftType,
        story_id: storyId
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

    try {
      const { queueGiftNotificationEmail } = await import('../emails');
      
      const giverName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'Someone special';

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
            deliveryDate = formatDate(delivery) || delivery.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
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
      }
    } catch (emailError) {
      console.error('Error queueing gift notification email:', emailError);
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
      .or(`from_user_id.eq.${user.id},user_id.eq.${user.id}`)
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

export async function getGiftsReceivedByUser(): Promise<DatabaseResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const userEmail = user.email?.toLowerCase().trim();
    if (!userEmail) {
      return {
        success: true,
        data: []
      };
    }

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
    
    const now = new Date();
    
    const uncheckedGifts = (data || []).filter((gift: Gift) => {
      const isUnchecked = gift.checked === false || gift.checked === null || gift.checked === undefined;
      
      if (!gift.delivery_time) {
        return false;
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
