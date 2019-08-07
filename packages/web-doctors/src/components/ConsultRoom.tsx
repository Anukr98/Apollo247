import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { AphInput } from '@aph/web-ui-components';
//import { Consult } from 'components/Consult';
import Pubnub from 'pubnub';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consultRoomContainer: {
      paddingTop: 68,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 68,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    consultTabcontainer: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      minHeight: 500,
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      padding: '35px 20px',
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    timeLeft: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.6)',
      textTransform: 'capitalize',
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 20,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 0,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeightMedium,
      textAlign: 'center',
      color: '#02475b',
      padding: '14px 10px',
      textTransform: 'none',
      width: '50%',
      opacity: 1,
      [theme.breakpoints.down('xs')]: {
        width: '50%',
      },
    },
    tabSelected: {
      fontWeight: theme.typography.fontWeightBold,
      color: '#02475b',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    consultButtonContainer: {
      position: 'absolute',
      right: 0,
    },
    consultButton: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeightMedium,
      color: '#fff',
      padding: '6px 16px',
      backgroundColor: '#fc9916',
      marginLeft: 20,
      marginRight: 10,
      borderRadius: 15,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
    },
    consultIcon: {
      padding: 6,
      backgroundColor: 'transparent',
      margin: '0 5px',
      minWidth: 20,
    },
    DisplayNone: {
      display: 'none !important',
    },
    consultRoom: {
      paddingTop: 0,
      paddingBottom: 0,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
      },
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
    consult: {
      paddingTop: 0,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
      },
      position: 'absolute',
      top: -69,
      zIndex: 9999,
      width: '100%',
      background: '#fff',
    },
    muteBtn: {
      zIndex: 9999,
      marginTop: 0,
    },
    whiteArrowBtn: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    videoButtonContainer: {
      zIndex: 9,
      paddingTop: 20,
      margin: 0,
      position: 'absolute',
      width: '100%',
      bottom: 0,
      '& button': {
        backgroundColor: 'transparent',
        border: 'none',
        '&:focus': {
          outline: 'none',
        },
      },
    },
    videoContainer: {
      minHeight: 470,
      backgroundColor: '#000',
      borderRadius: 10,
      margin: 20,
      overflow: 'hidden',
      position: 'relative',
    },
    hideVideoContainer: {
      right: 20,
      width: 170,
      height: 170,
      position: 'absolute',
      // bottom: 125,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
      borderRadius: 10,
      overflow: 'hidden',
      top: 80,
    },
    VideoAlignment: {
      textAlign: 'center',
    },
    hidePublisherVideo: {
      display: 'none',
    },
    minimizeBtns: {
      position: 'absolute',
      width: 170,
      height: 170,
      zIndex: 9,
    },
    stopCallIcon: {
      width: 40,
      position: 'absolute',
      bottom: 10,
      right: 10,
    },
    fullscreenIcon: {
      width: 34,
      position: 'absolute',
      bottom: 14,
      left: 10,
    },
    minimizeVideoImg: {
      zIndex: 9,
      width: 170,
      height: 170,
      position: 'absolute',
    },
    minimizeImg: {
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '100%',
      zIndex: 9,
    },
  };
});
interface MessagesObjectProps {
  id: string;
  message: string;
  username: string;
  text: string;
}
interface ConsultRoomProps {}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(0);
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const isVideoCall = true;
  const [isCall, setIscall] = React.useState(true);
  const [mute, setMute] = React.useState(true);
  const [subscribeToVideo, setSubscribeToVideo] = React.useState(isVideoCall ? true : false);
  const subscribeToAudio = isVideoCall ? false : true;
  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };
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
            {leftComponent == 1 && <span className={classes.boldTxt} />}
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
    <div className={classes.consultRoomContainer}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.consultTabcontainer}>
        <div className={classes.breadcrumbs}>
          <div>
            <div className={classes.backArrow}>
              <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
              <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
            </div>
          </div>
          CONSULT ROOM
          <div className={classes.consultButtonContainer}>
            <span className={classes.timeLeft}> Consult Duration 00:25</span>
            <Button className={classes.consultButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#fff" d="M8 5v14l11-7z" />
              </svg>
              Start Consult
            </Button>
            <Button className={classes.consultIcon}>
              <img src={require('images/ic_call.svg')} />
            </Button>
            <Button className={classes.consultIcon}>
              <img src={require('images/ic_more.svg')} />
            </Button>
          </div>
        </div>
        <div>
          <div>
            <Tabs
              value={tabValue}
              variant="fullWidth"
              classes={{
                root: classes.tabsRoot,
                indicator: classes.tabsIndicator,
              }}
              onChange={(e, newValue) => {
                setTabValue(newValue);
              }}
            >
              <Tab
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Case Sheet"
              />
              <Tab
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Chat"
              />
            </Tabs>
          </div>
          {tabValue === 0 && <TabContainer>case sheet</TabContainer>}
          {tabValue === 1 && (
            <TabContainer>
              <div className={classes.consultRoom}>
                <div className={!showVideo ? classes.container : classes.audioVideoContainer}>
                  {showVideo && (
                    <div className={classes.consult}>
                      <div>
                        <div className={showVideoChat || !subscribeToVideo ? 'chatVideo' : ''}>
                          {isCall && (
                            <OTSession
                              apiKey="46393582"
                              sessionId="1_MX40NjM5MzU4Mn5-MTU2NTA3MTUwNDk4MX56bVd3ZW96MFNuS2Vua2dDMnZ5VTZNNlJ-UH4"
                              token="T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9Y2UxMDhkODEzNTU3MmE4M2ExZTZkNmVlYjVkZDE0ODA3NGZhM2QyZTpzZXNzaW9uX2lkPTFfTVg0ME5qTTVNelU0TW41LU1UVTJOVEEzTVRVd05EazRNWDU2YlZkM1pXOTZNRk51UzJWdWEyZERNblo1VlRaTk5sSi1VSDQmY3JlYXRlX3RpbWU9MTU2NTA3MTYxMCZub25jZT0wLjExNjA5MzQ3Njk5NjI3MzM3JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1Njc2NjM2MDcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0="
                            >
                              <OTPublisher
                                className={
                                  showVideoChat || !subscribeToVideo
                                    ? classes.hidePublisherVideo
                                    : ''
                                }
                                properties={{
                                  publishAudio: mute,
                                  publishVideo: subscribeToVideo,
                                  subscribeToVideo: subscribeToVideo,
                                  subscribeToAudio: subscribeToAudio,
                                }}
                              />

                              <div
                                className={
                                  showVideoChat
                                    ? classes.hideVideoContainer
                                    : classes.videoContainer
                                }
                              >
                                {!subscribeToVideo && !showVideoChat && (
                                  <img
                                    className={classes.minimizeImg}
                                    src={require('images/patient_01.png')}
                                  />
                                )}
                                {/* <div
                                className={
                                  props.showVideoChat ? classes.hideVideoContainer : classes.videoContainer
                                }
                              > */}
                                <OTStreams>
                                  <OTSubscriber
                                    properties={{
                                      subscribeToVideo: subscribeToVideo,
                                      subscribeToAudio: subscribeToAudio,
                                    }}
                                  />
                                </OTStreams>
                                {/* </div> */}

                                {showVideoChat && (
                                  <div>
                                    {!subscribeToVideo && (
                                      <img
                                        src={require('images/ic_patientchat.png')}
                                        className={classes.minimizeVideoImg}
                                      />
                                    )}
                                    <div className={classes.minimizeBtns}>
                                      <img
                                        src={require('images/ic_stopcall.svg')}
                                        className={classes.stopCallIcon}
                                        onClick={() => setIscall(false)}
                                      />
                                      <img
                                        src={require('images/ic_maximize.svg')}
                                        className={classes.fullscreenIcon}
                                        onClick={() => toggelChatVideo()}
                                      />
                                    </div>
                                  </div>
                                )}
                                {!showVideoChat && (
                                  <div className={classes.videoButtonContainer}>
                                    <Grid container alignItems="flex-start" spacing={0}>
                                      <Grid item lg={1} sm={2} xs={2}>
                                        {isCall && (
                                          <button
                                            className={classes.muteBtn}
                                            onClick={() => toggelChatVideo()}
                                          >
                                            <img
                                              className={classes.whiteArrowBtn}
                                              src={require('images/ic_message.svg')}
                                              alt="msgicon"
                                            />
                                          </button>
                                        )}
                                      </Grid>
                                      <Grid
                                        item
                                        lg={10}
                                        sm={8}
                                        xs={8}
                                        className={classes.VideoAlignment}
                                      >
                                        {isCall && mute && (
                                          <button
                                            className={classes.muteBtn}
                                            onClick={() => setMute(!mute)}
                                          >
                                            <img
                                              className={classes.whiteArrowBtn}
                                              src={require('images/ic_mute.svg')}
                                              alt="mute"
                                            />
                                          </button>
                                        )}
                                        {isCall && !mute && (
                                          <button
                                            className={classes.muteBtn}
                                            onClick={() => setMute(!mute)}
                                          >
                                            <img
                                              className={classes.whiteArrowBtn}
                                              src={require('images/ic_unmute.svg')}
                                              alt="unmute"
                                            />
                                          </button>
                                        )}
                                        {isCall && subscribeToVideo && (
                                          <button
                                            className={classes.muteBtn}
                                            onClick={() => setSubscribeToVideo(!subscribeToVideo)}
                                          >
                                            <img
                                              className={classes.whiteArrowBtn}
                                              src={require('images/ic_videoon.svg')}
                                              alt="videoon"
                                            />
                                          </button>
                                        )}
                                        {isCall && !subscribeToVideo && (
                                          <button
                                            className={classes.muteBtn}
                                            onClick={() => setSubscribeToVideo(!subscribeToVideo)}
                                          >
                                            <img
                                              className={classes.whiteArrowBtn}
                                              src={require('images/ic_videooff.svg')}
                                              alt="videooff"
                                            />
                                          </button>
                                        )}
                                        {isCall && (
                                          <button onClick={() => setIscall(false)}>
                                            <img
                                              className={classes.whiteArrowBtn}
                                              src={require('images/ic_stopcall.svg')}
                                              alt="stopcall"
                                            />
                                          </button>
                                        )}
                                      </Grid>
                                    </Grid>
                                  </div>
                                )}
                              </div>
                            </OTSession>
                          )}
                        </div>
                      </div>
                    </div>
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
                                  onClick={() => actionBtn()}
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
            </TabContainer>
          )}
        </div>
      </div>
    </div>
  );
};
