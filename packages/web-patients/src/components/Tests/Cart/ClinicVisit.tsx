import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState, useContext } from 'react';
import {
  AphDialog,
  AphRadio,
  AphButton,
  AphTextField,
  AphDialogTitle,
  AphDialogClose,
} from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { ViewAllClinicAddress } from 'components/Tests/Cart/ViewAllClinicAddress';
import axios, { AxiosError, Cancel } from 'axios';
import { LocationContext } from 'components/LocationProvider';
import { useDiagnosticsCart, Clinic } from '../DiagnosticsCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 10,
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
    searchAddress: {
      paddingBottom: 20,
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

type Address = {
  long_name: string;
  short_name: string;
  types: Array<string>;
};

const apiDetails = {
  allClinics: process.env.TEST_ALL_CLINICS,
  googleAPIKey: process.env.GOOGLE_API_KEY,
};

const TestApiCredentials = {
  UserName: process.env.TEST_DETAILS_PACKAGE_USERNAME,
  Password: process.env.TEST_DETAILS_PACKAGE_PASSWORD,
  InterfaceClient: process.env.TEST_DETAILS_PACKAGE_INTERFACE_CLIENT,
};

type ClinicVisitProps = {
  selectedClinic: Clinic | null;
  setSelectedClinic: (selectedClinic: Clinic | null) => void;
};

export const ClinicVisit: React.FC<ClinicVisitProps> = (props) => {
  const classes = useStyles({});
  const { selectedClinic, setSelectedClinic } = props;
  const { currentLat, currentLong, setCurrentPincode, currentPincode } = useContext(
    LocationContext
  );

  const {
    setClinics,
    clinics,
    clinicId,
    setClinicId,
    clinicPinCode,
    setClinicPinCode,
  } = useDiagnosticsCart();
  const [loading, setLoading] = useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );
  const [filteredClinicList, setFilteredClinicList] = useState<Clinic[]>([]);
  const [pincode, setPincode] = useState<string | null>(clinicPinCode || currentPincode);
  // const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [pincodeError, setPincodeError] = useState<boolean>(false);

  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  const filterClinics = (key: string) => {
    if (isValidPinCode(key)) {
      if (key.length == 6) {
        axios
          .get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${key}&key=${apiDetails.googleAPIKey}`
          )
          .then((data) => {
            const city = (
              (data.data.results[0].address_components || []).find(
                (item: any) => item.types.indexOf('locality') > -1
              ) || {}
            ).long_name;
            if (city) {
              const filterArray = clinics.filter((item) =>
                item.City.toLowerCase().includes(city.toLowerCase())
              );
              if (filterArray && filterArray.length > 0) {
                if (clinicId) {
                  const filterClinicData = filterArray.find(
                    (clinic) => clinic.CentreCode === clinicId
                  );
                  setSelectedClinic(filterClinicData || null);
                } else {
                  setSelectedClinic(filterArray[0]);
                  setClinicId && setClinicId(filterArray[0].CentreCode);
                }
                setFilteredClinicList(filterArray || []);
                setClinicPinCode && setClinicPinCode(key);
              } else {
                setFilteredClinicList([]);
                setSelectedClinic(null);
              }
            } else {
              setFilteredClinicList([]);
              setSelectedClinic(null);
            }
          })
          .catch((e) => {
            console.log('TestsCart_filterClinics', e);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  };

  const fetchAllClinics = () => {
    axios
      .post(apiDetails.allClinics || '', {
        ...TestApiCredentials,
      })
      .then((data) => {
        setClinics && setClinics(data.data.data);
      })
      .catch((e) => {
        console.log('TestsCart_searchClinicApi', e);
      });
  };

  const getCurrentLocationPincode = async (currentLat: string, currentLong: string) => {
    await axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLat},${currentLong}&key=${apiDetails.googleAPIKey}`
      )
      .then(({ data }) => {
        try {
          if (data && data.results[0] && data.results[0].address_components) {
            const addressComponents = data.results[0].address_components || [];
            const pincode = (
              addressComponents.find((item: Address) => item.types.indexOf('postal_code') > -1) ||
              {}
            ).long_name;
            if (pincode && pincode.length === 6) {
              setPincode(pincode);
              setCurrentPincode(pincode);
            }
          }
        } catch {
          (e: AxiosError) => console.log(e);
        }
      })
      .catch((e: AxiosError) => {
        console.log(e);
        setPincodeError(true);
      });
  };

  useEffect(() => {
    if (clinics.length === 0) {
      fetchAllClinics();
    }
  }, [clinics]);

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      setLoading(true);
      filterClinics(pincode);
    } else if (!pincode && pincode !== '') {
      if (currentLat && currentLong) {
        getCurrentLocationPincode(currentLat, currentLong);
      }
    }
  }, [pincode]);

  return (
    <div className={classes.root}>
      <div className={classes.searchAddress}>
        <AphTextField
          placeholder="Enter Pincode"
          inputProps={{
            maxLength: 6,
            type: 'text',
          }}
          onKeyPress={(e) => {
            if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
          }}
          value={pincode}
          onChange={(e) => {
            const newPincode = e.target.value;
            setPincode(newPincode);
          }}
          autoFocus
        />
      </div>

      {!loading ? (
        <ul>
          {selectedClinic ? (
            <li>
              <FormControlLabel
                checked={clinicId === selectedClinic.CentreCode}
                className={classes.radioLabel}
                value={selectedClinic.CentreCode}
                control={<AphRadio color="primary" />}
                label={`${selectedClinic.CentreName}\n${selectedClinic.Locality}, ${selectedClinic.City}, ${selectedClinic.State}`}
                onChange={() => {
                  setClinicId && setClinicId(selectedClinic.CentreCode);
                  //   setDeliveryAddressId && setDeliveryAddressId('');
                }}
              />
            </li>
          ) : (
            <>
              {pincodeError && (
                <div className={classes.noAddress}>
                  Sorry! We're working hard to get to this area! In the meantime, you can either
                  pick up from a nearby store, or change the pincode.
                </div>
              )}
            </>
          )}
        </ul>
      ) : (
        <CircularProgress />
      )}
      {filteredClinicList.length > 2 && (
        <div className={classes.bottomActions}>
          <AphButton
            onClick={() => setIsViewAllAddressDialogOpen(true)}
            className={classes.viewAllBtn}
          >
            View All
          </AphButton>
        </div>
      )}
      <AphDialog open={isViewAllAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsViewAllAddressDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="Store Pick Up" />
          </div>
          Store Pick Up
        </AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <ViewAllClinicAddress
                  filterClinics={filterClinics}
                  pincode={pincode}
                  setPincode={setPincode}
                  pincodeError={pincodeError}
                  setPincodeError={setPincodeError}
                  loading={loading}
                  setLoading={setLoading}
                  filteredClinicList={filteredClinicList}
                  setSelectedClinic={setSelectedClinic}
                  setFilteredClinicList={setFilteredClinicList}
                />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton
              color="primary"
              fullWidth
              disabled={!clinicId}
              className={!clinicId || !pincode || pincode.length !== 6 ? classes.buttonDisable : ''}
              onClick={() => {
                setIsViewAllAddressDialogOpen(false);
              }}
            >
              SAVE AND USE
            </AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
