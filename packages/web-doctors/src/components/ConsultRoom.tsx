import React, { useEffect, useState, useContext } from 'react';
import { Theme, Button, Avatar, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput, AphButton, AphTextField } from '@aph/web-ui-components';
import Pubnub from 'pubnub';
import Scrollbars from 'react-custom-scrollbars';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { ApolloError } from 'apollo-client';

import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import { AddChatDocument, AddChatDocumentVariables } from 'graphql/types/AddChatDocument';
import { ADD_CHAT_DOCUMENT } from 'graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

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
    patientAvatar: {
      position: 'absolute',
      left: -40,
      bottom: 0,
    },
    avatar: {
      width: 32,
      height: 32,
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
      wordBreak: 'break-word',
    },
    patientBubble: {
      backgroundColor: theme.palette.common.white,
      position: 'relative',
    },
    chatImgBubble: {
      padding: 0,
      border: 'none',
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
    doctor: {
      backgroundColor: 'transparent',
      padding: '6px 16px',
      color: '#02475b',
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 10,
      boxShadow: 'none',
      marginRight: 30,
      textAlign: 'left',
      fontSize: 16,
      maxWidth: '40%',
      wordBreak: 'break-all',
      border: 'none',
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
    chatSendBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minWidth: 'auto',
      padding: 0,
      marginLeft: 16,
      paddingTop: 8,
      //display: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&:focus': {
        backgroundColor: 'transparent',
      },
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
      background: 'transparent',
      minWidth: 35,
      maxWidth: 35,
      boxShadow: 'none',
      '&:hover': {
        background: 'transparent',
      },
    },
    sendBtn: {
      marginLeft: 16,
      //display: 'none',
    },
    imageUpload: {
      overflow: 'hidden',
      borderRadius: 10,
      width: 130,
      cursor: 'pointer',
    },
    modalWindowWrap: {
      display: 'table',
      height: '100%',
      width: '100%',
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
    },
    tableContent: {
      display: 'table-cell',
      verticalAlign: 'middle',
      width: '100%',
      '&:focus': {
        outline: 'none',
      },
    },
    modalWindow: {
      backgroundColor: theme.palette.common.black,
      maxWidth: 600,
      margin: 'auto',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.2)',
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
    },
    modalHeader: {
      minHeight: 56,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 0.5,
      color: theme.palette.common.white,
      padding: '16px 50px',
      textTransform: 'uppercase',
      position: 'relative',
      wordBreak: 'break-word',
    },
    modalClose: {
      position: 'absolute',
      right: 16,
      top: 16,
      width: 24,
      height: 24,
      cursor: 'pointer',
    },
    modalFooter: {
      height: 56,
      textAlign: 'center',
      padding: 16,
      textTransform: 'uppercase',
    },
    modalContent: {
      textAlign: 'center',
      maxHeight: 'calc(100vh - 212px)',
      overflow: 'hidden',
      '& img': {
        maxWidth: '100%',
      },
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
  // const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const [isCallAccepted, setIsCallAccepted] = useState<boolean>(false);
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [fileUploading, setFileUploading] = React.useState<boolean>(false);
  const [fileUploadErrorMessage, setFileUploadErrorMessage] = React.useState<string>('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [imgPrevUrl, setImgPrevUrl] = React.useState();
  const { documentArray, setDocumentArray } = useContext(CaseSheetContext);

  const apolloClient = useApolloClient();
  // const [convertVideo, setConvertVideo] = useState<boolean>(false);

  // const covertVideoMsg = '^^convert`video^^';
  // const covertAudioMsg = '^^convert`audio^^';
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
  const patientConsultStarted = '^^#PatientConsultStarted';
  const firstMessage = '^^#firstMessage';
  const secondMessage = '^^#secondMessage';
  const languageQue = '^^#languageQue';
  const jdThankyou = '^^#jdThankyou';

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

  // const timerMinuts = Math.floor(startingTime / 60);
  // const timerSeconds = startingTime - timerMinuts * 60;
  // const timerLastMinuts = Math.floor(startingTime / 60);
  // const timerLastSeconds = startingTime - timerMinuts * 60;
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
  // const isURL = (str: string) => {
  //   const pattern = new RegExp(
  //     '^(https?:\\/\\/)?' + // protocol
  //     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
  //     '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  //     '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  //     '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  //       '(\\#[-a-z\\d_]*)?$',
  //     'i'
  //   ); // fragment locator
  //   return pattern.test(str);
  // };
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

    getHistory(0);

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
          message.message.message !== followupconsult &&
          message.message.message !== patientConsultStarted &&
          message.message.message !== firstMessage &&
          message.message.message !== secondMessage
        ) {
          setIsNewMsg(true);
        } else {
          setIsNewMsg(false);
        }
        if (message.message && message.message.message === acceptcallMsg) {
          setIsCallAccepted(true);
        }
        srollToBottomAction();
        resetMessagesAction();
        //getHistory(0);
      },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  }, []);

  const getHistory = (timetoken: number) => {
    pubnub.history(
      {
        channel: channel,
        reverse: true,
        count: 1000,
        stringifiedTimeToken: true,
        start: timetoken,
      },
      (status, res) => {
        const newmessage: MessagesObjectProps[] = messages;
        res.messages.forEach((element, index) => {
          //newmessage[index] = element.entry;
          newmessage.push(element.entry);
        });
        insertText = newmessage;
        //if (messages.length !== newmessage.length) {
        setMessages(newmessage);
        //}
        const end: number = res.endTimeToken ? res.endTimeToken : 1;
        if (res.messages.length == 100) {
          getHistory(end);
        }
        resetMessagesAction();
        srollToBottomAction();
      }
    );
  };

  const sendMsg = (msgObject: any, isStoreInHistory: boolean) => {
    pubnub.publish(
      {
        channel: channel,
        message: msgObject,
        storeInHistory: isStoreInHistory,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
        srollToBottomAction();
      }
    );
  };

  const uploadfile = (url: string) => {
    console.log('ram');
    apolloClient
      .mutate<AddChatDocument, AddChatDocumentVariables>({
        mutation: ADD_CHAT_DOCUMENT,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: props.appointmentId, documentPath: url },
      })
      .then((_data) => {
        if (_data && _data.data) {
          console.log('Document ', _data.data.addChatDocument);
          setDocumentArray(_data.data.addChatDocument);
        }
      })
      .catch((error: ApolloError) => {
        console.log(error);
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
      rowData.message === stopConsult ||
      rowData.message === languageQue ||
      rowData.message === jdThankyou
    ) {
      return rowData.automatedText;
    } else {
      return rowData.message;
    }
  };
  const renderChatRow = (rowData: MessagesObjectProps, index: number) => {
    const { patientDetails } = useContext(CaseSheetContext);
    if (
      rowData.id === doctorId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg &&
      rowData.message !== transferconsult &&
      rowData.message !== rescheduleconsult &&
      rowData.message !== followupconsult &&
      rowData.message !== patientConsultStarted &&
      rowData.message !== firstMessage &&
      rowData.message !== secondMessage
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
              // <div>
              //   <span>{getAutomatedMessage(rowData)}</span>
              // </div>
              <div
                className={`${classes.chatBubble} ${
                  rowData.message === documentUpload ? classes.chatImgBubble : ''
                }`}
              >
                {leftComponent == 1 && !rowData.duration && (
                  <div className={classes.patientAvatar}>
                    <Avatar
                      className={classes.avatar}
                      src={
                        patientDetails && patientDetails.photoUrl
                          ? patientDetails!.photoUrl
                          : require('images/no_photo_icon_round.svg')
                      }
                      alt=""
                    />
                  </div>
                )}
                {rowData.message === documentUpload ? (
                  // <div>
                  //   <img src={rowData.url} alt={rowData.url} />
                  // </div>
                  <div
                    onClick={() => {
                      setModalOpen(true);
                      setImgPrevUrl(rowData.url);
                    }}
                    className={classes.imageUpload}
                  >
                    <img src={rowData.url} alt={rowData.url} />
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
      rowData.id === patientId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg &&
      rowData.message !== transferconsult &&
      rowData.message !== rescheduleconsult &&
      rowData.message !== followupconsult &&
      rowData.message !== patientConsultStarted &&
      rowData.message !== firstMessage &&
      rowData.message !== secondMessage
    ) {
      leftComponent = 0;
      jrDrComponent = 0;
      rightComponent++;
      return (
        <div className={classes.patientChat}>
          <div className={rowData.duration ? classes.callMsg : ''}>
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
              <div
                className={`${classes.chatBubble} ${classes.patientBubble} ${
                  rowData.message === documentUpload ? classes.chatImgBubble : ''
                }`}
              >
                {rightComponent == 1 && !rowData.duration && (
                  <div className={classes.patientAvatar}>
                    <Avatar
                      className={classes.avatar}
                      src={
                        patientDetails && patientDetails.photoUrl
                          ? patientDetails!.photoUrl
                          : require('images/no_photo_icon_round.svg')
                      }
                      alt=""
                    />
                  </div>
                )}
                {rowData.message === documentUpload ? (
                  <div
                    onClick={() => {
                      setModalOpen(true);
                      setImgPrevUrl(rowData.url);
                    }}
                    className={classes.imageUpload}
                  >
                    <img src={rowData.url} alt={rowData.url} />
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
      rowData.message !== followupconsult &&
      rowData.message !== patientConsultStarted &&
      rowData.message !== firstMessage &&
      rowData.message !== secondMessage
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
              // <div>
              //   {rowData.message === documentUpload ? (
              //     <div style={{ width: '200px', height: 'auto' }}>
              //       <a href={rowData.url} target="_blank">
              //         <img
              //           style={{ width: '200px', height: 'auto' }}
              //           src={rowData.url}
              //           alt={rowData.url}
              //         />
              //       </a>
              //     </div>
              //   ) : (
              //     <span>{getAutomatedMessage(rowData)}</span>
              //   )}
              // </div>
              <div
                className={`${classes.chatBubble} ${
                  rowData.message === documentUpload ? classes.chatImgBubble : ''
                }`}
              >
                {leftComponent == 1 && !rowData.duration && (
                  <div className={classes.patientAvatar}>
                    <Avatar
                      className={classes.avatar}
                      src={
                        patientDetails && patientDetails.photoUrl
                          ? patientDetails!.photoUrl
                          : require('images/no_photo_icon_round.svg')
                      }
                      alt=""
                    />
                  </div>
                )}
                {rowData.message === documentUpload ? (
                  <div
                    onClick={() => {
                      setModalOpen(true);
                      setImgPrevUrl(rowData.url);
                    }}
                    className={classes.imageUpload}
                  >
                    <img src={rowData.url} alt={rowData.url} />
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
  // const toggelChatVideo = () => {
  //   setIsNewMsg(false);
  //   setShowVideoChat(!showVideoChat);
  //   srollToBottomAction();
  // };
  // const actionBtn = () => {
  //   setShowVideo(true);
  // };
  // const stopAudioVideoCall = () => {
  //   setIsCallAccepted(false);
  //   setShowVideo(false);
  //   setShowVideoChat(false);
  //   const cookieStr = `action=`;
  //   document.cookie = cookieStr + ';path=/;';
  //   const text = {
  //     id: doctorId,
  //     message: stopcallMsg,
  //     isTyping: true,
  //   };
  //   pubnub.publish(
  //     {
  //       channel: channel,
  //       message: text,
  //       storeInHistory: true,
  //       sendByPost: true,
  //     },
  //     (status, response) => {
  //       setMessageText('');
  //     }
  //   );
  //   const stoptext = {
  //     id: doctorId,
  //     message: `${props.startConsult === 'videocall' ? 'Video' : 'Audio'} call ended`,
  //     duration: `${
  //       timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
  //     } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds}`,
  //     isTyping: true,
  //   };
  //   pubnub.publish(
  //     {
  //       channel: channel,
  //       message: stoptext,
  //       storeInHistory: true,
  //       sendByPost: true,
  //     },
  //     (status, response) => {
  //       setMessageText('');
  //     }
  //   );
  //   stopIntervalTimer();
  //   //setIsVideoCall(false);
  // };
  // const stopAudioVideoCallpatient = () => {
  //   setIsCallAccepted(false);
  //   setShowVideo(false);
  //   setShowVideoChat(false);
  //   const cookieStr = `action=`;
  //   document.cookie = cookieStr + ';path=/;';
  //   const text = {
  //     id: doctorId,
  //     message: stopcallMsg,
  //     isTyping: true,
  //   };
  //   pubnub.publish(
  //     {
  //       channel: channel,
  //       message: text,
  //       storeInHistory: true,
  //       sendByPost: true,
  //     },
  //     (status, response) => {
  //       setMessageText('');
  //     }
  //   );
  //   stopIntervalTimer();
  // };
  // const [convertVideo, setConvertVideo] = useState<boolean>(false);

  // const covertVideoMsg = '^^convert`video^^';
  // const covertAudioMsg = '^^convert`audio^^';
  // const convertCall = () => {
  //   setConvertVideo(!convertVideo);
  //   setTimeout(() => {
  //     pubnub.publish(
  //       {
  //         message: {
  //           isTyping: true,
  //           message: convertVideo ? covertVideoMsg : covertAudioMsg,
  //         },
  //         channel: channel,
  //         storeInHistory: false,
  //       },
  //       (status, response) => {}
  //     );
  //   }, 10);
  // };
  return (
    <div className={classes.consultRoom}>
      <div className={!showVideo ? classes.container : classes.audioVideoContainer}>
        {/* {showVideo && (
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
        )} */}
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
              {/* <div>
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
              </div> */}
              <div>
                <Button
                  className={classes.addImgBtn}
                  variant="contained"
                  component="label"
                  disabled={fileUploading}
                >
                  <img src={require('images/ic_add_circle.svg')} alt="" />
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    disabled={fileUploading}
                    // onChange={async (e) => {
                    //   setIsUploading(false);
                    //   setUploadedFileUrl(null);
                    //   const files = e.currentTarget.files;
                    //   const file = files && files.length > 0 ? files[0] : null;
                    //   if (file) {
                    //     setIsUploading(true);
                    //     const aphBlob = await client.uploadBrowserFile({ file }).catch((error) => {
                    //       throw error;
                    //     });
                    //     const url = client.getBlobUrl(aphBlob.name);
                    //     console.log(aphBlob, url);
                    //     setUploadedFileUrl(url);
                    //     setIsUploading(false);
                    //   }
                    // }}
                    onChange={async (e) => {
                      const fileNames = e.target.files;
                      if (fileNames && fileNames.length > 0) {
                        setFileUploading(true);
                        const file = fileNames[0] || null;
                        const fileExtension = file.name.split('.').pop();
                        const fileSize = file.size;
                        if (fileSize > 2000000) {
                          setFileUploadErrorMessage(
                            'Invalid File Size. File size must be less than 2MB'
                          );
                          setIsDialogOpen(true);
                        } else if (
                          fileExtension &&
                          (fileExtension.toLowerCase() === 'png' ||
                            fileExtension.toLowerCase() === 'jpg' ||
                            fileExtension.toLowerCase() === 'jpeg')
                        ) {
                          if (file) {
                            const aphBlob = await client
                              .uploadBrowserFile({ file })
                              .catch((error) => {
                                throw error;
                              });
                            const url = client.getBlobUrl(aphBlob.name);
                            const uploadObject = {
                              id: doctorId,
                              fileType: `image`,
                              message: `^^#DocumentUpload`,
                              url: url,
                              isTyping: true,
                            };
                            console.log('aphBlob', aphBlob, url);
                            uploadfile(url);
                            sendMsg(uploadObject, true);
                            setFileUploading(false);
                          }
                        } else {
                          setFileUploadErrorMessage(
                            'Invalid File Extension. Only files with .jpg, .png or .pdf extensions are allowed.'
                          );
                          setIsDialogOpen(true);
                        }
                      }
                    }}
                  />
                </Button>
                )}
                <AphTextField
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
                <AphButton
                  className={classes.chatSendBtn}
                  onClick={() => {
                    if (messageText.trim() !== '') {
                      send();
                    }
                  }}
                >
                  <img src={require('images/ic_send.svg')} alt="" />
                </AphButton>
                {/* {props.disableChat && (
              <Button className={classes.chatsendcircle} variant="contained" component="label">
                <img src={require('images/ic_add_circle.svg')} alt="" />
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const fileNames = e.target.files;
                    if (fileNames && fileNames.length > 0) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataURL = reader.result;
                        setChatUploadFile(dataURL);
                        mutationUploadChatDocument();
                        // console.log(dataURL);
                      };
                      reader.readAsDataURL(fileNames[0]);
                    }
                  }}
                />
              </Button>
            )} */}
              </div>
            </div>
          )}
        </div>
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <DialogTitle>File Upload Error</DialogTitle>
          <DialogContent>
            <DialogContentText>{fileUploadErrorMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => {
                setIsDialogOpen(false);
                setFileUploading(false);
              }}
              autoFocus
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className={classes.modalWindowWrap}>
            <div className={classes.tableContent}>
              <div className={classes.modalWindow}>
                <div className={classes.modalHeader}>
                  {/* IMAGE001.JPG */}
                  <div className={classes.modalClose} onClick={() => setModalOpen(false)}>
                    <img src={require('images/ic_round_clear.svg')} alt="" />
                  </div>
                </div>
                <div className={classes.modalContent}>
                  <img src={imgPrevUrl} alt="" />
                </div>
                <div className={classes.modalFooter}></div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
