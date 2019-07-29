import {
  Theme,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
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

  return (
    <div>
      <OTSession apiKey="46346642" sessionId="1_MX40NjM0NjY0Mn5-MTU2NDI5MDk1MjA2Nn5UV2E1Mmw3V0ovWTdhTVR6akltYWtlWVl-UH4" token="T1==cGFydG5lcl9pZD00NjM0NjY0MiZzaWc9YzRhYTk1YmU1ODJiYzMzMmZlMGExM2IxNjZmOTJmMDVkYzQ5OGYxOTpzZXNzaW9uX2lkPTFfTVg0ME5qTTBOalkwTW41LU1UVTJOREk1TURrMU1qQTJObjVVVjJFMU1tdzNWMG92V1RkaFRWUjZha2x0WVd0bFdWbC1VSDQmY3JlYXRlX3RpbWU9MTU2NDI5MjAzNyZub25jZT0wLjE2NTYxNTI3NzMyOTg4NjQ2JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1NjY4ODQwMzcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0=">
        <OTPublisher  
          properties={{ resolution: '640x480',
        frameRate: 30}} style={{width: "100%", height: "100%"}}/>
        <OTStreams  style={{width: "100%", height: "100%"}}>
          <OTSubscriber />
        </OTStreams>
      </OTSession>
    </div>
  );
};
