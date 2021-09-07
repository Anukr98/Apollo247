import React, { useState } from 'react';
import {
    View,
    Image as ImageNative,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { productsThumbnailUrl, postWebEngageEvent, postCleverTapEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { renderMedicineBannerShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import Carousel from 'react-native-snap-carousel';
import AsyncStorage from '@react-native-community/async-storage';
import { USER_AGENT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import {
    ProductPageViewedSource,
} from '@aph/mobile-patients/src/helpers/webEngageEvents'; 

const { width: winWidth, } = Dimensions.get('window');

export interface BannerSectionProps
  extends NavigationScreenProps<{}> {
  }

export const BannerSection: React.FC<BannerSectionProps> = (props) => {

    const { medicineHomeBannerData } = useShoppingCart();
    const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
    const IMG_HEIGHT_DEFAULT = 175;
    const imgHeight = IMG_HEIGHT_DEFAULT;
    const [userAgent, setUserAgent] = useState('');
    const [showProxyBannerContainer, setShowProxyBannerContainer] = useState(true);

    setTimeout(() => {
        setShowProxyBannerContainer(false);
      }, 3000);

    AsyncStorage.getItem(USER_AGENT).then((userAgent) => {
        setUserAgent(userAgent || '');
      });


    const renderSliderItem = ({ item, index }: { item, index: number }) => {
        const handleOnPress = () => {
          if (item.category_id) {
            props.navigation.navigate(AppRoutes.MedicineListing, {
              category_id: item.category_id,
              title: item.name || 'Products',
            });
          } else if (item.sku) {
            props.navigation.navigate(AppRoutes.ProductDetailPage, {
              sku: item.sku,
              movedFrom: ProductPageViewedSource.BANNER,
            });
          }
        };
    
        const imageUrl = productsThumbnailUrl(item.image) + '?imwidth=' + Math.floor(winWidth);
    
        return (
          <TouchableOpacity activeOpacity={1} onPress={handleOnPress}>
            <ImageNative
              resizeMode="stretch"
              style={{ width: '100%', minHeight: imgHeight }}
              source={{
                uri: imageUrl,
                headers: {
                  'User-Agent': userAgent,
                },
              }}
              progressiveRenderingEnabled={true}
            />
          </TouchableOpacity>
        );
      };
    
      const [slideIndex, setSlideIndex] = useState(0);
    
      const renderDot = (active: boolean) => (
        <View style={[styles.sliderDotStyle, { backgroundColor: active ? '#aaa' : '#d8d8d8' }]} />
      );
    
      const renderBanners = () => {
        if (medicineHomeBannerData?.length && !isSelectPrescriptionVisible) {
          return (
            <View style={{ marginBottom: 10 }}>
              {showProxyBannerContainer ? (
                <ImageNative
                  resizeMode="stretch"
                  style={{ width: '100%', minHeight: imgHeight, position: 'absolute' }}
                  source={{
                    uri: productsThumbnailUrl(medicineHomeBannerData[0]?.image) + '?imwidth=' + Math.floor(winWidth),
                    headers: {
                      'User-Agent': userAgent,
                    },
                  }}
                />
              ) : null}
    
              <Carousel
                onSnapToItem={setSlideIndex}
                data={medicineHomeBannerData}
                renderItem={renderSliderItem}
                sliderWidth={winWidth}
                itemWidth={winWidth}
                loop={true}
                initialNumToRender={1}
                autoplay={isSelectPrescriptionVisible ? false : true}
                autoplayDelay={3000}
                autoplayInterval={3000}
              />
    
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  position: 'absolute',
                  bottom: 10,
                  alignSelf: 'center',
                }}
              >
                {medicineHomeBannerData.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
              </View>
            </View>
          );
        } else {
          return renderMedicineBannerShimmer();
        }
      };

    return (
        <View>
            {medicineHomeBannerData && renderBanners()}
        </View>
    );
};

const styles = StyleSheet.create({
    sliderDotStyle: {
        height: 8,
        width: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        marginTop: 9,
      },
});