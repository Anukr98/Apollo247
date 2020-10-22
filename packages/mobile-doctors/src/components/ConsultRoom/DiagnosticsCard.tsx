import { DiagnosticsCardStyles } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosticsCard.styles';
import React from 'react';
import { StyleProp, Text, View, ViewStyle, TouchableOpacity } from 'react-native';

const styles = DiagnosticsCardStyles;

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string | null;
  subText?: string;
  icon?: Element;
  onPress?: () => void;
}

export const DiagnosicsCard: React.FC<CapsuleViewProps> = (props) => {
  const { subText, onPress } = props;
  return (
    <TouchableOpacity activeOpacity={1} onPress={() => (onPress ? onPress() : null)}>
      <View style={[styles.containerStyle, props.containerStyle]}>
        <View style={styles.textViewStyle}>
          <Text numberOfLines={1} style={[styles.doctorNameStyles]}>
            {props.diseaseName}
          </Text>
          {subText ? <Text style={styles.subtextStyle}>{subText}</Text> : null}
        </View>
        <View style={styles.iconContainer}>{props.icon}</View>
      </View>
    </TouchableOpacity>
  );
};
