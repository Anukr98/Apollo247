import { Theme, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState } from 'react';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';

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
    loginForm: {
      width: 280,
      minHeight: 290,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
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
export const CallPopover: React.FC<CallPopoverProps> = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event: any) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <span>
      <Button className={classes.consultButton}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#fff" d="M8 5v14l11-7z" />
        </svg>
        Start Consult
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
  );
};
