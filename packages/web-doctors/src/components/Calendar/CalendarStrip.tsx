import React, { useState } from 'react';
import { MonthList } from './MonthList';
import { Days } from './Days';
import { makeStyles } from '@material-ui/styles';
import {
  startOfToday,
  addWeeks,
  subWeeks,
  getMonth,
  startOfWeek,
  startOfDay,
  getYear,
} from 'date-fns';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';

const useStyles = makeStyles({
  float: {
    display: 'inline-block',
  },
  container: {
    display: 'flex',
    'flex-wrap': 'nowrap',
    'justify-content': 'space-between',
    boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
  },
  daysList: {
    width: '70%',
    display: 'inline-block',
    verticalAlign: 'middle',
    '& li': {
      width: '14%',
      padding: '10px 0 10px 0',
      '&.highlight': {
        backgroundColor: '#00b38e',
        color: '#fff',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  weekView: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    width: '80%',
    margin: 'auto',
    padding: '0 15px',
    textAlign: 'center',
    boxShadow: '-4px 2px 10px 0 rgba(0, 0, 0, 0.1)',
  },
  monthPopup: {
    fontSize: 21,
    display: 'inline-block',
    width: '15%',
  },
  prevBtn: {
    width: '7%',
    display: 'inline-block',
    fontWeight: 600,
    fontSize: 25,
    color: '#658f9b',
    cursor: 'pointer',
  },
  nextBtn: {
    width: '7%',
    display: 'inline-block',
    fontWeight: 600,
    fontSize: 25,
    color: '#658f9b',
    cursor: 'pointer',
  },
  calendarContainer: {
    display: 'flex',
  },
  calenderIcon: {
    width: '7%',
    display: 'flex',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '-4px 2px 10px 0 rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    '& img': {
      margin: 'auto',
    },
  },
  moreIcon: {
    width: '7%',
    display: 'flex',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '-4px 2px 10px 0 rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    '& img': {
      margin: 'auto',
    },
  },
});

export interface CalendarStripProps {
  dayClickHandler?: (e: React.MouseEvent, date: Date) => void;
  monthChangeHandler?: (date: Date) => void;
  onNext?: (e: React.MouseEvent, newDate: Date, startOfWeek: Date) => void;
  onPrev?: (e: React.MouseEvent, newDate: Date, startOfWeek: Date) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  onNext,
  onPrev,
  monthChangeHandler,
  dayClickHandler,
}) => {
  const classes = useStyles();
  const today = startOfToday();
  const [date, setDate] = useState<Date>(today);
  const [userSelection, setUserSelection] = useState<Date>(today);

  return (
    <div className={classes.calendarContainer}>
      <div className={classes.calenderIcon}>
        <img src={require('images/ic_calendar.svg')} alt="" />
      </div>
      <div className={classes.weekView}>
        <MonthList
          className={classes.monthPopup}
          date={date}
          onChange={(newDate) => {
            setDate(newDate as Date);
            setUserSelection(newDate as Date);

            if (monthChangeHandler) {
              monthChangeHandler(newDate as Date);
            }
          }}
        />
        <div
          className={classes.prevBtn}
          onClick={(e) => {
            const newDate = subWeeks(date, 1);
            const weekStartDate: Date = startOfWeek(startOfDay(newDate));
            setDate(newDate);

            if (onPrev) {
              onPrev(e, newDate, weekStartDate);
            }
          }}
        >
          {' '}
          &lt;{' '}
        </div>
        <Days
          userSelection={userSelection}
          className={classes.daysList}
          date={date}
          handler={(e, date) => {
            if (dayClickHandler) {
              dayClickHandler(e, date);
            }
          }}
        />
        <div
          className={classes.nextBtn}
          onClick={(e) => {
            const newDate = addWeeks(date, 1);
            setDate(newDate);

            if (onNext) {
              onNext(e, newDate, startOfWeek(startOfDay(newDate)));
            }
          }}
        >
          {' '}
          >{' '}
        </div>
      </div>
      <div className={classes.moreIcon}>
        <img src={require('images/ic_more.svg')} alt="" />
      </div>
    </div>
  );
};
