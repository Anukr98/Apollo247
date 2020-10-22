import DiagnosisCardStyles from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosisCard.styles';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = DiagnosisCardStyles;

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string;
  icon?: Element;
  onPressIcon?: () => void;
}

export const DiagnosisCard: React.FC<CapsuleViewProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <Text style={styles.diseaseNameStyles}>{props.diseaseName}</Text>
      <View
        style={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.onPressIcon && props.onPressIcon()}
        >
          {props.icon}
        </TouchableOpacity>
      </View>
    </View>
  );
};
