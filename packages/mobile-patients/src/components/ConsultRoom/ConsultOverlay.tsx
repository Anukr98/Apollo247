import { ConsultOnline } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultOnline';
import { ConsultPhysical } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPhysical';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CrossPopup,
  CouponIcon,
  ArrowRight,
  GreenTickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  BOOK_APPOINTMENT,
  BOOK_FOLLOWUP_APPOINTMENT,
  MAKE_APPOINTMENT_PAYMENT,
  VALIDATE_CONSULT_COUPON,
} from '@aph/mobile-patients/src/graphql/profiles';
import { bookAppointment } from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import {
  BookFollowUpAppointment,
  BookFollowUpAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/BookFollowUpAppointment';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  APPOINTMENT_TYPE,
  BookAppointmentInput,
  DoctorType,
  AppointmentType,
  BOOKINGSOURCE,
  DEVICETYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getNetStatus,
  g,
  handleGraphQlError,
  postWebEngageEvent,
  callPermissions,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWEGWhatsAppEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
// import { useAppCommonData } from '../AppCommonDataProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  makeAppointmentPayment,
  makeAppointmentPaymentVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAppointmentPayment';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import {
  ValidateConsultCoupon,
  ValidateConsultCouponVariables,
} from '@aph/mobile-patients/src/graphql/types/ValidateConsultCoupon';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import moment from 'moment';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { AppsFlyerEventName } from '../../helpers/AppsFlyerEvents';
import { FirebaseEvents, FirebaseEventName } from '../../helpers/firebaseEvents';
import { WhatsAppStatus } from '../ui/WhatsAppStatus';

const { width, height } = Dimensions.get('window');

