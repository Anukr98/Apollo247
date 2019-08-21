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

import { FeesTab } from 'components/FeesTab';

const useStyles = makeStyles((theme: Theme) => {
  return {
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
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
        fontSize: 16,
        fontWeight: theme.typography.fontWeightMedium,
        color: '#02475b',
        margin: 0,
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 22,
        fontSize: 20,
        borderBottom: 'solid 2px rgba(101,143,155,0.05)',
        fontWeight: 600,
      },
      '& h5': {
        padding: '5px 5px 3px 0',
        color: '#658f9b',
        fontWeight: 'normal',
      },
      '& h6': {
        padding: '5px 5px 5px 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontSize: 15,
        fontWeight: 600,
        color: '#0087ba',
        '& span': {
          padding: '0 2px',
        },
      },
    },
    leftNav: {
      fontSize: 15,
      lineHeight: 1.6,
      fontWeight: 500,
      padding: '10px 10px 0 10px',
    },
    navRightIcon: {
      position: 'absolute',
      top: 12,
      right: 15,
    },
    navLeftIcon: {
      position: 'relative',
      top: 5,
      height: 20,
      marginRight: 10,
    },
    tabActive: {
      backgroundColor: '#0087ba',
      color: '#fff',
    },
  };
});

export const MyAccount: React.FC = (props) => {
  const classes = useStyles();
  const { data, error, loading } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);
  const getDoctorDetailsData = data && data.getDoctorDetails ? data.getDoctorDetails : null;
  const [selectedNavTab, setselectedNavTab] = React.useState(1);
  if (loading) return <CircularProgress />;
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
      <div className={classes.container}>
        <div className={classes.ProfileContainer}>
          <div>
            <Grid container alignItems="flex-start" spacing={0}>
              <Grid item lg={3} sm={6} xs={12} className={classes.tabRightcontent}>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.avatarBlock}>
                    <img
                      alt=""
                      src={require('images/doctor-profile.jpg')}
                      className={classes.bigAvatar}
                    />
                    <img alt="" src={require('images/ic_star.svg')} className={classes.starImg} />
                  </div>
                  <Typography variant="h4">{`${doctorProfile.salutation}. ${doctorProfile.firstName} ${doctorProfile.lastName}`}</Typography>
                  <Typography variant="h6">
                    <span>{`MCI Number : ${doctorProfile.registrationNumber}`} </span>
                  </Typography>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_fees.svg')}
                      className={classes.navLeftIcon}
                    />
                    My Stats
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper
                  className={`${classes.serviceItemLeft} ${classes.tabContent} ${classes.tabActive}`}
                >
                  <div onClick={() => setselectedNavTab(1)} className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_profilenav.svg')}
                      className={classes.navLeftIcon}
                    />
                    My Profile
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_availibility.svg')}
                      className={classes.navLeftIcon}
                    />
                    Availibility
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div onClick={() => setselectedNavTab(3)} className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_fees.svg')}
                      className={classes.navLeftIcon}
                    />
                    Fees
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_smart_prescription.svg')}
                      className={classes.navLeftIcon}
                    />
                    Smart Prescription
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_settings.svg')}
                      className={classes.navLeftIcon}
                    />
                    Settings
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
              </Grid>
              {selectedNavTab === 1 ? (
                <MyProfile doctor={doctorProfile} clinics={clinics} />
              ) : (
                <FeesTab
                  values={doctorProfile}
                  onNext={() => onNext()}
                  onBack={() => onBack()}
                  key={3}
                />
              )}
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};
