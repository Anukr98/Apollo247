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
import DropDownStyles from '@aph/mobile-doctors/src/components/ui/DropDown.styles';

const styles = DropDownStyles;

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
