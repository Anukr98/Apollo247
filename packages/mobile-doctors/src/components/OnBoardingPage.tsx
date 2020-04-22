import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import OnBoardingPageStyles from '@aph/mobile-doctors/src/components/OnBoardingPage.styles';
import {
  ArrowFull,
  ArrowStep1,
  ArrowStep2,
  ArrowStep3,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  SafeAreaView,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import firebase from 'react-native-firebase';
import { NavigationScreenProps } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';

const styles = OnBoardingPageStyles;

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
  const [state, setState] = useState(true);

  useEffect(() => {
    firebase.analytics().setCurrentScreen('Onboarding');
  });

  const onSlideChange = (index: number) => {
    if (index === slides.length) {
      AsyncStorage.setItem('isOnboardingDone', 'true').then(() => {
        props.navigation.replace(AppRoutes.Login);
      });
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
        )}
      </SafeAreaView>
    </View>
  );
};
