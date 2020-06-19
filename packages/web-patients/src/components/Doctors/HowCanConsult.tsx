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
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 14,
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
      textTransform: 'none',
      padding: 9,
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      border: '1px solid #f7f8f5',
      minWidth: 135,
      textAlign: 'left',
      marginRight: 12,
      '&:hover': {
        backgroundColor: '#f7f8f5',
      },
      '&:last-child': {
        marginLeft: 'auto',
        marginRight: 0,
      },
      '& span': {
        display: 'block',
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
    bottomActions: {
      paddingTop: 20,
      fontSize: 12,
      lineHeight: '16px',
      color: '#01475b',
      textAlign: 'center',
      '& button': {
        minWidth: 200,
      },
    },
    price: {
      fontSize: 16,
      fontWeight: 600,
      paddingTop: 8,
      lineHeight: '18px',
    },
    availablity: {
      backgroundColor: 'rgba(0,135,186, 0.11)',
      color: '#0087ba',
      textTransform: 'uppercase',
      borderRadius: 10,
      padding: '6px 8px',
      fontSize: 9,
      marginTop: 16,
    },
    availableNow: {
      backgroundColor: '#ff748e',
      color: '#fff',
    },
  });
});

export const HowCanConsult: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <h3>How can I consult with Dr. Simran:</h3>
      <div className={classes.tabButtons}>
        <AphButton className={`${classes.button} ${classes.btnActive}`}>
          <span>Meet in Person</span>
          <span className={classes.price}>Rs. 999</span>
          <span className={classes.availablity}>Available in 50 mins</span>
        </AphButton>
        <AphButton className={`${classes.button}`}>
          <span>Chat/Audio/Video</span>
          <span className={classes.price}>Rs. 599</span>
          <span className={`${classes.availablity} ${classes.availableNow}`}>Available in 15 mins</span>
        </AphButton>
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
              <span><img src={require('images/ic_hospital.svg')} alt="" /></span>
              <span>Visit the doctor at Hospital/Clinic</span>
            </li>
            <li>
              <span><img src={require('images/ic_prescription-sm.svg')} alt="" /></span>
              <span>Receive prescriptions instantly </span>
            </li>
          </ul>
        </div>
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
      <div className={classes.bottomActions}>
        <AphButton color="primary">Book Appointment</AphButton>
        <p>Please note that after booking, you will need to download the Apollo 247 app to continue with your consultation.</p>
      </div>
    </div>
  );
};

