import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { AphRadio, AphTextField } from '@aph/web-ui-components';
import { useDiagnosticsCart, Clinic } from '../DiagnosticsCartProvider';

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
    addressGroup: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      paddingTop: 11,
      paddingBottom: 6,
      marginBottom: 10,
    },
    pinSearch: {
      paddingBottom: 20,
    },
    sectionHeader: {
      marginBottom: 20,
      paddingBottom: 4,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    noAddress: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      paddingBottom: 10,
    },
  };
});

export interface StoreAddresses {
  address: string;
  city: string;
  message: string;
  phone: string;
  state: string;
  storeid: string;
  storename: string;
  workinghrs: string;
}

interface ViewAllStoreAddressProps {
  pincode: string | null;
  setPincode: (pincode: string) => void;
  pincodeError: boolean;
  setPincodeError: (pincodeError: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  filteredClinicList: Clinic[];
  setFilteredClinicList: (filteredClinicList: Clinic[]) => void;
  filterClinics: (pinCode: string) => void;
  setSelectedClinic: (selectedClinic: Clinic) => void;
}

export const ViewAllClinicAddress: React.FC<ViewAllStoreAddressProps> = (props) => {
  const classes = useStyles({});
  const { clinicId, setClinicId } = useDiagnosticsCart();

  return (
    <div className={classes.root}>
      <div className={classes.addressGroup}>
        <div className={classes.pinSearch}>
          <AphTextField
            value={props.pincode}
            placeholder="Enter Pincode"
            inputProps={{
              maxLength: 6,
              type: 'text',
            }}
            onKeyPress={(e) => {
              if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
            }}
            onChange={(e) => {
              const newPincode = e.target.value;
              if (newPincode === '') {
                props.setFilteredClinicList([]);
                props.setPincodeError(false);
              }
              props.setPincode(newPincode);
            }}
          />
        </div>

        {props.filteredClinicList.length > 0 ? (
          <>
            <div className={classes.sectionHeader}>Stores In This Region</div>
            {props.loading ? (
              <CircularProgress />
            ) : (
              <ul>
                {props.filteredClinicList.map((clinicData: Clinic, index: number) => {
                  return (
                    <li key={index}>
                      <FormControlLabel
                        checked={clinicId === clinicData.CentreCode}
                        className={classes.radioLabel}
                        value={clinicData.CentreCode}
                        control={<AphRadio color="primary" />}
                        label={`${clinicData.CentreName}\n${clinicData.Locality}, ${clinicData.City}, ${clinicData.State}`}
                        onChange={() => {
                          props.setSelectedClinic(clinicData);
                          setClinicId && setClinicId(clinicData.CentreCode);
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : null}

        {props.pincodeError ? (
          <div className={classes.noAddress}>
            Sorry! We're working hard to get to this area! In the meantime, you can either pick up
            from a nearby store, or change the pincode.
          </div>
        ) : null}
      </div>
    </div>
  );
};
