import React, { useEffect } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth, useLoginPopupState } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';

export const AuthRouted: React.FC<RouteProps> = (props) => {
  const { isSigningIn, isSignedIn } = useAuth();

  const continueURL =
    typeof window !== 'undefined' && window.location && encodeURIComponent(window.location.href);
  const { setIsLoginPopupVisible: setLoginPopupVisible } = useLoginPopupState();
  if (isSignedIn || isSigningIn) {
    return <Route {...props} />;
  } else {
    setLoginPopupVisible(true);
    return <Redirect to={`${clientRoutes.welcome()}?continue=${continueURL}`} />;
  }
};
