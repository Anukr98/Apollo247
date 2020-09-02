import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, Grid, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';
import { gtmTracking } from '../../gtmTracking';
import {
  notifyMeTracking,
  addToCartTracking,
  pharmacyProductClickedTracking,
} from '../../webEngageTracking';
import { NotifyMeNotification } from './NotifyMeNotification';
import { useParams } from 'hooks/routerHooks';
import _replace from 'lodash/replace';
import { useAllCurrentPatients } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: 10,
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      textAlign: 'center',
      height: '100%',
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: ' space-between',
      },
    },
    pdHeader: {
      [theme.breakpoints.down(500)]: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '0 0 10px',
      },
    },
    bigAvatar: {
      width: 85,
      height: 85,
      textAlign: 'center',
      margin: '0 auto 20px',
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
      },
      [theme.breakpoints.down(500)]: {
        margin: '0 10px 0  0',
        width: 40,
        height: 'auto',
        flex: '1 0 auto',
      },
    },
    priceGroup: {
      fontSize: 12,
      color: '#01475b',
      fontWeight: 600,
      textAlign: 'center',
      paddingTop: 5,
      [theme.breakpoints.down(500)]: {
        display: 'flex',
        flexDirection: 'column-reverse',
        padding: 0,
      },
    },
    regularPrice: {
      paddingLeft: 10,
      textDecoration: 'line-through',
      opacity: 0.6,
      [theme.breakpoints.down(500)]: {
        display: 'block',
        padding: 0,
      },
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
      [theme.breakpoints.down('xs')]: {
        margin: 0,
        lineHeight: 'normal',
        fontSize: 12,
      },
    },
    noStock: {
      fontSize: 12,
      color: '#890000',
      fontWeight: 'bold',
      padding: 0,
    },
    noData: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: '18px',
      paddingLeft: 10,
      [theme.breakpoints.down('xs')]: {
        marginTop: 25,
        paddingLeft: 10,
      },
    },
    productName: {
      minHeight: 45,
      [theme.breakpoints.down(500)]: {
        textAlign: 'left',
        fontSize: 12,
      },
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
    },
    productDetails: {
      [theme.breakpoints.down(500)]: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      },
    },
    gridItem: {
      [theme.breakpoints.down(500)]: {
        padding: '5px !important',
      },
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
  const { addCartItem, cartItems, updateCartItem, removeCartItemSku } = useShoppingCart();
  const mascotRef = useRef(null);
  const [iśNotifyMeDialogOpen, setIsNotifyMeDialogOpen] = useState<boolean>(false);
  const [selectedMedicineName, setSelectedMedicineName] = useState<string>('');
  const { currentPatient } = useAllCurrentPatients();

  const isInCart = (medicine: MedicineProduct) => {
    const index = cartItems.findIndex((cartItem) => cartItem.sku == medicine.sku);
    return index > -1;
  };

  const getQuantity = (medicine: MedicineProduct) => {
    const findItem = cartItems.find((item) => item.sku === medicine.sku);
    return findItem ? findItem.quantity : 0;
  };

  return (
    <Grid container spacing={2}>
      {props.medicineList && props.medicineList.length > 0
        ? props.medicineList.map((product: MedicineProduct) => (
            <Grid key={product.sku} item xs={6} sm={6} md={4} lg={4} className={classes.gridItem}>
              <div className={classes.root}>
                <Link
                  to={clientRoutes.medicineDetails(product.url_key)}
                  onClick={() =>
                    pharmacyProductClickedTracking({
                      productName: product.name,
                      source: 'Category',
                      productId: product.sku,
                      sectionName: params.searchMedicineType,
                    })
                  }
                >
                  <div className={classes.pdHeader}>
                    <div className={classes.bigAvatar}>
                      <img src={`${apiDetails.imageUrl}${product.thumbnail}`} alt="" />
                    </div>
                    <div className={classes.productName}>{product.name}</div>
                  </div>
                </Link>
                <div className={classes.productDetails}>
                  <div className={classes.priceGroup}>
                    Rs. {product.special_price ? product.special_price : product.price}{' '}
                    {product.special_price && (
                      <span className={classes.regularPrice}>(Rs. {product.price})</span>
                    )}
                  </div>
                  {!isInCart(product) &&
                    (!product.is_in_stock && !currentPatient ? (
                      <div className={classes.noStock}>Out Of Stock</div>
                    ) : (
                      <AphButton
                        className={classes.addToCartBtn}
                        onClick={() => {
                          if (product.is_in_stock) {
                            const cartItem: MedicineCartItem = {
                              MaxOrderQty: product.MaxOrderQty,
                              url_key: product.url_key,
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
                            addToCartTracking({
                              productName: product.name,
                              source: 'Pharmacy List',
                              productId: product.sku,
                              brand: '',
                              brandId: '',
                              categoryName: params.searchText,
                              categoryId: product.category_id,
                              discountedPrice: product.special_price,
                              price: product.price,
                              quantity: 1,
                            });
                            /**Gtm code start  */
                            gtmTracking({
                              category: 'Pharmacy',
                              action: 'Add to Cart',
                              label: product.name,
                              value: product.special_price || product.price,
                              ecommObj: {
                                event: 'add_to_cart',
                                ecommerce: {
                                  items: [
                                    {
                                      item_name: product.name,
                                      item_id: product.sku,
                                      price: product.special_price || product.price,
                                      item_category: 'Pharmacy',
                                      item_category_2: product.type_id
                                        ? product.type_id.toLowerCase() === 'pharma'
                                          ? 'Drugs'
                                          : 'FMCG'
                                        : null,
                                      // 'item_category_4': '', // future reference
                                      item_variant: 'Default',
                                      index: 1,
                                      quantity: 1,
                                    },
                                  ],
                                },
                              },
                            });
                            /**Gtm code End  */
                            const index = cartItems.findIndex((item) => item.sku === cartItem.sku);
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
                            setSelectedMedicineName(product.name);
                            setIsNotifyMeDialogOpen(true);
                          }
                        }}
                      >
                        {product.is_in_stock
                          ? 'Add to Cart'
                          : currentPatient && currentPatient.id
                          ? 'Notify me'
                          : ''}
                      </AphButton>
                    ))}
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
                            removeCartItemSku && removeCartItemSku(product.sku);
                          } else {
                            const cartItem: MedicineCartItem = {
                              MaxOrderQty: product.MaxOrderQty,
                              url_key: product.url_key,
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
                              action: 'Remove From Cart',
                              label: product.name,
                              value: product.special_price || product.price,
                              ecommObj: {
                                event: 'remove_from_cart',
                                ecommerce: {
                                  items: [
                                    {
                                      item_name: product.name,
                                      item_id: product.sku,
                                      price: product.special_price || product.price,
                                      item_category: 'Pharmacy',
                                      item_category_2: product.type_id
                                        ? product.type_id.toLowerCase() === 'pharma'
                                          ? 'Drugs'
                                          : 'FMCG'
                                        : null,
                                      // 'item_category_4': '', // future reference
                                      item_variant: 'Default',
                                      index: 1,
                                      quantity: 1,
                                    },
                                  ],
                                },
                              },
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
                          if (
                            medicineQtyInCart <
                            (product.MaxOrderQty || process.env.PHARMACY_MEDICINE_QUANTITY)
                          ) {
                            const cartItem: MedicineCartItem = {
                              MaxOrderQty: product.MaxOrderQty,
                              url_key: product.url_key,
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
                              action: 'Add to Cart',
                              label: product.name,
                              value: product.special_price || product.price,
                              ecommObj: {
                                event: 'add_to_cart',
                                ecommerce: {
                                  items: [
                                    {
                                      item_name: product.name,
                                      item_id: product.sku,
                                      price: product.special_price || product.price,
                                      item_category: 'Pharmacy',
                                      item_category_2: product.type_id
                                        ? product.type_id.toLowerCase() === 'pharma'
                                          ? 'Drugs'
                                          : 'FMCG'
                                        : null,
                                      // 'item_category_4': '', // future reference
                                      item_variant: 'Default',
                                      index: 1,
                                      quantity: 1,
                                    },
                                  ],
                                },
                              },
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
              </div>
            </Grid>
          ))
        : props.isLoading && (
            <div className={classes.loader}>
              <CircularProgress />
            </div>
          )}
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
              medicineName={selectedMedicineName}
            />
          </div>
        </div>
      </Popover>
    </Grid>
  );
};
