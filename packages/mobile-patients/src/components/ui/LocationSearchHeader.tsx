import { CommonBugFender } from '@aph/mobile-patients/src//FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { LocationOff, LocationOn } from '@aph/mobile-patients/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  locationOnContainerStyle: {
    flexDirection: 'row',
    right: 35,
  },
  locationOffContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayLocationTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    textTransform: 'uppercase',
  },
});

export interface LocationSearchHeaderProps {
  containerStyle?: StyleProp<ViewStyle>;
  onLocationProcess: () => void;
}

export const LocationSearchHeader: React.FC<LocationSearchHeaderProps> = (props) => {
  const { locationDetails } = useAppCommonData();
  const { showAphAlert } = useUIElements();

  return (
    <View style={styles.locationOnContainerStyle}>
      {!locationDetails ? (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            getNetStatus()
              .then((status) => {
                if (status) {
                  props.onLocationProcess();
                } else {
                  showAphAlert!({
                    title: 'Oops!',
                    description: 'There is no internet. Please check your internet connection.',
                  });
                }
              })
              .catch((e) => {
                CommonBugFender('LocationSearchView_getNetStatus', e);
              });
          }}
        >
          <LocationOff />
        </TouchableOpacity>
      ) : (
        <View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={props.onLocationProcess}
            style={styles.locationOffContainerStyle}
          >
            {locationDetails ? (
              <Text style={styles.displayLocationTextStyle}>
                {locationDetails.displayName && locationDetails.displayName.length > 15
                  ? `${locationDetails.displayName.substring(0, 15)}...`
                  : locationDetails.displayName}
              </Text>
            ) : null}
            <LocationOn />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
