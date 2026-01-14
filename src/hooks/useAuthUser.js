import { useUser, useSession } from '@clerk/clerk-react';
import { useMemo, useState, useEffect } from 'react';
import { useApiClient } from './useApiClient';

export const useAuthUser = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session, isLoaded: isSessionLoaded } = useSession();
  const { client } = useApiClient();
  const [mongoId, setMongoId] = useState(null);

  const isLoaded = isUserLoaded && isSessionLoaded;

  useEffect(() => {
    const fetchMongoId = async () => {
      if (!client || !user) return;
      
      try {
        const response = await client.get('/api/auth/me');
        if (response.data?.data?.id) {
          setMongoId(response.data.data.id);
        }
      } catch (error) {
        console.error('Error fetching MongoDB user ID:', error);
      }
    };

    if (isLoaded && user && client && !mongoId) {
      fetchMongoId();
    }
  }, [isLoaded, user, client, mongoId]);

  const authUser = useMemo(() => {
    if (!isLoaded || !user) return null;

    return {
      id: mongoId || user.id,
      clerkId: user.id,
      name: user.fullName || user.username || 'User',
      email: user.primaryEmailAddress?.emailAddress || null,
      sessionId: session?.id || null,
    };
  }, [isLoaded, user, session, mongoId]);

  return { authUser, isLoaded };
};
