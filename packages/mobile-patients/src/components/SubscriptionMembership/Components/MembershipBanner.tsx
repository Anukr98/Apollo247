import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Hdfc_values, Circle } from '@aph/mobile-patients/src/strings/strings.json';
import {
  HdfcBannerSilver,
  HdfcBannerGold,
  HdfcBannerPlatinum,
  CircleMembershipBanner,
  CircleLogoWhite,
  CircleBannerExpired,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface MembershipBannerProps {
  membershipType: string;
  isExpired?: boolean;
  onRenewClick: () => void;
}

export const MembershipBanner: React.FC<MembershipBannerProps> = (props) => {
  const { membershipType, isExpired, onRenewClick } = props;
  const { SILVER_PLAN, GOLD_PLAN, PLATINUM_PLAN } = Hdfc_values;
  const { totalCircleSavings } = useAppCommonData();
  const circleStaticMonthlySavings = AppConfig.Configuration.CIRCLE_STATIC_MONTHLY_SAVINGS;

  const renderCircleBanner = () => {
    const circleSavings = totalCircleSavings?.totalSavings;
    return (
      <View>
        {isExpired ? (
          <View>
            <CircleBannerExpired resizeMode="cover" style={styles.circleBannerStyle} />
            <View style={styles.circleExpiredSavings}>
              <View style={{ flexDirection: 'row' }}>
                <CircleLogoWhite style={styles.circleExpiredLogo} />
                <Text style={styles.circleExpiredText}>
                  {circleSavings > 0
                    ? `has saved you ${string.common.Rs}${circleSavings.toFixed(2)} so far.`
                    : `members save upto ${string.common.Rs}848`}
                </Text>
              </View>
              <Text style={theme.viewStyles.text('M', 15, '#02475B', 1, 25, 0.35)}>
                Renew and continue to save more!
              </Text>
              <TouchableOpacity style={styles.renewButton} onPress={onRenewClick}>
                <Text style={styles.renewText}>Renew Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
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
  circleExpiredSavings: {
    position: 'absolute',
    top: 30,
    left: 16,
  },
  circleExpiredLogo: {
    resizeMode: 'contain',
    width: 60,
    height: 50,
  },
  circleExpiredText: {
    ...theme.viewStyles.text('M', 18, '#FFFFFF', 1, 20, 0.35),
    top: 17,
    left: 6,
    width: '78%',
  },
  renewButton: {
    backgroundColor: '#164884',
    borderRadius: 5,
    width: '35%',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    right: 10,
  },
  renewText: {
    ...theme.viewStyles.text('SB', 13, '#FFFFFF', 1, 15, 0.35),
    padding: 4,
  },
});
