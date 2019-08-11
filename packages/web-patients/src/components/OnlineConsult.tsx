import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';
import Scrollbars from 'react-custom-scrollbars';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import {
  GetDoctorAvailableSlots,
  GetDoctorAvailableSlotsVariables,
} from 'graphql/types/GetDoctorAvailableSlots';
import { GET_DOCTOR_AVAILABLE_SLOTS, BOOK_APPOINTMENT } from 'graphql/doctors';
import { getTime } from 'date-fns/esm';
import { Mutation } from 'react-apollo';
import { BookAppointment, BookAppointmentVariables } from 'graphql/types/BookAppointment';
import { APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { clientRoutes } from 'helpers/clientRoutes';
import { Redirect } from 'react-router';

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
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      paddingTop: 15,
      paddingBottom: 5,
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
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
    noDataAvailable: {
      padding: 20,
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
    },
  };
});

const getYyMmDd = (ddmmyyyy: string) => {
  const splitString = ddmmyyyy.split('/');
  return `${splitString[2]}-${splitString[1]}-${splitString[0]}`;
};

const getAutoSlot = () => {
  const nearestFiveMinutes = Math.ceil(new Date().getMinutes() / 5) * 5;

  let nearestHours = new Date().getHours();
  let nearestFifteenMinutes = 0;

  if (nearestFiveMinutes > 5 && nearestFiveMinutes <= 15) nearestFifteenMinutes = 15;
  if (nearestFiveMinutes > 15 && nearestFiveMinutes <= 30) nearestFifteenMinutes = 30;
  if (nearestFiveMinutes > 30 && nearestFiveMinutes <= 45) nearestFifteenMinutes = 45;
  if (nearestFiveMinutes > 45 && nearestFifteenMinutes <= 60) {
    nearestFifteenMinutes = 0;
    nearestHours++;
  }
  return `${nearestHours}:${nearestFifteenMinutes > 9 ? nearestFifteenMinutes : '00'}`;
};

interface OnlineConsultProps {
  doctorDetails: DoctorDetails;
}

export const OnlineConsult: React.FC<OnlineConsultProps> = (props) => {
  const classes = useStyles();
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<string>('');
  const [timeSelected, setTimeSelected] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [mutationSuccess, setMutationSuccess] = React.useState(false);
  const [consultNow, setConsultNow] = React.useState(true);

  const { currentPatient } = useAllCurrentPatients();

  const currentTime = new Date().getTime();
  const autoSlot = getAutoSlot();
  let slotAvailableNext = '';

  const { doctorDetails } = props;

  const doctorName =
    doctorDetails &&
    doctorDetails.getDoctorDetailsById &&
    doctorDetails.getDoctorDetailsById.firstName
      ? doctorDetails.getDoctorDetailsById.firstName
      : '';

  const onlineConsultationFees =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.onlineConsultationFees
      : '';

  const morningSlots: number[] = [],
    afternoonSlots: number[] = [],
    eveningSlots: number[] = [],
    lateNightSlots: number[] = [];

  const doctorId =
    doctorDetails && doctorDetails.getDoctorDetailsById && doctorDetails.getDoctorDetailsById.id
      ? doctorDetails.getDoctorDetailsById.id
      : '';

  // console.log(
  //   'dateSelected......',
  //   dateSelected,
  //   dateSelected !== '' ? getYyMmDd(dateSelected) : ''
  // );
  // console.log(dateSelected, timeSelected);

  const apiDateFormat =
    dateSelected === '' ? new Date().toISOString().substring(0, 10) : getYyMmDd(dateSelected);

  const morningTime = getTimestamp(new Date(apiDateFormat), '12:00');
  const afternoonTime = getTimestamp(new Date(apiDateFormat), '17:00');
  const eveningTime = getTimestamp(new Date(apiDateFormat), '21:00');

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorAvailableSlots,
    GetDoctorAvailableSlotsVariables
  >(GET_DOCTOR_AVAILABLE_SLOTS, {
    variables: {
      DoctorAvailabilityInput: { doctorId: doctorId, availableDate: apiDateFormat },
    },
  });

  if (loading) {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className={classes.noDataAvailable}>Unable to load Available slots.</div>;
  }

  const availableSlots = (data && data.getDoctorAvailableSlots.availableSlots) || [];
  availableSlots.map((slot) => {
    const slotTime = getTimestamp(new Date(apiDateFormat), slot);
    if (slot === autoSlot) slotAvailableNext = autoSlot;
    // console.log(slot, autoSlot);
    if (slotTime > currentTime) {
      if (slotTime < morningTime) morningSlots.push(slotTime);
      else if (slotTime >= morningTime && slotTime < afternoonTime) afternoonSlots.push(slotTime);
      else if (slotTime >= afternoonTime && slotTime < eveningTime) eveningSlots.push(slotTime);
      else lateNightSlots.push(slotTime);
    }
  });

  // console.log('next available slots....', slotAvailableNext, autoSlot);

  const disableSubmit =
    ((morningSlots.length > 0 ||
      afternoonSlots.length > 0 ||
      eveningSlots.length > 0 ||
      lateNightSlots.length > 0) &&
      timeSelected !== '') ||
    (consultNow && (slotAvailableNext !== '' || timeSelected !== ''))
      ? false
      : true;

  if (mutationSuccess) {
    return <Redirect to={clientRoutes.consultRoom()} />;
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
                  setConsultNow(false);
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
          ) : (
            <div className={classes.noSlotsAvailable}>
              Oops! No slots are available with Dr. {doctorName} :(
            </div>
          )}
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <Mutation<BookAppointment, BookAppointmentVariables>
          mutation={BOOK_APPOINTMENT}
          variables={{
            bookAppointment: {
              patientId: currentPatient ? currentPatient.id : '',
              doctorId: doctorId,
              appointmentDateTime: `${apiDateFormat}T${
                timeSelected !== ''
                  ? timeSelected.padStart(5, '0')
                  : slotAvailableNext.padStart(5, '0')
              }:00Z`,
              appointmentType: APPOINTMENT_TYPE.ONLINE,
              hospitalId: '',
            },
          }}
          onCompleted={() => {
            setMutationLoading(false);
            setIsDialogOpen(true);
          }}
          onError={(error) => {
            alert(error);
          }}
        >
          {(mutate) => (
            <AphButton
              fullWidth
              color="primary"
              disabled={disableSubmit}
              onClick={(e) => {
                setMutationLoading(true);
                mutate();
              }}
            >
              {mutationLoading ? (
                <CircularProgress size={22} color="secondary" />
              ) : (
                `PAY Rs. ${onlineConsultationFees}`
              )}
            </AphButton>
          )}
        </Mutation>
      </div>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Appointment Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your appointment has been successfully booked with Dr. {doctorName}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setIsDialogOpen(false);
              setMutationSuccess(true);
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
