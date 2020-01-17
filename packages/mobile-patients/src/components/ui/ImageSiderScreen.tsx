import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Image, Dimensions } from 'react-native';

// import Swiper from 'react-native-swiper';
import { NavigationScreenProps } from 'react-navigation';
import { BackArrowWhite } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  customSlide: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customImage: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  wrapper: {
    // backgroundColor: '#f00'
    // backgroundColor: '#000',
  },

  slide: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgBackground: {
    width,
    height,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
});

export interface ImageSliderScreenProps
  extends NavigationScreenProps<{
    images: string[];
    heading: string;
  }> {}
export const ImageSliderScreen: React.FC<ImageSliderScreenProps> = (props) => {
  const images = props.navigation.getParam('images') || [];
  // const images = [
  //   'https://placeimg.com/640/640/nature',
  //   'https://placeimg.com/640/640/people',
  //   'https://placeimg.com/640/640/animals',
  //   'https://placeimg.com/640/640/beer',
  // ];
  const heading = props.navigation.getParam('heading');
  console.log(images, 'images');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {heading && (
          <Header
            title={heading}
            leftIcon={'backArrowWhite'}
            container={{ backgroundColor: '#000' }}
            titleStyle={{ color: theme.colors.WHITE, paddingHorizontal: 5 }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
        )}
        {/* <Swiper
          style={styles.wrapper}
          dot={
            <View
              style={{
                backgroundColor: '#0087ba', //'rgba(255,255,255,.3)',
                width: 8,
                height: 8,
                borderRadius: 7,
                marginLeft: 6,
                marginRight: 6,
                opacity: 0.4,
              }}
            />
          }
          activeDot={
            <View
              style={{
                backgroundColor: '#0087ba',
                width: 12,
                height: 12,
                borderRadius: 7,
                marginLeft: 6,
                marginRight: 6,
              }}
            />
          }
          loop={false}
        > */}
        {images.map((image) => (
          <View style={styles.slide}>
            <Image
              style={styles.customImage}
              source={{
                uri: image,
              }}
              resizeMode="contain"
            />
          </View>
        ))}
        {/* </Swiper> */}
      </View>
    </SafeAreaView>
  );
};
