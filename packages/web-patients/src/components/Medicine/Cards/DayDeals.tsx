import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Slider from 'react-slick';
import { DealsOfTheDaySection } from '../../../helpers/MedicineApiCalls';

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
    cardLink: {
      position: 'relative',
      display: 'block',
    },
    cardWrap: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: '14px 12px 14px 15px',
      display: 'flex',
    },
    cardIcon: {
      paddingLeft: 16,
      width: '50%',
      '& img': {
        maxWidth: 120,
      },
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#01475b',
      width: '50%',
    },
    offerDetails: {
      position: 'absolute',
      left: 0,
      bottom: 16,
      backgroundColor: '#fcb716',
      fontSize: 16,
      fontWeight: 600,
      color: theme.palette.common.white,
      padding: '8px 16px',
      paddingRight: 6,
      '&:after': {
        content: '""',
        width: 0,
        height: 0,
        borderWidth: '19px 19px',
        borderStyle: 'solid',
        borderColor: '#fcb716 transparent #fcb716 #fcb716',
        position: 'absolute',
        top: 0,
        right: -32,
      },
    },
  };
});

interface DayDealsProps {
  data: DealsOfTheDaySection[];
}

export const DayDeals: React.FC<DayDealsProps> = (props) => {
  const classes = useStyles({});
  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
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
          props.data.map((deal) => (
            <div className={classes.card}>
              <Link className={classes.cardLink} to={clientRoutes.searchByMedicine()}>
                <div className={classes.cardWrap}>
                  {/* <div className={classes.cardTitle}>
                    Personal
                    <br /> Care Products
                  </div> */}
                  <div className={classes.cardIcon}>
                    <img src={`${apiDetails.url}${deal.image_url}`} width="100%" alt="" />
                  </div>
                </div>
                {/* <div className={classes.offerDetails}>Upto 30% Off</div> */}
              </Link>
            </div>
          ))}
      </Slider>
    </div>
  );
};
