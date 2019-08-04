import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { DatePicker, MuiPickersUtilsProvider, MaterialUiPickersDate } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

export interface MonthListProps {
  date?: Date;
  className?: string;
  onChange?: (date: MaterialUiPickersDate) => void;
}
const useStyles = makeStyles({
  monthList: {
    width: '15%',
    display: 'inline-block',
    textAlign: 'center',
    padding: '9px 16px 16px 16px',
    marginLeft: '-38px',
    borderRadius: '10px 0 0 10px',
    backgroundColor: '#f7f7f7',
  },
  monthListPopup: {
    color: '#02475b',
    fontSize: 21,
    fontWeight: 600,
    '& div': {
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    '&:after': {
      borderBottom: 'none',
    },
    '&:before': {
      borderBottom: 'none',
      transform: 'scaleX(0)',
    },
    '& svg': {
      color: '#02475b',
    },
    '& button': {
      color: '#02475b',
      right: 10,
    },
  },
  monthListItem: {
    color: '#02475b',
  },
  container: {
    display: 'flex',
    'flex-wrap': 'nowrap',
    'justify-content': 'space-between',
  },
  monthPopup: {
    fontSize: 21,
    display: 'inline-block',
    width: '15%',
  },
  monthArrow: {
    width: 28,
  },
});
export const MonthList: React.FC<MonthListProps> = ({ date, onChange }) => {
  const classes = useStyles();
  const [selectedDate, handleDateChange] = useState<MaterialUiPickersDate>(new Date());

  useEffect(() => {
    handleDateChange(date as MaterialUiPickersDate);
  }, [date]);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div className={classes.monthList}>
        <DatePicker
          disableToolbar
          inputVariant="standard"
          autoOk
          format="MMM"
          variant="inline"
          value={selectedDate}
          onChange={(date) => {
            handleDateChange(date);

            if (onChange) {
              onChange(date);
            }
          }}
        />
      </div>
    </MuiPickersUtilsProvider>
  );
};
