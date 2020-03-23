import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Grid } from '@material-ui/core';
import React, { useState, useEffect, useContext } from 'react';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { SAVE_PATIENT_ADDRESS, UPDATE_PATIENT_ADDRESS } from 'graphql/address';
import { PATIENT_ADDRESS_TYPE } from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';
import axios, { AxiosError, Cancel } from 'axios';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
import { useMutation } from 'react-apollo-hooks';

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
  const [mutationLoading, setMutationLoading] = useState(false);
  const [showTextbox, setShowText] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const currentPatientId = currentPatient ? currentPatient.id : '';
  const { setDeliveryAddressId } = useDiagnosticsCart();

  const disableSubmit =
    address1.length === 0 || address2.length === 0 || addressType.length <= 0 || pincode.length < 6;

  const patientAddressTypes = [
    PATIENT_ADDRESS_TYPE.HOME,
    PATIENT_ADDRESS_TYPE.OFFICE,
    PATIENT_ADDRESS_TYPE.OTHER,
  ];

  // Auto-fetching the city and state using Pincode
  // ------------------------------------------------

  if (pincode && pincode.length === 6) {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${process.env.GOOGLE_API_KEY}`
      )
      .then(({ data }) => {
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
            setPincode(pincode || '');
            const location = city.concat(', ').concat(state);

            setPincode(pincode || '');
            setAddress2(location);
          }
        } catch {
          (e: AxiosError) => console.log(e);
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
      });
  }
  const updateAddressMutation = useMutation(UPDATE_PATIENT_ADDRESS);
  const saveAddressMutation = useMutation(SAVE_PATIENT_ADDRESS);

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
            saveAddressMutation({
              variables: {
                patientAddress: {
                  patientId: currentPatientId,
                  addressLine1: address1,
                  addressLine2: address2,
                  zipcode: pincode,
                  mobileNumber: (currentPatient && currentPatient.mobileNumber) || '',
                  addressType: addressType as PATIENT_ADDRESS_TYPE,
                  otherAddressType: otherTextbox,
                },
              },
            })
              .then(({ data }: any) => {
                if (data && data.savePatientAddress && data.savePatientAddress.patientAddress)
                  props.setIsAddAddressDialogOpen(false);
                if (setDeliveryAddressId) {
                  setDeliveryAddressId(data.savePatientAddress.patientAddress.id);
                }
              })
              .catch((error) => {
                alert(error);
              });
          }}
          title={'Save and use'}
        >
          {mutationLoading ? <CircularProgress size={20} color="secondary" /> : 'SAVE AND USE'}
        </AphButton>
      </div>
    </div>
  );
};
