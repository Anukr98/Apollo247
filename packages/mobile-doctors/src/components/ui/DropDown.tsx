import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

const styles = StyleSheet.create({
  cardContainer: {
    margin: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    padding: 20,
    marginBottom: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  descriptiontext: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(15),
    textAlign: 'left',
  },
  underline: {
    borderBottomColor: '#02475b',
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    opacity: 0.2,
  },
});

export type Option = {
  icon?: Element;
  optionText: string;
  onPress?: () => void;
};

export interface DropDownProps {
  cardContainer?: StyleProp<ViewStyle>;
  options: Option[];
}

export const DropDown: React.FC<DropDownProps> = (props) => {
  return (
    <View style={[styles.cardContainer, props.cardContainer]}>
      {props.options.map((option, index, array) => {
        return (
          <TouchableOpacity onPress={option.onPress}>
            <View style={{ flexDirection: 'row' }}>
              <View>{option.icon ? option.icon : null}</View>
              <Text style={styles.descriptiontext}>{option.optionText}</Text>
            </View>
            {index < array.length - 1 ? <View style={styles.underline} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
