import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, Paper, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';
import FormHelperText from '@material-ui/core/FormHelperText';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';
import { gtmTracking } from '../../gtmTracking';
import {
  notifyMeTracking,
  pharmacySearchTracking,
  addToCartTracking,
} from '../../webEngageTracking';
import { NotifyMeNotification } from './NotifyMeNotification';
import { useAllCurrentPatients } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px 15px 20px',
        position: 'fixed',
        width: '100%',
        top: 84,
        zIndex: 99,
        background: '#fff',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
    },
    medicineSearchForm: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px 10px 12px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    strikeThroughPrice: {
      opacity: '0.6',
      fontWeight: 500,
      paddingRight: 5,
      textDecoration: 'line-through',
    },
    specialPrice: {
      paddingLeft: 12,
    },
    searchInput: {
      '& input': {
        [theme.breakpoints.down('xs')]: {
          backgroundColor: '#f7f8f5',
          padding: '15px 33px 15px 12px',
          borderBottom: '2px solid transparent',
          '&:focus': {
            backgroundColor: '#fff',
            borderBottom: '2px solid #00b38e',
            paddingLeft: 0,
          },
        },
      },
      '& >div': {
        '&:after': {
          display: 'none',
        },
        '&:before': {
          display: 'none',
        },
      },
    },
    searchBtn: {
      marginLeft: 'auto',
      padding: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent !important',
      minWidth: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: -30,
      },
    },
    autoSearchPopover: {
      position: 'absolute',
      top: 53,
      left: 0,
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      width: '100%',
      zIndex: 9,
    },
    searchList: {
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          listStyleType: 'none',
          borderBottom: '0.5px solid rgba(2,71,91,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          '& a': {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 12px',
            flex: 1,
          },
          '&:hover': {
            backgroundColor: '#f7f8f5',
          },
          '&:focus': {
            backgroundColor: '#f7f8f5',
          },
          '&:last-child': {
            borderBottom: 0,
          },
        },
      },
    },
    rightActions: {
      marginLeft: 'auto',
      paddingRight: 16,
    },
    medicineImg: {
      paddingRight: 16,
      '& img': {
        maxWidth: 40,
      },
    },
    medicineInfo: {
      padding: 0,
    },
    medicineName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
    },
    medicinePrice: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    noStock: {
      fontSize: 12,
      color: '#890000',
      fontWeight: 500,
      paddingLeft: 16,
    },
    itemSelected: {
      backgroundColor: '#f7f8f5',
    },
    searchBtnDisabled: {
      opacity: 0.5,
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    helpText: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    addToCart: {
      backgroundColor: 'transparent',
      color: '#fc9916',
      boxShadow: 'none',
      padding: 0,
      minWidth: 'auto',
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
      },
    },
    addQty: {
      display: 'flex',
      alignItems: 'center',
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
      boxShadow: '0 5px 30px 0 rgba(0, 0, 0, 0.3)',
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
    bottomInfo: {
      display: 'flex',
      alignItems: 'center',
    },
    noData: {
      display: 'block',
      marginTop: 5,
      fontSize: 14,
      lineHeight: '18px',
    },
  };
});

