import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, MenuItem } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { AphSelect, AphButton } from '@aph/web-ui-components';
import { ThingsToDo } from 'components/ConsultRoom/ThingsToDo';
import { ConsultationsCard } from 'components/ConsultRoom/ConsultationsCard';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { GET_PATIENT_APPOINTMENTS } from 'graphql/doctors';
import {
  GetPatientAppointments,
  GetPatientAppointmentsVariables,
} from 'graphql/types/GetPatientAppointments';
import { clientRoutes } from 'helpers/clientRoutes';
import { Route } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
// import { APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import _isEmpty from 'lodash/isEmpty';
import { useAuth } from 'hooks/authHooks';
import { getIstTimestamp } from 'helpers/dateHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    consultPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      paddingLeft: 40,
      paddingRight: 20,
      paddingTop: 46,
      paddingBottom: 40,
    },
    consultationsHeader: {
      paddingBottom: 60,
      width: 'calc(100% - 328px)',
      paddingRight: 20,
      '& h1': {
        display: 'flex',
        fontSize: 50,
        [theme.breakpoints.down('xs')]: {
          fontSize: 30,
        },
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: '#0087ba',
        margin: 0,
        paddingTop: 10,
      },
    },
    selectMenuRoot: {
      paddingRight: 55,
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 50,
      fontWeight: 600,
      lineHeight: '66px',
      paddingTop: 2,
      paddingBottom: 7,
      [theme.breakpoints.down('xs')]: {
        fontSize: 30,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      marginLeft: 30,
      paddingBottom: 0,
      paddingRight: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    bottomActions: {
      marginTop: 20,
      maxWidth: 201,
    },
    consultSection: {
      display: 'flex',
      paddingRight: 20,
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      marginTop: -60,
    },
    rightSection: {
      width: 328,
      marginTop: -183,
    },
    noConsultations: {
      paddingBottom: 0,
    },
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const ConsultRoom: React.FC = (props) => {
  const classes = useStyles();
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const currentDate = new Date().toISOString().substring(0, 10);
  const { isSignedIn } = useAuth();

  const { data, loading, error } = useQueryWithSkip<
    GetPatientAppointments,
    GetPatientAppointmentsVariables
  >(GET_PATIENT_APPOINTMENTS, {
    variables: {
      patientAppointmentsInput: {
        patientId: (currentPatient && currentPatient.id) || '',
        appointmentDate: currentDate,
      },
    },
  });
  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <div>Unable to load Consults...</div>;
  }

  const appointments =
    data && data.getPatinetAppointments && data.getPatinetAppointments.patinetAppointments
      ? data.getPatinetAppointments.patinetAppointments
      : [];

  // filter appointments that are greater than current time.
  const filterAppointments = appointments.filter((appointmentDetails) => {
    const currentTime = new Date().getTime();
    const aptArray = appointmentDetails.appointmentDateTime.split('T');
    const appointmentTime = getIstTimestamp(new Date(aptArray[0]), aptArray[1].substring(0, 5));
    if (
      // appointmentTime > currentTime &&
      // appointmentDetails.appointmentType === APPOINTMENT_TYPE.ONLINE
      // the above condition is commented as per demo feedback on 13/08/2019
      appointmentTime > currentTime
    )
      return appointmentDetails;
  });

  return isSignedIn ? (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.consultPage}>
          <div
            className={`${classes.consultationsHeader} ${
              filterAppointments.length === 0 ? classes.noConsultations : ''
            }`}
          >
            {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
              <Typography variant="h1">
                <span>hello</span>
                <AphSelect
                  value={currentPatient.id}
                  onChange={(e) => setCurrentPatientId(e.target.value as Patient['id'])}
                  classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
                >
                  {allCurrentPatients.map((patient) => {
                    const isSelected = patient.id === currentPatient.id;
                    const name = isSelected
                      ? (patient.firstName || '').toLocaleLowerCase()
                      : (patient.firstName || '').toLocaleLowerCase();
                    return (
                      <MenuItem
                        selected={isSelected}
                        value={patient.id}
                        classes={{ selected: classes.menuSelected }}
                        key={patient.id}
                      >
                        {name}
                      </MenuItem>
                    );
                  })}
                  <MenuItem classes={{ selected: classes.menuSelected }}>
                    <AphButton color="primary" classes={{ root: classes.addMemberBtn }}>
                      Add Member
                    </AphButton>
                  </MenuItem>
                </AphSelect>
              </Typography>
            ) : (
              <Typography variant="h1">hello there!</Typography>
            )}

            {filterAppointments.length === 0 ? (
              <>
                <p>You have no consultations today :) Hope you are doing well?</p>
                <div className={classes.bottomActions}>
                  <Route
                    render={({ history }) => (
                      <AphButton
                        fullWidth
                        color="primary"
                        onClick={() => {
                          history.push(clientRoutes.doctorsLanding());
                        }}
                      >
                        Consult Doctor
                      </AphButton>
                    )}
                  />
                </div>
              </>
            ) : (
              <p>
                You have {filterAppointments.length}{' '}
                {filterAppointments.length > 1 ? 'consultations' : 'consultation'} today!
              </p>
            )}
          </div>
        </div>
        <div className={classes.consultSection}>
          <div className={classes.leftSection}>
            {data ? <ConsultationsCard appointments={data} /> : null}
          </div>
          <div className={classes.rightSection}>
            <ThingsToDo />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <LinearProgress />
  );
};
