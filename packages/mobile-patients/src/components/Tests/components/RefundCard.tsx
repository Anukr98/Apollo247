import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { REFUND_STATUSES } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface RefundCardProps {
  refundArray: any;
  styleObj?: any;
}

export const RefundCard: React.FC<RefundCardProps> = (props) => {
  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const dateToUse =
    props.refundArray?.[0]?.status == REFUND_STATUSES.SUCCESS
      ? props.refundArray?.[0]?.updated_at
      : props.refundArray?.[0]?.created_at;
  const date = moment(dateToUse).format(`DD-MM-YYYY`);
  const time = getFormattedTime(dateToUse);
  const dtm = date + ', ' + time;
  const refundText =
    props.refundArray?.[0].status == REFUND_STATUSES.SUCCESS
      ? string.diagnostics.refundSuccessText
      : string.diagnostics.refundInitiateText;
  const refundProccessText =
    props.refundArray?.[0].status == REFUND_STATUSES.SUCCESS
      ? 'Refund Proccessd on: '
      : 'Refund Initiated on: ';

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.refundText}>
          {refundText.replace('{{refundAmount}}', props.refundArray?.[0]?.amount)}
        </Text>
        <Text style={styles.proccessDate}>
          {refundProccessText} <Text style={{ color: theme.colors.APP_GREEN }}>{dtm}</Text>
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { ...theme.viewStyles.cardViewStyle, padding: 16, margin: 16 },
  refundText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: theme.colors.SHERPA_BLUE,
  },
  proccessDate: {
    marginTop: 6,
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 18,
    color: theme.colors.SHERPA_BLUE,
  },
});
