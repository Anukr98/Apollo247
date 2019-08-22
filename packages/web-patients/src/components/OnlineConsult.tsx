import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React, { useState, useRef, useEffect } from 'react';
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
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import { format } from 'date-fns';
import { getIstTimestamp } from 'helpers/dateHelpers';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { usePrevious } from 'hooks/reactCustomHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      overflow: 'hidden',
    },
    consultGroup: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.text.primary,
      padding: 16,
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
      paddingTop: 5,
      paddingBottom: 4,
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
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
    },
    bottomActions: {
      padding: '10px 15px 15px 15px',
      boxShadow: '0 -5px 20px 0 #f7f8f5',
      position: 'relative',
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
      paddingBottom: 30,
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
      display: 'inline-block',
    },
    showTimeSlot: {
      display: 'inline-block',
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
    confirmationColor: {
      color: '#fcb716',
    },
    disabledButton: {
      color: '#00b38e !important',
      opacity: 0.5,
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
  onBookConsult: (popover: boolean) => void;
}

export const OnlineConsult: React.FC<OnlineConsultProps> = (props) => {
  const classes = useStyles();
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<string>('');
  const [timeSelected, setTimeSelected] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [consultNow, setConsultNow] = React.useState(true);
  const [scheduleLater, setScheduleLater] = React.useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const { currentPatient } = useAllCurrentPatients();
  const currentTime = new Date().getTime();
  const autoSlot = getAutoSlot();
  const { doctorDetails } = props;

  let slotAvailableNext = '';

  // console.log('-------', autoSlot);

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

  const apiDateFormat =
    dateSelected === '' ? new Date().toISOString().substring(0, 10) : getYyMmDd(dateSelected);

  const morningTime = getIstTimestamp(new Date(apiDateFormat), '12:01');
  const afternoonTime = getIstTimestamp(new Date(apiDateFormat), '17:01');
  const eveningTime = getIstTimestamp(new Date(apiDateFormat), '21:01');
  const prevDateSelected = usePrevious(dateSelected);

  useEffect(() => {
    if (prevDateSelected !== dateSelected) setTimeSelected('');
  }, [dateSelected, prevDateSelected]);

  // get available slots.
  const {
    data: availableSlotsData,
    loading: availableSlotsLoading,
    error: availableSlotsError,
  } = useQueryWithSkip<GetDoctorAvailableSlots, GetDoctorAvailableSlotsVariables>(
    GET_DOCTOR_AVAILABLE_SLOTS,
    {
      variables: {
        DoctorAvailabilityInput: { doctorId: doctorId, availableDate: apiDateFormat },
      },
      fetchPolicy: 'no-cache',
    }
  );

  // console.log(availableSlotsData);

  // get doctor next availability.
  const { data: nextAvailableSlot, loading: nextAvailableSlotLoading } = useQueryWithSkip<
    GetDoctorNextAvailableSlot,
    GetDoctorNextAvailableSlotVariables
  >(GET_DOCTOR_NEXT_AVAILABILITY, {
    variables: {
      DoctorNextAvailableSlotInput: {
        doctorIds: [doctorId],
        availableDate: format(new Date(), 'yyyy-MM-dd'),
      },
    },
    fetchPolicy: 'no-cache',
  });

  if (availableSlotsLoading || nextAvailableSlotLoading) {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
  }

  if (availableSlotsError) {
    return <div className={classes.noDataAvailable}>Unable to load Available slots.</div>;
  }

  let differenceInMinutes = 0;

  // it must be always one record or we return only first record.
  if (
    nextAvailableSlot &&
    nextAvailableSlot.getDoctorNextAvailableSlot &&
    nextAvailableSlot.getDoctorNextAvailableSlot.doctorAvailalbeSlots
  ) {
    nextAvailableSlot.getDoctorNextAvailableSlot.doctorAvailalbeSlots.forEach((availability) => {
      if (availability && availability.availableSlot !== '') {
        const slotTimeUtc = new Date(
          new Date(`${apiDateFormat} ${availability.availableSlot}:00`).toISOString()
        ).getTime();
        const localTimeOffset = new Date().getTimezoneOffset() * 60000;
        const slotTime = new Date(slotTimeUtc - localTimeOffset).getTime();
        const currentTime = new Date(new Date().toISOString()).getTime();
        if (slotTime > currentTime) {
          const difference = slotTime - currentTime;
          differenceInMinutes = Math.round(difference / 60000);
        }
      } else {
        differenceInMinutes = -1;
      }
    });
  }

  // console.log('diff in minutes.....', differenceInMinutes);

  const availableSlots =
    (availableSlotsData && availableSlotsData.getDoctorAvailableSlots.availableSlots) || [];

  availableSlots.map((slot) => {
    const slotTimeUtc = new Date(new Date(`${apiDateFormat} ${slot}:00`).toISOString()).getTime();
    const localTimeOffset = new Date().getTimezoneOffset() * 60000;
    const slotTime = new Date(slotTimeUtc - localTimeOffset).getTime();
    const currentTime = new Date(new Date().toISOString()).getTime();
    if (slotTime > currentTime) {
      if (slot === autoSlot) {
        slotAvailableNext = autoSlot;
      }
      if (slotTime < morningTime) morningSlots.push(slotTime);
      else if (slotTime >= morningTime && slotTime < afternoonTime) afternoonSlots.push(slotTime);
      else if (slotTime >= afternoonTime && slotTime < eveningTime) eveningSlots.push(slotTime);
      else lateNightSlots.push(slotTime);
    }
  });

  const consultNowAvailable = differenceInMinutes > 0 && differenceInMinutes <= 15;

  let disableSubmit =
    (morningSlots.length === 0 &&
      afternoonSlots.length === 0 &&
      eveningSlots.length === 0 &&
      lateNightSlots.length === 0) ||
    (timeSelected === '' && slotAvailableNext === '');

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'50vh'}>
        <div className={classes.customScrollBar}>
          <div className={classes.consultGroup}>
            {differenceInMinutes > 0 ? (
              <p>
                Dr. {doctorName} is available in {differenceInMinutes} mins!
                <br /> Would you like to consult now or schedule for later?
              </p>
            ) : null}
            <div className={classes.actions}>
              <AphButton
                onClick={(e) => {
                  setShowCalendar(false);
                  setConsultNow(true);
                  setScheduleLater(false);
                }}
                color="secondary"
                className={`${classes.button} ${
                  consultNow && slotAvailableNext !== '' && !scheduleLater && consultNowAvailable
                    ? classes.buttonActive
                    : classes.disabledButton
                } ${consultNow && slotAvailableNext === '' ? classes.disabledButton : ''}`}
                disabled={!(consultNow && slotAvailableNext !== '') || !consultNowAvailable}
              >
                Consult Now
              </AphButton>
              <AphButton
                onClick={(e) => {
                  setShowCalendar(!showCalendar);
                  setScheduleLater(true);
                }}
                color="secondary"
                className={`${classes.button} ${
                  showCalendar || scheduleLater || !consultNowAvailable ? classes.buttonActive : ''
                }`}
              >
                Schedule For Later
              </AphButton>
            </div>
          </div>
          <div
            className={`${classes.consultGroup} ${classes.scheduleCalendar} ${
              showCalendar || scheduleLater || !consultNowAvailable ? classes.showCalendar : ''
            }`}
            ref={calendarRef}
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
              appointmentDateTime: new Date(
                `${apiDateFormat} ${
                  timeSelected !== ''
                    ? timeSelected.padStart(5, '0')
                    : slotAvailableNext.padStart(5, '0')
                }:00`
              ).toISOString(),
              appointmentType: APPOINTMENT_TYPE.ONLINE,
              hospitalId: '',
            },
          }}
          onCompleted={() => {
            disableSubmit = false;
            setMutationLoading(false);
            setIsDialogOpen(true);
          }}
          onError={(errorResponse) => {
            alert(errorResponse);
            disableSubmit = false;
            setMutationLoading(false);
          }}
        >
          {(mutate) => (
            <AphButton
              fullWidth
              color="primary"
              disabled={disableSubmit || mutationLoading || isDialogOpen}
              onClick={() => {
                setMutationLoading(true);
                mutate();
                // console.log(
                //   new Date(
                //     `${apiDateFormat} ${
                //       timeSelected !== ''
                //         ? timeSelected.padStart(5, '0')
                //         : slotAvailableNext.padStart(5, '0')
                //     }:00`
                //   ).toISOString()
                // );
              }}
              className={
                disableSubmit || mutationLoading || isDialogOpen ? classes.buttonDisable : ''
              }
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
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.confirmationColor}>Appointment Confirmation</DialogTitle>
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
              window.location.href = clientRoutes.consultRoom();
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
