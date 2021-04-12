import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface ChatDisablePromptProps {
  followChatLimit: number;
}

export const ChatDisablePrompt: React.FC<ChatDisablePromptProps> = (props) => {
  const { followChatLimit } = props;
  return (
    <View style={styles.container}>
      <Text style={styles.alertMsg}>
        {`We request you to wait for the doctor’s response to your previous queries, this may take a few hours. You can send ${followChatLimit} more text messages after the doctor replies. If you are required to share medical reports, please use the upload option.`}
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
