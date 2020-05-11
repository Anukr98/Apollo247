import React from 'react';
import { useLoginPopupState, useAuth } from 'hooks/authHooks';
import { gtmTracking } from '../gtmTracking';

export interface ProtectedWithLoginPopupProps {
  children: React.FC<{ protectWithLoginPopup: () => void; isProtected: boolean }>;
}

export const ProtectedWithLoginPopup: React.FC<ProtectedWithLoginPopupProps> = (props) => {
  const { setIsLoginPopupVisible: setLoginPopupVisible } = useLoginPopupState();
  const { isSignedIn, isSigningIn } = useAuth();
  const isProtected = !isSignedIn && !isSigningIn;
  const protectWithLoginPopup = () => {
    if (isProtected) {
      /**Gtm code start start */
      gtmTracking({ category: 'Profile', action: 'Register / Login', label: 'Intent' });
      /**Gtm code start end */

      setLoginPopupVisible(true);
    }
  };
  return props.children({ protectWithLoginPopup, isProtected });
};
