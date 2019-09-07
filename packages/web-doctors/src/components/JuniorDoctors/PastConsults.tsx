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
      backgroundColor: '#f7f7f7',
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
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
  };
});

export const PastConsults: React.FC = (props) => {
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
            <div className={classes.name}>Sujata Mishra</div>
            <div className={classes.consultType}>
              <img src={require('images/ic_round-clinic.svg')} alt="" />
            </div>
          </div>
          <div className={classes.userId}>UHID: 98765</div>
        </div>
      </div>
      <div className={`${classes.title}`}>APPT DATE: 22/08/2019, 10 AM</div>
      <div className={`${classes.cardGroup}`}>
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
      </div>
      <div className={`${classes.title}`}>APPT DATE: 22/08/2019, 10 AM</div>
      <div className={`${classes.cardGroup}`}>
        <div className={classes.cardImg}>
          <Avatar src={require('images/patient_01.png')} alt="" className={classes.avatar} />
        </div>
        <div className={classes.cardContent}>
          <div className={classes.nameGroup}>
            <div className={classes.name}>Rohit Khanna</div>
            <div className={classes.consultType}>
              <img src={require('images/ic_round-clinic.svg')} alt="" />
            </div>
          </div>
          <div className={classes.userId}>UHID: 98765</div>
        </div>
      </div>
      <div className={`${classes.title}`}>APPT DATE: 22/08/2019, 10 AM</div>
      <div className={`${classes.cardGroup}`}>
        <div className={classes.cardImg}>
          <Avatar src={require('images/patient_01.png')} alt="" className={classes.avatar} />
        </div>
        <div className={classes.cardContent}>
          <div className={classes.nameGroup}>
            <div className={classes.name}>Ajay Reddy</div>
            <div className={classes.consultType}>
              <img src={require('images/ic_round-video.svg')} alt="" />
            </div>
          </div>
          <div className={classes.userId}>UHID: 98765</div>
        </div>
      </div>
      <div className={`${classes.title}`}>APPT DATE: 22/08/2019, 10 AM</div>
      <div className={`${classes.cardGroup}`}>
        <div className={classes.cardImg}>
          <Avatar src={require('images/patient_01.png')} alt="" className={classes.avatar} />
        </div>
        <div className={classes.cardContent}>
          <div className={classes.nameGroup}>
            <div className={classes.name}>Preeti Sharma</div>
            <div className={classes.consultType}>
              <img src={require('images/ic_round-clinic.svg')} alt="" />
            </div>
          </div>
          <div className={classes.userId}>UHID: 98765</div>
        </div>
      </div>
    </div>
  );
};
