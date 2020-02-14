import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import {
  ArrowFull,
  ArrowStep1,
  ArrowStep2,
  ArrowStep3,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  AsyncStorage,
  Image,
  ImageSourcePropType,
  ImageStyle,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import firebase from 'react-native-firebase';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f4f5',
  },
  mainView: {
    flex: 6,
    backgroundColor: '#f0f4f5',
  },
  itemContainer: {
    flex: 1,
    height: 'auto', //height === 812 || height === 896 ? height - 160 : height - 100,
    margin: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 118,
  },
  descptionText: {
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    marginTop: 20,
  },
  titleStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(24),
    textAlign: 'center',
  },
  skipView: {
    height: 40,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',

    ...Platform.select({
      ios: {
        top: -30,
      },
    }),
  },
  imageStyle: {
    marginTop: -90,
    width: '90%',
  },
  skipTextStyle: {
    color: 'rgba(2, 71, 91, 0.5)',
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
    //top: -50,
    //backgroundColor: 'red',
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
    title: 'higher revenues',
    text: 'Get more patients and higher\nutilisation',
    image: require('../images/onboard/img_onboarding_higher_revenues.png'),
    titleStyle: styles.titleStyle,
    backgroundColor: 'red',
    index: 1,
    icon: <ArrowStep1 style={style} />,
  },
  {
    key: 'somethun-dos',
    title: 'easy follow ups',
    text: 'Follow up with your patients virtually\nand whenever you want',
    image: require('@aph/mobile-doctors/src/images/onboard/img_onboarding_easy_follow_ups.png'),
    backgroundColor: '#FBFCFD',
    index: 2,
    icon: <ArrowStep2 style={style} />,
  },
  {
    key: 'somethun1',
    title: 'anytime anywhere',
    text: ' Consult virtually, at a time of your\nconvenience',
    image: require('@aph/mobile-doctors/src/images/onboard/img_onboarding_anytime_anywhere.png'),
    backgroundColor: '#FBFCFD',
    index: 3,
    icon: <ArrowStep3 style={style} />,
  },
  {
    key: 'somethun2',
    title: 'medico-legal assistance',
    text: 'Get immediate help from our expert\nmedico legal team',
    image: require('@aph/mobile-doctors/src/images/onboard/img_onboarding_medico_legal_assistance.png'),
    backgroundColor: '#FBFCFD',
    index: 4,
    icon: <ArrowFull style={style} />,
  },
];

export interface OnboardingPageProps extends NavigationScreenProps {}
export const OnBoardingPage: React.FC<OnboardingPageProps> = (props) => {
  const appIntroSliderRef = React.useRef<any>(null);
  // const { currentUser } = useAuth();
  const [state, setState] = useState(true);

  useEffect(() => {
    firebase.analytics().setCurrentScreen('Onboarding');
  });

  const onSlideChange = (index: number) => {
    if (index === slides.length) {
      AsyncStorage.setItem('isOnboardingDone', 'true').then(() => {
        props.navigation.replace(AppRoutes.Login);
      });
      // props.navigation.replace(AppRoutes.Login);
    } else {
      index === slides.length - 1 ? setState(false) : setState(true);
      appIntroSliderRef.current!.goToSlide(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.container}>
        <View style={styles.mainView}>
          <View style={{ flex: 15 }}>
            <AppIntroSlider
              ref={appIntroSliderRef}
              hidePagination
              slides={slides}
              onSlideChange={onSlideChange}
              renderItem={(item: Slide) => (
                <View style={styles.itemContainer}>
                  <Image source={item.image} style={styles.imageStyle} resizeMode="contain" />

                  <View style={{ marginBottom: 53, marginTop: -90 }}>
                    <Text style={styles.titleStyle}>{item.title}</Text>
                    <Text style={styles.descptionText}>{item.text}</Text>
                  </View>
                  <TouchableOpacity
                    style={{ marginBottom: 25 }}
                    onPress={() => {
                      onSlideChange(item.index);
                    }}
                  >
                    {item.icon}
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>

        {!state ? null : (
          // <TouchableOpacity
          //   onPress={() => {
          //     AsyncStorage.setItem('onboarding', 'true').then(() => {
          //       console.log('view');
          //       props.navigation.replace(AppRoutes.Login);
          //     });
          //   }}
          // >
          <View style={styles.skipView}>
            <Text
              style={styles.skipTextStyle}
              onPress={() => {
                AsyncStorage.setItem('isOnboardingDone', 'true').then(() => {
                  props.navigation.replace(AppRoutes.Login);
                });
              }}
            >
              {strings.buttons.skip}
            </Text>
          </View>
          // </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};
