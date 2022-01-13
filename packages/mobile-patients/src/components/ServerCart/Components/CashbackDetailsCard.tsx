import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface CashbackDetailsProps {
  savingsClicked: boolean;
  productDiscount?: number;
  deliveryCharges?: number;
  couponDiscount?: number;
  circleCashback?: number;
  couponCashback?: number;
  triangleAlignmentValue: number;
}

export const CashbackDetailsCard: React.FC<CashbackDetailsProps> = (props) => {
  const {
    savingsClicked,
    // productDiscount,
    // deliveryCharges,
    // couponDiscount,
    // circleCashback,
    couponCashback,
    triangleAlignmentValue,
  } = props;

  const { serverCartAmount, isCircleCart } = useShoppingCart();

  const cartSavings = serverCartAmount?.cartSavings || 0;
  const couponSavings = serverCartAmount?.couponSavings || 0;
  const deliveryCharges = serverCartAmount?.deliveryCharges || 0;
  const isDeliveryFree = serverCartAmount?.isDeliveryFree || 0;
  const totalCashBack = serverCartAmount?.totalCashBack || 0;
  const circleMembershipCashback = isCircleCart
    ? serverCartAmount?.circleSavings?.membershipCashBack || 0
    : 0;
  const circleDeliverySavings = isCircleCart
    ? serverCartAmount?.circleSavings?.circleDelivery || 0
    : 0;
  const deliverySavings = isDeliveryFree || circleDeliverySavings > 0 ? deliveryCharges : 0;
  const totalSavings =
    cartSavings + couponSavings + deliverySavings + (isCircleCart ? totalCashBack : 0);
  const totalCouldSaveByCircle = deliveryCharges + totalCashBack + cartSavings;

  const inStyles = {
    triangle: {
      width: 15,
      height: 15,
      position: 'absolute',
      left: triangleAlignmentValue || 0,
      bottom: -14,
      borderLeftWidth: 12,
      borderLeftColor: theme.colors.CLEAR,
      borderRightWidth: 12,
      borderRightColor: theme.colors.CLEAR,
      borderBottomWidth: 12,
      borderBottomColor: theme.colors.SHADE_OF_GRAY,
      transform: [{ rotate: '180deg' }],
    },
    triangle2: {
      width: 15,
      height: 15,
      position: 'absolute',
      bottom: -14,
      left: triangleAlignmentValue + 1 || 0,
      borderLeftWidth: 11,
      borderLeftColor: theme.colors.CLEAR,
      borderRightWidth: 11,
      borderRightColor: theme.colors.CLEAR,
      borderBottomWidth: 11,
      borderBottomColor: theme.colors.HEX_WHITE,
      transform: [{ rotate: '180deg' }],
    },
  };

  const renderHealthCreditsText = () => {
    return (
      <View>
        <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.textUnderline}>
          ---------------------------------------------------------------------------------------------------------------------------------------
        </Text>
        <View style={{ paddingBottom: 8, paddingLeft: 16, flexWrap: 'wrap', flex: 1 }}>
          <Text style={styles.healthCreditText}>HCs will be credited after order delivery. </Text>
        </View>
      </View>
    );
  };

  const renderDiscountCashbackValue = (heading: string, value: number, circleContent?: boolean) => {
    return (
      <View style={styles.individualItem}>
        {circleContent ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
            <Text style={[styles.itemText, styles.circleText]}>Circle </Text>
            <Text style={styles.itemText}>{heading}</Text>
          </View>
        ) : (
          <Text style={styles.itemText}>{heading}</Text>
        )}
        <Text style={circleContent ? [styles.itemText, styles.circleText] : styles.itemText}>
          ₹{value}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 16 }}>
        {savingsClicked && cartSavings
          ? renderDiscountCashbackValue('Product Discount', cartSavings)
          : null}
        {savingsClicked && deliveryCharges && isDeliveryFree
          ? renderDiscountCashbackValue('Delivery Charges', deliveryCharges)
          : null}
        {savingsClicked && couponSavings
          ? renderDiscountCashbackValue('Coupon Discount', couponSavings)
          : null}
        {circleMembershipCashback
          ? renderDiscountCashbackValue('Membership Cashback (HC)', circleMembershipCashback, true)
          : null}
        {couponCashback
          ? renderDiscountCashbackValue('Coupon Cashback (HC)', couponCashback)
          : null}
      </View>
      {renderHealthCreditsText()}
      {/*show this below view if render health credits text is not supposed to be shown */}
      {/* <View style={{ paddingBottom: 8 }}></View> */}
      {/* <View style={{ margin: 2, flexWrap: 'wrap', flex: 1, flexDirection: 'row' }}>
        <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.textUnderline}>
          ---------------------------------------------------------------------------------------------------------------------------------------
        </Text>
        <View
          style={{
            paddingBottom: 8,
            paddingLeft: 16,
            // flexWrap: 'wrap',
            // flex: 1,
            backgroundColor: theme.colors.CLEAR,
            // height: 30,
            flexDirection: 'row',
            // justifyContent: 'center',
          }}
        >
          <Text style={[styles.healthCreditText, {}]}>
            HCs will be credited after order delivery.{' '}
          </Text>
        </View>
      </View> */}
      <View style={inStyles.triangle}></View>
      <View style={inStyles.triangle2}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: theme.colors.SHADE_OF_GRAY,
    paddingTop: 14,
    width: 250,
    marginBottom: 7,
    // backgroundColor: '#00ff33',
    backgroundColor: theme.colors.HEX_WHITE,
  },
  triangle: {
    width: 15,
    height: 15,
    position: 'absolute',
    left: 70,
    bottom: -14,
    borderLeftWidth: 12,
    borderLeftColor: theme.colors.CLEAR,
    borderRightWidth: 12,
    borderRightColor: theme.colors.CLEAR,
    borderBottomWidth: 12,
    borderBottomColor: theme.colors.SHADE_OF_GRAY,
    transform: [{ rotate: '180deg' }],
  },
  triangle2: {
    width: 15,
    height: 15,
    position: 'absolute',
    bottom: -14,
    left: 71,
    borderLeftWidth: 11,
    borderLeftColor: theme.colors.CLEAR,
    borderRightWidth: 11,
    borderRightColor: theme.colors.CLEAR,
    borderBottomWidth: 11,
    borderBottomColor: theme.colors.HEX_WHITE,
    transform: [{ rotate: '180deg' }],
  },
  individualItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  itemText: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: theme.colors.LIGHT_BLUE,
  },
  circleText: {
    color: theme.colors.APP_YELLOW,
  },
  textUnderline: {
    color: theme.colors.SHADE_OF_GRAY,
    opacity: 0.3,
  },
  healthCreditText: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: theme.colors.SHADE_OF_GRAY,
  },
});
