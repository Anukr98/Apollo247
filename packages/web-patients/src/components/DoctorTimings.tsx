import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import moment from 'moment';
import { GetDoctorDetailsById_getDoctorDetailsById_consultHours as ConsultHours } from 'graphql/types/GetDoctorDetailsById';
import { WeekDay, ConsultMode, ConsultType } from 'graphql/types/globalTypes';
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
    timingList: {
      listStyle: 'none',
      padding: '0 10px',
      margin: 0,
      '& li': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2px 0',
        fontWeight: 500,
        color: '#0087ba',
      },
    },
    hideDay: {
      visibility: 'hidden',
    },
  };
});
interface DoctorTimingsProps {
  doctorTimings: (ConsultHours | null)[] | null;
}

export const DoctorTimings: React.FC<DoctorTimingsProps> = (props) => {
  const classes = useStyles({});
  const { doctorTimings } = props;
  const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
    2,
    '0'
  )}-${new Date().getDate()}`;
  const consultModeOnline: ConsultHours[] = [];
  const consultModePhysical: ConsultHours[] = [];
  const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const sortDays = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
  };
  doctorTimings.map((item: any) => {
    if (item.consultMode === 'PHYSICAL' || item.consultMode === 'BOTH') {
      consultModePhysical.push(item);
    }
    if (item.consultMode === 'ONLINE' || item.consultMode === 'BOTH') {
      consultModeOnline.push(item);
    }
  });

  consultModeOnline.length > 0 &&
    weekDays.forEach((weekDay: WeekDay) => {
      const found = consultModeOnline.some((key) => key.actualDay === weekDay);
      !found &&
        consultModeOnline.push({
          actualDay: weekDay,
          consultMode: ConsultMode.BOTH,
          consultType: ConsultType.FIXED,
          endTime: '',
          id: '',
          startTime: '',
          weekDay: WeekDay.SUNDAY,
          isActive: true,
        } as ConsultHours);
    });

  consultModePhysical.length > 0 &&
    weekDays.forEach((weekDay: WeekDay) => {
      const found = consultModePhysical.some((key) => key.actualDay === weekDay);
      !found &&
        consultModePhysical.push({
          actualDay: weekDay,
          consultMode: ConsultMode.BOTH,
          consultType: ConsultType.FIXED,
          endTime: '',
          id: '',
          startTime: '',
          weekDay: WeekDay.SUNDAY,
          isActive: true,
        } as ConsultHours);
    });

  const sortedOnlineList =
    consultModeOnline.length > 0 &&
    consultModeOnline.sort((a, b) => {
      const day1 = a.actualDay;
      const day2 = b.actualDay;
      return sortDays[day1] - sortDays[day2];
    });

  const sortedPhysicalList =
    consultModePhysical.length > 0 &&
    consultModePhysical.sort((a, b) => {
      const day1 = a.actualDay;
      const day2 = b.actualDay;
      return sortDays[day1] - sortDays[day2];
    });

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>Timings</div>
      <div className={classes.content}>
        <div className={classes.timingsRow}>
          {consultModeOnline.length > 0 && <div className={classes.label}>Online:</div>}
          <div className={classes.rightGroup}>
            <ul className={classes.timingList}>
              {sortedOnlineList &&
                sortedOnlineList.length > 0 &&
                sortedOnlineList.map((item: any, index: number) => {
                  const actualDay = item.actualDay;
                  const weeDaysStartTime = moment(`${today} ${item.startTime}`)
                    .add(5.5, 'hours')
                    .local()
                    .format('hh:mm a');
                  const weeDaysEndTime = moment(`${today} ${item.endTime}`)
                    .add(5.5, 'hours')
                    .local()
                    .format('hh:mm a');
                  return (
                    <li>
                      <span
                        className={
                          index > 0 && sortedOnlineList[index - 1].actualDay === item.actualDay
                            ? classes.hideDay
                            : ''
                        }
                      >
                        {actualDay}
                      </span>
                      <span>
                        {item.startTime.length > 0
                          ? `${weeDaysStartTime} - ${weeDaysEndTime}`
                          : 'No slots available'}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <div className={classes.timingsRow}>
          {consultModePhysical.length > 0 && <div className={classes.label}>Clinic:</div>}
          <div className={classes.rightGroup}>
            {sortedPhysicalList &&
              sortedPhysicalList.length > 0 &&
              sortedPhysicalList.length > 0 &&
              sortedPhysicalList.map((item: any, index: number) => {
                const actualDay = item.actualDay;
                const weeDaysStartTime = moment(`${today} ${item.startTime}`)
                  .add(5.5, 'hours')
                  .local()
                  .format('hh:mm a');
                const weeDaysEndTime = moment(`${today} ${item.endTime}`)
                  .add(5.5, 'hours')
                  .local()
                  .format('hh:mm a');
                return (
                  <ul className={classes.timingList}>
                    <li>
                      <span
                        className={
                          index > 0 && sortedPhysicalList[index - 1].actualDay === item.actualDay
                            ? classes.hideDay
                            : ''
                        }
                      >
                        {actualDay}
                      </span>
                      <span>
                        {item.startTime.length > 0
                          ? `${weeDaysStartTime} - ${weeDaysEndTime}`
                          : 'No slots available'}
                      </span>
                    </li>
                  </ul>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
