import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleSheetProperties } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Alert, AlertRed } from '@aph/mobile-patients/src/components/ui/Icons';

export interface OutagePromptProps {
  outageStatus: string;
  msg: string;
}

export const OutagePrompt: React.FC<OutagePromptProps> = (props) => {
  const { outageStatus, msg } = props;

  const renderIcon = () => {
    return outageStatus == 'FLUCTUATE' ? <Alert /> : <AlertRed />;
  };

  const renderPrompt = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {renderIcon()}
        <Text
          style={{ ...styles.textStyle, color: outageStatus == 'DOWN' ? '#BF2600' : '#01475B' }}
        >
          {`${msg} experiencing high failures. Please try another payment option, if possible.`}
        </Text>
      </View>
    );
  };

  return outageStatus == 'FLUCTUATE' || outageStatus == 'DOWN' ? (
    <View
      style={{
        ...styles.container,
        backgroundColor: outageStatus == 'DOWN' ? '#FFEBE6' : '#FCFDDA',
      }}
    >
      {renderPrompt()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    marginLeft: 9,
    flexShrink: 1,
  },
});
