import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { LocationOn } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  autoCompletePlaceSearch,
  getPlaceInfoByLatLng,
  getPlaceInfoByPlaceId,
  GooglePlacesType,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { g, getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  containerStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 15,
    elevation: 15,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    width: 235,
    padding: 16,
    marginTop: 40,
  },
  currentLocationTextStyle: {
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  locationOnViewStyle: {
    marginLeft: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 10,
  },
  searchListViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    paddingVertical: 7,
  },
  searchListItemStyle: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

export interface LocationSearchPopupProps {
  containerStyle?: StyleProp<ViewStyle>;
  onPressLocationSearchItem: (value: string) => void;
  location?: string;
  onClose?: () => void;
}

export const LocationSearchPopup: React.FC<LocationSearchPopupProps> = (props) => {
  const [currentLocation, setCurrentLocation] = useState<string>(props.location || '');
  const [locationSearchList, setLocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );
  const { setLocationDetails, locationForDiagnostics } = useAppCommonData();
  const { clearCartInfo } = useDiagnosticsCart();

  const autoSearch = (searchText: string) => {
    getNetStatus()
      .then((status) => {
        if (status) {
          autoCompletePlaceSearch(searchText)
            .then((obj) => {
              try {
                if (obj.data.predictions) {
                  const address = obj.data.predictions.map(
                    (item: {
                      place_id: string;
                      structured_formatting: {
                        main_text: string;
                      };
                    }) => {
                      return {
                        name: item.structured_formatting.main_text,
                        placeId: item.place_id,
                      };
                    }
                  );
                  setLocationSearchList(address);
                }
              } catch (e) {
                CommonBugFender('LocationSearchPopup_autoSearch_try', e);
              }
            })
            .catch((error) => {
              CommonBugFender('LocationSearchPopup_autoSearch', error);
              console.log(error);
            });
        }
      })
      .catch((e) => {
        CommonBugFender('LocationSearchPopup_getNetStatus_autoSearch', e);
      });
  };

  const findAddrComponents = (
    proptoFind: GooglePlacesType,
    addrComponents: {
      long_name: string;
      short_name: string;
      types: GooglePlacesType[];
    }[]
  ) => {
    return (
      (addrComponents.find((item) => item.types.indexOf(proptoFind) > -1) || {}).long_name || ''
    );
  };

  const saveLatlong = (item: { name: string; placeId: string }) => {
    // update address to context here
    getPlaceInfoByPlaceId(item.placeId)
      .then((response) => {
        const addrComponents = g(response, 'data', 'result', 'address_components') || [];
        const { lat, lng } = g(response, 'data', 'result', 'geometry', 'location')! || {};
        const city =
          findAddrComponents('locality', addrComponents) ||
          findAddrComponents('administrative_area_level_2', addrComponents);
        if (
          city.toLowerCase() !=
          ((locationForDiagnostics && locationForDiagnostics.city) || '').toLowerCase()
        ) {
          clearCartInfo && clearCartInfo();
        }
        if (addrComponents.length > 0) {
          console.log({
            displayName: item.name,
            latitude: lat,
            longitude: lng,
            area: [
              findAddrComponents('route', addrComponents),
              findAddrComponents('sublocality_level_2', addrComponents),
              findAddrComponents('sublocality_level_1', addrComponents),
            ]
              .filter((i) => i)
              .join(', '),
            city,
            state: findAddrComponents('administrative_area_level_1', addrComponents),
            country: findAddrComponents('country', addrComponents),
            pincode: findAddrComponents('postal_code', addrComponents),
            lastUpdated: new Date().getTime(),
          });

          const locationData: LocationData = {
            displayName: item.name,
            latitude: lat,
            longitude: lng,
            area: [
              findAddrComponents('route', addrComponents),
              findAddrComponents('sublocality_level_2', addrComponents),
              findAddrComponents('sublocality_level_1', addrComponents),
            ]
              .filter((i) => i)
              .join(', '),
            city,
            state: findAddrComponents('administrative_area_level_1', addrComponents),
            country: findAddrComponents('country', addrComponents),
            pincode: findAddrComponents('postal_code', addrComponents),
            lastUpdated: new Date().getTime(),
          };

          setLocationDetails!(locationData);

          getPlaceInfoByLatLng(lat, lng)
            .then((response) => {
              const addrComponents =
                g(response, 'data', 'results', '0' as any, 'address_components') || [];
              if (addrComponents.length > 0) {
                setLocationDetails!({
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                  lastUpdated: new Date().getTime(),
                });
              }
            })
            .catch((error) => {
              CommonBugFender('LocationSearchPopup_saveLatlong', error);
            });
        }
      })
      .catch((error) => {
        CommonBugFender('LocationSearchPopup_saveLatlong', error);
        console.log('saveLatlong error\n', error);
      });
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.containerStyle}
      onPress={() => {
        props.onClose && props.onClose();
      }}
    >
      <View style={styles.cardViewStyle}>
        <Text style={styles.currentLocationTextStyle}>Current Location</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 7 }}>
            <TextInputComponent
              textInputprops={{ autoFocus: true }}
              value={currentLocation}
              onChangeText={(value) => {
                setCurrentLocation(value);
                autoSearch(value);
              }}
            />
          </View>
          <View style={styles.locationOnViewStyle}>
            <LocationOn />
          </View>
        </View>
        <View>
          {locationSearchList.map((item, i) => (
            <View key={i} style={styles.searchListViewStyle}>
              <Text
                style={styles.searchListItemStyle}
                onPress={() => {
                  setCurrentLocation(item.name);
                  props.onPressLocationSearchItem(item.name);
                  saveLatlong(item);
                  setLocationDetails!({
                    displayName: item.name,
                    city: item.name,
                  } as any);
                }}
              >
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};
