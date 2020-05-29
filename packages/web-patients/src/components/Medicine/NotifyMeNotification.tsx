import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    actions: {
      padding: '10px 20px 20px 20px',
      display: 'flex',
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    button: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 'auto',
      fozntWeight: 'bold',
      color: '#fc9916',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
      },
    },
  };
});

interface NotifyMeNotificationProps {
  setIsNotifyMeDialogOpen: (isNotifyMeDialogOpen: boolean) => void;
  medicineName: string;
}

export const NotifyMeNotification: React.FC<NotifyMeNotificationProps> = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Okay! :)</Typography>
        <p>
          You will be notified when <b>{props.medicineName}</b> is back in stock.
        </p>
      </div>
      <div className={classes.actions}>
        <AphButton
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => {
            props.setIsNotifyMeDialogOpen(false);
          }}
        >
          Ok, Got It
        </AphButton>
      </div>
    </div>
  );
};
