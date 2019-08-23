import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio, AphSlider } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingBottom: 5,
    },
    sectionHeader: {
      borderBottom: '0.5px solid rgba(1,71,91,0.4)',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 5,
      paddingTop: 20,
    },
    checkoutType: {
      padding: '10px 18px',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      marginTop: 20,
      '& ul': {
        padding: 0,
        margin: 0,
      },
      '& li': {
        listStyleType: 'none',
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
        paddingBottom: 10,
        '&:last-child': {
          paddingBottom: 0,
        },
      },
    },
    radioLabel: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      alignItems: 'center',
      '& span:last-child': {
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    apolloOne: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 15,
      '& img': {
        maxWidth: 50,
      },
    },
    creditesCount: {
      fontSize: '12px !important',
      fontWeight: 500,
      color: 'rgba(2,71,91,0.6) !important',
      letterSpacing: 0.04,
      borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      marginLeft: 10,
      paddingLeft: 10,
    },
    points: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
    },
    balanceSection: {
      borderTop: '0.5px solid rgba(2,71,92,0.3)',
      padding: '10px 20px 0 20px',
      marginLeft: -18,
      marginRight: -18,
    },
    balanceAmount: {
      borderRadius: 5,
      backgroundColor: theme.palette.common.white,
      padding: '10px 20px',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      display: 'flex',
      alignItems: 'center',
    },
    totalAmount: {
      fontWeight: 600,
      marginLeft: 'auto',
    },
    slider: {
      width: '100%',
    },
    paymentsDisabled: {
      opacity: 0.3,
    },
  };
});

const apolloPoints = [
  {
    value: 0,
    label: '0',
  },
  {
    value: 360,
    label: '360',
  },
];

function valuetext(value: number) {
  return `${value}`;
}

export const Checkout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        Would you like to use Apollo Health Credits for this payment?
      </div>
      <div className={classes.checkoutType}>
        <ul>
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="a"
              control={<AphCheckbox color="primary" />}
              checked
              label={
                <div className={classes.apolloOne}>
                  <span>
                    <img src={require('images/img_apolloone.png')} alt="" />
                  </span>
                  <span className={classes.creditesCount}>
                    Available Health Credits<div className={classes.points}>2000</div>
                  </span>
                </div>
              }
            />
            <div className={classes.slider}>
              <AphSlider
                defaultValue={20}
                getAriaValueText={valuetext}
                marks={apolloPoints}
                min={0}
                max={360}
                valueLabelDisplay="on"
              />
            </div>
            <div className={classes.balanceSection}>
              <div className={classes.balanceAmount}>
                <span>Balance amount to pay</span>
                <span className={classes.totalAmount}>Rs. 160</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className={classes.paymentsDisabled}>
        <div className={classes.sectionHeader}>Pick a payment mode</div>
        <div className={classes.checkoutType}>
          <ul>
            <li>
              <FormControlLabel
                className={classes.radioLabel}
                value="b"
                control={<AphRadio color="primary" />}
                label="Pay Using Paytm"
              />
            </li>
            <li>
              <FormControlLabel
                className={classes.radioLabel}
                value="b"
                control={<AphRadio color="primary" />}
                label="Cash On Delivery"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
