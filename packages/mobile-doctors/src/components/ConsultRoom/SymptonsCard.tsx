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
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
    // marginTop: 16,
    // marginBottom: 14,
  },

  doctorNameStyles: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 1),
    marginLeft: 12,
    marginTop: 12,
  },
  tabdata: {
    ...theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE, 1, 18, 0),
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
  details?: string;
  onPressIcon?: () => void;
  editIcon?: Element;
  onPressEditIcon?: () => void;
}

export const SymptonsCard: React.FC<CapsuleViewProps> = (props) => {
  const {
    days,
    howoften,
    seviarity,
    details,
    editIcon,
    icon,
    onPressIcon,
    onPressEditIcon,
  } = props;

  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <View style={{ marginBottom: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text numberOfLines={1} style={styles.doctorNameStyles}>
            {props.diseaseName}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {editIcon && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => onPressEditIcon && onPressEditIcon()}
              >
                <View style={{ marginTop: 12, marginRight: 20 }}>{editIcon}</View>
              </TouchableOpacity>
            )}
            {icon && (
              <TouchableOpacity activeOpacity={1} onPress={() => onPressIcon && onPressIcon()}>
                <View style={{ marginTop: 12, marginRight: 12 }}>{icon}</View>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{ marginTop: -5 }}>
          {days && (
            <Text numberOfLines={1} style={styles.tabdata}>
              {days}
            </Text>
          )}
          {howoften && (
            <Text numberOfLines={1} style={styles.tabdata}>
              {howoften}
            </Text>
          )}
          {seviarity && (
            <Text numberOfLines={1} style={styles.tabdata}>
              {seviarity}
            </Text>
          )}
          {details && <Text style={styles.tabdata}>{details}</Text>}
        </View>
      </View>
    </View>
  );
};
