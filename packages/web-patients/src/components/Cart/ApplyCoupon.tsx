import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { AphRadio, AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import _each from 'lodash';
import { useMutation } from 'react-apollo-hooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { PHRAMA_COUPONS_LIST, VALIDATE_PHARMA_COUPONS } from '../../graphql/medicines';
import {
  getPharmaCouponList,
  getPharmaCouponList_getPharmaCouponList_coupons,
} from 'graphql/types/getPharmaCouponList';
import {
  validatePharmaCoupon_validatePharmaCoupon,
  validatePharmaCoupon,
} from 'graphql/types/validatePharmaCoupon';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';
import { gtmTracking } from '../../gtmTracking';
import { getTypeOfProduct } from 'helpers/commonHelpers';
import fetchUtil from 'helpers/fetch';
import { PharmaCoupon } from './MedicineCart';
import axios from 'axios';

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
      alignItems: 'center',
      '& >span:first-child': {
        paddingRight: 16,
      },
      '& span:last-child': {
        fontSize: 14,
        lineHeight: '14px',
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
      position: 'relative',
      '& input': {
        paddingRight: 30,
      },
    },
    pinActions: {
      position: 'absolute',
      right: 0,
      top: 6,
    },
    searchBtn: {
      boxShadow: 'none',
      padding: 0,
      minWidth: 'auto',
    },
    tickMark: {
      '& img': {
        marginBottom: -5,
      },
    },
    sectionHeader: {
      marginBottom: 20,
      paddingBottom: 4,
      paddingTop: 16,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
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
        padding: '9px 13px 9px 13px',
        fontSize: 13,
        borderRadius: 10,
        backgroundColor: '#fcb716',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#fcb716',
          color: '#fff',
        },
      },
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    customScrollBar: {
      paddingRight: 20,
      paddingLeft: 20,
    },
    shadowHide: {
      overflow: 'hidden',
    },
    couponCode: {
      '& span': {
        fontSize: '12px !important',
        color: '#02475b',
        fontWeight: 500,
        opacity: 0.6,
        display: 'block',
        lineHeight: 1.33,
      },
    },
    pinErrorMsg: {
      color: '#890000',
      fontSize: 12,
      fontWeight: 'bold',
      paddingTop: 10,
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    noCoupons: {
      textAlign: 'center',
      paddingBottom: 10,
    },
    couponText: {
      fontSize: 12,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      lineHeight: '16px',
      color: '#02475b',
      opacity: 0.6,
      paddingTop: 2,
      marginLeft: 40,
      paddingBottom: 10,
    },
  };
});

export interface consult_coupon {
  coupon: string;
  message: string;
}

interface ApplyCouponProps {
  setValidateCouponResult: (validateCouponResult: PharmaCoupon | null) => void;
  couponCode: string;
  close: (isApplyCouponDialogOpen: boolean) => void;
  cartValue: number;
  validityStatus?: boolean;
  setValidityStatus?: (validityStatus: boolean) => void;
}

