import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState, useEffect } from 'react';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';
import Pubnub from 'pubnub';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '30px 0 50px 0',
      '& p': {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1.28,
        color: '#02475b',
        marginTop: 10,
        marginBottom: 10,
      },
    },
    helpWrap: {
      paddingBottom: 0,
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      padding: '35px 20px',
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
    consultButton: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#fc9916',
      marginLeft: 20,
      minWidth: 168,
      marginRight: 10,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
      '& svg': {
        marginRight: 5,
      },
    },
    endconsultButton: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#890000',
      marginLeft: 20,
      minWidth: 168,
      marginRight: 10,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#890000',
      },
      '& svg': {
        marginRight: 5,
      },
    },
    timeLeft: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.6)',
      textTransform: 'capitalize',
      position: 'relative',
      top: -1,
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
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    loginForm: {
      width: 280,
      minHeight: 282,
      padding: '10px 20px 20px 20px',
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    consultButtonContainer: {
      position: 'absolute',
      right: 0,
    },
    cross: {
      position: 'absolute',
      right: 0,
      top: '10px',
      fontSize: '18px',
      color: '#02475b',
    },
    needHelp: {
      padding: '8px',
      width: '100%',
      marginTop: 15,
      borderRadius: '5px',
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.3)',
      fontWeight: 'bold',
      backgroundColor: '#fc9916',
      '& img': {
        marginRight: 10,
      },
    },
    consultIcon: {
      padding: 6,
      backgroundColor: 'transparent',
      margin: '0 5px',
      minWidth: 20,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    backButton: {
      minWidth: 120,
      fontSize: 13,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(0, 1, 0, 1),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
  };
});

interface CallPopoverProps {
  setStartConsultAction(isVideo: boolean): void;
  appointmentId: string;
  appointmentDateTime: string;
}
let intervalId: any;
let stoppedTimer: number;
let cda: any;

export const CallPopover: React.FC<CallPopoverProps> = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  //logic for before start counsult timer start
  //console.log(new Date().toISOString().substring(0, 16), props.appointmentDateTime);
  const dt1 = new Date(new Date().toISOString().substring(0, 16)); //today time
  const dt2 = new Date(props.appointmentDateTime); // apointment time
  const diff = dt2.getHours() - dt1.getHours();
  const diff2 = dt2.getMinutes() - dt1.getMinutes();
  const val = '0';
  cda = diff
    .toString()
    .concat(':')
    .concat(diff2.toString().length > 1 ? diff2.toString() : val.concat(diff2.toString()));
  //logic for before start counsult timer end

  const startInterval = (timer: number) => {
    intervalId = setInterval(() => {
      timer = timer - 1;
      stoppedTimer = timer;
      setRemainingTime(timer);
      if (timer == 0) {
        setRemainingTime(0);
        clearInterval(intervalId);
      }
    }, 1000);
  };
  const stopInterval = () => {
    const stopTimer = 900 - stoppedTimer;
    setRemainingTime(stopTimer);
    intervalId && clearInterval(intervalId);
  };
  function handleClick(event: any) {
    if (startAppointment) {
      setAnchorEl(event.currentTarget);
    }
  }
  function handleClose() {
    setAnchorEl(null);
  }
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const startConsult = '^^#startconsult';
  const stopConsult = '^^#stopconsult';
  const channel = 'Channel7';
  const config: Pubnub.PubnubConfig = {
    subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
    publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
    ssl: true,
  };
  const pubnub = new Pubnub(config);
  useEffect(() => {
    pubnub.subscribe({
      channels: [channel],
      withPresence: true,
    });
    pubnub.addListener({
      status: (statusEvent) => {},
      message: (message) => {
        if (message.message.isTyping) {
          if (message.message.message === '^^#callAccepted') {
            console.log(1);
          }

          // if (message.message.message === audioCallMsg) {
          //   console.log(1);
          // } else if (message.message.message === videoCallMsg) {
          //   console.log(2);
          // } else if (message.message.message === startConsult) {
          //   console.log(3);
          // } else if (message.message.message === stopConsult) {
          //   console.log(4);
          // }
        }
      },
      // presence: (presenceEvent) => {
      //   console.log('presenceEvent', presenceEvent);
      // },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  });
  const onStartConsult = () => {
    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: startConsult,
        },
        channel: channel,
        storeInHistory: false,
      },
      (status, response) => {
        console.log(response, status);
        setStartAppointment(!startAppointment);
        startInterval(900);
      }
    );
  };
  const onStopConsult = () => {
    console.log('onStopConsult');
    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: stopConsult,
        },
        channel: channel,
        storeInHistory: false,
      },
      (status, response) => {
        setStartAppointment(!startAppointment);
        stopInterval();
      }
    );
  };
  return (
    <div className={classes.breadcrumbs}>
      <div>
        <Link to="/calendar">
          <div className={classes.backArrow}>
            <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div>
        </Link>
      </div>
      CONSULT ROOM &nbsp; | &nbsp;
      {startAppointment ? (
        <span className={classes.timeLeft}>
          Time Left <b>{`${minutes}:${seconds}`}</b>
        </span>
      ) : (
        <span className={classes.timeLeft}>
          Time to Consult <b>{cda}</b>
        </span>
      )}
      <div className={classes.consultButtonContainer}>
        <span>
          {startAppointment ? (
            <span>
              <Button
                className={classes.backButton}
                onClick={() => {
                  !startAppointment ? onStartConsult() : onStopConsult();
                  //setStartAppointment(!startAppointment);
                }}
              >
                Save
              </Button>
              <Button
                className={classes.endconsultButton}
                onClick={() => {
                  setStartAppointment(!startAppointment);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <g fill="none" fillRule="evenodd">
                    <path d="M0 0h24v24H0z" />
                    <path
                      fill="#ffffff"
                      fillRule="nonzero"
                      d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
                    />
                  </g>
                </svg>
                End Consult
              </Button>
            </span>
          ) : (
            <Button
              className={classes.consultButton}
              onClick={() => {
                !startAppointment ? startInterval(900) : stopInterval();
                setStartAppointment(!startAppointment);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#fff" d="M8 5v14l11-7z" />
              </svg>
              {startAppointment ? 'End Consult' : 'Start Consult'}
            </Button>
          )}
          <Button
            className={classes.consultIcon}
            aria-describedby={id}
            variant="contained"
            onClick={(e) => handleClick(e)}
          >
            <img src={require('images/ic_call.svg')} />
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Paper className={classes.loginForm}>
              <Button className={classes.cross}>
                <img src={require('images/ic_cross.svg')} alt="" onClick={() => handleClose()} />
              </Button>
              <div className={`${classes.loginFormWrap} ${classes.helpWrap}`}>
                <p>How do you want to talk to the patient?</p>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.needHelp}
                  onClick={() => {
                    handleClose();
                    props.setStartConsultAction(false);
                  }}
                >
                  <img src={require('images/call_popup.svg')} alt="" />
                  AUDIO CALL
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.needHelp}
                  onClick={() => {
                    handleClose();
                    props.setStartConsultAction(true);
                  }}
                >
                  <img src={require('images/video_popup.svg')} alt="" />
                  VIDEO CALL
                </Button>
              </div>
            </Paper>
          </Popover>
          <Button className={classes.consultIcon}>
            <img src={require('images/ic_more.svg')} />
          </Button>
        </span>
      </div>
    </div>
  );
};
