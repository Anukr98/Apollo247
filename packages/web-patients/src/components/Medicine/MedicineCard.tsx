import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';

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
      height: '100%',
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
    noData: {
      marginTop: 10,
      [theme.breakpoints.down('xs')]: {
        marginTop: 25,
        paddingLeft: 10,
      },
    },
    productName: {
      minHeight: 45,
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
  medicineList: MedicineProduct[] | null;
  isLoading?: boolean;
};
export const MedicineCard: React.FC<MedicineInformationProps> = (props) => {
  const classes = useStyles({});
  const apiDetails = {
    url: process.env.PRODUCTS_BY_CATEGORY,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };
  const { addCartItem, cartItems, updateCartItem, removeCartItem } = useShoppingCart();

  const itemIndexInCart = (item: MedicineProduct) => {
    const index = cartItems.findIndex((cartItem) => cartItem.id == item.id);
    return index;
  };

  return (
    <Grid container spacing={2}>
      {props.medicineList && props.medicineList.length > 0 ? (
        props.medicineList.map((product: MedicineProduct) => (
          <Grid key={product.id} item xs={6} sm={6} md={4} lg={4}>
            <div className={classes.root}>
              <Link to={clientRoutes.medicineDetails(product.sku)}>
                <div className={classes.bigAvatar}>
                  <img src={`${apiDetails.imageUrl}${product.image}`} alt="" />
                </div>
                <div className={classes.productName}>{product.name}</div>
              </Link>
              <div className={classes.priceGroup}>
                Rs. {product.special_price ? product.special_price : product.price}{' '}
                {product.special_price && (
                  <span className={classes.regularPrice}>(Rs. {product.price})</span>
                )}
              </div>
              {product.is_in_stock ? (
                itemIndexInCart(product) === -1 ? (
                  <AphButton
                    className={classes.addToCartBtn}
                    onClick={() => {
                      const cartItem: MedicineCartItem = {
                        description: product.description,
                        id: product.id,
                        image: product.image,
                        is_in_stock: product.is_in_stock,
                        is_prescription_required: product.is_prescription_required,
                        name: product.name,
                        price: product.price,
                        sku: product.sku,
                        special_price: product.special_price,
                        small_image: product.small_image,
                        status: product.status,
                        thumbnail: product.thumbnail,
                        type_id: product.type_id,
                        mou: product.mou,
                        quantity: 1,
                      };
                      /**Gtm code start  */
                      window.gep('Pharmacy', 'Add to Cart', product.name, product.price)
                      /**Gtm code End  */
                      const index = cartItems.findIndex((item) => item.id === cartItem.id);
                      if (index >= 0) {
                        updateCartItem && updateCartItem(cartItem);
                      } else {
                        addCartItem && addCartItem(cartItem);
                      }
                    }}
                  >
                    Add To Cart
                  </AphButton>
                ) : (
                  <AphButton
                    className={classes.addToCartBtn}
                    onClick={() => {
                      /**Gtm code start  */
                      window.gep('Pharmacy', 'Remove From Cart', product.name, product.price)
                      /**Gtm code End  */
                      removeCartItem && removeCartItem(product.id);
                    }}
                  >
                    Remove
                  </AphButton>
                )
              ) : (
                <span>Out of stock</span>
              )}
            </div>
          </Grid>
        ))
      ) : props.isLoading ? (
        <CircularProgress />
      ) : (
        <div className={classes.noData}>No Data Found</div>
      )}
    </Grid>
  );
};
