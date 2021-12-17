import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { OneApollo } from '@aph/mobile-patients/src/components/ui/Icons';
import { CashbackDetailsCard } from '@aph/mobile-patients/src/components/ServerCart/Components/CashbackDetailsCard';
import { Overlay } from 'react-native-elements';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { CouponDiscountCashbackImage } from '@aph/mobile-patients/src/components/ServerCart/Components/CouponDiscountCashbackImage';

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
  const couponCashBack = serverCartAmount?.couponCashBack;
  console.log('cashback coupon------', couponCashBack);
  const packagingCharges = serverCartAmount?.packagingCharges;
  const circleDeliverySavings = isCircleCart
    ? serverCartAmount?.circleSavings?.circleDelivery || 0
    : 0;
  const circleMembershipCashback = isCircleCart
    ? serverCartAmount?.circleSavings?.membershipCashBack || 0
    : 0;
  const deliverySavings = isDeliveryFree || circleDeliverySavings > 0 ? deliveryCharges : 0;
  const totalSavings =
    cartSavings + couponSavings + deliverySavings + (isCircleCart ? totalCashBack : 0) || 0;
  // const isHealthCreditsAvailable = healthCredits ? true : false;
  const isHealthCreditsAvailable = true;
  const savingsAfterUsingHC =
    isHealthCreditsAvailable && estimatedAmount
      ? estimatedAmount - healthCredits > 0
        ? estimatedAmount - healthCredits
        : 0
      : 0;

  const [showCashbackCard, setShowCashbackCard] = useState<boolean>(false);
  const [savingsSelected, setSavingsSelected] = useState<boolean>(false);
  const [HCSectionSelected, setHCSectionSelected] = useState<boolean>(false);

  const savingsTextRef = useRef<Text>(null);
  const savingsText1Ref = useRef<Text>(null);
  const hcTextRef = useRef<Text>(null);
  const [savingsTextWidth, setSavingsTextWidth] = useState<number>(0);
  const [savingsText1Width, setSavingsText1Width] = useState<number>(0);
  const [hcTextWidth, setHCTextWidth] = useState<number>(0);
  // console.log(savingsTextWidth, hcTextWidth);

  const renderCartTotal = () => {
    const afterSavingsCartTotal = cartSavings && cartTotal ? cartTotal - cartSavings : 0;
    // const afterSavingsCartTotal = 0;
    return cartTotal ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Cart total</Text>
        {afterSavingsCartTotal ? (
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.strikedThroughText}>₹{cartTotal?.toFixed(2)}</Text>
            <Text style={styles.text}>₹{afterSavingsCartTotal?.toFixed(2)}</Text>
          </View>
        ) : (
          <Text style={styles.text}>₹{cartTotal?.toFixed(2)}</Text>
        )}
        {/* <Text style={styles.text}>₹{cartTotal?.toFixed(2)}</Text> */}
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
          <Text style={styles.text}>₹{deliveryCharges?.toFixed(2)}</Text>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.free}>Free</Text>
            <Text style={{ ...styles.text, textDecorationLine: 'line-through', marginLeft: 5 }}>
              ₹{deliveryCharges?.toFixed(2)}
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
          Now pay only ₹{savingsAfterUsingHC.toFixed(2)}
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 14,
          // marginBottom: -7,
          // backgroundColor: '#00ff33',
        }}
      >
        <View style={{ paddingRight: 10, paddingTop: 2 }}>
          <Text style={styles.savingsText}>Total savings: </Text>
        </View>
        {/* <View style={{}}> */}
        <TouchableOpacity
          onPress={() => {
            setShowCashbackCard(!showCashbackCard);
            setSavingsSelected(!savingsSelected);
          }}
        >
          <View
            style={{
              alignSelf: 'center',
            }}
          >
            <Text
              style={[styles.savingsAmount, {}]}
              ref={savingsText1Ref}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                // console.log('layout of savings', layout);
                setSavingsText1Width(layout.width);
              }}
            >
              ₹{totalSavings?.toFixed(2)}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode={'clip'}
              style={[styles.textUnderline, { width: savingsText1Width }]}
            >
              ---------------------------------------------
            </Text>
          </View>
          {/* <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.textUnderline}>
              ------------------------------------
            </Text> */}
        </TouchableOpacity>
        {/* </View> */}
      </View>
    ) : null;
  };

  const renderTotalSavingsAndHealthCredits = () => {
    return estimatedAmount ? (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#00ff99',
          marginTop: 14,
          alignSelf: 'baseline',
          paddingBottom: -5,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'baseline',
            // backgroundColor: '#00ff33',
          }}
        >
          {savingsSelected && renderCashbackDetailsCard(-155)}
          <View
            style={{
              paddingRight: 5,
              paddingTop: 7,
            }}
          >
            <Text style={styles.savingsText}>Total</Text>
            <Text style={styles.savingsText}>savings: </Text>
          </View>
          <View
            style={{
              paddingTop: 12,
            }}
          >
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
                  // console.log('layout of savings', layout);
                  setSavingsTextWidth(layout.width);
                }}
              >
                ₹{totalSavings?.toFixed(2)}
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
          {/* {console.log('savingsTextWidth', savingsTextWidth, hcTextWidth)} */}
          <View style={styles.borderLine}></View>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: '#00ff33', alignSelf: 'center' }}>
          {!savingsSelected && renderCashbackDetailsCard(-107)}
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
                // style={{ alignItems: 'flex-start' }}
              >
                <Text
                  style={styles.hcEarned}
                  ref={hcTextRef}
                  onLayout={(event) => {
                    const layout = event.nativeEvent.layout;
                    // console.log('layout of HC', layout);
                    setHCTextWidth(layout.width);
                  }}
                >
                  79HC
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
          savingsSelected ? {} : { marginLeft: -70 },
        ]}
      >
        <CashbackDetailsCard
          savingsClicked={savingsSelected ? savingsSelected : false}
          productDiscount={110}
          deliveryCharges={deliveryCharges || 0}
          couponDiscount={couponSavings || 25}
          circleCashback={54}
          couponCashback={couponCashBack}
          triangleAlignmentValue={savingsSelected ? 70 : 135}
        />
      </View>
    ) : null;
  };

  return (
    <View>
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
          {renderTotalSavings()}
          {renderTotalSavingsAndHealthCredits()}
        </View>
      </View>
    </View>
  );
  // return (
  //   <View style={{ height: 1000 }}>
  //     <View style={styles.card}>
  //       <View style={{ position: 'absolute', zIndex: 5 }}>
  //         <CouponDiscountCashbackImage />
  //       </View>
  //     </View>
  //   </View>
  // );
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
    // marginVertical: 12,
    marginTop: 12,
  },
  healthCreditsAvailableTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    // fontWeight: '600',
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
    // textDecorationStyle: 'dashed',
    // textDecorationLine: 'underline',
    // textDecorationColor: theme.colors.PACIFIC_BLUE,
    // textAlign: 'center',
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
    // borderBottomColor: '#FFFFFF',
    // borderStyle: 'dashed',
    // borderWidth: 1.25,
    opacity: 0.2,
    // height: 5,
  },
});
