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
import { useShoppingCart, StoreAddresses } from 'components/MedicinesCartProvider';

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

type Address = {
  long_name: string;
  short_name: string;
  types: Array<string>;
};

export const StorePickUp: React.FC<{ pincode: string | null }> = (props) => {
  const apiDetails = {
    url: process.env.PHARMACY_STORE_PICKUP_SEARCH,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    googleAPIKey: process.env.GOOGLE_API_KEY,
  };

  const classes = useStyles({});

  const {
    setStorePickupPincode,
    deliveryAddressId,
    setDeliveryAddressId,
    stores,
    setStores,
  } = useShoppingCart();
  const [loading, setLoading] = useState<boolean>(false);
  const [pincodeError, setPincodeError] = useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );
  const [pincode, setPincode] = useState<string | null>(props.pincode);
  const { currentLat, currentLong, setCurrentPincode } = useContext(LocationContext);

  let showAddress = 0;

  const getPharmacyAddresses = async (pincode: string) => {
    await axios
      .post(
        apiDetails.url || '',
        { params: pincode },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        if (data && data.Stores) {
          const storesData = data.Stores;
          if (storesData && storesData[0] && storesData[0].message !== 'Data Not Available') {
            setStores && setStores(storesData);
            setPincodeError(false);
          } else {
            setStores && setStores([]);
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
      .then(({ data }) => {
        try {
          if (data && data.results[0] && data.results[0].address_components) {
            const addressComponents = data.results[0].address_components || [];
            const pincode = (
              addressComponents.find((item: Address) => item.types.indexOf('postal_code') > -1) ||
              {}
            ).long_name;
            if (pincode && pincode.length === 6) {
              setPincode(pincode);
              setStorePickupPincode && setStorePickupPincode(pincode);
              setCurrentPincode(pincode);
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
    if (pincode && pincode.length === 6 && stores.length === 0) {
      setLoading(true);
      getPharmacyAddresses(pincode);
    } else if (!pincode && pincode !== '') {
      if (currentLat && currentLong) {
        getCurrentLocationPincode(currentLat, currentLong);
      }
    }
  }, [pincode]);

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
              setStorePickupPincode && setStorePickupPincode(newPincode);
            } else if (newPincode === '') {
              setStores && setStores([]);
              setPincodeError(false);
            }
            setPincode(newPincode);
          }}
          autoFocus
        />
      </div>

      {!loading ? (
        <ul>
          {stores.length > 0 ? (
            stores.map((addressDetails, index) => {
              const storeAddress = addressDetails.address.replace(' -', ' ,');
              showAddress++;
              return showAddress < 3 ? (
                <li key={index}>
                  <FormControlLabel
                    checked={deliveryAddressId === addressDetails.storeid}
                    className={classes.radioLabel}
                    value={addressDetails.storeid}
                    control={<AphRadio color="primary" />}
                    label={storeAddress}
                    onChange={() => {
                      setDeliveryAddressId && setDeliveryAddressId(addressDetails.storeid);
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
      {stores.length > 2 && (
        <div className={classes.bottomActions}>
          <AphButton
            onClick={() => setIsViewAllAddressDialogOpen(true)}
            className={classes.viewAllBtn}
          >
            View All
          </AphButton>
        </div>
      )}
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
                  getPharmacyAddresses={getPharmacyAddresses}
                  pincodeError={pincodeError}
                  setPincodeError={setPincodeError}
                  loading={loading}
                  setLoading={setLoading}
                  setPincode={setPincode}
                />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton
              color="primary"
              fullWidth
              disabled={deliveryAddressId === ''}
              className={deliveryAddressId === '' ? classes.buttonDisable : ''}
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
