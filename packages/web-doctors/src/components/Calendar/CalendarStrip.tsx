import React, { useState, useEffect } from 'react';
import { MonthList } from './MonthList';
import { Days } from './Days';
import { makeStyles } from '@material-ui/styles';
import {
  startOfToday,
  addWeeks,
  subWeeks,
  getMonth,
  isWithinRange,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  getYear,
} from 'date-fns';

const useStyles = makeStyles({
  float: {
    display: 'inline-block',
  },
  container: {
    display: 'flex',
    'flex-wrap': 'nowrap',
    'justify-content': 'space-between',
  },
  daysList: {
    width: '70%',
    display: 'inline-block',
    verticalAlign: 'middle',
    '& li': {
      width: '14%',
      padding: '10px 0 10px 0',
      '&.highlight': {
        backgroundColor: '#02475b',
        color: '#fff',
      },
    },
  },
  weekView: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    width: '86%',
    margin: 'auto',
    padding: '0 15px',
    textAlign: 'center',
    boxShadow: '-4px 0px 10px 2px rgba(0, 0, 0, 0.1)',
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
});

interface Props {
  dayClickHandler?: Function;
  monthChangeHandler?: Function;
  onNext?: Function;
  onPrev?: Function;
}

export const CalendarStrip: React.FC<Props> = (props) => {
  const classes = useStyles();
  const today = startOfToday();
  const [prevDate, setPrevDate] = useState(today);
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(getMonth(today));

  useEffect(() => {
    if (
      !isWithinRange(endOfMonth(prevDate), startOfWeek(date, { weekStartsOn: 0 }), endOfWeek(date))
    ) {
      setMonth(getMonth(date));
    }
  }, [date, prevDate]);

  const next = (e) => {
    setPrevDate(date);

    const newDate = addWeeks(date, 1);
    setDate(newDate);

    if (typeof props.onNext === 'function') {
      props.onNext(e, newDate, startOfWeek(startOfDay(newDate)));
    }
  };

  const previous = (e) => {
    setPrevDate(date);

    const newDate = subWeeks(date, 1);
    setDate(newDate);

    if (typeof props.onPrev === 'function') {
      props.onPrev(e, newDate, startOfWeek(startOfDay(newDate)));
    }
  };

  const onMonthSelect = (e) => {
    const monthSelected = e.target.value;
    const newDate = new Date(getYear(date), monthSelected, 1, 0, 0, 0);

    setDate(newDate);
    setMonth(monthSelected);

    if (typeof props.monthChangeHandler === 'function') {
      props.monthChangeHandler(e, monthSelected, startOfWeek(startOfDay(newDate)));
    }
  };

  const dayClickHandler = (e, date) => {
    setMonth(getMonth(date));

    if (typeof props.dayClickHandler === 'function') {
      props.dayClickHandler(e, date);
    }
  };

  return (
    <div className={classes.weekView}>
      <MonthList classes={classes.monthPopup} month={month} onChange={onMonthSelect} />
      <div className={classes.prevBtn} onClick={previous}>
        {' '}
        &lt;{' '}
      </div>
      <Days classes={classes.daysList} date={date} handler={dayClickHandler} />
      <div className={classes.nextBtn} onClick={next}>
        {' '}
        >{' '}
      </div>
    </div>
  );
};
