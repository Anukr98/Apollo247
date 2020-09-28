import React, { useContext } from 'react';
import { Theme } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consult: {
      paddingTop: 0,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
      },
      position: 'absolute',
      top: 0,
      zIndex: 9999,
      width: '100%',
      background: '#fff',
    },
    muteBtn: {
      zIndex: 9999,
      marginTop: 0,
    },
    whiteArrow: {
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
      height: 'calc(100vh - 248px)',
      backgroundColor: '#000',
      borderRadius: 10,
      margin: 20,
      marginTop: 68,
      overflow: 'hidden',
      position: 'relative',
      textAlign: 'center',
    },
    hideVideoContainer: {
      right: 15,
      width: 240,
      height: 197,
      position: 'absolute',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
      borderRadius: 10,
      overflow: 'hidden',
      top: 60,
      backgroundColor: '#000',
    },
    VideoAlignment: {
      textAlign: 'center',
    },
    hidePublisherVideo: {
      display: 'none',
    },
    hidePublisherVideoSD: {
      height: 170,
    },
    minimizeBtns: {
      position: 'absolute',
      width: 240,
      height: 197,
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
      width: 240,
      height: 197,
      position: 'absolute',
      backgroundColor: '#000',
    },
    minimizeImg: {
      position: 'absolute',
      minWidth: 48,
      minHeight: 48,
      top: 0,
      right: 0,
      zIndex: 9,
      borderRadius: 10,
      width: 264,
      height: 198,
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    maximizeImg: {
      position: 'relative',
      minWidth: 'auto',
      minHeight: 'calc(100vh - 212px)',
      zIndex: 9,
      borderRadius: 0,
      width: 'auto',
      height: 'calc(100vh - 212px)',
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    timerCls: {
      position: 'absolute',
      top: 80,
      zIndex: 99,
      left: 40,
      fontSize: 12,
      fontWeight: 600,
      color: '#f7f8f5',
    },
    patientName: {
      fontSize: 20,
      fontWeight: 600,
    },
    subscriber: {
      '& video': {
        transform: 'rotate(0deg) translateX(-50%) !important',
        width: 'auto !important',
        left: '50%',
      },
    },
    minSubscriber: {
      '& > div:first-child': {
        minHeight: 'auto !important',
      },
    },
    audioVideoState: {
      fontSize: 12,
      fontWeight: 500,
      margin: '10px 0 0',
      color: '#b00020',
    },
    errorMessage: {
      position: 'absolute',
      top: 0,
      left: 20,
      zIndex: 10,
    },
  };
});
interface ConsultProps {
  toggelChatVideo: () => void;
  stopAudioVideoCall: () => void;
  stopAudioVideoCallpatient: () => void;
  showVideoChat: boolean;
  isVideoCall: boolean;
  sessionId: string;
  token: string;
  timerMinuts: number;
  timerSeconds: number;
  isCallAccepted: boolean;
  isCall: boolean;
  isNewMsg: boolean;
  convertCall: () => void;
  setIscall: (value: boolean) => void;
  setSessionError: (error: any) => void;
  setPublisherError: (error: any) => void;
  setSubscriberError: (error: any) => void;
  setGiveRating?: (flag: boolean) => void;
  setUserMessageOnCall: (msg: string) => void;
  userMessageOnCall: string;
}
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

