import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { Theme, createMuiTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { usePickerState, Calendar } from '@material-ui/pickers';
import MaterialUiPickersDate from '@material-ui/pickers';
import format from 'date-fns/format';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      overflow: 'hidden',
      '& >div:first-child': {
        '& button': {
          backgroundColor: 'transparent',
          padding: 5,
        },
        '& >div:first-child': {
          borderBottom: '0.5px solid rgba(2,71,91,0.3)',
          paddingBottom: 3,
          margin: '0 -5px 12px -5px',
          '& p': {
            color: '#02475b',
            fontWeight: 500,
          },
        },
        '& >div:last-child': {
          '& span': {
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
          },
        },
      },
    },
    transitionContainer: {
      minHeight: 180,
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
      fontSize: 14,
    },
    body2: {
      fontWeight: 600,
    },
  },
});

interface CustomAPHCalendarProps {
  getDate: (dateSelected: string) => void;
  selectedDate: Date;
}

export const AphCalendar: React.FC<CustomAPHCalendarProps> = (props) => {
  const classes = useStyles({});
  const { getDate, selectedDate } = props;
  const [value, handleDateChange] = useState<MaterialUiPickersDate>(
    selectedDate ? selectedDate : new Date()
  );

  const { pickerProps } = usePickerState(
    {
      value,
      onChange: (date) => {
        handleDateChange(date);
        if (date) getDate(format(date, 'yyyy-MM-dd'));
      },
      autoOk: true,
    },
    {
      getDefaultFormat: () => 'yyyy-MM-dd',
    }
  );

  return (
    <div className={classes.root}>
      <ThemeProvider theme={defaultMaterialTheme}>
        <Calendar
          leftArrowIcon={<img src={require('images/ic_arrow_left.svg')} alt="" />}
          rightArrowIcon={<img src={require('images/ic_arrow_right.svg')} alt="" />}
          classes={{ transitionContainer: classes.transitionContainer }}
          onChange={(date) => {
            handleDateChange(date);
          }}
          minDate={new Date()}
          {...pickerProps}
        />
      </ThemeProvider>
    </div>
  );
};
