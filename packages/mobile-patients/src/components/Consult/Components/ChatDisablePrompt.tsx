import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface ChatDisablePromptProps {}

export const ChatDisablePrompt: React.FC<ChatDisablePromptProps> = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.alertMsg}>
        We request you to wait for the doctor’s response, this may take a few hours. You can send 3
        more messages once the doctor has responded to your previous queries.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#F3E3E3',
    bottom: 66,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  alertMsg: {
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 18,
    color: '#02475B',
    marginLeft: 15,
    marginRight: 10,
    marginVertical: 12,
  },
});
