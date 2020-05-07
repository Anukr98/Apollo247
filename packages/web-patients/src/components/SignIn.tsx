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
import { AphInput, AphCircularProgress } from '@aph/web-ui-components';
import _isNumber from 'lodash/isNumber';
import _times from 'lodash/times';
import React, { createRef, RefObject, useEffect, useState, useRef } from 'react';
import { Formik, FormikProps, Form, Field, FieldProps } from 'formik';
import { isMobileNumberValid } from '@aph/universal/dist/aphValidators';
import isNumeric from 'validator/lib/isNumeric';
import { useAuth } from 'hooks/authHooks';
import { gtmTracking } from '../gtmTracking';

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
    resendBtnDisabled: {
      color: '#fc9916 !important',
      opacity: 0.4,
    },
    resendActions: {
      display: 'flex',
      alignItems: 'center',
      '& >span': {
        paddingLeft: 10,
        paddingTop: 10,
        fontSize: 12,
      },
    },
  };
});

const mobileNumberPrefix = '+91';
const numOtpDigits = 6;

const OtpInput: React.FC<{ mobileNumber: string; setOtp: (otp: string) => void }> = (props) => {
  const classes = useStyles({});
  const { mobileNumber, setOtp: setOtpMain } = props;
  const mobileNumberWithPrefix = `${mobileNumberPrefix}${mobileNumber}`;
  const initialOTPMessage = 'Now type in the OTP sent to you for authentication';
  const resentOTPMessage = 'Type in the OTP that has been resent to your mobile number';
  const blockedMessage = 'You entered an incorrect OTP 3 times. Please try again after some time';
  const [otpStatusText, setOtpStatusText] = useState<string>(initialOTPMessage);
  const [otpInputRefs, setOtpInputRefs] = useState<RefObject<HTMLInputElement>[]>([]);
  const [otp, setOtp] = useState<string>('');
  const countDown = useRef(900);
  const [otpSubmitCount, setOtpSubmitCount] = useState(0);
  const [showTimer, setShowTimer] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(900);
  const [disableResendOtpButton, setDisableResendOtpButton] = useState<boolean>(false);
  const [disableResendOtpButtonCounter, setDisableResendOtpButtonCounter] = useState<number>(0);
  const maxAllowedAttempts = 3;
  const noOfAttemptsLeft = maxAllowedAttempts - otpSubmitCount;
  const [otpExeedError, setOtpExeedError] = useState(false);
  const {
    isSendingOtp,
    verifyOtp,
    verifyOtpError,
    isVerifyingOtp,
    isSigningIn,
    customLoginId,
    resendOtp,
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
    if (disableResendOtpButtonCounter >= 0) {
      setTimeout(() => setDisableResendOtpButtonCounter(disableResendOtpButtonCounter - 1), 1000);
    } else {
      setDisableResendOtpButton(false);
    }
  }, [disableResendOtpButtonCounter]);

  useEffect(() => {
    if (otpSubmitCount > 0) {
      if (otpSubmitCount === 3) {
        setOtpExeedError(true);
        const obj = {
          mobileNumber: mobileNumber,
          timerMiliSeconds: new Date().getTime(),
        };
        const getData = localStorage.getItem('timeOutData');
        if (getData) {
          const timeOutData = JSON.parse(getData);
          timeOutData.push(obj);
          localStorage.setItem('timeOutData', JSON.stringify(timeOutData));
        } else {
          const timeOutData = [];
          timeOutData.push(obj);
          localStorage.setItem('timeOutData', JSON.stringify(timeOutData));
        }
        setOtpStatusText(blockedMessage);
        setOtp('');
        setShowTimer(true);
        const interval = setInterval(() => {
          countDown.current--;
          setTimer(countDown.current);
          if (countDown.current === 0) {
            clearInterval(interval);
            setOtpSubmitCount(0);
            setShowTimer(false);
            countDown.current = 900;
          }
        }, 1000);
      }
    } else if (localStorage.getItem('timeOutData')) {
      const getData = localStorage.getItem('timeOutData');
      if (getData) {
        const timeOutData = JSON.parse(getData);
        timeOutData.map((item: any) => {
          if (item.mobileNumber == mobileNumber) {
            const leftSeconds: number =
              (new Date().getTime() - Number(item.timerMiliSeconds)) / 1000;
            if (leftSeconds < 900) {
              setOtpStatusText(blockedMessage);
              setOtpExeedError(true);
              setOtp('');
              countDown.current = Math.floor(900 - leftSeconds);
              const interval = setInterval(() => {
                setShowTimer(true);
                countDown.current--;
                setTimer(countDown.current);
                if (countDown.current === 0) {
                  clearInterval(interval);
                  setOtpSubmitCount(0);
                  setShowTimer(false);
                  countDown.current = 900;
                }
              }, 1000);
            } else {
              localStorage.setItem('timeOutData', '');
              setOtpExeedError(false);
            }
          }
        });
      }
    }
  }, [otpSubmitCount]);

  return (
    <div className={`${classes.loginFormWrap}`}>
      <Typography variant="h2">
        {(verifyOtpError && otpSubmitCount === 3) || otpExeedError ? 'oops!' : 'great'}
      </Typography>
      <p>{otpStatusText}</p>
      {(verifyOtpError && otpSubmitCount === 3) || otpExeedError ? (
        <FormHelperText
          component="div"
          className={classes.helpText}
          error={verifyOtpError || otpExeedError}
        >
          <div>
            {!(isSigningIn || isVerifyingOtp) &&
              showTimer &&
              `Try again after  ${Math.floor(timer / 60)}:${
                timer % 60 <= 9 ? `0` + (timer % 60) : timer % 60
              }`}
          </div>
        </FormHelperText>
      ) : (
        <form>
          <AphInput
            autoFocus
            inputProps={{ type: 'tel', maxLength: 6 }}
            error={verifyOtpError && !isSigningIn}
            onPaste={(e) => {
              if (!isNumeric(e.clipboardData.getData('text'))) e.preventDefault();
            }}
            onKeyPress={(e) => {
              if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
            }}
            onChange={(e) => {
              setOtp(e.target.value);
              setOtpMain(e.target.value.length > 0 ? e.target.value.toString() : '');
            }}
            title={'Please enter the otp'}
          />

          {verifyOtpError && !isSigningIn && (
            <FormHelperText component="div" className={classes.helpText} error={verifyOtpError}>
              <div>
                {`${otpSubmitCount > 0 && ' Incorrect OTP, '}
                 ${noOfAttemptsLeft}
                    ${otpSubmitCount === 2 ? ' attempt left' : ' attempts left'}`}
              </div>
            </FormHelperText>
          )}
          <div className={classes.resendActions}>
            <Button
              variant="text"
              disabled={isSendingOtp || disableResendOtpButton}
              className={classes.resendBtn}
              classes={{
                disabled: classes.resendBtnDisabled,
              }}
              onClick={(e) => {
                resendOtp(mobileNumberWithPrefix, customLoginId);
                setOtp('');
                setOtpStatusText(resentOTPMessage);
                const firstInput = otpInputRefs[0].current;
                if (firstInput) firstInput.focus();
                setDisableResendOtpButton(true);
                setDisableResendOtpButtonCounter(30);
              }}
              title={'Request resend otp'}
            >
              Resend OTP
            </Button>
            {disableResendOtpButton ? (
              <span>{`00:${String(disableResendOtpButtonCounter).padStart(2, '0')}`}</span>
            ) : null}
          </div>
          <div className={classes.action}>
            <Fab
              type="submit"
              color="primary"
              disabled={isSendingOtp || otp.length !== numOtpDigits}
              onClick={(e) => {
                e.preventDefault();

                /**Gtm code start start */
                gtmTracking({
                  category: 'Profile',
                  action: 'Signup / Login',
                  label: 'OTP Entered',
                });
                /**Gtm code start end */

                verifyOtp(otp, customLoginId).then((authToken) => {
                  if (!authToken) {
                    setOtpSubmitCount(otpSubmitCount + 1);
                  }
                });
              }}
              title={'Login'}
            >
              {isSigningIn || isSendingOtp || isVerifyingOtp ? (
                <AphCircularProgress color="inherit" />
              ) : (
                <img src={require('images/ic_arrow_forward.svg')} />
              )}
            </Fab>
          </div>
        </form>
      )}
      {/* <div ref={placeRecaptchaAfterMe} /> */}
    </div>
  );
};

