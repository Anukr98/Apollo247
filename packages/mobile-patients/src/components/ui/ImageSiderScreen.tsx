import { Remove } from '@aph/mobile-patients/src/components/ui/Icons';
import { productsThumbnailUrl } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, Image as ImageNative, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Header } from 'react-native-elements';
import Carousel from 'react-native-snap-carousel';
import { NavigationScreenProps } from 'react-navigation';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: { backgroundColor: '#000', paddingHorizontal: 20 },
  heading: {
    textTransform: 'uppercase',
    ...theme.viewStyles.text('SB', 13, '#fff', 1, undefined, 0.5),
    marginBottom: 4,
  },
  image: { width: '100%', minHeight: height - height * 0.12 },
  sliderDotStyle: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#0087ba',
    opacity: 0.4,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeSliderDotStyle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: '#0087ba',
  },
});

export interface ImageSliderScreenProps
  extends NavigationScreenProps<{
    images: string[];
    heading: string;
  }> {}

export const ImageSliderScreen: React.FC<ImageSliderScreenProps> = (props) => {
  const images = props.navigation.getParam('images', []);
  const heading = props.navigation.getParam('heading');

  const [slideIndex, setSlideIndex] = useState(0);

  const renderSliderItem = ({ item }: { item: string; index: number }) => {
    return (
      <ImageNative
        resizeMode="contain"
        style={styles.image}
        source={{ uri: productsThumbnailUrl(item) }}
      />
    );
  };

  const renderDot = (active: boolean) => (
    <View style={active ? styles.activeSliderDotStyle : styles.sliderDotStyle} />
  );

  return (
    <View style={styles.container}>
      {!!heading && (
        <Header
          barStyle="light-content"
          containerStyle={styles.headerContainer}
          leftComponent={
            <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.goBack()}>
              <Remove style={{ tintColor: '#fff' }} />
            </TouchableOpacity>
          }
          centerComponent={{ text: heading, style: styles.heading, numberOfLines: 1 }}
        />
      )}
      <Carousel
        onSnapToItem={setSlideIndex}
        data={images}
        renderItem={renderSliderItem}
        sliderWidth={width}
        itemWidth={width}
      />
      {images.length > 1 && (
        <View style={styles.dotContainer}>
          {images.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
        </View>
      )}
    </View>
  );
};
