import { Theme, Typography } from '@material-ui/core';
import { useAuth } from 'hooks/authHooks';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

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
        fontSize: 36,
        fontWeight: 600,
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
  };
});

interface HelpProps {
  setBackArrow: () => void;
}
export const HelpPopup: React.FC<HelpProps> = (props) => {
  const { isSignedIn } = useAuth();
  const classes = useStyles();

  return isSignedIn ? (
    <div className={`${classes.afterloginFormWrap} ${classes.afterHelpWrap}`}>
      <Typography variant="h2" className={classes.needHelp}>
        need help?
      </Typography>
      <div className={classes.helpSection}>
        <h4>SPOC for Apollo Hyderabad Doctors</h4>
        <h5>Ms. Sreevani | 7702700910 </h5>
        <h6>sreevani_u@apollohospitals.com</h6>
      </div>
      <div className={classes.helpSection}>
        <h4>SPOC for Apollo Chennai Doctors</h4>
        <h5>Mr. Sreekanth | 09941134567 </h5>
        <h6>edocmh_cni@apollohospitals.com</h6>
      </div>
      <div className={classes.helpSection}>
        <h4>SPOC for ATHS Doctors</h4>
        <h5>Call Centre | 18001021066</h5>
        <h6>mrc_support@healthnet-global.com</h6>
      </div>
    </div>
  ) : (
    <div className={`${classes.loginFormWrap} ${classes.helpWrap}`}>
      <Typography variant="h2" className={classes.needHelp}>
        need help?
      </Typography>
      <div className={classes.helpSection}>
        <h4>SPOC for Apollo Hyderabad Doctors</h4>
        <h5>Ms. Sreevani | 7702700910 </h5>
        <h6>sreevani_u@apollohospitals.com</h6>
      </div>
      <div className={classes.helpSection}>
        <h4>SPOC for Apollo Chennai Doctors</h4>
        <h5>Mr. Sreekanth | 09941134567 </h5>
        <h6>edocmh_cni@apollohospitals.com</h6>
      </div>
      <div className={classes.helpSection}>
        <h4>SPOC for ATHS Doctors</h4>
        <h5>Call Centre | 18001021066</h5>
        <h6>mrc_support@healthnet-global.com</h6>
      </div>
    </div>
  );
};
