import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { startOfWeek, endOfWeek, eachDayOfInterval, getDate, getDay, isToday } from 'date-fns';
import { getTime } from 'date-fns/esm';

const days: string[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

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
  userSelection: Date;
  handler: (e: React.MouseEvent<HTMLLIElement>, date: Date) => void;
}

export const Days: React.FC<DaysProps> = ({ date, userSelection, handler, className }) => {
  const today: Date = date;
  const weekStart: Date = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd: Date = endOfWeek(today);
  const [range, setRange] = useState<Date[]>(eachDayOfInterval({ start: weekStart, end: weekEnd }));
  const [currentSelection, setCurrentSelection] = useState<number>();
  const [userSelectedDate, setUserSelectedDate] = useState<Date>(today);
  const classes = useStyles();

  useEffect(() => {
    const range: Date[] = eachDayOfInterval({
      start: startOfWeek(date, { weekStartsOn: 0 }),
      end: endOfWeek(date),
    });

    setRange(range);
  }, [date]);

  useEffect(() => {
    setUserSelectedDate(userSelection);
  }, [userSelection]);

  useEffect(() => {
    setCurrentSelection(range.findIndex((item) => getTime(item) == getTime(userSelectedDate)));
  }, [userSelectedDate, range]);

  return (
    <div className={className}>
      <ul className={classes.reset}>
        {range.map((date, idx) => (
          <li
            className={`${classes.days} ${currentSelection === idx ? 'highlight' : ''}`}
            key={idx}
            onClick={(e) => (setUserSelectedDate(date), handler(e, date))}
          >
            <span className={classes.day}>{isToday(date) ? 'today' : days[getDay(date)]}</span>
            <span className={classes.date}>{getDate(date)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
