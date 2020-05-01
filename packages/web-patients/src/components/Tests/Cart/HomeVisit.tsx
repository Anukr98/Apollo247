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
import { AddNewAddress } from 'components/Tests/Cart/AddNewAddress';
import { ViewAllAddress } from 'components/Tests/Cart/ViewAllAddress';
import { GetPatientAddressList_getPatientAddressList_addressList as Address } from 'graphql/types/GetPatientAddressList';

import { GET_PATIENT_ADDRESSES_LIST } from 'graphql/address';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
} from 'graphql/types/GetPatientAddressList';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
import { formatAddress } from 'components/Locations/HomeDelivery';

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
        wordBreak: 'break-word',
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
      zIndex: 2,
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

type HomeVisitProps = {
  selectedAddressData: any | null;
  setSelectedAddressData: (selectedAddressData: Address | null) => void;
};

export const HomeVisit: React.FC<HomeVisitProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const {
    setDeliveryAddressId,
    deliveryAddressId,
    deliveryAddresses,
    setDeliveryAddresses,
  } = useDiagnosticsCart();
  const { isSigningIn } = useAuth();
  const client = useApolloClient();
  const { selectedAddressData, setSelectedAddressData } = props;
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = React.useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

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
            if (deliveryAddressId) {
              setSelectedAddressData(
                addresses.find((address) => address.id === deliveryAddressId) || addresses[0]
              );
            } else {
              setSelectedAddressData(addresses[0]);
              setDeliveryAddressId && setDeliveryAddressId(addresses[0].id);
            }

            setDeliveryAddresses && setDeliveryAddresses(addresses);
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

  if (isError) {
    return <p>Error while fetching addresses.</p>;
  }

  return (
    <div className={classes.root}>
      {deliveryAddresses.length > 0 && selectedAddressData ? (
        <ul>
          <li>
            <FormControlLabel
              checked={true}
              className={classes.radioLabel}
              value={selectedAddressData.id}
              control={<AphRadio color="primary" />}
              label={formatAddress(selectedAddressData)}
              onChange={() => {
                setDeliveryAddressId &&
                  setDeliveryAddressId(selectedAddressData && selectedAddressData.id);
              }}
            />
          </li>
        </ul>
      ) : (
        <>{isLoading ? <CircularProgress /> : null}</>
      )}

      <div className={classes.bottomActions}>
        {!isSigningIn ? (
          <AphButton onClick={() => setIsAddAddressDialogOpen(true)}>Add new address</AphButton>
        ) : null}
        {deliveryAddresses.length > 1 ? (
          <AphButton
            onClick={() => setIsViewAllAddressDialogOpen(true)}
            className={classes.viewAllBtn}
          >
            View All
          </AphButton>
        ) : null}
      </div>

      <AphDialog open={isAddAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAddAddressDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>
          {/* <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div> */}
          Add New Address
        </AphDialogTitle>
        <AddNewAddress setIsAddAddressDialogOpen={setIsAddAddressDialogOpen} />
      </AphDialog>

      <AphDialog open={isViewAllAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsViewAllAddressDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>
          {/* <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div> */}
          Select Delivery Address
        </AphDialogTitle>
        <ViewAllAddress setIsViewAllAddressDialogOpen={setIsViewAllAddressDialogOpen} />
      </AphDialog>
    </div>
  );
};
