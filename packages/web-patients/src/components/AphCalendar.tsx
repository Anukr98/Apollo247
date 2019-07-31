import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { Theme, createMuiTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { usePickerState, Calendar, MaterialUiPickersDate } from '@material-ui/pickers';
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
          borderBottom: '1px solid rgba(0,0,0,0.2)',
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
}

export const AphCalendar: React.FC<CustomAPHCalendarProps> = (props) => {
  const classes = useStyles();
  const [value, handleDateChange] = useState<MaterialUiPickersDate>(new Date());
  const { getDate } = props;

  const { pickerProps } = usePickerState(
    {
      value,
      onChange: (date) => {
        handleDateChange(date);
        if (date) getDate(format(date, 'dd/MM/yyyy'));
      },
      autoOk: true,
    },
    {
      getDefaultFormat: () => 'dd/MM/yyyy',
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
