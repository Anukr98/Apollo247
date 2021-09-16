import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { REFUND_STATUSES } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface RefundCardProps {
  refundArray: any;
  styleObj?: any;
  isModified?: boolean;
  totalPrice?: number;
}

export const RefundCard: React.FC<RefundCardProps> = (props) => {
  const { refundArray, isModified, totalPrice } = props;
  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const dateToUse =
    refundArray?.[0]?.status == REFUND_STATUSES.SUCCESS
      ? refundArray?.[0]?.updated_at
      : refundArray?.[0]?.created_at;
  const date = moment(dateToUse).format(`DD-MM-YYYY`);
  const time = getFormattedTime(dateToUse);
  const dtm = date + ', ' + time;
  const refundText =
    refundArray?.[0].status == REFUND_STATUSES.SUCCESS
      ? string.diagnostics.refundSuccessText
      : string.diagnostics.refundInitiateText;
  const refundProccessText =
    refundArray?.[0].status == REFUND_STATUSES.SUCCESS
      ? 'Refund Proccessd on: '
      : 'Refund Initiated on: ';

  const refundAmountToShow =
    !!isModified && isModified && !!totalPrice ? totalPrice : refundArray?.[0]?.amount;

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.refundText}>
          {refundText.replace('{{refundAmount}}', refundAmountToShow)}
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

RefundCard.defaultProps = {
  isModified: false,
};
