import React, { useEffect } from 'react';
import { StyleSheet, View, AsyncStorage, Platform, ActivityIndicator } from 'react-native';
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
  const { currentPatient, isSigningIn } = useAuth();

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

      setTimeout(() => {
        if (userLoggedIn == 'true') {
          if (currentPatient) {
            if (currentPatient.firstName !== '') {
              props.navigation.replace(AppRoutes.TabBar);
            } else {
              props.navigation.replace(AppRoutes.Login);
            }
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
      {isSigningIn ? (
        <ActivityIndicator
          animating={isSigningIn}
          size="large"
          color="green"
          style={{ bottom: 60, position: 'absolute' }}
        />
      ) : null}
    </View>
  );
};
