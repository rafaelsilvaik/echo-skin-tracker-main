import { supabase } from '@/integrations/supabase/client';

// Type definitions
export interface Hero {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Skin {
  id: number;
  hero_id: number;
  name: string;
  rarity: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  heroes?: {
    name: string;
    description?: string;
  };
}

export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  syndicate?: string;
  about?: string;
  trophies?: number;
  role?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserRanking {
  id: string;
  username?: string;
  skin_count: number;
  trophies?: number;
}

// Profiles
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Add toggleUserSkin function to handle adding or removing a skin from user collection
export async function toggleUserSkin(userId: string, skinId: number, isAdding: boolean) {
  if (isAdding) {
    return addUserSkin(userId, skinId);
  } else {
    return removeUserSkin(userId, skinId);
  }
}

export async function createProfile(userId: string, profile: any) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { 
        id: userId,
        ...profile,
        created_at: new Date().toISOString(),
      }
    ])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateProfile(userId: string, profile: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Heroes
export async function getHeroes() {
  const { data, error } = await supabase
    .from('heroes')
    .select('*')
    .order('name');
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getHeroById(id: number) {
  const { data, error } = await supabase
    .from('heroes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createHero(hero: any) {
  // Set RLS for admin users using the service_role key
  const { data, error } = await supabase
    .from('heroes')
    .insert([
      { 
        ...hero,
        created_at: new Date().toISOString(),
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating hero:", error);
    throw error;
  }
  
  return data;
}

export async function updateHero(id: number, hero: any) {
  const { data, error } = await supabase
    .from('heroes')
    .update(hero)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating hero:", error);
    throw error;
  }
  
  return data;
}

export async function deleteHero(id: number) {
  const { error } = await supabase
    .from('heroes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting hero:", error);
    throw error;
  }
  
  return true;
}

// Skins
export async function getSkins() {
  const { data, error } = await supabase
    .from('skins')
    .select('*, heroes(name, description)')
    .order('name');
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getSkinsByHero(heroId: number) {
  const { data, error } = await supabase
    .from('skins')
    .select('*, heroes(name, description)')
    .eq('hero_id', heroId)
    .order('name');
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getSkinById(id: number) {
  const { data, error } = await supabase
    .from('skins')
    .select('*, heroes(name, description)')
    .eq('id', id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createSkin(skin: any) {
  const { data, error } = await supabase
    .from('skins')
    .insert([
      { 
        ...skin,
        created_at: new Date().toISOString(),
      }
    ])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateSkin(id: number, skin: any) {
  const { data, error } = await supabase
    .from('skins')
    .update(skin)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function deleteSkin(id: number) {
  const { error } = await supabase
    .from('skins')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw error;
  }
  
  return true;
}

// User Skins
export async function getUserSkins(userId: string) {
  const { data, error } = await supabase
    .from('user_skins')
    .select('*, skins(*, heroes(name, description))')
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function addUserSkin(userId: string, skinId: number) {
  const { data, error } = await supabase
    .from('user_skins')
    .insert([
      { 
        user_id: userId,
        skin_id: skinId,
        created_at: new Date().toISOString(),
      }
    ])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function removeUserSkin(userId: string, skinId: number) {
  const { error } = await supabase
    .from('user_skins')
    .delete()
    .eq('user_id', userId)
    .eq('skin_id', skinId);
  
  if (error) {
    throw error;
  }
  
  return true;
}

// Users (for the admin panel)
export async function getUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('username');
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Get user rankings by skin count
export async function getUserRankings() {
  // First let's count the number of skins each user has by querying user_skins table
  const { data, error } = await supabase
    .from('user_skins')
    .select('user_id')
    .order('user_id');
  
  if (error) {
    throw error;
  }
  
  // Count occurrences of each user_id
  const userCounts: Record<string, number> = {};
  data.forEach(item => {
    if (item.user_id) {
      userCounts[item.user_id] = (userCounts[item.user_id] || 0) + 1;
    }
  });
  
  // Get user profiles to get usernames and trophies
  const userIds = Object.keys(userCounts);
  
  if (userIds.length === 0) {
    return [];
  }
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, trophies')
    .in('id', userIds);
  
  if (profilesError) {
    throw profilesError;
  }
  
  // Combine the data
  const rankings: UserRanking[] = userIds.map(userId => {
    const profile = profiles.find(p => p.id === userId);
    return {
      id: userId,
      username: profile?.username || 'Unknown',
      skin_count: userCounts[userId],
      trophies: profile?.trophies || 0
    };
  });
  
  // Sort by skin count descending
  return rankings.sort((a, b) => b.skin_count - a.skin_count);
}

// Upload de imagem
export async function uploadImage(file: File, path: string) {
  const fileName = `${Date.now()}-${file.name}`;
  const fullPath = `${path}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('bullet-echo')
    .upload(fullPath, file);
  
  if (error) {
    throw error;
  }
  
  const { data: publicURL } = supabase.storage
    .from('bullet-echo')
    .getPublicUrl(fullPath);
  
  return publicURL.publicUrl;
}
