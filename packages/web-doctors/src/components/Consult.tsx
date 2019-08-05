import React from 'react';
import { Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { Header } from 'components/Header';
import { makeStyles } from '@material-ui/styles';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consult: {
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
    container: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      minHeight: 700,
    },
    muteBtn: {
      zIndex: 9999,
      marginTop: 0,
    },
    helpWrap: {
      paddingBottom: 0,
    },
    OTPublisherContainer: {},
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 36,
      paddingBottom: 11,
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
    videoButtonContainer: {
      borderTop: '1px solid #02475b',
      paddingTop: 20,
      margin: '0 20px 0 20px',
      '& button': {
        backgroundColor: 'transparent',
        border: 'none',
        '&:focus': {
          outline: 'none',
        },
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    stopCall: {
      position: 'absolute',
      right: 10,
    },
    videoContainer: {
      minHeight: 700,
      backgroundColor: '#000',
      borderRadius: 10,
      margin: 20,
      overflow: 'hidden',
    },
    VideoAlignment: {
      textAlign: 'center',
    },
  };
});
interface ConsultProps {
  toggelChatVideo: () => void;
}
export const Consult: React.FC<ConsultProps> = (props) => {
  const classes = useStyles();
  const [isCall, setIscall] = React.useState(true);
  const [mute, setMute] = React.useState(true);
  const [publishVideo, setPublishVideo] = React.useState(true);
  return (
    <div className={classes.consult}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        {/* <div className={classes.breadcrumbs}>
          <div>
            <div className={classes.backArrow}>
              <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
              <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
            </div>
          </div>
          CONSULT ROOM <span className={classes.timeLeft}> &nbsp; | &nbsp; Time Left 08:25</span>
        </div> */}
        <div>
          {isCall && (
            <OTSession
              apiKey="46346642"
              sessionId="1_MX40NjM0NjY0Mn5-MTU2NDI5MDk1MjA2Nn5UV2E1Mmw3V0ovWTdhTVR6akltYWtlWVl-UH4"
              token="T1==cGFydG5lcl9pZD00NjM0NjY0MiZzaWc9YzRhYTk1YmU1ODJiYzMzMmZlMGExM2IxNjZmOTJmMDVkYzQ5OGYxOTpzZXNzaW9uX2lkPTFfTVg0ME5qTTBOalkwTW41LU1UVTJOREk1TURrMU1qQTJObjVVVjJFMU1tdzNWMG92V1RkaFRWUjZha2x0WVd0bFdWbC1VSDQmY3JlYXRlX3RpbWU9MTU2NDI5MjAzNyZub25jZT0wLjE2NTYxNTI3NzMyOTg4NjQ2JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1NjY4ODQwMzcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0="
              eventHandlers={{
                streamCreated: (event: any) => {
                  console.log('Publisher stream created!');
                },
                streamDestroyed: (event: any) => {
                  console.log('Publisher stream destroyed!');
                },
                sessionConnected: (event: any) => {
                  console.log('sessionConnected!', event);
                },
                sessionDisconnected: (event: any) => {
                  console.log('sessionConnected!', event);
                },
                connectionCreated: (event: any) => {
                  console.log('session connectionCreated!', event);
                },
                connectionDestroyed: (event: any) => {
                  //setIscall(false);
                },
              }}
            >
              <OTPublisher
                properties={{ publishAudio: mute, publishVideo: publishVideo }}
                eventHandlers={{
                  streamCreated: (event: any) => {
                    console.log('Publisher stream created111!');
                  },
                  streamDestroyed: (event: any) => {
                    console.log('Publisher stream destroyed1111!');
                  },
                }}
              />
              <div className={classes.videoContainer}>
                <OTStreams>
                  <OTSubscriber
                    eventHandlers={{
                      error: (error: any) => {
                        console.log(`There was an error with the subscriber: ${error}`);
                      },
                      connected: (event: any) => {
                        console.log('Subscribe stream connected222222!', event);
                        //setJoined(true);
                      },
                      disconnected: (event: any) => {
                        console.log('Subscribe stream disconnected222222222!', event);
                      },
                    }}
                  />
                </OTStreams>
              </div>
            </OTSession>
          )}
        </div>
        <div className={classes.videoButtonContainer}>
          <Grid container alignItems="flex-start" spacing={0}>
            <Grid item lg={1} sm={2} xs={2}>
              {isCall && (
                <button className={classes.muteBtn} onClick={() => props.toggelChatVideo()}>
                  <img
                    className={classes.whiteArrow}
                    src={require('images/ic_message.svg')}
                    alt="msgicon"
                  />
                </button>
              )}
            </Grid>
            <Grid item lg={10} sm={8} xs={8} className={classes.VideoAlignment}>
              {!isCall && (
                <button className={classes.muteBtn} onClick={() => setIscall(true)}>
                  Join Call
                </button>
              )}
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
              {isCall && publishVideo && (
                <button className={classes.muteBtn} onClick={() => setPublishVideo(!publishVideo)}>
                  <img
                    className={classes.whiteArrow}
                    src={require('images/ic_videoon.svg')}
                    alt="videoon"
                  />
                </button>
              )}
              {isCall && !publishVideo && (
                <button className={classes.muteBtn} onClick={() => setPublishVideo(!publishVideo)}>
                  <img
                    className={classes.whiteArrow}
                    src={require('images/ic_videooff.svg')}
                    alt="videooff"
                  />
                </button>
              )}
            </Grid>
            <Grid item lg={1} sm={2} xs={2}>
              {isCall && (
                <button className={classes.stopCall} onClick={() => setIscall(false)}>
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
      </div>
    </div>
  );
};
