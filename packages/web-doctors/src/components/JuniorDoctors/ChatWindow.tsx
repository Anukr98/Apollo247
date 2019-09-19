import React, { useEffect, useState } from 'react';
import { Theme, Button, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
import Pubnub from 'pubnub';
import Scrollbars from 'react-custom-scrollbars';
import { JDConsult } from 'components/JuniorDoctors/JDConsult';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '10px 25px 0 25px',
    },
    container: {
      position: 'relative',
      backgroundColor: '#fff',
      borderRadius: 10,
    },
    audioVideoContainer: {
      position: 'relative',
    },
    chatBody: {
      padding: '20px 10px',
      borderRadius: 10,
    },
    customScroll: {
      padding: '0 20px',
      paddingBottom: 20,
    },
    petient: {
      color: '#0087ba',
      textAlign: 'left',
      backgroundColor: '#fff',
      padding: '12px 16px',
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      fontSize: 15,
      wordBreak: 'break-all',
    },
    doctor: {
      backgroundColor: '#f0f4f5',
      padding: '12px 16px',
      color: '#02475b',
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      textAlign: 'left',
      fontSize: 16,
      maxWidth: '40%',
      wordBreak: 'break-all',
    },
    boldTxt: {
      fontWeight: 700,
    },
    sendMsgBtn: {
      backgroundColor: '#F9F9F9',
      color: '#000',
      width: '30 %',
      align: 'right',
    },
    inputWidth: {
      width: '60 %',
      align: 'left',
      paddingRight: 26,
    },
    showIncomingBox: {
      color: '#f00',
    },
    docterChat: {
      display: 'block',
      width: '100%',
      textAlign: 'right',
      margin: '5px 0 10px 0',
    },
    patientChat: {
      display: 'block',
      maxWidth: '50%',
      margin: '5px 5px 10px 70px',
      position: 'relative',
      '& img': {
        position: 'absolute',
        left: -50,
        top: 5,
        width: 40,
        borderRadius: '50%',
      },
    },
    chatFooter: {
      padding: '6px 16px 20px 16px',
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.15)',
      position: 'relative',
      borderRadius: '0 0 10px 10px',
    },
    chatsendcircle: {
      position: 'absolute',
      right: 0,
    },
    missCall: {
      color: '#890000',
      backgroundColor: 'rgba(229, 0, 0, 0.1)',
      borderRadius: 10,
      padding: '5px 20px',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: '24px',
    },
    callMsg: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      lineHeight: 'normal',
      '& img': {
        position: 'relative',
        top: 5,
        marginRight: 7,
        left: 0,
        width: 'auto',
      },
    },
    durationMsg: {
      fontSize: 10,
      marginTop: 2,
      display: 'block',
    },
    none: {
      display: 'none',
    },
    doctorChatRow: {
      paddingBottom: 8,
      textAlign: 'right',
    },
    chatBubble: {
      backgroundColor: '#f7f7f7',
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      borderRadius: 10,
      padding: '9px 16px',
      color: '#02475b',
      fontSize: 15,
      lineHeight: 1.47,
      letterSpacing: 'normal',
      opacity: 0.8,
      display: 'inline-block',
      maxWidth: 236,
      textAlign: 'left',
    },
    patientBubble: {
      backgroundColor: theme.palette.common.white,
      position: 'relative',
    },
    callStatusMessage: {
      paddingTop: 12,
    },
    messageText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      '& span:first-child': {
        paddingRight: 12,
        '& img': {
          verticalAlign: 'middle',
        },
      },
    },
    callDuration: {
      textAlign: 'right',
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
    },
    patientChatRow: {
      paddingBottom: 8,
      textAlign: 'right',
    },
    patientAvatar: {
      position: 'absolute',
      left: -40,
      bottom: 0,
    },
    avatar: {
      width: 32,
      height: 32,
    },
    customScrollWrap: {
      marginBottom: -37,
      '& >div': {
        top: '10px !important',
        bottom: '10px !important',
      },
    },
  };
});
interface MessagesObjectProps {
  id: string;
  message: string;
  username: string;
  text: string;
  duration: string;
  url: string;
}
interface ConsultRoomProps {
  startConsult: string;
  sessionId: string;
  token: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
}
let timerIntervalId: any;
let stoppedConsulTimer: number;
export const ChatWindow: React.FC<ConsultRoomProps> = (props) => {
  const classes = useStyles();
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const [isCallAccepted, setIsCallAccepted] = useState<boolean>(false);
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const [convertVideo, setConvertVideo] = useState<boolean>(false);

  const covertVideoMsg = '^^convert`video^^';
  const covertAudioMsg = '^^convert`audio^^';
  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const stopcallMsg = '^^callme`stop^^';
  const acceptcallMsg = '^^callme`accept^^';
  const startConsult = '^^#startconsult';
  const startConsultjr = '^^#startconsultJr';
  const stopConsult = '^^#stopconsult';
  const documentUpload = '^^#DocumentUpload';
  const transferconsult = '^^#transferconsult';
  const rescheduleconsult = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';
  const doctorId = props.doctorId;
  const patientId = props.patientId;
  const channel = props.appointmentId;
  const subscribekey: string = process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '';
  const publishkey: string = process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '';
  const config: Pubnub.PubnubConfig = {
    subscribeKey: subscribekey,
    publishKey: publishkey,
    ssl: true,
  };
  let leftComponent = 0;
  let rightComponent = 0;
  const pubnub = new Pubnub(config);
  let insertText: MessagesObjectProps[] = [];

  const [startTimerAppoinmentt, setstartTimerAppoinmentt] = React.useState<boolean>(false);
  const [startingTime, setStartingTime] = useState<number>(0);

  const timerMinuts = Math.floor(startingTime / 60);
  const timerSeconds = startingTime - timerMinuts * 60;
  const timerLastMinuts = Math.floor(startingTime / 60);
  const timerLastSeconds = startingTime - timerMinuts * 60;
  const startIntervalTimer = (timer: number) => {
    setstartTimerAppoinmentt(true);
    timerIntervalId = setInterval(() => {
      timer = timer + 1;
      stoppedConsulTimer = timer;
      setStartingTime(timer);
    }, 1000);
  };
  // const stopIntervalTimer = () => {
  //   setStartingTime(0);
  //   timerIntervalId && clearInterval(timerIntervalId);
  // };
  const srollToBottomAction = () => {
    setTimeout(() => {
      const scrollDiv = document.getElementById('scrollDiv');
      if (scrollDiv) {
        scrollDiv!.scrollIntoView();
      }
    }, 200);
  };
  const resetMessagesAction = () => {
    if (messageText === '') {
      setMsg('reset');
      setMsg('');
    }
  };
  const isURL = (str: string) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return pattern.test(str);
  };
  useEffect(() => {
    if (isCallAccepted) {
      startIntervalTimer(0);
    }
  }, [isCallAccepted]);
  useEffect(() => {
    pubnub.subscribe({
      channels: [channel],
      withPresence: true,
    });

    getHistory();

    pubnub.addListener({
      status: (statusEvent) => {},
      message: (message) => {
        insertText[insertText.length] = message.message;
        console.log(message.message);
        setMessages(() => [...insertText]);
        if (
          !showVideoChat &&
          message.message.message !== videoCallMsg &&
          message.message.message !== audioCallMsg &&
          message.message.message !== stopcallMsg &&
          message.message.message !== acceptcallMsg &&
          message.message.message !== startConsult &&
          message.message.message !== startConsultjr &&
          message.message.message !== stopConsult &&
          message.message.message !== transferconsult &&
          message.message.message !== rescheduleconsult &&
          message.message.message !== followupconsult
        ) {
          setIsNewMsg(true);
        }
        if (message.message && message.message.message === acceptcallMsg) {
          setIsCallAccepted(true);
        }
        srollToBottomAction();
        resetMessagesAction();
        getHistory();
      },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  }, []);
  // function getCookieValue() {
  //   const name = 'action=';
  //   const ca = document.cookie.split(';');
  //   for (let i = 0; i < ca.length; i++) {
  //     let c = ca[i];
  //     while (c.charAt(0) === ' ') {
  //       c = c.substring(1);
  //     }
  //     if (c.indexOf(name) === 0) {
  //       return c.substring(name.length, c.length);
  //     }
  //   }
  //   return '';
  // }
  // useEffect(() => {
  //   //if (props.startConsult !== isVideoCall) {
  //   if (getCookieValue() !== '') {
  //     setIsVideoCall(props.startConsult === 'videocall' ? true : false);
  //     setMessageText(videoCallMsg);
  //     autoSend();
  //   }
  // }, []);

  const getHistory = () => {
    pubnub.history({ channel: channel, reverse: true, count: 1000 }, (status, res) => {
      const newmessage: MessagesObjectProps[] = [];
      res.messages.forEach((element, index) => {
        newmessage[index] = element.entry;
      });
      insertText = newmessage;
      if (messages.length !== newmessage.length) {
        setMessages(newmessage);
      }
      srollToBottomAction();
    });
  };

  const send = () => {
    const text = {
      id: doctorId,
      message: messageText,
    };
    setMessageText('');
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        resetMessagesAction();
        srollToBottomAction();
        // setTimeout(() => {
        //   setMessageText('');
        //   const scrollDiv = document.getElementById('scrollDiv');
        //   if(scrollDiv){
        //     scrollDiv!.scrollIntoView();
        //   }
        // }, 100);
      }
    );
  };
  const autoSend = () => {
    const text = {
      id: doctorId,
      message: props.startConsult === 'videocall' ? videoCallMsg : audioCallMsg,
      isTyping: true,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
    actionBtn();
  };

  const renderChatRow = (rowData: MessagesObjectProps, index: number) => {
    if (
      rowData.id === doctorId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg &&
      rowData.message !== startConsult &&
      rowData.message !== startConsultjr &&
      rowData.message !== stopConsult &&
      rowData.message !== transferconsult &&
      rowData.message !== rescheduleconsult &&
      rowData.message !== followupconsult
    ) {
      leftComponent++;
      rightComponent = 0;
      return (
        <div className={classes.doctorChatRow}>
          {rowData.duration === '00 : 00' ? (
            <div className={classes.callStatusMessage}>
              <div className={classes.messageText}>
                <span>
                  <img src={require('images/ic_missedcall.svg')} />
                </span>
                <span>
                  {rowData.message.toLocaleLowerCase() === 'video call ended'
                    ? 'You missed a video call'
                    : 'You missed a voice call'}
                </span>
              </div>
            </div>
          ) : rowData.duration ? (
            <div className={classes.callStatusMessage}>
              <div className={classes.messageText}>
                <span>
                  <img src={require('images/ic_round_call.svg')} />
                </span>
                <span>{rowData.message}</span>
              </div>
              <div className={classes.callDuration}>Duration- {rowData.duration}</div>
            </div>
          ) : (
            <div className={classes.chatBubble}>
              {leftComponent == 1 && !rowData.duration && (
                <div className={classes.patientAvatar}>
                  <Avatar
                    className={classes.avatar}
                    src={require('images/ic_patientchat.png')}
                    alt=""
                  />
                </div>
              )}
              {rowData.message === documentUpload ? (
                <div>
                  <a href={rowData.url} target="_blank">
                    <img src={rowData.url} alt={rowData.url} />
                  </a>
                </div>
              ) : (
                <span>{rowData.message}</span>
              )}
              {/* {rowData.message} */}
            </div>
          )}
        </div>
      );
    }
    if (
      rowData.id === patientId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg &&
      rowData.message !== startConsult &&
      rowData.message !== startConsultjr &&
      rowData.message !== stopConsult &&
      rowData.message !== transferconsult &&
      rowData.message !== rescheduleconsult &&
      rowData.message !== followupconsult
    ) {
      leftComponent = 0;
      rightComponent++;
      return (
        <div className={classes.patientChatRow}>
          {rowData.duration === '00 : 00' ? (
            <div className={classes.callStatusMessage}>
              <div className={classes.messageText}>
                <span>
                  <img src={require('images/ic_missedcall.svg')} />
                </span>
                <span>
                  {rowData.message.toLocaleLowerCase() === 'video call ended'
                    ? 'You missed a video call'
                    : 'You missed a voice call'}
                </span>
              </div>
            </div>
          ) : rowData.duration ? (
            <div className={classes.callStatusMessage}>
              <div className={classes.messageText}>
                <span>
                  <img src={require('images/ic_round_call.svg')} />
                </span>
                <span>{rowData.message}</span>
              </div>
              <div className={classes.callDuration}>Duration- {rowData.duration}</div>
            </div>
          ) : (
            <div className={`${classes.chatBubble} ${classes.patientBubble}`}>
              {rightComponent == 1 && !rowData.duration && (
                <div className={classes.patientAvatar}>
                  <Avatar
                    className={classes.avatar}
                    src={require('images/ic_patientchat.png')}
                    alt=""
                  />
                </div>
              )}
              {rowData.message === documentUpload ? (
                <div style={{ width: '50px', height: '50px' }}>
                  <a href={rowData.url} target="_blank">
                    <img
                      style={{ width: '50px', height: '50px' }}
                      src={rowData.url}
                      alt={rowData.url}
                    />
                  </a>
                </div>
              ) : (
                <span>{rowData.message}</span>
              )}
              {/* {rowData.message} */}
            </div>
          )}
        </div>
      );
    }
    if (rowData.id !== patientId && rowData.id !== doctorId) {
      return '';
    }
  };
  const messagessHtml =
    messages && messages.length > 0
      ? messages.map((item: MessagesObjectProps, index: number) => {
          return <div key={index.toString()}>{renderChatRow(item, index)}</div>;
        })
      : '';
  const toggelChatVideo = () => {
    setIsNewMsg(false);
    setShowVideoChat(!showVideoChat);
    srollToBottomAction();
  };
  const actionBtn = () => {
    setShowVideo(true);
  };
  const stopAudioVideoCall = () => {
    setIsCallAccepted(false);
    setShowVideo(false);
    setShowVideoChat(false);
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    const text = {
      id: doctorId,
      message: stopcallMsg,
      isTyping: true,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
    const stoptext = {
      id: doctorId,
      message: `${props.startConsult === 'videocall' ? 'Video' : 'Audio'} call ended`,
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
      } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds}`,
      isTyping: true,
    };
    pubnub.publish(
      {
        channel: channel,
        message: stoptext,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
    //setIsVideoCall(false);
  };
  const stopAudioVideoCallpatient = () => {
    setIsCallAccepted(false);
    setShowVideo(false);
    setShowVideoChat(false);
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    const text = {
      id: doctorId,
      message: stopcallMsg,
      isTyping: true,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
  };
  // const [convertVideo, setConvertVideo] = useState<boolean>(false);

  // const covertVideoMsg = '^^convert`video^^';
  // const covertAudioMsg = '^^convert`audio^^';
  const convertCall = () => {
    setConvertVideo(!convertVideo);
    setTimeout(() => {
      pubnub.publish(
        {
          message: {
            isTyping: true,
            message: convertVideo ? covertVideoMsg : covertAudioMsg,
          },
          channel: channel,
          storeInHistory: false,
        },
        (status, response) => {}
      );
    }, 10);
  };
  return (
    <div className={classes.root}>
      <div className={!showVideo ? classes.container : classes.audioVideoContainer}>
        {showVideo && (
          <JDConsult
            toggelChatVideo={() => toggelChatVideo()}
            stopAudioVideoCall={() => stopAudioVideoCall()}
            stopAudioVideoCallpatient={() => stopAudioVideoCallpatient()}
            showVideoChat={showVideoChat}
            isVideoCall={isVideoCall}
            sessionId={props.sessionId}
            token={props.token}
            timerMinuts={timerMinuts}
            timerSeconds={timerSeconds}
            isCallAccepted={isCallAccepted}
            isNewMsg={isNewMsg}
            convertCall={() => convertCall()}
          />
        )}
        {(!showVideo || showVideoChat) && (
          <div className={classes.chatBody}>
            <Scrollbars
              className={classes.customScrollWrap}
              autoHide={true}
              style={{ height: 'calc(100vh - 505px' }}
            >
              <div className={classes.customScroll}>
                {messagessHtml}
                <div id="scrollDiv"></div>
              </div>
            </Scrollbars>
          </div>
        )}
        {(!showVideo || showVideoChat) && (
          <div className={classes.chatFooter}>
            <AphInput
              className={classes.inputWidth}
              inputProps={{ type: 'text' }}
              placeholder="Type here..."
              value={messageText}
              onKeyPress={(e) => {
                if ((e.which == 13 || e.keyCode == 13) && messageText.trim() !== '') {
                  send();
                }
              }}
              onChange={(event) => {
                setMessageText(event.currentTarget.value);
              }}
            />
            <Button className={classes.chatsendcircle}>
              <img src={require('images/ic_add_circle.svg')} alt="" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
