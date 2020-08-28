import React from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphDialog } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    hdcContainer: {
      background: '#fff',
      boxShadow: ' 0px 5px 20px rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: 16,
      margin: '20px 0 0',
      width: 400,
      position: 'relative',
      '&:before': {
        content: "''",
        position: 'absolute',
        top: 20,
        left: -45,
        borderLeft: '1px solid #ccc',
        bottom: 20,
        [theme.breakpoints.down('sm')]: {
          display: 'none',
        },
      },
      '& h2': {
        fontSize: 14,
        fontWeight: 600,
        color: '#07AE8B',
        lineHeight: '20px',
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
      fontSize: 10,
      fontWeight: 300,
      color: '#01475B',
      lineHeight: '16px',
      fontStyle: 'italic',
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
    callNote: {
      fontSize: 12,
      linrHeight: '16px',
      '& span': {
        display: 'block',
      },
    },
  };
});

export const HdfcCallDoctor: React.FC = (props) => {
  const classes = useStyles({});
  const [callDoctorPopup, setCallDoctorPopup] = React.useState<boolean>(false);
  return (
    <div className={classes.hdcContainer}>
      <div className={classes.hdcContent}>
        <img src={require('images/hdfc/hdfc-logo.svg')} alt="HDFC Call Doctor" width="100" />
        <Typography className={classes.desc}>
          As our privellaged customer in partnership with HDFC
        </Typography>
        <Typography component="h2">You are eligible for a Free Call to a Doctor</Typography>
        <Typography className={classes.note}>
          Note : You will be connected to a General Physician
        </Typography>
        <AphButton onClick={() => setCallDoctorPopup(true)}>Connect</AphButton>
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
            <AphButton color="primary">Proceed To Connect</AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
