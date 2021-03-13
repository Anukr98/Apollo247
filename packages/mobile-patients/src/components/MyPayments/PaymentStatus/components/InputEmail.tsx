import React, { FC } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';

interface InputEmailProps {
  showEmailInput: boolean;
  emailSent: boolean;
  email: string;
  setEmail: (email: string) => void;
  onPressSend: () => void;
}
const InputEmail: FC<InputEmailProps> = (props) => {
  const { showEmailInput, emailSent, email, setEmail, onPressSend } = props;

  const renderSentMsg = () => {
    const length = email?.length || 0;
    return (
      <View
        style={{ ...styles.inputContainer, justifyContent: length > 20 ? 'center' : undefined }}
      >
        <Text
          style={{
            ...styles.text,
            textAlign: length > 20 ? 'center' : 'auto',
            lineHeight: length > 20 ? 18 : 30,
          }}
        >
          {length < 21
            ? `Invoice has been sent to ${email}!`
            : `Invoice has been sent to ${'\n'} ${email}!`}
        </Text>
      </View>
    );
  };

  const rightIconView = () => {
    return (
      <View style={{ paddingBottom: 0, opacity: isSatisfyingEmailRegex(email.trim()) ? 1 : 0.5 }}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={!isSatisfyingEmailRegex(email.trim())}
          onPress={onPressSend}
        >
          <SearchSendIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderInputEmail = () => {
    return (
      <View style={styles.inputContainer}>
        <View style={{ flex: 0.85 }}>
          <TextInput
            value={`${email}`}
            onChangeText={(email) => setEmail(email)}
            style={styles.inputStyle}
          />
        </View>
        <View style={styles.rightIcon}>{rightIconView()}</View>
      </View>
    );
  };

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  return showEmailInput ? <View>{!emailSent ? renderInputEmail() : renderSentMsg()}</View> : null;
};

const styles = StyleSheet.create({
  inputStyle: {
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansMedium(11),
    color: '#6D7278',
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  text: {
    marginVertical: 4,
    color: 'rgba(74, 165, 74, 0.6)',
    ...theme.fonts.IBMPlexSansMedium(11),
  },
  rightIcon: { flex: 0.15, alignItems: 'flex-end' },
});

export default InputEmail;
