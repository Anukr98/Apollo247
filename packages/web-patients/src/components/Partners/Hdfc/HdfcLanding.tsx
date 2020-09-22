import React, { useRef, useEffect } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { Theme, Typography, FormControl, Fab, Modal } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { AphButton, AphDialog, AphTextField, AphRadio } from '@aph/web-ui-components';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { SignIn } from 'components/SignIn';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { createMuiTheme } from '@material-ui/core';
import { Route } from 'react-router-dom';
import _isEmpty from 'lodash/isEmpty';
import { Formik, FormikProps, Field, FieldProps, Form } from 'formik';
import { useMutation, useQuery, useApolloClient } from 'react-apollo-hooks';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { UpdatePatient, UpdatePatientVariables } from 'graphql/types/UpdatePatient';
import {
  UPDATE_PATIENT,
  //   CREATE_SUBSCRIPTION,
  //   GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
} from 'graphql/profiles';
import { ProfileSuccess } from 'components/ProfileSuccess';
import { NewProfile } from 'components/NewProfile';

// import { createSubscription, createSubscriptionVariables } from 'graphql/types/createSubscription';
// import {
//   getSubscriptionsOfUserByStatus,
//   getSubscriptionsOfUserByStatusVariables,
// } from 'graphql/types/getSubscriptionsOfUserByStatus';

