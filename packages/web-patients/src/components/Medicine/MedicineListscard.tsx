import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress } from '@material-ui/core';
import { AphButton, AphCustomDropdown } from '@aph/web-ui-components';
import { array } from 'prop-types';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';
import { MedicineCartItem } from 'components/MedicinesCartProvider';
import { gtmTracking } from '../../gtmTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      position: 'relative',
    },
    medicineStripDisabled: {
      backgroundColor: '#f7f8f5',
    },
    medicineStripWrap: {
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    medicineInformation: {
      paddingRight: 10,
      display: 'flex',
      alignItems: 'center',
    },
    cartRight: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        paddingTop: 5,
      },
    },
    medicineIcon: {
      paddingRight: 10,
      '& img': {
        maxWidth: 35,
        verticalAlign: 'middle',
      },
    },
    medicineName: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 5,
        paddingRight: 24,
        flexGrow: 1,
      },
    },
    tabInfo: {
      fontSize: 10,
      color: '#02475b',
      fontWeight: 500,
      paddingTop: 2,
      opacity: 0.6,
    },
    noStock: {
      fontSize: 10,
      color: '#890000',
      fontWeight: 500,
      paddingTop: 2,
    },
    medicinePrice: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingTop: 12,
      paddingBottom: 11,
      minWidth: 90,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
        borderRight: 'none',
        flexGrow: 1,
        textAlign: 'right',
        paddingRight: 12,
        borderTop: '1px solid rgba(2,71,91,0.2)',
      },
      '& span': {
        fontWeight: 500,
      },
    },
    addToCart: {
      paddingLeft: 20,
      paddingTop: 8,
      paddingBottom: 8,
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 15,
        top: 8,
      },
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    medicinePack: {
      fontSize: 13,
      fontWeight: 600,
      color: '#02475b',
      letterSpacing: 0.33,
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingTop: 4,
      paddingLeft: 8,
      paddingBottom: 4,
      minWidth: 120,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down('xs')]: {
        borderLeft: 'none',
        flexGrow: 1,
        textAlign: 'left',
        borderTop: '1px solid rgba(2,71,91,0.2)',
        justifyContent: 'left',
      },
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'uppercase',
      paddingTop: 7,
      paddingLeft: 4,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
      minWidth: 30,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
    noData: {
      [theme.breakpoints.down('xs')]: {
        marginTop: 25,
      },
    },
  };
});

export interface MedicineListscardProps {
  medicineList: MedicineProduct[] | null;
  isLoading: boolean;
}

export const MedicineListscard: React.FC<MedicineListscardProps> = (props) => {
  const classes = useStyles({});
  const { addCartItem, removeCartItem, updateCartItemQty, cartItems } = useShoppingCart();
  const options = Array.from(Array(20), (_, x) => x + 1);

  const [selectedPackedQty] = React.useState(1);

  const apiDetails = {
    url: process.env.PHARMACY_MED_SEARCH_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  const itemIndexInCart = (item: MedicineProduct) => {
    return cartItems.findIndex((cartItem) => cartItem.id == item.id);
  };

  return (
    <div className={classes.root}>
      <div className={classes.root}>
        {props.medicineList && props.medicineList.length > 0 ? (
          props.medicineList.map((medicine: MedicineProduct, idx: number) => (
            <div
              key={medicine.id}
              className={`${classes.medicineStrip} ${
                medicine.is_in_stock ? '' : classes.medicineStripDisabled
              }`}
            >
              <div className={classes.medicineStripWrap}>
                <Link to={clientRoutes.medicineDetails(medicine.sku)}>
                  <div className={classes.medicineInformation}>
                    <div className={classes.medicineIcon}>
                      <img src={`${apiDetails.imageUrl}${medicine.image}`} alt="" />
                    </div>
                    <div className={classes.medicineName}>
                      {medicine.name}
                      {medicine.is_in_stock ? (
                        <div className={classes.tabInfo}>Pack of {medicine.mou}</div>
                      ) : (
                        <div className={classes.noStock}>Out Of Stock</div>
                      )}
                    </div>
                  </div>
                </Link>
                {medicine.is_in_stock ? (
                  <div className={classes.cartRight}>
                    {itemIndexInCart(medicine) !== -1 ? (
                      <>
                        <div className={classes.medicinePack}>
                          <div>QTY :</div>
                          <AphCustomDropdown
                            classes={{ selectMenu: classes.selectMenuItem }}
                            value={cartItems[itemIndexInCart(medicine)].quantity || 1}
                            onChange={(e: React.ChangeEvent<{ value: any }>) => {
                              updateCartItemQty &&
                                updateCartItemQty({
                                  description: medicine.description,
                                  id: medicine.id,
                                  image: medicine.image,
                                  is_in_stock: medicine.is_in_stock,
                                  is_prescription_required: medicine.is_prescription_required,
                                  name: medicine.name,
                                  price: medicine.price,
                                  sku: medicine.sku,
                                  small_image: medicine.small_image,
                                  status: medicine.status,
                                  thumbnail: medicine.thumbnail,
                                  type_id: medicine.type_id,
                                  quantity: parseInt(e.target.value),
                                  special_price: medicine.special_price,
                                  mou: medicine.mou,
                                  isShippable: true,
                                });
                            }}
                          >
                            {options.map((option, index) => (
                              <MenuItem
                                key={index}
                                classes={{
                                  root: classes.menuRoot,
                                  selected: classes.menuSelected,
                                }}
                                value={option}
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </AphCustomDropdown>
                        </div>
                        <div className={classes.medicinePrice}>
                          Rs. {medicine.special_price || medicine.price}
                        </div>
                        <div className={classes.addToCart}>
                          <AphButton>
                            <img
                              src={require('images/ic_cross_onorange_small.svg')}
                              alt="Remove Item"
                              title="Remove item from Cart"
                              onClick={() => {
                                /**Gtm code start  */
                                gtmTracking({
                                  category: 'Pharmacy',
                                  action: 'Remove From Cart',
                                  label: medicine.name,
                                  value: medicine.special_price || medicine.price,
                                });
                                /**Gtm code start  */
                                removeCartItem && removeCartItem(medicine.id);
                              }}
                            />
                          </AphButton>
                        </div>
                      </>
                    ) : (
                      <div className={classes.addToCart}>
                        <AphButton>
                          <img
                            src={require('images/ic_plus.svg')}
                            onClick={() => {
                              const cartItem: MedicineCartItem = {
                                description: medicine.description,
                                id: medicine.id,
                                image: medicine.image,
                                is_in_stock: medicine.is_in_stock,
                                is_prescription_required: medicine.is_prescription_required,
                                name: medicine.name,
                                price: medicine.price,
                                sku: medicine.sku,
                                special_price: medicine.special_price,
                                small_image: medicine.small_image,
                                status: medicine.status,
                                thumbnail: medicine.thumbnail,
                                type_id: medicine.type_id,
                                mou: medicine.mou,
                                quantity: selectedPackedQty,
                                isShippable: true,
                              };
                              /**Gtm code start  */
                              gtmTracking({
                                category: 'Pharmacy',
                                action: 'Add to Cart',
                                label: medicine.name,
                                value: medicine.special_price || medicine.price,
                              });
                              /**Gtm code End  */
                              addCartItem && addCartItem(cartItem);
                            }}
                            alt="Add Item"
                            title="Add item to Cart"
                          />
                        </AphButton>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        ) : props.isLoading ? (
          <CircularProgress />
        ) : (
          <div className={classes.noData}>No Data Found</div>
        )}
      </div>
    </div>
  );
};
