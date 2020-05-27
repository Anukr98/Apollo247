import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';

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
        '&:last-child': {
          border: '1px solid #00485d',
        },
        '& img': {
          verticalAlign: 'middle',
          marginRight: 16,
        },
      },
    },
  };
});

export const CheckRiskLevel: React.FC = (props) => {
  const classes = useStyles({});
  const covidScannerUrl = process.env.COVID_RISK_CALCULATOR_URL;
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
        <p>Assess your symptoms and determine if you're at risk for coronavirus disease and get guidance on when to seek medical care and what to do in the meantime. You can also all our experts for advice.</p>
      </div>
      <div className={classes.rightActions}>
        <AphButton
          onClick={() => window.open(covidScannerUrl)}
        >
          <span>
            <img src={require('images/ic_covid-white.svg')} alt="" />
          </span>
          <span>Check your Covid-19 risk level</span>
        </AphButton>
        <AphButton
          onClick={() => window.open(covidScannerUrl)}
        >
          <span>
            <img src={require('images/call-24.svg')} alt="" />
          </span>
          <span>Call our Coronavirus Experts</span>
        </AphButton>
      </div>
    </div>
  );
};