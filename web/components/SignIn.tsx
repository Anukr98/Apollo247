import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Fab from '@material-ui/core/Fab';
import {
  useSignIn,
  useVerifyOtp,
  useCurrentUser,
  useBuildCaptchaVerifier,
  useVerifyPhoneNumber,
  useAuthenticating,
} from 'hooks/authHooks';
import { AppTextField } from 'components/ui/AppTextField';
import { AppInputField } from 'components/ui/AppInputField';

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
    captcha: {
      transform: 'scale(0.8)',
      transformOrigin: 'top left',
      marginTop: 10,
    },
  };
});

export interface SignInProps {}

const recaptchaContainerId = 'recaptcha-container';
const isMobileNumberValid = (number: string) => number.length === 10;
const mobileNumberPrefix = '+91';

export const SignIn: React.FC<SignInProps> = (props) => {
  const classes = useStyles();
  const currentUser = useCurrentUser();
  console.log(currentUser); // need to remove this.
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [displayOtpInput, setDisplayOtpInput] = useState<boolean>(false);
  const [
    captchaVerifier,
    setCaptchaVerifier,
  ] = useState<firebase.auth.RecaptchaVerifier_Instance | null>(null);
  const [phoneNumberVerificationToken, setPhoneNumberVerificationToken] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  const [captchaLoaded, setCaptchaLoaded] = useState<boolean>(false);
  const [verifyingPhoneNumber, setVerifyingPhoneNumber] = useState<boolean>(false);

  const buildCaptchaVerifier = useBuildCaptchaVerifier();
  const verifyPhoneNumber = useVerifyPhoneNumber();
  const verifyOtp = useVerifyOtp();
  const signIn = useSignIn();
  const authenticating = useAuthenticating();

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

  return displayOtpInput ? (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Type in the OTP sent to you, to authenticate</p>
      <AppTextField value={otp} label="Enter OTP" onChange={(e) => setOtp(e.currentTarget.value)} />
      <div className={classes.action}>
        <Fab
          color="primary"
          onClick={(e) =>
            verifyOtp(phoneNumberVerificationToken, otp).then((otpVerificationToken) => {
              signIn(otpVerificationToken);
            })
          }
        >
          {authenticating ? <CircularProgress /> : 'OK'}
        </Fab>
      </div>
    </div>
  ) : (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Please enter your mobile number to login</p>
      <FormControl fullWidth>
        <AppInputField
          inputProps={{ type: 'number', maxLength: 10 }}
          value={mobileNumber}
          onChange={(event) => setMobileNumber(event.currentTarget.value)}
          error={!isMobileNumberValid(mobileNumber)}
          startAdornment={
            <InputAdornment className={classes.inputAdornment} position="start">
              {mobileNumberPrefix}
            </InputAdornment>
          }
        />
        <div className={classes.helpText}>OTP will be sent to this number</div>
      </FormControl>
      <div id={recaptchaContainerId} className={classes.captcha} />
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
