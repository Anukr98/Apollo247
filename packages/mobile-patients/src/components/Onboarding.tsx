import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  ArrowFull,
  ArrowStep1,
  ArrowStep2,
  ArrowStep3,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  ImageStyle,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  AsyncStorage,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import firebase from 'react-native-firebase';
import { NavigationScreenProps } from 'react-navigation';

import SplashScreen from 'react-native-splash-screen';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import OnboardingStyles from '@aph/mobile-doctors/src/components/Onboarding.styles';
const { height } = Dimensions.get('window');

const styles = OnboardingStyles;

type Slide = {
  key: string;
  title: string;
  text: string;
  image: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  backgroundColor: string;
  index: number;
  icon: React.ReactNode;
};

const style = { height: 56, width: 56 };
const slides: Slide[] = [
  {
    key: 'somethun',
    title: 'anytime, anywhere',
    text: 'Talk to an Apollo certified doctor in under 15 minutes, anytime, anywhere!',
    image: require('@aph/mobile-patients/src/images/onboard/onboard.png'),
    titleStyle: styles.titleStyle,
    backgroundColor: '"FBFCFD"',
    index: 1,
    icon: <ArrowStep1 style={style} />,
  },
  {
    key: 'somethun-dos',
    title: 'health records',
    text: 'Keep all your medical records in one place',
    image: require('@aph/mobile-patients/src/images/onboard/onboard.png'),
    backgroundColor: '#FBFCFD',
    index: 2,
    icon: <ArrowStep2 style={style} />,
  },
  {
    key: 'somethun1',
    title: 'at your doorstep',
    text: 'Order medicines, tests and health checkups from the comfort of your home',
    image: require('@aph/mobile-patients/src/images/onboard/onboard.png'),
    backgroundColor: '#FBFCFD',
    index: 3,
    icon: <ArrowStep3 style={style} />,
  },
  {
    key: 'somethun2',
    title: 'care programs',
    text: 'Learn about Special Care Programs by Apollo.',
    image: require('@aph/mobile-patients/src/images/onboard/onboard.png'),
    backgroundColor: '#FBFCFD',
    index: 4,
    icon: <ArrowFull style={style} />,
  },
];

export interface OnboardingProps extends NavigationScreenProps {}
export const Onboarding: React.FC<OnboardingProps> = (props) => {
  const appIntroSliderRef = React.useRef<any>(null);
  const [currentIndex, setcurrentIndex] = useState<number>(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainView}>
        <View style={{ flex: 7 }}>
          <AppIntroSlider
            ref={appIntroSliderRef}
            hidePagination
            slides={slides}
            onSlideChange={(index: number) => {
              setcurrentIndex(index);
            }}
            renderItem={({ item }: any) => (
              <View style={styles.itemContainer}>
                <Image source={item.image} style={styles.imageStyle} resizeMode="cover" />
                <View>
                  <Text style={styles.titleStyle}>{item.title}</Text>
                  <Text style={styles.descptionText}>{item.text}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setcurrentIndex(item.index);
                    if (item.index === slides.length) {
                      AsyncStorage.setItem('onboarding', 'true');
                      props.navigation.replace(AppRoutes.Login);
                    } else {
                      appIntroSliderRef.current!.goToSlide(item.index);
                    }
                  }}
                >
                  {item.icon}
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>

      {currentIndex !== 3 && (
        <View style={styles.skipView}>
          <Text
            style={styles.skipTextStyle}
            onPress={() => {
              AsyncStorage.setItem('onboarding', 'true');
              props.navigation.replace(AppRoutes.Login);
            }}
          >
            SKIP
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};
