import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OneApolloGold, HdfcGoldMedal, OneApolloPlatinum, HdfcPlatinumMedal, OneApolloSilver, HdfcSilverMedal } from '../ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
  membershipBanner: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  bannerContent: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  medalStyle: {
    width: 40,
    height: 50,
    position: 'absolute',
    right: 40,
  }
});

export interface SubscriptionBannerProps {
  membershipType: string;
  benefitsWorth: string;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = (props) => {
  const isSilverMembership = props.membershipType === 'SILVER+ PLAN';
  const isGoldMembership = props.membershipType === 'GOLD+ PLAN';
  const isPlatinumMembership = props.membershipType === 'PLATINUM+ PLAN';
  return (
    <View style={{paddingHorizontal: 20, marginVertical: 10,}}>
      <View>
        {isSilverMembership && <OneApolloSilver style={styles.membershipBanner}/>}
        {isGoldMembership && <OneApolloGold style={styles.membershipBanner}/>}
        {isPlatinumMembership && <OneApolloPlatinum style={styles.membershipBanner}/>}
        <View style={styles.bannerContent}>
          {isSilverMembership && <HdfcSilverMedal style={styles.medalStyle} />}
          {isGoldMembership && <HdfcGoldMedal style={styles.medalStyle} />}
          {isPlatinumMembership && <HdfcPlatinumMedal style={styles.medalStyle} />}
          <Text style={{
            ...theme.viewStyles.text('B', 20, '#02475B', 1, 20, 0.35),
            marginBottom: 7,
          }}>
            {props.membershipType}
          </Text>
          <Text style={{
            ...theme.viewStyles.text('R', 15, '#02475B', 1, 20, 0.90),
            marginBottom: 15,
          }}>
            Availing Benefits worth
          </Text>
          <Text style={{
            ...theme.viewStyles.text('M', 22, '#02475B', 1, 22, 0.35),
            marginBottom: 20,
          }}>
            {props.benefitsWorth}
          </Text>
          <Text style={theme.viewStyles.text('R', 13, '#02475B', 1, 20, 0.90)}>
            {`A host of benefits await you with our ${props.membershipType} curated for HDFC customers`}
          </Text>
        </View>
      </View>
    </View>
  );
};
