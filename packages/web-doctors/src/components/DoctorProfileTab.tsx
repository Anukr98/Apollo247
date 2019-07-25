import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  IconButton,
  Card,
  CardHeader,
  Avatar,
  CardContent,
  CircularProgress,
} from '@material-ui/core';
import React, { useState, useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphButton } from '@aph/web-ui-components';
import {
  GetDoctorProfile_getDoctorProfile_starDoctorTeam,
  GetDoctorProfile_getDoctorProfile_clinics,
  GetDoctorProfile,
  GetDoctorProfile_getDoctorProfile_profile,
} from 'graphql/types/getDoctorProfile';
import { INVITEDSTATUS } from 'graphql/types/globalTypes';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { REMOVE_STAR_DOCTOR, GET_DOCTOR_PROFILE } from 'graphql/profiles';
import { MoreVert } from '@material-ui/icons';
import {
  removeDoctorFromStartDoctorProgramVariables,
  removeDoctorFromStartDoctorProgram,
} from 'graphql/types/removeDoctorFromStartDoctorProgram';
import { Mutation } from 'react-apollo';
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
        fontSize: 16,
        fontWeight: 600,
        color: '#02475b',
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

export interface StarDoctorCardProps {
  doctor: GetDoctorProfile_getDoctorProfile_starDoctorTeam;
  indexKey: number;
}
const StarDoctorCard: React.FC<StarDoctorCardProps> = (props) => {
  const { doctor, indexKey } = props;
  const moreButttonRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const client = useApolloClient();
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <img src={require('images/doctor-profile.jpg')} />
          </Avatar>
        }
        action={
          <Mutation<removeDoctorFromStartDoctorProgram, removeDoctorFromStartDoctorProgramVariables>
            mutation={REMOVE_STAR_DOCTOR}
          >
            {(mutate, { loading }) => (
              <>
                <IconButton
                  ref={moreButttonRef.current}
                  onClick={() => setIsPopoverOpen(true)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress /> : <MoreVert />}
                </IconButton>
                <Popover
                  open={isPopoverOpen}
                  anchorEl={moreButttonRef.current}
                  onClose={() => setIsPopoverOpen(false)}
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
                    onClick={() => {
                      mutate({
                        variables: {
                          starDoctorId: '1234',
                          doctorId: '1234',
                        },
                      }).then(() => {
                        const existingData = client.readQuery<GetDoctorProfile>({
                          query: GET_DOCTOR_PROFILE,
                        });
                        const existingStarDoctorTeam =
                          (existingData &&
                            existingData.getDoctorProfile &&
                            existingData.getDoctorProfile &&
                            existingData.getDoctorProfile.starDoctorTeam) ||
                          [];
                        const newStarDoctorTeam = existingStarDoctorTeam.filter(
                          (existingDoc) => existingDoc.firstName !== doctor.firstName
                        );
                        const dataAfterMutation: GetDoctorProfile = {
                          ...existingData,
                          getDoctorProfile: {
                            ...existingData!.getDoctorProfile!,
                            starDoctorTeam: newStarDoctorTeam,
                          },
                        };
                        client.writeQuery({ query: GET_DOCTOR_PROFILE, data: dataAfterMutation });
                      });
                    }}
                  >
                    Remove Doctor - {indexKey}
                  </Typography>
                </Popover>
              </>
            )}
          </Mutation>
        }
        title={`Dr. ${doctor.firstName} ${doctor.lastName}`}
        //subheader={<span>GENERAL PHYSICIAN | {doctor.experience} YRS</span>}
      />
      {doctor.inviteStatus === INVITEDSTATUS.ACCEPTED && (
        <CardContent>MBBS, Internal Medicine Apollo Hospitals, Jubilee Hills</CardContent>
      )}
    </Card>
  );
};

export interface StarDoctorsListProps {
  starDoctors: GetDoctorProfile_getDoctorProfile_starDoctorTeam[];
}

const StarDoctorsList: React.FC<StarDoctorsListProps> = (props) => {
  const { starDoctors } = props;
  const classes = useStyles();
  return (
    <Grid container alignItems="flex-start" spacing={0}>
      {starDoctors.map((doctor, index) => (
        <Grid item lg={4} sm={6} xs={12} key={index}>
          <div className={classes.tabContentStarDoctor}>
            <StarDoctorCard doctor={doctor} indexKey={index} />
          </div>
        </Grid>
      ))}
    </Grid>
  );
};

interface DoctorDetailsProps {
  doctor: GetDoctorProfile_getDoctorProfile_profile;
  clinics: GetDoctorProfile_getDoctorProfile_clinics[];
}
const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const { doctor, clinics } = props;
  const classes = useStyles();

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
                Dr. {doctor.firstName} {doctor.lastName}
              </Typography>
              <Typography variant="h6">
                {(doctor.specialization || '').toUpperCase()} <span> | </span>
                <span> {doctor.experience}YRS </span>
              </Typography>
            </Paper>
          </Grid>
          <Grid item lg={8} sm={6} xs={12} className={classes.tabLeftcontent}>
            <Grid container alignItems="flex-start" spacing={0}>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Education</Typography>
                  <Typography variant="h3">{doctor.education}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Awards</Typography>
                  <Typography variant="h3">{doctor.awards}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speciality</Typography>
                  <Typography variant="h3">{doctor.speciality}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speaks</Typography>
                  <Typography variant="h3">{doctor.languages}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Services</Typography>
                  <Typography variant="h3">{doctor.services}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">In-person Consult Location</Typography>
                  {clinics.map((clinic, index) => (
                    <Typography variant="h3" key={index} className={index > 0 ? classes.none : ''}>
                      {clinic.name}, {clinic.addressLine1}, {clinic.addressLine2}
                      {clinic.addressLine3}, {clinic.city}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">MCI Number</Typography>
                  <Typography variant="h3">{doctor.registrationNumber}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

interface DoctorProfileTabProps {
  onNext: () => void;
}
export const DoctorProfileTab: React.FC<DoctorProfileTabProps> = (props) => {
  const classes = useStyles();
  const { data, error, loading } = useQuery<GetDoctorProfile>(GET_DOCTOR_PROFILE);
  const getDoctorProfileData = data && data.getDoctorProfile ? data.getDoctorProfile : null;

  if (loading) return <CircularProgress />;
  if (error || !getDoctorProfileData) return <div>error :(</div>;

  const doctorProfile = getDoctorProfileData.profile;
  const clinics = getDoctorProfileData.clinics || [];
  const starDoctors = getDoctorProfileData.starDoctorTeam || [];
  const numStarDoctors = starDoctors.length;

  return (
    <div>
      <DoctorDetails doctor={doctorProfile} clinics={clinics} />

      {doctorProfile.isStarDoctor && (
        <div>
          <Typography variant="h2" className={numStarDoctors === 0 ? classes.none : ''}>
            Your Star Doctors Team ({numStarDoctors})
          </Typography>
          <StarDoctorsList starDoctors={starDoctors} />
          <div className={classes.addDocter}>
            <AphButton variant="contained" color="primary" classes={{ root: classes.btnAddDoctor }}>
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
            onClick={() => props.onNext()}
          >
            SAVE AND PROCEED
          </AphButton>
        </Grid>
      </Grid>
    </div>
  );
};