const useStyles = makeStyles((theme: Theme) => {
  return {
    mainContainer: {},
    container: {
      width: 1064,
      margin: '0 auto',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    header: {
      width: 1064,
      margin: '0 auto',
      padding: '12px 16px',
      background: '#fff',
      boxShadow: ' 0px 2px 5px rgba(128, 128, 128, 0.2)',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    headerFixed: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    mainContent: {
      background: '#fff',
      padding: 0,
    },
    bannerContainer: {
      padding: 0,
      [theme.breakpoints.down('sm')]: {
        padding: 16,
      },
    },
    mainBanner: {
      width: '100%',
      position: 'relative',
      [theme.breakpoints.down('sm')]: {
        borderRadius: 10,
        overflow: 'hidden',
      },
    },
    bannerContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      padding: 60,
      [theme.breakpoints.down('sm')]: {
        padding: 16,
      },
      '& p': {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 600,
        color: '#fff',
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
          lineHeight: '18px',
        },
      },
      '& h1': {
        fontSize: 32,
        lineHeight: '38px',
        fontWeight: 700,
        color: '#fff',
        [theme.breakpoints.down('sm')]: {
          fontSize: 16,
          lineHeight: '22px',
        },
      },
      '& button': {
        display: 'block',
        margin: '20px 0 0 auto',
        [theme.breakpoints.down('sm')]: {
          margin: '0 0 0 auto',
        },
      },
    },
    bannerDetails: {
      width: '60%',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    benefitContent: {
      padding: 30,
      [theme.breakpoints.down('sm')]: {
        padding: '0 20px',
      },
      '& h2': {
        textTransform: 'uppercase',
        fontWeight: 600,
        fontSize: 24,
        lineHeight: '22px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 16,
          padding: '0 0 10px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    benefitList: {
      padding: 0,
      listStyle: 'none',
      margin: '10px 0',
      display: 'grid',
      gridTemplateColumns: '40% 50%',
      gridColumnGap: 50,
      '& li': {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '20px 0',
        '& img': {
          width: 40,
          margin: '0 20px 0 0',
        },
      },
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        '& li': {
          padding: '10px 0',
          '& img': {
            width: '20px !important',
            margin: '0 20px 0 0',
          },
        },
      },
    },
    benefitDetails: {
      '& h3': {
        fontSize: 20,
        lineHeight: '20px',
        fontWeight: 600,
        color: '#00B38E',
        margin: '0 0 15px',
      },
      '& p': {
        fontSize: 18,
        lineHeight: '18px',
      },
      [theme.breakpoints.down('sm')]: {
        '& h3': {
          fontSize: 12,
          lineHeight: '12px',
          margin: 0,
        },
        '& p': {
          fontSize: 12,
          lineHeight: '20px',
        },
      },
    },
    register: {
      fontSize: 18,
      fontWeight: 600,
      fontStyle: 'italic',
      padding: '0 60px',
      textAlign: 'right',
      textTransform: 'uppercase',
      [theme.breakpoints.down('sm')]: {
        fontSize: 12,
        textAlign: 'left',
        padding: '0 20px',
      },
    },
    apolloContainer: {
      padding: '20px 0',
      [theme.breakpoints.down('sm')]: {
        padding: 16,
      },
    },
    apolloCare: {
      padding: 50,
      background: '#02475b',
      display: 'flex',
      alignItems: 'flex-start',
      [theme.breakpoints.down('sm')]: {
        padding: 10,
        borderRadius: 10,
      },
      '& img': {
        margin: '0 40px 0 0',
        [theme.breakpoints.down('sm')]: {
          margin: '0 20px 0 0',
          width: 30,
        },
      },
      '& h4': {
        fontSize: 24,
        fontWeight: 600,
        textTransform: 'uppercase',
        lineHeight: '32px',
        margin: '0 0 5px',
        color: '#fff',
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
          lineHeight: '12px',
        },
      },
      '& p': {
        fontSize: 16,
        lineHeight: '24px',
        color: '#fff',
        width: '80%',
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
          lineHeight: '16px',
          width: 'auto',
        },
      },
    },
    acContainer: {
      '& button': {
        fontSize: 14,
        boxShadow: 'none',
        fontWeight: 700,
        margin: '30px 0 0',
        display: 'block',
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
          margin: '10px 0 0',
        },
      },
    },
    tncContainer: {
      padding: 30,
      [theme.breakpoints.down('sm')]: {
        padding: '0 16px',
      },
    },
    tncContent: {
      boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.08)',
      padding: 20,
      borderRadius: 10,
      '& h4': {
        fontSize: 24,
        fontWeight: 600,
        textTransform: 'uppercase',
        margin: '0 0 10px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
      [theme.breakpoints.down('sm')]: {
        padding: 16,
      },
    },
    tncList: {
      margin: 0,
      padding: '0 0 0 20px',
      listStyle: 'decimal',
      '& li': {
        fontSize: 16,
        padding: '10px 0 10px 10px',
        '& a': {
          fontWeight: 700,
          color: '#FC9916',
        },
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
    },
    loginForm: {
      width: 280,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    topPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
    },
    dialogcontent: {
      padding: 20,
      textAlign: 'center',
      '& img': {
        margin: '30px 0 10px',
      },
      '& p': {
        fontSize: 12,
        margin: '5px auto',
        width: '80%',
      },
      '& button': {
        margin: '10px 0',
      },
    },
    hightLight: {
      color: '#07AE8B',
    },
    finalStep: {
      padding: '24px 16px',
      width: 300,
      margin: '0 0 0 -40px',
      '& h2': {
        color: '#0087BA',
        fontSize: 14,
        fontWeight: 500,
        margin: '0 0 10px',
      },
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
    formControl: {
      padding: '5px 0',
      width: '100%',
      '& label': {
        color: 'rgba(2, 71, 91, 0.6) !important',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '16px',
      },
    },
    radioContainer: {
      margin: '10px 0 0 10px',
      flexDirection: 'row',
      '& label': {
        width: '48%',
        '& span': {
          '&:first-child': {
            padding: 0,
            margin: '0 5px 0 0',
          },
        },
      },
    },
    keyboardDatePicker: {
      padding: '10px 0',
      width: '100%',
      color: '#02475b !important',
      '& label': {
        color: 'rgba(2, 71, 91, 0.6) !important',
        fontSize: 14,
        fontWeight: 500,
        margin: '10px 0 0',
      },
      '& svg': {
        fill: '#FC9916',
      },
      '& div': {
        '&:before': {
          borderBottom: '2px solid #00b38e !important',
        },
        '&:after': {
          borderBottom: '2px solid #00b38e !important',
        },
      },
      '& input': {
        fontSize: 14,
        color: '#01475b',
        borderBottom: 'none',
        fontWeight: 500,
        padding: '10px 0',
      },
    },
    hideMobile: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    showMobile: {
      display: 'block',
    },
    hideWeb: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
  };
});

const defaultMaterialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#00b38e',
    },
    text: {
      primary: '#00b38e',
    },
    action: {
      selected: '#fff',
    },
  },
  typography: {
    fontWeightMedium: 600,
    htmlFontSize: 14,
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body1: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
    },
    body2: {
      fontWeight: 600,
    },
    caption: {
      fontSize: 0,
    },
  },
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

