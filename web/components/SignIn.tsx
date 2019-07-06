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
import { AppInputField } from 'components/ui/AppInputField';
import { useAuth } from 'hooks/authHooks';
import _isNumber from 'lodash/isNumber';
import _times from 'lodash/times';
import _uniqueId from 'lodash/uniqueId';
import React, { createRef, RefObject, useEffect, useState, useRef } from 'react';
import { isMobileNumberValid, isDigit } from 'utils/FormValidationUtils';
import { AppTextField } from './ui/AppTextField';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 5,
        marginBottom: 30,
      },
    },
    inputAdornment: {
      color: theme.palette.secondary.dark,
      '& p': {
        color: theme.palette.secondary.dark,
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 4,
      },
    },
    helpText: {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.dark,
      marginTop: 10,
      lineHeight: 2,
    },
    action: {
      paddingTop: 0,
      display: 'flex',
      '& button': {
        marginLeft: 'auto',
        marginRight: -40,
      },
    },
    captcha: {
      transform: 'scale(0.8)',
      transformOrigin: 'top left',
      marginTop: 10,
    },
    otpFormWrap: {
      '& input': {
        textAlign: 'center',
      },
    },
    resendBtn: {
      padding: 0,
      color: '#fc9916',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      marginTop: 10,
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

export const SignIn: React.FC = (props) => {
  const classes = useStyles();

  const [mobileNumber, setMobileNumber] = useState<string>('');
  const mobileNumberWithPrefix = `${mobileNumberPrefix}${mobileNumber}`;
  const [otp, setOtp] = useState<number[]>([]);
  const [displayOtpInput, setDisplayOtpInput] = useState<boolean>(false);
  const [phoneMessage, setPhoneMessage] = useState<string>(validPhoneMessage);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
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

  return displayOtpInput ? (
    <div className={`${classes.loginFormWrap} ${classes.otpFormWrap}`}>
      <Typography variant="h2">hi</Typography>
      <p>Type in the OTP sent to you, to authenticate</p>
      <Grid container spacing={1}>
        {_times(numOtpDigits, (index) => (
          <Grid item xs={2} key={index}>
            <AppTextField
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
          Invalid OTP
        </FormHelperText>
      )}

      <Button
        variant="text"
        className={classes.resendBtn}
        disabled={isSendingOtp}
        onClick={() => {
          setOtp([]);
          sendOtp(mobileNumberWithPrefix, placeRecaptchaAfterMe.current);
        }}
      >
        Resend OTP
      </Button>
      <div ref={placeRecaptchaAfterMe} />
      <div className={classes.action}>
        <Fab
          color="primary"
          onClick={() => verifyOtp(otp.join(''))}
          disabled={isSendingOtp || otp.join('').length !== numOtpDigits}
        >
          {isSigningIn || isSendingOtp || isVerifyingOtp ? (
            <CircularProgress />
          ) : (
            <img src={require('images/ic_arrow_forward.svg')} />
          )}
        </Fab>
      </div>
    </div>
  ) : (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Please enter your mobile number to login</p>
      <FormControl fullWidth>
        <AppInputField
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
      <div ref={placeRecaptchaAfterMe} />
    </div>
  );
};
