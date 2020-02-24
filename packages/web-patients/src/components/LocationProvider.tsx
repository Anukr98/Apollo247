import React, { useEffect, useState } from 'react';
import axios from 'axios';

export interface LocationContextProps {
  currentLocation: string | null;
  currentLat: string | null;
  currentLong: string | null;
  currentPincode: string | null;
  setCurrentLocation: (currentLocation: string) => void;
  setCurrentLat: (currentLat: string) => void;
  setCurrentLong: (currentLong: string) => void;
  setCurrentPincode: (currenPincode: string) => void;
}

interface Address {
  long_name: string;
  short_name: string;
  types: Array<string>;
}

export const LocationContext = React.createContext<LocationContextProps>({
  currentLocation: null,
  currentLat: null,
  currentLong: null,
  currentPincode: null,
  setCurrentLocation: () => {},
  setCurrentLat: () => {},
  setCurrentLong: () => {},
  setCurrentPincode: () => {},
});

export const LocationProvider: React.FC = (props) => {
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentLat, setCurrentLat] = useState<string | null>(null);
  const [currentLong, setCurrentLong] = useState<string | null>(null);
  const [currentPincode, setCurrentPincode] = useState<string>('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCurrentLat(latitude.toString());
        setCurrentLong(longitude.toString());
        axios
          .get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`
          )
          .then((res) => {
            const addrComponents = res.data.results[0].address_components || [];
            const _pincode = (
              addrComponents.find((item: Address) => item.types.indexOf('postal_code') > -1) || {}
            ).long_name;
            localStorage.setItem('currentAddress', addrComponents[2].short_name);
            setCurrentLocation(addrComponents[2].short_name);
            setCurrentPincode(_pincode);
          });
      },
      (err) => {
        console.log(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

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
      }}
    >
      {props.children}
    </LocationContext.Provider>
  );
};