interface signInProps {
  setMobileNumber: (mobileNumber: string) => void;
  setOtp: (otp: string) => void;
  mobileNumber: string;
  otp: string;
}

export const SignIn: React.FC<signInProps> = (props) => {
  const classes = useStyles({});

  const [displayOtpInput, setDisplayOtpInput] = useState<boolean>(false);
  const placeRecaptchaAfterMe = useRef(null);

  const { sendOtp, sendOtpError, isSendingOtp } = useAuth();
  const { setMobileNumber, setOtp, mobileNumber } = props;

  return (
    <div data-cypress="SignIn">
      <Formik
        initialValues={{ mobileNumber: '' }}
        onSubmit={(values) => {
          /**Gtm code start start */
          gtmTracking({ category: 'Profile', action: 'Signup / Login', label: 'Mobile Entered' });
          /**Gtm code start end */

          const mobileNumberWithPrefix = `${mobileNumberPrefix}${mobileNumber}`;
          sendOtp(mobileNumberWithPrefix).then(() => setDisplayOtpInput(true));
        }}
        render={({ errors, values }: FormikProps<{ mobileNumber: string }>) => {
          if (displayOtpInput)
            return <OtpInput mobileNumber={mobileNumber} setOtp={(otp: string) => setOtp(otp)} />;
          return (
            <div className={classes.loginFormWrap}>
              <Typography variant="h2">hi</Typography>
              <p>Please enter your mobile number to login</p>
              <Form>
                <Field
                  name="mobileNumber"
                  // validate={() => {
                  //   isMobileNumberValid(mobileNumber)
                  //     ? undefined
                  //     : 'This seems like a wrong number';
                  // }}
                  render={({ field }: FieldProps<{ mobileNumber: string }>) => {
                    // const finishedTyping = field.value.length === 10;
                    // const showValidationError =
                    //   !sendOtpError &&
                    //   Boolean(errors.mobileNumber) &&
                    //   (finishedTyping || Number(field.value[0]) < 6);
                    const showValidationError =
                      mobileNumber.length === 10 && !isMobileNumberValid(mobileNumber);
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
                          onChange={(e) => {
                            setMobileNumber(e.target.value);
                          }}
                          startAdornment={
                            <InputAdornment className={classes.inputAdornment} position="start">
                              {mobileNumberPrefix}
                            </InputAdornment>
                          }
                          value={mobileNumber}
                          title={'Please enter mobile number'}
                        />
                        <FormHelperText
                          component="div"
                          className={classes.helpText}
                          error={showValidationError || showSendOtpError}
                        >
                          {showValidationError
                            ? 'This seems like a wrong number'
                            : showSendOtpError
                            ? ''
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
                    // disabled={Boolean(errors.mobileNumber) || !dirty}
                    disabled={!isMobileNumberValid(mobileNumber)}
                    title={'Login'}
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
