import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
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

export const ShopByAreas: React.FC = (props) => {
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
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_diabetes.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Diabetes Care</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_arthritis.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Pain Relief</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_immunity.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Cold &amp; Immunity</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_heart.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Cardiac</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_stomach.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Stomach Care</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_lungs.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Respiratory</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_condom.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Sexual Health</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_eyeear.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Eye &amp; Ear Care</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_18.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Adult Care</div>
          </div>
        </div>
        <div className={classes.card}>
          <div className={classes.cardWrap}>
            <div className={classes.cardIcon}>
              <img src={require('images/shopby/ic_beauty.svg')} alt="" />
            </div>
            <div className={classes.cardTitle}>Skin &amp; Beauty</div>
          </div>
        </div>
      </Slider>
    </div>
  );
};
