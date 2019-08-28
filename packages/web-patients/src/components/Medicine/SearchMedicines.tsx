import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import { AphTextField } from '@aph/web-ui-components';
import { MedicineCard } from 'components/Medicine/MedicineCard';
import { MedicineStripCard } from 'components/Medicine/MedicineStripCard';
import axios, { CancelTokenSource, AxiosError, Cancel } from 'axios';
import FormHelperText from '@material-ui/core/FormHelperText';
// import _debounce from 'lodash/debounce';
import { MedicineCartItem } from 'components/MedicinesCartProvider';

const apiDetails = {
  url: 'http://uat.apollopharmacy.in/searchprd_api.php',
  authToken: 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms',
}; // this must goes into environment later.

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      PaddingRight: 3,
      display: 'flex',
    },
    leftSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      padding: '20px 5px',
      borderRadius: 5,
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
    },
    medicineSection: {
      paddingLeft: 15,
      paddingRight: 15,
    },
    sectionGroup: {
      marginBottom: 10,
    },
    serviceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingbottom: 10,
    },
    serviceImg: {
      marginRight: 20,
      '& img': {
        maxWidth: 49,
        verticalAlign: 'middle',
      },
    },
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    serviceinfoText: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: 0.04,
      opacity: 0.6,
      lineHeight: 1.67,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.2)',
      paddingTop: 10,
      paddingBottom: 10,
      display: 'inline-block',
      width: '100%',
    },
    marginNone: {
      marginBottom: 'none',
    },
    bottomImgGroup: {
      marginTop: 40,
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
    searchFormGroup: {
      display: 'flex',
      paddingRight: 15,
      paddingLeft: 20,
      marginBottom: 30,
    },
    pinCode: {
      width: 203,
    },
    searchMedicine: {
      width: 'calc(100% - 203px)',
      marginRight: 20,
      position: 'relative',
    },
    uploadPrescriptionBtn: {
      position: 'absolute',
      right: 0,
      top: 0,
      paddingTop: 5,
      paddingBottom: 5,
      cursor: 'pointer',
    },
    medicineListGroup: {
      paddingRight: 15,
      paddingLeft: 20,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    count: {
      marginLeft: 'auto',
    },
    pastSearches: {
      paddingBottom: 10,
    },
    helpText: {
      paddingLeft: 20,
      paddingRight: 20,
    },
  };
});

