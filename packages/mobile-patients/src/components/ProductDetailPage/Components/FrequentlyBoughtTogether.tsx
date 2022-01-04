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
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

export interface FrequentlyBoughtTogetherProps {
  boughtTogetherArray: MedicineProduct[];
  setShowAddedToCart: (show: boolean) => void;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = (props) => {
  const { boughtTogetherArray, setShowAddedToCart } = props;
  const defaultSelectedId: number[] = [];
  const { pharmacyCircleAttributes } = useShoppingCart();

  let defaultTotalPrice = 0;

  boughtTogetherArray.map((item) => {
    defaultSelectedId.push(item?.id);
    const itemPrice = item?.special_price ? item?.special_price : item?.price;
    defaultTotalPrice = defaultTotalPrice + parseInt(itemPrice);
  });

  const [selectedItemsCount, setSelectedItemsCount] = useState<number>(
    defaultSelectedId?.length || 0
  );
  const [selectedProductsId, setSelectedProductsId] = useState(defaultSelectedId || []);
  const [selectedProductsArray, setSelectedProductsArray] = useState<MedicineProduct[]>(
    boughtTogetherArray || []
  );
  const [totalPrice, setTotalPrice] = useState<number>(defaultTotalPrice || 0);

  const { setUserActionPayload } = useServerCart();
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients()

  const onPressIcon = (id: number, itemPrice: number, item) => {
    const newArr = [...selectedProductsId];
    const newDataArr = [...selectedProductsArray];
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

  const postFrequentlyBoughtTogetherEvent = async (item: object) => {
    const eventAttributes = {
      source: "Frequently Bought Together",
      sku: item?.sku,
      name: item?.name,
      price: item?.price,
      special_price: item?.special_price,
      quantity: 1,
      'Circle Member': pharmacyCircleAttributes?.['Circle Membership Added'],
      'Circle Membership Value': pharmacyCircleAttributes?.['Circle Membership Value'] ? pharmacyCircleAttributes?.['Circle Membership Value'] : 0
    }
    postCleverTapEvent(CleverTapEventName.PHARMACY_ADD_TO_CART, eventAttributes)
  }

  const onPressAdd = (selectedProductsArray) => {
    if (selectedProductsArray.length > 0) {
      selectedProductsArray.map((item) => {
        postFrequentlyBoughtTogetherEvent(item)
        setUserActionPayload?.({
          medicineOrderCartLineItems: [
            {
              medicineSKU: item?.sku,
              quantity: 1,
            },
          ],
        });
      });
      setShowAddedToCart(true);
      setTimeout(() => {
        setShowAddedToCart(false);
      }, 2000);
    }
  };
  const renderPlusView = () => {
    return (
      <View style={styles.plusContainer}>
        <View style={styles.plusLeftStyle}>
          <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.dashStyle}>
            -----------------
          </Text>
        </View>
        <View>
          <Text style={styles.plusTextStyle}>+</Text>
        </View>
        <View style={styles.plusRightStyle}>
          <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.dashStyle}>
            ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
          </Text>
        </View>
      </View>
    );
  };
  const renderBoughtTogetherItem = (imgUrl: string, item: MedicineProduct, index: number) => {
    const specialPrice = item?.special_price ? true : false;
    const discount = Math.round(getDiscountPercentage(item?.price, item?.special_price));
    const itemSelected = selectedProductsId.includes(item?.id);
    return (
      <View style={styles.mainContainer}>
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
              <ImageNative
                source={{ uri: imgUrl }}
                style={styles.imageStyle}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.detailsContainer}>
            <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.nameStyle}>
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
        {index !== boughtTogetherArray?.length - 1 && renderPlusView()}
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
    marginTop: 10,
    marginHorizontal: 15,
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
    borderWidth: 0.5,
    borderRadius: 1,
    borderColor: '#02475B',
  },
  mainContainer: {
    flexDirection: 'column',
  },
  ItemContainer: {
    height: 69,
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
    marginHorizontal: 11,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  iconStyles: {
    height: 14,
    width: 14,
    alignSelf: 'center',
  },
  imageStyle: {
    height: 51,
    width: 51,
    alignSelf: 'center',
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 13,
    paddingRight: 20,
  },
  nameStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: '#02475B',
    lineHeight: 18,
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
    paddingTop: 2,
  },
  discountStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: '#00B38E',
    opacity: 0.7,
    fontWeight: '500',
    lineHeight: 16,
    paddingTop: 2,
  },
  cartContainer: {
    height: 75,
    borderTopWidth: 0.5,
    borderTopColor: '#02475B',
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
  plusContainer: {
    flexDirection: 'row',
    marginVertical: -17,
  },
  plusLeftStyle: {
    width: '15%',
    alignSelf: 'center',
    marginRight: 5,
  },
  plusRightStyle: {
    width: '85%',
    alignSelf: 'center',
    marginLeft: 5,
  },
  plusTextStyle: {
    color: '#658F9B',
    fontSize: 25,
  },
  dashStyle: {
    color: '#658F9B',
  },
});
