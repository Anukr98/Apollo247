import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import axios from 'axios';
import { useContext } from 'react';
import { LocationContext, Address } from 'components/LocationProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    actions: {
      padding: '10px 20px 20px 20px',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        minWidth: 156,
        '&:first-child': {
          color: '#fc9916',
        },
        '&:last-child': {
          marginLeft: 'auto',
        },
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
  };
});

type AllowLocationProps = {
  setIsLocationPopoverOpen: (isLocationPopoverOpen: boolean) => void;
  setIsPopoverOpen: (isPopoverOpen: boolean) => void;
  isPopoverOpen: boolean;
};

export const AllowLocation: React.FC<AllowLocationProps> = (props) => {
  const classes = useStyles({});
  const { setCurrentLat, setCurrentLong, setCurrentLocation, setCurrentPincode } = useContext(
    LocationContext
  );

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Hi! :)</Typography>
        <p>
          We need to know your location to function better. Please allow us to auto detect your
          location or enter location manually.
        </p>
      </div>
      <div className={classes.actions}>
        <AphButton
          onClick={() => {
            props.setIsPopoverOpen(false);
            props.setIsLocationPopoverOpen(true);
          }}
          disabled={props.isPopoverOpen}
        >
          Enter Manualy
        </AphButton>
        <AphButton
          color="primary"
          disabled={props.isPopoverOpen}
          onClick={() => {
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
                      addrComponents.find(
                        (item: Address) => item.types.indexOf('postal_code') > -1
                      ) || {}
                    ).long_name;
                    setCurrentLocation(addrComponents[2].short_name);
                    setCurrentPincode(_pincode);
                    localStorage.setItem('currentAddress', addrComponents[2].short_name);
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
            props.setIsPopoverOpen(false);
          }}
        >
          Allow Auto Detect
        </AphButton>
      </div>
    </div>
  );
};
