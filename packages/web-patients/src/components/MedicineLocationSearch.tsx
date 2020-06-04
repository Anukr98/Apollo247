import React, { useRef, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Popover, CircularProgress } from '@material-ui/core';
import { AphTextField, AphButton, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { MedicineAllowLocation } from 'components/MedicineAllowLocation';

import { useLocationDetails, GooglePlacesType } from 'components/LocationProvider';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useShoppingCart } from './MedicinesCartProvider';
import axios, { AxiosError } from 'axios';
import { Alerts } from 'components/Alerts/Alerts';
import { checkServiceAvailability } from 'helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    userLocation: {
      borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      paddingLeft: 20,
      marginLeft: 40,
      paddingTop: 14,
      paddingBottom: 14,
      marginTop: 10,
      marginBottom: 10,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
        borderLeft: 'none',
        paddingTop: 15,
        paddingBottom: 15,
      },
    },
    locationWrap: {
      maxWidth: 210,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        maxWidth: 180,
      },
      [theme.breakpoints.down(500)]: {
        maxWidth: 150,
      },
    },
    selectedLocation: {
      fontSize: 14,
      fontWeight: 500,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      display: 'flex',
      alignItems: 'center',
      '& span:first-child': {
        borderBottom: '2px solid #00b38e',
      },
      '& span:last-child': {
        '& img': {
          verticalAlign: 'middle',
        },
      },
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      [theme.breakpoints.down(360)]: {
        display: 'none',
      },
    },
    userName: {
      fontSize: 12,
      color: '#01475b',
    },
    locationPopRoot: {
      overflow: 'initial',
      boxShadow: '0 0 3px 0 rgba(0, 0, 0, 0.2)',
      border: 'solid 1px #f7f8f5',
      '& ul': {
        margin: 0,
        padding: 0,
        '& li': {
          padding: '12px 20px',
          fontSize: 15,
          fontWeight: 500,
          borderBottom: 'solid 1px #f7f8f5',
          listStyleType: 'none',
          cursor: 'pointer',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    noService: {
      position: 'absolute',
      bottom: -2,
      fontSize: 11,
      color: '#890000',
      minWidth: 140,
    },
    pincodeData: {
      padding: 30,
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      '& h2': {
        fontSize: 32,
        lineHeight: '42px',
        fontWeight: 600,
        margin: 0,
      },
    },
    bottomActions: {
      textAlign: 'center',
      paddingTop: 16,
    },
    submitBtn: {
      backgroundColor: '#fcb716',
      color: '#fff',
      minWidth: 150,
      borderRadius: 10,
      padding: '9px 13px 9px 13px',
      fontSize: 13,
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: '#fcb716',
        color: '#fff',
      },
    },
    disabledBtn: {
      opacity: 0.6,
    },
    pincodeError: {
      fontSize: 13,
      color: '#890000',
      paddingTop: 8,
      fontWeight: 500,
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
      [theme.breakpoints.down('xs')]: {
        marginLeft: 5,
      },
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
    locationPopoverClose: {
      position: 'absolute',
      top: -10,
      height: 26,
      borderRadius: '50%',
      boxShadow: '1px 1px 2px 1px #eaeaea',
      left: -10,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
      },
    },
  });
});

const apiDetails = {
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  service_url: process.env.PHARMACY_SERVICE_AVAILABILITY,
};

interface Address {
  long_name: string;
  short_name: string;
  types: Array<string>;
}

