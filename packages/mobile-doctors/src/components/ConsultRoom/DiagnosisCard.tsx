import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { theme } from '../../theme/theme';
import { DiagonisisRemove } from '@aph/mobile-doctors/src/components/ui/Icons';
import DiagnosisCardStyles from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosisCard.styles';
const { width, height } = Dimensions.get('window');

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
      <Text style={styles.diseaseNameStyles} numberOfLines={1}>
        {props.diseaseName}
      </Text>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
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
