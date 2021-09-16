import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
const { width } = Dimensions.get('window');
import moment from 'moment';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

interface AddedCirclePlanWithValidityProps {
  circleSavings: number;
  circlePlanDetails?: any;
  isConsult?: boolean;
}
export const AddedCirclePlanWithValidity: React.FC<AddedCirclePlanWithValidityProps> = (props) => {
  const { circleSavings, circlePlanDetails, isConsult } = props;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <CircleLogo style={styles.circleLogo} />
        <View style={{ width: width - 120, marginLeft: 5 }}>
          <Text style={theme.viewStyles.text('R', 11, theme.colors.LIGHT_BLUE)}>
            {string.circleDoctors.successfullyPurchashedCircleSubscription}
          </Text>
          {!!circleSavings && (
            <Text
              style={{ ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE), marginTop: 5 }}
            >
              You{' '}
              <Text style={theme.viewStyles.text('SB', 12, theme.colors.SEARCH_UNDERLINE_COLOR)}>
                saved {string.common.Rs}
                {convertNumberToDecimal(circleSavings)}{' '}
              </Text>
              on your
              {isConsult ? ` consult` : ` purchase`}
            </Text>
          )}
          <View style={[styles.spaceRow, { alignItems: 'flex-start' }]}>
            {circlePlanDetails?.end_date ? (
              <View>
                <Text style={theme.viewStyles.text('R', 12, theme.colors.BORDER_BOTTOM_COLOR)}>
                  {string.circleDoctors.validTill}{' '}
                  <Text style={theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE)}>
                    {moment(circlePlanDetails?.end_date).format('D MMMM YYYY')}
                  </Text>
                </Text>
              </View>
            ) : null}
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
    width: 45,
    height: 27,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
