import React, { useState } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import moment from 'moment';
import { Week as WeekView } from 'components/Calendar/Views/Week';
import { Month as MonthView } from 'components/Calendar/Views/Month';
import { GET_DOCTOR_APPOINTMENTS } from 'graphql/appointments';
import { Appointment } from 'components/Appointments';
import { getTime, startOfToday, addDays, startOfMonth, endOfMonth, isToday } from 'date-fns/esm';
import { addMinutes, format, startOfDay } from 'date-fns';
import {
  GetDoctorAppointments,
  GetDoctorAppointments_getDoctorAppointments_appointmentsHistory,
} from 'graphql/types/GetDoctorAppointments';
import { useQuery } from 'react-apollo-hooks';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useAuth } from 'hooks/authHooks';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 70,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 999,
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
      [theme.breakpoints.down('xs')]: {
        padding: '30px 15px 50px 15px',
      },
      '& h1': {
        display: 'flex',
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 28,
        fontWeight: 600,
        lineHeight: 1.36,
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
      top: 75,
      right: 16,
      borderRadius: 17,
      [theme.breakpoints.down('xs')]: {
        top: 10,
        right: 5,
      },
      '& button': {
        padding: '6px 33px',
        height: 36,
        borderRadius: 17,
        color: '#02475b',
        fontSize: 14,
        fontWeight: 600,
        textTransform: 'capitalize',
        [theme.breakpoints.down('xs')]: {
          padding: '0px 33px',
          height: 30,
        },
      },
    },
    customeSelect: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
      [theme.breakpoints.down('xs')]: {},
      '&:first-child': {
        borderRadius: '17px !important',
      },
      '&:last-child': {
        borderRadius: '17px !important',
        paddingLeft: 25,
        paddingRight: 26,
      },
    },
    nopionter: {
      // pointerEvents: 'none',
    },
  };
});

const dataAdapter = (data: GetDoctorAppointments | undefined) => {
  if (!data || !data.getDoctorAppointments) {
    return [] as Appointment[];
  }
  const appointments: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null)[] =
    data!.getDoctorAppointments!.appointmentsHistory || [];
  const newPatientsList: (string | null)[] | null = data!.getDoctorAppointments.newPatientsList;

  const adaptedList: Appointment[] = appointments.map(
    (appointment: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null) => {
      const {
        id,
        appointmentDateTime,
        appointmentType: type,
        status,
        patientId,
        patientInfo,
        caseSheet,
      } = appointment!;
      const startTime = getTime(new Date(appointmentDateTime));
      const endTime = getTime(addMinutes(startTime, 15));
      let symptoms = null;
      if (
        caseSheet &&
        caseSheet.length > 0 &&
        caseSheet[0] !== null &&
        caseSheet[0]!.symptoms !== null
      ) {
        symptoms = caseSheet && caseSheet!.length > 0 && caseSheet[0] !== null ? caseSheet[0] : [];
      } else if (
        caseSheet &&
        caseSheet.length > 1 &&
        caseSheet[1] !== null &&
        caseSheet[1]!.symptoms !== null
      ) {
        symptoms = caseSheet && caseSheet!.length > 0 && caseSheet[1] !== null ? caseSheet[1] : [];
      }
      return {
        id,
        patientId,
        startTime,
        endTime,
        type,
        status,
        caseSheet,
        isNew: !!newPatientsList && newPatientsList.includes(patientId),
        details: {
          patientName: `${patientInfo!.firstName} ${patientInfo!.lastName}`,
          checkups: symptoms,
          avatar: require('images/ic_patientchat.png'),
        },
      };
    }
  );

  return adaptedList;
};

const getRange = (date: Date) => {
  return { start: startOfDay(date), end: addDays(startOfDay(date), 1) };
};

const getMonthRange = ({ start, end }: { start: string | Date; end: string | Date }) => {
  start = startOfMonth(start as Date);
  end = endOfMonth(end as Date);
  return { start, end };
};

export const Calendar: React.FC = () => {
  const today: Date = startOfToday();
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [viewSelection, setViewSelection] = useState<string>('day');
  const [monthSelected, setMonthSelected] = useState<string>(moment(today).format('MMMM'));

  const pageRefreshTimeInSeconds = 30;

  //console.log(moment(today).format('MMMM'));
  const [range, setRange] = useState<{ start: string | Date; end: string | Date }>(
    viewSelection === 'day'
      ? getRange(selectedDate)
      : { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) }
  );

  const {
    currentPatient,
  }: { currentPatient: GetDoctorDetails_getDoctorDetails | null } = useAuth();

  const setStartOfMonthDate = ({ start, end }: { start: string | Date; end: string | Date }) => {
    //setMonthSelected(moment(selectedDate).format('MMMM'));
    const increaseDate = new Date(start);
    const newDate = new Date(increaseDate.setMonth(increaseDate.getMonth() + 1));
    setSelectedDate(startOfMonth(newDate as Date));
  };

  const { data, loading } = useQuery(GET_DOCTOR_APPOINTMENTS, {
    variables: {
      startDate: format(range.start as number | Date, 'yyyy-MM-dd'),
      endDate: format(range.end as number | Date, 'yyyy-MM-dd'),
    },
    fetchPolicy: 'no-cache',
    pollInterval: pageRefreshTimeInSeconds * 1000,
    notifyOnNetworkStatusChange: true,
  });

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 65px)' }}>
        <div className={classes.container}>
          <div className={classes.tabHeading}>
            <Typography variant="h1">
              {currentPatient && `hello dr. ${(currentPatient!.lastName || '').toLowerCase()} :)`}
            </Typography>
            {viewSelection === 'day' ? (
              <p>
                {`Here’s your schedule for ${isToday(selectedDate) ? ' the day - ' : ''} ${format(
                  selectedDate,
                  isToday(selectedDate) ? 'dd MMM,  yyyy' : 'MMM, dd'
                )}`}
              </p>
            ) : (
              <p>
                here’s your schedule for {monthSelected} {selectedDate.getFullYear()}
              </p>
            )}
          </div>
          <div>
            <div>
              <ToggleButtonGroup exclusive value={viewSelection} className={classes.toggleBtn}>
                <ToggleButton
                  className={`${viewSelection === 'day' ? classes.customeSelect : ''}`}
                  value="day"
                  onClick={() => {
                    setViewSelection('day');
                    setRange(getRange(selectedDate));
                  }}
                >
                  Day
                </ToggleButton>
                <ToggleButton
                  className={`${viewSelection === 'month' ? classes.customeSelect : ''}`}
                  value="month"
                  onClick={() => {
                    setViewSelection('month');
                    //setRange({ start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) });
                    setMonthSelected(moment(selectedDate).format('MMMM'));
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
                loading={loading}
              />
            )}
            {viewSelection === 'month' && (
              <MonthView
                data={data}
                date={selectedDate}
                onMonthSelected={(month: string) => {
                  setMonthSelected(month);
                }}
                onMonthChange={(range) => {
                  //console.log(range);
                  setStartOfMonthDate(range as { start: string; end: string });
                  setRange(getMonthRange(range as { start: string; end: string }));
                }}
              />
            )}
          </div>
        </div>
      </Scrollbars>
    </div>
  );
};
