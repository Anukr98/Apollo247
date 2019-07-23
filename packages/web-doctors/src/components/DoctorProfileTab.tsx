import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphButton } from '@aph/web-ui-components';
import {
  GetDoctorProfile_getDoctorProfile_starDoctorTeam,
  GetDoctorProfile_getDoctorProfile_clinics,
} from 'graphql/types/getDoctorProfile';
import Button from '@material-ui/core/Button';
import { useApolloClient } from 'react-apollo-hooks';
import { REMOVE_STAR_DOCTOR } from 'graphql/profiles';
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
    removeDoctor: {
      padding: theme.spacing(1),
      color: '#951717',
      fontSize: 15,
      fontWeight: theme.typography.fontWeightMedium,
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
      position: 'relative',
      paddingBottom: '20px',
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
        fontSize: 18,
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
      '& button': {
        padding: '9px 16px',
      },
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
      padding: theme.spacing(0),
      backgroundColor: 'transparent',
      boxShadow: 'none',
      minWidth: 20,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    none: {
      display: 'none',
    },
    starImg: {
      position: 'absolute',
      bottom: '7px',
      right: '15px',
      width: '40px',
    },
  };
});

interface DoctorProfileTabProps {
  values: any;
  onNext: () => void;
}
interface DoctorsName {
  label: string;
  typeOfConsult: string;
  experience: string;
  firstName: string;
  inviteStatus: string;
  lastName: string;
}

export const DoctorProfileTab: React.FC<DoctorProfileTabProps> = ({ values, onNext }) => {
  const classes = useStyles();
  const [userData, setData] = useState(values);

  const [showAddDoc, setShowAddDoc] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const client = useApolloClient();

  function handleClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);
  function removeDoctor(doctor: GetDoctorProfile_getDoctorProfile_starDoctorTeam, index: number) {
    client
      .mutate({
        mutation: REMOVE_STAR_DOCTOR,
        variables: { starDoctorId: '12345', doctorId: '12345' },
      })
      .then(({ data }) => {
        if (data.removeDoctorFromStartDoctorProgram) {
          const starDoctorTeam = userData.starDoctorTeam.filter(
            (object: DoctorsName) => object.firstName !== doctor.firstName
          );
          setData({ ...userData, starDoctorTeam: starDoctorTeam });
        }
        handleClose();
      })
      .catch((_) => {
        handleClose();
      });
  }
  const starDocNumber = userData.starDoctorTeam.length;
  const starDoctors = userData.starDoctorTeam.map(
    (item: GetDoctorProfile_getDoctorProfile_starDoctorTeam, index: number) => {
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
            {!((item.inviteStatus && item.inviteStatus.toLowerCase()) === 'accepted') ? (
              <div className={classes.posRelative}>
                <Button
                  aria-describedby={open ? 'simple-popover' : undefined}
                  variant="contained"
                  className={classes.moreIcon}
                  onClick={handleClick}
                >
                  <img alt="more.svg" src={require('images/ic_more.svg')} />
                </Button>
                <Popover
                  id={open ? item.firstName : undefined}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <Typography
                    className={classes.removeDoctor}
                    onClick={() => removeDoctor(item, index)}
                  >
                    Remove Doctor
                  </Typography>
                </Popover>
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
                <Button
                  aria-describedby={open ? 'simple-popover' : undefined}
                  variant="contained"
                  className={classes.moreIcon}
                  onClick={handleClick}
                >
                  <img alt="" src={require('images/ic_more.svg')} />
                </Button>
                <Popover
                  id={open ? item.firstName : undefined}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <Typography
                    className={classes.removeDoctor}
                    onClick={() => removeDoctor(item, index)}
                  >
                    Remove Doctor
                  </Typography>
                </Popover>
                <Typography variant="h4">
                  Dr. {item.firstName} {item.lastName}
                </Typography>
                <Typography variant="h6">
                  GENERAL PHYSICIAN <span> | </span> <span> {item.experience} YRS </span>
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

  const clinicsList = userData.clinics.map(
    (item: GetDoctorProfile_getDoctorProfile_clinics, index: number) => {
      return (
        <Typography variant="h3" key={index.toString()} className={index > 0 ? classes.none : ''}>
          {item.name}, {item.addressLine1}, {item.addressLine2}
          {item.addressLine3}, {item.city}
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
                <img alt="" src={require('images/ic_star.svg')} className={classes.starImg} />
              </div>
              <Typography variant="h4">
                Dr. {userData.profile.firstName} {userData.profile.lastName}
              </Typography>
              <Typography variant="h6">
                {userData.profile.specialization.toUpperCase()} <span> | </span>
                <span> {userData.profile.experience}YRS </span>
              </Typography>
            </Paper>
          </Grid>
          <Grid item lg={8} sm={6} xs={12} className={classes.tabLeftcontent}>
            <Grid container alignItems="flex-start" spacing={0}>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Education</Typography>
                  <Typography variant="h3">{userData.profile.education}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Awards</Typography>
                  <Typography variant="h3">{userData.profile.awards}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speciality</Typography>
                  <Typography variant="h3">{userData.profile.speciality}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speaks</Typography>
                  <Typography variant="h3">{userData.profile.languages}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Services</Typography>
                  <Typography variant="h3">{userData.profile.services}</Typography>
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
                  <Typography variant="h3">{userData.profile.registrationNumber}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      {!!userData.profile.isStarDoctor && (
        <div>
          <Typography variant="h2" className={starDocNumber === 0 ? classes.none : ''}>
            Your Star Doctors Team ({starDocNumber})
          </Typography>
          <Grid container alignItems="flex-start" spacing={0}>
            {starDoctors}
            {!!showAddDoc && (
              <Grid item lg={4} sm={6} xs={12}>
                <div className={classes.addStarDoctor}>
                  <Typography variant="h5">
                    Add doctor to your team
                    {/* <StarDoctorSearch addDoctorHadler={addDoctorHadler} /> */}
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
            onClick={() => onNext()}
          >
            SAVE AND PROCEED
          </AphButton>
        </Grid>
      </Grid>
    </div>
  );
};
