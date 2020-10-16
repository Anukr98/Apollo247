import React from 'react';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphInput } from '@aph/web-ui-components';
import { HDFC_ENROLL_LINK } from 'helpers/constants';
import { useApolloClient } from 'react-apollo-hooks';
import { useHistory } from 'react-router-dom';
import { IDENTIFY_HDFC_CUSTOMER, VALIDATE_HDFC_OTP, CREATE_SUBSCRIPTION } from 'graphql/profiles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import {
  HDFCGenerateOTPClicked,
  HDFCVerifyOtpClicked,
  HDFCExploreBenefitsClicked,
  HDFCPlanSubscribed,
} from 'webEngageTracking';
import {
  CreateUserSubscription,
  CreateUserSubscriptionVariables,
} from 'graphql/types/CreateUserSubscription';
import { HDFC_CUSTOMER, CreateUserSubscriptionInput } from 'graphql/types/globalTypes';
import { Link } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return {
    hdcContainer: {
      background: `#C4E8EF url(${require('images/hdfc/bg.svg')}) no-repeat 0 0`,
      backgroundPosition: 'bottom',
      boxShadow: ' 0px 5px 20px rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: 16,
      margin: '30px 0 0 auto',
      position: 'relative',
    },
    hdfcIntro: {
      // display: 'none',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 0',
      },

      '& h2': {
        fontSize: 24,
        fontWeight: 600,
        color: '#07AE8B',
        lineHeight: '20px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 14,
        },
      },
      '& button': {
        bottom: 30,
        // right: 10,
        boxShadow: 'none',
        display: 'block',
        marginLeft: 'auto',
        fontSize: 16,
        background: '#E52936',
        color: '#fff',
        [theme.breakpoints.down('sm')]: {
          bottom: 10,
          fontSize: 12,
        },
        '&:hover': {
          background: '#E52936',
          color: '#fff',
        },
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },

    hdcContent: {
      position: 'relative',
    },
    desc: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      fontSize: 12,
      fontWeight: 300,
      color: '#01475B',
      lineHeight: '16px',
      fontStyle: 'italic',
      [theme.breakpoints.down('sm')]: {
        fontSize: 10,
        bottom: 0,
        left:0,
        width: '60%',
      },
    },
    note: {
      fontSize: 10,
      fontWeight: 500,
      color: '#FF637B',
      lineHeight: '16px',
    },
    connectDoctorContent: {
      display: 'flex',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
    cdDetails: {
      width: '50%',
      padding: 12,
      '& img': {
        margin: '0 auto 10px',
      },
      '& h5': {
        fontSize: 12,
        color: '#00B38E',
        linHeight: '16px',
        '& span': {
          fontWeight: 700,
        },
      },
    },
    otpValidator: {
      padding: '20px 0 0',
      // display: 'none',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 0',
      },

      '& h2': {
        fontSize: 20,
        fontWeight: 500,
        lineHeight: '18px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 14,
        },
      },
    },
    otpContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    otpError: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      '& p': {
        color: '#ED1C24',
        fontSize: 12,
        fontWeight: 600,
        [theme.breakpoints.down('sm')]: {
          fontsize: 11,
        },
      },
    },
    otpInput: {
      display: 'flex',
      alignItems: 'center',
      padding: '20px 0 30px',
      [theme.breakpoints.down('sm')]: {
        padding: 0,
      },
    },
    otp: {
      width: 240,
      margin: '0 30px 0 0',
      [theme.breakpoints.down('sm')]: {
        width: 240,
      },
      '&:last-child': {
        margin: 0,
      },
      '& input': {
        fontsize: 18,
        fontWeight: 500,
        textAlign: 'center',
      },
    },
    btnAction: {
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        margin: '0 0 20px',
      },
      '& button': {
        margin: '0 0 0 10px',
        '&:first-child': {
          boxShadow: 'none',
          color: '#E52936',
        },
        '&:last-child': {
          background: '#E52936',
          color: '#fff',
          '& img': {
            display: 'none',
            [theme.breakpoints.down('sm')]: {
              display: 'block',
            },
          },
        },
        [theme.breakpoints.down('sm')]: {
          '&:last-child': {
            position: 'absolute',
            bottom: -37,
            right: 20,
            width: 44,
            height: 44,
            padding: 10,
            minWidth: 'auto',
            borderRadius: '50%',
            margin: 0,
            '& p': {
              display: 'none',
            },
          },
        },
      },
    },
    dialogContent: {},
    dialogHeader: {
      padding: '16px 16px 10px',
      '& h3': {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '21px',
      },
      '& p': {
        fontSize: 10,
        lineHeight: '13px',
      },
    },

    btnContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'absolute',
      bottom: 0,
      right: 0,
      '& a, button': {
        margin: '0 0 0 10px',
        '&:first-child': {
          boxShadow: 'none',
          color: '#E52936',
        },
      },
    },
    p0: {
      padding: 0,
    },
    callNote: {
      fontSize: 12,
      linrHeight: '16px',
      '& span': {
        display: 'block',
      },
    },
    cContainer: {
      padding: '0 0 30px',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 30px',
      },

      '& a,button': {
        marginLeft: 'auto',
        position: 'absolute',
        bottom: 0,
        right: 0,
        boxShadow: 'none',
        background: '#E52936',
        color: '#fff',
        [theme.breakpoints.down('sm')]: {
          margin: '20px 0 0 0',
        },
        '&:hover': {
          background: '#E52936',
          color: '#fff',
        },
      },
    },
    cContent: {
      width: '70%',
      margin: '0  auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        margin: '0 0 20px',
      },
      '& img': {
        margin: '0 40px 0 0',
        [theme.breakpoints.down('sm')]: {
          margin: '0 20px 0 0',
        },
      },
      '& h2': {
        fontSize: 32,
        fontWeight: 700,
        lineHeight: '42px',
        margin: '0 0 20px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 24,
          lineHeight: '24px',
          margin: ' 0 0 10px',
        },
      },
      '& p': {
        fontSize: 18,
        lineHeight: '24px',
        margin: '0 0 5px',
        fontWeight: 500,
        [theme.breakpoints.down('sm')]: {
          fontSize: 14,
          lineHeight: '12px',
        },
        '& span': {
          color: '#E52936',
        },
      },
    },
    remark:{


    },
    description: {
      fontSize: '14px !important',
      fontWeight: 300,
      lineHeight: '16px',
      margin: 0,
      color: '#02475b !important',
      [theme.breakpoints.down('sm')]: {
        fontSize: '10px !important',
      },
    },
    recheckOtpContent: {
      '& button': {
        boxShadow: 'none',
        color: '#E52936',
      },
      '& a': {
        boxShadow: 'none',
        color: '#E52936',
        fontWeight: 600,
        textTransform: 'uppercase',
        fontSize: 13,
      },
    },
    recheckOtp: {
      // display: 'none',
      width: '60%',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        padding: '0 0 50px',
      },
      '& h2': {
        fontSize: 32,
        fontWeight: 600,
        color: '#02475b',
        lineHeight: '42px',
        margin: '0 0 10px',
        display: 'flex',
        alignItems: 'center',
        '& img': {
          margin: '0 10px 0 0',
        },
        [theme.breakpoints.down('sm')]: {
          fontSize: 18,
          lineHeight: '24px',
          margin: '0 0 5px',
        },
      },
      '& p': {
        fontSize: 14,
        lineHeight: '24px',
        margin: '0 0 10px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
          lineHeight: '16px',
        },
      },
    },
    newContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '70%',
      margin: '0 auto',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        margin: '0 0 10px',
      },
      '& h2': {
        fontSize: 32,
        fontWeight: 700,
        color: '#005CA8',
        lineHeight: '42px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 14,
          lineHeight: '24px',
          margin: 0,
        },
      },
      '& img': {
        margin: '0 30px 0 0',
        [theme.breakpoints.down('sm')]: {
          width: 54,
          margin: '0 15px 0 0',
        },
      },
    },
    overflowHidden: {
      overflow: 'hidden',
    },
    planName: {
      color: '#d3a047',
    },
    hdcHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 0 10px',
      '& img':{
        [theme.breakpoints.down('sm')]: {
          width: 120,
        }
      }
    },
  };
});