export const Consult: React.FC<ConsultProps> = (props) => {
  const classes = useStyles({});

  const [isPublishAudio, setIsPublishAudio] = React.useState(true);
  const [callerAudio, setCallerAudio] = React.useState<boolean>(true);
  const [callerVideo, setCallerVideo] = React.useState<boolean>(true);
  const [downgradeToAudio, setDowngradeToAudio] = React.useState<boolean>(false);

  const [reconnecting, setReconnecting] = React.useState<boolean>(false);

  const [subscribeToVideo, setSubscribeToVideo] = React.useState(props.isVideoCall ? true : false);
  const { patientDetails, createdDoctorProfile } = useContext(CaseSheetContext);
  const isRetry = true;
  const apikey = process.env.OPENTOK_KEY;
  const sessionHandler = {
    connectionDestroyed: (event: any) => {
      console.log('session connectionDestroyed', event);
      props.toggelChatVideo();
      props.stopAudioVideoCallpatient();
      props.setIscall(false);
      if (event.reason === 'networkDisconnected') {
        props.setGiveRating(true);
        props.setSessionError({
          message: 'Call was disconnected due to Network problems on the patient end.',
        });
      } else {
        props.setGiveRating(true);
        props.setSessionError({ message: 'Patient left the call.' });
      }
    },
    error: (error: any) => {
      console.log(`There was an error with the sessionEventHandlers: ${JSON.stringify(error)}`);
      props.setSessionError(error);
    },
    connectionCreated: (event: string) => {
      console.log('session stream connectionCreated!', event);
    },
    sessionConnected: (event: string) => {
      console.log('session stream sessionConnected!', event);
    },
    sessionDisconnected: (event: any) => {
      console.log('session stream sessionDisconnected!', event);
      if (event.reason === 'clientDisconnected') {
      }
    },
    sessionReconnected: (event: string) => {
      console.log('session stream sessionReconnected!', event);
      setReconnecting(false);
    },
    sessionReconnecting: (event: string) => {
      console.log('session stream sessionReconnecting!', event);
      setReconnecting(true);
    },
    signal: (event: string) => {
      console.log('session stream signal!', event);
    },
    streamDestroyed: (event: any) => {
      console.log('session streamDestroyed destroyed!', event); // is called when the doctor network is disconnected
      if (event.reason === 'networkDisconnected') {
      }
    },
    streamPropertyChanged: (event: any) => {
      console.log('session streamPropertyChanged destroyed!', event);
      const subscribers = event.target.getSubscribersForStream(event.stream);
      if (subscribers.length) {
        setCallerAudio(event.stream.hasAudio);
        setCallerVideo(event.stream.hasVideo);
      }
    },
  };
  const publisherHandler = {
    streamCreated: (event: string) => {
      console.log('Publisher stream created!', event);
    },
    streamDestroyed: (event: string) => {
      console.log('Publisher stream destroyed!', event);
    },
    error: (error: any) => {
      console.log(`There was an error with the publisherEventHandlers: ${JSON.stringify(error)}`);
      props.setPublisherError(error);
    },
  };
  const subscriberHandler = {
    error: (error: any) => {
      console.log(`There was an error with the subscriberEventHandlers: ${JSON.stringify(error)}`);
      props.setSubscriberError(error);
    },
    connected: (event: string) => {
      console.log('Subscribe stream connected!', event);
      props.setUserMessageOnCall('Patient Joined');
      setTimeout(() => {
        props.setUserMessageOnCall('');
      }, 3000);
    },
    disconnected: (event: string) => {
      console.log('Subscribe stream disconnected!', event);
    },
    destroyed: (event: any) => {
      console.log('Subscribe destroyed!', event);
      if (event.reason === 'networkDisconnected') {
      }
    },
    videoDisableWarning: (event: any) => {
      console.log(`videoDisableWarning: ${JSON.stringify(event)}`);
    },
    videoDisableWarningLifted: (event: any) => {
      console.log(`videoDisableWarningLifted: ${JSON.stringify(event)}`);
    },
    videoDisabled: (event: any) => {
      console.log(`videoDisabled: ${JSON.stringify(event)}`);
      if (event.reason === 'quality') {
        setDowngradeToAudio(true);
      }
    },
    videoEnabled: (event: any) => {
      console.log(`videoDisabled: ${JSON.stringify(event)}`);
      if (event.reason === 'quality') {
        setDowngradeToAudio(false);
      }
    },
    streamDestroyed: (event: any) => {
      console.log('Subscribe stream destroyed!');
    },
  };

  const checkReconnecting = () => {
    if (reconnecting)
      return 'There is a problem with network connection. Reconnecting, Please wait...';
    else return null;
  };

  const checkDowngradeToAudio = () => {
    if (downgradeToAudio) return 'Falling back to audio due to bad network';
    else return null;
  };

  const isPaused = () => {
    if (!callerAudio && !callerVideo && getCookieValue() === 'videocall')
      return `Patient’s audio & video are paused`;
    else if (!callerAudio) return `Patient’s audio is paused`;
    else if (!callerVideo && getCookieValue() === 'videocall') return `Patient’s video is paused`;
    else return null;
  };

  return (
    <div className={classes.consult}>
      <div>
        <div className={props.showVideoChat || !subscribeToVideo ? 'chatVideo' : ''}>
          {!props.showVideoChat && (
            <div className={classes.timerCls}>
              {patientDetails!.firstName &&
                patientDetails!.firstName !== '' &&
                patientDetails!.lastName &&
                patientDetails!.lastName !== '' && (
                  <div className={classes.patientName}>
                    {patientDetails!.firstName + ' ' + patientDetails!.lastName}
                  </div>
                )}
              {props.isCallAccepted &&
                ` ${
                  props.timerMinuts.toString().length < 2
                    ? '0' + props.timerMinuts
                    : props.timerMinuts
                } :  ${
                  props.timerSeconds.toString().length < 2
                    ? '0' + props.timerSeconds
                    : props.timerSeconds
                }`}
              {props.userMessageOnCall && props.userMessageOnCall !== ''  && (<p className={classes.audioVideoState}>{props.userMessageOnCall}</p>) }
              <p className={classes.audioVideoState}>{checkReconnecting()}</p>
              <p className={classes.audioVideoState}>{checkDowngradeToAudio()}</p>
              <p className={classes.audioVideoState}>{isPaused()}</p>
            </div>
          )}

          {props.isCall && (
            <div className={'sdCall'}>
              <OTSession
                apiKey={apikey}
                sessionId={props.sessionId}
                token={props.token}
                eventHandlers={sessionHandler}
                onError={(error: any) => {
                  console.log('Session Error', error);
                  props.setSessionError(error);
                }}
              >
                <OTPublisher
                  className={
                    props.showVideoChat || !subscribeToVideo ? classes.hidePublisherVideo : ''
                  }
                  properties={{
                    publishAudio: isPublishAudio,
                    publishVideo: subscribeToVideo,
                    resolution: '640x480',
                    audioBitrate: 30000,
                    frameRate: 15,
                  }}
                  eventHandlers={publisherHandler}
                  onError={(error: any) => {
                    console.log('Publisher Error', error, error.name);
                    if (error.name === 'OT_USER_MEDIA_ACCESS_DENIED') {
                      props.setPublisherError({
                        message: 'Audio/Video permissions are not provided',
                      });
                    } else if (error.name === 'OT_HARDWARE_UNAVAILABLE') {
                      props.setPublisherError({ message: 'Audio/Video device is not connected.' });
                    } else if (error.name === 'OT_CHROME_MICROPHONE_ACQUISITION_ERROR') {
                      props.setPublisherError({ message: 'Audio device is not connected.' });
                    } else {
                      props.setPublisherError(error);
                    }
                  }}
                />

                <div
                  className={
                    props.showVideoChat ? classes.hideVideoContainer : classes.videoContainer
                  }
                >
                  {!subscribeToVideo &&
                    !props.showVideoChat &&
                    getCookieValue() === 'videocall' && (
                      <img
                        className={classes.minimizeImg}
                        src={
                          createdDoctorProfile && createdDoctorProfile.photoUrl
                            ? createdDoctorProfile.photoUrl
                            : require('images/DefaultPatient_Video.svg')
                        }
                      />
                    )}
                  {!subscribeToVideo &&
                    !props.showVideoChat &&
                    getCookieValue() === 'audiocall' && (
                      <img
                        className={classes.maximizeImg}
                        src={
                          patientDetails!.photoUrl
                            ? patientDetails!.photoUrl
                            : require('images/DefaultPatient_Video.svg')
                        }
                      />
                    )}
                  <OTStreams>
                    <OTSubscriber
                      eventHandlers={subscriberHandler}
                      retry={isRetry}
                      className={!props.showVideoChat ? classes.subscriber : classes.minSubscriber}
                      onError={(error: any) => {
                        console.log('Subscriber Error', error);
                        props.setSubscriberError(error);
                      }}
                    />
                  </OTStreams>

                  {props.showVideoChat && (
                    <div>
                      {!subscribeToVideo && (
                        <img
                          src={
                            patientDetails!.photoUrl
                              ? patientDetails!.photoUrl
                              : require('images/DefaultPatient_Video.svg')
                          }
                          className={classes.minimizeVideoImg}
                        />
                      )}
                      <div className={classes.minimizeBtns}>
                        <img
                          src={require('images/ic_stopcall.svg')}
                          className={classes.stopCallIcon}
                          onClick={() => {
                            props.setIscall(false);
                            props.stopAudioVideoCall();
                          }}
                        />
                        <img
                          src={require('images/ic_maximize.svg')}
                          className={classes.fullscreenIcon}
                          onClick={() => props.toggelChatVideo()}
                        />
                      </div>
                      <div className={classes.errorMessage}>
                        <p className={classes.audioVideoState}>{checkReconnecting()}</p>
                        <p className={classes.audioVideoState}>{checkDowngradeToAudio()}</p>
                        <p className={classes.audioVideoState}>{isPaused()}</p>
                      </div>
                    </div>
                  )}
                  {!props.showVideoChat && (
                    <div className={classes.videoButtonContainer}>
                      <Grid container alignItems="flex-start" spacing={0}>
                        <Grid item lg={1} sm={2} xs={2}>
                          {props.isCall && (
                            <button
                              className={classes.muteBtn}
                              onClick={() => props.toggelChatVideo()}
                            >
                              <img
                                className={classes.whiteArrow}
                                src={
                                  props.isNewMsg
                                    ? require('images/ic_message.svg')
                                    : require('images/ic_chat_circle.svg')
                                }
                                alt="msgicon"
                              />
                            </button>
                          )}
                        </Grid>
                        <Grid item lg={10} sm={8} xs={8} className={classes.VideoAlignment}>
                          {props.isCall && isPublishAudio && (
                            <button
                              className={classes.muteBtn}
                              onClick={() => setIsPublishAudio(!isPublishAudio)}
                            >
                              <img
                                className={classes.whiteArrow}
                                src={require('images/ic_mute.svg')}
                                alt="mute"
                              />
                            </button>
                          )}
                          {props.isCall && !isPublishAudio && (
                            <button
                              className={classes.muteBtn}
                              onClick={() => setIsPublishAudio(!isPublishAudio)}
                            >
                              <img
                                className={classes.whiteArrow}
                                src={require('images/ic_unmute.svg')}
                                alt="unmute"
                              />
                            </button>
                          )}
                          {props.isCall && subscribeToVideo && getCookieValue() === 'videocall' && (
                            <button
                              className={classes.muteBtn}
                              onClick={() => {
                                setSubscribeToVideo(!subscribeToVideo);
                                props.convertCall();
                              }}
                            >
                              <img
                                className={classes.whiteArrow}
                                src={require('images/ic_videoon.svg')}
                                alt="videoon"
                              />
                            </button>
                          )}
                          {props.isCall && !subscribeToVideo && getCookieValue() === 'videocall' && (
                            <button
                              className={classes.muteBtn}
                              onClick={() => {
                                setSubscribeToVideo(!subscribeToVideo);
                                props.convertCall();
                              }}
                            >
                              <img
                                className={classes.whiteArrow}
                                src={require('images/ic_videooff.svg')}
                                alt="videooff"
                              />
                            </button>
                          )}
                          {props.isCall && (
                            <button
                              onClick={() => {
                                props.toggelChatVideo();
                                props.stopAudioVideoCall();
                                props.setIscall(false);
                              }}
                            >
                              <img
                                className={classes.whiteArrow}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
