import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { SignIn } from 'components/SignIn';
import { Navigation } from 'components/Navigatiion';
import { useIsLoggedIn, useLoginPopupState, useIsAuthenticating } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.common.white,
      padding: '20px 20px 7px 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px 5px 20px',
      },
    },
    logo: {
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: 77,
        [theme.breakpoints.down('xs')]: {
          maxWidth: 67,
        },
      },
    },
    userAccount: {
      marginBottom: 10,
      marginLeft: 20,
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      '& img': {
        marginTop: 10,
      },
    },
    userAccountLogin: {
      marginLeft: 'auto',
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

export const Header: React.FC = (props) => {
  const classes = useStyles();
  const avatarRef = useRef(null);
  const isAuthenticating = useIsAuthenticating();
  const { loginPopupVisible, setLoginPopupVisible } = useLoginPopupState();
  const [displayAlert, setDisplayAlert] = React.useState(false);

  const isUserLoggedIn = useIsLoggedIn();

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src={require('images/ic_logo.png')} />
        </Link>
      </div>
      {isUserLoggedIn ? <Navigation /> : null}
      <div className={`${classes.userAccount} ${isUserLoggedIn ? null : classes.userAccountLogin}`}>
        <div
          className={`${classes.userCircle} ${isUserLoggedIn ? classes.userActive : null}`}
          onClick={() => {
            if (isUserLoggedIn) {
              setDisplayAlert(true);
            } else {
              setLoginPopupVisible(true);
            }
          }}
          ref={avatarRef}
        >
          {isAuthenticating ? <CircularProgress /> : <img src={require('images/ic_account.svg')} />}
        </div>
        {/* The below dialog must be removed when the functionality is defined with Logged in User */}
        {isUserLoggedIn ? (
          <Dialog
            open={displayAlert}
            onClose={() => setDisplayAlert(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Logged In</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You are successfully Logged in with Apollo 24x7
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDisplayAlert(false)} color="primary" autoFocus>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        ) : (
          <Popover
            open={loginPopupVisible}
            anchorEl={avatarRef.current}
            onClose={() => setLoginPopupVisible(false)}
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
        )}
      </div>
    </header>
  );
};
