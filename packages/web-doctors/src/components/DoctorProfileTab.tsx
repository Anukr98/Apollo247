import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphButton } from '@aph/web-ui-components';
import MenuItem from '@material-ui/core/MenuItem';
import { AphSelect } from '@aph/web-ui-components';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import _isEmpty from 'lodash/isEmpty';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/lowerCase';
import { PatientSignIn_patientSignIn_patients } from 'graphql/types/PatientSignIn'; // eslint-disable-line camelcase
import { useAuth } from 'hooks/authHooks';
import { useQuery } from 'react-apollo-hooks';
import { GET_DOCTOR_PROFILE } from 'graphql/profiles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: '15px',
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 20px',
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 20,
        borderBottom: 'solid 0.5px rgba(98,22,64,0.2)',
      },
      '& h5': {
        padding: '5px 5px 3px 20px',
        color: '#658f9b',
      },
      '& h6': {
        color: theme.palette.secondary.main,
        padding: '5px 5px 5px 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        '& span': {
          padding: '0 2px',
        },
      },
    },
    tabContent: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 0,
      position: 'relative',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: '30px',
    },
    starDoctors: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      overflow: 'hidden',
      position: 'absolute',
      left: '10px',
      '& h4': {
        borderBottom: 'none',
      },
    },
    tabLeftcontent: {
      padding: '10px 5px 10px 5px',
    },
    serviceItem: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
    },
    avatarBlock: {
      overflow: 'hidden',
      borderRadius: '10px 0 0 0',
    },
    bigAvatar: {
      width: '100%',
    },
    profileImg: {
      height: '80px',
    },
    tabContentStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: '10px',
      position: 'relative',
      paddingLeft: '90px',
      minHeight: '100px',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: '30px',
      marginRight: '10px',
    },
    saveButton: {
      minWidth: '300px',
      marginTop: '20px',
      float: 'right',
    },
    addDocter: {
      marginTop: '20px',
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    btmContainer: {
      borderTop: 'solid 0.5px rgba(98,22,64,0.6)',
      marginTop: '30px',
    },
  };
});
export interface DoctorProfileTabProps {
  profileData: any;
}
export const DoctorProfileTab: React.FC = (props) => {
  const classes = useStyles();
  const [profileData, setProfileData] = React.useState({});
  const { data, error, loading } = useQuery(GET_DOCTOR_PROFILE, {
    variables: { mobileNumber: '1234567890' },
  });

  if (loading) console.log('loading');
  if (error) console.log('Error');
  if (data) console.log(data.getDoctorProfile);
  // if (data) setProfileData(data.getDoctorProfile);
  // console.log(profileData);

  return (
    <div className={classes.ProfileContainer}>
      <Typography variant="h2">Basic Details</Typography>
      <div className={classes.tabContent}>
        <Grid container alignItems="flex-start" spacing={0}>
          <Grid item lg={4} sm={6} xs={12}>
            <Paper className={classes.serviceItem}>
              <div className={classes.avatarBlock}>
                <img
                  alt=""
                  src={require('images/doctor-profile.jpg')}
                  className={classes.bigAvatar}
                />
              </div>
              <Typography variant="h4">Dr. Simran Rai</Typography>
              <Typography variant="h6">
                GENERAL PHYSICIAN <span> | </span> <span> 7YRS </span>{' '}
              </Typography>
            </Paper>
          </Grid>
          <Grid item lg={8} sm={6} xs={12} className={classes.tabLeftcontent}>
            <Grid container alignItems="flex-start" spacing={0}>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Education</Typography>
                  <Typography variant="h3">MS (Surgery), MBBS (Internal Medicine)</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Awards</Typography>
                  <Typography variant="h3">Dr. B.C.Roy Award (2009)</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speciality</Typography>
                  <Typography variant="h3">Specialization 1, Specialization 2</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speaks</Typography>
                  <Typography variant="h3">English, Telugu, Hindi</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Services</Typography>
                  <Typography variant="h3">Consultation, Surgery, Physio</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">In-person Consult Location</Typography>
                  <Typography variant="h3">
                    20 Orchard Avenue, Hiranandani, Powai, Mumbai 400076
                  </Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">MCI Number</Typography>
                  <Typography variant="h3">123456</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Typography variant="h2">Your Star Doctors Team (2)</Typography>
      <Grid container alignItems="flex-start" spacing={0}>
        <Grid item lg={4} sm={6} xs={12}>
          <div className={classes.tabContentStarDoctor}>
            <div className={classes.starDoctors}>
              <img
                alt=""
                src={require('images/doctor-profile.jpg')}
                className={classes.profileImg}
              />
            </div>
            <Typography variant="h4">Dr. Simran Rai</Typography>
            <Typography variant="h6">
              GENERAL PHYSICIAN <span> | </span> <span> 7YRS </span>{' '}
            </Typography>
            <Typography variant="h5">
              MBBS, Internal Medicine Apollo Hospitals, Jubilee Hills
            </Typography>
          </div>
        </Grid>
        <Grid item lg={4} sm={6} xs={12}>
          <div className={classes.tabContentStarDoctor}>
            <div className={classes.starDoctors}>
              <img
                alt=""
                src={require('images/doctor-profile.jpg')}
                className={classes.profileImg}
              />
            </div>
            <Typography variant="h4">Dr. Rakhi Sharma</Typography>
            <Typography variant="h6">
              GENERAL PHYSICIAN <span> | </span> <span> 7YRS </span>{' '}
            </Typography>
            <Typography variant="h5">
              MBBS, Internal Medicine Apollo Hospitals, Jubilee Hills
            </Typography>
          </div>
        </Grid>
      </Grid>
      <div className={classes.addDocter}>
        <AphButton variant="contained" color="primary" classes={{ root: classes.btnAddDoctor }}>
          + ADD DOCTOR
        </AphButton>
      </div>
      <Grid container alignItems="flex-start" spacing={0} className={classes.btmContainer}>
        <Grid item lg={12} sm={12} xs={12}>
          <AphButton variant="contained" color="primary" classes={{ root: classes.saveButton }}>
            SAVE AND PROCEED
          </AphButton>
        </Grid>
      </Grid>
    </div>
  );
};