export const ApplyCoupon: React.FC<ApplyCouponProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const {
    cartItems,
    setCouponCode,
    cartTotal,
    addCartItems,
    updateCartItemQty,
  } = useShoppingCart();
  const [selectCouponCode, setSelectCouponCode] = useState<string>(props.couponCode);
  const [availableCoupons, setAvailableCoupons] = useState<(consult_coupon | null)[]>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [muationLoading, setMuationLoading] = useState<boolean>(false);

  const handleQuantityFreeProduct = (response: any) => {
    if (response.products && Array.isArray(response.products) && response.products.length) {
      response.products.forEach((e: any) => {
        if (e.couponFree && e.quantity > 1 && !localStorage.getItem('updatedFreeCoupon')) {
          updateCartItemQty({ ...e, quantity: e.quantity, couponFree: 1 });
        }
      });
      localStorage.setItem('updatedFreeCoupon', 'true');
    }
  };

  const verifyCoupon = () => {
    const data = {
      mobile: localStorage.getItem('userMobileNo'),
      billAmount: cartTotal.toFixed(2),
      coupon: selectCouponCode,
      pinCode: localStorage.getItem('pharmaPincode'),
      products: cartItems.map((item) => {
        const { sku, quantity, special_price, price, type_id, couponFree } = item;
        return {
          sku,
          mrp: item.price,
          quantity,
          couponFree: couponFree || 0,
          categoryId: type_id || '',
          specialPrice: special_price || price,
        };
      }),
    };
    if (currentPatient && currentPatient.id) {
      setMuationLoading(true);
      fetchUtil(process.env.VALIDATE_CONSULT_COUPONS, 'POST', data, '', false)
        .then((resp: any) => {
          if (resp.errorCode == 0) {
            if (resp.response.valid) {
              const freeProductsSet = new Set(
                resp.response.products && resp.response.products.length
                  ? resp.response.products.filter((cartItem: any) => cartItem.mrp === 0)
                  : []
              );
              if (freeProductsSet.size) {
                addDiscountedProducts(resp.response);
                handleQuantityFreeProduct(resp.response);
              }
              props.setValidateCouponResult(resp.response);
              setCouponCode && setCouponCode(selectCouponCode);
              props.close(false);
              /*GTM TRACKING START */
              gtmTracking({
                category: 'Pharmacy',
                action: 'Order',
                label: `Coupon Applied - ${selectCouponCode}`,
                value: resp.response.discount,
              });
              return resp;
            } else {
              props.setValidateCouponResult(null);
              setErrorMessage(resp.response.reason);
              setCouponCode && setCouponCode('');
              localStorage.removeItem('pharmaCoupon');
            }
          } else if (resp && resp.errorMsg && resp.errorMsg.length > 0) {
            setErrorMessage(resp.errorMsg);
            localStorage.removeItem('pharmaCoupon');
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => setMuationLoading(false));
    }
  };

  const apiDetails = {
    url: process.env.PHARMACY_MED_PROD_DETAIL_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    bulk_product_info_url: process.env.PHARMACY_MED_BULK_PRODUCT_INFO_URL,
  };

  const addDiscountedProducts = (response: any) => {
    const skus: Array<string> = [];
    if (response.products && Array.isArray(response.products) && response.products.length) {
      try {
        const cartSkuSet = new Set(
          cartItems && cartItems.length ? cartItems.map((cartItem) => cartItem.sku) : []
        );
        response.products.forEach((data: any) => {
          if (!cartSkuSet.has(data.sku) && data.couponFree) skus.push(data.sku);
        });

        const allData: MedicineCartItem[] = [];
        if (skus && skus.length) {
          axios
            .post(
              apiDetails.bulk_product_info_url || '',
              { params: skus.join(',') },
              {
                headers: {
                  Authorization: apiDetails.authToken,
                },
              }
            )
            .then((resp) => {
              if (resp && resp.data && resp.data.productdp && resp.data.productdp.length) {
                resp &&
                  resp.data &&
                  resp.data.productdp.forEach((e: any) => {
                    const cartItem: MedicineCartItem = {
                      MaxOrderQty: 1,
                      url_key: e.url_key,
                      description: e.description,
                      id: e.id,
                      image: e.image,
                      is_in_stock: e.is_in_stock,
                      is_prescription_required: e.is_prescription_required,
                      name: e.name,
                      price: e.price,
                      sku: e.sku,
                      special_price: 0,
                      couponFree: 1,
                      small_image: e.small_image,
                      status: e.status,
                      thumbnail: e.thumbnail,
                      type_id: e.type_id,
                      mou: e.mou,
                      quantity: 1,
                      isShippable: true,
                    };
                    allData.push(cartItem);
                  });
              }
            })
            .then(() => {
              addCartItems(allData);
            });
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.getItem('pharmaCoupon') && props.setValidityStatus(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // Since endpoint is the same for all coupons, this will be changed if searchlight gives a new endpoint
    fetchUtil(process.env.GET_CONSULT_COUPONS, 'GET', {}, '', false)
      .then((res: any) => {
        if (res && res.response && res.response.length > 0) {
          setAvailableCoupons(res.response);
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const disableCoupon =
    !selectCouponCode ||
    selectCouponCode.length < 5 ||
    selectCouponCode.length > 20 ||
    errorMessage.length > 0;

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <div className={classes.pinSearch}>
                  <AphTextField
                    inputProps={{
                      maxLength: 20,
                    }}
                    value={selectCouponCode}
                    onChange={(e) => {
                      setErrorMessage('');
                      props.setValidityStatus(false);
                      const value = e.target.value.replace(/\s/g, '');
                      setSelectCouponCode(value);
                    }}
                    placeholder="Enter coupon code"
                    error={errorMessage.length > 0 && true}
                  />
                  <div className={classes.pinActions}>
                    {errorMessage.length === 0 && props.validityStatus ? (
                      <div className={classes.tickMark}>
                        <img src={require('images/ic_tickmark.svg')} alt="" />
                      </div>
                    ) : (
                        <AphButton
                          classes={{
                            disabled: classes.buttonDisabled,
                          }}
                          className={classes.searchBtn}
                          disabled={disableCoupon}
                          onClick={() => verifyCoupon()}
                        >
                          <img src={require('images/ic_send.svg')} alt="" />
                        </AphButton>
                      )}
                  </div>
                </div>
                {errorMessage.length > 0 && (
                  <div className={classes.pinErrorMsg}>{errorMessage}</div>
                )}
                <div className={classes.sectionHeader}>Coupons For You</div>
                <ul>
                  {availableCoupons && availableCoupons.length > 0 ? (
                    availableCoupons.map(
                      (couponDetails, index) =>
                        couponDetails && (
                          <li key={index}>
                            <FormControlLabel
                              className={classes.radioLabel}
                              checked={couponDetails.coupon === selectCouponCode}
                              value={couponDetails.coupon}
                              control={<AphRadio color="primary" />}
                              label={
                                <span className={classes.couponCode}>
                                  {couponDetails.coupon}
                                  {couponDetails.message && <span>{couponDetails.message}</span>}
                                </span>
                              }
                              onChange={() => {
                                setErrorMessage('');
                                props.setValidityStatus(false);
                                setSelectCouponCode(couponDetails.coupon);
                              }}
                            />

                            {/* {couponDetails && couponDetails.message && (
                              <div className={classes.couponText}>{couponDetails.message}</div>
                            )} */}
                          </li>
                        )
                    )
                  ) : isLoading ? (
                    <CircularProgress className={classes.loader} />
                  ) : (
                        <div className={classes.noCoupons}>No available Coupons</div>
                      )}
                </ul>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.dialogActions}>
        <AphButton
          color="primary"
          fullWidth
          disabled={disableCoupon}
          classes={{
            disabled: classes.buttonDisabled,
          }}
          onClick={() => {
            verifyCoupon();
          }}
        >
          {muationLoading ? <CircularProgress size={22} color="secondary" /> : 'Apply Coupon'}
        </AphButton>
      </div>
    </div>
  );
};
