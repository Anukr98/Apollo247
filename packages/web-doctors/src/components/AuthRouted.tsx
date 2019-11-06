import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { LoggedInUserType } from 'graphql/types/globalTypes';

export const AuthRouted: React.FC<RouteProps> = (props) => {
  const { isSigningIn, isSignedIn, currentUserType } = useAuth();
  return isSignedIn || isSigningIn || currentUserType === LoggedInUserType.ADMIN ? (
    <Route {...props} />
  ) : (
    <Redirect to={clientRoutes.welcome()} />
  );
};
