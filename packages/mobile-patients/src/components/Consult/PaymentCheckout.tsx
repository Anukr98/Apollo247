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
  Platform,
} from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps } from 'react-navigation';
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
  apiCallEnums,
  navigateToHome,
  getUserType,
  getPackageIds,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  BookAppointmentInput,
  DoctorType,
  PLAN,
  OrderCreate,
  OrderVerticals,
  PAYMENT_MODE,
  OrderInput,
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
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  saveSearchDoctor,
  saveSearchSpeciality,
  whatsAppUpdateAPICall,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  bookAppointment,
  bookAppointmentVariables,
  bookAppointment_bookAppointment_appointment,
} from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import {
  BOOK_APPOINTMENT,
  BOOK_APPOINTMENT_WITH_SUBSCRIPTION,
  CREATE_ORDER,
  CREATE_USER_SUBSCRIPTION,
  CREATE_INTERNAL_ORDER,
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
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import { initiateSDK } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { isSDKInitialised } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import {
  one_apollo_store_code,
  PaymentStatus,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  createOrder,
  createOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrder';
import { saveConsultationLocation } from '@aph/mobile-patients/src/helpers/clientCalls';

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
    apisToCall,
    homeScreenParamsOnPop,
    activeUserSubscriptions,
    setauthToken,
  } = useAppCommonData();
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
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
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;
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
  const consultAmounttoPay =
    circlePlanSelected && isCircleDoctorOnSelectedConsultMode
      ? isOnlineConsult
        ? onlineConsultSlashedPrice - couponDiscountFees
        : physicalConsultSlashedPrice - couponDiscountFees
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
    initiateHyperSDK();
  }, []);

  const initiateHyperSDK = async () => {
    try {
      const isInitiated: boolean = await isSDKInitialised();
      !isInitiated && initiateSDK(currentPatient?.id, currentPatient?.id);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const bookAppointment = () => {
    const appointmentInput: bookAppointmentVariables = {
      bookAppointment: finalAppointmentInput,
    };
    return client.mutate<bookAppointment, bookAppointmentVariables>({
      mutation: BOOK_APPOINTMENT,
      variables: appointmentInput,
      fetchPolicy: 'no-cache',
    });
  };

  const bookAppointmentwithSubscription = () => {
    const appointmentSubscriptionInput = {
      bookAppointment: finalAppointmentInput,
      userSubscription: {
        mobile_number: currentPatient?.mobileNumber,
        plan_id: planId,
        sub_plan_id: circlePlanSelected?.subPlanId,
        storeCode,
        FirstName: currentPatient?.firstName,
        LastName: currentPatient?.lastName,
        payment_reference: {
          amount_paid: Number(circlePlanSelected?.currentSellingPrice),
          payment_status: PaymentStatus.PENDING,
          purchase_via_HC: false,
          HC_used: 0,
        },
        transaction_date_time: new Date().toISOString(),
      },
    };
    return client.mutate({
      mutation: BOOK_APPOINTMENT_WITH_SUBSCRIPTION,
      variables: appointmentSubscriptionInput,
      fetchPolicy: 'no-cache',
    });
  };

  const createOrderInternal = (orderId: string, subscriptionId?: string) => {
    const orders: OrderVerticals = {
      consult: [{ order_id: orderId, amount: consultAmounttoPay, patient_id: currentPatient?.id }],
    };
    if (subscriptionId) {
      orders['subscription'] = [
        {
          order_id: subscriptionId,
          amount: Number(circlePlanSelected?.currentSellingPrice),
          patient_id: currentPatient?.id,
        },
      ];
    }
    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: amountToPay,
      customer_id: currentPatient?.primaryPatientId || currentPatient?.id,
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const createJusPayOrder = (paymentId: string) => {
    const orderInput: OrderInput = {
      payment_order_id: paymentId,
      payment_mode: PAYMENT_MODE.PREPAID,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.returnUrl,
    };
    return client.mutate<createOrder, createOrderVariables>({
      mutation: CREATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
  };

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
      packageIds: activeUserSubscriptions ? getPackageIds(activeUserSubscriptions) : [],
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
    setLoading!(true);
    // again check coupon is valid or not
    verifyCoupon(true);
    try {
      const response =
        !circleSubscriptionId && circlePlanSelected && isCircleDoctorOnSelectedConsultMode
          ? await bookAppointmentwithSubscription()
          : await bookAppointment();
      const apptmt = g(response, 'data', 'bookAppointment', 'appointment');
      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
      consultedWithDoctorBefore && storeAppointmentId(g(apptmt, 'id')!);
      try {
        if (callSaveSearch !== 'true') {
          saveSearchDoctor(client, doctor?.id || '', patientId);
          saveSearchSpeciality(client, doctor?.specialty?.id, patientId);
        }
      } catch (error) {}
      const data = await createOrderInternal(apptmt?.id!, subscriptionId);
      if (amountToPay == 0) {
        const res = await createJusPayOrder(data?.data?.createOrderInternal?.payment_order_id!);
        makePayment(
          apptmt?.id!,
          Number(amountToPay),
          apptmt?.appointmentDateTime,
          `${apptmt?.displayId!}`
        );
      } else {
        if (data?.data?.createOrderInternal?.success) {
          setauthToken?.('');
          props.navigation.navigate(AppRoutes.PaymentMethods, {
            paymentId: data?.data?.createOrderInternal?.payment_order_id!,
            amount: amountToPay,
            orderDetails: getOrderDetails(apptmt),
            businessLine: 'consult',
          });
        }
      }
    } catch (error) {
      handleError(error);
    }
    setLoading!(false);
  };

  const getOrderDetails = (
    apptmt: bookAppointment_bookAppointment_appointment | null | undefined
  ) => {
    const orderDetails = {
      consultedWithDoctorBefore: consultedWithDoctorBefore,
      doctorName: doctor?.fullName,
      doctorID: doctor?.id,
      doctor: doctor,
      orderId: apptmt?.id,
      price: amountToPay,
      appointmentInput: appointmentInput,
      appointmentDateTime: appointmentInput.appointmentDateTime,
      appointmentType: appointmentInput.appointmentType,
      coupon: appointmentInput.couponCode,
      webEngageEventAttributes: getConsultationBookedEventAttributes(
        apptmt?.appointmentDateTime,
        apptmt?.id!
      ),
      appsflyerEventAttributes: getConsultationBookedAppsFlyerEventAttributes(
        apptmt?.id!,
        `${apptmt?.displayId!}`
      ),
      fireBaseEventAttributes: getConsultationBookedFirebaseEventAttributes(
        apptmt?.appointmentDateTime,
        apptmt?.id!
      ),
      planSelected: circlePlanSelected,
      isCircleDoctor: isCircleDoctorOnSelectedConsultMode,
      isDoctorsOfTheHourStatus,
      selectedTab,
    };
    return orderDetails;
  };

  const handleError = (error: any) => {
    CommonBugFender('ConsultOverlay_onSubmitBookAppointment', error);
    setLoading!(false);
    let message = '';
    message = error?.message?.split(':')?.[1]?.trim();
    switch (message) {
      case 'APPOINTMENT_EXIST_ERROR':
        renderErrorPopup(`Oops ! The selected slot is unavailable. Please choose a different one`);
        break;
      case 'BOOKING_LIMIT_EXCEEDED':
        renderErrorPopup(
          `Sorry! You have cancelled 3 appointments with this doctor in past 7 days, please try later or choose another doctor.`
        );
        break;
      case 'OUT_OF_CONSULT_HOURS':
      case 'DOCTOR_SLOT_BLOCKED':
      case 'APPOINTMENT_BOOK_DATE_ERROR':
        renderErrorPopup(
          `Slot you are trying to book is no longer available. Please try a different slot.`
        );
        break;
      default:
        renderErrorPopup(`Something went wrong.${message ? ` Error Code: ${message}.` : ''}`);
        break;
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
            paymentStatus: 'TXN_SUCCESS',
            paymentDateTime: paymentDateTime,
            responseCode: coupon,
            responseMessage: 'Coupon applied',
            orderId: id,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        let eventAttributes = getConsultationBookedEventAttributes(paymentDateTime, id);
        eventAttributes['Display ID'] = displayID;
        eventAttributes['User_Type'] = getUserType(allCurrentPatients);
        postWebEngageEvent(WebEngageEventName.CONSULTATION_BOOKED, eventAttributes);
        postAppsFlyerEvent(
          AppsFlyerEventName.CONSULTATION_BOOKED,
          getConsultationBookedAppsFlyerEventAttributes(id, displayID)
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
                // use apiCallsEnum values here in order to make that api call in home screen
                apisToCall.current = [
                  apiCallEnums.patientAppointments,
                  apiCallEnums.patientAppointmentsCount,
                ];
                const params = {
                  isFreeConsult: true,
                  doctorName: doctorName,
                  appointmentData: appointmentData[0],
                  skipAutoQuestions: doctor?.skipAutoQuestions,
                };
                homeScreenParamsOnPop.current = params;
                locationDetails && saveConsultationLocation(client, appointmentId, locationDetails);
                navigateToHome(props.navigation, params);
              }
            } catch (error) {}
          }
        } catch (error) {
          setLoading && setLoading(false);
          props.navigation.navigate('APPOINTMENTS');
        }
      })
      .catch((e) => {
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

  const getConsultationBookedFirebaseEventAttributes = (time: string, id: string) => {
    const localTimeSlot = moment(new Date(time));
    const doctorClinics = (g(doctor, 'doctorHospital') || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const eventAttributes: FirebaseEvents[FirebaseEventName.CONSULTATION_BOOKED] = {
      name: g(doctor, 'fullName')!,
      specialisation: g(doctor, 'specialty', 'userFriendlyNomenclature')!,
      category: g(doctor, 'doctorType')!, // send doctorType
      time: localTimeSlot.format('DD-MM-YYY, hh:mm A'),
      consultType: tabs[0].title === selectedTab ? 'online' : 'clinic',
      clinic_name: g(doctor, 'doctorHospital', '0' as any, 'facility', 'name')!,
      clinic_address:
        doctorClinics.length > 0 && doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}${doctorClinics[0].facility.name ? ', ' : ''}${
              doctorClinics[0].facility.city
            }`
          : '',
      Patient_Name: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      Patient_UHID: g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      Gender: g(currentPatient, 'gender'),
      Mobile_Number: g(currentPatient, 'mobileNumber'),
      Customer_ID: g(currentPatient, 'id'),
      Consult_ID: id,
      af_revenue: price,
      af_currency: 'INR',
      'Circle discount': circleDiscount,
    };
    return eventAttributes;
  };

  const getConsultationBookedEventAttributes = (time: string, id: string) => {
    const localTimeSlot = moment(new Date(time));
    let date = new Date(time);
    const doctorClinics = (g(props.doctor, 'doctorHospital') || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULTATION_BOOKED] = {
      name: g(doctor, 'fullName')!,
      specialisation: g(doctor, 'specialty', 'name')!,
      category: g(doctor, 'doctorType')!, // send doctorType
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
      User_Type: getUserType(allCurrentPatients),
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
    } catch (error) {}
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
      User_Type: getUserType(allCurrentPatients),
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
