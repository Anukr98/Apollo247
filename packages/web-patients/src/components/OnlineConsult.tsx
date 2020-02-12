import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Grid } from '@material-ui/core';
import React, { useState, useRef, useEffect } from 'react';
import { AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
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
import { useMutation } from 'react-apollo-hooks';
import { APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import { format } from 'date-fns';
import { getIstTimestamp } from 'helpers/dateHelpers';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { usePrevious } from 'hooks/reactCustomHooks';
import { TRANSFER_INITIATED_TYPE, BookRescheduleAppointmentInput } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      overflow: 'hidden',
    },
    viewButton: {
      width: 'calc(50% - 5px)',
      marginLeft: 5,
      display: 'block',
      fontSize: 13,
      backgroundColor: '#fcb716',
      padding: 10,
      height: 40,
      borderRadius: 10,
      marginRight: 0,
      '&:hover': {
        backgroundColor: '#fcb716 !important',
      },
    },
    consultGroup: {
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
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
      borderRadius: 10,
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
      position: 'relative',
      textAlign: 'center',
      '& button': {
        borderRadius: 10,
        textTransform: 'none',
        minWidth: 288,
      },
    },
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      padding: 6,
    },
    customScrollBar: {
      paddingTop: 10,
      paddingLeft: 20,
      paddingRight: 20,
    },
    timeSlots: {
      paddingTop: 0,
    },
    scheduleCalendar: {
      // display: 'none',
      padding: 10,
      minHeight: 278,
      marginBottom: 0,
    },
    scheduleTimeSlots: {
      // display: 'none',
      padding: 10,
      minHeight: 278,
      marginBottom: 0,
    },
    showCalendar: {
      display: 'inline-block',
    },
    showTimeSlot: {
      display: 'inline-block',
      paddingTop: 0,
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
    disabledButton: {
      color: '#00b38e !important',
      opacity: 0.5,
    },
    dialogBody: {
      padding: 20,
      color: '#01475b',
      fontWeight: 500,
      fontSize: 14,
      '& span': {
        fontWeight: 'bold',
      },
    },
    dialogActions: {
      padding: 16,
      textAlign: 'center',
      '& button': {
        minWidth: 288,
      },
    },
  };
});

const getYyMmDd = (ddmmyyyy: string) => {
  const splitString = ddmmyyyy.split('/');
  return `${splitString[2]}-${splitString[1]}-${splitString[0]}`;
};

// const getAutoSlot = () => {
//   const nearestFiveMinutes = Math.ceil(new Date().getMinutes() / 5) * 5;

//   let nearestHours = new Date().getHours();
//   let nearestFifteenMinutes = 0;

//   if (nearestFiveMinutes > 5 && nearestFiveMinutes <= 15) nearestFifteenMinutes = 15;
//   if (nearestFiveMinutes > 15 && nearestFiveMinutes <= 30) nearestFifteenMinutes = 30;
//   if (nearestFiveMinutes > 30 && nearestFiveMinutes <= 45) nearestFifteenMinutes = 45;
//   if (nearestFiveMinutes > 45 && nearestFifteenMinutes <= 60) {
//     nearestFifteenMinutes = 0;
//     nearestHours++;
//   }
//   return `${nearestHours}:${nearestFifteenMinutes > 9 ? nearestFifteenMinutes : '00'}`;
// };

interface OnlineConsultProps {
  setIsPopoverOpen: (openPopup: boolean) => void;
  doctorDetails: DoctorDetails;
  onBookConsult: (popover: boolean) => void;
  isRescheduleConsult: boolean;
  appointmentId?: string;
  rescheduleAPI?: (bookRescheduleInput: BookRescheduleAppointmentInput) => void;
}

