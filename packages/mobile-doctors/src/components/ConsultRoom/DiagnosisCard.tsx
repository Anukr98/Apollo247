import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 16,
    backgroundColor: '#00b38e',
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: 1,
    marginTop: 12,
    flexWrap: 'wrap',
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#ffffff',
    marginHorizontal: 12,
    marginVertical: 7,
  },
});

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string;
  icon?: Element;
}

export const DiagnosisCard: React.FC<CapsuleViewProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <Text numberOfLines={1} style={[styles.doctorNameStyles, { flex: 0.9 }]}>
        {props.diseaseName}
      </Text>
      <View style={{ margin: 5, flex: 0 }}>{props.icon}</View>
    </View>
  );
};
