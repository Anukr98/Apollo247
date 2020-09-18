import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import { MyProfile } from 'components/MyAccount/MyProfile';
import { NavigationBottom } from 'components/NavigationBottom';
import { ManageSettings } from 'components/Notifications/ManageSettings';
import { BottomLinks } from 'components/BottomLinks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    mySettingsPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 10,
      },
    },
    mySettingsSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    leftSection: {
      width: 328,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 15,
      paddingTop: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingTop: 0,
        paddingRight: 0,
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
  };
});

const NotificationSettings: React.FC = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.mySettingsPage}>
          <div className={classes.mySettingsSection}>
            <div className={classes.leftSection}>
              <MyProfile />
            </div>
            <div className={classes.rightSection}>
              <ManageSettings />
            </div>
          </div>
        </div>
      </div>
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      <NavigationBottom />
    </div>
  );
};

export default NotificationSettings;
