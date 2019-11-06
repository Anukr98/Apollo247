import React from 'react';
import { useLoginPopupState, useAuth } from 'hooks/authHooks';
import { LoggedInUserType } from 'graphql/types/globalTypes';

export interface ProtectedWithLoginPopupProps {
  children: React.FC<{ protectWithLoginPopup: () => void; isProtected: boolean }>;
}

export const ProtectedWithLoginPopup: React.FC<ProtectedWithLoginPopupProps> = (props) => {
  const { setIsLoginPopupVisible: setLoginPopupVisible } = useLoginPopupState();
  const { isSignedIn, isSigningIn, currentUserType } = useAuth();
  const isProtected = !isSignedIn && !isSigningIn && currentUserType !== LoggedInUserType.JDADMIN;
  const protectWithLoginPopup = () => {
    if (isProtected) setLoginPopupVisible(true);
  };
  return props.children({ protectWithLoginPopup, isProtected });
};
