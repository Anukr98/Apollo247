import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonLogEvent,
  DeviceHelper,
  CommonBugFender,
  CommonSetUserBugsnag,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  DELETE_PATIENT_ADDRESS,
  SAVE_PATIENT_ADDRESS,
  UPDATE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  deletePatientAddress,
  deletePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/deletePatientAddress';
import {
  PatientAddressInput,
  PATIENT_ADDRESS_TYPE,
  UpdatePatientAddressInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  savePatientAddress,
  savePatientAddressVariables,
  savePatientAddress_savePatientAddress
} from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import {
  g,
  handleGraphQlError,
  postWebEngageEvent
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  getLatLongFromAddress,
  getPlaceInfoByLatLng,
  getPlaceInfoByPincode,
  pinCodeServiceabilityApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import React, { useEffect, useState } from 'react';
import {Dimensions,View, SafeAreaView, Text,StyleSheet, Image,Geolocation,TouchableOpacity} from 'react-native';
import { useApolloClient } from 'react-apollo-hooks';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { getPatientAddressList_getPatientAddressList_addressList } from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import MapView,{Marker,PROVIDER_GOOGLE, Coordinate, MapEvent } from 'react-native-maps';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Location } from './Icons';


const FakeMarker = require('../ui/icons/fakeMarker.png');

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const key = AppConfig.Configuration.GOOGLE_API_KEY;
const { isIphoneX } = DeviceHelper();

export interface RegionObject{
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number
}

export interface MapProps extends NavigationScreenProps<{
  KeyName?: string;
  // updateAddressDetails?: getPatientAddressList_getPatientAddressList_addressList;
  addressDetails?:getPatientAddressList_getPatientAddressList_addressList,
  isChanged?: boolean;
  addOnly?: boolean;
  source: string;
}> {}


