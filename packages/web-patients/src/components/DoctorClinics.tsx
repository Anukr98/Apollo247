import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import _uniqueId from 'lodash/uniqueId';

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

export interface DoctorClinicsProps {
  doctorId: string;
}

export const DoctorClinics: React.FC<DoctorClinicsProps> = (props) => {
  const classes = useStyles();

  const { doctorId } = props;

  console.log(doctorId);

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

  const clinicsMarkup = (clinicsObj) => {
    return Object.values(clinicsObj).map((clinicDetails: any) => (
      <div key={_uniqueId('clinic_')}>
        <div>
          <img src="https://placeimg.com/300/100/any" />
        </div>
        <div>{clinicDetails.address}</div>
        <div>
          {Object.keys(clinicDetails.availability).map((index) => {
            return (
              <div key={_uniqueId('ava_')}>
                <span>{index}</span>: {clinicDetails.availability[index]}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className={classes.welcome}>
      <h1>Dr. Rai's Clinics</h1> {/*this must be from either parent or here*/}
      {clinicsMarkup(clinicsObj)}
    </div>
  );
};
