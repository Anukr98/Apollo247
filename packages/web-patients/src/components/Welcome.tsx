import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { HeroBanner } from 'components/HeroBanner';
import { ManageProfile } from 'components/ManageProfile';
import { NavigationBottom } from 'components/NavigationBottom';
import { useAuth } from 'hooks/authHooks';
import { PatientsOverview } from 'components/PatientsOverview';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingBottom: 20,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      borderRadius: '0 0 10px 10px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f7f8f5',
      overflow: 'hidden',
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
        <div className={classes.pageContainer}>
          <HeroBanner />
          {isSignedIn && <PatientsOverview />}
        </div>
      </div>
      {isSignedIn && <NavigationBottom />}
      <ManageProfile />
    </div>
  );
};
