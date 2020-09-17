import React, { useRef, useEffect, useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover, Typography } from '@material-ui/core';
import { AphButton, AphTextField, AphCustomDropdown } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

import { NotifyMeNotification } from './NotifyMeNotification';
import {
  notifyMeTracking,
  pharmacyPdpPincodeTracking,
  addToCartTracking,
  buyNowTracking,
} from 'webEngageTracking';
import { SubstituteDrugsList } from 'components/Medicine/SubstituteDrugsList';
import {
  MedicineProductDetails,
  MedicineProduct,
  checkSkuAvailability,
  checkTatAvailability,
} from '../../helpers/MedicineApiCalls';
import { useParams } from 'hooks/routerHooks';
import axios, { AxiosResponse, AxiosError, Canceler } from 'axios';
import { useShoppingCart, MedicineCartItem } from '../MedicinesCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { AddToCartPopover } from 'components/Medicine/AddToCartPopover';
import CircularProgress from '@material-ui/core/CircularProgress';
import { gtmTracking } from '../../gtmTracking';
import {
  NO_SERVICEABLE_MESSAGE,
  getDiffInDays,
  TAT_API_TIMEOUT_IN_MILLI_SEC,
  OUT_OF_STOCK_MESSAGE,
  findAddrComponents,
  OUT_OF_STOCK,
  NO_ONLINE_SERVICE,
  NOTIFY_WHEN_IN_STOCK,
  PINCODE_MAXLENGTH,
} from 'helpers/commonHelpers';
import moment from 'moment';
import { Alerts } from 'components/Alerts/Alerts';
import { CartTypes } from 'components/MedicinesCartProvider';
import _lowerCase from 'lodash/lowerCase';
import { useAllCurrentPatients } from 'hooks/authHooks';
import fetchUtil from 'helpers/fetch';
import _get from 'lodash/get';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      width: 328,
      borderRadius: 5,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        backgroundColor: '#f7f8f5',
        paddingBottom: 60,
      },
    },
    medicineSection: {
      padding: '20px 5px 0 10px',
      paddingTop: 15,
    },
    scrollResponsive: {
      height: 'calc(100vh - 375px) !important',
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 390px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        height: '100% !important',
      },
    },
    customScroll: {
      width: '100%',
      paddingLeft: 10,
      paddingRight: 15,
      paddingBottom: 10,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 80,
      },
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 600,
      color: '#02475b',
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    bottomActions: {
      padding: 20,
      paddingTop: 10,
      display: 'flex',
      '& button': {
        width: '50%',
        borderRadius: 10,
        '&:first-child': {
          marginRight: 8,
          color: '#fc9916',
          backgroundColor: theme.palette.common.white,
        },
        '&:last-child': {
          marginLeft: 8,
        },
      },
    },
    notifyBtn: {
      width: '100% !important',
      color: '#fc9916',
      margin: '0 !important',
    },
    substitutes: {
      backgroundColor: '#f7f8f5',
      padding: 10,
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginBottom: 16,
      cursor: 'pointer',
      position: 'relative',
      paddingRight: 40,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      },
    },
    dropDownArrow: {
      position: 'absolute',
      right: 8,
      top: '50%',
      marginTop: -12,
    },
    deliveryInfo: {
      backgroundColor: '#f7f8f5',
      padding: 10,
      borderRadius: 5,
      paddingTop: 1,
      '& input': {
        fontSize: 14,
        fontWeight: 500,
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
        padding: 10,
      },
    },
    deliveryTimeGroup: {
      position: 'relative',
    },
    checkBtn: {
      color: '#fc9916',
      boxShadow: 'none',
      minWidth: 'auto',
      padding: 0,
      position: 'absolute',
      right: 0,
      top: 6,
      fontSize: 13,
      fontWeight: 'bold',
    },
    checkBtnDisabled: {
      opacity: 0.5,
      color: '#fc9916 !important',
    },
    deliveryTimeInfo: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
      paddingTop: 10,
      '& span:last-child': {
        fontWeight: 'bold',
        marginLeft: 'auto',
      },
    },
    bottomGroupResponsive: {
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: '#f7f8f5',
        boxShadow: '0px -2px 5px rgba(128, 128, 128, 0.2)',
      },
    },
    bottomGroupResponse: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      [theme.breakpoints.down('xs')]: {
        height: 'auto',
        display: 'block',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: '#f7f8f5',
        boxShadow: '0px -2px 5px rgba(128, 128, 128, 0.2)',
      },
    },
    priceGroup: {
      padding: '10px 20px',
    },
    priceWrap: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: '6px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    medicinePrice: {
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      textAlign: 'right',

      [theme.breakpoints.down('xs')]: {
        width: '50%',
      },
    },
    leftGroup: {
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 13,
      fontWeight: 500,
      width: 98,
      [theme.breakpoints.down('xs')]: {
        width: '50%',
      },
    },
    medicinePack: {
      color: '#02475b',
      letterSpacing: 0.33,
      display: 'flex',
      alignItems: 'center',
    },
    dropDown: {
      width: 'calc(100% - 45px)',
      '& > div': {
        width: '100%',
      },
    },
    medicineNoStock: {
      color: '#890000',
      lineHeight: '32px',
      fontWeight: 'bold',
    },
    medicineNoOnline: {
      color: '#890000',
      lineHeight: '32px',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px 0 rgba(0,0,0, 0.2)',
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'uppercase',
      paddingTop: 7,
      paddingLeft: 4,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
      minWidth: 30,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
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
    substitutePopover: {
      margin: 0,
    },
    selectedDrugs: {
      width: '100%',
    },
    price: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
    regularPrice: {
      fontSize: 13,
      fontWeight: 500,
      color: '#01475b',
      opacity: 0.6,
      textDecoration: 'line-through',
      paddingRight: 5,
    },
    errorText: {
      color: '#890000',
      padding: '6px 16px',
      fontSize: 11,
      fontWeight: 500,
    },
    outOfStock: {
      textAlign: 'center',
      padding: 16,
    },
    outOfOnline: {
      textAlign: 'center',
      padding: 16,
      width: '100%',
    },
    webView: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    disableButton: {
      opacity: 0.7,
    },
    mobileView: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
  });
});

