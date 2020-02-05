import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ScrollView,
} from 'react-native';

const styles = StyleSheet.create({
  containerStyle: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 16,
    elevation: 16,
    opacity: 1,
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
  viewStyles: { flexDirection: 'row', justifyContent: 'space-between' },
});

export type Option = {
  icon?: Element;
  optionText: string;
  onPress?: () => void;
};

export interface DropDownProps {
  containerStyle?: StyleProp<ViewStyle>;
  options: Option[];
  viewStyles?: StyleProp<ViewStyle>;
  underlineStyles?: StyleProp<ViewStyle>;
}

export const DropDown: React.FC<DropDownProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <ScrollView
        bounces={false}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
      >
        {props.options.map((option, index, array) => {
          return (
            <TouchableOpacity onPress={option.onPress}>
              {/* <View style={{ flexDirection: 'row' }}> */}
              <View style={[styles.viewStyles, props.viewStyles]}>
                <View style={{ alignItems: 'flex-end', width: 24 }}>
                  {option.icon ? option.icon : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.descriptiontext}>{option.optionText}</Text>
                </View>
              </View>
              {/* {index < array.length - 1 ? <View style={styles.underline} /> : null} */}
              {index < array.length - 1 ? (
                <View style={[styles.underline, props.underlineStyles]} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
