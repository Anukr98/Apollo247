import React, { useEffect, useState, useContext } from 'react';
import { Theme, Button, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Pubnub from 'pubnub';
import Scrollbars from 'react-custom-scrollbars';
import { JDConsult } from 'components/JuniorDoctors/JDConsult';
// import { UploadChatDocument, UploadChatDocumentVariables } from 'graphql/types/UploadChatDocument';
// import { UPLOAD_CHAT_DOCUMENT } from 'graphql/consults';
// import { useMutation } from 'react-apollo-hooks';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { CaseSheetContext } from 'context/CaseSheetContext';

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '10px 15px 20px 15px',
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
      padding: '0 10px',
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
      width: '30%',
      align: 'right',
    },
    inputWidth: {
      '& input': {
        paddingRight: 35,
      },
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
      display: 'flex',
    },
    chatsendcircle: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      minWidth: 'auto',
      padding: 0,
      marginRight: 16,
      paddingTop: 8,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&:focus': {
        backgroundColor: 'transparent',
      },
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
      wordBreak: 'break-word',
    },
    chatImgBubble: {
      padding: 0,
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
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
      textAlign: 'left',
      paddingLeft: 40,
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
        top: '20px !important',
        bottom: '0 !important',
      },
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
    imageUpload: {
      overflow: 'hidden',
      borderRadius: 10,
      width: 100,
      height: 100,
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
  disableChat: boolean;
  isNewMessage: (isNewMessage: boolean) => void;
  autoCloseCaseSheet: boolean;
}

// let timerIntervalId: any;
// let stoppedConsulTimer: number;

export const ChatWindow: React.FC<ConsultRoomProps> = (props) => {
  const classes = useStyles();
  const isVideoCall = false;

  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  // const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const [isCallAccepted, setIsCallAccepted] = useState<boolean>(false);
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const [convertVideo, setConvertVideo] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [fileUploadErrorMessage, setFileUploadErrorMessage] = React.useState<string>('');
  const [fileUploading, setFileUploading] = React.useState<boolean>(false);

  // this hook is used to send auto chat message when the consult is closed by system
  useEffect(() => {
    console.log('auto close case sheet action....', props.autoCloseCaseSheet);
  }, [props.autoCloseCaseSheet]);

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
  const patientConsultStarted = '^^#PatientConsultStarted';
  const firstMessage = '^^#firstMessage';
  const secondMessage = '^^#secondMessage';
  const languageQue = '^^#languageQue';

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

  // const [startTimerAppoinmentt, setstartTimerAppoinmentt] = React.useState<boolean>(false);
  const [startingTime, setStartingTime] = useState<number>(0);

  const timerMinuts = Math.floor(startingTime / 60);
  const timerSeconds = startingTime - timerMinuts * 60;
  const timerLastMinuts = Math.floor(startingTime / 60);
  const timerLastSeconds = startingTime - timerMinuts * 60;
  const { patientDetails } = useContext(CaseSheetContext);

  const startIntervalTimer = (timer: number) => {
    // setstartTimerAppoinmentt(true);
    setInterval(() => {
      timer = timer + 1;
      // stoppedConsulTimer = timer;
      setStartingTime(timer);
    }, 1000);
  };

  // const mutationUploadChatDocument = useMutation<UploadChatDocument, UploadChatDocumentVariables>(
  //   UPLOAD_CHAT_DOCUMENT
  // );

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
      status: (statusEvent) => { },
      message: (message) => {
        console.log(message.message);
        insertText[insertText.length] = message.message;
        setMessages(() => [...insertText]);
        resetMessagesAction();
        // console.log(message.message);
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
          props.isNewMessage(true);
        }
        if (message.message && message.message.message === acceptcallMsg) {
          setIsCallAccepted(true);
        }
        resetMessagesAction();
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
        console.log(newmessage);
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
      }
    );
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
      }
    );
  };
  const getAutomatedMessage = (rowData: MessagesObjectProps) => {
    if (
      rowData.message === startConsult ||
      rowData.message === startConsultjr ||
      rowData.message === stopConsult ||
      rowData.message === languageQue
    ) {
      return rowData.automatedText;
    } else {
      srollToBottomAction();
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
      rowData.message !== followupconsult &&
      rowData.message !== patientConsultStarted &&
      rowData.message !== firstMessage &&
      rowData.message !== secondMessage
    ) {
      leftComponent++;
      rightComponent = 0;
      return (
        <div className={classes.doctorChatRow}>
          {rowData.duration === '00 : 00' ? (
            <div className={classes.none}>
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
                    <a href={rowData.url} target="_blank">
                      <img src={rowData.url} alt={rowData.url} />
                    </a>
                  ) : (
                      <span>{getAutomatedMessage(rowData)}</span>
                    )}
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
      rowData.message !== transferconsult &&
      rowData.message !== rescheduleconsult &&
      rowData.message !== followupconsult &&
      rowData.message !== patientConsultStarted &&
      rowData.message !== firstMessage &&
      rowData.message !== secondMessage
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
                    <div className={classes.imageUpload}>
                      <a href={rowData.url} target="_blank">
                        <img src={rowData.url} alt={rowData.url} />
                      </a>
                    </div>
                  ) : (
                      <span>{getAutomatedMessage(rowData)}</span>
                    )}
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

  // const actionBtn = () => {
  //   setShowVideo(true);
  // };

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
      }
    );
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
    sendMsg(text, true);
    const stoptext = {
      id: doctorId,
      message: `${props.startConsult === 'videocall' ? 'Video' : 'Audio'} call ended`,
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
        } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds}`,
      isTyping: true,
    };
    sendMsg(stoptext, true);
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
    sendMsg(text, true);
  };

  const convertCall = () => {
    setConvertVideo(!convertVideo);
    setTimeout(() => {
      const text = {
        isTyping: true,
        message: convertVideo ? covertVideoMsg : covertAudioMsg,
      };
      sendMsg(text, false);
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
              style={{ height: 'calc(100vh - 324px' }}
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
            {!props.disableChat && (
              <Button
                className={classes.chatsendcircle}
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
                          fileExtension.toLowerCase() === 'pdf' ||
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
              disabled={props.disableChat}
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
    </div>
  );
};

// const reader = new FileReader();
// reader.addEventListener(
//   'load',
//   () => {
//     const readerResult = reader.result as string;
//     const base64String = readerResult.replace(
//       /^data:image\/[a-z]+;base64,/,
//       ''
//     );
//     mutationUploadChatDocument({
//       variables: {
//         appointmentId: props.appointmentId,
//         base64FileInput: base64String,
//         fileType: fileExtension,
//       },
//     }).then((response) => {
//       if (
//         response &&
//         response!.data &&
//         response!.data!.uploadChatDocument &&
//         response!.data!.uploadChatDocument!.filePath
//       ) {
//         setFileUploading(false);
//         // continue from here to post this in chat window.....
//         const uploadObject = {
//           id: doctorId,
//           fileType: `image`,
//           message: `^^#DocumentUpload`,
//           url: response!.data!.uploadChatDocument!.filePath,
//           isTyping: true,
//         };
//         sendMsg(uploadObject, true);
//         console.log(uploadObject);
//       } else {
//         setFileUploadErrorMessage('Error occured in uploading file.');
//         setIsDialogOpen(true);
//       }
//     });
//   },
//   false
// );
// if (fileNames[0]) {
//   reader.readAsDataURL(fileNames[0]);
// }
