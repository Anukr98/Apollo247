import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

interface NudgeMessage {
  nudgeMessage: string;
  show: 'yes' | 'no';
  userType: 'circle' | 'non-circle' | 'all';
}

export interface NudgeMessageProps {
  nudgeMessage: NudgeMessage | null;
}

export const NudgeMessage: React.FC<NudgeMessageProps> = (props) => {
  const { nudgeMessage } = props;
  const { circleSubscriptionId, isCircleExpired } = useShoppingCart();
  const showCircleLogo = circleSubscriptionId && !isCircleExpired;

  return (
    <View style={styles.container}>
      {showCircleLogo && <CircleLogo style={styles.circleLogo} />}
      {showCircleLogo && <View style={styles.verticalLine} />}
      <Text style={styles.nudgeText}>{nudgeMessage?.nudgeMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF5DE',
    padding: 6,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 35,
    height: 25,
    marginRight: 10,
    marginLeft: 6,
    alignSelf: 'center',
  },
  verticalLine: {
    borderLeftWidth: 1,
    borderLeftColor: '#02475B',
    marginVertical: 4,
  },
  nudgeText: {
    ...theme.viewStyles.text('M', 13, '#02475B', 1, 20, 0),
    width: '85%',
    marginLeft: 10,
    alignSelf: 'center',
  },
});
