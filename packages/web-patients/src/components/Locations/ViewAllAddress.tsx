import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress, Popover, Typography } from '@material-ui/core';
import React, { useRef } from 'react';
import { AphRadio, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { UPDATE_PATIENT_ADDRESS } from 'graphql/address';
import { useMutation } from 'react-apollo-hooks';
import { GetPatientAddressList_getPatientAddressList_addressList as Address } from 'graphql/types/GetPatientAddressList';
import axios,  { AxiosPromise, AxiosResponse , AxiosError} from 'axios';
import { Alerts } from 'components/Alerts/Alerts';
import { gtmTracking } from '../../gtmTracking';

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
    actions: {
      padding: '10px 20px 20px 20px',
      display: 'flex',
    },
    noServiceRoot: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    viewCartBtn: {
      fontSize: 13,
      color: '#fc9916',
      fontWeight: 'bold',
      textAlign: 'right',
      marginLeft: 'auto',
      textTransform: 'uppercase',
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
        wordBreak: 'break-word',
      },
    },
    addressGroup: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      paddingTop: 16,
      paddingBottom: 6,
      marginBottom: 10,
    },
    dialogContent: {
      paddingTop: 10,
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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
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
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
  };
});

interface ViewAllAddressProps {
  setIsViewAllAddressDialogOpen: (isViewAllAddressDialogOpen: boolean) => void;
  formatAddress: (address: Address) => string;
  checkServiceAvailability?: (zipCode: string | null) => AxiosPromise;
  setDeliveryTime?: (deliveryTime: string) => void;
}

export const ViewAllAddress: React.FC<ViewAllAddressProps> = (props) => {
  const classes = useStyles({});
  const {
    deliveryAddressId,
    setDeliveryAddressId,
    deliveryAddresses,
    setStoreAddressId,
  } = useShoppingCart();
  const [localDeliveryAddressId, setLocalDeliveryAddressId] = React.useState(deliveryAddressId);
  const selectedAddress = deliveryAddresses.find((address) => address.id === deliveryAddressId);
  const [localZipCode, setLocalZipCode] = React.useState(
    selectedAddress && selectedAddress.zipcode ? selectedAddress.zipcode : ''
  );
  const [mutationLoading, setMutationLoading] = React.useState(false);
  const [showPlaceNotFoundPopup, setShowPlaceNotFoundPopup] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const addToCartRef = useRef(null);

  const disableSubmit = localDeliveryAddressId === '';
  const updateAddressMutation = useMutation(UPDATE_PATIENT_ADDRESS);

  const checkLatLongAvailability = (addressDetails: Address) => {
    
    if (!addressDetails.latitude || !addressDetails.longitude) {
      // get lat long
      if (addressDetails.zipcode && addressDetails.zipcode.length === 6) {
        setIsLoading(true);
        axios
          .get(
            `${process.env.GOOGLE_MAP_API}?address=${addressDetails.zipcode}&key=${process.env.GOOGLE_API_KEY}`
            // `https://maps.googleapis.com/maps/api/geocode/json?address=${addressDetails.zipcode}&key=${process.env.GOOGLE_API_KEY}`
          )
          .then(({ data }) => {
            try {
              if (data && data.results[0] && data.results[0].geometry && data.results[0].geometry.location) {
                const { lat, lng } = data.results[0].geometry.location;
                const { id,
                  addressLine1,
                  city,
                  mobileNumber,
                  state,
                  zipcode,
                  addressType,
                  otherAddressType
                } = addressDetails;
                updateAddressMutation({
                  variables: {
                    UpdatePatientAddressInput: {
                      id,
                      addressLine1,
                      city,
                      state,
                      zipcode,
                      mobileNumber,
                      addressType,
                      otherAddressType,
                      latitude: lat,
                      longitude: lng
                    },
                  },
                })
                .then(()=>{
                  setLocalDeliveryAddressId(addressDetails.id);
                  setLocalZipCode(addressDetails.zipcode || '');
                  setIsLoading(false);
                })
              }
            } catch {
              (e: AxiosError) => console.log(e);
            }
          })
          .catch((e: AxiosError) => {
            setIsLoading(false);
            setIsAlertOpen(true);
            setAlertMessage(e.message);
            console.log(e);
          });
      }
    } else {
      setLocalDeliveryAddressId(addressDetails.id);
      setLocalZipCode(addressDetails.zipcode || '');
    }
  }

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <ul>
                  {
                    isLoading ? (<CircularProgress className={classes.loader}/>):(
                      deliveryAddresses.map((addressDetails, index) => {
                        const addressId = addressDetails.id;
                        return (
                          <li key={index}>
                            <FormControlLabel
                              checked={localDeliveryAddressId === addressId}
                              className={classes.radioLabel}
                              value={addressId}
                              control={<AphRadio color="primary" />}
                              label={props.formatAddress(addressDetails)}
                              onChange={() => {
                                // setLocalDeliveryAddressId(addressId);
                                // setLocalZipCode(addressDetails.zipcode || '');
                                checkLatLongAvailability(addressDetails)
                              }}
                            />
                          </li>
                        );
                      })
                    )
                  }
  
                </ul>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.dialogActions}>
        <AphButton
          color="primary"
          fullWidth
          disabled={disableSubmit}
          className={disableSubmit ? classes.buttonDisable : ''}
          onClick={() => {
            setMutationLoading(true);
            if (props.checkServiceAvailability) {
              setMutationLoading(true);
              props
                .checkServiceAvailability(localZipCode)
                .then((res: AxiosResponse) => {
                  if (res && res.data && res.data.Availability) {
                    /**Gtm code start  */
                    gtmTracking({
                      category: 'Pharmacy',
                      action: 'Order',
                      label: 'Address Selected',
                    });
                    /**Gtm code End  */
                    props.setIsViewAllAddressDialogOpen(false);
                    props.setDeliveryTime && props.setDeliveryTime('');
                    setDeliveryAddressId && setDeliveryAddressId(localDeliveryAddressId);
                    setStoreAddressId && setStoreAddressId('');
                  } else {
                    setMutationLoading(false);
                    setShowPlaceNotFoundPopup(true);
                  }
                })
                .catch((e: any) => {
                  setMutationLoading(false);
                  console.log(e);
                });
            } else {
              props.setIsViewAllAddressDialogOpen(false);
            }
          }}
        >
          {mutationLoading ? <CircularProgress size={20} color="secondary" /> : 'SAVE AND USE'}
        </AphButton>
      </div>
      <Popover
        open={showPlaceNotFoundPopup}
        anchorEl={addToCartRef.current}
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
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <div className={classes.noServiceRoot}>
              <div className={classes.windowBody}>
                <Typography variant="h2">Uh oh! :(</Typography>
                <p>
                  Sorry! We’re working hard to get to this area! In the meantime, you can either
                  pick up from a nearby store, or change the pincode.
                </p>
              </div>
              <div className={classes.actions}>
                <AphButton
                  className={classes.viewCartBtn}
                  onClick={() => {
                    setShowPlaceNotFoundPopup(false);
                  }}
                >
                  OK, GOT IT
                </AphButton>
              </div>
            </div>
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
