import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacityProps, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    marginTop: 16,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  rowSpaceBetweendays: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  consultationTiming: {
    ...theme.fonts.IBMPlexSansMedium(20),
    color: theme.colors.darkBlueColor(),
    letterSpacing: 0.09,
  },
  fixedSlotText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#ff748e',
  },
  daysText: {
    ...theme.fonts.IBMPlexSansLight(12),
    fontFamily: 'IBMPlexSans',
    color: '#02475b',
    letterSpacing: 0.05,
    marginBottom: 19,
    //marginHorizontal: 16,
  },
  separator: {
    height: 16,
    width: 1,
    marginRight: 0,
    marginLeft: 15,
    backgroundColor: '#02475b',
    marginTop: -15,
  },
  consultationText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    letterSpacing: 0.05,
    color: '#658f9b',
    marginBottom: 19,
    marginHorizontal: 16,
  },
});

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
