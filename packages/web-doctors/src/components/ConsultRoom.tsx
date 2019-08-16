import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
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
      width: '60 %',
      align: 'left',
      paddingRight: 26,
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

      '& img': {
        position: 'absolute',
        left: -50,
        top: 5,
        width: 40,
        borderRadius: '50%',
      },
    },
    chatFooterSection: {
      position: 'absolute',
      padding: '40px 20px 20px 20px',
      clear: 'both',
      backgroundColor: '#fff',
      width: '100%',
      boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
    },
    chatsendcircle: {
      position: 'absolute',
      right: 0,
    },
  };
});
interface MessagesObjectProps {
  id: string;
  message: string;
  username: string;
  text: string;
}
interface ConsultRoomProps {
  startConsult: string;
  sessionId: string;
  token: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const classes = useStyles();
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);

  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const stopcallMsg = '^^callme`stop^^';
  const subscribeKey = 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac';
  const publishKey = 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3';
  const doctorId = props.doctorId;
  const patientId = props.patientId;
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
        setMessageText('reset');
        setMessageText('');
        getHistory();
      },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  }, [messageText]);
  function getCookieValue() {
    const name = 'action=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
  useEffect(() => {
    //if (props.startConsult !== isVideoCall) {
    if (getCookieValue() !== '') {
      setIsVideoCall(props.startConsult === 'videocall' ? true : false);
      setMessageText(videoCallMsg);
      autoSend();
    }
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
      setTimeout(() => {
        const scrollDiv = document.getElementById('scrollDiv');
        scrollDiv!.scrollIntoView();
      }, 200);
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
        setMessageText('reset');
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
    //setIsVideoCall(true);
    //setIsCalled(true);
    actionBtn();
  };

  const renderChatRow = (rowData: MessagesObjectProps, index: number) => {
    if (
      rowData.id === doctorId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg
    ) {
      leftComponent++;
      rightComponent = 0;
      return (
        <div className={classes.docterChat}>
          <div className={classes.doctor}>
            {leftComponent == 1 && <span className={classes.boldTxt}></span>}
            <span>{rowData.message}</span>
          </div>
        </div>
      );
    }
    if (
      rowData.id === patientId &&
      rowData.message !== videoCallMsg &&
      rowData.message !== audioCallMsg &&
      rowData.message !== stopcallMsg
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
    setShowVideoChat(!showVideoChat);
  };
  const actionBtn = () => {
    setShowVideo(true);
  };
  const stopAudioVideoCall = () => {
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
    //setIsVideoCall(false);
  };
  return (
    <div className={classes.consultRoom}>
      <div className={!showVideo ? classes.container : classes.audioVideoContainer}>
        {showVideo && (
          <Consult
            toggelChatVideo={() => toggelChatVideo()}
            stopAudioVideoCall={() => stopAudioVideoCall()}
            showVideoChat={showVideoChat}
            isVideoCall={isVideoCall}
            sessionId={props.sessionId}
            token={props.token}
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
    </div>
  );
};
