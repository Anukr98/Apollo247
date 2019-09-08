import { Theme, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { AphTextField, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      marginBottom: 10,
    },
    windowbody: {
      padding: 15,
    },
    customScroll: {
      padding: 15,
    },
    chatWrap: {
      textAlign: 'right',
    },
    doctorWindow: {
      backgroundColor: '#f7f7f7',
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      borderRadius: 10,
      padding: '9px 16px',
      color: '#02475b',
      fontSize: 15,
      lineHeight: 1.47,
      letterSpacing: 'normal',
      opacity: 0.8,
      display: 'inline-block',
      marginBottom: 8,
      maxWidth: 236,
    },
    patientWindow: {
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      borderRadius: 10,
      padding: '12px 16px',
      color: '#02475b',
      fontSize: 15,
      lineHeight: 1.47,
      letterSpacing: 'normal',
      display: 'inline-block',
      marginBottom: 8,
      maxWidth: 258,
      textAlign: 'left',
      position: 'relative',
    },
    patientImg: {
      position: 'absolute',
      left: -40,
      bottom: 0,
      width: 32,
      height: 32,
    },
    patientChatWrap: {
      marginTop: 20,
    },
    chatWindowFooter: {
      boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.15)',
      padding: '10px 16px 20px 16px',
      position: 'relative',
    },
    attachBtn: {
      position: 'absolute',
      right: 16,
      top: 14,
      border: 'none',
      boxShadow: 'none',
      padding: 0,
      minWidth: 'auto',
    },
  };
});

export const ChatWindow: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.windowbody}>
        <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 534px' }}>
          <div className={classes.customScroll}>
            <div className={classes.chatWrap}>
              <div className={classes.doctorWindow}>That’s fine.</div>
            </div>
            <div className={classes.chatWrap}>
              <div className={classes.doctorWindow}>Have you been sleeping well?</div>
            </div>
            <div className={`${classes.chatWrap} ${classes.patientChatWrap}`}>
              <div className={classes.patientWindow}>
                Not really. I’ve been feeling very nauseous and uncomfortable.
                <Avatar
                  src={require('images/patient_01.png')}
                  alt=""
                  className={classes.patientImg}
                />
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.chatWindowFooter}>
        <AphTextField placeholder="Type message…" />
        <AphButton className={classes.attachBtn}>
          <img src={require('images/ic_round-attach.svg')} alt="" />
        </AphButton>
      </div>
    </div>
  );
};
