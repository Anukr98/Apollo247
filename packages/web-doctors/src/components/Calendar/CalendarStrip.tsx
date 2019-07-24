import React, { useState, useEffect } from 'react';
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

export interface CalendarStripProps {
  dayClickHandler?: (e: React.MouseEvent, date: Date) => void;
  monthChangeHandler?: (
    e: SelectInputProps['onChange'],
    monthSelected: number,
    startOfWeek: Date
  ) => void;
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
  const [month, setMonth] = useState<number>(getMonth(today));
  const [highlightStartOfMonth, setHighlightStartOfMonth] = useState<boolean>(false);

  useEffect(() => {
    if (!highlightStartOfMonth) {
      setMonth(getMonth(startOfWeek(date)));
    }
  }, [date, highlightStartOfMonth]);

  return (
    <div className={classes.weekView}>
      <MonthList
        className={classes.monthPopup}
        month={month}
        onChange={(e) => {
          const monthSelected: number = (e.target.value as unknown) as number;
          const newDate = new Date(getYear(date), monthSelected, 1, 0, 0, 0);

          setDate(newDate);
          setMonth(monthSelected);
          setHighlightStartOfMonth(true);

          if (monthChangeHandler) {
            monthChangeHandler(
              (e as unknown) as SelectInputProps['onChange'], // the default type of `e` is React.ChangeEvent need to convert it to `SelectInputProps.onChange`
              monthSelected,
              startOfWeek(startOfDay(newDate))
            );
          }
        }}
      />
      <div
        className={classes.prevBtn}
        onClick={(e) => {
          const newDate = subWeeks(date, 1);
          const weekStartDate: Date = startOfWeek(startOfDay(newDate));
          setDate(newDate);
          setHighlightStartOfMonth(false);

          if (onPrev) {
            onPrev(e, newDate, weekStartDate);
          }
        }}
      >
        {' '}
        &lt;{' '}
      </div>
      <Days
        className={classes.daysList}
        date={date}
        handler={(e, date) => {
          setMonth(getMonth(date));
          setHighlightStartOfMonth(false);

          if (dayClickHandler) {
            dayClickHandler(e, date);
          }
        }}
        highlightStartOfMonth={highlightStartOfMonth}
      />
      <div
        className={classes.nextBtn}
        onClick={(e) => {
          const newDate = addWeeks(date, 1);
          setDate(newDate);
          setHighlightStartOfMonth(false);

          if (onNext) {
            onNext(e, newDate, startOfWeek(startOfDay(newDate)));
          }
        }}
      >
        {' '}
        >{' '}
      </div>
    </div>
  );
};
