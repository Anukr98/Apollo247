import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
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

const useStyles = makeStyles((theme: Theme) => {
  return {
    consultRoom: {
      paddingTop: 0,
      paddingBottom: 0,
    },
    chatContainer: {
      paddingRight: 5,
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
    meChat: {
      padding: '5px 0',
      textAlign: 'right',
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
    boldTxt: {
      fontWeight: 700,
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
    audioVideoContainer: {
      paddingBottom: 0,
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
    chatSubmitBtn: {
      position: 'absolute',
      bottom: 14,
      right: 0,
      minWidth: 'auto',
      padding: 0,
    },
    searchInput: {
      '& input': {
        paddingTop: 10,
        paddingRight: 25,
        paddingBottom: 14,
        minHeight: 25,
      },
    },
    customScroll: {
      paddingLeft: 20,
      paddingRight: 17,
    },
    topText: {
      textAlign: 'center',
      color: '#fff',
      fontSize: 14,
      fontWeight: 500,
      paddingTop: 10,
    },
    callActions: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 10,
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
        width: 'auto',
        left: 0,
      },
    },
    durationMsg: {
      fontSize: 10,
      marginTop: 2,
      display: 'block',
    },
    callEnded: {
      display: 'flex',
      '& img': {
        position: 'inherit',
        maxWidth: 20,
      },
    },
    durattiocallMsg: {
      marginLeft: 40,
      marginTop: 7,
    },
    none: {
      display: 'none',
    },
  };
});

interface MessagesObjectProps {
  id: string;
  message: string;
  username: string;
  text: string;
  duration: string;
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
}
let timerIntervalId: any;
let stoppedConsulTimer: number;
export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const classes = useStyles();
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
  const [audio] = useState(new Audio('http://streaming.tdiradio.com:8000/house.mp3'));
  const [playing, setPlaying] = useState(false);
  const toggle = () => setPlaying(!playing);

  // useEffect(() => {
  //   playing ? audio.play() : audio.pause();
  // }, [playing, audio]);

  useEffect(() => {
    if ((!isCalled || showVideo) && playing) {
      setPlaying(!playing);
      audio.pause();
      audio.currentTime = 0;
    }
    if (isCalled && !showVideo && !playing) {
      audio.play();
      setTimeout(() => {
        setPlaying(!playing);
        const sound = document.getElementById('soundButton');
        sound!.click();
      }, 100);
    }
  }, [isCalled, playing, audio, showVideo]);
  const startIntervalTimer = (timer: number) => {
    setstartTimerAppoinmentt(true);
    timerIntervalId = setInterval(() => {
      timer = timer + 1;
      stoppedConsulTimer = timer;
      setStartingTime(timer);
      // if (timer == 900) {
      // setStartingTime(900);
      // clearInterval(timerIntervalId);
      // }
    }, 1000);
  };
  const stopIntervalTimer = () => {
    setStartingTime(0);
    timerIntervalId && clearInterval(timerIntervalId);
  };

  const autoMessageStrings: AutoMessageStrings = {
    videoCallMsg: '^^callme`video^^',
    audioCallMsg: '^^callme`audio^^',
    stopcallMsg: '^^callme`stop^^',
    acceptcallMsg: '^^callme`accept^^',
    startConsult: '^^#startconsult',
    stopConsult: '^^#stopconsult',
  };

  const subscribeKey = 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac';
  const publishKey = 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3';
  const doctorId = props.doctorId;
  const patientId = currentUserId;
  const channel = props.appointmentId;
  const config: Pubnub.PubnubConfig = {
    subscribeKey: subscribeKey,
    publishKey: publishKey,
    ssl: true,
  };

  const mutationResponse = useMutation<UpdateAppointmentSession, UpdateAppointmentSessionVariables>(
    UPDATE_APPOINTMENT_SESSION,
    {
      variables: {
        UpdateAppointmentSessionInput: { appointmentId: channel, requestRole: 'PATIENT' },
      },
    }
  );

  const pubnub = new Pubnub(config);

  let leftComponent = 0;
  let rightComponent = 0;
  let insertText: MessagesObjectProps[] = [];

  useEffect(() => {
    if (isStartConsult) {
      mutationResponse()
        .then((data) => {
          const appointmentToken =
            data && data.data && data.data.updateAppointmentSession
              ? data.data.updateAppointmentSession.appointmentToken
              : '';
          const sessionId =
            data && data.data && data.data.updateAppointmentSession.sessionId
              ? data.data.updateAppointmentSession.sessionId
              : '';
          setsessionId(sessionId);
          settoken(appointmentToken);
        })
        .catch(() => {
          window.alert('An error occurred while loading :(');
        });
    }
  }, [isStartConsult]);
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
          message.message.message !== autoMessageStrings.stopConsult
        ) {
          setIsNewMsg(true);
        }
        if (message.message.message === autoMessageStrings.startConsult) {
          setStartConsult(true);
          props.hasDoctorJoined(true);
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
      presence: (presenceEvent) => {
        // console.log('presenceEvent', presenceEvent);
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
        const lastMessage = newmessage[newmessage.length - 1];
        if (
          lastMessage &&
          (lastMessage.message === autoMessageStrings.videoCallMsg ||
            lastMessage.message === autoMessageStrings.audioCallMsg)
        ) {
          setIsCalled(true);
          setIsVideoCall(lastMessage.message === autoMessageStrings.videoCallMsg ? true : false);
        }
        setTimeout(() => {
          const scrollDiv = document.getElementById('scrollDiv');
          scrollDiv!.scrollIntoView();
        }, 200);
      }
    });
  };

  const send = () => {
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
        resetMessagesAction();
        srollToBottomAction();

        // setMessageText(' ');

        // setTimeout(() => {
        //   setMessageText('');
        //   const scrollDiv = document.getElementById('scrollDiv');
        //   scrollDiv!.scrollIntoView();
        // }, 100);
      }
    );
  };
  const autoSend = () => {
    const text = {
      id: patientId,
      message: autoMessageStrings.stopcallMsg,
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
                  {rowData.message}
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
    if (
      rowData.id === doctorId &&
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
          <div className={rowData.duration ? classes.callMsg : classes.petient}>
            {rightComponent == 1 && !rowData.duration && (
              <span className={classes.boldTxt}>
                 <img src={profileImage !== null ? profileImage : 'https://via.placeholder.com/328x138'}  alt='img'/>
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
              <div>
                <span>{rowData.message}</span>
              </div>
            )}
          </div>
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
    const text = {
      id: patientId,
      message: autoMessageStrings.acceptcallMsg,
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
    setShowVideo(true);
    startIntervalTimer(0);

    setPlaying(!playing);
    audio.pause();
  };
  const stopAudioVideoCall = () => {
    const stoptext = {
      id: patientId,
      message: `${isVideoCall ? 'Video' : 'Audio'} call ended`,
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
    setShowVideo(false);
    autoSend();
    setIsVideoCall(false);
    setIsCalled(false);
  };
  const stopConsultCall = () => {
    autoSend();
    setShowVideo(false);
    setShowVideoChat(false);
    setIsVideoCall(false);
    setIsCalled(false);
  };
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
        {showVideo && sessionId !== '' && token !== '' && (
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
        )}
        <div>
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatContainer}>
              <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 290px' }}>
                <div className={classes.customScroll}>
                  {messagessHtml}
                  <span id="scrollDiv"></span>
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
                        <Button className={classes.callPickIcon} onClick={() => actionBtn()}>
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
