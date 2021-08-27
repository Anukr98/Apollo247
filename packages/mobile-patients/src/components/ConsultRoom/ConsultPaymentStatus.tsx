import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ConsultFailure,
  ConsultPending,
  ConsultSuccess,
  Copy,
  CircleLogo,
  LocationOn,
  Remove,
  PdfGray,
  EmailGray,
  Pdf,
  RightArrowBlue,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CONSULT_ORDER_INVOICE,
  GET_APPOINTMENT_DATA,
  GET_TRANSACTION_STATUS,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  UPDATE_APPOINTMENT,
  GET_APPOINTMENT_INFO,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  overlyCallPermissions,
  g,
  doRequestAndAccessLocationModified,
  checkPermissions,
  apiCallEnums,
  getUserType,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  autoCompletePlaceSearch,
  getPlaceInfoByPlaceId,
  getPlaceInfoByLatLng,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string, { Payment, NewPaymentStatuses } from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '../../graphql/types/getAppointmentData';
import { AppsFlyerEventName } from '../../helpers/AppsFlyerEvents';
import { FirebaseEvents, FirebaseEventName } from '../../helpers/firebaseEvents';
import messaging from '@react-native-firebase/messaging';
import { NotificationPermissionAlert } from '@aph/mobile-patients/src/components/ui/NotificationPermissionAlert';
import { Snackbar } from 'react-native-paper';
import { SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import AsyncStorage from '@react-native-community/async-storage';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddedCirclePlanWithValidity } from '@aph/mobile-patients/src/components/ui/AddedCirclePlanWithValidity';
import { paymentTransactionStatus_paymentTransactionStatus_appointment_amountBreakup } from '@aph/mobile-patients/src/graphql/types/paymentTransactionStatus';
import {
  updateAppointmentVariables,
  updateAppointment,
} from '@aph/mobile-patients/src/graphql/types/updateAppointment';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import moment from 'moment';
import {
  convertNumberToDecimal,
  findAddrComponents,
} from '@aph/mobile-patients/src/utils/commonUtils';
import {
  useAppCommonData,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  consultUserLocationCleverTapEvents,
  userLocationConsultWEBEngage,
} from '@aph/mobile-patients/src/helpers/CommonEvents';
import {
  getAppointmentInfo,
  getAppointmentInfoVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentInfo';
import { PAYMENT_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { saveConsultationLocation } from '@aph/mobile-patients/src/helpers/clientCalls';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { RenderPdf } from '../ui/RenderPdf';

export interface ConsultPaymentStatusProps extends NavigationScreenProps {}

export const ConsultPaymentStatus: React.FC<ConsultPaymentStatusProps> = (props) => {
  const [showSpinner, setShowSpinner] = useState<boolean>(true);
  const { success, failure, pending } = NewPaymentStatuses;
  const [status, setStatus] = useState<string>(
    props.navigation.getParam('paymentStatus') == 'success'
      ? success
      : props.navigation.getParam('paymentStatus') == 'pending'
      ? pending
      : pending
  );
  const [displayId, setdisplayId] = useState<String>('');
  const paymentId = props.navigation.getParam('paymentId');
  const orderDetails = props.navigation.getParam('orderDetails');
  const {
    price,
    orderId,
    doctorName,
    doctorID,
    doctor,
    appointmentDateTime,
    appointmentType,
    webEngageEventAttributes,
    cleverTapConsultBookedEventAttributes,
    appsflyerEventAttributes,
    fireBaseEventAttributes,
    isDoctorsOfTheHourStatus,
    coupon,
    isCircleDoctor,
  } = orderDetails;
  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [notificationAlert, setNotificationAlert] = useState(false);
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [showEmailInput, setshowEmailInput] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(currentPatient?.emailAddress || '');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [circlePlanDetails, setCirclePlanDetails] = useState();
  const [locationSearchText, setLocationSearchText] = useState<string>('');
  const [showLocationPopup, setShowLocationPopup] = useState<boolean>(false);
  const [locationSearchList, setlocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );
  const [showLocations, setshowLocations] = useState<boolean>(false);
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const fireLocationEvent = useRef<boolean>(false);
  const userChangedLocation = useRef<boolean>(false);
  const { getPatientApiCall } = useAuth();

  const [
    amountBreakup,
    setAmountBreakup,
  ] = useState<paymentTransactionStatus_paymentTransactionStatus_appointment_amountBreakup | null>();
  const circleSavings =
    amountBreakup?.actual_price && amountBreakup?.slashed_price
      ? amountBreakup?.actual_price - amountBreakup?.slashed_price
      : 0;

  const { circleSubscriptionId, circlePlanSelected } = useShoppingCart();
  const {
    setLocationDetails,
    locationDetails,
    locationForDiagnostics,
    apisToCall,
    homeScreenParamsOnPop,
  } = useAppCommonData();
  const { clearDiagnoticCartInfo } = useDiagnosticsCart();
  const copyToClipboard = (refId: string) => {
    Clipboard.setString(refId);
    setSnackbarState(true);
  };
  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });
  useEffect(() => {
    getUserSubscriptionsByStatus();
  }, []);

  const askLocationPermission = () => {
    showAphAlert!({
      unDismissable: false,
      title: 'Hi! :)',
      description:
        'It is important for us to know your location so that the doctor can prescribe medicines accordingly. Please allow us to detect your location or enter location manually.',
      CTAs: [
        {
          text: 'ENTER MANUALLY',
          onPress: () => {
            fireLocationEvent.current = true;
            hideAphAlert?.();
            setlocationSearchList([]);
            setShowLocationPopup(true);
          },
          type: 'white-button',
        },
        {
          text: 'ALLOW AUTO DETECT',
          onPress: () => {
            fireLocationEvent.current = true;
            hideAphAlert!();
            setLoading?.(true);
            doRequestAndAccessLocationModified()
              .then((response) => {
                setLoading?.(false);
                locationWebEngageEvent(response, 'Auto Detect');
                response && setLocationDetails?.(response);
                saveLocationWithConsultation(response);
              })
              .catch((e) => {
                CommonBugFender('ConsultPaymentStatus__ALLOW_AUTO_DETECT', e);
                setLoading?.(false);
                e &&
                  typeof e == 'string' &&
                  !e.includes('denied') &&
                  showAphAlert!({
                    title: 'Uh oh! :(',
                    description: e,
                  });
              });
          },
        },
      ],
    });
  };

  const locationWebEngageEvent = (location: any, type: 'Auto Detect' | 'Manual entry') => {
    if (fireLocationEvent.current) {
      const doctorDetails = {
        name: doctorName,
        id: doctorID,
        'Speciality Name': g(doctor, 'specialty', 'name')!,
      };
      userLocationConsultWEBEngage(
        currentPatient,
        location,
        'Pay confirm',
        type,
        doctorDetails,
        userChangedLocation.current
      );
      consultUserLocationCleverTapEvents(
        currentPatient,
        location,
        'Payment confirmation screen',
        type,
        doctorDetails,
        userChangedLocation.current
      );
    }
    userChangedLocation.current = false;
    fireLocationEvent.current = false;
  };

  const getOrderInfo = () => {
    return client.query<getAppointmentInfo, getAppointmentInfoVariables>({
      query: GET_APPOINTMENT_INFO,
      variables: {
        order_id: paymentId,
      },
      fetchPolicy: 'no-cache',
    });
  };

  const fetchOrderStatus = async () => {
    try {
      const response = await getOrderInfo();
      const txnStatus = response?.data?.getOrderInternal?.payment_status || PAYMENT_STATUS.PENDING;
      const appmtDetails = response?.data?.getOrderInternal?.AppointmentDetails?.find(
        (item: any) => item
      );
      const displayId = appmtDetails?.displayId || '';
      firePaymentStatusEvent(status);
      if (status == success) {
        locationDetails && saveLocationWithConsultation(locationDetails);
        const amountBreakup = appmtDetails?.amountBreakup;
        if (isCircleDoctor && amountBreakup?.slashed_price) {
          setAmountBreakup(amountBreakup);
        }
        fireBaseFCM();
        fireConsultBookedEvent(displayId);
        PermissionsCheck();
      } else {
        fireOrderFailedEvent();
      }
      status == pending && setStatus(txnStatus);
      setdisplayId(displayId);
      setShowSpinner?.(false);
    } catch (error) {
      setShowSpinner?.(false);
      CommonBugFender('fetchingTxnStutus', error);
      renderErrorPopup(string.common.tryAgainLater);
    }
  };

  const PermissionsCheck = () => {
    checkPermissions(['camera', 'microphone']).then((response: any) => {
      const { camera, microphone } = response;
      if (camera === 'authorized' && microphone === 'authorized') {
        !locationDetails && askLocationPermission();
      } else {
        overlyCallPermissions(
          currentPatient.firstName,
          doctorName,
          showAphAlert,
          hideAphAlert,
          true,
          () => {
            !locationDetails && askLocationPermission();
          },
          'Payment Confirmation Screen'
        );
      }
    });
  };

  const firePaymentStatusEvent = (status: string) => {
    try {
      const paymentEventAttributes = {
        Payment_Status: status,
        LOB: 'Consultation',
        Appointment_Id: orderId,
      };
      postWebEngageEvent(WebEngageEventName.PAYMENT_STATUS, paymentEventAttributes);
      postFirebaseEvent(FirebaseEventName.PAYMENT_STATUS, paymentEventAttributes);
      postAppsFlyerEvent(AppsFlyerEventName.PAYMENT_STATUS, paymentEventAttributes);
    } catch (error) {}
  };

  const fireConsultBookedEvent = (displayId: any) => {
    try {
      let eventAttributes = webEngageEventAttributes;
      eventAttributes['Display ID'] = displayId;
      eventAttributes['User_Type'] = getUserType(allCurrentPatients);
      let cleverTapEventAttributes = cleverTapConsultBookedEventAttributes;
      cleverTapEventAttributes['displayId'] = displayId;
      cleverTapEventAttributes['userType'] = getUserType(allCurrentPatients);
      postAppsFlyerEvent(AppsFlyerEventName.CONSULTATION_BOOKED, appsflyerEventAttributes);
      postFirebaseEvent(FirebaseEventName.CONSULTATION_BOOKED, fireBaseEventAttributes);
      firePurchaseEvent(amountBreakup);
      eventAttributes['Dr of hour appointment'] = !!isDoctorsOfTheHourStatus ? 'Yes' : 'No';
      cleverTapEventAttributes['Dr of hour appointment'] = !!isDoctorsOfTheHourStatus
        ? 'Yes'
        : 'No';
      postWebEngageEvent(WebEngageEventName.CONSULTATION_BOOKED, eventAttributes);
      postCleverTapEvent(CleverTapEventName.CONSULTATION_BOOKED, cleverTapEventAttributes);
      if (!currentPatient?.isConsulted) getPatientApiCall();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    clearCirclePlanInfo();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const clearCirclePlanInfo = () => {
    if (circleSavings > 0 && !circleSubscriptionId) {
      AsyncStorage.removeItem('circlePlanSelected');
    }
  };

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      setCirclePlanDetails(data?.APOLLO?.[0]);
    } catch (error) {
      CommonBugFender('ConsultRoom_getUserSubscriptionsByStatus', error);
    }
  };

  const clearCircleSubscriptionData = () => {
    AsyncStorage.removeItem('circlePlanSelected');
  };

  const fireOrderFailedEvent = () => {
    const eventAttributes: FirebaseEvents[FirebaseEventName.ORDER_FAILED] = {
      Price: price,
      CouponCode: coupon,
      PaymentType: paymentTypeID,
      LOB: 'Consultation',
      Appointment_Id: orderId,
    };
    postAppsFlyerEvent(AppsFlyerEventName.ORDER_FAILED, eventAttributes);
    postFirebaseEvent(FirebaseEventName.ORDER_FAILED, eventAttributes);
  };

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

  const firePurchaseEvent = (amountBreakup: any) => {
    const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      coupon: coupon,
      currency: 'INR',
      items: [
        {
          item_name: doctorName, // Product Name or Doctor Name
          item_id: doctorID, // Product SKU or Doctor ID
          price: Number(price), // Product Price After discount or Doctor VC price (create another item in array for PC price)
          item_brand: doctor.doctorType, // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
          item_category: 'Consultations', // 'Pharmacy' or 'Consultations'
          item_category2: doctor.specialty.name, // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
          item_category3: doctor.city, // City Name (for Consultations)
          item_variant: webEngageEventAttributes['Consult Mode'], // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
          index: 1, // Item sequence number in the list
          quantity: 1, // "1" or actual quantity
        },
      ],
      transaction_id: orderId,
      value: Number(price),
      LOB: 'Consult',
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
    isCircleDoctor && amountBreakup?.slashed_price && fireCirclePurchaseEvent(amountBreakup);
  };

  const fireCirclePurchaseEvent = (amountBreakup: any) => {
    const Savings = (amountBreakup?.actual_price || 0) - (amountBreakup?.slashed_price || 0);
    Savings > 0 && !circleSubscriptionId && circleWebEngage();

    const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      currency: 'INR',
      items: [
        {
          item_name: 'Circle Plan',
          item_id: circlePlanSelected?.subPlanId,
          price: Number(circlePlanSelected?.currentSellingPrice),
          item_category: 'Circle',
          index: 1, // Item sequence number in the list
          quantity: 1, // "1" or actual quantity
        },
      ],
      transaction_id: orderId,
      value: Number(circlePlanSelected?.currentSellingPrice),
      LOB: 'Circle',
    };
    Savings > 0 &&
      !circleSubscriptionId &&
      postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);

    clearCircleSubscriptionData();
  };

  const requestStoragePermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (resuts) {
        downloadInvoice();
      }
    } catch (error) {
      CommonBugFender('PaymentStatusScreen_requestReadSmsPermission_try', error);
    }
  };

  const handleBack = () => {
    handleButton();
    return true;
  };

  const statusIcon = () => {
    if (status === success) {
      return <ConsultSuccess style={styles.statusIconStyles} />;
    } else if (status === failure) {
      return <ConsultFailure style={styles.statusIconStyles} />;
    } else {
      return <ConsultPending style={styles.statusIconStyles} />;
    }
  };

  const textComponent = (
    message: string,
    numOfLines: number | undefined,
    color: string,
    needStyle: boolean
  ) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 13, color, 1, 20),
          marginHorizontal: needStyle ? 0.1 * windowWidth : undefined,
        }}
        numberOfLines={numOfLines}
      >
        {message}
      </Text>
    );
  };

  const statusCardColour = () => {
    if (status == success) {
      return colors.SUCCESS;
    } else if (status == failure) {
      return colors.FAILURE;
    } else {
      return colors.PENDING;
    }
  };

  const statusText = () => {
    let message = 'PAYMENT PENDING';
    let textColor = theme.colors.PENDING_TEXT;
    if (status === success) {
      message = ' PAYMENT SUCCESSFUL';
      textColor = theme.colors.CONSULT_SUCCESS_TEXT;
    } else if (status === failure) {
      message = ' PAYMENT FAILED';
      textColor = theme.colors.FAILURE_TEXT;
    }
    return textComponent(message, undefined, textColor, false);
  };

  const priceText = () => {
    const priceText = `${string.common.Rs} ` + String(price);
    let textColor = theme.colors.PENDING_TEXT;
    if (status === success) {
      textColor = theme.colors.CONSULT_SUCCESS_TEXT;
    } else if (status === failure) {
      textColor = theme.colors.FAILURE_TEXT;
    }
    return textComponent(priceText, undefined, textColor, false);
  };

  const renderViewInvoice = () => {
    if (status === success) {
      return (
        <View style={styles.viewInvoice}>
          <TouchableOpacity
            style={styles.viewInvoiceContainer}
            onPress={() => requestStoragePermission()}
          >
            <PdfGray style={styles.viewIcon} />
            {textComponent('VIEW INVOICE', undefined, theme.colors.TANGERINE_YELLOW, false)}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emailInvoiceView}
            onPress={() => setshowEmailInput(!showEmailInput)}
          >
            <EmailGray style={styles.emailIcon} />
            {textComponent(
              'EMAIL INVOICE',
              undefined,
              !showEmailInput ? theme.colors.TANGERINE_YELLOW : theme.colors.TEXT_LIGHT_YELLOW,
              false
            )}
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderEmailInputContainer = () => {
    return showEmailInput ? <View>{!emailSent ? renderInputEmail() : renderSentMsg()}</View> : null;
  };

  const renderInputEmail = () => {
    return (
      <View style={styles.inputContainer}>
        <View style={{ flex: 0.85 }}>
          <TextInput
            value={`${email}`}
            onChangeText={(email) => setEmail(email)}
            style={styles.inputStyle}
          />
        </View>
        <View style={styles.rightIcon}>{rightIconView()}</View>
      </View>
    );
  };

  const renderSentMsg = () => {
    const length = email?.length || 0;
    return (
      <View
        style={{ ...styles.inputContainer, justifyContent: length > 20 ? 'center' : undefined }}
      >
        <Text
          style={{
            lineHeight: length > 20 ? 18 : 30,
            textAlign: length > 20 ? 'center' : 'auto',
            ...styles.sentMsg,
          }}
        >
          {length < 21
            ? `Invoice has been sent to ${email}!`
            : `Invoice has been sent to ${'\n'} ${email}!`}
        </Text>
      </View>
    );
  };

  const rightIconView = () => {
    return (
      <View style={{ paddingBottom: 0, opacity: isSatisfyingEmailRegex(email.trim()) ? 1 : 0.5 }}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={!isSatisfyingEmailRegex(email.trim())}
          onPress={() => {
            emailInvoice();
            setEmailSent(true);
          }}
        >
          <SearchSendIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const emailInvoice = () => {
    client
      .query({
        query: CONSULT_ORDER_INVOICE,
        variables: {
          patientId: currentPatient.id,
          appointmentId: orderId,
          emailId: email,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {})
      .catch((error) => {
        CommonBugFender('Error while sending invoice on mail', error);
      })
      .finally(() => {});
  };

  const downloadInvoice = () => {
    client
      .query({
        query: CONSULT_ORDER_INVOICE,
        variables: {
          patientId: currentPatient.id,
          appointmentId: orderId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const { data } = res;
        const { getOrderInvoice } = data;
        let dirs = RNFetchBlob.fs.dirs;
        let fileName: string =
          'Apollo_Consult_Invoice' + moment().format('MMM_D_YYYY_HH_mm') + '.pdf';
        const downloadPath =
          Platform.OS === 'ios'
            ? (dirs.DocumentDir || dirs.MainBundleDir) +
              '/' +
              (fileName || 'Apollo_Consult_Invoice.pdf')
            : dirs.DownloadDir + '/' + (fileName || 'Apollo_Consult_Invoice.pdf');
        RNFetchBlob.config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            title: fileName,
            useDownloadManager: true,
            notification: true,
            path: downloadPath,
            mime: mimeType(downloadPath),
            description: 'File downloaded by download manager.',
          },
        })
          .fetch('GET', String(getOrderInvoice), {
            //some headers ..
          })
          .then((res) => {
            if (Platform.OS === 'android') {
              Alert.alert('Download Complete');
            }
            Platform.OS === 'ios'
              ? RNFetchBlob.ios.previewDocument(res.path())
              : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
          })
          .catch((err) => {
            CommonBugFender('ConsultView_downloadInvoice', err);
          });
      })
      .catch((error) => {
        // props.navigationProps.navigate(AppRoutes.MyAccount);
        renderErrorPopup(`Something went wrong, please try again after sometime`);
        CommonBugFender('fetchingConsultInvoice', error);
      });
  };
  const renderStatusCard = () => {
    const refNumberText = String(paymentId != '' && paymentId != null ? paymentId : '--');
    const orderIdText = 'Order ID: ' + String(displayId);
    return (
      <View style={styles.statusCardStyle}>
        <View style={styles.statusCardSubContainerStyle}>
          {statusIcon()}
          <View style={styles.statusView}>
            {statusText()}
            {priceText()}
          </View>
        </View>
        <View style={styles.orderIdStyles}>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY, 1, 20)}>
            {orderIdText}
          </Text>
        </View>
        <TouchableOpacity style={styles.refStyles} onPress={() => copyToClipboard(refNumberText)}>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY, 1, 20)}>
            {'Payment Ref. Number - ' + refNumberText}
          </Text>
          <Copy style={styles.iconStyle} />
        </TouchableOpacity>
        <View>
          {renderViewInvoice()}
          {renderEmailInputContainer()}
          <Snackbar
            style={styles.snackbarView}
            visible={snackbarState}
            onDismiss={() => {
              setSnackbarState(false);
            }}
            duration={1000}
          >
            Copied
          </Snackbar>
        </View>
        <View style={styles.separator} />
        <View style={styles.appointmentView}>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.BLACK_COLOR, 1, 20)}>
            {string.consultPayment.appointmentDetails}
          </Text>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.CONSULT_SUCCESS_TEXT, 1, 20)}>
            {appointmentType.charAt(0).toUpperCase() +
              appointmentType.slice(1).toLowerCase() +
              ' Consultation,' +
              getDate(appointmentDateTime)}
          </Text>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.BLACK_COLOR, 1, 20)}>
            {doctorName}
          </Text>
        </View>
      </View>
    );
  };

  const renderNote = () => {
    let noteText = '';
    if (status === failure) {
      noteText =
        'Note : In case your account has been debited, you should get the refund in 1-7 working days.';
    } else if (status != success && status != failure) {
      noteText =
        'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.';
    }
    return textComponent(noteText, undefined, theme.colors.SHADE_GREY, true);
  };

  const getButtonText = () => {
    if (status == success) {
      return 'Go To Consult Room';
    } else if (status == failure) {
      return 'TRY AGAIN';
    } else {
      return 'GO TO HOME';
    }
  };

  const handleButton = (navigateToChatRoom?: boolean) => {
    const { navigation } = props;
    const { navigate } = navigation;
    if (status == success) {
      getAppointmentInfo(navigateToChatRoom);
    } else if (status == failure) {
      // navigate(AppRoutes.DoctorSearch);
      navigate(AppRoutes.DoctorDetails, {
        doctorId: doctorID,
      });
    } else {
      moveToHome();
    }
  };

  const moveToHome = (navigateToChatRoom?: boolean, appointmentData?: any) => {
    // use apiCallsEnum values here in order to make that api call in home screen

    apisToCall.current = !!circleSubscriptionId
      ? [apiCallEnums.patientAppointments, apiCallEnums.patientAppointmentsCount]
      : [
          apiCallEnums.patientAppointments,
          apiCallEnums.patientAppointmentsCount,
          apiCallEnums.circleSavings,
          apiCallEnums.getAllBanners,
          apiCallEnums.getUserSubscriptions,
          apiCallEnums.getUserSubscriptionsV2,
        ];
    const params = {
      isFreeConsult: !!appointmentData ? (navigateToChatRoom ? false : true) : false,
      doctorName: doctorName,
      appointmentData: appointmentData?.[0],
      skipAutoQuestions: doctor?.skipAutoQuestions,
    };
    if (!navigateToChatRoom) {
      homeScreenParamsOnPop.current = params;
    }
    navigateToHome(props.navigation, params);
  };

  const getAppointmentInfo = (navigateToChatRoom?: boolean) => {
    setShowSpinner && setShowSpinner(true);

    client
      .query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId: orderId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        try {
          setShowSpinner && setShowSpinner(false);
          const appointmentData = _data.data.getAppointmentData!.appointmentsHistory;
          if (appointmentData) {
            try {
              if (appointmentData[0]!.doctorInfo !== null) {
                if (!navigateToChatRoom) {
                  moveToHome(navigateToChatRoom, appointmentData);
                } else {
                  props.navigation.dispatch(
                    StackActions.reset({
                      index: 0,
                      key: null,
                      actions: [
                        NavigationActions.navigate({
                          routeName: AppRoutes.ConsultRoom,
                          params: {
                            isFreeConsult: navigateToChatRoom ? false : true,
                            doctorName: doctorName,
                            appointmentData: appointmentData[0],
                            skipAutoQuestions: doctor?.skipAutoQuestions,
                          },
                        }),
                      ],
                    })
                  );
                }
                if (navigateToChatRoom) {
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: appointmentData[0],
                    callType: '',
                    prescription: '',
                    disableChat: false,
                  });
                }
              }
            } catch (error) {}
          }
        } catch (error) {
          setShowSpinner && setShowSpinner(false);
          props.navigation.navigate('APPOINTMENTS');
        }
      })
      .catch((e) => {
        setShowSpinner && setShowSpinner(false);
        props.navigation.navigate('APPOINTMENTS');
      });
  };

  const renderButton = () => {
    return (
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => {
          handleButton(true);
        }}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 13, '#ffffff', 1, 24) }}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    );
  };

  const circleWebEngage = () => {
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PURCHASE_CIRCLE] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Membership Type': String(circlePlanSelected?.valid_duration) + ' days',
      'Membership End Date': moment(new Date())
        .add(circlePlanSelected?.valid_duration, 'days')
        .format('DD-MMM-YYYY'),
      'Circle Plan Price': circlePlanSelected?.currentSellingPrice,
      Type: 'Consult',
      Source: 'Consult',
    };
    !!circlePlanSelected?.valid_duration &&
      !!circlePlanSelected?.currentSellingPrice &&
      postWebEngageEvent(WebEngageEventName.PURCHASE_CIRCLE, CircleEventAttributes);
  };

  const renderAddedCirclePlanWithValidity = () => {
    return (
      <AddedCirclePlanWithValidity
        circleSavings={circleSavings}
        circlePlanDetails={circlePlanDetails}
        isConsult={true}
      />
    );
  };

  const renderCircleSavingsOnPurchase = () => {
    return (
      <View style={styles.circleSavingsContainer}>
        <View style={styles.rowCenter}>
          <CircleLogo style={styles.circleLogo} />
          <Text
            style={{
              ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 1, 12),
              marginTop: 5,
            }}
          >
            You{' '}
            <Text style={theme.viewStyles.text('SB', 12, theme.colors.SEARCH_UNDERLINE_COLOR)}>
              saved {string.common.Rs}
              {convertNumberToDecimal(circleSavings)}{' '}
            </Text>
            on your purchase
          </Text>
        </View>
      </View>
    );
  };

  const autoSearchPlaces = (searchText: string) => {
    autoCompletePlaceSearch(searchText)
      .then((obj) => {
        try {
          if (obj?.data?.predictions) {
            const address = obj.data.predictions?.map(
              (item: {
                place_id: string;
                structured_formatting: {
                  main_text: string;
                };
              }) => {
                return { name: item?.structured_formatting?.main_text, placeId: item?.place_id };
              }
            );
            setlocationSearchList(address);
          }
        } catch (e) {
          CommonBugFender('DoctorSearchListing_autoSearch_try', e);
        }
      })
      .catch((error) => {
        CommonBugFender('DoctorSearchListing_autoSearch', error);
      });
  };

  const saveLocationWithConsultation = async (location: LocationData) => {
    setLoading?.(true);
    await saveConsultationLocation(client, orderId, location);
    setLoading?.(false);
  };

  const renderSearchManualLocation = () => {
    if (showLocationPopup) {
      return (
        <View style={styles.locationMainView}>
          <View style={styles.currentLocationView}>
            <View style={styles.locationSubView}>
              <Text style={styles.currentLocationText}>Current Location</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLocationPopup(false);
                  locationWebEngageEvent(undefined, 'Manual entry');
                }}
              >
                <Remove />
              </TouchableOpacity>
            </View>
            <View style={styles.locationInput}>
              <View style={{ flex: 7 }}>
                <TextInputComponent
                  autoFocus={true}
                  onChangeText={(value) => {
                    setLocationSearchText(value);
                    if (value.length > 2) {
                      autoSearchPlaces(value);
                      setshowLocations(true);
                    } else {
                      setshowLocations(false);
                    }
                  }}
                />
              </View>
              <View style={styles.locationIconView}>
                <LocationOn />
              </View>
            </View>
            {showLocations && (
              <View>
                {locationSearchList?.map((item, i) => (
                  <View key={i} style={styles.searchedLocationItem}>
                    <Text
                      style={styles.citiesText}
                      onPress={() => {
                        saveLocationDetails(item);
                        setShowLocationPopup(false);
                      }}
                    >
                      {item?.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      );
    }
  };

  const saveLocationDetails = (item: { name: string; placeId: string }) => {
    setLoading?.(true);
    getPlaceInfoByPlaceId(item.placeId)
      .then((response) => {
        const addrComponents = g(response, 'data', 'result', 'address_components') || [];
        const coordinates = g(response, 'data', 'result', 'geometry', 'location')! || {};

        const city =
          findAddrComponents('locality', addrComponents) ||
          findAddrComponents('administrative_area_level_2', addrComponents);
        if (city?.toLowerCase() != (locationForDiagnostics?.city || '')?.toLowerCase()) {
          clearDiagnoticCartInfo?.();
        }
        if (addrComponents?.length > 0) {
          const locationData: LocationData = {
            displayName: item?.name,
            latitude:
              typeof coordinates?.lat == 'string' ? Number(coordinates?.lat) : coordinates?.lat,
            longitude:
              typeof coordinates?.lng == 'string' ? Number(coordinates?.lng) : coordinates?.lng,
            area: [
              findAddrComponents('route', addrComponents),
              findAddrComponents('sublocality_level_2', addrComponents),
              findAddrComponents('sublocality_level_1', addrComponents),
            ]
              ?.filter((i) => i)
              ?.join(', '),
            city,
            state: findAddrComponents('administrative_area_level_1', addrComponents),
            country: findAddrComponents('country', addrComponents),
            pincode: findAddrComponents('postal_code', addrComponents),
            lastUpdated: new Date().getTime(),
          };

          setLocationDetails?.(locationData);

          getPlaceInfoByLatLng(coordinates.lat, coordinates.lng)
            .then((response) => {
              const addrComponents =
                g(response, 'data', 'results', '0' as any, 'address_components') || [];
              if (addrComponents.length > 0) {
                setLocationDetails?.({
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                  lastUpdated: new Date().getTime(),
                });
                const locationInput = {
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                  lastUpdated: new Date().getTime(),
                };
                saveLocationWithConsultation(locationInput);
                const locationAttribute = {
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                };
                locationWebEngageEvent(locationAttribute, 'Manual entry');
              }
            })
            .catch((error) => {
              CommonBugFender('LocationSearchPopup_saveLatlong', error);
            });
        }
      })
      .catch((error) => {
        CommonBugFender('DoctorSearchListing_getPlaceInfoByPlaceId', error);
      });
  };

  const renderSavedLocation = () => {
    return (
      <View style={styles.savedLocationView}>
        <Text style={styles.currentLocationTitle}>Your current location</Text>
        <View style={styles.line} />
        <View style={styles.spaceRow}>
          <View style={styles.rowCenter}>
            <LocationOn />
            <Text style={styles.savedLocationText}>
              {locationDetails?.city}{' '}
              {locationDetails?.pincode ? `, ${locationDetails?.pincode}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              fireLocationEvent.current = true;
              userChangedLocation.current = true;
              setlocationSearchList([]);
              setShowLocationPopup(true);
            }}
          >
            <Text style={styles.changeLocationBtnTxt}>CHANGE LOCATION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderConsultInfo = () => {
    return (
      <View style={styles.consultInfoView}>
        <Text style={theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE)}>
          {string.consultPayment.knowConsultation}
        </Text>
        <Text style={styles.callReceiveText}>{string.consultPayment.receiveCallText}</Text>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>1</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.beforeConsultation}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.dashLine} />
          <Text style={styles.consultInfoText}>
            {string.consultPayment.stepOne}
            <Text style={theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY)}>
              {string.consultPayment.stepOneSubheading}
            </Text>
          </Text>
        </View>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>2</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.consultation}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.dashLine} />
          <Text style={styles.consultInfoText}>{string.consultPayment.stepTwo}</Text>
        </View>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>3</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.postConsultation}
          </Text>
        </View>
        <View style={styles.lastStepView}>
          <Text style={styles.consultInfoText}>{string.consultPayment.stepThree}</Text>
        </View>
        <Text style={styles.guidelineText}>{string.consultPayment.detailedGuidelines}</Text>
        <TouchableOpacity onPress={() => setShowPDF(true)} style={styles.pdfView}>
          <Pdf style={styles.pdfIcon} />
          <Text style={theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.viewGuideline}
            <Text style={theme.viewStyles.text('R', 12, theme.colors.SLATE_GRAY)}>
              {string.consultPayment.download}
            </Text>
          </Text>
          <View style={styles.arrowIconView}>
            <RightArrowBlue style={{ height: 12, width: 6 }} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />
        {!showSpinner ? (
          <View style={styles.container}>
            <ScrollView style={styles.container}>
              {renderStatusCard()}
              {status == success && renderConsultInfo()}
              {circleSavings > 0 && !circleSubscriptionId
                ? renderAddedCirclePlanWithValidity()
                : null}
              {locationDetails && renderSavedLocation()}
              {circleSavings > 0 && !!circleSubscriptionId ? renderCircleSavingsOnPurchase() : null}
              {renderNote()}
            </ScrollView>
            <View style={{ backgroundColor: theme.colors.WHITE }}>{renderButton()}</View>
          </View>
        ) : (
          <Spinner />
        )}
        {notificationAlert && (
          <NotificationPermissionAlert
            onPressOutside={() => setNotificationAlert(false)}
            onButtonPress={() => {
              setNotificationAlert(false);
              Linking.openSettings();
            }}
          />
        )}
        {renderSearchManualLocation()}
        {showPDF && (
          <RenderPdf
            uri={'https://newassets-test.apollo247.com/files/Mobile_View_Infographic.pdf'}
            title={''}
            isPopup={true}
            setDisplayPdf={() => {
              setShowPDF(false);
            }}
            navigation={props.navigation}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  Payment: {
    fontSize: 14,
    color: theme.colors.ASTRONAUT_BLUE,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
  statusIconStyles: {
    width: 40,
    height: 40,
  },
  statusCardStyle: {
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    paddingBottom: 15,
    backgroundColor: theme.colors.WHITE,
  },
  statusCardSubContainerStyle: {
    margin: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentCardStyle: {
    marginVertical: 0.03 * windowWidth,
    paddingLeft: 0.06 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  appointmentHeaderStyle: {
    backgroundColor: '#eee',
    height: 0.04 * windowHeight,
    justifyContent: 'center',
    marginHorizontal: 0.06 * windowWidth,
    borderBottomWidth: 0.8,
    borderBottomColor: '#ddd',
  },
  buttonStyle: {
    height: 40,
    backgroundColor: theme.colors.TANGERINE_YELLOW,
    marginVertical: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refStyles: {
    flexDirection: 'row',
    marginStart: 12,
  },
  iconStyle: {
    marginLeft: 6,
    marginTop: 5,
    width: 9,
    height: 10,
  },
  inputStyle: {
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansMedium(11),
    color: '#6D7278',
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  viewInvoice: {
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  rightIcon: {
    flex: 0.15,
    alignItems: 'flex-end',
  },
  sentMsg: {
    color: theme.colors.CONSULT_SUCCESS_TEXT,
    marginVertical: 4,
    ...theme.fonts.IBMPlexSansMedium(11),
  },
  orderIdStyles: {
    marginStart: 12,
  },
  paymentRef: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  circleSavingsContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    borderRadius: 5,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleLogo: {
    width: 45,
    height: 27,
    marginRight: 5,
  },
  savedLocationView: {
    marginHorizontal: 0.06 * windowWidth,
    marginBottom: 20,
    paddingBottom: 10,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 10,
  },
  line: {
    width: '100%',
    height: 0.8,
    backgroundColor: '#ddd',
  },
  currentLocationTitle: {
    ...theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE),
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  savedLocationText: {
    marginLeft: 6,
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE),
    width: windowWidth - 230,
  },
  changeLocationBtnTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.TANGERINE_YELLOW),
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    paddingHorizontal: 12,
  },
  locationMainView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 15,
    elevation: 15,
  },
  currentLocationText: {
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  currentLocationView: {
    ...theme.viewStyles.cardViewStyle,
    width: 235,
    padding: 16,
    marginTop: 40,
  },
  locationIconView: {
    marginLeft: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 10,
  },
  searchedLocationItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    paddingVertical: 7,
  },
  citiesText: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  locationInput: {
    flexDirection: 'row',
    marginTop: 5,
  },
  consultInfoView: {
    marginHorizontal: 0.06 * windowWidth,
    marginBottom: 20,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 10,
    padding: 12,
  },
  callReceiveText: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 16),
    paddingTop: 9,
    paddingBottom: 15,
  },
  separator: {
    height: 1,
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  appointmentView: {
    marginTop: 8,
    marginStart: 12,
  },
  statusView: {
    paddingStart: 18,
  },
  consultStepView: {
    width: 114,
    backgroundColor: theme.colors.AQUA_BLUE,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 5,
  },
  stepNumberContainer: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 6,
  },
  infoContainer: {
    marginStart: 10,
    flexDirection: 'row',
  },
  dashLine: {
    width: 1,
    height: 56,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.LIGHT_BLUE,
    marginEnd: 16,
  },
  consultInfoText: {
    paddingTop: 4,
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE),
  },
  lastStepView: {
    marginStart: 26,
    marginBottom: 14,
  },
  guidelineText: {
    ...theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY),
    marginStart: 5,
    marginBottom: 5,
  },
  pdfView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    flex: 1,
    borderRadius: 6,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  pdfIcon: {
    width: 22,
    height: 26,
    marginStart: 9,
    marginEnd: 13,
  },
  arrowIconView: {
    flex: 1,
    alignItems: 'flex-end',
    marginEnd: 16,
  },
  snackbarView: {
    position: 'absolute',
    zIndex: 1001,
    bottom: -10,
  },
  viewInvoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewIcon: {
    width: 16,
    height: 10,
    marginEnd: 4,
  },
  emailIcon: {
    width: 17,
    height: 13,
    marginEnd: 4,
  },
  emailInvoiceView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 20,
  },
  locationSubView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
