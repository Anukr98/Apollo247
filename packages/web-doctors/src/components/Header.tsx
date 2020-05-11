import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { SignIn } from 'components/SignIn';
import { HelpPopup } from 'components/Help';
import Scrollbars from 'react-custom-scrollbars';
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
import {
  MarkMessageToUnread,
  MarkMessageToUnreadVariables,
} from 'graphql/types/MarkMessageToUnread';
//import { Offline, Online } from 'react-detect-offline';
import Pubnub from 'pubnub';
import {
  UPDATE_DOCTOR_ONLINE_STATUS,
  GET_NOTIFICATION,
  MARK_MESSAGE_TO_UNREAD,
} from 'graphql/profiles';
import {
  UpdateDoctorOnlineStatus,
  UpdateDoctorOnlineStatusVariables,
} from 'graphql/types/UpdateDoctorOnlineStatus';
import { clientRoutes } from 'helpers/clientRoutes';
import IdleTimer from 'react-idle-timer';
import ReactCountdownClock from 'react-countdown-clock';
import { useMutation, useQuery } from 'react-apollo-hooks';
import { ApolloError } from 'apollo-client';
import moment from 'moment';
import { GetNotifications_getNotifications_notificationData as NotificationDataType } from 'graphql/types/GetNotifications';

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
    notificationPopup: {
      padding: 0,
      paddingTop: 40,
    },
    notificationPopupEmpty: {
      padding: 0,
      minHeight: 'auto',
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
    notificationcross: {
      position: 'absolute',
      right: 0,
      paddingTop: 13,
      top: 0,
      fontSize: 18,
      color: '#02475b',
      zIndex: 99,
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
    notificationGroup: {
      paddingTop: 0,
    },
    notification: {
      cursor: 'pointer',
    },
    notificationRow: {
      borderBottom: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      padding: '12px 15px 12px 15px',
    },
    noticationImg: {
      borderRadius: '50%',
      height: 40,
    },
    timeStamp: {
      fontSize: 10,
      color: 'rgba(1, 71, 91, 0.6)',
      paddingTop: 3,
    },
    noticationContent: {
      paddingLeft: 12,
      fontSize: 15,
      color: '#01475b',
    },
    bold: {
      fontWeight: 'bold',
    },
    notificationIcon: {
      position: 'relative',
    },
    notificationCount: {
      position: 'absolute',
      right: 15,
      top: 22,
      backgroundColor: '#ff748e',
      width: '14px !important',
      height: 14,
      borderRadius: '50%',
      fontSize: 7,
      padding: '3px 0 !important',
      color: '#fff',
    },
    emptyNotification: {
      fontSize: 16,
      padding: '50px 20px 20px',
      textAlign: 'center',
    },
  };
});

