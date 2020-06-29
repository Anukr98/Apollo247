import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import moment from 'moment';
import { GetDoctorDetailsById_getDoctorDetailsById_consultHours } from 'graphql/types/GetDoctorDetailsById';
const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 20,
      paddingTop: 0,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 20,
      },
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
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        marginLeft: -10,
        marginRight: -10,
      },
    },
    timingsRow: {
      paddingBottom: 16,
      [theme.breakpoints.up('sm')]: {
        width: '50%',
        display: 'flex',
        paddingRight: 20,
        paddingLeft: 20,
        paddingBottom: 0,
      },
      '&:last-child': {
        paddingBottom: 0,
      },
    },
    label: {
      fontSize: 12,
      fontWeight: 500,
    },
    rightGroup: {
      flex: 1,
      fontSize: 12,
      color: '#0087ba',
      textTransform: 'uppercase',
      [theme.breakpoints.up('sm')]: {
        paddingLeft: 6,
      },
    },
    row: {
      display: 'flex',
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
  };
});
interface DoctorTimingsProps {
  doctorTimings: (GetDoctorDetailsById_getDoctorDetailsById_consultHours | null)[] | null;
}

export const DoctorTimings: React.FC<DoctorTimingsProps> = (props) => {
  const classes = useStyles({});
  const { doctorTimings } = props;
  const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
    2,
    '0'
  )}-${new Date().getDate()}`;

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>Timings</div>
      <div className={classes.content}>
        <div className={classes.timingsRow}>
          <div className={classes.label}>Online:</div>
          <div className={classes.rightGroup}>
            {doctorTimings.map((item: any) => {
              const actualDay = item.actualDay;
              const weeDaysStartTime = moment
                .utc(`${today} ${item.startTime}`)
                .local()
                .format('hh:mm a');
              const weeDaysEndTime = moment
                .utc(`${today} ${item.endTime}`)
                .local()
                .format('hh:mm a');
              return (
                (item.consultMode === 'ONLINE' || item.consultMode === 'BOTH') && (
                  <div className={classes.row}>
                    <span>{actualDay}</span>
                    <span>{`${weeDaysStartTime}-${weeDaysEndTime}`}</span>
                  </div>
                )
              );
            })}
          </div>
        </div>
        <div className={classes.timingsRow}>
          <div className={classes.label}>Clinic:</div>
          <div className={classes.rightGroup}>
            {doctorTimings.map((item: any) => {
              const actualDay = item.actualDay;
              const weeDaysStartTime = moment
                .utc(`${today} ${item.startTime}`)
                .local()
                .format('hh:mm a');
              const weeDaysEndTime = moment
                .utc(`${today} ${item.endTime}`)
                .local()
                .format('hh:mm a');
              return (
                (item.consultMode === 'PHYSICAL' || item.consultMode === 'BOTH') && (
                  <div className={classes.row}>
                    <span>{actualDay}</span>
                    <span>{`${weeDaysStartTime}-${weeDaysEndTime}`}</span>
                  </div>
                )
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
