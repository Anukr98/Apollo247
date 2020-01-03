import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Slider from 'react-slick';
import { MedicinePageSection } from '../../../helpers/MedicineApiCalls';

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
  data: MedicinePageSection[];
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

  const apiDetails = {
    url: `${process.env.PHARMACY_MED_PROD_URL}/pub/media`,
  };

  return (
    <div className={classes.root}>
      <Slider {...sliderSettings}>
        {props.data &&
          props.data.map((brand) => {
            return (
              <div key={brand.category_id} className={classes.card}>
                <Link to={clientRoutes.searchByMedicine('search-by-brand', brand.category_id)}>
                  <div className={classes.cardWrap}>
                    <div className={classes.cardIcon}>
                      <img
                        src={`${apiDetails.url && apiDetails.url.replace('/catalog/product', '')}${
                          brand.image_url.startsWith('/') ? brand.image_url : `/${brand.image_url}`
                        }`}
                        alt=""
                      />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
      </Slider>
    </div>
  );
};
