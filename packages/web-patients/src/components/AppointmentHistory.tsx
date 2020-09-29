import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { PATIENT_APPOINTMENT_HISTORY } from 'graphql/doctors';
import {
  getAppointmentHistory as PatientAppointmentHistory,
  getAppointmentHistoryVariables as AppointmentHistoryVariables,
  getAppointmentHistory_getAppointmentHistory_appointmentsHistory as AppointmentHistoryType,
} from 'graphql/types/getAppointmentHistory';
import LinearProgress from '@material-ui/core/LinearProgress';
import _uniqueId from 'lodash/uniqueId';
import getTime from 'date-fns/esm/getTime';
import format from 'date-fns/format';
import { useAllCurrentPatients } from 'hooks/authHooks';
import Slider from 'react-slick';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      margin: 10,
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
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
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
      padding: 20,
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
  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <img src={require('images/ic_arrow_right.svg')} alt="" />,
    prevArrow: <img src={require('images/ic_arrow_left.svg')} alt="" />,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          centerPadding: '50px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 2,
          centerMode: true,
          nextArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
          prevArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          nextArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
          prevArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
        },
      },
    ],
  };

  const { doctorId } = props;
  const { currentPatient } = useAllCurrentPatients();
  const apolloClient = useApolloClient();
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistoryType[] | null>(
    null
  );
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (currentPatient && currentPatient.id) {
      setLoading(true);
      apolloClient
        .query<PatientAppointmentHistory, AppointmentHistoryVariables>({
          query: PATIENT_APPOINTMENT_HISTORY,
          variables: {
            appointmentHistoryInput: { patientId: currentPatient.id, doctorId: doctorId },
          },
        })
        .then(({ data }: any) => {
          if (
            data &&
            data.getAppointmentHistory &&
            data.getAppointmentHistory.appointmentsHistory
          ) {
            setAppointmentHistory(data.getAppointmentHistory.appointmentsHistory);
          } else {
            setAppointmentHistory([]);
          }
          setError(false);
        })
        .catch((e) => {
          console.log(e);

          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentPatient]);

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <></>;
  }

  return appointmentHistory && appointmentHistory.length > 0 ? (
    <div className={classes.sectionGroup}>
      <div className={classes.sectionHeader}>
        <span>{`Appointment History (${(appointmentHistory && appointmentHistory.length) ||
          0})`}</span>
      </div>
      <Slider {...sliderSettings}>
        {appointmentHistory.map((appointment) => {
          const appointmentDate = format(new Date(appointment.appointmentDateTime), 'dd MMM, yyyy');
          const appointmentTime = format(new Date(appointment.appointmentDateTime), 'h:mm a');
          const symtomName =
            appointment && appointment.caseSheet[0] && appointment.caseSheet[0].symptoms;
          return (
            <div className={classes.root} key={_uniqueId('aphistory_')}>
              <div className={classes.appointType}>
                {appointment.appointmentType === 'ONLINE' ? 'Online Consult' : 'Clinic Visit'}
              </div>
              <div className={classes.appointmentInfo}>
                <div className={classes.timeGroup}>
                  <div className={classes.appointDate}>{appointmentDate}</div>
                  <div className={classes.appointTime}>{appointmentTime}</div>
                </div>
                {symtomName && (
                  <div className={classes.appointBooked}>
                    <ul>
                      {symtomName.map((sym) => (
                        <li key={_uniqueId('sym_')}>{sym.symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  ) : null;
};
