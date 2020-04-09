import React, { useEffect, useState, useContext } from 'react';
import { Theme, Button, Avatar, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Pubnub from 'pubnub';
import Scrollbars from 'react-custom-scrollbars';
import { JDConsult } from 'components/JuniorDoctors/JDConsult';
import { ApolloError } from 'apollo-client';
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { AddChatDocument, AddChatDocumentVariables } from 'graphql/types/AddChatDocument';
import ApolloClient from 'apollo-client';
import { ADD_CHAT_DOCUMENT } from 'graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { REQUEST_ROLES } from 'graphql/types/globalTypes';
import { useAuth } from 'hooks/authHooks';
import { DOWNLOAD_DOCUMENTS } from 'graphql/profiles';
import { downloadDocuments } from 'graphql/types/downloadDocuments';
import ReactPanZoom from 'react-image-pan-zoom-rotate';

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);
import { GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment_appointmentDocuments as appointmentDocument } from 'graphql/types/GetJuniorDoctorCaseSheet';
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
      maxWidth: '100%',
      '& pre': {
        whiteSpace: 'pre-wrap',
      },
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
      maxWidth: 900,
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
      position: 'relative',
      '& img': {
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 212px)',
      },
    },
    panZoom: {
      right: -30,
    },
    timeStamp: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      marginRight: -7,
      marginBottom: -5,
      paddingTop: 5,
      color: '#02475b',
    },
    phrMsg: {
      fontFamily: 'IBM Plex Sans,sans-serif',
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
  messageDate: string;
  sentBy: string;
  type: string;
  fileType: string;
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

export const ChatWindow: React.FC<ConsultRoomProps> = (props) => {
  const classes = useStyles();
  const isVideoCall = false;

  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  const [isCallAccepted, setIsCallAccepted] = useState<boolean>(false);
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const [convertVideo, setConvertVideo] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [fileUploadErrorMessage, setFileUploadErrorMessage] = React.useState<string>('');
  const [fileUploading, setFileUploading] = React.useState<boolean>(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [imgPrevUrl, setImgPrevUrl] = React.useState();
  const apolloClient = useApolloClient();
  const { currentPatient: currentDoctor, sessionClient } = useAuth();

  // this hook is used to send auto chat message when the consult is closed by system
  const covertVideoMsg = '^^convert`video^^';
  const covertAudioMsg = '^^convert`audio^^';
  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const stopcallMsg = '^^callme`stop^^';
  const acceptcallMsg = '^^callme`accept^^';
  const startConsult = '^^#startconsult';
  const startConsultjr = '^^#startconsultJr';
  const stopConsult = '^^#stopconsult';
  const stopConsultJr = '^^#stopconsultJr';
  const documentUpload = '^^#DocumentUpload';
  const transferconsult = '^^#transferconsult';
  const rescheduleconsult = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';
  const patientConsultStarted = '^^#PatientConsultStarted';
  const firstMessage = '^^#firstMessage';
  const secondMessage = '^^#secondMessage';
  const languageQue = '^^#languageQue';
  const jdThankyou = '^^#jdThankyou';
  const cancelConsultInitiated = '^^#cancelConsultInitiated';
  const callAbandonment = '^^#callAbandonment';
  const appointmentComplete = '^^#appointmentComplete';

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

  const [startingTime, setStartingTime] = useState<number>(0);

  const timerMinuts = Math.floor(startingTime / 60);
  const timerSeconds = startingTime - timerMinuts * 60;
  const timerLastMinuts = Math.floor(startingTime / 60);
  const timerLastSeconds = startingTime - timerMinuts * 60;
  const { setDocumentArray, appointmentInfo, patientDetails } = useContext(CaseSheetContextJrd);
  const startIntervalTimer = (timer: number) => {
    setInterval(() => {
      timer = timer + 1;
      setStartingTime(timer);
    }, 1000);
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

  useEffect(() => {
    if (isCallAccepted) {
      startIntervalTimer(0);
    }
  }, [isCallAccepted]);
  useEffect(() => {
    pubnub.subscribe({
      channels: [channel],
      //withPresence: true,
    });

    getHistory(0);

    pubnub.addListener({
      status: (statusEvent) => {},
      message: (message) => {
        insertText[insertText.length] = message.message;
        setMessages(() => [...insertText]);
        resetMessagesAction();
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
          message.message.message !== stopConsult &&
          message.message.message !== firstMessage &&
          message.message.message !== secondMessage &&
          message.message.message !== covertVideoMsg &&
          message.message.message !== covertAudioMsg &&
          message.message.message !== cancelConsultInitiated &&
          message.message.message !== callAbandonment &&
          message.message.message !== appointmentComplete
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
  const getPrismUrls = (client: ApolloClient<object>, patientId: string, fileIds: string[]) => {
    return new Promise((res, rej) => {
      client
        .query<downloadDocuments>({
          query: DOWNLOAD_DOCUMENTS,
          fetchPolicy: 'no-cache',
          variables: {
            downloadDocumentsInput: {
              patientId: patientId,
              fileIds: fileIds,
            },
          },
        })
        .then(({ data }) => {
          res({ urls: data.downloadDocuments.downloadPaths });
        })
        .catch((e: any) => {
          rej({ error: e });
        });
    });
  };
  const getHistory = (timetoken: number | undefined) => {
    pubnub.history(
      {
        channel: channel,
        reverse: true,
        count: 1000,
        stringifiedTimeToken: true,
        start: timetoken,
      },
      (status: any, res: any) => {
        const newmessage: MessagesObjectProps[] = messages;
        res.messages.forEach((element: any, index: any) => {
          let item = element.entry;
          if (item.prismId) {
            getPrismUrls(apolloClient, patientId, item.prismId)
              .then((data: any) => {
                item.url = (data && data.urls[0]) || item.url;
              })
              .catch((e: any) => {});
            newmessage[index] = item;
          } else {
            newmessage.push(element.entry);
          }
        });
        insertText = newmessage;
        setMessages(newmessage);
        const end: number | undefined = res.endTimeToken ? res.endTimeToken : 1;
        if (res.messages.length == 100) {
          getHistory(end);
        }
        resetMessagesAction();
      }
    );
  };
  const convertChatTime = (timeStamp: any) => {
    let utcString;
    if (timeStamp) {
      const dateValidate = moment(moment().format('YYYY-MM-DD')).diff(
        moment(timeStamp).format('YYYY-MM-DD')
      );
      if (dateValidate == 0) {
        utcString = moment
          .utc(timeStamp)
          .local()
          .format('h:mm A');
      } else {
        utcString = moment
          .utc(timeStamp)
          .local()
          .format('DD MMM, YYYY h:mm A');
      }
    }
    return utcString ? utcString : '--';
  };
  const uploadfile = (url: string) => {
    apolloClient
      .mutate<AddChatDocument, AddChatDocumentVariables>({
        mutation: ADD_CHAT_DOCUMENT,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: props.appointmentId, documentPath: url },
      })
      .then((_data) => {
        if (_data && _data.data && _data.data.addChatDocument) {
          setDocumentArray((_data.data.addChatDocument as unknown) as appointmentDocument);
        }
      })
      .catch((error: ApolloError) => {
        const patientName = patientDetails!.firstName + ' ' + patientDetails!.lastName;
        const logObject = {
          api: 'AddChatDocument',
          inputParam: JSON.stringify({ appointmentId: props.appointmentId, documentPath: url }),
          appointmentId: props.appointmentId,
          doctorId: doctorId,
          doctorDisplayName: currentDoctor!.displayName,
          patientId: patientId,
          patientName: patientName,
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: appointmentInfo!.appointmentDateTime
            ? moment(new Date(appointmentInfo!.appointmentDateTime)).format(
                'MMMM DD YYYY h:mm:ss a'
              )
            : '',
          error: JSON.stringify(error),
        };
        sessionClient.notify(JSON.stringify(logObject));
      });
  };

  const send = () => {
    const text = {
      id: doctorId,
      message: messageText,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
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
      rowData.message === stopConsultJr ||
      rowData.message === languageQue ||
      rowData.message === jdThankyou
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
      rowData.message !== secondMessage &&
      rowData.message !== covertVideoMsg &&
      rowData.message !== covertAudioMsg &&
      rowData.message !== cancelConsultInitiated &&
      rowData.message !== callAbandonment &&
      rowData.message !== appointmentComplete
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
                {rowData.messageDate && (
                  <div className={classes.timeStamp}>{convertChatTime(rowData.messageDate)}</div>
                )}
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
                <div
                  className={classes.imageUpload}
                  onClick={() => {
                    if (rowData.url.substr(-4).toLowerCase() !== '.pdf') {
                      setModalOpen(rowData.fileType === 'pdf' ? false : true);
                      setImgPrevUrl(rowData.url);
                    }
                  }}
                >
                  {rowData.url.substr(-4).toLowerCase() !== '.pdf' ? (
                    <>
                      {rowData.fileType === 'pdf' ? (
                        <a href={rowData.url} target="_blank">
                          <img src={require('images/pdf_thumbnail.png')} />
                        </a>
                      ) : (
                        <img src={rowData.url} alt={rowData.url} />
                      )}
                    </>
                  ) : (
                    <a href={rowData.url}>
                      <img src={require('images/pdf_thumbnail.png')} />
                    </a>
                  )}
                  {rowData.messageDate && (
                    <div className={classes.timeStamp}>{convertChatTime(rowData.messageDate)}</div>
                  )}
                </div>
              ) : (
                <>
                  <span>{getAutomatedMessage(rowData)}</span>
                  {rowData.messageDate && (
                    <div className={classes.timeStamp}>{convertChatTime(rowData.messageDate)}</div>
                  )}
                </>
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
      rowData.message !== secondMessage &&
      rowData.message !== covertVideoMsg &&
      rowData.message !== covertAudioMsg &&
      rowData.message !== cancelConsultInitiated &&
      rowData.message !== callAbandonment &&
      rowData.message !== appointmentComplete
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
                {rowData.messageDate && (
                  <div className={classes.timeStamp}>{convertChatTime(rowData.messageDate)}</div>
                )}
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
              {rowData.messageDate && (
                <div className={classes.timeStamp}>{convertChatTime(rowData.messageDate)}</div>
              )}
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
                    if (rowData.url.substr(-4).toLowerCase() !== '.pdf') {
                      setModalOpen(true);
                      setImgPrevUrl(rowData.url);
                    }
                  }}
                  className={classes.imageUpload}
                >
                  {rowData.url.substr(-4).toLowerCase() !== '.pdf' ? (
                    <img src={rowData.url} alt={rowData.url} />
                  ) : (
                    <a href={rowData.url} target="_blank">
                      <img src={require('images/pdf_thumbnail.png')} />
                    </a>
                  )}
                  {rowData.messageDate && (
                    <div className={classes.timeStamp}>{convertChatTime(rowData.messageDate)}</div>
                  )}
                </div>
              ) : (
                <>
                  {rowData.type === 'PHR' ? (
                    <pre className={classes.phrMsg}>{getAutomatedMessage(rowData)}</pre>
                  ) : (
                    <span>{getAutomatedMessage(rowData)}</span>
                  )}
                  {rowData.messageDate && (
                    <div className={classes.timeStamp}>{convertChatTime(rowData.messageDate)}</div>
                  )}
                </>
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
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
    };
    sendMsg(text, true);
    const stoptext = {
      id: doctorId,
      message: `${props.startConsult === 'videocall' ? 'Video' : 'Audio'} call ended`,
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
      } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds}`,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
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
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
    };
    sendMsg(text, true);
  };

  const convertCall = () => {
    setConvertVideo(!convertVideo);
    setTimeout(() => {
      const text = {
        isTyping: true,
        message: convertVideo ? covertVideoMsg : covertAudioMsg,
        messageDate: new Date(),
        sentBy: REQUEST_ROLES.JUNIOR,
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
            JDPhotoUrl={''}
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
                          fileExtension.toLowerCase() === 'jpeg' ||
                          fileExtension.toLowerCase() === 'pdf')
                      ) {
                        if (file) {
                          let aphBlob;
                          aphBlob =
                            fileExtension.toLowerCase() === 'pdf'
                              ? await client.uploadPdfBrowserFile({ file }).catch((error: any) => {
                                  throw error;
                                })
                              : await client.uploadBrowserFile({ file }).catch((error: any) => {
                                  throw error;
                                });
                          const url = client.getBlobUrl(aphBlob && aphBlob.name);
                          const uploadObject = {
                            id: doctorId,
                            fileType: `${fileExtension.toLowerCase() === 'pdf' ? 'pdf' : 'image'}`,
                            message: `^^#DocumentUpload`,
                            url: url,
                            isTyping: true,
                            messageDate: new Date(),
                            sentBy: REQUEST_ROLES.JUNIOR,
                          };
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
                <div className={classes.modalClose} onClick={() => setModalOpen(false)}>
                  <img src={require('images/ic_round_clear.svg')} alt="" />
                </div>
              </div>
              <div className={classes.modalContent}>
                <ReactPanZoom image={imgPrevUrl} alt="" />
              </div>
              <div className={classes.modalFooter}></div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
