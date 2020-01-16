import {
  CircularProgress,
  Fab,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  Theme,
  Typography,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
import { useAuth } from 'hooks/authHooks';
import _isNumber from 'lodash/isNumber';
import _times from 'lodash/times';
import IdleTimer from 'react-idle-timer';
import React, { createRef, RefObject, useEffect, useState, useRef } from 'react';
import { isMobileNumberValid } from '@aph/universal/dist/aphValidators';
import { AphTextField } from '@aph/web-ui-components';
import { HelpPopup } from 'components/Help';
import isNumeric from 'validator/lib/isNumeric';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '30px 0 50px 0',
      '& p': {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.38,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 10,
      },
      '& input': {
        fontSize: 18,
        color: '#02475b',
        paddingTop: 8,
      },
    },
    helpWrap: {
      paddingBottom: 0,
    },

    button: {
      [theme.breakpoints.up('sm')]: {
        minWidth: 200,
      },
    },
    inputAdornment: {
      color: theme.palette.secondary.dark,
      '& p': {
        color: theme.palette.secondary.dark,
        fontSize: 18,
        fontWeight: 500,
        marginBottom: 9,
      },
    },
    errorText: {
      fontSize: 12,
      fontWeight: 500,
      color: '#890000',
      marginTop: 10,
      lineHeight: 2,
    },
    helpText: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.5)',
      marginTop: 10,
      lineHeight: 2,
    },
    timerText: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      marginTop: 10,
      lineHeight: 2,
      opacity: 0.5,
    },
    action: {
      paddingTop: 0,
      display: 'flex',
      position: 'absolute',
      bottom: 25,
      right: 15,
      '& button': {
        marginLeft: 'auto',
        marginRight: -40,
        backgroundColor: '#fc9916',
        '&:hover': {
          backgroundColor: '#e28913',
        },
        '&:disabled': {
          backgroundColor: '#fed6a2',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
        },
      },
    },
    captcha: {
      transform: 'scale(0.8)',
      transformOrigin: 'top left',
      marginTop: 10,
      display: 'none',
    },
    otpFormWrap: {
      '& input': {
        textAlign: 'center',
      },
    },
    needHelp: {
      padding: '8px',
      width: '84%',
      margin: '30px 7% 0 7%',
      borderRadius: '5px',
      boxShadow: 'none',
    },
    backButton: {
      position: 'absolute',
      left: 0,
      top: '10px',
      fontSize: '18px',
      color: '#02475b',
    },
    resendBtn: {
      padding: 0,
      color: '#fc9916',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      marginTop: 10,
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    loader: {
      color: '#fff',
    },
    cross: {
      position: 'absolute',
      right: 0,
      top: '10px',
      fontSize: '16px',
      color: '#02475b',
    },
  };
});

const mobileNumberPrefix = '+91';
const numOtpDigits = 6;
const otpInputRefs: RefObject<HTMLInputElement>[] = [];
const validPhoneMessage = 'OTP will be sent to this number';
const invalidPhoneMessage = 'This seems like the wrong number';

