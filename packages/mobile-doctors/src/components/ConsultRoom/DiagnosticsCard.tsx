import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#02475b',
    marginTop: 12,
    marginBottom: 14,
    marginLeft: 12,
  },
});

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string | null;
  icon?: Element;
}

export const DiagnosicsCard: React.FC<CapsuleViewProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <Text numberOfLines={1} style={[styles.doctorNameStyles, { flex: 0.9 }]}>
        {props.diseaseName}
      </Text>
      <View style={{ margin: 12, flex: 0 }}>{props.icon}</View>
    </View>
  );
};
