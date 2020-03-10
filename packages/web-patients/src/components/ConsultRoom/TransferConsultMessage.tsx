import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Avatar } from '@material-ui/core';
import React from 'react';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { ChooseDoctor } from 'components/ChatRoom/ChooseDoctor';

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
      '& button': {
        width: 'calc(50% - 5px)',
        marginRight: 5,
        borderRadius: 10,
      },
      '& button:first-child': {
        color: '#fc9916',
        backgroundColor: theme.palette.common.white,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
      '& button:last-child': {
        marginLeft: 5,
        marginRight: 0,
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    chooseDoctor: {
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      padding: 15,
      display: 'flex',
      marginBottom: 10,
    },
    leftSec: {
      paddingRight: 16,
    },
    rightSec: {
      width: 'calc(100% - 76px)',
    },
    avatar: {
      width: 60,
      height: 60,
    },
    doctorName: {
      fontSize: 18,
      fontWeight: 500,
      color: '#02475b',
    },
    doctorInfo: {
      fontSize: 12,
      fontWeight: 600,
      color: '#0087ba',
      letterSpacing: 0.3,
    },
    dateTime: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      paddingBottom: 10,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      marginTop: 10,
    },
    bottomActions: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      textAlign: 'right',
      '& button': {
        boxShadow: 'none',
        color: '#fc9916',
        backgroundColor: 'transparent',
        padding: 0,
      },
    },
  };
});

export const TransferConsultMessage: React.FC = (props) => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Hi! :)</Typography>
        <p>Your appointment with Dr. Simran has been transferred to —</p>
        <div className={classes.chooseDoctor}>
          <div className={classes.leftSec}>
            <Avatar alt="" src={require('images/doctordp_01.png')} className={classes.avatar} />
          </div>
          <div className={classes.rightSec}>
            <div className={classes.doctorName}>Dr. Jayanth Reddy</div>
            <div className={classes.doctorInfo}>General Physician | 5 YRS</div>
            <div className={classes.dateTime}>
              <div>18th May, Monday</div>
              <div>9:00 am</div>
            </div>
            <div className={classes.bottomActions}>
              <AphButton onClick={() => setIsDialogOpen(true)}>Choose Another Doctor</AphButton>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.actions}>
        <AphButton>Change Slot</AphButton>
        <AphButton color="primary">Accept</AphButton>
      </div>
      <AphDialog open={isDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Choose Doctor</AphDialogTitle>
        <ChooseDoctor />
      </AphDialog>
    </div>
  );
};
