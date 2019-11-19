import React, { useEffect, useState } from "react";
import { Theme, Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/styles";
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from "opentok-react";

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingLeft: 20
    },
    videoContainer: {
      backgroundColor: "#000",
      borderRadius: 10,
      overflow: "hidden",
      position: "relative",
      zIndex: 8
    },
    largeVideoContainer: {
      height: "calc(100vh - 195px)"
    },
    smallVideoContainer: {
      position: "absolute",
      right: 38,
      top: 20,
      width: 204,
      height: 154,
      boxShadow: "0 5px 20px 0 rgba(0, 0, 0, 0.6)",
      zIndex: 10,
      backgroundColor: "rgba(0,0,0,0.2)"
    },
    videoChatWindow: {
      paddingRight: 17
    },
    videoPoster: {
      padding: 0
    },
    videoButtonContainer: {
      position: "absolute",
      zIndex: 9,
      bottom: 0,
      width: "100%",
      padding: 20,
      "& button": {
        backgroundColor: "transparent",
        border: 0,
        boxShadow: "none",
        padding: 0,
        minWidth: "auto",
        "&:focus": {
          backgroundColor: "transparent",
          border: 0,
          boxShadow: "none"
        },
        "&:hover": {
          backgroundColor: "transparent",
          border: 0,
          boxShadow: "none"
        },
        "& img": {
          verticalAlign: "middle",
          maxWidth: 48
        }
      }
    },
    middleActions: {
      textAlign: "center",
      "& button": {
        paddingLeft: 10,
        paddingRight: 10
      }
    },
    rightActions: {
      textAlign: "right"
    },
    callActions: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 10,
      display: "flex",
      alignItems: "center",
      zIndex: 9999,
      "& button": {
        padding: 0,
        boxShadow: "none",
        minWidth: "auto",
        backgroundColor: "transparent",
        "&:hover": {
          boxShadow: "none",
          backgroundColor: "transparent"
        },
        "&:focus": {
          boxShadow: "none",
          backgroundColor: "transparent"
        },
        "& img": {
          maxWidth: 40,
          verticalAlign: "middle"
        }
      }
    },
    stopCallBtn: {
      marginLeft: "auto"
    },
    otPublisher: {
      "& >div": {
        "& >div": {
          position: "absolute",
          top: 20,
          right: 38,
          zIndex: 9,
          borderRadius: 10
        }
      }
    },
    smallPoster: {
      "& img": {
        maxHeight: 154
      }
    },
    largePoster: {
      "& img": {
        maxHeight: "calc(100vh - 195px)"
      }
    }
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
}
export const ChatVideo: React.FC<ConsultProps> = props => {
  const classes = useStyles();
  const [isCall, setIscall] = React.useState(true);
  const [mute, setMute] = React.useState(true);
  const [subscribeToVideo, setSubscribeToVideo] = React.useState(
    props.isVideoCall ? true : false
  );
  // const [subscribeToAudio, setSubscribeToAudio] = React.useState(props.isVideoCall ? false : true);
  // const [startTimerAppoinmentt, setstartTimerAppoinmentt] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div
        className={`${classes.videoChatWindow} ${
          props.showVideoChat || !subscribeToVideo ? "chatVideo" : ""
        }`}
      >
        {/* {!props.showVideoChat && (
          <span>
            {`Time start ${props.timerMinuts.toString().length < 2 ? '0' + props.timerMinuts : props.timerMinuts} : 
             ${props.timerSeconds.toString().length < 2 ? '0' + props.timerSeconds : props.timerSeconds}`}
          </span>
        )} */}

        {isCall && (
          <OTSession
            apiKey={process.env.OPENTOK_KEY}
            sessionId={props.sessionId}
            token={props.token}
            eventHandlers={{
              connectionDestroyed: (event: any) => {
                props.stopConsultCall();
                setIscall(false);
              }
            }}
          >
            <div className={classes.otPublisher}>
              <OTPublisher
                properties={{
                  publishAudio: mute,
                  publishVideo: subscribeToVideo,
                  width: 204,
                  height: 154
                }}
              />
            </div>
            {/* {props.showVideoChat || !subscribeToVideo ? (
              ''
            ) : (
              <div className={classes.otPublisher}>
                <OTPublisher
                  properties={{
                    publishAudio: mute,
                    publishVideo: subscribeToVideo,
                    width: 204,
                    height: 154,
                  }}
                />
              </div>
            )} */}
            <div
              className={`${classes.videoContainer} ${
                props.showVideoChat
                  ? classes.smallVideoContainer
                  : classes.largeVideoContainer
              }`}
            >
              {!subscribeToVideo && !props.showVideoChat && (
                <div
                  className={`${classes.videoPoster} ${classes.largePoster}`}
                >
                  <img src={require("images/doctor_profile_image.png")} />
                </div>
              )}
              <OTStreams>
                <OTSubscriber
                  properties={{
                    width: "100%",
                    height: "calc(100vh - 195px)"
                  }}
                />
              </OTStreams>
              {props.showVideoChat && (
                <div>
                  {!subscribeToVideo && (
                    <div
                      className={`${classes.videoPoster} ${classes.smallPoster}`}
                    >
                      <img src={require("images/doctor_profile_image.png")} />
                    </div>
                  )}
                  <div className={classes.callActions}>
                    <Button onClick={() => props.toggelChatVideo()}>
                      <img src={require("images/ic_expand_circle.svg")} />
                    </Button>
                    <Button
                      className={classes.stopCallBtn}
                      onClick={() => {
                        setIscall(false);
                        props.stopAudioVideoCall();
                      }}
                    >
                      <img src={require("images/ic_endcall_small.svg")} />
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
                          {props.isNewMsg ? (
                            <img
                              src={require("images/ic_message.svg")}
                              alt="msgicon"
                            />
                          ) : (
                            <img
                              src={require("images/ic_chat_circle.svg")}
                              alt="msgicon"
                            />
                          )}
                        </Button>
                      )}
                    </Grid>
                    <Grid item xs={4} className={classes.middleActions}>
                      {isCall && mute && (
                        <Button onClick={() => setMute(!mute)}>
                          <img src={require("images/ic_mute.svg")} alt="mute" />
                        </Button>
                      )}
                      {isCall && !mute && (
                        <Button onClick={() => setMute(!mute)}>
                          <img
                            src={require("images/ic_unmute.svg")}
                            alt="unmute"
                          />
                        </Button>
                      )}
                      {isCall && subscribeToVideo && (
                        <Button
                          onClick={() => setSubscribeToVideo(!subscribeToVideo)}
                        >
                          <img
                            src={require("images/ic_videoon.svg")}
                            alt="video on"
                          />
                        </Button>
                      )}
                      {isCall && !subscribeToVideo && (
                        <Button
                          onClick={() => setSubscribeToVideo(!subscribeToVideo)}
                        >
                          <img
                            src={require("images/ic_videooff.svg")}
                            alt="video off"
                          />
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
                          <img
                            src={require("images/ic_endcall_big.svg")}
                            alt="end call"
                          />
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
