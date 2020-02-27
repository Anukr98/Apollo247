import React from 'react';
import { View, Text, StyleSheet, TouchableOpacityProps, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

import { ArrowRight } from '@aph/mobile-doctors/src/components/ui/Icons';
import SmartPrescriptionCardStyles from '@aph/mobile-doctors/src/components/ui/SmartPrescriptionCard.styles';

const styles = SmartPrescriptionCardStyles;

export interface SmartPrescriptionCardProps {
  title?: any;
  rightIcon?: React.ReactNode;
  onPressTitle?: TouchableOpacityProps['onPress'];
  onPressrightIcon?: TouchableOpacityProps['onPress'];
}

export const SmartPrescriptionCard: React.FC<SmartPrescriptionCardProps> = (props) => {
  const { title, rightIcon } = props;
  return (
    <View style={styles.containerStyle}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 0.9 }}>
          <TouchableOpacity activeOpacity={1} onPress={props.onPressTitle}>
            <Text style={styles.titleStyle}>{title}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <TouchableOpacity activeOpacity={1} onPress={props.onPressrightIcon}>
            {rightIcon ? rightIcon : <ArrowRight />}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.seperatorline}></View>
    </View>
  );
};
