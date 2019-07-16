import { LandingPageImage } from 'app/src/components/LandingPageImage';
import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { SplashLogo } from 'app/src/components/SplashLogo';
import { Button } from 'app/src/components/ui/Button';
import { getLocalData } from 'app/src/helpers/localStorage';
import { fonts } from 'app/src/theme/fonts';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '././../theme/theme';

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
    marginTop: 32,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(15),
    color: theme.colors.BUTTON_TEXT,
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
      <View style={{ backgroundColor: '#FFF' }}>
        <SplashLogo
          style={{
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
          }}
          resizeMode="stretch"
        />
        <View style={{ margin: 20 }}>
          <Text style={styles.landingText}>
            The best way to connect with your {'\n'}patients, grow your practice and {'\n'}enhance
            your professional network; {'\n'}
            <Text style={styles.landingText2}>anytime, anywhere :)</Text>
          </Text>
        </View>
        <View style={{ marginTop: 15 }}>
          <LandingPageImage
            style={{
              width: '100%',
              height: 243,
            }}
            resizeMode="stretch"
          />
        </View>
      </View>
      <Button
        title="GET STARTED"
        titleTextStyle={styles.titleTextStyle}
        style={styles.buttonView}
        onPress={() => navigateToNextScreen()}
      />
    </View>
  );
};