export const SearchMedicines: React.FC = (props) => {
  const classes = useStyles();
  // const [medicineName, setMedicineName] = useState<string>('');
  const [medicines, setMedicines] = useState<MedicineCartItem[]>([]);
  const [medicineCount, setMedicineCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  // const debouncedFunction = (medicineName: string) =>
  //   _debounce(() => {
  //     setMedicineName(medicineName);
  //   }, 1000);

  const pastSearches: string[] = [];

  // useEffect(() => {
  //   const fetchMedicines = () => {
  //     const source: CancelTokenSource = axios.CancelToken.source();
  //     // source && source.cancel('Operation has been canceled.');
  //     axios
  //       .get(`${apiDetails.url}?params=${medicineName}`, {
  //         cancelToken: source.token,
  //         headers: {
  //           Authorization: apiDetails.authToken,
  //         },
  //       })
  //       .then((result) => {
  //         const medicines = result.data.products ? result.data.products : [];
  //         const medicineCount = result.data.product_count ? result.data.product_count : 0;
  //         if (medicineCount === 0 && medicines.length === 0) {
  //           setShowError(true);
  //         } else {
  //           setShowError(false);
  //         }
  //         setMedicines(medicines);
  //         setMedicineCount(medicineCount);
  //         setLoading(false);
  //       })
  //       .catch((thrown: AxiosError | Cancel) => {
  //         if (axios.isCancel(thrown)) {
  //           const cancel: Cancel = thrown;
  //           console.log(cancel);
  //         }
  //       });
  //   };

  //   if (medicineName.length > 2) {
  //     setLoading(true);
  //     setTimeout(() => {
  //       fetchMedicines();
  //     }, 1000);
  //   } else {
  //     setShowError(false);
  //     setMedicines([]);
  //     setMedicineCount(0);
  //   }
  // }, [medicineName]);

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 237px)'}>
          <div className={classes.medicineSection}>
            <div className={classes.sectionGroup}>
              <Link className={classes.serviceType} to="/tests-medicines">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_medicines.png')} alt="" />
                </span>
                <span className={classes.linkText}>Need to find a medicine/ alternative?</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <Link className={classes.serviceType} to="/prescriptions">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_medicines.png')} alt="" />
                </span>
                <span className={classes.linkText}>Do you have a prescription ready?</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <div className={classes.serviceinfoText}>
                Get all your medicines, certified using our 5-point system, within 2 hours.
              </div>
            </div>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter}`}
                to="/search-medicines"
              >
                <span className={classes.serviceIcon}>
                  <img src={require('images/ic_schedule.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Your Med Subscripitons</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={`${classes.sectionGroup} ${classes.marginNone}`}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter}`}
                to="/search-medicines"
              >
                <span className={classes.serviceIcon}>
                  <img src={require('images/ic_tablets.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Your Orders</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.bottomImgGroup}>
              <img src={require('images/ic_adbanner_web.png')} alt="" />
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.rightSection}>
        <div className={classes.searchFormGroup}>
          <div className={classes.searchMedicine}>
            <AphTextField
              placeholder="Enter name of the medicine"
              autoFocus
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const medicineName = e.target.value;
                setMedicineCount(0);
                setLoading(true);
                if (medicineName.length > 2) {
                  const source: CancelTokenSource = axios.CancelToken.source();
                  // source && source.cancel('Operation has been canceled.');
                  axios
                    .post(
                      apiDetails.url,
                      { params: medicineName },
                      {
                        cancelToken: source.token,
                        headers: {
                          Authorization: apiDetails.authToken,
                        },
                      }
                    )
                    .then((result) => {
                      const medicines = result.data.products ? result.data.products : [];
                      const medicineCount = result.data.product_count
                        ? result.data.product_count
                        : 0;
                      if (medicineCount === 0 && medicines.length === 0) {
                        setShowError(true);
                      } else {
                        setShowError(false);
                      }
                      setMedicines(medicines);
                      setMedicineCount(medicineCount);
                      setLoading(false);
                    })
                    .catch((thrown: AxiosError | Cancel) => {
                      // if (axios.isCancel(thrown)) {
                      //   const cancel: Cancel = thrown;
                      //   console.log(cancel);
                      // }
                    });
                  // source && source.cancel('Operation has been canceled.');
                } else {
                  setLoading(false);
                }
                // debouncedFunction(medicineName)();
              }}
              error={showError}
            />
            {showError ? (
              <FormHelperText component="div" error={showError}>
                Sorry, we couldn't find what you are looking for :(
              </FormHelperText>
            ) : null}
            {/* <div className={classes.uploadPrescriptionBtn}>
              <img src={require('images/ic_prescription.svg')} alt="" />
            </div> */}
          </div>
          <div className={classes.pinCode}>
            <AphTextField
              placeholder="Enter Pincode"
              inputProps={{
                maxLength: 6,
                type: 'text',
              }}
              onKeyPress={(e) => {
                if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
              }}
            />
          </div>
        </div>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 262px)'}>
          <div className={classes.medicineListGroup}>
            {pastSearches.length > 0 ? (
              <>
                <div className={classes.sectionHeader}>
                  <span>Past Searches</span>
                  <span className={classes.count}>04</span>
                </div>
                <div className={classes.pastSearches}>
                  <MedicineCard />
                </div>
              </>
            ) : null}
            {loading ? <CircularProgress /> : null}
            {medicineCount > 0 ? (
              <>
                <div className={classes.sectionHeader}>
                  <span>Matching Medicines</span>
                  <span className={classes.count}>{medicineCount}</span>
                </div>
                <MedicineStripCard medicines={medicines} />
              </>
            ) : null}
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};
