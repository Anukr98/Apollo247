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
      '&:hover': {
        backgroundColor: '#00b38e',
      },
    },
    btnInactive: {
      backgroundColor: '#fff',
      color: '#00b38e',
      margin: theme.spacing(1, 1, 1, 0),
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
  };
});
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export interface DaySelectorProps {
  selectedDays: Day;
}
export const DaySelector: React.FC<DaySelectorProps> = (selectedDays) => {
  const classes = useStyles();
  const days: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayshtml = days.map((day) => (
    <AphButton
      key={day}
      className={
        selectedDays.selectedDays.indexOf(day) > -1 ? classes.btnActive : classes.btnInactive
      }
      // onClick={() => {
      //   const newDays = new Set(selectedDays);
      //   if (selectedDays.has(day)) {
      //     newDays.delete(day);
      //   } else {
      //     newDays.add(day);
      //   }
      //   setSelectedDays(newDays);
      // }}
    >
      {day}
    </AphButton>
  ));
  return <div>{dayshtml}</div>;
};
