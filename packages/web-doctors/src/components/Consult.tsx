import React, { useContext } from 'react';
import { Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
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
      width: 170,
      height: 170,
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
  isNewMsg: boolean;
  convertCall: () => void;
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
  const [isCall, setIscall] = React.useState(true);
  const [mute, setMute] = React.useState(true);
  const [subscribeToVideo, setSubscribeToVideo] = React.useState(props.isVideoCall ? true : false);
  const { patientDetails, createdDoctorProfile } = useContext(CaseSheetContext);
  const apikey = process.env.OPENTOK_KEY;
  const sessionHandler = {
    connectionDestroyed: (event: any) => {
      console.log('session connectionDestroyed', event);
      props.toggelChatVideo();
      props.stopAudioVideoCallpatient();
      setIscall(false);
    },
    error: (error: string) => {
      console.log(`There was an error with the sessionEventHandlers: ${JSON.stringify(error)}`);
    },
    otrnError: (error: string) => {
      console.log(`There was an error with the sessionEventHandlers: ${JSON.stringify(error)}`);
    },
    connectionCreated: (event: string) => {},
    sessionConnected: (event: string) => {
      console.log('session stream sessionConnected!', event);
    },
    sessionDisconnected: (event: string) => {
      console.log('session stream sessionDisconnected!', event);
    },
    sessionReconnected: (event: string) => {
      console.log('session stream sessionReconnected!', event);
    },
    sessionReconnecting: (event: string) => {
      console.log('session stream sessionReconnecting!', event);
    },
    signal: (event: string) => {
      console.log('session stream signal!', event);
    },
    streamDestroyed: (event: string) => {
      console.log('session streamDestroyed destroyed!', event); // is called when the doctor network is disconnected
    },
    streamPropertyChanged: (event: string) => {
      console.log('session streamPropertyChanged destroyed!', event);
    },
  };
  const publisherHandler = {
    streamCreated: (event: string) => {
      console.log('Publisher stream created!', event);
    },
    streamDestroyed: (event: string) => {
      console.log('Publisher stream destroyed!', event);
    },
    error: (error: string) => {
      console.log(`There was an error with the publisherEventHandlers: ${JSON.stringify(error)}`);
    },
    otrnError: (error: string) => {
      console.log(`There was an error with the publisherEventHandlers: ${JSON.stringify(error)}`);
    },
  };
  const subscriberHandler = {
    error: (error: string) => {
      console.log(`There was an error with the subscriberEventHandlers: ${JSON.stringify(error)}`);
    },
    connected: (event: string) => {
      console.log('Subscribe stream connected!', event);
    },
    disconnected: (event: string) => {
      console.log('Subscribe stream disconnected!', event);
    },
    otrnError: (error: string) => {
      console.log(`There was an error with the subscriberEventHandlers: ${JSON.stringify(error)}`);
    },
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
            </div>
          )}

          {isCall && (
            <div className={'sdCall'}>
              <OTSession
                apiKey={apikey}
                sessionId={props.sessionId}
                token={props.token}
                eventHandlers={sessionHandler}
              >
                <OTPublisher
                  className={
                    props.showVideoChat || !subscribeToVideo ? classes.hidePublisherVideo : ''
                  }
                  resolution={'352x288'}
                  properties={{
                    publishAudio: mute,
                    publishVideo: subscribeToVideo,
                  }}
                  eventHandlers={publisherHandler}
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
                    <OTSubscriber eventHandlers={subscriberHandler} />
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
                            setIscall(false);
                            props.stopAudioVideoCall();
                          }}
                        />
                        <img
                          src={require('images/ic_maximize.svg')}
                          className={classes.fullscreenIcon}
                          onClick={() => props.toggelChatVideo()}
                        />
                      </div>
                    </div>
                  )}
                  {!props.showVideoChat && (
                    <div className={classes.videoButtonContainer}>
                      <Grid container alignItems="flex-start" spacing={0}>
                        <Grid item lg={1} sm={2} xs={2}>
                          {isCall && (
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
                          {isCall && mute && (
                            <button className={classes.muteBtn} onClick={() => setMute(!mute)}>
                              <img
                                className={classes.whiteArrow}
                                src={require('images/ic_mute.svg')}
                                alt="mute"
                              />
                            </button>
                          )}
                          {isCall && !mute && (
                            <button className={classes.muteBtn} onClick={() => setMute(!mute)}>
                              <img
                                className={classes.whiteArrow}
                                src={require('images/ic_unmute.svg')}
                                alt="unmute"
                              />
                            </button>
                          )}
                          {isCall && subscribeToVideo && getCookieValue() === 'videocall' && (
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
                          {isCall && !subscribeToVideo && getCookieValue() === 'videocall' && (
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
                          {isCall && (
                            <button
                              onClick={() => {
                                props.toggelChatVideo();
                                props.stopAudioVideoCall();
                                setIscall(false);
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
