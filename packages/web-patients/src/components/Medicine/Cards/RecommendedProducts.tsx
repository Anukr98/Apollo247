import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import Slider from 'react-slick';
import { GET_RECOMMENDED_PRODUCTS_LIST } from 'graphql/profiles';
import { getRecommendedProductsList_getRecommendedProductsList_recommendedProducts as recommendedProductsType } from 'graphql/types/getRecommendedProductsList';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useMutation } from 'react-apollo-hooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { useShoppingCart, MedicineCartItem } from '../../MedicinesCartProvider';
import { gtmTracking } from '../../../gtmTracking';
import {
  pharmacyConfigSectionTracking,
  addToCartTracking,
  removeFromCartTracking,
  pharmacyProductClickedTracking,
} from 'webEngageTracking';
import { getImageUrl } from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      '& >div >img': {
        width: 24,
        height: 24,
        [theme.breakpoints.down('xs')]: {
          display: 'none !important',
        },
      },
    },
    card: {
      padding: 7,
      outline: 'none',
    },
    cardWrap: {
      padding: 8,
      position: 'relative',
      backgroundColor: '#fff',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      [theme.breakpoints.down('xs')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    productIcon: {
      textAlign: 'center',
      '& img': {
        maxWidth: 70,
        margin: 'auto',
      },
    },
    productTitle: {
      fontSize: 12,
      color: '#01475b',
      fontWeight: 500,
      textAlign: 'center',
      paddingTop: 8,
      minHeight: 70,
      maxHeight: 70,
      overflow: 'hidden',
    },
    bottomSection: {
      borderTop: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      marginTop: 8,
      paddingTop: 8,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      borderBottom: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      paddingBottom: 8,
      marginBottom: 10,
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 20,
      },
    },
    viewAllLink: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginRight: 20,
      },
      '& a': {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fc9916',
      },
    },
    priceGroup: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#01475b',
      textAlign: 'center',
      '& span': {
        display: 'block',
      },
    },
    regularPrice: {
      fontWeight: 500,
      opacity: 0.6,
      paddingRight: 5,
      textDecoration: 'line-through',
    },
    addToCart: {
      paddingTop: 8,
      '& button': {
        color: '#fc9916',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: 'auto',
      },
    },
    offerPrice: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.palette.common.white,
      position: 'absolute',
      right: 0,
      top: 0,
      backgroundColor: '#fcb716',
      width: 38,
      textAlign: 'center',
      '& span': {
        zIndex: 2,
        position: 'relative',
      },
      '&:before': {
        content: '""',
        width: 0,
        height: 0,
        borderWidth: '10px 19px',
        borderStyle: 'solid',
        borderColor: '#fcb716  #fcb716 transparent #fcb716',
        position: 'absolute',
        top: 10,
        right: 0,
        zIndex: 1,
      },
    },
    emptyBlock: {
      height: 20,
    },
  };
});

interface RecommendedProductsProps {
  section: string;
}

