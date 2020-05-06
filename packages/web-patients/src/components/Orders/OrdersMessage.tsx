import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { BankDetails } from 'components/Orders/BankDetails';

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

export const OrdersMessage: React.FC = (props) => {
  const classes = useStyles({});
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Hi! :)</Typography>
        <p>Your return request for Order #A2472707936 has been accepted.</p>
        <p>Since you paid by cash, please enter your bank details so we can refund your money </p>
      </div>
      <div className={classes.actions}>
        <AphButton
          onClick={() => setIsDialogOpen(true)}
          type="submit"
          color="primary"
          classes={{ root: classes.button }}
        >
          Provide Bank Details
        </AphButton>
      </div>
      <AphDialog open={isDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Bank Details</AphDialogTitle>
        <BankDetails />
      </AphDialog>
    </div>
  );
};
