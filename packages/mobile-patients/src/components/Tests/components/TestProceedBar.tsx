import { formatTestSlot, nameFormater } from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TestInfoWhiteIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';

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
}

export const TestProceedBar: React.FC<TestProceedBarProps> = (props) => {
  const { grandTotal, deliveryAddressId, addresses } = useDiagnosticsCart();
  const {
    onPressAddDeliveryAddress,
    onPressSelectDeliveryAddress,
    onPressProceedtoPay,
    selectedTimeSlot,
    showTime,
    disableProceedToPay,
    isModifyCOD,
    modifyOrderDetails,
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

  const renderTimeSlot = () => {
    const timeSlotText = modifyOrderDetails
      ? `${moment(modifyOrderDetails?.slotDateTimeInUTC)?.format('ddd, DD MMM, YYYY') ||
          ''}, ${`${moment(modifyOrderDetails?.slotDateTimeInUTC).format('hh:mm a') ||
          formatTestSlot(modifyOrderDetails?.slotTimings)}`}`
      : //selectedTimeSlot?.slotInfo?.startTime  (if using selectedTimeSlot)
        `${moment(selectedTimeSlot?.date).format('ddd, DD MMM, YYYY') || ''}, ${
          selectedTimeSlot?.slotStartTime
            ? `${formatTestSlot(selectedTimeSlot?.slotStartTime!)}`
            : string.diagnostics.noSlotSelectedText
        }`;
    const showPhelboETA = modifyOrderDetails
      ? !!timeSlotText
      : !!timeSlotText && showTime && selectedTimeSlot?.slotStartTime;
    return (
      <View style={styles.timeSlotMainViewStyle}>
        <View style={styles.timeSlotChangeViewStyle}>
          <Text style={styles.timeSlotTextStyle}>{string.diagnostics.timeSlotText}</Text>
        </View>
        <Text style={styles.timeTextStyle}>{timeSlotText || ''}</Text>
        {showPhelboETA ? (
          <View style={styles.infoIconViewStyle}>
            <TestInfoWhiteIcon style={styles.timeIconStyle} />
            <Text style={styles.infoTextStyle}>
              {`The sample collection executive will reach between ${moment(timeSlotText).format(
                'hh:mm A'
              )} - ${moment(timeSlotText)
                .add(props.phleboMin, 'minutes')
                .format('hh:mm A')} for collecting the samples`}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderTotal = () => {
    return (
      <View>
        <Text style={styles.total}>₹{grandTotal?.toFixed(2)}</Text>
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
        title={nameFormater(getButtonTitle(), 'upper')}
        onPress={() => onPressButton()}
        style={{ flex: 1, marginLeft: 15, borderRadius: 5 }}
      />
    );
  };

  return (
    <View style={styles.container}>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
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
});
