import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import Slider from 'react-slick';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers } from 'graphql/types/getDiagnosticsData';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
import { TEST_COLLECTION_TYPE } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      '& >div >img': {
        width: 24,
        height: 24,
        [theme.breakpoints.down('xs')]: {
          display: 'none !important',
        },
      },
    },
    card: {
      padding: 7,
      outline: 'none',
    },
    cardWrap: {
      padding: 8,
      position: 'relative',
      backgroundColor: '#fff',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      [theme.breakpoints.down('xs')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    productIcon: {
      textAlign: 'center',
      '& img': {
        maxWidth: 70,
        margin: 'auto',
      },
    },
    productTitle: {
      fontSize: 14,
      color: '#01475b',
      fontWeight: 500,
      textAlign: 'center',
      paddingTop: 8,
      minHeight: 70,
      maxHeight: 70,
      overflow: 'hidden',
    },
    bottomSection: {
      borderTop: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      marginTop: 8,
      paddingTop: 8,
      textAlign: 'center',
    },
    priceGroup: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#01475b',
    },
    regularPrice: {
      fontWeight: 500,
      opacity: 0.6,
      paddingRight: 5,
    },
    addToCart: {
      paddingTop: 8,
      '& button': {
        color: '#fc9916',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: 'auto',
      },
    },
    offerPrice: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.palette.common.white,
      position: 'absolute',
      right: 0,
      top: 0,
      backgroundColor: '#fcb716',
      width: 38,
      textAlign: 'center',
      '& span': {
        zIndex: 2,
        position: 'relative',
      },
      '&:before': {
        content: '""',
        width: 0,
        height: 0,
        borderWidth: '10px 19px',
        borderStyle: 'solid',
        borderColor: '#fcb716  #fcb716 transparent #fcb716',
        position: 'absolute',
        top: 10,
        right: 0,
        zIndex: 1,
      },
    },
  };
});

interface HotSellerProps {
  data: (getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers | null)[] | null;
  isLoading: boolean;
}

export const HotSellers: React.FC<HotSellerProps> = (props) => {
  const classes = useStyles({});
  const { addCartItem, removeCartItem, diagnosticsCartItems } = useDiagnosticsCart();
  const { data, isLoading } = props;
  const sliderSettings = {
    infinite: data && data.length > 6 ? true : false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: <img src={require('images/ic_arrow_right.svg')} alt="" />,
    prevArrow: <img src={require('images/ic_arrow_left.svg')} alt="" />,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: data && data.length > 6 ? true : false,
          dots: true,
          centerPadding: '50px',
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
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          nextArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
          prevArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
        },
      },
    ],
  };

  const itemIndexInCart = (item: getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers) => {
    return diagnosticsCartItems.findIndex((cartItem) => cartItem.id == `${item.id}`);
  };

  if (isLoading) {
    return <CircularProgress size={22} />;
  }

  return (
    <div className={classes.root}>
      <Slider {...sliderSettings}>
        {data &&
          data.map(
            (hotSeller: getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers | null) =>
              hotSeller && (
                <div className={classes.card}>
                  <div className={classes.cardWrap}>
                    <div
                      className={classes.productIcon}
                      onClick={() =>
                        (window.location.href = clientRoutes.testDetailsHotseller(
                          'hotSeller', hotSeller.diagnostics ? hotSeller.diagnostics.itemId.toString() : ''
                        ))
                      }
                    >
                      {hotSeller.packageImage ? (
                        <img src={hotSeller.packageImage} alt="" />
                      ) : (
                          <img src={require('images/shopby/ic_stomach.svg')} alt="" />
                        )}
                    </div>
                    <div className={classes.productTitle}>{hotSeller.packageName}</div>
                    <div className={classes.bottomSection}>
                      <div className={classes.priceGroup}>
                        <span className={classes.regularPrice}>(Rs. {hotSeller.price})</span>
                        <span>Rs. {hotSeller.price} </span>
                      </div>
                      <div className={classes.addToCart}>
                        {itemIndexInCart(hotSeller) === -1 ? (
                          <AphButton
                            onClick={() =>
                              addCartItem &&
                              addCartItem({
                                itemId: hotSeller.diagnostics
                                  ? `${hotSeller.diagnostics.itemId}`
                                  : '',
                                id: hotSeller.id,
                                mou: data.length,
                                name: hotSeller.packageName || '',
                                price: hotSeller.diagnostics ? hotSeller.diagnostics.rate : 0,
                                thumbnail: hotSeller.packageImage,
                                collectionMethod: hotSeller.diagnostics
                                  ? hotSeller.diagnostics.collectionType
                                  : null,
                              })
                            }
                          >
                            Add To Cart
                          </AphButton>
                        ) : (
                            <AphButton
                              onClick={() => {
                                removeCartItem &&
                                  removeCartItem(
                                    hotSeller.id,
                                    hotSeller.diagnostics ? `${hotSeller.diagnostics.itemId}` : ''
                                  );
                              }}
                            >
                              remove
                            </AphButton>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )
          )}
      </Slider>
    </div >
  );
};
