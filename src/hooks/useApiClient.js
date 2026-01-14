import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';
import { createApiClient } from '../services/apiClient';

export const useApiClient = () => {
  const { getToken, isLoaded } = useAuth();

  const client = useMemo(() => {
    if (!isLoaded) return null;
    return createApiClient(getToken);
  }, [getToken, isLoaded]);

  return { client, isLoaded };
};
