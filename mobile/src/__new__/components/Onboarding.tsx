import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StyleProp,
  ImageStyle,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { theme } from 'app/src/__new__/theme/theme';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  mainView: {
    flex: 9,
    backgroundColor: 'transparent',
  },
  itemContainer: {
    height: '82%',
    margin: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 2,
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
    marginTop: 8,
    marginHorizontal: 53,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(25),
    textAlign: 'center',
  },
  skipView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  imageStyle: {
    marginTop: 12,
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
};
const slides: Slide[] = [
  {
    key: 'somethun',
    title: 'anytime, anywhere',
    text: 'Talk to an Apollo certified doctor in under 15 minutes, anytime, anywhere!',
    image: require('app/src/__new__/images/common/onBoard.png'),
    titleStyle: styles.titleStyle,
    backgroundColor: '"FBFCFD"',
    index: 1,
  },
  {
    key: 'somethun-dos',
    title: 'health vault',
    text: 'Keep all your medical records in one digital vault, with you controlling access',
    image: require('app/src/__new__/images/common/onBoard.png'),
    backgroundColor: '#FBFCFD',
    index: 2,
  },
  {
    key: 'somethun1',
    title: 'at your doorstep',
    text: 'Order medicines, tests and health checkups from the comfort of your home',
    image: require('app/src/__new__/images/common/onBoard.png'),
    backgroundColor: '#FBFCFD',
    index: 3,
  },
  {
    key: 'somethun2',
    title: 'star doctors',
    text: 'Leverage the Apollo expertise using our Star Doctors',
    image: require('app/src/__new__/images/common/onBoard.png'),
    backgroundColor: '#FBFCFD',
    index: 4,
  },
];

export interface OnboardingProps {}
export const Onboarding: React.FC<OnboardingProps> = (props) => {
  const appIntroSliderRef = React.useRef<any>(null);

  const onNextPress = (slideValue: any) => {
    const value = parseInt(slideValue);
    if (value == 4) {
      this.navigate('LoginScene');
    } else {
      appIntroSliderRef.current.goToSlide(value);
    }
  };

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
                <Text style={styles.titleStyle}>{item.title}</Text>
                <Text style={styles.descptionText}>{item.text}</Text>
                <TouchableOpacity onPress={() => onNextPress(item.index)}>
                  <Image source={require('app/src/__new__/images/common/arrowButton.png')} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>

      <View style={styles.skipView}>
        <Text style={styles.skipTextStyle} onPress={() => {}}>
          SKIP
        </Text>
      </View>
    </SafeAreaView>
  );
};