export const MedicineLocationSearch: React.FC = (props) => {
  const classes = useStyles({});
  const locationRef = useRef(null);
  const mascotRef = useRef(null);
  const { currentLocation, currentPincode } = useLocationDetails();
  const {
    medicineAddress,
    setMedicineAddress,
    setPharmaAddressDetails,
    pharmaAddressDetails,
  } = useShoppingCart();

  const [isLocationPopover, setIsLocationPopover] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [isForceFullyClosePopover, setIsForceFullyClosePopover] = React.useState<boolean>(false);

  const [isLocationDenied, setIsLocationDenied] = React.useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();

  const [isPincodeDialogOpen, setIsPincodeDialogOpen] = React.useState<boolean>(false);
  const [pincode, setPincode] = React.useState<string>('');
  const [pincodeError, setPincodeError] = React.useState<boolean>(false);
  const [mutationLoading, setMutationLoading] = React.useState<boolean>(false);
  const [headerPincodeError, setHeaderPincodeError] = React.useState<string | null>(null);
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);

  const closePopOver = () => {
    setIsForceFullyClosePopover(true);
    setIsPopoverOpen(false);
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
    return findItem ? findItem.short_name || findItem.long_name : '';
  };

  const locateCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        getCurrentLocationDetails(latitude.toString(), longitude.toString());
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
  };

  useEffect(() => {
    if (
      !localStorage.getItem('pharmaAddress') &&
      !localStorage.getItem('currentAddress') &&
      !isLocationDenied
    ) {
      navigator.permissions &&
        navigator.permissions.query({ name: 'geolocation' }).then((PermissionStatus) => {
          if (PermissionStatus.state === 'denied') {
            setIsPopoverOpen(false);
            setIsLocationDenied(true);
          } else if (PermissionStatus.state !== 'granted' && !isForceFullyClosePopover) {
            setIsPopoverOpen(true);
          } else if (PermissionStatus.state === 'granted') {
            locateCurrentLocation();
            setIsPopoverOpen(false);
          }
        });
    } else {
      setIsPopoverOpen(false);
    }
  });

  useEffect(() => {
    const medicineAddr = localStorage.getItem('pharmaAddress') || medicineAddress;
    if (!medicineAddr && currentLocation) {
      setMedicineAddress(currentLocation);
    }
    if (!pharmaAddressDetails.pincode && currentPincode) {
      setPharmaAddressDetails({ ...pharmaAddressDetails, pincode: currentPincode });
    }
  }, [currentLocation, currentPincode]);

  useEffect(() => {
    if (!headerPincodeError && pharmaAddressDetails.pincode) {
      isServiceable(pharmaAddressDetails.pincode);
    }
  }, [pharmaAddressDetails]);

  const getAddressFromLocalStorage = () => {
    const currentAddress = localStorage.getItem('pharmaAddress');
    if (currentAddress) {
      return currentAddress.includes(',')
        ? currentAddress.substring(0, currentAddress.indexOf(','))
        : currentAddress;
    }
    return 'No location';
  };

  const getCurrentLocationDetails = async (currentLat: string, currentLong: string) => {
    await axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLat},${currentLong}&key=${process.env.GOOGLE_API_KEY}`
      )
      .then(({ data }) => {
        try {
          if (data && data.results[0] && data.results[0].address_components) {
            const addrComponents = data.results[0].address_components || [];
            const pincode = findAddrComponents('postal_code', addrComponents);
            const city =
              findAddrComponents('administrative_area_level_2', addrComponents) ||
              findAddrComponents('locality', addrComponents);
            const state = findAddrComponents('administrative_area_level_1', addrComponents);
            const country = findAddrComponents('country', addrComponents);
            const area =
              findAddrComponents('sublocality_level_1', addrComponents) ||
              findAddrComponents('sublocality_level_2', addrComponents) ||
              findAddrComponents('locality', addrComponents);
            setMedicineAddress(area);
            setPharmaAddressDetails({
              city,
              state,
              pincode,
              country,
            });
            setIsPincodeDialogOpen(false);
            setIsLocationPopover(false);
            setPincode('');
            setPincodeError(false);
            setMutationLoading(false);
          }
        } catch {
          (e: AxiosError) => {
            console.log(e);
            setIsAlertOpen(true);
            setAlertMessage('Something went wrong :(');
            setMutationLoading(false);
          };
        }
      })
      .catch((e: AxiosError) => {
        setMutationLoading(false);
        setIsAlertOpen(true);
        setAlertMessage('Something went wrong :(');
        console.log(e);
      });
  };

  const getPlaceDetails = (pincode: string) => {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&components=country:in&key=${process.env.GOOGLE_API_KEY}`
      )
      .then(({ data }) => {
        try {
          if (data && data.results[0] && data.results[0].address_components) {
            const { lat, lng } = data.results[0].geometry.location;
            getCurrentLocationDetails(lat, lng);
          }
        } catch {
          (e: AxiosError) => {
            setMutationLoading(false);
            console.log(e);
          };
        }
      })
      .catch((e: AxiosError) => {
        setMutationLoading(false);
        setIsAlertOpen(true);
        setAlertMessage('Something went wrong :(');
        console.log(e);
      });
  };

  const checkSelectedPincodeServiceability = (pincode: string, status: string) => {
    if (pincode === pharmaAddressDetails.pincode) {
      setHeaderPincodeError(status);
      setPincodeError(false);
    } else {
      setPincodeError(status === '1');
      setHeaderPincodeError('0');
    }
  };

  const isServiceable = (pincode: string) => {
    checkServiceAvailability(pincode)
      .then(({ data }: any) => {
        if (data && data.Availability) {
          checkSelectedPincodeServiceability(pincode, '0');
          getPlaceDetails(pincode);
        } else {
          setMutationLoading(false);
          checkSelectedPincodeServiceability(pincode, '1');
        }
      })
      .catch((e) => {
        setIsAlertOpen(true);
        setAlertMessage('Something went wrong :(');
        setMutationLoading(false);
      });
  };

  return (
    <div className={classes.userLocation}>
      <div
        className={classes.locationWrap}
        ref={locationRef}
        onClick={() => setIsLocationPopover(true)}
        id="locationId"
      >
        {currentPatient && currentPatient.id && (
          <div className={classes.userName}>Deliver to {currentPatient.firstName}</div>
        )}
        <div className={classes.selectedLocation}>
          <span>
            {`${
              !isPopoverOpen && medicineAddress
                ? medicineAddress || currentLocation
                : getAddressFromLocalStorage()
            } ${pharmaAddressDetails ? pharmaAddressDetails.pincode || currentPincode : ''}`}
          </span>
          <span>
            <img src={require('images/ic_dropdown_green.svg')} alt="" />
          </span>
        </div>
        {headerPincodeError === '1' && (
          <div className={classes.noService}>Sorry, not serviceable here.</div>
        )}
      </div>
      <Popover
        open={isLocationPopover}
        anchorEl={locationRef.current}
        onClose={() => {
          setIsLocationPopover(false);
        }}
        classes={{
          paper: classes.locationPopRoot,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <ul>
          <li
            onClick={() => {
              setHeaderPincodeError(null);
              locateCurrentLocation();
            }}
          >
            Auto Select Location
          </li>
          <li
            onClick={() => {
              setIsLocationPopover(false);
              setIsPincodeDialogOpen(true);
            }}
          >
            Enter Delivery Pincode
          </li>
        </ul>
      </Popover>
      <AphDialog open={isPincodeDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsPincodeDialogOpen(false)} title={'Close'} />
        <div className={classes.pincodeData}>
          <h2>Hi! :)</h2>
          <p>Allow us to serve you better by entering your delivery pincode below.</p>
          <AphTextField
            placeholder="Enter pincode here"
            onChange={(e) => {
              setPincodeError(false);
              setPincode(e.target.value);
            }}
            inputProps={{
              maxLength: 6,
            }}
            value={pincode}
          />
          {pincodeError && (
            <div className={classes.pincodeError}>
              Sorry, we are not servicing in your area currently. Call 1860 500 0101 for pharmacy
              store nearby.
            </div>
          )}
          <div className={classes.bottomActions}>
            <AphButton
              color="primary"
              disabled={pincode.length !== 6 || pincodeError}
              classes={{
                root: classes.submitBtn,
                disabled: classes.disabledBtn,
              }}
              onClick={() => {
                setMutationLoading(true);
                isServiceable(pincode);
              }}
            >
              {mutationLoading ? <CircularProgress color="secondary" size={22} /> : 'Submit'}
            </AphButton>
          </div>
        </div>
      </AphDialog>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.locationPopoverClose} onClick={closePopOver}>
              <img src={require('images/ic_cross_popup.svg')} alt="" />
            </div>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <MedicineAllowLocation
              setIsPincodeDialogOpen={setIsPincodeDialogOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              isPopoverOpen={isPopoverOpen}
            />
          </div>
        </div>
      </Popover>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