export interface DoctorsProps {
  mobileNumber: string;
}
interface PopupProps {
  popup: () => void;
  setStickyPopupValue: () => void;
}
export const SignIn: React.FC<PopupProps> = (props) => {
  const { setStickyPopupValue } = props;
  const classes = useStyles();
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const mobileNumberWithPrefix = `${mobileNumberPrefix}${mobileNumber}`;
  const [otp, setOtp] = useState<number[]>([]);
  const [loginId, setLoginId] = useState<string>('');
  const [displayOtpInput, setDisplayOtpInput] = useState<boolean>(false);
  const [displayGetHelp, setDisplayGetHelp] = useState<boolean>(false);
  const [phoneMessage, setPhoneMessage] = useState<string>(validPhoneMessage);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [showBackArrow, setShowBackArrow] = useState(true);
  const countDown = useRef(179);
  const [timer, setTimer] = useState(179);

  const placeRecaptchaAfterMe = useRef(null);
  const [count, setCount] = useState(1);
  const {
    sendOtp,
    sendOtpError,
    isSendingOtp,

    verifyOtp,
    verifyOtpError,
    isVerifyingOtp,

    isSigningIn,
  } = useAuth();
  useEffect(() => {
    _times(numOtpDigits, (index) => {
      const inputRef = createRef<HTMLInputElement>();
      otpInputRefs[index] = inputRef;
    });
  }, []);

  useEffect(() => {
    if (submitCount > 0) {
      if (submitCount === 3) {
        setShowTimer(true);
        setOtp([]);
        const intervalId = setInterval(() => {
          countDown.current--;
          setTimer(countDown.current);

          if (countDown.current === 0) {
            clearInterval(intervalId);
            setSubmitCount(0);
            setShowTimer(false);
            countDown.current = 179;
          }
        }, 1000);
      }
    }
  }, [submitCount]);

  return displayGetHelp ? (
    <div>
      {showBackArrow && (
        <Button
          className={classes.backButton}
          onClick={() => {
            setOtp([]);
            setDisplayOtpInput(false);
            setSubmitCount(0);
            setDisplayGetHelp(false);
            setShowTimer(false);
            setStickyPopupValue();
          }}
        >
          <img src={require('images/ic_login_back.svg')} alt="" />
        </Button>
      )}
      ;
      <HelpPopup setBackArrow={() => setShowBackArrow(false)} />
    </div>
  ) : displayOtpInput ? (
    <div className={`${classes.loginFormWrap} ${classes.otpFormWrap}`}>
      {count < 3 && (
        <div>
          &nbsp;
          {/* <IdleTimer
            element={document}
            onIdle={(e) => {
              sendOtp(mobileNumberWithPrefix, placeRecaptchaAfterMe.current);
              setCount(count + 1);
            }}
            debounce={250}
            timeout={1000 * 30 * 1}
          />
          <IdleTimer
            element={document}
            onIdle={(e) => {
              sendOtp(mobileNumberWithPrefix, placeRecaptchaAfterMe.current);
              setCount(count + 1);
            }}
            debounce={250}
            timeout={1000 * 30 * 2}
          /> */}
        </div>
      )}
      <Button
        className={classes.backButton}
        onClick={() => {
          setOtp([]);
          setDisplayOtpInput(false);
          setSubmitCount(0);
          setShowTimer(false);
          setStickyPopupValue();
        }}
      >
        <img src={require('images/ic_login_back.svg')} alt="" />
      </Button>
      <Typography variant="h2">
        {(isSigningIn || isVerifyingOtp || submitCount !== 3) && 'great'}
        {!(isSigningIn || isVerifyingOtp) && submitCount === 3 && 'oops!'}
      </Typography>

      <p>
        {(isSigningIn || isVerifyingOtp || submitCount !== 3) &&
          'Enter the OTP sent to you, to authenticate'}
      </p>
      <p>
        {!(isSigningIn || isVerifyingOtp) &&
          submitCount === 3 &&
          'You entered an incorrect OTP 3 times'}
      </p>
      <Grid container spacing={1}>
        {_times(numOtpDigits, (index) => (
          <Grid item xs={2} key={index}>
            <AphTextField
              autoFocus={index === 0}
              inputRef={otpInputRefs[index]}
              disabled={showTimer}
              value={_isNumber(otp[index]) ? otp[index] : ''}
              inputProps={{ type: 'tel', maxLength: 1 }}
              onChange={(e) => {
                const newOtp = [...otp];
                const num = parseInt(e.currentTarget.value, 10);
                if (isNaN(num)) {
                  delete newOtp[index];
                } else {
                  newOtp[index] = num;
                  const nextInput = otpInputRefs[index + 1];
                  if (nextInput && nextInput.current) {
                    nextInput.current.focus();
                  }
                }
                setOtp(newOtp);
              }}
              onKeyPress={(e) => {
                if (otp.join('').length === numOtpDigits && e.key == 'Enter') {
                  verifyOtp(otp.join(''), loginId);
                  setSubmitCount(submitCount + 1);
                }
              }}
              onKeyDown={(e) => {
                const backspaceWasPressed = e.key === 'Backspace';
                const currentInputIsEmpty = otp[index] == null;
                const focusPreviousInput = () => {
                  const prevInput = otpInputRefs[index - 1];
                  if (prevInput && prevInput.current) {
                    prevInput.current.focus();
                  }
                };
                if (backspaceWasPressed && currentInputIsEmpty) {
                  focusPreviousInput();
                }
              }}
              error={submitCount !== 0 && submitCount !== 3 && verifyOtpError && !isSigningIn}
            />
          </Grid>
        ))}
      </Grid>
      {verifyOtpError && (
        <FormHelperText component="div" error={verifyOtpError}>
          <div className={classes.timerText}>
            {!(isSigningIn || isVerifyingOtp) &&
              showTimer &&
              `Try again after  ${Math.floor(timer / 60)}:${
                timer % 60 <= 9 ? `0` + (timer % 60) : timer % 60
              }`}
          </div>
          <div className={classes.errorText}>
            {!showTimer &&
              !(isSigningIn || isVerifyingOtp) &&
              submitCount === 2 &&
              submitCount > 0 &&
              ' Incorrect OTP, ' + (3 - submitCount) + ' attempt left'}
            {!showTimer &&
              !(isSigningIn || isVerifyingOtp) &&
              submitCount === 1 &&
              submitCount > 0 &&
              ' Incorrect OTP, ' + (3 - submitCount) + ' attempts left'}
          </div>
        </FormHelperText>
      )}
      {showTimer ? (
        <Button
          variant="text"
          className={classes.resendBtn}
          onClick={() => {
            setDisplayGetHelp(true);
            setMobileNumber('');
          }}
        >
          GET HELP
        </Button>
      ) : (
        <Button
          variant="text"
          className={classes.resendBtn}
          disabled={isSendingOtp}
          onClick={() => {
            setOtp([]);
            setSubmitCount(0);
            sendOtp(mobileNumberWithPrefix, loginId).then((res: any) => {
              if (res) {
                setLoginId(res);
              }
            });
          }}
        >
          Resend OTP
        </Button>
      )}

      <div ref={placeRecaptchaAfterMe} />
      <div className={classes.action}>
        <Fab
          color="primary"
          onClick={() => {
            verifyOtp(otp.join(''), loginId).then(() => setDisplayOtpInput(true));
            // verifyOtp(otp.join(''));
            setSubmitCount(submitCount + 1);
          }}
          disabled={
            isSendingOtp || isVerifyingOtp || otp.join('').length !== numOtpDigits || showTimer
          }
        >
          {isSigningIn || isSendingOtp || isVerifyingOtp ? (
            <CircularProgress className={classes.loader} />
          ) : (
            <img src={require('images/ic_arrow_forward.svg')} />
          )}
        </Fab>
      </div>
    </div>
  ) : (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hello!</Typography>
      <p>Please enter your mobile number to login</p>
      <FormControl fullWidth>
        <AphInput
          autoFocus
          inputProps={{ type: 'tel', maxLength: 10 }}
          value={mobileNumber}
          onPaste={(e) => {
            if (!isNumeric(e.clipboardData.getData('text'))) e.preventDefault();
          }}
          onChange={(event) => {
            setMobileNumber(event.currentTarget.value);
            if (event.currentTarget.value !== '') {
              if (parseInt(event.currentTarget.value[0], 10) > 5) {
                setPhoneMessage(validPhoneMessage);
                setShowErrorMessage(false);
              } else {
                setPhoneMessage(invalidPhoneMessage);
                setShowErrorMessage(true);
              }
            } else {
              setPhoneMessage(validPhoneMessage);
              setShowErrorMessage(false);
            }
          }}
          error={
            mobileNumber.trim() !== '' && showErrorMessage && !isMobileNumberValid(mobileNumber)
          }
          onKeyPress={(e) => {
            if (!showErrorMessage && mobileNumber.length === 10 && e.key == 'Enter') {
              sendOtp(mobileNumberWithPrefix, '').then((res: any) => {
                if (res) {
                  setLoginId(res);
                }
                setDisplayOtpInput(true);
              });
              setStickyPopupValue();
            }
            if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
          }}
          startAdornment={
            <InputAdornment className={classes.inputAdornment} position="start">
              {mobileNumberPrefix}
            </InputAdornment>
          }
        />
        <FormHelperText component="div" className={classes.helpText} error={showErrorMessage}>
          {sendOtpError ? 'Error sending OTP' : phoneMessage}
        </FormHelperText>
      </FormControl>
      <Button
        variant="text"
        className={classes.resendBtn}
        disabled={!showErrorMessage}
        onClick={() => {
          setDisplayGetHelp(true);
          setStickyPopupValue();
        }}
      >
        GET HELP
      </Button>

      <div className={classes.action}>
        <Fab
          color="primary"
          aria-label="Sign in"
          disabled={
            !isMobileNumberValid(mobileNumber) || mobileNumber.length !== 10 || isSendingOtp
          }
          onClick={() => {
            sendOtp(mobileNumberWithPrefix, '').then((res: any) => {
              if (res) {
                setLoginId(res);
              }
              setDisplayOtpInput(true);
            });
            setStickyPopupValue();
          }}
        >
          {isSendingOtp ? (
            <CircularProgress className={classes.loader} />
          ) : (
            <img src={require('images/ic_arrow_forward.svg')} />
          )}
        </Fab>
      </div>
      <div className={classes.captcha} ref={placeRecaptchaAfterMe} />
    </div>
  );
};
