import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { PayCash } from '@aph/mobile-patients/src/components/ui/Icons';
import { isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { InfoMessage } from '@aph/mobile-patients/src/components/Tests/components/InfoMessage';
import { SavingsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { ELIGIBLE_HC_VERTICALS } from '@aph/mobile-patients/src/strings/AppConfig';
export interface PayByCashProps {
  onPressPlaceOrder: () => void;
  HCselected: boolean;
  businessLine: 'consult' | 'diagnostics' | 'pharma' | 'subscription';
  showDiagCOD: boolean;
  diagMsg: string;
  pharmaDisableCod?: boolean;
  pharmaDisincentivizeCodMessage?: string;
}

export const PayByCash: React.FC<PayByCashProps> = (props) => {
  const {
    onPressPlaceOrder,
    HCselected,
    businessLine,
    showDiagCOD,
    diagMsg,
    pharmaDisableCod,
    pharmaDisincentivizeCodMessage,
  } = props;
  const disableDiagCOD = businessLine == 'diagnostics' && !showDiagCOD;
  const disableCodOption = disableDiagCOD || HCselected || pharmaDisableCod;
  const codAlertMsg = 'COD option is not available along with OneApollo Health Credits.';
  const renderPaybyCash = () => {
    return (
      <View
        style={{
          ...styles.subContainer,
          opacity: disableCodOption ? 0.4 : 1,
        }}
      >
        <PayCash style={{ height: 36, width: 36 }} />
        <Text style={styles.payByCash}>Pay by cash</Text>
      </View>
    );
  };

  const renderPlaceOrder = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          !disableCodOption && onPressPlaceOrder();
        }}
      >
        <Text
          style={{
            ...styles.placeOrder,
            opacity: disableCodOption ? 0.4 : 1,
          }}
        >
          PLACE ORDER
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMsg = () => {
    return HCselected ? (
      <Text style={styles.codAlertMsg}>{codAlertMsg}</Text>
    ) : disableDiagCOD ? (
      <Text style={styles.codAlertMsg}>{string.diagnostics.codDisableText}</Text>
    ) : !!diagMsg && businessLine == 'diagnostics' ? (
      <Text style={styles.codAlertMsg}>{diagMsg}</Text>
    ) : !!pharmaDisincentivizeCodMessage && businessLine == 'pharma' ? (
      <Text style={styles.codAlertMsg}>{pharmaDisincentivizeCodMessage}</Text>
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

  const renderPharmaMessage = () => {
    return (
      !!pharmaDisincentivizeCodMessage &&
      businessLine == 'pharma' && (
        <View style={styles.pharmaMessageContainer}>
          <SavingsIcon style={styles.savingIconStyle} />
          <Text style={styles.pharmaCodMessage}>{pharmaDisincentivizeCodMessage}</Text>
        </View>
      )
    );
  };

  const renderChildComponent = () => {
    return (
      <View
        style={styles.ChildComponent}
        pointerEvents={disableDiagCOD || HCselected ? 'none' : 'auto'}
      >
        <View style={styles.payCont}>
          {renderPaybyCash()}
          {renderPlaceOrder()}
        </View>
        {renderMsg()}
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>PAY ON DELIVERY</Text>
      </View>
    );
  };

  return businessLine == 'diagnostics' || businessLine == 'pharma' ? (
    <View>
      {renderHeader()}
      {renderChildComponent()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  ChildComponent: {
    paddingVertical: 15,
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payByCash: {
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 24,
    marginLeft: 10,
    color: '#01475B',
  },
  placeOrder: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FC9916',
  },
  codAlertMsg: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#01475B',
    lineHeight: 16,
    marginTop: 3,
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
  pharmaCodMessage: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 20),
    marginLeft: 7,
  },
  pharmaMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    width: '87%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  header: {
    marginHorizontal: 16,
    paddingBottom: 12,
    marginTop: 24,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 4,
  },
});
