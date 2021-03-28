import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import {
  CheckedIcon,
  CrossYellow,
  PrescriptionIcon,
  UnCheck,
  GreenTickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  upperContainer: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#rgba(2,71,91, 0.2)',
    marginLeft: 16,
    paddingBottom: 6,
  },
});

export interface EPrescriptionCardProps {
  style?: StyleProp<ViewStyle>;
  doctorName?: string;
  date?: string;
  forPatient?: string;
  medicines?: string;
  actionType: 'selection' | 'removal';
  isSelected?: boolean;
  isDisabled?: boolean;
  onRemove?: () => void;
  onSelect?: (isSelected: boolean) => void;
  showTick?: boolean;
}

export const EPrescriptionCard: React.FC<EPrescriptionCardProps> = (props) => {
  const {
    doctorName,
    date,
    forPatient,
    medicines,
    onRemove,
    onSelect,
    actionType,
    isSelected,
    isDisabled,
    showTick,
  } = props;
  return (
    <View>
      <View
        style={[
          {
            ...theme.viewStyles.cardViewStyle,
            shadowRadius: 4,
            paddingTop: 16,
            paddingBottom: 8,
            marginHorizontal: 10,
            backgroundColor: isDisabled
              ? theme.colors.DEFAULT_BACKGROUND_COLOR
              : theme.colors.WHITE,
          },
          props.style,
        ]}
      >
        <View style={{ flexDirection: 'row', flex: 1, paddingHorizontal: 10 }}>
          <PrescriptionIcon />
          <View style={styles.upperContainer}>
            <Text
              style={{
                flex: 0.85,
                color: theme.colors.LIGHT_BLUE,
                lineHeight: 24,
                textAlign: 'left',
                ...theme.fonts.IBMPlexSansMedium(16),
              }}
            >
              {doctorName}
            </Text>
            <View style={{ flex: 0.15 }}>
              {showTick && (
                <GreenTickIcon
                  style={{
                    width: 20,
                    paddingHorizontal: 8,
                  }}
                />
              )}
              {!isDisabled && !showTick && (
                <TouchableOpacity
                  onPress={() => {
                    actionType == 'removal' ? onRemove!() : onSelect!(!!!isSelected);
                  }}
                  style={{ alignItems: 'flex-end' }}
                >
                  {actionType == 'removal' ? (
                    <CrossYellow />
                  ) : isSelected ? (
                    <CheckedIcon />
                  ) : (
                    <UnCheck />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <View style={{ marginLeft: 43 }}>
          <View
            style={{
              flexDirection: 'row',
              paddingTop: 5,
              paddingBottom: 3.5,
            }}
          >
            <Text
              style={{
                flex: 1,
                color: theme.colors.TEXT_LIGHT_BLUE,
                textAlign: 'left',
                ...theme.fonts.IBMPlexSansMedium(14),
                lineHeight: 20,
                letterSpacing: 0.04,
              }}
              numberOfLines={1}
            >
              {date}
            </Text>
            <View
              style={{
                borderRightWidth: 0.5,
                borderBottomColor: '#02475b',
                opacity: 0.2,
                marginHorizontal: 12,
              }}
            />
            <Text
              style={{
                flex: 1,
                paddingLeft: 19,
                color: theme.colors.TEXT_LIGHT_BLUE,
                textAlign: 'left',
                ...theme.fonts.IBMPlexSansMedium(14),
                lineHeight: 20,
                letterSpacing: 0.04,
              }}
            >
              {forPatient}
            </Text>
          </View>

          {!!medicines && (
            <>
              <View
                style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: 'rgba(2, 71, 91, 0.2)',
                }}
              />
              <Text
                style={{
                  marginTop: 7.5,
                  color: theme.colors.SKY_BLUE,
                  textAlign: 'left',
                  ...theme.fonts.IBMPlexSansMedium(12),
                }}
              >
                {medicines}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};
