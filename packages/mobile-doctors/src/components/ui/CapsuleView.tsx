import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 10,
    backgroundColor: 'rgba(0, 135, 186,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: '#0087ba',
    textAlign: 'center',
    marginHorizontal: 12,
    marginVertical: 7,
    letterSpacing: 0.5,
  },
});

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string;
  doctorNameStyles?: StyleProp<ViewStyle>;
}

export const CapsuleView: React.FC<CapsuleViewProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      {/* <Text numberOfLines={1} style={styles.doctorNameStyles}> */}
      <Text numberOfLines={1} style={[styles.doctorNameStyles, props.doctorNameStyles]}>
        {props.diseaseName}
      </Text>
    </View>
  );
};
