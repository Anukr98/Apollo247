import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import format from 'date-fns/format';

const useStyles = makeStyles((theme: Theme) => {
  return {
    patientCardMain: {
      textAlign: 'right',
    },
    chatBub: {
      padding: '6px 16px',
      color: '#02475b',
    },
    chatBubble: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      padding: '12px 16px',
      color: '#01475b',
      fontSize: 15,
      fontWeight: 500,
      textAlign: 'left',
      display: 'inline-block',
      borderRadius: 10,
      maxWidth: 244,
      wordBreak: 'break-word',
    },
    chatTime: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      color: 'rgba(255, 255, 255, 0.6)',
      margin: '10px 0 0 0',
    },
    defaultChatTime: {
      color: 'rgba(2, 71, 91, 0.6)',
    },
  };
});

interface PatientCardProps {
  message: string;
  chatTime: string;
}

export const PatientCard: React.FC<PatientCardProps> = (props) => {
  const classes = useStyles({});
  const chatTime = format(new Date(props.chatTime), 'do MMMM yyyy, hh:mm aaaa');
  // console.log(props.chatTime, props.message);
  return (
    <div className={classes.patientCardMain}>
      <div className={classes.chatBub}>
        <div className={classes.chatBubble}>
          <div>
            <div>{props.message}</div>
          </div>
          <div className={`${classes.chatTime} ${classes.defaultChatTime}`}>{chatTime}</div>
        </div>
      </div>
    </div>
  );
};
