import React from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
    },
    helpCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    cardHeader: {
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden',
      textAlign: 'center',
      padding: 22,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
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
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.helpCard}>
        <div className={classes.cardHeader} style={{ backgroundImage: `url(${require('images/covid-banner.png')})` }}>
          <img src={require('images/ic_covid-banner.svg')} alt="" />
        </div>
        <div className={classes.cardContent}>
          <div className={classes.contentHeader}>
            <span><img src={require('images/ic-doctor.svg')} alt="We are here to help you" /></span>
            <span>We are here to help you.</span>
          </div>
          <Grid container spacing={2}>
            <Grid item sm={8} xs={12}>
              <p>We know there is too much information out there. We have compiled the most science-based articles for you on how to stay safe, prevention and what to do in case you are infected.</p>
            </Grid>
            <Grid item sm={4} xs={12}>
              <Link className={classes.articleBox} to={clientRoutes.covidLanding()}>
                <span><img src={require('images/ic_feed.svg')} alt="" /></span>
                <span>Read the latest articles</span>
              </Link>
            </Grid>
          </Grid>
          <div className={classes.helpSection}>
            <h3>You can also</h3>
            <Grid container spacing={2}>
              <Grid item sm={4} xs={12}>
                <div className={classes.serviceCard}>
                  <span><img src={require('images/ic_covid-white.svg')} alt="" /></span>
                  <span>Check your risk level</span>
                </div>
              </Grid>
              <Grid item sm={4} xs={12}>
                <div className={classes.serviceCard}>
                  <span><img src={require('images/ic_psychologist.svg')} alt="" /></span>
                  <span>Take a mental health scan</span>
                </div>
              </Grid>
              <Grid item sm={4} xs={12}>
                <div
                  className={classes.serviceCard}
                >
                  <span><img src={require('images/ic_family_doctor.svg')} alt="" /></span>
                  <span>Call our experts</span>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>    
    </div>
  );
};
