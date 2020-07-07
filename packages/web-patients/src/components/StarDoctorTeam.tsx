import { Theme, Grid, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import {
  GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails,
  GetDoctorDetailsById_getDoctorDetailsById_starTeam as StarTeam,
} from 'graphql/types/GetDoctorDetailsById';
import { clientRoutes } from 'helpers/clientRoutes';
import _map from 'lodash/map';
import _forEach from 'lodash/forEach';
import { readableParam } from 'helpers/commonHelpers';

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
      [theme.breakpoints.down('xs')]: {
        fontSize: 18,
        fontWeight: 600,
      },
    },
    speciality: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: 0.25,
      color: '#0087ba',
      textTransform: 'uppercase',
      [theme.breakpoints.down('xs')]: {
        fontSize: 12,
        fontWeight: 600,
      },
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
      [theme.breakpoints.down('xs')]: {
        fontSize: 12,
        fontWeight: 600,
      },
    },
    sectionHeader: {
      color: theme.palette.secondary.dark,
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
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
  const classes = useStyles({});

  const { doctorDetails } = props;

  if (doctorDetails && doctorDetails.starTeam) {
    const { firstName } = doctorDetails;
    const team = doctorDetails.starTeam.length > 0 ? doctorDetails.starTeam : [];

    return team.length > 0 ? (
      <div className={classes.sectionGroup}>
        <div className={classes.sectionHeader}>
          <span>
            {`Dr. ${firstName}'s Team (${
              team.length > 0 ? team.length.toString().padStart(2, '0') : '0'
            })`}
          </span>
          <span className={classes.count}></span>
        </div>
        <Grid container className={classes.gridContainer} spacing={2}>
          {_map(team, (doctorDetails: StarTeam) => {
            let starDoctorLocation = '';
            if (
              doctorDetails &&
              doctorDetails.associatedDoctor &&
              doctorDetails.associatedDoctor.doctorHospital &&
              doctorDetails.associatedDoctor.doctorHospital.length > 0
            ) {
              _forEach(doctorDetails.associatedDoctor.doctorHospital, (hospitalDetails) => {
                if (hospitalDetails.facility.facilityType === 'HOSPITAL') {
                  starDoctorLocation = hospitalDetails.facility.name;
                }
              });
            }
            const associateDoctorId =
              doctorDetails && doctorDetails.associatedDoctor && doctorDetails.associatedDoctor.id
                ? doctorDetails.associatedDoctor.id
                : '';

            const associateDoctorName =
              doctorDetails &&
              doctorDetails.associatedDoctor &&
              doctorDetails.associatedDoctor.fullName
                ? doctorDetails.associatedDoctor.fullName
                : '';
            const readbleDoctorname = readableParam(associateDoctorName);

            const associateDoctorImage =
              doctorDetails &&
              doctorDetails.associatedDoctor &&
              doctorDetails.associatedDoctor.photoUrl
                ? doctorDetails.associatedDoctor.photoUrl
                : '';
            const qualification =
              doctorDetails &&
              doctorDetails.associatedDoctor &&
              doctorDetails.associatedDoctor.qualification
                ? doctorDetails.associatedDoctor.qualification
                : '';

            return (
              <Grid item xs={12} sm={12} md={12} lg={6} key={_uniqueId('startDoctor_')}>
                <div className={classes.root}>
                  <Avatar
                    alt={
                      doctorDetails &&
                      doctorDetails.associatedDoctor &&
                      doctorDetails.associatedDoctor.firstName
                        ? doctorDetails.associatedDoctor.firstName
                        : ''
                    }
                    src={associateDoctorImage}
                    className={classes.bigAvatar}
                  />
                  <div className={classes.doctorInfo}>
                    <a href={clientRoutes.doctorDetails(readbleDoctorname, associateDoctorId)}>
                      <div className={classes.doctorName}>
                        {doctorDetails &&
                        doctorDetails.associatedDoctor &&
                        doctorDetails.associatedDoctor.firstName
                          ? doctorDetails.associatedDoctor.firstName
                          : ''}
                        &nbsp;
                        {doctorDetails &&
                        doctorDetails.associatedDoctor &&
                        doctorDetails.associatedDoctor.lastName
                          ? doctorDetails.associatedDoctor.lastName
                          : ''}
                      </div>
                    </a>
                    <div className={classes.speciality}>
                      {doctorDetails &&
                      doctorDetails.associatedDoctor &&
                      doctorDetails.associatedDoctor.specialty &&
                      doctorDetails.associatedDoctor.specialty.name
                        ? doctorDetails.associatedDoctor.specialty.name
                        : ''}
                      <span className={classes.doctorExp}>
                        |{' '}
                        {doctorDetails &&
                        doctorDetails.associatedDoctor &&
                        doctorDetails.associatedDoctor.experience
                          ? doctorDetails.associatedDoctor.experience
                          : ''}
                        Yrs
                      </span>
                    </div>
                    <div className={classes.doctorMoreInfo}>
                      {starDoctorLocation}
                      <br />
                      {qualification}
                    </div>
                  </div>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </div>
    ) : null;
  } else {
    return <div>No Doctors Found...</div>;
  }
};
