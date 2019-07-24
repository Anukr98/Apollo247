import { Theme, Grid, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { GetDoctorProfileById as DoctorDetails } from 'graphql/types/getDoctorProfileById';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      marginBottom: 10,
      padding: '15px 20px',
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        marginBottom: 0,
      },
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
    sectionHeader: {
      color: theme.palette.secondary.dark,
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        padding: 0,
        fontWeight: 600,
      },
    },
    count: {
      marginLeft: 'auto',
    },
    sectionGroup: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        marginTop: 16,
        marginBottom: 16,
        padding: 20,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    gridContainer: {
      [theme.breakpoints.down('xs')]: {
        margin: -8,
        width: 'calc(100% + 16px)',
      },
      '& >div': {
        [theme.breakpoints.down('xs')]: {
          padding: '8px !important',
        },
      },
    },
  };
});

export interface StarDoctorTeamProps {
  doctorDetails: DoctorDetails;
}

export const StarDoctorTeam: React.FC<StarDoctorTeamProps> = (props) => {
  const classes = useStyles();

  const { doctorDetails } = props;

  if (
    doctorDetails &&
    doctorDetails.getDoctorProfileById &&
    doctorDetails.getDoctorProfileById.starDoctorTeam &&
    doctorDetails.getDoctorProfileById.profile
  ) {
    const firstName = doctorDetails.getDoctorProfileById.profile.firstName;
    const lastName = doctorDetails.getDoctorProfileById.profile.lastName;

    const team =
      doctorDetails.getDoctorProfileById.starDoctorTeam.length > 0
        ? doctorDetails.getDoctorProfileById.starDoctorTeam
        : [];

    return (
      <div className={classes.sectionGroup}>
        <div className={classes.sectionHeader}>
          <span>
            Dr. {firstName}&nbsp;{lastName}'s Team
          </span>
          <span className={classes.count}>02</span>
        </div>
        <Grid container className={classes.gridContainer} spacing={2}>
          {team.map((doctorDetails) => {
            return (
              <Grid item xs={12} sm={12} md={12} lg={6} key={_uniqueId('startDoctor_')}>
                <div className={classes.root}>
                  <Avatar
                    alt={(doctorDetails && doctorDetails.firstName) || ''}
                    src={(doctorDetails && doctorDetails.photoUrl) || ''}
                    className={classes.bigAvatar}
                  />
                  <div className={classes.doctorInfo}>
                    <Link to={clientRoutes.doctorDetails(doctorDetails.id)}>
                      <div className={classes.doctorName}>
                        {(doctorDetails && doctorDetails.firstName) || ''}&nbsp;
                        {(doctorDetails && doctorDetails.lastName) || ''}
                      </div>
                    </Link>
                    <div className={classes.speciality}>
                      {(doctorDetails && doctorDetails.speciality) || ''}
                      <span className={classes.doctorExp}>
                        | {doctorDetails && doctorDetails.experience} Yrs
                      </span>
                    </div>
                    <div className={classes.doctorMoreInfo}>
                      {(doctorDetails && doctorDetails.address) || ''}
                      <br />
                      {(doctorDetails && doctorDetails.education) || ''}
                    </div>
                  </div>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  } else {
    return <div>No Doctors Found...</div>;
  }
};
