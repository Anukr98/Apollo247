import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Image as ImageNative,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CheckBoxFilled, CheckBox } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  getDiscountPercentage,
  productsThumbnailUrl,
  getIsMedicine,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface FrequentlyBoughtTogetherProps {
  boughtTogetherArray: MedicineProduct[];
  setShowAddedToCart: (show: boolean) => void;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = (props) => {
  const { boughtTogetherArray, setShowAddedToCart } = props;

  const [selectedItemsCount, setSelectedItemsCount] = useState<number>(0);
  const [selectedProductsId, setSelectedProductsId] = useState([]);
  const [selectedProductsArray, setSelectedProductsArray] = useState<MedicineProduct[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const { cartItems, updateCartItem, addCartItem } = useShoppingCart();

  const onPressIcon = (id: number, itemPrice: number, item) => {
    let newArr = [...selectedProductsId];
    let newDataArr = [...selectedProductsArray];
    if (newArr.includes(id)) {
      const x = newArr.indexOf(id);
      newArr.splice(x, 1);
      newDataArr.splice(x, 1);
      setSelectedItemsCount(selectedItemsCount - 1);
      setSelectedProductsArray(newDataArr);
      setTotalPrice(totalPrice - itemPrice);
    } else {
      newArr.push(id);
      newDataArr.push(item);
      setSelectedItemsCount(selectedItemsCount + 1);
      setSelectedProductsArray(newDataArr);
      setTotalPrice(totalPrice + itemPrice);
    }
    setSelectedProductsId(newArr);
  };

  const onPressAdd = (selectedProductsArray) => {
    selectedProductsArray.map((item) => {
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
        url_key,
        subcategory,
      } = item;
      if (cartItems.find(({ id }) => id?.toUpperCase() === sku?.toUpperCase())) {
        updateCartItem?.({
          id: sku,
          quantity: 1,
        });
      } else {
        addCartItem!({
          id: sku,
          mou,
          name,
          price: price,
          specialPrice: special_price
            ? typeof special_price == 'string'
              ? Number(special_price)
              : special_price
            : undefined,
          prescriptionRequired: is_prescription_required === '1',
          isMedicine: getIsMedicine(type_id?.toLowerCase()) || '0',
          quantity: 1,
          thumbnail: thumbnail,
          isInStock: true,
          maxOrderQty: MaxOrderQty,
          productType: type_id,
          url_key,
          subcategory,
        });
      }
      setShowAddedToCart(true);
      setTimeout(() => {
        setShowAddedToCart(false);
      }, 2000);
    });
  };

  const renderBoughtTogetherItem = (imgUrl: string, item: MedicineProduct, index: number) => {
    const specialPrice = item?.special_price ? true : false;
    const discount = Math.round(getDiscountPercentage(item?.price, item?.special_price));
    const itemSelected = selectedProductsId.includes(item?.id);
    return (
      <View style={styles.ItemContainer}>
        <View style={styles.imageContainer}>
          <TouchableOpacity
            onPress={() => {
              item?.special_price
                ? onPressIcon(item?.id, +item?.special_price, item)
                : onPressIcon(item?.id, item?.price, item);
            }}
            style={styles.selectImageStyle}
          >
            {itemSelected ? (
              <CheckBoxFilled style={styles.iconStyles} />
            ) : (
              <CheckBox style={styles.iconStyles} />
            )}
            {
              <View style={styles.plusStyle}>
                {index !== boughtTogetherArray.length - 1 ? (
                  <Text style={styles.plusTextStyle}>+</Text>
                ) : (
                  <Text>{'   '}</Text>
                )}
              </View>
            }
            <ImageNative source={{ uri: imgUrl }} style={styles.imageStyle} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.detailsContainer}>
          <Text numberOfLines={2} ellipsizeMode={'tail'}>
            {item?.name}
          </Text>
          <View style={styles.priceContainer}>
            {specialPrice ? (
              <Text style={styles.priceStyle}>
                {'\u20B9'}
                {item?.special_price}{' '}
              </Text>
            ) : (
              <Text style={styles.priceStyle}>
                {'\u20B9'}
                {item?.price}
              </Text>
            )}
            {specialPrice && (
              <Text style={styles.priceCancelStyle}>
                {'\u20B9'}
                {item?.price}{' '}
              </Text>
            )}
            {specialPrice && <Text style={styles.discountStyle}>{`${discount}%off`}</Text>}
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.headingStyle}>Frequently bought together</Text>
      <View style={styles.productContainer}>
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          data={boughtTogetherArray}
          renderItem={({ item, index }) => {
            const imgUrl = productsThumbnailUrl(item?.image);
            return renderBoughtTogetherItem(imgUrl, item, index);
          }}
        />
        <View style={styles.cartContainer}>
          <View>
            <Text style={styles.cartPriceStyle}>Total Price</Text>
            <Text style={styles.cartValueStyle}>
              {'\u20B9'}
              {totalPrice}
            </Text>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                onPressAdd(selectedProductsArray);
              }}
              style={styles.addButtonContainer}
            >
              {selectedItemsCount === 0 ? (
                <Text style={styles.addButtonTextStyles}>ADD ITEMS TO CART</Text>
              ) : selectedItemsCount === 1 ? (
                <Text style={styles.addButtonTextStyles}>
                  ADD {selectedItemsCount} ITEM TO CART
                </Text>
              ) : (
                <Text style={styles.addButtonTextStyles}>
                  ADD {selectedItemsCount} ITEMS TO CART
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  headingStyle: {
    ...theme.fonts.IBMPlexSansRegular(20),
    color: '#02475B',
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0.25,
  },
  productContainer: {
    marginTop: 16,
  },
  ItemContainer: {
    height: 67,
    borderWidth: 0.5,
    borderRadius: 1,
    borderTopColor: '#02475B',
    borderLeftColor: '#02475B',
    borderRightColor: '#02475B',
    borderBottomColor: '#658F9B',
    flexDirection: 'row',
  },
  imageContainer: {
    flexDirection: 'row',
    width: '30%',
    borderRightWidth: 0.5,
    borderColor: '#02475B',
    justifyContent: 'space-evenly',
  },
  selectImageStyle: {
    flexDirection: 'row',
  },
  iconStyles: {
    height: 14,
    width: 14,
    alignSelf: 'center',
  },
  plusStyle: {
    justifyContent: 'flex-end',
    bottom: -15,
    left: 30,
  },
  plusTextStyle: {
    fontSize: 25,
    color: '#658F9B',
  },
  imageStyle: {
    height: 53,
    width: 53,
    alignSelf: 'center',
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 13,
    paddingRight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    paddingTop: 5,
  },
  priceStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: '#01475B',
    fontWeight: '500',
    lineHeight: 18,
  },
  priceCancelStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: '#02475B',
    opacity: 0.7,
    fontWeight: '400',
    lineHeight: 15,
    letterSpacing: 0.25,
    textDecorationLine: 'line-through',
  },
  discountStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: '#00B38E',
    opacity: 0.7,
    fontWeight: '500',
    lineHeight: 16,
  },
  cartContainer: {
    height: 75,
    borderWidth: 0.5,
    borderColor: '#02475B',
    paddingTop: 16,
    paddingLeft: 19,
    paddingRight: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartPriceStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 18,
    color: '#658F9B',
  },
  cartValueStyle: {
    ...theme.fonts.IBMPlexSansRegular(16),
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    color: '#01475B',
  },
  addButtonContainer: {
    height: 40,
    width: 168,
    borderRadius: 5,
    backgroundColor: '#FCB716',
    justifyContent: 'center',
  },
  addButtonTextStyles: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
