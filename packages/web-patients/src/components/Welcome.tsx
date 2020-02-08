import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { HeroBanner } from 'components/HeroBanner';
import { ManageProfile } from 'components/ManageProfile';
import { ServiceList } from 'components/ServiceList';
import { NavigationBottom } from 'components/NavigationBottom';
import { useAuth } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingBottom: 30,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
  };
});

export const Welcome: React.FC = (props) => {
  const classes = useStyles();
  const { isSignedIn } = useAuth();

  return (
    <div className={classes.welcome}>
      <Header />
      <div className={classes.container}>
        <HeroBanner />
        <ServiceList />
      </div>
      {isSignedIn && <NavigationBottom />}
      <ManageProfile />
    </div>
  );
};
