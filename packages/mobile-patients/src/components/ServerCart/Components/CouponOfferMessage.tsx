import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

export interface CouponOfferMessageProps {
  movedFrom?: 'subscription' | 'pharmacy' | 'consultation';
}

export const CouponOfferMessage: React.FC<CouponOfferMessageProps> = (props) => {
  const { offersList } = useAppCommonData();
  const { movedFrom } = props;
  const [offerCouponName, setOfferCouponName] = useState<string>('');
  const [offerCouponText, setOfferCouponText] = useState<string>('');

  useEffect(() => {
    getCouponOfferMessage();
  }, []);

  const getCouponOfferMessage = () => {
    if (offersList?.length) {
      const coupon = offersList?.find(
        (offer) => offer?.cta?.path?.vertical?.toLowerCase() == movedFrom
      );
      if (coupon?.coupon_code) setOfferCouponName(coupon?.coupon_code);
      if (coupon?.title?.text) setOfferCouponText(`to get ${coupon?.title?.text}`);
    }
  };

  const renderCouponOfferMessage = () => (
    <View style={styles.couponOfferContainer}>
      <Text style={styles.couponOfferText}>
        Apply <Text style={styles.couponOfferCoupon}>{offerCouponName}</Text> {offerCouponText}
      </Text>
    </View>
  );

  return !!offerCouponName ? renderCouponOfferMessage() : null;
};

const styles = StyleSheet.create({
  couponOfferContainer: {
    marginLeft: 10,
    marginTop: 7,
    backgroundColor: 'rgba(0, 179, 142, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  couponOfferText: theme.viewStyles.text('R', 12, '#02475B', 0.6, 20),
  couponOfferCoupon: theme.viewStyles.text('M', 12, '#02475B', 0.6, 20),
});
