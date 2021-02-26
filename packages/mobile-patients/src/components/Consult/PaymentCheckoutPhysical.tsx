import React, { useState, useRef } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  Linking,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { ProfileList } from '../ui/ProfileList';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { dateFormatter } from '@aph/mobile-patients/src/utils/dateUtil';
import { ConsultPriceBreakup } from '@aph/mobile-patients/src/components/ui/ConsultPriceBreakup';
import {
  CircleLogo,
  DoctorPlaceholderImage,
  DropdownGreen,
  LinkedUhidIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
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
  PLAN,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  calculateCircleDoctorPricing,
  isPhysicalConsultation,
} from '@aph/mobile-patients/src/utils/commonUtils';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  CommonBugFender,
  CommonLogEvent,
  setBugFenderLog,
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
import messaging from '@react-native-firebase/messaging';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';

interface PaymentCheckoutPhysicalProps extends NavigationScreenProps {
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
export const PaymentCheckoutPhysical: React.FC<PaymentCheckoutPhysicalProps> = (props) => {
  const [coupon, setCoupon] = useState<string>('');
  const consultedWithDoctorBefore = props.navigation.getParam('consultedWithDoctorBefore');
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
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
  const [doctorDiscountedFees, setDoctorDiscountedFees] = useState<number>(0);
  const [showList, setShowList] = useState<boolean>(false);
  const { currentPatient, allCurrentPatients, setCurrentPatientId } = useAllCurrentPatients();
  const [showProfilePopUp, setShowProfilePopUp] = useState<boolean>(false);
  const [couponDiscountFees, setCouponDiscountFees] = useState<number>(0);
  const { showAphAlert, setLoading } = useUIElements();
  const [notificationAlert, setNotificationAlert] = useState(false);
  const scrollviewRef = useRef<any>(null);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [gender, setGender] = useState<string>(currentPatient?.gender);

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
    isCircleDoctorOnSelectedConsultMode,
  } = circleDoctorDetails;
  const { circleSubscriptionId, circlePlanSelected } = useShoppingCart();
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

