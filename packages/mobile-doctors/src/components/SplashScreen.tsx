import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import SplashScreenStyles from '@aph/mobile-doctors/src/components/SplashScreen.styles';
import { SplashLogo } from '@aph/mobile-doctors/src/components/ui/Icons';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React, { useEffect } from 'react';
import { ActivityIndicator, AsyncStorage, Linking, Platform, View } from 'react-native';
import firebase from 'react-native-firebase';
import SplashScreenView from 'react-native-splash-screen';
import { NavigationScreenProps } from 'react-navigation';

const styles = SplashScreenStyles;

export interface SplashScreenProps extends NavigationScreenProps {}

export const SplashScreen: React.FC<SplashScreenProps> = (props) => {
  const { firebaseUser, doctorDetails, getDoctorDetailsApi } = useAuth();

  useEffect(() => {
    try {
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
                PatientInfoAll: '',
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
    if (!doctorDetails) {
      getDoctorDetailsApi &&
        getDoctorDetailsApi()
          .then((res) => {
            console.log(res, 'res');
          })
          .catch((error) => {
            console.log(error, 'error');
          });
    }
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
