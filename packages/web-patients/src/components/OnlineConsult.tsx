import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { AphButton } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';
import Scrollbars from 'react-custom-scrollbars';
import { useQueryWithSkip } from 'hooks/apolloHooks';

import { GetDoctorProfileById } from 'graphql/types/GetDoctorProfileById';
import {
  GetDoctorAvailableSlots,
  GetDoctorAvailableSlotsVariables,
} from 'graphql/types/GetDoctorAvailableSlots';
import { GET_DOCTOR_AVAILABLE_SLOTS } from 'graphql/doctors';
import { getTime } from 'date-fns/esm';

const getTimestamp = (today: Date, slotTime: string) => {
  const hhmm = slotTime.split(':');
  return getTime(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hhmm[0], 10),
      parseInt(hhmm[1], 10),
      0,
      0
    )
  );
};

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    consultGroup: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.text.primary,
      padding: 15,
      marginTop: 10,
      marginBottom: 10,
      display: 'inline-block',
      width: '100%',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.35,
      color: theme.palette.secondary.light,
      '& p': {
        marginTop: 0,
      },
    },
    actions: {
      paddingTop: 10,
      paddingBottom: 10,
      marginLeft: -7,
      marginRight: -8,
    },
    button: {
      fontSize: 16,
      fontWeight: 500,
      marginLeft: 8,
      marginRight: 8,
      textTransform: 'none',
      borderRadius: 10,
      paddingLeft: 10,
      paddingRight: 10,
      letterSpacing: 'normal',
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
    bottomActions: {
      padding: '30px 15px 15px 15px',
      '& button': {
        borderRadius: 10,
        textTransform: 'none',
      },
    },
    customScrollBar: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    timeSlots: {
      paddingTop: 0,
    },
    scheduleCalendar: {
      display: 'none',
    },
    scheduleTimeSlots: {
      display: 'none',
    },
    showCalendar: {
      display: 'block',
    },
    showTimeSlot: {
      display: 'block',
    },
  };
});

const getYyMmDd = (ddmmyyyy: string) => {
  const splitString = ddmmyyyy.split('/');
  return `${splitString[2]}-${splitString[1]}-${splitString[0]}`;
};

interface OnlineConsultProps {
  doctorDetails: GetDoctorProfileById;
}

export const OnlineConsult: React.FC<OnlineConsultProps> = (props) => {
  const classes = useStyles();
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [timeSelected, setTimeSelected] = useState<string>();
  const [dateSelected, setDateSelected] = useState<string>('');
  const today = new Date();
  const currentTime = new Date().getTime();

  const { doctorDetails } = props;

  const doctorName =
    doctorDetails &&
    doctorDetails.getDoctorProfileById &&
    doctorDetails.getDoctorProfileById.profile
      ? doctorDetails.getDoctorProfileById.profile.firstName
      : '';

  const onlineConsultationFees =
    doctorDetails &&
    doctorDetails.getDoctorProfileById &&
    doctorDetails.getDoctorProfileById.profile
      ? doctorDetails.getDoctorProfileById.profile.onlineConsultationFees
      : '';

  const morningSlots: number[] = [],
    afternoonSlots: number[] = [],
    eveningSlots: number[] = [],
    lateNightSlots: number[] = [];

  const morningTime = getTimestamp(new Date(), '12:00');
  const afternoonTime = getTimestamp(new Date(), '17:00');
  const eveningTime = getTimestamp(new Date(), '21:00');

  const doctorId = 'c91c5155-ce3a-488b-8865-654588fef776';

  console.log(
    'dateSelected......',
    dateSelected,
    dateSelected !== '' ? getYyMmDd(dateSelected) : ''
  );

  const apiDateFormat =
    dateSelected === '' ? new Date().toISOString().substring(0, 10) : getYyMmDd(dateSelected);

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorAvailableSlots,
    GetDoctorAvailableSlotsVariables
  >(GET_DOCTOR_AVAILABLE_SLOTS, {
    variables: {
      DoctorAvailabilityInput: { doctorId: doctorId, availableDate: apiDateFormat },
    },
  });

  // console.log(data);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Unable to load Available slots.</div>;
  }

  if (data) {
    const availableSlots = data.getDoctorAvailableSlots.availableSlots || [];
    availableSlots.map((slot) => {
      const slotTime = getTimestamp(today, slot);
      if (slotTime > currentTime) {
        if (slotTime < morningTime) morningSlots.push(slotTime);
        else if (slotTime > morningTime && slotTime <= afternoonTime) afternoonSlots.push(slotTime);
        else if (slotTime > afternoonTime && slotTime <= eveningTime) eveningSlots.push(slotTime);
        else lateNightSlots.push(slotTime);
      }
    });
  }

  // console.log(morningSlots, afternoonSlots, eveningSlots, lateNightSlots);

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'50vh'}>
        <div className={classes.customScrollBar}>
          <div className={classes.consultGroup}>
            <p>
              Dr. {doctorName} is available in 15mins!
              <br /> Would you like to consult now or schedule for later?
            </p>
            <div className={classes.actions}>
              <AphButton
                onClick={(e) => {
                  setShowCalendar(false);
                }}
                color="secondary"
                className={`${classes.button} ${!showCalendar ? classes.buttonActive : ''}`}
              >
                Consult Now
              </AphButton>
              <AphButton
                onClick={(e) => {
                  setShowCalendar(!showCalendar);
                }}
                color="secondary"
                className={`${classes.button} ${showCalendar ? classes.buttonActive : ''}`}
              >
                Schedule For Later
              </AphButton>
            </div>
          </div>
          <div
            className={`${classes.consultGroup} ${classes.scheduleCalendar} ${
              showCalendar ? classes.showCalendar : ''
            }`}
          >
            <AphCalendar
              getDate={(dateSelected: string) => setDateSelected(dateSelected)}
              selectedDate={new Date(apiDateFormat)}
            />
          </div>
          {morningSlots.length > 0 ||
          afternoonSlots.length > 0 ||
          eveningSlots.length > 0 ||
          lateNightSlots.length > 0 ? (
            <div
              className={`${classes.consultGroup} ${classes.scheduleTimeSlots} ${
                showCalendar ? classes.showTimeSlot : ''
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
          ) : null}
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton fullWidth color="primary">
          PAY Rs. {onlineConsultationFees}
        </AphButton>
      </div>
    </div>
  );
};
