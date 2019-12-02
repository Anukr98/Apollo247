import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Slider from 'react-slick';
import {MedicinePageAPiResponse} from 'helpers/MedicineApiCalls';

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
      textAlign: 'center',
      width: '100%',
      '& img': {
        margin: 'auto',
        maxWidth: '100%',
      },
    },
  };
});

interface ShopByBrandsProps {
  data: MedicinePageAPiResponse
}

export const ShopByBrand: React.FC<ShopByBrandsProps> = (props) => {
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
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_diabetes.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_arthritis.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_immunity.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_heart.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_stomach.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_lungs.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_condom.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_eyeear.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_18.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
        <div className={classes.card}>
          <Link to={clientRoutes.yourOrders()}>
            <div className={classes.cardWrap}>
              <div className={classes.cardIcon}>
                <img src={require('images/shopby/ic_beauty.svg')} alt="" />
              </div>
            </div>
          </Link>
        </div>
      </Slider>
    </div>
  );
};
