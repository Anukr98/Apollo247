import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ImageBackground,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
const { width } = Dimensions.get('window');
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { NavigationScreenProps } from 'react-navigation';

interface CircleBannerProps extends NavigationScreenProps {}
export const CircleBannerComponent: React.FC<CircleBannerProps> = (props) => {
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(true);
  const renderConditionalViews = () => {
    return (
      <View>
        <View style={styles.row}>
          <CircleLogo style={styles.circleLogo} />
          <Text style={styles.title}>MEMBERS</Text>
        </View>
        <Text style={styles.title}>SAVE {string.common.Rs}XXX MONTHLY!</Text>
      </View>
    );
  };

  const renderUpgradeBtn = () => {
    return (
      <TouchableOpacity style={styles.upgradeBtnView} onPress={() => setShowCirclePlans(true)}>
        <View style={[styles.row, { marginTop: 6 }]}>
          <Text style={styles.upgradeText}>UPGRADE TO</Text>
          <CircleLogo style={styles.smallCircleLogo} />
        </View>
        <Text style={[styles.upgradeText, { color: theme.colors.LIGHT_BLUE, marginTop: -5 }]}>
          Starting at {string.common.Rs}49
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCircleSubscriptionPlans = () => {
    return (
      <CircleMembershipPlans
        // style={styles.careSelectContainer}
        navigation={props.navigation}
        isModal={true}
        closeModal={() => setShowCirclePlans(false)}
        buyNow={true}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@aph/mobile-patients/src/components/ui/icons/circleBanner.png')}
        style={styles.banner}
        imageStyle={{ borderRadius: 16 }}
      >
        {renderConditionalViews()}
        {renderUpgradeBtn()}
        {showCirclePlans && renderCircleSubscriptionPlans()}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    paddingTop: 16,
  },
  banner: {
    height: 150,
    width: width - 40,
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 13,
  },
  row: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleLogo: {
    width: 50,
    height: 30,
    marginRight: 3,
  },
  title: {
    ...theme.viewStyles.text('SB', 14, theme.colors.WHITE, 1, 22),
  },
  upgradeBtnView: {
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    bottom: 10,
    left: 13,
    paddingHorizontal: 10,
    paddingBottom: 5,
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
  },
  upgradeText: {
    ...theme.viewStyles.text('SB', 9, theme.colors.APP_YELLOW, 1),
  },
  smallCircleLogo: {
    width: 40,
    height: 20,
  },
});
