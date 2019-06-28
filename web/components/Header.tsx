import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { SignIn } from 'components/SignIn';
import { useAuthenticating } from 'hooks/authHooks';
import { Navigation } from 'components/Navigatiion';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.common.white,
      padding: '20px 20px 7px 20px',
    },
    logo: {
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: 77,
      },
    },
    userAccount: {
      marginBottom: 10,
      marginLeft: 20,
      '& img': {
        marginTop: 10,
      },
    },
    userCircle: {
      display: 'block',
      width: 48,
      height: 48,
      backgroundColor: '#afc3c9',
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
    },
    userActive: {
      backgroundColor: theme.palette.secondary.dark,
    },
    loginForm: {
      width: 280,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    topPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
    },
  };
});

export interface SignInProps {}

export const Header: React.FC = (props) => {
  const classes = useStyles();
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const avatarRef = useRef(null);
  const authenticating = useAuthenticating();

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src={require('images/ic_logo.png')} />
        </Link>
      </div>
      <Navigation />
      <div className={classes.userAccount}>
        <div ref={avatarRef} className={`${classes.userCircle} ${classes.userActive}`}>
          {authenticating ? <CircularProgress /> : <img src={require('images/ic_account.svg')} />}
        </div>
        <Popover
          open={popoverIsOpen}
          anchorEl={avatarRef.current}
          onClose={() => setPopoverIsOpen(false)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          classes={{ paper: classes.topPopover }}
        >
          <Paper className={classes.loginForm}>
            <SignIn />
          </Paper>
        </Popover>
      </div>
    </header>
  );
};