export const Header: React.FC = (props) => {
  const classes = useStyles({});
  const avatarRef = useRef(null);
  const scrollbarRef = useRef(null);
  const { currentPatient, signOut, isSigningIn, isSignedIn, sessionClient } = useAuth();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [isHelpPopupOpen, setIsHelpPopupOpen] = React.useState(false);
  const [isHelpPopupOpen1, setIsHelpPopupOpen1] = React.useState(false);
  const [stickyPopup, setStickyPopup] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [showIdleTimer, setShowIdleTimer] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [showLoader, setShowLoader] = React.useState(false);
  let content: [React.ReactNode] = [null];
  let notificationCount: number = 0;

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
  const mutationMarkMessageToUnread = useMutation<
    MarkMessageToUnread,
    MarkMessageToUnreadVariables
  >(MARK_MESSAGE_TO_UNREAD);

  const callMessageReadAction = (appointmentId: string, doctorId: string, patientId: string) => {
    setIsHelpPopupOpen1(false);
    mutationMarkMessageToUnread({
      variables: {
        eventId: appointmentId,
      },
    })
      .then((response) => {
        window.location.href = clientRoutes.ConsultTabs(appointmentId, patientId, '1');
      })
      .catch((e: ApolloError) => {
        console.log(e, 'erroe');
      });
  };
  const subscribekey: string = process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '';
  const publishkey: string = process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '';
  const config: Pubnub.PubnubConfig = {
    subscribeKey: subscribekey,
    publishKey: publishkey,
    ssl: true,
    uuid: 'SD',
  };
  const pubnub = new Pubnub(config);
  const sendNotification = (notificationText: string) => {
    new Notification('Hi there!', {
      body: notificationText,
      icon: 'https://bit.ly/2DYqRrh',
    });
  };
  const pageRefreshTimeInSeconds = 30;
  const { data, loading } =
    isSignedIn &&
    !isJuniorDoctor &&
    !isAdminDoctor &&
    !isSecretary &&
    currentPatient &&
    currentPatient.id
      ? useQuery(GET_NOTIFICATION, {
          variables: {
            toId: currentPatient.id,
            // toId: currentPatient.id
            // startDate: "2020-04-30",
            // endDate: "2020-05-07"
          },
          fetchPolicy: 'no-cache',
          pollInterval: pageRefreshTimeInSeconds * 1000,
          notifyOnNetworkStatusChange: true,
        })
      : { data: {}, loading: false };
  //console.log(loading, data);

  const getFormattedDate = (date: string) => {
    const dateFormat = moment(date).format('DD MMM YYYY');
    const timeStamp = moment(date).format('hh.mm A');
    if (moment().format('DD MMM YYYY') === dateFormat) {
      return `Today, ${timeStamp}`;
    } else if (
      moment()
        .add(-1, 'days')
        .format('DD MMM YYYY') === dateFormat
    ) {
      return `Yesterday, ${timeStamp}`;
    }
    return `${dateFormat}, ${timeStamp} `;
  };

  const sortByDate = (notificationData: NotificationDataType[]) => {
    return notificationData.sort((data1: NotificationDataType, data2: NotificationDataType) => {
      const date1 = new Date(data1.lastUnreadMessageDate);
      const date2 = new Date(data2.lastUnreadMessageDate);
      return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
    });
  };

  if (
    //!loading &&
    data &&
    data.getNotifications &&
    data.getNotifications.notificationData &&
    data.getNotifications.notificationData.length > 0
  ) {
    const notificationData = sortByDate(data.getNotifications.notificationData);
    notificationCount = notificationData.length;
    content = [
      <div onContextMenu={(e) => e.preventDefault()}>
        <div className={classes.notificationGroup}>
          {notificationData.map((notificationObject: any, index: any) => {
            return (
              <div className={classes.notification}>
                <div
                  className={classes.notificationRow}
                  onClick={() => {
                    callMessageReadAction(
                      notificationObject.appointmentId,
                      notificationObject.doctorId,
                      notificationObject.patientId
                    );
                  }}
                >
                  <Grid container>
                    <Grid item lg={2} sm={2} xs={2}>
                      <img
                        className={classes.noticationImg}
                        src={require('images/message-notification.png')}
                      />
                    </Grid>
                    <Grid item lg={10} sm={10} xs={10} className={classes.noticationContent}>
                      {`${
                        notificationObject.unreadNotificationsCount > 1 ? 'There are' : 'There is'
                      }`}{' '}
                      {`${notificationObject.unreadNotificationsCount} ${
                        notificationObject.unreadNotificationsCount > 1
                          ? 'new messages'
                          : 'new message'
                      }`}{' '}
                      from your patient,{' '}
                      <span className={classes.bold}>
                        {notificationObject.patientFirstName} {notificationObject.patientLastName}
                      </span>
                      <div className={classes.timeStamp}>
                        {getFormattedDate(notificationObject.lastUnreadMessageDate)}
                      </div>
                    </Grid>
                  </Grid>
                </div>
              </div>
            );
          })}
        </div>
      </div>,
    ];
  }
  useEffect(() => {
    if (
      isSignedIn &&
      !isJuniorDoctor &&
      !isAdminDoctor &&
      !isSecretary &&
      currentPatient &&
      currentPatient.id
    ) {
      pubnub.subscribe({
        channels: [currentPatient.id],
      });
      pubnub.addListener({
        message(message: any) {
          if (Notification.permission === 'granted') {
            // show notification here
            sendNotification(message.message.message);
          } else {
            // request permission from user
            Notification.requestPermission()
              .then((p) => {
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
              .catch((err) => {
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
      {/* <Offline>
        <Dialog open={true} style={{ zIndex: 9999 }}>
          <DialogTitle>{''}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Seems like you are offline. Please check your internet connection
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </Offline> */}
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
                    </div>
                  ) : (
                    <div>
                      {!isJuniorDoctor && !isAdminDoctor ? (
                        <span title="Inbox" style={{ display: 'none' }}>
                          <img
                            onClick={() => setSelectedTab(3)}
                            src={require('images/ic_inbox.svg')}
                          />
                        </span>
                      ) : null}
                      {!isJuniorDoctor && !isAdminDoctor ? (
                        <span
                          title="Notification"
                          className={classes.notificationIcon}
                          onClick={() => {
                            setSelectedTab(4);
                            setIsHelpPopupOpen1(true);
                            // setTimeout(() => {
                            //   const node = (scrollbarRef as any).current;
                            //   if (node) node.scrollToBottom();
                            // }, 100);
                          }}
                        >
                          <img src={require('images/ic_notifications.svg')} />
                          {notificationCount > 0 && (
                            <span className={classes.notificationCount}>{notificationCount}</span>
                          )}
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

          <Popover
            open={isHelpPopupOpen1}
            anchorEl={avatarRef.current}
            onClose={() => setIsHelpPopupOpen1(false)}
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
            <Paper
              className={`${classes.loginForm} ${
                content && content.length > 0 && content[0]
                  ? classes.notificationPopup
                  : classes.notificationPopupEmpty
              }`}
            >
              <Button
                onClick={() => setIsHelpPopupOpen1(false)}
                className={classes.notificationcross}
              >
                <img src={require('images/ic_cross.svg')} alt="" />
              </Button>
              {content && content.length > 0 && content[0] ? (
                <Scrollbars autoHide={true} autoHeight ref={scrollbarRef} autoHeightMin={280}>
                  <div>
                    <div>{content[0]}</div>
                  </div>
                </Scrollbars>
              ) : (
                <div className={classes.emptyNotification}>There are no notifications</div>
              )}
            </Paper>
          </Popover>

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
