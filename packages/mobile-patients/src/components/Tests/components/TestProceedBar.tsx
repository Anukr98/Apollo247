import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { ClockIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface TestProceedBarProps {
  onPressAddDeliveryAddress?: () => void;
  onPressSelectDeliveryAddress?: () => void;
  onPressProceedtoPay: () => void;
  onPressTimeSlot?: () => void;
  phleboMin?: number;
  selectedTimeSlot?: any;
  showTime?: any;
  disableProceedToPay?: boolean;
  isModifyCOD: boolean;
  modifyOrderDetails: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList | null;
  showReportTat: string;
  priceToShow: number;
}

export const TestProceedBar: React.FC<TestProceedBarProps> = (props) => {
  const {
    onPressProceedtoPay,
    selectedTimeSlot,
    disableProceedToPay,
    isModifyCOD,
    modifyOrderDetails,
    showReportTat,
    priceToShow,
    phleboMin,
  } = props;

  function getButtonTitle() {
    if (modifyOrderDetails) {
      return isModifyCOD ? `${string.placeOrder} (COD)` : string.makePayment;
    } else {
      return string.makePayment;
    }
  }

  function onPressButton() {
    onPressProceedtoPay?.();
  }

  const localFormatSlot = (slotTime: string) => moment(slotTime, 'hh:mm a')?.format('hh:mm a');

  const renderTimeSlot = () => {
    const timeSlotText = modifyOrderDetails
      ? `${moment(modifyOrderDetails?.slotDateTimeInUTC)?.format('ddd, DD MMM YYYY') ||
          ''}, ${`${moment(modifyOrderDetails?.slotDateTimeInUTC)?.format('hh:mm a') ||
          localFormatSlot(modifyOrderDetails?.slotTimings)}`}`
      : `${moment(selectedTimeSlot?.date)?.format('ddd, DD MMM YYYY') || ''}, ${
          selectedTimeSlot?.slotStartTime
            ? `${localFormatSlot(selectedTimeSlot?.slotStartTime!)}`
            : string.diagnostics.noSlotSelectedText
        }`;
    const endSlotTime = moment(timeSlotText)
      .add(props.phleboMin || 0, 'minutes')
      .format('hh:mm a');

    return (
      <View style={styles.timeSlotMainViewStyle}>
        <View style={styles.timeSlotChangeViewStyle}>
          <Text style={styles.timeSlotTextStyle}>{string.diagnostics.timeSlotText}</Text>
        </View>
        {!!phleboMin ? (
          <Text style={styles.timeTextStyle}>
            {phleboMin == 0 ? timeSlotText || '' : `${timeSlotText} - ${endSlotTime}`}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderTotal = () => {
    return (
      <View>
        <Text style={styles.total}>
          {string.common.Rs}
          {priceToShow?.toFixed(2)}
        </Text>
        <Text style={styles.text}>{'Total Amount'}</Text>
      </View>
    );
  };

  const renderButton = () => {
    const disableProceedToPayButton = !!modifyOrderDetails
      ? getButtonTitle() === `${string.placeOrder} (COD)` && disableProceedToPay
      : getButtonTitle() === string.makePayment && disableProceedToPay;
    return (
      <Button
        disabled={disableProceedToPayButton}
        title={getButtonTitle()}
        onPress={() => onPressButton()}
        style={{ flex: 1, marginLeft: 15, borderRadius: 5 }}
      />
    );
  };

  const renderOverallReportTat = () => {
    return (
      <View style={styles.reportTatBottomview}>
        <ClockIcon style={styles.clockIconStyle} />
        <Text style={styles.reportOrderTextStyle}>{showReportTat}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showReportTat != '' ? renderOverallReportTat() : null}
      {selectedTimeSlot || !!modifyOrderDetails ? renderTimeSlot() : null}
      <View style={styles.subContainer}>
        {renderTotal()}
        {renderButton()}
      </View>
    </View>
  );
};

const { WHITE, SHERPA_BLUE, SKY_BLUE } = theme.colors;
const { text } = theme.viewStyles;
const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  subContainer: {
    flexDirection: 'row',
    paddingHorizontal: 13,
    marginVertical: 9,
  },
  total: {
    ...text('B', 14, SHERPA_BLUE, 1, 22),
  },
  text: {
    ...text('R', 14, SHERPA_BLUE, 1, 24),
  },
  timeSlotMainViewStyle: {
    flex: 1,
    padding: 12,
    backgroundColor: SKY_BLUE,
  },
  timeSlotChangeViewStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeSlotTextStyle: {
    ...text('M', 14, WHITE, 1, 20),
  },
  timeTextStyle: {
    ...text('SB', 14, WHITE, 1, 22),
  },
  infoIconViewStyle: { flexDirection: 'row' },
  timeIconStyle: {
    width: 12,
    height: 12,
    marginTop: 3,
  },
  infoTextStyle: {
    ...text('R', 10, WHITE, 1, 16),
    marginLeft: 4,
  },
  reportTatBottomview: {
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    padding: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 16,
  },
  clockIconStyle: { height: 20, width: 20, resizeMode: 'contain' },
  reportOrderTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    marginHorizontal: 8,
    lineHeight: 16,
    letterSpacing: 0.04,
  },
});
