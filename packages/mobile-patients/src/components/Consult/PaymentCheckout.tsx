import React, { useState, useRef } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DoctorCheckoutCard } from '@aph/mobile-patients/src/components/ui/DoctorCheckoutCard';
import { CareMembershipAdded } from '@aph/mobile-patients/src/components/ui/CareMembershipAdded';
import { ConsultPriceBreakup } from '@aph/mobile-patients/src/components/ui/ConsultPriceBreakup';
import { ConsultDiscountCard } from '@aph/mobile-patients/src/components/ui/ConsultDiscountCard';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { ArrowRight, CouponIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  g,
  postWebEngageEvent,
  getNetStatus,
  handleGraphQlError,
  postFirebaseEvent,
  postWEGWhatsAppEvent,
  dataSavedUserID,
  postAppsFlyerEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  BookAppointmentInput,
  DoctorType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { calculateCareDoctorPricing } from '@aph/mobile-patients/src/utils/commonUtils';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { validateConsultCoupon } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import firebase from 'react-native-firebase';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { NotificationPermissionAlert } from '@aph/mobile-patients/src/components/ui/NotificationPermissionAlert';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
const { width } = Dimensions.get('window');
import { useApolloClient } from 'react-apollo-hooks';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import moment from 'moment';
import { FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  saveSearchDoctor,
  saveSearchSpeciality,
  whatsAppUpdateAPICall,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { bookAppointment } from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import {
  BOOK_APPOINTMENT,
  MAKE_APPOINTMENT_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import AsyncStorage from '@react-native-community/async-storage';
import {
  makeAppointmentPayment,
  makeAppointmentPaymentVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAppointmentPayment';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

interface PaymentCheckoutProps extends NavigationScreenProps {
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  tabs: { title: string }[];
  selectedTab: string;
  price: number;
  appointmentInput: BookAppointmentInput;
  consultedWithDoctorBefore: boolean;
  patientId: string;
  callSaveSearch: string;
  availableInMin: number;
  nextAvailableSlot: string;
  selectedTimeSlot: string;
  whatsAppUpdate: boolean;
}
export const PaymentCheckout: React.FC<PaymentCheckoutProps> = (props) => {
  const [coupon, setCoupon] = useState<string>('');
  const { locationDetails, hdfcUserSubscriptions } = useAppCommonData();
  const consultedWithDoctorBefore = props.navigation.getParam('consultedWithDoctorBefore');
  const doctor = props.navigation.getParam('doctor');
  const tabs = props.navigation.getParam('tabs');
  const selectedTab = props.navigation.getParam('selectedTab');
  const appointmentInput = props.navigation.getParam('appointmentInput');
  const price = props.navigation.getParam('price');
  const callSaveSearch = props.navigation.getParam('callSaveSearch');
  const patientId = props.navigation.getParam('patientId');
  const availableInMin = props.navigation.getParam('availableInMin');
  const nextAvailableSlot = props.navigation.getParam('nextAvailableSlot');
  const selectedTimeSlot = props.navigation.getParam('selectedTimeSlot');
  const whatsAppUpdate = props.navigation.getParam('selectedTimeSlot');
  const isOnlineConsult = selectedTab === 'Consult Online';
  const { currentPatient } = useAllCurrentPatients();
  const [doctorDiscountedFees, setDoctorDiscountedFees] = useState<number>(0);
  const [couponDiscountFees, setCouponDiscountFees] = useState<number>(0);
  const { showAphAlert } = useUIElements();
  const [notificationAlert, setNotificationAlert] = useState(false);
  const scrollviewRef = useRef<any>(null);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  const careDoctorDetails = calculateCareDoctorPricing(doctor);
  const { isCareDoctor } = careDoctorDetails;
  const { isCareSubscribed } = useShoppingCart();

  const amountToPay = Number(price) - couponDiscountFees;
  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'CHECKOUT'}
        onPressLeftIcon={() => {
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderDoctorCard = () => {
    return (
      <DoctorCheckoutCard
        doctor={doctor}
        appointmentInput={appointmentInput}
        doctorFees={price}
        selectedTab={selectedTab}
        isCareSubscribed={isCareSubscribed}
      />
    );
  };

  const renderCareMembershipAddedCard = () => {
    return <CareMembershipAdded doctor={doctor} />;
  };

  const renderPriceBreakup = () => {
    return (
      <View>
        <Text style={styles.priceBreakupTitle}>{string.common.totalCharges}</Text>
        <View style={styles.seperatorLine} />
        <ConsultPriceBreakup
          doctor={doctor}
          doctorFees={price}
          selectedTab={selectedTab}
          coupon={coupon}
          couponDiscountFees={couponDiscountFees}
          isCareSubscribed={isCareSubscribed}
        />
      </View>
    );
  };

  const renderDiscountView = () => {
    return (
      <ConsultDiscountCard
        coupon={coupon}
        couponDiscountFees={couponDiscountFees}
        doctor={doctor}
        selectedTab={selectedTab}
        isCareSubscribed={isCareSubscribed}
        onPressCard={() =>
          setTimeout(() => {
            scrollviewRef.current.scrollToEnd({ animated: true });
          }, 300)
        }
      />
    );
  };

  const renderApplyCoupon = () => {
    return (
      <ListCard
        container={[
          styles.couponContainer,
          { marginTop: isCareDoctor && isCareSubscribed ? 0 : 20, height: 'auto' },
        ]}
        titleStyle={styles.couponStyle}
        leftTitleStyle={[styles.couponStyle, { color: theme.colors.SEARCH_UNDERLINE_COLOR }]}
        leftIcon={<CouponIcon />}
        rightIcon={<ArrowRight />}
        leftTitle={coupon}
        children={coupon ? renderCouponSavingsView() : null}
        title={coupon ? ' applied' : 'Apply Coupon'}
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

  const renderCouponSavingsView = () => {
    return (
      <View style={styles.couponSavingView}>
        <Text style={styles.amountSavedText}>
          {string.common.savingsOnBill.replace('{amount}', `${couponDiscountFees}`)}
        </Text>
      </View>
    );
  };

  const onApplyCoupon = (value: string) => {
    return validateCoupon(value);
  };

  const validateCoupon = (coupon: string, fireEvent?: boolean) => {
    let packageId = '';
    if (!!g(hdfcUserSubscriptions, '_id') && !!g(hdfcUserSubscriptions, 'isActive')) {
      packageId =
        g(hdfcUserSubscriptions, 'group', 'name') + ':' + g(hdfcUserSubscriptions, 'planId');
    }
    const timeSlot =
      tabs[0].title === selectedTab &&
      isOnlineConsult &&
      availableInMin! <= 60 &&
      0 < availableInMin!
        ? nextAvailableSlot
        : selectedTimeSlot;

    let ts = new Date(timeSlot).getTime();
    const data = {
      mobile: g(currentPatient, 'mobileNumber'),
      billAmount: Number(price),
      coupon: coupon,
      // paymentType: 'CASH', //CASH,NetBanking, CARD, COD
      pinCode: locationDetails?.pincode,
      consultations: [
        {
          hospitalId: g(doctor, 'doctorHospital')?.[0].facility?.id,
          doctorId: g(doctor, 'id'),
          specialityId: g(doctor, 'specialty', 'id'),
          consultationTime: ts, //Unix timestamp“
          consultationType: selectedTab === 'Consult Online' ? 1 : 0, //Physical 0, Virtual 1,  All -1
          cost: Number(price),
          rescheduling: false,
        },
      ],
      packageId: packageId,
      email: g(currentPatient, 'emailAddress'),
    };

    return new Promise((res, rej) => {
      validateConsultCoupon(data)
        .then((resp: any) => {
          setTimeout(() => {
            scrollviewRef.current.scrollToEnd({ animated: true });
          }, 300);
          if (resp?.data?.errorCode == 0) {
            if (resp?.data?.response?.valid) {
              const revisedAmount =
                Number(price) - Number(g(resp, 'data', 'response', 'discount')!);
              setCoupon(coupon);
              setCouponDiscountFees(Number(g(resp, 'data', 'response', 'discount')!));
              setDoctorDiscountedFees(revisedAmount);
              res();
              if (fireEvent) {
                const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_COUPON_APPLIED] = {
                  CouponCode: coupon,
                  'Discount Amount': Number(g(resp, 'data', 'response', 'discount')!),
                  'Net Amount': Number(revisedAmount),
                  'Coupon Applied': true,
                };
                postWebEngageEvent(WebEngageEventName.CONSULT_COUPON_APPLIED, eventAttributes);
              }
              if (Number(revisedAmount) == 0) {
                fireBaseFCM();
              }
            } else {
              rej(resp?.data?.response?.reason);
              if (fireEvent) {
                const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_COUPON_APPLIED] = {
                  CouponCode: coupon,
                  'Coupon Applied': false,
                };
                postWebEngageEvent(WebEngageEventName.CONSULT_COUPON_APPLIED, eventAttributes);
              }
            }
          } else {
            rej(resp.data.errorMsg);
          }
        })
        .catch((error) => {
          CommonBugFender('validatingConsultCoupon', error);
          console.log(error);
          rej();
          renderErrorPopup(`Something went wrong, plaease try again after sometime`);
        });
    });
  };

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const fireBaseFCM = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      console.log('enabled', enabled);
    } else {
      // user doesn't have permission
      console.log('not enabled');
      setNotificationAlert(true);
      try {
        const authorized = await firebase.messaging().requestPermission();
        console.log('authorized', authorized);

        // User has authorised
      } catch (error) {
        // User has rejected permissions
        CommonBugFender('Login_fireBaseFCM_try', error);
        console.log('not enabled error', error);
      }
    }
  };

  const renderBottomButton = () => {
    return (
      <View style={styles.bottomButtonView}>
        <Button
          title={`PAY ${string.common.Rs} ${amountToPay} `}
          style={styles.bottomBtn}
          onPress={() => onPressPay()}
        />
      </View>
    );
  };

  const onPressPay = () => {
    // Pay Button Clicked	event
    postWebEngagePayButtonClickedEvent();
    whatsappAPICalled();
    CommonLogEvent(AppRoutes.PaymentCheckout, 'Book Appointment clicked');
    CommonLogEvent(
      AppRoutes.PaymentCheckout,
      `PAY ${string.common.Rs} ${
        tabs[0].title === selectedTab
          ? doctor?.onlineConsultationFees
          : doctor?.physicalConsultationFees
      }`
    );
    getNetStatus()
      .then((status) => {
        if (status) {
          onSubmitBookAppointment();
        } else {
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultOverlay_getNetStatus_onPressPay', e);
      });
  };

  const onSubmitBookAppointment = async () => {
    CommonLogEvent(AppRoutes.PaymentCheckout, 'ConsultOverlay onSubmitBookAppointment clicked');
    // again check coupon is valid or not
    if (coupon) {
      try {
        // await validateAndApplyCoupon(coupon, isOnlineConsult, true);
        setshowSpinner(true);
        await validateCoupon(coupon, true);
        setshowSpinner(false);
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

    const amount = coupon ? doctorDiscountedFees : Number(price);

    if (amount == 0) {
      setshowSpinner(true);
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
          if (consultedWithDoctorBefore) {
            storeAppointmentId(g(apptmt, 'id')!);
          }
          // If amount is zero don't redirect to PG

          try {
            if (callSaveSearch !== 'true') {
              saveSearchDoctor(client, doctor?.id || '', patientId);

              saveSearchSpeciality(client, doctor?.specialty?.id, patientId);
            }
          } catch (error) {}
          setshowSpinner(false);
          makePayment(
            g(apptmt, 'id')!,
            Number(amount),
            g(apptmt, 'appointmentDateTime'),
            g(apptmt, 'displayId')!
          );
        })
        .catch((error) => {
          CommonBugFender('ConsultOverlay_onSubmitBookAppointment', error);
          setshowSpinner(false);
          let message = '';
          try {
            message = error?.message?.split(':')?.[1]?.trim();
          } catch (error) {
            CommonBugFender('ConsultOverlay_onSubmitBookAppointment_try', error);
          }
          if (message == 'APPOINTMENT_EXIST_ERROR') {
            renderErrorPopup(
              `Oops ! The selected slot is unavailable. Please choose a different one`
            );
          } else if (message === 'BOOKING_LIMIT_EXCEEDED') {
            renderErrorPopup(
              `Sorry! You have cancelled 3 appointments with this doctor in past 7 days, please try later or choose another doctor.`
            );
          } else if (
            message === 'OUT_OF_CONSULT_HOURS' ||
            message === 'DOCTOR_SLOT_BLOCKED' ||
            message === 'APPOINTMENT_BOOK_DATE_ERROR'
          ) {
            renderErrorPopup(
              `Slot you are trying to book is no longer available. Please try a different slot.`
            );
          } else {
            renderErrorPopup(`Something went wrong.${message ? ` Error Code: ${message}.` : ''}`);
          }
        });
    } else {
      props.navigation.navigate(AppRoutes.ConsultCheckout, {
        doctor: doctor,
        tabs: tabs,
        selectedTab: selectedTab,
        doctorName: `${g(doctor, 'fullName')}`,
        price: price,
        appointmentInput: appointmentInput,
        couponApplied: coupon == '' ? false : true,
        consultedWithDoctorBefore: consultedWithDoctorBefore,
        patientId: patientId,
        callSaveSearch: callSaveSearch,
      });
    }
  };

  const makePayment = (
    id: string,
    amountPaid: number,
    paymentDateTime: string,
    displayID: string
  ) => {
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
        let eventAttributes = getConsultationBookedEventAttributes(
          paymentDateTime,
          g(data, 'makeAppointmentPayment', 'appointment', 'id')!
        );
        eventAttributes['Display ID'] = displayID;
        postWebEngageEvent(WebEngageEventName.CONSULTATION_BOOKED, eventAttributes);
        postAppsFlyerEvent(
          AppsFlyerEventName.CONSULTATION_BOOKED,
          getConsultationBookedAppsFlyerEventAttributes(
            g(data, 'makeAppointmentPayment', 'appointment', 'id')!
          )
        );
        try {
        } catch (error) {}

        handleOrderSuccess(`${g(doctor, 'firstName')} ${g(doctor, 'lastName')}`);
      })
      .catch((e) => {
        handleGraphQlError(e);
      })
      .finally(() => setshowSpinner(false));
  };

  const handleOrderSuccess = (doctorName: string) => {
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: AppRoutes.ConsultRoom,
            params: {
              isFreeConsult: true,
              doctorName: doctorName,
            },
          }),
        ],
      })
    );
  };

  const getConsultationBookedAppsFlyerEventAttributes = (id: string) => {
    const eventAttributes: AppsFlyerEvents[AppsFlyerEventName.CONSULTATION_BOOKED] = {
      'customer id': g(currentPatient, 'id'),
      'doctor id': g(doctor, 'id')!,
      'specialty id': g(doctor, 'specialty', 'id')!,
      'consult type': 'Consult Online' === selectedTab ? 'online' : 'clinic',
      af_revenue: coupon ? doctorDiscountedFees : Number(price),
      af_currency: 'INR',
      'consult id': id,
      'coupon applied': coupon ? true : false,
    };
    return eventAttributes;
  };

  const getConsultationBookedEventAttributes = (time: string, id: string) => {
    const localTimeSlot = moment(new Date(time));
    let date = new Date(time);
    // date = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    const doctorClinics = (g(doctor, 'doctorHospital') || []).filter((item: any) => {
      if (item?.facility?.facilityType) return item?.facility?.facilityType === 'HOSPITAL';
    });

    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULTATION_BOOKED] = {
      name: g(doctor, 'fullName')!,
      specialisation: g(doctor, 'specialty', 'name')!,
      category: g(doctor, 'doctorType')!, // send doctorType
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
      'Speciality ID': g(doctor, 'specialty', 'id')!,
      'Consult Date Time': date,
      'Consult Mode': tabs[0].title === selectedTab ? 'Online' : 'Physical',
      'Hospital Name':
        doctorClinics?.length > 0 && doctor?.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics?.[0]?.facility?.name}`
          : '',
      'Hospital City':
        doctorClinics?.length > 0 && doctor?.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics?.[0]?.facility?.city}`
          : '',
      'Doctor ID': g(doctor, 'id')!,
      'Doctor Name': g(doctor, 'fullName')!,
      'Net Amount': coupon ? doctorDiscountedFees : Number(price),
      af_revenue: coupon ? doctorDiscountedFees : Number(price),
      af_currency: 'INR',
    };
    return eventAttributes;
  };

  const storeAppointmentId = async (appointmentId: string) => {
    if (!appointmentId) return;
    try {
      const ids = await AsyncStorage.getItem('APPOINTMENTS_CONSULTED_WITH_DOCTOR_BEFORE');
      const appointmentIds: string[] = ids ? JSON.parse(ids || '[]') : [];
      AsyncStorage.setItem(
        'APPOINTMENTS_CONSULTED_WITH_DOCTOR_BEFORE',
        JSON.stringify([...appointmentIds, appointmentId])
      );
    } catch (error) {
      console.log({ error });
    }
  };

  const whatsappAPICalled = () => {
    if (!g(currentPatient, 'whatsAppConsult')) {
      postWEGWhatsAppEvent(whatsAppUpdate);
      callWhatsOptAPICall(whatsAppUpdate);
    }
  };

  const callWhatsOptAPICall = async (optedFor: boolean) => {
    const userId = await dataSavedUserID('selectedProfileId');

    whatsAppUpdateAPICall(client, optedFor, optedFor, userId ? userId : g(currentPatient, 'id'))
      .then(({ data }: any) => {
        console.log(data, 'whatsAppUpdateAPICall');
        getPatientApiCall();
      })
      .catch((e: any) => {
        CommonBugFender('ConsultOverlay_whatsAppUpdateAPICall_error', e);
        console.log('error', e);
      });
  };

  const postWebEngagePayButtonClickedEvent = () => {
    const timeSlot =
      tabs[0].title === selectedTab &&
      isOnlineConsult &&
      availableInMin! <= 60 &&
      0 < availableInMin!
        ? nextAvailableSlot
        : selectedTimeSlot;
    const localTimeSlot = new Date(timeSlot);
    const doctorClinics = (g(doctor, 'doctorHospital') || []).filter((item: any) => {
      if (item?.facility?.facilityType) return item?.facility?.facilityType === 'HOSPITAL';
    });
    const eventAttributes: WebEngageEvents[WebEngageEventName.PAY_BUTTON_CLICKED] = {
      'Consult Date Time': localTimeSlot,
      Amount: Number(price),
      'Doctor Name': g(doctor, 'fullName')!,
      'Doctor City': g(doctor, 'city')!,
      'Type of Doctor': g(doctor, 'doctorType')!,
      'Doctor Specialty': g(doctor, 'specialty', 'name')!,
      // 'Appointment Date': localTimeSlot.format('DD-MM-YYYY'),
      // 'Appointment Time': localTimeSlot.format('hh:mm A'),
      'Actual Price': Number(price),
      'Discount used ?': !!coupon,
      'Discount coupon': coupon,
      'Discount Amount': coupon ? Number(price) - Number(doctorDiscountedFees) : 0,
      'Net Amount': coupon ? doctorDiscountedFees : Number(price),
      'Customer ID': g(currentPatient, 'id'),
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Patient UHID': g(currentPatient, 'uhid'),
      consultType: tabs[0].title === selectedTab ? 'online' : 'clinic',
      'Doctor ID': g(doctor, 'id')!,
      'Speciality ID': g(doctor, 'specialty', 'id')!,
      'Hospital Name':
        doctorClinics?.length > 0 && doctor?.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics?.[0]?.facility?.name}`
          : '',
      'Hospital City':
        doctorClinics?.length > 0 && doctor?.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics?.[0].facility?.city}`
          : '',
    };
    postWebEngageEvent(WebEngageEventName.PAY_BUTTON_CLICKED, eventAttributes);
    postFirebaseEvent(FirebaseEventName.PAY_BUTTON_CLICKED, eventAttributes);
  };

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {notificationAlert && (
          <NotificationPermissionAlert
            onPressOutside={() => setNotificationAlert(false)}
            onButtonPress={() => {
              setNotificationAlert(false);
              Linking.openSettings();
            }}
          />
        )}
        {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
        {showSpinner && <Spinner />}

        <ScrollView ref={scrollviewRef}>
          {renderDoctorCard()}
          {isCareDoctor && isCareSubscribed && renderCareMembershipAddedCard()}
          {renderApplyCoupon()}
          {renderPriceBreakup()}
          {renderDiscountView()}
        </ScrollView>
        {renderBottomButton()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  couponContainer: {
    ...theme.viewStyles.card(),
    borderRadius: 10,
    margin: 20,
    backgroundColor: 'white',
  },
  priceBreakupTitle: {
    ...theme.viewStyles.text('SB', 13, theme.colors.SHERPA_BLUE),
    marginHorizontal: 20,
    marginTop: 15,
  },
  seperatorLine: {
    marginTop: 4,
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
    marginHorizontal: 20,
  },
  couponStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  couponSavingView: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderRadius: 3,
    height: 32,
    backgroundColor: 'rgba(0, 179, 142, 0.07)',
    justifyContent: 'center',
    width: '100%',
  },
  amountSavedText: {
    ...theme.fonts.IBMPlexSansRegular(16),
    color: theme.colors.SEARCH_UNDERLINE_COLOR,
    fontWeight: '400',
    marginLeft: 8,
  },
  bottomButtonView: {
    backgroundColor: 'white',
    height: 80,
    justifyContent: 'center',
  },
  bottomBtn: {
    marginLeft: 35,
    width: width - 70,
  },
});
