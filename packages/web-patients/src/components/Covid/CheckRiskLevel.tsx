import React, { useState } from 'react';
import { Theme, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphDialogTitle, AphDialog, AphDialogClose, AphButton } from '@aph/web-ui-components';
import { ProtectedWithLoginPopup } from '../ProtectedWithLoginPopup';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/authHooks';
import { customerCareNumber } from '../../helpers/commonHelpers';
import { clientRoutes } from '../../helpers/clientRoutes';
import { useLocation } from 'react-router';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      padding: 24,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      margin: '20px  0',
      fontSize: 14,
      lineHeight: '18px',
      color: '#01475b',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
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
        [theme.breakpoints.down('sm')]: {
          width: '100%',
        },
      },
      '& p': {
        fontSize: 14,
        lineHeight: '18px',
        opacity: 0.6,
      },
    },
    rightActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      margin: '10px 0 0',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
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
        marginRight: 20,
        [theme.breakpoints.down('sm')]: {
          minWidth: 300,
          width: '100%',
          margin: '0 0 10px',
        },

        '& img': {
          verticalAlign: 'middle',
          marginRight: 16,
        },
      },
    },
    filledBtn: {
      backgroundColor: '#00485d',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#00485d',
        color: '#fff',
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
    covidScanner: {
      display: 'contents',
      width: '100%',
    },
  };
});

export const CheckRiskLevel: React.FC = (props) => {
  const classes = useStyles({});
  const covidScannerUrl = process.env.COVID_RISK_CALCULATOR_URL;
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const [iscoronaDialogOpen, setIscoronaDialogOpen] = useState<boolean>(false);
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const isWebView =
    sessionStorage.getItem('webView') && sessionStorage.getItem('webView').length > 0;
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
          guidance on when to seek medical care and what to do in the meantime. You can also call
          our experts for advice.
        </p>
        <div className={classes.rightActions}>
          {!location.pathname.includes('medical-condition') && !isWebView && (
            <ProtectedWithLoginPopup>
              {({ protectWithLoginPopup }) => (
                <AphButton
                  className={classes.filledBtn}
                  onClick={() => {
                    if (!isSignedIn) {
                      protectWithLoginPopup();
                    }
                  }}
                >
                  <Link to={isSignedIn && clientRoutes.covidProtocol()}>
                    <span>
                      <img src={require('images/guide.svg')} alt="" />
                    </span>
                    <span>Get your COVID-19 guide</span>
                  </Link>
                </AphButton>
              )}
            </ProtectedWithLoginPopup>
          )}
          <a href={covidScannerUrl} target={'_blank'} className={classes.covidScanner}>
            <AphButton className={classes.filledBtn}>
              <span>
                <img src={require('images/ic_covid-white.svg')} alt="" />
              </span>
              <span>Check your COVID-19 risk level</span>
            </AphButton>
          </a>
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
