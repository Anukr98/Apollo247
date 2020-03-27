import React, { useEffect, useState, useContext } from 'react';
import axios, { AxiosError } from 'axios';

export interface LocationContextProps {
  currentLocation: string | null;
  currentLat: string | null;
  currentLong: string | null;
  currentPincode: string | null;
  placeId: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  area: string | null;
  stateId: number | null;
  cityId: number | null;
  isUserDeniedLocationAccess: boolean | null;
  setCurrentLocation: (currentLocation: string) => void;
  setCurrentLat: (currentLat: string) => void;
  setCurrentLong: (currentLong: string) => void;
  setCurrentPincode: (currenPincode: string) => void;
  locateCurrentLocation: () => void;
  setPlaceId: (placeId: string) => void;
  setCity: (city: string) => void;
  setState: (state: string) => void;
  setCountry: (country: string) => void;
  setArea: (area: string) => void;
  setStateId: (stateId: number | null) => void;
  setCityId: (cityId: number | null) => void;
  getCurrentLocationPincode: (currentLat: string, currentLong: string) => void;
  setIsUserDeniedLocationAccess: (isUserDeniedLocationAccess: boolean | null) => void;
}

export interface Address {
  long_name: string;
  short_name: string;
  types: Array<string>;
}

export const LocationContext = React.createContext<LocationContextProps>({
  currentLocation: null,
  currentLat: null,
  currentLong: null,
  currentPincode: null,
  placeId: null,
  city: null,
  state: null,
  country: null,
  area: null,
  cityId: null,
  stateId: null,
  isUserDeniedLocationAccess: null,
  setCurrentLocation: () => {},
  setCurrentLat: () => {},
  setCurrentLong: () => {},
  setCurrentPincode: () => {},
  locateCurrentLocation: () => {},
  getCurrentLocationPincode: () => {},
  setPlaceId: () => {},
  setCity: () => {},
  setState: () => {},
  setCountry: () => {},
  setArea: () => {},
  setStateId: () => {},
  setCityId: () => {},
  setIsUserDeniedLocationAccess: () => {},
});

export type GooglePlacesType =
  | 'route'
  | 'sublocality_level_2'
  | 'sublocality_level_1'
  | 'postal_code'
  | 'locality'
  | 'administrative_area_level_2'
  | 'administrative_area_level_1'
  | 'country';