export const RecommendedProducts: React.FC<RecommendedProductsProps> = (props) => {
  const classes = useStyles({});
  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: <img src={require('images/ic_arrow_right.svg')} alt="" />,
    prevArrow: <img src={require('images/ic_arrow_left.svg')} alt="" />,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
          centerPadding: '50px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
          centerMode: true,
          nextArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
          prevArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          nextArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
          prevArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
        },
      },
    ],
  };

  const apiDetails = {
    url: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  const { cartItems, addCartItem, updateCartItem, removeCartItemSku } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();
  const [recommendedProductsList, setRecommendedProductsList] = useState<
    recommendedProductsType[] | null
  >(null);
  const recommendedProductsMutation = useMutation(GET_RECOMMENDED_PRODUCTS_LIST);

  useEffect(() => {
    if (currentPatient && currentPatient.uhid && !recommendedProductsList) {
      recommendedProductsMutation({
        variables: {
          patientUhid: currentPatient.uhid,
        },
      })
        .then((res: any) => {
          if (
            res &&
            res.data &&
            res.data.getRecommendedProductsList &&
            res.data.getRecommendedProductsList.recommendedProducts
          ) {
            const dataList = res.data.getRecommendedProductsList.recommendedProducts;
            setRecommendedProductsList(dataList);
          } else {
            setRecommendedProductsList([]);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [currentPatient, recommendedProductsList]);

  const itemIndexInCart = (item: recommendedProductsType) => {
    const index = cartItems.findIndex((cartItem) => cartItem.sku == item.productSku);
    return index;
  };

  const getUrlKey = (name: string) => {
    const formattedName = name
      ? name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '-')
      : '';
    return formattedName.replace(/\s+/g, '-');
  };

  return (
    <div className={classes.root}>
      {recommendedProductsList && recommendedProductsList.length >= 5 ? (
        <>
          <div className={classes.sectionTitle}>
            <span>RECOMMENDED PRODUCTS</span>
            <div className={classes.viewAllLink}>
              <Link to={clientRoutes.searchByMedicine('shop-by-category', 'recommended-products')}>
                View All
              </Link>
            </div>
          </div>
          <Slider {...sliderSettings}>
            {recommendedProductsList.map((productList) => (
              <div key={productList.productSku} className={classes.card}>
                <div className={classes.cardWrap}>
                  <Link
                    to={clientRoutes.medicineDetails(productList.productSku)}
                    onClick={() => {
                      pharmacyConfigSectionTracking({
                        sectionName: props.section,
                        productId: productList.productSku,
                        productName: productList.productName,
                      });
                      pharmacyProductClickedTracking({
                        productName: productList.productName,
                        source: 'Home',
                        productId: productList.productSku,
                        sectionName: props.section,
                      });
                    }}
                  >
                    <div className={classes.productIcon}>
                      <img
                        src={`${apiDetails.url}${getImageUrl(productList.productImage || '')}`}
                        alt={`Buy ${productList.productName} Online`}
                      />
                    </div>
                    <div className={classes.productTitle}>{productList.productName}</div>
                  </Link>
                  <div className={classes.bottomSection}>
                    <div className={classes.priceGroup}>
                      {productList &&
                      productList.productSpecialPrice &&
                      productList.productPrice !== productList.productSpecialPrice ? (
                        <span className={classes.regularPrice}>
                          (Rs. {productList.productPrice})
                        </span>
                      ) : (
                        <span className={`${classes.regularPrice} ${classes.emptyBlock}`}></span>
                      )}
                      <span>
                        Rs. {productList.productSpecialPrice || productList.productPrice}{' '}
                      </span>
                    </div>
                    <div className={classes.addToCart}>
                      {itemIndexInCart(productList) === -1 ? (
                        <AphButton
                          onClick={() => {
                            const imageList = [];
                            imageList.push(productList.productImage);
                            const cartItem: MedicineCartItem = {
                              MaxOrderQty: productList.MaxOrderQty,
                              url_key:
                                productList.urlKey && productList.urlKey !== ''
                                  ? productList.urlKey
                                  : getUrlKey(productList.productName),
                              description: null,
                              id: Number(productList.id),
                              image: imageList,
                              is_in_stock: productList.is_in_stock,
                              is_prescription_required:
                                productList.isPrescriptionNeeded === '0' ? '0' : '1',
                              name: productList.productName,
                              price: Number(productList.productPrice),
                              sku: productList.productSku,
                              special_price: productList.productSpecialPrice,
                              small_image: productList.small_image,
                              status: productList.status === 'Enabled' ? 1 : 0,
                              thumbnail: productList.thumbnail || '',
                              type_id: productList.type_id,
                              mou: productList.mou,
                              quantity: 1,
                              isShippable: productList.isShippable === 'false' ? false : true,
                            };
                            addToCartTracking({
                              productName: productList.productName,
                              source: 'Pharmacy Home',
                              productId: productList.productSku,
                              brand: '',
                              brandId: '',
                              categoryName: productList.categoryName,
                              categoryId: productList.categoryName || '',
                              discountedPrice: productList.productSpecialPrice,
                              productPrice: productList.productPrice,
                              quantity: 1,
                            });
                            /**Gtm code start  */
                            gtmTracking({
                              category: 'Pharmacy',
                              action: 'Add to Cart',
                              label: productList.productName,
                              value: productList.productSpecialPrice || productList.productPrice,
                              ecommObj: {
                                event: 'add_to_cart',
                                ecommerce: {
                                  items: [
                                    {
                                      item_name: productList.productName,
                                      item_id: productList.productSku,
                                      productPrice: productList.productPrice,
                                      item_category: 'Pharmacy',
                                      item_category_2: productList.categoryName
                                        ? productList.categoryName.toLowerCase() === 'pharma'
                                          ? 'Drugs'
                                          : 'FMCG'
                                        : null || '',
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
                          }}
                        >
                          Add To Cart
                        </AphButton>
                      ) : (
                        <AphButton
                          onClick={() => {
                            removeFromCartTracking({
                              productName: productList.productName,
                              cartSize: cartItems.length,
                              productId: productList.productSku,
                              brand: '',
                              brandId: '',
                              categoryName: productList.categoryName,
                              categoryId: productList.categoryName || '',
                              discountedPrice: productList.productSpecialPrice,
                              productPrice: productList.productPrice,
                              quantity: 1,
                            });
                            /**Gtm code start  */
                            gtmTracking({
                              category: 'Pharmacy',
                              action: 'Remove From Cart',
                              label: productList.productName,
                              value: productList.productSpecialPrice || productList.productPrice,
                              ecommObj: {
                                event: 'remove_from_cart',
                                ecommerce: {
                                  items: [
                                    {
                                      item_name: productList.productName,
                                      item_id: productList.productSku,
                                      productPrice:
                                        productList.productSpecialPrice || productList.productPrice,
                                      item_category: 'Pharmacy',
                                      item_variant: 'Default',
                                      index: 1,
                                      quantity: 1,
                                    },
                                  ],
                                },
                              },
                            });
                            /**Gtm code End  */
                            removeCartItemSku && removeCartItemSku(productList.productSku);
                          }}
                        >
                          Remove
                        </AphButton>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </>
      ) : null}
    </div>
  );
};
