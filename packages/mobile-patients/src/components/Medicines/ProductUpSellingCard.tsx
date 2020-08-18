import {
  AddToCartButtons,
  AddToCartButtonsProps,
} from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Divider, Image } from 'react-native-elements';

export interface Props extends Omit<AddToCartButtonsProps, 'containerStyle'> {
  title: string;
  imageUrl: string;
  price: number;
  specialPrice?: number | string;
  onPress: () => void;
  onAddToCart: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  addToCartButtonContainerStyle?: StyleProp<ViewStyle>;
}

export const ProductUpSellingCard: React.FC<Props> = ({
  title,
  imageUrl,
  price,
  specialPrice,
  onPress,
  onAddToCart,
  containerStyle,
  numberOfItemsInCart,
  addToCartButtonContainerStyle,
  ...restOfProps
}) => {
  const renderImageAndTitle = () => (
    <View style={styles.imageAndTitle}>
      <Image
        placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text numberOfLines={4} style={styles.title}>
        {title}
      </Text>
    </View>
  );

  const renderPriceAndAddToCartButton = () => {
    const discount = getDiscountPercentage(price, specialPrice);
    return (
      <View style={styles.priceAndAddToCartContainer}>
        {!!discount && (
          <Text>
            <Text style={styles.priceStrikeOff}>(Rs. {price})</Text>
            <Text style={styles.discountPercentage}>{`  ${discount}% off`}</Text>
          </Text>
        )}
        <View style={[styles.priceAndAddToCartButton, { marginTop: !!discount ? 0 : 12 }]}>
          <Text numberOfLines={3} style={styles.price}>
            {`Rs. ${discount ? specialPrice : price}`}
          </Text>
          {renderAddToCartButton()}
        </View>
      </View>
    );
  };

  const renderAddToCartButton = () =>
    !numberOfItemsInCart ? (
      <Text onPress={onAddToCart} style={styles.addToCart}>
        {'ADD TO CART'}
      </Text>
    ) : (
      <AddToCartButtons
        numberOfItemsInCart={numberOfItemsInCart}
        containerStyle={addToCartButtonContainerStyle}
        {...restOfProps}
      />
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
    paddingVertical: 12,
    width: Dimensions.get('window').width * 0.5,
  },
  imageAndTitle: { flexDirection: 'row', alignItems: 'center' },
  image: {
    height: 68,
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
});
