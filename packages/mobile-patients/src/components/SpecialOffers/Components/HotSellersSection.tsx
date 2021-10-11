import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image as ImageNative,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  getDiscountPercentage,
  getMaxQtyForMedicineItem,
  productsThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  addPharmaItemToCart,
  getIsMedicine,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import { OfferIcon } from '../../ui/Icons';

export interface HotSellersProps extends NavigationScreenProps {}

export const HotSellersSection: React.FC<HotSellersProps> = (props) => {
  const [itemsLoading, setItemsLoading] = useState<{ [key: string]: boolean }>({});
  const title = 'TRENDING DEALS';
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    updateCartItem,
    pharmacyCircleAttributes,
    asyncPincode,
    medicineHotSellersData,
  } = useShoppingCart();
  const pharmacyPincode =
    asyncPincode?.pincode || pharmacyLocation?.pincode || locationDetails?.pincode;
  const { currentPatient } = useAllCurrentPatients();
  const movedFrom = 'Special Offers';

  const renderItem = (imgUrl: string, item) => {
    const specialPrice = item.special_price ? true : false;
    const fallbackImage = `https://newassets.apollo247.com/images/ic_placeholder_circle.png`;
    const imagePathPresent = imgUrl.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
    const discount = Math.round(getDiscountPercentage(item.price, item.special_price));

    return (
      <View style={styles.hotSellersContainer}>
        <TouchableOpacity onPress={() => gotToProductPage(item?.url_key, item?.sku, movedFrom)}>
          <View style={styles.hotSellersBoxStyles}>
            {item?.special_price ? renderDiscountTag(item, discount) : <View></View>}
            <View style={styles.squareContainer}>
              <ImageNative
                source={imagePathPresent ? { uri: imgUrl } : { uri: fallbackImage }}
                style={styles.imageContainer}
                resizeMode="contain"
              />
            </View>

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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingBottom: 5,
                height: 20,
              }}
            >
              {specialPrice && (
                <Text style={styles.priceCancelStyle}>{`${'\u20B9'}${item?.price}`}</Text>
              )}
              {specialPrice && <Text style={styles.discountStyle}>{`${discount}%off`}</Text>}
            </View>
            <View style={{ paddingTop: 10 }}>{renderAddToCartButton(item)}</View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const gotToProductPage = (urlKey: string, sku: string, movedFrom: string) => {
    props.navigation.navigate(AppRoutes.ProductDetailPage, {
      urlKey,
      sku,
      movedFrom,
    });
  };

  const renderHeading = (title: string) => {
    return (
      <View style={{ marginTop: 5 }}>
        <SectionHeaderComponent sectionTitle={title} />
      </View>
    );
  };

  const renderAddToCartButton = (item) => {
    const quantity = getItemQuantity(item.sku);
    return !quantity ? (
      <View style={{ paddingBottom: 15, paddingTop: 5 }}>
        <TouchableOpacity style={styles.cartButtonStyle} onPress={() => onAddCartItem(item)}>
          <Text style={styles.cartButtonTextStyle}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View style={{ paddingBottom: 15, paddingTop: 5 }}>
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

  const renderDiscountTag = (item, discount: number) => {
    return (
      <View style={styles.discountTagView}>
        <OfferIcon />
        <Text style={styles.discountTagText}>{`-${discount}%`}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeading(title)}
      <View>
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={medicineHotSellersData.products}
          renderItem={({ item, index }) => {
            const imgUrl = productsThumbnailUrl(item?.image);
            return renderItem(imgUrl, item);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    marginTop: 20,
  },
  hotSellersContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 15,
    marginTop: 15,
  },
  hotSellersBoxStyles: {
    marginRight: 15,
    width: 135,
  },
  squareContainer: {
    width: 135,
    height: 113,
    backgroundColor: '#F7F8F5',
    opacity: 0.8,
  },
  imageContainer: {
    height: 81,
    width: 85,
    alignSelf: 'center',
    top: 15,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    paddingTop: 12,
    color: '#02475B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
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
  discountTagView: {
    elevation: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  discountTagText: {
    ...theme.viewStyles.text('B', 10, '#ffffff', 1, 24),
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});
