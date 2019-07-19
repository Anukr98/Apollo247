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
import { AphTextField, AphInput } from '@aph/web-ui-components';
import { useAuth } from 'hooks/authHooks';
import _isNumber from 'lodash/isNumber';
import _times from 'lodash/times';
import React, { createRef, RefObject, useEffect, useState, useRef } from 'react';
import { Formik, FormikProps, Form, Field, FieldProps } from 'formik';
import { isMobileNumberValid } from '@aph/universal/aphValidators';

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

const OtpInput: React.FC<{ mobileNumber: string }> = (props) => {
  const classes = useStyles();
  const { mobileNumber } = props;
  const mobileNumberWithPrefix = `${mobileNumberPrefix}${mobileNumber}`;

  const [otpInputRefs, setOtpInputRefs] = useState<RefObject<HTMLInputElement>[]>([]);
  const [otp, setOtp] = useState<number[]>([]);
  const placeRecaptchaAfterMe = useRef(null);

  const {
    sendOtp,
    isSendingOtp,
    verifyOtp,
    verifyOtpError,
    isVerifyingOtp,
    isSigningIn,
  } = useAuth();

  useEffect(() => {
    const refs: RefObject<HTMLInputElement>[] = [];
    _times(numOtpDigits, (index) => {
      const inputRef = createRef<HTMLInputElement>();
      refs[index] = inputRef;
    });
    setOtpInputRefs(refs);
  }, []);

  return (
    <div className={`${classes.loginFormWrap} ${classes.otpFormWrap}`}>
      <Typography variant="h2">hi</Typography>
      <p>Type in the OTP sent to you, to authenticate</p>
      <form>
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
              />
            </Grid>
          ))}
        </Grid>
        {verifyOtpError && (
          <FormHelperText
            component="div"
            className={classes.helpText}
            error={verifyOtpError}
            style={{ opacity: verifyOtpError ? 1.0 : 0 }}
          >
            Incorrect OTP
          </FormHelperText>
        )}
        <Button
          variant="text"
          disabled={isSendingOtp}
          className={classes.resendBtn}
          onClick={(e) => {
            sendOtp(mobileNumberWithPrefix, placeRecaptchaAfterMe.current);
            setOtp([]);
            const firstInput = otpInputRefs[0].current;
            if (firstInput) firstInput.focus();
          }}
        >
          Resend OTP
        </Button>
        <div className={classes.action}>
          <Fab
            type="submit"
            color="primary"
            disabled={isSendingOtp || otp.join('').length !== numOtpDigits}
            onClick={(e) => {
              e.preventDefault();
              verifyOtp(otp.join(''));
            }}
          >
            {isSigningIn || isSendingOtp || isVerifyingOtp ? (
              <CircularProgress color="secondary" />
            ) : (
              <img src={require('images/ic_arrow_forward.svg')} />
            )}
          </Fab>
        </div>
      </form>
      <div ref={placeRecaptchaAfterMe} />
    </div>
  );
};

export const SignIn: React.FC = (props) => {
  const classes = useStyles();

  const [displayOtpInput, setDisplayOtpInput] = useState<boolean>(false);
  const placeRecaptchaAfterMe = useRef(null);

  const { sendOtp, sendOtpError, isSendingOtp } = useAuth();

  return (
    <Formik
      initialValues={{ mobileNumber: '' }}
      onSubmit={(values) => {
        const mobileNumberWithPrefix = `${mobileNumberPrefix}${values.mobileNumber}`;
        sendOtp(mobileNumberWithPrefix, placeRecaptchaAfterMe.current).then(() =>
          setDisplayOtpInput(true)
        );
      }}
      render={({ touched, dirty, errors, values }: FormikProps<{ mobileNumber: string }>) => {
        if (displayOtpInput) return <OtpInput mobileNumber={values.mobileNumber} />;
        return (
          <div className={classes.loginFormWrap}>
            <Typography variant="h2">hi</Typography>
            <p>Please enter your mobile number to login</p>
            <Form>
              <Field
                name="mobileNumber"
                validate={(val: string) =>
                  isMobileNumberValid(val) ? undefined : 'This seems like a wrong number'
                }
                render={({ field }: FieldProps<{ mobileNumber: string }>) => {
                  const finishedTyping = field.value.length === 10;
                  const showValidationError =
                    dirty &&
                    !sendOtpError &&
                    Boolean(errors.mobileNumber) &&
                    (finishedTyping || touched.mobileNumber);
                  const showSendOtpError = sendOtpError;
                  return (
                    <FormControl fullWidth>
                      <AphInput
                        {...field}
                        autoFocus
                        inputProps={{ type: 'tel', maxLength: 10 }}
                        error={showValidationError}
                        onKeyPress={(e) => {
                          if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
                        }}
                        startAdornment={
                          <InputAdornment className={classes.inputAdornment} position="start">
                            {mobileNumberPrefix}
                          </InputAdornment>
                        }
                      />
                      <FormHelperText
                        component="div"
                        className={classes.helpText}
                        error={showValidationError || showSendOtpError}
                      >
                        {showValidationError
                          ? errors.mobileNumber
                          : showSendOtpError
                          ? 'Error sending OTP'
                          : 'OTP will be sent to this number'}
                      </FormHelperText>
                    </FormControl>
                  );
                }}
              />
              <div className={classes.action}>
                <Fab
                  type="submit"
                  color="primary"
                  aria-label="Sign in"
                  disabled={Boolean(errors.mobileNumber) || !dirty}
                >
                  {isSendingOtp ? (
                    <CircularProgress color="secondary" />
                  ) : (
                    <img src={require('images/ic_arrow_forward.svg')} />
                  )}
                </Fab>
              </div>
            </Form>
            <div ref={placeRecaptchaAfterMe} />
          </div>
        );
      }}
    />
  );
};
