import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CardContent } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/CardContent';

export interface InactivePlanBenefitsProps {
  benefits: any;
  isActivePlan: boolean;
}

export const InactivePlanBenefits: React.FC<InactivePlanBenefitsProps> = (props) => {
  const { benefits, isActivePlan } = props;

  return (
    <View style={styles.cardStyle}>
      {!!benefits?.length &&
        benefits.map((value, index) => {
          const { headerContent, description, icon } = value;
          return (
            <>
              <CardContent
                heading={headerContent}
                bodyText={description}
                icon={icon}
                isActivePlan={isActivePlan}
              />
              <TouchableOpacity disabled={true} onPress={() => {}}>
                <Text style={[styles.redeemButtonText, { color: '#f7cc8f' }]}>REDEEM</Text>
              </TouchableOpacity>
              {index + 1 !== benefits.length && <View style={styles.horizontalLine} />}
            </>
          );
        })}
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
  redeemButtonText: {
    ...theme.viewStyles.text('B', 15, '#FC9916', 1, 20, 0.35),
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  horizontalLine: {
    marginVertical: 20,
    borderTopColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopWidth: 1,
  },
});