type MedicineInformationProps = {
  data: MedicineProductDetails;
};

interface AddToCarProps {
  setClickAddCart: (clickAddCart: boolean) => void;
}

export const MedicineInformation: React.FC<MedicineInformationProps> = (props) => {
  const { data } = props;
  const classes = useStyles({});
  const {
    addCartItem,
    cartItems,
    updateCartItemQty,
    pharmaAddressDetails,
    setMedicineAddress,
    setPharmaAddressDetails,
    setHeaderPincodeError,
    deliveryAddresses,
  } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();
  const itemIndexInCart = (item: MedicineProduct) => {
    return cartItems.findIndex((cartItem) => cartItem.sku == item.sku);
  };
  const [medicineQty, setMedicineQty] = React.useState(1);
  const notifyPopRef = useRef(null);
  const addToCartRef = useRef(null);
  const subDrugsRef = useRef(null);
  const [isSubDrugsPopoverOpen, setIsSubDrugsPopoverOpen] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [substitutes, setSubstitutes] = React.useState<MedicineProductDetails[] | null>(null);
  const params = useParams<{ sku: string; searchText: string }>();
  const [pinCode, setPinCode] = React.useState<string>('');
  const [deliveryTime, setDeliveryTime] = React.useState<string>('');
  const [updateMutationLoading, setUpdateMutationLoading] = useState<boolean>(false);
  const [addMutationLoading, setAddMutationLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = React.useState<boolean>(false);
  const [tatLoading, setTatLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [clickAddCart, setClickAddCart] = React.useState<boolean>(false);
  const [isUpdateQuantity, setIsUpdateQuantity] = React.useState<boolean>(false);
  const [showAddMessage, setShowAddMessage] = useState<boolean>(false);

  const apiDetails = {
    skuUrl: process.env.PHARMACY_MED_PROD_SKU_URL,
    url: process.env.PHARMACY_MED_INFO_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    deliveryUrl: process.env.PHARMACY_MED_DELIVERY_TIME,
    deliveryAuthToken: process.env.PHARMACY_MED_DELIVERY_AUTH_TOKEN,
  };

  const fetchSubstitutes = async () => {
    await axios
      .post(
        apiDetails.url || '',
        { params: data.sku || params.sku },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        try {
          if (data) {
            if (data.products && data.products.length > 1) {
              setSubstitutes(
                data.products.filter((sub: MedicineProductDetails) => sub.url_key !== params.sku)
              );
            }
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((err) => console.log(err));
  };

  const setDefaultDeliveryTime = (pinCode: string) => {
    const nextDeliveryDate = moment()
      .set({
        hour: 20,
        minute: 0,
      })
      .add(2, 'days')
      .format('DD-MMM-YYYY HH:mm');
    setDeliveryTime(nextDeliveryDate);
    setErrorMessage('');
    setTatLoading(false);
    if (pharmaAddressDetails.pincode !== pinCode) {
      getPlaceDetails(pinCode);
    }
  };

  const setAddressDetails = (addrComponents: any, lat: string, lng: string) => {
    const pincode = findAddrComponents('postal_code', addrComponents);
    const city =
      findAddrComponents('administrative_area_level_2', addrComponents) ||
      findAddrComponents('locality', addrComponents);
    const state = findAddrComponents('administrative_area_level_1', addrComponents);
    const country = findAddrComponents('country', addrComponents);
    setMedicineAddress(city);
    setPharmaAddressDetails({
      city,
      state,
      pincode,
      country,
      lat,
      lng,
    });
    setHeaderPincodeError('0');
  };

  const getPlaceDetails = (pincode: string) => {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&components=country:in&key=${process.env.GOOGLE_API_KEY}`
      )
      .then(({ data }) => {
        try {
          if (data && data.results[0] && data.results[0].address_components) {
            const addrComponents = data.results[0].address_components || [];
            setAddressDetails(
              addrComponents,
              _get(data.results[0], 'geometry.location.lat', ''),
              _get(data.results[0], 'geometry.location.lng', '')
            );
          }
        } catch {
          (e: AxiosError) => {
            console.log(e);
          };
        }
      })
      .catch((e: AxiosError) => {
        setIsAlertOpen(true);
        setAlertMessage('Something went wrong :(');
        console.log(e);
      });
  };

  const fetchDeliveryTime = async (pinCode: string) => {
    setTatLoading(true);
    const items = [{ sku: data.sku, qty: medicineQty }];
    await checkTatAvailability(items, pinCode, pharmaAddressDetails.lat, pharmaAddressDetails.lng)
      .then((res: any) => {
        try {
          if (res && res.data) {
            if (res && res.data.errorMsg) {
              setDeliveryTime('');
              setErrorMessage(OUT_OF_STOCK_MESSAGE);
            }
            setTatLoading(false);
            if (
              res.data.response &&
              res.data.response.tat &&
              res.data.response.tat.length &&
              res.data.response.tatU &&
              res.data.response.tatU != -1
            ) {
              setDeliveryTime(res.data.response.tat);
              setErrorMessage('');
              if (pharmaAddressDetails.pincode !== pinCode) {
                getPlaceDetails(pinCode);
              }
            } else if (typeof res.data.errorMSG === 'string') {
              setDefaultDeliveryTime(pinCode);
            }
          }
        } catch (error) {
          console.log(error);
          setDefaultDeliveryTime(pinCode);
        }
      })
      .catch((error: any) => {
        console.log(error);
        setDefaultDeliveryTime(pinCode);
      });
  };

  useEffect(() => {
    if (!substitutes) {
      fetchSubstitutes();
    }
  }, [substitutes]);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setMedicineQty(itemIndexInCart(data) !== -1 ? cartItems[itemIndexInCart(data)].quantity : 1);
    }
  }, [cartItems]);

  useEffect(() => {
    if (pharmaAddressDetails.pincode && pharmaAddressDetails.pincode.length > 0) {
      setPinCode(pharmaAddressDetails.pincode);
      checkDeliveryTime(pharmaAddressDetails.pincode, sku);
    }
  }, [pharmaAddressDetails]);

  const checkDeliveryTime = (pinCode: string, sku: string) => {
    checkSkuAvailability(sku, pinCode)
      .then((res: any) => {
        if (
          res &&
          res.data &&
          res.data.response &&
          res.data.response.length > 0 &&
          res.data.response[0].exist
        ) {
          fetchDeliveryTime(pinCode);
        } else {
          setDeliveryTime('');
          setErrorMessage(OUT_OF_STOCK_MESSAGE);
        }
      })
      .catch((e) => {
        setErrorMessage(OUT_OF_STOCK_MESSAGE);
        setDeliveryTime('');
      });
  };

  const getItemIndexInCart = (cartItem: MedicineCartItem) => {
    return cartItems.findIndex((item) => item.sku === cartItem.sku);
  };

  const isQtyUpdated = (cartItem: MedicineCartItem, index: number) => {
    return index >= 0 && cartItems[index].quantity !== cartItem.quantity;
  };

  const applyCartOperations = (cartItem: MedicineCartItem) => {
    const index = getItemIndexInCart(cartItem);
    if (cartItems && cartItems.length > 0 && isQtyUpdated(cartItem, index)) {
      updateCartItemQty && updateCartItemQty(cartItem);
    } else if (index === -1) {
      addCartItem && addCartItem(cartItem);
    }
  };

  // const disableAddCartItem = (cartItem: MedicineCartItem) => {
  //   const index = getItemIndexInCart(cartItem);
  //   return !isQtyUpdated(cartItem, index);
  // };
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const options = Array.from(
    Array(Number(data.MaxOrderQty) || process.env.PHARMACY_MEDICINE_QUANTITY),
    (_, x) => x + 1
  );
  const {
    MaxOrderQty,
    url_key,
    description,
    id,
    image,
    is_in_stock,
    is_prescription_required,
    name,
    price,
    sku,
    special_price,
    small_image,
    status,
    thumbnail,
    type_id,
    mou,
    category_id,
    sell_online,
  } = data;

  const notAvailableContext = () => {
    return sell_online ? (
      <div className={classes.outOfStock}>
        <div className={classes.medicineNoStock}>{OUT_OF_STOCK}</div>
        <AphButton
          fullWidth
          className={classes.notifyBtn}
          onClick={() => {
            const { sku, name, category_id } = data;
            /* WebEngage event start */
            notifyMeTracking({
              sku,
              category_id,
              name,
            });
            /* WebEngage event end */
            setIsPopoverOpen(true);
          }}
        >
          {NOTIFY_WHEN_IN_STOCK}
        </AphButton>
      </div>
    ) : (
      <div className={classes.outOfOnline}>
        <div className={classes.medicineNoOnline}>{NO_ONLINE_SERVICE}</div>
      </div>
    );
  };

  useEffect(() => {
    if (showAddMessage) {
      setTimeout(() => {
        setShowAddMessage(false);
      }, 5000);
    }
  }, [showAddMessage]);

  const cartItem: MedicineCartItem = {
    MaxOrderQty,
    url_key,
    description,
    id,
    image,
    is_in_stock,
    is_prescription_required,
    name,
    price,
    sku,
    special_price,
    small_image,
    status,
    thumbnail,
    type_id,
    mou,
    quantity: medicineQty,
    isShippable: true,
  };

  return (
    <div className={classes.root}>
      {sell_online ? (
        <div className={`${classes.medicineSection}`}>
          <Scrollbars
            className={classes.scrollResponsive}
            autoHide={true}
            renderView={(props) =>
              isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
            }
          >
            <div className={classes.customScroll}>
              {substitutes && (
                <>
                  <Typography
                    component="h2"
                    className={classes.sectionTitle}
                  >{`${name} alternatives`}</Typography>

                  <div className={classes.webView}>
                    <div
                      className={classes.substitutes}
                      onClick={() => {
                        setIsSubDrugsPopoverOpen(true);
                      }}
                      ref={subDrugsRef}
                    >
                      <span>
                        Pick from {substitutes.length} available
                        {substitutes.length === 1 ? ' substitute' : ' substitutes'}
                      </span>
                      <div className={classes.dropDownArrow}>
                        <img
                          src={require('images/ic_dropdown_green.svg')}
                          alt="Dropdown"
                          title="Dropdown"
                        />
                      </div>
                    </div>
                  </div>
                  <div className={classes.mobileView}>
                    <span>
                      Pick from {substitutes.length} available
                      {substitutes.length === 1 ? ' substitute' : ' substitutes'}
                    </span>
                    <SubstituteDrugsList
                      data={substitutes}
                      setIsSubDrugsPopoverOpen={setIsSubDrugsPopoverOpen}
                    />
                  </div>
                </>
              )}
              {is_in_stock ? (
                <>
                  <div className={classes.sectionTitle}>Check Delivery Time</div>
                  <div className={classes.deliveryInfo}>
                    <div className={classes.deliveryTimeGroup}>
                      <AphTextField
                        placeholder="Enter Pin Code"
                        inputProps={{
                          maxLength: PINCODE_MAXLENGTH,
                          type: 'text',
                        }}
                        onChange={(e) => {
                          setPinCode(e.target.value);
                          if (e.target.value.length < PINCODE_MAXLENGTH) {
                            setDeliveryTime('');
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
                        }}
                        value={pinCode}
                      />
                      <AphButton
                        disabled={pinCode.length !== PINCODE_MAXLENGTH}
                        classes={{
                          root: classes.checkBtn,
                          disabled: classes.checkBtnDisabled,
                        }}
                        onClick={() => {
                          const { sku, name } = data;
                          checkDeliveryTime(pinCode, sku);
                          const eventData = {
                            pinCode,
                            productId: sku,
                            productName: name,
                            customerId: currentPatient && currentPatient.id,
                          };
                          pharmacyPdpPincodeTracking(eventData);
                        }}
                      >
                        {tatLoading ? <CircularProgress size={20} /> : ' Check'}
                      </AphButton>
                    </div>
                    {deliveryTime.length > 0 && (
                      <div className={classes.deliveryTimeInfo}>
                        <span>Delivery Time</span>

                        {tatLoading ? <CircularProgress size={20} /> : <span>{deliveryTime}</span>}
                      </div>
                    )}
                  </div>
                  {errorMessage && <div className={classes.errorText}>{errorMessage}</div>}
                </>
              ) : null}
            </div>
          </Scrollbars>
        </div>
      ) : (
        ''
      )}
      <div className={sell_online ? classes.bottomGroupResponsive : classes.bottomGroupResponse}>
        {!errorMessage ? (
          <>
            {sell_online ? (
              <div className={classes.priceGroup}>
                <div className={classes.priceWrap}>
                  <div className={classes.leftGroup}>
                    <div className={classes.medicinePack}>
                      <div>QTY :</div>
                      <div className={classes.dropDown}>
                        <AphCustomDropdown
                          classes={{ selectMenu: classes.selectMenuItem }}
                          value={medicineQty}
                          onChange={(e: React.ChangeEvent<{ value: any }>) => {
                            itemIndexInCart(data) !== -1 && setIsUpdateQuantity(true);
                            const quantity = parseInt(e.target.value);
                            /* Gtm code start  */
                            itemIndexInCart(data) !== -1 &&
                              clickAddCart &&
                              gtmTracking({
                                category: 'Pharmacy',
                                action: quantity > medicineQty ? 'Add to Cart' : 'Remove From Cart',
                                label: name,
                                value: special_price || price,
                                ecommObj: {
                                  event:
                                    quantity > medicineQty ? 'add_to_cart' : 'remove_from_cart',
                                  ecommerce: {
                                    items: [
                                      {
                                        item_name: name,
                                        item_id: sku,
                                        price: special_price || price,
                                        item_category: 'Pharmacy',
                                        item_category_2: type_id
                                          ? type_id.toLowerCase() === 'pharma'
                                            ? 'Drugs'
                                            : 'FMCG'
                                          : null,
                                        // 'item_category_4': '', // future reference
                                        item_variant: 'Default',
                                        index: 1,
                                        quantity:
                                          quantity > medicineQty
                                            ? quantity - medicineQty
                                            : medicineQty - quantity,
                                      },
                                    ],
                                  },
                                },
                              });
                            /* Gtm code end  */
                            setMedicineQty(quantity);
                          }}
                        >
                          {options.map((option, index) => (
                            <MenuItem
                              key={index}
                              classes={{
                                root: classes.menuRoot,
                                selected: classes.menuSelected,
                              }}
                              value={option}
                            >
                              {option}
                            </MenuItem>
                          ))}
                        </AphCustomDropdown>
                      </div>
                    </div>
                  </div>
                  <div className={classes.medicinePrice}>
                    {special_price && <span className={classes.regularPrice}>(Rs. {price})</span>}
                    Rs. {special_price || price}
                  </div>
                </div>
              </div>
            ) : (
              notAvailableContext()
            )}

            {sell_online ? (
              <>
                <div className={classes.bottomActions}>
                  <AphButton
                    disabled={addMutationLoading || updateMutationLoading}
                    className={
                      addMutationLoading || updateMutationLoading ? classes.disableButton : ''
                    }
                    onClick={() => {
                      setIsUpdateQuantity(false);
                      setClickAddCart(true);
                      setAddMutationLoading(true);
                      addToCartTracking({
                        productName: name,
                        source: 'Pharmacy PDP',
                        productId: sku,
                        brand: '',
                        brandId: '',
                        categoryName: params.searchText || '',
                        categoryId: category_id,
                        discountedPrice: special_price || price,
                        price: price,
                        quantity: 1,
                      });
                      /**Gtm code start  */
                      gtmTracking({
                        category: 'Pharmacy',
                        action: 'Add to Cart',
                        label: name,
                        value: special_price || price,
                        ecommObj: {
                          event: 'add_to_cart',
                          ecommerce: {
                            items: [
                              {
                                item_name: name,
                                item_id: sku,
                                price: special_price || price,
                                item_category: 'Pharmacy',
                                item_category_2: type_id
                                  ? type_id.toLowerCase() === 'pharma'
                                    ? 'Drugs'
                                    : 'FMCG'
                                  : null,
                                // 'item_category_4': '', // future reference
                                item_variant: 'Default',
                                index: 1,
                                quantity: medicineQty,
                              },
                            ],
                          },
                        },
                      });
                      /**Gtm code End  */
                      applyCartOperations(cartItem);
                      setAddMutationLoading(false);
                      setShowAddMessage(true);
                    }}
                  >
                    {' '}
                    {addMutationLoading ? (
                      <CircularProgress size={22} color="secondary" />
                    ) : (
                      'Add To Cart'
                    )}
                  </AphButton>
                  <AphButton
                    color="primary"
                    className={
                      addMutationLoading || updateMutationLoading ? classes.disableButton : ''
                    }
                    disabled={addMutationLoading || updateMutationLoading}
                    onClick={() => {
                      setUpdateMutationLoading(true);
                      applyCartOperations(cartItem);
                      setTimeout(() => {
                        window.location.href = clientRoutes.medicinesCart();
                      }, 3000);
                      buyNowTracking({
                        productName: name,
                        serviceArea: pinCode,
                        productId: sku,
                        brand: '',
                        brandId: '',
                        categoryName: params.searchText || '',
                        categoryId: category_id,
                        discountedPrice: special_price,
                        price: price,
                        quantity: medicineQty,
                      });
                    }}
                  >
                    {updateMutationLoading ? (
                      <CircularProgress size={22} color="secondary" />
                    ) : (
                      'Buy Now'
                    )}
                  </AphButton>
                  {showAddMessage && <span>Added to cart</span>}
                </div>
              </>
            ) : null}
          </>
        ) : (
          notAvailableContext()
        )}
      </div>

      <Popover
        open={isPopoverOpen}
        anchorEl={notifyPopRef.current}
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
              <img src={require('images/ic-mascot.png')} alt="Mascot Icon" title="Mascot Icon" />
            </div>
            <NotifyMeNotification medicineName={name} setIsNotifyMeDialogOpen={setIsPopoverOpen} />
          </div>
        </div>
      </Popover>
      <Popover
        open={isSubDrugsPopoverOpen}
        anchorEl={subDrugsRef.current}
        onClose={() => setIsSubDrugsPopoverOpen(false)}
        className={classes.substitutePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <SubstituteDrugsList
          data={substitutes}
          setIsSubDrugsPopoverOpen={setIsSubDrugsPopoverOpen}
        />
      </Popover>
      <Popover
        open={showPopup}
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
              <img src={require('images/ic-mascot.png')} alt="Mascot Icon" title="Mascot Icon" />
            </div>
            <AddToCartPopover
              setShowPopup={setShowPopup}
              showPopup={showPopup}
              setClickAddCart={setClickAddCart}
            />
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
