
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Message type definition
export interface Message {
  id?: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

/**
 * Fetches chat messages from the database
 */
export const fetchMessages = async (): Promise<Message[]> => {
  try {
    // Get messages from the Supabase table
    const { data: messagesData, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    // We need to get usernames separately since the relation isn't working
    const messages: Message[] = [];
    
    // If there are messages, process them
    if (messagesData && messagesData.length > 0) {
      // Get all user IDs from messages to fetch their profiles in a single query
      const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
      
      // Fetch all profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
        
      // Create a map of user_id to username for quick lookup
      const usernameMap = new Map();
      profilesData?.forEach(profile => {
        usernameMap.set(profile.id, profile.username || 'Usuário');
      });
      
      // Format each message with the username from our map
      messagesData.forEach(msg => {
        messages.push({
          id: msg.id,
          user_id: msg.user_id,
          username: usernameMap.get(msg.user_id) || 'Usuário',
          message: msg.content,
          created_at: msg.created_at
        });
      });
    }
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Sends a new message to the chat
 */
export const sendMessage = async (
  message: string,
  user: User
): Promise<Message | null> => {
  try {
    // Get the username of the user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    
    if (profileError) throw profileError;
    
    const username = profileData?.username || user.email?.split('@')[0] || 'Usuário';
    
    // Insert the message into the database
    const newMessage = {
      user_id: user.id,
      content: message
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single();

    if (error) throw error;
    
    // Format the return to match the Message interface
    if (data) {
      return {
        id: data.id,
        user_id: data.user_id,
        username: username, // Use the username we fetched earlier
        message: data.content,
        created_at: data.created_at
      };
    }
    return null;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};
