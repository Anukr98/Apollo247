import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { GetDoctorProfileById as DoctorDetails } from 'graphql/types/getDoctorProfileById';
import _uniqueId from 'lodash/uniqueId';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      marginBottom: 10,
    },
    clinicImg: {
      borderRadius: '5px 5px 0 0',
      overflow: 'hidden',
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
      },
    },
    clinicInfo: {
      padding: 20,
    },
    address: {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
      borderBottom: '1px solid rgba(1,71,91,0.2)',
      paddingBottom: 10,
    },
    availableTimings: {
      paddingTop: 10,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.3,
      color: '#0087ba',
    },
    timingsRow: {
      display: 'flex',
      alignItems: 'center',
      '& span:first-child': {
        textTransform: 'uppercase',
      },
      '& span:last-child': {
        marginLeft: 'auto',
      },
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
    },
    count: {
      marginLeft: 'auto',
    },
  };
});

interface DoctorClinicsProps {
  doctorDetails: DoctorDetails;
}

export const DoctorClinics: React.FC<DoctorClinicsProps> = (props) => {
  const classes = useStyles();
  const { doctorDetails } = props;

  if (
    doctorDetails &&
    doctorDetails.getDoctorProfileById &&
    doctorDetails.getDoctorProfileById.clinics &&
    doctorDetails.getDoctorProfileById.consultationHours &&
    doctorDetails.getDoctorProfileById.profile
  ) {
    const clinics =
      doctorDetails.getDoctorProfileById.clinics.length > 0
        ? doctorDetails.getDoctorProfileById.clinics
        : [];

    const consultationHours =
      doctorDetails.getDoctorProfileById.consultationHours.length > 0
        ? doctorDetails.getDoctorProfileById.consultationHours
        : [];

    const firstName = doctorDetails.getDoctorProfileById.profile.firstName;
    const lastName = doctorDetails.getDoctorProfileById.profile.lastName;

    return (
      <>
        <div className={classes.sectionHeader}>
          <span>
            Dr. {firstName}&nbsp;{lastName}'s Clinic
          </span>
          <span className={classes.count}>
            {clinics.length < 10 ? `0${clinics.length}` : clinics.length}
          </span>
        </div>
        <Grid container spacing={2}>
          {clinics.map((clinicDetails) => {
            return (
              <Grid item sm={6} key={_uniqueId('avagr_')}>
                <div className={classes.root} key={_uniqueId('clinic_')}>
                  <div className={classes.clinicImg}>
                    <img
                      src={
                        (clinicDetails && clinicDetails.image) ||
                        'https://via.placeholder.com/328x100'
                      }
                    />
                  </div>
                  <div className={classes.clinicInfo}>
                    <div className={classes.address}>
                      {(clinicDetails && clinicDetails.addressLine1) || ''}&nbsp;
                      {(clinicDetails && clinicDetails.addressLine2) || ''}&nbsp;
                      {(clinicDetails && clinicDetails.addressLine3) || ''}
                    </div>
                    <div className={classes.availableTimings}>
                      {consultationHours.map((consultationDetails) => {
                        const startTime =
                          consultationDetails && consultationDetails.startTime
                            ? consultationDetails.startTime.substring(0, 5)
                            : null;
                        const endTime =
                          consultationDetails && consultationDetails.endTime
                            ? consultationDetails.endTime.substring(0, 5)
                            : null;
                        return (
                          <div className={classes.timingsRow} key={_uniqueId('ava_')}>
                            <span>{(consultationDetails && consultationDetails.days) || ''}</span>
                            <span>
                              {startTime ? startTime : ''}
                              &nbsp;-&nbsp;
                              {endTime ? endTime : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </>
    );
  } else {
    return <div>No Clinics Found...</div>;
  }
};
