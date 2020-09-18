import SymptonsCardStyles from '@aph/mobile-doctors/src/components/ConsultRoom/SymptonsCard.styles';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = SymptonsCardStyles;

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
          <Text style={styles.doctorNameStyles}>{props.diseaseName}</Text>
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
        {days || howoften || seviarity || details ? (
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
        ) : null}
      </View>
    </View>
  );
};
