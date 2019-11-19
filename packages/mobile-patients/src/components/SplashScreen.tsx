import React, { useEffect, useState } from 'react';
import { StyleSheet, View, AsyncStorage, Platform, ActivityIndicator, Linking } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { SplashLogo } from '@aph/mobile-patients/src/components/SplashLogo';
import { useAuth, useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import firebase from 'react-native-firebase';
import SplashScreenView from 'react-native-splash-screen';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import Bugfender from '@bugfender/rn-bugfender';

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
  const { signInError, signOut } = useAuth();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (Platform.OS === 'android') {
        Linking.getInitialURL().then((url) => {
          // this.navigate(url);
        });
      } else {
        console.log('linking');
        Linking.addEventListener('url', handleOpenURL);
      }
      AsyncStorage.removeItem('location');
    } catch (error) {}
  }, []);

  const handleOpenURL = (event: any) => {
    console.log('event', event);
    const route = event.url.replace('apollopatients://', '');

    if (route == 'ConsultRoom') {
      console.log('ConsultRoom');
      // props.navigation.replace(AppRoutes.ConsultRoom);
    }
    console.log('route', route);
  };

  useEffect(() => {
    async function fetchData() {
      firebase.analytics().setAnalyticsCollectionEnabled(true);
      firebase.analytics().setCurrentScreen('SplashScreen', 'SplashScreen');
      const onboarding = await AsyncStorage.getItem('onboarding');
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const signUp = await AsyncStorage.getItem('signUp');
      const multiSignUp = await AsyncStorage.getItem('multiSignUp');
      AsyncStorage.setItem('showSchduledPopup', 'false');

      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
      const item = JSON.parse(retrievedItem);

      const allPatients =
        item && item.data && item.data.getCurrentPatients
          ? item.data.getCurrentPatients.patients
          : null;

      const mePatient = allPatients
        ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
        : null;

      console.log(allPatients, 'allPatientssplash');
      console.log(mePatient, 'mePatientsplash');

      console.log('onboarding', onboarding);
      console.log('userLoggedIn', userLoggedIn);

      setTimeout(() => {
        if (userLoggedIn == 'true') {
          setshowSpinner(false);

          if (mePatient) {
            if (mePatient.firstName !== '') {
              props.navigation.replace(AppRoutes.ConsultRoom);
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
      }, 2000);
    }
    fetchData();
    SplashScreenView.hide();
    // Bugfender.init('dxeqKryYySc7rIzZ9SP8HatX28ExaVeC');
    //Bugfender.enableUIEventLogging();
  }, [props.navigation]);

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
