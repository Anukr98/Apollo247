import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 20,
      paddingTop: 0,
    },
    sectionHeader: {
      color: theme.palette.secondary.dark,
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      paddingBottom: 8,
      paddingTop: 5,
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
    },
    content: {
      paddingTop: 8,
      display: 'flex',
      marginLeft: -10,
      marginRight: -10,
    },
    timingsRow: {
      width: '50%',
      display: 'flex',
      paddingRight: 20,
      paddingLeft: 20,
    },
    label: {
      fontSize: 12,
      fontWeight: 500,
    },
    rightGroup: {
      paddingLeft: 6,
      flex: 1,
      fontSize: 12,
      color: '#0087ba',
      textTransform: 'uppercase',
    },
    row: {
      display: 'flex',
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
  };
});


export const DoctorTimings: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>Timings</div>
      <div className={classes.content}>
        <div className={classes.timingsRow}>
          <div className={classes.label}>Online:</div>
          <div className={classes.rightGroup}>
            <div className={classes.row}>
              <span>Mon - Fri</span>
              <span>8:00 am - 12:00 pm</span>
            </div>
            <div className={classes.row}>
              <span>Sat</span>
              <span>9:00 am - 11:00 am</span>
            </div>
          </div>
        </div>
        <div className={classes.timingsRow}>
          <div className={classes.label}>Clinic:</div>
          <div className={classes.rightGroup}>
            <div className={classes.row}>
              <span>Mon - Fri</span>
              <span>8:00 am - 12:00 pm</span>
            </div>
            <div className={classes.row}>
              <span>Sat</span>
              <span>9:00 am - 11:00 am</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
