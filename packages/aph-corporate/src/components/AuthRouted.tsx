import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';

export const AuthRouted: React.FC<RouteProps> = (props) => {
  const { isSigningIn, isSignedIn } = useAuth();
  return isSignedIn || isSigningIn ? (
    <Route {...props} />
  ) : (
    <Redirect to={clientRoutes.welcome()} />
  );
};