export const LocationProvider: React.FC = (props) => {
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentLat, setCurrentLat] = useState<string | null>(null);
  const [currentLong, setCurrentLong] = useState<string | null>(null);
  const [currentPincode, setCurrentPincode] = useState<string>('');
  const [placeId, setPlaceId] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [cityId, setCityId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [isUserDeniedLocationAccess, setIsUserDeniedLocationAccess] = useState<boolean | null>(
    null
  );

  const locateCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCurrentLat(latitude.toString());
        setCurrentLong(longitude.toString());
        setIsUserDeniedLocationAccess(false);
        getCurrentLocationPincode(latitude.toString(), longitude.toString());
      },
      (err) => {
        setIsUserDeniedLocationAccess(true);
        console.log(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const getCurrentLocationPincode = async (currentLat: string, currentLong: string) => {
    await axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLat},${currentLong}&key=${process.env.GOOGLE_API_KEY}`
      )
      .then(({ data }) => {
        try {
          if (data && data.results[0] && data.results[0].address_components) {
            const addressComponents = data.results[0].address_components || [];
            const pincode = (
              addressComponents.find((item: Address) => item.types.indexOf('postal_code') > -1) ||
              {}
            ).long_name;
            if (pincode && pincode.length === 6) {
              localStorage.setItem('currentPincode', pincode);
              setCurrentPincode(pincode);
            }
          }
        } catch {
          (e: AxiosError) => console.log(e);
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
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
    const findItem = addrComponents.find((item) => item.types.indexOf(proptoFind) > -1);
    return findItem ? findItem.long_name : '';
  };

  useEffect(() => {
    const currentAddress = localStorage.getItem('currentAddress');
    if (currentAddress) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${currentAddress}&key=${process.env.GOOGLE_API_KEY}`;
      axios.get(url).then((res) => {
        if (res && res.data && res.data.results[0]) {
          const { lat, lng } = res.data.results[0].geometry.location;
          const addrComponents =
            (res &&
              res.data &&
              res.data.results &&
              res.data.results.length > 0 &&
              res.data.results[0].address_components) ||
            [];
          const placeId = res.data.results[0].place_id;
          const pincode = findAddrComponents('postal_code', addrComponents);
          const city =
            findAddrComponents('administrative_area_level_2', addrComponents) ||
            findAddrComponents('locality', addrComponents);
          const state = findAddrComponents('administrative_area_level_1', addrComponents);
          const country = findAddrComponents('country', addrComponents);
          const area = [
            findAddrComponents('route', addrComponents),
            findAddrComponents('sublocality_level_2', addrComponents),
            findAddrComponents('sublocality_level_1', addrComponents),
          ]
            .filter((i) => i)
            .join(', ');
          setCity(city);
          setState(state);
          setCountry(country);
          setArea(area);
          setPlaceId(placeId);
          setCurrentLat(lat.toString());
          setCurrentLong(lng.toString());
          if (!pincode) {
            getCurrentLocationPincode(lat.toString(), lng.toString());
          } else {
            setCurrentPincode(pincode);
          }
          if (currentAddress.includes(',')) {
            setCurrentLocation(currentAddress.substring(0, currentAddress.indexOf(',')));
          } else {
            setCurrentLocation(currentAddress);
          }
        }
      });
    }
  }, [currentLocation]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        currentLat,
        currentLong,
        setCurrentLocation,
        setCurrentLat,
        setCurrentLong,
        currentPincode,
        setCurrentPincode,
        locateCurrentLocation,
        getCurrentLocationPincode,
        isUserDeniedLocationAccess,
        setIsUserDeniedLocationAccess,
        placeId,
        setPlaceId,
        city,
        setCity,
        area,
        setArea,
        country,
        setCountry,
        state,
        setState,
        setCityId,
        cityId,
        stateId,
        setStateId,
      }}
    >
      {props.children}
    </LocationContext.Provider>
  );
};

const useLocationContext = () => useContext<LocationContextProps>(LocationContext);

export const useLocationDetails = () => ({
  currentLocation: useLocationContext().currentLocation,
  currentLat: useLocationContext().currentLat,
  currentLong: useLocationContext().currentLong,
  setCurrentLocation: useLocationContext().setCurrentLocation,
  setCurrentLat: useLocationContext().setCurrentLat,
  setCurrentLong: useLocationContext().setCurrentLong,
  currentPincode: useLocationContext().currentPincode,
  setCurrentPincode: useLocationContext().setCurrentPincode,
  locateCurrentLocation: useLocationContext().locateCurrentLocation,
  placeId: useLocationContext().placeId,
  setPlaceId: useLocationContext().setPlaceId,
  city: useLocationContext().city,
  setCity: useLocationContext().setCity,
  area: useLocationContext().area,
  setArea: useLocationContext().setArea,
  country: useLocationContext().country,
  setCountry: useLocationContext().setCountry,
  state: useLocationContext().state,
  setState: useLocationContext().setState,
  setStateId: useLocationContext().setStateId,
  setCityId: useLocationContext().setCityId,
  cityId: useLocationContext().cityId,
  stateId: useLocationContext().stateId,
  getCurrentLocationPincode: useLocationContext().getCurrentLocationPincode,
  isUserDeniedLocationAccess: useLocationContext().isUserDeniedLocationAccess,
  setIsUserDeniedLocationAccess: useLocationContext().setIsUserDeniedLocationAccess,
});

// axios
//   .get(
//     `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`
//   )
//   .then((res) => {
//     const addrComponents =
//       (res && res.data && res.data.results && res.data.results[0].address_components) || [];
//     const _pincode = (
//       addrComponents.find((item: Address) => item.types.indexOf('postal_code') > -1) || {}
//     ).long_name;
//     setCurrentLocation(addrComponents[2].short_name);
//     setCurrentPincode(_pincode);
//     localStorage.setItem('currentPincode', _pincode);
//     localStorage.setItem('currentAddress', addrComponents[2].short_name);
//   });
