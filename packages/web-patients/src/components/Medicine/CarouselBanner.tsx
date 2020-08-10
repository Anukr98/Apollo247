import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { pharmacyHomeBannerTracking } from 'webEngageTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      // marginTop: 12,
    },
    card: {
      color: '#fff',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      fontSize: 14,
      '& img': {
        maxWidth: '100%',
      },
      '&:hover': {
        cursor: 'pointer',
      },
    },
    button: {
      backgroundColor: '#fff',
      borderRadius: 10,
      color: '#fc9916',
      fontSize: 13,
      padding: '11px 12px',
      display: 'inline-block',
      fontWeight: 500,
      textTransform: 'uppercase',
      minWidth: 108,
      textAlign: 'center',
      marginTop: 10,
      '&:hover': {
        backgroundColor: '#fff',
        color: '#fc9916',
      },
    },
    slider: {
      '& >.slick-dots': {
        position: 'static !important',
        '& li': {
          margin: 0,
          '& button': {
            '&:before': {
              fontSize: 10,
              color: 'rgba(0,0,0,0.4)',
            },
          },
          '&.slick-active': {
            '& button': {
              '&:before': {
                color: 'rgba(0,0,0,0.8)',
              },
            },
          },
        },
      },
    },
  };
});
type BannerData = {
  category_url_key: string;
  end_time: string;
  image: string;
  name: string;
  sku_url_key: string;
  start_time: string;
  status: string;
};
const apiDetails = {
  imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
};
interface BanneDataArray {
  bannerData: BannerData[];
  history?: any;
}
export const CarouselBanner: React.FC<BanneDataArray> = (props) => {
  const classes = useStyles({});
  const sliderSettings = {
    infinite: props.bannerData && props.bannerData.length > 1 ? true : false,
    dots: true,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoPlaySpeed: 5000,
    autoplay: true,
  };

  return (
    <div className={classes.root}>
      <Slider {...sliderSettings} className={classes.slider}>
        {props.bannerData.map((sidebaner, index) => (
          <div
            className={classes.card}
            onClick={() => {
              pharmacyHomeBannerTracking(index + 1);
              if (sidebaner.sku_url_key) {
                props.history.push(clientRoutes.medicineDetails(sidebaner.sku_url_key));
              } else if (sidebaner.category_url_key) {
                props.history.push(
                  clientRoutes.searchByMedicine('healthareas', sidebaner.category_url_key)
                );
              }
            }}
          >
            <img src={`${apiDetails.imageUrl}${sidebaner.image}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};
