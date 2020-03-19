import MedicalCardStyles from '@aph/mobile-doctors/src/components/ConsultRoom/MedicalCard.styles';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = MedicalCardStyles;

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string;
  icon?: Element;
  tabDesc?: string;
  onPress?: () => void;
}

export const MedicalCard: React.FC<CapsuleViewProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text numberOfLines={1} style={styles.doctorNameStyles}>
          {props.diseaseName}
        </Text>
        <TouchableOpacity onPress={() => props.onPress && props.onPress()}>
          <View style={{ marginTop: 12, marginRight: 12 }}>{props.icon}</View>
        </TouchableOpacity>
      </View>
      <Text numberOfLines={1} style={styles.tabdata}>
        {props.tabDesc}
      </Text>
    </View>
  );
};
