import string from '@aph/mobile-patients/src/strings/strings.json';
import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Linking,
  AppStateStatus,
  AppState,
  DeviceEventEmitter,
  NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationScreenProps } from 'react-navigation';
import { SplashLogo } from '@aph/mobile-patients/src/components/SplashLogo';
import { AppRoutes, getCurrentRoute } from '@aph/mobile-patients/src/components/NavigatorContainer';
import remoteConfig from '@react-native-firebase/remote-config';
import SplashScreenView from 'react-native-splash-screen';
import { Relation, BookingSource } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAuth, useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig, updateAppConfig, AppEnv } from '../strings/AppConfig';
import { PrefetchAPIReuqest } from '@praktice/navigator-react-native-sdk';
import { Button } from './ui/Button';
import { useUIElements } from './UIElementsProvider';
import {
  CommonBugFender,
  setBugFenderLog,
  isIos,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { saveTokenDevice } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  useAppCommonData,
  appGlobalCache,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  doRequestAndAccessLocation,
  InitiateAppsFlyer,
  APPStateActive,
  postWebEngageEvent,
  callPermissions,
  UnInstallAppsFlyer,
  postFirebaseEvent,
  setCrashlyticsAttributes,
  onCleverTapUserLogin,
  getUTMdataFromURL,
  postCleverTapEvent,
  navigateToScreenWithEmptyStack,
  navigateToHome,
  setCleverTapAppsFlyerCustID,
  clevertapEventForAppsflyerDeeplink,
  updateCallKitNotificationReceivedStatus,
  checkUniversalURL,
  removeNullFromObj,
  filterAppLaunchSoruceAttributesByKey,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getAppointmentData as getAppointmentDataQuery,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import { phrNotificationCountApi } from '@aph/mobile-patients/src/helpers/clientCalls';
import { getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount } from '@aph/mobile-patients/src/graphql/types/getUserNotifyEvents';
import {
  GET_APPOINTMENT_DATA,
  GET_PROHEALTH_HOSPITAL_BY_SLUG,
  GET_ORDER_INFO,
  GET_PERSONALIZED_OFFERS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import isLessThan from 'semver/functions/lt';
import coerce from 'semver/functions/coerce';
import RNCallKeep from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';
import { string as localStrings } from '../strings/string';
import Pubnub from 'pubnub';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import messaging from '@react-native-firebase/messaging';
// The moment we import from sdk @praktice/navigator-react-native-sdk,
// finally not working on all promises.
import { handleOpenURL, pushTheView } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';
import { Animated, Easing } from 'react-native';
import {
  SplashCapsule,
  SplashSyringe,
  SplashStethoscope,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  getProHealthHospitalBySlug,
  getProHealthHospitalBySlugVariables,
} from '@aph/mobile-patients/src/graphql/types/getProHealthHospitalBySlug';
import { timeDifferenceInDays } from '@aph/mobile-patients/src/utils/dateUtil';
import firebaseAuth from '@react-native-firebase/auth';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  preFetchSDK,
  createHyperServiceObject,
  initiateSDK,
  terminateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import CleverTap from 'clevertap-react-native';
import { CleverTapEventName } from '../helpers/CleverTapEvents';
import analytics from '@react-native-firebase/analytics';
import appsFlyer from 'react-native-appsflyer';
import { useReferralProgram } from './ReferralProgramProvider';

(function() {
  /**
   * Praktice.ai
   * Polyfill for Promise.prototype.finally
   *
   * [ Temporary FIX ] => Add this code just below the import of SDK,
   * [ Update ] => In the next version it will part of SDK, user will not be required to add this code-block
   */
  let globalObject;
  globalObject = global;
  if (typeof Promise.prototype['finally'] === 'function') {
    return;
  }
  globalObject.Promise.prototype['finally'] = function(callback: any) {
    const constructor = this.constructor;
    return this.then(
      function(value: any) {
        return constructor.resolve(callback()).then(function() {
          return value;
        });
      },
      function(reason: any) {
        return constructor.resolve(callback()).then(function() {
          throw reason;
        });
      }
    );
  };
})();

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 152,
    height: 117,
    ...Platform.select({
      android: {
        top: -2,
      },
    }),
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
  },
  loader: {
    width: 70,
    height: 70,
  },
});

let onDeepLinkCanceller: any;

export interface SplashScreenProps extends NavigationScreenProps {}

