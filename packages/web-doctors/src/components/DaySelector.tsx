import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import React, { useState } from 'react';

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
interface DaySelectorProps {}
export const DaySelector: React.FC<DaySelectorProps> = () => {
  const classes = useStyles();
  const days = ['MON', 'TUE'];
  const [selectedDays, setSelectedDays] = useState(new Set<string>());
  const dayshtml = days.map((day) => (
    <AphButton
      key={day}
      variant="contained"
      onClick={() => {
        const newDays = new Set(selectedDays);
        if (selectedDays.has(day)) {
          newDays.delete(day);
        } else {
          newDays.add(day);
        }
        setSelectedDays(newDays);
      }}
      classes={selectedDays.has(day) ? { root: classes.btnActive } : { root: classes.btnInactive }}
    >
      {day}
    </AphButton>
  ));
  return <div>{dayshtml}</div>;
};
