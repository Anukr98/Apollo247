import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Confetti } from '../../ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface CouponDiscountCashbackImageProps {
  setShowCouponImage: (showCouponImage: boolean) => void;
}

export const CouponDiscountCashbackImage: React.FC<CouponDiscountCashbackImageProps> = (props) => {
  const { setShowCouponImage } = props;
  const { serverCartAmount, cartCoupon } = useShoppingCart();
  const couponCashBack = serverCartAmount?.couponCashBack || 0;
  const couponSavings = serverCartAmount?.couponSavings || 0;
  const bothDiscountAndCashbackAvailable = couponCashBack && couponSavings ? true : false;
  const eitherDiscountAndCashbackAvailable = couponCashBack || couponSavings ? true : false;
  console.log(bothDiscountAndCashbackAvailable, eitherDiscountAndCashbackAvailable);
  console.log('coupon.........', serverCartAmount);

  const renderDiscountCashback = () => {
    return (
      <View style={styles.container}>
        {/* <Confetti style={styles.confetti} /> */}
        <View style={[styles.couponContainer]}>
          {/* <Confetti style={styles.confetti} /> */}
          <ImageBackground
            // source={require('@aph/mobile-patients/src/components/ui/icons/Discount-Cashback.webp')}
            source={
              bothDiscountAndCashbackAvailable
                ? require('@aph/mobile-patients/src/components/ui/icons/CouponDiscountCashback.webp')
                : require('@aph/mobile-patients/src/components/ui/icons/CashbackOrDiscount.webp')
            }
            style={{ width: 191, height: bothDiscountAndCashbackAvailable ? 311 : 275 }}
          >
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View style={styles.textUnderline}>
                <Text style={styles.couponText}>{cartCoupon?.coupon}</Text>
                <Text style={styles.couponText}>Applied!</Text>
              </View>
              {couponSavings ? (
                <View style={{ marginHorizontal: 18 }}>
                  <Text style={styles.discountAmount}>₹{couponSavings} OFF</Text>
                  {/* <Text style={styles.discountAmount}>OFF</Text> */}
                </View>
              ) : null}
              {couponCashBack ? (
                <View style={{ width: 160, marginLeft: 18 }}>
                  <Text style={styles.hcAmount}>{couponCashBack} HC</Text>
                  <Text style={styles.cashbackText}>cashback earned</Text>
                </View>
              ) : null}
              <View
                style={{
                  paddingLeft: 16,
                  marginVertical: 10,
                  width: 160,
                }}
              >
                {couponCashBack ? (
                  <Text style={styles.hcText}>
                    HCs will be credited after order delivery. 1HC = ₹1
                  </Text>
                ) : (
                  <Text style={styles.hcText}>Glad we could help you save :)</Text>
                )}
              </View>
            </View>
          </ImageBackground>
          {/* <Confetti style={styles.confetti} /> */}
        </View>
      </View>
    );
  };
  // return (
  //   <TouchableOpacity
  //     onPress={() => {
  //       setShowCouponImage(false);
  //     }}
  //   >
  //     {renderDiscountCashback()}
  //   </TouchableOpacity>
  // );
  return renderDiscountCashback();
};

const styles = StyleSheet.create({
  container: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
  },
  couponContainer: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  confetti: {
    // height: 400,
    // width: 200,
  },
  couponText: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 16,
    fontWeight: '500',
    color: theme.colors.SHADE_OF_CYAN,
    paddingBottom: 3,
  },
  textUnderline: {
    borderBottomWidth: 2.5,
    borderColor: theme.colors.SHADE_OF_CYAN,
    marginTop: 23,
    marginLeft: 18,
    alignSelf: 'baseline',
    width: 100,
  },
  discountAmount: {
    ...theme.fonts.IBMPlexSansBold(42),
    lineHeight: 52,
    fontWeight: '500',
    color: theme.colors.HEX_WHITE,
  },
  hcAmount: {
    ...theme.fonts.IBMPlexSansBold(24),
    lineHeight: 24,
    fontWeight: '600',
    color: theme.colors.HEX_WHITE,
  },
  cashbackText: {
    ...theme.fonts.IBMPlexSansBold(12),
    lineHeight: 16,
    fontWeight: '500',
    color: theme.colors.HEX_WHITE,
  },
  hcText: {
    ...theme.fonts.IBMPlexSansBold(11),
    lineHeight: 13,
    fontWeight: '600',
    color: theme.colors.TURQUOISE_LIGHT_BLUE,
  },
});
