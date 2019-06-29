import React from 'react';
import { useLoginPopupState, useIsLoggedIn } from 'hooks/authHooks';

export interface ProtectedWithLoginPopupProps {
  children: React.FC<{ protectWithLoginPopup: () => void }>;
}

export const ProtectedWithLoginPopup: React.FC<ProtectedWithLoginPopupProps> = (props) => {
  const { setLoginPopupVisible } = useLoginPopupState();
  const isLoggedIn = useIsLoggedIn();
  const protectWithLoginPopup = () => {
    if (!isLoggedIn) setLoginPopupVisible(true);
  };
  return props.children({ protectWithLoginPopup });
};
