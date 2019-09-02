import React, { useEffect, useRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  TextInputKeyPressEventData,
  NativeSyntheticEvent,
  KeyboardTypeOptions,
  TextInputProps,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInput: {
    height: 50,
    width: 50,
    borderBottomWidth: 4,
    margin: 5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '500',
    color: '#000000',
  },
  textInputStyle: {
    borderBottomWidth: 2,
    width: '14%',
    margin: 0,
    height: 48,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

export interface OTPTextViewProps {
  defaultValue?: string;
  inputCount?: number;
  tintColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textInputStyle?: StyleProp<ViewStyle>;
  handleTextChange?: (org0: string) => void;
  value?: string;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  textContentType?: TextInputProps;
}

export const OTPTextView: React.FC<OTPTextViewProps> = (props) => {
  const [focusedInput, setFocusedInput] = useState<number>(0);
  const [otpText, setotpText] = useState<string[]>([]);
  const arrayRef = useRef<(TextInput | null)[]>([]);

  const {
    defaultValue,
    inputCount = 4,
    tintColor,
    containerStyle,
    // textInputStyle,
    value,
    // ...textInputProps
  } = props;

  const TextInputs = [];
  useEffect(() => {
    if (otpText.length === 0) {
      arrayRef.current && arrayRef.current[0]!.focus();
    }
  }, [otpText.length]);

  useEffect(() => {
    console.log(value, 'value');
    if (value && value.length === 6) {
      setotpText(value.split(''));
      // arrayRef.current && arrayRef.current[5].focus();
    }
    if (value === '') {
      setotpText(value.split(''));
      arrayRef.current && arrayRef.current[0]!.focus();
    }
  }, [value]);

  const onTextChange = (text: string, i: number) => {
    const { inputCount = 4, handleTextChange } = props;
    if (text.match(/[0-9]/)) {
      otpText[i] = text;
      setotpText(otpText);
      handleTextChange && handleTextChange(otpText.join(''));
      if (text.length === 1 && i !== inputCount - 1) {
        arrayRef.current && arrayRef.current[i + 1]!.focus();
      }
    }
  };

  const onInputFocus = (i: number) => {
    setFocusedInput(i);
  };

  const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, i: number) => {
    const otpArray = [...otpText];

    if (e.nativeEvent.key === 'Backspace') {
      if (otpArray[i] === '' && i !== 0) {
        otpArray[i - 1] = '';
        arrayRef.current && arrayRef.current[i - 1]!.focus();
      } else {
        otpArray[i] = '';
      }
    }
    props.handleTextChange && props.handleTextChange(otpArray.join(''));
    setotpText(otpArray);
  };

  for (let i = 0; i < inputCount; i += 1) {
    const defaultChars: string[] = [];
    const inputStyle = [styles.textInput, styles.textInputStyle, { borderColor: tintColor }];
    if (focusedInput === i) {
      inputStyle.push({ borderColor: tintColor });
    }

    TextInputs.push(
      <TextInput
        ref={(ref) => (arrayRef.current[i] = ref)}
        key={i}
        defaultValue={defaultValue ? defaultChars[i] : ''}
        style={inputStyle}
        maxLength={1}
        onFocus={() => onInputFocus(i)}
        onChangeText={(text) => onTextChange(text, i)}
        multiline={false}
        value={otpText[i] || ''}
        onKeyPress={(e) => onKeyPress(e, i)}
        keyboardType="numeric"
        editable={props.editable}
        textContentType={'oneTimeCode'}
      />
    );
  }
  return <View style={[styles.container, containerStyle]}>{TextInputs}</View>;
};
