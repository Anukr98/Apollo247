import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState } from 'react';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';

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
      minHeight: 290,
      padding: 20,
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
      boxShadow: 'none',
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
  };
});

interface CallPopoverProps {
  setStartConsultAction(isVideo: boolean): void;
}
let intervalId: any;
let stoppedTimer: number;
let cda: any;
//let timerId: any;

export const CallPopover: React.FC<CallPopoverProps> = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;

  //logic for before start counsult timer start
  const dt1 = new Date('2019-08-09T10:14'); //today time
  const dt2 = new Date('2019-08-10T19:30'); // apointment time
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
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  //logic for before start counsult timer
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
