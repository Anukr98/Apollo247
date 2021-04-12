import string from '@aph/mobile-patients/src/strings/strings.json';
import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ActivityIndicator,
  Linking,
  AppStateStatus,
  AppState,
  DeviceEventEmitter,
  NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { SplashLogo } from '@aph/mobile-patients/src/components/SplashLogo';
import { AppRoutes, getCurrentRoute } from '@aph/mobile-patients/src/components/NavigatorContainer';
import remoteConfig from '@react-native-firebase/remote-config';
import SplashScreenView from 'react-native-splash-screen';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAuth } from '../hooks/authHooks';
import { AppConfig, updateAppConfig, PharmacyHomepageInfo, AppEnv } from '../strings/AppConfig';
import { PrefetchAPIReuqest } from '@praktice/navigator-react-native-sdk';
import { Button } from './ui/Button';
import { useUIElements } from './UIElementsProvider';
import { apiRoutes } from '../helpers/apiRoutes';
import {
  CommonBugFender,
  setBugFenderLog,
  setBugfenderPhoneNumber,
  isIos,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  doRequestAndAccessLocation,
  InitiateAppsFlyer,
  APPStateInActive,
  APPStateActive,
  postWebEngageEvent,
  callPermissions,
  UnInstallAppsFlyer,
  postFirebaseEvent,
  readableParam,
  setCrashlyticsAttributes,
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
  GET_ALL_SPECIALTIES,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  ProductPageViewedSource,
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import isLessThan from 'semver/functions/lt';
import coerce from 'semver/functions/coerce';
import RNCallKeep from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';
import { string as localStrings } from '../strings/string';
import { isUpperCase } from '@aph/mobile-patients/src/utils/commonUtils';
import Pubnub from 'pubnub';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import messaging from '@react-native-firebase/messaging';
// The moment we import from sdk @praktice/navigator-react-native-sdk,
// finally not working on all promises.
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import { getMedicineSku } from '@aph/mobile-patients/src/helpers/apiCalls';
(function() {
  /**
   * Praktice.ai
   * Polyfill for Promise.prototype.finally
   *
   * [ Temporary FIX ] => Add this code just below the import of SDK,
   * [ Update ] => In the next version it will part of SDK, user will not be required to add this code-block
   */
  let globalObject;
  // if (typeof global !== 'undefined') {
  globalObject = global;
  // } else if (typeof window !== 'undefined' && window.document) {
  // globalObject = window;
  // }
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
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export interface SplashScreenProps extends NavigationScreenProps {}

export const SplashScreen: React.FC<SplashScreenProps> = (props) => {
  const { APP_ENV } = AppConfig;
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const { setAllPatients, setMobileAPICalled } = useAuth();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [appState, setAppState] = useState(AppState.currentState);
  const [takeToConsultRoom, settakeToConsultRoom] = useState<boolean>(false);
  const client = useApolloClient();
  const voipAppointmentId = useRef<string>('');
  const voipPatientId = useRef<string>('');
  const voipCallType = useRef<string>('');
  const voipDoctorName = useRef<string>('');

  const config: Pubnub.PubnubConfig = {
    origin: 'apollo.pubnubapi.com',
    subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
    publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
    restore: true,
    ssl: true,
    uuid: `PATIENT_${voipPatientId.current}`,
  };
  const pubnub = new Pubnub(config);

  const { setPhrNotificationData } = useAppCommonData();

  useEffect(() => {
    takeToConsultRoom && getData('ConsultRoom', undefined, false);
  }, [takeToConsultRoom]);

  useEffect(() => {
    InitiateAppsFlyer(props.navigation);
    DeviceEventEmitter.addListener('accept', (params) => {
      if (getCurrentRoute() !== AppRoutes.ChatRoom) {
        voipCallType.current = params.call_type;
        callPermissions();
        getAppointmentDataAndNavigate(params.appointment_id, true);
      }
    });
    DeviceEventEmitter.addListener('reject', (params) => {
      if (getCurrentRoute() !== AppRoutes.ChatRoom) {
        getAppointmentDataAndNavigate(params.appointment_id, false);
      }
    });
    setBugfenderPhoneNumber();
    AppState.addEventListener('change', _handleAppStateChange);
    checkForVersionUpdate();

    try {
      PrefetchAPIReuqest({
        clientId: AppConfig.Configuration.PRAKTISE_API_KEY,
      })
        .then((res: any) => console.log(res, 'PrefetchAPIReuqest'))
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
    handleDeepLink();
    getDeviceToken();
  }, []);

  useEffect(() => {
    if (isIos()) {
      initializeCallkit();
      handleVoipEventListeners();
    }
  }, []);

  const getDeviceToken = async () => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';
    if (
      !currentDeviceToken ||
      typeof currentDeviceToken != 'string' ||
      typeof currentDeviceToken == 'object'
    ) {
      messaging()
        .getToken()
        .then((token) => {
          console.log('token', token);
          AsyncStorage.setItem('deviceToken', JSON.stringify(token));
          UnInstallAppsFlyer(token);
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
      'Appointment ID': voipAppointmentId.current,
      'Doctor Name': voipDoctorName.current,
      'Speciality Name': '',
      'Speciality ID': '',
      'Doctor Type': '',
      'Mode of Call': voipCallType.current === 'Video' ? 'Video' : 'Audio',
      Platform: 'App',
    };
    postWebEngageEvent(WebEngageEventName.PATIENT_DECLINED_CALL, eventAttributes);
  };

  const handleDeepLink = () => {
    try {
      Linking.getInitialURL()
        .then((url) => {
          setBugFenderLog('DEEP_LINK_URL', url);
          if (url) {
            try {
              handleOpenURL(url);
              fireAppOpenedEvent(url);
              console.log('linking', url);
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
          console.log('event', event);
          setBugFenderLog('DEEP_LINK_EVENT', JSON.stringify(event));
          handleOpenURL(event.url);
          fireAppOpenedEvent(event.url);
        } catch (e) {}
      });
      AsyncStorage.removeItem('location');
    } catch (error) {
      CommonBugFender('SplashScreen_Linking_URL_try', error);
    }
  };
  const handleOpenURL = (event: any) => {
    try {
      if (Platform.OS === 'ios') {
        // for ios universal links
        InitiateAppsFlyer(props.navigation);
      }
      let route;

      const a = event.indexOf('https://www.apollo247.com');
      if (a == 0) {
        handleDeeplinkFormatTwo(event);
      } else {
        route = event.replace('apollopatients://', '');
        const data = route.split('?');
        setBugFenderLog('DEEP_LINK_DATA', data);
        route = data[0];

        let linkId = '';
        let attributes = {
          media_source: 'not set',
        };
        try {
          if (data?.length >= 2) {
            linkId = data[1]?.split('&');
            const params = data[1]?.split('&');
            const utmParams = params?.map((item: any) => item.split('='));
            utmParams?.forEach(
              (item: any) => item?.length == 2 && (attributes?.[item?.[0]] = item?.[1])
            );
            if (linkId.length > 0) {
              linkId = linkId[0];
              setBugFenderLog('DEEP_LINK_SPECIALITY_ID', linkId);
            }
          }
        } catch (error) {}
        console.log(linkId, 'linkId');

        switch (route) {
          case 'consult':
          case 'Consult':
            console.log('Consult');
            getData('Consult', data.length === 2 ? linkId : undefined);
            break;

          case 'medicine':
          case 'Medicine':
            console.log('Medicine');
            getData('Medicine', data.length === 2 ? linkId : undefined);
            break;

          case 'uploadprescription':
          case 'UploadPrescription':
            getData('UploadPrescription', data.length === 2 ? linkId : undefined);
            break;

          case 'medicinerecommendedsection':
          case 'MedicineRecommendedSection':
            getData('MedicineRecommendedSection');
            break;

          case 'test':
          case 'Test':
            console.log('Test');
            getData('Test');
            break;

          case 'speciality':
          case 'Speciality':
            console.log('Speciality handleopen');
            if (data.length === 2) getData('Speciality', linkId);
            else getData('DoctorSearch');
            break;

          case 'doctor':
          case 'Doctor':
            console.log('Doctor handleopen');
            if (data.length === 2)
              getData('Doctor', linkId, undefined, undefined, attributes?.media_source);
            break;

          case 'doctorsearch':
          case 'DoctorSearch':
            console.log('DoctorSearch handleopen');
            getData('DoctorSearch');
            break;

          case 'medicinesearch':
          case 'MedicineSearch':
            console.log('MedicineSearch handleopen');
            getData('MedicineSearch', data.length === 2 ? linkId : undefined);
            break;

          case 'medicinedetail':
          case 'MedicineDetail':
            console.log('MedicineDetail handleopen');
            getData('MedicineDetail', data.length === 2 ? linkId : undefined);
            break;

          case 'medicinecart':
          case 'MedicineCart':
            console.log('MedicineCart handleopen');
            getData('MedicineCart', data.length === 2 ? linkId : undefined);
            break;

          case 'chatroom':
          case 'ChatRoom':
            if (data.length === 2) getAppointmentDataAndNavigate(linkId, false);
            break;

          case 'doctorcall':
          case 'DoctorCall':
            if (data.length === 2 && getCurrentRoute() !== AppRoutes.ChatRoom) {
              const params = linkId.split('+');
              voipCallType.current = params[1];
              callPermissions();
              getAppointmentDataAndNavigate(params[0], true);
            }
            break;

          case 'doctorcallrejected':
          case 'DoctorCallRejected':
            {
              setLoading!(true);
              const appointmentId = linkId?.split('+')?.[0];
              const config: Pubnub.PubnubConfig = {
                origin: 'apollo.pubnubapi.com',
                subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
                publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
                ssl: true,
                restore: true,
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
            }
            break;

          case 'order':
          case 'Order':
            if (data.length === 2) getData('Order', linkId);
            break;

          case 'myorders':
          case 'MyOrders':
            getData('MyOrders');
            break;

          case 'webview':
            if (data.length >= 1) {
              let url = data[1].replace('param=', '');
              getData('webview', url);
            }
            break;

          case 'finddoctors':
          case 'FindDoctors':
            if (data.length === 2) getData('FindDoctors', linkId);
            break;

          case 'healthrecordshome':
          case 'HealthRecordsHome':
            console.log('HealthRecordsHome handleopen');
            getData('HealthRecordsHome');
            break;

          case 'manageprofile':
          case 'ManageProfile':
            console.log('ManageProfile handleopen');
            getData('ManageProfile');
            break;

          case 'oneapollomembership':
          case 'OneApolloMembership':
            getData('OneApolloMembership');
            break;

          case 'testdetails':
          case 'TestDetails':
            getData('TestDetails', data.length === 2 ? linkId : undefined);
            break;

          case 'consultdetails':
          case 'ConsultDetails':
            getData('ConsultDetails', data.length === 2 ? linkId : undefined);
            break;

          case 'circlemembershipdetails':
          case 'CircleMembershipDetails':
            getData('CircleMembershipDetails');
            break;

          case 'symptomtracker':
          case 'SymptomTracker':
            getData('SymptomTracker');
            break;

          case 'testlisting':
          case 'TestListing':
            getData('TestListing', data?.length === 2 ? linkId : undefined);
            break;

          case 'testreport':
          case 'TestReport':
            getData('TestReport', data?.length === 2 ? linkId : undefined);
            break;

          case 'mytestorders':
          case 'MyTestOrders':
            getData('MyTestOrders');
            break;

          default:
            getData('ConsultRoom', undefined, true);
            // webengage event
            const eventAttributes: WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED] = {
              source: 'deeplink',
            };
            postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
            break;
        }
        console.log('route', route);
      }
    } catch (error) {}
  };

  const handleDeeplinkFormatTwo = (event: any) => {
    const url = event.replace('https://www.apollo247.com/', '');
    const data = url.split('/');
    const route = data[0];
    let linkId = '';
    try {
      if (data.length >= 2) {
        linkId = data[1].split('&');
        if (linkId.length > 0) {
          linkId = linkId[0];
        }
      }
    } catch (error) {}
    switch (route) {
      case 'medicines':
        getData('Medicine');
        break;
      case 'prescription-review':
        getData('UploadPrescription');
        break;
      case 'specialties':
        linkId == '' ? getData('DoctorSearch') : getData('SpecialityByName', linkId);
        break;
      case 'doctors':
        linkId == '' ? getData('DoctorSearch') : getData('DoctorByNameId', linkId);
        break;
      case 'medicine':
        linkId == '' ? getData('Medicine') : getData('MedicineByName', linkId);
        break;
      default:
        getData('ConsultRoom', undefined, true);
        const eventAttributes: WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED] = {
          source: 'deeplink',
        };
        postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
        break;
    }
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
        console.log('attributes >>>', attributes);
        postFirebaseEvent(FirebaseEventName.APP_OPENED, attributes);
      }
    } else if (b == 0) {
      const route = event.replace('https://www.apollo247.com/', '');
      const data = route.split('?');
      if (data.length >= 2) {
        const params = data[1].split('&');
        const utmParams = params.map((item: any) => item.split('='));
        utmParams.forEach((item: any) => item?.length == 2 && (attributes[item[0]] = item[1]));
        console.log('attributes >>>', attributes);
        postFirebaseEvent(FirebaseEventName.APP_OPENED, attributes);
      } else {
        const referrer = await NativeModules.GetReferrer.referrer();
        attributes['referrer'] = referrer;
        console.log('attributes >>>', attributes);
        postFirebaseEvent(FirebaseEventName.APP_OPENED, attributes);
      }
    } else {
      console.log('attributes >>>', attributes);
      postFirebaseEvent(FirebaseEventName.APP_OPENED, attributes);
    }
  }
  const getData = (
    routeName: string,
    id?: string,
    timeout?: boolean,
    isCall?: boolean,
    mediaSource?: string
  ) => {
    async function fetchData() {
      // const onboarding = await AsyncStorage.getItem('onboarding');
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const signUp = await AsyncStorage.getItem('signUp');
      const multiSignUp = await AsyncStorage.getItem('multiSignUp');
      AsyncStorage.setItem('showSchduledPopup', 'false');

      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
      const item = JSON.parse(retrievedItem || 'null');
      const currentPatientId: any = await AsyncStorage.getItem('selectUserId');

      const callByPrism: any = await AsyncStorage.getItem('callByPrism');
      let allPatients;

      const isCircleMember: string | null = await AsyncStorage.getItem('isCircleMember');

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
        () => {
          if (userLoggedIn == 'true') {
            setshowSpinner(false);

            if (mePatient) {
              if (mePatient.firstName !== '') {
                callPhrNotificationApi(currentPatient);
                setCrashlyticsAttributes(mePatient);
                pushTheView(
                  routeName,
                  id ? id : undefined,
                  isCall,
                  isCircleMember === 'yes',
                  mediaSource
                );
              } else {
                props.navigation.replace(AppRoutes.Login);
              }
            }
          } else {
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
  const handleEncodedURI = (encodedString: string) => {
    const decodedString = decodeURIComponent(encodedString);
    const splittedString = decodedString.split('+');
    if (splittedString.length > 1) {
      return splittedString;
    } else {
      return encodedString.split('%20');
    }
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
          { text: 'CANCEL', onPress: () => hideAphAlert!(), type: 'white-button' },
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

  const pushTheView = (
    routeName: string,
    id?: any,
    isCall?: boolean,
    isCircleMember?: boolean,
    mediaSource?: string
  ) => {
    console.log('pushTheView', routeName);
    setBugFenderLog('DEEP_LINK_PUSHVIEW', { routeName, id });
    switch (routeName) {
      case 'Consult':
        console.log('Consult');
        // if (id) {
        //   props.navigation.navigate(AppRoutes.ConsultDetailsById, { id: id });
        // } else
        props.navigation.navigate('APPOINTMENTS');
        break;

      case 'Medicine':
        console.log('Medicine');
        props.navigation.navigate('MEDICINES');
        break;

      case 'UploadPrescription':
        props.navigation.navigate('MEDICINES', { showUploadPrescriptionPopup: true });
        break;

      case 'MedicineRecommendedSection':
        props.navigation.navigate('MEDICINES', { showRecommendedSection: true });
        break;

      case 'MedicineDetail':
        console.log('MedicineDetail');
        props.navigation.navigate(AppRoutes.ProductDetailPage, {
          sku: id,
          movedFrom: ProductPageViewedSource.DEEP_LINK,
        });
        break;

      case 'Test':
        console.log('Test');
        props.navigation.navigate('TESTS', {
          movedFrom: 'deeplink',
        });
        break;

      case 'ConsultRoom':
        console.log('ConsultRoom');
        props.navigation.replace(AppRoutes.ConsultRoom);
        break;

      case 'Speciality':
        setBugFenderLog('APPS_FLYER_DEEP_LINK_COMPLETE', id);
        const filtersData = id ? handleEncodedURI(id) : '';
        console.log('filtersData============', filtersData);
        props.navigation.navigate(AppRoutes.DoctorSearchListing, {
          specialityId: filtersData[0] ? filtersData[0] : '',
          typeOfConsult: filtersData.length > 1 ? filtersData[1] : '',
          doctorType: filtersData.length > 2 ? filtersData[2] : '',
        });
        // props.navigation.replace(AppRoutes.DoctorSearchListing, {
        //   specialityId: id ? id : '',
        // });
        break;
      case 'FindDoctors':
        const cityBrandFilter = id ? handleEncodedURI(id) : '';
        console.log('cityBrandFilter', cityBrandFilter);
        props.navigation.navigate(AppRoutes.DoctorSearchListing, {
          specialityId: cityBrandFilter[0] ? cityBrandFilter[0] : '',
          city:
            cityBrandFilter.length > 1 && !isUpperCase(cityBrandFilter[1])
              ? cityBrandFilter[1]
              : null,
          brand:
            cityBrandFilter.length > 2
              ? cityBrandFilter[2]
              : isUpperCase(cityBrandFilter[1])
              ? cityBrandFilter[1]
              : null,
        });
        break;
      case 'Doctor':
        props.navigation.navigate(AppRoutes.DoctorDetails, {
          doctorId: id,
          fromDeeplink: true,
          mediaSource: mediaSource,
        });
        break;

      case 'DoctorSearch':
        props.navigation.navigate(AppRoutes.DoctorSearch);
        break;

      case 'MedicineSearch':
        if (id) {
          const [itemId, name] = id.split(',');
          console.log(itemId, name);

          props.navigation.navigate(AppRoutes.MedicineListing, {
            category_id: itemId,
            title: `${name ? name : 'Products'}`.toUpperCase(),
            movedFrom: 'deeplink',
          });
        }
        break;

      case 'MedicineCart':
        console.log('MedicineCart handleopen');
        props.navigation.navigate(AppRoutes.MedicineCart, {
          movedFrom: 'splashscreen',
        });
        break;
      case 'ChatRoom':
        props.navigation.navigate(AppRoutes.ChatRoom, {
          data: id,
          callType: voipCallType.current ? voipCallType.current.toUpperCase() : '',
          prescription: '',
          isCall: isCall,
          isVoipCall: voipAppointmentId.current ? true : false,
        });
        break;
      case 'Order':
        props.navigation.navigate(AppRoutes.OrderDetailsScene, {
          goToHomeOnBack: true,
          orderAutoId: isNaN(id) ? '' : id,
          billNumber: isNaN(id) ? id : '',
        });
        break;
      case 'MyOrders':
        props.navigation.navigate(AppRoutes.YourOrdersScene);
        break;
      case 'webview':
        props.navigation.navigate(AppRoutes.CommonWebView, {
          url: id,
        });
        break;

      case 'HealthRecordsHome':
        props.navigation.navigate('HEALTH RECORDS');
        break;

      case 'ManageProfile':
        props.navigation.navigate(AppRoutes.ManageProfile);
        break;

      case 'OneApolloMembership':
        props.navigation.navigate(AppRoutes.OneApolloMembership);
        break;

      case 'TestDetails':
        props.navigation.navigate(AppRoutes.TestDetails, {
          itemId: id,
          movedFrom: 'deeplink',
        });
        break;

      case 'ConsultDetails':
        props.navigation.navigate(AppRoutes.ConsultDetails, {
          CaseSheet: id,
        });
        break;
      case 'DoctorCall':
        props.navigation.navigate(AppRoutes.ChatRoom, {
          data: id,
          callType: voipCallType.current ? voipCallType.current.toUpperCase() : '',
          prescription: '',
          isCall: true,
          isVoipCall: false,
        });
        break;
      case 'SpecialityByName':
        fetchSpecialities(id);
        break;
      case 'DoctorByNameId':
        const docId = (id?.split('?')?.[0] || id)?.slice(-36);
        props.navigation.navigate(AppRoutes.DoctorDetails, {
          doctorId: docId,
        });
        break;
      case 'MedicineByName':
        getMedicineSKU(id);
        break;
      case 'CircleMembershipDetails':
        if (isCircleMember) {
          props.navigation.navigate(AppRoutes.MembershipDetails, {
            membershipType: string.Circle.planName,
            isActive: true,
          });
        }
        break;

      case 'TestListing':
        props.navigation.navigate(AppRoutes.TestListing, {
          movedFrom: 'deeplink',
          widgetName: id,
        });
        break;

      case 'TestReport':
        props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          movedFrom: 'deeplink',
          id: id,
        });
        break;

      case 'MyTestOrders':
        props.navigation.navigate(AppRoutes.YourOrdersTest);
        break;

      default:
        break;
    }
  };

  const fetchSpecialities = async (specialityName: string) => {
    setshowSpinner(true);
    try {
      const response = await client.query<getAllSpecialties>({
        query: GET_ALL_SPECIALTIES,
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      if (data?.getAllSpecialties && data?.getAllSpecialties.length) {
        const specialityId = getSpecialityId(specialityName, data?.getAllSpecialties);
        props.navigation.navigate(AppRoutes.DoctorSearchListing, {
          specialityId: specialityId,
        });
      }
    } catch (error) {
      CommonBugFender('DoctorSearch_fetchSpecialities', error);
      props.navigation.navigate(AppRoutes.ConsultRoom);
    }
  };

  const getSpecialityId = (name: string, specialities: getAllSpecialties_getAllSpecialties[]) => {
    const specialityObject = specialities.filter((item) => name == readableParam(item?.name));
    return specialityObject[0].id ? specialityObject[0].id : '';
  };

  const getMedicineSKU = async (skuKey: string) => {
    try {
      const response = await getMedicineSku(skuKey);
      const { data } = response;
      data?.Message == 'Product available'
        ? props.navigation.navigate(AppRoutes.ProductDetailPage, {
            sku: data?.sku,
            movedFrom: ProductPageViewedSource.DEEP_LINK,
          })
        : props.navigation.navigate('MEDICINES');
    } catch (error) {
      CommonBugFender('getMedicineSku', error);
      props.navigation.navigate('MEDICINES');
    }
  };

  const {
    setLocationDetails,
    setNeedHelpToContactInMessage,
    setNeedHelpReturnPharmaOrderSuccessMessage,
    setSavePatientDetails,
    setCovidVaccineCta,
    setLoginSection,
    setCovidVaccineCtaV2,
    setCartBankOffer,
  } = useAppCommonData();
  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      try {
        const settingsCalled: string | null = await AsyncStorage.getItem('settingsCalled');
        console.log(settingsCalled, 'redolocartions');
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
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      APPStateInActive();
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
    Need_Help: {
      QA: 'QA_Need_Help',
      PROD: 'Need_Help',
    },
    Need_Help_Return_Order_Sub_Reason: {
      QA: 'QA_Need_Help_Return_Order_Sub_Reason',
      PROD: 'Need_Help_Return_Order_Sub_Reason',
    },
    Need_Help_Return_Pharma_Order_Success_Message: {
      PROD: 'Need_Help_Return_Pharma_Order_Success_Message',
    },
    Covid_Vaccine_Cta_Key: {
      QA: 'Covid_Vaccine_CTA_QA',
      PROD: 'Covid_Vaccine_CTA',
    },
    Login_Section_Key: {
      QA: 'Login_Section_QA',
      PROD: 'Login_Section',
    },
    Covid_Vaccine_Cta_Key_V2: {
      QA: 'Covid_Vaccine_CTA_V2_QA',
      PROD: 'Covid_Vaccine_CTA_V2',
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
  };

  const getKeyBasedOnEnv = (
    currentEnv: AppEnv,
    config: typeof RemoteConfigKeys,
    _key: keyof typeof RemoteConfigKeys
  ) => {
    const valueBasedOnEnv = config[_key] as RemoteConfigKeysType;
    return currentEnv === AppEnv.PROD
      ? valueBasedOnEnv.PROD
      : currentEnv === AppEnv.QA || currentEnv === AppEnv.QA2 || currentEnv === AppEnv.QA3
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

      setAppConfig(
        'Min_Value_For_Pharmacy_Free_Packaging',
        'MIN_CART_VALUE_FOR_FREE_PACKAGING',
        (key) => config.getNumber(key)
      );

      setAppConfig('Pharmacy_Delivery_Charges', 'DELIVERY_CHARGES', (key) => config.getNumber(key));

      setAppConfig('Pharmacy_Packaging_Charges', 'PACKAGING_CHARGES', (key) =>
        config.getNumber(key)
      );

      setAppConfig('Doctor_Partner_Text', 'DOCTOR_PARTNER_TEXT', (key) => config.getString(key));

      setAppConfig('Doctors_Page_Size', 'Doctors_Page_Size', (key) => config.getNumber(key));

      setAppConfig(
        'top6_specailties',
        'TOP_SPECIALITIES',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.TOP_SPECIALITIES
      );

      setAppConfig(
        'Need_Help',
        'NEED_HELP',
        (key) => JSON.parse(config.getString(key)) || AppConfig.Configuration.NEED_HELP
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

      setAppConfig('Covid_Items', 'Covid_Items', (key) => config.getString(key));
      setAppConfig('Covid_Max_Slot_Days', 'Covid_Max_Slot_Days', (key) => config.getNumber(key));
      setAppConfig('Non_Covid_Max_Slot_Days', 'Non_Covid_Max_Slot_Days', (key) =>
        config.getNumber(key)
      );
      setAppConfig('followUp_Chat', 'FollowUp_Chat_Limit', (key) => config.getNumber(key));

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
              ).catch((err) => console.log('An error occurred', err));
            }}
          />
        </View>
      ),
    });
  };

  return (
    <View style={styles.mainView}>
      <SplashLogo
        style={{
          width: 152,
          height: 117,
          ...Platform.select({
            android: {
              top: 12,
            },
          }),
        }}
        resizeMode="contain"
      />
      {showSpinner ? (
        <ActivityIndicator
          animating={showSpinner}
          size="large"
          color="green"
          style={{ bottom: 60, position: 'absolute' }}
        />
      ) : null}
    </View>
  );
};
