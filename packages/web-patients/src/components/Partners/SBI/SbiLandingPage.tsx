import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import React from 'react';
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
    mainContent: {},
    banner: {
      padding: 20,
      background: '#fff',
      overflow: 'hidden',
      backgroundColor: '#fff',
      marginTop: -93,
      [theme.breakpoints.down('xs')]: {
        marginTop: -80,
      },
    },
    sbi: {
      margin: '0 0 0 20px',
    },
    bannerContent: {
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      padding: '20px 0 0',
      '& div': {
        width: '65%',
      },
      '& h1': {
        fontSize: 18,
        color: '#02475b',
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 12,
        color: 'rgba(0,0,0,0.5)',
      },
      '& p span': {
        fontSize: 12,
        color: '#000',
        fontWeight: 'bold',
      },
      '& img': {
        position: 'absolute',
        right: -24,
        top: -16,
        width: 136,
      },
    },
    primaryButton: {
      padding: '10px 20px',
      textAlign: 'center',
      color: '#fff',
      background: '#fcb716',
      borderRadius: 10,
      border: 'none',
      boxShadow: 'none',
      margin: '20px 0 0',
      fontSize: 14,
      textTransform: 'uppercase',
      fontWeight: 'bold',
    },
    sbiBenefits: {
      padding: 20,
    },
    card: {
      borderRadius: 10,
      background: '#ffffff',
      margin: '0 0 20px',
      overflow: 'hidden',
    },
    cardContent: {
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      '-webkit-box-shadow': '0px 5px 20px 0px rgba(50, 50, 50, 0.5)',
      '-moz-box-shadow': '0px 5px 20px 0px rgba(50, 50, 50, 0.5)',
      'box-shadow': '0px 5px 20px 0px rgba(50, 50, 50, 0.5)',
    },
    cardDetails: {
      width: '70%',
      padding: '0 0 0 10px',
      '& h6': {
        fontSize: 15,
        margin: '0 0 8px',
        color: '#fcb716',
      },
      '& p': {
        fontSize: 12,
        margin: 0,
        color: 'rgba(0,0,0,0.5)',
      },
    },
    imgContainer: {
      width: '30%',
      '& img': {
        width: 100,
      },
    },
    strikeText: {
      textDecoration: 'line-through',
    },
    cardExt: {
      background: '#0087ba',
      padding: 16,
      position: 'relative',
      '& p': {
        fontSize: 12,
        margin: '0 0 10px',
        color: '#ffffff',
      },
      '& p:last-child': {
        margin: 0,
      },
      '&  p span': {
        fontWeight: 'bold',
      },

      '&:before': {
        content: '""',
        position: 'absolute',
        top: '30%',
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#e7e9df',
        left: -16,
        right: 'auto',
      },
      '&:after': {
        content: '""',
        position: 'absolute',
        top: '30%',
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#e7e9df',
        right: -16,
        left: 'auto',
      },
    },
    dedicated: {
      padding: '16px 16px 0 16px',
    },
    cardHeader: {
      padding: '0 0 20px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #02475b',
      '& h2': {
        fontSize: 18,
        color: '#02475b',
        margin: '0 0 0 20px',
      },
    },
    cardBody: {
      padding: '4px 0',
    },
    serviceDetails: {
      padding: '10px 0',
      '& h6': {
        fontSize: 12,
        color: '#02475b',
        margin: '0 0 5px',
      },
      '& p': {
        fontSize: 12,
        margin: '4px 0',
        color: '#000',
      },
    },
    dedicatedImg: {
      width: 48,
    },
  };
});

