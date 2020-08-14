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
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { SplashLogo } from '@aph/mobile-patients/src/components/SplashLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import firebase from 'react-native-firebase';
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
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getAppointmentData as getAppointmentDataQuery,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import { GET_APPOINTMENT_DATA } from '@aph/mobile-patients/src/graphql/profiles';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import RNCallKeep from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';
import { string } from '../strings/string';
import { isUpperCase } from '@aph/mobile-patients/src/utils/commonUtils';

// The moment we import from sdk @praktice/navigator-react-native-sdk,
// finally not working on all promises.

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
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [appState, setAppState] = useState(AppState.currentState);
  const client = useApolloClient();
  const voipAppointmentId = useRef<string>('');

  // const { setVirtualConsultationFee } = useAppCommonData();

  useEffect(() => {
    getData('ConsultRoom', undefined, false); // no need to set timeout on didMount
    InitiateAppsFlyer(props.navigation);
    DeviceEventEmitter.addListener('accept', (params) => {
      console.log('Accept Params', params);
      getAppointmentDataAndNavigate(params.appointment_id, true);
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
  }, []);

  useEffect(() => {
    handleDeepLink();
  }, []);

  useEffect(() => {
    if (isIos()) {
      initializeCallkit();
      handleVoipEventListeners();
    }
  }, []);

  const initializeCallkit = () => {
    const callkeepOptions = {
      ios: {
        appName: string.LocalStrings.appName,
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
      }
    });
  };

  const onAnswerCallAction = () => {
    voipAppointmentId.current && getAppointmentDataAndNavigate(voipAppointmentId.current);
  };

  const onDisconnetCallAction = () => {
    voipAppointmentId.current = '';
  };

  const handleDeepLink = () => {
    try {
      Linking.getInitialURL()
        .then((url) => {
          setBugFenderLog('DEEP_LINK_URL', url);
          if (url) {
            try {
              handleOpenURL(url);
              console.log('linking', url);
            } catch (e) {}
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
        } catch (e) {}
      });
      AsyncStorage.removeItem('location');
    } catch (error) {
      CommonBugFender('SplashScreen_Linking_URL_try', error);
    }
  };
  const handleOpenURL = (event: any) => {
    try {
      InitiateAppsFlyer(props.navigation);
      let route;

      route = event.replace('apollopatients://', '');

      const data = route.split('?');
      setBugFenderLog('DEEP_LINK_DATA', data);
      route = data[0];

      // console.log(data, 'data');

      let linkId = '';

      try {
        if (data.length >= 2) {
          linkId = data[1].split('&');
          if (linkId.length > 0) {
            linkId = linkId[0];
            setBugFenderLog('DEEP_LINK_SPECIALITY_ID', linkId);
          }
        }
      } catch (error) {}
      console.log(linkId, 'linkId');

      switch (route) {
        case 'Consult':
          console.log('Consult');
          getData('Consult', data.length === 2 ? linkId : undefined);
          break;

        case 'Medicine':
          console.log('Medicine');
          getData('Medicine', data.length === 2 ? linkId : undefined);
          break;

        case 'UploadPrescription':
          getData('UploadPrescription', data.length === 2 ? linkId : undefined);
          break;

        case 'MedicineRecommendedSection':
          getData('MedicineRecommendedSection');
          break;

        case 'Test':
          console.log('Test');
          getData('Test');
          break;

        case 'Speciality':
          console.log('Speciality handleopen');
          if (data.length === 2) getData('Speciality', linkId);
          break;

        case 'Doctor':
          console.log('Doctor handleopen');
          if (data.length === 2) getData('Doctor', linkId);
          break;

        case 'DoctorSearch':
          console.log('DoctorSearch handleopen');
          getData('DoctorSearch');
          break;

        case 'MedicineSearch':
          console.log('MedicineSearch handleopen');
          getData('MedicineSearch', data.length === 2 ? linkId : undefined);
          break;

        case 'MedicineDetail':
          console.log('MedicineDetail handleopen');
          getData('MedicineDetail', data.length === 2 ? linkId : undefined);
          break;

        case 'MedicineCart':
          console.log('MedicineCart handleopen');
          getData('MedicineCart', data.length === 2 ? linkId : undefined);
          break;

        case 'ChatRoom':
          if (data.length === 2) getAppointmentDataAndNavigate(linkId, false);
          break;

        case 'Order':
          if (data.length === 2) getData('Order', linkId);
          break;

        case 'MyOrders':
          getData('MyOrders');
          break;

        case 'webview':
          if (data.length === 2) {
            let url = data[1].replace('param=', '');
            getData('webview', url);
          }
          break;
        case 'FindDoctors':
          if (data.length === 2) getData('FindDoctors', linkId);
          break;

        case 'HealthRecordsHome':
          console.log('HealthRecordsHome handleopen');
          getData('HealthRecordsHome');
          break;

        case 'ManageProfile':
          console.log('ManageProfile handleopen');
          getData('ManageProfile');
          break;

        case 'OneApolloMembership':
          getData('OneApolloMembership');
          break;

        case 'TestDetails':
          getData('TestDetails', data.length === 2 ? linkId : undefined);
          break;

        case 'ConsultDetails':
          getData('ConsultDetails', data.length === 2 ? linkId : undefined);
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
    } catch (error) {}
  };

  const getData = (routeName: String, id?: String, timeout?: boolean, isCall?: boolean) => {
    async function fetchData() {
      firebase.analytics().setAnalyticsCollectionEnabled(true);
      // const onboarding = await AsyncStorage.getItem('onboarding');
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const signUp = await AsyncStorage.getItem('signUp');
      const multiSignUp = await AsyncStorage.getItem('multiSignUp');
      AsyncStorage.setItem('showSchduledPopup', 'false');

      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
      const item = JSON.parse(retrievedItem);

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

      setAllPatients(allPatients);

      // console.log(allPatients, 'allPatientssplash');
      // console.log(mePatient, 'mePatientsplash');
      const navigationPropsString: string | null = await AsyncStorage.getItem('NAVIGATION_PROPS');

      // console.log('onboarding', onboarding);
      // console.log('userLoggedIn', userLoggedIn);

      setTimeout(
        () => {
          if (JSON.parse(navigationPropsString || 'false')) {
            const navigationProps = JSON.parse(navigationPropsString || '');
            if (navigationProps) {
              let navi: any[] = [];
              navigationProps.scenes.map((i: any) => {
                navi.push(
                  NavigationActions.navigate({
                    routeName: i.descriptor.navigation.state.routeName,
                    params: i.descriptor.navigation.state.params,
                  })
                );
                // props.navigation.push(
                //   i.descriptor.navigation.state.routeName,
                //   i.descriptor.navigation.state.params
                // );
              });
              if (navi.length > 0) {
                props.navigation.dispatch(
                  StackActions.reset({
                    index: navi.length - 1,
                    key: null,
                    actions: navi,
                  })
                );
              }
            }
          } else if (userLoggedIn == 'true') {
            setshowSpinner(false);

            if (mePatient) {
              if (mePatient.firstName !== '') {
                pushTheView(routeName, id ? id : undefined, isCall);
              } else {
                props.navigation.replace(AppRoutes.Login);
              }
            }
          }
          // else if (onboarding == 'true') {
          //   setshowSpinner(false);

          //   if (signUp == 'true') {
          //     props.navigation.replace(AppRoutes.SignUp);
          //   } else if (multiSignUp == 'true') {
          //     if (mePatient) {
          //       props.navigation.replace(AppRoutes.MultiSignup);
          //     }
          //   } else {
          //     props.navigation.replace(AppRoutes.Login);
          //   }
          // }
          else {
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
  const getAppointmentDataAndNavigate = (appointmentID: string, isCall: boolean) => {
    client
      .query<getAppointmentDataQuery, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId: appointmentID,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const appointmentData: any = _data.data.getAppointmentData!.appointmentsHistory;
        if (appointmentData[0]!.doctorInfo !== null) {
          getData('ChatRoom', appointmentData[0], true, isCall);
        }
      })
      .catch((error) => {
        CommonBugFender('SplashFetchingAppointmentData', error);
      });
  };

  const pushTheView = (routeName: String, id?: any, isCall?: boolean) => {
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
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
          sku: id,
          movedFrom: 'deeplink',
        });
        break;

      case 'Test':
        console.log('Test');
        props.navigation.navigate('TESTS');
        break;

      case 'ConsultRoom':
        console.log('ConsultRoom');
        props.navigation.replace(AppRoutes.ConsultRoom);
        break;

      case 'Speciality':
        console.log('Speciality id', id);
        setBugFenderLog('APPS_FLYER_DEEP_LINK_COMPLETE', id);
        const filtersData = id ? id.split('%20') : '';
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
        const cityBrandFilter = id ? id.split('%20') : '';
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
        });
        break;

      case 'DoctorSearch':
        props.navigation.navigate(AppRoutes.DoctorSearch);
        break;

      case 'MedicineSearch':
        if (id) {
          const [itemId, name] = id.split(',');
          console.log(itemId, name);

          props.navigation.navigate(AppRoutes.SearchByBrand, {
            category_id: itemId,
            title: `${name ? name : 'Products'}`.toUpperCase(),
            movedFrom: 'deeplink',
          });
        }
        break;

      case 'MedicineCart':
        console.log('MedicineCart handleopen');
        props.navigation.navigate(AppRoutes.YourCart, {
          movedFrom: 'splashscreen',
        });
        break;
      case 'ChatRoom':
        props.navigation.navigate(AppRoutes.ChatRoom, {
          data: id,
          callType: '',
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
        });
        break;

      case 'ConsultDetails':
        props.navigation.navigate(AppRoutes.ConsultDetails, {
          CaseSheet: id,
        });
        break;

      default:
        break;
    }
  };

  // useEffect(() => {
  //   console.log('SplashScreen signInError', signInError);

  //   firebase.analytics().setCurrentScreen('SplashScreen');

  //   if (signInError) {
  //     setshowSpinner(false);

  //     AsyncStorage.setItem('userLoggedIn', 'false');
  //     AsyncStorage.setItem('multiSignUp', 'false');
  //     AsyncStorage.setItem('signUp', 'false');
  //     signOut();
  //     props.navigation.replace(AppRoutes.Login);
  //   }

  //   SplashScreenView.hide();
  // }, [props.navigation, signInError, signOut]);

  const buildName = () => {
    switch (apiRoutes.graphql()) {
      case 'https://aph.dev.api.popcornapps.com//graphql':
        return 'DEV';
      case 'https://aph.staging.api.popcornapps.com//graphql':
        return 'QA';
      case 'https://stagingapi.apollo247.com//graphql':
        return 'STAGING';
      case 'https://aph.uat.api.popcornapps.com//graphql':
        return 'UAT';
      case 'https://aph.vapt.api.popcornapps.com//graphql':
        return 'VAPT';
      case 'https://api.apollo247.com//graphql':
        return 'PROD';
      case 'https://asapi.apollo247.com//graphql':
        return 'PRF';
      case 'https://devapi.apollo247.com//graphql':
        return 'DEVReplica';
      default:
        return '';
    }
  };
  const {
    setLocationDetails,
    setNeedHelpToContactInMessage,
    setSavePatientDetails,
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
    home_screen_emergency_banner: {
      PROD: 'home_screen_emergency_banner',
    },
    home_screen_emergency_number: {
      PROD: 'home_screen_emergency_number',
    },
    top6_specailties: {
      QA: 'QA_top6_specailties',
      DEV: 'DEV_top6_specailties',
      PROD: 'top6_specailties',
    },
    min_value_to_nudge_users_to_avail_free_delivery: {
      QA: 'QA_min_value_to_nudge_users_to_avail_free_delivery',
      PROD: 'min_value_to_nudge_users_to_avail_free_delivery',
    },
    Doctor_Partner_Text: {
      QA: 'QA_Doctor_Partner_Text',
      PROD: 'Doctor_Partner_Text',
    },
  };

  const getConfigStringBasedOnEnv = (
    currentEnv: AppEnv,
    config: typeof RemoteConfigKeys,
    _key: keyof typeof RemoteConfigKeys
  ) => {
    const valueBasedOnEnv = config[_key] as RemoteConfigKeysType;
    return currentEnv === AppEnv.PROD
      ? valueBasedOnEnv.PROD
      : currentEnv === AppEnv.QA || currentEnv === AppEnv.QA2
      ? valueBasedOnEnv.QA || valueBasedOnEnv.PROD
      : valueBasedOnEnv.DEV || valueBasedOnEnv.QA || valueBasedOnEnv.PROD;
  };

  const getRemoteConfigKeys = (): string[] => {
    return (Object.keys(RemoteConfigKeys) as (keyof typeof RemoteConfigKeys)[]).map((configKey) =>
      getConfigStringBasedOnEnv(APP_ENV, RemoteConfigKeys, configKey)
    );
  };

  const getRemoteConfigValue = (
    remoteConfigKey: keyof typeof RemoteConfigKeys,
    snapshot: {
      [key: string]: { val(): any };
    }
  ) => snapshot[getConfigStringBasedOnEnv(APP_ENV, RemoteConfigKeys, remoteConfigKey)].val();

  const setAppConfig = (
    remoteConfigKey: keyof typeof RemoteConfigKeys,
    appConfigKey: keyof typeof AppConfig.Configuration,
    snapshot: {
      [key: string]: { val(): any };
    },
    processValue?: (val: string | number) => any
  ) => {
    const _val = snapshot[
      getConfigStringBasedOnEnv(APP_ENV, RemoteConfigKeys, remoteConfigKey)
    ].val();
    const finalValue = processValue ? processValue(_val) : _val;
    updateAppConfig(appConfigKey, finalValue);
  };

  const checkForVersionUpdate = () => {
    console.log('checkForVersionUpdate');

    try {
      if (__DEV__) {
        firebase.config().enableDeveloperMode();
      }

      firebase
        .config()
        .fetch(30 * 0) // 30 min
        .then(() => {
          return firebase.config().activateFetched();
        })
        .then(() => {
          return firebase.config().getValues(getRemoteConfigKeys());
        })
        .then((snapshot) => {
          const needHelpToContactInMessage = getRemoteConfigValue(
            'Need_Help_To_Contact_In',
            snapshot
          );
          needHelpToContactInMessage && setNeedHelpToContactInMessage!(needHelpToContactInMessage);

          setAppConfig(
            'Min_Value_For_Pharmacy_Free_Delivery',
            'MIN_CART_VALUE_FOR_FREE_DELIVERY',
            snapshot
          );

          setAppConfig(
            'min_value_to_nudge_users_to_avail_free_delivery',
            'MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY',
            snapshot
          );

          setAppConfig('Pharmacy_Delivery_Charges', 'DELIVERY_CHARGES', snapshot);

          setAppConfig(
            'home_screen_emergency_banner',
            'HOME_SCREEN_EMERGENCY_BANNER_TEXT',
            snapshot
          );

          setAppConfig(
            'home_screen_emergency_number',
            'HOME_SCREEN_EMERGENCY_BANNER_NUMBER',
            snapshot
          );

          setAppConfig('Doctor_Partner_Text', 'DOCTOR_PARTNER_TEXT', snapshot);

          setAppConfig('top6_specailties', 'TOP_SPECIALITIES', snapshot, (val: any) =>
            JSON.parse(val)
          );

          try {
            AsyncStorage.setItem(
              'CMEnable',
              JSON.stringify(getRemoteConfigValue('Enable_Conditional_Management', snapshot))
            );
          } catch (error) {}

          if (Platform.OS === 'ios') {
            const iosVersion = AppConfig.Configuration.iOS_Version;
            const iosLatestVersion = getRemoteConfigValue('ios_Latest_version', snapshot);
            const isMandatory: boolean = getRemoteConfigValue('ios_mandatory', snapshot);
            if (`${iosLatestVersion}` > iosVersion) {
              showUpdateAlert(isMandatory);
            }
          } else {
            const androidVersion = AppConfig.Configuration.Android_Version;
            const androidLatestVersion = getRemoteConfigValue('android_latest_version', snapshot);
            const isMandatory: boolean = getRemoteConfigValue('Android_mandatory', snapshot);
            if (`${androidLatestVersion}` > androidVersion) {
              showUpdateAlert(isMandatory);
            }
          }
        })
        .catch((error) => {
          CommonBugFender('SplashScreen_checkForVersionUpdate', error);
          console.log(`Error processing config: ${error}`);
        });
    } catch (error) {
      CommonBugFender('SplashScreen_checkForVersionUpdate_try', error);
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
