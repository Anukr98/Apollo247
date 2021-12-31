import React from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface InputCheckBoxProps {
  label?: string;
  checked: boolean;
  onClick: () => void;
}
export const InputCheckBox: React.FC<InputCheckBoxProps> = (props) => {
  return (
    <TouchableOpacity style={styles.checkboxMainContainer} onPress={() => props.onClick()}>
      <View style={styles.checkboxContainer}>
        {props.checked && <FontAwesome5 name="check" size={10} color={theme.colors.LIGHT_BLUE} />}
      </View>
      <View>
        <Text>{props.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxContainer: {
    width: 15,
    height: 15,
    borderColor: theme.colors.LIGHT_BLUE,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginRight: 8,
  },
});
