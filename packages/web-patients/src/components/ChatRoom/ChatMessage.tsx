import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { RescheduleMessage } from 'components/ChatRoom/RescheduleMessage';

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
      padding: '10px 20px 15px 20px',
      display: 'flex',
      '& button:last-child': {
        marginLeft: 'auto',
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    button: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      fontWeight: 'bold',
      color: '#fc9916',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    modalDialog: {
      '& >div:nth-child(3)': {
        '& >div': {
          backgroundColor: '#f7f8f5',
        },
      },
    },
  };
});

export const ChatMessage: React.FC = (props) => {
  const classes = useStyles({});
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Hi! :)</Typography>
        <p>
          Your appointment with Dr. Simran has been rescheduled for — 18th May, Monday, 12:00 pm
        </p>
        <p>You have 2 free reschedules left.</p>
      </div>
      <div className={classes.actions}>
        <AphButton onClick={() => setIsDialogOpen(true)} classes={{ root: classes.button }}>
          Reschedule Instead
        </AphButton>
        <AphButton classes={{ root: classes.button }}>Cancel Consult</AphButton>
      </div>
      <AphDialog className={classes.modalDialog} open={isDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Reschedule</AphDialogTitle>
        <RescheduleMessage />
      </AphDialog>
    </div>
  );
};
