import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import {
  GetDoctorDetailsById_getDoctorDetailsById_doctorHospital as Facility,
  GetDoctorDetailsById_getDoctorDetailsById_consultHours as ConsultHours,
} from 'graphql/types/GetDoctorDetailsById';

import _uniqueId from 'lodash/uniqueId';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import { getTime, format } from 'date-fns';

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

const getTimestamp = (today: Date, slotTime: string) => {
  const hhmm = slotTime.split(':');
  return getTime(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hhmm[0], 10),
      parseInt(hhmm[1], 10),
      0,
      0
    )
  );
};

interface DoctorClinicsProps {
  doctorDetails: DoctorDetails;
}

export const DoctorClinics: React.FC<DoctorClinicsProps> = (props) => {
  const classes = useStyles({});
  const { doctorDetails } = props;

  if (doctorDetails && doctorDetails.getDoctorDetailsById) {
    const clinics: Facility[] = [];

    _forEach(doctorDetails.getDoctorDetailsById.doctorHospital, (hospitalDetails) => {
      if (
        hospitalDetails.facility.facilityType === 'CLINIC' ||
        hospitalDetails.facility.facilityType === 'HOSPITAL'
      ) {
        clinics.push(hospitalDetails);
      }
    });

    const consultationHours =
      doctorDetails.getDoctorDetailsById.consultHours &&
      doctorDetails.getDoctorDetailsById.consultHours.length > 0
        ? doctorDetails.getDoctorDetailsById.consultHours
        : [];

    const { firstName } = doctorDetails.getDoctorDetailsById;

    return clinics.length > 0 ? (
      <>
        <div className={classes.sectionGroup}>
          <div className={classes.sectionHeader}>
            <span>{`Dr. ${firstName}'s Clinic (${
              clinics.length < 10 ? `0${clinics.length}` : clinics.length
            })`}</span>
          </div>
          <Grid className={classes.gridContainer} container spacing={2}>
            {_map(clinics, (clinicDetails) => {
              return (
                <Grid item xs={12} sm={12} md={12} lg={6} key={_uniqueId('avagr_')}>
                  <div className={classes.root} key={_uniqueId('clinic_')}>
                    <div className={classes.clinicImg}>
                      <img src="https://via.placeholder.com/328x100" />
                    </div>
                    <div className={classes.clinicInfo}>
                      <div className={classes.address}>
                        {clinicDetails && clinicDetails.facility.streetLine1
                          ? clinicDetails.facility.streetLine1
                          : ''}
                        &nbsp;
                        {clinicDetails && clinicDetails.facility.streetLine2
                          ? clinicDetails.facility.streetLine2
                          : ''}
                        &nbsp;
                        {clinicDetails && clinicDetails.facility.streetLine3
                          ? clinicDetails.facility.streetLine3
                          : ''}
                      </div>
                      <div className={classes.availableTimings}>
                        {_map(consultationHours, (consultationDetails: ConsultHours) => {
                          const startTimeUtc = new Date(
                            new Date(
                              `${format(new Date(), 'yyyy-MM-dd')} ${
                                consultationDetails.startTime
                              }:00`
                            ).toISOString()
                          ).getTime();

                          const endTimeUtc = new Date(
                            new Date(
                              `${format(new Date(), 'yyyy-MM-dd')} ${
                                consultationDetails.endTime
                              }:00`
                            ).toISOString()
                          ).getTime();

                          const localTimeOffset = new Date().getTimezoneOffset() * 60000;

                          const startTimeStamp = new Date(startTimeUtc - localTimeOffset).getTime();
                          const startTime = format(startTimeStamp, 'h:mm a');
                          const endTimeStamp = new Date(endTimeUtc - localTimeOffset).getTime();
                          const endTime = format(endTimeStamp, 'h:mm a');

                          return consultationDetails.consultMode === 'PHYSICAL' ||
                            consultationDetails.consultMode === 'BOTH' ? (
                            <div className={classes.timingsRow} key={_uniqueId('ava_')}>
                              <span>
                                {(consultationDetails && consultationDetails.weekDay) || ''}
                              </span>
                              <span>
                                {startTime ? startTime : ''}
                                &nbsp;-&nbsp;
                                {endTime ? endTime : ''}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </>
    ) : null;
  } else {
    return <></>;
  }
};
