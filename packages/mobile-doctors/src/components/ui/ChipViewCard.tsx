import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  receiveText: {
    color: '#ffffff',
    ...theme.fonts.IBMPlexSansSemiBold(12),
    textAlign: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 10,
    letterSpacing: 0.02,
  },
  blankText: {
    color: '#00b38e',
    ...theme.fonts.IBMPlexSansMedium(12),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 4,
    paddingRight: 10,
    letterSpacing: 0.02,
  },

  containerSelectedStyle: {
    borderRadius: 16,
    backgroundColor: '#00b38e',
  },
  containerUnSelectedStyle: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderColor: '#00b38e',
    borderWidth: 1,
  },
  commonview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
});

export interface ChipViewCardProps {
  text: string;
  selected: boolean;
  icon?: Element;
  containerUnSelectedStyle?: StyleProp<ViewStyle>;
  containerSelectedStyle?: StyleProp<ViewStyle>;
  textUnSelectedStyle?: StyleProp<TextStyle>;
  textSelectedStyle?: StyleProp<TextStyle>;
  container?: StyleProp<ViewStyle>;
}

export const ChipViewCard: React.FC<ChipViewCardProps> = (props) => {
  return (
    <View style={props.container}>
      {props.selected ? (
        <>
          <View style={[styles.containerSelectedStyle, props.containerSelectedStyle]}>
            <View style={styles.commonview}>
              <Text style={[styles.receiveText, props.textSelectedStyle]}>{props.text}</Text>
              <View style={{ margin: 3 }}>{props.icon}</View>
            </View>
          </View>
        </>
      ) : (
        <View style={[styles.containerUnSelectedStyle, props.containerUnSelectedStyle]}>
          <View style={styles.commonview}>
            <Text style={[styles.blankText, props.textUnSelectedStyle]}>{props.text}</Text>
            <View style={{ margin: 3 }}>{props.icon}</View>
          </View>
        </View>
      )}
    </View>
  );
};
