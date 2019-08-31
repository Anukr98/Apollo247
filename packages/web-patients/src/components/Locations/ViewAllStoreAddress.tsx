import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { AphRadio, AphTextField } from '@aph/web-ui-components';
import { StoreAddresses } from 'components/Locations/StorePickUp';
import axios, { AxiosError, Cancel } from 'axios';

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

interface ViewAllStoreAddressProps {
  pincode: string;
  stores: StoreAddresses[];
  setStoreAddress: (storeAddressId: string) => void;
}

export const ViewAllStoreAddress: React.FC<ViewAllStoreAddressProps> = (props) => {
  const classes = useStyles();
  const [pincode, setPincode] = React.useState<string>(props.pincode || '');
  const [storeAddresses, setStoreAddresses] = React.useState<StoreAddresses[]>(props.stores || []);
  const [storeAddressId, setStoreAddressId] = React.useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pincodeError, setPincodeError] = useState<boolean>(false);

  const getPharmacyAddresses = (pincode: string) => {
    axios
      .post(
        process.env.PHARMACY_MED_PHARMACIES_LIST_URL,
        { params: pincode },
        {
          headers: {
            Authorization: process.env.PHARMACY_MED_AUTH_TOKEN,
          },
          transformRequest: [
            (data, headers) => {
              delete headers.common['Content-Type'];
              return JSON.stringify(data);
            },
          ],
        }
      )
      .then((result) => {
        setTimeout(() => {
          const stores = result.data.Stores ? result.data.Stores : [];
          if (stores && stores[0] && stores[0].message !== 'Data Not Available') {
            setTimeout(() => {}, 500);
            setStoreAddresses(stores);
          } else {
            setStoreAddresses([]);
            setPincodeError(true);
          }
          setLoading(false);
        }, 1000);
      })
      .catch((thrown: AxiosError | Cancel) => {
        alert('An error occurred while fetching Stores.');
      });
  };

  useEffect(() => {
    if (pincode.length === 6) {
      setLoading(true);
      getPharmacyAddresses(pincode);
    }
  }, [pincode]);

  return (
    <div className={classes.root}>
      <div className={classes.addressGroup}>
        <div className={classes.pinSearch}>
          <AphTextField
            value={pincode}
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
              setPincode(e.target.value);
              if (newPincode.length === 6) {
                setLoading(true);
                getPharmacyAddresses(newPincode);
              } else if (newPincode === '') {
                setStoreAddresses([]);
                setPincodeError(false);
              }
            }}
          />
        </div>

        {storeAddresses.length > 0 ? (
          <>
            <div className={classes.sectionHeader}>Stores In This Region</div>
            {loading ? (
              <CircularProgress />
            ) : (
              <ul>
                {storeAddresses.map((addressDetails, index) => {
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
                          setStoreAddressId(addressDetails.storeid);
                          props.setStoreAddress(addressDetails.storeid);
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : null}

        {pincodeError ? (
          <div className={classes.noAddress}>
            Sorry! We're working hard to get to this area! In the meantime, you can either pick up
            from a nearby store, or change the pincode.
          </div>
        ) : null}
      </div>
    </div>
  );
};
