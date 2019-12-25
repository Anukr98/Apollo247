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
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { ViewAllAddress } from 'components/Locations/ViewAllAddress';
import { useMutation } from 'react-apollo-hooks';

import { GET_PATIENT_ADDRESSES_LIST } from 'graphql/address';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
  GetPatientAddressList_getPatientAddressList_addressList,
} from 'graphql/types/GetPatientAddressList';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { useShoppingCart } from 'components/MedicinesCartProvider';

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

export const HomeDelivery: React.FC = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const {
    setDeliveryAddressId,
    deliveryAddressId,
    deliveryAddresses,
    setDeliveryAddresses,
  } = useShoppingCart();
  const { isSigningIn } = useAuth();

  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = React.useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [renderAddresses, setRenderAddresses] = React.useState<boolean>(false);

  const patientAddressMutation = useMutation<GetPatientAddressList, GetPatientAddressListVariables>(
    GET_PATIENT_ADDRESSES_LIST,
    {
      variables: {
        patientId: (currentPatient && currentPatient.id) || '',
      },
      fetchPolicy: 'no-cache',
    }
  );

  useEffect(() => {
    if (deliveryAddresses.length === 0 || renderAddresses) {
      setIsLoading(true);
      patientAddressMutation()
        .then((res) => {
          if (
            res &&
            res.data &&
            res.data.getPatientAddressList &&
            res.data.getPatientAddressList.addressList
          ) {
            setDeliveryAddresses &&
              setDeliveryAddresses(res.data.getPatientAddressList.addressList);
            setIsLoading(false);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [deliveryAddresses, renderAddresses]);

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

      <AphDialog open={isAddAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAddAddressDialogOpen(false)} />
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div>
          Add New Address
        </AphDialogTitle>
        <AddNewAddress
          setIsAddAddressDialogOpen={setIsAddAddressDialogOpen}
          setRenderAddresses={setRenderAddresses}
        />
      </AphDialog>

      <AphDialog open={isViewAllAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsViewAllAddressDialogOpen(false)} />
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div>
          Select Delivery Address
        </AphDialogTitle>
        <ViewAllAddress
          addresses={deliveryAddresses}
          setIsViewAllAddressDialogOpen={setIsViewAllAddressDialogOpen}
        />
      </AphDialog>
    </div>
  );
};
