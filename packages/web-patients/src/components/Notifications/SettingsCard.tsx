import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphSwitch } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '30px 40px 10px 40px',
      [theme.breakpoints.down('xs')]: {
        padding: '55px 10px 10px 10px',
      },
    },
    settingsCard: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 15,
      marginBottom: 5,
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.up('sm')]: {
        marginBottom: 0,
        borderRadius: 0,
        boxShadow: 'none',
        paddingLeft: 0,
        paddingRight: 0,
        borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      },
      [theme.breakpoints.down('xs')]: {
        marginBottom: 20,
      },
      '&:last-child': {
        borderBottom: 'none',
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        color: '#A3B5BB',
      },
    },
    toggleButton: {
      position: 'absolute',
      right: 10,
      top: 18,
    },
    helpNotification: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      backgroundColor: 'rgba(0,135,186,0.1)',
      padding: 15,
      borderRadius: 10,
      marginTop: 40,
    },
  };
});

export const SettingsCard: React.FC = (props) => {
  const classes = useStyles({});
  const [isSwitchOpen, setIsSwitchOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.settingsCard}>
        <span>Push Notifications</span>
        <div className={classes.toggleButton}>
          <AphSwitch
            checked={isSwitchOpen}
            onChange={() => setIsSwitchOpen(true)}
            color="primary"
          />
        </div>
        <p>
          If you chose to turn this off, you will stop receiving app notifications related to daily
          healthcare tips and promotional offers.
        </p>
      </div>
      <div className={classes.settingsCard}>
        <span>SMS Notifications</span>
        <div className={classes.toggleButton}>
          <AphSwitch
            checked={isSwitchOpen}
            onChange={() => setIsSwitchOpen(true)}
            color="primary"
          />
        </div>
        <p>
          If you chose to turn this off, you will stop receiving app notifications related to daily
          healthcare tips and promotional offers.
        </p>
      </div>
      <div className={classes.helpNotification}>
        To help us keep you updated and serve you better, Order & Appointment related notifications
        cannot be disabled.
      </div>
    </div>
  );
};
