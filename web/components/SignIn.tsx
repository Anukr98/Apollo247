import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Grid } from '@material-ui/core';
import React, { useState, useEffect, useRef, RefObject, createRef } from 'react';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Fab from '@material-ui/core/Fab';
import { useAuth } from 'hooks/authHooks';
import { AppInputField } from 'components/ui/AppInputField';
import _times from 'lodash/times';
import _isNumber from 'lodash/isNumber';
import { isMobileNumberValid, isDigit } from 'utils/FormValidationUtils';
import { AppTextField } from './ui/AppTextField';
import FormHelperText from '@material-ui/core/FormHelperText';

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
        marginBottom: 3,
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
    otpAction: {
      display: 'flex',
      '& button': {
        marginLeft: 'auto',
        marginRight: -40,
        backgroundColor: '#FED984',
        fontSize: 16,
        fontWeight: 500,
      },
      '& >div': {
        height: 0,
        opacity: 0,
        width: 0,
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
  };
});

const recaptchaContainerId = 'recaptcha-container';
const mobileNumberPrefix = '+91';
const numOtpDigits = 6;
const otpInputRefs: RefObject<HTMLInputElement>[] = [];

export const SignIn: React.FC = (props) => {
  const classes = useStyles();
  const validPhoneMessage = 'OTP will be sent to this number';
  const invalidPhoneMessage = 'This seems like a wrong number';

  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [otp, setOtp] = useState<number[]>([]);
  const [displayOtpInput, setDisplayOtpInput] = useState<boolean>(false);
  const [
    captchaVerifier,
    setCaptchaVerifier,
  ] = useState<firebase.auth.RecaptchaVerifier_Instance | null>(null); // eslint-disable-line camelcase
  const [phoneNumberVerificationToken, setPhoneNumberVerificationToken] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  const [captchaLoaded, setCaptchaLoaded] = useState<boolean>(false);
  const [verifyingPhoneNumber, setVerifyingPhoneNumber] = useState<boolean>(false);
  const [phoneMessage, setPhoneMessage] = useState<string>(validPhoneMessage);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);

  const {
    buildCaptchaVerifier,
    verifyPhoneNumber,
    verifyOtp,
    signIn,
    isAuthenticating,
  } = useAuth();

  useEffect(() => {
    const captchaVerifier = buildCaptchaVerifier(recaptchaContainerId);
    setCaptchaVerifier(captchaVerifier);
  }, [buildCaptchaVerifier]);

  useEffect(() => {
    if (captchaVerifier) {
      captchaVerifier.render().then(() => {
        setCaptchaLoaded(true);
        captchaVerifier.verify().then(() => {
          setCaptchaVerified(true);
        });
      });
    }
  }, [captchaVerifier]);

  useEffect(() => {
    _times(numOtpDigits, (index) => {
      const inputRef = createRef<HTMLInputElement>();
      otpInputRefs[index] = inputRef;
    });
  }, []);

  const captchaEl = (
    <div
      id={recaptchaContainerId}
      className={classes.captcha}
      style={captchaVerified ? { opacity: 0, position: 'absolute', top: 0, left: 0 } : undefined}
    />
  );

  return true || displayOtpInput ? (
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
              inputProps={{ maxLength: 1 }}
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
            />
          </Grid>
        ))}
      </Grid>
      {captchaEl}
      <div className={classes.otpAction}>
        <Fab
          color="primary"
          onClick={(e) =>
            verifyOtp(phoneNumberVerificationToken, otp.join('')).then((otpVerificationToken) => {
              signIn(otpVerificationToken);
            })
          }
        >
          {isAuthenticating ? <CircularProgress /> : 'OK'}
        </Fab>
      </div>
    </div>
  ) : (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Please enter your mobile number to login</p>
      <FormControl fullWidth>
        <AppInputField
          inputProps={{ type: 'text', maxLength: 10 }}
          value={mobileNumber}
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
          error={mobileNumber ? !isMobileNumberValid(mobileNumber) : false}
          onKeyPress={(e) => {
            if (!isDigit(e.key)) {
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
          {phoneMessage}
        </FormHelperText>
      </FormControl>
      {captchaEl}
      <div className={classes.action}>
        <Fab
          color="primary"
          aria-label="Sign in"
          disabled={!(isMobileNumberValid(mobileNumber) && captchaVerified)}
          onClick={(e) => {
            setVerifyingPhoneNumber(true);
            verifyPhoneNumber(`${mobileNumberPrefix}${mobileNumber}`, captchaVerifier).then(
              (phoneNumberVerificationToken) => {
                setPhoneNumberVerificationToken(phoneNumberVerificationToken);
                setVerifyingPhoneNumber(false);
                setDisplayOtpInput(true);
              }
            );
          }}
        >
          {verifyingPhoneNumber ? (
            <CircularProgress />
          ) : (
            <img src={require('images/ic_arrow_forward.svg')} />
          )}
        </Fab>
      </div>
      {!captchaLoaded && <CircularProgress />}
    </div>
  );
};
