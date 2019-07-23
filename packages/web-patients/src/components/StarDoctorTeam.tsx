import { Theme, Grid, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import _uniqueId from 'lodash/uniqueId';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      marginBottom: 10,
      padding: '15px 20px',
      display: 'flex',
    },
    bigAvatar: {
      width: 80,
      height: 80,
    },
    doctorInfo: {
      paddingLeft: 20,
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 3,
    },
    speciality: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: 0.25,
      color: '#0087ba',
      textTransform: 'uppercase',
    },
    doctorExp: {
      paddingLeft: 5,
    },
    doctorMoreInfo: {
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: 0.25,
      color: '#658f9b',
      paddingTop: 10,
    },
  };
});

export interface StarDoctorTeamProps {
  doctorId: string;
}

export const StarDoctorTeam: React.FC<StarDoctorTeamProps> = (props) => {
  const classes = useStyles();

  /* this should be a graphql call */
  const starDoctors = {
    'star-doctor-1': {
      profilePicture: require('images/doctordp_01.png'),
      doctorName: 'Dr. Gennifer Ghosh',
      doctorSpeciality: 'GENERAL PHYSICIAN',
      doctorExperience: '7',
      doctorQualification: 'MBBS, Internal Medicine',
      clinicName: 'Apollo Hospitals, Jubileehills',
    },
    'star-doctor-2': {
      profilePicture: require('images/doctordp_02.png'),
      doctorName: 'Dr. Maya',
      doctorSpeciality: 'GENERAL PHYSICIAN',
      doctorExperience: '6',
      doctorQualification: 'MBBS, Internal Medicine',
      clinicName: 'Apollo Hospitals, Jubileehills',
    },
  };

  return (
    <Grid container spacing={2}>
      {Object.values(starDoctors).map((starDoctorDetails) => {
        return (
          <Grid item sm={6} key={_uniqueId('startDoctor_')}>
            <div className={classes.root}>
              <Avatar alt="" src={starDoctorDetails.profilePicture} className={classes.bigAvatar} />
              <div className={classes.doctorInfo}>
                <div className={classes.doctorName}>{starDoctorDetails.doctorName}</div>
                <div className={classes.speciality}>
                  {starDoctorDetails.doctorSpeciality}
                  <span className={classes.doctorExp}>
                    | {starDoctorDetails.doctorExperience} Yrs
                  </span>
                </div>
                <div className={classes.doctorMoreInfo}>
                  {starDoctorDetails.clinicName}
                  <br />
                  {starDoctorDetails.doctorQualification}
                </div>
              </div>
            </div>
          </Grid>
        );
      })}
    </Grid>
  );
};
