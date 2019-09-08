import { Theme, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    title: {
      fontSize: 10,
      fontWeight: 600,
      lineHeight: 1.8,
      color: '#0087ba',
      paddingBottom: 5,
    },
    cardGroup: {
      backgroundColor: theme.palette.common.white,
      border: 'solid 1px #0087ba',
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: 12,
      display: 'flex',
      cursor: 'pointer',
      marginBottom: 20,
      position: 'relative',
    },
    cardImg: {
      paddingRight: 12,
    },
    cardContent: {
      width: 'calc(100% - 74px)',
    },
    avatar: {
      width: 44,
      height: 44,
    },
    nameGroup: {
      display: 'flex',
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
    },
    name: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
    },
    consultType: {
      marginLeft: 'auto',
      cursor: 'pointer',
    },
    userId: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      paddingTop: 5,
      opacity: 0.6,
    },
    upnextTitle: {
      color: '#ff748e',
    },
    upNextCardGroup: {
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
    },
    queueText: {
      position: 'absolute',
      left: -1,
      top: 10,
      backgroundColor: '#ff748e',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: '0px 10px 10px 0px',
      letterSpacing: 'normal',
      zIndex: 1,
    },
    queueCount: {
      position: 'absolute',
      right: -11,
      top: '50%',
      width: 22,
      height: 22,
      color: theme.palette.common.white,
      backgroundColor: '#ff748e',
      borderRadius: '50%',
      textAlign: 'center',
      fontWeight: 'bold',
      lineHeight: '22px',
      fontSize: 14,
      marginTop: -11,
    },
  };
});

export const PatientCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.title}>APPT DATE: 22/08/2019, 10 AM</div>
      <div className={classes.cardGroup}>
        <div className={classes.cardImg}>
          <Avatar src={require('images/patient_01.png')} alt="" className={classes.avatar} />
        </div>
        <div className={classes.cardContent}>
          <div className={classes.nameGroup}>
            <div className={classes.name}>Rahul Mehta</div>
            <div className={classes.consultType}>
              <img src={require('images/ic_round-video.svg')} alt="" />
            </div>
          </div>
          <div className={classes.userId}>UHID: 98765</div>
        </div>
      </div>
      <div className={`${classes.title} ${classes.upnextTitle}`}>APPT DATE: 22/08/2019, 10 AM</div>
      <div className={`${classes.cardGroup} ${classes.upNextCardGroup}`}>
        <div className={classes.queueText}>Queued</div>
        <div className={classes.cardImg}>
          <Avatar src={require('images/patient_01.png')} alt="" className={classes.avatar} />
        </div>
        <div className={classes.cardContent}>
          <div className={classes.nameGroup}>
            <div className={classes.name}>Seema Singh</div>
            <div className={classes.consultType}>
              <img src={require('images/ic_round-video.svg')} alt="" />
            </div>
          </div>
          <div className={classes.userId}>UHID: 98765</div>
        </div>
        <div className={classes.queueCount}>2</div>
      </div>
    </div>
  );
};
