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

interface ShopByAreasProps {
  data: MedicinePageSection[];
}

export const ShopByAreas: React.FC<ShopByAreasProps> = (props) => {
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
          props.data.map((healthArea) => (
            <div className={classes.card}>
              <Link to={clientRoutes.yourOrders()}>
                <div className={classes.cardWrap}>
                  <div className={classes.cardIcon}>
                    <img
                      // src={require("images/shopby/ic_diabetes.svg")}
                      src={`${process.env.PHARMACY_MED_IMAGES_BASE_URL}${healthArea.image_url}`}
                      alt=""
                    />
                  </div>
                  <div className={classes.cardTitle}>{healthArea.title}</div>
                </div>
              </Link>
            </div>
          ))}
      </Slider>
    </div>
  );
};
