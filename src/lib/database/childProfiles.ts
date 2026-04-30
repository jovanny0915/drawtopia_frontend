
import { supabase } from '../supabase';

export interface ChildProfile {
  id?: number;
  created_at?: string;
  first_name: string;
  age_group: string;
  relationship: string;
  parent_id: string;
  avatar_url: string;
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function insertChildProfile(
  childProfile: ChildProfile,
  sendConsentEmail: boolean = false,
  parentEmail?: string,
  parentName?: string
): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .insert([{
        first_name: childProfile.first_name,
        age_group: childProfile.age_group,
        relationship: childProfile.relationship,
        parent_id: childProfile.parent_id,
        avatar_url: childProfile.avatar_url,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error inserting child profile:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (sendConsentEmail && parentEmail && parentName) {
      try {
        const { queueParentalConsentEmail } = await import('../emails');
        const emailResult = await queueParentalConsentEmail(
          parentEmail,
          parentName,
          childProfile.first_name
        );
        
        if (emailResult.success) {
          console.log('✅ Parental consent email queued');
        } else {
          console.warn('⚠️ Failed to queue parental consent email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error queueing parental consent email:', emailError);
      }
    }

    return {
      success: true,
      data: data?.[0]
    };

  } catch (error) {
    console.error('Unexpected error inserting child profile:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while saving the child profile'
    };
  }
}

export async function insertChildProfiles(childProfiles: ChildProfile[]): Promise<DatabaseResult> {
  try {
    if (childProfiles.length === 0) {
      return {
        success: false,
        error: 'No child profiles to save'
      };
    }

    const profilesData = childProfiles.map(profile => ({
      first_name: profile.first_name,
      age_group: profile.age_group,
      relationship: profile.relationship,
      parent_id: profile.parent_id,
      avatar_url: profile.avatar_url,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('child_profiles')
      .insert(profilesData)
      .select();

    if (error) {
      console.error('Error inserting child profiles:', error);
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
    console.error('Unexpected error inserting child profiles:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while saving the child profiles'
    };
  }
}

export async function getChildProfiles(parentId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching child profiles:', error);
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
    console.error('Unexpected error fetching child profiles:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching child profiles'
    };
  }
}

export async function getChildProfileById(profileId: string | number): Promise<DatabaseResult> {
  try {
    const id = typeof profileId === 'string' ? parseInt(profileId, 10) : profileId;
    if (isNaN(id)) {
      return { success: false, error: 'Invalid child profile ID' };
    }
    const { data, error } = await supabase
      .from('child_profiles')
      .select('id, first_name, age_group')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching child profile:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data ?? null
    };
  } catch (error) {
    console.error('Unexpected error fetching child profile:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching child profile'
    };
  }
}

export async function updateChildProfile(profileId: number, childProfile: Partial<ChildProfile>, parentId: string): Promise<DatabaseResult> {
  try {
    const updateData: any = {};
    
    if (childProfile.first_name !== undefined) updateData.first_name = childProfile.first_name;
    if (childProfile.age_group !== undefined) updateData.age_group = childProfile.age_group;
    if (childProfile.relationship !== undefined) updateData.relationship = childProfile.relationship;
    if (childProfile.avatar_url !== undefined) updateData.avatar_url = childProfile.avatar_url;

    const { data, error } = await supabase
      .from('child_profiles')
      .update(updateData)
      .eq('id', profileId)
      .eq('parent_id', parentId)
      .select();

    if (error) {
      console.error('Error updating child profile:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Child profile not found or you do not have permission to update it'
      };
    }

    return {
      success: true,
      data: data[0]
    };

  } catch (error) {
    console.error('Unexpected error updating child profile:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the child profile'
    };
  }
}

export async function deleteChildProfile(profileId: number, parentId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .delete()
      .eq('id', profileId)
      .eq('parent_id', parentId)
      .select();

    if (error) {
      console.error('Error deleting child profile:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data?.[0]
    };

  } catch (error) {
    console.error('Unexpected error deleting child profile:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the child profile'
    };
  }
}

export async function getChildrenForParent(parentId: string): Promise<DatabaseResult> {
  try {
    let backendUrl = 'https://image-edit-five.vercel.app';
    
    const endpoint = `${backendUrl}/api/users/children?parent_id=${encodeURIComponent(parentId)}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching children'
    };
  }
}
