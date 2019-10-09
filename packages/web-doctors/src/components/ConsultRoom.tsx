import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput, AphButton } from '@aph/web-ui-components';
import { Consult } from 'components/Consult';
import Pubnub from 'pubnub';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consultRoom: {
      paddingTop: 0,
      paddingBottom: 0,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    chatContainer: {
      paddingTop: 20,
      minHeight: 'calc(100vh - 330px)',
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
      marginRight: 30,
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
      align: 'left',
    },
    showIncomingBox: {
      color: '#f00',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      backgroundColor: '#f7f7f7',
      paddingBottom: 95,
    },
    audioVideoContainer: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      backgroundColor: '#f7f7f7',
      paddingBottom: 0,
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
    },
    patientIcon: {
      position: 'absolute',
      left: -50,
      top: 5,
      width: 40,
      borderRadius: '50%',
    },
    chatFooterSection: {
      position: 'absolute',
      padding: '40px 20px 20px 20px',
      clear: 'both',
      backgroundColor: '#fff',
      width: '100%',
      boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
      '& >div': {
        display: 'flex',
        '& button': {
          boxShadow: 'none',
          padding: 0,
          paddingTop: 8,
          minWidth: 'auto',
        },
      },
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
      marginRight: 32,
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
    addImgBtn: {
      marginRight: 16,
    },
    sendBtn: {
      marginLeft: 16,
      //display: 'none',
    },
  };
});
interface MessagesObjectProps {
  id: string;
  message: string;
  username: string;
  automatedText: string;
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
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
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
  const transferconsult = '^^#transferconsult';
  const rescheduleconsult = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';
  const documentUpload = '^^#DocumentUpload';
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
  let jrDrComponent = 0;
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
  const stopIntervalTimer = () => {
    setStartingTime(0);
    timerIntervalId && clearInterval(timerIntervalId);
  };
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
  const getAutomatedMessage = (rowData: MessagesObjectProps) => {
    if (
      rowData.message === startConsult ||
      rowData.message === startConsultjr ||
      rowData.message === stopConsult
    ) {
      return rowData.automatedText;
    } else {
      return rowData.message;
    }
  };
  const renderChatRow = (rowData: MessagesObjectProps, index: number) => {
    if (
      rowData.id === doctorId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg &&
      rowData.message !== transferconsult &&
      rowData.message !== rescheduleconsult &&
      rowData.message !== followupconsult
    ) {
      leftComponent++;
      rightComponent = 0;
      jrDrComponent = 0;
      return (
        <div className={classes.docterChat}>
          <div className={rowData.duration ? classes.callMsg : classes.doctor}>
            {leftComponent == 1 && <span className={classes.boldTxt}></span>}
            {rowData.duration === '00 : 00' ? (
              <span className={classes.none}>
                <img src={require('images/ic_missedcall.svg')} />
                {rowData.message.toLocaleLowerCase() === 'video call ended'
                  ? 'You missed a video call'
                  : 'You missed a voice call'}
              </span>
            ) : rowData.duration ? (
              <div>
                <img src={require('images/ic_round_call.svg')} />
                <span>{rowData.message}</span>
                <span className={classes.durationMsg}>Duration- {rowData.duration}</span>
              </div>
            ) : (
              <div>
                <span>{getAutomatedMessage(rowData)}</span>
              </div>
            )}
          </div>
        </div>
      );
    } else if (
      rowData.id === patientId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg &&
      rowData.message !== transferconsult &&
      rowData.message !== rescheduleconsult &&
      rowData.message !== followupconsult
    ) {
      leftComponent = 0;
      jrDrComponent = 0;
      rightComponent++;
      return (
        <div className={classes.patientChat}>
          <div className={rowData.duration ? classes.callMsg : classes.petient}>
            {rightComponent == 1 && !rowData.duration && (
              <span className={classes.boldTxt}>
                <img className={classes.patientIcon} src={require('images/ic_patientchat.png')} />
              </span>
            )}
            {rowData.duration === '00 : 00' ? (
              <span className={classes.missCall}>
                <img src={require('images/ic_missedcall.svg')} />
                {rowData.message.toLocaleLowerCase() === 'video call ended'
                  ? 'You missed a video call'
                  : 'You missed a voice call'}
              </span>
            ) : rowData.duration ? (
              <div>
                <img src={require('images/ic_round_call.svg')} />
                <span>{rowData.message}</span>
                <span className={classes.durationMsg}>Duration- {rowData.duration}</span>
              </div>
            ) : (
              <div>
                {rowData.message === documentUpload ? (
                  <div style={{ width: '200px', height: 'auto' }}>
                    <a href={rowData.url} target="_blank">
                      <img
                        style={{ width: '200px', height: 'auto' }}
                        src={rowData.url}
                        alt={rowData.url}
                      />
                    </a>
                  </div>
                ) : (
                  <span>{getAutomatedMessage(rowData)}</span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    } else if (
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg &&
      rowData.message !== transferconsult &&
      rowData.message !== rescheduleconsult &&
      rowData.message !== followupconsult
    ) {
      jrDrComponent++;
      leftComponent = 0;
      rightComponent = 0;
      return (
        <div className={classes.docterChat}>
          <div className={rowData.duration ? classes.callMsg : classes.doctor}>
            {leftComponent == 1 && <span className={classes.boldTxt}></span>}
            {rowData.duration === '00 : 00' ? (
              <span className={classes.none}>
                <img src={require('images/ic_missedcall.svg')} />
                {rowData.message.toLocaleLowerCase() === 'video call ended'
                  ? 'You missed a video call'
                  : 'You missed a voice call'}
              </span>
            ) : rowData.duration ? (
              <div>
                <img src={require('images/ic_round_call.svg')} />
                <span>{rowData.message}</span>
                <span className={classes.durationMsg}>Duration- {rowData.duration}</span>
              </div>
            ) : (
              <div>
                {rowData.message === documentUpload ? (
                  <div style={{ width: '200px', height: 'auto' }}>
                    <a href={rowData.url} target="_blank">
                      <img
                        style={{ width: '200px', height: 'auto' }}
                        src={rowData.url}
                        alt={rowData.url}
                      />
                    </a>
                  </div>
                ) : (
                  <span>{getAutomatedMessage(rowData)}</span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    // if (rowData.id !== patientId && rowData.id !== doctorId) {
    //   return '';
    // }
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
    stopIntervalTimer();
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
    stopIntervalTimer();
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
    <div className={classes.consultRoom}>
      <div className={!showVideo ? classes.container : classes.audioVideoContainer}>
        {showVideo && (
          <Consult
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
        <div>
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatContainer}>
              <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 360px)'}>
                {messagessHtml}
                <span id="scrollDiv"></span>
              </Scrollbars>
            </div>
          )}
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatFooterSection}>
              <div>
                <Button className={classes.addImgBtn}>
                  <img src={require('images/ic_add_circle.svg')} alt="" />
                </Button>
                <AphInput
                  className={classes.inputWidth}
                  inputProps={{ type: 'text' }}
                  placeholder="Type here..."
                  value={messageText}
                  onKeyPress={(e: any) => {
                    if ((e.which == 13 || e.keyCode == 13) && messageText.trim() !== '') {
                      send();
                    }
                  }}
                  onChange={(event: any) => {
                    setMessageText(event.currentTarget.value);
                  }}
                />
                <AphButton
                  className={classes.sendBtn}
                  onClick={() => {
                    if (messageText.trim() !== '') {
                      send();
                    }
                  }}
                >
                  <img src={require('images/ic_send.svg')} alt="" />
                </AphButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
