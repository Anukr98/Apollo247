import { makeStyles } from '@material-ui/styles';
import { Theme, Button, Grid, TextField } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import Fab from '@material-ui/core/Fab';
import { useSignIn, useSendOtp, useVerifyOtp, useCurrentUser } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      '& p': {
        fontSize: '17px',
        fontWeight: 500,
        lineHeight: 1.41,
        color: '#0087ba',
        marginTop: '5px',
        marginBottom: '30px',
      },
      '& input': {
        fontSize: '16px',
        fontWeight: 600,
        color: '#02475b',
      },
    },
    inputAdornment: {
      color: '#02475b',
      '& p': {
        color: '#02475b',
        fontSize: '16px',
        fontWeight: 600,
        marginBottom: '7px',
      },
    },
    helpText: {
      fontSize: '12px',
      fontWeight: 500,
      color: '#02475b',
      marginTop: '10px',
      lineHeight: 2,
    },
    action: {
      paddingTop: 0,
      display: 'flex',

      '& button': {
        marginLeft: 'auto',
        marginRight: '-40px',
        backgroundColor: '#FED984',
      },
    },
  };
});

export interface SignInProps {}

export interface SignInProps {}

const recaptchaContainerId = 'recaptcha-container';

const isMobileNumberValid = (number: string) => /^\d{10}$/.test(number);

export const SignIn: React.FC<SignInProps> = (props) => {
  const classes = useStyles();
  const [mobileNumber, setMobileNumber] = React.useState<string>('');
  const [displayOtpInput, setDisplayOtpInput] = React.useState<boolean>(false);
  const [otp, setOtp] = React.useState<string>('');
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const signInArrowImage = <img src={require('images/ic_arrow_forward.svg')} alt="" />;
  // const currentUser = useCurrentUser();

  return displayOtpInput ? (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Type in the OTP sent to you, to authenticate</p>
      <TextField value={otp} onChange={(e) => setOtp(e.currentTarget.value)} />
      <div className={classes.action}>
        <Fab color="primary" onClick={(e) => verifyOtp(otp)}>
          OK
        </Fab>
      </div>
    </div>
  ) : (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Please enter your mobile number to login</p>

      <FormControl fullWidth>
        <Input
          inputProps={{ type: 'number', maxLength: 10 }}
          value={mobileNumber}
          onChange={(event) => setMobileNumber(event.currentTarget.value)}
          error={!isMobileNumberValid(mobileNumber)}
          startAdornment={
            <InputAdornment className={classes.inputAdornment} position="start">
              +91
            </InputAdornment>
          }
        />
        <div className={classes.helpText}>OTP will be sent to this number</div>
      </FormControl>

      <div className={classes.action}>
        <Fab
          color="primary"
          aria-label="Sign in"
          // disabled={!isMobileNumberValid(mobileNumber)}
          onClick={(e) =>
            sendOtp(mobileNumber, recaptchaContainerId).then(() => setDisplayOtpInput(true))
          }
        >
          {signInArrowImage}
        </Fab>
      </div>

      <div id={recaptchaContainerId}></div>
    </div>
  );
};
