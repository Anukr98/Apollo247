import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress, Grid } from '@material-ui/core';
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AphButton, AphSelect, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';
import Scrollbars from 'react-custom-scrollbars';
import _uniqueId from 'lodash/uniqueId';
import {
  GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails,
  GetDoctorDetailsById_getDoctorDetailsById_doctorHospital as Facility,
} from 'graphql/types/GetDoctorDetailsById';
import {
  GetDoctorPhysicalAvailableSlots,
  GetDoctorPhysicalAvailableSlotsVariables,
} from 'graphql/types/GetDoctorPhysicalAvailableSlots';
import { GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS, BOOK_APPOINTMENT } from 'graphql/doctors';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { useMutation } from 'react-apollo-hooks';
import { AppointmentType, BOOKINGSOURCE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
// import { Redirect } from 'react-router';
import { Alerts } from 'components/Alerts/Alerts';
import _forEach from 'lodash/forEach';
import { getIstTimestamp } from 'helpers/dateHelpers';
import { usePrevious } from 'hooks/reactCustomHooks';
import { LocationContext } from 'components/LocationProvider';
import {
  makeAppointmentPayment,
  makeAppointmentPaymentVariables,
} from 'graphql/types/makeAppointmentPayment';
import { MAKE_APPOINTMENT_PAYMENT } from 'graphql/consult';
import { clientRoutes } from 'helpers/clientRoutes';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { VALIDATE_CONSULT_COUPON } from 'graphql/consult';
import {
  ValidateConsultCoupon,
  ValidateConsultCouponVariables,
} from 'graphql/types/ValidateConsultCoupon';
import moment from 'moment';
import { gtmTracking, _cbTracking } from '../gtmTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      overflow: 'hidden',
    },
    consultGroup: {
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      marginTop: 10,
      display: 'inline-block',
      width: '100%',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.35,
      color: theme.palette.secondary.light,
      minHeight: 278,
      borderRadius: 10,
      marginBottom: 10,
      '& p': {
        marginTop: 0,
      },
    },
    infoNotes: {
      minHeight: 'auto',
    },
    actions: {
      paddingTop: 5,
      paddingBottom: 4,
      marginLeft: -8,
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
    customScrollBar: {
      paddingTop: 10,
      paddingLeft: 20,
      paddingRight: 20,
    },
    timeSlots: {
      paddingTop: 5,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontWeight: 600,
    },
    selectedAddress: {
      paddingTop: 20,
      display: 'flex',
    },
    clinicAddress: {
      fontSize: 13,
      fontWeight: 500,
      color: '#01475b',
      lineHeight: 1.54,
      letterSpacing: 0.33,
      paddingRight: 20,
      width: '78%',
    },
    clinicDistance: {
      marginLeft: 'auto',
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
      lineHeight: 1.54,
      letterSpacing: 0.33,
      borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      paddingLeft: 15,
      width: '22%',
      textAlign: 'right',
    },
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      padding: 6,
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

interface VisitClinicProps {
  doctorDetails: DoctorDetails;
  doctorAvailableIn?: number;
}

export const VisitClinic: React.FC<VisitClinicProps> = (props) => {
  const classes = useStyles({});
  let appointmentDateTime = '';

  const [dateSelected, setDateSelected] = useState<string>('');
  const [timeSelected, setTimeSelected] = useState<string>('');
  const [clinicSelected, setClinicSelected] = useState<string>('');
  const [clinicAddress] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const makePaymentMutation = useMutation(MAKE_APPOINTMENT_PAYMENT);
  // const [mutationSuccess, setMutationSuccess] = React.useState(false);
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const prevDateSelected = usePrevious(dateSelected);
  const { currentPatient } = useAllCurrentPatients();
  const { currentLocation, currentLat, currentLong } = useContext(LocationContext);
  const { doctorDetails } = props;
  const couponMutation = useMutation<ValidateConsultCoupon, ValidateConsultCouponVariables>(
    VALIDATE_CONSULT_COUPON
  );
  const currentTime = new Date().getTime();
  const doctorName = doctorDetails && doctorDetails.firstName ? doctorDetails.firstName : '';

  const physicalConsultationFees =
    doctorDetails && doctorDetails && doctorDetails.physicalConsultationFees
      ? doctorDetails.physicalConsultationFees
      : '';
  const [revisedAmount, setRevisedAmount] = useState(physicalConsultationFees);
  const [couponCode, setCouponCode] = useState('');
  const morningSlots: number[] = [],
    afternoonSlots: number[] = [],
    eveningSlots: number[] = [],
    lateNightSlots: number[] = [];
  const doctorAvailableTime = moment().add(props.doctorAvailableIn, 'm').toDate() || new Date();
  const apiDateFormat =
    dateSelected === ''
      ? moment(doctorAvailableTime).format('YYYY-MM-DD')
      : getYyMmDd(dateSelected);

  const morningTime = getIstTimestamp(new Date(apiDateFormat), '12:01');
  const afternoonTime = getIstTimestamp(new Date(apiDateFormat), '17:01');
  const eveningTime = getIstTimestamp(new Date(apiDateFormat), '21:01');

  const doctorId = doctorDetails && doctorDetails.id ? doctorDetails.id : '';

  const clinics: Facility[] = [];
  if (doctorDetails) {
    _forEach(doctorDetails.doctorHospital, (hospitalDetails) => {
      if (
        hospitalDetails.facility.facilityType === 'CLINIC' ||
        hospitalDetails.facility.facilityType === 'HOSPITAL'
      ) {
        clinics.push(hospitalDetails);
      }
    });
  }
  const getDistance = (
    fromLat: string | null,
    fromLong: string | null,
    toLat: string,
    toLong: string
  ): string | null => {
    if (fromLat != null && fromLong != null && toLat != null && toLong != null) {
      const toRadian = (n: number) => (n * Math.PI) / 180;
      let toLatitude = parseFloat(toLat);
      let toLongitude = parseFloat(toLong);
      let fromLatitude = parseFloat(fromLat);
      let fromLongitude = parseFloat(fromLong);
      let R = 6371; // km
      let x1 = toLatitude - fromLatitude;
      let dLat = toRadian(x1);
      let x2 = toLongitude - fromLongitude;
      let dLon = toRadian(x2);
      let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadian(fromLatitude)) *
          Math.cos(toRadian(toLatitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let d = R * c;
      return `${d.toFixed(2)} km`;
    }
    return null;
  };

  const getClinicDistance = (
    clinicId: string,
    fromLatitude: string | null,
    fromLongitude: string | null
  ): string | null => {
    const filteredClinics = clinics.filter(
      (clinicDetails: Facility) => clinicDetails.facility.id === clinicId
    );
    // console.log('filteredClinics', filteredClinics);
    if (filteredClinics != null && filteredClinics.length > 0) {
      if (
        filteredClinics[0].facility.latitude != null &&
        filteredClinics[0].facility.longitude != null
      ) {
        return getDistance(
          fromLatitude,
          fromLongitude,
          filteredClinics[0].facility.latitude,
          filteredClinics[0].facility.longitude
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
  const defaultClinicId =
    clinics.length > 0 && clinics[0] && clinics[0].facility ? clinics[0].facility.id : '';

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorPhysicalAvailableSlots,
    GetDoctorPhysicalAvailableSlotsVariables
  >(GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS, {
    variables: {
      DoctorPhysicalAvailabilityInput: {
        doctorId: doctorId,
        availableDate: apiDateFormat,
        facilityId: defaultClinicId,
      },
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (prevDateSelected !== dateSelected) setTimeSelected('');
  }, [dateSelected, prevDateSelected]);

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

  const availableSlots = (data && data.getDoctorPhysicalAvailableSlots.availableSlots) || [];
  availableSlots.map((slot) => {
    // const slotTimeUtc = new Date(new Date(`${apiDateFormat} ${slot}:00`).toISOString()).getTime();
    // const localTimeOffset = new Date().getTimezoneOffset() * 60000;
    // const slotTime = new Date(slotTimeUtc - localTimeOffset).getTime();
    const slotTime = new Date(slot).getTime();
    const currentTime = new Date(new Date().toISOString()).getTime();
    if (slotTime > currentTime) {
      if (slotTime < morningTime) morningSlots.push(slotTime);
      else if (slotTime >= morningTime && slotTime < afternoonTime) afternoonSlots.push(slotTime);
      else if (slotTime >= afternoonTime && slotTime < eveningTime) eveningSlots.push(slotTime);
      else lateNightSlots.push(slotTime);
    }
  });

  const disableSubmit =
    (morningSlots.length === 0 &&
      afternoonSlots.length === 0 &&
      eveningSlots.length === 0 &&
      lateNightSlots.length === 0) ||
    timeSelected === '';
  const defaultClinicAddress =
    clinics.length > 0 && clinics[0] && clinics[0].facility
      ? `${clinics[0].facility.streetLine1 ? clinics[0].facility.streetLine1 : ''} ${
          clinics[0].facility.streetLine2 ? `${clinics[0].facility.streetLine2}` : ''
        } ${clinics[0].facility.streetLine3 ? `${clinics[0].facility.streetLine3}` : ''}`
      : '';

  const paymentMutation = useMutation(BOOK_APPOINTMENT);
  appointmentDateTime =
    timeSelected && moment(`${apiDateFormat}T${timeSelected.padStart(5, '0')}`).toISOString();
  const checkCouponValidity = () => {
    couponMutation({
      variables: {
        doctorId: doctorId,
        code: couponCode,
        consultType: AppointmentType.PHYSICAL,
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
  const bookAppointment = () => {
    paymentMutation({
      variables: {
        bookAppointment: {
          patientId: currentPatient ? currentPatient.id : '',
          doctorId: doctorId,
          bookingSource: screen.width < 768 ? BOOKINGSOURCE.MOBILE : BOOKINGSOURCE.WEB,
          appointmentDateTime: moment(
            `${apiDateFormat}T${timeSelected.padStart(5, '0')}`
          ).toISOString(),
          appointmentType: AppointmentType.PHYSICAL,
          hospitalId: defaultClinicId,
          couponCode: couponCode ? couponCode : null,
        },
      },
    })
      .then((res: any) => {
        /* Gtm code start */
        const specialty = getSpeciality();
        const couponValue = Number(physicalConsultationFees) - Number(revisedAmount);
        gtmTracking({
          category: 'Consultations',
          action: specialty,
          label: 'Order Success',
          value: revisedAmount,
        });

        const {
          city,
          fullName,
          id,
          doctorType,
          doctorHospital,
          onlineConsultationFees,
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
          bookingType: AppointmentType.PHYSICAL,
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
          // setMutationLoading(false);
          // setIsDialogOpen(true);
        }
      })
      .catch((errorResponse) => {
        setIsAlertOpen(true);
        setAlertMessage(errorResponse);
        setMutationLoading(false);
      });
  };
  const disableCoupon = disableSubmit || mutationLoading || isDialogOpen || !timeSelected;
  const getSpeciality = () => {
    let speciality = '';
    if (doctorDetails && doctorDetails.specialty && doctorDetails.specialty.name) {
      speciality = doctorDetails.specialty.name;
    }
    return speciality;
  };

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={isSmallScreen ? '50vh' : '65vh'}>
        <div className={classes.customScrollBar}>
          <p className={`${classes.consultGroup} ${classes.infoNotes}`}>
            Please note that after booking, you will need to download the Apollo 247 app to continue
            with your consultation.
          </p>
          <Grid container spacing={2}>
            <Grid item sm={6} xs={12}>
              <div className={classes.consultGroup}>
                <AphCalendar
                  getDate={(dateSelected: string) => setDateSelected(dateSelected)}
                  selectedDate={new Date(apiDateFormat)}
                />
              </div>
            </Grid>
            <Grid item sm={6} xs={12}>
              <div className={`${classes.consultGroup} ${classes.timeSlots}`}>
                <AphSelect
                  value={clinicSelected === '' ? defaultClinicId : clinicSelected}
                  onChange={(e) => {
                    setClinicSelected(e.target.value as string);
                  }}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'top',
                      horizontal: 'right',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'right',
                    },
                  }}
                >
                  {clinics.map((clinicDetails: Facility) => {
                    return (
                      <MenuItem
                        classes={{ selected: classes.menuSelected }}
                        key={_uniqueId('clinic_')}
                        value={(clinicDetails.facility.id && clinicDetails.facility.id) || ''}
                      >
                        {clinicDetails.facility.name}
                      </MenuItem>
                    );
                  })}
                </AphSelect>
                <div className={classes.selectedAddress}>
                  <div className={classes.clinicAddress}>
                    {clinicAddress === '' ? defaultClinicAddress : clinicAddress}
                  </div>
                  <div className={classes.clinicDistance}>
                    <img src={require('images/ic_location.svg')} alt="" />
                    <br />
                    {getClinicDistance(
                      clinicSelected || defaultClinicId,
                      currentLat,
                      currentLong
                    ) || 'NA'}
                  </div>
                </div>
                {morningSlots.length > 0 ||
                afternoonSlots.length > 0 ||
                eveningSlots.length > 0 ||
                lateNightSlots.length > 0 ? (
                  <DayTimeSlots
                    morningSlots={morningSlots}
                    afternoonSlots={afternoonSlots}
                    eveningSlots={eveningSlots}
                    latenightSlots={lateNightSlots}
                    doctorName={doctorName}
                    timeSelected={(timeSelected) => setTimeSelected(timeSelected)}
                  />
                ) : (
                  <div className={classes.noSlotsAvailable}>
                    Oops! No slots available with Dr. {doctorName} :(
                  </div>
                )}
              </div>
            </Grid>
          </Grid>
          <p className={`${classes.consultGroup} ${classes.infoNotes}`}>
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
        <Link to={clientRoutes.payOnlineClinicConsult()}>
          <AphButton
            color="primary"
            disabled={disableSubmit || mutationLoading || isDialogOpen || !timeSelected}
            onClick={() => {
              localStorage.setItem(
                'consultBookDetails',
                JSON.stringify({
                  patientId: currentPatient ? currentPatient.id : '',
                  doctorId: doctorId,
                  doctorName,
                  appointmentDateTime: appointmentDateTime,
                  appointmentType: AppointmentType.PHYSICAL,
                  hospitalId: defaultClinicId,
                  couponCode: couponCode ? couponCode : null,
                  amount: revisedAmount,
                  speciality: getSpeciality(),
                })
              );
            }}
            // onClick={(e) => {
            //   setMutationLoading(true);
            //   // console.log(
            //   //   new Date(`${apiDateFormat} ${timeSelected.padStart(5, '0')}:00`).toISOString(),
            //   //   'visit clinic.......'
            //   // );

            //   if (couponCode) {
            //     checkCouponValidity();
            //   } else {
            //     bookAppointment();
            //   }
            // }}
            className={
              disableSubmit || mutationLoading || isDialogOpen || !timeSelected
                ? classes.buttonDisable
                : ''
            }
          >
            {mutationLoading ? (
              <CircularProgress size={22} color="secondary" />
            ) : (
              `PAY Rs. ${revisedAmount}`
            )}
          </AphButton>
        </Link>
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
