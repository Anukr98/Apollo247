import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacityProps, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';
import ConsultationHoursCardStyles from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard.styles';

const styles = ConsultationHoursCardStyles;

export interface ConsultationHoursCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  days?: string;
  timing?: string;
  type: 'fixed' | 'can-change';
  isAvailableForOnlineConsultation?: string;
  //isAvailableForPhysicalConsultation?: string;
  onPress?: TouchableOpacityProps['onPress'];
  disabled?: boolean;
}

export const ConsultationHoursCard: React.FC<ConsultationHoursCardProps> = (props) => {
  // const consultation = [
  //   props.isAvailableForOnlineConsultation ? 'Online' : '',
  //   props.isAvailableForPhysicalConsultation ? 'Physical' : '',
  // ]
  //   .filter((i) => i)
  //   .join(',');
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <View style={styles.rowSpaceBetween}>
        <Text style={styles.consultationTiming}>{props.timing}</Text>
        <Text style={styles.fixedSlotText}>{props.type == 'fixed' ? '(FIXED)' : ''}</Text>
      </View>
      <View style={[styles.rowSpaceBetweendays]}>
        <Text style={styles.daysText}>{props.days}</Text>
        <View style={styles.separator}></View>
        <Text style={styles.consultationText}>{props.isAvailableForOnlineConsultation}</Text>
      </View>
    </View>
  );
};
