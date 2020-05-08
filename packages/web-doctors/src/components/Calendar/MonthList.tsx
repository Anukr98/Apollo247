import React, { useState, useEffect } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { DatePicker, MuiPickersUtilsProvider, MaterialUiPickersDate } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Theme, createMuiTheme } from '@material-ui/core';

export interface MonthListProps {
  date?: Date;
  className?: string;
  onChange?: (date: MaterialUiPickersDate) => void;
}
const useStyles = makeStyles((theme: Theme) => {
  return {
    monthList: {
      width: '15%',
      display: 'inline-block',
      textAlign: 'center',
      padding: '21px 16px',
      verticalAlign: 'top',
      marginLeft: '-38px',
      borderRadius: '10px 0 0 10px',
      backgroundColor: '#f7f7f7',
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        top: -72,
        padding: '0 10px',
        width: '25%',
        left: 36,
        backgroundColor: 'transparent',
      },
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
    datepicker: {
      '& div': {
        '&:before': {
          borderBottom: '#f7f7f7 !important',
        },
        '&:after': {
          borderBottom: '#f7f7f7 !important',
        },
      },

      '& input': {
        color: '#02475b',
        fontSize: 18,
        fontWeight: 600,
        borderBottom: 'none',
        '&:hover': {
          borderBottom: 'none',
          '&:before': {
            borderBottom: 'none',
          },
        },
        '&:before': {
          borderBottom: 'none',
        },
        '&:after': {
          borderBottom: 'none',
        },
      },
    },
    datePickerOpen: {
      '& input': {
        background: `url(${require('images/ic_cal_up.svg')}) no-repeat right center`,
        cursor: 'pointer',
        backgroundSize: 30,
      },
    },
    datePickerClose: {
      '& input': {
        'background-image': `url(${require('images/ic_cal_down.svg')})`,
        backgroundSize: 30,
      },
    },
  };
});

const defaultMaterialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#00b38e',
    },
    text: {
      primary: '#00b38e',
    },
    action: {
      selected: '#fff',
    },
  },
  typography: {
    fontWeightMedium: 600,
    htmlFontSize: 14,
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body1: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 700,
    },
    body2: {
      fontWeight: 600,
    },
    caption: {
      fontSize: 12,
      color: '#80a3ad !important',
      fontWeight: 600,
    },
  },
});

export const MonthList: React.FC<MonthListProps> = ({ date, onChange }) => {
  const classes = useStyles({});
  const [selectedDate, handleDateChange] = useState<MaterialUiPickersDate>(new Date());
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    handleDateChange(date as MaterialUiPickersDate);
  }, [date]);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div className={classes.monthList}>
        <ThemeProvider theme={defaultMaterialTheme}>
          <DatePicker
            disableToolbar
            inputVariant="standard"
            autoOk
            format="MMM"
            variant="inline"
            className={classes.datepicker}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            value={selectedDate}
            InputProps={{
              className: `${classes.datePickerOpen} ${isOpen ? '' : classes.datePickerClose}`,
            }}
            onChange={(date) => {
              handleDateChange(date);

              if (onChange) {
                onChange(date);
              }
            }}
          />
        </ThemeProvider>
      </div>
    </MuiPickersUtilsProvider>
  );
};
