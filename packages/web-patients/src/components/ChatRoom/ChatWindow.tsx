import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
import Pubnub from 'pubnub';
import { ChatVideo } from 'components/ChatRoom/ChatVideo';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';

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
  };
});

interface MessagesObjectProps {
  id: string;
  message: string;
  username: string;
  text: string;
}
interface ChatWindowProps {
  sessionId: string;
  token: string;
  appointmentId: string;
  doctorId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const classes = useStyles();
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const { allCurrentPatients } = useAllCurrentPatients();
  const currentUserId = (allCurrentPatients && allCurrentPatients[0].id) || '';
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const stopcallMsg = '^^callme`stop^^';
  const acceptcallMsg = '^^callme`accept^^';
  // const startConsult = '^^#startconsult';
  // const stopConsult = '^^#stopconsult';
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
  let leftComponent = 0;
  let rightComponent = 0;
  const pubnub = new Pubnub(config);
  let insertText: MessagesObjectProps[] = [];

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
        setMessages(insertText);
        setMessageText('reset');
        setMessageText('');
        setTimeout(() => {
          const scrollDiv = document.getElementById('scrollDiv');
          scrollDiv!.scrollIntoView();
        }, 200);
        if (
          !showVideoChat &&
          message.message.message !== videoCallMsg &&
          message.message.message !== audioCallMsg &&
          message.message.message !== stopcallMsg &&
          message.message.message !== acceptcallMsg
        ) {
          setIsNewMsg(true);
        }
        if (
          message.message &&
          (message.message.message === videoCallMsg || message.message.message === audioCallMsg)
        ) {
          //getHistory();
          setIsCalled(true);
          setShowVideo(false);
          setIsVideoCall(message.message.message === videoCallMsg ? true : false);
        }
        if (message.message && message.message.message === stopcallMsg) {
          setIsCalled(false);
          setShowVideo(false);
        }
      },
      presence: (presenceEvent) => {
        console.log('presenceEvent', presenceEvent);
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
          (lastMessage.message === videoCallMsg || lastMessage.message === audioCallMsg)
        ) {
          setIsCalled(true);
          setIsVideoCall(lastMessage.message === videoCallMsg ? true : false);
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
        setMessageText(' ');

        setTimeout(() => {
          setMessageText('');
          const scrollDiv = document.getElementById('scrollDiv');
          scrollDiv!.scrollIntoView();
        }, 100);
      }
    );
  };
  const autoSend = () => {
    const text = {
      id: patientId,
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
    //setIsCalled(false);
    //setIsVideoCall(true);
    //setIsCalled(true);
    //actionBtn();
  };
  const renderChatRow = (rowData: MessagesObjectProps, index: number) => {
    if (
      rowData.id === patientId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg
    ) {
      leftComponent++;
      rightComponent = 0;
      return (
        <div className={classes.meChat}>
          <div className={classes.chatBubble}>
            {leftComponent == 1 && <span className={classes.boldTxt}></span>}
            <span>{rowData.message}</span>
          </div>
        </div>
      );
    }
    if (
      rowData.id === doctorId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg &&
      rowData.message !== acceptcallMsg
    ) {
      leftComponent = 0;
      rightComponent++;
      return (
        <div className={classes.patientChat}>
          <div className={classes.petient}>
            {rightComponent == 1 && (
              <span className={classes.boldTxt}>
                <img src={require('images/ic_patientchat.png')} />
              </span>
            )}
            <span>{rowData.message}</span>
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
  };
  const actionBtn = () => {
    const text = {
      id: patientId,
      message: acceptcallMsg,
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
  };
  const stopAudioVideoCall = () => {
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
      <div
        className={`${classes.chatSection} ${
          !showVideo ? classes.chatWindowContainer : classes.audioVideoContainer
        }`}
      >
        {showVideo && props.sessionId !== '' && props.token !== '' && (
          <ChatVideo
            stopAudioVideoCall={() => stopAudioVideoCall()}
            toggelChatVideo={() => toggelChatVideo()}
            stopConsultCall={() => stopConsultCall()}
            sessionId={props.sessionId}
            token={props.token}
            showVideoChat={showVideoChat}
            isVideoCall={isVideoCall}
            isNewMsg={isNewMsg}
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
                placeholder="Search doctors or specialities"
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
