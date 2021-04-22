import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { Cash } from '@aph/mobile-patients/src/components/ui/Icons';

export interface PayByCashProps {
  onPressPlaceOrder: () => void;
}

export const PayByCash: React.FC<PayByCashProps> = (props) => {
  const { onPressPlaceOrder } = props;

  const renderPaybyCash = () => {
    return (
      <View style={styles.subContainer}>
        <Cash />
        <Text style={styles.payByCash}>Pay by cash</Text>
      </View>
    );
  };

  const renderPlaceOrder = () => {
    return (
      <TouchableOpacity onPress={onPressPlaceOrder}>
        <Text style={styles.placeOrder}>PLACE ORDER</Text>
      </TouchableOpacity>
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        {renderPaybyCash()}
        {renderPlaceOrder()}
      </View>
    );
  };
  return (
    <CollapseView
      isDown={true}
      Heading={'PAY ON DELIVERY'}
      ChildComponent={renderChildComponent()}
    />
  );
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payByCash: {
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 24,
    marginLeft: 10,
    color: '#01475B',
  },
  placeOrder: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#FC9916',
  },
});
