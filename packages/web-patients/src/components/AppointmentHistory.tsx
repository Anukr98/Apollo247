import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { PATIENT_APPOINTMENT_HISTORY } from 'graphql/doctors';
import {
  getAppointmentHistory as PatientAppointmentHistory,
  getAppointmentHistoryVariables as AppointmentHistoryVariables,
} from 'graphql/types/getAppointmentHistory';
import LinearProgress from '@material-ui/core/LinearProgress';
import _uniqueId from 'lodash/uniqueId';
import { getTime } from 'date-fns/esm';
import { format } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      marginBottom: 10,
      [theme.breakpoints.down('xs')]: {
        marginBottom: 0,
      },
    },
    appointmentInfo: {
      padding: 20,
      clear: 'both',
    },
    appointDate: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      [theme.breakpoints.down('xs')]: {
        fontSize: 18,
        fontWeight: 600,
      },
    },
    appointTime: {
      fontSize: 12,
      fontWeight: 500,
      color: '#0087ba',
      [theme.breakpoints.down('xs')]: {
        fontSize: 18,
        fontWeight: 600,
        paddingLeft: 5,
      },
    },
    timeGroup: {
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
    },
    appointType: {
      borderRadius: 10,
      backgroundColor: 'rgba(2,71,91,0.1)',
      padding: '6px 12px',
      minWidth: 116,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      color: '#02475b',
      float: 'right',
    },
    appointBooked: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 10,
      paddingTop: 5,
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          borderRadius: 10,
          backgroundColor: 'rgba(0,135,186,0.08)',
          listStyleType: 'none',
          padding: '6px 12px',
          fontSize: 9,
          fontWeight: 'bold',
          color: '#0087ba',
          marginTop: 5,
          display: 'inline-block',
        },
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        marginTop: 16,
        marginBottom: 16,
        padding: 20,
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

interface AppointmentHistoryProps {
  doctorId: string;
  patientId: string;
}

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

export const AppointmentHistory: React.FC<AppointmentHistoryProps> = (props) => {
  const classes = useStyles({});

  const { doctorId, patientId } = props;

  const { data, loading, error } = useQueryWithSkip<
    PatientAppointmentHistory,
    AppointmentHistoryVariables
  >(PATIENT_APPOINTMENT_HISTORY, {
    variables: {
      appointmentHistoryInput: { patientId: patientId, doctorId: doctorId },
    },
  });

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <></>;
  }

  if (data && data.getAppointmentHistory && data.getAppointmentHistory.appointmentsHistory) {
    const previousAppointments = data.getAppointmentHistory.appointmentsHistory;
    const symptoms = ['FEVER', 'COUGH & COLD'];
    return (
      <div className={classes.sectionGroup}>
        {previousAppointments.length > 0 ? (
          <>
            <div className={classes.sectionHeader}>
              <span>{`Appointment History (${(previousAppointments &&
                previousAppointments.length) ||
                0})`}</span>
            </div>
            <Grid className={classes.gridContainer} container spacing={2}>
              {previousAppointments.map((appointment) => {
                const appointmentDate = format(
                  new Date(appointment.appointmentDateTime),
                  'dd MMM, yyyy'
                );
                const appointmentTime = format(new Date(appointment.appointmentDateTime), 'h:mm a');
                return (
                  <Grid item sm={6} xs={6} md={3} key={_uniqueId('avagr_')}>
                    <div className={classes.root} key={_uniqueId('aphistory_')}>
                      <div className={classes.appointType}>
                        {appointment.appointmentType === 'ONLINE'
                          ? 'Online Consult'
                          : 'Clinic Visit'}
                      </div>
                      <div className={classes.appointmentInfo}>
                        <div className={classes.timeGroup}>
                          <div className={classes.appointDate}>{appointmentDate}</div>
                          <div className={classes.appointTime}>{appointmentTime}</div>
                        </div>
                        <div className={classes.appointBooked}>
                          <ul>
                            {symptoms.map((symptom: string) => (
                              <li key={_uniqueId('symptom_')}>{symptom}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Grid>
                );
              })}
            </Grid>
          </>
        ) : null}
      </div>
    );
  } else {
    return <></>;
  }
};
