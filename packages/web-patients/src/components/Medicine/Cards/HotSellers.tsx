import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import Slider from 'react-slick';
import { MedicineProduct } from '../../../helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      '& >div >img': {
        width: 24,
        height: 24,
      },
    },
    card: {
      padding: 7,
      outline: 'none',
    },
    cardWrap: {
      padding: 8,
      position: 'relative',
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
    },
    regularPrice: {
      fontWeight: 500,
      opacity: 0.6,
      paddingRight: 5,
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
  };

  return (
    <div className={classes.root}>
      <Slider {...sliderSettings}>
        {props.data &&
          props.data.products &&
          props.data.products.map((hotSeller) => (
            <div className={classes.card}>
              <div className={classes.cardWrap}>
                <div className={classes.offerPrice}>
                  <span>-30%</span>
                </div>
                <div className={classes.productIcon}>
                  <img
                    src={`${process.env.PHARMACY_MED_IMAGES_BASE_URL}${hotSeller.small_image}`}
                    alt=""
                  />
                </div>
                <div className={classes.productTitle}>{hotSeller.name}</div>
                <div className={classes.bottomSection}>
                  <div className={classes.priceGroup}>
                    {!!hotSeller.special_price && (
                      <span className={classes.regularPrice}>(Rs. {hotSeller.price})</span>
                    )}
                    <span>Rs. {hotSeller.special_price || hotSeller.price} </span>
                  </div>
                  <div className={classes.addToCart}>
                    <AphButton>Add To Cart</AphButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </Slider>
    </div>
  );
};
