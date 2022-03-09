import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { LocationOn } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  useAppCommonData,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
const windowWidth = Dimensions.get('window').width;

export interface LocationInfoProps {
  onPressChange: () => void;
}

export const LocationInfo: React.FC<LocationInfoProps> = (props) => {
  const { setLocationDetails, locationDetails } = useAppCommonData();
  const { onPressChange } = props;

  const renderLocation = () => {
    return (
      <View>
        <Text style={styles.currentLocationTitle}>Your current location</Text>
        <View style={styles.line} />
        <View style={styles.spaceRow}>
          <View style={styles.rowCenter}>
            <LocationOn />
            <Text style={styles.savedLocationText}>
              {locationDetails?.city}{' '}
              {locationDetails?.pincode ? `, ${locationDetails?.pincode}` : ''}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.5} onPress={onPressChange}>
            <Text style={styles.changeLocationBtnTxt}>CHANGE LOCATION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return <View style={styles.container}>{renderLocation()}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
    marginTop: 16,
  },
  line: {
    width: '100%',
    height: 0.8,
    backgroundColor: '#ddd',
  },
  currentLocationTitle: {
    ...theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE),
    paddingBottom: 10,
    paddingHorizontal: 14,
  },
  savedLocationText: {
    marginLeft: 6,
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE),
    width: windowWidth - 230,
  },
  changeLocationBtnTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.TANGERINE_YELLOW),
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    paddingHorizontal: 12,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
