import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
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
      padding: 0,
    },
    clinicImg: {
      borderRadius: 5,
      overflow: 'hidden',
      '& img': {
        verticalAlign: 'middle',
        height: 65,
      },
    },
    clinicInfo: {
      paddingBottom: 10,
      fontSize: 12,
      fontWeight: 500,
    },
    address: {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
      paddingBottom: 0,
      borderbottom: 'none',
    },
    cityText: {
      paddingBottom: 0,
      fontSize: 12,
      fontWeight: 500,
    },
    sectionHeader: {
      color: theme.palette.secondary.dark,
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      paddingBottom: 8,
      paddingTop: 5,
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
    },
    sectionGroup: {
      paddingLeft: 20,
      paddingRight: 20,
      [theme.breakpoints.up('sm')]: {
        paddingBottom: 20,
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
    imageGroup: {
      display: 'flex',
      marginLeft: -10,
      marginRight: -10,
    },
    imageCol: {
      paddingLeft: 10,
      paddingRight: 10,
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

  if (doctorDetails) {
    const clinics: Facility[] = [];

    _forEach(doctorDetails.doctorHospital, (hospitalDetails) => {
      if (
        hospitalDetails.facility.facilityType === 'CLINIC' ||
        hospitalDetails.facility.facilityType === 'HOSPITAL'
      ) {
        clinics.push(hospitalDetails);
      }
    });

    const { firstName } = doctorDetails;

    return clinics.length > 0 ? (
      <>
        <div className={classes.sectionGroup}>
          <div className={classes.sectionHeader}>
            <span>Clinic Address</span>
          </div>
          {_map(clinics, (clinicDetails) => {
            return (
              <div className={classes.root} key={_uniqueId('clinic_')}>
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
                  <div className={classes.cityText}>
                    {clinicDetails && clinicDetails.facility.city
                      ? clinicDetails.facility.city
                      : ''}
                  </div>
                </div>
                <div className={classes.imageGroup}>
                  <div className={classes.imageCol}>
                    <div className={classes.clinicImg}>
                      <img
                        src={
                          clinicDetails.facility.imageUrl || require('images/hospital-image.png')
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    ) : null;
  } else {
    return <></>;
  }
};
