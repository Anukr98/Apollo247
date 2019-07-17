import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { SplashLogo } from '@aph/mobile-doctors/src/components/SplashLogo';
import { getLocalData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import firebase from 'react-native-firebase';
import SplashScreenView from 'react-native-splash-screen';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f5',
    width: '100%',
    height: '100%',
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

      const localData = await getLocalData();

      setVerifyingPhonenNumber(true);

      setTimeout(() => {
        setVerifyingPhonenNumber(false);
        if (localData.isLoggedIn) {
          if (localData.isProfileFlowDone) {
            props.navigation.replace(AppRoutes.TabBar);
          } else {
            props.navigation.replace(AppRoutes.ProfileSetup);
          }
        } else {
          props.navigation.replace(AppRoutes.LandingPage);
        }
      }, 2500);
    }

    fetchData();

    SplashScreenView.hide();
  }, [currentUser, props.navigation]);

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
