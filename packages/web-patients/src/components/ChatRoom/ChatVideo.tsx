import React from 'react';
import { Theme, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';

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
      right: 17,
      top: 0,
      width: 204,
      height: 154,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
    },
    videoChatWindow: {
      paddingRight: 17,
    },
    videoPoster: {
      '& img': {
        maxWidth: '100%',
      },
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
    callActions: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 10,
      display: 'flex',
      alignItems: 'center',
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
  };
});
interface ConsultProps {
  toggelChatVideo: () => void;
  showVideoChat: boolean;
  isVideoCall: boolean;
}
export const ChatVideo: React.FC<ConsultProps> = (props) => {
  const classes = useStyles();
  const [isCall, setIscall] = React.useState(true);
  const [mute, setMute] = React.useState(true);
  //const [publishVideo, setPublishVideo] = React.useState(true);
  const [subscribeToVideo, setSubscribeToVideo] = React.useState(props.isVideoCall ? true : false);
  const [subscribeToAudio] = React.useState(props.isVideoCall ? false : true);
  return (
    <div className={classes.root}>
      <div
        className={`${classes.videoChatWindow} ${
          props.showVideoChat || !subscribeToVideo ? 'chatVideo' : ''
        }`}
      >
        {isCall && (
          <OTSession
            apiKey="46393582"
            sessionId="1_MX40NjM5MzU4Mn5-MTU2NTA3MTUwNDk4MX56bVd3ZW96MFNuS2Vua2dDMnZ5VTZNNlJ-UH4"
            token="T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9Y2UxMDhkODEzNTU3MmE4M2ExZTZkNmVlYjVkZDE0ODA3NGZhM2QyZTpzZXNzaW9uX2lkPTFfTVg0ME5qTTVNelU0TW41LU1UVTJOVEEzTVRVd05EazRNWDU2YlZkM1pXOTZNRk51UzJWdWEyZERNblo1VlRaTk5sSi1VSDQmY3JlYXRlX3RpbWU9MTU2NTA3MTYxMCZub25jZT0wLjExNjA5MzQ3Njk5NjI3MzM3JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1Njc2NjM2MDcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0="
          >
            <OTPublisher
              properties={{
                publishAudio: mute,
                publishVideo: subscribeToVideo,
                subscribeToVideo: subscribeToVideo,
                subscribeToAudio: subscribeToAudio,
              }}
            />

            <div
              className={`${classes.videoContainer} ${
                props.showVideoChat ? classes.smallVideoContainer : classes.largeVideoContainer
              }`}
            >
              {!subscribeToVideo && !props.showVideoChat && (
                <div className={classes.videoPoster}>
                  <img src={require('images/patient_01.png')} />
                </div>
              )}
              <OTStreams>
                <OTSubscriber
                  properties={{
                    subscribeToVideo: subscribeToVideo,
                    subscribeToAudio: subscribeToAudio,
                  }}
                />
              </OTStreams>
              {props.showVideoChat && (
                <div>
                  {!subscribeToVideo && (
                    <div className={classes.videoPoster}>
                      <img src={require('images/ic_patientchat.png')} />
                    </div>
                  )}
                  <div className={classes.callActions}>
                    <Button onClick={() => props.toggelChatVideo()}>
                      <img src={require('images/ic_expand_circle.svg')} />
                    </Button>
                    <Button className={classes.stopCallBtn} onClick={() => setIscall(false)}>
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
                          <img src={require('images/ic_chat_circle.svg')} alt="chat" />
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
                      {isCall && subscribeToVideo && (
                        <Button onClick={() => setSubscribeToVideo(!subscribeToVideo)}>
                          <img src={require('images/ic_videoon.svg')} alt="video on" />
                        </Button>
                      )}
                      {isCall && !subscribeToVideo && (
                        <Button onClick={() => setSubscribeToVideo(!subscribeToVideo)}>
                          <img src={require('images/ic_videooff.svg')} alt="video off" />
                        </Button>
                      )}
                    </Grid>
                    <Grid item xs={4} className={classes.rightActions}>
                      {isCall && (
                        <Button
                          onClick={() => {
                            props.toggelChatVideo();
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
