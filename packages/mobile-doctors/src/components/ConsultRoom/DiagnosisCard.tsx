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
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.APP_GREEN,
        borderRadius: 100,
        padding: 6,
        margin: 5,
        maxWidth: width - 60,
      }}
    >
      <Text
        style={{
          ...theme.viewStyles.text('SB', 14, theme.colors.WHITE),
          marginHorizontal: 10,
          padding: 1,
          marginVertical: Platform.OS === 'android' ? -2 : 0,
          maxWidth: '90%',
        }}
        numberOfLines={1}
      >
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
