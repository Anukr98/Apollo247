import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OneApolloGold, HdfcGoldMedal, OneApolloPlatinum, HdfcPlatinumMedal } from '../ui/Icons';
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
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = (props) => {
  const isGoldMembership = props.membershipType === 'gold';
  return (
    <View style={{paddingHorizontal: 20, marginVertical: 10,}}>
      <View>
        {
          isGoldMembership ? (
            <OneApolloGold style={styles.membershipBanner}/>
          ) : (
            <OneApolloPlatinum style={styles.membershipBanner}/>
          )
        }
        <View style={styles.bannerContent}>
          {
            isGoldMembership ? 
            <HdfcGoldMedal style={styles.medalStyle} /> :
            <HdfcPlatinumMedal style={styles.medalStyle} />
          }
          <Text style={{
            ...theme.viewStyles.text('B', 20, '#02475B', 1, 20, 0.35),
            marginBottom: 7,
          }}>
            {isGoldMembership ? 'GOLD+ PLAN' : 'PLATINUM+ PLAN'}
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
            Rs. 38K+
          </Text>
          <Text style={theme.viewStyles.text('R', 13, '#02475B', 1, 20, 0.90)}>
            {
              isGoldMembership ? 
              'A host of benefits await you with our Gold+ Plan curated for HDFC customers' :
              'A host of benefits await you with our Platinum+ Plan curated for HDFC customers'
            }
          </Text>
        </View>
      </View>
    </View>
  );
};
