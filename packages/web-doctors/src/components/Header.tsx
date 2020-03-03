import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { SignIn } from 'components/SignIn';
import { HelpPopup } from 'components/Help';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { Navigation } from 'components/Navigation';
import { useLoginPopupState, useAuth } from 'hooks/authHooks';
import { DoctorOnlineStatusButton } from 'components/DoctorOnlineStatusButton';
import { LoggedInUserType, DOCTOR_ONLINE_STATUS, REQUEST_ROLES } from 'graphql/types/globalTypes';
import { UPDATE_DOCTOR_ONLINE_STATUS } from 'graphql/profiles';
import Pubnub from 'pubnub';
import {
  UpdateDoctorOnlineStatus,
  UpdateDoctorOnlineStatusVariables,
} from 'graphql/types/UpdateDoctorOnlineStatus';
import { clientRoutes } from 'helpers/clientRoutes';
import IdleTimer from 'react-idle-timer';
import ReactCountdownClock from 'react-countdown-clock';
import { useMutation } from 'react-apollo-hooks';
import { ApolloError } from 'apollo-client';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.common.white,
      padding: '5px 20px 0 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '5px 15px 4px 15px',
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
        cursor: 'pointer',
      },
      '& img': {
        width: 28,
      },
    },
    userActiveDark: {
      height: 29,
      borderRadius: '50%',
      backgroundColor: theme.palette.secondary.dark,
    },
    userAccountLogin: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
    },
    userCircle: {
      display: 'block',
      width: 48,
      height: 48,
      backgroundColor: '#afc3c9',
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
      marginTop: 8,
    },
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
    menuItemActiveHelp: {
      backgroundColor: '#f7f7f7',
      position: 'relative',
      display: 'inline-block',
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
    accontDiv: {
      height: 48,
    },
    popoverTile: {
      color: '#fcb716',
      fontWeight: 500,
    },
    countdownLoader: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
  };
});

