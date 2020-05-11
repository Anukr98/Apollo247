import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress, Popover, Typography } from '@material-ui/core';
import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import isNull from 'lodash/isNull';

import {
  AphRadio,
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
} from '@aph/web-ui-components';
import { useApolloClient } from 'react-apollo-hooks';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { ViewAllAddress } from 'components/Locations/ViewAllAddress';
import axios, { AxiosResponse, Canceler } from 'axios';

import { GET_PATIENT_ADDRESSES_LIST } from 'graphql/address';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
  GetPatientAddressList_getPatientAddressList_addressList as Address,
} from 'graphql/types/GetPatientAddressList';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';
import { gtmTracking } from '../../gtmTracking';

export const formatAddress = (address: Address) => {
  const addrLine1 = [address.addressLine1, address.addressLine2].filter((v) => v).join(', ');
  const addrLine2 = [address.city, address.state]
    .filter((v) => v)
    .join(', ')
    .split(',')
    .map((v) => v.trim())
    .filter((item, idx, array) => array.indexOf(item) === idx)
    .join(', ');
  const formattedZipcode = address.zipcode ? ` - ${address.zipcode}` : '';
  return `${addrLine1}\n${addrLine2}${formattedZipcode}`;
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
    },
    deliveryTimeGroupWrap: {
      display: 'flex',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      borderRadius: 5,
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
  };
});

const apiDetails = {
  url: process.env.PHARMACY_MED_INFO_URL,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  deliveryUrl: process.env.PHARMACY_MED_DELIVERY_TIME,
  deliveryAuthToken: process.env.PHARMACY_MED_DELIVERY_AUTH_TOKEN,
  service_url: process.env.PHARMACY_SERVICE_AVAILABILITY,
};

type HomeDeliveryProps = {
  setDeliveryTime: (deliveryTime: string) => void;
  deliveryTime: string;
  selectedZipCode: (zipCode: string) => void;
};

interface TatInterface {
  artCode: string;
  deliverydate: string;
  siteId: string;
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
    medicineCartType,
    removeCartItem,
    updateItemShippingStatus,
    changeCartTatStatus,
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

