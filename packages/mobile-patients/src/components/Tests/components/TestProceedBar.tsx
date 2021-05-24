import { formatTestSlot, isEmptyObject } from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  WhiteChevronRightIcon,
  TestInfoWhiteIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface TestProceedBarProps {
  onPressAddDeliveryAddress?: () => void;
  onPressSelectDeliveryAddress?: () => void;
  onPressProceedtoPay?: () => void;
  onPressTimeSlot?: () => void;
  onPressSelectArea?: () => void;
  phleboMin?: number;
  selectedTimeSlot?: any;
  showTime?: any;
  disableProceedToPay?: boolean;
  isModifyCOD: boolean;
  modifyOrderDetails: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList | null;
}

export const TestProceedBar: React.FC<TestProceedBarProps> = (props) => {
  const {
    grandTotal,
    deliveryAddressId,
    addresses,
    areaSelected,
    diagnosticAreas,
  } = useDiagnosticsCart();
  const {
    onPressAddDeliveryAddress,
    onPressSelectDeliveryAddress,
    onPressProceedtoPay,
    onPressTimeSlot,
    onPressSelectArea,
    selectedTimeSlot,
    showTime,
    disableProceedToPay,
    isModifyCOD,
    modifyOrderDetails,
  } = props;

  function getButtonTitle() {
    if (modifyOrderDetails) {
      return isModifyCOD ? `${string.placeOrder} (COD)` : string.proceedToPay;
    } else {
      return !deliveryAddressId
        ? addresses?.length
          ? string.diagnostics.selectAddressText
          : string.diagnostics.addAddressText
        : isEmptyObject(areaSelected)
        ? string.diagnostics.selectAreaText
        : string.proceedToPay;
    }
  }

  function onPressButton() {
    if (modifyOrderDetails) {
      onPressProceedtoPay?.();
    } else {
      return !deliveryAddressId
        ? addresses?.length
          ? onPressSelectDeliveryAddress?.()
          : onPressAddDeliveryAddress?.()
        : isEmptyObject(areaSelected)
        ? onPressSelectArea?.()
        : onPressProceedtoPay?.();
    }
  }

  const renderTimeSlot = () => {
    const timeSlotText = modifyOrderDetails
      ? `${moment(modifyOrderDetails?.slotDateTimeInUTC)?.format('ddd, DD MMM, YYYY') ||
          ''}, ${`${formatTestSlot(
          modifyOrderDetails?.slotDateTimeInUTC! || modifyOrderDetails?.slotTimings
        )}`}`
      : `${moment(selectedTimeSlot?.date).format('ddd, DD MMM, YYYY') || ''}, ${
          selectedTimeSlot?.slotInfo?.startTime
            ? `${formatTestSlot(selectedTimeSlot?.slotInfo?.startTime!)}`
            : string.diagnostics.noSlotSelectedText
        }`;
    const phleboMin = props.phleboMin;
    return (
      <View style={styles.timeSlotMainViewStyle}>
        <View style={styles.timeSlotChangeViewStyle}>
          <Text style={styles.timeSlotTextStyle}>{string.diagnostics.timeSlotText}</Text>
          {!!modifyOrderDetails ? null : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => onPressTimeSlot?.()}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={[styles.timeSlotTextStyle, { paddingHorizontal: 8 }]}>
                {showTime && selectedTimeSlot?.slotInfo?.startTime
                  ? string.diagnostics.changeText
                  : string.diagnostics.selectSlotText}
              </Text>
              <WhiteChevronRightIcon style={{ width: 20, height: 20 }} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.timeTextStyle}>{timeSlotText || ''}</Text>
        {!!timeSlotText ? (
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
      : (getButtonTitle() === string.proceedToPay && disableProceedToPay) ||
        (getButtonTitle() === string.diagnostics.selectAreaText && diagnosticAreas?.length == 0);
    return (
      <Button
        disabled={disableProceedToPayButton}
        title={getButtonTitle()}
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
    ...text('B', 14, WHITE, 1, 20),
  },
  timeTextStyle: {
    ...text('R', 14, WHITE, 1, 22),
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
