import React, { useState } from 'react';
import { Theme, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphDialogTitle, AphDialog, AphDialogClose, AphButton } from '@aph/web-ui-components';
import { customerCareNumber } from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      padding: 16,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginTop: 20,
      fontSize: 14,
      lineHeight: '18px',
      color: '#01475b',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: '10px 10px 0 0',
        padding: 20,
      },
    },
    leftIcon: {
      paddingRight: 40,
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
        alignItems: 'center',
      },
      '& img': {
        [theme.breakpoints.down('xs')]: {
          marginRight: 16,
        },
      },
      '& h3': {
        [theme.breakpoints.up('sm')]: {
          display: 'none',
        },
      },
    },
    boxContent: {
      color: '#01475b',
      '& h3': {
        fontSize: 16,
        lineHeight: '22px',
        margin: 0,
        display: 'none',
        [theme.breakpoints.up('sm')]: {
          display: 'block',
        },
      },
      '& p': {
        fontSize: 14,
        lineHeight: '18px',
        opacity: 0.6,
      },
    },
    rightActions: {
      paddingLeft: 40,
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
        marginLeft: 0,
      },
      '& button': {
        minWidth: 260,
        display: 'flex',
        alignItems: 'center',
        fontSize: 13,
        textTransform: 'none',
        justifyContent: 'normal',
        fontWeight: 600,
        borderRadius: 10,
        [theme.breakpoints.down('xs')]: {
          minWidth: '100%',
        },
        '&:first-child': {
          backgroundColor: '#00485d',
          color: '#fff',
          marginBottom: 16,
        },
        '& img': {
          verticalAlign: 'middle',
          marginRight: 16,
        },
      },
    },
    callBtn: {
      minWidth: 260,
      fontSize: 13,
      textTransform: 'none',
      justifyContent: 'normal',
      fontWeight: 600,
      borderRadius: 10,
      border: '1px solid #00485d',
      padding: '9px 13px 9px 13px',
      boxShadow: '0 2px 4px 0 rgba(0,0,0, 0.2)',
      display: 'block',
      [theme.breakpoints.down('xs')]: {
        minWidth: '100%',
      },
      '& >div': {
        display: 'flex',
        alignItems: 'center',
        '& img': {
          verticalAlign: 'middle',
          marginRight: 16,
        },
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
  };
});

export const CheckRiskLevel: React.FC = (props) => {
  const classes = useStyles({});
  const covidScannerUrl = process.env.COVID_RISK_CALCULATOR_URL;
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const [iscoronaDialogOpen, setIscoronaDialogOpen] = useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.leftIcon}>
        <span>
          <img src={require('images/undraw-feeling-blue.svg')} alt="" />
        </span>
        <h3>Worried about being at risk for COVID-19?</h3>
      </div>
      <div className={classes.boxContent}>
        <h3>Worried about being at risk for COVID-19?</h3>
        <p>
          Assess your symptoms and determine if you're at risk for coronavirus disease and get
          guidance on when to seek medical care and what to do in the meantime. You can also call our
          experts for advice.
        </p>
      </div>
      <div className={classes.rightActions}>
        <AphButton onClick={() => window.open(covidScannerUrl)}>
          <span>
            <img src={require('images/ic_covid-white.svg')} alt="" />
          </span>
          <span>Check your Covid-19 risk level</span>
        </AphButton>
        <a className={classes.callBtn} href={isDesktopOnly ? '#' : `tel:${customerCareNumber}`}>
          <div
            onClick={() => {
              isDesktopOnly ? setIscoronaDialogOpen(true) : '';
            }}
          >
            <span>
              <img src={require('images/call-24.svg')} alt="" />
            </span>
            <span>Call our Coronavirus Experts</span>
          </div>
        </a>
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
