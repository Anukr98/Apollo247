import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useEffect } from 'react';
import {
  AphRadio,
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
} from '@aph/web-ui-components';
import { useApolloClient } from 'react-apollo-hooks';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { ViewAllAddress } from 'components/Locations/ViewAllAddress';
import axios, { AxiosResponse, Canceler } from 'axios';

import { GET_PATIENT_ADDRESSES_LIST } from 'graphql/address';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
  GetPatientAddressList_getPatientAddressList_addressList,
} from 'graphql/types/GetPatientAddressList';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '20px 10px 10px 10px',
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
    deliveryTimeGroup: {
      margin: 10,
      marginTop: 0,
      borderTop: '0.5px solid rgba(2,71,91,0.2)',
      paddingTop: 10,
    },
    deliveryTimeGroupWrap: {
      display: 'flex',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      borderRadius: 5,
    },
    deliveryTime: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
    },
    deliveryDate: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#01475b',
      marginLeft: 'auto',
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

const apiDetails = {
  url: process.env.PHARMACY_MED_INFO_URL,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  deliveryUrl: process.env.PHARMACY_MED_DELIVERY_TIME,
  deliveryAuthToken: process.env.PHARMACY_MED_DELIVERY_AUTH_TOKEN,
};

export const HomeDelivery: React.FC = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const {
    setDeliveryAddressId,
    deliveryAddressId,
    deliveryAddresses,
    setDeliveryAddresses,
    cartItems,
  } = useShoppingCart();
  const { isSigningIn } = useAuth();
  const client = useApolloClient();
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = React.useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const [deliveryTime, setDeliveryTime] = React.useState<string>('');
  const [deliveryLoading, setDeliveryLoading] = React.useState<boolean>(false);

  const getAddressDetails = () => {
    setIsLoading(true);
    client
      .query<GetPatientAddressList, GetPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESSES_LIST,
        variables: {
          patientId: currentPatient && currentPatient.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (
          _data.data &&
          _data.data.getPatientAddressList &&
          _data.data.getPatientAddressList.addressList
        ) {
          const addresses = _data.data.getPatientAddressList.addressList.reverse();
          if (addresses && addresses.length > 0) {
            setDeliveryAddresses && setDeliveryAddresses(addresses);
            !deliveryAddressId && setDeliveryAddressId && setDeliveryAddressId(addresses[0].id);
            if (cartItems.length > 0) {
              fetchDeliveryTime();
            }
          } else {
            setDeliveryAddresses && setDeliveryAddresses([]);
          }
          setIsLoading(false);
          setIsError(false);
        }
      })
      .catch((e) => {
        setIsLoading(false);
        setIsError(true);
        console.log('Error occured while fetching Doctor', e);
      });
  };

  useEffect(() => {
    if (currentPatient && currentPatient.id) {
      getAddressDetails();
    }
  }, [currentPatient, deliveryAddressId]);

  const fetchDeliveryTime = async () => {
    const selectedAddress = deliveryAddresses.find((address) => address.id == deliveryAddressId);
    const lookUp = cartItems.map((item: MedicineCartItem) => {
      return { sku: item.id, qty: item.quantity };
    });
    setDeliveryLoading(true);
    await axios
      .post(
        apiDetails.deliveryUrl || '',
        {
          postalcode: selectedAddress ? selectedAddress.zipcode : '',
          ordertype: 'pharma',
          lookup: lookUp,
        },
        {
          headers: {
            Authentication: apiDetails.deliveryAuthToken,
          },
        }
      )
      .then((res: AxiosResponse) => {
        try {
          if (res && res.data) {
            if (
              typeof res.data === 'object' &&
              Array.isArray(res.data.tat) &&
              res.data.tat.length
            ) {
              setDeliveryTime(res.data.tat[0].deliverydate);
            } else if (typeof res.data === 'string') {
              console.log(res.data);
            } else if (typeof res.data.errorMSG === 'string') {
              console.log(res.data.errorMSG);
            }
          }
          setDeliveryLoading(false);
        } catch (error) {
          setDeliveryLoading(false);
          console.log(error);
        }
      })
      .catch((error: any) => alert(error));
  };

  if (isError) {
    return <p>Error while fetching addresses.</p>;
  }

  return (
    <div className={classes.root}>
      {deliveryAddresses.length > 0 ? (
        <ul>
          {deliveryAddresses.map(
            (
              deliveryAddress: GetPatientAddressList_getPatientAddressList_addressList,
              index: number
            ) => {
              if (index < 2) {
                const addressId = deliveryAddress.id;
                const address = `${deliveryAddress.addressLine1} - ${deliveryAddress.zipcode}`;
                return (
                  <li key={index}>
                    <FormControlLabel
                      checked={deliveryAddressId === addressId}
                      className={classes.radioLabel}
                      value={addressId}
                      control={<AphRadio color="primary" />}
                      label={address}
                      onChange={() => {
                        setDeliveryAddressId && setDeliveryAddressId(addressId);
                      }}
                    />
                  </li>
                );
              }
            }
          )}
        </ul>
      ) : (
        <>{isLoading ? <CircularProgress /> : null}</>
      )}

      <div className={classes.bottomActions}>
        {!isSigningIn ? (
          <AphButton onClick={() => setIsAddAddressDialogOpen(true)}>Add new address</AphButton>
        ) : null}
        {deliveryAddresses.length > 2 ? (
          <AphButton
            onClick={() => setIsViewAllAddressDialogOpen(true)}
            className={classes.viewAllBtn}
          >
            View All
          </AphButton>
        ) : null}
      </div>
      {deliveryTime !== '' && (
        <div className={classes.deliveryTimeGroup}>
          <div className={classes.deliveryTimeGroupWrap}>
            <span className={classes.deliveryTime}>Delivery Time</span>
            <span className={classes.deliveryDate}>
              {deliveryLoading ? <CircularProgress size={22} /> : deliveryTime}
            </span>
          </div>
        </div>
      )}

      <AphDialog open={isAddAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAddAddressDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div>
          Add New Address
        </AphDialogTitle>
        <AddNewAddress setIsAddAddressDialogOpen={setIsAddAddressDialogOpen} />
      </AphDialog>

      <AphDialog open={isViewAllAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsViewAllAddressDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div>
          Select Delivery Address
        </AphDialogTitle>
        <ViewAllAddress setIsViewAllAddressDialogOpen={setIsViewAllAddressDialogOpen} />
      </AphDialog>
    </div>
  );
};