export const Header: React.FC = (props) => {
  const classes = useStyles();
  const avatarRef = useRef(null);
  const { currentPatient, signOut, isSigningIn, isSignedIn, sessionClient } = useAuth();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [isHelpPopupOpen, setIsHelpPopupOpen] = React.useState(false);
  const [stickyPopup, setStickyPopup] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [showIdleTimer, setShowIdleTimer] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [showLoader, setShowLoader] = React.useState(false);

  // TODO remove currentPatient and name it as currentDoctor
  const currentUserType = useAuth().currentUserType;

  const isJuniorDoctor = useAuth() && currentUserType === LoggedInUserType.JUNIOR;
  const isAdminDoctor = useAuth() && currentUserType === LoggedInUserType.JDADMIN;
  const isSecretary = useAuth() && currentUserType === LoggedInUserType.SECRETARY;

  function getCookieValue() {
    const name = 'action=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
  const idleTimerRef = useRef(null);
  const idleTimeValueInMinutes = 10;
  const changeDoctorStatus = () => {
    if (currentPatient && currentPatient.id) {
      setShowLoader(true);
      mutationUpdateDoctorOnlineStatus()
        .then((response) => {
          if (isOnline) {
            setIsOnline(false);
          } else {
            setIsOnline(true);
            setShowIdleTimer(false);
          }
          setShowLoader(false);
        })
        .catch((e: ApolloError) => {
          setShowLoader(false);
          console.log('An error occurred updating doctor status.');
        });
    }
  };
  const mutationUpdateDoctorOnlineStatus = useMutation<
    UpdateDoctorOnlineStatus,
    UpdateDoctorOnlineStatusVariables
  >(UPDATE_DOCTOR_ONLINE_STATUS, {
    variables: {
      doctorId: currentPatient && currentPatient.id ? currentPatient.id : '',
      onlineStatus: isOnline ? DOCTOR_ONLINE_STATUS.AWAY : DOCTOR_ONLINE_STATUS.ONLINE,
    },
  });
  const subscribekey: string = process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '';
  const publishkey: string = process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '';
  const config: Pubnub.PubnubConfig = {
    subscribeKey: subscribekey,
    publishKey: publishkey,
    ssl: true,
    uuid: REQUEST_ROLES.DOCTOR,
  };
  const pubnub = new Pubnub(config);
  const sendNotification = (notificationText: string) => {
    new Notification('Hi there!', {
      body: notificationText,
      icon: 'https://bit.ly/2DYqRrh',
    });
  };

  useEffect(() => {
    if (
      isSignedIn &&
      !isJuniorDoctor &&
      !isAdminDoctor &&
      !isSecretary &&
      currentPatient &&
      currentPatient.id
    ) {
      console.log(currentPatient.id);
      pubnub.subscribe({
        channels: [currentPatient.id],
        withPresence: true,
      });
      pubnub.addListener({
        message(message: any) {
          if (Notification.permission === 'granted') {
            // show notification here
            sendNotification(message.message.message);
          } else {
            // request permission from user
            Notification.requestPermission()
              .then(function(p) {
                if (p === 'granted') {
                  // show notification here
                  sendNotification(message.message.message);
                } else {
                  const logObject = {
                    api: 'NotificationRequestPermission',
                    doctorId: currentPatient!.id,
                    doctorDisplayName: currentPatient!.displayName,
                    currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                    error: 'Browser Notification Request Permission is Blocked',
                  };

                  sessionClient.notify(JSON.stringify(logObject));
                  console.log('User blocked notifications.');
                }
              })
              .catch(function(err) {
                const logObject = {
                  api: 'NotificationRequestPermission',
                  doctorId: currentPatient!.id,
                  doctorDisplayName: currentPatient!.displayName,
                  currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                  error: 'Error occuered in Notification Request Permissio in catch block',
                };
                sessionClient.notify(JSON.stringify(logObject));
                console.error(err);
              });
          }
        },
      });
      return () => {
        pubnub.unsubscribe({ channels: [currentPatient.id] });
      };
    }
  }, []);
  return (
    <header className={classes.header}>
      {!isJuniorDoctor &&
        isSignedIn &&
        getCookieValue() !== 'audiocall' &&
        getCookieValue() !== 'videocall' && (
          <IdleTimer
            ref={idleTimerRef}
            element={document}
            onIdle={(e) => {
              setShowIdleTimer(true);
            }}
            debounce={250}
            timeout={1000 * 60 * idleTimeValueInMinutes}
          />
        )}
      <div className={classes.container}>
        <div className={classes.logo}>
          <Link to="/">
            <img src={require('images/ic_logo.png')} />
          </Link>
        </div>
        {isSignedIn &&
          !window.location.href.includes('/profile') &&
          !window.location.href.includes('/patientlogdetailspage') && <Navigation />}
        <div className={`${classes.userAccount} ${classes.userAccountLogin}`}>
          {isJuniorDoctor ? <DoctorOnlineStatusButton /> : null}
          <ProtectedWithLoginPopup>
            {({ protectWithLoginPopup, isProtected }) => (
              <div
                className={`${!isSignedIn && !isSecretary ? classes.userCircle : ''}`}
                ref={avatarRef}
              >
                {isSigningIn ? (
                  <CircularProgress />
                ) : isSignedIn ? (
                  window.location.href.includes('/profile') ? (
                    <div>
                      <img
                        title="Help"
                        className={`${classes.accountIc} ${selectedTab === 5 &&
                          classes.menuItemActive}`}
                        src={require('images/ic_help.svg')}
                      />
                      {/* <span>
                        <img
                          className={classes.userActiveDark}
                          onClick={() => setIsDialogOpen(true)}
                          src={require('images/ic_account.svg')}
                        />
                      </span> */}
                    </div>
                  ) : (
                    <div>
                      {!isJuniorDoctor && !isAdminDoctor ? (
                        <span title="Inbox">
                          <img
                            onClick={() => setSelectedTab(3)}
                            src={require('images/ic_inbox.svg')}
                          />
                        </span>
                      ) : null}
                      {!isJuniorDoctor && !isAdminDoctor ? (
                        <span title="Notification">
                          <img
                            onClick={() => setSelectedTab(4)}
                            src={require('images/ic_notifications.svg')}
                          />
                        </span>
                      ) : null}
                      {!isAdminDoctor && (
                        <span
                          title="Help"
                          className={`${selectedTab === 5 && classes.menuItemActiveHelp}`}
                        >
                          <img
                            onClick={() => {
                              isProtected ? protectWithLoginPopup() : setIsHelpPopupOpen(true);
                              setSelectedTab(5);
                            }}
                            src={require('images/ic_help.svg')}
                          />
                        </span>
                      )}
                      {isJuniorDoctor || isAdminDoctor ? (
                        <span
                          title="My Profile"
                          className={`${window.location.href.includes('/jd-profile') &&
                            classes.menuItemActive}`}
                        >
                          <Link to={clientRoutes.juniorDoctorProfile()}>
                            <img
                              onClick={() => setSelectedTab(6)}
                              src={require('images/ic_profile.svg')}
                            />
                          </Link>
                        </span>
                      ) : (
                        <span
                          title="My Account"
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
                      )}

                      {/* <span>
                        <img
                          className={classes.userActiveDark}
                          onClick={() => setIsDialogOpen(true)}
                          src={require('images/ic_account.svg')}
                        />
                      </span> */}
                    </div>
                  )
                ) : !isSecretary ? (
                  <div
                    className={classes.accontDiv}
                    onClick={() => {
                      if (isAdminDoctor) {
                        setIsDialogOpen(true);
                      } else {
                        isProtected ? protectWithLoginPopup() : setIsHelpPopupOpen(true);
                        setSelectedTab(5);
                      }
                    }}
                  >
                    <img
                      className={classes.accountIc}
                      onClick={() => {
                        if (isProtected) {
                          protectWithLoginPopup();
                        } else if (!isAdminDoctor) {
                          setIsHelpPopupOpen(true);
                        }
                      }}
                      src={require('images/ic_account.svg')}
                    />
                  </div>
                ) : (
                  <div>
                    <span
                      title="Help"
                      className={`${selectedTab === 5 && classes.menuItemActiveHelp}`}
                    >
                      <img
                        onClick={() => {
                          setIsHelpPopupOpen(true);
                          setSelectedTab(5);
                        }}
                        src={require('images/ic_help.svg')}
                      />
                    </span>
                    {!window.location.href.includes('/secretary') && (
                      <span
                        title="My Profile"
                        className={`${selectedTab === 6 && classes.menuItemActive}`}
                      >
                        <Link to="/myaccount">
                          <img
                            onClick={() => setSelectedTab(6)}
                            src={require('images/ic_profile.svg')}
                          />
                        </Link>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </ProtectedWithLoginPopup>
          <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
            <DialogTitle>{''}</DialogTitle>
            <DialogContent>
              <DialogContentText>You are successfully Logged in with Apollo 24x7</DialogContentText>
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
          {isSignedIn || isAdminDoctor || isSecretary ? (
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
        <Dialog
          open={showIdleTimer}
          onClose={() => setShowIdleTimer(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <DialogTitle className={classes.popoverTile}>Apollo 24x7 - Alert</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {isOnline
                ? "Hi! Seems like you've gone offline. Please click on 'Cancel' to continue."
                : "You have been marked as 'Away', please click on 'Ok' to make yourself 'Online'"}
              {isOnline && (
                <div className={classes.countdownLoader}>
                  <ReactCountdownClock
                    seconds={60}
                    color="#fcb716"
                    alpha={0.9}
                    size={50}
                    onComplete={() => changeDoctorStatus()}
                  />
                </div>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => {
                if (isOnline) {
                  setShowIdleTimer(false);
                } else {
                  changeDoctorStatus();
                }
              }}
              disabled={showLoader}
              autoFocus
            >
              {isOnline ? 'Cancel' : 'Ok'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </header>
  );
};
