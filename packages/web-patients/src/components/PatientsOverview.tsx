import React, { useState, useEffect, useRef } from 'react';
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
import { Alerts } from 'components/Alerts/Alerts';
import { HdfcRegistration } from 'components/HdfcRegistration';
import { HdfcSlider } from 'components/HdfcSlider';
import { HDFC_REF_CODE } from 'helpers/constants';
import { HdfcHomePage } from 'components/HdfcHomePage';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      [theme.breakpoints.down('sm')]: {
        width: '100%',
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

const PatientsOverview: React.FC = () => {
  const classes = useStyles({});

  const { currentPatient } = useAllCurrentPatients();
  const [loading, setLoading] = useState(true);
  const [activeAppointments, setActiveAppointments] = useState<number | null>(0);
  const futureAppointmentMutation = useMutation<
    GetPatientFutureAppointmentCount,
    GetPatientFutureAppointmentCountVariables
  >(GET_PATIENT_FUTURE_APPOINTMENT_COUNT);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [userSubscriptions, setUserSubscriptions] = React.useState([]);
  const [showSubscription, setShowSubscription] = useState<boolean>(false);

  const scrollToRef = (ref: any) =>
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const registrationRef = useRef(null);

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
          setIsAlertOpen(true);
          setAlertMessage('Something went wrong :(');
          setLoading(false);
        })
        .finally(() => {
          const userSubscriptionsLocalStorage = JSON.parse(
            localStorage.getItem('userSubscriptions')
          );
          setUserSubscriptions(userSubscriptionsLocalStorage);
          setShowSubscription(true);
          currentPatient.partnerId === HDFC_REF_CODE &&
          userSubscriptionsLocalStorage &&
          userSubscriptionsLocalStorage.length == 0
            ? scrollToRef(registrationRef)
            : '';
        });
    }
  }, [currentPatient]);
  return (
    <div className={classes.root}>
      {/* <Grid spacing={2} container>
        <Grid item xs={12} sm={6}> */}
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
      {/* </Grid> */}
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
      {/* </Grid> */}
      {/* <Grid item xs={12} sm={6}> */}
      <div ref={registrationRef}>
        {currentPatient &&
          showSubscription &&
          currentPatient.partnerId === HDFC_REF_CODE &&
          (userSubscriptions == null || userSubscriptions.length == 0) && (
            <HdfcRegistration patientPhone={currentPatient.mobileNumber} />
          )}
        {currentPatient &&
          userSubscriptions &&
          userSubscriptions.length != 0 &&
          userSubscriptions[0] &&
          userSubscriptions[0].status == 'DEFERRED_INACTIVE' && (
            <HdfcHomePage patientPhone={currentPatient.mobileNumber} />
          )}
        {currentPatient &&
          userSubscriptions &&
          userSubscriptions.length != 0 &&
          userSubscriptions[0] &&
          userSubscriptions[0].status == 'ACTIVE' && (
            <HdfcSlider patientPhone={currentPatient.mobileNumber} />
          )}
      </div>
      {/* </Grid>
      </Grid> */}
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};

export default PatientsOverview;
