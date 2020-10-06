import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Slider from 'react-slick';
import { MedicinePageSection } from '../../../helpers/MedicineApiCalls';
import _replace from 'lodash/replace';
import { LazyIntersection } from '../../lib/LazyIntersection';
import { getSlidesToScroll } from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      '& >div': {
        '& >img': {
          width: 24,
          height: 24,
          [theme.breakpoints.down('xs')]: {
            display: 'none !important',
          },
        },
        '& >div': {
          [theme.breakpoints.down('xs')]: {
            margin: '0 -20px 0 -10px',
          },
        },
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
      height: 60,
    },
    cardIcon: {
      textAlign: 'center',
      width: '100%',
      '& img': {
        margin: 'auto',
        maxWidth: '100%',
        maxHeight: 60,
        padding: 5,
      },
    },
  };
});

interface ShopByBrandsProps {
  data: MedicinePageSection[];
  sectionName: string;
}

export const ShopByBrand: React.FC<ShopByBrandsProps> = (props) => {
  const classes = useStyles({});
  const [currIndex, setCurrIndex] = useState(0);
  const sliderSettings = {
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: getSlidesToScroll(props.data.length),
    nextArrow: (
      <div>
        {currIndex !== props.data.length - 6 && (
          <img src={require('images/ic_arrow_right.svg')} alt="" />
        )}
      </div>
    ),
    prevArrow: (
      <div>{currIndex !== 0 && <img src={require('images/ic_arrow_left.svg')} alt="" />}</div>
    ),
    afterChange: (currentIndex: number) => {
      setCurrIndex(currentIndex);
    },
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: false,
          dots: true,
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
          // centerMode: true,
          nextArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
          prevArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
        },
      },
    ],
  };

  const apiDetails = {
    url: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  const searchText = props.sectionName.replace(/_/g, '-');

  return (
    <div className={classes.root}>
      <Slider
        {...sliderSettings}
        beforeChange={() => {
          document.getElementById('searchProduct').blur();
        }}
      >
        {props.data &&
          props.data.map((brand, index) => {
            let formattedTitle = _replace(brand.title.toLowerCase(), ' & ', '_');
            formattedTitle = _replace(formattedTitle, ' ', '-');
            return (
              <div key={index} className={classes.card}>
                <Link to={clientRoutes.searchByMedicine(searchText, brand.url_key)}>
                  <div className={classes.cardWrap}>
                    <div className={classes.cardIcon}>
                      <LazyIntersection
                        src={`${apiDetails.url && apiDetails.url.replace('/catalog/product', '')}${
                          brand.image_url.startsWith('/') ? brand.image_url : `/${brand.image_url}`
                        }`}
                        alt={`Buy ${brand.title} Products Online`}
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
