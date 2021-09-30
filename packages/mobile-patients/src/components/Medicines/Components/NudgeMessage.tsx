import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  NudgeMessageCart,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';

interface NudgeMessageType {
  nudgeMessage: string;
  nudgeMessageNonCircle?: string;
  show: 'yes' | 'no';
  userType?: 'circle' | 'non-circle' | 'all';
}

export interface NudgeMessageProps {
  nudgeMessage?: NudgeMessageType | null;
  nudgeMessageCart?: NudgeMessageCart | null;
  source?: string;
}

export const NudgeMessage: React.FC<NudgeMessageProps> = (props) => {
  const { nudgeMessage, nudgeMessageCart, source } = props;
  const { circleSubscriptionId, isCircleExpired, grandTotal } = useShoppingCart();
  const showCircleLogo = !!circleSubscriptionId && !isCircleExpired;
  const circleMember = circleSubscriptionId && !isCircleExpired;

  const replaceTextAmount = (text: string) => {
    return text
      .replace('<orderValue>', nudgeMessageCart?.orderValue)
      .replace('<cashbackPer>', nudgeMessageCart?.cashbackPer);
  };

  const getTextComponent = () => {
    let text = circleMember ? nudgeMessage?.nudgeMessage : nudgeMessage?.nudgeMessageNonCircle;
    if (source == 'cart' && nudgeMessageCart?.orderValue) {
      if (nudgeMessageCart?.orderValue > grandTotal) {
        text = replaceTextAmount(
          circleMember
            ? nudgeMessageCart?.nudgeMessageLess
            : nudgeMessageCart?.nudgeMessageLessNonCircle || ''
        );
      } else {
        text = replaceTextAmount(
          circleMember
            ? nudgeMessageCart?.nudgeMessageMore
            : nudgeMessageCart?.nudgeMessageMoreNonCircle || ''
        );
      }
    }
    return <Text style={styles.nudgeText}>{text}</Text>;
  };

  return (
    <View style={styles.container}>
      {showCircleLogo && <CircleLogo style={styles.circleLogo} />}
      {showCircleLogo && <View style={styles.verticalLine} />}
      {getTextComponent()}
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
