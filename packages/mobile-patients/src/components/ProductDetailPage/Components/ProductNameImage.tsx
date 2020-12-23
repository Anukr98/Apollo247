import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Carousel from 'react-native-snap-carousel';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { PrescriptionRequiredIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface ProductNameImageProps {
  name: string;
  images: string[];
  isPrescriptionRequired?: boolean | number;
}

const { width } = Dimensions.get('window');

export const ProductNameImage: React.FC<ProductNameImageProps> = (props) => {
  const { name, isPrescriptionRequired, images } = props;
  const [slideIndex, setSlideIndex] = useState(0);

  const renderImageCarousel = () => {
    return (
      <View style={{ marginTop: 20 }}>
        <Carousel
          onSnapToItem={setSlideIndex}
          data={images}
          renderItem={renderSliderItem}
          sliderWidth={width}
          itemWidth={width}
        />
        {images && images.length > 1 ? (
          <View style={styles.sliderDotsContainer}>
            {images?.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
          </View>
        ) : null}
      </View>
    );
  };

  const renderDot = (active: boolean) => (
    <View
      style={[styles.sliderDots, { backgroundColor: active ? 'rgba(2, 71, 91, 0.7)' : '#FFFFFF' }]}
    />
  );

  const renderSliderItem = ({ item }) => {
    return (
      <Image
        style={{
          height: 200,
          width: '100%',
          resizeMode: 'contain',
        }}
        source={{ uri: `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${item}` }}
      />
    );
  };

  const renderPrescriptionRequired = () => (
    <View style={styles.prescriptionContainer}>
      <PrescriptionRequiredIcon style={styles.prescriptionIcon} />
      <Text style={theme.viewStyles.text('M', 13, '#02475B', 1, 16)}>Prescription Required</Text>
    </View>
  );

  return (
    <View style={styles.cardStyle}>
      <Text style={styles.name}>{name}</Text>
      {!!images.length && renderImageCarousel()}
      {!isPrescriptionRequired && renderPrescriptionRequired()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: 10,
  },
  name: {
    ...theme.viewStyles.text('B', 17, '#02475B', 1, 25, 0.35),
    width: '90%',
  },
  sliderDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: 0,
    alignSelf: 'center',
    marginTop: 10,
  },
  sliderDots: {
    height: 10,
    width: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    marginTop: 8,
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.7)',
  },
  prescriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  prescriptionIcon: {
    resizeMode: 'contain',
    width: 17,
    height: 17,
    marginRight: 5,
  },
});
