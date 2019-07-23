import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { startOfWeek, endOfWeek, eachDayOfInterval, getDate, getDay, isToday } from 'date-fns';

const days: string[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
let firstLoad: boolean = true;

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
  classes?: string;
  handler: (e: React.MouseEvent<HTMLLIElement>, date?: Date) => void;
}

export const Days: React.FC<DaysProps> = ({ date, classes, handler }) => {
  const today: Date = date;
  const weekStart: Date = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd: Date = endOfWeek(today);
  const [range, setRange] = useState(eachDayOfInterval({ start: weekStart, end: weekEnd }));
  const [selected, setSelected] = useState();
  const klasses = useStyles();

  useEffect(() => {
    !firstLoad &&
      setRange(
        eachDayOfInterval({
          start: startOfWeek(date, { weekStartsOn: 0 }),
          end: endOfWeek(date),
        })
      );
  }, [date]);

  useEffect(() => {
    let todayIdx: number;
    setSelected(
      firstLoad && (todayIdx = range.findIndex((date) => isToday(date))) > -1 ? todayIdx : 0
    );
    firstLoad && (firstLoad = false);
  }, [range]);

  return (
    <div className={classes}>
      <ul className={klasses.reset}>
        {range.map((date: Date, idx: number) => (
          <li
            className={`${klasses.days} ${selected === idx ? 'highlight' : ''}`}
            key={idx}
            onClick={(e) => (setSelected(idx), handler(e, date))}
          >
            <span className={klasses.day}>{isToday(date) ? 'today' : days[getDay(date)]}</span>
            <span className={klasses.date}>{getDate(date)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
