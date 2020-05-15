import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphDialog, AphDialogClose } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 10,
      padding: '16px 10px 16px 16px',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      marginBottom: 20,
    },
    topGroup: {
      display: 'flex',
    },
    icon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
        marginBottom: -5,
      },
    },
    rightGroup: {
      width: 'calc(100% - 34px)',
    },    
    applyCoupon: {
      display: 'flex',
      alignItems: 'center',
    },
    appliedCoupon: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 600,
      '& $linkText': {
        '& span': {
          color: '#00b38e',
          textTransform: 'uppercase',
        },
      },
    },
    couponText: {
      color: '#01475b',
      fontSize: 12,
      lineHeight: '18px',
    },
    discountTotal: {
      color: '#0087ba',
      borderRadius: 3,
      border: 'solid 1px #0087ba',
      backgroundColor: 'rgba(0, 135, 186, 0.07)',
      padding: '4px 10px',
      fontSize: 16,
      marginTop: 16,
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    dialogBody: {
      padding: 20,
      fontSize: 14,
      lineHeight: '22px',
      color: '#0087ba',
      fontWeight: 500,
      '& h3': {
        fontSize: 16,
        fontWeight: 500,
        margin: 0,
        color: '#02475b',
      },
      '& p:last-child': {
        marginBottom: 0,
      },
    },
  };
});

export const CouponCodeConsult: React.FC = () => {
  const classes = useStyles({});
  const [isTermsDialogOpen, setIsTermsDialogOpen] = React.useState<boolean>(false);

  return (
    <>
    <div
      className={`${classes.root}`}
      onClick={() => setIsTermsDialogOpen(true)}
    >
      <div className={classes.topGroup}>
        <span className={classes.icon}>
          <img src={require('images/ic_coupon.svg')} alt="Coupon Icon" />
        </span>
        <div className={classes.rightGroup}>
          <div className={classes.applyCoupon}>
            <span className={classes.linkText}>Apply Coupon</span>
            <span className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} alt="" />
            </span>
          </div>
          <div className={classes.appliedCoupon}>
            <span className={classes.linkText}><span>APOLLO10</span> applied</span>
            <span className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} alt="" />
            </span>
          </div>
          <div className={classes.couponText}>(Applicable on pharma items only)</div>
        </div>
      </div>
      <div className={classes.discountTotal}>Savings of Rs. 50 on the bill</div>
    </div>
    <AphDialog open={isTermsDialogOpen} maxWidth="sm">
      <AphDialogClose onClick={() => setIsTermsDialogOpen(false)} title={'Close'} />
      <div className={classes.dialogBody}>
        <h3>Terms & Conditions</h3>
        <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque</p>
        <p>nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est,</p>
        <p>omnis dolor repellendus</p>
        <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque</p>
        <p>nihil impedit quo minus id quod</p>
        <p>maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>
      </div>
    </AphDialog>
    </>
  );
};
