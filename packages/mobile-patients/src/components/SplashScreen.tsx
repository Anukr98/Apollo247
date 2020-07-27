import React, { useEffect, useState } from 'react';
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
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  doRequestAndAccessLocation,
  InitiateAppsFlyer,
  APPStateInActive,
  APPStateActive,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getAppointmentData as getAppointmentDataQuery,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import { GET_APPOINTMENT_DATA } from '@aph/mobile-patients/src/graphql/profiles';
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
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const { setAllPatients, setMobileAPICalled } = useAuth();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [appState, setAppState] = useState(AppState.currentState);
  const client = useApolloClient();
  // const { setVirtualConsultationFee } = useAppCommonData();

  useEffect(() => {
    getData('ConsultRoom', undefined, true);
    InitiateAppsFlyer();
    DeviceEventEmitter.addListener('accept', (params) => {
      console.log('Accept Params', params);
      getAppointmentDataAndNavigate(params.appointment_id);
    });
    DeviceEventEmitter.addListener('incoming_event', (params) => {
      console.log('incoming_event Params', params);
      props.navigation.navigate('MEDICINES');
      // getAppointmentDataAndNavigate(params.appointment_id)
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
      console.log('event', event);
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
          if (data.length === 2) getAppointmentDataAndNavigate(linkId);
          break;
        case 'Order':
          if (data.length === 2) getData('Order', linkId);
          break;
        case 'MyOrders':
          getData('MyOrders');
          break;
        default:
          getData('ConsultRoom', undefined, true);
          break;
      }
      console.log('route', route);
    } catch (error) {}
  };

  const getData = (routeName: String, id?: String, timeout?: boolean) => {
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
                pushTheView(routeName, id ? id : undefined);
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
  const getAppointmentDataAndNavigate = (appointmentID: string) => {
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
          getData('ChatRoom', appointmentData[0]);
        }
      })
      .catch((error) => {
        CommonBugFender('SplashFetchingAppointmentData', error);
      });
  };

  const pushTheView = (routeName: String, id?: any) => {
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

      case 'MedicineDetail':
        console.log('MedicineDetail');
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
          sku: id,
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
        });
        break;
      case 'Order':
        props.navigation.navigate(AppRoutes.OrderDetailsScene, {
          goToHomeOnBack: true,
          orderAutoId: id,
        });
        break;
      case 'MyOrders':
        props.navigation.navigate(AppRoutes.YourOrdersScene);
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
          return firebase
            .config()
            .getValues([
              'Android_mandatory',
              'android_latest_version',
              'ios_mandatory',
              'ios_Latest_version',
              'QA_Android_mandatory',
              'QA_android_latest_version',
              'QA_ios_mandatory',
              'QA_ios_latest_version',
              'Enable_Conditional_Management',
              'Virtual_consultation_fee',
              'QA_Virtual_consultation_fee',
              'Need_Help_To_Contact_In',
              'Min_Value_For_Pharmacy_Free_Delivery',
              'QA_Min_Value_For_Pharmacy_Free_Delivery',
              'Pharmacy_Delivery_Charges',
              'home_screen_emergency_banner',
              'home_screen_emergency_number',
              'QA_top6_specailties',
              'DEV_top6_specailties',
              'top6_specailties',
              'QA_min_value_to_nudge_users_to_avail_free_delivery',
              'min_value_to_nudge_users_to_avail_free_delivery',
              'QA_pharmacy_homepage',
              'pharmacy_homepage',
              'QA_hotsellers_max_quantity',
              'hotsellers_max_quantity',
            ]);
        })
        .then((snapshot) => {
          const remoteConfigValuesCount = Object.keys(snapshot).length - 1;

          const needHelpToContactInMessage = snapshot['Need_Help_To_Contact_In'].val();
          needHelpToContactInMessage && setNeedHelpToContactInMessage!(needHelpToContactInMessage);

          const pharmacyHomepageInfoQA = JSON.parse(snapshot['QA_pharmacy_homepage'].val() || null);
          pharmacyHomepageInfoQA &&
            AppConfig.APP_ENV != AppEnv.PROD &&
            updateAppConfig(
              'PHARMACY_HOMEPAGE_INFO',
              pharmacyHomepageInfoQA as PharmacyHomepageInfo[]
            );

          const pharmacyHomepageInfo = JSON.parse(snapshot['pharmacy_homepage'].val() || null);
          pharmacyHomepageInfo &&
            AppConfig.APP_ENV == AppEnv.PROD &&
            updateAppConfig(
              'PHARMACY_HOMEPAGE_INFO',
              pharmacyHomepageInfo as PharmacyHomepageInfo[]
            );

          const minValueForPharmacyFreeDelivery = snapshot[
            'Min_Value_For_Pharmacy_Free_Delivery'
          ].val();
          const QAMinValueForPharmacyFreeDelivery = snapshot[
            'QA_Min_Value_For_Pharmacy_Free_Delivery'
          ].val();
          const QAMinValueToNudgeUsersToAvailFreeDelivery = snapshot[
            'QA_min_value_to_nudge_users_to_avail_free_delivery'
          ].val();
          QAMinValueToNudgeUsersToAvailFreeDelivery &&
            AppConfig.APP_ENV != AppEnv.PROD &&
            updateAppConfig(
              'MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY',
              QAMinValueToNudgeUsersToAvailFreeDelivery
            );
          const minValueToNudgeUsersToAvailFreeDelivery = snapshot[
            'min_value_to_nudge_users_to_avail_free_delivery'
          ].val();
          minValueToNudgeUsersToAvailFreeDelivery &&
            AppConfig.APP_ENV == AppEnv.PROD &&
            updateAppConfig(
              'MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY',
              minValueToNudgeUsersToAvailFreeDelivery
            );

          minValueForPharmacyFreeDelivery &&
            AppConfig.APP_ENV == AppEnv.PROD &&
            updateAppConfig('MIN_CART_VALUE_FOR_FREE_DELIVERY', minValueForPharmacyFreeDelivery);

          QAMinValueForPharmacyFreeDelivery &&
            AppConfig.APP_ENV != AppEnv.PROD &&
            updateAppConfig('MIN_CART_VALUE_FOR_FREE_DELIVERY', QAMinValueForPharmacyFreeDelivery);

          const pharmacyDeliveryCharges = snapshot['Pharmacy_Delivery_Charges'].val();
          pharmacyDeliveryCharges && updateAppConfig('DELIVERY_CHARGES', pharmacyDeliveryCharges);

          const homeScreenEmergencyBannerText = snapshot['home_screen_emergency_banner'].val();
          homeScreenEmergencyBannerText &&
            updateAppConfig('HOME_SCREEN_EMERGENCY_BANNER_TEXT', homeScreenEmergencyBannerText);

          const homeScreenEmergencyBannerNumber = snapshot['home_screen_emergency_number'].val();
          homeScreenEmergencyBannerNumber &&
            updateAppConfig('HOME_SCREEN_EMERGENCY_BANNER_NUMBER', homeScreenEmergencyBannerNumber);

          if (buildName() === 'DEV') {
            const DEV_top6_specailties = snapshot['DEV_top6_specailties'].val();
            DEV_top6_specailties &&
              updateAppConfig('TOP_SPECIALITIES', JSON.parse(DEV_top6_specailties));
          } else if (buildName() === 'QA') {
            const QA_top6_specailties = snapshot['QA_top6_specailties'].val();
            QA_top6_specailties &&
              updateAppConfig('TOP_SPECIALITIES', JSON.parse(QA_top6_specailties));
          } else {
            const top6_specailties = snapshot['top6_specailties'].val();
            top6_specailties && updateAppConfig('TOP_SPECIALITIES', JSON.parse(top6_specailties));
          }
          const qaHotsellersMaxQuantity = snapshot['QA_hotsellers_max_quantity'].val();
          qaHotsellersMaxQuantity &&
            AppConfig.APP_ENV != AppEnv.PROD &&
            updateAppConfig('HOTSELLERS_MAX_QUANTITY', qaHotsellersMaxQuantity);

          const hotsellersMaxQuantity = snapshot['hotsellers_max_quantity'].val();
          hotsellersMaxQuantity &&
            AppConfig.APP_ENV == AppEnv.PROD &&
            updateAppConfig('HOTSELLERS_MAX_QUANTITY', hotsellersMaxQuantity);

          const myValye = snapshot;
          let index: number = 0;
          const nietos = [];
          const Android_version: string = AppConfig.Configuration.Android_Version;
          const iOS_version: string = AppConfig.Configuration.iOS_Version;

          for (const val in myValye) {
            if (myValye.hasOwnProperty(val)) {
              index++;
              const element = myValye[val];
              nietos.push({ index: index, value: element.val() });
              if (nietos.length === remoteConfigValuesCount) {
                console.log(
                  'nietos',
                  parseFloat(nietos[1].value),
                  parseFloat(iOS_version),
                  parseFloat(Android_version),
                  parseFloat(nietos[5].value),
                  parseFloat(nietos[7].value),
                  nietos[8].value
                );

                AsyncStorage.setItem('CMEnable', JSON.stringify(nietos[8].value));

                // if (buildName() === 'PROD') {
                //   setVirtualConsultationFee &&
                //     setVirtualConsultationFee(JSON.stringify(nietos[9].value));
                // } else {
                //   setVirtualConsultationFee &&
                //     setVirtualConsultationFee(JSON.stringify(nietos[10].value));
                // }

                if (Platform.OS === 'ios') {
                  if (buildName() === 'QA') {
                    if (parseFloat(nietos[7].value) > parseFloat(iOS_version)) {
                      showUpdateAlert(nietos[6].value);
                    }
                  } else {
                    if (parseFloat(nietos[3].value) > parseFloat(iOS_version)) {
                      showUpdateAlert(nietos[2].value);
                    }
                  }
                } else {
                  if (buildName() === 'QA') {
                    if (parseFloat(nietos[5].value) > parseFloat(Android_version)) {
                      showUpdateAlert(nietos[4].value);
                    }
                  } else {
                    if (parseFloat(nietos[1].value) > parseFloat(Android_version)) {
                      showUpdateAlert(nietos[0].value);
                    }
                  }
                }
              }
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
