import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import { AphButton, AphCustomDropdown } from '@aph/web-ui-components';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { gtmTracking } from '../../gtmTracking';
import { validatePharmaCoupon_validatePharmaCoupon } from 'graphql/types/validatePharmaCoupon';

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
      justifyContent: 'space-between',
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
        borderTop: 'solid 0.5px rgba(2,71,91,0.2)',
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
        flexGrow: 1,
        paddingBottom: 5,
        paddingRight: 24,
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
    lineThrough: {
      fontWeight: 500,
      opacity: 0.6,
      paddingRight: 5,
      textDecoration: 'line-through',
    },
    medicinePrice: {
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 12,
      paddingBottom: 11,
      minWidth: 90,
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 2,
        paddingTop: 12,
        paddingBottom: 5,
        marginLeft: 'auto',
        borderRight: 'none',
        flexGrow: 1,
        paddingRight: 2,
        minHeight: 45,
        minWidth: 75,
      },
      '& span': {
        fontWeight: 500,
      },
    },
    addToCart: {
      paddingLeft: 10,
      paddingTop: 8,
      paddingBottom: 8,
      display: 'flex',
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
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 4,
      paddingBottom: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 5,
        paddingRight: 0,
        borderLeft: 'none',
        flexGrow: 1,
        textAlign: 'left',
        justifyContent: 'left',
        minHeight: 45,
      },
      [theme.breakpoints.up('xs')]: {
        minWidth: 110,
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
    noService: {
      letterSpacing: '0.03px',
      color: '#890000',
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
    mrpPrice: {
      paddingTop: 5,
      paddingBottom: 5,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      },
    },
    mrpText: {
      fontSize: 10,
    },
  };
});

type MedicineListingCardProps = {
  validateCouponResult: validatePharmaCoupon_validatePharmaCoupon | null;
};

export const MedicineListingCard: React.FC<MedicineListingCardProps> = (props) => {
  const classes = useStyles({});
  const { cartItems, removeCartItem, updateCartItemQty } = useShoppingCart();
  const options = Array.from(Array(20), (_, x) => x + 1);
  const { validateCouponResult } = props;

  return (
    <div className={classes.root}>
      {/** medice card normal state */}
      {cartItems &&
        cartItems.map((item, idx) => (
          <div
            key={item.id}
            className={`${classes.medicineStrip} ${
              item.is_in_stock ? '' : classes.medicineStripDisabled
            }`}
          >
            <div className={classes.medicineStripWrap}>
              <Link to={clientRoutes.medicineDetails(item.sku)}>
                <div className={classes.medicineInformation}>
                  <div className={classes.medicineIcon}>
                    <img
                      src={
                        item.is_prescription_required === '1'
                          ? require('images/ic_tablets_rx.svg')
                          : `${process.env.PHARMACY_MED_IMAGES_BASE_URL}${item.image}`
                      }
                      alt=""
                    />
                  </div>
                  <div className={classes.medicineName}>
                    {item.name}
                    <div className={classes.tabInfo}>
                      {item.is_in_stock && item.isShippable ? (
                        `Pack Of ${item.mou}`
                      ) : !item.is_in_stock ? (
                        'Out Of Stock'
                      ) : (
                        <span className={classes.noService}>Not serviceable in your area.</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              {item.is_in_stock && item.isShippable ? (
                <div className={classes.cartRight}>
                  <div className={classes.medicinePack}>
                    <div>QTY :</div>
                    <AphCustomDropdown
                      classes={{
                        selectMenu: classes.selectMenuItem,
                      }}
                      value={item.quantity}
                      onChange={(e: React.ChangeEvent<{ value: any }>) => {
                        updateCartItemQty &&
                          updateCartItemQty({
                            description: item.description,
                            id: item.id,
                            image: item.image,
                            is_in_stock: item.is_in_stock,
                            is_prescription_required: item.is_prescription_required,
                            name: item.name,
                            price: item.price,
                            sku: item.sku,
                            small_image: item.small_image,
                            status: item.status,
                            thumbnail: item.thumbnail,
                            type_id: item.type_id,
                            quantity: parseInt(e.target.value),
                            special_price: item.special_price,
                            mou: item.mou,
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
                  {validateCouponResult &&
                  validateCouponResult.pharmaLineItemsWithDiscountedPrice ? (
                    <>
                      <div className={`${classes.medicinePrice} ${classes.mrpPrice}`}>
                        {validateCouponResult.pharmaLineItemsWithDiscountedPrice[idx]
                          .applicablePrice !==
                        validateCouponResult.pharmaLineItemsWithDiscountedPrice[idx].mrp ? (
                          <span className={classes.lineThrough}>
                            Rs. {validateCouponResult.pharmaLineItemsWithDiscountedPrice[idx].mrp}
                          </span>
                        ) : null}
                        <div className={classes.mrpText}>(MRP)</div>
                      </div>

                      <div className={classes.medicinePrice}>
                        Rs.{' '}
                        {
                          validateCouponResult.pharmaLineItemsWithDiscountedPrice[idx]
                            .applicablePrice
                        }
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`${classes.medicinePrice} ${classes.mrpPrice}`}>
                        {item.special_price ? (
                          <span className={classes.lineThrough}>Rs. {item.price}</span>
                        ) : null}
                        <div className={classes.mrpText}>(MRP)</div>
                      </div>

                      <div className={classes.medicinePrice}>
                        Rs. {item.special_price || item.price}
                      </div>
                    </>
                  )}
                </div>
              ) : null}
              <div className={classes.addToCart}>
                <AphButton
                  onClick={() => {
                    /**Gtm code start  */
                    gtmTracking({
                      category: 'Pharmacy',
                      action: 'Remove From Cart',
                      label: item.name,
                      value: item.special_price || item.price,
                    });
                    /**Gtm code End  */
                    removeCartItem && removeCartItem(item.id);
                  }}
                >
                  <img
                    src={require('images/ic_cross_onorange_small.svg')}
                    alt="Remove Item"
                    title="Remove item from Cart"
                  />
                </AphButton>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