export const OnlineConsult: React.FC<OnlineConsultProps> = (props) => {
  const classes = useStyles({});
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<string>('');
  const [timeSelected, setTimeSelected] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [consultNow, setConsultNow] = React.useState(true);
  const [scheduleLater, setScheduleLater] = React.useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const { currentPatient } = useAllCurrentPatients();
  // const currentTime = new Date().getTime();
  // const autoSlot = getAutoSlot();

  const { doctorDetails, setIsPopoverOpen } = props;

  let slotAvailableNext = '';
  let autoSlot = '';

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

  const hospitalId =
    doctorDetails &&
    doctorDetails.getDoctorDetailsById &&
    doctorDetails.getDoctorDetailsById.doctorHospital[0] &&
    doctorDetails.getDoctorDetailsById.doctorHospital[0].facility
      ? doctorDetails.getDoctorDetailsById.doctorHospital[0].facility.id
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

  const morningStartTime = getIstTimestamp(new Date(apiDateFormat), '06:01');
  const morningTime = getIstTimestamp(new Date(apiDateFormat), '12:01');
  const afternoonTime = getIstTimestamp(new Date(apiDateFormat), '17:01');
  const eveningTime = getIstTimestamp(new Date(apiDateFormat), '21:01');
  const prevDateSelected = usePrevious(dateSelected);
  let isToday =false;

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
        DoctorAvailabilityInput: {
          doctorId: doctorId,
          availableDate: apiDateFormat,
        },
      },
      fetchPolicy: 'no-cache',
    }
  );


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
  let differenceInHours=0;
  let firstAvailableSlots=''

  // it must be always one record or we return only first record.
  if (
    nextAvailableSlot &&
    nextAvailableSlot.getDoctorNextAvailableSlot &&
    nextAvailableSlot.getDoctorNextAvailableSlot.doctorAvailalbeSlots
  ) {
    nextAvailableSlot.getDoctorNextAvailableSlot.doctorAvailalbeSlots.forEach((availability) => {
      if (availability && availability.availableSlot !== '') {
        // console.log(availability.availableSlot);
        // const slotTimeUtc = new Date(
        //   new Date(`${apiDateFormat} ${availability.availableSlot}:00`).toISOString()
        // ).getTime();
        // const localTimeOffset = new Date().getTimezoneOffset() * 60000;
        // const slotTime = new Date(slotTimeUtc - localTimeOffset).getTime();
        // const currentTime = new Date(new Date().toISOString()).getTime();
        const slotTime = new Date(availability.availableSlot).getTime();
firstAvailableSlots=availability.availableSlot
        if(new Date(availability.availableSlot).getDate()===new Date().getDate()){
          isToday=true
        }else{
          isToday=false
        }
        const currentTime = new Date(new Date().toISOString()).getTime();
        if (slotTime > currentTime) {
          const difference = slotTime - currentTime;
          const slotArray = availability.availableSlot.split('T');
          const diffAsDate = new Date(difference);
          differenceInHours=diffAsDate.getUTCHours(); // hours
          differenceInMinutes=diffAsDate.getUTCMinutes(); // minutes
          // differenceInMinutes = Math.round(difference / 60000);
          slotAvailableNext = slotArray[1].substr(0, 5);
          autoSlot = availability.availableSlot;
        }
      } else {
        differenceInMinutes = -1;
      }
    });
  }

  const availableSlots =
    (availableSlotsData && availableSlotsData.getDoctorAvailableSlots.availableSlots) || [];

  availableSlots.map((slot) => {
    // const slotTimeUtc = new Date(new Date(`${apiDateFormat} ${slot}:00`).toISOString()).getTime();
    // const localTimeOffset = new Date().getTimezoneOffset() * 60000;
    // const slotTime = new Date(slotTimeUtc - localTimeOffset).getTime();
    const slotTime = new Date(slot).getTime();
    const currentTime = new Date(new Date().toISOString()).getTime();
    if (slotTime > currentTime) {
      // if (slot === autoSlot) {
      //   slotAvailableNext = autoSlot;
      // }
      if (slotTime < morningTime && slotTime > morningStartTime) morningSlots.push(slotTime);
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

  const paymentMutation = useMutation(BOOK_APPOINTMENT);

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'65vh'}>
        <div className={classes.customScrollBar}>
          {!props.isRescheduleConsult && (
            <div className={classes.consultGroup}>
              {differenceInMinutes > 0 &&isToday? (
                <p>
        { `Dr. ${doctorName} is available in`} { differenceInHours>0&& `${differenceInHours } hours`} {` ${differenceInMinutes} mins! Would you like to
                  consult now or schedule for later?`}
                </p>
              ) :  (<p>
              { `Dr. ${doctorName} is available on`} {format(new Date(firstAvailableSlots), 'dd MMM , h:mm a')}! Would you like to
                        consult now or schedule for later?
                      </p>)}
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
                    showCalendar || scheduleLater || !consultNowAvailable
                      ? classes.buttonActive
                      : ''
                  }`}
                >
                  Schedule For Later
                </AphButton>
              </div>
            </div>
          )}
          {(!consultNow || showCalendar || scheduleLater || !consultNowAvailable) && (
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <div
                  className={`${classes.consultGroup} ${classes.scheduleCalendar} ${
                    showCalendar || scheduleLater || !consultNowAvailable
                      ? classes.showCalendar
                      : ''
                  }`}
                  ref={calendarRef}
                >
                  <AphCalendar
                    getDate={(dateSelected: string) => setDateSelected(dateSelected)}
                    selectedDate={new Date(apiDateFormat)}
                  />
                </div>
              </Grid>
              <Grid item sm={6} xs={12}>
                {morningSlots.length > 0 ||
                afternoonSlots.length > 0 ||
                eveningSlots.length > 0 ||
                lateNightSlots.length > 0 ? (
                  <div
                    className={`${classes.consultGroup} ${classes.scheduleTimeSlots} ${
                      showCalendar || scheduleLater || !consultNowAvailable
                        ? classes.showTimeSlot
                        : ''
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
              </Grid>
            </Grid>
          )}
        </div>
      </Scrollbars>
      {props.isRescheduleConsult ? (
        <div>
          <AphButton
            className={classes.viewButton}
            onClick={() => {
              const bookRescheduleInput = {
                appointmentId: props.appointmentId || '',
                doctorId: doctorId,
                newDateTimeslot: new Date(
                  `${apiDateFormat} ${
                    timeSelected !== ''
                      ? timeSelected.padStart(5, '0')
                      : slotAvailableNext.padStart(5, '0')
                  }:00`
                ).toISOString(),
                initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
                initiatedId: currentPatient ? currentPatient.id : '',
                patientId: currentPatient ? currentPatient.id : '',
                rescheduledId: '',
              };
              props.rescheduleAPI && props.rescheduleAPI(bookRescheduleInput);
              setIsPopoverOpen(false);
            }}
          >
            Reschedule
          </AphButton>
        </div>
      ) : (
        <div className={classes.bottomActions}>
          <AphButton
            color="primary"
            disabled={disableSubmit || mutationLoading || isDialogOpen}
            onClick={() => {
              setMutationLoading(true);
              paymentMutation({
                variables: {
                  bookAppointment: {
                    patientId: currentPatient ? currentPatient.id : '',
                    doctorId: doctorId,
                    appointmentDateTime:
                      consultNow && !scheduleLater
                        ? autoSlot
                        : new Date(
                            `${apiDateFormat} ${
                              timeSelected !== ''
                                ? timeSelected.padStart(5, '0')
                                : slotAvailableNext.padStart(5, '0')
                            }:00`
                          ).toISOString(),
                    appointmentType: APPOINTMENT_TYPE.ONLINE,
                    hospitalId: hospitalId,
                  },
                },
              })
                .then((res: any) => {
                  disableSubmit = false;
                  if (
                    res &&
                    res.data &&
                    res.data.bookAppointment &&
                    res.data.bookAppointment.appointment
                  ) {
                    const pgUrl = `${
                      process.env.CONSULT_PG_BASE_URL
                    }/consultpayment?appointmentId=${
                      res.data.bookAppointment.appointment.id
                    }&patientId=${
                      currentPatient ? currentPatient.id : ''
                    }&price=${onlineConsultationFees}&source=web`;
                    window.location.href = pgUrl;
                    // setMutationLoading(false);
                    // setIsDialogOpen(true);
                  }
                })
                .catch((errorResponse) => {
                  alert(errorResponse);
                  disableSubmit = false;
                  setMutationLoading(false);
                });
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
        </div>
      )}
      <AphDialog
        open={isDialogOpen}
        disableBackdropClick
        disableEscapeKeyDown
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
      >
        <AphDialogTitle>Appointment Confirmation</AphDialogTitle>
        <div className={classes.dialogBody}>
          Your appointment has been successfully booked with <span>Dr. {doctorName}</span>
        </div>
        <div className={classes.dialogActions}>
          <AphButton
            color="primary"
            onClick={() => {
              setIsDialogOpen(false);
              setIsPopoverOpen(false);
              window.location.href = clientRoutes.appointments();
            }}
            autoFocus
          >
            Ok
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
