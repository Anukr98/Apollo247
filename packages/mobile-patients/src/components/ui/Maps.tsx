import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonLogEvent,
  DeviceHelper,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_PATIENT_ADDRESS,
  UPDATE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  PatientAddressInput,
  PATIENT_ADDRESS_TYPE,
  UpdatePatientAddressInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  savePatientAddress,
  savePatientAddressVariables,
  savePatientAddress_savePatientAddress,
} from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import {
  g,
  handleGraphQlError,
  postWebEngageEvent,
  doRequestAndAccessLocationModified,
  distanceBwTwoLatLng,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  getLatLongFromAddress,
  getPlaceInfoByLatLng,
  pinCodeServiceabilityApi247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
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
} from 'react-native';
import { useApolloClient } from 'react-apollo-hooks';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { getPatientAddressList_getPatientAddressList_addressList } from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import MapView, { Marker, PROVIDER_GOOGLE, Coordinate, MapEvent } from 'react-native-maps';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Location } from './Icons';
import Geolocation from '@react-native-community/geolocation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from 'react-native-elements';

const FakeMarker = require('../ui/icons/ic-marker.png');
const icon_gps = require('../ui/icons/ic_gps_fixed.png');

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const mapHeight = screenHeight > 650 ? screenHeight / 1.63 : screenHeight / 1.8;

const { isIphoneX } = DeviceHelper();

const styles = StyleSheet.create({
  bannerOuterView: {
    height: 300,
    backgroundColor: 'white',
  },
  changeButton: {
    top: '5%',
    marginHorizontal: screenWidth - 110,
    width: '23%',
    height: 23,
    backgroundColor: theme.colors.LIGHT_YELLOW,
    shadowColor: 'transparent',
    elevation: 0,
    borderRadius: 16,
  },
  changeButtonText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(11),
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
  },
  addressHeading: {
    marginTop: 2,
    textAlign: 'center',
    ...theme.fonts.IBMPlexSansBold(16),
    color: theme.colors.SHERPA_BLUE,
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
    top: screenHeight / 3,
  },
  markerIcon: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
  },
  currentLocationView: {
    backgroundColor: 'white',
    height: 40,
    width: 40,
    position: 'absolute',
    bottom: '45%',
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
    width: 25,
    height: 25,
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
});