  const renderPrice = () => {
    return (
      <View>
        <Text style={styles.priceBreakupTitle}>{string.common.totalCharges}</Text>
        <View style={styles.seperatorLine} />
        <View style={styles.containerPay}>
          <View style={styles.rowContainerPay}>
            <Text style={styles.regularTextPay}>{string.common.toPay}</Text>
            <Text style={{ ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE) }}>
              {string.common.Rs}
              {price}
            </Text>
          </View>
        </View>

        <Text style={styles.priceBreakupTitle}>{string.common.oneTimePhysicalCharge}</Text>
      </View>
    );
  };
  const renderPatient = () => {
    console.log('finalAppointmentInput', finalAppointmentInput);

    console.log('patient change', currentPatient?.id);
    return (
      <View style={styles.subViewPopup}>
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.priceBreakupTitle}>PATIENT DETAILS</Text>
        </View>
        <View style={styles.seperatorLine} />
        {/* <Text
          style={[styles.specializationStyle, { marginLeft: 6, flexWrap: 'wrap', fontSize: 14 }]}
        >
          {g(currentPatient, 'firstName')} {g(currentPatient, 'lastName')}
        </Text>
        <Text
          style={[styles.specializationStyle, { marginLeft: 6, flexWrap: 'wrap', fontSize: 14 }]}
        >
          {Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true))} ,
          {g(currentPatient, 'gender')}
        </Text> */}

        {renderProfileListView()}
      </View>
    );
  };

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

  const renderDoctorProfile = () => {
    return (
      <View style={{ marginLeft: isCircleDoctorOnSelectedConsultMode ? 3.5 : 0 }}>
        {!!g(doctor, 'photoUrl') ? (
          <Image
            style={styles.doctorProfile}
            source={{
              uri: doctor?.photoUrl!,
            }}
            resizeMode={'contain'}
          />
        ) : (
          <DoctorPlaceholderImage />
        )}
      </View>
    );
  };
  const renderDoctorCard = () => {
    return (
      <View>
        <View style={styles.rowContainerDoc}>
          <View style={{ width: width - 140 }}>
            <Text style={styles.doctorNameStyle}>{doctor?.displayName}</Text>
            <Text style={styles.specializationStyle}>
              {doctor?.specialty?.name || ''} | {doctor?.experience} YR
              {Number(doctor?.experience) != 1 ? 'S Exp.' : ' Exp.'}
            </Text>
            <View style={styles.doctorPointers}>
              <Image
                style={styles.doctorPointersImage}
                source={require('@aph/mobile-patients/src/components/ui/icons/appointmentMarker.png')}
                resizeMode={'contain'}
              />
              <Text style={styles.appointmentTimeStyle}>Meet In Person</Text>
            </View>
            <View style={styles.doctorPointers}>
              <Image
                style={styles.doctorPointersImage}
                source={require('@aph/mobile-patients/src/components/ui/icons/calendarAppointment.png')}
                resizeMode={'contain'}
              />
              <Text style={styles.appointmentTimeStyle}>
                {dateFormatter(appointmentInput?.appointmentDateTime)}
              </Text>
            </View>
            <Text style={styles.regularText}></Text>
          </View>
          <View>
            <View>{renderDoctorProfile()}</View>
          </View>
        </View>

        <View style={{ width: width - 40 }}>
          <Text style={styles.priceBreakupTitle}>LOCATION</Text>
          <View style={styles.seperatorLine} />

          <View>
            <Text
              style={[styles.specializationStyle, { margin: 6, flexWrap: 'wrap', fontSize: 14 }]}
            >
              {`${doctor?.doctorHospital?.[0].facility?.streetLine1}, ${
                doctor?.doctorHospital?.[0].facility?.streetLine2
                  ? `${doctor?.doctorHospital?.[0].facility?.streetLine2}, `
                  : ''
              }${doctor?.doctorHospital?.[0].facility?.city}`}
            </Text>
            {Platform.OS === 'android' && (
              <TouchableOpacity onPress={() => openMaps()}>
                <Text style={[styles.specializationStyle, styles.mapsStyle]}>
                  https://www.google.com/maps/dir/
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const openMaps = () => {
    let query = `${doctor?.doctorHospital?.[0].facility?.streetLine1},
              ${doctor?.doctorHospital?.[0].facility?.city}`;
    let url = `google.navigation:q=${query}`;

    try {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          setBugFenderLog('FAILED_OPEN_URL', url);
        }
      });
    } catch (e) {
      setBugFenderLog('FAILED_OPEN_URL', url);
    }
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

  const renderCTAs = () => (
    <View style={styles.aphAlertCtaViewStyle}>
      {moveSelectedToTop()
        ?.slice(0, 5)
        ?.map((item: any, index: any, array: any) =>
          item.firstName !== '+ADD MEMBER' ? (
            <TouchableOpacity
              onPress={() => {
                onSelectedProfile(item);
              }}
              style={
                currentPatient?.id === item.id
                  ? styles.ctaSelectButtonViewStyle
                  : styles.ctaWhiteButtonViewStyle
              }
            >
              <Text
                style={
                  currentPatient?.id === item.id
                    ? styles.ctaSelectTextStyle
                    : styles.ctaOrangeTextStyle
                }
              >
                {item.firstName}
              </Text>
              <Text
                style={
                  currentPatient?.id === item.id
                    ? styles.ctaSelectText2Style
                    : styles.ctaOrangeText2Style
                }
              >
                {Math.round(moment().diff(item.dateOfBirth || 0, 'years', true))} ,{item.gender}
              </Text>
              {console.log('csk pat', item)}
            </TouchableOpacity>
          ) : null
        )}
      <View style={[styles.textViewStyle]}>
        <Text
          onPress={() => {
            if (allCurrentPatients.length > 6) {
              setShowList(true);
            } else {
              setShowProfilePopUp(false);
              props.navigation.navigate(AppRoutes.EditProfile, {
                isEdit: false,
                isPoptype: true,
                mobileNumber: currentPatient && currentPatient!.mobileNumber,
              });
            }
          }}
          style={[styles.ctaOrangeTextStyle]}
        >
          {allCurrentPatients.length > 6 ? 'OTHERS' : '+ADD MEMBER'}
        </Text>
      </View>
    </View>
  );
  const onSelectedProfile = (item: any) => {
    setshowSpinner(true);
    selectUser(item);
    setShowProfilePopUp(false);
  };
  const onProfileChange = () => {
    setShowList(false);

    setTimeout(() => {
      setShowProfilePopUp(false);
    }, 1000);
  };

  const renderProfileDrop = () => {
    return (
      <ProfileList
        showList={showList}
        menuHidden={() => setShowList(false)}
        onProfileChange={onProfileChange}
        navigation={props.navigation}
        saveUserChange={true}
        listContainerStyle={{ marginTop: Platform.OS === 'ios' ? 10 : 60 }}
        childView={
          <View
            style={{
              flexDirection: 'row',
              paddingRight: 8,
              borderRightWidth: 0,
              borderRightColor: 'rgba(2, 71, 91, 0.2)',
              backgroundColor: theme.colors.CLEAR,
            }}
          >
            <Text style={styles.hiTextStyle}>{'Hi'}</Text>
            <View style={styles.nameTextContainerStyle}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.nameTextStyle} numberOfLines={1}>
                  {(currentPatient && currentPatient!.firstName + ' ' + currentPatient!.lastName) ||
                    ''}
                </Text>
                {currentPatient && g(currentPatient, 'isUhidPrimary') ? (
                  <LinkedUhidIcon
                    style={{
                      width: 22,
                      height: 20,
                      marginLeft: 5,
                      marginTop: Platform.OS === 'ios' ? 26 : 30,
                    }}
                    resizeMode={'contain'}
                  />
                ) : null}
                <View style={{ paddingTop: 28 }}>
                  <DropdownGreen />
                </View>
              </View>
              <View style={styles.seperatorStyle} />
            </View>
          </View>
        }
        // setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
        unsetloaderDisplay={true}
      />
    );
  };

  const renderProfileListView = () => {
    return (
      <View>
        {/*renderProfileDrop()*/}

        {showSpinner && <Spinner />}
        <Text style={styles.congratulationsDescriptionStyle}>Who is the patient?</Text>
        <Text style={styles.popDescriptionStyle}>Prescription to be generated in the name of?</Text>
        {renderCTAs()}
      </View>
    );
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

        <Text style={styles.priceBreakupTitle}>{string.common.oneTimePhysicalCharge}</Text>
      </View>
    );
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
          title={`PAY AT HOSPITAL`}
          style={styles.bottomBtn}
          onPress={() => onPressPay()}
          disabled={false}
        />
      </View>
    );
  };

  const onPressPay = () => {
    // Pay Button Clicked	event
    postWebEngagePayButtonClickedEvent();
    whatsappAPICalled();
    CommonLogEvent(AppRoutes.PaymentCheckoutPhysical, 'Book Appointment clicked');
    CommonLogEvent(AppRoutes.PaymentCheckoutPhysical, `PAY AT HOSPITAL`);
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

  const selectUser = (selectedUser: any) => {
    setGender(selectedUser?.gender);
    setCurrentPatientId(selectedUser?.id);
    AsyncStorage.setItem('selectUserId', selectedUser!.id);
    AsyncStorage.setItem('selectUserUHId', selectedUser!.uhid);
    AsyncStorage.setItem('isNewProfile', 'yes');
    moveSelectedToTop();
    setshowSpinner(false);
  };

  const onSubmitBookAppointment = async () => {
    CommonLogEvent(
      AppRoutes.PaymentCheckoutPhysical,
      'ConsultOverlay onSubmitBookAppointment clicked'
    );

    console.log('finalAppointmentInput', finalAppointmentInput);

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
        console.log('csk data-------', JSON.stringify(data));
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
          g(apptmt, 'paymentOrderId')!,
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
            paymentStatus: 'SUCCESS',
            paymentDateTime: paymentDateTime,
            responseCode: coupon,
            responseMessage: 'Physical Mobile Api Call',
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
            g(data, 'makeAppointmentPayment', 'appointment', 'id')!,
            displayID
          )
        );
        setLoading!(false);
        handleOrderSuccess(
          `${g(doctor, 'firstName')} ${g(doctor, 'lastName')}`,
          g(data, 'makeAppointmentPayment', 'appointment', 'appointment', 'id')!
        );
      })
      .catch((e) => {
        setLoading!(false);
        handleGraphQlError(e);
      });
  };

  const handleOrderSuccess = (doctorName: string, appointmentId: string) => {
    console.log('csk', 'handleOrderSuccess', appointmentId);
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
        console.log('csk', 'getAppointmentData-->', JSON.stringify(_data));
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
                          isPhysicalConsultBooked: true,
                          doctorName: doctorName,
                          appointmentData: appointmentData[0],
                          skipAutoQuestions: doctor?.skipAutoQuestions,
                        },
                      }),
                    ],
                  })
                );
              }
            } catch (error) {
              console.log('csk', error);
            }
          }
        } catch (error) {
          setLoading && setLoading(false);
          console.log('csk', error);
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
      'Net Amount': amountToPay,
      af_revenue: amountToPay,
      af_currency: 'INR',
      'Dr of hour appointment': !!isDoctorsOfTheHourStatus ? 'Yes' : 'No',
      'Circle discount': circleDiscount,
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
        <ScrollView ref={scrollviewRef}>
          <View style={styles.doctorCard}>
            {renderDoctorCard()}
            {renderPatient()}
            {renderPrice()}
          </View>
        </ScrollView>
        {renderBottomButton()}
        {showProfilePopUp && renderProfileListView()}
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
    marginHorizontal: 8,
    marginVertical: 6,
  },
  seperatorLine: {
    marginTop: 2,
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.3,
    marginHorizontal: 4,
  },
  couponStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  containerPay: {
    borderRadius: 10,
    ...theme.viewStyles.card(10),
    marginLeft: 1,
    paddingVertical: 16,
    width: '98%',
  },
  rowContainerPay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regularTextPay: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE),
  },
  seperatorLinePay: {
    marginVertical: 12,
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
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
  doctorCard: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 20,
    backgroundColor: '#F7F8F5',
    borderRadius: 0,
    marginTop: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },
  careLogoText: {
    ...theme.viewStyles.text('SB', 7, theme.colors.WHITE),
  },
  careSelectContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  doctorFees: {
    ...theme.viewStyles.text('M', 15, theme.colors.LIGHT_BLUE),
  },
  doctorProfile: {
    height: 80,
    borderRadius: 40,
    width: 80,
    alignSelf: 'center',
  },
  doctorPointers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  doctorPointersImage: {
    width: 14,
    height: '100%',
    marginRight: 4,
  },
  drImageBackground: {
    height: 95,
    width: 95,
    justifyContent: 'center',
  },
  rowContainerDoc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doctorNameStyle: {
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(23),
    color: theme.colors.SEARCH_DOCTOR_NAME,
    marginTop: 4,
  },
  specializationStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SKY_BLUE,
    marginTop: 2,
  },
  regularText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginTop: 18,
  },
  appointmentTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475B',
    marginTop: 1,
    marginLeft: 4,
  },
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.01)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    elevation: 5,
  },
  container: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  mainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '98%',
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
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  popDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  ctaWhiteButtonViewStyle: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginRight: 15,
    marginVertical: 2,
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
    marginVertical: 2,
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
    ...theme.viewStyles.text('R', 10, '#ffffff', 1, 24),
    textAlign: 'center',
    marginHorizontal: 5,
  },
  textViewStyle: {
    padding: 8,
    marginRight: 15,
    marginVertical: 5,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  ctaOrangeText2Style: {
    ...theme.viewStyles.text('R', 10, '#fc9916', 1, 24),
    textAlign: 'center',
    marginHorizontal: 5,
  },
  hiTextStyle: {
    marginLeft: 20,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  nameTextContainerStyle: {
    maxWidth: '75%',
  },
  nameTextStyle: {
    marginLeft: 5,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  mapsStyle: {
    margin: 6,
    flexWrap: 'wrap',
    fontSize: 14,
    color: '#FC9916',
  },
});
