import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Slider from 'react-slick';

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
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: '14px 12px',
      display: 'flex',
      alignItems: 'center',
    },
    cardIcon: {
      paddingRight: 16,
      '& img': {
        maxWidth: 40,
      },
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
    },
  };
});

export const ShopByCategory: React.FC = (props) => {
  const classes = useStyles();
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
        <div className={classes.card}>
          <Link to={clientRoutes.medicineSearchByBrand()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/category/ic_personalcare.svg')} alt="" />
              </div>
              <div className={classes.cardTitle}>Personal Care</div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.medicineSearchByBrand()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/category/ic_mom_baby.svg')} alt="" />
              </div>
              <div className={classes.cardTitle}>Mom &amp; Baby</div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.medicineSearchByBrand()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/category/ic_apple.svg')} alt="" />
              </div>
              <div className={classes.cardTitle}>Nutrition</div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.medicineSearchByBrand()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/category/ic_healthcare.svg')} alt="" />
              </div>
              <div className={classes.cardTitle}>Healthcare</div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.medicineSearchByBrand()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/category/ic_offer.svg')} alt="" />
              </div>
              <div className={classes.cardTitle}>Special Offers</div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.medicineSearchByBrand()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/category/ic_holland.png')} alt="" />
              </div>
              <div className={classes.cardTitle}>Holland &amp; Barrett</div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.medicineSearchByBrand()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/category/ic_apollo.png')} alt="" />
              </div>
              <div className={classes.cardTitle}>Apollo Products</div>
            </div>
          </Link>
        </div>
      </Slider>
    </div>
  );
};
