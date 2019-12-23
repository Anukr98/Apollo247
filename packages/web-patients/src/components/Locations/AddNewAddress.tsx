import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, InputAdornment } from '@material-ui/core';
import React, { useState } from 'react';
import { AphTextField, AphButton, AphInput } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { Mutation } from 'react-apollo';
import { SavePatientAddress, SavePatientAddressVariables } from 'graphql/types/SavePatientAddress';
import { SAVE_PATIENT_ADDRESS } from 'graphql/address';

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
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& ul': {
        padding: '10px 20px',
        '& li': {
          fontSize: 16,
          fontWeight: 500,
          color: '#01475b',
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
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
  };
});

type AddNewAddressProps = {
  setIsAddAddressDialogOpen: (isAddAddressDialogOpen: boolean) => void;
};

export const AddNewAddress: React.FC<AddNewAddressProps> = (props) => {
  const classes = useStyles({});
  const [address1, setAddress1] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);

  const { currentPatient } = useAllCurrentPatients();

  const currentPatientId = currentPatient ? currentPatient.id : '';
  const address2 = 'Jubileehills, Hyderabad';

  const disableSubmit = address1.length === 0 || pincode.length < 6;

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <div className={classes.formGroup}>
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
                </div>
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
                  />
                </div>
                <div className={classes.formGroup}>
                  <AphTextField label="Area / Locality" placeholder="Enter area / locality name" />
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.dialogActions}>
        <Mutation<SavePatientAddress, SavePatientAddressVariables>
          mutation={SAVE_PATIENT_ADDRESS}
          variables={{
            patientAddress: {
              patientId: currentPatientId,
              addressLine1: address1,
              addressLine2: address2,
              zipcode: pincode,
              mobileNumber: (currentPatient && currentPatient.mobileNumber) || '',
            },
          }}
          onCompleted={() => {
            setMutationLoading(false);
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
                mutate();
                props.setIsAddAddressDialogOpen(false);
              }}
              disabled={disableSubmit}
              className={disableSubmit || mutationLoading ? classes.buttonDisable : ''}
            >
              {mutationLoading ? <CircularProgress /> : 'Save & Use'}
            </AphButton>
          )}
        </Mutation>
      </div>
    </div>
  );
};
