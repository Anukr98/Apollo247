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
import { Navigation } from 'components/Navigation';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';

import { useLoginPopupState, useAuth } from 'hooks/authHooks';
import { AppLocations } from './AppLocations';
import { LocationProvider } from 'components/LocationProvider';
import { MedicinesCartProvider, MedicinesCartContext } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.common.white,
      padding: '0 20px 0 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '0 20px 0 20px',
      },
    },
    logo: {
      paddingTop: 20,
      paddingBottom: 11,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 15,
        paddingBottom: 9,
      },
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: 77,
        verticalAlign: 'middle',
        [theme.breakpoints.down('xs')]: {
          maxWidth: 67,
        },
      },
    },
    userAccount: {
      marginLeft: 20,
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        marginLeft: 10,
      },
    },
    userAccountLogin: {
      marginLeft: 'auto',
    },
    userCircle: {
      display: 'flex',
      width: 48,
      height: 48,
      backgroundColor: '#afc3c9',
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
      alignItems: 'center',
      justifyContent: 'center',
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
  const classes = useStyles({});
  const avatarRef = useRef(null);
  const { signOut, isSigningIn, isSignedIn } = useAuth();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <header className={classes.header} data-cypress="Header">
      <div className={classes.logo}>
        <Link to="/">
          <img src={require('images/ic_logo.png')} />
        </Link>
      </div>
      {isSignedIn && (
        <LocationProvider>
          <AppLocations />
        </LocationProvider>
      )}
      {isSignedIn && (
        <MedicinesCartContext.Consumer>{() => <Navigation />}</MedicinesCartContext.Consumer>
      )}
      <div className={`${classes.userAccount} ${isSignedIn ? '' : classes.userAccountLogin}`}>
        <ProtectedWithLoginPopup>
          {({ protectWithLoginPopup, isProtected }) => (
            <div
              className={`${classes.userCircle} ${isSignedIn ? classes.userActive : ''}`}
              onClick={() => (isSignedIn ? setIsDialogOpen(true) : protectWithLoginPopup())}
              ref={avatarRef}
            >
              {isSigningIn ? <CircularProgress /> : <img src={require('images/ic_account.svg')} />}
            </div>
          )}
        </ProtectedWithLoginPopup>
        {isSignedIn ? (
          <>
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
              <DialogTitle>{''}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  You are successfully Logged in with Apollo 24x7
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button color="primary" onClick={() => signOut()}>
                  Sign out
                </Button>
                <Button color="primary" onClick={() => setIsDialogOpen(false)} autoFocus>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <Popover
            open={isLoginPopupVisible}
            anchorEl={avatarRef.current}
            onClose={() => (isSignedIn ? setIsLoginPopupVisible(false) : null)}
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