export interface HdfcRegistrationProps {
  patientPhone: string | null;
}

export const HdfcRegistration: React.FC<HdfcRegistrationProps> = (props) => {
  const classes = useStyles({});
  const [callDoctorPopup, setCallDoctorPopup] = React.useState<boolean>(false);
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const [statusOfUser, setStatusOfUser] = React.useState('');
  const [token, setToken] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpError, setOtpError] = React.useState<boolean>(false);
  const [planName, setPlanName] = React.useState('');
  const [minTransactionValue, setMinTransactionValue] = React.useState(499);
  const [userSubscriptionInput, setUserSubscriptionInput] = React.useState<
    CreateUserSubscriptionInput
  >();
  const apolloClient = useApolloClient();
  const history = useHistory();

  const [showIntro, setShowIntro] = React.useState<boolean>(true);
  const [showOTPValidator, setShowOTPValidator] = React.useState<boolean>(false);
  const [showCongratulations, setShowCongratulations] = React.useState<boolean>(false);
  const [showRecheckOTP, setShowRecheckOTP] = React.useState<boolean>(false);
  const [showOtpFail, setShowOtpFail] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const queryIdentifyHDFCCustomer = () => {
    setLoading(true);
    /*****WebEngage*******/
    const data = {
      mobileNumber: currentPatient.mobileNumber,
      DOB: currentPatient.dateOfBirth,
      emailId: currentPatient.emailAddress,
      PartnerId: currentPatient.partnerId,
    };
    HDFCGenerateOTPClicked(data);
    /*****WebEngage*******/
    apolloClient
      .query({
        query: IDENTIFY_HDFC_CUSTOMER,
        variables: {
          mobile_number: props.patientPhone,
          DOB: currentPatient.dateOfBirth,
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setStatusOfUser(response.data.identifyHdfcCustomer.status);
        if (response.data.identifyHdfcCustomer.status == HDFC_CUSTOMER.OTP_GENERATED) {
          setToken(response.data.identifyHdfcCustomer.token);
          setLoading(false);
          setShowIntro(false);
          setShowRecheckOTP(false);
          setShowOTPValidator(true);
          /* GA Tracking */
          (window as any).dataLayer.push({
            event: 'HDFC OTP Generated',
          });
          /*******************/
        } else if (response.data.identifyHdfcCustomer.status == HDFC_CUSTOMER.OTP_NOT_GENERATED) {
          setLoading(false);
          setShowIntro(false);
          setShowOtpFail(true);
          setShowRecheckOTP(true);
        } else {
          setLoading(false);
          setShowIntro(false);
          setShowRecheckOTP(true);
          /* GA Tracking */
          (window as any).dataLayer.push({
            event: 'HDFC Account Not Found',
          });
          /*******************/
        }
      })
      .catch((error) => {
        console.error('Failed idetifying HDFC Customer' + error);
        setLoading(false);
      });
  };

  const validateHDFCOtp = () => {
    setLoading(true);
    /* GA Tracking */
    (window as any).dataLayer.push({
      event: 'HDFC OTP Submitted',
    });
    /*******************/
    /*****WebEngage*******/
    const data = {
      mobileNumber: currentPatient.mobileNumber,
      DOB: currentPatient.dateOfBirth,
      emailId: currentPatient.emailAddress,
      PartnerId: currentPatient.partnerId,
    };
    HDFCVerifyOtpClicked(data);
    /*****WebEngage*******/
    apolloClient
      .query({
        query: VALIDATE_HDFC_OTP,
        variables: {
          otp: otp,
          token: token,
          dateOfBirth: currentPatient.dateOfBirth,
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setOtpError(!response.data.validateHdfcOTP.status);
        if (
          response.data.validateHdfcOTP.status === true &&
          response.data.validateHdfcOTP.defaultPlan
        ) {
          subscribeToHDFCPlan(
            response.data.validateHdfcOTP.defaultPlan,
            currentPatient.mobileNumber
          );
          /* GA Tracking */
          (window as any).dataLayer.push({
            event: 'HDFC OTP Validated',
          });
          /*******************/
        }
        if (response.data.validateHdfcOTP.status === false) {
          setLoading(false);
          /* GA Tracking */
          (window as any).dataLayer.push({
            event: 'HDFC OTP Validation failed',
          });
          /*******************/
        }
      })
      .catch((error) => {
        console.error('Validating HDFC OTP Failed' + error);
      });
  };

  const subscribeToHDFCPlan = (group_plan_id: string, mobile_number: string) => {
    apolloClient
      .query<CreateUserSubscription, CreateUserSubscriptionVariables>({
        query: CREATE_SUBSCRIPTION,
        variables: {
          userSubscription: {
            plan_id: group_plan_id,
            mobile_number: currentPatient.mobileNumber,
            FirstName: currentPatient.firstName,
            storeCode: 'WEBCUS',
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        const plan =
          response.data &&
          response.data.CreateUserSubscription &&
          response.data.CreateUserSubscription.response &&
          response.data.CreateUserSubscription.response.group_plan &&
          response.data.CreateUserSubscription.response.group_plan.name;
        const min_transaction_value =
          response.data &&
          response.data.CreateUserSubscription &&
          response.data.CreateUserSubscription.response &&
          response.data.CreateUserSubscription.response.group_plan &&
          response.data.CreateUserSubscription.response.group_plan.min_transaction_value;

        setPlanName(plan);
        setMinTransactionValue(min_transaction_value)
        setLoading(false);
        setShowOTPValidator(false);
        setShowCongratulations(true);
        /*****WebEngage*******/
        const data = {
          mobileNumber: currentPatient.mobileNumber,
          DOB: currentPatient.dateOfBirth,
          emailId: currentPatient.emailAddress,
          PartnerId: currentPatient.partnerId,
          planName: plan,
        };
        HDFCPlanSubscribed(data);
        /*****WebEngage*******/
        /* GA Tracking */
        (window as any).dataLayer.push({
          event: 'HDFC Plan Subscribed',
          Plan: plan,
        });
        /*******************/
      })
      .catch((error) => {
        setLoading(false);
        setShowOTPValidator(false);
        setShowIntro(true);
        console.error('Validating HDFC OTP Failed' + error);
      });
  };

  return (
    <div className={`${classes.hdcContainer}`}>
      <div className={classes.hdcContent}>
        <div className={classes.hdcHeader}>
          <img src={require('images/hdfc/apollo-hashtag.svg')} alt="HDFC Call Doctor" width="150" />
          <img src={require('images/hdfc/hdfc-logo.svg')} alt="HDFC Call Doctor" width="150" />
        </div>
        {/* Intro */}

        {showIntro && (
          <div className={classes.hdfcIntro}>
            <div className={classes.newContent}>
              <img src={require('images/hdfc/last-step.svg')} alt="Otp" />
              <Typography component="h2">
                One last step to start your HealthyLife Journey
              </Typography>
            </div>
            <Typography className={classes.desc}>
              Please ensure your Mobile no. and DOB with Apollo 24|7 match HDFC Bank's records​
            </Typography>
            <AphButton
              onClick={() => {
                /* GA Tracking */
                (window as any).dataLayer.push({
                  event: 'HDFC OTP Requested',
                });
                /*******************/
                queryIdentifyHDFCCustomer();
              }}
            >
              {loading ? <CircularProgress size={30} /> : 'Generate Otp'}{' '}
            </AphButton>
          </div>
        )}
        {/* Otp Validator */}
        {showOTPValidator && (
          <div className={classes.otpValidator}>
            <Typography component="h2">Please Enter OTP Sent by HDFC Bank</Typography>
            <div className={classes.otpContainer}>
              <div className={classes.otpInput}>
                <AphInput
                  className={classes.otp}
                  onChange={(e) => {
                    setOtpError(false);
                    setOtp(e.target.value);
                  }}
                  disabled={loading ? true : false}
                />
                {/* <AphInput className={classes.otp} />
              <AphInput className={classes.otp} />
              <AphInput className={classes.otp} />
              <AphInput className={classes.otp} /> */}
              </div>
              {otpError && (
                <div className={classes.otpError}>
                  <Typography>Oops! Re-enter OTP</Typography>
                </div>
              )}
              <div className={classes.btnAction}>
                <AphButton onClick={() => queryIdentifyHDFCCustomer()}>
                  {loading ? <CircularProgress size={30} /> : <Typography>Resend Otp</Typography>}
                </AphButton>
                <AphButton variant="contained" onClick={() => validateHDFCOtp()}>
                  {loading ? <CircularProgress size={30} /> : <Typography>Submit Otp</Typography>}
                  <img src={require('images/ic_arrow_forward.svg')} alt="" />
                </AphButton>
              </div>
            </div>
          </div>
        )}
        {/* Congratulations Section */}
        {showCongratulations && (
          <div className={classes.cContainer}>
            <div className={classes.cContent}>
              <img src={require('images/hdfc/congrats.svg')} alt="Congraulations" />
              <div>
                <Typography component="h2">Congratulations ! </Typography>
                <Typography>
                  You are now a{' '}
                  <span className={classes.planName}>{planName.split(' ')[0]} Member</span>
                </Typography>
                <Typography className={classes.remark}>As a limited period offer, the minimum spend limit of Rs.{minTransactionValue} has been waived off, specially for you. </Typography>
              </div>
            </div>
            <AphButton
              onClick={() => {
                /*****WebEngage*******/
                const data = {
                  mobileNumber: currentPatient.mobileNumber,
                  DOB: currentPatient.dateOfBirth,
                  emailId: currentPatient.emailAddress,
                  PartnerId: currentPatient.partnerId,
                  planName: planName,
                };
                HDFCExploreBenefitsClicked(data);
                /*****WebEngage*******/
                history.push(clientRoutes.membershipPlanDetail());
              }}
            >
              Explore Benefits
            </AphButton>
          </div>
        )}
        {/* Recheck OTP Section */}
        {showRecheckOTP && (
          <div className={classes.recheckOtpContent}>
            <div className={classes.recheckOtp}>
              <Typography component="h2">
                <img src={require('images/hdfc/sorry-new.svg')} alt="Sorry" />
                Sorry !
              </Typography>
              <Typography>
                {showOtpFail
                  ? 'Due to a technical glitch, we are unable to verify your details with HDFC Bank right now. Please try again in sometime'
                  : `Please ensure your Mobile no. and DOB with Apollo 24|7 match HDFC Bank's records.​ If you are not an HDFC Bank customer, you can become one by opening a Savings account with HDFC Bank`}
              </Typography>
            </div>
            <div className={classes.btnContainer}>
              {!showOtpFail && (
                <Link target="_blank" href={HDFC_ENROLL_LINK}>
                  Open Savings Account
                </Link>
              )}
              <AphButton
                onClick={() => {
                  /* GA Tracking */
                  (window as any).dataLayer.push({
                    event: 'HDFC OTP Rechecked',
                  });
                  /*******************/
                  queryIdentifyHDFCCustomer();
                }}
              >
                {loading ? <CircularProgress size={30} /> : 'Recheck Otp'}
              </AphButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
