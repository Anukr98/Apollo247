import { Theme, Button, Modal, MenuItem, InputBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState, useEffect } from 'react';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';
import Pubnub from 'pubnub';
import moment from 'moment';
import { AphSelect, AphTextField } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '30px 0 50px 0',
      '& p': {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1.28,
        color: '#02475b',
        marginTop: 10,
        marginBottom: 10,
      },
    },
    helpWrap: {
      paddingBottom: 0,
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      padding: '35px 20px',
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    consultButton: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#fc9916',
      marginLeft: 20,
      minWidth: 168,
      marginRight: 10,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
      '& svg': {
        marginRight: 5,
      },
    },
    endconsultButton: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#890000',
      marginLeft: 20,
      minWidth: 168,
      marginRight: 10,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#890000',
      },
      '& svg': {
        marginRight: 5,
      },
    },
    ResheduleCosultButton: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#fc9916',
      minWidth: 168,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#fc9916',
      },
    },
    cancelConsult: {
      minWidth: 120,
      fontSize: 13,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(0, 1, 0, 1),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    timeLeft: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.6)',
      textTransform: 'capitalize',
      position: 'relative',
      top: -1,
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 20,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    loginForm: {
      width: 280,
      minHeight: 282,
      padding: '10px 20px 20px 20px',
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    consultButtonContainer: {
      position: 'absolute',
      right: 0,
    },
    cross: {
      position: 'absolute',
      right: 0,
      top: '10px',
      fontSize: '18px',
      color: '#02475b',
    },
    needHelp: {
      padding: '8px',
      width: '100%',
      marginTop: 15,
      borderRadius: '5px',
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.3)',
      fontWeight: 'bold',
      backgroundColor: '#fc9916',
      '& img': {
        marginRight: 10,
      },
    },
    consultIcon: {
      padding: 6,
      backgroundColor: 'transparent',
      margin: '0 5px',
      minWidth: 20,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    backButton: {
      minWidth: 120,
      fontSize: 13,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(0, 1, 0, 1),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    popOverUL: {
      listStyleType: 'none',
      textAlign: 'center',
      display: 'inline',
      '& li': {
        fontSize: '15px',
        fontWeight: 500,
        paddingLeft: '20px',
        fontStyle: 'normal',
        fontStretch: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        color: '#02475b',
        paddingBottom: '10px',
        paddingTop: '10px',
        textAlign: 'left',
        '&:hover': {
          background: '#eeeeee',
        },
      },
    },

    dotPaper: {
      width: 180,
      minHeight: 165,
      padding: '0px',
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    modalBox: {
      maxWidth: 480,
      height: 340,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#eeeeee',
      position: 'relative',
    },
    modalBoxTransfer: {
      maxWidth: 480,
      height: 390,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#eeeeee',
      position: 'relative',
    },
    modalBoxClose: {
      position: 'absolute',
      right: -48,
      top: 0,
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: theme.palette.common.white,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        right: 0,
        top: -48,
      },
    },
    tabHeader: {
      background: 'white',
      height: 50,
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
      '& h4': {
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        color: '#01475b',
        padding: '15px',
      },
    },
    tabFooter: {
      background: 'white',
      position: 'absolute',
      height: 60,
      paddingTop: '10px',
      borderBottomLeftRadius: '10px',
      borderBottomRightRadius: '10px',
      width: '480px',
      bottom: '0px',
      textAlign: 'right',
      paddingRight: '20px',
    },
    tabBody: {
      background: 'white',
      height: 80,
      marginTop: '10px',
      paddingLeft: '15px',
      paddingTop: '10px',
      paddingRight: '15px',
      /* padding: 15px; */

      '& p': {
        margin: 0,
        fontSize: '15px',
        fontWeight: 500,
        lineHeight: 1.2,
        color: '#01475b',
      },
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginLeft: -2,
      marginTop: 45,
      borderRadius: 10,
      left: '270px',
      width: '450px',
      '& ul': {
        padding: '10px 0px',
        '& li': {
          fontSize: 16,
          width: 480,
          fontWeight: 500,
          color: '#02475b',
          minHeight: 'auto',
          paddingLeft: 10,
          paddingRight: 10,
          // borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:hover': {
            backgroundColor: '#f0f4f5',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    cancelBtn: {
      minWidth: 30,
      margin: theme.spacing(1),
      fontSize: 15,
      fontWeight: 500,
      color: '#02575b',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    searchInput: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    textFieldColor: {
      '& input': {
        marginTop: 5,
        color: 'initial',
        border: '2px solid #00b38e ',
        borderRadius: 10,
        paddingLeft: 10,
        '& :before': {
          border: 0,
        },
      },
    },
  };
});

interface CallPopoverProps {
  setStartConsultAction(isVideo: boolean): void;
  createSessionAction: () => void;
  saveCasesheetAction: () => void;
  appointmentId: string;
  appointmentDateTime: string;
  doctorId: string;
}
let intervalId: any;
let stoppedTimer: number;
let cda: any;
export const CallPopover: React.FC<CallPopoverProps> = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const [startAppointmentButton, setStartAppointmentButton] = React.useState<boolean>(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isTransferPopoverOpen, setIsTransferPopoverOpen] = useState<boolean>(false);
  const [reason, setReason] = React.useState(1);
  const [searchKeyWord, setSearchKeyword] = React.useState('');
  const [noteKeyword, setNoteKeyword] = React.useState('');

  const [anchorElThreeDots, setAnchorElThreeDots] = React.useState(null);
  //logic for before start counsult timer start
  const dt1 = new Date(new Date().toISOString().substring(0, 16)); //today time
  const dt2 = new Date(props.appointmentDateTime); // apointment time
  const diff = dt2.getHours() - dt1.getHours();
  const diff2 = dt2.getMinutes() - dt1.getMinutes();
  const val = '0';
  cda = diff
    .toString()
    .concat(':')
    .concat(diff2.toString().length > 1 ? diff2.toString() : val.concat(diff2.toString()));

  const startInterval = (timer: number) => {
    const current = new Date();
    const consult = new Date(props.appointmentDateTime);
    const year = consult.getFullYear();
    const month = consult.getMonth() + 1;
    const day = consult.getDate();
    let hour = consult.getHours();
    let minute = consult.getMinutes() + 15;
    const second = consult.getSeconds();
    if (minute > 59) {
      const diff = minute - 60;
      hour = hour + 1;
      if (hour === 14) {
        hour = 0;
      }
      minute = diff;
    }
    const addedMinutes = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    const addedTime = new Date(addedMinutes);
    if (current > consult && addedTime > current) {
      const now = new Date();
      const diffrent = current.getTime() - consult.getTime();
      timer = 900 - Math.floor(diffrent / 1000);
    }
    intervalId = setInterval(() => {
      timer = timer - 1;
      stoppedTimer = timer;
      setRemainingTime(timer);
      if (timer == 0) {
        setRemainingTime(0);
        clearInterval(intervalId);
      }
    }, 1000);
  };
  const startConstultCheck = () => {
    const disablecurrent = new Date();
    const disableconsult = new Date(props.appointmentDateTime);
    const disableyear = disableconsult.getFullYear();
    const disablemonth = disableconsult.getMonth() + 1;
    const disableday = disableconsult.getDate();
    let disablehour = disableconsult.getHours();
    let disableminute = disableconsult.getMinutes() + 15;
    const disablesecond = disableconsult.getSeconds();
    if (disableminute > 59) {
      const disablediff = disableminute - 60;
      disablehour = disablehour + 1;
      if (disablehour === 24) {
        disablehour = 0;
      }
      disableminute = disablediff;
    }
    const disableaddedMinutes =
      disableyear +
      '-' +
      disablemonth +
      '-' +
      disableday +
      ' ' +
      disablehour +
      ':' +
      disableminute +
      ':' +
      disablesecond;
    const disableaddedTime = new Date(disableaddedMinutes);
    if (disablecurrent >= disableconsult && disableaddedTime >= disablecurrent) {
      setStartAppointmentButton(false);
    } else {
      setStartAppointmentButton(true);
    }
  };
  setInterval(startConstultCheck, 1000);
  const stopInterval = () => {
    setRemainingTime(900);
    intervalId && clearInterval(intervalId);
  };
  function handleClick(event: any) {
    if (startAppointment) {
      setAnchorEl(event.currentTarget);
    }
  }
  function handleClose() {
    setAnchorEl(null);
  }
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  function handleClickThreeDots(event: any) {
    setAnchorElThreeDots(event.currentTarget);
  }
  function handleCloseThreeDots() {
    setAnchorElThreeDots(null);
  }
  const openThreeDots = Boolean(anchorElThreeDots);
  const idThreeDots = openThreeDots ? 'simple-three-dots' : undefined;
  const resheduleCosult = () => {};

  const startConsult = '^^#startconsult';
  const stopConsult = '^^#stopconsult';
  const channel = props.appointmentId;
  const config: Pubnub.PubnubConfig = {
    subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
    publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
    ssl: true,
  };
  const pubnub = new Pubnub(config);
  useEffect(() => {
    pubnub.subscribe({
      channels: [channel],
      withPresence: true,
    });
    pubnub.addListener({
      status: (statusEvent) => {},
      message: (message) => {},
      // presence: (presenceEvent) => {
      //   console.log('presenceEvent', presenceEvent);
      // },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  });

  const onStartConsult = () => {
    const text = {
      id: props.doctorId,
      message: startConsult,
      isTyping: true,
    };
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
  };
  const onStopConsult = () => {
    const text = {
      id: props.doctorId,
      message: stopConsult,
      isTyping: true,
    };
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
  };

  const getTimerText = () => {
    const now = new Date();
    const diff = moment.duration(
      moment(new Date(props.appointmentDateTime)).diff(
        moment(moment(now).format('YYYY-MM-DD HH:mm:ss'))
      )
    );
    const diffInHours = diff.asHours();
    if (diffInHours > 0 && diffInHours < 12)
      if (diff.hours() <= 0) {
        return `| Time to consult ${
          diff.minutes().toString().length < 2 ? '0' + diff.minutes() : diff.minutes()
        } : ${diff.seconds().toString().length < 2 ? '0' + diff.seconds() : diff.seconds()}`;
      }
    return '';
  };
  return (
    <div className={classes.breadcrumbs}>
      <div>
        <Link to="/calendar">
          <div className={classes.backArrow}>
            <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div>
        </Link>
      </div>
      CONSULT ROOM &nbsp;
      <span className={classes.timeLeft}>
        {startAppointment
          ? `| Time Left ${minutes.toString().length < 2 ? '0' + minutes : minutes} : ${
              seconds.toString().length < 2 ? '0' + seconds : seconds
            }`
          : getTimerText()}
      </span>
      <div className={classes.consultButtonContainer}>
        <span>
          {startAppointment ? (
            <span>
              <Button
                className={classes.backButton}
                onClick={() => {
                  props.saveCasesheetAction();
                }}
              >
                Save
              </Button>
              <Button
                className={classes.endconsultButton}
                onClick={() => {
                  onStopConsult();
                  setStartAppointment(!startAppointment);
                  stopInterval();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <g fill="none" fillRule="evenodd">
                    <path d="M0 0h24v24H0z" />
                    <path
                      fill="#ffffff"
                      fillRule="nonzero"
                      d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
                    />
                  </g>
                </svg>
                End Consult
              </Button>
            </span>
          ) : (
            <Button
              className={classes.consultButton}
              //disabled={startAppointmentButton}
              onClick={() => {
                !startAppointment ? onStartConsult() : onStopConsult();
                !startAppointment ? startInterval(900) : stopInterval();
                setStartAppointment(!startAppointment);
                props.createSessionAction();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#fff" d="M8 5v14l11-7z" />
              </svg>
              {startAppointment ? 'End Consult' : 'Start Consult'}
            </Button>
          )}
          <Button
            className={classes.consultIcon}
            aria-describedby={id}
            variant="contained"
            onClick={(e) => handleClick(e)}
          >
            <img src={require('images/ic_call.svg')} />
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Paper className={classes.loginForm}>
              <Button className={classes.cross}>
                <img src={require('images/ic_cross.svg')} alt="" onClick={() => handleClose()} />
              </Button>
              <div className={`${classes.loginFormWrap} ${classes.helpWrap}`}>
                <p>How do you want to talk to the patient?</p>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.needHelp}
                  onClick={() => {
                    handleClose();
                    props.setStartConsultAction(false);
                  }}
                >
                  <img src={require('images/call_popup.svg')} alt="" />
                  AUDIO CALL
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.needHelp}
                  onClick={() => {
                    handleClose();
                    props.setStartConsultAction(true);
                  }}
                >
                  <img src={require('images/video_popup.svg')} alt="" />
                  VIDEO CALL
                </Button>
              </div>
            </Paper>
          </Popover>
          <Button
            className={classes.consultIcon}
            aria-describedby={idThreeDots}
            onClick={(e) => handleClickThreeDots(e)}
          >
            <img src={require('images/ic_more.svg')} />
          </Button>

          <Popover
            id={idThreeDots}
            open={openThreeDots}
            anchorEl={anchorElThreeDots}
            onClose={handleCloseThreeDots}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Paper className={classes.dotPaper}>
              <ul className={classes.popOverUL}>
                <li>Share Case Sheet</li>
                <li
                  onClick={() => {
                    handleCloseThreeDots();
                    setIsTransferPopoverOpen(true);
                  }}
                >
                  TransferConsult
                </li>
                <li
                  onClick={() => {
                    handleCloseThreeDots();
                    setIsPopoverOpen(true);
                  }}
                >
                  Reshedule Consult
                </li>
              </ul>
            </Paper>
          </Popover>
        </span>
      </div>
      <Modal
        open={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBox}>
          <div className={classes.tabHeader}>
            <h4>RESHEDULE CONSULT</h4>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => setIsPopoverOpen(false)}
              />
            </Button>
          </div>
          <div className={classes.tabBody}>
            <p>Why do you want to resshedule this consult?</p>

            <AphSelect
              value={reason}
              MenuProps={{
                classes: { paper: classes.menuPopover },
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
              }}
              onChange={(e) => {
                setReason(e.target.value as number);
              }}
            >
              <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                Reason 01
              </MenuItem>
              <MenuItem value={2} classes={{ selected: classes.menuSelected }}>
                Reason 02
              </MenuItem>
              <MenuItem value={3} classes={{ selected: classes.menuSelected }}>
                Reason 03
              </MenuItem>
              <MenuItem value={4} classes={{ selected: classes.menuSelected }}>
                Other
              </MenuItem>
            </AphSelect>
          </div>
          <div
            className={classes.tabFooter}
            onClick={() => {
              setIsPopoverOpen(false);
            }}
          >
            <Button className={classes.cancelConsult}>Cancel</Button>
            <Button
              className={classes.ResheduleCosultButton}
              onClick={() => {
                setIsPopoverOpen(false);
                resheduleCosult();
              }}
            >
              Reshedule Consult
            </Button>
          </div>
        </Paper>
      </Modal>
      <Modal
        open={isTransferPopoverOpen}
        onClose={() => setIsTransferPopoverOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBoxTransfer}>
          <div className={classes.tabHeader}>
            <h4>TRANSFER CONSULT</h4>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => setIsTransferPopoverOpen(false)}
              />
            </Button>
          </div>
          <div className={classes.tabBody}>
            <p>Why do you want to transfer this consult?</p>

            <AphSelect
              value={reason}
              MenuProps={{
                classes: { paper: classes.menuPopover },
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
              }}
              onChange={(e) => {
                setReason(e.target.value as number);
              }}
            >
              <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                Reason 01
              </MenuItem>
              <MenuItem value={2} classes={{ selected: classes.menuSelected }}>
                Reason 02
              </MenuItem>
              <MenuItem value={3} classes={{ selected: classes.menuSelected }}>
                Reason 03
              </MenuItem>
              <MenuItem value={4} classes={{ selected: classes.menuSelected }}>
                Other
              </MenuItem>
            </AphSelect>
          </div>
          <div className={classes.tabBody}>
            <p>Whom do you want to transfer this consult to?</p>
            <AphTextField
              classes={{ root: classes.searchInput }}
              placeholder="Search doctors or specialities"
              onChange={(e) => {
                setSearchKeyword(e.target.value);
              }}
              value={searchKeyWord}
            />
          </div>

          <div className={classes.tabBody}>
            <p>Add a Note (Optional)</p>
            {/* <AphTextField placeholder="search" /> */}
            <InputBase fullWidth className={classes.textFieldColor} placeholder="Enter here.." />
            {/* <AphTextField
              classes={{ root: classes.searchInput }}
              placeholder="Enter here...."
              onChange={(e) => {
                setNoteKeyword(e.target.value);
              }}
              value={noteKeyword}
            /> */}
          </div>
          <div
            className={classes.tabFooter}
            onClick={() => {
              setIsTransferPopoverOpen(false);
            }}
          >
            <Button className={classes.cancelConsult}>Cancel</Button>
            <Button
              className={classes.ResheduleCosultButton}
              onClick={() => {
                setIsTransferPopoverOpen(false);
                resheduleCosult();
              }}
            >
              Transfer Consult
            </Button>
          </div>
        </Paper>
      </Modal>
    </div>
  );
};
