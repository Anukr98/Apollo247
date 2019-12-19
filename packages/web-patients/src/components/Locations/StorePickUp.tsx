import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState, useContext } from 'react';
import {
  AphDialog,
  AphRadio,
  AphButton,
  AphTextField,
  AphDialogTitle,
  AphDialogClose,
} from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { ViewAllStoreAddress } from 'components/Locations/ViewAllStoreAddress';
import axios, { AxiosError, Cancel } from 'axios';
import { LocationContext } from 'components/LocationProvider';
import { useShoppingCart } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 10,
      '& ul': {
        padding: 0,
        margin: 0,
      },
      '& li': {
        listStyleType: 'none',
        paddingBottom: 10,
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
    },
    radioLabel: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      alignItems: 'start',
      '& span:last-child': {
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    bottomActions: {
      display: 'flex',
      alignItems: 'center',
      '& button': {
        boxShadow: 'none',
        padding: 0,
        color: '#fc9916',
      },
    },
    viewAllBtn: {
      marginLeft: 'auto',
    },
    searchAddress: {
      paddingBottom: 20,
    },
    dialogContent: {
      paddingTop: 10,
    },
    backArrow: {
      cursor: 'pointer',
      position: 'absolute',
      left: 0,
      top: -2,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      '& button': {
        borderRadius: 10,
      },
    },
    customScrollBar: {
      paddingRight: 20,
      paddingLeft: 20,
    },
    shadowHide: {
      overflow: 'hidden',
    },
    noAddress: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      paddingBottom: 10,
    },
  };
});

export interface StoreAddresses {
  address: string;
  city: string;
  message: string;
  phone: string;
  state: string;
  storeid: string;
  storename: string;
  workinghrs: string;
}

interface StorePickupProps {
  pincode: string | null;
  updateDeliveryAddress: (deliveryAddressId: string) => void;
}

export const StorePickUp: React.FC<StorePickupProps> = (props) => {
  const apiDetails = {
    url: `${process.env.PHARMACY_MED_PROD_URL}/searchpin_api.php`,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    googleAPIKey: process.env.GOOGLE_API_KEY,
  };

  const classes = useStyles({});
  const [storeAddressId, setStoreAddressId] = React.useState<string>('');
  const [storeAddresses, setStoreAddresses] = React.useState<StoreAddresses[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pincodeError, setPincodeError] = useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );
  const [pincode, setPincode] = useState<string | null>(props.pincode);
  const { currentLat, currentLong, setCurrentPincode, currentPincode } = useContext(
    LocationContext
  );

  const { setDeliveryPincode } = useShoppingCart();

  let showAddress = 0;

  const getPharmacyAddresses = async (pincode: string) => {
    await axios
      .post(
        apiDetails.url,
        { params: pincode },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then((result) => {
        if (result && result.data && result.data.Stores) {
          const stores = result.data.Stores;
          if (stores && stores[0] && stores[0].message !== 'Data Not Available') {
            setStoreAddresses(stores);
            setPincodeError(false);
          } else {
            setStoreAddresses([]);
            setPincodeError(true);
          }
        }
        setLoading(false);
      })
      .catch((thrown: AxiosError | Cancel) => {
        setLoading(false);
        setPincodeError(true);
      });
  };

  const getCurrentLocationPincode = async (currentLat: string, currentLong: string) => {
    await axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLat},${currentLong}&key=${apiDetails.googleAPIKey}`
      )
      .then((res) => {
        try {
          if (res && res.data && res.data.results[0] && res.data.results[0].address_components) {
            const addrComponents = res.data.results[0].address_components || [];
            const _pincode = (
              addrComponents.find((item: any) => item.types.indexOf('postal_code') > -1) || {}
            ).long_name;
            if (_pincode && _pincode.length === 6) {
              setPincode(_pincode);
              setDeliveryPincode && setDeliveryPincode(_pincode);
              setCurrentPincode(_pincode);
            }
          }
        } catch {
          (e: AxiosError) => console.log(e);
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
        setPincodeError(true);
      });
  };

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      setLoading(true);
      getPharmacyAddresses(pincode);
    } else if (!pincode && pincode !== '') {
      if (currentLat && currentLong) {
        getCurrentLocationPincode(currentLat, currentLong);
      }
    }
  }, [pincode]);

  props.updateDeliveryAddress(storeAddressId);
  return (
    <div className={classes.root}>
      <div className={classes.searchAddress}>
        <AphTextField
          placeholder="Enter Pincode"
          inputProps={{
            maxLength: 6,
            type: 'text',
          }}
          onKeyPress={(e) => {
            if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
          }}
          value={pincode}
          onChange={(e) => {
            const newPincode = e.target.value;
            if (newPincode.length === 6) {
              setLoading(true);
              getPharmacyAddresses(newPincode);
              setDeliveryPincode && setDeliveryPincode(newPincode);
            } else if (newPincode === '') {
              setStoreAddresses([]);
              setPincodeError(false);
            }
            setPincode(newPincode);
          }}
          autoFocus
        />
      </div>

      {!loading ? (
        <ul>
          {storeAddresses.length > 0 ? (
            storeAddresses.map((addressDetails, index) => {
              const storeAddress = addressDetails.address.replace(' -', ' ,');
              showAddress++;
              return showAddress < 3 ? (
                <li key={index}>
                  <FormControlLabel
                    checked={storeAddressId === addressDetails.storeid}
                    className={classes.radioLabel}
                    value={addressDetails.storeid}
                    control={<AphRadio color="primary" />}
                    label={storeAddress}
                    onChange={() => {
                      setStoreAddressId(addressDetails.storeid);
                    }}
                  />
                </li>
              ) : (
                ''
              );
            })
          ) : (
            <>
              {pincodeError && (
                <div className={classes.noAddress}>
                  Sorry! We're working hard to get to this area! In the meantime, you can either
                  pick up from a nearby store, or change the pincode.
                </div>
              )}
            </>
          )}
        </ul>
      ) : (
        <CircularProgress />
      )}
      <div className={classes.bottomActions}>
        <AphButton
          onClick={() => setIsViewAllAddressDialogOpen(true)}
          className={classes.viewAllBtn}
        >
          View All
        </AphButton>
      </div>
      <AphDialog open={isViewAllAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsViewAllAddressDialogOpen(false)} />
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="Store Pick Up" />
          </div>
          Store Pick Up
        </AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <ViewAllStoreAddress
                  pincode={pincode}
                  storeAddresses={storeAddresses}
                  setStoreAddresses={setStoreAddresses}
                  setStoreAddress={(storeAddressId: any) => setStoreAddressId(storeAddressId)}
                  getPharmacyAddresses={getPharmacyAddresses}
                  pincodeError={pincodeError}
                  setPincodeError={setPincodeError}
                  loading={loading}
                  setLoading={setLoading}
                  setPincode={setPincode}
                  storeAddressId={storeAddressId}
                  setStoreAddressId={setStoreAddressId}
                />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton
              color="primary"
              fullWidth
              disabled={storeAddressId === ''}
              className={storeAddressId === '' ? classes.buttonDisable : ''}
              onClick={() => setIsViewAllAddressDialogOpen(false)}
            >
              Done
            </AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
