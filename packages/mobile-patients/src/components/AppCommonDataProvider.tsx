import { getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities } from '@aph/mobile-patients/src/graphql/types/getDiagnosticsCites';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getDoctorsBySpecialtyAndFilters } from '../graphql/types/getDoctorsBySpecialtyAndFilters';

export interface LocationData {
  displayName: string;
  latitude?: number;
  longitude?: number;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  lastUpdated?: number; //timestamp
}

export interface AppCommonDataContextProps {
  locationDetails: LocationData | null;
  setLocationDetails: ((items: LocationData) => void) | null;
  diagnosticsCities: getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities[];
  setDiagnosticsCities:
    | ((items: getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities[]) => void)
    | null;
  locationForDiagnostics: { cityId: string; stateId: string; city: string; state: string } | null;
  VirtualConsultationFee: string;
  setVirtualConsultationFee: ((arg0: string) => void) | null;
  generalPhysicians: { id: string; data: getDoctorsBySpecialtyAndFilters } | null | undefined;
  setGeneralPhysicians:
    | ((arg0: { id: string; data: getDoctorsBySpecialtyAndFilters }) => void)
    | null;
  ent: { id: string; data: getDoctorsBySpecialtyAndFilters } | null | undefined;
  setEnt: ((arg0: { id: string; data: getDoctorsBySpecialtyAndFilters }) => void) | null;
  Dermatology: { id: string; data: getDoctorsBySpecialtyAndFilters } | null | undefined;
  setDermatology: ((arg0: { id: string; data: getDoctorsBySpecialtyAndFilters }) => void) | null;
  Urology: { id: string; data: getDoctorsBySpecialtyAndFilters } | null | undefined;
  setUrology: ((arg0: { id: string; data: getDoctorsBySpecialtyAndFilters }) => void) | null;
  needHelpToContactInMessage: string;
  setNeedHelpToContactInMessage: ((value: string) => void) | null;
}

export const AppCommonDataContext = createContext<AppCommonDataContextProps>({
  locationDetails: null,
  setLocationDetails: null,
  diagnosticsCities: [],
  setDiagnosticsCities: null,
  locationForDiagnostics: null,
  VirtualConsultationFee: '',
  setVirtualConsultationFee: null,
  generalPhysicians: null,
  setGeneralPhysicians: null,
  ent: null,
  setEnt: null,
  Dermatology: null,
  setDermatology: null,
  Urology: null,
  setUrology: null,
  needHelpToContactInMessage: '',
  setNeedHelpToContactInMessage: null,
});

export const AppCommonDataProvider: React.FC = (props) => {
  const [locationDetails, _setLocationDetails] = useState<
    AppCommonDataContextProps['locationDetails']
  >(null);

  const [diagnosticsCities, setDiagnosticsCities] = useState<
    AppCommonDataContextProps['diagnosticsCities']
  >([]);
  const [VirtualConsultationFee, setVirtualConsultationFee] = useState<string>('');
  const [generalPhysicians, setGeneralPhysicians] = useState<{
    id: string;
    data: getDoctorsBySpecialtyAndFilters;
  }>();
  const [ent, setEnt] = useState<{
    id: string;
    data: getDoctorsBySpecialtyAndFilters;
  }>();
  const [Dermatology, setDermatology] = useState<{
    id: string;
    data: getDoctorsBySpecialtyAndFilters;
  }>();
  const [Urology, setUrology] = useState<{
    id: string;
    data: getDoctorsBySpecialtyAndFilters;
  }>();

  const [needHelpToContactInMessage, setNeedHelpToContactInMessage] = useState<
    AppCommonDataContextProps['needHelpToContactInMessage']
  >('');

  const setLocationDetails: AppCommonDataContextProps['setLocationDetails'] = (locationDetails) => {
    _setLocationDetails(locationDetails);
    AsyncStorage.setItem('locationDetails', JSON.stringify(locationDetails)).catch(() => {
      console.log('Failed to save location in local storage.');
    });
  };

  const locationForDiagnostics: AppCommonDataContextProps['locationForDiagnostics'] = {
    cityId: ((
      diagnosticsCities.find(
        (item) => item!.cityname.toLowerCase() == (g(locationDetails, 'city') || '').toLowerCase()
      ) || {}
    ).cityid || '') as string,
    city: ((
      diagnosticsCities.find(
        (item) => item!.cityname.toLowerCase() == (g(locationDetails, 'city') || '').toLowerCase()
      ) || {}
    ).cityname || '') as string,
    state: ((
      diagnosticsCities.find(
        (item) => item!.cityname.toLowerCase() == (g(locationDetails, 'city') || '').toLowerCase()
      ) || {}
    ).statename || '') as string,
    stateId: ((
      diagnosticsCities.find(
        (item) => item!.cityname.toLowerCase() == (g(locationDetails, 'city') || '').toLowerCase()
      ) || {}
    ).stateid || '') as string,
  };

  useEffect(() => {
    // update location from async storage the very first time app opened
    const updateCartItemsFromStorage = async () => {
      try {
        const locationFromStorage = await AsyncStorage.multiGet(['locationDetails']);
        const location = locationFromStorage[0][1];
        _setLocationDetails(JSON.parse(location || 'null'));
        // Instead of asking location here, asking in Home screen
        // if (location) {
        //   doRequestAndAccessLocation()
        //     .then((response) => {
        //       response && _setLocationDetails(response);
        //     })
        //     .catch((e) => {
        //       CommonBugFender('AppCommonDataProvider_updateCartItemsFromStorage', e);
        //     });
        // }
      } catch (error) {
        console.log('Failed to get cart items from local storage.');
        CommonBugFender('AppCommonDataProvider_updateCartItemsFromStorage_try', error);
      }
    };
    updateCartItemsFromStorage();
  }, []);

  return (
    <AppCommonDataContext.Provider
      value={{
        locationDetails,
        setLocationDetails,
        diagnosticsCities,
        setDiagnosticsCities,
        locationForDiagnostics,
        VirtualConsultationFee,
        setVirtualConsultationFee,
        generalPhysicians,
        setGeneralPhysicians,
        Urology,
        setUrology,
        Dermatology,
        setDermatology,
        ent,
        setEnt,
        needHelpToContactInMessage,
        setNeedHelpToContactInMessage,
      }}
    >
      {props.children}
    </AppCommonDataContext.Provider>
  );
};

export const useAppCommonData = () => useContext<AppCommonDataContextProps>(AppCommonDataContext);
