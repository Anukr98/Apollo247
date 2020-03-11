import ConsultationHoursCardStyles from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard.styles';
import { ConsultMode } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import React from 'react';
import { StyleProp, Text, TouchableOpacityProps, View, ViewStyle } from 'react-native';

const styles = ConsultationHoursCardStyles;

export interface ConsultationHoursCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  days?: string;
  timing?: string;
  type: 'fixed' | 'can-change';
  onPress?: TouchableOpacityProps['onPress'];
  disabled?: boolean;
  consultMode?: ConsultMode;
}

export const ConsultationHoursCard: React.FC<ConsultationHoursCardProps> = (props) => {
  const consultMode =
    props.consultMode === ConsultMode.ONLINE
      ? 'Online'
      : props.consultMode === ConsultMode.PHYSICAL
      ? 'Physical'
      : props.consultMode === ConsultMode.BOTH
      ? 'Online, Physical'
      : '';
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <View style={styles.rowSpaceBetween}>
        <Text style={styles.consultationTiming}>{props.timing}</Text>
        <Text style={styles.fixedSlotText}>{props.type == 'fixed' ? '(FIXED)' : ''}</Text>
      </View>
      <View style={[styles.rowSpaceBetweendays]}>
        <Text style={styles.daysText}>{props.days}</Text>
        <View style={styles.separator}></View>
        <Text style={styles.consultationText}>{consultMode}</Text>
      </View>
    </View>
  );
};
