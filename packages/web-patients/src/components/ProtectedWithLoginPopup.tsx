import React from 'react';
import TagManager from 'react-gtm-module';
import { useLoginPopupState, useAuth } from 'hooks/authHooks';

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
      const tagManagerArgs = {
        dataLayer: {
          referance: 'Login/Signup',
          action: 'Intent',
        },
        dataLayerName: 'Profile',
      };
      TagManager.dataLayer(tagManagerArgs);
      /**Gtm code start end */

      setLoginPopupVisible(true);
    }
  };
  return props.children({ protectWithLoginPopup, isProtected });
};
