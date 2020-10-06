import { useQuery } from 'react-apollo-hooks';
import { AuthContext } from 'components/AuthProvider';
import { useContext } from 'react';

const useAuthContext = () => useContext(AuthContext);

// Automatically skips actually making the query if we're still authenticating
export const useQueryWithSkip: typeof useQuery = (query, options) => {
  const isSigningIn = useAuthContext().isSigningIn;
  const hasAuthToken = useAuthContext().hasAuthToken;
  const skip = isSigningIn || !hasAuthToken;
  const optionsWithDefaults = { skip, ...(options || {}) };
  return useQuery(query, optionsWithDefaults);
};
