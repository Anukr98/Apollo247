import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image as ImageNative,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { SpecialOffersBrandsApiResponse } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  addPharmaItemToCart,
  getIsMedicine,
  getMaxQtyForMedicineItem,
  getDiscountPercentage,
  specialOffersImagesThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import {
  getSpecialOffersPageBrandsProducts,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';

export interface DealsByBrandsProps extends NavigationScreenProps<{}> {
  brandsData: SpecialOffersBrandsApiResponse[];
}

export const DealsByBrandsSection: React.FC<DealsByBrandsProps> = (props) => {
  const brandsData = props.brandsData;
  const brandsResult = brandsData.sort((a, b) => a?.position?.localeCompare(b.position));
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBrandID, setSelectedBrandID] = useState<Number>(brandsResult[0].id);
  const [productData, setProductData] = useState<MedicineProduct[]>();
  const [minDiscount, setMinDiscount] = useState<string>('10');
  const [maxDiscount, setMaxDiscount] = useState<string>('100');
  const { showAphAlert } = useUIElements();
  const heading = 'TOP DEALS ON FEATURED BRANDS';
  const defaultMinDiscount = '1';
  const defaultMaxDiscount = '100';
  const [itemsLoading, setItemsLoading] = useState<{ [key: string]: boolean }>({});
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    updateCartItem,
    pharmacyCircleAttributes,
    asyncPincode,
  } = useShoppingCart();
  const pharmacyPincode =
    asyncPincode?.pincode || pharmacyLocation?.pincode || locationDetails?.pincode;
  const { currentPatient } = useAllCurrentPatients();
  const movedFrom = 'Special Offers';

  useEffect(() => {
    fetchDataForBrandProducts();
  }, [selectedBrandID]);

  const fetchDataForBrandProducts = async () => {
    try {
      setLoading(true);

      const discountPercentage = { min: minDiscount, max: maxDiscount };
      const productsResponse = await getSpecialOffersPageBrandsProducts(
        selectedBrandID.toString(),
        discountPercentage
      );
      if (productsResponse?.data?.products) {
        setProductData(productsResponse?.data?.products);
      } else {
        setProductData([]);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: "We're sorry! Unable to fetch products right now, please try later.",
      });
    }
  };

  const onPressBrand = (id: number, minValue: string, maxValue: string) => {
    setSelectedBrandID(id);
    setMinDiscount(minValue);
    setMaxDiscount(maxValue);
  };

  const renderItem = (imgUrl: string, item: SpecialOffersBrandsApiResponse) => {
    const promotionalMessage = item?.promotional_message;
    const { id } = item;
    const discountValueArray = item?.discount.split('-');
    const discountPresent = discountValueArray.length === 2;

    return (
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={id === selectedBrandID ? styles.selectedBrandStyles : {}}
          onPress={() =>
            discountPresent
              ? onPressBrand(id, discountValueArray[0], discountValueArray[1])
              : onPressBrand(id, defaultMinDiscount, defaultMaxDiscount)
          }
        >
          <View style={styles.categoryBoxStyles}>
            <View>
              <ImageNative
                source={{ uri: imgUrl }}
                style={styles.brandImageContainer}
                resizeMode="contain"
              />
            </View>
            <View style={{ paddingBottom: 16, paddingTop: 5 }}>
              <Text
                style={
                  id === selectedBrandID ? styles.selectedIdPromotionStyle : styles.promotionStyle
                }
              >
                {promotionalMessage}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const onPressProduct = (urlKey: string, sku: string, movedFrom: string) => {
    props.navigation.navigate(AppRoutes.ProductDetailPage, {
      urlKey,
      sku,
      movedFrom,
    });
  };

  const renderProductsItem = (imgUrl: string, item) => {
    const specialPrice = item?.special_price ? true : false;
    const fallbackImage = `https://newassets.apollo247.com/images/ic_placeholder_circle.png`;
    const imagePathPresent = imgUrl.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;

    return (
      <View style={styles.hotSellersContainer}>
        <View style={styles.hotSellersBoxStyles}>
          <TouchableOpacity onPress={() => onPressProduct(item?.url_key, item?.sku, movedFrom)}>
            {
              <View style={styles.squareContainer}>
                {loading ? (
                  <View>
                    <ActivityIndicator color="#FC9916" size="large" />
                  </View>
                ) : (
                  <ImageNative
                    source={imagePathPresent ? { uri: imgUrl } : { uri: fallbackImage }}
                    style={styles.productImageContainer}
                    resizeMode="contain"
                  />
                )}
              </View>
            }

            <View style={{ paddingBottom: 5, height: 50 }}>
              <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.textStyle}>
                {item?.name}
              </Text>
            </View>
            <View style={{ paddingBottom: 5, height: 20 }}>
              <Text style={styles.priceStyle}>
                {specialPrice ? `${'\u20B9'}${item?.special_price}` : `${'\u20B9'}${item?.price}`}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              {specialPrice && (
                <Text style={styles.priceCancelStyle}>{`${'\u20B9'}${item?.price}`}</Text>
              )}
              {specialPrice && (
                <Text style={styles.discountStyle}>{`${getDiscountPercentage(
                  item?.price,
                  item?.special_price
                )}%off`}</Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={{ paddingTop: 10 }}>{renderAddToCartButton(item)}</View>
        </View>
      </View>
    );
  };

  const renderHeading = (title: string) => {
    return (
      <View style={{ marginTop: 5 }}>
        <SectionHeaderComponent sectionTitle={heading} style={styles.headerStyle} />
      </View>
    );
  };

  const renderAddToCartButton = (item: MedicineProduct) => {
    const quantity = getItemQuantity(item.sku);
    return !quantity ? (
      <View style={{ paddingBottom: 10, paddingTop: 5 }}>
        <TouchableOpacity style={styles.cartButtonStyle} onPress={() => onAddCartItem(item)}>
          <Text style={styles.cartButtonTextStyle}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View style={{ paddingBottom: 10, paddingTop: 5 }}>
        <AddToCartButtons
          numberOfItemsInCart={quantity}
          maxOrderQty={item.MaxOrderQty}
          addToCart={() => {
            const q = getItemQuantity(item.sku);
            if (q == getMaxQtyForMedicineItem(item.MaxOrderQty)) return;
            onUpdateCartItem(item.sku, getItemQuantity(item.sku) + 1);
          }}
          removeItemFromCart={() => {
            const q = getItemQuantity(item.sku);
            q == 1 ? onRemoveCartItem(item.sku) : onUpdateCartItem(item.sku, q - 1);
          }}
          removeFromCart={() => {
            const q = getItemQuantity(item.sku);
            q == 1 ? onRemoveCartItem(item.sku) : onUpdateCartItem(item.sku, q - 1);
          }}
          containerStyle={{
            width: '49%',
            alignSelf: 'center',
          }}
        />
      </View>
    );
  };

  const getItemQuantity = (id: string) => {
    const foundItem = cartItems?.find((item) => item.id == id);
    return foundItem ? foundItem.quantity : 0;
  };

  const onUpdateCartItem = (id: string, quantity: number) => {
    updateCartItem!({ id, quantity: quantity });
  };

  const onRemoveCartItem = (id: string) => {
    removeCartItem!(id);
  };

  const onAddCartItem = (item: MedicineProduct) => {
    const {
      sku,
      mou,
      name,
      price,
      special_price,
      is_prescription_required,
      type_id,
      thumbnail,
      MaxOrderQty,
      category_id,
      url_key,
      subcategory,
    } = item;
    setItemsLoading({ ...itemsLoading, [sku]: true });
    addPharmaItemToCart(
      {
        id: sku,
        mou,
        name,
        price: price,
        specialPrice: special_price
          ? typeof special_price == 'string'
            ? Number(special_price)
            : special_price
          : undefined,
        prescriptionRequired: is_prescription_required == '1',
        isMedicine: getIsMedicine(type_id?.toLowerCase()) || '0',
        quantity: Number(1),
        thumbnail: thumbnail,
        isInStock: true,
        maxOrderQty: MaxOrderQty,
        productType: type_id,
        circleCashbackAmt: 0,
        url_key,
        subcategory,
      },
      asyncPincode?.pincode || pharmacyPincode!,
      addCartItem,
      null,
      props.navigation,
      currentPatient,
      !!isPharmacyLocationServiceable,
      { source: 'Special Offers', categoryId: category_id },
      JSON.stringify(cartItems),
      () => setItemsLoading({ ...itemsLoading, [sku]: false }),
      pharmacyCircleAttributes!
    );
  };

  return (
    <View style={styles.container}>
      {renderHeading(heading)}
      <Text style={styles.subtitle}>{string.specialOffersScreen.brandDealsSubHeading}</Text>
      <FlatList
        bounces={false}
        keyExtractor={(_, index) => `${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={brandsData}
        renderItem={({ item, index }) => {
          const imgUrl = specialOffersImagesThumbnailUrl(item.image);
          return renderItem(imgUrl, item);
        }}
      />
      {productData && productData.length > 0 && (
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={productData}
          renderItem={({ item, index }) => {
            const imgUrl = specialOffersImagesThumbnailUrl(item?.image);
            return renderProductsItem(imgUrl, item);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  headerStyle: {
    marginBottom: 4,
  },
  subtitle: {
    ...theme.fonts.IBMPlexSansRegular(11),
    color: '#02475B',
    fontWeight: '500',
    lineHeight: 17,
    marginLeft: 20,
    opacity: 0.6,
  },
  categoryContainer: {
    paddingLeft: 20,
    marginTop: 24,
  },
  selectedBrandStyles: {
    borderColor: '#FC9916',
    borderBottomWidth: 5,
  },
  categoryBoxStyles: {
    paddingTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 15,
  },
  brandImageContainer: {
    height: 59,
    width: 117,
    alignSelf: 'center',
    top: 5,
    left: 6,
  },
  promotionStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: '#007C9D',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  selectedIdPromotionStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: '#FC9916',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  hotSellersContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 15,
    paddingBottom: 15,
    backgroundColor: '#F7F8F5',
  },
  hotSellersBoxStyles: {
    marginRight: 15,
    width: 135,
    paddingTop: 30,
  },
  squareContainer: {
    width: 135,
    height: 113,
    opacity: 0.8,
  },
  productImageContainer: {
    height: 100,
    width: 85,
    alignSelf: 'center',
    top: 4,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    paddingTop: 12,
    color: '#02475B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 5,
    height: 20,
  },
  priceStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: '#02475B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  priceCancelStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    opacity: 0.4,
    textAlign: 'center',
    paddingRight: 5,
    lineHeight: 20,
    textDecorationLine: 'line-through',
  },
  discountStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: '#00B38E',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  cartButtonStyle: {
    backgroundColor: '#FFA92C',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FCB716',
    width: 110,
    height: 30,
    alignSelf: 'center',
  },
  cartButtonTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(13),
    color: '#FFFFFF',
    textAlign: 'center',
    top: 2,
    fontWeight: '600',
    lineHeight: 24,
  },
});
