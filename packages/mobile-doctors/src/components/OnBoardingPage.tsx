import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { ArrowFull, ArrowStep1, ArrowStep2, ArrowStep3 } from 'app/src/components/ui/Icons';
import { theme } from 'app/src/theme/theme';
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
  Platform,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import firebase from 'react-native-firebase';
import { NavigationScreenProps } from 'react-navigation';
const { height } = Dimensions.get('window');
import { useAuth } from 'app/src/hooks/authHooks';
import { ifIphoneX } from 'react-native-iphone-x-helper';

const styles = StyleSheet.create({
  container: {
    //...theme.viewStyles.container,
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },
  mainView: {
    flex: 9,
    backgroundColor: '#f0f4f5',
  },
  itemContainer: {
    height: 490, //height === 812 || height === 896 ? height - 160 : height - 100,
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
  },
  descptionText: {
    marginTop: 20,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    marginHorizontal: 50,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingBottom: 50,
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
    marginTop: -70,
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
    text: 'Get more patients and higher utilisation',
    image: require('../images/onboard/img_onboarding_higher_revenues.png'),
    titleStyle: styles.titleStyle,
    backgroundColor: 'red',
    index: 1,
    icon: <ArrowStep1 style={style} />,
  },
  {
    key: 'somethun-dos',
    title: 'easy follow ups',
    text: 'Follow up with your patients virtually  and whenever you want',
    image: require('app/src/images/onboard/img_onboarding_easy_follow_ups.png'),
    backgroundColor: '#FBFCFD',
    index: 2,
    icon: <ArrowStep2 style={style} />,
  },
  {
    key: 'somethun1',
    title: 'anytime anywhere',
    text: ' Consult virtually, at a time of your convenience',
    image: require('app/src/images/onboard/img_onboarding_anytime_anywhere.png'),
    backgroundColor: '#FBFCFD',
    index: 3,
    icon: <ArrowStep3 style={style} />,
  },
  {
    key: 'somethun2',
    title: 'medico-legal assistance',
    text: 'Get immediate help from our expert medico legal team',
    image: require('app/src/images/onboard/img_onboarding_medico_legal_assistance.png'),
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
  const { currentUser, authError } = useAuth();
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);

  useEffect(() => {
    firebase.analytics().setCurrentScreen('Onboarding');
  });

  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.container}>
        <View style={styles.mainView}>
          <View style={{ flex: 2 }}>
            <AppIntroSlider
              ref={appIntroSliderRef}
              hidePagination
              slides={slides}
              renderItem={(item: Slide) => (
                <View style={styles.itemContainer}>
                  <Image source={item.image} style={styles.imageStyle} resizeMode="contain" />
                  <View style={{ marginTop: -135 }}>
                    <Text style={styles.titleStyle}>{item.title}</Text>
                    <Text style={styles.descptionText}>{item.text}</Text>
                  </View>
                  <TouchableOpacity
                    style={{ marginTop: -30 }}
                    onPress={() => {
                      if (item.index === slides.length) {
                        AsyncStorage.setItem('onboarding', 'true');
                        props.navigation.replace(AppRoutes.Login);
                      } else {
                        if (item.index === slides.length - 1) {
                          setState(false);
                        }
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
        {!state ? null : (
          <TouchableOpacity
            style={styles.skipView}
            onPress={() => {
              AsyncStorage.setItem('onboarding', 'true').then(() => {
                console.log('view');
              });
              props.navigation.replace(AppRoutes.Login);
            }}
          >
            <Text style={styles.skipTextStyle}>SKIP</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};
