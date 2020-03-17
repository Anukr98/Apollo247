import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { AphRadio, AphTextField } from '@aph/web-ui-components';
import { useShoppingCart, StoreAddresses } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 14,
      paddingBottom: 20,
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
    addressGroup: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      paddingTop: 11,
      paddingBottom: 6,
      marginBottom: 10,
    },
    pinSearch: {
      paddingBottom: 20,
    },
    sectionHeader: {
      marginBottom: 20,
      paddingBottom: 4,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
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

interface ViewAllStoreAddressProps {
  pincode: string | null;
  getPharmacyAddresses: (pinCode: string) => void;
  pincodeError: boolean;
  setPincodeError: (pincodeError: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setPincode: (pincode: string) => void;
  setStoreAddress: (StoreAddresses: any) => void;
}

export const ViewAllStoreAddress: React.FC<ViewAllStoreAddressProps> = (props) => {
  const classes = useStyles({});
  const {
    setStorePickupPincode,
    setStoreAddressId,
    storeAddressId,
    setStores,
    stores,
    setDeliveryAddressId,
  } = useShoppingCart();

  useEffect(() => {
    if (props.pincode && props.pincode.length === 6 && stores.length === 0) {
      props.setLoading(true);
      props.getPharmacyAddresses(props.pincode);
    }
  }, [props.pincode]);

  return (
    <div className={classes.root}>
      <div className={classes.addressGroup}>
        <div className={classes.pinSearch}>
          <AphTextField
            value={props.pincode}
            placeholder="Enter Pincode"
            inputProps={{
              maxLength: 6,
              type: 'text',
            }}
            onKeyPress={(e) => {
              if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
            }}
            onChange={(e) => {
              const newPincode = e.target.value;
              if (newPincode.length === 6) {
                props.setLoading(true);
                props.getPharmacyAddresses(newPincode);
                setStorePickupPincode && setStorePickupPincode(newPincode);
              } else if (newPincode === '') {
                setStores && setStores([]);
                props.setPincodeError(false);
              }
              props.setPincode(newPincode);
            }}
          />
        </div>

        {stores.length > 0 ? (
          <>
            <div className={classes.sectionHeader}>Stores In This Region</div>
            {props.loading ? (
              <CircularProgress />
            ) : (
              <ul>
                {stores.map((addressDetails: StoreAddresses, index: number) => {
                  const storeAddress = addressDetails.address.replace(' -', ' ,');
                  return (
                    <li key={index}>
                      <FormControlLabel
                        checked={storeAddressId === addressDetails.storeid}
                        className={classes.radioLabel}
                        value={addressDetails.storeid}
                        control={<AphRadio color="primary" />}
                        label={storeAddress}
                        onChange={() => {
                          props.setStoreAddress(addressDetails);
                          setDeliveryAddressId && setDeliveryAddressId('');
                          setStoreAddressId && setStoreAddressId(addressDetails.storeid);
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : null}

        {props.pincodeError ? (
          <div className={classes.noAddress}>
            Sorry! We're working hard to get to this area! In the meantime, you can either pick up
            from a nearby store, or change the pincode.
          </div>
        ) : null}
      </div>
    </div>
  );
};
