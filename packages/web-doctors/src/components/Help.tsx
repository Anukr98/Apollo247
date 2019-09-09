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
      <Typography variant="h2">need help?</Typography>
      <p>
        Don’t worry. We are here for you :)
        <p>
          Call <span className={classes.orange}>1800 - 3455 - 3455</span> to reach an expert from
          our team who will resolve your issue.
        </p>
      </p>
    </div>
  ) : (
    <div className={`${classes.loginFormWrap} ${classes.helpWrap}`}>
      <Typography variant="h2">need help?</Typography>
      <p>
        Don’t worry. We are here for
        <br /> you :)
        <p>
          Call <span className={classes.orange}>1800 - 3455 - 3455</span> to reach an expert from
          our team who will resolve your issue.
        </p>
      </p>
    </div>
  );
};
