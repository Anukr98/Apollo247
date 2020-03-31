import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import { useMutation } from 'react-apollo-hooks';
import { VALIDATE_CONSULT_COUPON } from 'graphql/consult';
import { AppointmentType } from 'graphql/types/globalTypes';
import {
  ValidateConsultCoupon,
  ValidateConsultCouponVariables,
} from 'graphql/types/ValidateConsultCoupon';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    couponButton: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      padding: 16,
      borderRadius: 10,
      cursor: 'pointer',
    },
    couponForm: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      padding: 16,
      paddingTop: 5,
      borderRadius: 10,
      marginTop: 10,
      position: 'relative',
    },
    priceBox: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      padding: 16,
      marginTop: 10,
      borderRadius: 10,
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
    },
    price: {
      marginLeft: 'auto',
    },
    totalPriceRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      marginTop: 10,
    },
    totalPrice: {
      marginLeft: 'auto',
      fontWeight: 'bold',
    },
    button: {
      boxShadow: 'none',
      minWidth: 'auto',
      position: 'absolute',
      right: 16,
      top: 3,
      fontSize: 16,
      fontWeight: 500,
      padding: 5,
      textTransform: 'none',
    },
    removeBtn: {
      boxShadow: 'none',
      minWidth: 'auto',
      fontSize: 16,
      fontWeight: 500,
      padding: 5,
      textTransform: 'none',
      color: '#00b38e',
      marginLeft: 'auto',
    },
    couponImg: {
      paddingRight: 16,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    tickMark: {
      marginLeft: 'auto',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    successMsg: {
      fontSize: 16,
      color: '#00b38e',
      paddingTop: 5,
    },
    errorMsg: {
      fontSize: 16,
      color: '#890000',
      paddingTop: 5,
    },
  };
});
interface CouponProps {
  doctorId: string;
  appointmentDateTime: string;
  appointmentType: AppointmentType;
  setRevisedAmount: any;
  revisedAmount: string;
  subtotal: string;
  setCouponCode: any;
  disableSubmit: boolean;
}

export const CouponCode: React.FC<CouponProps> = (props) => {
  const classes = useStyles();
  const [openCouponField, setOpenCouponField] = useState(false);
  const [couponText, setCouponText] = useState('');
  const [couponCodeApplied, setCouponCodeApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const couponMutation = useMutation<ValidateConsultCoupon, ValidateConsultCouponVariables>(
    VALIDATE_CONSULT_COUPON
  );

  useEffect(() => {
    if (props.disableSubmit) {
      setCouponCodeApplied(false);
      setErrorMessage('');
      setIsError(false);
      setCouponText('');
      setOpenCouponField(false);
    }
  }, [props.disableSubmit]);

  return (
    <div className={classes.root}>
      {!couponCodeApplied && (
        <div className={classes.couponButton} onClick={() => setOpenCouponField(!openCouponField)}>
          <span className={classes.couponImg}>
            <img src={require('images/ic_coupon.svg')} alt="" />
          </span>
          <span>Apply Coupon</span>

          <div className={classes.tickMark}>
            <img src={require('images/ic_arrow_right.svg')} alt="" />
          </div>
        </div>
      )}

      {couponCodeApplied && (
        <div className={classes.couponButton}>
          <span className={classes.couponImg}>
            <img src={require('images/ic_coupon.svg')} alt="" />
          </span>
          <span> Coupon Applied</span>
          <AphButton
            className={classes.removeBtn}
            onClick={() => {
              props.setRevisedAmount(props.subtotal);
              setCouponText('');
              setCouponCodeApplied(false);
              setOpenCouponField(false);
            }}
          >
            Remove
          </AphButton>
        </div>
      )}
      {openCouponField && (
        <div className={classes.couponForm}>
          <AphTextField
            inputProps={{
              maxLength: 15,
            }}
            placeholder="Enter coupon code"
            onChange={(event) => {
              setErrorMessage('');
              setIsError(false);
              setCouponCodeApplied(false);
              setCouponText(event.target.value);
            }}
            value={couponText}
          />
          {!couponCodeApplied && (
            <AphButton
              className={classes.button}
              disabled={couponText.length < 2 || props.disableSubmit}
              onClick={() => {
                const variables = {
                  doctorId: props.doctorId,
                  code: couponText,
                  consultType: props.appointmentType,
                  appointmentDateTimeInUTC: props.appointmentDateTime,
                };
                couponMutation({
                  variables: {
                    doctorId: props.doctorId,
                    code: couponText,
                    consultType: props.appointmentType,
                    appointmentDateTimeInUTC: props.appointmentDateTime,
                  },
                  fetchPolicy: 'no-cache',
                })
                  .then((res) => {
                    if (res && res.data && res.data.validateConsultCoupon) {
                      setCouponCodeApplied(res.data.validateConsultCoupon.validityStatus);
                      setErrorMessage(res.data.validateConsultCoupon.reasonForInvalidStatus);
                      setIsError(!res.data.validateConsultCoupon.validityStatus);
                      if (res.data.validateConsultCoupon.validityStatus) {
                        props.setCouponCode(couponText);
                        setOpenCouponField(false);
                      }
                      props.setRevisedAmount(res.data.validateConsultCoupon.revisedAmount);
                    }
                  })
                  .catch((error) => alert(error));
              }}
            >
              Apply
            </AphButton>
          )}
          {/* {couponCodeApplied && (
            <AphButton
              className={classes.button}
              onClick={() => {
                props.setRevisedAmount(props.subtotal);
                setCouponText('');
                setCouponCodeApplied(false);
                setOpenCouponField(false);
              }}
            >
              Remove
            </AphButton>
          )} */}
          {couponCodeApplied && <div className={classes.successMsg}>Success.</div>}
          {isError && <div className={classes.errorMsg}>{errorMessage}</div>}
        </div>
      )}
      {couponCodeApplied && (
        <div className={classes.priceBox}>
          <div className={classes.priceRow}>
            <span>Subtotal</span>
            <span className={classes.price}>Rs. {props.subtotal}</span>
          </div>
          <div className={classes.priceRow}>
            <span>Coupon ({couponText})</span>
            <span className={classes.price}>
              -Rs. {Number(props.subtotal) - Number(props.revisedAmount)}
            </span>
          </div>
          <div className={classes.totalPriceRow}>
            <span>To Pay</span>
            <span className={classes.totalPrice}>Rs.{props.revisedAmount}</span>
          </div>
        </div>
      )}
    </div>
  );
};
