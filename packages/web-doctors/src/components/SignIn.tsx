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
import React, { createRef, RefObject, useEffect, useState, useRef } from 'react';
import { isMobileNumberValid, isDigit } from '@aph/universal/validators';
import { AphTextField } from '@aph/web-ui-components';
//import { useQuery } from 'react-apollo-hooks';
//import { IS_DOCTOR } from 'graphql/profiles';
//import { GetPatients } from 'graphql/types/GetPatients';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '30px 0 60px 0',
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 30,
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
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 9,
      },
    },
    helpText: {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.dark,
      marginTop: 10,
      lineHeight: 2,
      opacity: 1,
    },
    action: {
      paddingTop: 0,
      display: 'flex',
      position: 'absolute',
      bottom: '20px',
      right: '15px',
      '& button': {
        marginLeft: 'auto',
        marginRight: -40,
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
  };
});

const mobileNumberPrefix = '+91';
const numOtpDigits = 6;
const otpInputRefs: RefObject<HTMLInputElement>[] = [];
const validPhoneMessage = 'OTP will be sent to this number';
const invalidPhoneMessage = 'This seems like a wrong number';

export interface DoctorsProps {
  mobileNumber: string;
}
export const SignIn: React.FC = (props) => {
  const classes = useStyles();
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const mobileNumberWithPrefix = `${mobileNumberPrefix}${mobileNumber}`;
  const [otp, setOtp] = useState<number[]>([]);
  const [displayOtpInput, setDisplayOtpInput] = useState<boolean>(false);
  const [displayGetHelp, setDisplayGetHelp] = useState<boolean>(false);
  const [phoneMessage, setPhoneMessage] = useState<string>(validPhoneMessage);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  let [timer, setTimer] = useState(179);
  const placeRecaptchaAfterMe = useRef(null);

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
      if (submitCount <= 3) {
        console.log('submitCount ' + submitCount);
      }

      if (submitCount === 3) {
        setShowTimer(true);

        let intervalId = setInterval(() => {
          timer = timer - 1;
          setTimer(timer);
          if (timer === 0) {
            clearInterval(intervalId);
            setSubmitCount(0);
            setShowTimer(false);
            setTimer(179);
          }
        }, 1000);
      }
    }
  }, [submitCount]);

  return displayGetHelp ? (
    <div className={`${classes.loginFormWrap} ${classes.helpWrap}`}>
      <Button
        className={classes.backButton}
        onClick={() => {
          setOtp([]);
          setDisplayOtpInput(false);
          setSubmitCount(0);
        }}
      >
        {'<'}
      </Button>
      <Typography variant="h2">need help?</Typography>
      <p>You can request a call back for us to resolve your issue ASAP</p>
      <FormControl fullWidth>
        <AphInput
          autoFocus
          inputProps={{ type: 'tel', maxLength: 10 }}
          value={mobileNumber}
          onPaste={(e) => {
            if (!isDigit(e.clipboardData.getData('text'))) e.preventDefault();
          }}
          onChange={(event) => {
            setMobileNumber(event.currentTarget.value);
            if (event.currentTarget.value !== '') {
              if (isMobileNumberValid(event.currentTarget.value)) {
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
          error={mobileNumber.trim() !== '' && !isMobileNumberValid(mobileNumber)}
          onKeyPress={(e) => {
            if (isNaN(parseInt(e.key, 10))) {
              e.preventDefault();
            }
          }}
          startAdornment={
            <InputAdornment className={classes.inputAdornment} position="start">
              {mobileNumberPrefix}
            </InputAdornment>
          }
        />
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        disabled={!isMobileNumberValid(mobileNumber) || mobileNumber.length !== 10}
        className={classes.needHelp}
        onClick={() => {
          alert('call pro');
        }}
      >
        CALL ME
      </Button>
    </div>
  ) : displayOtpInput ? (
    <div className={`${classes.loginFormWrap} ${classes.otpFormWrap}`}>
      <Button
        className={classes.backButton}
        onClick={() => {
          setOtp([]);
          setDisplayOtpInput(false);
          setSubmitCount(0);
        }}
      >
        {'<'}
      </Button>
      <Typography variant="h2">
        {!showTimer && 'great'}
        {showTimer && 'oops!'}
      </Typography>

      <p>{submitCount != 3 && 'Enter the OTP sent to you, to authenticate'}</p>
      <p>{submitCount == 3 && 'You entered an incorrect OTP 3 times'}</p>
      <Grid container spacing={1}>
        {_times(numOtpDigits, (index) => (
          <Grid item xs={2} key={index}>
            <AphTextField
              autoFocus={index === 0}
              inputRef={otpInputRefs[index]}
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
              error={verifyOtpError}
            />
          </Grid>
        ))}
      </Grid>
      {verifyOtpError && (
        <FormHelperText component="div" className={classes.helpText} error={verifyOtpError}>
          <div>
            {' '}
            {showTimer &&
              'Try again after ' +
                Math.floor(timer / 60) +
                ':' +
                (timer % 60 <= 9 ? '0' + (timer % 60) : timer % 60)}
          </div>
          <div>
            {' '}
            {!showTimer &&
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
            sendOtp(mobileNumberWithPrefix, placeRecaptchaAfterMe.current);
          }}
        >
          Resend OTP
        </Button>
      )}

      {/*  <div ref={placeRecaptchaAfterMe} /> */}
      <div className={classes.action}>
        <Fab
          color="primary"
          onClick={() => verifyOtp(otp.join(''))}
          disabled={isSendingOtp || otp.join('').length !== numOtpDigits || showTimer}
        >
          {isSigningIn || isSendingOtp || isVerifyingOtp || showTimer ? (
            <CircularProgress />
          ) : (
            <img
              onClick={() => setSubmitCount(submitCount + 1)}
              src={require('images/ic_arrow_forward.svg')}
            />
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
            if (!isDigit(e.clipboardData.getData('text'))) e.preventDefault();
          }}
          onChange={(event) => {
            setMobileNumber(event.currentTarget.value);
            if (event.currentTarget.value !== '') {
              if (isMobileNumberValid(event.currentTarget.value)) {
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
          error={mobileNumber.trim() !== '' && !isMobileNumberValid(mobileNumber)}
          onKeyPress={(e) => {
            if (isNaN(parseInt(e.key, 10))) {
              e.preventDefault();
            }
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
        }}
      >
        GET HELP
      </Button>

      <div className={classes.action}>
        <Fab
          color="primary"
          aria-label="Sign in"
          disabled={!isMobileNumberValid(mobileNumber) || mobileNumber.length !== 10}
          onClick={() =>
            sendOtp(mobileNumberWithPrefix, placeRecaptchaAfterMe.current).then(() =>
              setDisplayOtpInput(true)
            )
          }
        >
          {isSendingOtp ? (
            <CircularProgress />
          ) : (
            <img src={require('images/ic_arrow_forward.svg')} />
          )}
        </Fab>
      </div>
      <div className={classes.captcha} ref={placeRecaptchaAfterMe} />
    </div>
  );
};
