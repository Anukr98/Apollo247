import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
  EditIconNewOrange,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
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
    marginTop: 5,
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
  showMultiLine?: boolean;
  onPress: (isSelected: boolean) => void;
  title: string;
  subtitle?: string;
  subtitleStyle?: StyleProp<TextStyle>;
  hideSeparator?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  separatorStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  radioSubBody?: React.ReactNode;
  showEditIcon?: boolean;
  onPressEdit?: TouchableOpacityProps['onPress'];
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
          {props.showMultiLine && <Text style={props.subtitleStyle}>{props.subtitle}</Text>}
          <Text style={[styles.radioButtonTitle, props.textStyle]}>{props.title}</Text>
          {!props.hideSeparator && <View style={[styles.separator, props.separatorStyle]} />}
        </View>
        {props.showEditIcon ? (
          <TouchableOpacity onPress={props.onPressEdit}>
            <EditIconNewOrange style={{ height: 18, width: 18, resizeMode: 'contain' }} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
      {props.radioSubBody && props.radioSubBody}
    </>
  );
};
