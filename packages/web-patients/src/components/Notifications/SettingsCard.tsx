import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphSwitch } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingBottom: 10,
    },
    settingsCard: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 15,
      marginBottom: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.up('sm')]: {
        marginBottom: 0,
        borderRadius: 0,
        boxShadow: 'none',
        paddingLeft: 0,
        paddingRight: 0,
        borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    toggleButton: {
      marginLeft: 'auto',
    },
  };
});

export const SettingsCard: React.FC = (props) => {
  const classes = useStyles();
  const [isSwitchOpen, setIsSwitchOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.settingsCard}>
        <span>Upcoming Appointment Reminders</span>
        <div className={classes.toggleButton}>
          <AphSwitch
            checked={isSwitchOpen}
            onChange={() => setIsSwitchOpen(true)}
            color="primary"
          />
        </div>
      </div>
      <div className={classes.settingsCard}>
        <span>Reschedule/Cancellation Notifications</span>
        <div className={classes.toggleButton}>
          <AphSwitch
            checked={isSwitchOpen}
            onChange={() => setIsSwitchOpen(true)}
            color="primary"
          />
        </div>
      </div>
      <div className={classes.settingsCard}>
        <span>Payment Notifications</span>
        <div className={classes.toggleButton}>
          <AphSwitch
            checked={isSwitchOpen}
            onChange={() => setIsSwitchOpen(true)}
            color="primary"
          />
        </div>
      </div>
      <div className={classes.settingsCard}>
        <span>Commission Notifications</span>
        <div className={classes.toggleButton}>
          <AphSwitch
            checked={isSwitchOpen}
            onChange={() => setIsSwitchOpen(true)}
            color="primary"
          />
        </div>
      </div>
      <div className={classes.settingsCard}>
        <span>Messages from Doctors</span>
        <div className={classes.toggleButton}>
          <AphSwitch
            checked={isSwitchOpen}
            onChange={() => setIsSwitchOpen(true)}
            color="primary"
          />
        </div>
      </div>
      <div className={classes.settingsCard}>
        <span>Play sounds for notifications</span>
        <div className={classes.toggleButton}>
          <AphSwitch
            checked={isSwitchOpen}
            onChange={() => setIsSwitchOpen(true)}
            color="primary"
          />
        </div>
      </div>
    </div>
  );
};
