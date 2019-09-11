import {
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
import { AphTextField, AphInput, AphCircularProgress } from '@aph/web-ui-components';
import { useAuth } from 'hooks/authHooks';
import _isNumber from 'lodash/isNumber';
import _times from 'lodash/times';
import React, { createRef, RefObject, useEffect, useState, useRef } from 'react';
import { Formik, FormikProps, Form, Field, FieldProps } from 'formik';
import { isMobileNumberValid } from '@aph/universal/dist/aphValidators';
import isNumeric from 'validator/lib/isNumeric';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 30,
      },
      '& h2': {
        lineHeight: 'normal',
      },
    },
    inputAdornment: {
      color: theme.palette.secondary.dark,
      '& p': {
        color: theme.palette.secondary.dark,
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 3,
        marginTop: 4,
      },
    },
    helpText: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.6)',
      marginTop: 10,
      lineHeight: 2,
    },
    action: {
      paddingTop: 0,
      display: 'flex',
      '& button': {
        boxShadow: '0 2px 5px rgba(0,0,0,0.2) !important',
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
  const initialOTPMessage = 'Type in the OTP sent to you, to authenticate';
  const resentOTPMessage = 'Type in the OTP that has been resent to you for authentication';
  const [otpStatusText, setOtpStatusText] = useState<string>(initialOTPMessage);

  const [otpInputRefs, setOtpInputRefs] = useState<RefObject<HTMLInputElement>[]>([]);
  const [otp, setOtp] = useState<number[]>([]);
  const placeRecaptchaAfterMe = useRef(null);

  const [submitCount, setSubmitCount] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const countDown = useRef(179);
  const [timer, setTimer] = useState(179);

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

  useEffect(() => {
    if (submitCount > 0) {
      if (submitCount === 3) {
        setShowTimer(true);

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

  return (
    <div className={`${classes.loginFormWrap} ${classes.otpFormWrap}`}>
      <Typography variant="h2">
        {(isSigningIn ||
          isVerifyingOtp ||
          (!verifyOtpError && submitCount === 3) ||
          submitCount != 3) &&
          'great'}
        {!(isSigningIn || isVerifyingOtp) && verifyOtpError && submitCount === 3 && 'oops!'}
      </Typography>
      <p>
        {(isSigningIn ||
          isVerifyingOtp ||
          (!verifyOtpError && submitCount === 3) ||
          submitCount != 3) &&
          otpStatusText}
      </p>
      <p>
        {!(isSigningIn || isVerifyingOtp) &&
          verifyOtpError &&
          submitCount === 3 &&
          'You entered an incorrect OTP 3 times'}
      </p>
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
            <div>
              {!(isSigningIn || isVerifyingOtp) &&
                showTimer &&
                'Try again after ' +
                  Math.floor(timer / 60) +
                  ':' +
                  (timer % 60 <= 9 ? '0' + (timer % 60) : timer % 60)}
            </div>
            <div>
              {!showTimer &&
                submitCount === 2 &&
                submitCount > 0 &&
                ' Incorrect OTP, ' + (3 - submitCount) + ' attempt left'}
              {!showTimer &&
                submitCount === 1 &&
                submitCount > 0 &&
                ' Incorrect OTP, ' + (3 - submitCount) + ' attempts left'}
            </div>
          </FormHelperText>
        )}
        {showTimer ? (
          ''
        ) : (
          <Button
            variant="text"
            disabled={isSendingOtp}
            className={classes.resendBtn}
            onClick={(e) => {
              sendOtp(mobileNumberWithPrefix, placeRecaptchaAfterMe.current);
              setOtp([]);
              setSubmitCount(0);
              setOtpStatusText(resentOTPMessage);
              const firstInput = otpInputRefs[0].current;
              if (firstInput) firstInput.focus();
            }}
          >
            Resend OTP
          </Button>
        )}
        <div className={classes.action}>
          <Fab
            type="submit"
            color="primary"
            disabled={isSendingOtp || otp.join('').length !== numOtpDigits}
            onClick={(e) => {
              e.preventDefault();
              verifyOtp(otp.join(''));
              setSubmitCount(submitCount + 1);
            }}
          >
            {isSigningIn || isSendingOtp || isVerifyingOtp || showTimer ? (
              <AphCircularProgress color="inherit" />
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
    <div data-cypress="SignIn">
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
                      (finishedTyping || Number(field.value[0]) < 6);
                    const showSendOtpError = sendOtpError;
                    return (
                      <FormControl fullWidth>
                        <AphInput
                          {...field}
                          autoFocus
                          inputProps={{
                            type: 'tel',
                            maxLength: 10,
                          }}
                          error={showValidationError}
                          onPaste={(e) => {
                            if (!isNumeric(e.clipboardData.getData('text'))) e.preventDefault();
                          }}
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
                      <AphCircularProgress color="inherit" />
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
    </div>
  );
};
