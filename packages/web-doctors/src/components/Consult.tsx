import React from 'react';
import { Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';

const useStyles = makeStyles((theme: Theme) => {
  return {
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
      backgroundColor: '#000',
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
interface ConsultProps {
  toggelChatVideo: () => void;
  stopAudioVideoCall: () => void;
  showVideoChat: boolean;
  isVideoCall: boolean;
}
export const Consult: React.FC<ConsultProps> = (props) => {
  const classes = useStyles();
  const [isCall, setIscall] = React.useState(true);
  const [mute, setMute] = React.useState(true);
  //const [publishVideo, setPublishVideo] = React.useState(true);
  const [subscribeToVideo, setSubscribeToVideo] = React.useState(props.isVideoCall ? true : false);
  const [subscribeToAudio, setSubscribeToAudio] = React.useState(props.isVideoCall ? false : true);
  return (
    <div className={classes.consult}>
      <div>
        <div className={props.showVideoChat || !subscribeToVideo ? 'chatVideo' : ''}>
          {isCall && (
            <OTSession
              apiKey="46393582"
              sessionId="1_MX40NjM5MzU4Mn5-MTU2NTA3MTUwNDk4MX56bVd3ZW96MFNuS2Vua2dDMnZ5VTZNNlJ-UH4"
              token="T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9Y2UxMDhkODEzNTU3MmE4M2ExZTZkNmVlYjVkZDE0ODA3NGZhM2QyZTpzZXNzaW9uX2lkPTFfTVg0ME5qTTVNelU0TW41LU1UVTJOVEEzTVRVd05EazRNWDU2YlZkM1pXOTZNRk51UzJWdWEyZERNblo1VlRaTk5sSi1VSDQmY3JlYXRlX3RpbWU9MTU2NTA3MTYxMCZub25jZT0wLjExNjA5MzQ3Njk5NjI3MzM3JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1Njc2NjM2MDcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0="
            >
              <OTPublisher
                className={
                  props.showVideoChat || !subscribeToVideo ? classes.hidePublisherVideo : ''
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
                  props.showVideoChat ? classes.hideVideoContainer : classes.videoContainer
                }
              >
                {!subscribeToVideo && !props.showVideoChat && (
                  <img className={classes.minimizeImg} src={require('images/patient_01.png')} />
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

                {props.showVideoChat && (
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
                              src={require('images/ic_message.svg')}
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
                        {isCall && subscribeToVideo && (
                          <button
                            className={classes.muteBtn}
                            onClick={() => setSubscribeToVideo(!subscribeToVideo)}
                          >
                            <img
                              className={classes.whiteArrow}
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
          )}
        </div>
      </div>
    </div>
  );
};
