import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { SignIn } from 'components/SignIn';
//import { Navigation } from 'components/Navigatiion';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useLoginPopupState, useAuth } from 'hooks/authHooks';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.common.white,
      padding: '10px 20px 5px 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px 5px 20px',
      },
    },
    logo: {
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: 64,
        [theme.breakpoints.down('xs')]: {
          maxWidth: 62,
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
  const { signOut, isSigningIn, isSignedIn } = useAuth();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src={require('images/ic_logo.png')} />
        </Link>
      </div>
      {/* {isSignedIn && <Navigation />} */}
      <div className={`${classes.userAccount} ${classes.userAccountLogin}`}>
        <ProtectedWithLoginPopup>
          {({ protectWithLoginPopup, isProtected }) => (
            <div
              onClick={() => (isSignedIn ? setIsDialogOpen(true) : protectWithLoginPopup())}
              ref={avatarRef}
            >
              {isSigningIn ? <CircularProgress /> : <img src={require('images/ic_help.svg')} />}
            </div>
          )}
        </ProtectedWithLoginPopup>
        {isSignedIn ? (
          <>
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
              <DialogTitle>Logged In</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  You are successfully Logged in with Apollo 24x7
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsDialogOpen(false)} color="primary" autoFocus>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
            {/* <Button variant="text" size="small" onClick={() => signOut()} color="primary">
              Sign out
            </Button> */}
          </>
        ) : (
            <Popover
              open={isLoginPopupVisible}
              anchorEl={avatarRef.current}
              onClose={() => setIsLoginPopupVisible(false)}
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
