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
import { CouponCategoryApplicable } from 'graphql/types/globalTypes';
import { useShoppingCart } from 'components/MedicinesCartProvider';

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

interface ApplyCouponProps {
  setValidateCouponResult: (
    validateCouponResult: validatePharmaCoupon_validatePharmaCoupon | null
  ) => void;
  couponCode: string;
  close: (isApplyCouponDialogOpen: boolean) => void;
  cartValue: number;
}

export const ApplyCoupon: React.FC<ApplyCouponProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const { cartItems, setCouponCode } = useShoppingCart();
  const [selectCouponCode, setSelectCouponCode] = useState<string>(props.couponCode);
  const [availableCoupons, setAvailableCoupons] = useState<
    (getPharmaCouponList_getPharmaCouponList_coupons | null)[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [muationLoading, setMuationLoading] = useState<boolean>(false);

  const getCouponMutation = useMutation<getPharmaCouponList>(PHRAMA_COUPONS_LIST, {
    fetchPolicy: 'no-cache',
  });

  const getTypeOfProduct = (type: string | null) => {
    switch (type) {
      case 'Pharma':
        return CouponCategoryApplicable.PHARMA;
      case 'Fmcg':
        return CouponCategoryApplicable.FMCG;
    }
  };

  const validateCoupon = useMutation<validatePharmaCoupon>(VALIDATE_PHARMA_COUPONS, {
    variables: {
      pharmaCouponInput: {
        code: selectCouponCode,
        patientId: currentPatient.id,
        orderLineItems: cartItems.map((item) => {
          return {
            mrp: item.price,
            productName: item.name,
            productType: getTypeOfProduct(item.type_id),
            quantity: item.quantity,
            specialPrice: item.special_price ? item.special_price : item.price,
            itemId: item.id.toString(),
          };
        }),
      },
    },
    fetchPolicy: 'no-cache',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (availableCoupons.length === 0) {
      setIsLoading(true);
      getCouponMutation()
        .then(({ data }) => {
          if (
            data &&
            data.getPharmaCouponList &&
            data.getPharmaCouponList.coupons &&
            data.getPharmaCouponList.coupons.length > 0
          ) {
            setAvailableCoupons(data.getPharmaCouponList.coupons);
            setIsLoading(false);
          }
        })
        .catch((e) => {
          setIsLoading(false);
        });
    }
  }, [availableCoupons]);

  const verifyCoupon = () => {
    if (currentPatient && currentPatient.id) {
      setMuationLoading(true);
      validateCoupon()
        .then((res) => {
          if (res && res.data && res.data.validatePharmaCoupon) {
            const couponValidateResult = res.data.validatePharmaCoupon;
            if (couponValidateResult.validityStatus) {
              props.close(false);
              props.setValidateCouponResult(couponValidateResult);
              setMuationLoading(false);
              setCouponCode && setCouponCode(selectCouponCode);
            } else {
              setMuationLoading(false);
              setErrorMessage(couponValidateResult.reasonForInvalidStatus);
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                {availableCoupons.length > 0 && (
                  <div className={classes.pinSearch}>
                    <AphTextField
                      value={selectCouponCode}
                      onChange={(e) => setSelectCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      error={errorMessage.length > 0 && (true)}
                    />
                    <div className={classes.pinActions}>
                      {/* {selectCouponCode.length > 0 ? (
                        <div className={classes.tickMark}>
                          <img src={require('images/ic_tickmark.svg')} alt="" />
                        </div>
                      ) : (
                        <AphButton className={classes.searchBtn} onClick>
                          <img src={require('images/ic_send.svg')} alt="" />
                        </AphButton>
                      )} */}
                      {selectCouponCode.length > 0 && (
                        <AphButton className={classes.searchBtn} onClick={() => verifyCoupon()}>
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
                  {availableCoupons.length > 0 ? (
                    availableCoupons.map(
                      (couponDetails, index) =>
                        couponDetails && (
                          <li key={index}>
                            <FormControlLabel
                              className={classes.radioLabel}
                              checked={couponDetails.code === selectCouponCode}
                              value={couponDetails.code}
                              control={<AphRadio color="primary" />}
                              label={
                                <span className={classes.couponCode}>
                                  {couponDetails.code}
                                  {couponDetails.description && (
                                    <span>{couponDetails.description}</span>
                                  )}
                                </span>
                              }
                              onChange={() => {
                                setErrorMessage('');
                                setSelectCouponCode(couponDetails.code);
                              }}
                            />
                            <div className={classes.couponText}>Get 5% off on total bill by shopping for Rs. 500 or more</div>
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
          disabled={!selectCouponCode}
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
