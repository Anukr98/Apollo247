import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import { SignIn } from 'components/SignIn';
import { Otp } from 'components/Otp';
import * as AuthZero from 'auth0-js';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      boxShadow: '0 0 5px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: '#ffffff',
      padding: '20px 20px 3px 20px',
    },
    logo: {
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: '80px',
      },
    },
    userAccount: {
      marginLeft: 'auto',
      '& img': {
        marginTop: '10px',
      },
    },
    userCircle: {
      display: 'block',
      width: '48px',
      height: '48px',
      backgroundColor: '#afc3c9',
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
    },
    loginForm: {
      width: '280px',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: '#ffffff',
    },
  };
});

export interface SignInProps {}

export const Header: React.FC = (props) => {
  const classes = useStyles();
  const [signedIn, setSignedIn] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  if (signedIn) {
    const authService = new AuthZero.WebAuth({
      domain: 'dev-7fta5h39.auth0.com',
      clientID: 'qoSVdCWJlPU0gwD7ES3p34V7aRGgdM6C',
      redirectUri: 'http://localhost:3000/auth0-callback',
      responseType: 'token id_token',
      scope: 'openid',
    });

    authService.authorize();
  }

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src={require('images/ic_logo.svg')} />
        </Link>
      </div>
      <div className={classes.userAccount}>
        <div
          className={classes.userCircle}
          aria-describedby={id}
          onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
        >
          <img src={require('images/ic_account.svg')} />
        </div>
        <Popper id={id} open={open} anchorEl={anchorEl} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper className={classes.loginForm}>
                {signedIn ? <Otp /> : <SignIn onSignIn={(val) => setSignedIn(val)} />}
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>
    </header>
  );
};
