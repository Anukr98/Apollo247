import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: 15,
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      textAlign: 'center',
    },
    bigAvatar: {
      width: 85,
      height: 85,
      textAlign: 'center',
      margin: 'auto',
      marginBottom: 15,
      marginTop: 5,
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
      },
    },
    priceGroup: {
      fontSize: 12,
      color: '#01475b',
      fontWeight: 500,
      textAlign: 'center',
      paddingTop: 5,
      opacity: 0.6,
    },
    regularPrice: {
      paddingLeft: 10,
      textDecoration: 'line-through',
    },
    addToCartBtn: {
      color: '#fc9916',
      fontWeight: 'bold',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minWidth: 'auto',
      textAlign: 'center',
      padding: 0,
      marginTop: 10,
    },
  };
});

export const MedicineCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} sm={6} md={4} lg={4}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/category/img_product.png')} alt="" />
          </div>
          Holland &amp; Barrett Rhodiola Stress Relief
          <div className={classes.priceGroup}>
            Rs. 999 <span className={classes.regularPrice}>(Rs. 1399)</span>
          </div>
          <AphButton className={classes.addToCartBtn}>
            Add To Cart
          </AphButton>
        </div>
      </Grid>
      <Grid item xs={6} sm={6} md={4} lg={4}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/category/img_product.png')} alt="" />
          </div>
          Holland &amp; Barrett Rhodiola Stress Relief
          <div className={classes.priceGroup}>
            Rs. 999 <span className={classes.regularPrice}>(Rs. 1399)</span>
          </div>
          <AphButton className={classes.addToCartBtn}>
            Add To Cart
          </AphButton>
        </div>
      </Grid>
      <Grid item xs={6} sm={6} md={4} lg={4}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/category/img_product.png')} alt="" />
          </div>
          Holland &amp; Barrett Rhodiola Stress Relief
          <div className={classes.priceGroup}>
            Rs. 999 <span className={classes.regularPrice}>(Rs. 1399)</span>
          </div>
          <AphButton className={classes.addToCartBtn}>
            Add To Cart
          </AphButton>
        </div>
      </Grid>
      <Grid item xs={6} sm={6} md={4} lg={4}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/category/img_product.png')} alt="" />
          </div>
          Holland &amp; Barrett Rhodiola Stress Relief
          <div className={classes.priceGroup}>
            Rs. 999 <span className={classes.regularPrice}>(Rs. 1399)</span>
          </div>
          <AphButton className={classes.addToCartBtn}>
            Add To Cart
          </AphButton>
        </div>
      </Grid>
      <Grid item xs={6} sm={6} md={4} lg={4}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/category/img_product.png')} alt="" />
          </div>
          Holland &amp; Barrett Rhodiola Stress Relief
          <div className={classes.priceGroup}>
            Rs. 999 <span className={classes.regularPrice}>(Rs. 1399)</span>
          </div>
          <AphButton className={classes.addToCartBtn}>
            Add To Cart
          </AphButton>
        </div>
      </Grid>
      <Grid item xs={6} sm={6} md={4} lg={4}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/category/img_product.png')} alt="" />
          </div>
          Holland &amp; Barrett Rhodiola Stress Relief
          <div className={classes.priceGroup}>
            Rs. 999 <span className={classes.regularPrice}>(Rs. 1399)</span>
          </div>
          <AphButton className={classes.addToCartBtn}>
            Add To Cart
          </AphButton>
        </div>
      </Grid>
    </Grid>
  );
};
