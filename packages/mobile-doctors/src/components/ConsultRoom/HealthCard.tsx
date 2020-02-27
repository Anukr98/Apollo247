import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';
import HealthCardStyles from '@aph/mobile-doctors/src/components/ConsultRoom/HealthCard.styles';

const styles = HealthCardStyles;

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string;
  icon?: Element;
  description?: string;
}

export const HealthCard: React.FC<CapsuleViewProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <View style={{ margin: 5, height: 90, width: 90 }}>{props.icon}</View>
      <View
        style={{
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          marginTop: 30,
          marginLeft: 12,
        }}
      >
        <Text numberOfLines={1} style={styles.doctorNameStyles}>
          {props.diseaseName}
        </Text>
        <Text numberOfLines={1} style={styles.desc}>
          {props.description}
        </Text>
      </View>
    </View>
  );
};
