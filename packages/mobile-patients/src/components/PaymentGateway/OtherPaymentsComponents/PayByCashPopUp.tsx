import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PayCash } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  OffersIcon,
  CircleCheckIcon,
  CircleUncheckIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface PayByCashProps {
  onPressPayNow: () => void;
  HCselected: boolean;
  businessLine: 'consult' | 'diagnostics' | 'pharma' | 'subscription';
  showDiagCOD: boolean;
  diagMsg: string;
  pharmaDisableCod?: boolean;
  pharmaDisincentivizeCodMessage?: string;
}

export const PayByCashPopUp: React.FC<PayByCashProps> = (props) => {
  const {
    onPressPayNow,
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

  const isCODdisabled = false;
  const renderImage = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <PayCash style={{ height: 36, width: 36 }} />
        <Text style={styles.name}>Pay by Cash</Text>
      </View>
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

  const renderPayNowButton = () => {
    return (
      <Button
        disabled={disableCodOption}
        style={{ marginTop: 10, borderRadius: 5, opacity: !disableCodOption ? 1 : 0.7 }}
        title={'PLACE ORDER'}
        onPress={onPressPayNow}
      />
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={{ ...styles.ChildComponent }}>
        <View style={{ ...styles.subCont, opacity: !disableCodOption ? 1 : 0.7 }}>
          {renderImage()}
          {<CircleCheckIcon style={styles.icon} />}
        </View>
        {renderMsg()}
        {renderPayNowButton()}
      </View>
    );
  };

  return <View style={{ paddingTop: 12, paddingBottom: 24 }}>{renderChildComponent()}</View>;
};

const styles = StyleSheet.create({
  ChildComponent: {
    paddingVertical: 12,
    backgroundColor: '#FAFEFF',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginHorizontal: 16,
  },
  subCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    marginHorizontal: 16,
    paddingBottom: 12,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 4,
  },
  name: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    textAlign: 'center',
    marginLeft: 8,
  },
  offermsg: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 14,
    marginLeft: 5,
    color: '#00B38E',
  },
  offerIcon: {
    height: 20,
    width: 20,
  },
  wallet: {
    flexDirection: 'row',
    paddingBottom: 10,
    marginTop: 12,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FC9916',
  },
  icon: {
    height: 18,
    width: 18,
  },
  codAlertMsg: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#01475B',
    lineHeight: 16,
    marginTop: 3,
  },
});
