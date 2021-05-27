import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';
import { ArrowLeft, ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';

const { width, height } = Dimensions.get('window');
const isSmallerDevice = width <= 370;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.GRAY,
  },
  dotAndButtonContainer: {
    position: 'absolute',
    bottom: isSmallerDevice ? -15 : 24,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  slideDotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  sliderDotStyle: {
    borderRadius: 14,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  instructionContainer: {
    borderRadius: 30,
    marginRight: 5,
    borderWidth: 5,
    borderColor: 'rgba(196, 196, 196, 0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: '#FFFFFF',
  },
  arrowContainer: {
    position: 'absolute',
    top: height / 2.5,
  },
  arrowButton: {
    padding: 7,
    backgroundColor: 'rgba(52, 52, 52, 0.4)',
    borderRadius: 30,
  },
  arrowIcon: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
  },
  okayButton: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FCB716',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignSelf: 'center',
  },
  skipButton: {
    marginTop: -25,
    alignItems: 'center',
  },
  imageBackgroundStyle: {
    width: width - 20,
    height: height / 1.25,
  },
});

const instructionsData = [
  {
    instruction: 'Doctor’s name & Clinic details',
    highlightContainer: {
      marginTop: isSmallerDevice ? 0 : 40,
      marginLeft: 20,
      borderWidth: 4,
      borderRadius: 10,
      borderColor: '#00B38E',
      width: 140,
      height: 80,
    },
    instructionContainer: {
      flexDirection: 'row',
      backgroundColor: '#00B38E',
      borderRadius: 10,
      paddingVertical: 7,
      paddingHorizontal: 15,
      marginLeft: 20,
      marginTop: 15,
      maxWidth: width / 1.4,
    },
  },
  {
    instruction: 'Date of Prescription',
    highlightContainer: {
      marginTop: isSmallerDevice ? '15%' : 110,
      marginLeft: width / 1.8,
      borderWidth: 4,
      borderRadius: 10,
      borderColor: '#00B38E',
      width: 140,
      height: 40,
    },
    instructionContainer: {
      flexDirection: 'row',
      backgroundColor: '#00B38E',
      borderRadius: 10,
      paddingVertical: 7,
      paddingHorizontal: 15,
      marginLeft: 160,
      marginTop: 15,
      maxWidth: width / 2,
    },
  },
  {
    instruction: 'Patient Details',
    subText: 'Name & Age',
    highlightContainer: {
      marginTop: isSmallerDevice ? '22%' : 150,
      marginLeft: 20,
      borderWidth: 4,
      borderRadius: 10,
      borderColor: '#00B38E',
      width: 200,
      height: 50,
    },
    instructionContainer: {
      flexDirection: 'row',
      backgroundColor: '#00B38E',
      borderRadius: 10,
      paddingVertical: 7,
      paddingHorizontal: 15,
      marginLeft: 20,
      marginTop: 15,
      maxWidth: width / 2.2,
    },
  },
  {
    instruction: 'Medicine Details',
    subText: 'Name, qty, dosage',
    highlightContainer: {
      marginTop: isSmallerDevice ? '35%' : 220,
      marginLeft: 30,
      borderWidth: 4,
      borderRadius: 10,
      borderColor: '#00B38E',
      width: width / 1.2,
      height: 100,
    },
    instructionContainer: {
      flexDirection: 'row',
      backgroundColor: '#00B38E',
      borderRadius: 10,
      paddingVertical: 7,
      paddingHorizontal: 15,
      marginLeft: 30,
      marginTop: 15,
      maxWidth: width / 1.6,
    },
  },
];

export interface SamplePrescriptionProps extends NavigationScreenProps {}

export const SamplePrescription: React.FC<SamplePrescriptionProps> = (props) => {
  const _carousel = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const samplePrescriptionImage = require('@aph/mobile-patients/src/components/ui/icons/Sample_Prescription.webp');

  const renderSliderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={{ height, marginTop: 20 }}>
        <View style={item?.highlightContainer} />
        <View style={item?.instructionContainer}>
          <View style={styles.instructionContainer}>
            <Text style={theme.viewStyles.text('B', 14, '#00B38E', 1, 15)}>{index + 1}</Text>
          </View>
          <View>
            <Text
              style={
                !!item?.subText
                  ? theme.viewStyles.text('B', 14, '#FFFFFF', 1, 16)
                  : theme.viewStyles.text('B', 14, '#FFFFFF', 1, 24)
              }
            >
              {item?.instruction}
            </Text>
            {!!item?.subText && (
              <Text style={theme.viewStyles.text('M', 13, '#FFFFFF', 1, 14)}>{item?.subText}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderCarousel = () => {
    const dataLength = instructionsData.length;
    return (
      <View>
        <Carousel
          onSnapToItem={setSlideIndex}
          data={instructionsData}
          renderItem={renderSliderItem}
          sliderWidth={width}
          itemWidth={width}
          loop={false}
          autoplay={false}
          ref={_carousel}
        />
        {slideIndex !== 0 && renderLeftArrow()}
        {slideIndex !== dataLength - 1 && renderRightArrow()}
        <View style={styles.dotAndButtonContainer}>
          {renderSkipButton(slideIndex, dataLength)}
          <View style={styles.slideDotContainer}>
            {instructionsData.map((_, index) =>
              index == slideIndex ? renderDot(true) : renderDot(false)
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderLeftArrow = () => {
    return (
      <View style={styles.arrowContainer}>
        <TouchableOpacity
          onPress={() => {
            _carousel?.current?.snapToItem(slideIndex - 1);
          }}
          style={styles.arrowButton}
        >
          <ArrowLeft style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightArrow = () => {
    return (
      <View style={[styles.arrowContainer, { right: 0 }]}>
        <TouchableOpacity
          onPress={() => {
            _carousel?.current?.snapToItem(slideIndex + 1);
          }}
          style={styles.arrowButton}
        >
          <ArrowRight style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDot = (active: boolean) => (
    <View
      style={[
        styles.sliderDotStyle,
        {
          width: active ? 13 : 10,
          height: active ? 13 : 10,
          marginTop: active ? 7 : 9,
        },
      ]}
    />
  );

  const renderSkipButton = (slideIndex: number, dataLength: number) => {
    const showButton = slideIndex + 1 === dataLength;
    return showButton ? (
      <TouchableOpacity style={styles.okayButton} onPress={() => props.navigation.goBack()}>
        <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 18)}>OK, GOT IT!</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={styles.skipButton}
        activeOpacity={0.6}
        onPress={() => {
          _carousel?.current?.snapToItem(slideIndex + 1);
        }}
      >
        <Text style={theme.viewStyles.text('B', 13, '#000000', 0.6, 14)}>SKIP</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={'SAMPLE PRESCRIPTION'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1, marginBottom: 10 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
          <ImageBackground
            source={samplePrescriptionImage}
            resizeMode="contain"
            style={styles.imageBackgroundStyle}
          >
            {renderCarousel()}
          </ImageBackground>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
