import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';
import { AphTextField, AphButton } from '@aph/web-ui-components';
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
      paddingTop: 0,
      paddingBottom: 5,
      marginBottom: 10,
    },
    formGroup: {
      paddingBottom: 10,
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
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
  };
});

export const AddNewAddress: React.FC = (props) => {
  const classes = useStyles();
  const [address1, setAddress1] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);

  const { currentPatient } = useAllCurrentPatients();

  const currentPatientId = currentPatient ? currentPatient.id : '';
  const address2 = 'Jubileehills, Hyderabad';

  const disableSubmit = address1.length === 0 || pincode.length < 6;

  // console.log(currentPatient);
  // const [name] = React.useState(1);

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                {/* <div className={classes.formGroup}>
                  <AphSelect
                    value={name}
                    MenuProps={{
                      classes: { paper: classes.menuPopover },
                      anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                    }}
                  >
                    {allCurrentPatients &&
                      allCurrentPatients.map((patientDetails, i) => (
                        <MenuItem
                          value={1}
                          classes={
                            patientDetails.id === currentPatientId
                              ? { selected: classes.menuSelected }
                              : {}
                          }
                          key={patientDetails.id}
                        >
                          {patientDetails.firstName}
                        </MenuItem>
                      ))}
                  </AphSelect>
                </div> */}
                {/* <div className={classes.formGroup}>
                  <AphTextField
                    placeholder="Mobile Number"
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
                  />
                </div> */}
                <div className={classes.formGroup}>
                  <AphTextField
                    placeholder="Address Line 1"
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
                    placeholder="Pincode"
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
                <div className={classes.formGroup}>&nbsp;</div>
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
