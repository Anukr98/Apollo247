import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio, AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import _each from 'lodash';

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
      paddingBottom: 20,
    },
    sectionHeader: {
      marginBottom: 20,
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
  };
});

interface ApplyCouponProps {
  setCouponCode: (couponCode: string) => void;
  close: (isApplyCouponDialogOpen: boolean) => void;
  cartValue: number;
}

export const ApplyCoupon: React.FC<ApplyCouponProps> = (props) => {
  const classes = useStyles();

  const [selectCouponCode, setSelectCouponCode] = React.useState<string>('');
  const availableCoupons = [
    { couponCode: 'APMED10', couponDesc: 'Get 10% off on total bill on the order above Rs.199' },
  ];

  // set coupon id at cart.
  props.setCouponCode(selectCouponCode);

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <div className={classes.pinSearch}>
                  <AphTextField value="APMED10" placeholder="APMED10" />
                </div>
                <div className={classes.sectionHeader}>Coupons For You</div>
                <ul>
                  {availableCoupons.map((couponDetails, index) => {
                    return (
                      <li key={index}>
                        <FormControlLabel
                          className={classes.radioLabel}
                          checked={couponDetails.couponCode === selectCouponCode}
                          value={selectCouponCode}
                          control={<AphRadio color="primary" />}
                          label={
                            <span className={classes.couponCode}>
                              {couponDetails.couponCode}
                              <span>{couponDetails.couponDesc}</span>
                            </span>
                          }
                          onChange={() => {
                            setSelectCouponCode(couponDetails.couponCode);
                          }}
                          disabled={props.cartValue < 200}
                        />
                      </li>
                    );
                  })}
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

{
  /* <li>
                    <FormControlLabel
                      className={classes.radioLabel}
                      checked={couponId === defaultCouponId}
                      value={defaultCouponId}
                      control={<AphRadio color="primary" />}
                      label={
                        <span className={classes.couponCode}>
                          {defaultCouponId}
                          <span>Get 10% off on total bill on the order above Rs.199</span>
                        </span>
                      }
                      onChange={() => {
                        setCouponId(defaultCouponId);
                      }}
                    />
                  </li> */
}
