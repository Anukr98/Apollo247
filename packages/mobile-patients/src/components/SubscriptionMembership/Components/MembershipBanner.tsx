import React from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { Hdfc_values, Circle } from '@aph/mobile-patients/src/strings/strings.json';
import {
  HdfcBannerSilver,
  HdfcBannerGold,
  HdfcBannerPlatinum,
  CircleMembershipBanner,
  CircleLogoWhite,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface MembershipBannerProps {
  membershipType: string;
}

export const MembershipBanner: React.FC<MembershipBannerProps> = (props) => {
  const { membershipType } = props;
  const { SILVER_PLAN, GOLD_PLAN, PLATINUM_PLAN } = Hdfc_values;
  const { totalCircleSavings } = useAppCommonData();
  const circleStaticMonthlySavings = AppConfig.Configuration.CIRCLE_STATIC_MONTHLY_SAVINGS;

  const renderCircleBanner = () => {
    const circleSavings = totalCircleSavings?.totalSavings + totalCircleSavings?.callsUsed;
    return (
      <View>
        <CircleMembershipBanner resizeMode="cover" style={styles.circleBannerStyle} />
        {circleSavings == 0 && (
          <View style={styles.circleSaving}>
            <View style={{ flexDirection: 'row' }}>
              <CircleLogoWhite style={styles.circleLogo} />
              <Text style={styles.logoText}>members</Text>
            </View>
            <Text style={theme.viewStyles.text('M', 12, '#02475B', 1, 15, 0.35)}>
              save upto {string.common.Rs}
              {circleStaticMonthlySavings} on medicines
            </Text>
          </View>
        )}
      </View>
    );
  };

  const getBanner = () => {
    switch (membershipType) {
      case SILVER_PLAN:
        return <HdfcBannerSilver style={styles.hdfcBannerStyle} />;
      case GOLD_PLAN:
        return <HdfcBannerGold style={styles.hdfcBannerStyle} />;
      case PLATINUM_PLAN:
        return <HdfcBannerPlatinum style={styles.hdfcBannerStyle} />;
      case Circle.planName:
        return renderCircleBanner();
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
    height: 165,
  },
  circleSaving: {
    position: 'absolute',
    bottom: 18,
    left: 16,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 40,
    height: 30,
  },
  logoText: {
    ...theme.viewStyles.text('M', 12, '#02475B', 1, 20, 0.35),
    top: 4,
    left: 6,
  },
});
