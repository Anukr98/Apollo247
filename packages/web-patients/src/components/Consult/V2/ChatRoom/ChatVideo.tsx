import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import { useAllCurrentPatients } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingLeft: 20,
    },
    videoContainer: {
      backgroundColor: '#F7F8F5',
      overflow: 'hidden',
      position: 'absolute',
      zIndex: 8,
      top: -60,
      left: 15,
      width: 'calc(100% - 15px)',
      height: 'calc(100vh - 175px)',
    },
    videoBg: {
      backgroundColor: '#000',
      height: 'calc(100vh - 300px)',
      borderRadius: 10,
      overflow: 'hidden',
    },
    largeVideoContainer: {
      height: 'calc(100vh - 222px)',
    },
    smallVideoContainer: {
      position: 'absolute',
      right: 38,
      top: 20,
      width: 204,
      height: 154,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    videoChatWindow: {
      paddingRight: 17,
    },
    videoPoster: {
      padding: 0,
    },
    videoButtonContainer: {
      position: 'absolute',
      zIndex: 9,
      bottom: 0,
      width: '100%',
      padding: 20,
      borderTop: '0.5px solid #02475B',
      '& button': {
        backgroundColor: 'transparent',
        border: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
        '&:focus': {
          backgroundColor: 'transparent',
          border: 0,
          boxShadow: 'none',
        },
        '&:hover': {
          backgroundColor: 'transparent',
          border: 0,
          boxShadow: 'none',
        },
        '& img': {
          verticalAlign: 'middle',
          maxWidth: 48,
        },
      },
    },
    middleActions: {
      textAlign: 'center',
      '& button': {
        paddingLeft: 10,
        paddingRight: 10,
      },
    },
    rightActions: {
      textAlign: 'right',
    },
    minimizeImg: {
      position: 'absolute',
      minWidth: 48,
      minHeight: 48,
      top: -40,
      right: 20,
      zIndex: 9,
      borderRadius: 10,
      width: 224,
      height: 158,
      overflow: 'hidden',
      backgroundColor: '#000',
      '& div': {
        '& div': {
          '& div': {
            top: '0 !important',
            right: '0 !important',
            width: '228px !important',
          },
        },
      },
    },
    minimizeVideoImg: {
      zIndex: 9,
      width: 170,
      height: 170,
      position: 'absolute',
      top: 0,
      backgroundColor: '#000',
    },
    maximizeImg: {
      position: 'absolute',
      minWidth: 1020,
      minHeight: 409,
      top: 0,
      right: 0,
      zIndex: 9,
      borderRadius: 10,
      width: 264,
      height: 158,
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    callActions: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 10,
      display: 'flex',
      alignItems: 'center',
      zIndex: 9999,
      '& button': {
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
        '& img': {
          maxWidth: 40,
          verticalAlign: 'middle',
        },
      },
    },
    stopCallBtn: {
      marginLeft: 'auto',
    },
    hidePublisherVideo: {
      display: 'none',
    },
    hideVideoContainer: {
      right: 15,
      width: 150,
      height: 150,
      position: 'absolute',
      zIndex: 9,
      // bottom: 125,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
      borderRadius: 10,
      overflow: 'hidden',
      top: -80,
      backgroundColor: '#000',
    },
    otPublisher: {
      top: '0 !important',
      right: '0 !important',
      '&.OT_publisher': {
        top: '0 !important',
        right: '0 !important',
      },

      '& >div': {
        '& >div': {
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 9,
          borderRadius: 10,
        },
      },
    },
    smallPoster: {
      '& img': {
        maxHeight: 154,
      },
    },

    largePoster: {
      '& img': {
        maxHeight: 'calc(100vh - 195px)',
      },
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
    timerCls: {
      position: 'absolute',
      top: 80,
      zIndex: 99,
      left: 40,
      fontSize: 12,
      fontWeight: 600,
      color: '#f7f8f5',
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      marginTop: -50,
    },
    audioVideoState: {
      fontSize: 12,
      fontWeight: 500,
      margin: '10px 0 0',
      color: '#b00020',
    },
  };
});
interface ConsultProps {
  toggelChatVideo: () => void;
  stopAudioVideoCall: () => void;
  stopConsultCall: () => void;
  showVideoChat: boolean;
  isVideoCall: boolean;
  sessionId: string;
  token: string;
  isNewMsg: boolean;
  timerMinuts: number;
  timerSeconds: number;
  doctorDetails: DoctorDetails;
  convertCall: () => void;
  videoCall: boolean;
  audiocallmsg: boolean;
  setSessionError: (error: any) => void;
  setPublisherError: (error: any) => void;
  setSubscriberError: (error: any) => void;
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
export const ChatVideo: React.FC<ConsultProps> = (props) => {
  const classes = useStyles({});
  const [isCall, setIscall] = React.useState(true);
  const [isPublishAudio, setIsPublishAudio] = React.useState(true);
  const [subscribeToVideo, setSubscribeToVideo] = React.useState(props.isVideoCall ? true : false);
  const [callerAudio, setCallerAudio] = React.useState<boolean>(true);
  const [callerVideo, setCallerVideo] = React.useState<boolean>(true);
  const [downgradeToAudio, setDowngradeToAudio] = React.useState<boolean>(false);
  const [reconnecting, setReconnecting] = React.useState<boolean>(false);
  const [docImg, setDocImg] = React.useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const patientProfile = currentPatient && currentPatient.photoUrl;
  const isRetry = true;
  const { doctorDetails, videoCall } = props;

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
      return `Doctor’s audio & video are paused`;
    else if (!callerAudio) return `Doctor’s audio is paused`;
    else if (!callerVideo && getCookieValue() === 'videocall') return `Doctor’s video is paused`;
    else return null;
  };

