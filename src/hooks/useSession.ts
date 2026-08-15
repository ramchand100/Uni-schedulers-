import { useContext } from 'react';

import { AuthContext } from '@/providers/AuthProvider';

export function useSession() {
  return useContext(AuthContext);
}