export const MedicineAutoSearch: React.FC = (props) => {
  const classes = useStyles({});
  const apiDetails = {
    url: process.env.PHARMACY_MED_SEARCH_SUGGEST_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };
  const { currentPatient } = useAllCurrentPatients();
  const { cartItems, addCartItem, updateCartItem, removeCartItemSku } = useShoppingCart();

  const [searchMedicines, setSearchMedicines] = useState<MedicineProduct[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showError, setShowError] = useState<boolean>(false);
  const mascotRef = useRef(null);
  const [iśNotifyMeDialogOpen, setIsNotifyMeDialogOpen] = useState<boolean>(false);
  const [selectedMedicineName, setSelectedMedicineName] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const onSearchMedicine = async (value: string) => {
    setLoading(true);
    await axios
      .post(
        apiDetails.url,
        {
          params: value,
        },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        if (data && data.products) {
          setShowError(data.products.length === 0);
          setSearchMedicines(data.products);
          pharmacySearchTracking({
            keyword: value,
            source: window.location.href.includes('medicines') ? 'Pharmacy Home' : 'Pharmacy List',
            results: data.products && data.products.length,
          });
        } else {
          setShowError(true);
          setSearchMedicines([]);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    if (searchText.length < 3) {
      setLoading(false);
    }
  }, [searchText]);

  const isInCart = (medicine: MedicineProduct) => {
    const index = cartItems.findIndex((item) => item.id === medicine.id);
    return index > -1;
  };

  const getQuantity = (medicine: MedicineProduct) => {
    return cartItems.find((item) => item.id === medicine.id).quantity;
  };

  return (
    <div className={classes.root}>
      <div className={classes.medicineSearchForm}>
        <AphTextField
          placeholder="Search meds, brands and more"
          error={showError}
          className={classes.searchInput}
          value={searchText.replace(/\s+/gi, ' ').trimLeft()}
          onKeyDown={(e) => {
            if (searchText.length > 1 && e.key === 'Enter') {
              window.location.href = clientRoutes.searchByMedicine(
                'search-medicines',
                searchText.replace(/\s/g, '-')
              );
            }
          }}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (e.target.value.length > 2) {
              onSearchMedicine(e.target.value);
            } else {
              setSearchMedicines([]);
            }
          }}
        />
        <AphButton
          disabled={searchText.length < 3}
          className={classes.searchBtn}
          onClick={() =>
            (window.location.href = clientRoutes.searchByMedicine('search-medicines', searchText))
          }
          classes={{
            disabled: classes.searchBtnDisabled,
          }}
        >
          <img src={require('images/ic_send.svg')} alt="" />
        </AphButton>
      </div>
      {showError ? (
        <span className={classes.noData}>
          Hit enter to search for <b>'{searchText}'</b>
        </span>
      ) : (
        ''
      )}
      <Paper className={classes.autoSearchPopover}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'45vh'}>
          {loading && (
            <div className={classes.progressLoader}>
              <CircularProgress size={30} />
            </div>
          )}
          {searchText.length > 2 && searchMedicines && searchMedicines.length > 0 && (
            <div className={classes.searchList}>
              <ul>
                {searchMedicines.map((medicine) => (
                  <li key={medicine.id}>
                    <Link
                      to="#"
                      onClick={() => {
                        setSearchText('');
                        window.location.href = clientRoutes.medicineDetails(medicine.url_key);
                      }}
                    >
                      <div className={classes.medicineImg}>
                        {medicine.is_prescription_required ? (
                          <img src={require('images/ic_tablets_rx.svg')} alt="" />
                        ) : (
                          <img src={`${apiDetails.imageUrl}${medicine.image}`} alt="" />
                        )}
                      </div>
                      <div className={classes.medicineInfo}>
                        <div className={classes.medicineName}>{medicine.name}</div>
                        {medicine.is_in_stock ? (
                          <div className={classes.medicinePrice}>
                            <span
                              className={medicine.special_price ? classes.strikeThroughPrice : ''}
                            >{`Rs. ${medicine.price}`}</span>
                            {medicine.special_price && (
                              <span className={classes.specialPrice}>
                                {' '}
                                {`Rs. ${medicine.special_price}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className={classes.bottomInfo}>
                            <div className={classes.medicinePrice}>Rs. {medicine.price}</div>
                            <div className={classes.noStock}>Out Of Stock</div>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className={classes.rightActions}>
                      {!isInCart(medicine) && (
                        <AphButton
                          onClick={() => {
                            if (medicine.is_in_stock) {
                              const cartItem: MedicineCartItem = {
                                MaxOrderQty: medicine.MaxOrderQty,
                                url_key: medicine.url_key,
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
                                quantity: 1,
                                isShippable: true,
                              };
                              addToCartTracking({
                                productName: medicine.name,
                                source: 'Pharmacy Search',
                                productId: medicine.sku,
                                brand: '',
                                brandId: '',
                                categoryName: '',
                                categoryId: medicine.category_id,
                                discountedPrice: medicine.special_price,
                                price: medicine.price,
                                quantity: 1,
                              });
                              /* Gtm code start  */
                              gtmTracking({
                                category: 'Pharmacy',
                                action: 'Add to Cart',
                                label: medicine.name,
                                value: medicine.special_price || medicine.price,
                                ecommObj: {
                                  event: 'add_to_cart',
                                  ecommerce: {
                                    items: [
                                      {
                                        item_name: medicine.name,
                                        item_id: medicine.sku,
                                        price: medicine.special_price || medicine.price,
                                        item_category: 'Pharmacy',
                                        item_category_2: medicine.type_id
                                          ? medicine.type_id.toLowerCase() === 'pharma'
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
                              addCartItem && addCartItem(cartItem);
                            } else {
                              const { sku, name, category_id } = medicine;
                              /* WebEngage event start */
                              notifyMeTracking({
                                sku,
                                category_id,
                                name,
                              });
                              /* WebEngage event end */
                              setSelectedMedicineName(medicine.name);
                              setIsNotifyMeDialogOpen(true);
                            }
                          }}
                          className={classes.addToCart}
                        >
                          {medicine.is_in_stock
                            ? 'Add to Cart'
                            : currentPatient && currentPatient.id
                            ? 'Notify me'
                            : ''}
                        </AphButton>
                      )}
                      {isInCart(medicine) && (
                        <div className={classes.addQty}>
                          <AphButton
                            onClick={() => {
                              const medicineQtyInCart = getQuantity(medicine);
                              if (medicineQtyInCart === 1) {
                                /* Gtm code start  */
                                gtmTracking({
                                  category: 'Pharmacy',
                                  action: 'Remove Cart Item',
                                  label: medicine.name,
                                  value: medicine.special_price || medicine.price,
                                });
                                /* Gtm code end  */
                                removeCartItemSku && removeCartItemSku(medicine.sku);
                              } else {
                                const cartItem: MedicineCartItem = {
                                  MaxOrderQty: medicine.MaxOrderQty,
                                  url_key: medicine.url_key,
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
                                  quantity: -1,
                                  isShippable: true,
                                };
                                /* Gtm code start  */
                                gtmTracking({
                                  category: 'Pharmacy',
                                  action: 'Remove From Cart',
                                  label: medicine.name,
                                  value: medicine.special_price || medicine.price,
                                  ecommObj: {
                                    event: 'remove_from_cart',
                                    ecommerce: {
                                      items: [
                                        {
                                          item_name: medicine.name,
                                          item_id: medicine.sku,
                                          price: medicine.special_price || medicine.price,
                                          item_category: 'Pharmacy',
                                          item_category_2: medicine.type_id
                                            ? medicine.type_id.toLowerCase() === 'pharma'
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
                          <div className={classes.totalQty}>{getQuantity(medicine)}</div>
                          <AphButton
                            onClick={() => {
                              const medicineQtyInCart = getQuantity(medicine);
                              if (
                                medicineQtyInCart <
                                (medicine.MaxOrderQty || process.env.PHARMACY_MEDICINE_QUANTITY)
                              ) {
                                const cartItem: MedicineCartItem = {
                                  MaxOrderQty: medicine.MaxOrderQty,
                                  url_key: medicine.url_key,
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
                                  quantity: 1,
                                  isShippable: true,
                                };
                                /* Gtm code start  */
                                gtmTracking({
                                  category: 'Pharmacy',
                                  action: 'Add to Cart',
                                  label: medicine.name,
                                  value: medicine.special_price || medicine.price,
                                  ecommObj: {
                                    event: 'add_to_cart',
                                    ecommerce: {
                                      items: [
                                        {
                                          item_name: medicine.name,
                                          item_id: medicine.sku,
                                          price: medicine.special_price || medicine.price,
                                          item_category: 'Pharmacy',
                                          item_category_2: medicine.type_id
                                            ? medicine.type_id.toLowerCase() === 'pharma'
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
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Scrollbars>
      </Paper>
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
    </div>
  );
};
