import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      padding: 20,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '23px',
      marginTop: 20,
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 16,
        fontWeight: 600,
        paddingBottom: 20,
      },
      '& ul': {
        paddingLeft: 20,
      },
    },
    tabButtons: {
      display: 'flex',
    },
    button: {
      fontSize: 12,
      fontWeight: 600,
      textTranform: 'none',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      border: '1px solid #f7f8f5',
      minWidth: 135,
      '&:hover': {
        backgroundColor: '#f7f8f5',
      },
      '&:last-child': {
        marginLeft: 'auto',
      },
    },
    btnActive: {
      border: '1px solid #00b38e',
      '&:before': {
        top: '100%',
        left: '50%',
        border: 'solid transparent',
        content: '""',
        height: 0,
        width: 0,
        position: 'absolute',
        pointerEvents: 'none',
        borderColor: 'rgba(0, 179, 142, 0)',
        borderTopColor: '#00b38e',
        borderWidth: 11,
        marginLeft: -11,
      },
      '&:after': {
        top: '100%',
        left: '50%',
        border: 'solid transparent',
        content: '""',
        height: 0,
        width: 0,
        position: 'absolute',
        pointerEvents: 'none',
        borderColor: 'rgba(247, 248, 142, 0)',
        borderTopColor: '#f7f8f5',
        borderWidth: 10,
        marginLeft: -10,
      },    
    },
    consultGroup: {
    },
    groupHead: {
      display: 'flex',
      alignItems: 'center',
      padding: 16,
      paddingTop: 25,
      paddingBottom: 20,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      '& img': {
        verticalAlign: 'middle',
        marginRight: 16,
      },
      '& h4': {
        margin: 0,
        fontSize: 14,
        color: '#0589bb',
        fontWeight: 500,
        textTransform: 'uppercase',
      }
    },
    groupContent: {
      paddingTop: 20,
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          display: 'flex',
          fontSize: 12,
          lineHeight: '18px',
          color: 'rgba(1, 71, 91, 0.6)',
          paddingBottom: 10,
          '& span': {
            '&:first-child': {
              paddingRight: 12,
            },
          },
          '& img': {
            verticalAlign: 'top',
          },
        },
      },
    },
    blueText: {
      color: '#0589bb !important',
    },
    appDownloadGroup: {
      marginTop: 10,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 16,
      '& h4': {
        fontSize: 14,
        fontWeight: 500,
        color: '#0589bb',
        margin: 0,
      },
      '& p': {
        fontSize: 12,
        lineHeight: '18px',
        opacity: 0.6,
        marginTop: 0,
      },
    },
    appDownload: {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        maxWidth: 77,
      },
      '& button': {
        flex: 1,
        color: '#fc9916',
        marginLeft: 16,
        backgroundColor: '#fff',
      },
    },
  });
});

export const HowItWorks: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <h3>How it works</h3>
      <div className={classes.tabButtons}>
        <AphButton className={`${classes.button} ${classes.btnActive}`}>Chat/Audio/Video</AphButton>
        <AphButton className={`${classes.button}`}>Meet in Person</AphButton>
      </div>
      <div className={classes.consultGroup}>
        <div className={classes.groupHead}>
          <span>
            <img src={require('images/video-calling.svg')} alt="" />
          </span>
          <h4>How to consult via chat/audio/video?</h4>
        </div>
        <div className={classes.groupContent}>
          <ul>
            <li>
              <span><img src={require('images/ic_doctor_small.svg')} alt="" /></span>
              <span>Choose the doctor</span>
            </li>
            <li>
              <span><img src={require('images/ic_book-slot.svg')} alt="" /></span>
              <span>Book a slot</span>
            </li>
            <li>
              <span><img src={require('images/ic-payment.svg')} alt="" /></span>
              <span>Make payment</span>
            </li>
            <li className={classes.blueText}>
              <span><img src={require('images/ic_video-blue.svg')} alt="" /></span>
              <span>Speak to the doctor via video/audio/chat</span>
            </li>
            <li>
              <span><img src={require('images/ic_prescription-sm.svg')} alt="" /></span>
              <span>Receive prescriptions instantly</span>
            </li>
            <li className={classes.blueText}>
              <span><img src={require('images/ic_chat.svg')} alt="" /></span>
              <span>Chat with the doctor for 6 days after your consult</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={classes.consultGroup}>
        <div className={classes.groupHead}>
          <span>
            <img src={require('images/ic-specialist.svg')} alt="" />
          </span>
          <h4>How to consult in person</h4>
        </div>
        <div className={classes.groupContent}>
          <ul>
            <li>
              <span><img src={require('images/ic_doctor_small.svg')} alt="" /></span>
              <span>Choose the doctor</span>
            </li>
            <li>
              <span><img src={require('images/ic_book-slot.svg')} alt="" /></span>
              <span>Book a slot</span>
            </li>
            <li>
              <span><img src={require('images/ic-payment.svg')} alt="" /></span>
              <span>Make payment</span>
            </li>
            <li className={classes.blueText}>
              <span><img src={require('images/ic_video-blue.svg')} alt="" /></span>
              <span>Visit the doctor at Hospital/Clinic</span>
            </li>
            <li>
              <span><img src={require('images/ic_prescription-sm.svg')} alt="" /></span>
              <span>Receive prescriptions instantly </span>
            </li>
          </ul>
        </div>
      </div>
      <div className={classes.appDownloadGroup}>
        <h4>Consultancy works only on our mobile app</h4>
        <p>To enjoy enhanced consultation experience download our mobile app</p>
        <div className={classes.appDownload}>
          <span><img src={require('images/apollo-logo.jpg')} alt="" /></span>
          <AphButton>Download the App</AphButton>
        </div>
      </div>
    </div>
  );
};

