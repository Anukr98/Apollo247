import React from 'react';
import { AuthContext } from 'components/AuthProvider';

export const useCurrentUser = () => React.useContext(AuthContext).currentUser;
export const useSignIn = () => React.useContext(AuthContext).signIn!;
export const useSignOut = () => React.useContext(AuthContext).signOut!;
export const useAuthenticating = () => React.useContext(AuthContext).authenticating;
export const useSendOtp = () => React.useContext(AuthContext).sendOtp!;
export const useVerifyOtp = () => React.useContext(AuthContext).verifyOtp!;
