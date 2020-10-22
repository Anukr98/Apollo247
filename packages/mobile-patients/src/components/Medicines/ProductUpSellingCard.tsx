import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import { MedicineIcon, MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  getDiscountPercentage,
  productsThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Divider, Image } from 'react-native-elements';

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

export const ProductUpSellingCard: React.FC<Props> = ({
  name,
  price,
  special_price,
  thumbnail,
  is_in_stock,
  sell_online,
  is_prescription_required,
  MaxOrderQty,
  quantity,
  containerStyle,
  onPress,
  onPressAddToCart,
  onPressNotify,
  onPressAddQty,
  onPressSubtractQty,
  onCartScreen,
}) => {
  const isPrescriptionRequired = is_prescription_required == 1;

  const renderImageAndTitle = () => (
    <View style={styles.imageAndTitle}>
      <Image
        placeholderStyle={styles.imagePlaceHolder}
        PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
        source={{ uri: productsThumbnailUrl(thumbnail) }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text numberOfLines={4} style={styles.title}>
        {name}
      </Text>
    </View>
  );
  const renderNotForSaleTag = () => <NotForSaleBadge containerStyle={{ alignSelf: 'center' }} />;

  const renderPriceAndAddToCartButton = () => {
    const discount = getDiscountPercentage(price, special_price);
    return (
      <View style={styles.priceAndAddToCartContainer}>
        {!!discount && (
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ ...styles.priceStrikeOff }}>
              {onCartScreen ? `(₹${price})` : `(Rs. ${price})`}
            </Text>
            <Text
              style={{ ...styles.discountPercentage, color: onCartScreen ? '#00B38E' : '#01475B' }}
            >{`  ${discount}% off`}</Text>
          </View>
        )}
        <View style={[styles.priceAndAddToCartButton, { marginTop: !!discount ? 0 : 12 }]}>
          <Text style={styles.price}>
            {(onCartScreen ? '₹' : 'Rs.') + (discount ? special_price : price)}
          </Text>
          {sell_online
            ? is_in_stock
              ? renderAddToCartButton()
              : renderNotifyButton()
            : renderNotForSaleTag()}
        </View>
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

  const renderNotifyButton = () => (
    <Text onPress={onPressNotify} style={styles.addToCart}>
      {'NOTIFY ME'}
    </Text>
  );

  return (
    <TouchableOpacity activeOpacity={1} style={[styles.card, containerStyle]} onPress={onPress}>
      {renderImageAndTitle()}
      <Divider style={styles.divider} />
      {renderPriceAndAddToCartButton()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.card(),
    marginVertical: 16,
    marginHorizontal: 0,
    paddingVertical: 10,
    width: Dimensions.get('window').width * 0.55,
  },
  imageAndTitle: { flexDirection: 'row', alignItems: 'center' },
  image: {
    height: 50,
    width: 50,
  },
  title: {
    ...theme.viewStyles.text('M', 14, '#01475B', 1, 17),
    flex: 1,
    paddingLeft: 15,
  },
  divider: {
    backgroundColor: '#02475B',
    opacity: 0.3,
    marginTop: 10,
  },
  priceAndAddToCartContainer: {
    justifyContent: 'center',
    height: 50,
  },
  priceAndAddToCartButton: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    ...theme.viewStyles.text('B', 14, '#01475B', 1, 24),
    flex: 1,
  },
  addToCart: {
    ...theme.viewStyles.text('B', 12, '#FC9916', 1, 24),
  },
  priceStrikeOff: {
    ...theme.viewStyles.text('M', 11, '#01475B', 0.6, 24),
    textDecorationLine: 'line-through',
  },
  discountPercentage: {
    ...theme.viewStyles.text('M', 11, '#01475B', 1, 24),
  },
  imagePlaceHolder: { backgroundColor: 'transparent' },
});
