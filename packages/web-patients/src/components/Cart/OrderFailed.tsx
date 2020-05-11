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
      padding: '0 20px 20px 20px',
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

interface OrderFailedProps {
  close: () => void;
}

export const OrderFailed: React.FC<OrderFailedProps> = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">uh oh.. :(</Typography>
        <p>Your payment wasn’t successful due to bad network connectivity. Please try again.</p>
      </div>
      <div className={classes.actions}>
        <AphButton
          type="submit"
          color="primary"
          classes={{ root: classes.button }}
          onClick={() => {
            props.close();
            window.location.href = clientRoutes.testsAndMedicine();
          }}
        >
          OK, GOT IT
        </AphButton>
      </div>
    </div>
  );
};
