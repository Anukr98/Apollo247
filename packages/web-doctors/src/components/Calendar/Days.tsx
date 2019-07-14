import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  startOfWeek,
  endOfWeek,
  eachDay,
  getDate,
  getDay,
  isToday
} from 'date-fns';

const days: Array<string> = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat'
];

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    width: "100%"
  },
  days: {
    display: "inline-block",
    width: "10%"
  },
  day: {
    display: "block"
  },
  date: {
    display: "block"
  }
});

interface Props {
  date: Date,
  classes?: string,
  handler: Function
}

export const Days: React.FC<Props> = (props) => {
  const today: any = props.date;
  const weekStart: Date = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd: Date = endOfWeek(today);
  const [range, setRange] = useState(eachDay(weekStart, weekEnd));
  const classes = useStyles();

  useEffect(() => {
    setRange(eachDay(startOfWeek(props.date, { weekStartsOn: 0 }), endOfWeek(props.date)));
  }, [props.date]);

  return (
    <div className={props.classes}>
      <ul className={classes.reset}>
        {
          range.map((date, idx) => <li className={classes.days} key={idx} onClick={e => props.handler(e, date)}>
            <span className={classes.day}>{isToday(date) ? 'today' : days[getDay(date)]}</span>
            <span className={classes.date}>{getDate(date)}</span>
          </li>)
        }
      </ul>
    </div>
  );
};
