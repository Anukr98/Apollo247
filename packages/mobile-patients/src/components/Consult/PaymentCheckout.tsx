import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  Linking,
  TouchableOpacity,
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
import { ArrowRight, CouponIcon, CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
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
  getUserType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  BookAppointmentInput,
  DoctorType,
  PLAN,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  calculateCircleDoctorPricing,
  convertNumberToDecimal,
  isPhysicalConsultation,
} from '@aph/mobile-patients/src/utils/commonUtils';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  validateConsultCoupon,
  userSpecificCoupon,
} from '@aph/mobile-patients/src/helpers/apiCalls';
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
  GET_APPOINTMENT_DATA,
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
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import messaging from '@react-native-firebase/messaging';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';

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
  const {
    locationDetails,
    hdfcPlanId,
    circlePlanId,
    hdfcStatus,
    circleStatus,
  } = useAppCommonData();
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
  const whatsAppUpdate = props.navigation.getParam('whatsAppUpdate');
  const isDoctorsOfTheHourStatus = props.navigation.getParam('isDoctorsOfTheHourStatus');
  const isOnlineConsult = selectedTab === 'Consult Online';
  const isPhysicalConsult = isPhysicalConsultation(selectedTab);
  const { currentPatient, allCurrentPatients, setCurrentPatientId } = useAllCurrentPatients();
  const [doctorDiscountedFees, setDoctorDiscountedFees] = useState<number>(0);
  const [couponDiscountFees, setCouponDiscountFees] = useState<number>(0);
  const { showAphAlert, setLoading } = useUIElements();
  const [notificationAlert, setNotificationAlert] = useState(false);
  const scrollviewRef = useRef<any>(null);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [showErrorSelect, setShowErrorSelect] = useState<boolean>(true); // default needs to be true to show select patient from the list
  const [isSelectedOnce, setIsSelectedOnce] = useState<boolean>(false);
  const [gender, setGender] = useState<string>(currentPatient?.gender);
  const [patientListYPos, setPatientListYPos] = useState<number>(0);
  const [patientProfiles, setPatientProfiles] = useState<any>([]);

  const circleDoctorDetails = calculateCircleDoctorPricing(
    doctor,
    isOnlineConsult,
    isPhysicalConsult
  );
  const {
    onlineConsultSlashedPrice,
    physicalConsultSlashedPrice,
    onlineConsultDiscountedPrice,
    physicalConsultDiscountedPrice,
    onlineConsultMRPPrice,
    physicalConsultMRPPrice,
    isCircleDoctorOnSelectedConsultMode,
  } = circleDoctorDetails;
  const { circleSubscriptionId, circlePlanSelected, hdfcSubscriptionId } = useShoppingCart();
  const [disabledCheckout, setDisabledCheckout] = useState<boolean>(
    isCircleDoctorOnSelectedConsultMode && !circleSubscriptionId
  );
  const discountedPrice = isOnlineConsult
    ? onlineConsultDiscountedPrice
    : physicalConsultDiscountedPrice;

  const amount = Number(price) - couponDiscountFees;
  const amountToPay =
    circlePlanSelected && isCircleDoctorOnSelectedConsultMode
      ? isOnlineConsult
        ? onlineConsultSlashedPrice -
          couponDiscountFees +
          (circleSubscriptionId == '' ? Number(circlePlanSelected?.currentSellingPrice) : 0)
        : physicalConsultSlashedPrice -
          couponDiscountFees +
          Number(circlePlanSelected?.currentSellingPrice)
      : amount;
  const notSubscriberUserForCareDoctor =
    isCircleDoctorOnSelectedConsultMode && !circleSubscriptionId && !circlePlanSelected;

  let finalAppointmentInput = appointmentInput;
  finalAppointmentInput['couponCode'] = coupon ? coupon : null;
  finalAppointmentInput['discountedAmount'] = doctorDiscountedFees;
  finalAppointmentInput['actualAmount'] =
    circlePlanSelected && isCircleDoctorOnSelectedConsultMode
      ? isOnlineConsult
        ? onlineConsultSlashedPrice
        : physicalConsultSlashedPrice
      : Number(price);
  const planPurchaseDetails = {
    TYPE: PLAN.CARE_PLAN,
    PlanAmount: circlePlanSelected?.currentSellingPrice,
  };
  finalAppointmentInput['planPurchaseDetails'] =
    circlePlanSelected && isCircleDoctorOnSelectedConsultMode ? planPurchaseDetails : null;

  const totalSavings =
    isCircleDoctorOnSelectedConsultMode && (circleSubscriptionId || circlePlanSelected)
      ? isOnlineConsult
        ? onlineConsultDiscountedPrice + couponDiscountFees
        : physicalConsultDiscountedPrice + couponDiscountFees
      : couponDiscountFees;

  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();
  const circleDiscount =
    (circleSubscriptionId || circlePlanSelected) && discountedPrice ? discountedPrice : 0;

  useEffect(() => {
    verifyCoupon();
  }, [circlePlanSelected]);

  useEffect(() => {
    setPatientProfiles(moveSelectedToTop());
    fetchUserSpecificCoupon();
  }, []);

  const fetchUserSpecificCoupon = () => {
    userSpecificCoupon(g(currentPatient, 'mobileNumber'), 'Consult')
      .then((resp: any) => {
        if (resp?.data?.errorCode == 0) {
          let couponList = resp?.data?.response;
          if (typeof couponList != null && couponList?.length) {
            const coupon = couponList?.[0]?.coupon;
            validateUserSpecificCoupon(coupon);
          }
        }
      })
      .catch((error) => {
        CommonBugFender('fetchingUserSpecificCoupon', error);
      });
  };

  async function validateUserSpecificCoupon(coupon: string) {
    try {
      await validateCoupon(coupon, true);
    } catch (error) {
      setCoupon('');
      setDoctorDiscountedFees(0);
      setLoading!(false);
      return;
    }
  }

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
        appointmentInput={finalAppointmentInput}
        doctorFees={price}
        selectedTab={selectedTab}
        circleSubscriptionId={circleSubscriptionId}
        planSelected={circlePlanSelected}
      />
    );
  };

  const renderCareMembershipAddedCard = () => {
    return <CareMembershipAdded doctor={doctor} isOnlineConsult={isOnlineConsult} />;
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
          circleSubscriptionId={circleSubscriptionId}
          planSelected={circlePlanSelected}
        />
      </View>
    );
  };

  const renderDiscountView = () => {
    return (
      <ConsultDiscountCard
        style={{
          marginBottom: notSubscriberUserForCareDoctor && amountToPay >= discountedPrice ? 0 : 20,
        }}
        coupon={coupon}
        couponDiscountFees={couponDiscountFees}
        doctor={doctor}
        selectedTab={selectedTab}
        circleSubscriptionId={circleSubscriptionId}
        planSelected={circlePlanSelected}
        onPressCard={() =>
          setTimeout(() => {
            scrollviewRef.current.scrollToEnd({ animated: true });
          }, 300)
        }
      />
    );
  };

  const renderPatient = () => {
    return (
      <View
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          setPatientListYPos(layout?.y);
        }}
        style={styles.subViewPopup}
      >
        <View style={{ paddingHorizontal: 6 }}>
          <Text style={styles.priceBreakupTitle}>PATIENT DETAILS</Text>
        </View>
        <View style={styles.seperatorLine} />
        {renderProfileListView()}
      </View>
    );
  };
  const renderProfileListView = () => {
    return (
      <View>
        <Text style={styles.congratulationsDescriptionStyle}>Who is the patient?</Text>
        <Text style={styles.popDescriptionStyle}>Prescription to be generated in the name of?</Text>
        {renderCTAs()}
      </View>
    );
  };

  const renderCTAs = () => (
    <View style={styles.aphAlertCtaViewStyle}>
      {patientProfiles?.map((item: any, index: any, array: any) =>
        item.firstName !== '+ADD MEMBER' ? (
          <TouchableOpacity
            onPress={() => {
              setLoading && setLoading(true);
              onSelectedProfile(item);
              setIsSelectedOnce(true);
              setShowErrorSelect(false);
            }}
            style={
              currentPatient?.id === item.id && isSelectedOnce
                ? styles.ctaSelectButtonViewStyle
                : styles.ctaWhiteButtonViewStyle
            }
          >
            <Text
              style={
                currentPatient?.id === item.id && isSelectedOnce
                  ? styles.ctaSelectTextStyle
                  : styles.ctaOrangeTextStyle
              }
            >
              {item.firstName}
            </Text>
            <Text
              style={
                currentPatient?.id === item.id && isSelectedOnce
                  ? styles.ctaSelectText2Style
                  : styles.ctaOrangeText2Style
              }
            >
              {Math.round(moment().diff(item.dateOfBirth || 0, 'years', true))}, {item.gender}
            </Text>
          </TouchableOpacity>
        ) : null
      )}
      <View style={[styles.textViewStyle]}>
        <Text
          onPress={() => {
            props.navigation.navigate(AppRoutes.EditProfile, {
              isEdit: false,
              isPoptype: true,
              mobileNumber: currentPatient && currentPatient!.mobileNumber,
              onNewProfileAdded: onNewProfileAdded,
            });
          }}
          style={[styles.ctaOrangeTextStyle]}
        >
          {'+ADD MEMBER'}
        </Text>
      </View>
      {showErrorSelect ? (
        <Text style={styles.errorSelectMessage}>
          *Please select the patient before proceeding to pay!
        </Text>
      ) : null}
    </View>
  );

  const onNewProfileAdded = (onAdd: any) => {
    finalAppointmentInput['patientId'] = onAdd?.id;
    setIsSelectedOnce(onAdd?.added);
    setShowErrorSelect(!onAdd?.added);
    let patientData = patientProfiles;
    patientData?.unshift(onAdd?.profileData);
    setPatientProfiles(patientData);
  };

  const onSelectedProfile = (item: any) => {
    selectUser(item);
    setLoading && setLoading(false);
  };
  const selectUser = (selectedUser: any) => {
    setGender(selectedUser?.gender);
    setCurrentPatientId(selectedUser?.id);
    AsyncStorage.setItem('selectUserId', selectedUser!.id);
    AsyncStorage.setItem('selectUserUHId', selectedUser!.uhid);
    AsyncStorage.setItem('isNewProfile', 'yes');
    moveSelectedToTop();
    finalAppointmentInput['patientId'] = selectedUser?.id;
  };

  const moveSelectedToTop = () => {
    if (currentPatient !== undefined) {
      const patientLinkedProfiles = [
        allCurrentPatients?.find((item: any) => item?.uhid === currentPatient.uhid),
        ...allCurrentPatients.filter((item: any) => item?.uhid !== currentPatient.uhid),
      ];
      return patientLinkedProfiles;
    }
    return [];
  };

  const renderCircleSubscriptionPlans = () => {
    return (
      <CircleMembershipPlans
        isConsultJourney={true}
        style={styles.careSelectContainer}
        navigation={props.navigation}
        careDiscountPrice={discountedPrice}
        doctorFees={isOnlineConsult ? onlineConsultMRPPrice : physicalConsultMRPPrice}
        onSelectMembershipPlan={() => {
          setTimeout(() => {
            scrollviewRef.current.scrollToEnd({ animated: true });
          }, 300);
        }}
        onEndApiCall={() => setDisabledCheckout(false)}
      />
    );
  };

  const renderApplyCoupon = () => {
    return (
      <ListCard
        container={[
          styles.couponContainer,
          { marginTop: isCircleDoctorOnSelectedConsultMode && !!circleSubscriptionId ? 0 : 20 },
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
        showRemoveBtn={coupon ? true : false}
        onRemoveCoupon={() => removeCoupon()}
      />
    );
  };

  const removeCoupon = () => {
    setCoupon('');
    setCouponDiscountFees(0);
    setDoctorDiscountedFees(0);
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
    const billAmount =
      circlePlanSelected && isCircleDoctorOnSelectedConsultMode
        ? isOnlineConsult
          ? onlineConsultSlashedPrice
          : physicalConsultSlashedPrice
        : Number(price);

    let packageId: string[] = [];
    if (hdfcSubscriptionId && hdfcStatus === 'active') {
      packageId.push(`HDFC:${hdfcPlanId}`);
    }
    if (circleSubscriptionId && circleStatus === 'active') {
      packageId.push(`APOLLO:${circlePlanId}`);
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
      billAmount: billAmount,
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
          cost: billAmount,
          rescheduling: false,
        },
      ],
      packageIds: packageId,
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
              const revisedAmount = billAmount - Number(g(resp, 'data', 'response', 'discount')!);
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
          renderErrorPopup(string.common.tryAgainLater);
        });
    });
  };

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const fireBaseFCM = async () => {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        setNotificationAlert(true);
        await messaging().requestPermission();
      }
    } catch (error) {
      CommonBugFender('ConsultOverlay_FireBaseFCM_Error', error);
    }
  };

  const renderBottomButton = () => {
    return (
      <View style={styles.bottomButtonView}>
        <Button
          title={`PAY ${string.common.Rs}${convertNumberToDecimal(amountToPay)} `}
          style={styles.bottomBtn}
          onPress={() => onPressPay()}
          disabled={disabledCheckout}
        />
      </View>
    );
  };

  const onPressPay = () => {
    scrollviewRef.current.scrollTo({
      x: 0,
      y: patientListYPos - 10,
      animated: true,
    });
    if (isSelectedOnce) {
      // Pay Button Clicked	event
      postWebEngagePayButtonClickedEvent();
      whatsappAPICalled();
      CommonLogEvent(AppRoutes.PaymentCheckout, 'Book Appointment clicked');
      CommonLogEvent(AppRoutes.PaymentCheckout, `PAY ${string.common.Rs} ${amountToPay}`);
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
    } else {
      setShowErrorSelect(true);
    }
  };

  const verifyCoupon = async (fromPayment?: boolean) => {
    if (coupon) {
      try {
        // await validateAndApplyCoupon(coupon, isOnlineConsult, true);
        setLoading!(true);
        await validateCoupon(coupon, true);
        !fromPayment && setLoading!(false);
      } catch (error) {
        setCoupon('');
        setDoctorDiscountedFees(0);
        setLoading!(false);
        Alert.alert(
          'Uh oh.. :(',
          typeof error == 'string' && error
            ? error
            : 'Oops! seems like we are having an issue with coupon code. Please try again.'
        );
        return;
      }
    }
  };

  const onSubmitBookAppointment = async () => {
    CommonLogEvent(AppRoutes.PaymentCheckout, 'ConsultOverlay onSubmitBookAppointment clicked');
    // again check coupon is valid or not
    verifyCoupon(true);

    if (amountToPay == 0) {
      setLoading!(true);
      client
        .mutate<bookAppointment>({
          mutation: BOOK_APPOINTMENT,
          variables: {
            bookAppointment: finalAppointmentInput,
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
          makePayment(
            g(apptmt, 'id')!,
            Number(amountToPay),
            g(apptmt, 'appointmentDateTime'),
            g(apptmt, 'displayId')!
          );
        })
        .catch((error) => {
          CommonBugFender('ConsultOverlay_onSubmitBookAppointment', error);
          setLoading!(false);
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
      setLoading!(false);
      props.navigation.navigate(AppRoutes.ConsultCheckout, {
        doctor: doctor,
        tabs: tabs,
        selectedTab: selectedTab,
        doctorName: `${g(doctor, 'fullName')}`,
        price: amountToPay,
        appointmentInput: finalAppointmentInput,
        couponApplied: coupon == '' ? false : true,
        consultedWithDoctorBefore: consultedWithDoctorBefore,
        patientId: patientId,
        callSaveSearch: callSaveSearch,
        planSelected: circlePlanSelected,
        circleDiscount,
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
        let eventAttributes = getConsultationBookedEventAttributes(
          paymentDateTime,
          g(data, 'makeAppointmentPayment', 'appointment', 'id')!
        );
        eventAttributes['Display ID'] = displayID;
        eventAttributes['User_Type'] = getUserType(currentPatient);
        postWebEngageEvent(WebEngageEventName.CONSULTATION_BOOKED, eventAttributes);
        postAppsFlyerEvent(
          AppsFlyerEventName.CONSULTATION_BOOKED,
          getConsultationBookedAppsFlyerEventAttributes(
            g(data, 'makeAppointmentPayment', 'appointment', 'id')!,
            displayID
          )
        );
        setLoading!(false);
        if (!currentPatient?.isConsulted) getPatientApiCall();
        handleOrderSuccess(`${g(doctor, 'firstName')} ${g(doctor, 'lastName')}`, id);
      })
      .catch((e) => {
        setLoading!(false);
        handleGraphQlError(e);
      });
  };

  const handleOrderSuccess = (doctorName: string, appointmentId: string) => {
    setLoading && setLoading(true);
    client
      .query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        try {
          setLoading && setLoading(false);
          const appointmentData = _data?.data?.getAppointmentData?.appointmentsHistory;
          if (appointmentData) {
            try {
              if (appointmentData?.[0]?.doctorInfo !== null) {
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
                          appointmentData: appointmentData[0],
                          skipAutoQuestions: doctor?.skipAutoQuestions,
                        },
                      }),
                    ],
                  })
                );
              }
            } catch (error) {}
          }
        } catch (error) {
          setLoading && setLoading(false);
          props.navigation.navigate('APPOINTMENTS');
        }
      })
      .catch((e) => {
        console.log('Error occured while GetDoctorNextAvailableSlot', { e });
        setLoading && setLoading(false);
        props.navigation.navigate('APPOINTMENTS');
      });
  };

  const getConsultationBookedAppsFlyerEventAttributes = (id: string, displayId: string) => {
    const eventAttributes: AppsFlyerEvents[AppsFlyerEventName.CONSULTATION_BOOKED] = {
      'customer id': g(currentPatient, 'id'),
      'doctor id': g(doctor, 'id')!,
      'specialty id': g(doctor, 'specialty', 'id')!,
      'consult type': 'Consult Online' === selectedTab ? 'online' : 'clinic',
      af_revenue: amountToPay,
      af_currency: 'INR',
      'consult id': id,
      displayId: displayId,
      'coupon applied': coupon ? true : false,
      'Circle discount': circleDiscount,
    };
    return eventAttributes;
  };

  const getConsultationBookedEventAttributes = (time: string, id: string) => {
    const localTimeSlot = moment(new Date(time));
    let date = new Date(time);
    // date = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    const doctorClinics = (g(props.doctor, 'doctorHospital') || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
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
      'Consult Mode': 'Online',
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
      'Net Amount': amountToPay,
      af_revenue: amountToPay,
      af_currency: 'INR',
      'Dr of hour appointment': !!isDoctorsOfTheHourStatus ? 'Yes' : 'No',
      'Circle discount': circleDiscount,
      User_Type: getUserType(currentPatient),
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
      Amount: finalAppointmentInput?.actualAmount,
      'Doctor Name': g(doctor, 'fullName')!,
      'Doctor City': g(doctor, 'city')!,
      'Type of Doctor': g(doctor, 'doctorType')!,
      'Doctor Specialty': g(doctor, 'specialty', 'name')!,
      // 'Appointment Date': localTimeSlot.format('DD-MM-YYYY'),
      // 'Appointment Time': localTimeSlot.format('hh:mm A'),
      'Actual Price': finalAppointmentInput?.actualAmount,
      'Discount used ?': !!coupon,
      'Discount coupon': coupon,
      'Discount Amount': couponDiscountFees,
      'Net Amount': amountToPay,
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
      User_Type: getUserType(currentPatient),
    };
    postWebEngageEvent(WebEngageEventName.PAY_BUTTON_CLICKED, eventAttributes);
    postFirebaseEvent(FirebaseEventName.PAY_BUTTON_CLICKED, eventAttributes);
  };

  const renderSaveWithCarePlanView = () => {
    return (
      <View
        style={[
          styles.saveWithCareView,
          {
            elevation: totalSavings > 0 ? 2 : 4,
          },
        ]}
      >
        <Text style={styles.smallText}>
          You could have{' '}
          <Text style={{ ...theme.viewStyles.text('M', 12, theme.colors.SEARCH_UNDERLINE_COLOR) }}>
            saved {string.common.Rs}
            {convertNumberToDecimal(discountedPrice)}
          </Text>{' '}
          on this purchase with
        </Text>
        <CircleLogo style={styles.careLogo} />
      </View>
    );
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
        <ScrollView ref={scrollviewRef}>
          {renderDoctorCard()}
          {renderPatient()}
          {isCircleDoctorOnSelectedConsultMode && !!circleSubscriptionId
            ? renderCareMembershipAddedCard()
            : null}
          {isCircleDoctorOnSelectedConsultMode && !circleSubscriptionId
            ? renderCircleSubscriptionPlans()
            : null}
          {renderApplyCoupon()}
          {renderPriceBreakup()}
          {renderDiscountView()}
          {notSubscriberUserForCareDoctor &&
            amountToPay >= discountedPrice &&
            renderSaveWithCarePlanView()}
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
    height: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  priceBreakupTitle: {
    ...theme.viewStyles.text('B', 13, theme.colors.SHERPA_BLUE),
    marginHorizontal: 16,
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
  saveWithCareView: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    borderRadius: 5,
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    padding: 10,
    marginBottom: 20,
    elevation: 2,
  },
  smallText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE),
    maxWidth: width - 100,
  },
  careLogo: {
    width: 40,
    height: 20,
  },
  careLogoText: {
    ...theme.viewStyles.text('SB', 7, theme.colors.WHITE),
  },
  careSelectContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    marginVertical: 8,
  },
  ctaWhiteButtonViewStyle: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginRight: 15,
    marginVertical: 5,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaSelectButtonViewStyle: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: '#fc9916',
    marginRight: 15,
    marginVertical: 5,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaSelectTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24),
    marginHorizontal: 5,
  },
  ctaSelectText2Style: {
    ...theme.viewStyles.text('R', 10, '#ffffff', 1, 20),
    textAlign: 'center',
    marginHorizontal: 5,
  },
  errorSelectMessage: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 14, '#E31E24', 1, 20),
    marginBottom: 5,
    width: '100%',
  },
  textViewStyle: {
    marginTop: 8,
    paddingVertical: 8,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  ctaOrangeText2Style: {
    ...theme.viewStyles.text('R', 10, '#fc9916', 1, 20),
    textAlign: 'center',
    marginHorizontal: 5,
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
    marginVertical: 10,
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 20,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  popDescriptionStyle: {
    marginHorizontal: 20,
    marginTop: 8,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
});
