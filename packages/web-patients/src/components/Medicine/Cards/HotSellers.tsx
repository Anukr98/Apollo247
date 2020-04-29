import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import Slider from 'react-slick';
import { MedicineProduct } from '../../../helpers/MedicineApiCalls';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { useShoppingCart, MedicineCartItem } from '../../MedicinesCartProvider';

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
      fontSize: 14,
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
  };
});

interface HotSellerProps {
  data?: { products: MedicineProduct[] };
}

export const HotSellers: React.FC<HotSellerProps> = (props) => {
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
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          nextArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
          prevArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
        },
      },
    ],
  };

  const apiDetails = {
    url: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  const { cartItems, addCartItem, updateCartItem, removeCartItem } = useShoppingCart();

  const itemIndexInCart = (item: MedicineProduct) => {
    const index = cartItems.findIndex((cartItem) => cartItem.id == item.id);
    return index;
  };

  return (
    <div className={classes.root}>
      <Slider {...sliderSettings}>
        {props.data &&
          props.data.products &&
          props.data.products.map((hotSeller) => (
            <div key={hotSeller.sku} className={classes.card}>
              <div className={classes.cardWrap}>
                {(!!Number(hotSeller.special_price!) && (Number(hotSeller.price) !== Number(hotSeller.special_price!))) && <div className={classes.offerPrice}>
                  <span>
                    -
                    {Math.floor(
                      ((Number(hotSeller.price) - Number(hotSeller.special_price!)) /
                        hotSeller.price) *
                        100
                    )}
                    %
                  </span>
                </div>}
                <Link to={clientRoutes.medicineDetails(hotSeller.sku)}>
                  <div className={classes.productIcon}>
                    <img src={`${apiDetails.url}${hotSeller.small_image}`} alt="" />
                  </div>
                  <div className={classes.productTitle}>{hotSeller.name}</div>
                </Link>
                <div className={classes.bottomSection}>
                  <div className={classes.priceGroup}>
                    {!!hotSeller.special_price && (
                      <span className={classes.regularPrice}>(Rs. {hotSeller.price})</span>
                    )}
                    <span>Rs. {hotSeller.special_price || hotSeller.price} </span>
                  </div>
                  <div className={classes.addToCart}>
                    {itemIndexInCart(hotSeller) === -1 ? (
                      <AphButton
                        onClick={() => {
                          const cartItem: MedicineCartItem = {
                            description: hotSeller.description,
                            id: hotSeller.id,
                            image: hotSeller.image,
                            is_in_stock: hotSeller.is_in_stock,
                            is_prescription_required: hotSeller.is_prescription_required,
                            name: hotSeller.name,
                            price: hotSeller.price,
                            sku: hotSeller.sku,
                            special_price: hotSeller.special_price,
                            small_image: hotSeller.small_image,
                            status: hotSeller.status,
                            thumbnail: hotSeller.thumbnail,
                            type_id: hotSeller.type_id,
                            mou: hotSeller.mou,
                            quantity: 1,
                          };
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
                        onClick={() => {
                          removeCartItem && removeCartItem(hotSeller.id);
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
    </div>
  );
};
