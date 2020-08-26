import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    doctorCardMain: {
      paddingLeft: 15,
      position: 'relative',
    },
    doctorAvatar: {
      position: 'absolute',
      bottom: 10,
    },
    blueBubble: {
      backgroundColor: '#0087ba',
      color: theme.palette.common.white,
      marginBottom: 5,
    },
    imageUpload: {
      overflow: 'hidden',
      borderRadius: 10,
      width: 130,
      cursor: 'pointer',
    },
    petient: {
      color: '#fff',
      textAlign: 'left',
      padding: 12,
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      backgroundColor: '#0087ba',
      fontSize: 15,
      maxWidth: 240,
      margin: '0 0 10px 45px',
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
    avatar: {
      width: 40,
      height: 40,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    durationMsg: {
      fontSize: 10,
      marginTop: 2,
      display: 'block',
      position: 'relative',
      top: -15,
      left: 30,
      width: '70%',
    },
    chatImgBubble: {
      padding: 0,
      border: 'none',
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
    audioCall: {
      background: 'transparent',
      boxShadow: 'none',
      padding: 0,
      color: '#02475B',
      marginLeft: 10,
      position: 'relative',
      top: -4,
    },
    missedCall: {
      background: 'transparent',
      boxShadow: 'none',
      padding: 0,
      color: '#890000',
      marginLeft: 10,
    },
  };
});

interface DoctorCardProps {
  message: string;
  duration: string;
  messageDetails: any;
  setModalOpen: (flag: boolean) => void;
  setImgPrevUrl: (url: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const classes = useStyles({});
  const message = props.message.replace(/\n/g, '<br />');
  return (
    <div className={classes.doctorCardMain}>
      <div className={classes.doctorAvatar}>
        {message.toLocaleLowerCase() !== 'video call ended' &&
          message.toLocaleLowerCase() !== 'audio call ended' && (
            <Avatar className={classes.avatar} src={require('images/ic_mascot_male.png')} alt="" />
          )}
      </div>
      {props.duration === '00 : 00' ? (
        <>
          <img src={require('images/ic_missedcall.svg')} />
          <div
            className={`${classes.blueBubble} ${classes.petient} ${classes.missedCall}`}
            dangerouslySetInnerHTML={{
              __html:
                message.toLocaleLowerCase() === 'video call ended'
                  ? 'You missed a video call'
                  : 'You missed a voice call',
            }}
          ></div>
        </>

      ) : props.duration ? (
        <div>
          <img src={require('images/ic_round_call.svg')} />
          <div
            className={`${classes.blueBubble} ${classes.petient} ${classes.audioCall}`}
            dangerouslySetInnerHTML={{
              __html: message.replace(/\<(?!br).*?\>/g, ''),
            }}
          ></div>
          <span className={classes.durationMsg}>Duration- {props.duration}</span>
        </div >
      ) : props.messageDetails.message === '^^#DocumentUpload' ? (
        <div className={classes.chatImgBubble}>
          <div
            className={classes.imageUpload}
            onClick={() => {
              props.setModalOpen(props.messageDetails.fileType === 'pdf' ? false : true);
              props.setImgPrevUrl(props.messageDetails.url);
            }}
          >
            {props.messageDetails.fileType === 'pdf' ? (
              <a href={props.messageDetails.url} target="_blank">
                <img src={require('images/pdf_thumbnail.png')} />
              </a>
            ) : (
                <img src={props.messageDetails.url} alt={props.messageDetails.url} />
              )}
          </div>
        </div>
      ) : (
              <div
                className={`${classes.blueBubble} ${classes.petient} `}
                dangerouslySetInnerHTML={{ __html: message.replace(/\<(?!br).*?\>/g, '') }}
              ></div>
            )}
    </div >
  );
};
