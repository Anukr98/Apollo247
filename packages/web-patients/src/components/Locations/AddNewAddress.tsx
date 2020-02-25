import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Grid } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { Mutation } from 'react-apollo';
import { SavePatientAddress, SavePatientAddressVariables } from 'graphql/types/SavePatientAddress';
import {
  UpdatePatientAddress,
  UpdatePatientAddressVariables,
} from 'graphql/types/UpdatePatientAddress';
import { SAVE_PATIENT_ADDRESS, UPDATE_PATIENT_ADDRESS } from 'graphql/address';
import { PATIENT_ADDRESS_TYPE } from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';

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
  };
});

type AddNewAddressProps = {
  setIsAddAddressDialogOpen: (isAddAddressDialogOpen: boolean) => void;
  setRenderAddresses?: (renderAddresses: boolean) => void;
  forceRefresh?: (forceRefresh: boolean) => void;
  currentAddress?: GetPatientAddressList_getPatientAddressList_addressList;
  disableActions?: boolean;
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
  const [otherText, setOtherText] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const currentPatientId = currentPatient ? currentPatient.id : '';

  const disableSubmit =
    address1.length === 0 || address2.length === 0 || addressType.length <= 0 || pincode.length < 6;

  // console.log(address1.length, address2.length, addressType.length, pincode.length);
  // const address2 = 'Jubileehills, Hyderabad';
  // console.log(address1, address2, pincode, addressType, 'in main funtion.......');

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
      setPincode(pincode);
      setAddressType(addressType);
      setAddressId(addressId);
      setOtherTextBox(otherTextbox);
    }
  }, [props.currentAddress]);

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                {/* <div className={classes.formGroup}>
                  <AphTextField label="Full Name" placeholder="Enter full name" />
                </div>
                <div className={classes.formGroup}>
                  <label>Mobile Number</label>
                  <AphInput
                    placeholder="Enter mobile number"
                    defaultValue={
                      currentPatient && currentPatient.mobileNumber
                        ? currentPatient.mobileNumber.substr(3, 10)
                        : ''
                    }
                    inputProps={{
                      maxLength: 10,
                    }}
                    onKeyPress={(e) => {
                      if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
                    }}
                    startAdornment={
                      <InputAdornment className={classes.inputAdorment} position="start">
                        +91
                      </InputAdornment>
                    }
                  />
                </div> */}
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
                      setAddress2(e.target.value);
                    }}
                    inputProps={{
                      maxLength: 100,
                    }}
                    value={address2}
                  />
                </div>
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
                              setOtherText(addressTypeValue === PATIENT_ADDRESS_TYPE.OTHER);
                            }}
                            value={addressType}
                          >
                            {_startCase(_toLower(addressTypeValue))}
                          </AphButton>
                        </Grid>
                      );
                    })}
                    {/* <Grid item xs={4} sm={4}>
                      <AphButton color="secondary" className={`${classes.genderBtns}`}>
                        Office
                      </AphButton>
                    </Grid>
                    <Grid item xs={4} sm={4}>
                      <AphButton
                        color="secondary"
                        className={`${classes.genderBtns}  ${classes.btnActive}`}
                      >
                        Other
                      </AphButton>
                    </Grid> */}
                  </Grid>
                  {otherText ||
                    (otherTextbox && (
                      <AphTextField
                        placeholder="Enter Address Type"
                        onChange={(e) => {
                          setOtherTextBox(e.target.value);
                        }}
                        inputProps={{
                          maxLength: 100,
                        }}
                        value={otherTextbox}
                      />
                    ))}
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
        {addressId && addressId.length > 0 ? (
          <Mutation<UpdatePatientAddress, UpdatePatientAddressVariables>
            mutation={UPDATE_PATIENT_ADDRESS}
            variables={{
              UpdatePatientAddressInput: {
                id: addressId,
                addressLine1: address1,
                addressLine2: address2,
                zipcode: pincode,
                mobileNumber: (currentPatient && currentPatient.mobileNumber) || '',
                addressType: addressType as PATIENT_ADDRESS_TYPE,
                otherAddressType: otherTextbox,
              },
            }}
            onError={(error) => {
              alert(error);
            }}
          >
            {(mutate) => (
              <AphButton
                color="primary"
                fullWidth
                onClick={() => {
                  setMutationLoading(true);
                  mutate().then(() => {
                    props.forceRefresh ? props.forceRefresh(true) : null;
                  });
                  props.setIsAddAddressDialogOpen(false);
                  props.setRenderAddresses && props.setRenderAddresses(true);
                }}
                disabled={disableSubmit}
                className={disableSubmit || mutationLoading ? classes.buttonDisable : ''}
              >
                {mutationLoading ? <CircularProgress /> : 'Save'}
              </AphButton>
            )}
          </Mutation>
        ) : (
          <Mutation<SavePatientAddress, SavePatientAddressVariables>
            mutation={SAVE_PATIENT_ADDRESS}
            variables={{
              patientAddress: {
                patientId: currentPatientId,
                addressLine1: address1,
                addressLine2: address2,
                zipcode: pincode,
                mobileNumber: (currentPatient && currentPatient.mobileNumber) || '',
                addressType: addressType as PATIENT_ADDRESS_TYPE,
                otherAddressType: otherTextbox,
              },
            }}
            onError={(error) => {
              alert(error);
            }}
          >
            {(mutate) => (
              <AphButton
                color="primary"
                fullWidth
                onClick={() => {
                  setMutationLoading(true);
                  mutate().then(() => {
                    props.forceRefresh ? props.forceRefresh(true) : null;
                  });
                  props.setIsAddAddressDialogOpen(false);
                  props.setRenderAddresses && props.setRenderAddresses(true);
                }}
                disabled={disableSubmit || props.disableActions}
                className={disableSubmit || mutationLoading ? classes.buttonDisable : ''}
              >
                {mutationLoading ? <CircularProgress /> : 'Save'}
              </AphButton>
            )}
          </Mutation>
        )}
      </div>
    </div>
  );
};