export interface ConsultOverlayProps extends NavigationScreenProps {
  // dispalyoverlay: boolean;
  setdisplayoverlay: (arg0: boolean) => void;
  // setdisplayoverlay: () => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  FollowUp: boolean;
  appointmentType: string;
  appointmentId: string;
  // availableSlots: string[] | null;
}
export const ConsultOverlay: React.FC<ConsultOverlayProps> = (props) => {
  const client = useApolloClient();
  const tabs =
    props.doctor!.doctorType !== DoctorType.PAYROLL
      ? [{ title: 'Consult Online' }, { title: 'Visit Clinic' }]
      : [{ title: 'Consult Online' }];

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');

  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [isConsultOnline, setisConsultOnline] = useState<boolean>(true);
  const [availableInMin, setavailableInMin] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [coupon, setCoupon] = useState('');
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(true);

  const doctorFees =
    tabs[0].title === selectedTab
      ? props.doctor!.onlineConsultationFees
      : props.doctor!.physicalConsultationFees;

  const [doctorDiscountedFees, setDoctorDiscountedFees] = useState<number>(0);
  const scrollViewRef = React.useRef<any>(null);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [disablePay, setdisablePay] = useState<boolean>(false);
  const [
    selectedClinic,
    setselectedClinic,
  ] = useState<getDoctorDetailsById_getDoctorDetailsById_doctorHospital | null>(
    props.clinics && props.clinics.length > 0 ? props.clinics[0] : null
  );
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  // const { VirtualConsultationFee } = useAppCommonData();

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const todayDate = new Date().toDateString().split('T')[0];
  const scrollToSlots = (top: number = 400) => {
    scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: top, animated: true });
  };

  useEffect(() => {
    postWEGWhatsAppEvent(true);
    const todayDate = new Date().toISOString().slice(0, 10);
    getNextAvailableSlots(client, props.doctor ? [props.doctor.id] : [], todayDate)
      .then(({ data }: any) => {
        console.log(data, 'next');

        try {
          const nextSlot = data[0] ? data[0]!.availableSlot : '';
          if (!nextSlot && data[0]!.physicalAvailableSlot) {
            tabs.length > 1 && setselectedTab(tabs[1].title);
          }
        } catch (e) {
          CommonBugFender('ConsultOverlay_getNextAvailableSlots_try', e);
        }
      })
      .catch((e: any) => {
        CommonBugFender('ConsultOverlay_getNextAvailableSlots', e);
        console.log('error', e);
      });
  }, []);

  const handleOrderSuccess = (doctorName: string) => {
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
    showAphAlert!({
      unDismissable: true,
      title: 'Appointment Confirmation',
      description: `Your appointment has been successfully booked with Dr. ${doctorName}. Please go to consult room 10-15 minutes prior to your appointment. Answering a few medical questions in advance will make your appointment process quick and smooth :)`,
      children: (
        <View style={{ height: 60, alignItems: 'flex-end' }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              height: 60,
              paddingRight: 25,
              backgroundColor: 'transparent',
              justifyContent: 'center',
            }}
            onPress={() => {
              hideAphAlert!();
              props.navigation.navigate(AppRoutes.TabBar);
              CommonLogEvent(
                AppRoutes.ConsultPayment,
                'Navigate to consult room after booking payment sucess.'
              );
            }}
          >
            <Text style={theme.viewStyles.yellowTextStyle}>GO TO CONSULT ROOM</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const getConsultationBookedEventAttributes = (time: string, id: string) => {
    const localTimeSlot = new Date(time);
    console.log(localTimeSlot);

    const doctorClinics = (g(props.doctor, 'doctorHospital') || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULTATION_BOOKED] = {
      name: g(props.doctor, 'fullName')!,
      specialisation: g(props.doctor, 'specialty', 'name')!,
      category: g(props.doctor, 'doctorType')!, // send doctorType
      // time: localTimeSlot.format('DD-MM-YYY, hh:mm A'),
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      'Consult ID': id,
      'Speciality ID': g(props.doctor, 'specialty', 'id')!,
      'Consult Date Time': localTimeSlot,
      'Consult Mode': tabs[0].title === selectedTab ? 'Online' : 'Physical',
      'Hospital Name':
        doctorClinics.length > 0 && props.doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}`
          : '',
      'Hospital City':
        doctorClinics.length > 0 && props.doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.city}`
          : '',
      'Doctor ID': g(props.doctor, 'id')!,
      'Doctor Name': g(props.doctor, 'fullName')!,
      'Net Amount': coupon ? doctorDiscountedFees : Number(doctorFees),
    };
    return eventAttributes;
  };

  // const getConsultationBookedFirebaseEventAttributes = () => {
  //   const eventAttributes: FirebaseEvents[FirebaseEventName.IN_APP_PURCHASE] = {
  //     type: 'Consultation',
  //   };
  //   return eventAttributes;
  // };

  const makePayment = (id: string, amountPaid: number, paymentDateTime: string) => {
    client
      .mutate<makeAppointmentPayment, makeAppointmentPaymentVariables>({
        mutation: MAKE_APPOINTMENT_PAYMENT,
        variables: {
          paymentInput: {
            amountPaid: amountPaid,
            paymentRefId: '',
            paymentStatus: 'TXN_SUCCESS',
            paymentDateTime: paymentDateTime,
            responseCode: coupon,
            responseMessage: 'Coupon applied',
            bankTxnId: '',
            orderId: id,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        console.log('makeAppointmentPayment', '\n', JSON.stringify(data!.makeAppointmentPayment));
        postWebEngageEvent(
          WebEngageEventName.CONSULTATION_BOOKED,
          getConsultationBookedEventAttributes(
            paymentDateTime,
            g(data, 'makeAppointmentPayment', 'appointment', 'id')!
          )
        );
        postAppsFlyerEvent(
          AppsFlyerEventName.CONSULTATION_BOOKED,
          getConsultationBookedEventAttributes(
            paymentDateTime,
            g(data, 'makeAppointmentPayment', 'appointment', 'id')!
          )
        );
        try {
          // postFirebaseEvent(
          //   FirebaseEventName.IN_APP_PURCHASE,
          //   getConsultationBookedFirebaseEventAttributes()
          // );
        } catch (error) {}

        handleOrderSuccess(`${g(props.doctor, 'firstName')} ${g(props.doctor, 'lastName')}`);
      })
      .catch((e) => {
        // const error = g(e, 'graphQLErrors', '0', 'message');
        handleGraphQlError(e);
      })
      .finally(() => setshowSpinner(false));
  };

  const onSubmitBookAppointment = async () => {
    CommonLogEvent(AppRoutes.DoctorDetails, 'ConsultOverlay onSubmitBookAppointment clicked');
    setshowSpinner(true);
    // again check coupon is valid or not
    if (coupon) {
      try {
        await validateAndApplyCoupon(coupon, isConsultOnline, true);
      } catch (error) {
        setCoupon('');
        setDoctorDiscountedFees(0);
        setshowSpinner(false);
        Alert.alert(
          'Uh oh.. :(',
          typeof error == 'string' && error
            ? error
            : 'Oops! seems like we are having an issue with coupon code. Please try again.'
        );
        return;
      }
    }
    const timeSlot =
      tabs[0].title === selectedTab &&
      isConsultOnline &&
      availableInMin! <= 60 &&
      0 < availableInMin!
        ? nextAvailableSlot
        : selectedTimeSlot;

    const doctorClinics = props.clinics.filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const hospitalId = isConsultOnline
      ? doctorClinics.length > 0 && doctorClinics[0].facility
        ? doctorClinics[0].facility.id
        : ''
      : selectedClinic
      ? selectedClinic.facility.id
      : '';
    const appointmentInput: BookAppointmentInput = {
      patientId: props.patientId,
      doctorId: props.doctor ? props.doctor.id : '',
      appointmentDateTime: timeSlot, //appointmentDate,
      appointmentType:
        selectedTab === tabs[0].title ? APPOINTMENT_TYPE.ONLINE : APPOINTMENT_TYPE.PHYSICAL,
      hospitalId,
      couponCode: coupon ? coupon : null,
      bookingSource: BOOKINGSOURCE.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
    };
    console.log(appointmentInput, 'input');
    const price = coupon ? doctorDiscountedFees : Number(doctorFees);
    //   VirtualConsultationFee !== props.doctor!.onlineConsultationFees &&
    //   Number(VirtualConsultationFee) > 0
    //     ? VirtualConsultationFee
    //     : props.doctor!.onlineConsultationFees;

    if (price == 0) {
      client
        .mutate<bookAppointment>({
          mutation: BOOK_APPOINTMENT,
          variables: {
            bookAppointment: appointmentInput,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const apptmt = g(data, 'data', 'bookAppointment', 'appointment');

          // If amount is zero don't redirect to PG
          makePayment(g(apptmt, 'id')!, Number(price), g(apptmt, 'appointmentDateTime'));

          // props.navigation.navigate(AppRoutes.ConsultPayment, {
          //   doctorName: `${g(props.doctor, 'fullName')}`,
          //   appointmentId: g(data, 'data', 'bookAppointment', 'appointment', 'id'),
          //   price: coupon ? doctorDiscountedFees : Number(doctorFees),
          //   webEngageEventAttributes: getConsultationBookedEventAttributes(
          //     g(apptmt, 'appointmentDateTime'),
          //     g(data, 'data', 'bookAppointment', 'appointment', 'id')!
          //   ),
          //   //   tabs[0].title === selectedTab
          //   //     ? price //1 //props.doctor!.onlineConsultationFees
          //   //     : props.doctor!.physicalConsultationFees,
          // });
        })
        .catch((error) => {
          CommonBugFender('ConsultOverlay_onSubmitBookAppointment', error);
          setshowSpinner(false);
          let message = '';
          try {
            message = error.message.split(':')[1].trim();
          } catch (error) {
            CommonBugFender('ConsultOverlay_onSubmitBookAppointment_try', error);
          }
          if (
            message == 'APPOINTMENT_EXIST_ERROR' ||
            message === 'APPOINTMENT_BOOK_DATE_ERROR' ||
            message === 'DOCTOR_SLOT_BLOCKED'
          ) {
            renderErrorPopup(
              `Oops ! The selected slot is unavailable. Please choose a different one`
            );
          } else if (message === 'BOOKING_LIMIT_EXCEEDED') {
            renderErrorPopup(
              `Sorry! You have cancelled 3 appointments with this doctor in past 7 days, please try later or choose another doctor.`
            );
          } else {
            renderErrorPopup(`Something went wrong.${message ? ` Error Code: ${message}.` : ''}`);
          }
        });
    } else {
      props.navigation.navigate(AppRoutes.ConsultCheckout, {
        doctor: props.doctor,
        tabs: tabs,
        selectedTab: selectedTab,
        doctorName: `${g(props.doctor, 'fullName')}`,
        price: coupon ? doctorDiscountedFees : Number(doctorFees),
        appointmentInput: appointmentInput,
        whatsAppUpdate: whatsAppUpdate,
      });
    }
  };

  const postWebEngagePayButtonClickedEvent = () => {
    const timeSlot =
      tabs[0].title === selectedTab &&
      isConsultOnline &&
      availableInMin! <= 60 &&
      0 < availableInMin!
        ? nextAvailableSlot
        : selectedTimeSlot;
    const localTimeSlot = new Date(timeSlot);
    const doctorClinics = (g(props.doctor, 'doctorHospital') || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });
    const eventAttributes: WebEngageEvents[WebEngageEventName.PAY_BUTTON_CLICKED] = {
      'Consult Date Time': localTimeSlot,
      Amount: Number(doctorFees),
      'Doctor Name': g(props.doctor, 'fullName')!,
      'Doctor City': g(props.doctor, 'city')!,
      'Type of Doctor': g(props.doctor, 'doctorType')!,
      'Doctor Specialty': g(props.doctor, 'specialty', 'name')!,
      // 'Appointment Date': localTimeSlot.format('DD-MM-YYYY'),
      // 'Appointment Time': localTimeSlot.format('hh:mm A'),
      'Actual Price': Number(doctorFees),
      'Discount used ?': !!coupon,
      'Discount coupon': coupon,
      'Discount Amount': coupon ? Number(doctorFees) - Number(doctorDiscountedFees) : 0,
      'Net Amount': coupon ? doctorDiscountedFees : Number(doctorFees),
      'Customer ID': g(currentPatient, 'id'),
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Patient UHID': g(currentPatient, 'uhid'),
      consultType: tabs[0].title === selectedTab ? 'online' : 'clinic',
      'Doctor ID': g(props.doctor, 'id')!,
      'Speciality ID': g(props.doctor, 'specialty', 'id')!,
      'Hospital Name':
        doctorClinics.length > 0 && props.doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}`
          : '',
      'Hospital City':
        doctorClinics.length > 0 && props.doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.city}`
          : '',
    };
    postWebEngageEvent(WebEngageEventName.PAY_BUTTON_CLICKED, eventAttributes);
  };

  const onPressPay = () => {
    // Pay Button Clicked	event
    postWebEngagePayButtonClickedEvent();
    callPermissions();
    CommonLogEvent(AppRoutes.DoctorDetails, 'Book Appointment clicked');
    CommonLogEvent(
      AppRoutes.DoctorDetails,
      `PAY Rs. ${
        tabs[0].title === selectedTab
          ? props.doctor!.onlineConsultationFees
          : props.doctor!.physicalConsultationFees
      }`
    );
    getNetStatus()
      .then((status) => {
        // setdisablePay(true);
        if (status) {
          if (props.FollowUp == false) {
            const timeSlot =
              tabs[0].title === selectedTab &&
              isConsultOnline &&
              availableInMin! <= 60 &&
              0 < availableInMin!
                ? nextAvailableSlot
                : selectedTimeSlot;
            const input = {
              patientId: props.patientId,
              doctorId: props.doctorId,
              appointmentDateTime: timeSlot,
              appointmentType: APPOINTMENT_TYPE.ONLINE,
              hospitalId: '',
              followUpParentId: props.appointmentId,
            };
            console.log(input, 'input');
            return;

            client
              .mutate<BookFollowUpAppointment, BookFollowUpAppointmentVariables>({
                mutation: BOOK_FOLLOWUP_APPOINTMENT,
                variables: {
                  followUpAppointmentInput: input,
                },
                fetchPolicy: 'no-cache',
              })
              .then((_data: any) => {
                props.navigation.navigate(AppRoutes.Consult);
              })
              .catch((e: any) => {
                CommonBugFender('ConsultOverlay_onPressPay', e);
                handleGraphQlError(e);
              });
          } else {
            onSubmitBookAppointment();
          }
        } else {
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultOverlay_getNetStatus_onPressPay', e);
      });
  };

  const renderBottomButton = () => {
    const buttonText = `PAY Rs. ${(coupon ? doctorDiscountedFees : Number(doctorFees)).toFixed(2)}`;
    return (
      <StickyBottomComponent
        defaultBG
        style={{
          paddingHorizontal: 16,
          height: 66,
          marginTop: 10,
        }}
      >
        <Button
          title={buttonText}
          disabled={
            disablePay
              ? true
              : tabs[0].title === selectedTab &&
                isConsultOnline &&
                availableInMin! <= 60 &&
                0 < availableInMin!
              ? false
              : selectedTimeSlot === ''
              ? true
              : false
          }
          onPress={onPressPay}
        />
        {/* <Button
          title={
            tabs[0].title === selectedTab ? (
              <Text>
                PAY{' '}
                {Number(VirtualConsultationFee) <= 0 ||
                VirtualConsultationFee === props.doctor!.onlineConsultationFees ? (
                  <Text>{`Rs. ${props.doctor!.onlineConsultationFees}`}</Text>
                ) : (
                  <>
                    <Text
                      style={{
                        textDecorationLine: 'line-through',
                        textDecorationStyle: 'solid',
                      }}
                    >
                      {`(Rs. ${props.doctor!.onlineConsultationFees})`}
                    </Text>
                    <Text> Rs. {VirtualConsultationFee}</Text>
                  </>
                )}
                ||* {VirtualConsultationFee !== props.doctor!.onlineConsultationFees &&
                  Number(VirtualConsultationFee) > 0 && (
                    <>
                      <Text
                        style={{
                          textDecorationLine: 'line-through',
                          textDecorationStyle: 'solid',
                        }}
                      >
                        {`(Rs. ${props.doctor!.onlineConsultationFees})`}
                      </Text>
                      <Text> </Text>
                    </>
                  )}
                Rs. {VirtualConsultationFee} *||
              </Text>
            ) : (
              `PAY Rs. ${props.doctor!.physicalConsultationFees}`
            )
          }
          disabled={
            disablePay
              ? true
              : tabs[0].title === selectedTab &&
                isConsultOnline &&
                availableInMin! <= 60 &&
                0 < availableInMin!
              ? false
              : selectedTimeSlot === ''
              ? true
              : false
          }
          onPress={onPressPay}
        /> */}
      </StickyBottomComponent>
    );
  };
  const renderDisclamer = () => {
    return (
      <View
        style={{
          margin: 20,
          padding: 12,
          borderRadius: 10,
          backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
        }}
      >
        <Text
          style={[
            theme.viewStyles.text('M', 10, theme.colors.LIGHT_BLUE, 1, 16, 0),
            { textAlign: 'justify' },
          ]}
        >
          {string.common.DisclaimerText}
        </Text>
      </View>
    );
  };

  const validateAndApplyCoupon = (
    couponValue: string,
    isOnlineConsult: boolean,
    dontFireEvent?: boolean
  ) => {
    const timeSlot =
      tabs[0].title === selectedTab &&
      isConsultOnline &&
      availableInMin! <= 60 &&
      0 < availableInMin!
        ? nextAvailableSlot
        : selectedTimeSlot;

    return new Promise((res, rej) => {
      client
        .mutate<ValidateConsultCoupon, ValidateConsultCouponVariables>({
          mutation: VALIDATE_CONSULT_COUPON,
          variables: {
            doctorId: props.doctorId,
            code: couponValue,
            consultType:
              tabs[0].title === selectedTab ? AppointmentType.ONLINE : AppointmentType.PHYSICAL,
            appointmentDateTimeInUTC: timeSlot,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          console.log('v-alidateConsultCoupo-n');
          console.log(JSON.stringify(data!.validateConsultCoupon));
          console.log('\n\n\n\n\n\n\n');
          if (g(data, 'validateConsultCoupon', 'validityStatus')) {
            const revisedAmount = g(data, 'validateConsultCoupon', 'revisedAmount')!;
            setCoupon(couponValue);
            setDoctorDiscountedFees(Number(revisedAmount));
            res();
            if (!dontFireEvent) {
              const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_COUPON_APPLIED] = {
                CouponCode: couponValue,
                'Discount Amount': Number(doctorFees) - Number(revisedAmount),
                'Net Amount': Number(revisedAmount),
                'Coupon Applied': true,
              };
              postWebEngageEvent(WebEngageEventName.CONSULT_COUPON_APPLIED, eventAttributes);
            }
          } else {
            if (!dontFireEvent) {
              const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_COUPON_APPLIED] = {
                CouponCode: couponValue,
                'Coupon Applied': false,
              };
              postWebEngageEvent(WebEngageEventName.CONSULT_COUPON_APPLIED, eventAttributes);
            }
            rej(g(data, 'validateConsultCoupon', 'reasonForInvalidStatus'));
          }
        })
        .catch(rej);
    });
  };

  const updateCouponDiscountOnChangeTab = (isOnlineConsult: boolean) => {
    console.log('updateCouponDiscountOnChangeTab isOnlineConsult', isOnlineConsult);
    // this function will reset coupon discount on change in consultation type
    setCoupon('');
    setDoctorDiscountedFees(0);
  };

  const onApplyCoupon = (value: string) => {
    return validateAndApplyCoupon(value, isConsultOnline);
  };

  const renderApplyCoupon = () => {
    return (
      <ListCard
        container={{
          ...theme.viewStyles.card(),
          borderRadius: 0,
          marginHorizontal: 0,
          marginTop: 16,
          backgroundColor: theme.colors.CARD_BG,
        }}
        leftIcon={<CouponIcon />}
        rightIcon={coupon ? <GreenTickIcon /> : <ArrowRight />}
        title={!coupon ? 'Apply Coupon' : 'Coupon Applied'}
        onPress={() => {
          if (!selectedTimeSlot) {
            Alert.alert('Uh oh.. :(', 'Please select a slot to apply coupon.');
            return;
          }
          props.navigation.navigate(AppRoutes.ApplyConsultCoupon, {
            coupon: coupon,
            onApplyCoupon: onApplyCoupon,
          });
        }}
      />
    );
  };

  const renderPriceAndDiscount = () => {
    if (!coupon) return null;

    const localStyles = StyleSheet.create({
      rowSpaceBetweenStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      blueTextStyle: {
        ...theme.viewStyles.text('M', 16, '#01475b', 1, 24),
        flex: 1,
      },
      blueRightTextStyle: {
        ...theme.viewStyles.text('M', 16, '#01475b', 1, 24),
        flex: 0.6,
        textAlign: 'right',
      },
    });

    const total = Number(doctorFees).toFixed(2);
    const amountToPay = doctorDiscountedFees.toFixed(2);
    const couponDiscount = (Number(total) - Number(amountToPay)).toFixed(2);

    return (
      <View style={{ ...theme.viewStyles.card(16, 10, 10, theme.colors.CARD_BG) }}>
        <View style={localStyles.rowSpaceBetweenStyle}>
          <Text style={localStyles.blueTextStyle}>Subtotal</Text>
          <Text style={[localStyles.blueRightTextStyle]}>Rs. {total}</Text>
        </View>
        <View style={localStyles.rowSpaceBetweenStyle}>
          <Text style={localStyles.blueTextStyle}>{`Coupon (${coupon})`}</Text>
          <Text style={[localStyles.blueRightTextStyle]}>- Rs. {couponDiscount}</Text>
        </View>
        <Spearator style={{ marginTop: 16, marginBottom: 10 }} />
        <View style={localStyles.rowSpaceBetweenStyle}>
          <Text style={localStyles.blueTextStyle}>To Pay</Text>
          <Text
            style={[
              localStyles.blueRightTextStyle,
              theme.viewStyles.text('B', 16, '#01475b', 1, 24),
            ]}
          >
            Rs. {amountToPay}
          </Text>
        </View>
      </View>
    );
  };

  const [slotsSelected, setSlotsSelected] = useState<string[]>([]);

  const postSlotSelectedEvent = (slot: string) => {
    if (!slot) {
      return;
    }
    // to avoid duplicate events
    if (!slotsSelected.find((val) => val == slot)) {
      const doctorClinics = (g(props.doctor, 'doctorHospital') || []).filter((item) => {
        if (item && item.facility && item.facility.facilityType)
          return item.facility.facilityType === 'HOSPITAL';
      });
      const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_SLOT_SELECTED] = {
        doctorName: g(props.doctor, 'fullName')!,
        specialisation: g(props.doctor, 'specialty', 'name')!,
        experience: Number(g(props.doctor, 'experience')!),
        'language known': g(props.doctor, 'languages')! || 'NA',
        'Consult Mode': tabs[0].title === selectedTab ? 'Online' : 'Physical',
        'Doctor ID': g(props.doctor, 'id')!,
        'Speciality ID': g(props.doctor, 'specialty', 'id')!,
        'Patient UHID': g(currentPatient, 'uhid'),
        'Consult Date Time': new Date(slot),
      };
      postWebEngageEvent(WebEngageEventName.CONSULT_SLOT_SELECTED, eventAttributes);
      setSlotsSelected([...slotsSelected, slot]);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        zIndex: 5,
      }}
    >
      <View style={{ paddingHorizontal: showSpinner ? 0 : 20 }}>
        <View
          style={{
            // backgroundColor: 'white',
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.setdisplayoverlay(false)}
            style={{
              marginTop: Platform.OS === 'ios' ? 38 : 14,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: showSpinner ? 20 : 0,
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#f7f8f5',
              marginTop: 16,
              // width: width - 40,
              width: width - 40,
              height: 'auto',
              maxHeight: height - 98,
              padding: 0,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <TabsComponent
              style={{
                ...theme.viewStyles.cardViewStyle,
                borderRadius: 0,
              }}
              data={tabs}
              onChange={(_selectedTab: string) => {
                setDate(new Date());
                setselectedTab(_selectedTab);
                setselectedTimeSlot('');
                setisConsultOnline(_selectedTab === tabs[0].title);
                updateCouponDiscountOnChangeTab(_selectedTab === tabs[0].title);
              }}
              selectedTab={selectedTab}
            />
            <ScrollView bounces={false} ref={scrollViewRef}>
              {selectedTab === tabs[0].title ? (
                <>
                  <ConsultOnline
                    source={props.navigation.getParam('showBookAppointment') ? 'List' : 'Profile'}
                    doctor={props.doctor}
                    date={date}
                    setDate={(date) => {
                      setDate(date);
                    }}
                    nextAvailableSlot={nextAvailableSlot}
                    setNextAvailableSlot={setNextAvailableSlot}
                    isConsultOnline={isConsultOnline}
                    setisConsultOnline={setisConsultOnline}
                    setavailableInMin={setavailableInMin}
                    availableInMin={availableInMin}
                    setselectedTimeSlot={(timeSlot) => {
                      postSlotSelectedEvent(timeSlot);
                      setselectedTimeSlot(timeSlot);
                    }}
                    selectedTimeSlot={selectedTimeSlot}
                    setshowSpinner={setshowSpinner}
                    scrollToSlots={scrollToSlots}
                    setshowOfflinePopup={setshowOfflinePopup}
                  />
                </>
              ) : (
                <ConsultPhysical
                  doctor={props.doctor}
                  clinics={props.clinics}
                  setDate={(date) => {
                    setDate(date);
                    // fetchSlots(date);//removed
                    // scrollViewRef.current &&
                    //   scrollViewRef.current.scrollTo &&
                    //   scrollViewRef.current.scrollTo({ x: 0, y: 465, animated: true });
                  }}
                  setselectedTimeSlot={(timeSlot) => {
                    postSlotSelectedEvent(timeSlot);
                    setselectedTimeSlot(timeSlot);
                  }}
                  selectedTimeSlot={selectedTimeSlot}
                  date={date}
                  setshowSpinner={setshowSpinner}
                  setshowOfflinePopup={setshowOfflinePopup}
                  scrollToSlots={scrollToSlots}
                  setselectedClinic={setselectedClinic}
                />
              )}
              {renderApplyCoupon()}
              {renderPriceAndDiscount()}
              {selectedTab === tabs[0].title && renderDisclamer()}
              <WhatsAppStatus
                // style={{ marginTop: 6 }}
                onPress={() => {
                  whatsAppUpdate
                    ? (setWhatsAppUpdate(false), postWEGWhatsAppEvent(false))
                    : (setWhatsAppUpdate(true), postWEGWhatsAppEvent(true));
                }}
                isSelected={whatsAppUpdate}
              />
              <View style={{ height: 70 }} />
            </ScrollView>
            {props.doctor && renderBottomButton()}
          </View>
        </View>
      </View>
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
