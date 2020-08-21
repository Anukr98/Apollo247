import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Grid } from '@material-ui/core';
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import Scrollbars from 'react-custom-scrollbars';
import { GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import {
  GetDoctorAvailableSlots,
  GetDoctorAvailableSlotsVariables,
} from 'graphql/types/GetDoctorAvailableSlots';
import { GET_DOCTOR_AVAILABLE_SLOTS, BOOK_APPOINTMENT } from 'graphql/doctors';
import { useMutation } from 'react-apollo-hooks';
import { AppointmentType, BOOKINGSOURCE, TRANSFER_INITIATED_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { getDeviceType, getDiffInMinutes, getAvailability } from 'helpers/commonHelpers';
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import {
  makeAppointmentPayment,
  makeAppointmentPaymentVariables,
} from 'graphql/types/makeAppointmentPayment';
import { MAKE_APPOINTMENT_PAYMENT } from 'graphql/consult';
import { format } from 'date-fns';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { usePrevious } from 'hooks/reactCustomHooks';
import moment from 'moment';
import { CouponCode } from 'components/Coupon/CouponCode';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { VALIDATE_CONSULT_COUPON } from 'graphql/consult';
import {
  ValidateConsultCoupon,
  ValidateConsultCouponVariables,
} from 'graphql/types/ValidateConsultCoupon';
import { Alerts } from 'components/Alerts/Alerts';
import { gtmTracking, _cbTracking } from '../gtmTracking';
import { useApolloClient } from 'react-apollo-hooks';
import { ShowSlots } from './ShowSlots';

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
    consultNowInfo: {
      backgroundColor: '#fff',
      margin: '18px -16px 0 -16px !important',
      textAlign: 'center',
      padding: '5px 16px',
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
      paddingTop: 20,
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

interface OnlineConsultProps {
  setIsPopoverOpen: (openPopup: boolean) => void;
  doctorDetails: DoctorDetails;
  onBookConsult: (popover: boolean) => void;
  tabValue?: (tabValue: number) => void;
  setIsShownOnce?: (shownOnce: boolean) => void;
  isShownOnce?: boolean;
  doctorAvailableIn?: number;
  isRescheduleConsult?: boolean;
  appointmentId?: any;
  rescheduleAPI?: any;
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
  const [couponCode, setCouponCode] = useState('');
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const [nextAvailability, setNextAvailability] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableSlotsError, setAvailableSlotsError] = useState<boolean>(false);
  const [availableSlotsLoading, setAvailableSlotsLoading] = useState<boolean>(false);

  const couponMutation = useMutation<ValidateConsultCoupon, ValidateConsultCouponVariables>(
    VALIDATE_CONSULT_COUPON
  );

  const { currentPatient } = useAllCurrentPatients();
  const apolloClient = useApolloClient();

  const {
    doctorDetails,
    setIsPopoverOpen,
    tabValue,
    isShownOnce,
    setIsShownOnce,
    isRescheduleConsult,
    appointmentId,
    rescheduleAPI,
  } = props;

  let slotAvailableNext = '',
    consultNowSlotTime = '';

  const doctorName = doctorDetails && doctorDetails.firstName ? doctorDetails.firstName : '';

  const onlineConsultationFees =
    doctorDetails && doctorDetails.onlineConsultationFees
      ? doctorDetails.onlineConsultationFees
      : '';
  const [revisedAmount, setRevisedAmount] = useState(onlineConsultationFees);
  const hospitalId =
    doctorDetails && doctorDetails.doctorHospital[0] && doctorDetails.doctorHospital[0].facility
      ? doctorDetails.doctorHospital[0].facility.id
      : '';

  const doctorId = doctorDetails && doctorDetails.id ? doctorDetails.id : '';

  const prevDateSelected = usePrevious(dateSelected);
  useEffect(() => {
    if (prevDateSelected !== dateSelected) setTimeSelected('');
  }, [dateSelected, prevDateSelected]);

  useEffect(() => {
    /* Gtm code start */
    if (couponCode && revisedAmount !== onlineConsultationFees) {
      const speciality = getSpeciality();
      const couponValue = Number(onlineConsultationFees) - Number(revisedAmount);
      gtmTracking({
        category: 'Consultations',
        action: speciality,
        label: `Coupon Applied - ${couponCode}`,
        value: couponValue,
      });
    }
    /* Gtm code end */
  }, [couponCode, revisedAmount]);

  const getSpeciality = () => {
    let speciality = '';
    if (doctorDetails && doctorDetails.specialty && doctorDetails.specialty.name) {
      speciality = doctorDetails.specialty.name;
    }
    return speciality;
  };

  const checkCouponValidity = () => {
    couponMutation({
      variables: {
        doctorId: doctorId,
        code: couponCode,
        consultType: AppointmentType.ONLINE,
        appointmentDateTimeInUTC: appointmentDateTime,
      },
      fetchPolicy: 'no-cache',
    })
      .then((res) => {
        if (res && res.data && res.data.validateConsultCoupon) {
          if (res.data.validateConsultCoupon.reasonForInvalidStatus) {
            setIsAlertOpen(true);
            setAlertMessage(res.data.validateConsultCoupon.reasonForInvalidStatus);
            setMutationLoading(false);
          } else {
            bookAppointment();
          }
        }
      })
      .catch((error) => {
        setIsAlertOpen(true);
        setAlertMessage(error);
        setMutationLoading(false);
      });
  };
  const doctorAvailableTime = moment().add(props.doctorAvailableIn, 'm') || moment();
  const apiDateFormat =
    dateSelected === ''
      ? nextAvailability
        ? moment(nextAvailability).format('YYYY-MM-DD')
        : doctorAvailableTime.format('YYYY-MM-DD')
      : getYyMmDd(dateSelected);

  // get doctor next availability.
  useEffect(() => {
    if (!nextAvailability) {
      setLoading(true);
      apolloClient
        .query<GetDoctorNextAvailableSlot, GetDoctorNextAvailableSlotVariables>({
          query: GET_DOCTOR_NEXT_AVAILABILITY,
          variables: {
            DoctorNextAvailableSlotInput: {
              doctorIds: [doctorId],
              availableDate: format(new Date(), 'yyyy-MM-dd'),
            },
          },
        })
        .then(({ data }: any) => {
          if (
            data &&
            data.getDoctorNextAvailableSlot &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0].availableSlot
          ) {
            setNextAvailability(
              data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0].availableSlot
            );
          } else {
            setNextAvailability('');
          }
          setAvailableSlotsError(false);
        })
        .catch((e) => {
          setAvailableSlotsError(true);
          console.log(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [nextAvailability]);

  // get available slots.
  useEffect(() => {
    if (nextAvailability && nextAvailability.length && (!availableSlots || dateSelected)) {
      const availableTimeSlot =
        dateSelected === ''
          ? moment(nextAvailability).format('YYYY-MM-DD')
          : getYyMmDd(dateSelected);
      setAvailableSlotsLoading(true);
      apolloClient
        .query<GetDoctorAvailableSlots, GetDoctorAvailableSlotsVariables>({
          query: GET_DOCTOR_AVAILABLE_SLOTS,
          variables: {
            DoctorAvailabilityInput: {
              doctorId: doctorId,
              availableDate: availableTimeSlot,
            },
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }: any) => {
          if (data && data.getDoctorAvailableSlots && data.getDoctorAvailableSlots.availableSlots) {
            setAvailableSlots(data.getDoctorAvailableSlots.availableSlots);
          }
          setAvailableSlotsError(false);
        })
        .catch((e) => {
          console.log(e);
          setAvailableSlotsError(true);
        })
        .finally(() => {
          setAvailableSlotsLoading(false);
        });
    }
  }, [nextAvailability, dateSelected]);

  if (availableSlotsLoading || loading) {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
  }

  const differenceInMinutes = getDiffInMinutes(nextAvailability);
  if (differenceInMinutes >= 0 && differenceInMinutes <= 60) {
    consultNowSlotTime = nextAvailability;
  }

  if (differenceInMinutes < 0 && (isShownOnce === false || isShownOnce === undefined)) {
    tabValue && tabValue(1);
    setIsShownOnce && setIsShownOnce(true);
  }

  const consultNowAvailable = differenceInMinutes > 0 && differenceInMinutes <= 60;

  let disableSubmit = availableSlots && availableSlots.length === 0;

  const paymentMutation = useMutation(BOOK_APPOINTMENT);
  const makePaymentMutation = useMutation<makeAppointmentPayment, makeAppointmentPaymentVariables>(
    MAKE_APPOINTMENT_PAYMENT
  );
  let appointmentDateTime = ''; // this is delcared here intentionally as global. don't edit => Kumar
  if (scheduleLater || !consultNowAvailable) {
    const dateForScheduleLater =
      dateSelected.length > 0
        ? dateSelected.replace(/\//g, '-')
        : moment(apiDateFormat, 'YYYY-MM-DD').format('DD-MM-YYYY');
    appointmentDateTime = moment(
      `${dateForScheduleLater} ${String(timeSelected).padStart(5, '0')}:00`,
      'DD-MM-YYYY HH:mm:ss'
    )
      .utc()
      .format();
  } else {
    appointmentDateTime = consultNowSlotTime;
  }
  // const consultType: AppointmentType = AppointmentType.ONLINE;
  const bookAppointment = () => {
    paymentMutation({
      variables: {
        bookAppointment: {
          patientId: currentPatient ? currentPatient.id : '',
          doctorId: doctorId,
          appointmentDateTime: appointmentDateTime,
          bookingSource: BOOKINGSOURCE.WEB,
          deviceType: getDeviceType(),
          appointmentType: AppointmentType.ONLINE,
          hospitalId: hospitalId,
          couponCode: couponCode ? couponCode : null,
        },
      },
    })
      .then((res: any) => {
        /* Gtm code start */
        const specialty = getSpeciality();
        const couponValue = Number(onlineConsultationFees) - Number(revisedAmount);
        const {
          city,
          fullName,
          id,
          doctorType,
          doctorHospital,
          physicalConsultationFees,
        } = doctorDetails;
        let items = [],
          count = 0;
        onlineConsultationFees &&
          items.push({
            item_name: fullName,
            item_id: id,
            price: Number(onlineConsultationFees),
            item_brand:
              doctorType && doctorType.toLocaleLowerCase() === 'apollo'
                ? 'Apollo'
                : 'Partner Doctors',
            item_category: 'Consultations',
            item_category_2: specialty,
            item_category_3:
              city ||
              (doctorHospital &&
                doctorHospital.length &&
                doctorHospital[0].facility &&
                doctorHospital[0].facility.city),
            // 'item_category_4': '', // For Future
            item_variant: 'Virtual',
            index: ++count,
            quantity: 1,
          });
        physicalConsultationFees &&
          items.push({
            item_name: fullName,
            item_id: id,
            price: Number(physicalConsultationFees),
            item_brand:
              doctorType && doctorType.toLocaleLowerCase() === 'apollo'
                ? 'Apollo'
                : 'Partner Doctors',
            item_category: 'Consultations',
            item_category_2: specialty,
            item_category_3:
              city ||
              (doctorHospital &&
                doctorHospital.length &&
                doctorHospital[0].facility &&
                doctorHospital[0].facility.city),
            // 'item_category_4': '', // For Future
            item_variant: 'Physcial',
            index: ++count,
            quantity: 1,
          });
        _cbTracking({
          specialty: specialty,
          bookingType: AppointmentType.ONLINE,
          scheduledDate: `${appointmentDateTime}`,
          couponCode: couponCode ? couponCode : null,
          couponValue: couponValue ? couponValue : null,
          finalBookingValue: revisedAmount,
          ecommObj: {
            ecommerce: {
              items: items,
            },
          },
        });
        /* Gtm code END */
        disableSubmit = false;
        if (res && res.data && res.data.bookAppointment && res.data.bookAppointment.appointment) {
          if (revisedAmount == '0') {
            makePaymentMutation({
              variables: {
                paymentInput: {
                  amountPaid: 0,
                  paymentRefId: '',
                  paymentStatus: 'TXN_SUCCESS',
                  paymentDateTime: res.data.bookAppointment.appointment.appointmentDateTime,
                  responseCode: couponCode,
                  responseMessage: 'Coupon applied',
                  bankTxnId: '',
                  orderId: res.data.bookAppointment.appointment.id,
                },
              },
              fetchPolicy: 'no-cache',
            })
              .then((res) => {
                window.location.href = clientRoutes.appointments();
              })
              .catch((error) => {
                setIsAlertOpen(true);
                setAlertMessage(error);
              });
          } else {
            const pgUrl = `${process.env.CONSULT_PG_BASE_URL}/consultpayment?appointmentId=${
              res.data.bookAppointment.appointment.id
            }&patientId=${
              currentPatient ? currentPatient.id : ''
            }&price=${revisedAmount}&source=WEB`;
            window.location.href = pgUrl;
          }
        }
      })
      .catch((errorResponse) => {
        setIsAlertOpen(true);
        setAlertMessage(errorResponse);
        disableSubmit = false;
        setMutationLoading(false);
      });
  };

  // const disableCoupon =
  //   disableSubmit ||
  //   mutationLoading ||
  //   isDialogOpen ||
  //   (!consultNowAvailable && timeSelected === '') ||
  //   (scheduleLater && timeSelected === '');

  const availabilityMarkup = () => {
    return getAvailability(nextAvailability, differenceInMinutes, 'consultType');
  };

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={isSmallScreen ? '50vh' : '65vh'}>
        <div className={classes.customScrollBar}>
          <div className={classes.consultGroup}>
            <p>{`Dr. ${doctorName} is ${availabilityMarkup()}! Would you like to
                consult now or schedule for later?`}</p>
            <div className={classes.actions}>
              <AphButton
                onClick={(e) => {
                  setShowCalendar(false);
                  setConsultNow(true);
                  setScheduleLater(false);
                  setTimeSelected('');
                }}
                color="secondary"
                className={`${classes.button} ${
                  consultNowAvailable && consultNow
                    ? !scheduleLater
                      ? classes.buttonActive
                      : ''
                    : classes.disabledButton
                }`}
                disabled={!(consultNow && slotAvailableNext === '') || !consultNowAvailable}
                title={' Consult Now'}
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
                title={' Schedule For Later'}
              >
                Schedule For Later
              </AphButton>
            </div>
            {showCalendar || scheduleLater || !consultNowAvailable ? (
              ''
            ) : (
              <p className={classes.consultNowInfo}>
                Please note that after booking, you will need to download the Apollo 247 app to
                continue with your consultation.
              </p>
            )}
          </div>

          {(!consultNow || showCalendar || scheduleLater || !consultNowAvailable) && (
            <>
              <p className={classes.consultGroup}>
                Please note that after booking, you will need to download the Apollo 247 app to
                continue with your consultation.
              </p>

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
                    {nextAvailability && (
                      <AphCalendar
                        getDate={(dateSelected: string) => setDateSelected(dateSelected)}
                        selectedDate={new Date(apiDateFormat)}
                      />
                    )}
                  </div>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <ShowSlots
                    availableSlots={availableSlots}
                    apiDateFormat={apiDateFormat}
                    setTimeSelected={setTimeSelected}
                    doctorName={doctorName}
                    showCalendar={showCalendar}
                    scheduleLater={scheduleLater}
                    consultNowAvailable={consultNowAvailable}
                  />
                </Grid>
              </Grid>
            </>
          )}
          {/* <CouponCode
            disableSubmit={disableCoupon}
            setCouponCodeFxn={() => {
              setCouponCode(couponCode);
            }}
            setCouponCode={setCouponCode}
            subtotal={onlineConsultationFees}
            revisedAmount={revisedAmount}
            setRevisedAmount={setRevisedAmount}
            doctorId={doctorId}
            appointmentDateTime={appointmentDateTime}
            appointmentType={consultType}
            removeCouponCode={() => {
              const speciality = getSpeciality();
              const couponValue = Number(onlineConsultationFees) - Number(revisedAmount);
              gtmTracking({
                category: 'Consultations',
                action: speciality,
                label: `Coupon Removed - ${couponCode}`,
                value: couponValue,
              });
            }}
          /> */}
          <p className={classes.consultGroup}>
            I have read and understood the Terms &amp; Conditions of usage of 24x7 and consent to
            the same. I am voluntarily availing of the services provided on this platform. I am
            fully aware that I will not be undergoing a physical examination by a physician prior to
            a physician recommending medical tests and/or treatment and/or the prescribing of OTC
            drugs. I am also aware that the consultation on 24x7 Application does not preclude my
            rights to visit a physician and opt for a physical examination at any point in time and
            I am free at any time during the consultation to request for the same.
          </p>
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        {isRescheduleConsult ? (
          <AphButton
            color="primary"
            disabled={
              disableSubmit ||
              mutationLoading ||
              isDialogOpen ||
              (!consultNowAvailable && timeSelected === '') ||
              (scheduleLater && timeSelected === '')
            }
            onClick={() => {
              setMutationLoading(true);
              const bookRescheduleInput = {
                appointmentId: appointmentId,
                doctorId: doctorId,
                newDateTimeslot: appointmentDateTime,
                initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
                initiatedId: currentPatient ? currentPatient.id : '',
                patientId: currentPatient ? currentPatient.id : '',
                rescheduledId: '',
              };
              rescheduleAPI(bookRescheduleInput);
            }}
            className={
              disableSubmit ||
              mutationLoading ||
              isDialogOpen ||
              (!consultNowAvailable && timeSelected === '') ||
              (scheduleLater && timeSelected === '')
                ? classes.buttonDisable
                : ''
            }
            title={'Reschedule'}
          >
            {mutationLoading ? <CircularProgress size={22} color="secondary" /> : `Reschedule`}
          </AphButton>
        ) : (
          <Link to={clientRoutes.payOnlineConsult()}>
            <AphButton
              color="primary"
              disabled={
                disableSubmit ||
                mutationLoading ||
                isDialogOpen ||
                (!consultNowAvailable && timeSelected === '') ||
                (scheduleLater && timeSelected === '')
              }
              onClick={() => {
                localStorage.setItem(
                  'consultBookDetails',
                  JSON.stringify({
                    patientId: currentPatient ? currentPatient.id : '',
                    doctorId: doctorId,
                    doctorName,
                    appointmentDateTime: appointmentDateTime,
                    appointmentType: AppointmentType.ONLINE,
                    hospitalId: hospitalId,
                    couponCode: couponCode ? couponCode : null,
                    amount: revisedAmount,
                    speciality: getSpeciality(),
                  })
                );
              }}
              className={
                disableSubmit ||
                mutationLoading ||
                isDialogOpen ||
                (!consultNowAvailable && timeSelected === '') ||
                (scheduleLater && timeSelected === '')
                  ? classes.buttonDisable
                  : ''
              }
              title={'Pay'}
            >
              {mutationLoading ? (
                <CircularProgress size={22} color="secondary" />
              ) : (
                `PAY Rs. ${revisedAmount}`
              )}
            </AphButton>
          </Link>
        )}
      </div>
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
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
