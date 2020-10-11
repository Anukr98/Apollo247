import {
  AphButton,
  AphDialog,
  AphDialogClose,
  AphDialogTitle,
  AphRadio,
} from '@aph/web-ui-components';
import { CircularProgress, FormControlLabel, Popover, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Alerts } from 'components/Alerts/Alerts';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { ViewAllAddress } from 'components/Locations/ViewAllAddress';
import { MedicineCartItem, useShoppingCart } from 'components/MedicinesCartProvider';
import { GET_PATIENT_ADDRESSES_LIST, UPDATE_PATIENT_ADDRESS } from 'graphql/address';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
  GetPatientAddressList_getPatientAddressList_addressList as Address,
} from 'graphql/types/GetPatientAddressList';
import { pharmaStateCodeMapping } from 'helpers/commonHelpers';
import {
  checkServiceAvailability,
  checkSkuAvailability,
  checkTatAvailability,
} from 'helpers/MedicineApiCalls';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import isNull from 'lodash/isNull';
import moment from 'moment';
import React, { useEffect, useRef } from 'react';
import { useApolloClient, useMutation } from 'react-apollo-hooks';
import { gtmTracking, dataLayerTracking } from '../../gtmTracking';
import axios, { AxiosError } from 'axios';
import { pharmaAvailabilityApiTracking, pharmaTatApiTracking } from 'webEngageTracking';

export const formatAddress = (address: Address) => {
  const addressFormat = [address.addressLine1, address.addressLine2].filter((v) => v).join(', ');
  const formattedZipcode = address.zipcode ? ` - ${address.zipcode}` : '';
  return `${addressFormat}${formattedZipcode}`;
};

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
    deliveryTimeGroup: {
      margin: 10,
      marginTop: 0,
      borderTop: '0.5px solid rgba(2,71,91,0.2)',
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        margin: '10px 0 0',
      },
    },
    deliveryTimeGroupWrap: {
      display: 'flex',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    deliveryTime: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
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
      zIndex: 2,
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
    noBoxShadow: {
      boxShadow: 'none',
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
        maxWidth: '100%',
        width: '100%',
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
    alignCenter: {
      textAlign: 'center',
    },
    weAreSorry: {
      color: '#890000',
    },
    dialogTitle: {
      zIndex: 1,
      '& h2': {
        fontSize: 16,
        fontWeight: 500,
      },
    },
    dialogBox: {
      '& >div': {
        '& >div': {
          maxWidth: 400,
          margin: '30px auto 0',
          [theme.breakpoints.down('xs')]: {
            borderRadius: 0,
            margin: 0,
            height: '100vh',
            maxHeight: 'inherit',
            background: '#F7F8F5',
          },
        },
      },
    },
    goBack: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        position: 'absolute',
        top: 10,
        zIndex: 5,
        boxShadow: 'none',
      },
    },
  };
});

type HomeDeliveryProps = {
  setDeliveryTime: (deliveryTime: string) => void;
  deliveryTime: string;
  selectedZipCode: (zipCode: string) => void;
  checkForPriceUpdate: (tatRes: any) => void;
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  latitude: string;
  longitude: string;
};

interface TatInterface {
  artCode: string;
  deliverydate: string;
  siteId: string;
}

interface lookupType {
  sku: string;
  qty: number;
}

