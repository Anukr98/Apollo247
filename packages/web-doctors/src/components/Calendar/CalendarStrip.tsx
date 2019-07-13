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
  endOfWeek
} from 'date-fns';

const useStyles = makeStyles({
  float: {
    display: "inline-block"
  },
  container: {
    display: "flex",
    "flex-wrap": "nowrap",
    "justify-content": "space-between"
  },
  daysList: {
    width: "80%"
  }
});

interface Props {
  dayClickHandler?: Function
}

export const CalendarStrip: React.FC<Props> = (props) => {
  const classes = useStyles();
  const today = startOfToday();
  const [prevDate, setPrevDate] = useState(today);
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(getMonth(today));

  useEffect(() => {
    if (!isWithinRange(endOfMonth(prevDate), startOfWeek(date, { weekStartsOn: 0 }), endOfWeek(date))) {
      setMonth(getMonth(date));
    }
  }, [date, prevDate]);

  const next = e => {
    setPrevDate(date);
    setDate(addWeeks(date, 1));
  }

  const previous = e => {
    setPrevDate(date);
    setDate(subWeeks(date, 1));
  }

  const onMonthSelect = e => {
    setDate(new Date(2019, e.target.value, 1, 0, 0, 0));
    setMonth(e.target.value);
  }

  const dayClickHandler = (e, date) => {
    setMonth(getMonth(date));

    if (typeof props.dayClickHandler === "function") {
      props.dayClickHandler(e, date);
    }
  }

  return (
    <div className={classes.container}>
      <MonthList
        classes={classes.float}
        month={month}
        onChange={onMonthSelect}
      />
      <div className={classes.float} onClick={previous}>Previous</div>
      <Days
        classes={classes.daysList}
        date={date}
        handler={dayClickHandler}
      />
      <div className={classes.float} onClick={next}>Next</div>
    </div>
  );
};
