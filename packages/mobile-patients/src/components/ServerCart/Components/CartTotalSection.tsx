import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { OneApollo } from '@aph/mobile-patients/src/components/ui/Icons';
import { CashbackDetailsCard } from '@aph/mobile-patients/src/components/ServerCart/Components/CashbackDetailsCard';
import { Overlay } from 'react-native-elements';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

export interface CartTotalSectionProps {}

export const CartTotalSection: React.FC<CartTotalSectionProps> = (props) => {
  const { cartSubscriptionDetails, serverCartAmount, isCircleCart } = useShoppingCart();
  const { healthCredits } = useAppCommonData();
  const isCircleAddedToCart =
    !!cartSubscriptionDetails?.currentSellingPrice &&
    !!cartSubscriptionDetails?.subscriptionApplied;
  const cartTotal = serverCartAmount?.cartTotal;
  const cartSavings = serverCartAmount?.cartSavings;
  const couponSavings = serverCartAmount?.couponSavings;
  const deliveryCharges = serverCartAmount?.deliveryCharges;
  const estimatedAmount = serverCartAmount?.estimatedAmount;
  const isDeliveryFree = serverCartAmount?.isDeliveryFree;
  const totalCashBack = serverCartAmount?.totalCashBack;
  const packagingCharges = serverCartAmount?.packagingCharges;
  const circleDeliverySavings = isCircleCart
    ? serverCartAmount?.circleSavings?.circleDelivery || 0
    : 0;
  const deliverySavings = isDeliveryFree || circleDeliverySavings > 0 ? deliveryCharges : 0;
  const totalSavings =
    cartSavings + couponSavings + deliverySavings + (isCircleCart ? totalCashBack : 0) || 0;
  const isHealthCreditsAvailable = healthCredits ? true : false;
  const savingsAfterUsingHC =
    isHealthCreditsAvailable && estimatedAmount
      ? estimatedAmount - healthCredits > 0
        ? estimatedAmount - healthCredits
        : 0
      : 0;

  const [showCashbackCard, setShowCashbackCard] = useState<boolean>(false);
  const [savingsSelected, setSavingsSelected] = useState<boolean>(false);
  const [HCSectionSelected, setHCSectionSelected] = useState<boolean>(false);

  const renderCartTotal = () => {
    return cartTotal ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Cart total</Text>
        <Text style={styles.text}>₹{cartTotal?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderProductDiscount = () => {
    return cartSavings ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Product Discount</Text>
        <Text style={styles.discount}>-₹{cartSavings?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderCouponDiscount = () => {
    return couponSavings ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Coupon savings</Text>
        <Text style={styles.discount}>-₹{couponSavings?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderDeliveryCharges = () => {
    return deliveryCharges ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.text}>Delivery charges</Text>
          {isCircleCart && <Text style={styles.circleMessage}>(Free for Circle Members)</Text>}
        </View>
        {deliveryCharges && !isDeliveryFree ? (
          <Text style={styles.text}>+₹{deliveryCharges?.toFixed(2)}</Text>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.free}>Free</Text>
            <Text style={{ ...styles.text, textDecorationLine: 'line-through', marginLeft: 5 }}>
              +₹{deliveryCharges?.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    ) : null;
  };

  const renderPackagingCharges = () => {
    return packagingCharges ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Packaging Charges</Text>
        <Text style={styles.text}>+₹{packagingCharges?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderSeparator = () => {
    return <View style={styles.separator}></View>;
  };

  const renderToPay = () => {
    return estimatedAmount ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.toPay}>To Pay</Text>
        <Text style={styles.toPay}>₹{estimatedAmount?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderCircleMembershipCharges = () =>
    isCircleAddedToCart ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Circle Membership</Text>
        <Text style={styles.text}>₹{cartSubscriptionDetails?.currentSellingPrice?.toFixed(2)}</Text>
      </View>
    ) : null;

  const renderPayUsingHealthCredits = () => {
    return isHealthCreditsAvailable ? (
      <View style={styles.healthCreditsAvailableView}>
        <Text style={styles.healthCreditsAvailableBoldTextStyle}>
          Now pay only ₹{savingsAfterUsingHC}
        </Text>
        <Text style={styles.healthCreditsAvailableTextStyle}>
          {healthCredits} HC available in your account.{' '}
          <Text style={styles.healthCreditsAvailableBoldTextStyle}>Avail at checkout!</Text>
        </Text>
      </View>
    ) : null;
  };

  const renderTotalSavings = () => {
    return estimatedAmount ? (
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ paddingRight: 10, paddingTop: 2 }}>
          <Text style={styles.savingsText}>Total savings: </Text>
        </View>
        <View style={{ flex: 0.6, maxWidth: 100 }}>
          <TouchableOpacity
            onPress={() => {
              setShowCashbackCard(!showCashbackCard);
              setSavingsSelected(!savingsSelected);
            }}
          >
            <View style={{ alignSelf: 'center', flex: 0.7 }}>
              <Text style={[styles.savingsAmount, {}]}>₹{totalSavings?.toFixed(2)}</Text>
              <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.textUnderline}>
                ---------------------------------------------
              </Text>
            </View>
            {/* <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.textUnderline}>
              ------------------------------------
            </Text> */}
          </TouchableOpacity>
        </View>
      </View>
    ) : null;
  };

  const renderTotalSavingsAndHealthCredits = () => {
    return estimatedAmount ? (
      <View style={{ flexDirection: 'row' }}>
        {/* <View
          style={{
            // justifyContent: 'flex-end',
            position: 'absolute',
            flexDirection: 'row',
            // flexWrap: 'wrap',
            // flex: 1,
            // backgroundColor: '#00ff33',
            // width: '100%',
          }}
        > */}
        {/* </View> */}
        <View style={{ flexDirection: 'row' }}>
          {savingsSelected && renderCashbackDetailsCard(-155)}
          <View style={{ paddingRight: 8, paddingTop: 7 }}>
            <Text style={styles.savingsText}>Total</Text>
            <Text style={styles.savingsText}>savings: </Text>
          </View>
          <View style={{ backgroundColor: '#FFFFFF', width: 80, paddingTop: 12 }}>
            <TouchableOpacity
              onPress={() => {
                if (savingsSelected === false) {
                  if (HCSectionSelected === false) {
                    setShowCashbackCard(!showCashbackCard);
                    setSavingsSelected(true);
                  } else {
                    setShowCashbackCard(true);
                    setSavingsSelected(true);
                    setHCSectionSelected(false);
                  }
                } else {
                  setShowCashbackCard(false);
                  setSavingsSelected(false);
                }
              }}
            >
              <Text style={styles.savingsAmount}>₹{totalSavings?.toFixed(2)}</Text>
              <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.textUnderline}>
                -------------------
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.borderLine}></View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {!savingsSelected && renderCashbackDetailsCard(-107)}
          <View style={{ paddingLeft: 14, paddingRight: 10 }}>
            <OneApollo style={{ height: 43, width: 55 }} />
          </View>
          <View style={{ backgroundColor: '#FFFFFF', paddingTop: 5 }}>
            <TouchableOpacity
              onPress={() => {
                if (HCSectionSelected === false) {
                  if (savingsSelected === false) {
                    setShowCashbackCard(!showCashbackCard);
                    setHCSectionSelected(true);
                  } else {
                    setShowCashbackCard(true);
                    setHCSectionSelected(true);
                    setSavingsSelected(false);
                  }
                } else {
                  setShowCashbackCard(false);
                  setHCSectionSelected(false);
                }
              }}
            >
              <Text style={styles.savingsText}>Credits (HC) earned:</Text>
              <Text style={styles.hcEarned}>79HC</Text>
              <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.textUnderline}>
                ---------
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ) : null;
  };

  const renderCashbackDetailsCard = (topValue: number) => {
    return showCashbackCard ? (
      <View
        style={[
          {
            zIndex: 1,
            position: 'absolute',
            marginLeft: 5,
            marginRight: 5,
            top: topValue,
            flexWrap: 'wrap',
            flex: 1,
            // width: '80%',
            // backgroundColor: '#00ff33',
            // flexDirection: 'row',
          },
          savingsSelected ? {} : { marginLeft: -50 },
        ]}
      >
        <CashbackDetailsCard
          savingsClicked={savingsSelected ? savingsSelected : false}
          productDiscount={110}
          deliveryCharges={deliveryCharges || 0}
          couponDiscount={couponSavings || 25}
          circleCashback={54}
          couponCashback={25}
          triangleAlignmentValue={savingsSelected ? 70 : 135}
        />
      </View>
    ) : null;
  };

  return (
    <View>
      {/* {renderCashbackDetailsCard()} */}
      <View style={styles.card}>
        <View style={{ paddingHorizontal: 15 }}>
          {renderCartTotal()}
          {/* {renderProductDiscount()} */}
          {renderCouponDiscount()}
          {!!isCircleAddedToCart && renderCircleMembershipCharges()}
          {!!deliveryCharges && renderDeliveryCharges()}
          {renderPackagingCharges()}
          {renderSeparator()}
          {renderToPay()}
        </View>
        {renderPayUsingHealthCredits()}
        <View style={{ paddingHorizontal: 15 }}>
          {/* {renderCashbackDetailsCard()} */}
          {/* {renderTotalSavings()} */}
          {renderTotalSavingsAndHealthCredits()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    // paddingHorizontal: 15,
    paddingVertical: 12,
  },
  text: {
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 24,
    color: '#01475B',
  },
  discount: {
    color: '#00B38E',
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  free: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 24,
    color: '#00B38E',
  },
  separator: {
    borderWidth: 0.5,
    borderColor: '#02475B',
    opacity: 0.2,
    marginTop: 4,
    marginBottom: 6,
  },
  toPay: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    fontWeight: '600',
    lineHeight: 24,
    color: '#01475B',
  },
  circleMessage: {
    ...theme.viewStyles.text('L', 12, '#02475B', 1, 17),
  },
  healthCreditsAvailableView: {
    backgroundColor: 'rgba(0, 135, 186, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginVertical: 12,
  },
  healthCreditsAvailableTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    // fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
    color: theme.colors.LIGHT_BLUE,
  },
  healthCreditsAvailableBoldTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
    color: theme.colors.LIGHT_BLUE,
  },
  savingsText: {
    ...theme.fonts.IBMPlexSansRegular(11),
    fontWeight: '500',
    lineHeight: 16,
    color: theme.colors.SHADE_OF_GRAY,
  },
  savingsAmount: {
    ...theme.fonts.IBMPlexSansRegular(16),
    fontWeight: '600',
    lineHeight: 21,
    color: theme.colors.PACIFIC_BLUE,
    // textDecorationStyle: 'dashed',
    // textDecorationLine: 'underline',
    // textDecorationColor: theme.colors.PACIFIC_BLUE,
    // textAlign: 'center',
  },
  hcEarned: {
    ...theme.fonts.IBMPlexSansRegular(13),
    fontWeight: '600',
    lineHeight: 17,
    color: theme.colors.PACIFIC_BLUE,
  },
  borderLine: {
    borderRightWidth: 1,
    borderColor: theme.colors.LIGHT_BLUE,
    opacity: 0.5,
    paddingHorizontal: 10,
  },
  textUnderline: {
    color: theme.colors.LIGHT_BLUE,
    top: -7,
    // borderBottomColor: '#FFFFFF',
    // borderStyle: 'dashed',
    // borderWidth: 1.25,
    opacity: 0.2,
    // height: 5,
  },
});
