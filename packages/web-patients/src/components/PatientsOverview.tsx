import React, { useState, useEffect } from 'react';
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
import { useMutation } from 'react-apollo-hooks';

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
  const [loading, setLoading] = useState(true);
  const [activeAppointments, setActiveAppointments] = useState<number | null>(0);
  const futureAppointmentMutation = useMutation<
    GetPatientFutureAppointmentCount,
    GetPatientFutureAppointmentCountVariables
  >(GET_PATIENT_FUTURE_APPOINTMENT_COUNT);

  useEffect(() => {
    if (currentPatient && currentPatient.id) {
      futureAppointmentMutation({
        variables: {
          patientId: currentPatient ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
        .then((res) => {
          const responseData = res && res.data;
          if (responseData && responseData.getPatientFutureAppointmentCount) {
            setActiveAppointments(
              responseData && responseData.getPatientFutureAppointmentCount.consultsCount
            );
          }
          setLoading(false);
        })
        .catch((error) => {
          alert(error);
          setLoading(false);
        });
    }
  }, [currentPatient]);
  return (
    <div className={classes.root}>
      <Grid spacing={2} container>
        <Grid item xs={12} sm={6}>
          <Link to={clientRoutes.appointments()}>
            <div className={classes.card} title={'View upcoming appointments'}>
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
