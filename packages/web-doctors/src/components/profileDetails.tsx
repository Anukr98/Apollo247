import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import { Theme, CircularProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { useQuery } from 'react-apollo-hooks';
import Typography from '@material-ui/core/Typography';
import { MyProfile } from 'components/MyProfile';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import Scrollbars from 'react-custom-scrollbars';
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
      padding: '10px 10px 0 10px',
      cursor: 'pointer',
    },
    navRightIcon: {
      position: 'absolute',
      top: 12,
      right: 15,
    },
    navLeftIcon: {
      position: 'relative',
      top: 5,
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
  };
});

export const MyAccount: React.FC = (props) => {
  const classes = useStyles();
  const { signOut } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { data, error, loading } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);
  const getDoctorDetailsData = data && data.getDoctorDetails ? data.getDoctorDetails : null;
  const [selectedNavTab, setselectedNavTab] = React.useState(1);
  if (loading) return <CircularProgress className={classes.loading} />;
  if (error || !getDoctorDetailsData) return <div>error :(</div>;
  const doctorProfile = getDoctorDetailsData;
  const clinics = getDoctorDetailsData.doctorHospital || [];

  const onNext = () => {};
  const onBack = () => {};
  return (
    <div>
      <div className={classes.headerSticky}>
        <Header />
      </div>
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
                        src={require('images/doctor-profile.jpg')}
                        className={classes.bigAvatar}
                      />
                      <img alt="" src={require('images/ic_star.svg')} className={classes.starImg} />
                    </div>
                    <div className={classes.doctorSectionLeft}>
                      <Typography variant="h4">
                        {doctorProfile!.salutation &&
                          doctorProfile!.salutation!.charAt(0).toUpperCase()}
                        {doctorProfile!.salutation!.slice(1).toLowerCase() + '.'}{' '}
                        {`${doctorProfile!.firstName!.split(' ')[0]} ${doctorProfile!.lastName!}`
                          .length < 18
                          ? `${doctorProfile!.firstName!.split(' ')[0]} ${doctorProfile!.lastName}`
                          : `${
                              doctorProfile!.firstName!.split(' ')[0]
                            } ${doctorProfile!.lastName!.charAt(0)}.`}
                      </Typography>
                      <Typography variant="h6">
                        <span>{`MCI Number : ${doctorProfile.registrationNumber}`} </span>
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
                  <Paper
                    className={`${classes.serviceItemLeft} ${classes.tabContent} ${isDialogOpen &&
                      classes.tabActive}`}
                  >
                    <div onClick={() => setIsDialogOpen(true)} className={classes.leftNav}>
                      <img
                        alt=""
                        src={
                          isDialogOpen
                            ? require('images/ic_profilenav_white.svg')
                            : require('images/ic_profilenav.svg')
                        }
                        className={classes.navLeftIcon}
                      />
                      Log Out
                      <img
                        alt=""
                        src={
                          isDialogOpen
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
                      <MyProfile doctor={doctorProfile} clinics={clinics} />
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
                      signOut();
                      localStorage.removeItem('loggedInMobileNumber');
                      sessionStorage.removeItem('mobileNumberSession');
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
    </div>
  );
};
