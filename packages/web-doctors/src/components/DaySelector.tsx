import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    btnActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.secondary.contrastText,
      margin: theme.spacing(1, 1, 1, 0),
      textTransform: 'capitalize',
      fontSize: 14,
      fontWeight: 500,
      borderRadius: 10,
      '&:hover': {
        backgroundColor: '#00b38e',
      },
    },
    btnInactive: {
      backgroundColor: '#fff',
      color: '#00b38e',
      margin: theme.spacing(1, 1, 1, 0),
      textTransform: 'capitalize',
      fontSize: 14,
      fontWeight: 500,
      borderRadius: 10,
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
  };
});
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';
export interface DaySelectorProps {
  selectedDays: string;
}
export const DaySelector: React.FC<DaySelectorProps> = (selectedDays) => {
  const classes = useStyles({});
  const days: Day[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const dayshtml = days.map((day) => (
    <AphButton
      key={day}
      className={
        selectedDays.selectedDays.toLowerCase().indexOf(day.toLowerCase()) > -1
          ? classes.btnActive
          : classes.btnInactive
      }
    >
      {day}
    </AphButton>
  ));
  return <div>{dayshtml}</div>;
};
