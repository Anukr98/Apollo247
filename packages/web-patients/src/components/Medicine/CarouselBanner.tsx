import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      marginTop: 12,
      '& ul': {
        bottom: 12,
        right: 20,
        textAlign: 'right',
        width: 'auto',
        '& li': {
          width: 'auto',
          height: 'auto',
          margin: 0,
          '& button': {
            fontSize: 0,
            width: 40,
            height: 1,
            backgroundColor: '#fff',
            padding: 0,
            marginLeft: 2,
            '&:before': {
              display: 'none',
            },
          },
          '& .slick-active': {
            display: 'none',
          },
        },
        '& .slick-active': {
          '& button': {
            backgroundColor: '#fcb716',
          },
        },
      },
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
  };
});
type BannerData = {
  end_time: string;
  image: string;
  name: string;
  start_time: string;
  status: string;
};
const apiDetails = {
  imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
};
type BanneDataArray = { bannerData: BannerData[] };
export const CarouselBanner: React.FC<BanneDataArray> = (props) => {
  const classes = useStyles({});
  const sliderSettings = {
    infinite: false,
    dots: true,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className={classes.root}>
      <Slider {...sliderSettings}>
        {props.bannerData.map((sidebaneer) => (
          <div className={classes.card}>
            <img src={`${apiDetails.imageUrl}${sidebaneer.image}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};
