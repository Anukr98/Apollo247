import React, { useState } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { Week as WeekView } from 'components/Calendar/Views/Week';
import { Month as MonthView } from 'components/Calendar/Views/Month';
import { GET_DOCTOR_APPOINTMENTS } from 'graphql/appointments';
import { Appointment } from 'components/Appointments';
import { getTime, startOfToday, addDays, startOfMonth, endOfMonth } from 'date-fns/esm';
import { addMinutes, format, startOfDay } from 'date-fns';
import {
  GetDoctorAppointments,
  GetDoctorAppointments_getDoctorAppointments_appointmentsHistory,
} from 'graphql/types/GetDoctorAppointments';
import { ApolloConsumer } from 'react-apollo';
import { GET_DOCTOR_PROFILE } from 'graphql/profiles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 68,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
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
      position: 'relative',
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

    tabHeading: {
      padding: '30px 40px 20px 40px',
      backgroundColor: theme.palette.secondary.contrastText,
      '& h1': {
        display: 'flex',
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 28,
        [theme.breakpoints.down('xs')]: {
          fontSize: 20,
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        margin: 0,
        [theme.breakpoints.down('xs')]: {
          fontSize: 15,
        },
      },
    },
    toggleBtn: {
      backgroundColor: '#f0f4f5',
      position: 'absolute',
      top: 55,
      right: 16,
      borderRadius: 17,
      '& button': {
        padding: '6px 40px',
        height: 36,
        borderRadius: 17,
        color: '#02475b',
        textTransform: 'capitalize',
      },
    },
    customeSelect: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
      '&:first-child': {
        borderRadius: '17px !important',
      },

    },
    nopionter: {
      pointerEvents: 'none',
    }
  };
});

const dataAdapter = (data: GetDoctorAppointments | undefined) => {
  if (!data || !data.getDoctorAppointments) {
    return [] as Appointment[];
  }
  const appointments: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory[] =
    data!.getDoctorAppointments!.appointmentsHistory || [];

  const adaptedList: Appointment[] = appointments.map(
    (appointment: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory) => {
      const { appointmentDateTime, appointmentType: type, status } = appointment;
      const startTime = getTime(new Date(appointmentDateTime));
      const endTime = getTime(addMinutes(startTime, 15));

      return {
        startTime,
        endTime,
        type,
        status,
        isNew: false,
        details: {
          patientName: '',
          checkups: [],
          avatar: '',
        },
      };
    }
  );

  return adaptedList;
};

export interface CalendarProps {
  doctorId: string;
}

const getRange = (date: Date) => {
  return { start: startOfDay(date), end: addDays(startOfDay(date), 1) };
};

const getMonthRange = ({ start, end }: { start: string | Date; end: string | Date }) => {
  start = startOfMonth(start as Date);
  end = endOfMonth(end as Date);
  return { start, end };
};

export const Calendar: React.FC<CalendarProps> = ({ doctorId }) => {
  const today: Date = startOfToday();
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [viewSelection, setViewSelection] = useState<string>('day');
  const [range, setRange] = useState<{ start: string | Date; end: string | Date }>(
    getRange(selectedDate)
  );
  const [data, setData] = useState<GetDoctorAppointments>({} as GetDoctorAppointments);

  const setStartOfMonthDate = ({ start }: { start: string | Date; end: string | Date }) => {
    setSelectedDate(startOfMonth(start as Date));
  };

  return (
    <ApolloConsumer>
      {(client) => {
        client
          .query({
            query: GET_DOCTOR_PROFILE,
          })
          .then(({ data }) => {
            client
              .query({
                query: GET_DOCTOR_APPOINTMENTS,
                variables: {
                  doctorId: data.getDoctorProfile.profile.id,
                  startDate: format(range.start as number | Date, 'yyyy-MM-dd'),
                  endDate: format(range.end as number | Date, 'yyyy-MM-dd'),
                },
              })
              .then(({ data }) => setData(data));
          });

        return (
          <div className={classes.welcome}>
            <div className={classes.headerSticky}>
              <Header />
            </div>
            <div className={classes.container}>
              <div className={classes.tabHeading}>
                <Typography variant="h1">hello dr.rao :)</Typography>
                <p>here’s your schedule for today</p>
              </div>
              <div>
                <div>
                  <ToggleButtonGroup exclusive value={viewSelection} className={classes.toggleBtn}>
                    <ToggleButton
                      className={classes.customeSelect}
                      value="day"
                      onClick={() => {
                        setViewSelection('day');
                        setRange(getRange(selectedDate));
                      }}
                    >
                      Day
                    </ToggleButton>
                    <ToggleButton
                      className={classes.nopionter}
                      value="month"
                      onClick={() => {
                        setViewSelection('month');
                        setRange({ start: selectedDate, end: endOfMonth(selectedDate) });
                      }}
                    >
                      Month
                    </ToggleButton>
                  </ToggleButtonGroup>
                </div>
                {viewSelection === 'day' && (
                  <WeekView
                    data={dataAdapter(data)}
                    date={selectedDate}
                    onDaySelection={(date) => {
                      setSelectedDate(date);
                      setRange(getRange(date));
                    }}
                  />
                )}
                {viewSelection === 'month' && (
                  <MonthView
                    data={data}
                    date={selectedDate}
                    onMonthChange={(range) => {
                      setStartOfMonthDate(range as { start: string; end: string });
                      setRange(getMonthRange(range as { start: string; end: string }))
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      }}
    </ApolloConsumer>
  );
};
