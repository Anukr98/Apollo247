import React, { useState } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { Week as WeekView } from 'components/Calendar/Views/Week';
import { Month as MonthView } from 'components/Calendar/Views/Month';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 68,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },

    labelRoot: {
      width: '100%',
    },
    iconLabel: {
      fontSize: 12,
      color: '#67919d',
      paddingTop: 10,
      textTransform: 'uppercase',
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },

    tabHeading: {
      padding: '30px 40px 20px 40px',
      backgroundColor: theme.palette.secondary.contrastText,
      '& h1': {
        display: 'flex',
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 28,
        [theme.breakpoints.down('xs')]: {
          fontSize: 20,
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        margin: 0,
        [theme.breakpoints.down('xs')]: {
          fontSize: 15,
        },
      },
    },
  };
});

export const Calendar: React.FC = () => {
  const classes = useStyles();
  const [viewSelection, setViewSelection] = useState<string>('day');

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.tabHeading}>
          <Typography variant="h1">hello dr.rao :)</Typography>
          <p>here’s your schedule for today</p>
        </div>
        <div>
          <div>
            <ToggleButtonGroup exclusive value={viewSelection}>
              <ToggleButton value="day" onClick={() => setViewSelection('day')}>
                Day
              </ToggleButton>
              <ToggleButton value="month" onClick={() => setViewSelection('month')}>
                Month
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          {viewSelection === 'day' && <WeekView />}
          {viewSelection === 'month' && <MonthView />}
        </div>
      </div>
    </div>
  );
};
