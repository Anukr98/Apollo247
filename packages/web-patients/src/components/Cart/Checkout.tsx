import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      paddingBottom: 5,
      marginTop: 14,
      marginBottom: 10,
    },
    sectionHeader: {
      borderBottom: '0.5px solid rgba(1,71,91,0.4)',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 5,
    },
    checkoutType: {
      paddingTop: 20,
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
        '&:first-child': {
          paddingBottom: 0,
          marginBottom: 20,
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
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 5,
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
  };
});

export const Checkout: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>How would you prefer to pay?</div>
      <div className={classes.checkoutType}>
        <ul>
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="a"
              control={<AphRadio color="primary" />}
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
          </li>
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="a"
              control={<AphRadio color="primary" />}
              checked
              label="Debit / Credit Card"
            />
          </li>
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="b"
              control={<AphRadio color="primary" />}
              label="Net Banking"
            />
          </li>
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="b"
              control={<AphRadio color="primary" />}
              label="Wallets"
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
  );
};
