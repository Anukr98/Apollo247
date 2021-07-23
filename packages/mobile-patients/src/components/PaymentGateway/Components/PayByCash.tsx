import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { Cash } from '@aph/mobile-patients/src/components/ui/Icons';
import { isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { InfoMessage } from '@aph/mobile-patients/src/components/Tests/components/InfoMessage';
import { SavingsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
export interface PayByCashProps {
  onPressPlaceOrder: () => void;
  HCselected: boolean;
  businessLine: 'consult' | 'diagnostics' | 'pharma' | 'subscription';
  showDiagCOD: boolean;
  diagMsg: string;
}

export const PayByCash: React.FC<PayByCashProps> = (props) => {
  const { onPressPlaceOrder, HCselected, businessLine, showDiagCOD, diagMsg } = props;
  const disableDiagCOD = businessLine == 'diagnostics' && !showDiagCOD;

  const renderPaybyCash = () => {
    return (
      <View
        style={{
          ...styles.subContainer,
          opacity: disableDiagCOD || HCselected ? 0.4 : 1,
        }}
      >
        <Cash />
        <Text style={styles.payByCash}>Pay by cash</Text>
      </View>
    );
  };

  const renderPlaceOrder = () => {
    return (
      <TouchableOpacity onPress={onPressPlaceOrder}>
        <Text
          style={{
            ...styles.placeOrder,
            opacity: disableDiagCOD || HCselected ? 0.4 : 1,
          }}
        >
          PLACE ORDER
        </Text>
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

  const renderInfoMessage = () => {
    return (
      <InfoMessage
        content={string.diagnostics.codDisableText}
        textStyle={styles.textStyle}
        iconStyle={styles.iconStyle}
      />
    );
  };

  const renderHCMsg = () => {
    return (
      !!diagMsg &&
      businessLine == 'diagnostics' && (
        <View style={styles.savingContainer}>
          <SavingsIcon style={styles.savingIconStyle} />
          <Text style={styles.savingText}>{diagMsg}</Text>
        </View>
      )
    );
  };

  const renderChildComponent = () => {
    return (
      <View>
        {disableDiagCOD && renderInfoMessage()}
        <View
          style={styles.ChildComponent}
          pointerEvents={disableDiagCOD || HCselected ? 'none' : 'auto'}
        >
          {renderPaybyCash()}
          {renderPlaceOrder()}
        </View>
        {renderHCMsg()}
        {businessLine == 'pharma' && renderMsg()}
      </View>
    );
  };

  return businessLine == 'diagnostics' || businessLine == 'pharma' ? (
    <CollapseView
      isDown={true}
      Heading={'PAY ON DELIVERY'}
      ChildComponent={renderChildComponent()}
    />
  ) : null;
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
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 8.5 : 9),
    lineHeight: isSmallDevice ? 13 : 14,
    letterSpacing: 0.1,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.7,
    marginHorizontal: '2%',
  },
  iconStyle: {
    resizeMode: 'contain',
    height: isSmallDevice ? 13 : 14,
    width: isSmallDevice ? 13 : 14,
  },
  savingContainer: {
    backgroundColor: '#F3FFFF',
    flexDirection: 'row',
    margin: 16,
    padding: 8,
    borderColor: colors.APP_GREEN,
    borderRadius: 10,
    borderWidth: 1,
  },
  savingIconStyle: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
  },
  savingText: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 20),
    width: '89%',
    alignSelf: 'center',
    marginLeft: 10,
  },
});
