import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
import Pubnub from 'pubnub';
import { Consult } from 'components/ChatRoom/Consult';
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
      borderRadius: 5,
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
      top: 10,
    },
    incomingCallWindow: {
      position: 'relative',
      width: 154,
      height: 204,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
      overflow: 'hidden',
      backgroundColor: '#000',
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
      position: 'relative',
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
interface ConsultRoomProps {
  // toggleTabs: () => void;
}
export const ChatWindow: React.FC = (props) => {
  const classes = useStyles();
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isVideoCall] = useState<boolean>(false);

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
        <div className={classes.meChat}>
          <div className={classes.chatBubble}>
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
  };
  return (
    <div className={classes.consultRoom}>
      <div
        className={`${classes.chatSection} ${
          !showVideo ? classes.chatWindowContainer : classes.audioVideoContainer
        }`}
      >
        {showVideo && (
          <Consult
            toggelChatVideo={() => toggelChatVideo()}
            showVideoChat={showVideoChat}
            isVideoCall={isVideoCall}
          />
        )}
        <div>
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatContainer}>
              <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 290px'}>
                <div className={classes.customScroll}>{messagessHtml}</div>
              </Scrollbars>
            </div>
          )}
          {!showVideo && (
            <div>
              {isCalled && (
                <div className={classes.incomingCallContainer}>
                  <div className={classes.incomingCallWindow}>
                    <img src={require('images/ic_patientchat.png')} />
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
              <Button className={classes.chatSubmitBtn} onClick={() => send()}>
                <img src={require('images/ic_add_circle.svg')} alt="" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
