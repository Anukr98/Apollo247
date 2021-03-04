import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

export interface SectionHeaderProps {
  leftText: string;
  rightText?: string;
  style?: StyleProp<ViewStyle>;
  leftTextStyle?: StyleProp<TextStyle>;
  rightTextStyle?: StyleProp<TextStyle>;
  onPressRightText?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = (props) => {
  const styles = StyleSheet.create({
    labelView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 4,
      borderBottomWidth: 0.5,
      borderColor: 'rgba(2,71,91, 0.3)',
      marginHorizontal: 20,
    },
    labelTextStyle: {
      color: theme.colors.FILTER_CARD_LABEL,
      ...theme.fonts.IBMPlexSansBold(13),
    },
  });

  const { leftText, rightText, style, leftTextStyle, rightTextStyle, onPressRightText } = props;

  return (
    <View style={[styles.labelView, style]}>
      <Text style={[styles.labelTextStyle, leftTextStyle]}>{leftText}</Text>
      {!!rightText && (
        <Text
          onPress={() => onPressRightText && onPressRightText()}
          style={[styles.labelTextStyle, rightTextStyle]}
        >
          {rightText}
        </Text>
      )}
    </View>
  );
};

export interface SpearatorProps {
  style?: StyleProp<ViewStyle>;
}

export const Spearator: React.FC<SpearatorProps> = (props) => {
  const styles = StyleSheet.create({
    separator: {
      ...theme.viewStyles.separator,
    },
  });

  return <View style={[styles.separator, props.style]} />;
};

export interface BadgeProps {
  label?: number;
  containerStyle?: StyleProp<ViewStyle>;
  badgeLabelStyle?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = (props) => {
  const styles = StyleSheet.create({
    labelView: {
      position: 'absolute',
      top: -10,
      right: -8,
      backgroundColor: '#ff748e',
      height: 14,
      width: 14,
      borderRadius: 7,
      justifyContent: 'center',
      alignItems: 'center',
    },
    labelText: {
      ...theme.fonts.IBMPlexSansBold(9),
      color: theme.colors.WHITE,
    },
  });

  return (
    <View style={[styles.labelView, props.containerStyle]}>
      <Text style={[styles.labelText, props.badgeLabelStyle]}>{props.label}</Text>
    </View>
  );
};
