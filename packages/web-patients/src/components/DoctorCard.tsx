import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors as DoctorDetails } from 'graphql/types/SearchDoctorAndSpecialty';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    },
    topContent: {
      padding: 15,
      display: 'flex',
      position: 'relative',
      cursor: 'pointer',
    },
    doctorAvatar: {
      width: 80,
      height: 80,
    },
    doctorInfo: {
      paddingLeft: 15,
      paddingTop: 15,
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
    },
    doctorType: {
      fontSize: 10,
      fontWeight: 600,
      color: '#0087ba',
      textTransform: 'uppercase',
      letterSpacing: 0.25,
    },
    doctorExp: {
      paddingLeft: 8,
      marginLeft: 5,
      paddingRight: 5,
      position: 'relative',
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 1,
        height: 10,
        top: 1,
        left: 0,
        backgroundColor: '#0087ba',
      },
    },
    doctorDetails: {
      paddingTop: 10,
      fontSize: 10,
      fontWeight: 500,
      color: '#658f9b',
      '& p': {
        margin: 0,
      },
    },
    availability: {
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,135,186,0.11)',
      padding: '6px 12px',
      color: '#02475b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 10,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    availableNow: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white,
    },
    bottomAction: {
      width: '100%',
    },
    button: {
      width: '100%',
      borderRadius: '0 0 10px 10px',
      boxShadow: 'none',
    },
  });
});

interface DoctorCardProps {
  doctorDetails: DoctorDetails;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const classes = useStyles();

  const { doctorDetails } = props;

  return (
    <div className={classes.root}>
      <div className={classes.topContent}>
        <Avatar
          alt={doctorDetails.firstName || ''}
          src={
            doctorDetails.photoUrl || '' !== ''
              ? doctorDetails.photoUrl
              : require('images/ic_placeholder.png')
          }
          className={classes.doctorAvatar}
        />
        <div className={classes.doctorInfo}>
          <div className={`${classes.availability} ${classes.availableNow}`}>
            Available in 15 mins
          </div>
          <div className={classes.doctorName}>
            <Link
              to={clientRoutes.doctorDetails(doctorDetails.id)}
            >{`${doctorDetails.firstName} ${doctorDetails.lastName}`}</Link>
          </div>
          <div className={classes.doctorType}>
            {doctorDetails.speciality}{' '}
            <span className={classes.doctorExp}>{doctorDetails.experience} YRS</span>
          </div>
          <div className={classes.doctorDetails}>
            <p>{doctorDetails.education}</p>
            <p>Apollo Hospitals, Jubilee Hills</p>
          </div>
        </div>
      </div>
      <div className={classes.bottomAction}>
        <AphButton fullWidth color="primary" className={classes.button}>
          Consult Now
        </AphButton>
      </div>
    </div>
  );
};
