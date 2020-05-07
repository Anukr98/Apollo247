import React, { useState } from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphDialogTitle, AphDialog, AphDialogClose, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      '& h2': {
        fontSize: 17,
        fontWeight: 500,
        color: '#0087ba',
        margin: 0,
        paddingBottom: 16,
      },
    },
    helpCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    cardHeader: {
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden',
      padding: 22,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      display: 'flex',
    },
    rightGroup: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    contentGroup: {
      color: '#fff',
      '& p': {
        margin: 0,
      },
    },
    title: {
      fontSize: 36,
      textTransform: 'uppercase',
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        fontSize: 24,
      },
    },
    cardContent: {
      padding: 20,
      '& p': {
        opacity: 0.6,
        marginBottom: 0,
      },
    },
    contentHeader: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      paddingBottom: 8,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      '& img': {
        maxWidth: 40,
        marginRight: 10,
      },
    },
    articleBox: {
      display: 'flex',
      alignItems: 'center',
      padding: '9px 16px',
      fontSize: 14,
      fontWeight: 500,
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginTop: 16,
      [theme.breakpoints.down('xs')]: {
        marginTop: 0,
      },
      '& img': {
        verticalAlign: 'middle',
        marginBottom: -2,
      },
      '& span:first-child': {
        paddingRight: 16,
      },
    },
    helpSection: {
      paddingTop: 16,
      '& h3': {
        fontSize: 12,
        fontWeight: 500,
        color: '#01475b',
        margin: 0,
        paddingBottom: 12,
      },
      '& >div': {
        [theme.breakpoints.down('xs')]: {
          margin: -5,
        },
        '& >div': {
          [theme.breakpoints.down('xs')]: {
            padding: '5px !important',
          },
        },
      },
    },
    serviceCard: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#00485d',
      borderRadius: 10,
      color: '#fff',
      fontSize: 14,
      padding: '9px 16px',
      cursor: 'pointer',
      fontWeight: 500,
      '& img': {
        verticalAlign: 'middle',
      },
      '& span:first-child': {
        paddingRight: 16,
      },
    },
    expertBox: {
      padding: 20,
      textAlign: 'center',
      '& h2': {
        fontSize: 16,
        margin: 0,
      },
      '& a': {
        fontSize: 14,
        paddingTop: 5,
        display: 'inline-block',
        color: '#0087ba',
        fontWeight: 500,
      },
      '& button': {
        marginTop: 20,
      },
    },
  };
});

export const WeAreHelpYou: React.FC = (props) => {
  const classes = useStyles({});
  const covidScannerUrl = process.env.COVID_RISK_CALCULATOR_URL;
  const [iscoronaDialogOpen, setIscoronaDialogOpen] = useState<boolean>(false);

  return (
    <div className={classes.root}>
      <h2>Worried about Coronavirus?</h2>
      <div className={classes.helpCard}>
        <div
          className={classes.cardHeader}
          style={{ backgroundImage: `url(${require('images/covid-banner.png')})` }}
        >
          <div className={classes.contentGroup}>
            <div className={classes.title}>Coronavirus (Covid-19)</div>
            <p>
              Learn more about Coronavirus, how to stay safe, and what to do if you have symptoms.
            </p>
          </div>
          <div className={classes.rightGroup}>
            <img src={require('images/ic_covid-banner.svg')} alt="" />
          </div>
        </div>
        <div className={classes.cardContent}>
          <div className={classes.contentHeader}>
            <span>
              <img src={require('images/ic-doctor.svg')} alt="We are here to help you" />
            </span>
            <span>We are here to help you.</span>
          </div>
          <Grid container spacing={2}>
            <Grid item sm={8} xs={12}>
              <p>
                Apollo 247 has curated fact-based information from reputed sources on Coronavirus.
                Now you can get reliable answers to common questions at one place.
              </p>
            </Grid>
            <Grid item sm={4} xs={12}>
              <Link className={classes.articleBox} to={clientRoutes.covidLanding()}>
                <span>
                  <img src={require('images/ic_feed.svg')} alt="" />
                </span>
                <span>Learn more about Coronavirus</span>
              </Link>
            </Grid>
          </Grid>
          <div className={classes.helpSection}>
            <h3>You can also</h3>
            <Grid container spacing={2}>
              <Grid item sm={4} xs={12} onClick={() => window.open(covidScannerUrl)}>
                <div className={classes.serviceCard}>
                  <span>
                    <img src={require('images/ic_covid-white.svg')} alt="" />
                  </span>
                  <span>Check your risk level</span>
                </div>
              </Grid>
              {/* <Grid item sm={4} xs={12}>
                <div className={classes.serviceCard}>
                  <span>
                    <img src={require('images/ic_psychologist.svg')} alt="" />
                  </span>
                  <span>Take a mental health scan</span>
                </div>
              </Grid> */}
              <Grid item sm={4} xs={12}>
                <div
                  onClick={() => {
                    setIscoronaDialogOpen(true);
                  }}
                  className={classes.serviceCard}
                >
                  <span>
                    <img src={require('images/ic_family_doctor.svg')} alt="" />
                  </span>
                  <span>Call our experts</span>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>

      <AphDialog open={iscoronaDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIscoronaDialogOpen(false)} title={'Close'} />
        <AphDialogTitle></AphDialogTitle>
        <div className={classes.expertBox}>
          <h2>CORONAVIRUS? Talk to our expert.</h2>
          <a href="tel:08047192606">Call 08047192606 in emergency</a>
          <AphButton onClick={() => setIscoronaDialogOpen(false)} color="primary">
            Ok, Got It
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
