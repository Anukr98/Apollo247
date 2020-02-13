import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import {
  ArrowFull,
  ArrowStep1,
  ArrowStep2,
  ArrowStep3,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect } from 'react';
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
const { height } = Dimensions.get('window');
import SplashScreen from 'react-native-splash-screen';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  mainView: {
    flex: 9,
    backgroundColor: 'transparent',
  },
  itemContainer: {
    height: height === 812 || height === 896 ? height - 160 : height - 100,
    margin: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  descptionText: {
    marginTop: 10,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    marginHorizontal: 50,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingBottom: 50,
  },
  titleStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(25),
    textAlign: 'center',
  },
  skipView: {
    height: 40,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  imageStyle: {
    marginTop: 12,
    width: '80%',
  },
  skipTextStyle: {
    color: '#a4a4a4',
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
  },
});

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
    image: require('@aph/mobile-doctors/src/images/onboard/onboard.png'),
    titleStyle: styles.titleStyle,
    backgroundColor: '"FBFCFD"',
    index: 1,
    icon: <ArrowStep1 style={style} />,
  },
  {
    key: 'somethun-dos',
    title: 'health records',
    text: 'Keep all your medical records in one digital vault, with you controlling access',
    image: require('@aph/mobile-doctors/src/images/onboard/onboard.png'),
    backgroundColor: '#FBFCFD',
    index: 2,
    icon: <ArrowStep2 style={style} />,
  },
  {
    key: 'somethun1',
    title: 'at your doorstep',
    text: 'Order medicines, tests and health checkups from the comfort of your home',
    image: require('@aph/mobile-doctors/src/images/onboard/onboard.png'),
    backgroundColor: '#FBFCFD',
    index: 3,
    icon: <ArrowStep3 style={style} />,
  },
  {
    key: 'somethun2',
    title: 'star doctors',
    text: 'Leverage the Apollo expertise using our Star Doctors',
    image: require('@aph/mobile-doctors/src/images/onboard/onboard.png'),
    backgroundColor: '#FBFCFD',
    index: 4,
    icon: <ArrowFull style={style} />,
  },
];

export interface OnboardingProps extends NavigationScreenProps {}
export const Onboarding: React.FC<OnboardingProps> = (props) => {
  const appIntroSliderRef = React.useRef<any>(null);
  // const { currentUser } = useAuth();

  useEffect(() => {
    firebase.analytics().setCurrentScreen('Onboarding');
  });

  // useEffect(() => {
  //   console.log('OnboardingProps currentUser', currentUser);

  //   // async function fetchData() {
  //   //   firebase.analytics().setCurrentScreen('Onboarding');
  //   //   const onboarding = await AsyncStorage.getItem('onboarding');
  //   //   if (onboarding == 'true') {
  //   //     props.navigation.replace(AppRoutes.Login);
  //   //   }
  //   // }
  //   // fetchData();

  //   if (currentUser) {
  //     props.navigation.replace(AppRoutes.TabBar);

  //     setTimeout(() => {
  //       SplashScreen.hide();
  //     }, 100);
  //   }
  // }, [currentUser, props.navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainView}>
        <View style={{ flex: 7 }}>
          <AppIntroSlider
            ref={appIntroSliderRef}
            hidePagination
            slides={slides}
            renderItem={(item: Slide) => (
              <View style={styles.itemContainer}>
                <Image source={item.image} style={styles.imageStyle} resizeMode="cover" />
                <View>
                  <Text style={styles.titleStyle}>{item.title}</Text>
                  <Text style={styles.descptionText}>{item.text}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (item.index === slides.length) {
                      AsyncStorage.setItem('onboarding', 'true');
                      props.navigation.replace(AppRoutes.Login);
                    } else {
                      appIntroSliderRef.current.goToSlide(item.index);
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

      <View style={styles.skipView}>
        <Text
          style={styles.skipTextStyle}
          onPress={() => {
            AsyncStorage.setItem('onboarding', 'true');
            props.navigation.replace(AppRoutes.Login);
          }}
        >
          {strings.buttons.skip}
        </Text>
      </View>
    </SafeAreaView>
  );
};
