import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { Theme, createMuiTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { usePickerState, Calendar, MaterialUiPickersDate } from '@material-ui/pickers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      '& button': {
        backgroundColor: 'transparent',
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
      fontSize: 14,
    },
    body2: {
      fontWeight: 600,
    },
  },
});

export const AphCalendar: React.FC = (props) => {
  const classes = useStyles();
  const [value, handleDateChange1] = useState<MaterialUiPickersDate>(new Date());
  const { pickerProps } = usePickerState(
    { value, onChange: handleDateChange1 },
    {
      getDefaultFormat: () => 'MM/dd/yyyy',
    }
  );
  return (
    <div className={classes.root}>
      <ThemeProvider theme={defaultMaterialTheme}>
        <Calendar
          leftArrowIcon={<img src={require('images/ic_arrow_left.svg')} alt="" />}
          rightArrowIcon={<img src={require('images/ic_arrow_right.svg')} alt="" />}
          {...pickerProps}
        />
      </ThemeProvider>
    </div>
  );
};
