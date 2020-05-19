import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { AphRadio, AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import _each from 'lodash';
import { useMutation } from 'react-apollo-hooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { CONSULT_COUPONS_LIST, VALIDATE_CONSULT_COUPON } from '../../graphql/consult';
import {
  getConsultCouponList,
  getConsultCouponList_getConsultCouponList_coupons,
} from 'graphql/types/getConsultCouponList';
import {
  ValidateConsultCoupon_validateConsultCoupon,
  ValidateConsultCoupon,
} from 'graphql/types/ValidateConsultCoupon';
// import { PharmaCouponInput, CouponCategoryApplicable } from 'graphql/types/globalTypes';
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
        marginTop: -2,
      },
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
      paddingTop: 20,
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
    validateCouponResult: ValidateConsultCoupon_validateConsultCoupon | null
  ) => void;
  setCouponCode: (couponCode: string) => void;
  couponCode: string;
  close: (isApplyCouponDialogOpen: boolean) => void;
  cartValue: number;
  doctorId: string;
  consultType: string;
  appointmentDateTime: string;
}

export const CouponCodeConsult: React.FC<ApplyCouponProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const [selectCouponCode, setSelectCouponCode] = useState<string>(props.couponCode);
  const [availableCoupons, setAvailableCoupons] = useState<
    (getConsultCouponList_getConsultCouponList_coupons | null)[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [muationLoading, setMuationLoading] = useState<boolean>(false);

  const getCouponMutation = useMutation<getConsultCouponList>(CONSULT_COUPONS_LIST, {
    fetchPolicy: 'no-cache',
  });

  const validateCoupon = useMutation<ValidateConsultCoupon>(VALIDATE_CONSULT_COUPON, {
    variables: {
      doctorId: props.doctorId,
      code: selectCouponCode,
      consultType: props.consultType,
      appointmentDateTimeInUTC: props.appointmentDateTime,
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
            data.getConsultCouponList &&
            data.getConsultCouponList.coupons &&
            data.getConsultCouponList.coupons.length > 0
          ) {
            setAvailableCoupons(data.getConsultCouponList.coupons);
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
          if (res && res.data && res.data.validateConsultCoupon) {
            const couponValidateResult = res.data.validateConsultCoupon;
            if (couponValidateResult.validityStatus) {
              props.setCouponCode(selectCouponCode);
              props.close(false);
              props.setValidateCouponResult(couponValidateResult);
              setMuationLoading(false);
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
  const disableCoupon =
    !selectCouponCode || selectCouponCode.length < 5 || selectCouponCode.length > 10;

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
                      inputProps={{
                        maxLength: 10,
                      }}
                      value={selectCouponCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-z0-9]/gi, '');
                        setSelectCouponCode(value);
                      }}
                      placeholder="Enter coupon code"
                      error={errorMessage.length > 0 && true}
                    />
                    <div className={classes.pinActions}>
                      {selectCouponCode.length > 0 ? (
                        <div className={classes.tickMark}>
                          <img src={require('images/ic_tickmark.svg')} alt="" />
                        </div>
                      ) : (
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
                              // disabled={props.cartValue < 200}
                            />
                            <div className={classes.couponText}>
                              Get 5% off on total bill by shopping for Rs. 500 or more
                            </div>
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
          onClick={() => {
            verifyCoupon();
          }}
          classes={{
            disabled: classes.buttonDisabled,
          }}
        >
          {muationLoading ? <CircularProgress size={22} color="secondary" /> : 'Apply Coupon'}
        </AphButton>
      </div>
    </div>
  );
};
