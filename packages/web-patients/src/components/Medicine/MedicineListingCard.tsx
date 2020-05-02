import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import { AphButton, AphCustomDropdown } from '@aph/web-ui-components';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { gtmTracking } from '../../gtmTracking'

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
    medicinePrice: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingLeft: 20,
      paddingRight: 20,
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
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 4,
      paddingBottom: 4,
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
      [theme.breakpoints.up('xs')]: {
        minWidth: 130,
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
  };
});

export const MedicineListingCard: React.FC = (props) => {
  const classes = useStyles({});
  const { cartItems, removeCartItem, updateCartItemQty } = useShoppingCart();
  const options = Array.from(Array(20), (_, x) => x + 1);

  return (
    <div className={classes.root}>
      {/** medice card normal state */}
      {cartItems &&
        cartItems.map((item) => (
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
                      {item.is_in_stock ? `Pack Of ${item.mou}` : 'Out Of Stock'}
                    </div>
                  </div>
                </div>
              </Link>
              {item.is_in_stock ? (
                <div className={classes.cartRight}>
                  <div className={classes.medicinePack}>
                    <div>QTY :</div>
                    <AphCustomDropdown
                      classes={{
                        selectMenu: classes.selectMenuItem,
                      }}
                      value={item.quantity}
                      onChange={(e: React.ChangeEvent<{ value: any }>) =>
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
                        })
                      }
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
                    Rs. {item.special_price || item.price}
                  </div>
                  <div className={classes.addToCart}>
                    <AphButton
                      onClick={() => {
                        /**Gtm code start  */
                        gtmTracking({ category: 'Pharmacy', action: 'Remove From Cart', label: item.name, value: item.price })
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
              ) : null}
            </div>
          </div>
        ))}
    </div>
  );
};
