import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Hdfc_values, Circle } from '@aph/mobile-patients/src/strings/strings.json';
import {
  HdfcBannerSilver,
  HdfcBannerGold,
  HdfcBannerPlatinum,
  CircleMembershipBanner,
} from '@aph/mobile-patients/src/components/ui/Icons';

export interface MembershipBannerProps {
  membershipType: string;
}

export const MembershipBanner: React.FC<MembershipBannerProps> = (props) => {
  const { membershipType } = props;
  const { SILVER_PLAN, GOLD_PLAN, PLATINUM_PLAN } = Hdfc_values;

  const getBanner = () => {
    switch (membershipType) {
      case SILVER_PLAN:
        return <HdfcBannerSilver style={styles.hdfcBannerStyle} />;
      case GOLD_PLAN:
        return <HdfcBannerGold style={styles.hdfcBannerStyle} />;
      case PLATINUM_PLAN:
        return <HdfcBannerPlatinum style={styles.hdfcBannerStyle} />;
      case Circle.planName:
        return <CircleMembershipBanner style={styles.circleBannerStyle} />;
      default:
        return <></>;
    }
  };

  return <View>{getBanner()}</View>;
};

const styles = StyleSheet.create({
  hdfcBannerStyle: {
    width: Dimensions.get('window').width,
    height: 200,
    resizeMode: 'contain',
  },
  circleBannerStyle: {
    width: '100%',
    height: 190,
    resizeMode: 'contain',
  },
});
