import React from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  mainveiw: {
    width: '100%',
    paddingTop: 6,
    paddingBottom: 10,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginTop: 5,
    color: theme.colors.INPUT_TEXT,
    marginBottom: Platform.OS === 'ios' ? 6 : 5,
  },
  textInputStyle: {
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
    borderBottomWidth: 2,
    paddingBottom: 3,
    paddingLeft: Platform.OS === 'ios' ? 0 : -3,
    paddingTop: 0,
    color: theme.colors.SHERPA_BLUE,
  },
  textview: {
    flexDirection: 'row',
  },
});

export interface TextInputComponentProps {
  conatinerstyles?: StyleProp<ViewStyle>;
  label?: string;
  noInput?: boolean;
  placeholder?: string;
  value?: string;
  inputStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
  placeholderTextColor?: TextInputProps['placeholderTextColor'];
  onFocus?: TextInputProps['onFocus'];
  onBlur?: TextInputProps['onBlur'];
  onChangeText?: TextInputProps['onChangeText'];
  underlineColorAndroid?: string;
  autoCorrect?: boolean;
  width?: number;
  textInputprops?: TextInputProps;
  maxLength?: TextInputProps['maxLength'];
  keyboardType?: TextInputProps['keyboardType'];
}

export const TextInputComponent: React.FC<TextInputComponentProps> = (props) => {
  return (
    <View style={[styles.mainveiw, props.conatinerstyles]}>
      {props.label && (
        <View style={styles.textview}>
          <Text style={styles.labelStyle}>{props.label}</Text>
        </View>
      )}
      {props.noInput ? null : (
        <TextInput
          value={props.value}
          placeholder={props.placeholder ? props.placeholder : ''}
          style={[styles.textInputStyle, props.inputStyle]}
          multiline={props.multiline}
          numberOfLines={props.numberOfLines}
          placeholderTextColor={theme.colors.placeholderTextColor || props.placeholderTextColor}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onChangeText={props.onChangeText}
          underlineColorAndroid={'transparent'}
          autoCorrect={props.autoCorrect}
          selectionColor={theme.colors.INPUT_CURSOR_COLOR}
          maxLength={props.maxLength}
          keyboardType={props.keyboardType}
          {...props.textInputprops}
        />
      )}
    </View>
  );
};

TextInputComponent.defaultProps = {
  autoCorrect: false,
};
