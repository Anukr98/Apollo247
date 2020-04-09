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
      fontWeight: 'bold',
      color: '#fc9916',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

type CancelOrderNotificationProps = {
  setIsCancelOrderDialogOpen: (isCancelOrderDialogOpen: boolean) => void;
  setIsPopoverOpen: (isPopoverOpen: boolean) => void;
};

export const CancelOrderNotification: React.FC<CancelOrderNotificationProps> = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Hi! :)</Typography>
        <p>
          Your cancelation request has been submitted. Someone from our team will call you soon.
        </p>
      </div>
      <div className={classes.actions}>
        <AphButton
          type="submit"
          color="primary"
          classes={{ root: classes.button }}
          onClick={() => {
            props.setIsCancelOrderDialogOpen(false);
            props.setIsPopoverOpen(false);
            window.location.href = clientRoutes.yourOrders();
          }}
        >
          Ok, Got It
        </AphButton>
      </div>
    </div>
  );
};
