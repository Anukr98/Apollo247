import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyle: {
    // borderRadius: 16,
    //backgroundColor: '#00b38e',
    // justifyContent: 'center',
    // alignItems: 'center',
    flexDirection: 'row',
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#0087ba',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  desc: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#02475b',
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
});

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
