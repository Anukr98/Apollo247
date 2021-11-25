import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { LocationOn } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
const { width } = Dimensions.get('window');
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { NavigationScreenProp, NavigationRoute, NavigationParams } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface LocationOnHeaderProps {
  navigation: NavigationScreenProp<NavigationRoute<{}>, NavigationParams>;
  onLocationChange?: (location?: any) => void;
  isOnlineConsultMode?: boolean | undefined;
  isAvailabilityMode?: boolean | undefined;
  isSpecialityScreen?: boolean | undefined;
  goBack?: boolean;
  postSelectLocation?: (specialityName?: string, specialityId?: string) => void | null;
  postEventClickSelectLocation?: (
    specialityName?: string | '',
    specialityId?: string | '',
    screen?: string | '',
    city?: string | ''
  ) => void;
}
export const LocationOnHeader: React.FC<LocationOnHeaderProps> = (props) => {
  const { locationDetails } = useAppCommonData();
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const { isOnlineConsultMode, isAvailabilityMode, goBack, isSpecialityScreen } = props;
  useEffect(() => {
    setcurrentLocation(locationDetails?.displayName || '');
  }, [locationDetails]);
  const { currentPatient } = useAllCurrentPatients();

  const renderLocationOnHeader = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          props.postSelectLocation && props.postSelectLocation();
          props.navigation.navigate(AppRoutes.SelectLocation, {
            isOnlineConsultMode: isOnlineConsultMode,
            patientId: g(currentPatient, 'id') || '',
            patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
            goBack: goBack,
            goBackCallback: (loc?: any) => {
              props?.onLocationChange && props?.onLocationChange(loc);
            },
            postEventClickSelectLocation: props.postEventClickSelectLocation,
          });
        }}
        style={styles.container}
      >
        <LocationOn />
        {currentLocation ? (
          <Text style={styles.locationText} numberOfLines={1}>
            {isAvailabilityMode || isSpecialityScreen ? 'ALL CITIES' : currentLocation}
          </Text>
        ) : (
          <Text style={[styles.locationText, { marginLeft: 4 }]} numberOfLines={1}>
            {isOnlineConsultMode ? 'ALL CITIES' : 'SELECT LOCATION'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return <View>{renderLocationOnHeader()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    textTransform: 'uppercase',
    maxWidth: width / 2,
  },
});