interface FormValues {
  firstName: Patient['firstName'];
  lastName: Patient['lastName'];
  dateOfBirth: Patient['dateOfBirth'];
  emailAddress: Patient['emailAddress'];
  gender: Patient['gender'];
}

export const HdfcLanding: React.FC = (props) => {
  const classes = useStyles({});
  const avatarRef = useRef(null);
  const { isSigningIn, isSignedIn, setVerifyOtpError, signOut } = useAuth();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [notEligible, setNotEligible] = React.useState<boolean>(false);
  const updatePatient = useMutation<UpdatePatient, UpdatePatientVariables>(UPDATE_PATIENT);
  const [isProfileUpdate, setisProfileUpdate] = React.useState<boolean>(false);
  const [showProfileSuccess, setShowProfileSuccess] = React.useState<boolean>(false);
  const [value, setValue] = React.useState('');
  // const [userSubscriptions, setUserSubscriptions] = React.useState([]);

  // const createSubscription = useMutation<createSubscription, createSubscriptionVariables>(
  //   CREATE_SUBSCRIPTION
  // );

  const apolloClient = useApolloClient();

  //Show signup screen only if defaultNewProfile is present
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const defaultNewProfile = allCurrentPatients ? currentPatient || allCurrentPatients[0] : null;
  const hasExistingProfile =
    allCurrentPatients && allCurrentPatients.some((p) => !_isEmpty(p.uhid));

  // useEffect(() => {
  //   if (hasExistingProfile && currentPatient && userSubscriptions.length == 0) {
  //     apolloClient
  //       .query<getSubscriptionsOfUserByStatus, getSubscriptionsOfUserByStatusVariables>({
  //         query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  //         variables: {
  //           user: {
  //             mobile_number: currentPatient.mobileNumber,
  //             patiend_id: currentPatient.id,
  //           },
  //           status: ['active'],
  //         },
  //         fetchPolicy: 'no-cache',
  //       })
  //       .then((response) => {
  //         setUserSubscriptions(response.data.getSubscriptionsOfUserByStatus.response);
  //       })
  //       .catch((error) => {
  //         alert('Something went wrong :(');
  //       });
  //   }
  // }, [isSignedIn]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date('2014-08-18T21:11:54')
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  if (showProfileSuccess) {
    return (
      <ProfileSuccess
        onSubmitClick={() => {
          setisProfileUpdate(false);
          setShowProfileSuccess(false);
        }}
      />
    );
  }

  const customSignUp = {
    heading: 'Final Step',
    subHeading: 'Enter your details to complete the registration',
    showMascot: false,
    referral: 'HDFCBANK',
  };

  return (
    <div className={classes.mainContainer}>
      <header className={` ${classes.header} ${classes.headerFixed}`}>
        <div className={classes.headerContent}>
          <Link to="/">
            <img
              src={require('images/ic_logo.png')}
              title={'Apollo 24x7 | HDFC'}
              alt={'Apollo 24x7 | HDFC'}
              width="77"
            />
          </Link>
          <Link to="/">
            <img
              src={require('images/hdfc/hdfc-logo.svg')}
              title={'Apollo 24x7 | HDFC'}
              alt={'Apollo 24x7 | HDFC'}
              width="100"
            />
          </Link>
        </div>
      </header>
      <div className={classes.container}>
        <div className={classes.mainContent}>
          <div className={classes.bannerContainer}>
            <div className={classes.mainBanner}>
              <img
                src={require('images/hdfc/banner.jpg')}
                className={classes.hideWeb}
                alt="HDFC "
              />
              <img
                src={require('images/hdfc/banner-web.jpg')}
                className={classes.hideMobile}
                alt="HDFC "
              />
              <div className={classes.bannerContent}>
                <div className={classes.bannerDetails}>
                  <Typography>
                    A Healthcare Plan brought to you by HDFC &amp; APOLLO 24|7
                  </Typography>
                  <Typography component="h1">
                    Wide Range of benefits worth 38K+ for all HDFC customers
                  </Typography>
                </div>
                <Route
                  render={({ history }) => (
                    <AphButton
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        if (!isSignedIn) setIsLoginPopupVisible(true);
                        else {
                          history.push(clientRoutes.welcome());
                          // userSubscriptions.length != 0
                          //   ? history.push(clientRoutes.welcome())
                          //   : createSubscription({
                          //       variables: {
                          //         userSubscription: {
                          //           mobile_number: currentPatient.mobileNumber,
                          //         },
                          //       },
                          //     })
                          //       .then(() => {
                          //         history.push(clientRoutes.membershipHdfc());
                          //       })
                          //       .catch((error) => {
                          //         console.error(error);
                          //         alert('Something went wrong :(');
                          //       });
                        }
                      }}
                    >
                      {isSignedIn ? 'Explore now' : 'SignUp Now'}
                    </AphButton>
                  )}
                />
              </div>
            </div>
          </div>

          <div className={classes.benefitContent}>
            <Typography component="h2"> Benefits</Typography>
            <ul className={classes.benefitList}>
              <li>
                <img src={require('images/hdfc/call.svg')} alt="Doctor On Call" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">24*7 Doctor on Call</Typography>
                  <Typography>Get an instant call from an Apollo Doctor</Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/medicine-delivery.svg')} alt="Medicine Delivery" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Seamless Medicine Delivery</Typography>
                  <Typography>Get upto 20% off on Apollo pharmacy</Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/health-records.svg')} alt="Health Records" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Patients Health Records</Typography>
                  <Typography>Access to a digital vault for your health records</Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/diabetes.svg')} alt="Diabetes Program" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Diabetes Management Program</Typography>
                  <Typography>Complimentary Access to Base Diabetes Management Program</Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/health-testing.svg')} alt="Covid Health Testing" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Covid Health Testing</Typography>
                  <Typography>Preferential access for Covid testing</Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/access.svg')} alt="Access to Apollo Services" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">
                    Access to Apollo Doctors &amp; Diagnostic Services
                  </Typography>
                  <Typography>
                    Get 24/7 access to Apollo Doctors and Diagnostic services on App
                  </Typography>
                </div>
              </li>
            </ul>
          </div>
          <Typography className={classes.register}>
            *Register Now to Unlock many more benefits
          </Typography>
          <div className={classes.apolloContainer}>
            <div className={classes.apolloCare}>
              <img src={require('images/hdfc/join-apollo.svg')} alt="Apollo World of Care" />
              <div className={classes.acContainer}>
                <Typography component="h4">Join The Apollo World Of Care</Typography>
                <Typography>
                  Register now for Round-the-clock doctor availability, ease of ordering medicines
                  &amp; tests online and much more on Apollo 24/7
                </Typography>

                <Route
                  render={({ history }) => (
                    <AphButton
                      color="primary"
                      onClick={() => {
                        if (!isSignedIn) setIsLoginPopupVisible(true);
                        else {
                          history.push(clientRoutes.welcome());
                          // userSubscriptions.length != 0
                          //   ? history.push(clientRoutes.welcome())
                          //   : createSubscription({
                          //       variables: {
                          //         userSubscription: {
                          //           mobile_number: currentPatient.mobileNumber,
                          //         },
                          //       },
                          //     })
                          //       .then(() => {
                          //         history.push(clientRoutes.membershipHdfc());
                          //       })
                          //       .catch((error) => {
                          //         console.error(error);
                          //         alert('Something went wrong :(');
                          //       });
                        }
                      }}
                    >
                      {isSignedIn ? 'Explore now' : 'SignUp Now'}
                    </AphButton>
                  )}
                />
              </div>
            </div>
          </div>
          <div className={classes.tncContainer}>
            <div className={classes.tncContent}>
              <Typography component="h4">Terms &amp; Conditions</Typography>
              <ul className={classes.tncList}>
                <li>
                  The Healthy Life offering is the marketing program offered by Apollo 24/7, an app
                  managed by Apollo Hospitals Enterprise Limited (AHEL) only for HDFC Bank
                  customers.
                </li>
                <li>
                  The validity of the program (“Term”) is till 31st August 2021, unless extended by
                  Apollo 24/7 and HDFC Bank.
                </li>
                <li>
                  The discounts applicable as per the Healthy Life program shall be applied at the
                  time of payment checkout by the customer.
                </li>
                <li>
                  This program is designed for select HDFC customers and offerings will vary with
                  the different categories of HDFC customers. However, membership schemes can be
                  upgraded on the basis of the spending on the Apollo 24/7 app as mentioned in the
                  offer grid.
                </li>
                <li>
                  The Healthy Life Program is open to all HDFC customers with a valid Indian mobile
                  number only.
                </li>
                <li>
                  The T&amp;C’s of the silver, gold and platinum membership offered in the Healthy
                  Life program shall be governed by the terms &amp; conditions of the website -{' '}
                  <a href="https://www.oneapollo.com/terms-conditions/">
                    https://www.oneapollo.com/terms-conditions/
                  </a>
                </li>
                <li>
                  The Healthy Life offering will be applicable to all HDFC customers, whether they
                  are existing customers of Apollo 24/7 or not. However, all the customers shall
                  adhere to the offerings as mentioned in this marketing program.
                </li>
                <li>The Healthy Life program is non-transferable.</li>
                <li>
                  The activation of the benefits for the Healthy Life program will be completed 24
                  hours post the service delivery/fulfillment of the qualifying transaction. For
                  e.g., to unlock benefits, the user is needed to make a qualifying transaction of
                  INR 499, amount subject to change as per different tiers
                </li>
                <li>
                  By enrolling for the Healthy Life program, a member consents to allow use and
                  disclosure by Apollo Health centres, along with his/her personal and other
                  information as provided by the member at the time of enrolment and/or
                  subsequently.
                </li>
                <li>
                  As a prerequisite to becoming a member, a customer will need to provide mandatory
                  information including full name, valid and active Indian mobile number. He/she
                  shall adhere to such terms and conditions as may be prescribed for membership from
                  time to time.
                </li>
                <li>
                  The Healthy Life membership program will be issued solely at the discretion of the
                  management and the final discretion on all matters relating to the membership
                  shall rest with Apollo 24/7(AHEL).
                </li>
                <li>
                  Healthy Life program is a corporate offering exclusively for HDFC bank customers
                  and not for individuals.
                </li>
                <li>
                  Apollo 24/7 reserves the right to add, alter, amend and revise terms and
                  conditions as well as rules and regulations governing the Healthy Life membership
                  program without prior notice.
                </li>
                <li>
                  Benefits and offers available through the program may change or be withdrawn
                  without prior intimation. Apollo 24/7 will not be responsible for any liability
                  arising from such situations or use of such offers.
                </li>
                <li>
                  Any disputes arising out of the offer shall be subject to arbitration by a sole
                  arbitrator appointed by Apollo 24/7 for this purpose. The proceedings of the
                  arbitration shall be conducted as per the provisions of Arbitration and
                  Conciliation Act, 1996. The place of arbitration shall be at Chennai and language
                  of arbitration shall be English. The existence of a dispute, if at all, shall not
                  constitute a claim against Apollo 24/7.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Login Popover */}
      {!isSignedIn && (
        <Popover
          open={isLoginPopupVisible}
          anchorEl={avatarRef.current}
          onClose={() => {
            const otpAfterCleaning = otp.replace(/,/g, '');
            if (
              mobileNumber.length === 0 ||
              (mobileNumber.length === 10 && otpAfterCleaning.length === 0) ||
              otpAfterCleaning.length === 6
            ) {
              setIsLoginPopupVisible(false);
              setVerifyOtpError(false);
            }
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          classes={{ paper: classes.topPopover }}
        >
          <Paper className={classes.loginForm}>
            <SignIn
              setMobileNumber={(mobileNumber: string) => setMobileNumber(mobileNumber)}
              setOtp={(otp: string) => setOtp(otp)}
              mobileNumber={mobileNumber}
              otp={otp}
            />
          </Paper>
        </Popover>
      )}

      {/* SignUp Popover */}
      {defaultNewProfile && (
        <AphDialog maxWidth="sm" open={defaultNewProfile && !hasExistingProfile ? true : false}>
          <NewProfile patient={defaultNewProfile} onClose={() => {}} customSignUp={customSignUp} />
        </AphDialog>
      )}

      <AphDialog open={notEligible} maxWidth="sm">
        <div className={classes.dialogcontent}>
          <img src={require('images/hdfc/sorry.svg')} alt="Not Eligible" />
          <Typography>Unfortunately you are not eligible for the premium plans</Typography>
          <Typography className={classes.hightLight}>
            Please contact HDFC for further updates
          </Typography>
          <AphButton color="primary" onClick={() => setNotEligible(false)}>
            Go Back
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
