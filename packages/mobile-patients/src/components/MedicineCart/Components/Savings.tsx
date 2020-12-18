import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { Down, CircleLogo, CouponIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface SavingsProps {}

export const Savings: React.FC<SavingsProps> = (props) => {
  const {
    couponDiscount,
    productDiscount,
    isCircleSubscription,
    cartTotalCashback,
    circleMembershipCharges,
    coupon,
    cartTotal,
    couponProducts,
  } = useShoppingCart();
  const deliveryFee = AppConfig.Configuration.DELIVERY_CHARGES;
  const minValueForFreeDelivery = AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY;
  const [showCareDetails, setShowCareDetails] = useState(true);
  const [showCareSavings, setShowCareSavings] = useState(true);

  const careTotal = !!coupon
    ? Number(cartTotal <= minValueForFreeDelivery ? 0 : deliveryFee) +
      Number(productDiscount) +
      Number(couponDiscount)
    : isCircleSubscription || circleMembershipCharges
    ? Number(deliveryFee) + Number(productDiscount) + cartTotalCashback
    : Number(productDiscount);

  function getSavings() {
    return Number(careTotal).toFixed(2);
  }

  function saveMessage() {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (!!coupon && !isCircleSubscription) {
            setShowCareSavings(!showCareSavings);
          } else {
            setShowCareDetails(!showCareDetails);
          }
        }}
      >
        <View style={styles.rowSpaceBetween}>
          <Text style={styles.youText}>
            You <Text style={styles.saveText}>saved ₹{getSavings()}</Text> on your purchase
          </Text>
          <Down
            style={{
              height: 15,
              transform: [{ rotate: showCareDetails && showCareSavings ? '180deg' : '0deg' }],
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }

  function careSubscribeMessage() {
    let circleSaving = (cartTotalCashback + deliveryFee + Number(productDiscount)).toFixed(2);
    if (couponProducts.length) {
      circleSaving = (cartTotalCashback + deliveryFee).toFixed(2);
    }
    if (cartTotalCashback > 1 && showCareDetails && Number(couponDiscount) < Number(circleSaving)) {
      return (
        <View style={styles.careMessageCard}>
          <Text style={styles.youText}>
            You could <Text style={styles.saveText}>save ₹{circleSaving}</Text> on your purchase
            with
          </Text>
          <CircleLogo style={styles.circleLogo} />
        </View>
      );
    } else {
      return <></>;
    }
  }

  function careSavings() {
    return (
      <View style={styles.careSavingsContainer}>
        <View style={styles.rowSpaceBetween}>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>
              <Text style={theme.viewStyles.text('R', 14, '#FC9916', 1, 20)}>Circle </Text>
              Membership Cashback
            </Text>
          </View>
          <Text style={theme.viewStyles.text('R', 14, '#FC9916', 1, 20)}>₹{cartTotalCashback}</Text>
        </View>
        {!!deliveryFee && (
          <View style={[styles.rowSpaceBetween, { marginTop: 10 }]}>
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>
              <Text style={theme.viewStyles.text('R', 14, '#FC9916', 1, 20)}>Circle </Text>
              Delivery Savings
            </Text>
            <Text style={theme.viewStyles.text('R', 14, '#FC9916', 1, 20)}>
              ₹{deliveryFee.toFixed(2)}
            </Text>
          </View>
        )}
        {!!productDiscount && (
          <View style={[styles.rowSpaceBetween, { marginTop: 10 }]}>
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>Product Discount</Text>
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>
              ₹{productDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmount}>₹{careTotal.toFixed(2)}</Text>
        </View>
      </View>
    );
  }

  const renderCurrentSavings = () => {
    return (
      <View style={styles.careSavingsContainer}>
        {!!couponDiscount && (
          <View style={[styles.rowSpaceBetween]}>
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>Coupon savings</Text>
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>
              ₹{couponDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {!!productDiscount && (
          <View style={[styles.rowSpaceBetween, { marginTop: 5 }]}>
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>Product Discount</Text>
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>
              ₹{productDiscount.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return getSavings() && getSavings() != 0 ? (
    <>
      <View style={styles.savingsCard}>
        {saveMessage()}
        {(isCircleSubscription || !!circleMembershipCharges) &&
          !coupon &&
          showCareDetails &&
          careSavings()}
        {!!coupon && !isCircleSubscription && showCareSavings && renderCurrentSavings()}
      </View>
      {(!(isCircleSubscription || !!circleMembershipCharges) || (!!coupon && showCareDetails)) &&
        careSubscribeMessage()}
    </>
  ) : null;
};

const styles = StyleSheet.create({
  savingsCard: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 0,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderColor: '#00B38E',
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  careMessageCard: {
    flexDirection: 'row',
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 5,
    marginHorizontal: 18,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    paddingHorizontal: 15,
    paddingVertical: 9,
    elevation: 3,
  },
  careSavingsContainer: {
    borderTopColor: '#979797',
    borderTopWidth: 0.5,
    paddingVertical: 10,
    marginTop: 10,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalAmountContainer: {
    borderTopColor: '#979797',
    borderTopWidth: 0.5,
    paddingTop: 5,
    marginTop: 10,
  },
  totalAmount: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 20),
    textAlign: 'right',
  },
  youText: {
    ...theme.fonts.IBMPlexSansRegular(13),
    lineHeight: 17,
    color: '#02475B',
  },
  saveText: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    lineHeight: 17,
    color: '#00B38E',
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 45,
    height: 20,
  },
  circleLogoTwo: {
    resizeMode: 'contain',
    width: 40,
    height: 20,
  },
});
