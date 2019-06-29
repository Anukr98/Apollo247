import React from 'react';
import { useLoginPopupState, useAuth } from 'hooks/authHooks';

export interface ProtectedWithLoginPopupProps {
  children: React.FC<{ protectWithLoginPopup: () => void; isProtected: boolean }>;
}

export const ProtectedWithLoginPopup: React.FC<ProtectedWithLoginPopupProps> = (props) => {
  const { setLoginPopupVisible } = useLoginPopupState();
  const { isLoggedIn, isAuthenticating } = useAuth();
  const isProtected = !isLoggedIn && !isAuthenticating;
  const protectWithLoginPopup = () => {
    if (isProtected) setLoginPopupVisible(true);
  };
  return props.children({ protectWithLoginPopup, isProtected });
};
