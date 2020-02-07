import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useEffect, useContext } from 'react';
import { Theme, CircularProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { useQuery, useApolloClient, useMutation } from 'react-apollo-hooks';
import Typography from '@material-ui/core/Typography';
import { MyProfile } from 'components/MyProfile';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import Scrollbars from 'react-custom-scrollbars';
import { GET_DOCTOR_DETAILS_BY_ID, UPDATE_DOCTOR_ONLINE_STATUS } from 'graphql/profiles';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import {
  UpdateDoctorOnlineStatus,
  UpdateDoctorOnlineStatusVariables,
} from 'graphql/types/UpdateDoctorOnlineStatus';
import { MyAccountFeeTab } from 'components/MyAccountFeeTab';
import { MyAccountAvailabilityTab } from 'components/MyAccountAvailabilityTab';
import { MyAccountSettings } from 'components/MyAccountSettings';
import { MyAccountStats } from 'components/MyAccountStats';
import { MyAccountPrescription } from 'components/MyAccountPrescription';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { useAuth } from 'hooks/authHooks';
import { LoggedInUserType, DOCTOR_ONLINE_STATUS } from 'graphql/types/globalTypes';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { ApolloError } from 'apollo-client';

const useStyles = makeStyles((theme: Theme) => {
  return {
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      backgroundColor: '#f7f7f7',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    tabContent: {
      borderRadius: 5,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 0,
      position: 'relative',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 30,
    },
    starDoctors: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      overflow: 'hidden',
      position: 'absolute',
      left: 10,
      '& h4': {
        borderBottom: 'none',
      },
    },
    tabRightcontent: {
      // paddingRight: 20,
    },
    serviceItem: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        // display: 'flex',
      },
    },
    serviceItemLeft: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      borderRadius: 5,
      marginBottom: 12,
      color: '#01475b',
      [theme.breakpoints.down('xs')]: {
        // display: 'flex',
      },
    },
    avatarBlock: {
      overflow: 'hidden',
      borderRadius: '5px 5px 0 0',
      position: 'relative',
      paddingBottom: 20,
    },
    bigAvatar: {
      width: '100%',
    },
    starImg: {
      position: 'absolute',
      bottom: 7,
      right: 15,
      width: 40,
    },
    card: {
      boxShadow: 'none',
    },
    cardHeader: {
      padding: '12px 0 12px 12px',
      position: 'relative',
    },
    details: {
      '& button': {
        padding: '5px 8px 5px 0px',
        color: '#02475b',
        position: 'absolute',
        right: 0,
        top: 8,
      },
    },

    ProfileContainer: {
      padding: '90px 20px 20px 20px',
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 0',
        fontSize: 14,
        fontWeight: theme.typography.fontWeightMedium,
        color: '#02475b',
        margin: 0,
      },
      '& h4': {
        padding: '0 5px 0 0',
        fontSize: 18,
        fontWeight: 500,
      },
      '& h5': {
        padding: '5px 5px 3px 0',
        color: '#658f9b',
        fontWeight: 'normal',
      },
      '& h6': {
        padding: '0 5px 10px 0',
        letterSpacing: '0.3px',
        fontSize: 12,
        fontWeight: 500,
        color: '#0087ba',
        '& span': {
          padding: '0 2px',
        },
      },
    },
    outerContainer: {
      backgroundColor: 'rgba(216, 216, 216, 0.08)',
      padding: 16,
      border: '1px solid rgba(2,71,91,0.1)',
      borderRadius: 5,
      '& h2': {
        lineHeight: '18px',
        fontWeight: 600,
        margin: '0 0 15px 0',
      },
    },
    leftNav: {
      fontSize: 15,
      lineHeight: 1.6,
      fontWeight: 500,
      padding: '4px 10px 0 10px',
      cursor: 'pointer',
    },
    navRightIcon: {
      position: 'absolute',
      top: 12,
      right: 15,
    },
    navLeftIcon: {
      position: 'relative',
      top: 6,
      width: 'auto',
      marginRight: 19,
      marginLeft: 9,
    },
    tabActive: {
      backgroundColor: '#0087ba',
      color: '#fff',
    },
    doctorSectionLeft: {
      marginLeft: 20,
      '& h6': {
        fontSize: 15,
      },
      '& h4': {
        fontSize: 22,
        fontWeight: 600,
      },
    },
    doctorPanelLeft: {
      marginBottom: 20,
    },
    loading: {
      position: 'absolute',
      left: '48%',
      top: '48%',
    },
    tabLeftcontent: {
      paddingLeft: 20,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
      },
    },
    logout: {
      fontSize: 15,
      fontWeight: 600,
      color: '#02475b',
      borderTop: '1px solid rgba(2, 71, 91, 0.1)',
      paddingTop: 8,
      marginRight: 15,
      cursor: 'pointer',
      '& img': {
        position: 'relative',
        top: 5,
        marginRight: 15,
      },
    },
  };
});

