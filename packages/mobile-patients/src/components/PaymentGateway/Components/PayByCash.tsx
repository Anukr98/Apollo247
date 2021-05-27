import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { Cash } from '@aph/mobile-patients/src/components/ui/Icons';

export interface PayByCashProps {
  onPressPlaceOrder: () => void;
  HCselected: boolean;
  disableCOD?: boolean;
}

export const PayByCash: React.FC<PayByCashProps> = (props) => {
  const { onPressPlaceOrder, HCselected, disableCOD } = props;

  const renderPaybyCash = () => {
    return (
      <View style={{ ...styles.subContainer, opacity: HCselected ? 0.3 : 1 }}>
        <Cash />
        <Text style={styles.payByCash}>Pay by cash</Text>
      </View>
    );
  };

  const renderPlaceOrder = () => {
    return (
      <TouchableOpacity onPress={onPressPlaceOrder}>
        <Text style={{ ...styles.placeOrder, opacity: HCselected ? 0.3 : 1 }}>PLACE ORDER</Text>
      </TouchableOpacity>
    );
  };

  const renderMsg = () => {
    return HCselected ? (
      <Text style={styles.codAlertMsg}>
        {'! COD option is not available along with OneApollo Health Credits.'}
      </Text>
    ) : null;
  };

  const renderChildComponent = () => {
    return (
      <View>
        <View
          style={[styles.ChildComponent, { opacity: disableCOD ? 0.4 : 1 }]}
          pointerEvents={disableCOD ? 'none' : 'auto'}
        >
          {renderPaybyCash()}
          {renderPlaceOrder()}
        </View>
        {renderMsg()}
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
  codAlertMsg: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#01475B',
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 5,
    marginHorizontal: 25,
  },
});
