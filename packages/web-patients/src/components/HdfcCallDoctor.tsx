import React from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphDialog, AphInput } from '@aph/web-ui-components';
import { callToExotelApi } from 'helpers/commonHelpers';
import { HDFC_EXOTEL_CALLERID, HDFC_EXOTEL_NUMBER } from 'helpers/constants';

const useStyles = makeStyles((theme: Theme) => {
  return {
    hdcContainer: {
      background: '#fff',
      boxShadow: ' 0px 5px 20px rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: 16,
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
        right: 20,
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
    otpValidator: {
      padding: '20px 0 0',
      display: 'none',
      position: 'relative',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 0',
      },
      '& >img': {
        position: 'absolute',
        top: 20,
        right: 20,
        [theme.breakpoints.down('sm')]: {
          display: 'none',
        },
      },
      '& h2': {
        fontSize: 20,
        fontWeight: 500,
        color: '#0087BA',
        lineHeight: '18px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 14,
        },
      },
    },
    otpContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    otpInput: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 0 0',
      [theme.breakpoints.down('sm')]: {
        padding: 0,
      },
    },
    otp: {
      width: 40,
      margin: '0 30px 0 0',
      [theme.breakpoints.down('sm')]: {
        width: 20,
      },
      '&:last-child': {
        margin: 0,
      },
      '& input': {
        fontsize: 18,
        fontWeight: 500,
        textAlign: 'center',
      },
    },
    btnAction: {
      display: 'flex',
      alignItems: 'center',
      '& button': {
        margin: '0 0 0 10px',
        '&:first-child': {
          boxShadow: 'none',
          color: '#FC9916',
        },
        '&:last-child': {
          '& img': {
            display: 'none',
            [theme.breakpoints.down('sm')]: {
              display: 'block',
            },
          },
        },
        [theme.breakpoints.down('sm')]: {
          '&:last-child': {
            position: 'absolute',
            bottom: -37,
            right: 20,
            width: 44,
            height: 44,
            padding: 10,
            minWidth: 'auto',
            borderRadius: '50%',
            '& p': {
              display: 'none',
            },
          },
        },
      },
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
    cContainer: {
      padding: '10px 0 0',
      // display: 'flex',
      display: 'none',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 30px',
      },

      '& img': {
        width: 100,
        margin: '0 20px 0 0 ',
        [theme.breakpoints.down('sm')]: {
          width: 50,
          margin: '0 15px 0 0 ',
        },
      },
      '& button': {
        position: 'absolute',
        bottom: 10,
        right: 10,
        boxShadow: 'none',
        color: '#FC9916',
        [theme.breakpoints.down('sm')]: {
          margin: '20px 0 0 0',
        },
      },
    },
    cContent: {
      '& >img': {
        position: 'absolute',
        top: 20,
        right: 20,
        margin: 0,
        [theme.breakpoints.down('sm')]: {
          width: 16,
        },
      },
      '& h2': {
        fontSize: 32,
        fontWeight: 700,
        color: '#00B38E',
        lineHeight: '42px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 18,
          lineHeight: '24px',
          margin: 0,
        },
      },
      '& p': {
        fontSize: 18,
        lineHeight: '24px',
        color: '#00B38E',
        margin: '0 0 5px',
        fontWeight: 600,
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
          lineHeight: '12px',
        },
      },
    },
    description: {
      fontSize: '14px !important',
      fontWeight: 300,
      lineHeight: '16px',
      margin: 0,
      color: '#02475b !important',
      [theme.breakpoints.down('sm')]: {
        fontSize: '10px !important',
      },
    },
    recheckOtp: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 20px',
      },
      '& >img': {
        position: 'absolute',
        top: 20,
        right: 20,
        margin: 0,
        [theme.breakpoints.down('sm')]: {
          display: 'none',
        },
      },
      '& h2': {
        fontSize: 32,
        fontWeight: 700,
        color: '#00B38E',
        lineHeight: '42px',
        margin: '0 0 10px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 18,
          lineHeight: '24px',
          margin: '0 0 5px',
        },
      },
      '& p': {
        fontSize: 18,
        lineHeight: '24px',
        color: '#00B38E',
        margin: '0 0 10px',
        fontWeight: 600,
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
          lineHeight: '12px',
        },
      },
      '& button': {
        position: 'absolute',
        bottom: 10,
        right: 10,
        boxShadow: 'none',
        color: '#FC9916',
      },
    },
  };
});

export interface HdfcCallDoctorProps {
  patientPhone: string | null;
}

export const HdfcCallDoctor: React.FC<HdfcCallDoctorProps> = (props) => {
  const classes = useStyles({});
  const [callDoctorPopup, setCallDoctorPopup] = React.useState<boolean>(false);

  return (
    <div className={classes.hdcContainer}>
      <div className={classes.hdcContent}>
        <img src={require('images/hdfc/hdfc-logo.svg')} alt="HDFC Call Doctor" width="100" />
        <div className={classes.hdfcIntro}>
          <img src={require('images/hdfc/otp.svg')} alt="Otp" />
          <Typography className={classes.desc}>
            As our privileged customer and a member of HDFC Bank, you are eligible to enroll in this
            exclusive offer
          </Typography>
          <Typography component="h2">
            Click here to generate your HDFC Bank OTP and complete registration
          </Typography>

          <AphButton>Generate Otp</AphButton>
        </div>
        {/* Otp Validator */}
        <div className={classes.otpValidator}>
          <img src={require('images/hdfc/otp.svg')} alt="Otp" />
          <Typography component="h2">Please Validate OTP Sent by HDFC Bank</Typography>
          <div className={classes.otpContainer}>
            <div className={classes.otpInput}>
              <AphInput className={classes.otp} />
              <AphInput className={classes.otp} />
              <AphInput className={classes.otp} />
              <AphInput className={classes.otp} />
              <AphInput className={classes.otp} />
            </div>
            <div className={classes.btnAction}>
              <AphButton>Resend Otp</AphButton>
              <AphButton color="primary" variant="contained">
                <Typography>Submit Otp</Typography>
                <img src={require('images/ic_arrow_forward.svg')} alt="" />
              </AphButton>
            </div>
          </div>
        </div>
        {/* Congratulations Section */}
        <div className={classes.cContainer}>
          <img src={require('images/hdfc/gift.svg')} alt="Congraulations" />
          <div className={classes.cContent}>
            <img src={require('images/hdfc/medal.svg')} alt="Otp" />
            <Typography component="h2">Congratulations ! </Typography>
            <Typography> You Have Successfully Enrolled For Gold+ Plan</Typography>
            <Typography className={classes.description}>
              You are now eligible for wide range of benefits !
            </Typography>
          </div>
          <AphButton>Go To Details Page</AphButton>
        </div>
        {/* Recheck OTP Section */}
        <div className={classes.recheckOtp}>
          <img src={require('images/hdfc/sorry.svg')} alt="Congraulations" />
          <Typography component="h2">Sorry !</Typography>
          <Typography>
            Unfortunately the OTP did not match or you are not a HDFC Premium Customer
          </Typography>
          <Typography className={classes.description}>
            Please Contact HDFC for further Updates
          </Typography>
          <AphButton>Recheck Otp</AphButton>
        </div>
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
