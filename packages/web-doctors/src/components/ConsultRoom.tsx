import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
import { Consult } from 'components/Consult';
import Pubnub from 'pubnub';

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
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    chatContainer: {
      paddingTop: 40,
      maxHeight: 'calc(100vh - 330px)',
      overflowY: 'auto',
      overflowX: 'hidden',
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
    doctor: {
      backgroundColor: '#f0f4f5',
      padding: 12,
      color: '#02475b',
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 #00000026',
      minWidth: 120,
      marginRight: 30,
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
      margin: '5px 5px 10px 5px',
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
    incomingContainer: {
      textAlign: 'right',
      paddingRight: 20,
      position: 'absolute',
      right: 0,
      top: 10,
    },
    incomingBtn: {
      position: 'relative',
      width: 170,
      height: 168,
      display: 'inline-block',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0,0,0,0.6)',
      overflow: 'hidden',
      '& img': {
        maxWidth: '100%',
      },
      '& div': {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        top: 0,
        textAlign: 'center',
        paddingTop: 10,
        color: '#fff',
        fontSize: 14,
        fontWeight: 500,
      },
    },
    endcall: {
      position: 'absolute',
      width: 40,
      bottom: 20,
    },
    chatFooterSection: {
      position: 'absolute',
      padding: '40px 20px 20px 20px',
      clear: 'both',
      // bottom: 0,
      backgroundColor: '#fff',
      width: '100%',
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
  toggleTabs: () => void;
  startConsult: boolean;
}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const classes = useStyles();
  //const [isCalled, setIsCalled] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);

  const config: Pubnub.PubnubConfig = {
    subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
    publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
    ssl: true,
  };
  let leftComponent = 0;
  let rightComponent = 0;
  const pubnub = new Pubnub(config);
  useEffect(() => {
    pubnub.subscribe({
      channels: ['Channel4'],
      withPresence: true,
    });

    getHistory();
    pubnub.addListener({
      status: (statusEvent) => {
        if (statusEvent.category === Pubnub.CATEGORIES.PNConnectedCategory) {
          console.log(statusEvent.category);
        } else if (statusEvent.operation === Pubnub.OPERATIONS.PNAccessManagerAudit) {
          console.log(statusEvent.operation);
        }
      },
      message: (message) => {
        getHistory();
      },
      presence: (presenceEvent) => {
        console.log('presenceEvent', presenceEvent);
      },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: ['Channel4'] });
    };
  });

  useEffect(() => {
    console.log(props.startConsult);
    if (props.startConsult !== isVideoCall) {
      setIsVideoCall(props.startConsult);
      setMessageText('callme');
      autoSend();
      console.log(1111111111);
    }
  }, [props.startConsult, isVideoCall]);
  const getHistory = () => {
    pubnub.history({ channel: 'Channel4', reverse: true, count: 1000 }, (status, res) => {
      const newmessage: MessagesObjectProps[] = [];
      res.messages.forEach((element, index) => {
        newmessage[index] = element.entry;
      });
      if (messages.length !== newmessage.length) {
        setMessages(newmessage);
        // const lastMessage = newmessage[newmessage.length - 1];
        // if (lastMessage && lastMessage.message === 'callme') {
        //   setIsCalled(true);
        // }
      }
    });
  };

  const send = () => {
    const text = {
      id: 'Ravi',
      message: messageText,
    };
    pubnub.publish(
      {
        channel: 'Channel4',
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
  };
  const autoSend = () => {
    const text = {
      id: 'Ravi',
      message: 'callme',
    };
    pubnub.publish(
      {
        channel: 'Channel4',
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
    setIsVideoCall(true);
    //setIsCalled(true);
    actionBtn();
  };

  const renderChatRow = (rowData: MessagesObjectProps, index: number) => {
    if (rowData.id === 'Ravi') {
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
    if (rowData.id === 'Sai') {
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
    if (rowData.id !== 'Sai' && rowData.id !== 'Ravi') {
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
    // props.toggleTabs();
  };
  return (
    <div className={classes.consultRoom}>
      <div className={!showVideo ? classes.container : classes.audioVideoContainer}>
        {/* {!showVideo && (
          <div>
            <button onClick={() => setIsVideoCall(false)}>Audio Call</button>
            <button onClick={() => setIsVideoCall(true)}>Video Call</button>
          </div>
        )} */}
        {showVideo && (
          <Consult
            toggelChatVideo={() => toggelChatVideo()}
            showVideoChat={showVideoChat}
            isVideoCall={isVideoCall}
          />
        )}
        <div>
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatContainer}>{messagessHtml}</div>
          )}
          {/* {!showVideo && (
            <div>
              {isCalled && (
                <div className={classes.incomingContainer}>
                  <div className={classes.incomingBtn}>
                    <img src={require('images/ic_patientchat.png')} />
                    <div>
                      <span>Ringing</span>
                      <img
                        src={require('images/ic_callpick.svg')}
                        className={classes.endcall}
                        onClick={() => actionBtn()}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )} */}
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
              <Button className={classes.chatsendcircle} onClick={() => send()}>
                <img src={require('images/ic_add_circle.svg')} alt="" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