export const HomeDelivery: React.FC<HomeDeliveryProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const {
    setDeliveryAddressId,
    deliveryAddressId,
    deliveryAddresses,
    setDeliveryAddresses,
    cartItems,
    setStoreAddressId,
    updateItemShippingStatus,
    changeCartTatStatus,
    pharmaAddressDetails,
    removeCartItems,
  } = useShoppingCart();
  const { setDeliveryTime, deliveryTime } = props;
  const { isSigningIn } = useAuth();
  const client = useApolloClient();
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = React.useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [zipCode, setZipCode] = React.useState<string>('');
  const [isError, setIsError] = React.useState<boolean>(false);
  const [deliveryLoading, setDeliveryLoading] = React.useState<boolean>(false);
  const [selectingAddress, setSelectingAddress] = React.useState<boolean>(false);

  const [selectedAddressDataIndex, setSelectedAddressDataIndex] = React.useState<number>(0);
  const [errorDeliveryTimeMsg, setErrorDeliveryTimeMsg] = React.useState('');
  const [nonServicableSKU, setNonServicableSKU] = React.useState([]);
  const [showPlaceNotFoundPopup, setShowPlaceNotFoundPopup] = React.useState(false);
  const [showNonDeliverablePopup, setShowNonDeliverablePopup] = React.useState(false);
  const addToCartRef = useRef(null);
  const isMounted = useRef(false);
  const urlParams = new URLSearchParams(window.location.search);
  const nonCartFlow = urlParams.get('prescription') ? urlParams.get('prescription') : false;
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);

  useEffect(() => {
    if (isMounted.current && deliveryAddressId && !selectingAddress) {
      !nonCartFlow && fetchDeliveryTime(zipCode, props.latitude, props.longitude);
    } else {
      isMounted.current = true;
    }
  }, [cartItems]);

  const getAddressDetails = () => {
    setIsLoading(true);
    client
      .query<GetPatientAddressList, GetPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESSES_LIST,
        variables: {
          patientId: currentPatient ? currentPatient.id : '',
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
              const index = addresses.findIndex((address) => address.id === deliveryAddressId);
              const zipCode = index !== -1 ? addresses[index].zipcode || '' : '';
              const lat = index !== -1 ? addresses[index].latitude || '' : '';
              const lng = index !== -1 ? addresses[index].longitude || '' : '';
              setZipCode(zipCode);
              props.setLatitude(lat.toString());
              props.setLongitude(lng.toString());
              if (cartItems.length > 0 && !nonCartFlow) {
                fetchDeliveryTime(zipCode, lat.toString(), lng.toString());
              }
              props.selectedZipCode(zipCode);
              setSelectedAddressDataIndex(index || 0);
            } else {
              setSelectedAddressDataIndex(0);
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

  const checkServiceAvailabilityCheck = (zipCode: string | null) => {
    changeCartTatStatus && changeCartTatStatus(false);
    return checkServiceAvailability(zipCode);
  };

  const removeNonDeliverableItemsFromCart = () => {
    if (nonServicableSKU.length) {
      let arrSku: any[] = [];
      nonServicableSKU.map((nonDeliverableSKU: string) => {
        let obj = cartItems.find((o) => o.sku === nonDeliverableSKU);
        arrSku.push(obj.sku);
      });
      removeCartItems && removeCartItems(arrSku);
      setShowNonDeliverablePopup(false);
      setNonServicableSKU([]);
    }
  };

  const handleChangeAddressClick = () => {
    setShowNonDeliverablePopup(false);
    if (nonServicableSKU.length) {
      nonServicableSKU.map((nonDeliverableSKU: string) => {
        let obj = cartItems.find((o) => o.sku === nonDeliverableSKU);
        if (obj && !isNull(obj)) {
          updateItemShippingStatus &&
            updateItemShippingStatus({
              id: obj.id,
              is_in_stock: false,
              sku: obj.sku,
              quantity: 0,
            });
        }
      });
    }
    setDeliveryTime('');
    setDeliveryAddressId && setDeliveryAddressId('');
  };

  const setDefaultDeliveryTime = () => {
    const nextDeliveryDate = moment()
      .set({
        hour: 20,
        minute: 0,
      })
      .add(2, 'days')
      .format('DD-MMM-YYYY HH:mm');
    setErrorDeliveryTimeMsg('');
    setDeliveryTime(nextDeliveryDate);
    setDeliveryLoading(false);
    setIsLoading(false);
    changeCartTatStatus(true);
  };

  const fetchUserDisplayDeliveryTime = async (paramObject: {
    postalcode: string;
    lat: string;
    lng: string;
  }) => {
    const items = cartItems.map((item: MedicineCartItem) => {
      return { sku: item.sku, qty: item.quantity };
    });
    await checkTatAvailability(items, paramObject.postalcode, paramObject.lat, paramObject.lng)
      .then((res: any) => {
        if (res && res.data && res.data.response && res.data.response.tat) {
          setDeliveryTime(res.data.response.tat);
          props.checkForPriceUpdate(res.data.response);
          changeCartTatStatus && changeCartTatStatus(true);
          /** Webengage Tracking */
          const {
            items,
            lat,
            lng,
            ordertime,
            pincode,
            storeCode,
            storeType,
            tat,
            tatU,
          } = res.data.response;
          const { exist, mrp, qty } = items[0];
          const { sku, quantity, price, mou } = cartItems[0];
          pharmaTatApiTracking({
            source: 'Cart',
            inputSku: sku,
            inputQty: quantity,
            inputLat: paramObject.lat,
            inputLng: paramObject.lng,
            inputPincode: paramObject.postalcode,
            inputMrp: price,
            itemsInCart: cartItems.length,
            resExist: exist,
            resMrp: mrp * parseInt(mou),
            resQty: qty,
            resLat: lat,
            resLng: lng,
            resOrderTime: ordertime,
            resPincode: pincode,
            resStorecode: storeCode,
            resStoreType: storeType,
            resTat: tat,
            resTatU: tatU,
          });
          /** Webengage Tracking */
        }
      })
      .catch((e) => {
        console.log(e);
        setDefaultDeliveryTime();
      });
  };

  const fetchDeliveryTime = async (zipCode: string, lat: string, lng: string) => {
    const lookUp = cartItems.map((item: MedicineCartItem) => {
      return item.sku;
    });
    setDeliveryLoading(true);
    await checkSkuAvailability(lookUp.join(','), zipCode)
      .then((res: any) => {
        try {
          if (res && res.data && res.data.response) {
            setDeliveryLoading(false);
            setSelectingAddress(true);
            if (res.data.response.length > 0) {
              /** Webengage Tracking */
              const { exist, mrp, qty } = res.data.response[0];
              const { sku, price, mou } = cartItems[0];
              pharmaAvailabilityApiTracking({
                source: 'Cart',
                inputSku: sku,
                inputPincode: zipCode,
                inputMrp: price,
                itemsInCart: cartItems.length,
                resExist: exist,
                resMrp: mrp * parseInt(mou),
                resQty: qty,
              });
              /** Webengage Tracking */
              const tatResult = res.data.response;
              const nonDeliverySKUArr = tatResult
                .filter((item: any) => !item.exist)
                .map((filteredSku: any) => filteredSku.sku);

              const deliverableSku = tatResult
                .filter((item: any) => item.exist)
                .map((filteredSku: any) => filteredSku.sku);

              deliverableSku.map((deliverableSKU: string) => {
                let obj = cartItems.find((o) => o.sku === deliverableSKU);
                if (obj && !isNull(obj)) {
                  updateItemShippingStatus &&
                    updateItemShippingStatus({
                      id: obj.id,
                      is_in_stock: true,
                      sku: obj.sku,
                      quantity: obj.quantity,
                      isShippable: true,
                    });
                }
              });

              // if nonDeliverySKUArr.length then open change address / delete item modal
              if (nonDeliverySKUArr && nonDeliverySKUArr.length) {
                setShowNonDeliverablePopup(true);
                setNonServicableSKU(nonDeliverySKUArr);
              } else {
                fetchUserDisplayDeliveryTime({
                  postalcode: zipCode || '',
                  lat,
                  lng,
                });
              }

              setErrorDeliveryTimeMsg('');
            } else if (typeof res.data.errorMSG === 'string') {
              setDefaultDeliveryTime();
            }
          }
          setSelectingAddress(false);
        } catch (error) {
          console.log(error);
          setDefaultDeliveryTime();
        }
      })
      .catch((error: any) => {
        console.log(error);
        setDefaultDeliveryTime();
      });
  };

  if (isError) {
    return <p>Error while fetching addresses.</p>;
  }

  const updateAddressMutation = useMutation(UPDATE_PATIENT_ADDRESS);

  const checkLatLongStateCodeAvailability = (address: Address) => {
    const pincodeAndAddress = [address.zipcode, address.addressLine1]
      .filter((v) => (v || '').trim())
      .join(',');

    const googleMapApi = `https://maps.googleapis.com/maps/api/geocode/json?address=pincode:${pincodeAndAddress}&components=country:in&key=${process.env.GOOGLE_API_KEY}`;
    if (!address.latitude || !address.longitude || !address.stateCode) {
      // get lat long
      if (address.zipcode && address.zipcode.length === 6) {
        setIsLoading(true);
        axios
          .get(googleMapApi)
          .then(({ data }) => {
            try {
              if (
                data &&
                data.results[0] &&
                data.results[0].geometry &&
                data.results[0].geometry.location
              ) {
                const { lat, lng } = data.results[0].geometry.location;
                let {
                  id,
                  addressLine1,
                  addressLine2,
                  mobileNumber,
                  zipcode,
                  addressType,
                  city,
                  state,
                  otherAddressType,
                } = address;
                const addressComponents = data.results[0].address_components || [];
                city =
                  (
                    addressComponents.find(
                      (item: any) =>
                        item.types.indexOf('locality') > -1 ||
                        item.types.indexOf('administrative_area_level_2') > -1
                    ) || {}
                  ).long_name || city;
                state =
                  (
                    addressComponents.find(
                      (item: any) => item.types.indexOf('administrative_area_level_1') > -1
                    ) || {}
                  ).long_name || state;
                updateAddressMutation({
                  variables: {
                    UpdatePatientAddressInput: {
                      id,
                      addressLine1,
                      addressLine2,
                      city,
                      state,
                      zipcode,
                      mobileNumber,
                      addressType,
                      otherAddressType,
                      latitude: lat,
                      longitude: lng,
                      stateCode: pharmaStateCodeMapping[state] || '',
                    },
                  },
                }).then(() => {
                  setDeliveryAddressId && setDeliveryAddressId(address.id);
                  setStoreAddressId && setStoreAddressId('');
                  setIsLoading(false);
                });
              }
            } catch {
              (e: AxiosError) => {
                console.log(e);
                setIsLoading(false);
                setIsAlertOpen(true);
                setAlertMessage(e.message);
              };
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
      setDeliveryAddressId && setDeliveryAddressId(address.id);
      setStoreAddressId && setStoreAddressId('');
    }
  };

  return (
    <div className={classes.root}>
      {deliveryAddresses.length > 0 ? (
        <>
          {isLoading ? (
            <div className={classes.alignCenter}>
              <CircularProgress />
            </div>
          ) : (
            <ul>
              {deliveryAddresses.map(
                (address, idx) =>
                  idx === selectedAddressDataIndex && (
                    <li key={idx}>
                      <FormControlLabel
                        checked={address.id === deliveryAddressId}
                        className={classes.radioLabel}
                        value={address.id}
                        control={<AphRadio color="primary" />}
                        label={formatAddress(address)}
                        onChange={() => {
                          checkServiceAvailabilityCheck(address.zipcode)
                            .then((res: any) => {
                              if (res && res.data && res.data.response) {
                                /**Gtm code start  */
                                gtmTracking({
                                  category: 'Pharmacy',
                                  action: 'Order',
                                  label: 'Address Selected',
                                });
                                /**Gtm code End  */

                                /**Gtm code start start */
                                dataLayerTracking({
                                  event: 'Address Selected',
                                  PINCode: address.zipcode,
                                  City: address.city,
                                });
                                /**Gtm code start end */

                                checkLatLongStateCodeAvailability(address);
                              } else {
                                setShowPlaceNotFoundPopup(true);
                              }
                            })
                            .catch((e: any) => {
                              console.log(e);
                            });
                        }}
                      />
                    </li>
                  )
              )}
            </ul>
          )}
        </>
      ) : (
        <>
          {isLoading && (
            <div className={classes.alignCenter}>
              <CircularProgress />
            </div>
          )}
        </>
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
      {errorDeliveryTimeMsg.length > 0 && (
        <span>{deliveryLoading ? <CircularProgress size={22} /> : errorDeliveryTimeMsg}</span>
      )}
      {deliveryTime && deliveryTime.length > 0 && (
        <div className={classes.deliveryTimeGroup}>
          <div className={classes.deliveryTimeGroupWrap}>
            <span className={classes.deliveryTime}>Delivery Time</span>
            <span className={classes.deliveryDate}>
              {deliveryLoading ? <CircularProgress size={22} /> : deliveryTime}
            </span>
          </div>
        </div>
      )}

      <AphDialog open={isAddAddressDialogOpen} className={classes.dialogBox}>
        <AphDialogClose onClick={() => setIsAddAddressDialogOpen(false)} title={'Close'} />
        <AphButton
          onClick={() => setIsAddAddressDialogOpen(false)}
          title={'Close'}
          className={classes.goBack}
        >
          <img src={require('images/ic_back.svg')} alt="Back Button" />
        </AphButton>
        <AphDialogTitle className={classes.dialogTitle}>Add New Address</AphDialogTitle>
        <AddNewAddress
          setIsAddAddressDialogOpen={setIsAddAddressDialogOpen}
          checkServiceAvailability={checkServiceAvailabilityCheck}
          setDeliveryTime={setDeliveryTime}
        />
      </AphDialog>

      <AphDialog open={isViewAllAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsViewAllAddressDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Select Delivery Address</AphDialogTitle>
        <ViewAllAddress
          setIsViewAllAddressDialogOpen={setIsViewAllAddressDialogOpen}
          formatAddress={formatAddress}
          checkServiceAvailability={checkServiceAvailabilityCheck}
          setDeliveryTime={setDeliveryTime}
        />
      </AphDialog>
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
                <p>You can also call 1860 500 0101 for Apollo Pharmacy retail customer care.</p>
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
      <Popover
        open={showNonDeliverablePopup}
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
                <Typography variant="h2">
                  <div className={classes.weAreSorry}>We’re Sorry!</div>
                </Typography>
                <p>Some items in your order are not deliverable to the selected address.</p>
                <p>You may either change the address or delete the items from your cart.</p>
                <p>You can also call 1860 500 0101 for Apollo Pharmacy retail customer care.</p>
              </div>
              <div className={classes.actions}>
                <AphButton
                  className={`${classes.viewCartBtn} ${classes.noBoxShadow}`}
                  onClick={() => handleChangeAddressClick()}
                >
                  CHANGE THE ADDRESS
                </AphButton>
                <AphButton
                  className={`${classes.viewCartBtn} ${classes.noBoxShadow}`}
                  onClick={() => removeNonDeliverableItemsFromCart()}
                >
                  REMOVE ITEMS
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
