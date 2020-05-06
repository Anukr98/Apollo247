import { Theme, Typography } from '@material-ui/core';
import { useAuth } from 'hooks/authHooks';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { TestCall } from './TestCall';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '18px 0 50px 0',
      '& p': {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 10,
      },
    },
    afterloginFormWrap: {
      padding: '0px 0 50px 0',
      '& p': {
        paddingTop: '25px',
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.5,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 10,
      },
      '& h2': {
        fontSize: 32,
        fontWeight: 600,
        marginTop: 5,
      },
    },
    helpWrap: {
      paddingBottom: 0,
    },
    afterHelpWrap: {
      paddingBottom: 0,
      padding: '0px 0 50px 0',
    },
    orange: {
      color: '#fc9916',
      fontWeight: 600,
      fontSize: 18,
    },
    helpSection: {
      borderBottom: '1px solid rgba(2, 71, 91, 0.15)',
      paddingBottom: 5,
      '&:last-child': {
        borderBottom: 'none',
      },

      '& h4': {
        fontSize: 16,
        lineHeight: '24px',
        color: '#0087ba',
        fontWeight: 600,
        margin: '10px 0',
      },
      '& h5': {
        fontSize: 14,
        lineHeight: '18px',
        color: '#02475b',
        fontWeight: 500,
        margin: '3px 0',
      },
      '& h6': {
        fontSize: 14,
        lineHeight: '18px',
        color: '#02475b',
        fontWeight: 500,
        opacity: 0.6,
        margin: '3px 0',
      },
    },
    needHelp: {
      marginBottom: 20,
    },
    testCallWrappper: {
      borderBottom: '1px solid rgba(2, 71, 91, 0.15)',
    },
  };
});

interface HelpProps {
  setBackArrow: () => void;
}
export const HelpPopup: React.FC<HelpProps> = (props) => {
  const { isSignedIn } = useAuth();
  const classes = useStyles({});
  const helpData = [
    {
      name: 'SPOC for Apollo Hyderabad Doctors',
      doctorName: 'Ms. Sreevani',
      helpNumber: '+9177027 00910',
      email: 'sreevani_u@apollopharmacy.org',
    },
    {
      name: 'SPOC for Apollo Chennai Doctors',
      doctorName: 'Ms. Aruna',
      helpNumber: '+9178239 13040',
      email: 'edocmh_cni@apollohospitals.com',
    },
    {
      name: 'SPOC for ATHS Doctors',
      doctorName: 'Call Centre',
      helpNumber: '18001021066',
      email: 'mrc_support@healthnet-global.com',
    },
  ];
  return (
    <div
      className={
        isSignedIn
          ? `${classes.afterloginFormWrap} ${classes.afterHelpWrap}`
          : `${classes.loginFormWrap} ${classes.helpWrap}`
      }
    >
      <Typography variant="h2" className={classes.needHelp}>
        need help?
      </Typography>
      <div className={classes.testCallWrappper}>
        <TestCall />
      </div>

      {helpData &&
        helpData.length > 0 &&
        helpData.map((helpObj) => (
          <div className={classes.helpSection}>
            <h4>{helpObj.name}</h4>
            <h5>
              {helpObj.doctorName} | {helpObj.helpNumber}
            </h5>
            <h6>{helpObj.email}</h6>
          </div>
        ))}
    </div>
  );
};
