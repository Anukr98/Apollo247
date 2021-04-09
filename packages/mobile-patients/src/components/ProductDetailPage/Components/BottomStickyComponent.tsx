import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';

export interface BottomStickyComponentProps {
  price: number;
  specialPrice: number | null;
  sku: string;
  isInStock: boolean;
  onAddCartItem: () => void;
  productQuantity: number;
  setShowAddedToCart: (show: boolean) => void;
  isBanned: boolean;
  cashback: number;
  onNotifyMeClick: () => void;
}

export const BottomStickyComponent: React.FC<BottomStickyComponentProps> = (props) => {
  const {
    isInStock,
    onAddCartItem,
    price,
    specialPrice,
    sku,
    productQuantity,
    setShowAddedToCart,
    isBanned,
    cashback,
    onNotifyMeClick,
  } = props;
  const { cartItems, circleSubscriptionId } = useShoppingCart();

  const renderCartCTA = () => {
    const ctaText = isInStock ? 'ADD TO CART' : 'NOTIFY WHEN IN STOCK';
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            isInStock ? onAddToCart() : onNotifyMeClick();
          }}
          activeOpacity={0.7}
          style={isInStock ? styles.addToCartCta : styles.notifyCta}
        >
          <Text style={isInStock ? styles.addToCartText : styles.notifyText}>{ctaText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const onAddToCart = () => {
    setShowAddedToCart(true);
    setTimeout(() => {
      setShowAddedToCart(false);
    }, 2000);
    const existingCartItem = cartItems.filter((item) => item.id === sku);
    if (existingCartItem.length) {
      existingCartItem[0].quantity = productQuantity;
    } else {
      onAddCartItem();
    }
  };

  const renderProductPrice = () => {
    const discountPercent = getDiscountPercentage(price, specialPrice);
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          marginTop: !!cashback && !!circleSubscriptionId ? 0 : 17,
        }}
      >
        {!!specialPrice ? (
          <View style={styles.flexRow}>
            <Text style={styles.value}>
              {string.common.Rs}
              {convertNumberToDecimal(specialPrice)}{' '}
            </Text>
            <Text style={styles.smallLabel}>{`MRP `}</Text>
            <Text style={styles.smallValue}>
              {string.common.Rs}
              {convertNumberToDecimal(price)}
            </Text>
            <Text style={styles.discountPercent}>{` ${discountPercent}%off`}</Text>
          </View>
        ) : (
          <View style={styles.flexRow}>
            <Text style={styles.label}>{`MRP: `}</Text>
            <Text style={styles.value}>
              {string.common.Rs}
              {convertNumberToDecimal(price)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCareCashback = () => {
    const finalPrice = price - specialPrice ? specialPrice : price;
    return (
      <>
        <CareCashbackBanner
          bannerText={`extra cashback ${string.common.Rs}${cashback.toFixed(2)}`}
          textStyle={styles.circleText}
          logoStyle={styles.circleLogo}
        />
        <Text style={theme.viewStyles.text('R', 11, '#02475B', 1, 17)}>
          Effective price for you
          <Text style={{ fontWeight: 'bold' }}>
            {' '}
            {string.common.Rs}
            {(finalPrice - cashback).toFixed(2)}
          </Text>
        </Text>
      </>
    );
  };

  return (
    <StickyBottomComponent style={styles.stickyBottomComponent}>
      <View>
        {renderProductPrice()}
        {!!circleSubscriptionId && !!cashback && renderCareCashback()}
      </View>
      {!isBanned && renderCartCTA()}
    </StickyBottomComponent>
  );
};

const styles = StyleSheet.create({
  stickyBottomComponent: {
    ...theme.viewStyles.shadowStyle,
    backgroundColor: theme.colors.WHITE,
    flexDirection: 'row',
    borderTopWidth: 0.6,
    borderStyle: 'dashed',
    position: 'absolute',
    top: 56,
  },
  flexRow: {
    flexDirection: 'row',
  },
  addToCartCta: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FCB716',
    paddingVertical: 7,
    paddingHorizontal: 30,
    marginTop: 6,
  },
  addToCartText: {
    ...theme.viewStyles.text('B', 14, '#FFFFFF', 1, 25, 0.35),
    textAlign: 'center',
  },
  notifyCta: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCB716',
    paddingVertical: 7,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  notifyText: {
    ...theme.viewStyles.text('B', 14, '#FCB716', 1, 25, 0.35),
    textAlign: 'center',
  },
  label: theme.viewStyles.text('R', 15, '#02475B', 1, 15, 0.35),
  value: theme.viewStyles.text('B', 15, '#02475B', 1, 15, 0.35),
  smallLabel: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 15, 0.35),
    textDecorationLine: 'line-through',
  },
  smallValue: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 15, 0.35),
    textDecorationLine: 'line-through',
  },
  discountPercent: theme.viewStyles.text('R', 14, '#00B38E', 1, 15, 0.35),
  circleText: {
    ...theme.viewStyles.text('M', 10, '#02475B', 1, 15),
    paddingVertical: 2,
    marginLeft: -4,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 38,
    height: 20,
  },
});
