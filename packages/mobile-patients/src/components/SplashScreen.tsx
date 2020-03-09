import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ActivityIndicator,
  Linking,
  AppStateStatus,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { SplashLogo } from '@aph/mobile-patients/src/components/SplashLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import firebase from 'react-native-firebase';
import SplashScreenView from 'react-native-splash-screen';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients, useAuth } from '../hooks/authHooks';
import { AppConfig } from '../strings/AppConfig';
import { PrefetchAPIReuqest } from '@praktice/navigator-react-native-sdk';
import { Button } from './ui/Button';
import { useUIElements } from './UIElementsProvider';
import { apiRoutes } from '../helpers/apiRoutes';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { doRequestAndAccessLocation } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall, setAllPatients, setMobileAPICalled } = useAuth();
  const { showAphAlert, hideAphAlert } = useUIElements();
  // const { setVirtualConsultationFee } = useAppCommonData();

  useEffect(() => {
    getData('ConsultRoom');
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
    } catch (error) {
      CommonBugFender('SplashScreen_PrefetchAPIReuqest_catch', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (Platform.OS === 'android') {
        Linking.getInitialURL()
          .then((url) => {
            handleOpenURL(url);
            console.log('linking', url);
          })
          .catch((e) => {
            CommonBugFender('SplashScreen_Linking_URL', e);
          });
      } else {
        console.log('linking');
        Linking.addEventListener('url', handleOpenURL);
      }
      AsyncStorage.removeItem('location');
    } catch (error) {
      CommonBugFender('SplashScreen_Linking_URL_try', error);
    }
  }, []);

  const handleOpenURL = (event: any) => {
    console.log('event', event);
    let route;

    if (Platform.OS === 'ios') {
      route = event.url.replace('apollopatients://', '');
    } else {
      route = event.replace('apollopatients://', '');
    }

    switch (route) {
      case 'Consult':
        console.log('Consult');
        getData('Consult');
        break;
      case 'Medicine':
        console.log('Medicine');
        getData('Medicine');
        break;
      case 'Test':
        console.log('Test');
        getData('Test');
        break;
      default:
        break;
    }
    console.log('route', route);
  };

  useEffect(() => {
    if (!currentPatient) {
      // getPatientApiCall();
    }
  }, [currentPatient]);

  const getData = (routeName: String) => {
    async function fetchData() {
      firebase.analytics().setAnalyticsCollectionEnabled(true);
      const onboarding = await AsyncStorage.getItem('onboarding');
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

      const mePatient = allPatients
        ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
        : null;

      setAllPatients(allPatients);

      console.log(allPatients, 'allPatientssplash');
      console.log(mePatient, 'mePatientsplash');

      console.log('onboarding', onboarding);
      console.log('userLoggedIn', userLoggedIn);

      setTimeout(() => {
        if (userLoggedIn == 'true') {
          setshowSpinner(false);

          if (mePatient) {
            if (mePatient.firstName !== '') {
              pushTheView(routeName);
            } else {
              props.navigation.replace(AppRoutes.Login);
            }
          }
        } else if (onboarding == 'true') {
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
        } else {
          setshowSpinner(false);
          props.navigation.replace(AppRoutes.Onboarding);
        }
        SplashScreenView.hide();
      }, 2000);
    }
    fetchData();
  };

  const pushTheView = (routeName: String) => {
    console.log('pushTheView', routeName);

    switch (routeName) {
      case 'Consult':
        console.log('Consult');
        props.navigation.navigate('APPOINTMENTS');
        // props.navigation.dispatch(
        //   StackActions.reset({
        //     index: 0,
        //     key: null,
        //     actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
        //   })
        // );
        break;

      case 'Medicine':
        console.log('Medicine');
        props.navigation.navigate('MEDICINES');
        break;

      case 'Test':
        console.log('Test');
        props.navigation.navigate('TESTS');
        break;

      case 'ConsultRoom':
        console.log('ConsultRoom');
        props.navigation.replace(AppRoutes.ConsultRoom);
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
      case 'https://aph.uat.api.popcornapps.com//graphql':
        return 'UAT';
      case 'https://aph.vapt.api.popcornapps.com//graphql':
        return 'VAPT';
      case 'https://api.apollo247.com//graphql':
        return 'PROD';
      case 'https://asapi.apollo247.com//graphql':
        return 'PRF';
      default:
        return '';
    }
  };
  const { setLocationDetails } = useAppCommonData();
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
            ]);
        })
        .then((snapshot) => {
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
              if (nietos.length === 11) {
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
