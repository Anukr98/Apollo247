import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { Calendar, momentLocalizer, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { makeStyles } from '@material-ui/styles';
import {
  GetDoctorAppointments,
  GetDoctorAppointments_getDoctorAppointments_appointmentsHistory,
} from 'graphql/types/GetDoctorAppointments';
import { addMinutes, format, startOfToday } from 'date-fns/esm';
import { startOfMonth, endOfMonth } from 'date-fns';
import { GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet as caseSheetInfo } from 'graphql/types/GetDoctorAppointments';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) => {
  return {
    calendarContainer: {
      backgroundColor: '#f7f7f7',
      padding: '15px',
      fontSize: 18,
      color: 'rgba(101, 143, 155, 0.6)',
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        position: 'relative',
      },
    },
    calenderIcon: {
      cursor: 'pointer',
      width: '7%',
      display: 'flex',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '-4px 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      height: 76,
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 35,
        top: -60,
        borderRadius: 0,
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
      '& img': {
        margin: 'auto',
        width: 30,
      },
    },
    popoverTile: {
      color: '#fcb716',
      fontWeight: 500,
    },
    moreIcon: {
      width: '7%',
      display: 'flex',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '-4px 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      height: 76,
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 5,
        top: -60,
        borderRadius: 0,
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
      '& img': {
        margin: 'auto',
      },
    },
    monthView: {
      backgroundColor: '#fff',
      borderRadius: '10px',
      width: '80%',
      margin: 'auto',
      padding: 0,
      textAlign: 'center',
      boxShadow: '0px 2px 10px 0 rgba(0, 0, 0, 0.2)',
      height: 700,
      overflow: 'hidden',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
      '& .rbc-toolbar': {
        backgroundColor: '#f7f7f7',
        padding: 24,
        color: '#02475b',
        marginBottom: 0,
      },
      '& .rbc-header': {
        color: 'rgba(2, 71, 91, 0.6)',
        fontSize: 14,
        fontWeight: 500,
        padding: 25,
        borderColor: '#efefef transparent #efefef transparent',
      },
      '& .rbc-month-view': {
        height: '85%',
      },
      '& .rbc-date-cell a': {
        color: 'rgba(2, 71, 91, 0.6)',
        fontSize: 14,
        paddingRight: 15,
        paddingTop: 8,
      },
      '& .rbc-off-range': {
        opacity: 0.5,
      },
      '& .rbc-current': {
        fontWeight: 700,
      },
      '& .rbc-event': {
        fontSize: 6,
        lineHeight: '8px',
        backgroundColor: 'rgba(0,135,186,0.1)',
        marginBottom: 1,
        borderRadius: 2,
        fontWeight: 500,
        borderLeft: '2px solid #0087ba',
        color: '#02475b',
      },
      '& .rbc-show-more': {
        fontSize: 6,
        lineHeight: '8px',
        color: '#0087ba',
        textAlign: 'left',
        paddingLeft: 8,
      },
      '& .rbc-today': {
        backgroundColor: '#fff',
        position: 'relative',
      },
      '& .rbc-now a': {
        backgroundColor: '#00b38e',
        fontSize: 14,
        fontWeight: 500,
        color: '#fff',
        marginTop: 6,
        display: 'inline-block',
        height: 30,
        paddingTop: 5,
        paddingRight: 0,
        textAlign: 'center',
        width: 30,
        borderRadius: 15,
      },
      '& .rbc-off-range-bg': {
        backgroundColor: '#f7f7f7',
      },
      '& .rbc-day-bg': {
        border: '1px solid #efefef',
      },
      '& .rbc-month-row': {
        borderTop: 'transparent',
      },
      '& .calenderHeader': {
        color: '#02475b',
        fontWeight: 600,
        fontSize: 18,
        lineHeight: '24px',
        padding: 18,
        backgroundColor: '#f7f7f7',
      },
      '& .calenderHeader img': {
        position: 'relative',
        top: 9,
        width: 30,
        cursor: 'pointer',
      },
      '& .monthname': {
        paddingRight: 70,
        paddingLeft: 70,
      },
    },
  };
});

interface MonthEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientId: string;
  caseSheet: (caseSheetInfo | null)[];
}

const localizer = momentLocalizer(moment);
const eventsAdapter = (data: GetDoctorAppointments) => {
  let eventList: MonthEvent[] = [];
  if (data && data.getDoctorAppointments) {
    eventList = (data.getDoctorAppointments.appointmentsHistory || []).map(
      (appointment: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null) => {
        const { id, appointmentDateTime, patientInfo, patientId, caseSheet } = appointment!;
        const start = new Date(appointmentDateTime);
        return {
          id,
          title: `${format(start, 'hh:mm aa')} ${patientInfo!.firstName} ${patientInfo!.lastName}`,
          start,
          end: addMinutes(start, 15),
          patientId,
          caseSheet: caseSheet || [],
        };
      }
    );
  }

  return eventList;
};

export interface MonthProps {
  data: GetDoctorAppointments;
  date: Date;
  onMonthSelected(month: string): void;
  onMonthChange: (range: Date[] | { start: string | Date; end: string | Date }) => void;
}

const Toolbar = (toolbar: ToolbarProps) => {
  const next = () => toolbar.onNavigate('NEXT');
  const prev = () => toolbar.onNavigate('PREV');
  const label = () => {
    const date = moment(toolbar.date);
    return date.format('MMMM');
  };

  return (
    <div className="calenderHeader">
      <img src={require('images/ic_leftarrow.svg')} alt="" onClick={prev} />
      <span className="monthname">{label()}</span>
      <img src={require('images/ic_rightarrow.svg')} alt="" onClick={next} />
    </div>
  );
};

export const Month: React.FC<MonthProps> = ({ date, data, onMonthChange, onMonthSelected }) => {
  const classes = useStyles();
  const [events, setEvents] = useState<MonthEvent[]>(eventsAdapter(data));
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState(date);

  useEffect(() => {
    setEvents(eventsAdapter(data));
  }, [data]);

  const goToConsultRoom = (event: MonthEvent) => {
    const jrdCaseSheet =
      event.caseSheet.length > 0
        ? event.caseSheet.filter(
            (cdetails: caseSheetInfo | null) =>
              cdetails && cdetails.doctorType === 'JUNIOR' && cdetails.status === 'COMPLETED'
          )
        : [];
    if (jrdCaseSheet.length > 0) {
      window.location.href = `/consulttabs/${event.id}/${event.patientId}/0`;
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <div className={classes.calendarContainer}>
      <div
        className={classes.calenderIcon}
        onClick={() => {
          setSelectedDate(startOfToday());
          onMonthChange({ start: startOfMonth(startOfToday()), end: endOfMonth(startOfToday()) });
          onMonthSelected(moment(startOfToday()).format('MMMM'));
        }}
      >
        <img src={require('images/ic_calendar.svg')} alt="" />
      </div>
      <div className={classes.monthView}>
        <Calendar
          date={selectedDate}
          events={events}
          localizer={localizer}
          views={{ month: true }}
          onSelectEvent={(e) => goToConsultRoom(e)}
          onRangeChange={(range) => onMonthChange(range)}
          components={{ toolbar: Toolbar }}
          onNavigate={(date) => {
            onMonthSelected(moment(date).format('MMMM'));
            setSelectedDate(moment(date).toDate());
          }}
        />
      </div>
      <div className={classes.moreIcon}>
        <img src={require('images/ic_more.svg')} alt="" />
      </div>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.popoverTile}>Apollo 24x7</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can start this consultation only after Junior Doctor has filled the case sheet.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setIsDialogOpen(false);
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
