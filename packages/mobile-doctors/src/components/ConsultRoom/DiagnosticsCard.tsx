import DiagnosticsCardStyles from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosticsCard.styles';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

const styles = DiagnosticsCardStyles;

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
