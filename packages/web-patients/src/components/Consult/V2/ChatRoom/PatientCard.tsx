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
    imageUpload: {
      overflow: 'hidden',
      borderRadius: 10,
      width: 130,
      cursor: 'pointer',
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
      display: 'inline',
      fontWeight: 500,
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

interface PatientCardProps {
  message: string;
  chatTime: string;
  duration: string;
  messageDetails: any;
  setModalOpen: (flag: boolean) => void;
  setImgPrevUrl: (url: string) => void;
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
        <div
          className={
            message.toLocaleLowerCase() !== 'video call ended' &&
            message.toLocaleLowerCase() !== 'audio call ended'
              ? classes.chatBubble
              : ''
          }
        >
          <div className={classes.chatQuesTxt}>
            {props.duration === '00 : 00' ? (
              <>
                <img src={require('images/ic_missedcall.svg')} />
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      message.toLocaleLowerCase() === 'video call ended'
                        ? 'Doctor missed a video call'
                        : 'Doctor missed a voice call',
                  }}
                ></div>
              </>
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
                    <a href={props.messageDetails.url} target="_blank" rel="noopener noreferrer">
                      <img src={require('images/pdf_thumbnail.png')} />
                    </a>
                  ) : (
                    <img
                      src={props.messageDetails.url}
                      alt="Unable to load the image"
                      // onError={(e: any) => {
                      //   handleImageError(e, props.messageDetails.url);
                      // }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <>
                {props.duration && props.duration !== '00 : 00' && (
                  <img src={require('images/ic_round_call.svg')} />
                )}
                <div
                  className={classes.audioCall}
                  dangerouslySetInnerHTML={{ __html: message.replace(/\<(?!br).*?\>/g, '') }}
                ></div>
              </>
            )}
          </div>
          {props.duration && props.duration !== '00 : 00' && (
            <div className={`${classes.chatTime} ${classes.defaultChatTime}`}>
              Duration {props.duration}
            </div>
          )}
          <div className={`${classes.chatTime} ${classes.defaultChatTime}`}>{chatTime}</div>
        </div>
      </div>
    </div>
  );
};
