import React from 'react';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphDialog, AphInput } from '@aph/web-ui-components';
import { callToExotelApi } from 'helpers/commonHelpers';
import { HDFC_EXOTEL_CALLERID, HDFC_EXOTEL_NUMBER } from 'helpers/constants';

const useStyles = makeStyles((theme: Theme) => {
  return {
    hdcContainer: {
      background: `url(${require('images/hdfc/bg.svg')}) no-repeat 0 0`,
      boxShadow: ' 0px 5px 20px rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: '16px 16px 0 16px',
      margin: '30px 0 0 auto',
      position: 'relative',
    },
    hdfcIntro: {
      // display: 'none',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 0',
      },
      '& >img': {
        position: 'absolute',
        top: 20,
        right: 60,
        [theme.breakpoints.down('sm')]: {
          display: 'none',
        },
      },
      '& h2': {
        fontSize: 24,
        fontWeight: 600,
        color: '#07AE8B',
        lineHeight: '20px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 14,
        },
      },
      '& button': {
        boxShadow: 'none',
        display: 'block',
        marginLeft: 'auto',
        color: '#FC9916',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },

    hdcContent: {},
    desc: {
      fontSize: 12,
      fontWeight: 300,
      color: '#01475B',
      lineHeight: '16px',
      fontStyle: 'italic',
      margin: '10px 0',
      [theme.breakpoints.down('sm')]: {
        fontSize: 10,
        margin: ' 0 0 10px',
      },
    },
    note: {
      fontSize: 10,
      fontWeight: 500,
      color: '#FF637B',
      lineHeight: '16px',
    },
    connectDoctorContent: {
      display: 'flex',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
    cdDetails: {
      width: '50%',
      padding: 12,
      '& img': {
        margin: '0 auto 10px',
      },
      '& h5': {
        fontSize: 12,
        color: '#00B38E',
        linHeight: '16px',
        '& span': {
          fontWeight: 700,
        },
      },
    },
    otpError: {
      color: 'red',
      fontSize: 14,
      marginTop: 10,
    },
    dialogContent: {},
    dialogHeader: {
      padding: '16px 16px 10px',
      '& h3': {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '21px',
      },
      '& p': {
        fontSize: 10,
        lineHeight: '13px',
      },
    },

    btnContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '10px 16px 16px',
      '& button': {
        margin: '0 0 0 10px',
        '&:first-child': {
          boxShadow: 'none',
          color: '#FC9916',
        },
      },
    },
    p0: {
      padding: 0,
    },
    callNote: {
      fontSize: 12,
      linrHeight: '16px',
      '& span': {
        display: 'block',
      },
    },
  };
});

export interface HdfcSliderProps {
  patientPhone: string | null;
}

export const HdfcSlider: React.FC<HdfcSliderProps> = (props) => {
  const classes = useStyles({});
  const [callDoctorPopup, setCallDoctorPopup] = React.useState<boolean>(false);
  const [showIntro, setShowIntro] = React.useState<boolean>(true);

  return (
    <div className={classes.hdcContainer}>
      <div className={classes.hdcContent}>
        <img src={require('images/hdfc/hdfc-logo.svg')} alt="HDFC Call Doctor" width="100" />
        {/* Intro */}
        {showIntro && (
          <div className={classes.hdfcIntro}>
            <img src={require('images/hdfc/doctor_connect.svg')} alt="Otp" />
            <Typography className={classes.desc}>
              As our privileged customer in partnership with HDFC
            </Typography>
            <Typography component="h2">You are eligible for a free call to a Doctor</Typography>
            <Typography className={classes.otpError}>
              Note: You will be connected to a General Physician
            </Typography>
            <AphButton onClick={() => setCallDoctorPopup(true)}> CONNECT NOW </AphButton>
          </div>
        )}
      </div>
      <AphDialog open={callDoctorPopup} maxWidth="sm">
        <div className={classes.dialogContent}>
          <div className={classes.dialogHeader}>
            <Typography component="h3">Connect to the Doctor </Typography>
            <Typography>Please follow the steps to connect to Doctor </Typography>
          </div>
          <div className={classes.connectDoctorContent}>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/call-incoming.svg')} alt="" />
              <Typography component="h5">
                Answer the call from <span>‘040-482-17258’</span> to connect.
              </Typography>
            </div>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/call-outgoing.svg')} alt="" />
              <Typography component="h5">The same call will connect to the Doctor.</Typography>
            </div>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/group.svg')} alt="" />
              <Typography component="h5">Wait for the Doctor to connect over the call.</Typography>
            </div>
            <div className={classes.cdDetails}>
              <Typography className={classes.callNote}>
                <span>*Note : </span>Your personal phone number will not be shared.
              </Typography>
            </div>
          </div>
          <div className={classes.btnContainer}>
            <AphButton onClick={() => setCallDoctorPopup(false)}>Cancel</AphButton>
            <AphButton
              color="primary"
              onClick={() => {
                const param = {
                  fromPhone: props.patientPhone,
                  toPhone: HDFC_EXOTEL_NUMBER,
                  callerId: HDFC_EXOTEL_CALLERID,
                };
                callToExotelApi(param);
              }}
            >
              Proceed To Connect
            </AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
