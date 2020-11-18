import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
const { width } = Dimensions.get('window');

interface AddedCirclePlanWithValidityProps {
  circleSavings: number;
}
export const AddedCirclePlanWithValidity: React.FC<AddedCirclePlanWithValidityProps> = (props) => {
  const { circleSavings } = props;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <CircleLogo style={styles.circleLogo} />
        <View style={{ width: width - 120, marginLeft: 5 }}>
          <Text style={theme.viewStyles.text('R', 11, theme.colors.LIGHT_BLUE)}>
            {string.circleDoctors.successfullyPurchashedCircleSubscription}
          </Text>
          <Text
            style={{ ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE), marginTop: 5 }}
          >
            You{' '}
            <Text style={theme.viewStyles.text('SB', 12, theme.colors.SEARCH_UNDERLINE_COLOR)}>
              saved {string.common.Rs}
              {circleSavings}{' '}
            </Text>
            on your purchase
          </Text>
          <View style={styles.spaceRow}>
            <View>
              <Text style={theme.viewStyles.text('R', 12, theme.colors.BORDER_BOTTOM_COLOR)}>
                {string.circleDoctors.validTill}
              </Text>
              <Text style={theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE)}>
                24 December 2020
              </Text>
            </View>
            <View>
              <Text style={theme.viewStyles.text('R', 12, theme.colors.BORDER_BOTTOM_COLOR)}>
                {string.circleDoctors.subscriptionID}
              </Text>
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, theme.colors.BORDER_BOTTOM_COLOR),
                  marginLeft: 'auto',
                }}
              >
                123456
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    borderRadius: 5,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  circleLogo: {
    width: 50,
    height: 32,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
