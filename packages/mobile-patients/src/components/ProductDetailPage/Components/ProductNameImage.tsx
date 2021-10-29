import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Carousel from 'react-native-snap-carousel';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  CircleDiscountBadge,
  PrescriptionRequiredIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface ProductNameImageProps {
  name: string;
  images: string[];
  isPrescriptionRequired?: boolean | number;
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  sku: string;
  merchandising?: number | null;
  isInStock: boolean;
  isSellOnline: boolean;
  isBanned: boolean;
  showDeliverySpinner: boolean;
}

const { width } = Dimensions.get('window');

export const ProductNameImage: React.FC<ProductNameImageProps> = (props) => {
  const {
    name,
    isPrescriptionRequired,
    images,
    sku,
    merchandising,
    isInStock,
    isBanned,
    isSellOnline,
    showDeliverySpinner,
  } = props;
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
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (images.length) {
            props.navigation.navigate(AppRoutes.ImageSliderScreen, {
              images: (images || []).map(
                (imgPath) => `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${imgPath}`
              ),
              heading: name,
            });
          }
          const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_DETAIL_IMAGE_CLICK] = {
            'Product ID': sku,
            'Product Name': name,
          };
          postWebEngageEvent(WebEngageEventName.PHARMACY_DETAIL_IMAGE_CLICK, eventAttributes);
        }}
      >
        <Image
          style={{
            height: 220,
            width: '93%',
            resizeMode: 'contain',
          }}
          source={{ uri: `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${item}` }}
        />
      </TouchableOpacity>
    );
  };

  const renderPrescriptionRequired = () => (
    <View style={styles.prescriptionContainer}>
      <PrescriptionRequiredIcon style={styles.prescriptionIcon} />
      <Text style={theme.viewStyles.text('M', 13, '#02475B', 1, 16)}>Prescription Required</Text>
    </View>
  );

  const renderMerchandisingTag = () => {
    const merchandising = 1;
    const text = merchandising == 1 ? "Apollo's Choice" : merchandising == 2 ? 'Recommended' : null;
    if (text) {
      return (
        <View style={styles.discountBadgeView}>
          <CircleDiscountBadge style={styles.discountBadgeIcon} />
          <Text style={styles.discountBadgeText}>{text}</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderIsInStock = () => {
    return (
      <View style={isBanned || !isSellOnline ? { flex: 1 } : { flex: 0 }}>
        {showDeliverySpinner ? (
          <ActivityIndicator
            style={{ alignItems: 'flex-end', marginRight: 10, marginTop: 10 }}
            animating={true}
            size="small"
            color="green"
          />
        ) : isBanned ? (
          <View style={[styles.inStockContainer, { backgroundColor: '#890000' }]}>
            <Text style={styles.stockText}>Banned for Sale</Text>
          </View>
        ) : !isSellOnline ? (
          <View style={[styles.inStockContainer, { backgroundColor: '#890000' }]}>
            <Text style={styles.stockText}>NOT AVAILABLE FOR ONLINE SALE</Text>
          </View>
        ) : isInStock ? (
          <View style={styles.inStockContainer}>
            <Text style={styles.stockText}>In Stock</Text>
          </View>
        ) : (
          <View style={[styles.inStockContainer, { backgroundColor: '#890000' }]}>
            <Text style={styles.stockText}>Out Of Stock</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.cardStyle}>
      <Text style={styles.name}>{name}</Text>
      {!!merchandising && renderMerchandisingTag()}
      {!!images.length && renderImageCarousel()}
      {isPrescriptionRequired && renderPrescriptionRequired()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: 10,
    paddingHorizontal: 15,
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
  discountBadgeText: {
    color: 'white',
    position: 'absolute',
    left: 10,
    ...theme.fonts.IBMPlexSansMedium(11),
  },
  discountBadgeIcon: { height: 17, width: 110 },
  discountBadgeView: { marginTop: 7 },
  inStockContainer: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: '#00B38E',
    borderRadius: 5,
    marginBottom: 25,
    marginTop: 10,
  },
  stockText: theme.viewStyles.text('M', 13, '#FFFFFF', 1, 18),
});
