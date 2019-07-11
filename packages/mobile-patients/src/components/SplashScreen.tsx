import React, { useEffect, useState } from 'react';
import { StyleSheet, View, AsyncStorage, Platform, ActivityIndicator, Alert } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { SplashLogo } from '@aph/mobile-patients/src/components/SplashLogo';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import firebase from 'react-native-firebase';
import SplashScreenView from 'react-native-splash-screen';

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
  const { currentPatient, authError, isSigningIn, authProvider } = useAuth();
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);

  useEffect(() => {
    console.log('authError Login', authError);
    if (authError) {
      setVerifyingPhonenNumber(false);
      props.navigation.replace(AppRoutes.Onboarding);
    }
  }, [authError, props.navigation]);

  // useEffect(() => {
  //   console.log('SplashScreen currentUser', currentPatient);

  //   firebase.analytics().setCurrentScreen('SplashScreen');

  //   async function fetchData() {
  //     const onboarding = await AsyncStorage.getItem('onboarding');
  //     const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
  //     const signUp = await AsyncStorage.getItem('signUp');
  //     const multiSignUp = await AsyncStorage.getItem('multiSignUp');

  //     console.log('onboarding', onboarding);
  //     console.log('userLoggedIn', userLoggedIn);

  //     authProvider()
  //       .then((patient) => {
  //         if (userLoggedIn == 'true') {
  //           if (patient) {
  //             props.navigation.replace(AppRoutes.MultiSignup);
  //           }
  //         } else if (onboarding == 'true') {
  //           if (signUp == 'true') {
  //             props.navigation.replace(AppRoutes.SignUp);
  //           } else if (multiSignUp == 'true') {
  //             if (patient) {
  //               props.navigation.replace(AppRoutes.MultiSignup);
  //             }
  //           } else {
  //             props.navigation.replace(AppRoutes.Login);
  //           }
  //         } else {
  //           props.navigation.replace(AppRoutes.Onboarding);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log('error', error);
  //         if (onboarding == 'true') {
  //           props.navigation.replace(AppRoutes.Login);
  //         } else {
  //           props.navigation.replace(AppRoutes.Onboarding);
  //         }
  //       });
  //   }

  //   fetchData();
  //   SplashScreenView.hide();
  // }, [props.navigation]);

  useEffect(() => {
    console.log('SplashScreen currentUser', currentPatient);

    async function fetchData() {
      firebase.analytics().setCurrentScreen('SplashScreen');
      const onboarding = await AsyncStorage.getItem('onboarding');
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const signUp = await AsyncStorage.getItem('signUp');
      const multiSignUp = await AsyncStorage.getItem('multiSignUp');

      console.log('onboarding', onboarding);
      console.log('userLoggedIn', userLoggedIn);

      setVerifyingPhonenNumber(true);

      setTimeout(() => {
        setVerifyingPhonenNumber(false);

        // if (!isSigningIn) {
        //   setVerifyingPhonenNumber(false);
        //   AsyncStorage.setItem('userLoggedIn', 'false');
        //   AsyncStorage.setItem('multiSignUp', 'false');
        //   AsyncStorage.setItem('signUp', 'false');
        //   props.navigation.replace(AppRoutes.Login);
        // }

        if (userLoggedIn == 'true') {
          if (currentPatient) {
            props.navigation.replace(AppRoutes.TabBar);
          }
        } else if (onboarding == 'true') {
          if (signUp == 'true') {
            props.navigation.replace(AppRoutes.SignUp);
          } else if (multiSignUp == 'true') {
            if (currentPatient) {
              props.navigation.replace(AppRoutes.MultiSignup);
            }
          } else {
            props.navigation.replace(AppRoutes.Login);
          }
        } else {
          props.navigation.replace(AppRoutes.Onboarding);
        }
      }, 3500);
    }
    fetchData();
    SplashScreenView.hide();
  }, [currentPatient, props.navigation, isSigningIn]);

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
      {verifyingPhoneNumber ? (
        <ActivityIndicator
          animating={verifyingPhoneNumber}
          size="large"
          color="green"
          style={{ bottom: 60, position: 'absolute' }}
        />
      ) : null}
    </View>
  );
};
