import React, { useState } from 'react';
import { Theme, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphDialogTitle, AphDialog, AphDialogClose, AphButton } from '@aph/web-ui-components';
import { customerCareNumber } from 'helpers/commonHelpers';
import { LazyIntersection } from './lib/LazyIntersection';

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
    mainHead: {
      fontSize: '17px !important',
      fontWeight: 500,
      color: '#0087ba',
      margin: 0,
      paddingBottom: 16,
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
      position: 'relative',
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
      '& img': {
        position: 'absolute',
        top: 20,
        right: 20,
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
      '& h3': {
        fontSize: 14,
        fontWeight: 500,
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
    helpSectionHead: {
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
      margin: 0,
      paddingBottom: 12,
      textTransform: 'uppercase',
    },
    serviceCard: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #00485d',
      borderRadius: 10,
      color: '#00485d',
      fontSize: 14,
      padding: '9px 16px',
      cursor: 'pointer',
      fontWeight: 500,
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        margin: '0 0 15px',
        '&:last-child': {
          margin: 0,
        },
      },
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
    hcContent: {
      padding: '16px 0',
      borderBottom: '1px dashed rgba(0,0,0,0.2)',
      '& h3': {
        fontSize: 16,
        fontWeight: 700,
        color: '#07AE8B',
        textTransform: 'uppercase',
        margin: '0 0 10px',
      },
    },
    hcDetails: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        color: 'rgba(1,71,91,0.6)',
        width: '70%',
      },
      '& a': {
        color: '#FC9916',
        borderRadius: 10,
        margin: '0 0 0 20px',
        textTransform: 'none',
        [theme.breakpoints.down('sm')]: {
          margin: '20px 0 0',
        },
        '& img': {
          margin: '0 10px 0 0',
        },
      },
    },
    serviceContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    pt0: {
      paddingTop: 0,
    },
  };
});

export const WeAreHelpYou: React.FC = (props) => {
  const classes = useStyles({});
  const covidScannerUrl = process.env.COVID_RISK_CALCULATOR_URL;
  const [iscoronaDialogOpen, setIscoronaDialogOpen] = useState<boolean>(false);

  return (
    <div className={classes.root}>
      {/* <Typography variant="h3" className={classes.mainHead}>
        Worried about Coronavirus?
      </Typography> */}
      <div className={classes.helpCard}>
        <div
          className={classes.cardHeader}
          style={{ backgroundImage: `url(${require('images/ecosystem-banner.jpg')})` }}
        >
          <div className={classes.contentGroup}>
            <img src={require('images/h-medicine.svg')} alt="" />
            <div className={classes.title}>Healthcare As One Ecosystem</div>
            <p>
              Learn more about healthcare in today’s world with rapid increase in medications and
              dietery habits round the globe.
            </p>
          </div>
          {/* <div className={classes.rightGroup}>
            <LazyIntersection
              style={{ width: '24px' }}
              src={require('images/ic_covid-banner.svg')}
              alt=""
            />
          </div> */}
        </div>
        <div className={classes.cardContent}>
          <div className={`${classes.hcContent} ${classes.pt0}`}>
            <Typography component="h3">Knowledge Base</Typography>
            <div className={classes.hcDetails}>
              <Typography>
                We know there is too much information out there. We have compiled the most
                science-based articles for you on how to stay safe, prevention and what to do in
                case you are infected.
              </Typography>
              <AphButton href={clientRoutes.knowledgeBaseLanding()}>
                <img src={'images/article.svg'} alt="" /> Read the latest articles
              </AphButton>
            </div>
          </div>
          <div className={classes.hcContent}>
            <Typography component="h3">Covid-19</Typography>
            <div className={classes.hcDetails}>
              <Typography>
                We know there is too much information out there. We have compiled the most
                science-based articles for you on how to stay safe, prevention and what to do in
                case you are infected.
              </Typography>
              <AphButton href={clientRoutes.covidLanding()}>
                <img src={'images/covid.svg'} alt="" />
                Learn about Covid-19
              </AphButton>
            </div>
          </div>
          <div className={classes.helpSection}>
            <div className={classes.helpSectionHead}>You can also</div>
            <div className={classes.serviceContent}>
              <div className={classes.serviceCard}>
                <a href={covidScannerUrl} target={'_blank'}>
                  <span>
                    <LazyIntersection
                      style={{ width: '24px' }}
                      src={require('images/ic_covid-white.svg')}
                      alt=""
                    />
                  </span>
                  <span>Check your risk level</span>
                </a>
              </div>

              <div className={classes.serviceCard}>
                <span>
                  <img src={require('images/ic_psychologist.svg')} alt="" />
                </span>
                <span>Take a mental health scan</span>
              </div>

              <div
                onClick={() => {
                  setIscoronaDialogOpen(true);
                }}
                className={classes.serviceCard}
              >
                <span>
                  <LazyIntersection
                    style={{ width: '24px' }}
                    src={require('images/ic_family_doctor.svg')}
                    alt=""
                  />
                </span>
                <span>Call our experts</span>
              </div>

              {/* <Link className={classes.serviceCard} to={clientRoutes.kavachLanding()}>
                <span>
                  <LazyIntersection
                    src={require('images/apollo-kavach.png')}
                    alt="apollo-kavach"
                    style={{ width: '24px' }}
                  />
                </span>
                <span>Explore the Apollo Kavach Program</span>
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      <AphDialog open={iscoronaDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIscoronaDialogOpen(false)} title={'Close'} />
        <AphDialogTitle></AphDialogTitle>
        <div className={classes.expertBox}>
          <h2>CORONAVIRUS? Talk to our expert.</h2>
          <a href={`tel:${customerCareNumber}`}>Call {customerCareNumber} in emergency</a>
          <AphButton onClick={() => setIscoronaDialogOpen(false)} color="primary">
            Ok, Got It
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
