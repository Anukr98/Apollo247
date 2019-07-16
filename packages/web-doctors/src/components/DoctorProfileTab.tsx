import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphButton } from '@aph/web-ui-components';
import StarDoctorSearch from './StarDoctorSearch';
import { relative } from 'path';
import {
  getDoctorProfile,
  getDoctorProfileVariables,
  getDoctorProfile_getDoctorProfile_starDoctorTeam,
  getDoctorProfile_getDoctorProfile_clinicsList,
  getDoctorProfile_getDoctorProfile,
} from 'graphql/types/getDoctorProfile';

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
      minHeight: '130px',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: '30px',
      marginRight: '10px',
      '& h4': {
        borderBottom: 'none',
      },
    },
    addStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: '10px',
      position: 'relative',
      paddingLeft: '10px',
      minHeight: '100px',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: '30px',
      marginRight: '10px',
      '& input': {
        // borderBottom: '2px solid #f00',
      },
    },
    saveButton: {
      minWidth: '300px',
      margin: theme.spacing(1),
      '&:hover': {
        backgroundColor: '#fcb716',
      },
    },
    backButton: {
      minWidth: '120px',
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(1),
      '&:hover': {
        backgroundColor: '#fff',
      },
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
    btnContainer: {
      borderTop: 'solid 0.5px rgba(98,22,64,0.6)',
      marginTop: '30px',
      paddingTop: '15px',
      textAlign: 'right',
    },
    invited: {
      color: '#ff748e',
      fontSize: 15,
      fontWeight: theme.typography.fontWeightMedium,
      marginTop: '10px',
      textTransform: 'uppercase',
      '& img': {
        position: 'relative',
        top: '4px',
        marginRight: '15px',
        marginLeft: '15px',
      },
    },
    posRelative: {
      position: 'relative',
    },
    moreIcon: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
  };
});

interface Props {
  values: any;
  proceedHadler: () => void;
}
interface DoctorsName {
  label: string;
  typeOfConsult: string;
  experience: string;
  firstName: string;
  inviteStatus: string;
  lastName: string;
}

export const DoctorProfileTab: React.FC<Props> = ({ values, proceedHadler }) => {
  const classes = useStyles();
  const [data, setData] = useState(values);
  const [showAddDoc, setShowAddDoc] = useState(false);
  function addDoctorHadler(obj: DoctorsName) {
    if (obj.label) {
      setData({ ...data, starDoctorTeam: data.starDoctorTeam.concat(obj) });
      setShowAddDoc(false);
    }
  }
  // function removeDoctor() {
  //   alert('delete');
  // }
  const starDocNumber = data.starDoctorTeam.length;
  const starDoctors = data.starDoctorTeam.map(
    (item: getDoctorProfile_getDoctorProfile_starDoctorTeam, index: number) => {
      return (
        <Grid item lg={4} sm={6} xs={12} key={index.toString()}>
          <div className={classes.tabContentStarDoctor}>
            <div className={classes.starDoctors}>
              <img
                alt=""
                src={require('images/doctor-profile.jpg')}
                className={classes.profileImg}
              />
            </div>
            {!(item.inviteStatus === 'accepted') ? (
              <div className={classes.posRelative}>
                <img
                  alt="more.svg"
                  src={require('images/ic_more.svg')}
                  className={classes.moreIcon}
                />
                <Typography variant="h4">
                  Dr. {item.firstName} {item.lastName}
                </Typography>
                <Typography className={classes.invited}>
                  <img alt="" src={require('images/ic_invite.svg')} />
                  Invited
                </Typography>
              </div>
            ) : (
              <div className={classes.posRelative}>
                <img alt="" src={require('images/ic_more.svg')} className={classes.moreIcon} />
                <Typography variant="h4">
                  Dr. {item.firstName} {item.lastName}
                </Typography>
                <Typography variant="h6">
                  GENERAL PHYSICIAN <span> | </span> <span> {item.experience}YRS </span>{' '}
                </Typography>
                <Typography variant="h5">
                  MBBS, Internal Medicine Apollo Hospitals, Jubilee Hills
                </Typography>
              </div>
            )}
          </div>
        </Grid>
      );
    }
  );

  const clinicsList = data.clinicsList.map(
    (item: getDoctorProfile_getDoctorProfile_clinicsList, index: number) => {
      return (
        <Typography variant="h3" key={index.toString()}>
          {item.name}, {item.location}
        </Typography>
      );
    }
  );

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
              <Typography variant="h4">
                Dr. {data.firstName} {data.lastName}
              </Typography>
              <Typography variant="h6">
                {data.specialization} <span> | </span> <span> {data.experience}YRS </span>{' '}
              </Typography>
            </Paper>
          </Grid>
          <Grid item lg={8} sm={6} xs={12} className={classes.tabLeftcontent}>
            <Grid container alignItems="flex-start" spacing={0}>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Education</Typography>
                  <Typography variant="h3">{data.education}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Awards</Typography>
                  <Typography variant="h3">{data.awards}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speciality</Typography>
                  <Typography variant="h3">{data.speciality}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speaks</Typography>
                  <Typography variant="h3">{data.languages}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Services</Typography>
                  <Typography variant="h3">{data.services}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">In-person Consult Location</Typography>
                  {clinicsList}
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">MCI Number</Typography>
                  <Typography variant="h3">{data.registrationNumber}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      {!!data.isStarDoctor && (
        <div>
          <Typography variant="h2">Your Star Doctors Team ({starDocNumber})</Typography>
          <Grid container alignItems="flex-start" spacing={0}>
            {starDoctors}
            {!!showAddDoc && (
              <Grid item lg={4} sm={6} xs={12}>
                <div className={classes.addStarDoctor}>
                  <Typography variant="h5">
                    Add doctor to your team
                    <StarDoctorSearch addDoctorHadler={addDoctorHadler} />
                  </Typography>
                </div>
              </Grid>
            )}
          </Grid>
          <div className={classes.addDocter}>
            <AphButton
              variant="contained"
              color="primary"
              classes={{ root: classes.btnAddDoctor }}
              onClick={(e) => setShowAddDoc(!showAddDoc)}
            >
              + ADD DOCTOR
            </AphButton>
          </div>
        </div>
      )}

      <Grid container alignItems="flex-start" spacing={0} className={classes.btnContainer}>
        <Grid item lg={12} sm={12} xs={12}>
          <AphButton
            variant="contained"
            color="primary"
            classes={{ root: classes.saveButton }}
            onClick={() => proceedHadler()}
          >
            SAVE AND PROCEED
          </AphButton>
        </Grid>
      </Grid>
    </div>
  );
};