export const Maps : React.FC<MapProps> = (props) =>{
  const addressObject =props.navigation.getParam('addressDetails');
  const [latitude,setLatitude] = useState<number>(0);
  const [longitude,setLongitude] = useState<number>(0);
  const [latitudeDelta,setLatitudeDelta] = useState<number>(1);
  const [longitudeDelta,setLongitudeDelta] = useState<number>(1);
  
  const [stateCode, setStateCode] = useState<string>(addressObject?.stateCode!);
  const [state, setstate] = useState<string>(addressObject?.state!);
  const [city,setCity] = useState<string>(addressObject?.city!);
  const [addressLine1,setaddressLine1] = useState<string>(addressObject?.addressLine1!)
  const [addressLine2,setaddressLine2] = useState<string>(addressObject?.addressLine2!)
  const [pincode,setpincode] = useState<string>(addressObject?.zipcode!);
  const [phoneNumber,setPhoneNumber] = useState<string>(addressObject?.mobileNumber!)
  
  const addOnly = props.navigation.state.params ? props.navigation.state.params.addOnly : false;

  const { showAphAlert, hideAphAlert } = useUIElements();
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const { addAddress, setDeliveryAddressId, setNewAddressAdded } = useShoppingCart();
  const { addAddress: addDiagnosticAddress,
  setDeliveryAddressId: setDiagnosticAddressId,
  } = useDiagnosticsCart();
const { locationDetails, pharmacyLocation } = useAppCommonData();


  const [region, setRegion] = useState({
    latitude: addressObject?.latitude,
    longitude: addressObject?.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  });
  
  const client = useApolloClient();
  const [address,setAddress] = useState<string>('');

  /**
   *  call the google api service, which finds lat-long from address
   */
  useEffect(()=>{
    // const addressObject = props.navigation.getParam('addressDetails');
    const getLatitude = addressObject?.latitude;
    const getLongtitude = addressObject?.longitude;
    const getLandmark = addressObject?.landmark || '';
    let address;
    if(getLandmark!=""){
      address = addressObject?.addressLine1+', '+addressObject?.addressLine2+ ', '+getLandmark+ ', '+addressObject?.city+ ', '+addressObject?.state + ', '+addressObject?.zipcode;
    }
    else{
      address = addressObject?.addressLine1+', '+addressObject?.addressLine2+ ', '+addressObject?.city+ ', '+addressObject?.state + ', '+addressObject?.zipcode;
    }
    
    setAddress(address);
    //check this condition for initial cases
    //if not zero then we can calculate lat=long from the address
    if(getLatitude != 0 && getLongtitude != 0){
      getLatLongFromAddress(address).then(({ data }) =>{
        try{
          const latLang = data.results[0].geometry.location || {};
          setLatitude(latLang.lat);
          setLongitude(latLang.lng);
        }
        catch(e){
          //do something
        }
      })
      .catch()
    }
        
  },[]);

  const onChangePress = () =>{
    //navigate back
    props.navigation.goBack();
  }

  const saveAddress = (addressInput: PatientAddressInput) =>
    client.mutate<savePatientAddress, savePatientAddressVariables>({
      mutation: SAVE_PATIENT_ADDRESS,
      variables: { PatientAddressInput: addressInput },
    });

  const onConfirmLocation = async () => {
    //perform all functions of save
    setshowSpinner(true);
    CommonLogEvent(AppRoutes.Maps, 'On Confirm Location Clicked');
    if (props.navigation.getParam('KeyName') == 'Update' && addressObject) {
      //can also send the object addressObject with new lat,long
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
            props.navigation.pop(2, { immediate: true });
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
      //same object can be sent..
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
      };

      try {
        const [saveAddressResult, pinAvailabilityResult] = await Promise.all([
          saveAddress(addressInput),
          addOnly ? null : pinCodeServiceabilityApi(pincode),
        ]);

        setshowSpinner(false);
        const address = g(saveAddressResult.data, 'savePatientAddress', 'patientAddress')!;
        const isAddressServiceable = pinAvailabilityResult && pinAvailabilityResult.data.Availability;
        let isComingFrom = props.navigation.getParam('source');
        addAddress!(address);
        addDiagnosticAddress!(address);

        if (isComingFrom === 'Upload Prescription') {
          const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_ADDRESS_SELECTED] = {
            Serviceable: isAddressServiceable ? 'Yes' : 'No',
          };
          postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_ADDRESS_SELECTED, eventAttributes);
        }

        if (isAddressServiceable || addOnly) {
          setDeliveryAddressId!(address.id || '');
          setNewAddressAdded!(address.id || '');
          setDiagnosticAddressId!(address.id || '');
          if(isComingFrom == 'My Account'){
            props.navigation.pop(2, { immediate: true });
            props.navigation.push(AppRoutes.AddressBook);
          }
          else{
            props.navigation.pop(2, { immediate: true });
          }
        } else {
          setDeliveryAddressId!('');
          setNewAddressAdded!('');
          setDiagnosticAddressId!(address.id || '');

          showAphAlert!({
            title: 'Uh oh.. :(',
            description: string.medicine_cart.pharmaAddressUnServiceableAlert,
            onPressOk: () => {onAlertError(isComingFrom)},
          });
        }
      } catch (error) {
        CommonBugFender('AddAddress_SetOnSave_try', error);
        setshowSpinner(false);
        handleGraphQlError(error);
      }
    }
  }

  const onAlertError = (source:string) =>{
    if(source == 'My Account'){
      props.navigation.pop(2, { immediate: true });
      props.navigation.push(AppRoutes.AddressBook);
    }
    else{
      props.navigation.pop(2, { immediate: true });
    }
    hideAphAlert!();
  }

  const renderAddressBanner = () =>{
    return ( 
      <View style={{height:screenHeight/3,bottom:-10}}>
          <Button
               title={'CHANGE'}
              style={{top:'5%',marginHorizontal:screenWidth-110,width: '23%',height:23,backgroundColor:theme.colors.LIGHT_YELLOW,shadowColor: 'transparent' }}
              titleTextStyle={{color:theme.colors.SHERPA_BLUE,...theme.fonts.IBMPlexSansMedium(13)}}
              onPress={onChangePress}/>
          <View style={{marginHorizontal:'4%',flexDirection:'row',marginTop:'5%'}}>
               <Location style={{height:32,width:30,resizeMode:'contain'}}/>
               <Text style={{marginTop:2,textAlign:'center',...theme.fonts.IBMPlexSansBold(16.5),color:theme.colors.SHERPA_BLUE}}> Help us locate your address</Text>
          </View>
          <View style={{margin:'5%',marginTop:'3%'}}>
               <Text style={{color:theme.colors.SHERPA_BLUE , 
                   ...theme.fonts.IBMPlexSansMedium(14.5),}}>{address}</Text>
          </View>
          <Button
            title={'CONFIRM LOCATION'}
            style={{alignSelf:'center', width: '70%' ,marginTop:'2%'}}
            onPress={onConfirmLocation}/>
      </View>
    )
  }

  const onMarkerDragEnd = (event: MapEvent) =>{
    const coordinates = event.nativeEvent.coordinate;
    setLatitude(coordinates?.latitude);
    setLongitude(coordinates?.longitude);
  }

  /**to drag the map */
  // const onRegionChange =(region: RegionObject)=>{
  //   setRegion(region);
  //   setLatitude(region.latitude);
  //   setLongitude(region.longitude);
  // }
  
  /** for getting current position */
  // const showCurrentLocation = ()=>{
  //     Geolocation.getCurrentPosition(
  //       ({coords}) => {
  //         const {latitude, longitude} = coords
  //          const  currentRegion = {
  //             latitude,
  //             longitude,
  //             latitudeDelta: 0.005,
  //             longitudeDelta: 0.001,
  //           }
  //           setRegion(currentRegion);
          
  //       },
  //       (error) =>  console.log(error.code, error.message, 'getCurrentPosition error')),
  //       {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
  // }

  const renderMap = () =>{
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{height: screenHeight/1.75}}
        region={region}
        zoomEnabled={true}
        minZoomLevel={5}
        // onRegionChangeComplete={region => onRegionChange(region)}
        // initialRegion={{latitude:latitude,longitude:longitude,latitudeDelta:latitudeDelta,longitudeDelta:longitudeDelta}}
      >
        <Marker
          coordinate={{
            latitude: latitude,
            longitude: longitude
          }}
          draggable={true}
          onDragEnd={(e) => onMarkerDragEnd(e)}
        />

          {/** drag the map to readjust */}
         {/* <View style={{ left: '50%',marginLeft: -24, marginTop: -48,position: 'absolute',top: '50%'}}>
            <Image style={{height: 48,width: 48}} source={FakeMarker} />
        </View> */}
       {/* 
        <View style={{backgroundColor:'pink',height:40,width:40,zIndex:1000}}>
          <TouchableOpacity onPress={showCurrentLocation} style={{height:"100%",width:"100%"}}>
          <Text>Curre</Text>
          </TouchableOpacity>
        </View> */}
      </MapView>
    )
  }

  return (
    <View style={{flex:1}}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderMap()}
        {renderAddressBanner()}
        {showSpinner && <Spinner />}
      </SafeAreaView>
    </View>
  )
}
