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
} from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import {
  getLatLongFromAddress,
  getPlaceInfoByPincode,
  pinCodeServiceabilityApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {Dimensions,View, SafeAreaView, Text,StyleSheet,NativeSyntheticEvent,NativeEventEmitter} from 'react-native';
import { useApolloClient } from 'react-apollo-hooks';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getPatientAddressList_getPatientAddressList_addressList } from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import MapView,{Marker,PROVIDER_GOOGLE, Coordinate, MapEvent } from 'react-native-maps';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Location } from './Icons';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const key = AppConfig.Configuration.GOOGLE_API_KEY;
const { isIphoneX } = DeviceHelper();

export interface MapProps extends NavigationScreenProps<{
  KeyName?: string;
  addressDetails?: getPatientAddressList_getPatientAddressList_addressList;
}> {}


export const Maps : React.FC<MapProps> = (props) =>{
  const addressObject = props.navigation.getParam('addressDetails');
  const [latitude,setLatitude] = useState<number>(0);
  const [longitude,setLongitude] = useState<number>(0);
  const [latitudeDelta,setLatitudeDelta] = useState<number>(1);
  const [longitudeDelta,setLongitudeDelta] = useState<number>(1);
  const [region, setRegion] = useState({
    latitude: addressObject?.latitude,
    longitude: addressObject?.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  });
  
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

  const onConfirmLocation= ()=>{
    //pick the lat long and create address and save in db.

  }

  const renderAddressBanner = () =>{
    return (
      <View style={{height:screenHeight/3.5,width:"100%",bottom:20,position:'absolute'}}>
            <Button
              title={'CHANGE'}
              style={{top:'5%',marginHorizontal:screenWidth-110,width: '23%',height:23,backgroundColor:theme.colors.LIGHT_YELLOW,shadowColor: 'transparent' }}
              titleTextStyle={{color:theme.colors.SHERPA_BLUE,...theme.fonts.IBMPlexSansMedium(13)}}
              onPress={onChangePress}/>
            <View style={{marginHorizontal:'4%',flexDirection:'row',marginTop:'6%'}}>
              <Location style={{height:32,width:30,resizeMode:'contain'}}/>
              <Text style={{marginTop:2,textAlign:'center',...theme.fonts.IBMPlexSansBold(18),color:theme.colors.SHERPA_BLUE}}> Help us locate your address</Text>
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
  

  // const onRegionChange = (region: RegionEvent) => {
  //   setLatitude(region.latitude);
  //   setLongitude(region.longitude);
  //   setRegion(region)
  // }

  const renderMap = () =>{
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{height:screenHeight/1.55}}
        region={region}
        zoomEnabled={true}
        minZoomLevel={5}
        showsMyLocationButton={true}
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
      </MapView>
    )
  }

  return (
    // <View style={{flex:1}}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderMap()}
        {renderAddressBanner()}
      </SafeAreaView>
    // </View>
  )
}
