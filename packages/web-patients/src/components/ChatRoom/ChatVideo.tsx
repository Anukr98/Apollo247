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
      backgroundColor: '#000',
      borderRadius: 10,
      overflow: 'hidden',
      position: 'relative',
      zIndex: 8,
    },
    largeVideoContainer: {
      height: 'calc(100vh - 195px)',
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
      top: 0,
      right: 0,
      zIndex: 9,
      borderRadius: 10,
      width: 264,
      height: 198,
      overflow: 'hidden',
      backgroundColor: '#000',
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
      height: 198,
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
      width: 170,
      height: 170,
      position: 'absolute',
      // bottom: 125,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
      borderRadius: 10,
      overflow: 'hidden',
      top: 60,
      backgroundColor: '#000',
    },
    otPublisher: {
      '& >div': {
        '& >div': {
          position: 'absolute',
          top: 20,
          right: 38,
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
}
function getCookieValue() {
  const name = 'action=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
export const ChatVideo: React.FC<ConsultProps> = (props) => {
  const classes = useStyles();
  const [isCall, setIscall] = React.useState(true);
  const [mute, setMute] = React.useState(true);
  const [subscribeToVideo, setSubscribeToVideo] = React.useState(props.isVideoCall ? true : false);
  // const [subscribeToAudio, setSubscribeToAudio] = React.useState(props.isVideoCall ? false : true);
  // const [startTimerAppoinmentt, setstartTimerAppoinmentt] = React.useState<boolean>(false);
  const [docImg, setDocImg] = React.useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();

  const patientProfile = currentPatient && currentPatient.photoUrl;

  const { doctorDetails, videoCall } = props;

  return (
    <div className={classes.root}>
      <div
        className={`${classes.videoChatWindow} ${
          props.showVideoChat || !subscribeToVideo ? 'chatVideo' : ''
          }`}
      >
        {!props.showVideoChat && (
          <div className={classes.timerCls}>
            {doctorDetails && doctorDetails.getDoctorDetailsById && (
              <div className={classes.doctorName}>
                {`${
                  doctorDetails && doctorDetails.getDoctorDetailsById
                    ? doctorDetails.getDoctorDetailsById.displayName
                    : ''
                  }` +
                  "'s" +
                  ' team has joined'}
              </div>
            )}
            {/* {!props.showVideoChat && (
              <span>
                {`Time start ${props.timerMinuts.toString().length < 2 ? '0' + props.timerMinuts : props.timerMinuts} : 
             ${props.timerSeconds.toString().length < 2 ? '0' + props.timerSeconds : props.timerSeconds}`}
              </span>
            )} */}
          </div>
        )}

        {isCall && (
          <OTSession
            apiKey={process.env.OPENTOK_KEY}
            sessionId={props.sessionId}
            token={props.token}
            eventHandlers={{
              connectionDestroyed: (event: any) => {
                props.stopConsultCall();
                setIscall(false);
              },
            }}
          >
            <div
              className={`${classes.minimizeImg}
            ${props.showVideoChat || !subscribeToVideo ? classes.hidePublisherVideo : ''}`}
            >
              <div>
                <OTPublisher
                  resolution={'352x288'}
                  properties={{
                    publishAudio: mute,
                    publishVideo: subscribeToVideo,
                  }}
                />
              </div>
            </div>
            <div
              className={props.showVideoChat ? classes.hideVideoContainer : classes.videoContainer}
            >
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
                  properties={{
                    width: '100%',
                    height: 'calc(100vh - 195px)',
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
                      {isCall && mute && (
                        <Button onClick={() => setMute(!mute)}>
                          <img src={require('images/ic_mute.svg')} alt="mute" />
                        </Button>
                      )}
                      {isCall && !mute && (
                        <Button onClick={() => setMute(!mute)}>
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
          </OTSession>
        )}
      </div>
    </div>
  );
};
