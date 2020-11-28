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
  } = useShoppingCart();
  const deliveryFee = AppConfig.Configuration.DELIVERY_CHARGES;
  const [showCareDetails, setShowCareDetails] = useState(true);
  // const careTotal = !!coupon
  //   ? Number(deliveryFee) + Number(productDiscount) + Number(couponDiscount)
  //   : isCircleSubscription || circleMembershipCharges
  //   ? Number(deliveryFee) + Number(productDiscount) + cartTotalCashback
  //   : Number(productDiscount);

  const careTotal = !!coupon
    ? Number(cartTotal > 200 ? 0 : deliveryFee) + Number(productDiscount) + Number(couponDiscount)
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
          setShowCareDetails(!showCareDetails);
        }}
      >
        <View style={styles.rowSpaceBetween}>
          <Text style={styles.youText}>
            You <Text style={styles.saveText}>saved ₹{getSavings()}</Text> on your purchase
          </Text>
          <Down
            style={{
              height: 15,
              transform: [{ rotate: showCareDetails ? '180deg' : '0deg' }],
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }

  function careSubscribeMessage() {
    if (cartTotalCashback > 1) {
      return (
        <View style={styles.careMessageCard}>
          <Text style={styles.youText}>
            You could{' '}
            <Text style={styles.saveText}>
              save ₹{(cartTotalCashback + deliveryFee + Number(productDiscount)).toFixed(2)}
            </Text>{' '}
            on your purchase with
          </Text>
          <CircleLogo style={styles.circleLogo} />
        </View>
      );
    } else {
      return <></>;
    }
  }

  function renderCareLogo() {
    return <CircleLogo style={styles.circleLogoTwo} />;
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
            {renderCareLogo()}
            <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>
              Membership Cashback
            </Text>
          </View>
          <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>₹{cartTotalCashback}</Text>
        </View>
        {!!deliveryFee && (
          <View style={[styles.rowSpaceBetween, { marginTop: 10 }]}>
            <View style={{ flexDirection: 'row' }}>
              {renderCareLogo()}
              <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>Delivery</Text>
            </View>
            <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>
              ₹{deliveryFee.toFixed(2)}
            </Text>
          </View>
        )}
        {!!productDiscount && (
          <View style={[styles.rowSpaceBetween, { marginTop: 10 }]}>
            <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>Cart Savings</Text>
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

  return getSavings() && getSavings() != 0 ? (
    <>
      <View style={styles.savingsCard}>
        {saveMessage()}
        {(isCircleSubscription || !!circleMembershipCharges) &&
          !coupon &&
          showCareDetails &&
          careSavings()}
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
