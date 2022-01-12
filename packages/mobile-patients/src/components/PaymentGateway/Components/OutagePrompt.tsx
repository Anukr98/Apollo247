import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleSheetProperties } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Alert, AlertRed } from '@aph/mobile-patients/src/components/ui/Icons';

export interface OutagePromptProps {
  outageStatus: string;
  msg?: string;
}

export const OutagePrompt: React.FC<OutagePromptProps> = (props) => {
  const { outageStatus, msg } = props;

  const renderIcon = () => {
    return outageStatus == 'FLUCTUATE' ? <Alert /> : <AlertRed />;
  };

  const renderPrompt = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* {renderIcon()} */}
        <Text style={{ ...styles.textStyle }}>
          {outageStatus == 'DOWN'
            ? msg
              ? `${msg} Experiencing high failures. Please try other payment method.`
              : 'Experiencing high failures. Please try other payment method.'
            : msg
            ? `${msg} Experiencing high failures.`
            : 'Experiencing high failures.'}
        </Text>
      </View>
    );
  };

  return outageStatus == 'FLUCTUATE' || outageStatus == 'DOWN' ? (
    <View style={{ ...styles.container }}>{renderPrompt()}</View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {},
  textStyle: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 18,
    flexShrink: 1,
    color: '#CF8F6A',
  },
});