  useEffect(() => {
    if (isMounted.current && deliveryAddressId && !selectingAddress) {
      !nonCartFlow && fetchDeliveryTime(zipCode);
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
              setZipCode(zipCode);
              if (cartItems.length > 0 && !nonCartFlow) {
                fetchDeliveryTime(zipCode);
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

  const checkServiceAvailability = (zipCode: string | null) => {
    // setIsLoading(true);
    changeCartTatStatus && changeCartTatStatus(false);

    return axios.post(
      apiDetails.service_url || '',
      {
        postalcode: zipCode || '',
        skucategory: [
          {
            SKU: 'PHARMA',
          },
        ],
      },
      {
        headers: {
          Authorization: apiDetails.authToken,
        },
      }
    );
  };

  const removeNonDeliverableItemsFromCart = () => {
    if (nonServicableSKU.length) {
      nonServicableSKU.map((nonDeliverableSKU: string) => {
        let obj = cartItems.find((o) => o.sku === nonDeliverableSKU);
        if (obj) {
          removeCartItem && removeCartItem(obj.id);
        }
      });
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

  const fetchDeliveryTime = async (zipCode: string) => {
    const CancelToken = axios.CancelToken;
    let cancelGetDeliveryTimeApi: Canceler | undefined;
    const lookUp = cartItems.map((item: MedicineCartItem) => {
      return { sku: item.sku, qty: item.quantity };
    });
    setDeliveryLoading(true);
    await axios
      .post(
        apiDetails.deliveryUrl || '',
        {
          postalcode: zipCode || '',
          ordertype: medicineCartType,
          lookup: lookUp,
        },
        {
          headers: {
            Authentication: apiDetails.deliveryAuthToken,
          },
          cancelToken: new CancelToken((c) => {
            // An executor function receives a cancel function as a parameter
            cancelGetDeliveryTimeApi = c;
          }),
        }
      )
      .then((res: AxiosResponse) => {
        try {
          if (res && res.data) {
            setDeliveryLoading(false);
            setSelectingAddress(true);
            if (
              typeof res.data === 'object' &&
              Array.isArray(res.data.tat) &&
              res.data.tat.length
            ) {
              const tatResult = res.data.tat;

              const nonDeliverySKUArr = tatResult
                .filter((item: TatInterface) => getDiffInDays(item.deliverydate) > 10)
                .map((filteredSku: TatInterface) => filteredSku.artCode);

              const deliverableSku = tatResult
                .filter((item: TatInterface) => getDiffInDays(item.deliverydate) <= 10)
                .map((filteredSku: TatInterface) => filteredSku.artCode);

              const deliveryTime = tatResult
                .filter((item: TatInterface) => getDiffInDays(item.deliverydate) <= 10)
                .map((e: TatInterface) => e.deliverydate)
                .sort()
                .reverse()[0];

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
                changeCartTatStatus && changeCartTatStatus(true);
              }

              setErrorDeliveryTimeMsg('');
              setDeliveryTime(deliveryTime);
            } else if (typeof res.data.errorMSG === 'string') {
              setErrorDeliveryTimeMsg(res.data.errorMSG);
              setDeliveryTime('');
            }
          }
          setSelectingAddress(false);

          // setIsLoading(false);
        } catch (error) {
          setDeliveryLoading(false);
          setIsLoading(false);
          console.log(error);
        }
      })
      .catch((error: any) => console.log(error));
  };
  const getDiffInDays = (nextAvailability: string) => {
    if (nextAvailability && nextAvailability.length > 0) {
      const nextAvailabilityTime = nextAvailability && moment(nextAvailability);
      const currentTime = moment(new Date());
      const differenceInDays = currentTime.diff(nextAvailabilityTime, 'days') * -1;
      return Math.round(differenceInDays) + 1;
    } else {
      return 0;
    }
  };

  if (isError) {
    return <p>Error while fetching addresses.</p>;
  }

  return (
    <div className={classes.root}>
      {/* {deliveryAddresses.length > 0 && selectedAddressData ? (
        <ul>
          <li>
            <FormControlLabel
              checked={true}
              className={classes.radioLabel}
              value={selectedAddressData.id}
              control={<AphRadio color="primary" />}
              label={formatAddress(selectedAddressData)}
              onChange={() => {
                setDeliveryAddressId &&
                  setDeliveryAddressId(selectedAddressData && selectedAddressData.id);
                setStoreAddressId && setStoreAddressId('');
              }}
            />
          </li>
        </ul>
      ) : ( 
        <>{isLoading ? <CircularProgress /> : null}</>
      )} */}

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
                          checkServiceAvailability(address.zipcode)
                            .then((res: AxiosResponse) => {
                              if (res && res.data && res.data.Availability) {
                                /**Gtm code start  */
                                gtmTracking({
                                  category: 'Pharmacy',
                                  action: 'Order',
                                  label: 'Address Selected',
                                });
                                /**Gtm code End  */
                                setDeliveryAddressId && setDeliveryAddressId(address.id);
                                setStoreAddressId && setStoreAddressId('');
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
      {deliveryTime.length > 0 && (
        <div className={classes.deliveryTimeGroup}>
          <div className={classes.deliveryTimeGroupWrap}>
            <span className={classes.deliveryTime}>Delivery Time</span>
            <span className={classes.deliveryDate}>
              {deliveryLoading ? <CircularProgress size={22} /> : deliveryTime}
            </span>
          </div>
        </div>
      )}

      <AphDialog open={isAddAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAddAddressDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Add New Address</AphDialogTitle>
        <AddNewAddress
          setIsAddAddressDialogOpen={setIsAddAddressDialogOpen}
          checkServiceAvailability={checkServiceAvailability}
          setDeliveryTime={setDeliveryTime}
        />
      </AphDialog>

      <AphDialog open={isViewAllAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsViewAllAddressDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Select Delivery Address</AphDialogTitle>
        <ViewAllAddress
          setIsViewAllAddressDialogOpen={setIsViewAllAddressDialogOpen}
          formatAddress={formatAddress}
          checkServiceAvailability={checkServiceAvailability}
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
    </div>
  );
};
