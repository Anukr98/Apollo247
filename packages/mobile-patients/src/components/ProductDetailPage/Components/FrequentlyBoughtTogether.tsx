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
  couponThumbnailUrl,
  specialOffersImagesThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface FrequentlyBoughtTogetherProps {
  name: string;
  sku: string;
  price: number;
  specialPrice?: number | string;
  boughtTogetherArray: MedicineProduct[];
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = (props) => {
  const { name, sku, price, specialPrice, boughtTogetherArray } = props;

  const [selectedItemsCount, setSelectedItemsCount] = useState<number>(0);
  const [selectedProductsId, setSelectedProductsId] = useState([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const { updateCartItem } = useShoppingCart();

  const onPressIcon = (id: number, itemPrice: number) => {
    let newArr = [...selectedProductsId];
    if (newArr.includes(id)) {
      const x = newArr.indexOf(id);
      newArr.splice(x, 1);
      setSelectedItemsCount(selectedItemsCount - 1);
      setTotalPrice(totalPrice - itemPrice);
    } else {
      newArr.push(id);
      setSelectedItemsCount(selectedItemsCount + 1);
      setTotalPrice(totalPrice + itemPrice);
    }
    console.log(newArr);
    setSelectedProductsId(newArr);
  };

  const renderBoughtTogetherItem = (imgUrl: string, item: MedicineProduct, index) => {
    // const specialPrice = item.special_price ? true : false;
    const specialPrice = true;
    const value = 56;
    // const fallbackImage = `https://newassets.apollo247.com/images/ic_placeholder_circle.png`;
    const imagePathPresent = imgUrl.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
    const discount = Math.round(getDiscountPercentage(item.price, item.special_price));
    const itemSelected = selectedProductsId.includes(item?.id);
    return (
      <View style={styles.ItemContainer}>
        <View style={styles.imageContainer}>
          <TouchableOpacity
            onPress={() => {
              item?.special_price
                ? onPressIcon(item?.id, +item?.special_price)
                : onPressIcon(item?.id, item?.price);
              //   onPressIcon(item?.id, +item?.special_price || item?.price);
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
                {value}{' '}
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
            <TouchableOpacity style={styles.addButtonContainer}>
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
    // backgroundColor: '#229978',
  },
  headingStyle: {
    ...theme.fonts.IBMPlexSansRegular(20),
    color: '#02475B',
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0.25,
  },
  productContainer: {
    // width: '100%',
    // height: 280,
    marginTop: 16,
    // borderWidth: 0.5,
    // borderColor: '#02475B',
    // backgroundColor: '#229978',
  },
  //   mainItemContainer: {
  //     height: 71,
  //     flexDirection: 'row',
  //     justifyContent: 'center',
  //   },
  ItemContainer: {
    height: 67,
    borderWidth: 0.5,
    borderRadius: 1,
    // borderStyle: 'dashed',
    borderTopColor: '#02475B',
    borderLeftColor: '#02475B',
    borderRightColor: '#02475B',
    // borderColor: '#658F9B',
    borderBottomColor: '#658F9B',
    flexDirection: 'row',
    // justifyContent: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    width: '30%',
    borderRightWidth: 0.5,
    borderColor: '#02475B',
    justifyContent: 'space-evenly',
    // paddingLeft: 10,
  },
  selectImageStyle: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // justifyContent: 'space-evenly',
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
    // top: 15,
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
    // paddingRight: 3,
  },
  priceCancelStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: '#02475B',
    opacity: 0.7,
    fontWeight: '400',
    // paddingRight: 3,
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
    // backgroundColor: '#229978',
  },
  cartPriceStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    // textAlign: 'center',
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
    // marginRight: 12,
    borderRadius: 5,
    backgroundColor: '#FC9916',
    justifyContent: 'center',
  },
  addButtonTextStyles: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
