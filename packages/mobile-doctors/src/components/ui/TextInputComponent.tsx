import React, { ReactNode } from 'react';
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import TextInputComponentStyles from '@aph/mobile-doctors/src/components/ui/TextInputComponent.styles';

const styles = TextInputComponentStyles;

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
  underlineColorAndroid?: string;
  autoCorrect?: boolean;
  width?: number;
  textInputprops?: TextInputProps;
  editable?: boolean;
  selectTextOnFocus?: boolean;
  maxLength?: TextInputProps['maxLength'];
  keyboardType?: TextInputProps['keyboardType'];
  icon?: ReactNode;
  onTouchStart?: TouchableOpacityProps['onPress'];
  autoFocus?: boolean;
}

export const TextInputComponent: React.FC<TextInputComponentProps> = (props) => {
  return (
    <View style={[styles.mainveiw, props.conatinerstyles]}>
      {props.label && (
        <View style={styles.textview}>
          <Text style={[styles.labelStyle, props.labelStyle]}>{props.label}</Text>
        </View>
      )}
      {props.noInput ? null : (
        <TextInput
          autoFocus={props.autoFocus}
          value={props.value}
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
          editable={props.editable}
          returnKeyType={props.keyboardType === 'numeric' ? 'done' : 'default'}
          onTouchStart={props.onTouchStart}
        />
      )}
      {props.icon && <View style={styles.iconStyle}>{props.icon}</View>}
    </View>
  );
};

TextInputComponent.defaultProps = {
  autoCorrect: false,
};
