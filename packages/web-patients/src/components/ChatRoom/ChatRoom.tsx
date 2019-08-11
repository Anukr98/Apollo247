import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { ChatWindow } from 'components/ChatRoom/ChatWindow';
import { ConsultDoctorProfile } from 'components/ChatRoom/ConsultDoctorProfile';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    doctorListingSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    leftSection: {
      width: 328,
    },
    rightSection: {
      width: 'calc(100% - 328px)',
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
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
  };
});

export const ChatRoom: React.FC = (props) => {
  const classes = useStyles();
  const [sessionId, setsessionId] = useState<string>(
    '1_MX40NjM5MzU4Mn5-MTU2NTA3MTUwNDk4MX56bVd3ZW96MFNuS2Vua2dDMnZ5VTZNNlJ-UH4'
  );
  const [token, settoken] = useState<string>(
    'T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9Y2UxMDhkODEzNTU3MmE4M2ExZTZkNmVlYjVkZDE0ODA3NGZhM2QyZTpzZXNzaW9uX2lkPTFfTVg0ME5qTTVNelU0TW41LU1UVTJOVEEzTVRVd05EazRNWDU2YlZkM1pXOTZNRk51UzJWdWEyZERNblo1VlRaTk5sSi1VSDQmY3JlYXRlX3RpbWU9MTU2NTA3MTYxMCZub25jZT0wLjExNjA5MzQ3Njk5NjI3MzM3JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1Njc2NjM2MDcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0='
  );
  const appointmentId = '1c8aff41-f6ff-4e79-bcf3-b4f293741e93';
  return (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.breadcrumbs}>
            <Link to={clientRoutes.welcome()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            Consultation - Case #362079
          </div>
          <div className={classes.doctorListingSection}>
            <div className={classes.leftSection}>
              <ConsultDoctorProfile />
            </div>
            <div className={classes.rightSection}>
              <ChatWindow sessionId={sessionId} token={token} appointmentId={appointmentId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