  const sessionHandler = {
    connectionDestroyed: (event: any) => {
      console.log('session connectionDestroyed', event);
      props.toggelChatVideo();
      props.stopConsultCall();
      setIscall(false);
      if (event.reason === 'networkDisconnected') {
        props.setSessionError({
          message: 'Call was disconnected due to Network problems on the doctor end.',
        });
      } else {
        props.setSessionError({ message: 'Doctor left the call.' });
      }
    },
    error: (error: any) => {
      console.log(`There was an error with the sessionEventHandlers: ${JSON.stringify(error)}`);
      //props.setSessionError(error);
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

  return (
    <div className={classes.root}>
      <div
        className={`videoChatWindow ${
          props.showVideoChat || !subscribeToVideo ? 'chatVideo' : ''
          }`}
      >
        {!props.showVideoChat && (
          <div className={classes.timerCls}>
            {/* {doctorDetails && doctorDetails.getDoctorDetailsById && (
              <div className={classes.doctorName}>
                {`${
                  doctorDetails && doctorDetails.getDoctorDetailsById
                    ? doctorDetails.getDoctorDetailsById.displayName
                    : ''
                  }` +
                  "'s" +
                  ' team has joined'}
              </div>
            )} */}
            {!props.showVideoChat && (
              <span>
                {/* {`${
                  props.timerMinuts.toString().length < 2
                    ? '0' + props.timerMinuts
                    : props.timerMinuts
                  } : 
             ${
                  props.timerSeconds.toString().length < 2
                    ? '0' + props.timerSeconds
                    : props.timerSeconds
                  }`} */}
                <p className={classes.audioVideoState}>{checkReconnecting()}</p>
                <p className={classes.audioVideoState}>{checkDowngradeToAudio()}</p>
                <p className={classes.audioVideoState}>{isPaused()}</p>
              </span>
            )}
          </div>
        )}

        {isCall && (
          <OTSession
            apiKey={process.env.OPENTOK_KEY}
            sessionId={props.sessionId}
            token={props.token}
            eventHandlers={sessionHandler}
            onError={(error: any) => {
              console.log('Session Error', error);
              props.setSessionError(error);
            }}
          // eventHandlers={{
          //   connectionDestroyed: (event: any) => {
          //     props.stopConsultCall();
          //     setIscall(false);
          //   },
          // }}
          >
            <div
              className={`${classes.minimizeImg}
            ${props.showVideoChat || !subscribeToVideo ? classes.hidePublisherVideo : ''}`}
            >
              <div>
                <OTPublisher
                  properties={{
                    publishAudio: isPublishAudio,
                    publishVideo: subscribeToVideo,
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
              </div>
            </div>
            <div
              className={props.showVideoChat ? classes.hideVideoContainer : classes.videoContainer}
            >
              <div className={classes.videoBg}>
                {!subscribeToVideo && !props.showVideoChat && getCookieValue() === 'videocall' && (
                  <img
                    className={classes.minimizeImg}
                    src={
                      patientProfile !== null
                        ? patientProfile
                        : require('images/DefaultPatient_Video.svg')
                    }
                  />
                )}
                {(!subscribeToVideo && !props.showVideoChat) ||
                  (videoCall && (
                    <img
                      className={classes.maximizeImg}
                      src={
                        doctorDetails &&
                          doctorDetails.getDoctorDetailsById &&
                          doctorDetails.getDoctorDetailsById.photoUrl !== null
                          ? doctorDetails.getDoctorDetailsById.photoUrl
                          : require('images/DefaultPatient_Video.svg')
                      }
                    />
                  ))}
                {!subscribeToVideo && !props.showVideoChat && getCookieValue() === 'audiocall' && (
                  <img
                    className={classes.maximizeImg}
                    src={
                      doctorDetails &&
                        doctorDetails.getDoctorDetailsById &&
                        doctorDetails.getDoctorDetailsById.photoUrl !== null
                        ? doctorDetails.getDoctorDetailsById.photoUrl
                        : require('images/DefaultPatient_Video.svg')
                    }
                  />
                )}

                <OTStreams>
                  <OTSubscriber
                    eventHandlers={subscriberHandler}
                    retry={isRetry}
                    //className={!props.showVideoChat ? classes.subscriber : classes.minSubscriber}
                    properties={{
                      width: '100%',
                      height: 'calc(100vh - 195px)',
                    }}
                    onError={(error: any) => {
                      console.log('Subscriber Error', error);
                      props.setSubscriberError(error);
                    }}
                  />
                </OTStreams>
                {props.showVideoChat && (
                  <div>
                    {!subscribeToVideo && (
                      <div>
                        <img
                          src={
                            doctorDetails &&
                              doctorDetails.getDoctorDetailsById &&
                              doctorDetails.getDoctorDetailsById.photoUrl !== null
                              ? doctorDetails.getDoctorDetailsById.photoUrl
                              : require('images/DefaultPatient_Video.svg')
                          }
                          className={classes.minimizeVideoImg}
                        />
                      </div>
                    )}
                    <div className={classes.callActions}>
                      <Button onClick={() => props.toggelChatVideo()}>
                        <img src={require('images/ic_expand_circle.svg')} />
                      </Button>
                      <Button
                        className={classes.stopCallBtn}
                        onClick={() => {
                          setIscall(false);
                          props.stopAudioVideoCall();
                        }}
                      >
                        <img src={require('images/ic_endcall_small.svg')} />
                      </Button>
                    </div>
                  </div>
                )}

                {!props.showVideoChat && (
                  <div className={classes.videoButtonContainer}>
                    <Grid container alignItems="flex-start" spacing={0}>
                      <Grid item xs={4}>
                        {isCall && (
                          <Button onClick={() => props.toggelChatVideo()}>
                            <img
                              src={
                                props.isNewMsg
                                  ? require('images/ic_message.svg')
                                  : require('images/ic_chat_circle.svg')
                              }
                              alt="msgicon"
                            />
                          </Button>
                        )}
                      </Grid>
                      <Grid item xs={4} className={classes.middleActions}>
                        {isCall && isPublishAudio && (
                          <Button onClick={() => setIsPublishAudio(!isPublishAudio)}>
                            <img src={require('images/ic_mute.svg')} alt="mute" />
                          </Button>
                        )}
                        {isCall && !isPublishAudio && (
                          <Button onClick={() => setIsPublishAudio(!isPublishAudio)}>
                            <img src={require('images/ic_unmute.svg')} alt="unmute" />
                          </Button>
                        )}
                        {isCall && subscribeToVideo && getCookieValue() === 'videocall' && (
                          <Button
                            onClick={() => {
                              props.convertCall();
                              setSubscribeToVideo(!subscribeToVideo);
                            }}
                          >
                            <img src={require('images/ic_videoon.svg')} alt="video on" />
                          </Button>
                        )}
                        {isCall && !subscribeToVideo && getCookieValue() === 'videocall' && (
                          <Button
                            onClick={() => {
                              props.convertCall();
                              setSubscribeToVideo(!subscribeToVideo);
                            }}
                          >
                            <img src={require('images/ic_videooff.svg')} alt="video off" />
                          </Button>
                        )}
                      </Grid>

                      <Grid item xs={4} className={classes.rightActions}>
                        {isCall && (
                          <Button
                            onClick={() => {
                              props.toggelChatVideo();
                              props.stopAudioVideoCall();
                              setIscall(false);
                            }}
                          >
                            <img src={require('images/ic_endcall_big.svg')} alt="end call" />
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </div>
                )}
              </div>
            </div>
          </OTSession>
        )}
      </div>
    </div>
  );
};
