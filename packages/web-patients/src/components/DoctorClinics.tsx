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
      [theme.breakpoints.down('xs')]: {
        marginBottom: 0,
      },
    },
    clinicImg: {
      borderRadius: '5px 5px 0 0',
      overflow: 'hidden',
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
        width: '100%',
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
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
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
      [theme.breakpoints.up('sm')]: {
        paddingBottom: 15,
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        marginTop: 16,
        marginBottom: 16,
        padding: 20,
        paddingTop: 16,
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
      <div className={classes.sectionGroup}>
        <div className={classes.sectionHeader}>
          <span>
            Dr. {firstName}&nbsp;{lastName}'s Clinic
          </span>
          <span className={classes.count}>
            {clinics.length < 10 ? `0${clinics.length}` : clinics.length}
          </span>
        </div>
        <Grid className={classes.gridContainer} container spacing={2}>
          {clinics.map((clinicDetails) => {
            return clinicDetails.isClinic ? (
              <Grid item xs={12} sm={12} md={12} lg={6} key={_uniqueId('avagr_')}>
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
            ) : null;
          })}
        </Grid>
      </div>
    );
  } else {
    return <div>No Clinics Found...</div>;
  }
};
