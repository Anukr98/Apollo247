import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';

import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { getLocalData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { fonts } from '@aph/mobile-doctors/src/theme/fonts';
import * as React from 'react';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '././../theme/theme';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { SplashLogo, LandingPageImage } from '@aph/mobile-doctors/src/components/ui/Icons';

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },
  statusBarBg: {
    width: '100%',
    opacity: 0.05,
    backgroundColor: '#000000',
    ...ifIphoneX(
      {
        height: 44,
      },
      {
        height: 24,
      }
    ),
  },
  landingText: {
    ...fonts.IBMPlexSansMedium(17),
    lineHeight: 26,
    color: '#02475b',
  },
  landingText2: {
    ...fonts.IBMPlexSansBold(17),
    letterSpacing: 0,
    color: '#02475b',
  },
  buttonView: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fc9916',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 70,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(15),
    color: theme.colors.BUTTON_TEXT,
  },
  splashview: {
    width: 76,
    height: 56,
    marginLeft: 20,
    marginBottom: 30,
    ...Platform.select({
      android: {
        top: 16,
      },
      ios: {
        top: 16,
      },
    }),
  },
  landpageview: {
    width: '100%',
    height: 243,
  },
});

export interface LandingPageProps extends NavigationScreenProps {}

export const LandingPage: React.FC<LandingPageProps> = (props) => {
  const navigateToNextScreen = () => {
    getLocalData()
      .then((localData) => {
        if (localData.isOnboardingDone) {
          props.navigation.push(AppRoutes.Login);
        } else {
          props.navigation.push(AppRoutes.OnBoardingPage);
        }
      })
      .catch((_) => {
        props.navigation.push(AppRoutes.OnBoardingPage);
      });
  };
  return (
    <View style={styles.mainView}>
      <View style={styles.statusBarBg} />
      <ScrollView bounces={false}>
        <View style={{ backgroundColor: '#FFF', marginBottom: 32 }}>
          <SplashLogo style={styles.splashview} resizeMode="stretch" />
          <View style={{ margin: 20 }}>
            <Text style={styles.landingText}>
              {strings.common.landing_descr}
              <Text style={styles.landingText2}>{strings.common.anytime_anywhere}</Text>
            </Text>
          </View>
          <View style={{ marginTop: 15 }}>
            <LandingPageImage style={styles.landpageview} resizeMode="stretch" />
          </View>
        </View>
        <Button
          title={strings.buttons.get_started}
          titleTextStyle={styles.titleTextStyle}
          style={styles.buttonView}
          onPress={() => navigateToNextScreen()}
        />
      </ScrollView>
    </View>
  );
};
