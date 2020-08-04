import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAllCurrentPatients } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      [theme.breakpoints.down(900)]: {
        marginBottom: -60,
      },
    },
    partnerWrapper: {
      backgroundColor: '#fff',
      padding: '8px 0 0 20px',
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
      alignItems: 'center',
      '& img': {
        maxHeight: 40,
        marginRight: 20,
      },
    },
    appLogo: {
      maxHeight: '45px !important',
    },
    partnerContent: {
      display: 'flex',
    },
    bannerDiv: {
      minHeight: 186,
      minWidth: 170,
      marginLeft: 'auto',
      position: 'relative',
    },
    bannerDivImg: {
      position: 'absolute',
      right: 0,
      bottom: -5,
    },
    partnerText: {
      fontWeight: 600,
      color: '#02475b',
      fontSize: 20,
      marginTop: 17,
      marginBottom: 24,
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
  // const utmSource = 'sbi';
  // const utmMedium = 'banner';
  // const utmCampaign = 'apollo247_econsults';
  // const utmContent = '';
  // const urlParams = `?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_content=${utmContent}&tp_ref_code=${tpRefCode}`;
  const tpRefCode = 'SBIYONO';
  const urlParams = `?tp_ref_code=${tpRefCode}`;
  const url_string = window.location.href;
  const url = new URL(url_string);
  const utmSource = url.searchParams.get("utm_source");
  sessionStorage.setItem('utm_source', utmSource);
  const homePageUrl = clientRoutes.welcome();
  const { currentPatient } = useAllCurrentPatients();

  return (
    <div className={classes.root}>
      <div className={classes.partnerWrapper}>
        <div className={classes.imagesWrapper}>
          <img className={classes.appLogo} src={require('images/ic_logo.png')} />
          <img src={require('images/sbi_yono_logo.png')} />
        </div>
        <div className={classes.partnerContent}>
          <div>
            <div className={classes.partnerText}>An entire hospital now on your phone</div>
            <Link
              to={currentPatient && currentPatient.id ? homePageUrl : `${homePageUrl}${urlParams}`}
              className={classes.getStartedBtn}
              color="primary"
            >
              Get Started
            </Link>
          </div>
          <div className={classes.bannerDiv}>
            <div className={classes.bannerDivImg}>
              <img src={require('images/holding-phone-mockup.png')} />
            </div>
          </div>
        </div>
      </div>
      <div className={classes.landingContent}>
        <div className={classes.blackCard}>
          <div className={classes.blackCardContent}>
            <div className={classes.cardsHeader}>Bank on us with your health.</div>
            <div className={classes.cardsBody}>
              Use coupon code <span className={classes.code}>‘YONO299’</span> for{' '}
              <span className={classes.discountPrice}>Rs.299</span> off on your doctor consultation
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
          <div>
            <div className={classes.cardsHeader}>Consult Apollo Doctors</div>
            <div className={classes.cardsBody}>
              Round-the-clock consultations with Apollo Doctors over chat, audio, video
            </div>
          </div>
        </div>
        <div className={classes.cards}>
          <img src={require('images/ic_bike.svg')} />
          <div>
            <div className={classes.cardsHeader}>Pharmacy at your doorstep</div>
            <div className={classes.cardsBody}>Order medicines from the comfort of your home</div>
          </div>
        </div>
        <div className={classes.cards}>
          <div className={classes.healthCardImage}>
            <img src={require('images/ic_health_records.svg')} />
          </div>
          <div>
            <div className={classes.cardsHeader}>Medical records vault</div>
            <div className={classes.cardsBody}>
              Keep all your medical records safe and accessible in our digital vault
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
