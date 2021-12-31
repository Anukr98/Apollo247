import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { OneApollo } from '@aph/mobile-patients/src/components/ui/Icons';
import { CashbackDetailsCard } from '@aph/mobile-patients/src/components/ServerCart/Components/CashbackDetailsCard';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface CartTotalSectionProps {
  showTotalSavingsAndHCSection?: boolean;
}

export const CartTotalSection: React.FC<CartTotalSectionProps> = (props) => {
  // total savings and credits earned are shown only on cart page and not on review order page
  const { showTotalSavingsAndHCSection } = props;
  const { cartSubscriptionDetails, serverCartAmount, isCircleCart } = useShoppingCart();
  const { healthCredits } = useAppCommonData();
  const isCircleAddedToCart =
    !!cartSubscriptionDetails?.currentSellingPrice &&
    !!cartSubscriptionDetails?.subscriptionApplied;
  const cartTotal = serverCartAmount?.cartTotal || 0;
  const cartSavings = serverCartAmount?.cartSavings || 0;
  const couponSavings = serverCartAmount?.couponSavings || 0;
  const deliveryCharges = serverCartAmount?.deliveryCharges || 0;
  const estimatedAmount = serverCartAmount?.estimatedAmount || 0;
  const isDeliveryFree = serverCartAmount?.isDeliveryFree;
  const totalCashBack = serverCartAmount?.totalCashBack || 0;
  const couponCashBack = serverCartAmount?.couponCashBack || 0;
  const packagingCharges = serverCartAmount?.packagingCharges || 0;
  const circleDeliverySavings = isCircleCart
    ? serverCartAmount?.circleSavings?.circleDelivery || 0
    : 0;
  const circleMembershipCashback = cartSubscriptionDetails?.subscriptionApplied
    ? serverCartAmount?.circleSavings?.membershipCashBack || 0
    : 0;
  const deliverySavings = isDeliveryFree || circleDeliverySavings > 0 ? deliveryCharges : 0;
  const totalSavings =
    cartSavings + couponSavings + deliverySavings + couponCashBack + circleMembershipCashback;
  const isHealthCreditsAvailable = healthCredits ? true : false;
  const savingsAfterUsingHC =
    isHealthCreditsAvailable && estimatedAmount
      ? estimatedAmount - healthCredits > 0
        ? estimatedAmount - healthCredits
        : 0
      : 0;

  const [showCashbackCard, setShowCashbackCard] = useState<boolean>(false);
  const [savingsSelected, setSavingsSelected] = useState<boolean>(false);
  // separate onlySavingsSelected variable created for UI purpose - alignment of triangle in cashback details card
  // when savings section is shown and health credits earned is not shown
  const [onlySavingsSelected, setOnlySavingsSelected] = useState<boolean>(false);
  const [HCSectionSelected, setHCSectionSelected] = useState<boolean>(false);

  const savingsTextRef = useRef<Text>(null);
  const onlySavingsTextRef = useRef<Text>(null);
  const hcTextRef = useRef<Text>(null);
  const [savingsTextWidth, setSavingsTextWidth] = useState<number>(0);
  const [onlySavingsTextWidth, setOnlySavingsTextWidth] = useState<number>(0);
  const [hcTextWidth, setHCTextWidth] = useState<number>(0);

  const renderCartTotal = () => {
    const afterSavingsCartTotal = cartSavings && cartTotal ? cartTotal - cartSavings : 0;
    return cartTotal ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Cart total</Text>
        {afterSavingsCartTotal ? (
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.strikedThroughText}>
              {string.common.Rs}
              {cartTotal?.toFixed(2)}
            </Text>
            <Text style={styles.text}>
              {string.common.Rs}
              {afterSavingsCartTotal?.toFixed(2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.text}>
            {string.common.Rs}
            {cartTotal?.toFixed(2)}
          </Text>
        )}
      </View>
    ) : null;
  };

  const renderCouponDiscount = () => {
    return couponSavings ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Coupon savings</Text>
        <Text style={styles.discount}>
          -{string.common.Rs}
          {couponSavings?.toFixed(2)}
        </Text>
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
          <Text style={styles.text}>
            {string.common.Rs}
            {deliveryCharges?.toFixed(2)}
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.free}>Free</Text>
            <Text style={{ ...styles.text, textDecorationLine: 'line-through', marginLeft: 5 }}>
              {string.common.Rs}
              {deliveryCharges?.toFixed(2)}
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
        <Text style={styles.text}>
          +{string.common.Rs}
          {packagingCharges?.toFixed(2)}
        </Text>
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
        <Text style={styles.toPay}>
          {string.common.Rs}
          {estimatedAmount?.toFixed(2)}
        </Text>
      </View>
    ) : null;
  };

  const renderCircleMembershipCharges = () =>
    isCircleAddedToCart ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Circle Membership</Text>
        <Text style={styles.text}>
          {string.common.Rs}
          {cartSubscriptionDetails?.currentSellingPrice?.toFixed(2)}
        </Text>
      </View>
    ) : null;

  const renderPayUsingHealthCredits = () => {
    return isHealthCreditsAvailable && savingsAfterUsingHC ? (
      <View style={styles.healthCreditsAvailableView}>
        <Text style={styles.healthCreditsAvailableBoldTextStyle}>
          Now pay only {string.common.Rs}
          {savingsAfterUsingHC.toFixed(2)}
        </Text>
        <Text style={styles.healthCreditsAvailableTextStyle}>
          {healthCredits} HC available in your account.{' '}
          <Text style={styles.healthCreditsAvailableBoldTextStyle}>Avail at checkout!</Text>
        </Text>
      </View>
    ) : null;
  };

  const renderTotalSavings = () => {
    return estimatedAmount >= 0 ? (
      <View style={styles.onlySavingsContainer}>
        <View style={{ paddingRight: 10, paddingTop: 2 }}>
          <Text style={styles.savingsText}>Total savings: </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setShowCashbackCard(!showCashbackCard);
            setOnlySavingsSelected(!onlySavingsSelected);
          }}
        >
          <View style={{ alignSelf: 'center' }}>
            <Text
              style={styles.savingsAmount}
              ref={onlySavingsTextRef}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                setOnlySavingsTextWidth(layout.width);
              }}
            >
              {string.common.Rs}
              {totalSavings?.toFixed(2)}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode={'clip'}
              style={[styles.textUnderline, { width: onlySavingsTextWidth }]}
            >
              ---------------------------------------------
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    ) : null;
  };

  const renderTotalSavingsAndHealthCredits = () => {
    const totalCashbackToBeDisplayed = circleMembershipCashback + couponCashBack;
    return estimatedAmount >= 0 ? (
      <View style={styles.savingsAndCreditsContainer}>
        <View style={{ flexDirection: 'row', alignSelf: 'baseline' }}>
          <View style={{ paddingRight: 5, paddingTop: 7 }}>
            <Text style={styles.savingsText}>Total</Text>
            <Text style={styles.savingsText}>savings: </Text>
          </View>
          <View style={{ paddingTop: 12 }}>
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
              <Text
                style={styles.savingsAmount}
                ref={savingsTextRef}
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  setSavingsTextWidth(layout.width);
                }}
              >
                {string.common.Rs}
                {totalSavings?.toFixed(2)}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode={'clip'}
                style={[styles.textUnderline, { width: savingsTextWidth }]}
              >
                --------------------------------------------------------
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.borderLine}></View>
        </View>
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <View style={{ paddingLeft: 8, paddingRight: 8 }}>
            <OneApollo style={{ height: 43, width: 55 }} />
          </View>
          <View style={{ paddingTop: 5 }}>
            <View style={{ marginBottom: 2 }}>
              <Text style={styles.savingsText}>Credits (HC) earned:</Text>
            </View>
            <View style={{ alignItems: 'baseline' }}>
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
                <Text
                  style={styles.hcEarned}
                  ref={hcTextRef}
                  onLayout={(event) => {
                    const layout = event.nativeEvent.layout;
                    setHCTextWidth(layout.width);
                  }}
                >
                  {totalCashbackToBeDisplayed.toFixed(2)} HC
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode={'clip'}
                  style={[styles.textUnderline, { width: hcTextWidth }]}
                >
                  ----------------------------------
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    ) : null;
  };

  const renderCashbackDetailsCard = (topValue?: number) => {
    return showCashbackCard ? (
      <View
        style={[
          { zIndex: 1, position: 'absolute' },
          savingsSelected ? { marginLeft: 10, bottom: 50 } : { marginLeft: 70, bottom: 45 },
        ]}
      >
        {(savingsSelected || onlySavingsSelected) &&
        (totalCashBack || couponSavings || cartSavings || isDeliveryFree) ? (
          <CashbackDetailsCard
            savingsClicked={savingsSelected || onlySavingsSelected ? true : false}
            triangleAlignmentValue={savingsSelected ? 70 : 135}
          />
        ) : couponCashBack || circleMembershipCashback ? (
          <CashbackDetailsCard
            savingsClicked={savingsSelected ? true : false}
            triangleAlignmentValue={savingsSelected ? 70 : 135}
          />
        ) : null}
      </View>
    ) : null;
  };

  return (
    <View>
      <View style={styles.card}>
        <View style={{ paddingHorizontal: 15 }}>
          {renderCartTotal()}
          {renderCouponDiscount()}
          {!!isCircleAddedToCart && renderCircleMembershipCharges()}
          {!!deliveryCharges && renderDeliveryCharges()}
          {renderPackagingCharges()}
          {renderSeparator()}
          {renderToPay()}
        </View>
        {showTotalSavingsAndHCSection && renderPayUsingHealthCredits()}
        {showTotalSavingsAndHCSection && (
          <View style={{ paddingHorizontal: 15 }}>
            {renderCashbackDetailsCard()}
            {couponCashBack || circleMembershipCashback
              ? renderTotalSavingsAndHealthCredits()
              : renderTotalSavings()}
          </View>
        )}
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
  strikedThroughText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    fontWeight: '500',
    lineHeight: 24,
    color: theme.colors.BORDER_BOTTOM_COLOR,
    opacity: 0.7,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  healthCreditsAvailableView: {
    backgroundColor: 'rgba(0, 135, 186, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 12,
  },
  healthCreditsAvailableTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 18,
    textAlign: 'center',
    color: theme.colors.LIGHT_BLUE,
  },
  healthCreditsAvailableBoldTextStyle: {
    ...theme.fonts.IBMPlexSansBold(14),
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
    ...theme.fonts.IBMPlexSansBold(16),
    fontWeight: '600',
    lineHeight: 21,
    color: theme.colors.PACIFIC_BLUE,
  },
  hcEarned: {
    ...theme.fonts.IBMPlexSansBold(13),
    fontWeight: '600',
    lineHeight: 17,
    color: theme.colors.PACIFIC_BLUE,
  },
  borderLine: {
    borderRightWidth: 1,
    borderColor: theme.colors.LIGHT_BLUE,
    opacity: 0.5,
    paddingHorizontal: 4,
  },
  textUnderline: {
    color: theme.colors.LIGHT_BLUE,
    top: -7,
    opacity: 0.2,
  },
  savingsAndCreditsContainer: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: -14,
    alignSelf: 'baseline',
    justifyContent: 'center',
  },
  onlySavingsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
});
