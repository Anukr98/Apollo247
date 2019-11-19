import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Theme, Button, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput, AphButton } from '@aph/web-ui-components';
import Pubnub from 'pubnub';
import { ChatVideo } from 'components/ChatRoom/ChatVideo';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { UPDATE_APPOINTMENT_SESSION } from 'graphql/consult';
import {
  UpdateAppointmentSession,
  UpdateAppointmentSessionVariables,
} from 'graphql/types/UpdateAppointmentSession';
import { useMutation } from 'react-apollo-hooks';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import { DoctorChatCard } from 'components/ChatRoom/DoctorChatCard';
import { NamedTypeNode } from 'graphql';
//import { string } from 'prop-types';

const useStyles = makeStyles((theme: Theme) => {
  return {
    acceptBtn: {
      width: 'calc(35% - 5px) !important',
    },
    audioVideoContainer: {
      paddingBottom: 0,
    },
    avatar: {
      width: 32,
      height: 32,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    blueBubble: {
      backgroundColor: '#0087ba',
      color: theme.palette.common.white,
      marginBottom: 5,
    },
    borderSection: {
      fontSize: 15,
      fontWeight: 600,
      paddingTop: 9,
      paddingBottom: 9,
      borderTop: '1px dashed rgba(255,255,255,0.5)',
      borderBottom: '1px dashed rgba(255,255,255,0.5)',
      marginTop: 10,
    },
    boldTxt: {
      fontWeight: 700,
    },
    bubbleActions: {
      display: 'flex',
      paddingTop: 20,
      '& button': {
        width: 'calc(50% - 5px)',
        marginRight: 5,
        boxShadow: 'none',
        border: '2px solid #fcb715',
        borderRadius: 10,
        fontSize: 13,
        padding: 7,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
      '& a': {
        textTransform: 'uppercase',
        width: 'calc(50% - 5px)',
        marginLeft: 5,
        display: 'block',
        fontSize: 13,
        backgroundColor: '#fcb716',
        padding: 10,
        height: 40,
        borderRadius: 10,
        textAlign: 'center',
      },
    },
    callActions: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 10,
    },
    callEnded: {
      display: 'flex',
      '& img': {
        position: 'inherit',
        maxWidth: 20,
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
        width: 'auto',
        left: 0,
      },
    },
    callPickIcon: {
      padding: 0,
      boxShadow: 'none',
      minWidth: 'auto',
      backgroundColor: 'transparent',
      '&:hover': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
      '&:focus': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
    },
    changeSlotBtn: {
      width: 'calc(65% - 5px) !important',
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
    chatContainer: {
      paddingRight: 5,
    },
    callOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.2)',
      top: 0,
      left: 0,
    },
    chatSection: {
      position: 'relative',
      paddingBottom: 10,
    },
    chatSubmitBtn: {
      position: 'absolute',
      bottom: 14,
      right: 0,
      minWidth: 'auto',
      padding: 0,
    },
    chatWindowContainer: {
      position: 'relative',
    },
    chatWindowFooter: {
      borderTop: 'solid 0.5px rgba(2,71,91,0.5)',
      paddingTop: 12,
      marginTop: 15,
      position: 'relative',
      marginLeft: 20,
      marginRight: 20,
    },
    consultRoom: {
      paddingTop: 0,
      paddingBottom: 0,
    },
    customScroll: {
      paddingLeft: 20,
      paddingRight: 17,
    },
    doctorChatBubble: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      backgroundColor: theme.palette.common.white,
      fontSize: 15,
      fontWeight: 500,
      color: '#0087ba',
      padding: '12px 16px',
      width: 245,
    },
    doctorImg: {
      position: 'absolute',
      left: 0,
      bottom: 0,
    },
    doctorChatWindow: {
      position: 'relative',
      paddingLeft: 38,
      marginBottom: 10,
    },
    durattiocallMsg: {
      marginLeft: 40,
      marginTop: 7,
    },
    durationMsg: {
      fontSize: 10,
      marginTop: 2,
      display: 'block',
    },
    incomingCallContainer: {
      position: 'absolute',
      right: 17,
      top: 0,
    },
    incomingCallWindow: {
      position: 'relative',
      width: 154,
      height: 204,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
      overflow: 'hidden',
      '& img': {
        maxHeight: 204,
        verticalAlign: 'middle',
      },
    },
    meChat: {
      padding: '5px 0',
      textAlign: 'right',
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
    none: {
      display: 'none',
    },
    petient: {
      color: '#0087ba',
      textAlign: 'left',
      backgroundColor: '#fff',
      padding: 12,
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 #00000026',
      minWidth: 120,
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
    searchInput: {
      '& input': {
        paddingTop: 10,
        paddingRight: 25,
        paddingBottom: 14,
        minHeight: 25,
      },
    },
    topText: {
      textAlign: 'center',
      color: '#fff',
      fontSize: 14,
      fontWeight: 500,
      paddingTop: 10,
    },
    viewButton: {
      width: 'calc(50% - 5px)',
      marginLeft: 5,
      display: 'block',
      fontSize: 13,
      backgroundColor: '#fcb716',
      padding: 10,
      height: 40,
      borderRadius: 10,
      marginRight: 0,
      '&:hover': {
        backgroundColor: '#fcb716 !important',
      },
    },
  };
});

interface MessagesObjectProps {
  id: string;
  message: string;
  automatedText: string;
  username: string;
  text: string;
  duration: string;
  transferInfo: any;
}

interface ChatWindowProps {
  appointmentId: string;
  doctorId: string;
  hasDoctorJoined: (hasDoctorJoined: boolean) => void;
  doctorDetails: DoctorDetails;
}

interface AutoMessageStrings {
  videoCallMsg: string;
  audioCallMsg: string;
  stopcallMsg: string;
  acceptcallMsg: string;
  startConsult: string;
  stopConsult: string;
  transferConsult: string;
  rescheduleconsult: string;
  consultPatientStartedMsg: string;
  firstMessage: string;
  secondMessage: string;
  typingMsg: string;
  covertVideoMsg: string;
  covertAudioMsg: string;
  transferConsultMsg: string;
  rescheduleConsultMsg: string;
  followupconsult: string;
  imageconsult: string;
  startConsultjr: string;
  languageQue: string;
  jdThankyou: string;
}
let timerIntervalId: any;
let stoppedConsulTimer: number;
export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const classes = useStyles({});
  const { doctorDetails } = props;
  const profileImage =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.photoUrl
      : '';
  const { allCurrentPatients } = useAllCurrentPatients();
  const currentUserId = (allCurrentPatients && allCurrentPatients[0].id) || '';

  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const [isStartConsult, setStartConsult] = useState<boolean>(false);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');

  const [startTimerAppoinmentt, setstartTimerAppoinmentt] = React.useState<boolean>(false);
  const [startingTime, setStartingTime] = useState<number>(0);

  const timerMinuts = Math.floor(startingTime / 60);
  const timerSeconds = startingTime - timerMinuts * 60;
  const timerLastMinuts = Math.floor(startingTime / 60);
  const timerLastSeconds = startingTime - timerMinuts * 60;
  const [audio] = useState(
    new Audio('https://mrrhealthcheck-stage.azurewebsites.net/Images/Passes/NotifySound.mp3')
  );
  const [playing, setPlaying] = useState(false);
  const toggle = () => setPlaying(!playing);
  const [jrDoctorJoined, setJrDoctorJoined] = React.useState<boolean>(false);
  const [doctorJoined, setDoctorJoined] = React.useState<boolean>(false);

  const autoMessageStrings: AutoMessageStrings = {
    videoCallMsg: '^^callme`video^^',
    audioCallMsg: '^^callme`audio^^',
    stopcallMsg: '^^callme`stop^^',
    acceptcallMsg: '^^callme`accept^^',
    startConsult: '^^#startconsult',
    stopConsult: '^^#stopconsult',
    transferConsult: '^^#transferconsult',
    rescheduleconsult: '^^#rescheduleconsult',
    consultPatientStartedMsg: '^^#PatientConsultStarted',
    firstMessage: '^^#firstMessage',
    secondMessage: '^^#secondMessage',
    typingMsg: '^^#typing',
    covertVideoMsg: '^^convert`video^^',
    covertAudioMsg: '^^convert`audio^^',
    transferConsultMsg: '^^#transferconsult',
    rescheduleConsultMsg: '^^#rescheduleconsult',
    followupconsult: '^^#followupconsult',
    imageconsult: '^^#DocumentUpload',
    startConsultjr: '^^#startconsultJr',
    languageQue: '^^#languageQue',
    jdThankyou: '^^#jdThankyou',
  };

  const subscribeKey = 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b';
  const publishKey = 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e';
  const doctorId = props.doctorId;
  const patientId = currentUserId;
  const channel = props.appointmentId;
  const config: Pubnub.PubnubConfig = {
    subscribeKey: subscribeKey,
    publishKey: publishKey,
    ssl: true,
  };

  // const mutationResponse = useMutation<
  //   UpdateAppointmentSession,
  //   UpdateAppointmentSessionVariables
  // >(UPDATE_APPOINTMENT_SESSION, {
  //   variables: {
  //     UpdateAppointmentSessionInput: {
  //       appointmentId: channel,
  //       requestRole: "PATIENT"
  //     }
  //   }
  // });

  const pubnub = new Pubnub(config);

  let leftComponent = 0;
  let rightComponent = 0;
  let insertText: MessagesObjectProps[] = [];

  // useEffect(() => {
  //   if (isStartConsult) {
  //     mutationResponse()
  //       .then(data => {
  //         const appointmentToken =
  //           data && data.data && data.data.updateAppointmentSession
  //             ? data.data.updateAppointmentSession.appointmentToken
  //             : "";
  //         const sessionId =
  //           data && data.data && data.data.updateAppointmentSession.sessionId
  //             ? data.data.updateAppointmentSession.sessionId
  //             : "";
  //         setsessionId(sessionId);
  //         settoken(appointmentToken);
  //       })
  //       .catch(() => {
  //         window.alert("An error occurred while loading :(");
  //       });
  //   }
  // }, [isStartConsult]);

  // Start of Explaining the steps to patient with message.

  const successSteps = [
    'Let’s get you feeling better in 5 simple steps :)\n',
    '1. Answer some quick questions\n',
    '2. Connect with your doctor\n',
    '3. Get a prescription and meds, if necessary\n',
    '4. Avail 1 free follow-up*\n',
    '5. Chat with your doctor**\n',
    '* 7 days after your first consultation.\n\n',
    `A doctor from ’s team will join you shortly to collect your medical details. These details are essential for to help you and will take around 3-5 minutes.`,
  ];

  const automatedTextFromPatient = () => {
    const text = {
      channel: channel,
      message: autoMessageStrings.consultPatientStartedMsg,
      automatedText: successSteps,
      id: doctorId,
      isTyping: true,
      storeInHistory: true,
      sendByPost: true,
    };
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
  };

  const checkAutomatedPatientText = () => {
    const result = insertText.filter((obj: any) => {
      // console.log('resultinsertText', obj.message);
      return obj.message === autoMessageStrings.consultPatientStartedMsg;
    });
    if (result.length === 0) {
      console.log('result.length ', result);
      automatedTextFromPatient();
    }
  };

  const getHistory = (timetoken: number) => {
    pubnub.history({ channel: channel, reverse: true, count: 1000 }, (status, res) => {
      const newmessage: MessagesObjectProps[] = [];
      const end: number = res.endTimeToken ? res.endTimeToken : 1;
      res.messages.forEach((element, index) => {
        newmessage[index] = element.entry;
      });

      console.log(newmessage);
      if (messages.length !== newmessage.length) {
        if (newmessage[newmessage.length - 1].message === autoMessageStrings.startConsult) {
          setJrDoctorJoined(false);
          // updateSessionAPI();
          // checkingAppointmentDates();
        }

        if (newmessage[newmessage.length - 1].message === autoMessageStrings.startConsultjr) {
          setJrDoctorJoined(true);
          // updateSessionAPI();
          // checkingAppointmentDates();
        }

        insertText = newmessage;
        setMessages(newmessage as []);
        if (res.messages.length == 100) {
          getHistory(end);
        }

        checkAutomatedPatientText();
      } else {
        checkAutomatedPatientText();
      }
    });
  };

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
        setMessages(() => [...insertText]);
        resetMessagesAction();
        srollToBottomAction();
        if (
          !showVideoChat &&
          message.message.message !== autoMessageStrings.videoCallMsg &&
          message.message.message !== autoMessageStrings.audioCallMsg &&
          message.message.message !== autoMessageStrings.stopcallMsg &&
          message.message.message !== autoMessageStrings.acceptcallMsg &&
          message.message.message !== autoMessageStrings.startConsult &&
          message.message.message !== autoMessageStrings.stopConsult &&
          message.message.message !== autoMessageStrings.transferConsult &&
          message.message.message !== autoMessageStrings.rescheduleconsult
        ) {
          setIsNewMsg(true);
        }
        if (message.message.message === autoMessageStrings.startConsult) {
          setStartConsult(true);
          props.hasDoctorJoined(true);
        }

        if (message.message.message === autoMessageStrings.startConsultjr) {
          setJrDoctorJoined(true);
        }

        if (
          message.message &&
          (message.message.message === autoMessageStrings.videoCallMsg ||
            message.message.message === autoMessageStrings.audioCallMsg)
        ) {
          setIsCalled(true);
          setShowVideo(false);
          setIsVideoCall(
            message.message.message === autoMessageStrings.videoCallMsg ? true : false
          );
        }
        if (message.message && message.message.message === autoMessageStrings.stopcallMsg) {
          setIsCalled(false);
          setShowVideo(false);
        }
      },
      presence: (presenceEvent) => {},
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  }, []);

  // End of Explaining the steps to patient with message.

  // Start of first Text to patient if junior doctor doesn't attent the consult

  let thirtySecondTimer: any = null;

  const stopTimerForFirstTextMessageToPatient = () => {
    thirtySecondTimer && clearTimeout(thirtySecondTimer);
  };

  const startTimerForFirstTextMessageToPatient = () => {
    thirtySecondTimer = setTimeout(function() {
      if (jrDoctorJoined == false) {
        const result = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.firstMessage;
        });
        const startConsultResult = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.startConsult;
        });
        const startConsultjrResult = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.startConsultjr;
        });

        if (
          result.length === 0 &&
          startConsultResult.length === 0 &&
          startConsultjrResult.length === 0
        ) {
          pubnub.publish(
            {
              channel: channel,
              message: {
                message: autoMessageStrings.firstMessage,
                automatedText: `Hi currentPatient &&
                  currentPatient.firstName, sorry to keep you waiting. 
                  appointmentData.doctorInfo.displayName
                ’s team is with another patient right now. Your consultation prep will start soon.`,
                id: doctorId,
                isTyping: true,
              },
              storeInHistory: true,
              sendByPost: true,
            },
            (status, response) => {}
          );
        } else {
          thirtySecondTimer && clearTimeout(thirtySecondTimer);
        }
      } else {
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
      }
    }, 30000);
  };

  useEffect(() => {
    startTimerForFirstTextMessageToPatient();
    return () => {
      stopTimerForFirstTextMessageToPatient();
    };
  }, []);

  // End of first Text to patient if junior doctor doesn't attent the consult

  // Start of Second Text to patient if junior doctor doesn't attent the consult
  let minuteTimer: any = null;

  const stopTimerForSecondTextMessageToPatent = () => {
    minuteTimer && clearTimeout(minuteTimer);
  };

  const startTimerForSecondTextMessageToPatient = () => {
    minuteTimer = setTimeout(function() {
      if (jrDoctorJoined == false) {
        const result = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.secondMessage;
        });

        const startConsultResult = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.startConsult;
        });

        const startConsultjrResult = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.startConsultjr;
        });

        if (
          result.length === 0 &&
          startConsultResult.length === 0 &&
          startConsultjrResult.length === 0
        ) {
          pubnub.publish(
            {
              channel: channel,
              message: {
                message: autoMessageStrings.secondMessage,
                automatedText: `Sorry, but all the members in ’s team are busy right now. We will send you a notification as soon as they are available for collecting your details`,
                id: doctorId,
                isTyping: true,
              },
              storeInHistory: true,
              sendByPost: true,
            },
            (status, response) => {
              console.log(response);
            }
          );
        } else {
          minuteTimer && clearTimeout(minuteTimer);
        }
      } else {
        minuteTimer && clearTimeout(minuteTimer);
      }
    }, 90000);
  };

  useEffect(() => {
    startTimerForSecondTextMessageToPatient();
    return () => {
      stopTimerForSecondTextMessageToPatent();
    };
  }, []);

  //  End of Second Text to patient if junior doctor doesn't attent the consult

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
    if (messageText === '' || messageText === ' ') {
      setMsg('reset');
      setMsg('');
    }
  };

  const send = () => {
    try {
      const text = {
        id: patientId,
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
          console.log(status);
          // resetMessagesAction();
          // srollToBottomAction();
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  // const autoSend = () => {
  //   const text = {
  //     id: patientId,
  //     message: autoMessageStrings.stopcallMsg,
  //     isTyping: true
  //   };
  //   pubnub.publish(
  //     {
  //       channel: channel,
  //       message: text,
  //       storeInHistory: true,
  //       sendByPost: true
  //     },
  //     (status, response) => {
  //       setMessageText("");
  //     }
  //   );
  // };

  const renderChatRow = (rowData: MessagesObjectProps, index: number) => {
    if (
      rowData.id === patientId &&
      rowData.message !== autoMessageStrings.videoCallMsg &&
      rowData.message !== autoMessageStrings.audioCallMsg &&
      rowData.message !== autoMessageStrings.stopcallMsg &&
      rowData.message !== autoMessageStrings.acceptcallMsg &&
      rowData.message !== autoMessageStrings.startConsult &&
      rowData.message !== autoMessageStrings.stopConsult
    ) {
      leftComponent++;
      rightComponent = 0;
      return (
        <div className={classes.meChat}>
          <div className={rowData.duration ? classes.callMsg : classes.chatBubble}>
            {leftComponent == 1 && <span className={classes.boldTxt}></span>}
            {rowData.duration === '00 : 00' ? (
              <span className={classes.none}>
                <img src={require('images/ic_missedcall.svg')} />
                {rowData.message.toLocaleLowerCase() === 'video call ended'
                  ? 'You missed a video call'
                  : 'You missed a voice call'}
              </span>
            ) : rowData.duration ? (
              <div className={classes.callEnded}>
                <span>
                  <img src={require('images/ic_round_call.svg')} />
                </span>
                <div>
                  {rowData.automatedText}
                  <span className={classes.durationMsg}>Duration- {rowData.duration}</span>
                </div>
              </div>
            ) : (
              <div>
                <span>{rowData.message}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    console.log(rowData);
    if (
      rowData.message !== autoMessageStrings.videoCallMsg &&
      rowData.message !== autoMessageStrings.audioCallMsg &&
      rowData.message !== autoMessageStrings.stopcallMsg &&
      rowData.message !== autoMessageStrings.acceptcallMsg &&
      rowData.message !== autoMessageStrings.startConsult &&
      rowData.message !== autoMessageStrings.stopConsult
    ) {
      leftComponent = 0;
      rightComponent++;
      return (
        <div className={rowData.duration ? classes.durattiocallMsg : classes.patientChat}>
          <div
            className={
              rowData.duration
                ? classes.callMsg
                : rowData.automatedText
                ? classes.petient
                : classes.chatBubble
            }
          >
            {rightComponent == 1 && !rowData.duration && (
              <span className={classes.boldTxt}>
                <img
                  src={profileImage !== null ? profileImage : 'https://via.placeholder.com/328x138'}
                  alt="img"
                />
              </span>
            )}
            {rowData.message === autoMessageStrings.transferConsult && (
              <div className={classes.doctorChatWindow}>
                <div className={`${classes.doctorChatBubble} ${classes.blueBubble}`}>
                  Your appointment has been transferred to —
                  <DoctorChatCard transferData={rowData.transferInfo} />
                  <div className={classes.bubbleActions}>
                    <AphButton>Reschedule</AphButton>
                    <AphButton className={classes.viewButton}>Accept</AphButton>
                  </div>
                </div>
                <div className={classes.doctorImg}>
                  <Avatar
                    alt=""
                    src={require('images/ic_chat_bot.svg')}
                    className={classes.avatar}
                  />
                </div>
              </div>
            )}
            {rowData.duration === '00 : 00' ? (
              <span className={classes.missCall}>
                <img src={require('images/ic_missedcall.svg')} />
                {rowData.message.toLocaleLowerCase() === 'video call ended'
                  ? 'You missed a video call'
                  : 'You missed a voice call'}
              </span>
            ) : rowData.duration ? (
              <div className={classes.callEnded}>
                <span>
                  <img src={require('images/ic_round_call.svg')} />
                </span>
                <div>
                  {rowData.message}
                  <span className={classes.durationMsg}>Duration- {rowData.duration}</span>
                </div>
              </div>
            ) : (
              rowData.message !== autoMessageStrings.transferConsult &&
              rowData.message !== autoMessageStrings.rescheduleconsult && (
                <div>
                  <span>{rowData.automatedText || rowData.message}</span>
                </div>
              )
            )}
          </div>
        </div>
      );
    }

    // if (rowData.id !== patientId && rowData.id !== doctorId) {
    //   return "";
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
  //   const text = {
  //     id: patientId,
  //     message: autoMessageStrings.acceptcallMsg,
  //     isTyping: true
  //   };
  //   pubnub.publish(
  //     {
  //       channel: channel,
  //       message: text,
  //       storeInHistory: true,
  //       sendByPost: true
  //     },
  //     (status, response) => {
  //       setMessageText("");
  //     }
  //   );
  //   setShowVideo(true);
  //   startIntervalTimer(0);

  //   setPlaying(!playing);
  //   audio.pause();
  // };
  // const stopAudioVideoCall = () => {
  //   const stoptext = {
  //     id: patientId,
  //     message: `${isVideoCall ? "Video" : "Audio"} call ended`,
  //     duration: `${
  //       timerLastMinuts.toString().length < 2
  //         ? "0" + timerLastMinuts
  //         : timerLastMinuts
  //     } : ${
  //       timerLastSeconds.toString().length < 2
  //         ? "0" + timerLastSeconds
  //         : timerLastSeconds
  //     }`,
  //     isTyping: true
  //   };
  //   pubnub.publish(
  //     {
  //       channel: channel,
  //       message: stoptext,
  //       storeInHistory: true,
  //       sendByPost: true
  //     },
  //     (status, response) => {
  //       setMessageText("");
  //     }
  //   );
  //   stopIntervalTimer();
  //   setShowVideo(false);
  //   autoSend();
  //   setIsVideoCall(false);
  //   setIsCalled(false);
  // };
  // const stopConsultCall = () => {
  //   autoSend();
  //   setShowVideo(false);
  //   setShowVideoChat(false);
  //   setIsVideoCall(false);
  //   setIsCalled(false);
  // };
  return (
    <div className={classes.consultRoom}>
      <button onClick={toggle} id="soundButton" style={{ display: 'none' }}>
        {playing ? 'Pause' : 'Play'}
      </button>
      <div
        className={`${classes.chatSection} ${
          !showVideo ? classes.chatWindowContainer : classes.audioVideoContainer
        }`}
      >
        {/* {showVideo && sessionId !== "" && token !== "" && (
          <ChatVideo
            stopAudioVideoCall={() => stopAudioVideoCall()}
            toggelChatVideo={() => toggelChatVideo()}
            stopConsultCall={() => stopConsultCall()}
            sessionId={sessionId}
            token={token}
            showVideoChat={showVideoChat}
            isVideoCall={isVideoCall}
            isNewMsg={isNewMsg}
            timerMinuts={timerMinuts}
            timerSeconds={timerSeconds}
          />
        )} */}
        <div>
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatContainer}>
              <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 346px' }}>
                <div className={classes.customScroll}>
                  {messagessHtml}
                  <span id="scrollDiv"></span>
                  {/* <div className={classes.doctorChatWindow}>
                    <div className={classes.doctorChatBubble}>You will be better soon, Surj.</div>
                    <div className={classes.doctorImg}>
                      <Avatar
                        alt=""
                        src={require('images/doctordp_01.png')}
                        className={classes.avatar}
                      />
                    </div>
                  </div> */}
                  {/* <div className={classes.doctorChatWindow}>
                    <div className={`${classes.doctorChatBubble} ${classes.blueBubble}`}>
                      Hello Surj, Hope your consultation went well… Here is your prescription.
                      <div className={classes.bubbleActions}>
                        <AphButton>Download</AphButton>
                        <Link to="#">View</Link>
                      </div>
                    </div>
                    <div className={`${classes.doctorChatBubble} ${classes.blueBubble}`}>
                      I’ve also scheduled a <b>free follow-up</b> for you —
                      <div className={classes.borderSection}>
                        <div>18th May, Monday</div>
                        <div>12:00 pm</div>
                      </div>
                      <div className={classes.bubbleActions}>
                        <AphButton>Reschedule</AphButton>
                      </div>
                    </div>
                    <div className={`${classes.doctorChatBubble} ${classes.blueBubble}`}>
                      Since you hace already rescheduled 3 times with Dr. Simran, we will consider
                      this a new paid appointment.
                    </div>
                    <div className={`${classes.doctorChatBubble} ${classes.blueBubble}`}>
                      Next slot for Dr. Simran is available on —
                      <div className={classes.borderSection}>
                        <div>19th May, Tuesday</div>
                        <div>12:00 pm</div>
                      </div>
                      <div className={classes.bubbleActions}>
                        <AphButton className={classes.changeSlotBtn}>Change Slot</AphButton>
                        <Link className={classes.acceptBtn} to="#">
                          Accept
                        </Link>
                      </div>
                    </div>
                    <div className={classes.doctorImg}>
                      <Avatar
                        alt=""
                        src={require('images/ic_chat_bot.svg')}
                        className={classes.avatar}
                      />
                    </div>
                  </div> */}
                  {/* <div className={classes.doctorChatWindow}>
                    <div className={`${classes.doctorChatBubble} ${classes.blueBubble}`}>
                      Your appointment has been transferred to —
                      <DoctorChatCard />
                      <div className={classes.bubbleActions}>
                        <AphButton>Reschedule</AphButton>
                        <AphButton className={classes.viewButton}>Accept</AphButton>
                      </div>
                    </div>
                    <div className={classes.doctorImg}>
                      <Avatar
                        alt=""
                        src={require('images/ic_chat_bot.svg')}
                        className={classes.avatar}
                      />
                    </div>
                  </div> */}
                </div>
              </Scrollbars>
            </div>
          )}
          {!showVideo && (
            <div>
              {isCalled && (
                <div className={classes.incomingCallContainer}>
                  <div className={classes.incomingCallWindow}>
                    <img src={require('images/doctor_profile_image.png')} />
                    <div className={classes.callOverlay}>
                      <div className={classes.topText}>Ringing</div>
                      <div className={classes.callActions}>
                        <Button
                          className={classes.callPickIcon}
                          // onClick={() => actionBtn()}
                        >
                          <img src={require('images/ic_callpick.svg')} alt="" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatWindowFooter}>
              <AphInput
                className={classes.searchInput}
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
              <Button className={classes.chatSubmitBtn}>
                <img src={require('images/ic_add_circle.svg')} alt="" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
