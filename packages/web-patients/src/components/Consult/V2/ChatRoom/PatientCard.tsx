import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';

const useStyles = makeStyles((theme: Theme) => {
  return {
    patientCardMain: {
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        paddingRight: 15,
      },
    },
    chatBub: {
      padding: '6px 16px',
      color: '#02475b',
    },
    chatBubble: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      padding: '12px 6px 4px 12px',
      color: '#01475b',
      fontSize: 15,
      fontWeight: 500,
      minWidth: 97,
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
      color: 'rgba(101, 143, 155, 0.6)',
      textAlign: 'right',
      margin: '2px 0 0 0',
    },
    chatQuesTxt: {
      lineHeight: '22px',
    },
  };
});

interface PatientCardProps {
  message: string;
  chatTime: string;
}

export const PatientCard: React.FC<PatientCardProps> = (props) => {
  const classes = useStyles({});
  const chatDate = new Date(props.chatTime);
  const chatTime = isToday(chatDate)
    ? format(chatDate, 'hh:mm a')
    : format(chatDate, 'do MMMM yyyy, hh:mm a');
  const message = props.message.replace(/\n/g, '<br />');
  return (
    <div className={classes.patientCardMain}>
      <div className={classes.chatBub}>
        <div className={classes.chatBubble}>
          <div className={classes.chatQuesTxt}>
            <div dangerouslySetInnerHTML={{ __html: message.replace(/\<(?!br).*?\>/g, '') }}></div>
          </div>
          <div className={`${classes.chatTime} ${classes.defaultChatTime}`}>{chatTime}</div>
        </div>
      </div>
    </div>
  );
};
