import React, { useState } from 'react';
import { MonthList } from './MonthList';
import { Theme } from '@material-ui/core';
import { Days } from './Days';
import { makeStyles } from '@material-ui/styles';
import { addWeeks, subWeeks, startOfWeek, startOfDay } from 'date-fns';
import { startOfToday } from 'date-fns/esm';

const useStyles = makeStyles((theme: Theme) => {
  return {
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
      width: '75%',
      display: 'inline-block',
      verticalAlign: 'middle',
      [theme.breakpoints.down('xs')]: {
        width: '95%',
      },
      '& li': {
        width: '14%',
        padding: '15px 0 10px 0',
        cursor: 'pointer',
        '&.highlight': {
          backgroundColor: '#00b38e',
          color: '#fff',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.5)',
          fontWeight: 600,
        },
      },
    },
    weekView: {
      backgroundColor: '#fff',
      borderRadius: '10px',
      width: '82%',
      margin: 'auto',
      padding: '0 15px',
      textAlign: 'center',
      marginLeft: 25,
      boxShadow: '-10px 2px 10px 0 rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        marginLeft: 5,
        position: 'relative',
      },
    },
    monthPopup: {
      fontSize: 21,
      display: 'inline-block',
      width: '15%',
    },
    prevBtn: {
      width: '8%',
      display: 'inline-block',
      fontWeight: 600,
      fontSize: 25,
      color: '#658f9b',
      cursor: 'pointer',
      verticalAlign: 'middle',
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        left: 0,
        top: 10,
      },
      '& img': {
        width: 30,
        marginTop: 8,
      },
    },
    nextBtn: {
      width: '4%',
      display: 'inline-block',
      fontWeight: 600,
      fontSize: 25,
      color: '#658f9b',
      cursor: 'pointer',
      verticalAlign: 'middle',
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 15,
        top: 10,
      },
      '& img': {
        width: 30,
        marginTop: 8,
      },
    },
    calendarContainer: {
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 0',
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
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 35,
        top: -35,
        borderRadius: 0,
        boxShadow: 'none',
      },
      '& img': {
        margin: 'auto',
        width: 30,
      },
    },
    moreIcon: {
      width: '7%',
      display: 'flex',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '-4px 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 5,
        top: -35,
        borderRadius: 0,
        boxShadow: 'none',
      },
      '& img': {
        margin: 'auto',
      },
    },
  };
});

export interface CalendarStripProps {
  date: Date;
  dayClickHandler?: (date: Date) => void;
  monthChangeHandler?: (date: Date) => void;
  onNext?: (e: React.MouseEvent, newDate: Date, startOfWeek: Date) => void;
  onPrev?: (e: React.MouseEvent, newDate: Date, startOfWeek: Date) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  date: selectedDate,
  onNext,
  onPrev,
  monthChangeHandler,
  dayClickHandler,
}) => {
  const classes = useStyles();
  const [date, setDate] = useState<Date>(selectedDate);
  const [userSelection, setUserSelection] = useState<Date>(selectedDate);

  return (
    <div className={classes.calendarContainer}>
      <div
        className={classes.calenderIcon}
        onClick={() => {
          const today = startOfToday();
          setDate(today);
          setUserSelection(today);

          if (dayClickHandler) {
            dayClickHandler(today);
          }
        }}
      >
        <img src={require('images/ic_calendar.svg')} alt="" />
      </div>
      <div className={classes.weekView}>
        <MonthList
          className={classes.monthPopup}
          date={date}
          onChange={(newDate) => {
            setDate((newDate as unknown) as Date);
            setUserSelection((newDate as unknown) as Date);

            if (monthChangeHandler) {
              monthChangeHandler((newDate as unknown) as Date);
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
          <img src={require('images/ic_leftarrow.svg')} alt="" />
        </div>
        <Days
          userSelection={userSelection}
          className={classes.daysList}
          date={date}
          handler={(e, date) => {
            setDate(date);
            if (dayClickHandler) {
              dayClickHandler(date);
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
          <img src={require('images/ic_rightarrow.svg')} alt="" />
        </div>
      </div>
      <div className={classes.moreIcon}>
        <img src={require('images/ic_more.svg')} alt="" />
      </div>
    </div>
  );
};
