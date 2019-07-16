import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
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
  };
});

export interface DoctorClinicsProps {
  doctorId: string;
}

export const DoctorClinics: React.FC<DoctorClinicsProps> = (props) => {
  const classes = useStyles();

  const { doctorId } = props;

  interface clinicDetailsType {
    id: string;
    address: string;
    availability: {
      [key: string]: string;
    };
  }

  interface clinicDetails {
    [key: string]: clinicDetailsType;
  }

  /* this should be a graphql call */
  const clinicsObj = {
    clinic1: {
      id: '1-sln-terminus',
      address: 'SLN Terminus, No.18, 2nd Floor, Gachibowli, Hyderabad.',
      availability: {
        MON: '8:00am - 12:00pm',
        SAT: '9:00am - 11:00pm',
      },
    },
    clinic2: {
      id: '2-viraj-complex',
      address: 'Viraj Complex, No.18, 2nd Floor, Madhapur, Hyderabad.',
      availability: {
        MON: '8:00am - 12:00pm',
        SAT: '9:00am - 11:00pm',
      },
    },
  };

  const clinicsMarkup = (clinicsObj: clinicDetails) => {
    return Object.values(clinicsObj).map((clinicDetails: clinicDetailsType) => (
      <Grid item sm={6}>
        <div className={classes.root} key={_uniqueId('clinic_')}>
          <div className={classes.clinicImg}>
            <img src="https://via.placeholder.com/328x100" />
          </div>
          <div className={classes.clinicInfo}>
            <div className={classes.address}>{clinicDetails.address}</div>
            <div className={classes.availableTimings}>
              {Object.keys(clinicDetails.availability).map((index: string) => {
                return (
                  <div className={classes.timingsRow} key={_uniqueId('ava_')}>
                    <span>{index}</span><span>{clinicDetails.availability[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Grid>
    ));
  };

  return (
    <Grid container spacing={2}>
      {clinicsMarkup(clinicsObj)}
    </Grid>
  );
};
