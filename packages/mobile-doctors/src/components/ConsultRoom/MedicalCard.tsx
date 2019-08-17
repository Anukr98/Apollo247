import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#02475b',
    marginTop: 12,
    //marginBottom: 14,
    marginLeft: 12,
  },
  tabdata: {
    fontFamily: 'IBMPlexSans',
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 14,
    letterSpacing: 0.02,
    color: '#02475b',
    marginBottom: 14,
    marginLeft: 12,
  },
});

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string;
  icon?: Element;
  tabDesc?: string;
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
        <View style={{ marginTop: 12, marginRight: 12 }}>{props.icon}</View>
      </View>
      <Text numberOfLines={1} style={styles.tabdata}>
        {props.tabDesc}
      </Text>
    </View>
  );
};
