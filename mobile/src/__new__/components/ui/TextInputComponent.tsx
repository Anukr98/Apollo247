import { View, Text, TextInput, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  mainveiw: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 10, //6,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginTop: 5,
    color: theme.colors.INPUT_TEXT,
    marginBottom: Platform.OS === 'ios' ? 6 : 5,
  },
  textInputStyle: {
    // backgroundColor: 'red',
    // height: 35,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
    borderBottomWidth: 2,
    paddingBottom: 3,
    paddingLeft: Platform.OS === 'ios' ? 0 : -3,
    paddingTop: 0,
  },
  requiredindicationText: {
    backgroundColor: 'transparent',
    color: 'rgb(248, 104, 122)',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  textview: {
    flexDirection: 'row',
  },
  placeholderTextColor: theme.colors.placeholderTextColor,
});

export interface textInputComponentProps {
  conatinerstyles: StyleProp<ViewStyle>;
  label: string;
  noInput: string;
  placeholder: string;
  value: string;
  inputStyle: StyleProp<ViewStyle>;
  multiline: boolean;
  numberOfLines: number;
  placeholderTextColor: string;
  onFocus: () => null;
  onChangeText: () => null;
  underlineColorAndroid: string;
  autoCorrect: boolean;
  width: number;
}

export const TextInputComponent: React.FC<textInputComponentProps> = (props) => {
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
          placeholderTextColor={styles.placeholderTextColor}
          onFocus={props.onFocus}
          onChangeText={props.onChangeText}
          underlineColorAndroid={props.underlineColorAndroid}
          autoCorrect={props.autoCorrect}
        />
      )}
    </View>
  );
};
