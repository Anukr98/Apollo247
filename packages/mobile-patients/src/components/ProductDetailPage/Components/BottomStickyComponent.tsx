import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  calculateCashbackForItem,
  getDiscountPercentage,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { getRoundedOffPrice } from '@aph/mobile-patients/src/components/ProductDetailPage/helperFunctionsPDP';

const { width } = Dimensions.get('window');
export interface BottomStickyComponentProps {
  price: number | string;
  specialPrice: string | number | null;
  sku: string;
  isInStock: boolean;
  onAddCartItem: () => void;
  productQuantity: number;
  setShowAddedToCart: (show: boolean) => void;
  isBanned: boolean;
  onNotifyMeClick: () => void;
  typeId?: string;
  subcategory?: string | null | undefined;
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
    onNotifyMeClick,
    typeId,
    subcategory,
  } = props;
  const { cartItems, circleSubscriptionId, isCircleCart } = useShoppingCart();
  const finalPrice = Number(specialPrice) ? Number(specialPrice) : Number(price);
  const cashback = calculateCashbackForItem(finalPrice, typeId, subcategory, sku);
  const isCircleMember = (!!circleSubscriptionId || isCircleCart) && !!cashback;
  const isIos = Platform.OS === 'ios';

  const renderCartCTA = () => {
    const ctaText = isInStock ? 'ADD TO CART' : 'NOTIFY ME';
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.5}
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
    const discountPercent = specialPrice
      ? getDiscountPercentage(price, specialPrice)
      : getDiscountPercentage(price);
    return (
      <View>
        {!!specialPrice ? (
          <View style={styles.flexRow}>
            <Text style={styles.value}>
              {string.common.Rs}
              {getRoundedOffPrice(specialPrice, typeId)}
            </Text>
            <Text style={styles.smallLabel}>{`MRP `}</Text>
            <Text style={styles.smallValue}>
              {string.common.Rs}
              {getRoundedOffPrice(price, typeId)}
            </Text>
            <Text style={styles.discountPercent}>{` ${discountPercent}%off`}</Text>
          </View>
        ) : (
          <View style={styles.flexRow}>
            <Text style={styles.label}>{`MRP: `}</Text>
            <Text style={styles.value}>
              {string.common.Rs}
              {getRoundedOffPrice(price, typeId)}
            </Text>
          </View>
        )}
      </View>
    );
  };
  const renderCareCashback = () => {
    return (
      <>
        <CareCashbackBanner
          bannerText={`extra cashback ${string.common.Rs}${cashback}`}
          textStyle={styles.circleText}
          logoStyle={styles.circleLogo}
        />
        <Text style={theme.viewStyles.text('R', 11, '#02475B', 1, 17)}>
          {`Effective price for you`}
          <Text style={{ fontWeight: 'bold' }}>
            {' '}
            {string.common.Rs}
            {(finalPrice - Number(cashback)).toFixed(2)}
          </Text>
        </Text>
      </>
    );
  };
  return (
    <StickyBottomComponent
      style={[styles.stickyBottomComponent, isIos ? { height: isCircleMember ? 95 : 85 } : {}]}
    >
      <View style={[styles.innerContainer, isIos ? { paddingTop: isCircleMember ? 15 : 12 } : {}]}>
        <View>
          {renderProductPrice()}
          {isCircleMember && renderCareCashback()}
        </View>
        {!isBanned && renderCartCTA()}
      </View>
    </StickyBottomComponent>
  );
};
const styles = StyleSheet.create({
  stickyBottomComponent: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    borderTopWidth: 0.6,
    borderStyle: 'dashed',
    position: 'absolute',
    top: 0,
    paddingHorizontal: 0,
    height: 70,
  },
  innerContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  addToCartCta: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FCB716',
    paddingVertical: 7,
    paddingHorizontal: 30,
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
