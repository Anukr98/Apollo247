import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import SplashScreenStyles from '@aph/mobile-doctors/src/components/SplashScreen.styles';
import { SplashLogo } from '@aph/mobile-doctors/src/components/ui/Icons';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, View, AppState, AppStateStatus } from 'react-native';
import firebase from 'react-native-firebase';
import SplashScreenView from 'react-native-splash-screen';
import { NavigationScreenProps } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { AppConfig, AppEnv } from '@aph/mobile-doctors/src/helpers/AppConfig';

const styles = SplashScreenStyles;

export interface SplashScreenProps extends NavigationScreenProps {}

export const SplashScreen: React.FC<SplashScreenProps> = (props) => {
  const { firebaseUser, doctorDetails, getDoctorDetailsApi } = useAuth();
  const { showAphAlert, hideAphAlert } = useUIElements();

  useEffect(() => {
    try {
      checkForVersionUpdate();
      AppState.addEventListener('change', _handleAppStateChange);
      Linking.getInitialURL()
        .then((url) => {
          if (url) {
            handleOpenURL(url);
            console.log('linking', url);
          }
        })
        .catch((e) => {
          CommonBugFender('SplashScreen_Linking_URL', e);
        });

      Linking.addEventListener('url', (event) => handleOpenURL(event.url));
      AsyncStorage.removeItem('location');
    } catch (error) {
      CommonBugFender('SplashScreen_Linking_URL_try', error);
      console.log('rrerererre', error);
    }
  }, []);

  const handleOpenURL = async (url: string) => {
    const route = url.replace('apollodoctors://', '');
    const data = route.split('?');
    console.log(url, data, 'deeplinkpress');

    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

    if (data) {
      switch (data[0].toLowerCase()) {
        case 'appointments':
          if (isLoggedIn) {
            if (data.length == 1) {
              props.navigation.navigate(AppRoutes.TabBar);
            } else if (data.length == 2) {
              props.navigation.push(AppRoutes.ConsultRoomScreen, {
                AppId: data[1],
                DoctorId: '',
                PatientId: '',
                PatientConsultTime: null,
                Appintmentdatetime: '',
                AppoinementData: '',
              });
            }
          }
          break;
        default:
          break;
      }
    }
    console.log('route', route);
  };

  useEffect(() => {
    const asyncCall = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (!doctorDetails && isLoggedIn === 'true') {
        getDoctorDetailsApi &&
          getDoctorDetailsApi()
            .then((res) => {
              console.log(res, 'fjlbvnfljknbvkjdfb');
            })
            .catch((error) => {
              console.log(error, 'febufbeniudnxw');
            });
      }
    };
    asyncCall();
  }, [doctorDetails]);

  const getRegistrationToken = async () => {
    // const fcmToken = await firebase.messaging().getToken();
    // if (fcmToken) {
    //   // user has a device token
    //   console.log('%cfcmToken', fcmToken, 'color:red');
    // } else {
    //   // user doesn't have a device token yet
    //   console.log('%cuser doesnt have a device token yet', 'color:red');
    // }
  };

  const checkNotificationPermission = async () => {
    // const enabled = await firebase.messaging().hasPermission();
    // if (enabled) {
    //   // user has permissions
    //   console.log('%cuser has permissions', 'color:green');
    // } else {
    //   // user doesn't have permission
    //   console.log('%cuser doesnt have permission', 'color:blue');
    //   try {
    //     await firebase.messaging().requestPermission();
    //     // User has authorised
    //     console.log('%cUser has authorised', 'color:green');
    //   } catch (error) {
    //     // User has rejected permissions
    //     console.log('%cUser has rejected permissions', 'color:red');
    //   }
    // }
  };

  useEffect(() => {
    checkNotificationPermission();
    //need to remove
  }, []);

  useEffect(() => {
    getRegistrationToken();
    // const onTokenRefreshListener = firebase.messaging().onTokenRefresh((fcmToken) => {
    //   // Process your token as required
    //   console.log('%cfcmToken', fcmToken, 'color:red');
    // });
    // return () => {
    //   onTokenRefreshListener();
    // };
  }, []);

  useEffect(() => {
    firebase.analytics().setCurrentScreen('SplashScreen');

    async function fetchData() {
      const isOnboardingDone = await AsyncStorage.getItem('isOnboardingDone');
      const isProfileFlowDone = await AsyncStorage.getItem('isProfileFlowDone');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      setTimeout(() => {
        console.log(firebaseUser);
        console.log('isLoggedIn', isLoggedIn, isOnboardingDone, isProfileFlowDone);

        if (isLoggedIn === 'true') {
          if (isProfileFlowDone === 'true') {
            props.navigation.replace(AppRoutes.TabBar);
          } else {
            props.navigation.replace(AppRoutes.ProfileSetup);
          }
        } else if (isOnboardingDone === 'true') {
          props.navigation.replace(AppRoutes.Login);
        } else {
          props.navigation.replace(AppRoutes.LandingPage);
        }
        SplashScreenView.hide();
      }, 2000);
    }
    fetchData();
  }, [props.navigation, firebaseUser]);
  const [appState, setAppState] = useState(AppState.currentState);

  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.match(/active|foreground/) && nextAppState === 'background') {
      checkForVersionUpdate(true);
    }
    setAppState(nextAppState);
  };

  const checkForVersionUpdate = (reCheck?: boolean) => {
    try {
      if (__DEV__) {
        firebase.config().enableDeveloperMode();
      }
      firebase
        .config()
        .fetch(0)
        .then(() => {
          return firebase.config().activateFetched();
        })
        .then(() => {
          return firebase
            .config()
            .getValues([
              'ios_doctor_Latest_version',
              'ios_doctor_mandatory',
              'android_doctor_latest_version',
              'Android_doctor_mandatory',
              'QA_ios_doctor_latest_version',
              'QA_ios_doctor_mandatory',
              'QA_android_doctor_latest_version',
              'QA_Doctor_Android_mandatory',
            ]);
        })
        .then((snapshot) => {
          const getConfigData = (key: string) => {
            return (snapshot[key] || { val: () => null }).val();
          };
          const Android_version = parseFloat(AppConfig.Configuration.Android_Version);
          const iOS_version = parseFloat(AppConfig.Configuration.iOS_Version);
          const environment = AppConfig.APP_ENV;
          const iosVersion = parseFloat(getConfigData('ios_doctor_Latest_version') || '1.0');
          const iosMandatory = getConfigData('ios_doctor_mandatory');
          const androidVersion = parseFloat(
            getConfigData('android_doctor_latest_version') || '1.0'
          );
          const androidMandatory = getConfigData('Android_doctor_mandatory');
          const qaiosVersion = parseFloat(getConfigData('QA_ios_doctor_latest_version') || '1.0');
          const qaiosMandatory = getConfigData('QA_ios_doctor_mandatory');
          const qaAndroidVersion = parseFloat(
            getConfigData('QA_android_doctor_latest_version') || '1.0'
          );
          const qaAndroidMandatory = getConfigData('QA_Doctor_Android_mandatory');

          if (Platform.OS === 'ios') {
            if (environment === AppEnv.PROD) {
              if (iOS_version < iosVersion && (!reCheck || (reCheck && iosMandatory))) {
                showUpdateAlert(iosMandatory);
              }
            } else {
              if (iOS_version < qaiosVersion && (!reCheck || (reCheck && qaiosMandatory))) {
                showUpdateAlert(qaiosMandatory);
              }
            }
          } else {
            if (environment === AppEnv.PROD) {
              if (Android_version < androidVersion && (!reCheck || (reCheck && androidMandatory))) {
                showUpdateAlert(androidMandatory);
              }
            } else {
              if (
                Android_version < qaAndroidVersion &&
                (!reCheck || (reCheck && qaAndroidMandatory))
              ) {
                showUpdateAlert(qaAndroidMandatory);
              }
            }
          }
        })
        .catch((error) => {
          CommonBugFender('SplashScreen_checkForVersionUpdate', error);
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
                  ? 'https://apps.apple.com/in/developer/apollo-hospital/id1159230884'
                  : 'https://play.google.com/store/apps/details?id=com.apollo.doctorapp'
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
          width: 136.3,
          height: 100,
          ...Platform.select({
            android: {
              top: 12,
            },
          }),
        }}
        resizeMode="contain"
      />
      {true ? (
        <ActivityIndicator
          animating={true}
          size="large"
          color="green"
          style={{ bottom: 60, position: 'absolute' }}
        />
      ) : null}
    </View>
  );
};