export const MyAccount: React.FC = (props) => {
  const classes = useStyles();
  const { currentPatient, signOut } = useAuth();
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const { currentUserId, currentUserType } = useAuthContext();
  const client = useApolloClient();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [userDetails, setUserDetails] = React.useState();
  const [selectedNavTab, setselectedNavTab] = React.useState(1);

  /*   const { data, error, loading } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);
  const getDoctorDetailsData = data && data.getDoctorDetails ? data.getDoctorDetails : null;

  if (loading) return <CircularProgress className={classes.loading} />;
  if (error || !getDoctorDetailsData) return <div>error :(</div>; */

  const getDoctorDetailsById = () => {
    client
      .query<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        fetchPolicy: 'no-cache',
        variables: { id: currentUserId ? currentUserId : localStorage.getItem('currentUserId') },
      })
      .then((data) => {
        setUserDetails(data.data.getDoctorDetailsById);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getDoctorDetail = () => {
    client
      .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
      .then((_data) => {
        setUserDetails(_data.data.getDoctorDetails);
      })
      .catch((e) => {
        console.log('Error occured while fetching Doctor', e);
      });
  };
  useEffect(() => {
    if (currentUserType === LoggedInUserType.SECRETARY) {
      getDoctorDetailsById();
    } else {
      if (currentUserType === LoggedInUserType.DOCTOR) {
        getDoctorDetail();
      }
    }
  }, []);

  const doctorProfile = userDetails;
  const mutationUpdateDoctorOnlineStatus = useMutation<
    UpdateDoctorOnlineStatus,
    UpdateDoctorOnlineStatusVariables
  >(UPDATE_DOCTOR_ONLINE_STATUS, {
    variables: {
      doctorId: currentPatient && currentPatient.id ? currentPatient.id : '',
      onlineStatus: DOCTOR_ONLINE_STATUS.AWAY,
    },
  });

  const onNext = () => {};
  const onBack = () => {};
  return (
    <div>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      {userDetails && (
        <Scrollbars autoHide={true} style={{ height: '100vh' }}>
          <div className={classes.container}>
            <div className={classes.ProfileContainer}>
              <div>
                <Grid container alignItems="flex-start" spacing={0}>
                  <Grid item lg={3} sm={6} xs={12} className={classes.tabRightcontent}>
                    <Paper
                      className={`${classes.doctorPanelLeft} ${classes.serviceItemLeft} ${classes.tabContent}`}
                    >
                      <div className={classes.avatarBlock}>
                        <img
                          alt=""
                          src={
                            doctorProfile.photoUrl
                              ? doctorProfile.photoUrl
                              : require('images/no_person_icon.svg')
                          }
                          className={classes.bigAvatar}
                        />
                        {doctorProfile.doctorType === 'STAR_APOLLO' ? (
                          <img
                            alt=""
                            src={require('images/ic_star.svg')}
                            className={classes.starImg}
                          />
                        ) : (
                          ''
                        )}
                      </div>
                      <div className={classes.doctorSectionLeft}>
                        <Typography variant="h4">{doctorProfile.displayName}</Typography>
                        <Typography variant="h6">
                          <span>{`MCI Number : ${doctorProfile.registrationNumber}`} </span>
                        </Typography>
                        <Typography
                          className={classes.logout}
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <span>
                            <img src={require('images/ic_logout.svg')} alt="" />
                            Logout
                          </span>
                        </Typography>
                      </div>
                    </Paper>
                    <Paper
                      className={`${classes.serviceItemLeft} ${
                        classes.tabContent
                      } ${selectedNavTab === 0 && classes.tabActive}`}
                    >
                      <div onClick={() => setselectedNavTab(0)} className={classes.leftNav}>
                        <img
                          alt=""
                          src={
                            selectedNavTab === 0
                              ? require('images/ic_stats_white.svg')
                              : require('images/ic_stats.svg')
                            // ? require('images/ic_profilenav_white.svg')
                            // : require('images/ic_profilenav.svg')
                          }
                          className={classes.navLeftIcon}
                        />
                        My Stats
                        <img
                          alt=""
                          src={
                            selectedNavTab === 0
                              ? require('images/ic_rightarrowwhite.svg')
                              : require('images/ic_rightarrow.svg')
                          }
                          className={classes.navRightIcon}
                        />
                      </div>
                    </Paper>
                    <Paper
                      className={`${classes.serviceItemLeft} ${
                        classes.tabContent
                      } ${selectedNavTab === 1 && classes.tabActive}`}
                    >
                      <div onClick={() => setselectedNavTab(1)} className={classes.leftNav}>
                        <img
                          alt=""
                          src={
                            selectedNavTab === 1
                              ? require('images/ic_profilenav_white.svg')
                              : require('images/ic_profilenav.svg')
                          }
                          className={classes.navLeftIcon}
                        />
                        My Profile
                        <img
                          alt=""
                          src={
                            selectedNavTab === 1
                              ? require('images/ic_rightarrowwhite.svg')
                              : require('images/ic_rightarrow.svg')
                          }
                          className={classes.navRightIcon}
                        />
                      </div>
                    </Paper>
                    <Paper
                      className={`${classes.serviceItemLeft} ${
                        classes.tabContent
                      } ${selectedNavTab === 2 && classes.tabActive}`}
                    >
                      <div onClick={() => setselectedNavTab(2)} className={classes.leftNav}>
                        <img
                          alt=""
                          src={
                            selectedNavTab === 2
                              ? require('images/ic_availibility_white.svg')
                              : require('images/ic_availibility.svg')
                          }
                          className={classes.navLeftIcon}
                        />
                        Availability
                        <img
                          alt=""
                          src={
                            selectedNavTab === 2
                              ? require('images/ic_rightarrowwhite.svg')
                              : require('images/ic_rightarrow.svg')
                          }
                          className={classes.navRightIcon}
                        />
                      </div>
                    </Paper>
                    <Paper
                      className={`${classes.serviceItemLeft} ${
                        classes.tabContent
                      } ${selectedNavTab === 3 && classes.tabActive}`}
                    >
                      <div onClick={() => setselectedNavTab(3)} className={classes.leftNav}>
                        <img
                          alt=""
                          src={
                            selectedNavTab === 3
                              ? require('images/ic_fees_white.svg')
                              : require('images/ic_fees.svg')
                          }
                          className={classes.navLeftIcon}
                        />
                        Fees
                        <img
                          alt=""
                          src={
                            selectedNavTab === 3
                              ? require('images/ic_rightarrowwhite.svg')
                              : require('images/ic_rightarrow.svg')
                          }
                          className={classes.navRightIcon}
                        />
                      </div>
                    </Paper>
                    <Paper
                      className={`${classes.serviceItemLeft} ${
                        classes.tabContent
                      } ${selectedNavTab === 4 && classes.tabActive}`}
                    >
                      <div onClick={() => setselectedNavTab(4)} className={classes.leftNav}>
                        <img
                          alt=""
                          src={
                            selectedNavTab === 4
                              ? require('images/ic_smart_prescription_white.svg')
                              : require('images/ic_smart_prescription.svg')
                          }
                          className={classes.navLeftIcon}
                        />
                        Smart Prescription
                        <img
                          alt=""
                          src={
                            selectedNavTab === 4
                              ? require('images/ic_rightarrowwhite.svg')
                              : require('images/ic_rightarrow.svg')
                          }
                          className={classes.navRightIcon}
                        />
                      </div>
                    </Paper>
                    <Paper
                      className={`${classes.serviceItemLeft} ${
                        classes.tabContent
                      } ${selectedNavTab === 5 && classes.tabActive}`}
                    >
                      <div onClick={() => setselectedNavTab(5)} className={classes.leftNav}>
                        <img
                          alt=""
                          src={
                            selectedNavTab === 5
                              ? require('images/ic_settings_white.svg')
                              : require('images/ic_settings.svg')
                          }
                          className={classes.navLeftIcon}
                        />
                        Settings
                        <img
                          alt=""
                          src={
                            selectedNavTab === 5
                              ? require('images/ic_rightarrowwhite.svg')
                              : require('images/ic_rightarrow.svg')
                          }
                          className={classes.navRightIcon}
                        />
                      </div>
                    </Paper>
                  </Grid>
                  <Grid item lg={9} sm={6} xs={12} className={classes.tabLeftcontent}>
                    <div className={classes.outerContainer}>
                      {selectedNavTab === 0 ? (
                        <MyAccountStats />
                      ) : selectedNavTab === 2 ? (
                        <MyAccountAvailabilityTab
                          values={doctorProfile}
                          onNext={() => onNext()}
                          onBack={() => onBack()}
                          key={3}
                        />
                      ) : selectedNavTab === 3 ? (
                        <MyAccountFeeTab
                          values={doctorProfile}
                          onNext={() => onNext()}
                          onBack={() => onBack()}
                          key={3}
                        />
                      ) : selectedNavTab === 4 ? (
                        <MyAccountPrescription />
                      ) : selectedNavTab === 5 ? (
                        <MyAccountSettings />
                      ) : (
                        <MyProfile doctor={doctorProfile} clinics={userDetails.doctorHospital!} />
                      )}
                    </div>
                  </Grid>
                </Grid>
                <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                  <DialogTitle>{''}</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      You are successfully Logged in with Apollo 24x7
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      color="primary"
                      onClick={() => {
                        if (currentPatient) {
                          mutationUpdateDoctorOnlineStatus()
                            .then((response) => {
                              localStorage.removeItem('loggedInMobileNumber');
                              sessionStorage.removeItem('mobileNumberSession');
                              signOut();
                            })
                            .catch((e: ApolloError) => {
                              console.log('An error occurred updating doctor status.');
                            });
                        } else {
                          localStorage.removeItem('loggedInMobileNumber');
                          sessionStorage.removeItem('mobileNumberSession');
                          signOut();
                        }
                      }}
                    >
                      Sign out
                    </Button>
                    <Button color="primary" onClick={() => setIsDialogOpen(false)} autoFocus>
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            </div>
          </div>
        </Scrollbars>
      )}
    </div>
  );
};
