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
      marginTop: 30,
      marginBottom: 10,
      fontSize: 14,
      lineHeight: '18px',
      color: '#01475b',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#00485d',
        borderRadius: 0,
        color: '#fff',
      },
      '& button': {
        minWidth: 288,
        [theme.breakpoints.up('sm')]: {
          minWidth: 'auto',
          marginLeft: 'auto',
        },
      },
      '& p': {
        fontWeight: 500,
        marginTop: 5,
        [theme.breakpoints.up('sm')]: {
          margin: 0,
          paddingLeft: 10,
        },
      },
    },
    mobileImg: {
      verticalAlign: 'middle',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    desktopImg: {
      verticalAlign: 'middle',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    riskButton: {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        minWidth: '0 !important',
      },
    },
  };
});

export const CheckRiskLevel: React.FC = (props) => {
  const classes = useStyles({});
  const covidScannerUrl = process.env.COVID_RISK_CALCULATOR_URL;
  return (
    <div className={classes.root}>
      <span>
        <img className={classes.mobileImg} src={require('images/ic_warning.svg')} alt="" />
        <img className={classes.desktopImg} src={require('images/ic_warning_white.svg')} alt="" />
      </span>
      <p>Worried about symptoms? Check your COVID-19 risk level.</p>
      <AphButton
        className={classes.riskButton}
        color="primary"
        onClick={() => window.open(covidScannerUrl)}
      >
        Check your risk level
      </AphButton>
    </div>
  );
};
