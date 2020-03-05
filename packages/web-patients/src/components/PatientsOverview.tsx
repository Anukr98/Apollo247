import React from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_PATIENT_FUTURE_APPOINTMENT_COUNT } from 'graphql/profiles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  GetPatientFutureAppointmentCountVariables,
  GetPatientFutureAppointmentCount,
} from 'graphql/types/GetPatientFutureAppointmentCount';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 40,
      [theme.breakpoints.down('xs')]: {
        padding: 20,
      },
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 12,
      fontSize: 17,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    },
    totalConsults: {
      width: 40,
      height: 40,
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      color: '#0087ba',
      fontSize: 18,
      lineHeight: '40px',
      marginRight: 8,
      textAlign: 'center',
    },
    rightArrow: {
      marginLeft: 'auto',
      '& img': {
        verticalAlign: 'middle',
      },
    },
  };
});

export const PatientsOverview: React.FC = () => {
  const classes = useStyles();

  const { currentPatient } = useAllCurrentPatients();

  const { data, loading, error } = useQueryWithSkip<
    GetPatientFutureAppointmentCount,
    GetPatientFutureAppointmentCountVariables
  >(GET_PATIENT_FUTURE_APPOINTMENT_COUNT, {
    variables: { patientId: currentPatient ? currentPatient.id : '' },
    ssr: currentPatient && currentPatient.id ? true : false,
    fetchPolicy: 'no-cache',
  });

  const activeAppointments =
    data &&
    data.getPatientFutureAppointmentCount &&
    data.getPatientFutureAppointmentCount.consultsCount
      ? data.getPatientFutureAppointmentCount.consultsCount
      : 0;

  return (
    <div className={classes.root}>
      <Grid spacing={2} container>
        <Grid item xs={12} sm={6}>
          <Link to={clientRoutes.appointments()}>
            <div className={classes.card} title={'Upcoming Appointments'}>
              <div className={classes.totalConsults}>
                {loading ? <CircularProgress size={10} /> : activeAppointments}
              </div>
              <span>Upcoming Appointments</span>
              <span className={classes.rightArrow}>
                <img src={require('images/ic_arrow_right.svg')} />
              </span>
            </div>
          </Link>
        </Grid>
        {/* <Grid item xs={12} sm={6}>
          <div className={classes.card}>
            <div className={classes.totalConsults}>
              {loading ? <CircularProgress size={10} /> : activeAppointments}
            </div>
            <span>Active Orders</span>
            <span className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} />
            </span>
          </div>
        </Grid> */}
      </Grid>
    </div>
  );
};
