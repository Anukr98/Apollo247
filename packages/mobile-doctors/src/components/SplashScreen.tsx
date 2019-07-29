import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { SplashLogo } from '@aph/mobile-doctors/src/components/SplashLogo';
import { getLocalData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
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
  const { currentUser, isAuthenticating } = useAuth();

  useEffect(() => {
    firebase.analytics().setCurrentScreen('SplashScreen');
    setTimeout(() => {
      getLocalData()
        .then((localData) => {
          if (localData.isLoggedIn) {
            if (localData.isProfileFlowDone) {
              props.navigation.replace(AppRoutes.TabBar);
            } else {
              props.navigation.replace(AppRoutes.ProfileSetup);
            }
          } else {
            if (localData.isOnboardingDone) {
              props.navigation.push(AppRoutes.Login);
            } else {
              props.navigation.push(AppRoutes.LandingPage);
            }
          }
          SplashScreenView.hide();
        })
        .catch((e) => {
          console.log('getLocalData error', e);
        });
    }, 1000);
  }, [props.navigation]);

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
