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
      marginTop: 12,
      // '& ul': {
      //   bottom: 12,
      //   right: 20,
      //   textAlign: 'right',
      //   width: 'auto',
      //   '& li': {
      //     width: 'auto',
      //     height: 'auto',
      //     margin: 0,
      //     '& button': {
      //       fontSize: 0,
      //       width: 40,
      //       height: 1,
      //       backgroundColor: '#fff',
      //       padding: 0,
      //       marginLeft: 2,
      //       '&:before': {
      //         display: 'none',
      //       },
      //     },
      //     '& .slick-active': {
      //       display: 'none',
      //     },
      //   },
      //   '& .slick-active': {
      //     '& button': {
      //       backgroundColor: '#fcb716',
      //     },
      //   },
      // },
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
    infinite: true,
    dots: true,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoPlaySpeed: 5000,
    autoplay: true,
  };

  const dummyData = [
    {
      end_time: '2021-06-11 03:59:00',
      image:
        'http://uat.apollopharmacy.in/pub/media/magestore/bannerslider/images/2/4/247_web_2.jpg',
      name: '247 web',
      sku: 'APA0040',
      sku_url_key: 'apollo-life-aloe-vera-juice-1ltr',
      start_time: '2020-06-09 09:00:00',
      status: '1',
    },
    {
      category_id: '1459',
      category_url_key: 'cold-immunity-and-pain-relief',
      end_time: '2021-06-10 10:44:00',
      image:
        'http://uat.apollopharmacy.in/pub/media/magestore/bannerslider/images/h/o/hold_on_tight_web_28apr_1.jpg',
      name: '247 web 1',
      start_time: '2020-06-09 10:44:00',
      status: '1',
    },
    {
      end_time: '2021-06-20 10:59:00',
      image:
        'http://uat.apollopharmacy.in/pub/media/magestore/bannerslider/images/2/4/247_web_1.jpg',
      name: '247 web 2',
      sku: 'NAN0004',
      sku_url_key: 'nestle-nan-pro-stage-1-tin-upto-6-months-400g',
      start_time: '2020-06-18 10:59:00',
      status: '1',
    },
  ];

  return (
    <div className={classes.root}>
      <Slider {...sliderSettings} className={classes.slider}>
        {dummyData.map((sidebaner, index) => (
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
            <img src={`${sidebaner.image}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};