export interface RegionObject {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapProps
  extends NavigationScreenProps<{
    KeyName?: string;
    addressDetails?: getPatientAddressList_getPatientAddressList_addressList;
    isChanged?: boolean;
    addOnly?: boolean;
    source: string;
  }> {}

export const Maps: React.FC<MapProps> = (props) => {
  const addressObject = props.navigation.getParam('addressDetails');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [latitudeDelta, setLatitudeDelta] = useState<number>(1);
  const [longitudeDelta, setLongitudeDelta] = useState<number>(1);

  const [stateCode, setStateCode] = useState<string>(addressObject?.stateCode!);
  const [state, setstate] = useState<string>(addressObject?.state!);
  const [city, setCity] = useState<string>(addressObject?.city!);
  const [addressLine1, setaddressLine1] = useState<string>(addressObject?.addressLine1!);
  const [addressLine2, setaddressLine2] = useState<string>(addressObject?.addressLine2!);
  const [pincode, setpincode] = useState<string>(addressObject?.zipcode!);
  const [phoneNumber, setPhoneNumber] = useState<string>(addressObject?.mobileNumber!);

  const addOnly = props.navigation.state.params ? props.navigation.state.params.addOnly : false;

  const { showAphAlert, hideAphAlert } = useUIElements();
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const { addAddress, setDeliveryAddressId, setNewAddressAdded } = useShoppingCart();
  const {
    addAddress: addDiagnosticAddress,
    setDeliveryAddressId: setDiagnosticAddressId,
  } = useDiagnosticsCart();
  const { locationDetails, pharmacyLocation } = useAppCommonData();
  const _map = useRef(null);

  const [region, setRegion] = useState({
    latitude: addressObject?.latitude,
    longitude: addressObject?.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const client = useApolloClient();
  const [address, setAddress] = useState<string>('');

  /**
   *  call the google api service, which finds lat-long from address
   */
  useEffect(() => {
    const getLatitude = addressObject?.latitude;
    const getLongtitude = addressObject?.longitude;
    const getLandmark = addressObject?.landmark || '';
    let address;
    if (getLandmark != '') {
      address =
        addressObject?.addressLine1 +
        ', ' +
        addressObject?.addressLine2 +
        ', ' +
        getLandmark +
        ', ' +
        addressObject?.city +
        ', ' +
        addressObject?.state +
        ', ' +
        addressObject?.zipcode;
    } else {
      address =
        addressObject?.addressLine1 +
        ', ' +
        addressObject?.addressLine2 +
        ', ' +
        addressObject?.city +
        ', ' +
        addressObject?.state +
        ', ' +
        addressObject?.zipcode;
    }

    setAddress(address);
    //check this condition for initial cases
    getLatLongFromAddress(address)
      .then(({ data }) => {
        try {
          const latLang = data.results[0].geometry.location || {};
          setLatitude(latLang.lat);
          setLongitude(latLang.lng);
          /**added so that, it always picks the one from the address entered.
           * if we want to show the location wherever he has left, then remove this code.
           */
          setRegion({
            latitude: latLang.lat,
            longitude: latLang.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } catch (e) {
          //show current location
          showCurrentLocation();
        }
      })
      .catch();
  }, []);

  const onChangePress = () => {
    props.navigation.goBack();
  };

  const saveAddress = (addressInput: PatientAddressInput) =>
    client.mutate<savePatientAddress, savePatientAddressVariables>({
      mutation: SAVE_PATIENT_ADDRESS,
      variables: { PatientAddressInput: addressInput },
    });

  const sendWebEngageEvent = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const diff = distanceBwTwoLatLng(lat1, lon1, lat2, lon2);
    const diffInMeters = diff * 1000;
    const eventAttributes: WebEngageEvents[WebEngageEventName.CONFIRM_LOCATION] = {
      isMarkerModified: diffInMeters === 0 ? false : true,
      changedByInMeters: diffInMeters,
    };
    postWebEngageEvent(WebEngageEventName.CONFIRM_LOCATION, eventAttributes);
  };

  const onConfirmLocation = async () => {
    setshowSpinner(true);
    if (addressObject?.latitude && addressObject?.longitude) {
      sendWebEngageEvent(addressObject?.latitude, addressObject.longitude, latitude, longitude);
    }

    CommonLogEvent(AppRoutes.Maps, 'On Confirm Location Clicked');
    if (props.navigation.getParam('KeyName') == 'Update' && addressObject) {
      const updateaddressInput: UpdatePatientAddressInput = {
        id: addressObject.id,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        city: city,
        state: state,
        zipcode: pincode,
        landmark: addressObject?.landmark,
        mobileNumber: phoneNumber,
        addressType: addressObject?.addressType,
        otherAddressType: addressObject?.otherAddressType,
        latitude: latitude,
        longitude: longitude,
        stateCode: addressObject?.stateCode,
        name: addressObject?.name,
      };
      console.log(updateaddressInput, 'updateaddressInput');
      setshowSpinner(true);
      client
        .mutate<updatePatientAddress, updatePatientAddressVariables>({
          mutation: UPDATE_PATIENT_ADDRESS,
          variables: { UpdatePatientAddressInput: updateaddressInput },
        })
        .then((_data: any) => {
          try {
            setshowSpinner(false);
            console.log('updateapicalled', _data);
            props.navigation.pop(3, { immediate: true });
            props.navigation.push(AppRoutes.AddressBook);
          } catch (error) {
            CommonBugFender('AddAddress_onConfirmLocation_try', error);
          }
        })
        .catch((e) => {
          CommonBugFender('AddAddress_onSavePress', e);
          setshowSpinner(false);
          handleGraphQlError(e);
        });
    }
    //if added new
    else {
      const addressInput: PatientAddressInput = {
        patientId: addressObject!.id!,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        city: city,
        state: state,
        zipcode: pincode,
        landmark: addressObject?.landmark,
        mobileNumber: phoneNumber,
        addressType: addressObject?.addressType,
        otherAddressType: addressObject?.otherAddressType,
        latitude: latitude,
        longitude: longitude,
        stateCode: addressObject?.stateCode,
        name: addressObject?.name,
      };

      try {
        const [saveAddressResult, pinAvailabilityResult] = await Promise.all([
          saveAddress(addressInput),
          addOnly ? null : pinCodeServiceabilityApi247(pincode),
        ]);

        setshowSpinner(false);
        const address = g(saveAddressResult.data, 'savePatientAddress', 'patientAddress')!;
        const isAddressServiceable = pinAvailabilityResult && pinAvailabilityResult.data.response;
        let isComingFrom = props.navigation.getParam('source');
        addAddress!(address);
        addDiagnosticAddress!(address);

        if (isComingFrom === 'Upload Prescription') {
          const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_ADDRESS_SELECTED] = {
            Serviceable: isAddressServiceable ? 'Yes' : 'No',
          };
          postWebEngageEvent(
            WebEngageEventName.UPLOAD_PRESCRIPTION_ADDRESS_SELECTED,
            eventAttributes
          );
        }

        if (isAddressServiceable || addOnly) {
          setDeliveryAddressId!(address.id || '');
          setNewAddressAdded!(address.id || '');
          setDiagnosticAddressId!(address.id || '');
          if (isComingFrom == 'My Account') {
            props.navigation.pop(3, { immediate: true });
            props.navigation.push(AppRoutes.AddressBook);
          } else {
            props.navigation.pop(2, { immediate: true });
          }
        } else {
          setDeliveryAddressId!('');
          setNewAddressAdded!('');
          setDiagnosticAddressId!(address.id || '');

          showAphAlert!({
            title: 'Uh oh.. :(',
            description: string.medicine_cart.pharmaAddressUnServiceableAlert,
            onPressOk: () => {
              onAlertError(isComingFrom);
            },
          });
        }
      } catch (error) {
        CommonBugFender('AddAddress_SetOnSave_try', error);
        setshowSpinner(false);
        handleGraphQlError(error);
      }
    }
  };

  const onAlertError = (source: string) => {
    if (source == 'My Account') {
      props.navigation.pop(3, { immediate: true });
      props.navigation.push(AppRoutes.AddressBook);
    } else {
      props.navigation.pop(3, { immediate: true });
    }
    hideAphAlert!();
  };

  const renderAddressBanner = () => {
    return (
      //screenHeight/3
      <View style={styles.bannerOuterView}>
        <Button
          title={'CHANGE'}
          style={styles.changeButton}
          titleTextStyle={styles.changeButtonText}
          onPress={onChangePress}
        />
        <View style={styles.addressView}>
          <Location style={styles.locationIcon} />
          <Text style={styles.addressHeading}> Help us locate your address</Text>
        </View>
        <View style={{ margin: '5%', marginTop: '3%' }}>
          <Text numberOfLines={3} style={styles.addressText}>
            {address}
          </Text>
        </View>
        <Button
          title={'CONFIRM LOCATION'}
          style={styles.confirmButton}
          onPress={onConfirmLocation}
        />
      </View>
    );
  };

  // const onMarkerDragEnd = (event: MapEvent) =>{
  //   const coordinates = event.nativeEvent.coordinate;
  //   setLatitude(coordinates?.latitude);
  //   setLongitude(coordinates?.longitude);
  // }

  /** to drag the map */
  /** set lat-long when drag has been stopped */
  const _onRegionChangeComplete = (region: RegionObject) => {
    setRegion(region);
    setLatitude(region.latitude);
    setLongitude(region.longitude);
    console.log(region.latitude, region.longitude);
  };

  /** for getting current position */
  const showCurrentLocation = () => {
    doRequestAndAccessLocationModified()
      .then((response) => {
        if (response) {
          const currentRegion = {
            latitude: response.latitude,
            longitude: response.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.001,
          };
          setRegion(currentRegion);
          if (response?.latitude && response?.longitude) {
            setLatitude(response.longitude);
            setLongitude(response.latitude);
          }
          // createAddressFromCurrentPos(response?.latitude,response?.longitude)
        }
      })
      .catch((e) => {
        CommonBugFender('MapAddress_doRequestAndAccessLocationModified', e);
      });
  };

  const createAddressFromCurrentPos = (lat: number, long: number) => {
    getPlaceInfoByLatLng(lat, long)
      .then((obj) => {
        try {
          if (obj.data.results.length > 0 && obj.data.results[0].address_components.length > 0) {
            const addrComponents = obj.data.results[0].address_components || [];
            const _pincode = (
              addrComponents.find((item: any) => item.types.indexOf('postal_code') > -1) || {}
            ).long_name;
            const currPinCode = _pincode != undefined ? _pincode : '';
            const _areaDetail1 = (
              addrComponents.find(
                (item: any) =>
                  item.types.indexOf('street') > -1 ||
                  item.types.indexOf('sublocality_level_2') > -1 ||
                  item.types.indexOf('route') > -1
              ) || {}
            ).long_name;
            const currAreaDetail1 = _areaDetail1 != undefined ? _areaDetail1 : '';
            const _areaDetail2 = (
              addrComponents.find(
                (item: any) =>
                  item.types.indexOf('sublocality_level_1') > -1 ||
                  item.types.indexOf('administrative_area_level_2') > -1
              ) || {}
            ).long_name;
            const currAreaDetail2 = _areaDetail2 != undefined ? _areaDetail2 : '';
            const _city = (
              addrComponents.find((item: any) => item.types.indexOf('locality') > -1) || {}
            ).long_name;
            const currCity = _city != undefined ? _city : '';
            const _state = (
              addrComponents.find(
                (item: any) => item.types.indexOf('administrative_area_level_1') > -1
              ) || {}
            ).long_name;
            const currState = _state != undefined ? _state : '';

            //set the new address frm the current location
            setAddress(obj.data.results[0].formatted_address);
            setpincode(currPinCode);
            setstate(currState);
            setCity(currCity);
            setaddressLine2(currAreaDetail2);
            setaddressLine1(currAreaDetail1);
          }
        } catch (e) {
          CommonBugFender('Maps_createAddressFromLatLong', e);
        }
      })
      .catch((error) => {
        CommonBugFender('Maps_createAddressFromLatLong', error);
      });
  };

  const renderMap = () => {
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ height: mapHeight }}
        region={region}
        ref={_map}
        zoomEnabled={true}
        minZoomLevel={9}
        onMapReady={() => console.log('ready')}
        onRegionChangeComplete={(region) => _onRegionChangeComplete(region)}
        // initialRegion={{latitude:latitude,longitude:longitude,latitudeDelta:latitudeDelta,longitudeDelta:longitudeDelta}}
      >
        {/**drag the marker */}
        {/* <Marker
          coordinate={{
            latitude: latitude,
            longitude: longitude
          }}
          draggable={true}
          onDragEnd={(e) => onMarkerDragEnd(e)}
        /> */}
      </MapView>
    );
  };

  /**drag the map to adjust */
  const renderMarker = () => {
    return (
      <View style={styles.markerView}>
        <View style={styles.markerTitleView}>
          <Text style={styles.markerText}>MOVE MAP TO ADJUST</Text>
        </View>
        <Image style={styles.markerIcon} source={FakeMarker} />
      </View>
    );
  };

  /**show the current location item */
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
        {renderMap()}
        {renderCurrentLocation()}
        {renderMarker()}
        {renderAddressBanner()}
        {showSpinner && <Spinner />}
      </SafeAreaView>
    </View>
  );
};
