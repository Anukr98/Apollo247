import { LandingPageImage } from '@aph/mobile-doctors/src/components/LandingPageImage';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { SplashLogo } from '@aph/mobile-doctors/src/components/SplashLogo';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { getLocalData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { fonts } from '@aph/mobile-doctors/src/theme/fonts';
import * as React from 'react';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '././../theme/theme';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import LandingPageStyles from '@aph/mobile-doctors/src/components/LandingPage.styles';

const styles = LandingPageStyles;

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
