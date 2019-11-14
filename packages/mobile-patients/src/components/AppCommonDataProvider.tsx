import React, { createContext, useContext, useEffect, useState } from 'react';
import { AsyncStorage } from 'react-native';

export interface LocationData {
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
}

export const AppCommonDataContext = createContext<AppCommonDataContextProps>({
  locationDetails: null,
  setLocationDetails: null,
});

export const AppCommonDataProvider: React.FC = (props) => {
  const [locationDetails, _setLocationDetails] = useState<
    AppCommonDataContextProps['locationDetails']
  >(null);

  const setLocationDetails: AppCommonDataContextProps['setLocationDetails'] = (locationDetails) => {
    _setLocationDetails(locationDetails);
    AsyncStorage.setItem('locationDetails', JSON.stringify(locationDetails)).catch(() => {
      console.log('Failed to save location in local storage.');
    });
  };

  useEffect(() => {
    // update location from async storage the very first time app opened
    const updateCartItemsFromStorage = async () => {
      try {
        const locationFromStorage = await AsyncStorage.multiGet(['locationDetails']);
        const location = locationFromStorage[0][1];
        _setLocationDetails(JSON.parse(location || 'null'));
      } catch (error) {
        console.log('Failed to get cart items from local storage.');
      }
    };
    updateCartItemsFromStorage();
  }, []);

  return (
    <AppCommonDataContext.Provider
      value={{
        locationDetails,
        setLocationDetails,
      }}
    >
      {props.children}
    </AppCommonDataContext.Provider>
  );
};

export const useAppCommonData = () => useContext<AppCommonDataContextProps>(AppCommonDataContext);