export const SbiLandingPage: React.FC = (props) => {
  const classes = useStyles({});

  const tpRefCode = 'SBIYONO';
  const urlParams = `?tp_ref_code=${tpRefCode}`;
  const homePageUrl = clientRoutes.welcome();
  const doctorsLanding = clientRoutes.doctorsLanding();
  const pharmacyLanding = clientRoutes.medicines();
  const diagnosticsUrl = 'https://apollo247.onelink.me/775G/extsbi';
  const { currentPatient } = useAllCurrentPatients();

  return (
    <div className={classes.root}>
      <div className={classes.mainContent}>
        <div className={classes.banner}>
          <div>
            <Link to={`${homePageUrl}${urlParams}`}>
              <img src={require('images/apollo.svg')} alt="logo" />
            </Link>
            <a href="javascript:void(0)" className={classes.sbi}>
              <img src={require('images/sbi_yono.png')} width="40" alt="logo" />
            </a>
          </div>
          <div className={classes.bannerContent}>
            <div>
              <h1>India, let’s take care of your biggest asset: Your Health</h1>
              <p>
                Avail these offers from <span>05 May – 14 May</span>
              </p>
              <Link to={`${homePageUrl}${urlParams}`}>
                <button className={classes.primaryButton}>Get Started</button>
              </Link>
            </div>
            <img src={require('images/india-health.png')} />
          </div>
        </div>
        <div className={classes.sbiBenefits}>
          <Link to={`${doctorsLanding}${urlParams}`}>
            <div className={classes.card}>
              <div className={classes.cardContent}>
                <div className={classes.imgContainer}>
                  <img src={require('images/consult.png')} />
                </div>
                <div className={classes.cardDetails}>
                  <h6>Consult Apollo Doctors</h6>
                  <p>Round-the-clock consultations with Apollo Doctors over chat, audio, video</p>
                </div>
              </div>
              <div className={classes.cardExt}>
                <p>
                  Use coupon code <span>‘TRYAPOLLO’</span> and get Rs.999 off if you book between{' '}
                  <span>5pm – 8am</span>
                </p>
              </div>
            </div>
          </Link>
          <Link to={`${pharmacyLanding}${urlParams}`}>
            <div className={classes.card}>
              <div className={classes.cardContent}>
                <div className={classes.imgContainer}>
                  <img src={require('images/pharmacy.png')} />
                </div>
                <div className={classes.cardDetails}>
                  <h6>Pharmacy at your doorstep</h6>
                  <p>Order medicines, tests and health checkups from the comfort of your home</p>
                </div>
              </div>
              <div className={classes.cardExt}>
                <p>
                  2 sets of 3-ply mask and a hand sanitiser <span>FREE</span> with every medicine
                  order worth <span>Rs.600 and above</span>
                </p>
                <p>
                  Get <span>10% off</span> on all chronic medicines
                </p>
                <p>
                  *Offer valid from <span>7th-14th May</span> and in select cities
                </p>
              </div>
            </div>
          </Link>

          <div className={classes.card} onClick={() => window.open(diagnosticsUrl, '_self')}>
            <div className={classes.cardContent}>
              <div className={classes.imgContainer}>
                <img src={require('images/test.png')} />
              </div>
              <div className={classes.cardDetails}>
                <h6>Tests and Health Check</h6>
                <p>Most trusted diagnostics from the comfort of your home: download Apollo 24|7</p>
              </div>
            </div>
            <div className={classes.cardExt}>
              <p>
                Special immunity-check package at <span className={classes.strikeText}>Rs.800</span>{' '}
                <span>Rs.499</span> covering: CBC, CRP (Quantitative), Glucose (Random)
              </p>

              <p>
                Special Comprehensive health-check package at
                <span className={classes.strikeText}> Rs.2400</span> <span>Rs.899 </span>covering:
                Lipid Profile, Liver Function Test, Urea (serum), Creatinine (serum), TSH,
                Haemoglobin
              </p>
              <p>
                *Offer is available in selected cities- Hyderabad, Chennai, Bengaluru, Kolkata &
                Pune & can be booked on Apollo 24|7 App only
              </p>
            </div>
          </div>

          <div className={`${classes.card} ${classes.dedicated}`}>
            <div className={classes.cardHeader}>
              <img className={classes.dedicatedImg} src={require('images/mascot.png')} />
              <h2>Dedicated Service for YOU</h2>
            </div>
            <div className={classes.cardBody}>
              <a href="mailto:corporate@apollo247.org">
                <div className={classes.serviceDetails}>
                  <h6>2-hour redressal for all your queries</h6>
                  <p>
                    Email us at <b>corporate@apollo247.com</b>&nbsp; between
                    <br /> 8am – 8pm
                  </p>
                </div>
              </a>
              <a href="tel:08047192606">
                <div className={classes.serviceDetails}>
                  <h6>Talk to experts about COVID-19</h6>
                  <p>
                    Dedicated helpline made available to resolve all queries on <b>Apollo24|7</b>
                  </p>
                </div>
              </a>
              <div className={classes.serviceDetails}>
                <h6>Getting super-specialties is super-easy</h6>
                <p>Super specialty doctors made available everyday for you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
