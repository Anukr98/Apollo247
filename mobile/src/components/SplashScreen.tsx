import React, { useEffect, useState } from 'react';
import { StyleSheet, View, AsyncStorage, Platform, ActivityIndicator, Alert } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { SplashLogo } from 'app/src/components/SplashLogo';
import { useAuth } from 'app/src/hooks/authHooks';
import { AppRoutes } from 'app/src/components/NavigatorContainer';
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
  const { currentUser, authError } = useAuth();
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);

  useEffect(() => {
    console.log('authError Login', authError);
    if (authError) {
      setVerifyingPhonenNumber(false);
      Alert.alert('Error', 'Unable to connect the server at the moment.');
      props.navigation.replace(AppRoutes.Onboarding);
    }
  }, [authError, props.navigation]);

  useEffect(() => {
    console.log('SplashScreen currentUser', currentUser);

    async function fetchData() {
      firebase.analytics().setCurrentScreen('SplashScreen');
      const onboarding = await AsyncStorage.getItem('onboarding');
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      console.log('onboarding', onboarding);
      console.log('userLoggedIn', userLoggedIn);

      setVerifyingPhonenNumber(true);

      setTimeout(() => {
        setVerifyingPhonenNumber(false);

        if (userLoggedIn == 'true') {
          if (currentUser) {
            props.navigation.replace(AppRoutes.TabBar);
          }
        } else if (onboarding == 'true') {
          props.navigation.replace(AppRoutes.Login);
        } else {
          props.navigation.replace(AppRoutes.Onboarding);
        }
      }, 300);
    }
    fetchData();

    SplashScreenView.hide();
  }, [currentUser, props.navigation]);

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
