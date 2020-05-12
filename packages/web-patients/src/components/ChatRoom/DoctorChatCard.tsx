import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import React from 'react';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { ChooseDoctor } from 'components/ChatRoom/ChooseDoctor';
import { format } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      padding: 12,
      paddingTop: 28,
      marginTop: 36,
      borderRadius: 5,
    },
    avatar: {
      width: 48,
      height: 48,
      marginLeft: 'auto',
      marginTop: -52,
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
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
    },
    dateTime: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      paddingTop: 10,
    },
    cardActions: {
      paddingTop: 16,
      textAlign: 'right',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        color: '#fc9916',
        padding: 0,
      },
    },
  };
});
interface DoctorChatCardProps {
  transferData: any;
}
export const DoctorChatCard: React.FC<DoctorChatCardProps> = (props) => {
  const classes = useStyles({});
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const transferDate = props.transferData.transferDateTime
    ? format(new Date(props.transferData.transferDateTime), 'Do MMMM, dddd')
    : '';
  const transferTime = props.transferData.transferDateTime
    ? format(new Date(props.transferData.transferDateTime), 'h:mm a')
    : '';
  //('h:mm a')
  return (
    <div className={classes.root}>
      <Avatar alt="" src={require('images/doctordp_01.png')} className={classes.avatar} />
      <div className={classes.doctorName}>Dr. {props.transferData.doctorName}</div>
      <div className={classes.doctorInfo}>
        {props.transferData.specilty} | {props.transferData.experience}
      </div>
      <div className={classes.dateTime}>
        <div>{transferDate}</div>
        <div>{transferTime}</div>
      </div>
      <div className={classes.cardActions}>
        <AphButton onClick={() => setIsDialogOpen(true)}>Choose Another Doctor</AphButton>
      </div>
      <AphDialog open={isDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Choose Doctor</AphDialogTitle>
        <ChooseDoctor />
      </AphDialog>
    </div>
  );
};
