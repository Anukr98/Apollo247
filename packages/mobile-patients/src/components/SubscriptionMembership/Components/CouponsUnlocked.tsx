import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Hdfc_values } from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DownOrange, UpOrange } from '@aph/mobile-patients/src/components/ui/Icons';

export interface CouponsUnlockedProps {
  coupons: any;
}

export const CouponsUnlocked: React.FC<CouponsUnlockedProps> = (props) => {
  const { coupons } = props;
  const [isActiveCouponVisible, setIsActiveCouponVisible] = useState<boolean>(true);

  const renderCouponInfo = (name?: string, description?: string) => {
    return (
      <View
        style={{
          marginTop: 15,
        }}
      >
        <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 25, 0.35)}>{name}</Text>
        <Text style={theme.viewStyles.text('R', 12, '#02475B', 1, 17, 0.35)}>{description}</Text>
      </View>
    )
  };

  return (
    <View style={styles.cardStyle}>
      <TouchableOpacity
        onPress={() => {
          setIsActiveCouponVisible(!isActiveCouponVisible);
        }}
        style={styles.sectionsHeading}
      >
        <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0.35)}>
          Here’s what you have unlocked !
        </Text>
        {isActiveCouponVisible ? (
          <DownOrange style={styles.arrowStyle} />
        ) : (
          <UpOrange style={styles.arrowStyle} />
        )}
      </TouchableOpacity>
      {isActiveCouponVisible && (
        <View
          style={{
            marginTop: 15,
          }}
        >
          <Text style={styles.eligibleText}>Use the coupon codes to avail the benefits</Text>
          {coupons.map((value) => {
            return renderCouponInfo(value.coupon, value.message);
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 10,
    marginVertical: 4,
    padding: 16,
  },
  sectionsHeading: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrowStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  eligibleText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 17, 0.35),
    width: '90%',
  },
});
