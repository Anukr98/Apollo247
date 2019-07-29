import React from 'react';
import {
  Theme
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '30px 0 50px 0',
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 10,
      },
    },
    muteBtn: {
      zIndex: 9999,
      marginTop: 50,
    },
    helpWrap: {
      paddingBottom: 0,
    },
    OTPublisherContainer: {
      width: '500px !important',
      height: '500px !important',
    },
  };
});

export const Consult: React.FC = (props) => {
  const classes = useStyles();
  const [isCall, setIscall] = React.useState(false);
  const [mute, setMute] = React.useState(true);
  const [publishVideo, setPublishVideo] = React.useState(true);
  return (
    <div>
      {!isCall && <button className={classes.muteBtn} onClick={() => setIscall(true)}>VideoCall</button>}
      {(isCall && mute) && <button className={classes.muteBtn} onClick={() => setMute(!mute)}> Mute</button>}
      {(isCall && !mute) && <button className={classes.muteBtn} onClick={() => setMute(!mute)}> Unmute</button>}
      {(isCall && publishVideo) && <button className={classes.muteBtn} onClick={() => setPublishVideo(!publishVideo)}> Video On</button>}
      {(isCall && !publishVideo) && <button className={classes.muteBtn} onClick={() => setPublishVideo(!publishVideo)}> Video Off</button>}
      {isCall && <button className={classes.muteBtn} onClick={() => setIscall(false)}>StopCall</button>}

      {
        isCall && <OTSession 
        apiKey="46346642" 
        sessionId="1_MX40NjM0NjY0Mn5-MTU2NDI5MDk1MjA2Nn5UV2E1Mmw3V0ovWTdhTVR6akltYWtlWVl-UH4" 
        token="T1==cGFydG5lcl9pZD00NjM0NjY0MiZzaWc9YzRhYTk1YmU1ODJiYzMzMmZlMGExM2IxNjZmOTJmMDVkYzQ5OGYxOTpzZXNzaW9uX2lkPTFfTVg0ME5qTTBOalkwTW41LU1UVTJOREk1TURrMU1qQTJObjVVVjJFMU1tdzNWMG92V1RkaFRWUjZha2x0WVd0bFdWbC1VSDQmY3JlYXRlX3RpbWU9MTU2NDI5MjAzNyZub25jZT0wLjE2NTYxNTI3NzMyOTg4NjQ2JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1NjY4ODQwMzcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0="
        eventHandlers={{
          streamCreated: (event: any) => {
            console.log('Publisher stream created!' );
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
            console.log('connectionCreated!', event);
          },
          connectionDestroyed: (event: any) => {
            console.log('connectionDestroyed!', event);
          },
        }} >
        <OTPublisher
          properties={{publishAudio: mute, publishVideo: publishVideo}}  
          eventHandlers={{
            streamCreated: (event: any) => {
              console.log('Publisher stream created111!' );
            },
            streamDestroyed: (event: any) => {
              console.log('Publisher stream destroyed1111!');
            }
          }} />
        <OTStreams  style={{width: "100%", height: "100%"}}>
          <OTSubscriber/>
        </OTStreams>
      </OTSession>
      }
      
    </div>
  );
};
