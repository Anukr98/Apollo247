import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import {
  MedicineIcon,
  MedicineRxIcon,
  OfferIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  getDiscountPercentage,
  productsThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Divider, Image } from 'react-native-elements';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface Props extends MedicineProduct {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressNotify: () => void;
  onPressAddQty: () => void;
  onPressSubtractQty: () => void;
  quantity: number;
  containerStyle?: TouchableOpacityProps['style'];
  onCartScreen?: boolean;
}

export const ProductCard: React.FC<Props> = ({
  name,
  price,
  special_price,
  thumbnail,
  image,
  sell_online,
  is_prescription_required,
  MaxOrderQty,
  quantity,
  containerStyle,
  onPress,
  onPressAddToCart,
  onPressAddQty,
  onPressSubtractQty,
}) => {
  const isPrescriptionRequired = is_prescription_required == 1;
  const discount = getDiscountPercentage(price, special_price);

  const renderPrice = () => {
    const strikeOffPrice = `(${string.common.Rs} ${price})`;
    const finalPrice = `  ${string.common.Rs} ${discount ? special_price : price}`;
    return (
      <View style={styles.priceContainer}>
        {!!discount && <Text style={styles.priceStrikeOff}>{strikeOffPrice}</Text>}
        <Text style={styles.finalPrice}>{finalPrice}</Text>
      </View>
    );
  };

  const renderAddToCartButton = () =>
    !quantity ? (
      <Text onPress={onPressAddToCart} style={styles.addToCart}>
        {'ADD TO CART'}
      </Text>
    ) : (
      <AddToCartButtons
        numberOfItemsInCart={quantity}
        maxOrderQty={MaxOrderQty}
        addToCart={onPressAddQty}
        removeItemFromCart={onPressSubtractQty}
        removeFromCart={onPressSubtractQty}
      />
    );

  const renderNotForSaleTag = () => <NotForSaleBadge />;

  const renderImage = () => (
    <Image
      placeholderStyle={styles.imagePlaceHolder}
      PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
      source={{ uri: productsThumbnailUrl(image || thumbnail) }}
      style={styles.image}
    />
  );

  const renderTitle = () => (
    <Text numberOfLines={3} style={styles.title}>
      {name}
    </Text>
  );

  const renderDiscountTag = () =>
    !!discount && (
      <View style={styles.discountTagView}>
        <OfferIcon />
        <Text style={styles.discountTagText}>-{discount}%</Text>
      </View>
    );

  const renderDivider = () => <Divider style={styles.divider} />;

  const renderProductActions = () =>
    sell_online ? renderAddToCartButton() : renderNotForSaleTag();

  return (
    <TouchableOpacity activeOpacity={1} style={[styles.card, containerStyle]} onPress={onPress}>
      {renderDiscountTag()}
      {renderImage()}
      {renderTitle()}
      {renderDivider()}
      {renderPrice()}
      {renderProductActions()}
    </TouchableOpacity>
  );
};

const { text } = theme.viewStyles;
const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.card(12, 0),
    alignItems: 'center',
    width: 168,
    height: 232,
  },
  image: {
    resizeMode: 'contain',
    height: 68,
    width: 68,
    marginBottom: 8,
  },
  title: {
    ...text('M', 14, '#01475B', 1, 17),
    textAlign: 'center',
    height: 51,
  },
  divider: {
    backgroundColor: '#02475B',
    opacity: 0.3,
    width: '100%',
    marginTop: 10,
  },
  priceContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
  },
  finalPrice: {
    ...text('B', 13, '#01475b', 1, 24),
  },
  priceStrikeOff: {
    ...text('M', 13, '#01475b', 0.6, 24),
    textDecorationLine: 'line-through',
  },
  addToCart: {
    ...text('B', 12, '#FC9916', 1, 24),
  },
  imagePlaceHolder: { backgroundColor: 'transparent' },
  discountTagView: {
    elevation: 20,
    position: 'absolute',
    right: 12,
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
