import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { WhiteChevronRightIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface TestProceedBarProps {
  onPressAddDeliveryAddress?: () => void;
  onPressSelectDeliveryAddress?: () => void;
  onPressProceedtoPay?: () => void;
  onPressTimeSlot?: () => void;
}

export const TestProceedBar: React.FC<TestProceedBarProps> = (props) => {
  const { grandTotal, deliveryAddressId, addresses } = useDiagnosticsCart();
  const {
    onPressAddDeliveryAddress,
    onPressSelectDeliveryAddress,
    onPressProceedtoPay,
    onPressTimeSlot,
  } = props;

  function getButtonTitle() {
    return !deliveryAddressId
      ? addresses?.length
        ? string.diagnostics.selectAddressText
        : string.diagnostics.addAddressText
      : string.proceedToPay;
  }

  function onPressButton() {
    return !deliveryAddressId
      ? addresses?.length
        ? onPressSelectDeliveryAddress?.()
        : onPressAddDeliveryAddress?.()
      : onPressProceedtoPay?.();
  }

  const renderTimeSlot = () => {
    return (
      <View style={styles.timeSlotMainViewStyle}>
        <View style={styles.timeSlotChangeViewStyle}>
          <Text style={styles.timeSlotTextStyle}>{string.diagnostics.timeSlotText}</Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => onPressTimeSlot?.()}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={[styles.timeSlotTextStyle, { paddingHorizontal: 8 }]}>
              {string.diagnostics.changeText}
            </Text>
            <WhiteChevronRightIcon style={{ width: 20, height: 20 }} />
          </TouchableOpacity>
        </View>
        <Text style={styles.timeTextStyle}>{'Mon, 1st Feb 2021, 9.00am to 9:40am'}</Text>
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
    return (
      <Button
        title={getButtonTitle()}
        onPress={() => onPressButton()}
        style={{ flex: 1, marginLeft: 15, borderRadius: 5 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderTimeSlot()}
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
});
