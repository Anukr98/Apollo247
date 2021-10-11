import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import React, { useEffect, useState, useRef } from 'react';
import {
  Dimensions,
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { LocationIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  doRequestAndAccessLocation,
  doRequestAndAccessLocationModified,
  removeConsecutiveComma,
  formatAddressForApi,
  findAddrComponents,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getLatLongFromAddress,
  getPlaceInfoByLatLng,
  getPlaceInfoByPincode,
  PlacesApiResponse,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';

const FakeMarker = require('@aph/mobile-patients/src/components/ui/icons/ic-marker.webp');
const icon_gps = require('@aph/mobile-patients/src/components/ui/icons/ic_gps_fixed.webp');

const screenHeight = Dimensions.get('window').height;

export type AddressSource =
  | 'My Account'
  | 'Upload Prescription'
  | 'Cart'
  | 'Diagnostics Cart'
  | 'Medicine'
  | 'Tests';

const mapHeight =
  screenHeight > 750
    ? screenHeight / 1.55
    : screenHeight > 700
    ? screenHeight / 1.52
    : screenHeight > 650
    ? Platform.OS == 'android'
      ? screenHeight / 1.7
      : screenHeight / 1.62
    : screenHeight / 1.8;

export interface RegionObject {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapProps
  extends NavigationScreenProps<{
    KeyName?: string;
    addressDetails?: any;
    isChanged?: boolean;
    addOnly?: boolean;
    source?: string;
    ComingFrom?: string;
    updateLatLng?: boolean;
  }> {}

export interface locationResponseProps {
  area?: string;
  city?: string;
  country?: string;
  displayName?: string;
  lastUpdated: number;
  latitude: number;
  longitude: number;
  pincode: string | number;
  state?: string;
}
export const AddAddressNew: React.FC<MapProps> = (props) => {
  const KeyName = props.navigation.getParam('KeyName');
  const addressDetails = props.navigation.getParam('addressDetails');
  const addOnly = props.navigation.getParam('addOnly');
  const source = props.navigation.getParam('source');
  const ComingFrom = props.navigation.getParam('ComingFrom');
  const updateLatLng = props.navigation.getParam('updateLatLng');
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number>(
    KeyName == 'Update' ? Number(addressDetails?.latitude! || 0) : 0
  );
  const [longitude, setLongitude] = useState<number>(
    KeyName == 'Update' ? Number(addressDetails?.longitude! || 0) : 0
  );
  const [latitudeDelta, setLatitudeDelta] = useState<number>(0.002);
  const [longitudeDelta, setLongitudeDelta] = useState<number>(0.002);
  const [addressString, setAddressString] = useState<string>('');
  const [isMapDragging, setMapDragging] = useState<boolean>(false);
  const [locationResponse, setLocationResponse] = useState<any>();
  const [isMapDisabled, setMapDisabled] = useState<boolean>(false);
  const [isConfirmButtonDisabled, setConfirmButtonDisabled] = useState<boolean>(false);
  const { setLoading: setLoadingContext } = useUIElements();
  const { pharmacyLocation, diagnosticLocation } = useAppCommonData();
  const _map = useRef(null);
  const [region, setRegion] = useState({
    latitude: Number(latitude),
    longitude: Number(longitude),
    latitudeDelta: latitudeDelta,
    longitudeDelta: longitudeDelta,
  });

  useEffect(() => {
    //added just to track the crash.
    const firebaseAttributes: FirebaseEvents[FirebaseEventName.ADDADDRESS_LAT_LNG] = {
      latitude: latitude,
      longitude: longitude,
    };
    postFirebaseEvent(FirebaseEventName.ADDADDRESS_LAT_LNG, firebaseAttributes);
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    props.navigation.goBack();
    return true;
  };

  const formatLocalAddress = (address: any) => {
    const newAddress = [
      address?.area,
      address?.city,
      address?.state,
      address?.pincode,
      address?.country,
    ]
      ?.filter((v) => v)
      ?.join(', ');
    return removeConsecutiveComma(newAddress);
  };

  const createAddressToShow = (
    addrComponents: PlacesApiResponse['results'][0]['address_components'],
    latLong: PlacesApiResponse['results'][0]['geometry']['location']
  ) => {
    const { lat, lng } = latLong || {};
    const displayName = findAddrComponents('administrative_area_level_2', addrComponents);
    const area = [
      findAddrComponents('sublocality_level_2', addrComponents),
      findAddrComponents('sublocality_level_1', addrComponents) ||
        findAddrComponents('locality', addrComponents),
    ]
      ?.filter((i) => i)
      ?.join(', ');

    const city = [
      findAddrComponents('locality', addrComponents) ||
        findAddrComponents('administrative_area_level_2', addrComponents),
    ]
      ?.filter((i) => i)
      ?.join(', ');

    const state = findAddrComponents('administrative_area_level_1', addrComponents);
    const pincode = findAddrComponents('postal_code', addrComponents);
    const country = findAddrComponents('country', addrComponents);

    const setMapAddress = removeConsecutiveComma(
      [area, city, state, pincode, country]?.filter((v) => v)?.join(', ')
    );
    const formattedLocalAddress = {
      displayName: displayName,
      latitude: Number(lat || 0),
      longitude: Number(lng || 0),
      area: [
        findAddrComponents('sublocality_level_2', addrComponents),
        findAddrComponents('sublocality_level_1', addrComponents),
        findAddrComponents('locality', addrComponents),
      ]
        ?.filter((i) => i)
        ?.join(', '),
      city: city,
      state: state,
      stateCode: findAddrComponents('administrative_area_level_1', addrComponents, 'short_name'),
      pincode: pincode,
      country: country,
      lastUpdated: new Date().getTime(),
    };

    return {
      setMapAddress,
      formattedLocalAddress,
    };
  };

  const createLocationResponse = (response: any) => {
    var object = {} as locationResponseProps;
    object.area = response?.area! || response?.addressLine2!;
    object.displayName = response?.displayName || response?.addressLine1;
    object.country = response?.country || 'India';
    object.latitude = Number(response?.latitude! || 0);
    object.longitude = Number(response?.longitude! || 0);
    object.city = response?.city;
    object.state = response?.state;
    object.pincode = response?.zipcode || response?.pincode;
    setLocationResponse(object);
  };

  const checkConfirmDisability = (response: any) => {
    const pincode = findAddrComponents('postal_code', response);
    if (pincode == '') {
      setConfirmButtonDisabled(true);
    } else {
      isConfirmButtonDisabled && setConfirmButtonDisabled(false);
    }
  };

  useEffect(() => {
    if (KeyName == 'Update') {
      const getAddress = formatAddressForApi(addressDetails);
      if (Number(addressDetails?.latitude!) > 0 && Number(addressDetails?.longitude! > 0)) {
        setRegion({
          latitude: Number(addressDetails?.latitude),
          longitude: Number(addressDetails?.longitude),
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        });
        setAddressString(getAddress);
      } else {
        let newAddressDetails = JSON.parse(JSON.stringify(addressDetails));
        fetchLatLongFromGoogleApi(getAddress, newAddressDetails);
      }
    } else {
      if (ComingFrom == AppRoutes.AddPatients) {
        setRegion({
          latitude: Number(diagnosticLocation?.latitude),
          longitude: Number(diagnosticLocation?.longitude),
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        });
        createLocationResponse(diagnosticLocation);
        const address = formatLocalAddress(diagnosticLocation);
        setAddressString(address);
      } else {
        setLoadingContext?.(true);
        //if no location permissions are given then prompt for the permission
        doRequestAndAccessLocation(true)
          .then((response) => {
            //after getting permission, navigate to map screen
            //undefined in the case, if user has denied the permission.
            if (response) {
              const address = formatLocalAddress(response);
              setAddressString(address);

              setLatitude(Number(response?.latitude! || 0));
              setLongitude(Number(response?.longitude! || 0));
              setRegion({
                latitude: Number(response?.latitude! || 0),
                longitude: Number(response?.longitude! || 0),
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
              });

              isConfirmButtonDisabled && setConfirmButtonDisabled(false);
              isMapDisabled && setMapDisabled(false);
              createLocationResponse(response);
            }
            //if user denied the permission
            else {
              setAddressFromHomepage();
            }
          })
          .catch((e) => {
            setAddressFromHomepage();
            CommonBugFender('AddAddress_doRequestAndAccessLocation_error', e);
          })
          .finally(() => {
            setLoadingContext!(false);
          });
      }
    }
  }, []);

  const setAddressFromHomepage = () => {
    const checkPinCodeFrom = source == 'Diagnostics Cart' ? diagnosticLocation : pharmacyLocation;
    if (checkPinCodeFrom) {
      //get pincode from pharam's pincode.
      const zipcode = checkPinCodeFrom?.pincode;
      //call the api to get lat,long + address from pincode.
      getPlaceInfoByPincode(zipcode)
        .then((data) => {
          const addrComponents = data?.data?.results[0]?.address_components || [];
          const coordinates = data?.data?.results[0]?.geometry?.location || [];

          setRegion({
            latitude: Number(coordinates?.lat! || 0),
            longitude: Number(coordinates?.lng! || 0),
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          });
          setLatitude(Number(coordinates?.lat! || 0));
          setLongitude(Number(coordinates?.lng! || 0));

          const { setMapAddress, formattedLocalAddress } = createAddressToShow(
            addrComponents,
            coordinates
          );

          setAddressString(setMapAddress);
          setLocationResponse(formattedLocalAddress);

          isConfirmButtonDisabled && setConfirmButtonDisabled(false);
          isMapDisabled && setMapDisabled(false);
        })
        .catch((error) => {
          CommonBugFender('AddAddress_getPlaceInfoByPincode_error', error);
        });
    }
    //if nothing is present in pharma homepage (greyed out map + confirm button disable)
    else {
      setConfirmButtonDisabled(true);
      setMapDisabled(true);
      setRegion({
        latitude: 0,
        longitude: 0,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      });
      setLatitude(Number(0));
      setLongitude(Number(0));
    }
  };

  const fetchLatLongFromGoogleApi = (address: string, addressDetailObject?: any) => {
    setLoadingContext?.(true);
    getLatLongFromAddress(address)
      .then(({ data }) => {
        try {
          const coordinates = data?.results[0]?.geometry?.location || [];
          setRegion({
            latitude: Number(coordinates?.lat! || 0),
            longitude: Number(coordinates?.lng! || 0),
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          });
          //to show previous or new from api.
          addressDetailObject.latitude = Number(coordinates?.lat || addressDetailObject?.latitude);
          addressDetailObject.longitude = Number(
            coordinates?.lng || addressDetailObject?.longitude
          );

          setAddressString(address); // to set prev one from edit or new from response? //3
          createLocationResponse(addressDetailObject);
        } catch (e) {
          //show current location
          CommonBugFender(
            'Error_AddAddressNew_fetchLatLongFromGoogleApi_getLatLongFromAddress_',
            e
          );
          showCurrentLocation();
        }
      })
      .catch((error) => {
        CommonBugFender('Error_AddAddressNew_fetchLatLongFromGoogleApi_', error);
      })
      .finally(() => {
        setLoadingContext?.(false);
      });
  };

  const showCurrentLocation = () => {
    doRequestAndAccessLocationModified(false, true)
      .then((response) => {
        if (response) {
          const currentRegion = {
            latitude: Number(response?.latitude! || 0),
            longitude: Number(response?.longitude! || 0),
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          };
          setRegion(currentRegion);
          if (response?.latitude! && response?.longitude!) {
            setLatitude(Number(response.latitude));
            setLongitude(Number(response.longitude));
            setLocationResponse(response);
            const address = formatLocalAddress(response); //removed displayName
            setAddressString(address);
            isConfirmButtonDisabled && setConfirmButtonDisabled(false);
            isMapDisabled && setMapDisabled(false);
          }
        }
      })
      .catch((e) => {
        renderAlert(e);
        CommonBugFender('MapAddress_doRequestAndAccessLocationModified', e);
      });
  };

  const fetchAdressFromLatLongGoogleApi = (latitude: number, longitude: number) => {
    setLoadingContext?.(true);
    getPlaceInfoByLatLng(latitude, longitude)
      .then(({ data }) => {
        try {
          const addrComponents = data?.results[0]?.address_components || [];
          const coordinates = data?.results[0]?.geometry?.location || [];
          const { setMapAddress, formattedLocalAddress } = createAddressToShow(
            addrComponents,
            coordinates
          );
          setAddressString(setMapAddress);
          checkConfirmDisability(addrComponents);
          setLocationResponse(formattedLocalAddress);
        } catch (e) {
          CommonBugFender(
            'Error_AddAddressNew_fetchAdressFromLatLongGoogleApi_getLatLongFromAddress_',
            e
          );
          //show current location
        }
      })
      .catch((error) => {
        CommonBugFender(
          'Error_AddAddressNew_fetchAdressFromLatLongGoogleApi_getPlaceInfoByLatLng_',
          error
        );
      })
      .finally(() => {
        setLoadingContext?.(false);
      });
  };

  const _onRegionChangeComplete = (region: RegionObject) => {
    /**since double tap does not work in ios */
    //remove Platform.OS == 'ios'
    if (isMapDragging) {
      setMapDragging(false);
      setRegion(region);
      setLatitude(Number(region?.latitude! || 0));
      setLongitude(Number(region?.longitude! || 0));
      //on map drag, hit the google api to get the address from lat-long
      fetchAdressFromLatLongGoogleApi(
        Number(region?.latitude! + latitudeDelta || 0),
        Number(region?.longitude! + longitudeDelta || 0)
      );
    }

    if (!isMapDragging && Platform.OS == 'android') {
      return;
    }
  };

  const _setMapDragging = () => {
    if (!isMapDragging) {
      setMapDragging(true);
    }
  };

  const goBackCallback = (selectedAddress: any, comingFrom?: string) => {
    isConfirmButtonDisabled && setConfirmButtonDisabled(false);
    isMapDisabled && setMapDisabled(false);
    //removed the addition of latlng delta
    fetchAdressFromLatLongGoogleApi(
      Number(selectedAddress?.latitude! || 0),
      Number(selectedAddress?.longitude! || 0)
    );
    setRegion({
      latitude: Number(selectedAddress?.latitude! || 0),
      longitude: Number(selectedAddress?.longitude! || 0),
      latitudeDelta: latitudeDelta,
      longitudeDelta: longitudeDelta,
    });
    setLatitude(Number(selectedAddress?.latitude! || 0));
    setLongitude(Number(selectedAddress?.latitude! || 0));
  };

  const onChangePress = () => {
    props.navigation.navigate(AppRoutes.LocationSearch, {
      goBackCallback: goBackCallback,
    });
  };

  const onConfirmLocation = () => {
    props.navigation.navigate(AppRoutes.EditAddress, {
      locationDetails: locationResponse,
      KeyName: KeyName,
      addOnly: addOnly,
      source: source,
      DataAddress: addressDetails,
      updateLatLng: updateLatLng,
      ComingFrom: ComingFrom,
    });
  };

  const renderAlert = (message: string) => {
    setConfirmButtonDisabled(true);
    setMapDisabled(true);
  };

  const renderMap = () => {
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ height: mapHeight }}
        region={region}
        ref={_map}
        zoomEnabled={true}
        minZoomLevel={5}
        onRegionChangeComplete={(region) => _onRegionChangeComplete(region)}
        onDoublePress={_setMapDragging}
        onPanDrag={() => setMapDragging(true)}
      ></MapView>
    );
  };

  const renderMarker = () => {
    return (
      <View style={styles.markerView}>
        <View style={styles.markerTitleView}>
          <Text style={styles.markerText}>{string.addressSelection.MARKER_TEXT}</Text>
        </View>
        <Image style={styles.markerIcon} source={FakeMarker} />
      </View>
    );
  };

  const renderAddressBanner = () => {
    return (
      <View style={styles.bannerOuterView}>
        <View style={styles.addressView}>
          <LocationIcon style={styles.locationIcon} />
          <Text style={styles.addressHeading}> {string.addressSelection.HELP_US_LOCATE_TEXT}</Text>
        </View>
        <View style={styles.addressOuterView}>
          <View style={{ width: '78%' }}>
            <Text numberOfLines={3} style={styles.addressText}>
              {isConfirmButtonDisabled ? 'Location not found' : addressString}
            </Text>
          </View>
          <Button
            title={isConfirmButtonDisabled ? 'SEARCH LOCATION' : 'CHANGE'}
            style={
              isConfirmButtonDisabled
                ? [
                    styles.changeButton,
                    {
                      flex: 1,
                    },
                  ]
                : [styles.changeButton, { width: '23%', height: 23 }]
            }
            titleTextStyle={styles.changeButtonText}
            onPress={onChangePress}
          />
        </View>
        <Button
          title={string.addressSelection.CONFIRM_LOCATION_AND_PROCEED}
          style={[
            styles.confirmButton,
            {
              backgroundColor: isConfirmButtonDisabled
                ? theme.colors.BUTTON_DISABLED_BG
                : theme.colors.BUTTON_BG,
            },
          ]}
          onPress={onConfirmLocation}
          disabled={isConfirmButtonDisabled}
        />
      </View>
    );
  };

  const renderCurrentLocation = () => {
    return (
      <View style={styles.currentLocationView}>
        <TouchableOpacity onPress={showCurrentLocation} style={{ height: '100%', width: '100%' }}>
          <Image source={icon_gps} style={styles.currentLocationIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'SET LOCATION'}
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          onPressLeftIcon={() => handleBack()}
        />
        {!isMapDisabled ? (
          <>
            {renderMap()}
            {renderCurrentLocation()}
            {renderMarker()}
          </>
        ) : (
          <View style={{ backgroundColor: '#d8d8d8', height: mapHeight }}>
            {renderCurrentLocation()}
          </View>
        )}

        {renderAddressBanner()}
        {showSpinner && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerOuterView: {
    height: 300,
    backgroundColor: 'white',
  },
  changeButton: {
    top: '5%',
    marginHorizontal: '1%',
    backgroundColor: theme.colors.LIGHT_YELLOW,
    shadowColor: 'transparent',
    elevation: 0,
    borderRadius: 8,
  },
  changeButtonText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(11),
    lineHeight: 14.3,
  },
  addressView: {
    marginHorizontal: '4%',
    flexDirection: 'row',
    marginTop: '5%',
  },
  locationIcon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
    tintColor: theme.colors.SHERPA_BLUE,
  },
  addressHeading: {
    marginTop: 2,
    textAlign: 'center',
    ...theme.fonts.IBMPlexSansBold(16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
  },
  addressText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansRegular(13),
  },
  confirmButton: {
    alignSelf: 'center',
    width: '70%',
    marginTop: '4%',
  },
  markerView: {
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    position: 'absolute',
    top: mapHeight / 1.6,
  },
  markerIcon: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
  },
  markerOutline: {
    width: 58,
    height: 58,
    borderRadius: 58 / 2,
    borderColor: theme.colors.SHERPA_BLUE,
    borderWidth: 1,
  },
  currentLocationView: {
    backgroundColor: 'white',
    height: 50,
    width: 50,
    position: 'absolute',
    bottom: '35%',
    right: '3%',
    borderRadius: 40 / 2,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  currentLocationIcon: {
    marginTop: 6,
    width: 35,
    height: 35,
    alignSelf: 'center',
    justifyContent: 'center',
    tintColor: theme.colors.SHERPA_BLUE,
  },
  markerTitleView: {
    backgroundColor: theme.colors.SHERPA_BLUE,
    borderRadius: 10,
    height: 37,
    justifyContent: 'center',
    left: -50,
    alignItems: 'center',
    paddingLeft: 7,
    paddingRight: 8,
    marginBottom: '2%',
  },
  markerText: {
    color: 'white',
    ...theme.fonts.IBMPlexSansSemiBold(12),
  },
  addressOuterView: { margin: '5%', marginTop: 4, flexDirection: 'row' },
});
