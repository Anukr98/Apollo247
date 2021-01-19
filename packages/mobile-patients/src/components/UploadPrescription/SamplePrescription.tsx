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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.GRAY,
  },
  slideDotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
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
});

const instructionsData = [
  {
    instruction: 'Doctor’s name & Clinic details',
    highlightContainer: {
      marginTop: 25,
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
      maxWidth: width / 1.6,
    },
  },
  {
    instruction: 'Date of Prescription',
    highlightContainer: {
      marginTop: 100,
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
      marginTop: 130,
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
      marginTop: 200,
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
  const samplePrescriptionImage = require('@aph/mobile-patients/src/components/ui/icons/Sample_Prescription.png');

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
          // activeSlideOffset={100}
          // inactiveSlideShift={0}
        />
        {slideIndex !== 0 && renderLeftArrow()}
        {slideIndex !== dataLength - 1 && renderRightArrow()}
        <View style={styles.slideDotContainer}>
          {instructionsData.map((_, index) =>
            index == slideIndex ? renderDot(true) : renderDot(false)
          )}
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

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={'SAMPLE PRESCRIPTION'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
          <ImageBackground
            source={samplePrescriptionImage}
            resizeMode="contain"
            style={{
              width: width - 20,
              height: height / 1.25,
            }}
          >
            {renderCarousel()}
          </ImageBackground>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
