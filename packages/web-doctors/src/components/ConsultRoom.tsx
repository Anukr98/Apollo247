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
      marginTop: 40,
    },
    petient: {
      color: '#0087ba',
      textAlign: 'left',
      backgroundColor: '#fff',
      padding: 15,
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 #00000026',
      minWidth: 120,
    },
    doctor: {
      backgroundColor: '#f0f4f5',
      padding: 15,
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
      paddingBottom: 120,
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
      padding: '60px 20px 20px 20px',
      clear: 'both',
      bottom: 0,
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
}
export const ConsultRoom: React.FC = (ConsultRoomProps) => {
  const classes = useStyles();
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');

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
      channels: ['Channel3'],
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
      pubnub.unsubscribe({ channels: ['Channel3'] });
    };
  });

  const getHistory = () => {
    pubnub.history({ channel: 'Channel3', reverse: true, count: 1000 }, (status, res) => {
      const newmessage: MessagesObjectProps[] = [];
      res.messages.forEach((element, index) => {
        newmessage[index] = element.entry;
      });
      if (messages.length !== newmessage.length) {
        setMessages(newmessage);
        const lastMessage = newmessage[newmessage.length - 1];
        if (lastMessage && lastMessage.message === 'callme') {
          setIsCalled(true);
        }
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
        channel: 'Channel3',
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
  return (
    <div className={classes.consultRoom}>
      <div className={classes.container}>
        {showVideo && (
          <Consult toggelChatVideo={() => toggelChatVideo()} showVideoChat={showVideoChat} />
        )}
        <div>
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatContainer}>{messagessHtml}</div>
          )}
          {!showVideo && (
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
                        onClick={() => setShowVideo(true)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatFooterSection}>
              <AphInput
                className={classes.inputWidth}
                inputProps={{ type: 'text' }}
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
