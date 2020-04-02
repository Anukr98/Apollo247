import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {},
    partnerWrapper: {
      backgroundColor: '#fff',
      padding: '8px 20px 20px 20px',
      marginTop: -93,
      [theme.breakpoints.down('xs')]: {
        marginTop: -80,
      },
    },
    partnerName: {
      backgroundColor: '#f9fafa',
      padding: '12px 20px',
      textAlign: 'center',
      borderRadius: 8,
      fontSize: 14,
      color: '#000',
      opacity: 0.5,
    },
    imagesWrapper: {
      display: 'flex',
      marginTop: 15,
      '& img': {
        maxHeight: 40,
        marginRight: 20,
      },
    },
    partnerContent: {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        maxHeight: 40,
      },
    },
    partnerText: {
      fontWeight: 600,
      color: '#02475b',
      fontSize: 20,
      marginTop: 17,
      marginBottom: 24,
      maxWidth: '55%',
    },
    getStartedBtn: {
      padding: '9px 13px',
      minWidth: 140,
      borderRadius: 10,
      backgroundColor: '#fcb716',
      color: '#fff',
      textTransform: 'uppercase',
      display: 'inline-block',
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 'bold',
      boxShadow: '0 2px 4px 0 rgba(0,0,0, 0.2)',
    },
    scrollbar: {
      marginTop: 100,
    },
    landingContent: {
      padding: 20,
    },
    cards: {
      padding: '16px 14px 16px 0',
      backgroundColor: '#fff',
      display: 'flex',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 12,
      borderRadius: 10,
      '& img': {
        maxWidth: 97,
      },
    },
    cardsImage: {
      marginLeft: -11,
    },
    anytimeCardContent: {
      marginLeft: 11,
    },
    healthCardContent: {
      marginLeft: 6,
    },
    healthCardImage: {
      marginLeft: -6,
    },
    blackCard: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      paddingLeft: 14,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      overflow: 'hidden',
      padding: '16px 14px 16px 0',
      display: 'flex',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 12,
      borderRadius: 10,
      '& div': {
        color: '#fff',
      },
    },
    blackCardContent: {
      padding: '20px 0',
    },
    code: {
      fontWeight: 'bold',
    },
    discountPrice: {
      fontWeight: 600,
    },
    healthImage: {
      marginRight: -35,
      marginLeft: 'auto',
      '& img': {
        maxHeight: 100,
      },
    },
    cardsHeader: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      marginBottom: 12,
    },
    cardsBody: {
      fontSize: 12,
      color: '#000000',
    },
  };
});

export const SbiLandingPage: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.partnerWrapper}>
        <div className={classes.imagesWrapper}>
          <img src={require('images/ic_logo.png')} />
          <img src={require('images/sbi_logo.png')} />
        </div>
        <div className={classes.partnerContent}>
          <div>
            <div className={classes.partnerText}>An entire hospital now on your phone</div>
            <Link to={clientRoutes.welcome()} className={classes.getStartedBtn} color="primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <div className={classes.landingContent}>
        <div className={classes.blackCard}>
          <div className={classes.blackCardContent}>
            <div className={classes.cardsHeader}>Bank on us with your health.</div>
            <div className={classes.cardsBody}>
              Use coupon code <span className={classes.code}>‘SBI247’</span> for{' '}
              <span className={classes.discountPrice}>Rs.500</span> off on your doctor consultation
            </div>
          </div>
          <div className={classes.healthImage}>
            <img src={require('images/ic_bank_health.svg')} />
          </div>
        </div>
        <div className={classes.cards}>
          <div className={classes.cardsImage}>
            <img src={require('images/ic_anytime.svg')} />
          </div>
          <div className={classes.anytimeCardContent}>
            <div className={classes.cardsHeader}>Anytime, anywhere</div>
            <div className={classes.cardsBody}>
              Round-the-clock consultations with Apollo Doctors over chat, audio, video
            </div>
          </div>
        </div>
        <div className={classes.cards}>
          <img src={require('images/ic_bike.svg')} />
          <div>
            <div className={classes.cardsHeader}>At your doorstep</div>
            <div className={classes.cardsBody}>
              Order medicines, tests and health checkups from the comfort of your home
            </div>
          </div>
        </div>
        <div className={classes.cards}>
          <div className={classes.healthCardImage}>
            <img src={require('images/ic_health_records.svg')} />
          </div>
          <div className={classes.healthCardContent}>
            <div className={classes.cardsHeader}>Health Records </div>
            <div className={classes.cardsBody}>
              Keep all your medical records safe and accessible in our digital vault
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
