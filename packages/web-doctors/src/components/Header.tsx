import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { SignIn } from 'components/SignIn';
import { HelpPopup } from 'components/Help';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { Navigation } from 'components/Navigation';
import { useLoginPopupState, useAuth } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.common.white,
      padding: '5px 20px 0 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px 5px 20px',
      },
    },
    logo: {
      lineHeight: 0,
      paddingTop: 5,
      paddingBottom: 6,
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
      marginBottom: 0,
      marginLeft: 20,
      marginTop: -5,
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      '& span': {
        padding: '20px 0 11px 0',
        width: 55,
        display: 'inline-block',
        textAlign: 'center',
      },
      '& img': {
        width: 28,
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
    userActive: {},
    loginForm: {
      width: 280,
      minHeight: 290,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    afterloginForm: {
      width: 320,
      minHeight: 230,
      padding: 15,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    topPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
    },
    signedTopPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
      marginTop: '63px',
    },
    menuItemActive: {
      backgroundColor: '#f7f8f5',
      position: 'relative',
      display: 'inline-block',

      '&:after': {
        position: 'absolute',
        content: '""',
        bottom: 0,
        left: 0,
        height: 5,
        width: '100%',
        backgroundColor: '#00b38e',
      },
    },
    container: {
      maxWidth: 1024,
      margin: 'auto',
      width: 1044,
      display: 'flex',
    },
    cross: {
      position: 'absolute',
      right: 0,
      paddingTop: '13px',
      top: '10px',
      fontSize: '18px',
      color: '#02475b',
    },
    accountIc: {
      marginTop: '9px !important',
      marginRight: '0 !important',
    },
  };
});

export const Header: React.FC = (props) => {
  const classes = useStyles();
  const avatarRef = useRef(null);
  const { isSigningIn, isSignedIn } = useAuth();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [isHelpPopupOpen, setIsHelpPopupOpen] = React.useState(false);
  const [stickyPopup, setStickyPopup] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState(0);
  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <div className={classes.logo}>
          <Link to="/">
            <img src={require('images/ic_logo.png')} />
          </Link>
        </div>
        {isSignedIn && !window.location.href.includes('/profile') && <Navigation />}
        <div className={`${classes.userAccount} ${classes.userAccountLogin}`}>
          <ProtectedWithLoginPopup>
            {({ protectWithLoginPopup, isProtected }) => (
              <div className={`${!isSignedIn ? classes.userCircle : ''}`} ref={avatarRef}>
                {isSigningIn ? (
                  <CircularProgress />
                ) : isSignedIn ? (
                  window.location.href.includes('/profile') ? (
                    <div>
                      <img
                        className={`${classes.accountIc} ${selectedTab === 5 &&
                          classes.menuItemActive}`}
                        onClick={() => {
                          isProtected ? protectWithLoginPopup() : setIsHelpPopupOpen(true);
                          setSelectedTab(5);
                        }}
                        src={require('images/ic_help.svg')}
                      />
                    </div>
                  ) : (
                    <div>
                      <span>
                        <img
                          className={`${selectedTab === 3 && classes.menuItemActive}`}
                          onClick={() => setSelectedTab(3)}
                          src={require('images/ic_inbox.svg')}
                        />
                      </span>
                      <span>
                        <img
                          className={`${selectedTab === 4 && classes.menuItemActive}`}
                          onClick={() => setSelectedTab(4)}
                          src={require('images/ic_notifications.svg')}
                        />
                      </span>
                      <span>
                        <img
                          className={`${selectedTab === 5 && classes.menuItemActive}`}
                          onClick={() => {
                            isProtected ? protectWithLoginPopup() : setIsHelpPopupOpen(true);
                            setSelectedTab(5);
                          }}
                          src={require('images/ic_help.svg')}
                        />
                      </span>
                      <span
                        className={`${window.location.href.includes('/myaccount') &&
                          classes.menuItemActive}`}
                      >
                        <Link to="/myaccount">
                          <img
                            onClick={() => setSelectedTab(6)}
                            src={require('images/ic_profile.svg')}
                          />
                        </Link>
                      </span>
                    </div>
                  )
                ) : (
                  <div>
                    <img
                      className={classes.accountIc}
                      onClick={() =>
                        isProtected ? protectWithLoginPopup() : setIsHelpPopupOpen(true)
                      }
                      src={require('images/ic_account.svg')}
                    />
                  </div>
                )}
              </div>
            )}
          </ProtectedWithLoginPopup>
          {isSignedIn ? (
            <Popover
              open={isHelpPopupOpen}
              anchorEl={avatarRef.current}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              classes={{ paper: classes.signedTopPopover }}
            >
              {isSignedIn ? (
                <Paper className={classes.afterloginForm}>
                  <Button
                    onClick={() => {
                      setIsHelpPopupOpen(false);
                      setSelectedTab(1);
                    }}
                    className={classes.cross}
                  >
                    <img src={require('images/ic_cross.svg')} alt="" />
                  </Button>
                  <HelpPopup setBackArrow={() => setIsHelpPopupOpen(true)} />
                </Paper>
              ) : (
                <Paper className={classes.loginForm}>
                  <Button onClick={() => setIsHelpPopupOpen(false)} className={classes.cross}>
                    <img src={require('images/ic_cross.svg')} alt="" />
                  </Button>
                  <HelpPopup setBackArrow={() => setIsHelpPopupOpen(true)} />
                </Paper>
              )}
            </Popover>
          ) : (
            <Popover
              open={isLoginPopupVisible}
              anchorEl={avatarRef.current}
              onClose={() => {
                stickyPopup && setIsLoginPopupVisible(false);
              }}
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
                <SignIn
                  popup={() => {
                    setIsLoginPopupVisible(false);
                  }}
                  setStickyPopupValue={() => {
                    setStickyPopup(!stickyPopup);
                  }}
                />
              </Paper>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
};
