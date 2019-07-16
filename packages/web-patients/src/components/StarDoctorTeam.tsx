import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    bottomMenuRoot: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      bottom: 0,
      height: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& button': {
        padding: '10px 0',
      },
    },
    labelRoot: {
      width: '100%',
    },
    iconLabel: {
      fontSize: 12,
      color: '#67919d',
      paddingTop: 10,
      textTransform: 'uppercase',
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },
  };
});

export interface StarDoctorTeamProps {
  doctorId: string;
}

export const StarDoctorTeam: React.FC<StarDoctorTeamProps> = (props) => {
  const classes = useStyles();

  const { doctorId } = props;

  // console.log(doctorId);

  /* this should be a graphql call */
  const starDoctors = {
    'star-doctor-1': {
      profilePicture: 'https://placeimg.com/300/100/any',
      doctorName: 'Dr. Gennifer Ghosh',
      doctorSpeciality: 'GENERAL PHYSICIAN',
      doctorExperience: '7',
      clinicName: 'Apollo Hospitals, Jubileehills',
    },
    'star-doctor-2': {
      profilePicture: 'https://placeimg.com/300/100/any',
      doctorName: 'Dr. Maya',
      doctorSpeciality: 'GENERAL PHYSICIAN',
      doctorExperience: '6',
      clinicName: 'Apollo Hospitals, Jubileehills',
    },
  };

  return (
    <div className={classes.welcome}>
      <h1>Dr. Rai's Star Doctor Name</h1> {/*this must be from either parent or here*/}
      {Object.values(starDoctors).map((starDoctorDetails) => {
        <div>
          <div>
            <img src={starDoctorDetails.profilePicture} />
          </div>
          <div>{starDoctorDetails.doctorName}</div>
          <div>{starDoctorDetails.doctorSpeciality}</div>
          <div>{starDoctorDetails.doctorExperience}</div>
          <div>{starDoctorDetails.clinicName}</div>
        </div>;
      })}
    </div>
  );
};