export const SplashScreen: React.FC<SplashScreenProps> = (props) => {
  const { APP_ENV } = AppConfig;
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const { setAllPatients, setMobileAPICalled, returnAuthToken, buildApolloClient } = useAuth();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [appState, setAppState] = useState(AppState.currentState);
  const [takeToConsultRoom, settakeToConsultRoom] = useState<boolean>(false);
  const client = useApolloClient();
  const voipAppointmentId = useRef<string>('');
  const voipPatientId = useRef<string>('');
  const voipCallType = useRef<string>('');
  const voipDoctorName = useRef<string>('');

  const [userLoggedIn, setUserLoggedIn] = useState<any | null>(null);
  const [createCleverTapProifle, setCreateCleverTapProifle] = useState<any | null>(null);

  const [spinValue, setSpinValue] = useState(new Animated.Value(0));
  const [animatedValue, setAnimatedValue] = useState(new Animated.Value(0));
  const [springValue, setSpringAnimation] = useState(new Animated.Value(0));
  const CONST_SPLASH_LOADER = [string.splash.CAPSULE, string.splash.SYRINGE, string.splash.STETHO];
  const [selectedAnimationIndex, setSelectedAnimationIndex] = useState(0);
  const { currentPatient } = useAllCurrentPatients();
  const {
    setReferralGlobalData,
    setReferralMainBanner,
    setShareReferrerLinkData,
    setYourRewardsScreenData,
    setCongratulationPageData,
    setRefererTermsAndConditionData,
    setRefererFAQsData,
  } = useReferralProgram();

  const { setPhrNotificationData } = useAppCommonData();

  useEffect(() => {
    takeToConsultRoom && getData('ConsultRoom', undefined, false);
    configureAnimation();
  }, [takeToConsultRoom]);

  useEffect(() => {
    if (CONST_SPLASH_LOADER[selectedAnimationIndex] == string.splash.SYRINGE) {
      spinObject();
    } else if (CONST_SPLASH_LOADER[selectedAnimationIndex] == string.splash.STETHO) {
      springAnimation();
    } else {
      spinObject();
    }
  }, [selectedAnimationIndex]);

  useEffect(() => {
    prefetchUserMetadata();
    DeviceEventEmitter.addListener('accept', (params) => {
      if (getCurrentRoute() !== AppRoutes.ChatRoom) {
        voipCallType.current = params.call_type;
        callPermissions(() => {}, undefined, currentPatient);
        getAppointmentDataAndNavigate(params.appointment_id, true);
      }
    });
    DeviceEventEmitter.addListener('reject', (params) => {
      if (getCurrentRoute() !== AppRoutes.ChatRoom) {
        getAppointmentDataAndNavigate(params.appointment_id, false);
      }
    });
    AppState.addEventListener('change', _handleAppStateChange);
    checkForVersionUpdate();
    getAllReferrerDataOnInitialsLoad();
    getOffers();

    try {
      PrefetchAPIReuqest({
        clientId: AppConfig.Configuration.PRAKTISE_API_KEY,
      })
        .then((res: any) => {})
        .catch((e: Error) => {
          CommonBugFender('SplashScreen_PrefetchAPIReuqest', e);
        });
      AsyncStorage.removeItem('endAPICalled');
    } catch (error) {
      CommonBugFender('SplashScreen_PrefetchAPIReuqest_catch', error);
    }

    try {
      AsyncStorage.setItem('APP_OPENED', 'true');
    } catch (error) {
      CommonBugFender('SplashScreen_App_opend_error', error);
    }
  }, []);

  useEffect(() => {
    // clearing it so that save firebase token to DB gets call every first time
    AsyncStorage.removeItem('saveTokenDeviceApiCall');
    handleDeepLink();
    getDeviceToken();
    initializeRealTimeUninstall();
    setCleverTapAppsFlyerCustID();
  }, []);

  useEffect(() => {
    if (isIos()) {
      initializeCallkit();
      handleVoipEventListeners();
    }
  }, []);

  useEffect(() => {
    preFetchSDK(currentPatient?.id);
    try {
      createHyperServiceObject();
    } catch (error) {
      CommonBugFender('ErrorWhilecreatingHyperServiceObject', error);
    }
  }, []);

  const initializeRealTimeUninstall = () => {
    CleverTap.profileGetCleverTapID((error, res) => {
      analytics().setUserProperty('ct_objectId', `${res}`);
    });
  };

  // Avoid Red screen Error Alerts
  console.error = (error: any) => error.apply;

  const getDeviceToken = async () => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';
    const deviceTokenTimeStamp = (await AsyncStorage.getItem('deviceTokenTimeStamp')) || '';
    const currentDeviceTokenTimeStamp = deviceTokenTimeStamp
      ? JSON.parse(deviceTokenTimeStamp)
      : '';
    const currentPatientId: any = await AsyncStorage.getItem('selectUserId');
    if (
      !currentDeviceToken ||
      currentDeviceToken === '' ||
      currentDeviceToken.length == 0 ||
      typeof currentDeviceToken != 'string' ||
      typeof currentDeviceToken == 'object' ||
      !currentDeviceTokenTimeStamp ||
      currentDeviceTokenTimeStamp === '' ||
      currentDeviceTokenTimeStamp?.length == 0 ||
      typeof currentDeviceTokenTimeStamp != 'number' ||
      timeDifferenceInDays(new Date().getTime(), currentDeviceTokenTimeStamp) > 6
    ) {
      messaging()
        .getToken()
        .then((token) => {
          AsyncStorage.setItem('deviceToken', JSON.stringify(token));
          AsyncStorage.setItem('deviceTokenTimeStamp', JSON.stringify(new Date().getTime()));
          UnInstallAppsFlyer(token);
          if (currentPatientId && token) {
            saveTokenDevice(client, token, currentPatientId)?.catch((e) => {
              CommonBugFender('Login_saveTokenDevice', e);
              AsyncStorage.setItem('deviceToken', '');
            });
          }
        })
        .catch((e) => {
          CommonBugFender('SplashScreen_getDeviceToken', e);
        });
    }
  };

  const initializeCallkit = () => {
    const callkeepOptions = {
      ios: {
        appName: localStrings.LocalStrings.appName,
        imageName: 'callkitAppIcon.png',
      },
    };

    try {
      RNCallKeep.setup(callkeepOptions);
    } catch (err) {
      CommonBugFender('InitializeCallKeep_Error', err.message);
    }

    // Add RNCallKeep Events
    RNCallKeep.addEventListener('answerCall', onAnswerCallAction);
    RNCallKeep.addEventListener('endCall', onDisconnetCallAction);
  };

  const handleVoipEventListeners = () => {
    VoipPushNotification.addEventListener('notification', (notification) => {
      // on receive voip push
      const payload = notification && notification.getData();
      if (payload && payload.appointmentId) {
        updateCallKitNotificationReceivedStatus(payload.appointmentId);
        voipAppointmentId.current = notification.getData().appointmentId;
        voipPatientId.current = notification.getData().patientId;
        voipCallType.current = notification.getData().isVideo ? 'Video' : 'Audio';
        voipDoctorName.current = notification.getData().name;
      }
    });
  };

  const onAnswerCallAction = async () => {
    if (getCurrentRoute() !== AppRoutes.ChatRoom) {
      voipAppointmentId.current && getAppointmentDataAndNavigate(voipAppointmentId.current, false);
    }
  };

  const onDisconnetCallAction = () => {
    fireWebengageEventForCallDecline();
    RNCallKeep.endAllCalls();
    const config: Pubnub.PubnubConfig = {
      origin: 'apollo.pubnubapi.com',
      subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
      publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
      restore: true,
      ssl: true,
      uuid: `PATIENT_${voipPatientId?.current}`,
    };
    const pubnub = new Pubnub(config);

    pubnub.publish(
      {
        message: { message: '^^#PATIENT_REJECTED_CALL' },
        channel: voipAppointmentId.current,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        voipAppointmentId.current = '';
        voipPatientId.current = '';
        voipCallType.current = '';
      }
    );
  };

  const fireWebengageEventForCallDecline = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PATIENT_DECLINED_CALL] = {
      'Patient User ID': voipPatientId.current,
      'Patient name': '',
      'Patient mobile number': '',
      'Appointment Date time': null,
      'Appointment display ID': null,
      'Appointment ID': voipAppointmentId?.current,
      'Doctor Name': voipDoctorName?.current,
      'Speciality Name': '',
      'Speciality ID': '',
      'Doctor Type': '',
      'Mode of Call': voipCallType?.current === 'Video' ? 'Video' : 'Audio',
      Platform: 'App',
    };
    postWebEngageEvent(WebEngageEventName.PATIENT_DECLINED_CALL, eventAttributes);
  };
  console.warn = (error: any) => {};

  const handleDeepLink = () => {
    try {
      Linking.getInitialURL()
        .then((url) => {
          try {
            InitiateAppsFlyer(
              props.navigation,
              (resources) => {
                redirectRoute(
                  resources?.routeName,
                  resources?.id,
                  resources?.isCall,
                  resources?.timeout,
                  resources?.mediaSource,
                  resources?.data
                );
              },
              url,
              (isFirstLaunch) => triggerUTMCustomEvent(url, isFirstLaunch)
            );
          } catch (e) {}
          setBugFenderLog('DEEP_LINK_URL', url);
          if (url) {
            try {
              const data: any = handleOpenURL(url);
              redirectRoute(
                data?.routeName,
                data?.id,
                data?.isCall,
                data?.timeout,
                data?.mediaSource,
                data?.data
              );
              fireAppOpenedEvent(url);
            } catch (e) {}
          } else {
            settakeToConsultRoom(true);
            fireAppOpenedEvent('');
          }
        })
        .catch((e) => {
          CommonBugFender('SplashScreen_Linking_URL', e);
        });

      Linking.addEventListener('url', (event) => {
        try {
          setBugFenderLog('DEEP_LINK_EVENT', JSON.stringify(event));
          const data: any = handleOpenURL(event.url);
          catchSourceUrlDataUsingAppsFlyer(event.url);
          redirectRoute(
            data?.routeName,
            data?.id,
            data?.isCall,
            data?.timeout,
            data?.mediaSource,
            data?.data
          );
          fireAppOpenedEvent(event.url);
        } catch (e) {}
      });
      AsyncStorage.removeItem('location');
    } catch (error) {
      CommonBugFender('SplashScreen_Linking_URL_try', error);
    }
  };

  const redirectRoute = (
    routeName: string,
    id?: string,
    timeout?: boolean,
    isCall?: boolean,
    mediaSource?: string,
    data?: any
  ) => {
    if (routeName === 'ChatRoom' && data?.length >= 1) {
      getAppointmentDataAndNavigate(id!, false);
    } else if (
      routeName === 'DoctorCall' &&
      data?.length >= 1 &&
      getCurrentRoute() !== AppRoutes.ChatRoom
    ) {
      const params = id?.split('+');
      voipCallType.current = params?.[1]!;
      getAppointmentDataAndNavigate(params?.[0]!, true);
    } else if (routeName == 'prohealth') {
      fetchProhealthHospitalDetails(id);
    } else if (routeName === 'DoctorCallRejected') {
      setLoading!(true);
      const appointmentId = id?.split('+')?.[0];
      const config: Pubnub.PubnubConfig = {
        origin: 'apollo.pubnubapi.com',
        subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
        publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
        ssl: true,
        restore: true,
        uuid: `PATIENT_${currentPatient?.id}`,
      };
      const pubnub = new Pubnub(config);
      pubnub.publish(
        {
          message: { message: '^^#PATIENT_REJECTED_CALL' },
          channel: appointmentId,
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {
          setLoading!(false);
        }
      );
      const params = id?.split('+');
      if (getCurrentRoute() !== AppRoutes.ChatRoom) {
        getAppointmentDataAndNavigate(params?.[0]!, false);
      }
    } else if (routeName == 'prohealth') {
      fetchProhealthHospitalDetails(id!);
    } else if (routeName == 'PaymentMethods') {
      !!id ? fetchOrderInfo(id) : getData('ConsultRoom');
    } else {
      getData(routeName, id, isCall, timeout, mediaSource);
    }
  };

  const initiateHyperSDK = (cusId: any, merchantId: string) => {
    try {
      terminateSDK();
      createHyperServiceObject();
      initiateSDK(cusId, cusId, merchantId);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const fetchOrderInfo = async (paymentId: string) => {
    try {
      const authToken: any = await returnAuthToken?.();
      const apolloClient = buildApolloClient(authToken);
      const response = await apolloClient.query({
        query: GET_ORDER_INFO,
        variables: { order_id: paymentId },
        fetchPolicy: 'no-cache',
      });
      let allowPayment = true;
      // filtering diag orders whose allowPayment is set as false
      const diagOrder = response?.data?.getOrderInternal?.DiagnosticsPaymentDetails?.ordersList?.find(
        (item: any) => !item?.allowPayment
      );
      // if there is atleast one order whose allowpayment is set as false, then we shouldn't allow the payment
      allowPayment = !!diagOrder ? false : true;
      if (allowPayment) {
        const paymentStatus = response?.data?.getOrderInternal?.payment_status;
        const allowedStatuses = ['PAYMENT_NOT_INITIATED', 'TXN_FAILURE', 'COD_COMPLETE'];
        if (allowedStatuses.includes(paymentStatus)) {
          const currentPatientId: any = await AsyncStorage.getItem('selectUserId');
          const isPharmaOrder = !!response?.data?.getOrderInternal?.PharmaOrderDetails
            ?.medicineOrderDetails?.length
            ? true
            : false;
          const merchantId = isPharmaOrder
            ? AppConfig.Configuration.pharmaMerchantId
            : AppConfig.Configuration.merchantId;
          initiateHyperSDK(currentPatientId, merchantId);
          const params = {
            paymentId: response?.data?.getOrderInternal?.payment_order_id,
            amount: response?.data?.getOrderInternal?.total_amount,
            orderDetails: { orderId: response?.data?.getOrderInternal?.id },
            businessLine: 'paymentLink',
            customerId: response?.data?.getOrderInternal?.customer_id,
          };
          getData('PaymentMethods', undefined, undefined, undefined, undefined, params);
        } else {
          navigateToHome(props.navigation);
        }
      } else {
        navigateToHome(props.navigation);
        showPaymentAlert(diagOrder?.paymentNotAllowedErrorString);
      }
    } catch (error) {
      navigateToHome(props.navigation);
    }
  };

  const showPaymentAlert = (msg: string) => {
    showAphAlert!({
      title: 'Uh oh! :(',
      description: !!msg
        ? msg
        : 'Payment can’t be made for this order. Please check my order section for more details.',
    });
  };

  const callPhrNotificationApi = async (currentPatient: any) => {
    phrNotificationCountApi(client, currentPatient?.id || '')
      .then((newRecordsCount) => {
        if (newRecordsCount) {
          setPhrNotificationData &&
            setPhrNotificationData(
              newRecordsCount! as getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount
            );
        }
      })
      .catch((error) => {
        CommonBugFender('SplashcallPhrNotificationApi', error);
      });
  };

  async function fireAppOpenedEvent(event: any) {
    const a = event.indexOf('apollopatients://');
    const b = event.indexOf('https://www.apollo247.com');
    let attributes: FirebaseEvents[FirebaseEventName.APP_OPENED] = {
      utm_source: 'not set',
      utm_medium: 'not set',
      utm_campaign: 'not set',
      utm_term: 'not set',
      utm_content: 'not set',
      referrer: 'not set',
    };
    if (a == 0) {
      const route = event.replace('apollopatients://', '');
      const data = route.split('?');
      if (data.length >= 2) {
        const params = data[1].split('&');
        const utmParams = params.map((item: any) => item.split('='));
        utmParams.forEach((item: any) => item?.length == 2 && (attributes[item[0]] = item[1]));
        postFirebaseEvent(FirebaseEventName.APP_OPENED, attributes);
      }
    } else if (b == 0) {
      const route = event.replace('https://www.apollo247.com/', '');
      const data = route.split('?');
      if (data.length >= 2) {
        const params = data[1].split('&');
        const utmParams = params.map((item: any) => item.split('='));
        utmParams.forEach((item: any) => item?.length == 2 && (attributes[item[0]] = item[1]));
        postFirebaseEvent(FirebaseEventName.APP_OPENED, attributes);
      } else {
        const referrer = await NativeModules.GetReferrer.referrer();
        attributes['referrer'] = referrer;
        postFirebaseEvent(FirebaseEventName.APP_OPENED, attributes);
      }
    } else {
      postFirebaseEvent(FirebaseEventName.APP_OPENED, attributes);
    }
  }
  const getData = (
    routeName: string,
    id?: string,
    timeout?: boolean,
    isCall?: boolean,
    mediaSource?: string,
    params?: any
  ) => {
    async function fetchData() {
      //we are prefetching the userLoggedIn because reading it from async storage was taking 400-500 ms
      let userLoggedInState = userLoggedIn;
      if (userLoggedInState == null) {
        // if uninitilized then only read from Async Storage
        userLoggedInState = await AsyncStorage.getItem('userLoggedIn');
      }

      AsyncStorage.setItem('showSchduledPopup', 'false');

      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
      const item = JSON.parse(retrievedItem || 'null');

      const currentPatientId: any = await AsyncStorage.getItem('selectUserId');
      const callByPrism: any = await AsyncStorage.getItem('callByPrism');

      let allPatients;
      if (callByPrism === 'false') {
        allPatients =
          item && item.data && item.data.getPatientByMobileNumber
            ? item.data.getPatientByMobileNumber.patients
            : null;
        setMobileAPICalled && setMobileAPICalled(false);
      } else {
        allPatients =
          item && item.data && item.data.getCurrentPatients
            ? item.data.getCurrentPatients.patients
            : null;
        setMobileAPICalled && setMobileAPICalled(true);
      }
      setSavePatientDetails && setSavePatientDetails(allPatients);

      const mePatient = allPatients
        ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
        : null;
      const currentPatient = allPatients
        ? allPatients?.find((patient: any) => patient?.id === currentPatientId) ||
          allPatients?.find((patient: any) => patient?.isUhidPrimary === true)
        : null;
      setAllPatients(allPatients);

      setTimeout(
        async () => {
          if (userLoggedInState == 'true') {
            setshowSpinner(false);
            if (mePatient) {
              if (mePatient.firstName !== '') {
                const isCircleMember: any = await AsyncStorage.getItem('isCircleMember');
                const isCircleMembershipExpired: any = await AsyncStorage.getItem(
                  'isCircleMembershipExpired'
                );
                const isCorporateSubscribed: any = await AsyncStorage.getItem(
                  'isCorporateSubscribed'
                );
                const vaccinationCmsIdentifier: any = await AsyncStorage.getItem(
                  'VaccinationCmsIdentifier'
                );
                const vaccinationSubscriptionId: any = await AsyncStorage.getItem(
                  'VaccinationSubscriptionId'
                );

                if (routeName == 'prohealth' && id) {
                  id = id?.replace('mobileNumber', currentPatient?.mobileNumber || '');
                }
                pushTheView(
                  props.navigation,
                  routeName,
                  id ? id : undefined,
                  isCall,
                  isCircleMember === 'yes',
                  isCircleMembershipExpired === 'yes',
                  mediaSource,
                  voipCallType.current,
                  voipAppointmentId,
                  isCorporateSubscribed === 'yes',
                  vaccinationCmsIdentifier,
                  vaccinationSubscriptionId,
                  params
                );
                let _createCleverTapProifle = createCleverTapProifle;
                if (_createCleverTapProifle == null) {
                  _createCleverTapProifle = await AsyncStorage.getItem('createCleverTapProifle');
                  if (_createCleverTapProifle == 'false') onCleverTapUserLogin(mePatient);
                }
                callPhrNotificationApi(currentPatient);
                setCrashlyticsAttributes(mePatient);
              } else {
                props.navigation.replace(AppRoutes.Login);
              }
            }
          } else {
            const signUp: any = await AsyncStorage.getItem('signUp');
            const multiSignUp: any = await AsyncStorage.getItem('multiSignUp');
            setshowSpinner(false);

            if (signUp == 'true') {
              props.navigation.replace(AppRoutes.SignUp);
            } else if (multiSignUp == 'true') {
              if (mePatient) {
                props.navigation.replace(AppRoutes.MultiSignup);
              }
            } else {
              props.navigation.replace(AppRoutes.Login);
            }
          }
          SplashScreenView.hide();
        },
        timeout ? 2000 : 0
      );
    }

    fetchData();
  };

  const triggerUTMCustomEvent = async (url: string | null, isFirstLaunch: boolean) => {
    try {
      if (url) {
      } else {
        postCleverTapEvent(CleverTapEventName.CUSTOM_UTM_VISITED, {
          channel: 'Organic',
          is_first_launch: isFirstLaunch,
        });
      }
    } catch (error) {}
  };

  const catchSourceUrlDataUsingAppsFlyer = async (redirectUrl: string | null) => {
    onDeepLinkCanceller = await appsFlyer.onDeepLink(async (res) => {
      try {
        if (redirectUrl && checkUniversalURL(redirectUrl).universal) {
          if (Object.keys(res?.data).length < 2) {
            clevertapEventForAppsflyerDeeplink(
              removeNullFromObj({
                source_url: checkUniversalURL(redirectUrl).source_url,
                channel: 'Organic',
              })
            );
          } else {
            clevertapEventForAppsflyerDeeplink(
              filterAppLaunchSoruceAttributesByKey({
                ...res?.data,
                source_url: checkUniversalURL(redirectUrl).source_url,
              })
            );
          }
        } else {
          clevertapEventForAppsflyerDeeplink(filterAppLaunchSoruceAttributesByKey(res?.data));
        }
        onDeepLinkCanceller();
      } catch (e) {}
    });
  };

  const prefetchUserMetadata = async () => {
    const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
    setUserLoggedIn(userLoggedIn);
    const _createCleverTapProifle = await AsyncStorage.getItem('createCleverTapProifle');
    setCreateCleverTapProifle(_createCleverTapProifle);
  };

  const getAppointmentDataAndNavigate = async (appointmentId: string, isCall: boolean) => {
    try {
      setLoading!(true);
      const response = await client.query<getAppointmentDataQuery, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: { appointmentId },
        fetchPolicy: 'no-cache',
      });
      const appointmentData: any = response.data?.getAppointmentData?.appointmentsHistory?.[0];
      if (appointmentData?.doctorInfo) {
        getData('ChatRoom', appointmentData, false, isCall);
      } else {
        throw new Error('Doctor info is required to process the request.');
      }
      setLoading!(false);
    } catch (error) {
      setLoading!(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: string.appointmentDataError,
        CTAs: [
          {
            text: 'CANCEL',
            onPress: () => {
              hideAphAlert!();
              props.navigation.navigate(AppRoutes.HomeScreen);
            },
            type: 'white-button',
          },
          {
            text: 'RETRY',
            onPress: () => {
              hideAphAlert!();
              getAppointmentDataAndNavigate(appointmentId, isCall);
            },
            type: 'orange-button',
          },
        ],
      });
      CommonBugFender('SplashFetchingAppointmentData', error);
    }
  };

  const fetchProhealthHospitalDetails = async (slugName: string) => {
    setLoading?.(true);
    try {
      const response = await client.query<
        getProHealthHospitalBySlug,
        getProHealthHospitalBySlugVariables
      >({
        query: GET_PROHEALTH_HOSPITAL_BY_SLUG,
        variables: {
          hospitalSlug: slugName,
        },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      if (data?.getProHealthHospitalBySlug?.hospitals?.length) {
        const getHospitalId = data?.getProHealthHospitalBySlug?.hospitals?.[0]?.id;
        regenerateJWTToken(getHospitalId);
      } else {
        regenerateJWTToken();
      }
    } catch (error) {
      regenerateJWTToken();
      CommonBugFender('SplashScreen_fetchProhealthHospitalDetails', error);
    }
  };

  const regenerateJWTToken = async (id?: string) => {
    let deviceType =
      Platform.OS == 'android' ? BookingSource?.Apollo247_Android : BookingSource?.Apollo247_Ios;
    const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');

    if (userLoggedIn == 'true') {
      try {
        firebaseAuth().onAuthStateChanged(async (user) => {
          if (user) {
            const jwtToken = await user.getIdToken(true).catch((error) => {
              CommonBugFender('SplashScreen_regenerateJWTToken', error);
            });
            const openUrl = AppConfig.Configuration.PROHEALTH_BOOKING_URL;
            let finalUrl;
            if (!!id) {
              finalUrl = openUrl.concat(
                '?hospital_id=',
                id,
                '&utm_token=',
                jwtToken,
                '&utm_mobile_number=',
                'mobileNumber',
                '&deviceType=',
                deviceType
              );
            } else {
              finalUrl = openUrl.concat(
                '?utm_token=',
                jwtToken,
                '&utm_mobile_number=',
                'mobileNumber',
                '&deviceType=',
                deviceType
              );
            }
            setLoading?.(false);
            !!jwtToken && jwtToken != '' && getData('prohealth', finalUrl);
          }
        });
      } catch (e) {
        CommonBugFender('regenerateJWTToken_deepLink', e);
      }
    }
  };

  const {
    setLocationDetails,
    setNeedHelpToContactInMessage,
    setNeedHelpTicketReferenceText,
    setNeedHelpReturnPharmaOrderSuccessMessage,
    setSavePatientDetails,
    setCovidVaccineCta,
    setLoginSection,
    setHomeBannerOfferSection,
    setCovidVaccineCtaV2,
    setCartBankOffer,
    setUploadPrescriptionOptions,
    setExpectCallText,
    setNonCartTatText,
    setNonCartDeliveryText,
    setOffersList,
    setOffersListLoading,
    setRecentGlobalSearchList,
    setSelectedPrescriptionType,
  } = useAppCommonData();
  const {
    setMinimumCartValue,
    setMinCartValueForCOD,
    setMaxCartValueForCOD,
    setCartPriceNotUpdateRange,
    setPdpDisclaimerMessage,
    setPharmaHomeNudgeMessage,
    setPharmaCartNudgeMessage,
    setPharmaPDPNudgeMessage,
    setTatDecidedPercentage,
  } = useShoppingCart();
  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      try {
        const settingsCalled: string | null = await AsyncStorage.getItem('settingsCalled');
        if (settingsCalled && settingsCalled === 'true') {
          doRequestAndAccessLocation()
            .then((response) => {
              response && setLocationDetails!(response);
              AsyncStorage.setItem('settingsCalled', 'false');
            })
            .catch((e) => {
              CommonBugFender('SplashScreen_Location_update', e);
              showAphAlert!({
                title: 'Uh oh! :(',
                description: 'Unable to access location.',
              });
            });
        }
      } catch {}
    }
    if (appState.match(/active|foreground/) && nextAppState === 'background') {
      APPStateActive();
      checkForVersionUpdate();
    }
    setAppState(nextAppState);
  };

  type RemoteConfigKeysType = {
    QA?: string;
    DEV?: string;
    PROD: string;
  };

  const RemoteConfigKeys = {
    Android_mandatory: {
      QA: 'QA_Android_mandatory',
      PROD: 'Android_mandatory',
    },
    android_latest_version: {
      QA: 'QA_android_latest_version',
      PROD: 'android_latest_version',
    },
    ios_mandatory: {
      QA: 'QA_ios_mandatory',
      PROD: 'ios_mandatory',
    },
    ios_Latest_version: {
      QA: 'QA_ios_latest_version',
      PROD: 'ios_Latest_version',
    },
    Enable_Conditional_Management: {
      PROD: 'Enable_Conditional_Management',
    },
    Virtual_consultation_fee: {
      QA: 'QA_Virtual_consultation_fee',
      PROD: 'Virtual_consultation_fee',
    },
    Need_Help_To_Contact_In: {
      PROD: 'Need_Help_To_Contact_In',
    },

    Need_Help_Ticket_Reference_Text: {
      QA: 'Need_Help_Ticket_Reference_Text_QA',
      PROD: 'Need_Help_Ticket_Reference_Text',
    },

    Min_Value_For_Pharmacy_Free_Delivery: {
      QA: 'QA_Min_Value_For_Pharmacy_Free_Delivery',
      PROD: 'Min_Value_For_Pharmacy_Free_Delivery',
    },
    Pharmacy_Delivery_Charges: {
      PROD: 'Pharmacy_Delivery_Charges',
    },
    Min_Value_For_Pharmacy_Free_Packaging: {
      PROD: 'Min_Value_For_Pharmacy_Free_Packaging',
    },
    Pharmacy_Packaging_Charges: {
      PROD: 'Pharmacy_Packaging_Charges',
    },
    top6_specailties: {
      QA: 'QA_top_specialties',
      DEV: 'DEV_top_specialties',
      PROD: 'top_specialties',
    },
    min_value_to_nudge_users_to_avail_free_delivery: {
      QA: 'QA_min_value_to_nudge_users_to_avail_free_delivery',
      PROD: 'min_value_to_nudge_users_to_avail_free_delivery',
    },
    Doctor_Partner_Text: {
      QA: 'QA_Doctor_Partner_Text',
      PROD: 'Doctor_Partner_Text',
    },
    Doctors_Page_Size: {
      PROD: 'Doctors_Page_Size',
    },
    Need_Help_Return_Order_Sub_Reason: {
      QA: 'QA_Need_Help_Return_Order_Sub_Reason',
      PROD: 'Need_Help_Return_Order_Sub_Reason',
    },
    Need_Help_Return_Pharma_Order_Success_Message: {
      PROD: 'Need_Help_Return_Pharma_Order_Success_Message',
    },
    Cart_Update_Price_Config: {
      QA: 'Cart_Update_Price_Config_QA',
      PROD: 'Cart_Update_Price_Config',
    },
    Covid_Vaccine_Cta_Key: {
      QA: 'Covid_Vaccine_CTA_QA',
      PROD: 'Covid_Vaccine_CTA',
    },
    Cart_Prescription_Options: {
      QA: 'QA_Cart_Prescription_Options',
      PROD: 'Cart_Prescription_Options',
    },
    Login_Section_Key: {
      QA: 'Login_Section_QA',
      PROD: 'Login_Section',
    },
    home_banner_offer_template: {
      QA: 'home_banner_offer_template',
      PROD: 'home_banner_offer_template',
    },
    Covid_Vaccine_Cta_Key_V2: {
      QA: 'Covid_Vaccine_CTA_V3_QA',
      PROD: 'Covid_Vaccine_CTA_V3',
    },
    Covid_Items: {
      QA: 'QA_Covid_Items',
      PROD: 'Covid_Items',
    },
    Covid_Max_Slot_Days: {
      QA: 'QA_Covid_Max_Slot_Days',
      PROD: 'Covid_Max_Slot_Days',
    },
    Non_Covid_Max_Slot_Days: {
      QA: 'QA_Non_Covid_Max_Slot_Days',
      PROD: 'Non_Covid_Max_Slot_Days',
    },
    Cart_Bank_Offer_Text: {
      QA: 'QA_CART_BANK_OFFER_TEXT',
      PROD: 'CART_BANK_OFFER_TEXT',
    },
    followUp_Chat: {
      QA: 'QA_FollowUp_Chat_Limit',
      PROD: 'FollowUp_Chat_Limit',
    },
    uploadPrescription_Options: {
      QA: 'QA_UploadPrescription_Options',
      PROD: 'UploadPrescription_Options',
    },
    Health_Credit_Expiration_Time: {
      QA: 'Health_Credit_Expiration_Time_QA',
      PROD: 'Health_Credit_Expiration_Time_Prod',
    },
    Expect_Call_Text: {
      QA: 'QA_Expect_Call_Text',
      PROD: 'Expect_Call_Text',
    },
    Non_Cart_TAT_Text: {
      QA: 'QA_Non_Cart_TAT_Text',
      PROD: 'Non_Cart_TAT_Text',
    },
    Non_Cart_Delivery_Text: {
      QA: 'QA_Non_Cart_Delivery_Text',
      PROD: 'Non_Cart_Delivery_Text',
    },
    Mininum_Cart_Values: {
      QA: 'QA_Mininum_Cart_Values',
      PROD: 'Mininum_Cart_Values',
    },
    Helpdesk_Chat_Confim_Msg: {
      QA: 'Helpdesk_Chat_Confim_Msg_QA',
      PROD: 'Helpdesk_Chat_Confim_Msg_Prod',
    },
    Reopen_Help_Max_Time: {
      QA: 'Reopen_Help_Max_Time_QA',
      PROD: 'Reopen_Help_Max_Time_Prod',
    },
    Vaccination_Cities: {
      QA: 'Vaccination_Cities_QA',
      PROD: 'Vaccination_Cities_Prod',
    },
    Vaccine_Type: {
      QA: 'Vaccine_Type_QA',
      PROD: 'Vaccine_Type_Prod',
    },
    Consult_Package_TnC: {
      QA: 'Consult_Package_TnC_QA',
      PROD: 'Consult_Package_TnC_PROD',
    },
    Cancel_Threshold_Pre_Vaccination: {
      QA: 'Cancel_Threshold_Pre_Vaccination_QA',
      PROD: 'Cancel_Threshold_Pre_Vaccination_Prod',
    },
    Used_Up_Alotted_Slot_Msg: {
      QA: 'Used_Up_Alotted_Slot_Msg_QA',
      PROD: 'Used_Up_Alotted_Slot_Msg_Prod',
    },
    Vacc_City_Rule: {
      QA: 'Vacc_City_Rule_QA',
      PROD: 'Vacc_City_Rule_Prod',
    },
    Vacc_Show_Booster: {
      QA: 'Vacc_Show_Booster_QA',
      PROD: 'Vacc_Show_Booster_Prod',
    },
    Enable_Diagnostics_COD: {
      QA: 'QA_Enable_Diagnostics_COD',
      PROD: 'Enable_Diagnostics_COD',
    },
    Enable_Diagnostics_Cancellation_Policy: {
      QA: 'QA_Diagnostic_Cancellation_Policy',
      PROD: 'Diagnostic_Cancellation_Policy',
    },
    Diagnostics_Cancel_Policy_Text_Msg: {
      QA: 'QA_Diagnostics_Cancel_Policy_Text',
      PROD: 'Diagnostics_Cancel_Policy_Text',
    },
    MaxCallRetryAttempt: {
      QA: 'QA_Max_Call_Retry_Attempt',
      PROD: 'Max_Call_Retry_Attempt',
    },
    Enable_Diagnostics_Prepaid: {
      QA: 'QA_Enable_Diagnostics_Prepaid',
      PROD: 'Enable_Diagnostics_Prepaid',
    },
    Diagnostics_CityLevel_Payment_Option: {
      QA: 'QA_Diagnostics_City_Level_Payment_Option',
      PROD: 'Diagnostics_City_Level_Payment_Option',
    },
    Covid_Risk_Level_Url: {
      QA: 'QA_Covid_Risk_Level_Url',
      PROD: 'Covid_Risk_Level_Url',
    },
    Diagnostics_Help_NonOrder_Queries: {
      QA: 'QA_Diagnostics_Help_NonOrder_Queries',
      PROD: 'Diagnostics_Help_NonOrder_Queries',
    },
    Pharma_Discailmer_Message: {
      QA: 'QA_Pharma_PDP_Disclaimer',
      PROD: 'Pharma_PDP_Disclaimer',
    },
    Nudge_Message_Pharmacy_Home: {
      QA: 'QA_Show_nudge_on_pharma_home',
      PROD: 'Show_nudge_on_pharma_home',
    },
    Nudge_Message_Pharmacy_PDP: {
      QA: 'QA_Show_nudge_on_pharma_pdp',
      PROD: 'Show_nudge_on_pharma_pdp',
    },
    Nudge_Message_Pharmacy_Cart: {
      QA: 'QA_Show_nudge_on_pharma_cart',
      PROD: 'Show_nudge_on_pharma_cart',
    },
    Enable_Cred_WebView_Flow: {
      QA: 'QA_Enable_Cred_WebView_Flow',
      PROD: 'Enable_Cred_WebView_Flow',
    },
    CirclePlanPreselected: {
      QA: 'QA_Is_Circle_Preselected',
      PROD: 'Is_Circle_Preselected',
    },
    CircleFacts: {
      QA: 'QA_Circle_Facts',
      PROD: 'Circle_Facts',
    },
    Diagnostics_Default_Location: {
      QA: 'QA_Diagnostics_Default_Address',
      PROD: 'Diagnostics_Default_Address',
    },
    Diagnostics_Report_Tat_Breach_Text: {
      QA: 'QA_Diagnostics_Report_Tat_Breach_Text',
      PROD: 'Diagnostics_Report_Tat_Breach_Text',
    },
    TrueCaller_Login_Enabled: {
      QA: 'TrueCaller_Login_Enabled_QA',
      PROD: 'TrueCaller_Login_Enabled_PROD',
    },
    Consult_Free_Book_Key: {
      QA: 'Consult_Free_Book_Key_QA',
      PROD: 'Consult_Free_Book_Key_PROD',
    },
    LongChat_Launch_Date: {
      QA: 'LONG_CHAT_LAUNCH_DATE_QA',
      PROD: 'LONG_CHAT_LAUNCH_DATE',
    },
    Diagnostics_No_Saving_Text: {
      QA: 'QA_Diagnostics_No_Saving_Text',
      PROD: 'Diagnostics_No_Saving_Text',
    },
    Diagnostics_City_Level_Call_To_Order: {
      QA: 'QA_Diagnostics_City_Level_Call_To_Order',
      PROD: 'Diagnostics_City_Level_Call_To_Order',
    },
    Diagnostics_Covid_Item_Ids: {
      QA: 'QA_Diagnostics_Covid_Item_Ids',
      PROD: 'Diagnostics_Covid_Item_Ids',
    },
    Free_Consult_Message: {
      QA: 'QA_Free_Consult_Message',
      PROD: 'Free_Consult_Message',
    },
    Payment_Processing_Timer: {
      QA: 'Payment_Processing_Timer_QA',
      PROD: 'Payment_Processing_Timer_Prod',
    },
    Show_COD_While_Retrying_Pharma_Payment: {
      QA: 'Show_COD_While_Retrying_Pharma_Payment_QA',
      PROD: 'Show_COD_While_Retrying_Pharma_Payment_Prod',
    },
    Show_COD_While_Retrying_Diag_Payment: {
      QA: 'Show_COD_While_Retrying_Diag_Payment_QA',
      PROD: 'Show_COD_While_Retrying_Diag_Payment_Prod',
    },
    WhatsApp_To_Order: {
      QA: 'QA_WhatsApp_To_Order',
      PROD: 'WhatsApp_To_Order',
    },
    Diagnostics_Nudge_Message_Condition: {
      QA: 'QA_Diagnostics_Show_Nudge_Message',
      PROD: 'Diagnostics_Show_Nudge_Message',
    },
    Diagnostics_Nudge_Message_Text: {
      QA: 'QA_Diagnostics_Nudge_Message_Text',
      PROD: 'Diagnostics_Nudge_Message_Text',
    },
    Diagnostics_Widget_Title: {
      QA: 'QA_Diagnostics_Widget_Title',
      PROD: 'Diagnostics_Widget_Title',
    },
    DeliveryIn_TAT_Text: {
      QA: 'DeliveryIn_TAT_Text_QA',
      PROD: 'DeliveryIn_TAT_Text_PROD',
    },
    Tat_Decided_Percentage: {
      QA: 'Tat_Decided_Percentage_QA',
      PROD: 'Tat_Decided_Percentage_PROD',
    },
    Radiology_Url: {
      QA: 'QA_Radiology_Url',
      PROD: 'Radiology_Url',
    },
    Diagnostics_Phlebo_Call_Number: {
      QA: 'QA_Diagnostics_Phlebo_Call_Number',
      PROD: 'Diagnostics_Phlebo_Call_Number',
    },
    Diagnostics_Enable_UploadPrescription_Whatsapp: {
      QA: 'QA_Diagnostics_UploadPrescription_via_Whatsapp',
      PROD: 'Diagnostics_UploadPrescription_via_Whatsapp',
    },
    Diagnostics_UploadPrescription_Config: {
      QA: 'QA_Diagnostics_UploadPrescription',
      PROD: 'Diagnostics_UploadPrescription',
    },
    REFERRER_GLOBAL_CONTENT: {
      QA: 'QA_REFERRER_GLOBAL_CONTENT',
      PROD: 'REFERRER_GLOBAL_CONTENT',
    },
    REFERRER_MAIN_BANNER_CONTENT: {
      QA: 'QA_REFERRER_MAIN_BANNER_CONTENT',
      PROD: 'REFERRER_MAIN_BANNER_CONTENT',
    },
    SHARE_REFERRER_LINK_CONENT: {
      QA: 'QA_SHARE_REFERRER_LINK_CONENT',
      PROD: 'SHARE_REFERRER_LINK_CONENT',
    },
    YOUR_REWARD_SCREEN_DATA_CONTENT: {
      QA: 'QA_YOUR_REWARD_SCREEN_DATA_CONTENT',
      PROD: 'YOUR_REWARD_SCREEN_DATA_CONTENT',
    },
    REFERRER_CONGRATULATIONS_PAGE: {
      QA: 'QA_REFERRER_CONGRATULATIONS_PAGE',
      PROD: 'REFERRER_CONGRATULATIONS_PAGE',
    },
    REFERRER_TERMS_AND_CONDITION_DATA: {
      QA: 'QA_REFERRER_TERMS_AND_CONDITION_DATA',
      PROD: 'REFERRER_TERMS_AND_CONDITION_DATA',
    },
    REFERRER_FAQS_DATA: {
      QA: 'QA_REFERRER_FAQS_DATA',
      PROD: 'REFERRER_FAQS_DATA',
    },
    DIAGNOSTIC_REVIEW_ORDER_DISCLAIMER: {
      QA: 'QA_Diagnostic_Review_Disclaimer_New',
      PROD: 'Diagnostic_Review_Disclaimer_New',
    },
    APOLLO247_API_KEY: {
      QA: 'APOLLO247_API_KEY',
      PROD: 'APOLLO247_API_KEY',
    },
  };

  const getKeyBasedOnEnv = (
    currentEnv: AppEnv,
    config: typeof RemoteConfigKeys,
    _key: keyof typeof RemoteConfigKeys
  ) => {
    const valueBasedOnEnv = config[_key] as RemoteConfigKeysType;
    return currentEnv === AppEnv.PROD
      ? valueBasedOnEnv.PROD
      : currentEnv === AppEnv.QA ||
        currentEnv === AppEnv.QA2 ||
        currentEnv === AppEnv.QA3 ||
        currentEnv === AppEnv.QA4 ||
        currentEnv === AppEnv.QA5 ||
        currentEnv === AppEnv.QA6 ||
        currentEnv === AppEnv.VAPT
      ? valueBasedOnEnv.QA || valueBasedOnEnv.PROD
      : valueBasedOnEnv.DEV || valueBasedOnEnv.QA || valueBasedOnEnv.PROD;
  };

  const getRemoteConfigValue = (
    remoteConfigKey: keyof typeof RemoteConfigKeys,
    processValue: (key: string) => any
  ) => {
    const key = getKeyBasedOnEnv(APP_ENV, RemoteConfigKeys, remoteConfigKey);
    return processValue(key);
  };

  const setAppConfig = (
    remoteConfigKey: keyof typeof RemoteConfigKeys,
    appConfigKey: keyof typeof AppConfig.Configuration,
    processValue: (key: string) => any
  ) => {
    const key = getKeyBasedOnEnv(APP_ENV, RemoteConfigKeys, remoteConfigKey);
    const value = processValue(key);
    updateAppConfig(appConfigKey, value);
  };

  const getOffers = async () => {
    setOffersListLoading && setOffersListLoading(true);
    const authToken: any = await returnAuthToken?.();
    const apolloClient = buildApolloClient(authToken);
    try {
      const res = await apolloClient.query({
        query: GET_PERSONALIZED_OFFERS,
        fetchPolicy: 'no-cache',
      });
      const offers = res?.data?.getPersonalizedOffers?.response?.personalized_data?.offers_for_you;
      const recent =
        res?.data?.getPersonalizedOffers?.response?.personalized_data?.global_search_text
          ?.search_text;

      if (offers && offers.length > 0) {
        setOffersList && setOffersList(offers);
        appGlobalCache.set('offersList', JSON.stringify(offers));
      } else if (offers && offers.length === 0) {
        appGlobalCache.remove('offersList');
      }

      if (recent && recent.length > 0) {
        setRecentGlobalSearchList && setRecentGlobalSearchList(recent.slice(0, 4));
        appGlobalCache.set('recentList', JSON.stringify(recent));
      } else if (recent && recent.length === 0) {
        appGlobalCache.remove('recentList');
      }

      setOffersListLoading && setOffersListLoading(false);
    } catch (error) {
      setOffersListLoading && setOffersListLoading(false);
    }
  };

  const checkForVersionUpdate = async () => {
    try {
      // Note: remote config values will be cached for the specified duration in development mode, update below value if necessary.
      const minimumFetchIntervalMillis = __DEV__ ? 0 : 0;
      await remoteConfig().setConfigSettings({ minimumFetchIntervalMillis });
      await remoteConfig().fetchAndActivate();
      const config = remoteConfig();
      const needHelpToContactInMessage = getRemoteConfigValue('Need_Help_To_Contact_In', (key) =>
        config.getString(key)
      );
      needHelpToContactInMessage && setNeedHelpToContactInMessage!(needHelpToContactInMessage);

      const needHelpTicketReferenceText = getRemoteConfigValue(
        'Need_Help_Ticket_Reference_Text',
        (key) => config.getString(key)
      );
      needHelpTicketReferenceText && setNeedHelpTicketReferenceText!(needHelpTicketReferenceText);

      const covidVaccineCta = getRemoteConfigValue(
        'Covid_Vaccine_Cta_Key',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.COVID_VACCINE_SECTION
      );
      covidVaccineCta && setCovidVaccineCta!(covidVaccineCta);

      const covidVaccineCtaV2 = getRemoteConfigValue(
        'Covid_Vaccine_Cta_Key_V2',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.COVID_VACCINE_SECTION
      );
      covidVaccineCtaV2 && setCovidVaccineCtaV2!(covidVaccineCtaV2);

      const loginSection = getRemoteConfigValue(
        'Login_Section_Key',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.LOGIN_SECTION
      );
      loginSection && setLoginSection!(loginSection);

      const homeBannerOfferSection = getRemoteConfigValue(
        'home_banner_offer_template',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.LOGIN_SECTION
      );
      homeBannerOfferSection && setHomeBannerOfferSection!(homeBannerOfferSection);

      const needHelpReturnPharmaOrderSuccessMessage = getRemoteConfigValue(
        'Need_Help_Return_Pharma_Order_Success_Message',
        (key) => config.getString(key)
      );
      needHelpReturnPharmaOrderSuccessMessage &&
        setNeedHelpReturnPharmaOrderSuccessMessage!(needHelpReturnPharmaOrderSuccessMessage);

      const bankOfferText = getRemoteConfigValue('Cart_Bank_Offer_Text', (key) =>
        config.getString(key)
      );
      bankOfferText && setCartBankOffer!(bankOfferText);

      const uploadPrescriptionOptions = getRemoteConfigValue(
        'uploadPrescription_Options',
        (key) => JSON.parse(config.getString(key)) || []
      );
      uploadPrescriptionOptions && setUploadPrescriptionOptions!(uploadPrescriptionOptions);

      const expectCallText = getRemoteConfigValue('Expect_Call_Text', (key) =>
        config.getString(key)
      );
      expectCallText && setExpectCallText?.(expectCallText);

      const nonCartTatText = getRemoteConfigValue('Non_Cart_TAT_Text', (key) =>
        config.getString(key)
      );
      nonCartTatText && setNonCartTatText?.(nonCartTatText);

      const nonCartDeliveryText = getRemoteConfigValue('Non_Cart_Delivery_Text', (key) =>
        config.getString(key)
      );
      nonCartDeliveryText && setNonCartDeliveryText?.(nonCartDeliveryText);

      const minMaxCartValues = getRemoteConfigValue(
        'Mininum_Cart_Values',
        (key) => JSON.parse(config.getString(key)) || {}
      );

      minMaxCartValues?.minCartValue && setMinimumCartValue?.(minMaxCartValues?.minCartValue);
      minMaxCartValues?.minCartValueCOD &&
        setMinCartValueForCOD?.(minMaxCartValues?.minCartValueCOD);
      minMaxCartValues?.maxCartValueCOD &&
        setMaxCartValueForCOD?.(minMaxCartValues?.maxCartValueCOD);
      minMaxCartValues?.priceNotUpdateRange &&
        setCartPriceNotUpdateRange?.(minMaxCartValues?.priceNotUpdateRange);

      const disclaimerMessagePdp = getRemoteConfigValue('Pharma_Discailmer_Message', (key) =>
        config.getString(key)
      );
      setPdpDisclaimerMessage?.(disclaimerMessagePdp);

      const tatDecidedPercentage = getRemoteConfigValue('Tat_Decided_Percentage', (key) =>
        config.getNumber(key)
      );
      setTatDecidedPercentage?.(tatDecidedPercentage);

      setAppConfig(
        'Min_Value_For_Pharmacy_Free_Delivery',
        'MIN_CART_VALUE_FOR_FREE_DELIVERY',
        (key) => config.getNumber(key)
      );

      setAppConfig(
        'min_value_to_nudge_users_to_avail_free_delivery',
        'MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY',
        (key) => config.getNumber(key)
      );

      setAppConfig('Pharmacy_Delivery_Charges', 'DELIVERY_CHARGES', (key) => config.getNumber(key));

      setAppConfig('Pharmacy_Packaging_Charges', 'PACKAGING_CHARGES', (key) =>
        config.getNumber(key)
      );

      setAppConfig('Vacc_Show_Booster', 'Vacc_Show_Booster', (key) => config.getBoolean(key));

      setAppConfig('Doctor_Partner_Text', 'DOCTOR_PARTNER_TEXT', (key) => config.getString(key));

      setAppConfig('Doctors_Page_Size', 'Doctors_Page_Size', (key) => config.getNumber(key));

      setAppConfig(
        'top6_specailties',
        'TOP_SPECIALITIES',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.TOP_SPECIALITIES
      );

      setAppConfig(
        'Min_Value_For_Pharmacy_Free_Packaging',
        'MIN_CART_VALUE_FOR_FREE_PACKAGING',
        (key) => config.getNumber(key)
      );

      setAppConfig(
        'Cart_Update_Price_Config',
        'CART_UPDATE_PRICE_CONFIG',
        (key) =>
          JSON.parse(config.getString(key)) || AppConfig.Configuration.CART_UPDATE_PRICE_CONFIG
      );

      setAppConfig(
        'Cart_Prescription_Options',
        'CART_PRESCRIPTION_OPTIONS',
        (key) =>
          JSON.parse(config.getString(key) || 'null') ||
          AppConfig.Configuration.CART_PRESCRIPTION_OPTIONS
      );

      setAppConfig(
        'Need_Help_Return_Order_Sub_Reason',
        'RETURN_ORDER_SUB_REASON',
        (key) =>
          JSON.parse(config.getString(key)) || AppConfig.Configuration.RETURN_ORDER_SUB_REASON
      );

      setAppConfig('Enable_Conditional_Management', 'ENABLE_CONDITIONAL_MANAGEMENT', (key) =>
        config.getBoolean(key)
      );

      setAppConfig('Health_Credit_Expiration_Time', 'Health_Credit_Expiration_Time', (key) =>
        config.getNumber(key)
      );

      setAppConfig('Reopen_Help_Max_Time', 'Reopen_Help_Max_Time', (key) => {
        config.getNumber(key);
      });

      setAppConfig('Vaccination_Cities', 'Vaccination_Cities_List', (key) => {
        return JSON.parse(config.getString(key)) || AppConfig.Configuration.Vaccination_Cities_List;
      });

      setAppConfig('Consult_Package_TnC', 'Consult_Package_TnC', (key) => {
        try {
          return JSON.parse(config.getString(key));
        } catch (error) {}

        return AppConfig.Configuration.Consult_Package_TnC;
      });

      setAppConfig('Vaccine_Type', 'Vaccine_Type', (key) => {
        return JSON.parse(config.getString(key)) || AppConfig.Configuration.Vaccine_Type;
      });

      setAppConfig('Vacc_City_Rule', 'Vacc_City_Rule', (key) => {
        return JSON.parse(config.getString(key));
      });

      setAppConfig('Cancel_Threshold_Pre_Vaccination', 'Cancel_Threshold_Pre_Vaccination', (key) =>
        config.getNumber(key)
      );

      setAppConfig('Helpdesk_Chat_Confim_Msg', 'Helpdesk_Chat_Confim_Msg', (key) =>
        config.getString(key)
      );

      setAppConfig('Used_Up_Alotted_Slot_Msg', 'Used_Up_Alotted_Slot_Msg', (key) =>
        config.getString(key)
      );

      setAppConfig('Covid_Items', 'Covid_Items', (key) => config.getString(key));
      setAppConfig('Covid_Max_Slot_Days', 'Covid_Max_Slot_Days', (key) => config.getNumber(key));
      setAppConfig('Non_Covid_Max_Slot_Days', 'Non_Covid_Max_Slot_Days', (key) =>
        config.getNumber(key)
      );
      setAppConfig('followUp_Chat', 'FollowUp_Chat_Limit', (key) => config.getNumber(key));
      setAppConfig('Enable_Diagnostics_COD', 'Enable_Diagnostics_COD', (key) =>
        config.getBoolean(key)
      );
      setAppConfig(
        'Enable_Diagnostics_Cancellation_Policy',
        'Enable_Diagnostics_Cancellation_Policy',
        (key) => config.getBoolean(key)
      );
      setAppConfig(
        'Diagnostics_Cancel_Policy_Text_Msg',
        'Diagnostics_Cancel_Policy_Text_Msg',
        (key) => config.getString(key)
      );
      setAppConfig('MaxCallRetryAttempt', 'MaxCallRetryAttempt', (key) => config.getNumber(key));

      setAppConfig('Enable_Diagnostics_Prepaid', 'Enable_Diagnostics_Prepaid', (key) =>
        config.getBoolean(key)
      );
      setAppConfig(
        'Diagnostics_CityLevel_Payment_Option',
        'DIAGNOSTICS_CITY_LEVEL_PAYMENT_OPTION',
        (key) =>
          JSON.parse(config.getString(key)) ||
          AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_PAYMENT_OPTION
      );

      setAppConfig('Covid_Risk_Level_Url', 'COVID_RISK_LEVEL_URL', (key) => config.getString(key));
      setAppConfig(
        'Diagnostics_Help_NonOrder_Queries',
        'Diagnostics_Help_NonOrder_Queries',
        (key) => config.getString(key)
      );
      setAppConfig('Enable_Cred_WebView_Flow', 'enableCredWebView', (key) =>
        config.getBoolean(key)
      );

      setAppConfig('TrueCaller_Login_Enabled', 'TrueCaller_Login_Enabled', (key) =>
        config.getBoolean(key)
      );

      setAppConfig('Consult_Free_Book_Key', 'Consult_Free_Book_Key', (key) =>
        config.getString(key)
      );
      setAppConfig('Payment_Processing_Timer', 'Payment_Processing_Timer', (key) =>
        config.getString(key)
      );
      setAppConfig(
        'Show_COD_While_Retrying_Pharma_Payment',
        'Show_COD_While_Retrying_Pharma_Payment',
        (key) => config.getBoolean(key)
      );
      setAppConfig(
        'Show_COD_While_Retrying_Diag_Payment',
        'Show_COD_While_Retrying_Diag_Payment',
        (key) => config.getBoolean(key)
      );

      setAppConfig('DeliveryIn_TAT_Text', 'DeliveryIn_TAT_Text', (key) => config.getString(key));

      const nudgeMessagePharmacyHome = getRemoteConfigValue(
        'Nudge_Message_Pharmacy_Home',
        (key) => JSON.parse(config.getString(key)) || null
      );

      nudgeMessagePharmacyHome && setPharmaHomeNudgeMessage?.(nudgeMessagePharmacyHome);

      const nudgeMessagePharmacyCart = getRemoteConfigValue(
        'Nudge_Message_Pharmacy_Cart',
        (key) => JSON.parse(config.getString(key)) || null
      );

      nudgeMessagePharmacyCart && setPharmaCartNudgeMessage?.(nudgeMessagePharmacyCart);

      const nudgeMessagePharmacyPDP = getRemoteConfigValue(
        'Nudge_Message_Pharmacy_PDP',
        (key) => JSON.parse(config.getString(key)) || null
      );

      nudgeMessagePharmacyPDP && setPharmaPDPNudgeMessage?.(nudgeMessagePharmacyPDP);

      setAppConfig('CirclePlanPreselected', 'CIRCLE_PLAN_PRESELECTED', (key) =>
        config.getBoolean(key)
      );

      setAppConfig('CircleFacts', 'CIRCLE_FACTS', (key) => config.getString(key));

      setAppConfig('LongChat_Launch_Date', 'LONG_CHAT_LAUNCH_DATE', (key) => config.getString(key));

      setAppConfig(
        'Diagnostics_Default_Location',
        'DIAGNOSTIC_DEFAULT_LOCATION',
        (key) =>
          JSON.parse(config.getString(key) || 'null') ||
          AppConfig.Configuration.DIAGNOSTIC_DEFAULT_LOCATION
      );

      setAppConfig(
        'Diagnostics_Report_Tat_Breach_Text',
        'DIAGNOSTICS_REPORT_TAT_BREACH_TEXT',
        (key) => config.getString(key)
      );

      setAppConfig('Diagnostics_No_Saving_Text', 'DIAGNOSTICS_NO_CIRCLE_SAVINGS_TEXT', (key) =>
        config.getString(key)
      );

      setAppConfig(
        'Free_Consult_Message',
        'FREE_CONSULT_MESSAGE',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.FREE_CONSULT_MESSAGE
      );

      setAppConfig(
        'WhatsApp_To_Order',
        'WHATSAPP_TO_ORDER',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.WHATSAPP_TO_ORDER
      );

      setAppConfig(
        'Diagnostics_City_Level_Call_To_Order',
        'DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER',
        (key) =>
          JSON.parse(config.getString(key) || 'null') ||
          AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER
      );

      setAppConfig(
        'Diagnostics_Covid_Item_Ids',
        'DIAGNOSTICS_COVID_ITEM_IDS',
        (key) =>
          JSON.parse(config.getString(key) || 'null') ||
          AppConfig.Configuration.DIAGNOSTICS_COVID_ITEM_IDS
      );
      setAppConfig(
        'Diagnostics_Nudge_Message_Condition',
        'DIAGNOSTICS_NUDGE_MESSAGE_CONDITION',
        (key) =>
          JSON.parse(config.getString(key) || 'null') ||
          AppConfig.Configuration.DIAGNOSTICS_NUDGE_MESSAGE_CONDITION
      );
      setAppConfig('Diagnostics_Nudge_Message_Text', 'DIAGNOSTICS_NUDGE_MESSAGE_TEXT', (key) =>
        config.getString(key)
      );
      setAppConfig(
        'Diagnostics_Widget_Title',
        'DIAGNOSITCS_WIDGET_TITLES',
        (key) =>
          JSON.parse(config.getString(key) || 'null') ||
          AppConfig.Configuration.DIAGNOSITCS_WIDGET_TITLES
      );

      setAppConfig('Radiology_Url', 'RADIOLOGY_URL', (key) => config.getString(key));
      setAppConfig('Diagnostics_Phlebo_Call_Number', 'DIAGNOSTICS_PHLEBO_CALL_NUMBER', (key) =>
        config.getString(key)
      );
      setAppConfig(
        'Diagnostics_Enable_UploadPrescription_Whatsapp',
        'DIAGNOSTICS_ENABLE_UPLOAD_PRESCRIPTION_VIA_WHATSAPP',
        (key) => config.getBoolean(key)
      );
      setAppConfig(
        'Diagnostics_UploadPrescription_Config',
        'DIAGNOSTICS_UPLOAD_PRESCRIPTION',
        (key) =>
          JSON.parse(config.getString(key) || 'null') ||
          AppConfig.Configuration.DIAGNOSTICS_UPLOAD_PRESCRIPTION
      );

      setAppConfig(
        'DIAGNOSTIC_REVIEW_ORDER_DISCLAIMER',
        'DIAGNOSTIC_REVIEW_ORDER_DISCLAIMER_TEXT',
        (key) => config.getString(key)
      );

      setAppConfig('APOLLO247_API_KEY', 'APOLLO247_API_KEY', (key) => config.getString(key));

      const { iOS_Version, Android_Version } = AppConfig.Configuration;
      const isIOS = Platform.OS === 'ios';
      const appVersion = coerce(isIOS ? iOS_Version : Android_Version)?.version;
      const appLatestVersionFromConfig = getRemoteConfigValue(
        isIOS ? 'ios_Latest_version' : 'android_latest_version',
        (key) => config.getString(key)
      );
      const appLatestVersion = coerce(appLatestVersionFromConfig)?.version;
      const isMandatory: boolean = getRemoteConfigValue(
        isIOS ? 'ios_mandatory' : 'Android_mandatory',
        (key) => config.getBoolean(key)
      );

      if (appVersion && appLatestVersion && isLessThan(appVersion, appLatestVersion)) {
        showUpdateAlert(isMandatory);
      }
    } catch (error) {
      CommonBugFender('SplashScreen - Error processing remote config', error);
    }
  };

  const getAllReferrerDataOnInitialsLoad = async () => {
    const minimumFetchIntervalMillis = __DEV__ ? 0 : 0;
    await remoteConfig().setConfigSettings({ minimumFetchIntervalMillis });
    await remoteConfig().fetchAndActivate();
    const config = remoteConfig();
    const globalData = getRemoteConfigValue(
      'REFERRER_GLOBAL_CONTENT',
      (key) =>
        (config.getString(key) && JSON.parse(config.getString(key))) || string.refAndEarn.global
    );
    setReferralGlobalData?.(globalData || string.refAndEarn.global);
    const mainBannerContent = getRemoteConfigValue(
      'REFERRER_MAIN_BANNER_CONTENT',
      (key) =>
        (config.getString(key) && JSON.parse(config.getString(key))) ||
        string.refAndEarn.referralMainBanner
    );
    setReferralMainBanner?.(mainBannerContent || string.refAndEarn.referralMainBanner);
    const shareReferrerLinkScreenContent = getRemoteConfigValue(
      'SHARE_REFERRER_LINK_CONENT',
      (key) =>
        (config.getString(key) && JSON.parse(config.getString(key))) ||
        string.refAndEarn.shareReferrerLink
    );
    setShareReferrerLinkData?.(
      shareReferrerLinkScreenContent || string.refAndEarn.shareReferrerLink
    );
    const yourRewardScreenContent = getRemoteConfigValue(
      'YOUR_REWARD_SCREEN_DATA_CONTENT',
      (key) =>
        (config.getString(key) && JSON.parse(config.getString(key))) ||
        string.refAndEarn.yourRewards
    );
    setYourRewardsScreenData?.(yourRewardScreenContent || string.refAndEarn.yourRewards);
    const congratulationsScreenContent = getRemoteConfigValue(
      'REFERRER_CONGRATULATIONS_PAGE',
      (key) =>
        (config.getString(key) && JSON.parse(config.getString(key))) ||
        string.refAndEarn.congratulationPage
    );
    setCongratulationPageData?.(
      congratulationsScreenContent || string.refAndEarn.congratulationPage
    );
    const termsAndConditonsScreenContent = getRemoteConfigValue(
      'REFERRER_TERMS_AND_CONDITION_DATA',
      (key) =>
        (config.getString(key) && JSON.parse(config.getString(key))) ||
        string.refAndEarn.refererTermsAndCondition
    );
    setRefererTermsAndConditionData?.(
      termsAndConditonsScreenContent || string.refAndEarn.refererTermsAndCondition
    );
    const faqScreenContent = getRemoteConfigValue(
      'REFERRER_FAQS_DATA',
      (key) =>
        (config.getString(key) && JSON.parse(config.getString(key))) ||
        string.refAndEarn.refererFAQs
    );
    setRefererFAQsData?.(faqScreenContent || string.refAndEarn.refererFAQs);
  };

  const showUpdateAlert = (mandatory: boolean) => {
    showAphAlert!({
      title: `Hi there :)`,
      description: 'There is a new version available for this app. Please update it.',
      unDismissable: true,
      children: (
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 20,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginVertical: 18,
          }}
        >
          {!mandatory ? (
            <Button
              style={{
                flex: 1,
                marginRight: 16,
              }}
              title={'CANCEL'}
              onPress={() => {
                hideAphAlert!();
              }}
            />
          ) : null}

          <Button
            style={{ flex: 1 }}
            title={'UPDATE'}
            onPress={() => {
              hideAphAlert!();

              Linking.openURL(
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com/in/app/apollo247/id1496740273'
                  : 'https://play.google.com/store/apps/details?id=com.apollo.patientapp'
              ).catch((err) => {});
            }}
          />
        </View>
      ),
    });
  };

  const configureAnimation = () => {
    const randomIndex = Math.floor(Math.random() * CONST_SPLASH_LOADER.length);
    setSelectedAnimationIndex(randomIndex);
    logoAnimation();
  };

  const spinObject = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  let spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const springAnimation = () => {
    Animated.loop(
      Animated.spring(springValue, {
        toValue: 1.4,
        friction: 1,
        useNativeDriver: true,
      })
    ).start();
  };

  const logoAnimation = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1300,
      useNativeDriver: true,
    }).start(() => {});
  };

  return (
    <View style={styles.mainView}>
      <Animated.View
        style={{
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.6, 1],
              }),
            },
          ],
        }}
      >
        <SplashLogo style={styles.splashLogo} resizeMode="contain" />
      </Animated.View>

      {CONST_SPLASH_LOADER[selectedAnimationIndex] == string.splash.STETHO ? (
        <Animated.View
          style={[
            styles.loaderContainer,
            {
              transform: [
                {
                  scale: springValue,
                },
              ],
            },
          ]}
        >
          <SplashStethoscope style={styles.loader} />
        </Animated.View>
      ) : null}

      {CONST_SPLASH_LOADER[selectedAnimationIndex] == string.splash.CAPSULE ? (
        <Animated.View style={[styles.loaderContainer, { transform: [{ rotate: spin }] }]}>
          <SplashCapsule style={styles.loader} />
        </Animated.View>
      ) : null}

      {CONST_SPLASH_LOADER[selectedAnimationIndex] == string.splash.SYRINGE ? (
        <Animated.View style={[styles.loaderContainer, { transform: [{ rotate: spin }] }]}>
          <SplashSyringe style={styles.loader} />
        </Animated.View>
      ) : null}
    </View>
  );
};
