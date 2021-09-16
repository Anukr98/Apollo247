import React, { ReactNode } from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

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
  iconStyle: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  drPrefixViewStyle: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    alignItems: 'flex-end',
    paddingRight: 3,
  },
  drPrefixTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingLeft: Platform.OS === 'ios' ? 0 : -3,
    paddingTop: Platform.OS === 'ios' ? 0 : 3,
    color: theme.colors.SHERPA_BLUE,
  },
});

export interface TextInputComponentProps {
  conatinerstyles?: StyleProp<ViewStyle>;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
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
  selection?: TextInputProps['selection'];
  underlineColorAndroid?: string;
  autoCorrect?: boolean;
  editable?: boolean;
  showDrPrefix?: boolean;
  onPressNonEditableTextInput?: () => void;
  width?: number;
  textInputprops?: TextInputProps;
  maxLength?: TextInputProps['maxLength'];
  keyboardType?: TextInputProps['keyboardType'];
  icon?: ReactNode;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoFocus?: boolean;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  secureTextEntry?: boolean;
}

export const TextInputComponent: React.FC<TextInputComponentProps> = (props) => {
  const renderTextInput = () => {
    return (
      <TextInput
        secureTextEntry={props.secureTextEntry || false}
        value={props.value}
        editable={props.editable}
        placeholder={props.placeholder ? props.placeholder : ''}
        style={[styles.textInputStyle, props.inputStyle]}
        multiline={props.multiline}
        numberOfLines={props.numberOfLines}
        placeholderTextColor={props.placeholderTextColor || theme.colors.placeholderTextColor}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onChangeText={props.onChangeText}
        underlineColorAndroid={'transparent'}
        autoCorrect={props.autoCorrect}
        selectionColor={theme.colors.INPUT_CURSOR_COLOR}
        maxLength={props.maxLength}
        keyboardType={props.keyboardType}
        {...props.textInputprops}
        returnKeyType={props.keyboardType === 'numeric' ? 'done' : 'default'}
        autoCapitalize={props.autoCapitalize}
        autoFocus={props.autoFocus}
        selection={props.selection}
        onSubmitEditing={props.onSubmitEditing}
      />
    );
  };

  const renderDrPrefixTextInput = (textInput: React.ReactElement) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.drPrefixViewStyle}>
          <Text style={styles.drPrefixTextStyle}>{'Dr.'}</Text>
        </View>
        {textInput}
      </View>
    );
  };

  return (
    <View style={[styles.mainveiw, props.conatinerstyles]}>
      {props.label && (
        <View style={styles.textview}>
          <Text style={[styles.labelStyle, props.labelStyle]}>{props.label}</Text>
        </View>
      )}
      {props.noInput ? null : !!!props.editable ? (
        <TouchableOpacity activeOpacity={1} onPress={props.onPressNonEditableTextInput}>
          {props.showDrPrefix ? renderDrPrefixTextInput(renderTextInput()) : renderTextInput()}
        </TouchableOpacity>
      ) : props.showDrPrefix ? (
        renderDrPrefixTextInput(renderTextInput())
      ) : (
        renderTextInput()
      )}
      {props.icon && <View style={styles.iconStyle}>{props.icon}</View>}
    </View>
  );
};

TextInputComponent.defaultProps = {
  autoCorrect: false,
};
