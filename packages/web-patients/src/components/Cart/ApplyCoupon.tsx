import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { AphRadio, AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import _each from 'lodash';
import { useMutation } from 'react-apollo-hooks';
import { GET_COUPONS } from '../../graphql/profiles';
import { getCoupons, getCoupons_getCoupons_coupons } from '../../graphql/types/getCoupons';

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
      alignItems: 'start',
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
      paddingTop: 20,
      paddingBottom: 4,
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
  };
});

interface ApplyCouponProps {
  setCouponCode: (couponCode: string) => void;
  couponCode: string;
  close: (isApplyCouponDialogOpen: boolean) => void;
  cartValue: number;
}

export const ApplyCoupon: React.FC<ApplyCouponProps> = (props) => {
  const classes = useStyles({});

  // const [selectCouponCode, setSelectCouponCode] = useState<string>('');
  const [availableCoupons, setAvailableCoupons] = useState<
    (getCoupons_getCoupons_coupons | null)[]
  >([]);

  const getCouponMutation = useMutation<getCoupons>(GET_COUPONS, {
    fetchPolicy: 'no-cache',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (availableCoupons.length === 0) {
      setIsLoading(true);
      getCouponMutation()
        .then((res) => {
          if (
            res &&
            res.data &&
            res.data.getCoupons &&
            res.data.getCoupons.coupons &&
            res.data.getCoupons.coupons.length > 0
          ) {
            setAvailableCoupons(res.data.getCoupons.coupons);
            setIsLoading(false);
          }
        })
        .catch((e) => {
          setIsLoading(false);
        });
    }
  }, [availableCoupons]);

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <div className={classes.pinSearch}>
                  <AphTextField value={props.couponCode} placeholder="CouponCode" />
                  <div className={classes.pinActions}>
                    {props.couponCode.length > 0 ? (
                      <div className={classes.tickMark}>
                        <img src={require('images/ic_tickmark.svg')} alt="" />
                      </div>
                    ) : (
                      <AphButton className={classes.searchBtn}>
                        <img src={require('images/ic_send.svg')} alt="" />
                      </AphButton>
                    )}
                  </div>
                </div>
                {/* <div className={classes.pinErrorMsg}>Invalid Coupon Code</div> */}
                <div className={classes.sectionHeader}>Coupons For You</div>
                <ul>
                  {availableCoupons.length > 0 ? (
                    availableCoupons.map(
                      (couponDetails, index) =>
                        couponDetails && (
                          <li key={index}>
                            <FormControlLabel
                              className={classes.radioLabel}
                              checked={couponDetails.code === props.couponCode}
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
                                // setSelectCouponCode(couponDetails.code);
                                props.setCouponCode(couponDetails.code);
                              }}
                              disabled={props.cartValue < 200}
                            />
                          </li>
                        )
                    )
                  ) : isLoading ? (
                    <CircularProgress className={classes.loader} />
                  ) : (
                    'No available Coupons'
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
          onClick={() => {
            props.close(false);
          }}
        >
          Done
        </AphButton>
      </div>
    </div>
  );
};
