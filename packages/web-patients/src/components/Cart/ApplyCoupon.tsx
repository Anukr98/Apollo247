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
  const { cartItems, setCouponCode, cartTotal, addCartItems } = useShoppingCart();
  const [selectCouponCode, setSelectCouponCode] = useState<string>(props.couponCode);
  const [availableCoupons, setAvailableCoupons] = useState<(consult_coupon | null)[]>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [muationLoading, setMuationLoading] = useState<boolean>(false);

  const verifyCoupon = () => {
    const data = {
      mobile: localStorage.getItem('userMobileNo'),
      billAmount: cartTotal.toFixed(2),
      coupon: selectCouponCode,
      pinCode: localStorage.getItem('pharmaPincode'),
      products: cartItems.map((item) => {
        const { sku, quantity, special_price, price, type_id } = item;
        return {
          sku,
          mrp: item.price,
          quantity,
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
        .then((resp: any) => {
          addDiscountedProducts(resp.response);
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
  };

  const addDiscountedProducts = (response: any) => {
    const promises: Promise<any>[] = [];
    if (response.products && Array.isArray(response.products) && response.products.length) {
      try {
        const cartSkuSet = new Set(
          cartItems && cartItems.length ? cartItems.map((cartItem) => cartItem.sku) : []
        );
        response.products.forEach((data: any) => {
          if (!cartSkuSet.has(data.sku))
            promises.push(
              axios.post(
                apiDetails.url || '',
                { params: data.sku },
                {
                  headers: {
                    Authorization: apiDetails.authToken,
                  },
                }
              )
            );
        });
        const allData: MedicineCartItem[] = [];
        Promise.all(promises)
          .then((data: any) => {
            data.forEach((e: any) => {
              const cartItem: MedicineCartItem = {
                MaxOrderQty: e.data.productdp[0].MaxOrderQty,
                url_key: e.data.productdp[0].url_key,
                description: e.data.productdp[0].description,
                id: e.data.productdp[0].id,
                image: e.data.productdp[0].image,
                is_in_stock: e.data.productdp[0].is_in_stock,
                is_prescription_required: e.data.productdp[0].is_prescription_required,
                name: e.data.productdp[0].name,
                price: 0,
                sku: e.data.productdp[0].sku,
                special_price: e.data.productdp[0].special_price,
                small_image: e.data.productdp[0].small_image,
                status: e.data.productdp[0].status,
                thumbnail: e.data.productdp[0].thumbnail,
                type_id: e.data.productdp[0].type_id,
                mou: e.data.productdp[0].mou,
                quantity: 1,
                isShippable: true,
              };
              allData.push(cartItem);
            });
          })
          .then(() => {
            addCartItems(allData);
          });
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
                {availableCoupons && availableCoupons.length > 0 && (
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
                )}
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
