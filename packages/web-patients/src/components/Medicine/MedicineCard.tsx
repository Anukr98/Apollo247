import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, Grid, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';
import { gtmTracking } from '../../gtmTracking';
import { notifyMeTracking } from '../../webEngageTracking';
import { NotifyMeNotification } from './NotifyMeNotification';
import { useParams } from 'hooks/routerHooks';
import { MEDICINE_QUANTITY } from 'helpers/commonHelpers';

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
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minWidth: 'auto',
      textAlign: 'center',
      padding: 0,
      marginTop: 10,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
      },
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
    addQty: {
      paddingTop: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& button': {
        backgroundColor: 'transparent',
        color: '#fc9916',
        boxShadow: 'none',
        width: 18,
        height: 18,
        lineHeight: '14px',
        padding: 0,
        borderRadius: 0,
        minWidth: 'auto',
        border: '1px solid #fc9916',
      },
    },
    totalQty: {
      fontSize: 14,
      color: '#fc9916',
      paddingLeft: 16,
      paddingRight: 16,
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    loader: {
      textAlign: 'center',
      padding: 20,
      margin: 'auto',
    }
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
interface Params {
  searchMedicineType: string;
  searchText: string;
}
export const MedicineCard: React.FC<MedicineInformationProps> = (props) => {
  const classes = useStyles({});
  const apiDetails = {
    url: process.env.PRODUCTS_BY_CATEGORY,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };
  const params = useParams<Params>();
  const paramSearchText = params.searchText;
  const { addCartItem, cartItems, updateCartItem, removeCartItem } = useShoppingCart();
  const mascotRef = useRef(null);
  const [iśNotifyMeDialogOpen, setIsNotifyMeDialogOpen] = useState<boolean>(false);

  const isInCart = (medicine: MedicineProduct) => {
    const index = cartItems.findIndex((item) => item.id === medicine.id);
    return index > -1;
  };

  const getQuantity = (medicine: MedicineProduct) => {
    return cartItems.find((item) => item.id === medicine.id).quantity;
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
              {!isInCart(product) && (
                <AphButton
                  className={classes.addToCartBtn}
                  onClick={() => {
                    if (product.is_in_stock) {
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
                        isShippable: true,
                      };
                      /**Gtm code start  */
                      gtmTracking({
                        category: 'Pharmacy',
                        action: 'Add to Cart',
                        label: product.name,
                        value: product.special_price || product.price,
                      });
                      /**Gtm code End  */
                      const index = cartItems.findIndex((item) => item.id === cartItem.id);
                      if (index >= 0) {
                        updateCartItem && updateCartItem(cartItem);
                      } else {
                        addCartItem && addCartItem(cartItem);
                      }
                    } else {
                      const { sku, name, category_id } = product;
                      /* WebEngage event start */
                      notifyMeTracking({
                        sku,
                        category_id,
                        name,
                      });
                      /* WebEngage event end */
                      setIsNotifyMeDialogOpen(true);
                    }
                  }}
                >
                  {product.is_in_stock ? 'Add To Cart' : 'Notify me'}
                </AphButton>
              )}
              {isInCart(product) && (
                <div className={classes.addQty}>
                  <AphButton
                    onClick={() => {
                      const medicineQtyInCart = getQuantity(product);
                      if (medicineQtyInCart === 1) {
                        /* Gtm code start  */
                        gtmTracking({
                          category: 'Pharmacy',
                          action: 'Remove Cart Item',
                          label: product.name,
                          value: product.special_price || product.price,
                        });
                        /* Gtm code end  */
                        removeCartItem && removeCartItem(product.id);
                      } else {
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
                          quantity: -1,
                          isShippable: true,
                        };
                        /* Gtm code start  */
                        gtmTracking({
                          category: 'Pharmacy',
                          action: 'Updating Cart Item by decreasing quantity 1',
                          label: product.name,
                          value: product.special_price || product.price,
                        });
                        /* Gtm code end  */
                        updateCartItem && updateCartItem(cartItem);
                      }
                    }}
                  >
                    -
                  </AphButton>
                  <div className={classes.totalQty}>{getQuantity(product)}</div>
                  <AphButton
                    onClick={() => {
                      const medicineQtyInCart = getQuantity(product);
                      if (medicineQtyInCart < MEDICINE_QUANTITY) {
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
                          isShippable: true,
                        };
                        /* Gtm code start  */
                        gtmTracking({
                          category: 'Pharmacy',
                          action: 'Updating Cart Item by increasing quantity 1',
                          label: product.name,
                          value: product.special_price || product.price,
                        });
                        /* Gtm code end  */
                        updateCartItem && updateCartItem(cartItem);
                      }
                    }}
                  >
                    +
                  </AphButton>
                </div>
              )}
            </div>
            <Popover
              open={iśNotifyMeDialogOpen}
              anchorEl={mascotRef.current}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              classes={{ paper: classes.bottomPopover }}
            >
              <div className={classes.successPopoverWindow}>
                <div className={classes.windowWrap}>
                  <div className={classes.mascotIcon}>
                    <img src={require('images/ic-mascot.png')} alt="" />
                  </div>
                  <NotifyMeNotification
                    setIsNotifyMeDialogOpen={setIsNotifyMeDialogOpen}
                    medicineName={product.name}
                  />
                </div>
              </div>
            </Popover>
          </Grid>
        ))
      ) : props.isLoading ? (
        <div className={classes.loader}><CircularProgress /></div>
      ) : (
        <div className={classes.noData}>
          {parseInt(paramSearchText) ? 'No data found' : `No results found for ${paramSearchText}`}
        </div>
      )}
    </Grid>
  );
};
