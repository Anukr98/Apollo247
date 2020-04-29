import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Grid, Typography, Popover } from '@material-ui/core';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { SAVE_PATIENT_ADDRESS, UPDATE_PATIENT_ADDRESS } from 'graphql/address';
import { PATIENT_ADDRESS_TYPE } from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';
import axios, { AxiosError, AxiosPromise, AxiosResponse } from 'axios';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { useMutation } from 'react-apollo-hooks';
import { Alerts } from 'components/Alerts/Alerts';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 14,
      paddingBottom: 20,
    },
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
    },
    addressGroup: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      paddingBottom: 5,
      marginBottom: 10,
    },
    formGroup: {
      paddingBottom: 10,
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
      '& label': {
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
      '& textarea': {
        padding: 0,
        border: 'none',
        borderBottom: '2px solid #00b38e',
        borderRadius: 0,
        paddingTop: 9,
        paddingBottom: 5,
      },
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
    inputAdorment: {
      '& p': {
        fontSize: 16,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    btnGroup: {
      paddingTop: 7,
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: theme.palette.common.white,
        fontSize: 16,
        fontWeight: 500,
      },
    },
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    genderBtns: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: '7px 13px 7px 13px',
      textTransform: 'none',
      borderRadius: 10,
    },
    helpText: {
      color: '#890000',
      marginTop: 0,
      marginBottom: 5,
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
    actions: {
      padding: '10px 20px 20px 20px',
      display: 'flex',
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
  };
});

type AddNewAddressProps = {
  setIsAddAddressDialogOpen: (isAddAddressDialogOpen: boolean) => void;
  currentAddress?: GetPatientAddressList_getPatientAddressList_addressList;
  disableActions?: boolean;
  forceRefresh?: (forceRefresh: boolean) => void;
  checkServiceAvailability?: (zipCode: string | null) => AxiosPromise;
  setDeliveryTime?: (deliveryTime: string) => void;
};

type Address = {
  long_name: string;
  short_name: string;
  types: Array<string>;
};

export const AddNewAddress: React.FC<AddNewAddressProps> = (props) => {
  const classes = useStyles({});
  const [address1, setAddress1] = useState<string>('');
  const [address2, setAddress2] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [addressType, setAddressType] = useState<string>('');
  const [otherTextbox, setOtherTextBox] = useState<string>('');
  const [addressId, setAddressId] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const [showTextbox, setShowText] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const currentPatientId = currentPatient ? currentPatient.id : '';
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const { setDeliveryAddressId } = useShoppingCart();
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isPincodevalid, setIsPincodeValid] = useState<boolean>(true);
  const [showPlaceNotFoundPopup, setShowPlaceNotFoundPopup] = useState(false);
  const addToCartRef = useRef(null);

  const disableSubmit =
    address1.length === 0 ||
    address2.length === 0 ||
    addressType.length <= 0 ||
    pincode.length < 6 ||
    !isPincodevalid ||
    addressType === PATIENT_ADDRESS_TYPE.OTHER
      ? !otherTextbox
      : addressType.length === 0;

  const patientAddressTypes = [
    PATIENT_ADDRESS_TYPE.HOME,
    PATIENT_ADDRESS_TYPE.OFFICE,
    PATIENT_ADDRESS_TYPE.OTHER,
  ];

  useEffect(() => {
    if (props.currentAddress) {
      const address1 =
        props.currentAddress && props.currentAddress.addressLine1
          ? props.currentAddress.addressLine1
          : '';
      const address2 =
        props.currentAddress &&
        props.currentAddress.addressLine2 &&
        props.currentAddress.addressLine2.length > 0
          ? props.currentAddress.addressLine2
          : '';
      const cityAndStateArr = address2 && address2.length > 0 ? address2.split(',') : [];
      const city = cityAndStateArr.length > 0 && cityAndStateArr[0] ? cityAndStateArr[0] : '';
      const state =
        cityAndStateArr.length > 0 && cityAndStateArr[1] ? cityAndStateArr[1].trim() : '';
      const pincode =
        props.currentAddress &&
        props.currentAddress.zipcode &&
        props.currentAddress.zipcode.length > 0
          ? props.currentAddress.zipcode
          : '';
      const addressType =
        props.currentAddress && props.currentAddress.addressType
          ? props.currentAddress.addressType
          : '';
      const otherTextbox =
        props.currentAddress && props.currentAddress.otherAddressType
          ? props.currentAddress.otherAddressType
          : '';
      const addressId =
        props.currentAddress && props.currentAddress.id && props.currentAddress.id.length > 0
          ? props.currentAddress.id
          : '';
      // console.log(address1, address2, pincode, addressType, 'in use effect.......');
      setAddress1(address1);
      setAddress2(address2);
      setState(state);
      setCity(city);
      setPincode(pincode);
      setAddressType(addressType);
      setAddressId(addressId);
      setOtherTextBox(otherTextbox);
      setShowText(!!otherTextbox);
    }
  }, [props.currentAddress]);

  let showError = false;

  // Auto-fetching the city and state using Pincode
  // ------------------------------------------------

  if (pincode && pincode.length === 6) {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${process.env.GOOGLE_API_KEY}`
      )
      .then(({ data }) => {
        if (data && data.results.length === 0) {
          setAddress2(' ');
        }
        setIsPincodeValid(data && data.results && data.results.length > 0 ? true : false);
        try {
          if (data && data.results[0] && data.results[0].address_components) {
            const addressComponents = data.results[0].address_components || [];
            const pincode = (
              addressComponents.find((item: Address) => item.types.indexOf('postal_code') > -1) ||
              {}
            ).long_name;
            const city = (
              addressComponents.find(
                (item: any) =>
                  item.types.indexOf('locality') > -1 ||
                  item.types.indexOf('administrative_area_level_2') > -1
              ) || {}
            ).long_name;
            const state = (
              addressComponents.find(
                (item: any) => item.types.indexOf('administrative_area_level_1') > -1
              ) || {}
            ).long_name;

            setState(state || '');
            setCity(city || '');
            setPincode(pincode || '');
            const location = city ? city.concat(', ').concat(state) : state;

            setPincode(pincode || '');
            setAddress2(location);
          }
        } catch {
          (e: AxiosError) => console.log(e);
          showError = true;
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
      });
  }
  const updateAddressMutation = useMutation(UPDATE_PATIENT_ADDRESS);
  const saveAddressMutation = useMutation(SAVE_PATIENT_ADDRESS);

  if (!isPincodevalid) {
    showError = true;
  }

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <div className={classes.formGroup}>
                  <AphTextField
                    multiline
                    label="Address"
                    placeholder="Flat / Door / Plot Number, Building"
                    onChange={(e) => {
                      setAddress1(e.target.value);
                    }}
                    inputProps={{
                      maxLength: 100,
                    }}
                    value={address1}
                  />
                </div>
                <div className={classes.formGroup}>
                  <AphTextField
                    label="Pin Code"
                    placeholder="Enter pin code"
                    onChange={(e) => {
                      if (e.target.value.length !== 6) {
                        setAddress2('');
                      }
                      setPincode(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
                    }}
                    inputProps={{
                      maxLength: 6,
                    }}
                    value={pincode}
                  />
                </div>
                <div className={classes.formGroup}>
                  <AphTextField
                    label="Area / Locality"
                    placeholder="Enter area / locality name"
                    onChange={(e) => {
                      setAddress2(address2);
                    }}
                    inputProps={{
                      maxLength: 100,
                    }}
                    value={address2}
                    error={showError}
                  />
                </div>
                {showError ? (
                  <FormHelperText className={classes.helpText} component="div" error={showError}>
                    Invalid zip code
                  </FormHelperText>
                ) : (
                  ''
                )}
                <div className={classes.formGroup}>
                  <label>Address Type</label>
                  <Grid container spacing={1} className={classes.btnGroup}>
                    {patientAddressTypes.map((addressTypeValue) => {
                      return (
                        <Grid item xs={4} sm={4} key={`address_${addressTypeValue}`}>
                          <AphButton
                            color="secondary"
                            className={`${classes.genderBtns} ${
                              addressType === addressTypeValue ? classes.btnActive : ''
                            }`}
                            onClick={() => {
                              setAddressType(addressTypeValue);
                              setShowText(addressTypeValue === PATIENT_ADDRESS_TYPE.OTHER);
                            }}
                            value={addressType}
                          >
                            {_startCase(_toLower(addressTypeValue))}
                          </AphButton>
                        </Grid>
                      );
                    })}
                  </Grid>
                  {showTextbox ? (
                    <AphTextField
                      placeholder="Enter Address Type"
                      onChange={(e) => {
                        setOtherTextBox(e.target.value);
                      }}
                      inputProps={{
                        maxLength: 100,
                      }}
                      value={otherTextbox || ''}
                    />
                  ) : (
                    ''
                  )}
                </div>
                {/* <div className={classes.formGroup}>
                  <AphTextField placeholder="Enter Address Type" />
                </div> */}
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
          className={disableSubmit || mutationLoading ? classes.buttonDisable : ''}
          onClick={() => {
            setMutationLoading(true);
            addressId && addressId.length > 0
              ? updateAddressMutation({
                  variables: {
                    UpdatePatientAddressInput: {
                      id: addressId,
                      addressLine1: address1,
                      // addressLine2: address2,
                      city: city,
                      state: state,
                      zipcode: pincode,
                      mobileNumber: (currentPatient && currentPatient.mobileNumber) || '',
                      addressType: addressType as PATIENT_ADDRESS_TYPE,
                      otherAddressType: otherTextbox,
                    },
                  },
                })
                  .then(() => {
                    /**Gtm code start  */
                    window.gep && window.gep('Pharmacy', 'Order', 'Address Selected')
                    /**Gtm code End  */
                    props.setIsAddAddressDialogOpen(false);
                    props.forceRefresh && props.forceRefresh(true);
                    props.setDeliveryTime && props.setDeliveryTime('');
                    setDeliveryAddressId && setDeliveryAddressId(addressId);
                  })
                  .catch((error) => {
                    setIsAlertOpen(true);
                    setAlertMessage(error);
                  })
              : saveAddressMutation({
                  variables: {
                    patientAddress: {
                      patientId: currentPatientId,
                      addressLine1: address1,
                      // addressLine2: address2,
                      city: city,
                      state: state,
                      zipcode: pincode,
                      mobileNumber: (currentPatient && currentPatient.mobileNumber) || '',
                      addressType: addressType as PATIENT_ADDRESS_TYPE,
                      otherAddressType: otherTextbox,
                    },
                  },
                })
                  .then(({ data }: any) => {
                    if (data && data.savePatientAddress && data.savePatientAddress.patientAddress) {
                      const deliveryAddrsId = data.savePatientAddress.patientAddress.id;
                      if (props.checkServiceAvailability) {
                        props
                          .checkServiceAvailability(pincode)
                          .then((res: AxiosResponse) => {
                            if (res && res.data && res.data.Availability) {
                              /**Gtm code start  */
                              window.gep && window.gep('Profile','Update','Address Added')
                              window.gep && window.gep('Pharmacy', 'Order', 'Address Selected')
                              /**Gtm code End  */
                              props.setIsAddAddressDialogOpen(false);
                              props.forceRefresh && props.forceRefresh(true);
                              props.setDeliveryTime && props.setDeliveryTime('');
                              setDeliveryAddressId && setDeliveryAddressId(deliveryAddrsId);
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
                        props.setIsAddAddressDialogOpen(false);
                        props.forceRefresh && props.forceRefresh(true);
                        setDeliveryAddressId &&
                          setDeliveryAddressId(data.savePatientAddress.patientAddress.id);
                      }
                    }
                  })
                  .catch((error) => {
                    setIsAlertOpen(true);
                    setAlertMessage(error);
                  });
          }}
          title={'Save and use'}
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
