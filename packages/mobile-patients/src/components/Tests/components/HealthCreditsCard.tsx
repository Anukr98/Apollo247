import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { OneApollo } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface HealthCreditsCardProps {
  availableHC: number;
}

export const HealthCreditsCard: React.FC<HealthCreditsCardProps> = (props) => {
  const { availableHC } = props;

  const renderTopView = () => {
    return (
      <View style={styles.topView}>
        <OneApollo style={styles.iconSize} />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.availableHCTxt}>
            {string.diagnosticsCartPage.availableHCText} {string.common.Rs}
            {availableHC}
          </Text>
        </View>
      </View>
    );
  };

  const renderDisclaimerViewText = () => {
    return <Text style={styles.disclaimerText}>{string.diagnosticsCartPage.HcDisclaimer}</Text>;
  };

  return availableHC != 0 ? (
    <View style={styles.card}>
      {renderTopView()}
      {renderDisclaimerViewText()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  card: { justifyContent: 'center', paddingBottom: 15 },
  topView: { flexDirection: 'row', alignItems: 'center' },
  iconSize: {
    height: 30,
    width: 33,
    resizeMode: 'contain',
  },
  disclaimerText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
    textAlignVertical: 'center',
    marginLeft: 4,
  },
  availableHCTxt: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
});
