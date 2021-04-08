import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PayTm, PayU } from '@aph/mobile-patients/src/components/ui/Icons';
export interface SecureTagsProps {}

export const SecureTags: React.FC<SecureTagsProps> = (props) => {
  const renderMsg = () => {
    return <Text style={styles.SecureMsg}>100% Secured Payments</Text>;
  };

  const renderIcons = () => {
    return (
      <View style={styles.subCont}>
        <Text style={styles.powered}>Powered By</Text>
        <PayTm style={styles.paytm} />
        <PayU />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderMsg()}
      {renderIcons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    alignItems: 'center',
  },
  subCont: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9,
  },
  SecureMsg: {
    color: '#01475B',
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
  },
  powered: {
    ...theme.fonts.IBMPlexSansRegular(13),
    lineHeight: 17,
    color: '#01475B',
    marginRight: 10,
  },
  paytm: {
    marginRight: 5,
    width: 54,
    height: 17,
  },
});
