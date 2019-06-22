import React from 'react';
import { AuthContext } from 'components/AuthProvider';

export const useCurrentUser = () => React.useContext(AuthContext).currentUser;
export const useAuthenticating = () => React.useContext(AuthContext).authenticating;
export const useBuildCaptchaVerifier = () => React.useContext(AuthContext).buildCaptchaVerifier!;
export const useVerifyPhoneNumber = () => React.useContext(AuthContext).verifyPhoneNumber!;
export const useVerifyOtp = () => React.useContext(AuthContext).verifyOtp!;
export const useSignIn = () => React.useContext(AuthContext).signIn!;
export const useSignOut = () => React.useContext(AuthContext).signOut!;
