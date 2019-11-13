import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CheckedIcon, CrossYellow, PrescriptionIcon, UnCheck } from './Icons';

const styles = StyleSheet.create({});

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
  } = props;
  return (
    <View>
      <View
        style={[
          {
            ...theme.viewStyles.cardViewStyle,
            shadowRadius: 4,
            padding: 16,
            paddingLeft: 11,
            paddingBottom: 8,
            marginHorizontal: 20,
            backgroundColor: isDisabled
              ? theme.colors.DEFAULT_BACKGROUND_COLOR
              : theme.colors.WHITE,
          },
          props.style,
        ]}
      >
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <PrescriptionIcon />
          <Text
            style={{
              flex: 1,
              color: theme.colors.LIGHT_BLUE,
              lineHeight: 24,
              textAlign: 'left',
              ...theme.fonts.IBMPlexSansMedium(16),
              paddingLeft: 16,
            }}
          >
            {doctorName}
          </Text>
          {!isDisabled && (
            <TouchableOpacity
              onPress={() => {
                actionType == 'removal' ? onRemove!() : onSelect!(!!!isSelected);
              }}
              style={{ flex: 1, alignItems: 'flex-end' }}
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
                // borderBottomColor: 'rgba(2, 71, 91, 0.2)',
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
