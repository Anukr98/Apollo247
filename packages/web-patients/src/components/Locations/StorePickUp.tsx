import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import {
  AphDialog,
  AphRadio,
  AphButton,
  AphTextField,
  AphDialogTitle,
} from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { ViewAllStoreAddress } from 'components/Locations/ViewAllStoreAddress';
import axios, { AxiosError, Cancel } from 'axios';

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
  pincode: string;
  updateDeliveryAddress: (deliveryAddressId: string) => void;
}

export const StorePickUp: React.FC<StorePickupProps> = (props) => {
  const classes = useStyles();
  const [storeAddressId, setStoreAddressId] = React.useState<string>('');
  const [storeAddresses, setStoreAddresses] = React.useState<StoreAddresses[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pincodeError, setPincodeError] = useState<boolean>(false);

  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );
  const [pincode, setPincode] = useState<string>('');

  let showAddress = 0;

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

  //set store address in cart.
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

      {!loading && !pincodeError && pincode.length === 6 ? (
        <div className={classes.bottomActions}>
          <AphButton
            onClick={() => setIsViewAllAddressDialogOpen(true)}
            className={classes.viewAllBtn}
          >
            View All
          </AphButton>
        </div>
      ) : null}
      <AphDialog
        open={isViewAllAddressDialogOpen}
        maxWidth="sm"
        onClose={() => {
          setIsViewAllAddressDialogOpen(false);
        }}
      >
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
                  stores={storeAddresses}
                  setStoreAddress={(storeAddressId) => setStoreAddressId(storeAddressId)}
                />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton color="primary" fullWidth>
              Done
            </AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
