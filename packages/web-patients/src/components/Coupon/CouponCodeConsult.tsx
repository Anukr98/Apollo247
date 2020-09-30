import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { AphRadio, AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
//import _each from 'lodash';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { gtmTracking } from '../../gtmTracking';
import fetchUtil from 'helpers/fetch';
import { useLocationDetails } from 'components/LocationProvider';

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
  setValidateCouponResult: (validateCouponResult: {}) => void;
  setCouponCode: (couponCode: string) => void;
  couponCode: string;
  close: (isApplyCouponDialogOpen: boolean) => void;
  cartValue: number;
  doctorId: string;
  consultType: string;
  appointmentDateTime: string;
  validityStatus: boolean;
  setValidityStatus: (validityStatus: boolean) => void;
  speciality?: string;
  specialityId?: string;
  hospitalId?: string;
}

export const CouponCodeConsult: React.FC<ApplyCouponProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const { currentPincode } = useLocationDetails();
  const [selectCouponCode, setSelectCouponCode] = useState<string>(props.couponCode);
  const [availableCoupons, setAvailableCoupons] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [muationLoading, setMuationLoading] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  var packageId: string;
  const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions'));
  if (userSubscriptions && userSubscriptions[0] && userSubscriptions[0].status == 'ACTIVE') {
    packageId = `${userSubscriptions[0].group_plan.group.name}:${userSubscriptions[0].group_plan.plan_id}`;
  }

  useEffect(() => {
    setIsLoading(true);
    const fetchCouponUrl = `${process.env.GET_CONSULT_COUPONS}?mobile=${
      currentPatient.mobileNumber
    }&email=${currentPatient.emailAddress}&packageId=${userSubscriptions ? packageId : ''}`;
    fetchUtil(fetchCouponUrl, 'GET', {}, '', false)
      .then((data: any) => {
        if (data && data.response && data.response.length > 0) {
          setAvailableCoupons(data.response);
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const validateCouponBody = {
    mobile: currentPatient && currentPatient.mobileNumber,
    billAmount: Number(props.cartValue),
    email: currentPatient && currentPatient.emailAddress,
    packageId: packageId,
    coupon: selectCouponCode,
    pinCode: currentPincode ? currentPincode : localStorage.getItem('currentPincode') || '',
    consultations: [
      {
        hospitalId: props.hospitalId,
        doctorId: props.doctorId,
        specialityId: props.specialityId,
        consultationTime: new Date(props.appointmentDateTime).getTime(),
        consultationType: props.consultType === 'PHYSICAL' ? 0 : 1,
        cost: Number(props.cartValue),
        rescheduling: false,
      },
    ],
  };

  const verifyCoupon = () => {
    if (currentPatient && currentPatient.id) {
      setMuationLoading(true);
      const fetchCouponUrl = `${process.env.VALIDATE_CONSULT_COUPONS}?mobile=${
        currentPatient.mobileNumber
      }&email=${currentPatient.emailAddress}&packageId=${userSubscriptions ? packageId : ''}`;
      fetchUtil(fetchCouponUrl, 'POST', validateCouponBody, '', false)
        .then((data: any) => {
          if (data && data.response) {
            const couponValidateResult = data.response;
            props.setValidityStatus(couponValidateResult.valid);
            if (couponValidateResult.valid) {
              props.setCouponCode(selectCouponCode);
              props.close(false);
              props.setValidateCouponResult(couponValidateResult);
              /*GTM TRACKING START */
              gtmTracking({
                category: 'Consultations',
                action: props.speciality,
                label: `Coupon Applied - ${selectCouponCode}`,
                value:
                  couponValidateResult && couponValidateResult.valid
                    ? Number(parseFloat(couponValidateResult.discount).toFixed(2))
                    : null,
              });
              /*GTM TRACKING END */
            } else {
              setErrorMessage(couponValidateResult.reason);
            }
          } else if (data && data.errorMsg && data.errorMsg.length > 0) {
            setErrorMessage(data.errorMsg);
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => setMuationLoading(false));
    }
  };
  const disableCoupon =
    !selectCouponCode ||
    selectCouponCode.length < 3 ||
    selectCouponCode.length > 20 ||
    errorMessage.length > 0;

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                {
                  <div className={classes.pinSearch}>
                    <AphTextField
                      inputProps={{
                        maxLength: 20,
                      }}
                      value={selectCouponCode}
                      onChange={(e: any) => {
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
                }
                {errorMessage.length > 0 && (
                  <div className={classes.pinErrorMsg}>{errorMessage}</div>
                )}

                <div className={classes.sectionHeader}>Coupons For You</div>
                <ul>
                  {availableCoupons && availableCoupons.length > 0 ? (
                    availableCoupons.map(
                      (couponDetails: any, index: number) =>
                        couponDetails && (
                          <li key={index}>
                            <FormControlLabel
                              className={classes.radioLabel}
                              checked={couponDetails.coupon === selectCouponCode}
                              value={couponDetails.coupon}
                              control={<AphRadio color="primary" />}
                              label={
                                <span className={classes.couponCode}>{couponDetails.coupon}</span>
                              }
                              onChange={() => {
                                setErrorMessage('');
                                props.setValidityStatus(false);
                                setSelectCouponCode(couponDetails.coupon);
                              }}
                              // disabled={props.cartValue < 200}
                            />
                            {couponDetails && couponDetails.message && (
                              <div className={classes.couponText}>{couponDetails.message}</div>
                            )}
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
