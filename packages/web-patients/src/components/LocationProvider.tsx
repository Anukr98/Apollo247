import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LOCATION_API_KEY = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';

export interface LocationContextProps {
  currentLocation: string | null;
  currentLat: string | null;
  currentLong: string | null;
  setCurrentLocation: Function;
  setCurrentLat: Function;
  setCurrentLong: Function;
}

export const LocationContext = React.createContext<LocationContextProps>({
  currentLocation: null,
  currentLat: null,
  currentLong: null,
  setCurrentLocation: () => {},
  setCurrentLat: () => {},
  setCurrentLong: () => {},
});

export const LocationProvider: React.FC = (props) => {
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentLat, setCurrentLat] = useState<string>('');
  const [currentLong, setCurrentLong] = useState<string>('');

  useEffect(() => {
    const currentAddress = localStorage.getItem('currentAddress');
    if (currentAddress != null) {
      if (currentAddress.includes(',')) {
        setCurrentLocation(currentAddress.substring(0, currentAddress.indexOf(',')));
      } else {
        setCurrentLocation(currentAddress);
      }
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${currentAddress}&key=${LOCATION_API_KEY}`;
      axios.get(url).then((res) => {
        if (res != null && res.data != null && res.data.results[0] != null) {
          const { lat, lng } = res.data.results[0].geometry.location;
          setCurrentLat(lat.toString());
          setCurrentLong(lng.toString());
        }
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          setCurrentLat(latitude.toString());
          setCurrentLong(longitude.toString());
          console.log(latitude, longitude);
          axios
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${LOCATION_API_KEY}`
            )
            .then((res) => {
              setCurrentLocation(res.data.results[0].address_components[2].short_name);
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
    }
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
      }}
    >
      {props.children}
    </LocationContext.Provider>
  );
};
