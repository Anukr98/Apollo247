import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { DayTimeSlots } from 'components/DayTimeSlots';
import { getIstTimestamp } from 'helpers/dateHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consultGroup: {
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      padding: 16,
      display: 'inline-block',
      width: '100%',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.35,
      color: theme.palette.secondary.light,
      borderRadius: 10,
      '& p': {
        marginTop: 0,
      },
    },
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      padding: 6,
    },
    scheduleTimeSlots: {
      // display: 'none',
      padding: 10,
      minHeight: 278,
      marginBottom: 0,
    },
    showTimeSlot: {
      display: 'inline-block',
      paddingTop: 0,
    },
  };
});

interface ShowSlotsProps {
  availableSlots: string[] | null;
  apiDateFormat: string;
  setTimeSelected: (timeSelected: string) => void;
  doctorName: string;
  showCalendar: boolean;
  scheduleLater: boolean;
  consultNowAvailable: boolean;
}

export const ShowSlots: React.FC<ShowSlotsProps> = (props) => {
  const classes = useStyles({});
  const {
    availableSlots,
    apiDateFormat,
    setTimeSelected,
    doctorName,
    showCalendar,
    scheduleLater,
    consultNowAvailable,
  } = props;
  const morningSlots: number[] = [],
    afternoonSlots: number[] = [],
    eveningSlots: number[] = [],
    lateNightSlots: number[] = [];
  const morningStartTime = getIstTimestamp(new Date(apiDateFormat), '06:01');
  const morningTime = getIstTimestamp(new Date(apiDateFormat), '12:01');
  const afternoonTime = getIstTimestamp(new Date(apiDateFormat), '17:01');
  const eveningTime = getIstTimestamp(new Date(apiDateFormat), '21:01');

  availableSlots &&
    availableSlots.map((slot) => {
      const slotTime = new Date(slot).getTime();
      const currentTime = new Date(new Date().toISOString()).getTime();
      if (slotTime > currentTime) {
        if (slotTime < morningTime && slotTime > morningStartTime) morningSlots.push(slotTime);
        else if (slotTime >= morningTime && slotTime < afternoonTime) afternoonSlots.push(slotTime);
        else if (slotTime >= afternoonTime && slotTime < eveningTime) eveningSlots.push(slotTime);
        else if (slotTime >= eveningTime) lateNightSlots.push(slotTime);
      }
    });

  return morningSlots.length > 0 ||
    afternoonSlots.length > 0 ||
    eveningSlots.length > 0 ||
    lateNightSlots.length > 0 ? (
    <div
      className={`${classes.consultGroup} ${classes.scheduleTimeSlots} ${
        showCalendar || scheduleLater || !consultNowAvailable ? classes.showTimeSlot : ''
      }`}
    >
      <DayTimeSlots
        morningSlots={morningSlots}
        afternoonSlots={afternoonSlots}
        eveningSlots={eveningSlots}
        latenightSlots={lateNightSlots}
        doctorName={doctorName}
        timeSelected={(timeSelected) => setTimeSelected(timeSelected)}
      />
    </div>
  ) : (
    <div className={classes.consultGroup}>
      <div className={classes.noSlotsAvailable}>
        Oops! No slots available with Dr. {doctorName} :(
      </div>
    </div>
  );
};
