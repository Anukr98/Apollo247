import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';
import CapsuleViewStyles from '@aph/mobile-doctors/src/components/ui/CapsuleView.styles';

const styles = CapsuleViewStyles;

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
