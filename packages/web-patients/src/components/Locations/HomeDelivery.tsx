import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React from 'react';
import {
  AphRadio,
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
} from '@aph/web-ui-components';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { ViewAllAddress } from 'components/Locations/ViewAllAddress';

import { GET_PATIENT_ADDRESSES_LIST } from 'graphql/address';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
} from 'graphql/types/GetPatientAddressList';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';

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

interface HomeDeliveryProps {
  updateDeliveryAddress: (deliveryAddressId: string) => void;
}

export const HomeDelivery: React.FC<HomeDeliveryProps> = (props) => {
  const classes = useStyles();
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = React.useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );
  const { currentPatient } = useAllCurrentPatients();
  const { isSigningIn } = useAuth();

  const [deliveryAddressId, setDeliveryAddressId] = React.useState<string>('');

  const { updateDeliveryAddress } = props;

  const { data, loading, error } = useQueryWithSkip<
    GetPatientAddressList,
    GetPatientAddressListVariables
  >(GET_PATIENT_ADDRESSES_LIST, {
    variables: {
      patientId: (currentPatient && currentPatient.id) || '',
    },
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (error) {
    return <></>;
  }

  const addressList =
    data && data.getPatientAddressList && data.getPatientAddressList.addressList
      ? data.getPatientAddressList.addressList
      : [];

  let showAddress = 0;

  return (
    <div className={classes.root}>
      {addressList.length > 0 ? (
        <ul>
          {addressList.map((addressDetails, index) => {
            const addressId = addressDetails.id;
            const address = `${addressDetails.addressLine1} - ${addressDetails.zipcode}`;
            showAddress++;
            return showAddress < 3 ? (
              <li key={index}>
                <FormControlLabel
                  checked={deliveryAddressId === addressId}
                  className={classes.radioLabel}
                  value={addressId}
                  control={<AphRadio color="primary" />}
                  label={address}
                  onChange={() => {
                    setDeliveryAddressId(addressId);
                    updateDeliveryAddress(addressId);
                  }}
                />
              </li>
            ) : (
              ''
            );
          })}
        </ul>
      ) : (
        <>
          {!isSigningIn ? (
            <div className={classes.noAddress}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
              has been the industry's standard dummy text ever since the 1500s....
            </div>
          ) : null}
        </>
      )}

      <div className={classes.bottomActions}>
        {!isSigningIn ? (
          <AphButton onClick={() => setIsAddAddressDialogOpen(true)}>Add new address</AphButton>
        ) : null}
        {addressList.length > 0 ? (
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
        <AddNewAddress />
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
          addresses={addressList}
          updateDeliveryAddress={(deliveryAddressId: string) =>
            updateDeliveryAddress(deliveryAddressId)
          }
        />
      </AphDialog>
    </div>
  );
};
