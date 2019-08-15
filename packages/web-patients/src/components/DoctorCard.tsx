import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors as DoctorDetails } from 'graphql/types/SearchDoctorAndSpecialtyByName';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';

import { useQueryWithSkip } from 'hooks/apolloHooks';
import { format } from 'date-fns';
import { getIstTimestamp } from 'helpers/dateHelpers';
import LinearProgress from '@material-ui/core/LinearProgress';
import _forEach from 'lodash/forEach';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      [theme.breakpoints.down('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
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

  const doctorId = doctorDetails.id;

  const { data, loading } = useQueryWithSkip<
    GetDoctorNextAvailableSlot,
    GetDoctorNextAvailableSlotVariables
  >(GET_DOCTOR_NEXT_AVAILABILITY, {
    variables: {
      DoctorNextAvailableSlotInput: {
        doctorIds: [doctorId],
        availableDate: format(new Date(), 'yyyy-MM-dd'),
      },
    },
  });

  // console.log('doctor details.....', doctorDetails);

  let availableSlot = 0,
    differenceInMinutes = 0;

  const clinics: any = []; // this should not be any type. we should remove in stabilization sprint.

  // it must be always one record or we return only first record.
  if (
    data &&
    data.getDoctorNextAvailableSlot &&
    data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
  ) {
    data.getDoctorNextAvailableSlot.doctorAvailalbeSlots.forEach((availability) => {
      if (availability && availability.availableSlot !== '') {
        const milliSeconds = 19800000; // this is GMT +5.30. Usually this is unnecessary if api is formatted correctly.
        const slotTimeStamp =
          getIstTimestamp(new Date(), availability.availableSlot) + milliSeconds;
        const currentTime = new Date().getTime();
        if (slotTimeStamp > currentTime) {
          availableSlot = slotTimeStamp;
          const difference = slotTimeStamp - currentTime;
          differenceInMinutes = Math.round(difference / 60000);
        }
      }
    });
  }

  const availabilityMarkup = () => {
    if (differenceInMinutes <= 0) {
      return <div className={`${classes.availability} ${classes.availableNow}`}>AVAILABLE NOW</div>;
    } else if (differenceInMinutes > 0 && differenceInMinutes <= 15) {
      return (
        <div className={`${classes.availability} ${classes.availableNow}`}>
          AVAILABLE IN {differenceInMinutes} MINS
        </div>
      );
    } else if (differenceInMinutes > 15 && differenceInMinutes <= 45) {
      return (
        <div className={`${classes.availability}`}>AVAILABLE IN {differenceInMinutes} MINS</div>
      );
    } else if (differenceInMinutes > 45 && differenceInMinutes <= 60) {
      return <div className={`${classes.availability}`}>AVAILABLE IN 1 HOUR</div>;
    } else if (differenceInMinutes > 60) {
      return (
        <div className={`${classes.availability}`}>
          TODAY {format(new Date(availableSlot), 'h:mm a')}
        </div>
      );
    }
  };

  // as per the MVP, we have only one clinic or hospital.
  _forEach(doctorDetails.doctorHospital, (hospitalDetails) => {
    if (
      hospitalDetails &&
      (hospitalDetails.facility.facilityType === 'CLINIC' ||
        hospitalDetails.facility.facilityType === 'HOSPITAL')
    ) {
      clinics.push(hospitalDetails);
    }
  });

  // console.log(clinics);

  return (
    <Link to={clientRoutes.doctorDetails(doctorDetails.id)}>
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
            {loading ? <LinearProgress /> : availabilityMarkup()}
            <div className={classes.doctorName}>
              {`${doctorDetails.firstName} ${doctorDetails.lastName}`}
            </div>
            <div className={classes.doctorType}>
              {doctorDetails.specialty.name}
              <span className={classes.doctorExp}>{doctorDetails.experience} YRS</span>
            </div>
            <div className={classes.doctorDetails}>
              <p>{doctorDetails.qualification}</p>
              {<p>{clinics && clinics.length > 0 ? clinics[0].facility.name : ''}</p>}
            </div>
          </div>
        </div>
        <div className={classes.bottomAction}>
          <AphButton fullWidth color="primary" className={classes.button}>
            {differenceInMinutes <= 15 ? 'CONSULT NOW' : 'BOOK APPOINTMENT'}
          </AphButton>
        </div>
      </div>
    </Link>
  );
};
