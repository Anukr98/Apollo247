import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';

const styles = StyleSheet.create({
  radioButtonContainer: {
    flexDirection: 'row',
  },
  radioButtonTextView: {
    flex: 1,
    marginLeft: 16,
  },
  radioButtonTitle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginTop: 8,
  },
});

export interface RadioSelectionItemProps {
  isSelected: boolean;
  onPress: (isSelected: boolean) => void;
  title: string;
  hideSeparator?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  separatorStyle?: StyleProp<ViewStyle>;
  textStyle?:StyleProp<TextStyle>;
  radioSubBody?:React.ReactNode;
}

export const RadioSelectionItem: React.FC<RadioSelectionItemProps> = (props) => {
  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => props.onPress(!props.isSelected)}
        style={[styles.radioButtonContainer, props.containerStyle]}
      >
        {props.isSelected ? <RadioButtonIcon /> : <RadioButtonUnselectedIcon />}
        <View style={styles.radioButtonTextView}>
          <Text style={[styles.radioButtonTitle, props.textStyle]}>{props.title}</Text>
          {!props.hideSeparator && <View style={[styles.separator, props.separatorStyle]} />}
        </View>
      </TouchableOpacity>
      {props.radioSubBody}
    </>
  );
};
