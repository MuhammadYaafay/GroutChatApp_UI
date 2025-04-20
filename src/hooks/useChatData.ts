
import { useState, useCallback } from 'react';
import { apiRequest } from '@/utils/apiUtils';

// Define proper types for the API responses
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  members?: string[];
  isPrivate?: boolean;
}

export const useChatData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directContacts, setDirectContacts] = useState<User[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [contactsData, channelsData] = await Promise.all([
        apiRequest('/api/users'),
        apiRequest('/api/channels')
      ]);
      
      setDirectContacts(contactsData as User[]);
      setChannels(channelsData as Channel[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch chat data');
      console.error('Error fetching chat data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    directContacts,
    channels,
    refreshData: fetchData
  };
};
