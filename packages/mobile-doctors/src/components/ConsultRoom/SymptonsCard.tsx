import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TouchableOpacityProps,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
    // marginTop: 16,
    // marginBottom: 14,
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    marginLeft: 12,
    marginTop: 12,
    lineHeight: 20,
  },
  tabdata: {
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#01475b',
    marginLeft: 12,
  },
});

export interface CapsuleViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  diseaseName?: string | null;
  icon?: Element;
  days?: string;
  howoften?: string;
  seviarity?: string;
  onPress?: () => void;
}

export const SymptonsCard: React.FC<CapsuleViewProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <View style={{ marginBottom: 14, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
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
        <View style={{ marginTop: -5 }}>
          <Text numberOfLines={1} style={styles.tabdata}>
            {props.days}
          </Text>
          <Text numberOfLines={1} style={styles.tabdata}>
            {props.howoften}
          </Text>
          <Text numberOfLines={1} style={styles.tabdata}>
            {props.seviarity}
          </Text>
        </View>
      </View>
    </View>
  );
};
