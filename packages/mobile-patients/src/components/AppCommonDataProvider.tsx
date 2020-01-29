import { getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities } from '@aph/mobile-patients/src/graphql/types/getDiagnosticsCites';
import { g, doRequestAndAccessLocation } from '@aph/mobile-patients/src/helpers/helperFunctions';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AsyncStorage } from 'react-native';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
}

export const AppCommonDataContext = createContext<AppCommonDataContextProps>({
  locationDetails: null,
  setLocationDetails: null,
  diagnosticsCities: [],
  setDiagnosticsCities: null,
  locationForDiagnostics: null,
  VirtualConsultationFee: '',
  setVirtualConsultationFee: null,
});

export const AppCommonDataProvider: React.FC = (props) => {
  const [locationDetails, _setLocationDetails] = useState<
    AppCommonDataContextProps['locationDetails']
  >(null);

  const [diagnosticsCities, setDiagnosticsCities] = useState<
    AppCommonDataContextProps['diagnosticsCities']
  >([]);
  const [VirtualConsultationFee, setVirtualConsultationFee] = useState<string>('');

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
        if (location) {
          doRequestAndAccessLocation()
            .then((response) => {
              _setLocationDetails(response);
            })
            .catch((e) => {
              CommonBugFender('AppCommonDataProvider_updateCartItemsFromStorage', e);
            });
        }
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
      }}
    >
      {props.children}
    </AppCommonDataContext.Provider>
  );
};

export const useAppCommonData = () => useContext<AppCommonDataContextProps>(AppCommonDataContext);
