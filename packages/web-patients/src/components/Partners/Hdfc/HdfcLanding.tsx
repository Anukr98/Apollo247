import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { AphButton, AphDialog } from '@aph/web-ui-components';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { SignIn } from 'components/SignIn';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { createMuiTheme } from '@material-ui/core';
import { Route } from 'react-router-dom';
import _isEmpty from 'lodash/isEmpty';
import { useMutation, useApolloClient } from 'react-apollo-hooks';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { UpdatePatient, UpdatePatientVariables } from 'graphql/types/UpdatePatient';
import { UPDATE_PATIENT } from 'graphql/profiles';
import { ProfileSuccess } from 'components/ProfileSuccess';
import { NewProfile } from 'components/NewProfile';
import { trackLanding, hdfcUnlockNowTracking, hdfcSignupFormShown } from 'webEngageTracking';
import { MetaTagsComp } from 'MetaTagsComp';
import { HDFC_REF_CODE } from 'helpers/constants';

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
      padding: 20,
      [theme.breakpoints.down('sm')]: {
        padding: 16,
      },
    },
    bannerContainer: {
      padding: '20px 0',
      borderRadius: 10,
      
    },
    mainBanner: {
      width: '100%',
      position: 'relative',
      background: '#C4E8EF',
      borderRadius: 10,
      padding: 20,

      [theme.breakpoints.down('sm')]: {
        overflow: 'hidden',
      },
    },
    bannerContent: {
      padding: '10px 30px',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        padding: '20px 0',
      },
      '& p': {
        fontSize: 24,
        lineHeight: '24px',
        fontWeight: 600,
        color: '#005CA8',
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
          lineHeight: '18px',
        },
      },
      '& h1': {
        fontSize: 32,
        lineHeight: '40px',
        fontWeight: 700,
        color: '#005CA8',
        margin: '0 0 10px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 20,
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
    imgcontainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 30px 0 0',
      '& img': {
        [theme.breakpoints.down('sm')]: {
          width: 80,
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
      borderRadius: 10,
      background: ' linear-gradient(160.46deg, #1D3052 0%, #1E5F74 46.19%, #41A8A8 98.44%)',
      padding: 30,
      position: 'relative',
      [theme.breakpoints.down('sm')]: {
        padding: 20,
      },
      '& h2': {
        textTransform: 'uppercase',
        fontWeight: 600,
        fontSize: 24,
        lineHeight: '22px',
        color: '#fff',
        padding: '0 0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.24)',
        margin: '0 0 20px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 16,
        },
      },
      '& button':{
        margin: '20px 20px 0 auto',
        display: 'block'
,      }
    },
    benefitList: {
      padding: 0,
      listStyle: 'none',
      margin: '10px 0',
      display: 'grid',
      gridTemplateColumns: '46% 46%',
      gridColumnGap: 40,
      '& li': {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '20px 0 20px 60px',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
          padding: '10px 0 10px 35px',
        },
        '& img': {
          width: 36,
          position: 'absolute',
          top: 20,
          left: 0,
          [theme.breakpoints.down('sm')]: {
            width: '20px !important',
            top: 10,
          },
        },
      },
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    concierge: {
      fill: '#FFF',
    },
    benefitDetails: {
      '& h3': {
        fontSize: 20,
        lineHeight: '20px',
        fontWeight: 600,
        color: '#fff',
        margin: '0 0 15px',
      },
      '& p': {
        fontSize: 18,
        lineHeight: '18px',
        color: '#fff',
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

    tncContainer: {},
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
    bannerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
      [theme.breakpoints.down('sm')]: {
        padding:0
      },
      '& img':{
        [theme.breakpoints.down('sm')]: {
          width: 120,
        }
      }
    },
    bannerFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'absolute',
      right: 50,
      bottom: 50,
      [theme.breakpoints.down('sm')]: {
        position: 'static'
      },
      '& button': {
        margin: '0 0 0 20px',
        
      },
      '& p': {
        fontSize: 14,
        color: '#E52936',
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
        },
      },
    },
    unlockNow: {
      padding: '10px 20px',
      background: '#E52936',
      color: '#fff',
      fontSize: 16,
      [theme.breakpoints.down('sm')]: {
        fontSize: 10,
      },
      '&:hover': {
        background: '#E52936',
        color: '#fff',
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
  const [loading, setLoading] = React.useState<boolean>(false);
  const [value, setValue] = React.useState('');

  const apolloClient = useApolloClient();

  //Show signup screen only if defaultNewProfile is present
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const defaultNewProfile = allCurrentPatients ? currentPatient || allCurrentPatients[0] : null;
  const hasExistingProfile =
    allCurrentPatients && allCurrentPatients.some((p) => !_isEmpty(p.uhid));

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

  const meta = {
    title: 'Apollo HealthyLife Program for HDFC Customer – Apollo 24|7',
    description:
      'Apollo 24|7 - The Healthy Life offering is the marketing program offered by Apollo 24|7, an online portal and app managed by Apollo Hospitals Enterprise Limited (AHEL) only for HDFC Bank customers.',
    canonicalLink: typeof window !== 'undefined' && window.location && window.location.href,
    og:{
      title: 'Apollo HealthyLife Program for HDFC customers',
      description: 'The HealthyLife offering is the marketing program offered by Apollo 24|7, an app managed by Apollo Hospitals Enterprise Limited (AHEL) only for HDFC Bank customers.',
      url: 'https://www.apollo247.com/partners/hdfc',
      image: 'https://assets.apollo247.com/images/hdfc-og-image.jpg',
      site_name: 'Apollo 24|7',
    }
  };

  useEffect(() => {
    trackLanding('HDFC Landing Page loaded');
    (window as any).dataLayer.push({
      event: 'pageviewEvent',
      pageName: 'HDFC Partner',
      pageLOB: 'Others',
      pageType: 'Partner',
      'User ID': localStorage.getItem('userMobileNo'),
      UserLoggedIn: isSignedIn ? 'Yes' : 'No',
    });
  }, []);

  const customSignUp = {
    heading: 'Final Step',
    subHeading: 'Enter your details to complete the registration',
    showMascot: false,
    referral: 'HDFCBANK',
  };

  return (
    <div className={classes.mainContainer}>
      <MetaTagsComp {...meta} />
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
              <div className={classes.bannerHeader}>
                <img
                  src={require('images/hdfc/apollo-hashtag.svg')}
                  alt="HDFC Call Doctor"
                  width="150"
                />
                <img
                  src={require('images/hdfc/hdfc-health-first.svg')}
                  alt="HDFC Call Doctor"
                  width="150"
                />
              </div>
              <div className={classes.bannerContent}>
                <div className={classes.imgcontainer}>
                  <img src={require('images/hdfc/join-apollo.svg')} alt="Apollo World of Care" />
                </div>

                <div className={classes.bannerDetails}>
                  <Typography component="h1">Apollo HealthyLife Program for you !</Typography>
                  <Typography>Exclusively for HDFC Bank customers</Typography>
                </div>
              </div>
              <div className={classes.bannerFooter}>
              
                {loading ? (
                  <CircularProgress size={30} />
                ) : (
                  <Route
                    render={({ history }) => (
                      <AphButton
                        className={classes.unlockNow}
                        onClick={() => {
                          hdfcUnlockNowTracking('HDFC Unlock Now Clicked');
                          if (!isSignedIn) {
                            /* GA Tracking */
                            (window as any).dataLayer.push({
                              event: 'Unlock Now Clicked',
                            });
                            /*******************/
                            setIsLoginPopupVisible(true);
                          } else {
                            /* GA Tracking */
                            (window as any).dataLayer.push({
                              event: 'Explore Benefits Clicked',
                            });
                            /*******************/
                            setLoading(true);
                            updatePatient({
                              variables: {
                                patientInput: {
                                  id: currentPatient.id,
                                  partnerId: currentPatient.partnerId
                                    ? currentPatient.partnerId
                                    : 'HDFCBANK',
                                },
                              },
                            })
                              .then(() => {
                                setLoading(false);
                                history.push(clientRoutes.welcome());
                              })
                              .catch((error) => {
                                setLoading(false);
                                console.error(error);
                              });
                          }
                        }}
                      >
                        {isSignedIn ? 'Explore Benefits' : 'Unlock Now'}
                      </AphButton>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <div className={classes.benefitContent}>
            <Typography component="h2"> Here's What You Get</Typography>
            <ul className={classes.benefitList}>
              <li>
                <img src={require('images/hdfc/call.svg')} alt="Apollo Doctor on call 24|7" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Apollo Doctor on call 24|7</Typography>
                  <Typography>Complimentary on-call assistance by Apollo Doctors</Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/medicine-delivery.svg')} alt="Medicine Delivery" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Doorstep Medicine Delivery</Typography>
                  <Typography>
                    Get 10% off on medicines and upto 20% off on Apollo Branded products with free
                    home delivery​
                  </Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/concierge.svg')} alt="Conceirge Services" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Concierge Services</Typography>
                  <Typography>
                    Get instant Whatsapp assistance on any of our services including consultations,
                    medicine orders, etc.​
                  </Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/covid.svg')} alt="Covid Health Testing" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Preferential Access to COVID Care</Typography>
                  <Typography>
                    At-home testing, pre and post COVID assessment, @home &amp; @hotel isolation
                    assistance​
                  </Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/diagnostics.svg')} alt="Access to Apollo Services" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Diagnostic Tests</Typography>
                  <Typography>Doorstep Sample Collection by Trained Experts</Typography>
                </div>
              </li>
              <li>
                <img src={require('images/hdfc/health-records.svg')} alt="Health Records" />
                <div className={classes.benefitDetails}>
                  <Typography component="h3">Secured Patients Health Records Vault</Typography>
                  <Typography>Digitization and Access to your Health Records </Typography>
                </div>
              </li>
            </ul>
                     
              {loading ? (
                <CircularProgress size={30} />
              ) : (
                <Route
                  render={({ history }) => (
                    <AphButton
                      className={classes.unlockNow}
                      onClick={() => {
                        hdfcUnlockNowTracking('HDFC Unlock Now Clicked');
                        if (!isSignedIn) {
                          /* GA Tracking */
                          (window as any).dataLayer.push({
                            event: 'Unlock Now Clicked',
                          });
                          /*******************/
                          setIsLoginPopupVisible(true);
                        } else {
                          /* GA Tracking */
                          (window as any).dataLayer.push({
                            event: 'Explore Benefits Clicked',
                          });
                          /*******************/
                          setLoading(true);
                          updatePatient({
                            variables: {
                              patientInput: {
                                id: currentPatient.id,
                                partnerId: currentPatient.partnerId
                                  ? currentPatient.partnerId
                                  : 'HDFCBANK',
                              },
                            },
                          })
                            .then(() => {
                              setLoading(false);
                              history.push(clientRoutes.welcome());
                            })
                            .catch((error) => {
                              setLoading(false);
                              console.error(error);
                            });
                        }
                      }}
                    >
                      {isSignedIn ? 'Explore Benefits' : 'Unlock Now'}
                    </AphButton>
                  )}
                />
              )}
            </div>

          <div className={classes.tncContainer}>
            <div className={classes.tncContent}>
              <Typography component="h4">Terms &amp; Conditions</Typography>
              <ul className={classes.tncList}>
                <li>
                  The HealthyLife offering is the marketing program offered by Apollo 24|7, an app
                  managed by Apollo Hospitals Enterprise Limited (AHEL) only for HDFC Bank
                  customers.
                  </li>
                  <li>
                    The validity of membership is 1 year and the validity of program (“Term”) is
                    till 30th September 2021, unless extended by Apollo 24|7 and HDFC Bank
                  </li>
                  <li>
                    The discounts/offers applicable as per the HealthyLife program shall be applied
                    at the time of payment checkout by the customer.
                  </li>
                  <li>
                    This program is designed for select HDFC current and saving accounts customers
                    and offerings will vary with the different categories of accounts of HDFC
                    customers. However, membership schemes can be upgraded / downgraded on the basis
                    of the spending on the Apollo 24|7 app or web as mentioned in the offer grid.{' '}
                  </li>
                  <li>
                    The HealthyLife Program is open to all HDFC current and saving accounts
                    customers with a valid Indian mobile number registered with HDFC bank only.{' '}
                  </li>
                  <li>
                    The T&amp;C’s of the OneApollo silver, gold and platinum membership offered in
                    the HealthyLife program shall be governed by the terms &amp; conditions of the
                    website -{' '}
                    <a rel="nofollow" href="https://www.oneapollo.com/terms-conditions/">
                      https://www.oneapollo.com/terms-conditions/
                    </a>
                  </li>
                  <li>
                    The HealthyLife offering will be applicable to all Current &amp; Savings Account
                    holders of HDFC Bank, whether they are existing customers of Apollo 24|7 or not.
                    However, all the customers shall adhere to the terms and conditions as mentioned
                    in this marketing program.{' '}
                  </li>
                  <li>The HealthyLife program membership is non-transferable.</li>
                  <li>
                    HealthyLife Benefits Unlock condition - The activation of the benefits for the
                    HealthyLife program will be completed 24 hours post the service
                    delivery/fulfilment of the qualifying transaction. For e.g., to unlock benefits,
                    the user is needed to make a qualifying transaction of amount subject to change
                    as per different tiers .
                  </li>
                  <li>
                    By enrolling for the HealthyLife program, a member consents to allow use and
                    disclosure by Apollo Health centres,of his/her personal and other information as
                    provided by the member at the time of enrolment and/or subsequently.
                  </li>
                  <li>
                    As a prerequisite to becoming a member, a customer will need to provide
                    mandatory information including full name, valid and active Indian mobile
                    number. He/she shall adhere to such terms and conditions as may be prescribed
                    for membership from time to time.
                  </li>
                  <li>
                    The HealthyLife membership program will be issued solely at the discretion of
                    the management and the final discretion on all matters relating to the
                    membership shall rest with Apollo 24|7(AHEL).
                  </li>
                  <li>
                    Apollo 24|7 reserves the right to add, alter, amend and revise terms and
                    conditions as well as rules and regulations governing the HealthyLife membership
                    program without prior notice.
                  </li>
                  <li>
                    Benefits and offers available through the program may change or be withdrawn
                    without prior intimation. Apollo 24|7 will not be responsible for any liability
                    arising from such situations or use of such offers.
                  </li>
                  <li>
                    Any disputes arising out of the offer shall be subject to arbitration by a sole
                    arbitrator appointed by Apollo 24|7 for this purpose. The proceedings of the
                    arbitration shall be conducted as per the provisions of Arbitration and
                    Conciliation Act, 1996. The place of arbitration shall be at Chennai and
                    language of arbitration shall be English. The existence of a dispute, if at all,
                    shall not constitute a claim against Apollo 24|7.
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
          {hdfcSignupFormShown()}
          <NewProfile patient={defaultNewProfile} onClose={() => {}} customSignUp={customSignUp} />
        </AphDialog>
      )}

      {defaultNewProfile && !hasExistingProfile /* GA Tracking */
        ? (window as any).dataLayer.push({
            event: 'UserLoggedIn',
            Type: 'Registration',
            'User ID': localStorage.getItem('userMobileNo'),
          })
        : ''}

      {hasExistingProfile && currentPatient && currentPatient.partnerId === HDFC_REF_CODE
        ? (window.location.href = '/')
        : ''}

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
