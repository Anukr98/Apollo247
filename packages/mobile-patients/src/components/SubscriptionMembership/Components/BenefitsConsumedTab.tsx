import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface BenefitsConsumedTabProps {
  benefitsConsumed: any;
}

const { width } = Dimensions.get('window');

export const BenefitsConsumedTab: React.FC<BenefitsConsumedTabProps> = (props) => {
  const { benefitsConsumed } = props;
  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={benefitStyle.scrollViewStyle}
      bounces={false}
    >
      <View style={benefitStyle.flexColumn}>
        <View style={benefitStyle.benefitContainer}>
          <View style={benefitStyle.halfWidth}>
            <Text style={benefitStyle.benefitHeading}>BENEFITS</Text>
          </View>
          <View style={benefitStyle.halfWidth}>
            <Text style={benefitStyle.benefitHeading}>WHAT DO YOU GET</Text>
          </View>
          <View style={benefitStyle.halfWidth}>
            <Text style={benefitStyle.benefitHeading}>REDEMPTION LIMIT</Text>
          </View>
          <View style={{ width: width / 3.3 }}>
            <Text style={benefitStyle.benefitHeading}>STATUS</Text>
          </View>
        </View>
        {benefitsConsumed.map((benefit) => {
          const limit = benefit.attributeType!.type;
          return (
            <View style={benefitStyle.rowStretch}>
              <View style={benefitStyle.halfWidth}>
                <Text style={benefitStyle.benefitDescription}>{benefit.headerContent}</Text>
              </View>
              <View style={benefitStyle.halfWidth}>
                <Text style={benefitStyle.benefitDescription}>{benefit.description}</Text>
              </View>
              <View style={benefitStyle.halfWidth}>
                <Text style={benefitStyle.benefitDescription}>{limit}</Text>
              </View>
              <View style={{ width: width / 3.3 }}>
                <Text style={benefitStyle.benefitDescription}>
                  {benefit.attributeType!.remaining}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const benefitStyle = StyleSheet.create({
  scrollViewStyle: {
    marginTop: 20,
    marginBottom: 20,
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 10,
    marginVertical: 4,
    padding: 10,
  },
  benefitContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
  },
  rowStretch: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
  },
  halfWidth: {
    width: width / 2.2,
  },
  benefitDescription: {
    textTransform: 'uppercase',
    paddingRight: 10,
    ...theme.viewStyles.text('R', 15, '#000000', 1, 20, 0.35),
  },
  benefitHeading: {
    ...theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35),
  },
  flexColumn: {
    flexDirection: 'column',
  },
});