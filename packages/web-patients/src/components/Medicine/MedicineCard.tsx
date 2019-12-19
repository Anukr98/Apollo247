import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import axios from 'axios';
import { spawn } from 'child_process';

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
export interface products {
  description: string;
  id: number;
  image: string | null;
  is_in_stock: boolean;
  is_prescription_required: '0' | '1'; //1 for required
  name: string;
  price: number;
  special_price: number | string;
  sku: string;
  small_image?: string | null;
  status: number;
  thumbnail: string | null;
  type_id: string;
  mou: string;
}
type MedicineInformationProps = {
  data: products[];
};
export const MedicineCard: React.FC<MedicineInformationProps> = (props) => {
  const classes = useStyles();
  const apiDetails = {
    url: process.env.PRODUCTS_BY_CATEGORY,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  return (
    <Grid container spacing={2}>
      {props.data &&
        props.data.length > 0 &&
        props.data.map((products: products) => (
          <Grid item xs={6} sm={6} md={4} lg={4}>
            <div className={classes.root}>
              <div className={classes.bigAvatar}>
                <img src={`${apiDetails.imageUrl}${products.image}`} alt="" />
                {/* <img src={require('images/category/img_product.png')} alt="" /> */}
              </div>
              {products.name}
              <div className={classes.priceGroup}>
                Rs. {products.special_price ? products.special_price : products.price}{' '}
                {products.special_price && (
                  <span className={classes.regularPrice}>(Rs. {products.price})</span>
                )}
              </div>
              {products.is_in_stock ? (
                <AphButton className={classes.addToCartBtn}>Add To Cart</AphButton>
              ) : (
                <span>Out of stock</span>
              )}
            </div>
          </Grid>
        ))}
    </Grid>
  );
};
