import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDate,
  getDay,
  isToday,
  getTime,
} from 'date-fns';
import { startOfMonth } from 'date-fns/esm';

const days: string[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
let isFirstLoad: boolean = true;

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    width: '100%',
  },
  days: {
    display: 'inline-block',
    width: '10%',
  },
  day: {
    display: 'block',
  },
  date: {
    display: 'block',
    fontSize: 22,
    fontWeight: 500,
  },
});

export interface DaysProps {
  date: Date;
  className?: string;
  highlightStartOfMonth?: boolean;
  handler: (e: React.MouseEvent<HTMLLIElement>, date: Date) => void;
}

export const Days: React.FC<DaysProps> = ({ date, handler, highlightStartOfMonth, className }) => {
  const today: Date = date;
  const weekStart: Date = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd: Date = endOfWeek(today);
  const [range, setRange] = useState<Date[]>(eachDayOfInterval({ start: weekStart, end: weekEnd }));
  const [selected, setSelected] = useState<number>();
  const classes = useStyles();

  useEffect(() => {
    !isFirstLoad &&
      setRange(
        eachDayOfInterval({
          start: startOfWeek(date, { weekStartsOn: 0 }),
          end: endOfWeek(date),
        })
      );
  }, [date]);

  useEffect(() => {
    let selectionIndex: number = 0;

    if (highlightStartOfMonth) {
      selectionIndex = range.findIndex((item) => getTime(startOfMonth(item)) === getTime(date));

      const hasStartOfTheMonth: boolean = selectionIndex > -1;
      selectionIndex = hasStartOfTheMonth ? selectionIndex : 0;
    } else {
      selectionIndex = range.findIndex((item) => isToday(item));

      const isTodayInDateRange: boolean = selectionIndex > -1;
      selectionIndex = isFirstLoad && isTodayInDateRange ? selectionIndex : 0;
    }

    setSelected(selectionIndex || 0);

    if (isFirstLoad) {
      isFirstLoad = false;
    }
  }, [date, range, highlightStartOfMonth]);

  return (
    <div className={className}>
      <ul className={classes.reset}>
        {range.map((date, idx) => (
          <li
            className={`${classes.days} ${selected === idx ? 'highlight' : ''}`}
            key={idx}
            onClick={(e) => (setSelected(idx), handler(e, date))}
          >
            <span className={classes.day}>{isToday(date) ? 'today' : days[getDay(date)]}</span>
            <span className={classes.date}>{getDate(date)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
