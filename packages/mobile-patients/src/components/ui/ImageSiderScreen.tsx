import { Remove } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, BackHandler, SafeAreaView } from 'react-native';
import { Header } from 'react-native-elements';
import ImageViewer from 'react-native-image-zoom-viewer';
import { NavigationScreenProps } from 'react-navigation';

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

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onPressHardwareBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onPressHardwareBack);
    };
  }, []);

  const onPressHardwareBack = () => props.navigation.goBack();

  const [slideIndex, setSlideIndex] = useState(0);

  const renderDot = (active: boolean) => (
    <View style={active ? styles.activeSliderDotStyle : styles.sliderDotStyle} />
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {!!heading && (
          <Header
            containerStyle={styles.headerContainer}
            leftComponent={
              <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.goBack()}>
                <Remove style={{ tintColor: '#fff' }} />
              </TouchableOpacity>
            }
            centerComponent={{ text: heading, style: styles.heading, numberOfLines: 1 }}
          />
        )}
        <ImageViewer
          backgroundColor="#fff"
          imageUrls={images.map((img) => ({
            url: img,
          }))}
          onChange={(index) => {
            Number.isInteger(index) && setSlideIndex(index!);
          }}
          renderIndicator={() => <></>}
        />
        {images.length > 1 && (
          <View style={styles.dotContainer}>
            {images.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};
