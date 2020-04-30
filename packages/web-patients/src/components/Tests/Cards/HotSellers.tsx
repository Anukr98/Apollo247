import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import Slider from 'react-slick';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers } from 'graphql/types/getDiagnosticsData';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
import { TEST_COLLECTION_TYPE } from 'graphql/types/globalTypes';
import _replace from 'lodash/replace';
import axios from 'axios';

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
      textDecoration: 'line-through',
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
  const [loading, setLoading] = useState(false);
  const apiDetails = {
    url: process.env.GET_PACKAGE_DATA,
  };

  const TestApiCredentials = {
    UserName: process.env.TEST_DETAILS_PACKAGE_USERNAME,
    Password: process.env.TEST_DETAILS_PACKAGE_PASSWORD,
    InterfaceClient: process.env.TEST_DETAILS_PACKAGE_INTERFACE_CLIENT,
  };

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
    return diagnosticsCartItems.findIndex(
      (cartItem) => cartItem.id == `${item && item.diagnostics ? item.diagnostics.id : ''}`
    );
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
                        (window.location.href = clientRoutes.testDetails(
                          'hot-seller',
                          hotSeller.packageName
                            ? hotSeller.packageName
                                .replace(/\s/g, '_')
                                .replace('_-_', '-')
                                .toLowerCase()
                            : ' ',
                          hotSeller.diagnostics ? hotSeller.diagnostics.itemId.toString() : ' '
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
                        <div>Rs. {hotSeller.price} </div>
                        {/* <div className={classes.regularPrice}>(Rs. {hotSeller.price})</div> */}
                      </div>
                      <div className={classes.addToCart}>
                        {itemIndexInCart(hotSeller) === -1 ? (
                          <AphButton
                            onClick={() => {
                              setLoading(true);
                              axios
                                .post(apiDetails.url || '', {
                                  ...TestApiCredentials,
                                  ItemID: hotSeller.diagnostics
                                    ? `${hotSeller.diagnostics.itemId}`
                                    : '',
                                })
                                .then((data: any) => {
                                  if (data && data.data && data.data.data && data.data.data) {
                                    const details = data.data.data;
                                    if (details && details.length > 0) {
                                      const price = hotSeller.diagnostics
                                        ? hotSeller.diagnostics.rate
                                        : 0;
                                      addCartItem &&
                                        addCartItem({
                                          itemId: hotSeller.diagnostics
                                            ? `${hotSeller.diagnostics.itemId}`
                                            : '',
                                          id: hotSeller.diagnostics ? hotSeller.diagnostics.id : '',
                                          mou:
                                            details && details.length
                                              ? details && details.length
                                              : 0,
                                          name: hotSeller.packageName || '',
                                          price,
                                          thumbnail: hotSeller.packageImage,
                                          collectionMethod: hotSeller.diagnostics
                                            ? hotSeller.diagnostics.collectionType
                                            : null,
                                        });
                                      /**Gtm code start  */
                                      window.gep &&
                                        window.gep(
                                          'Pharmacy',
                                          'Add to Cart',
                                          hotSeller.packageName,
                                          price
                                        );
                                      /**Gtm code End  */
                                    }
                                    setLoading(false);
                                  }
                                })
                                .catch((e: any) => {
                                  setLoading(false);
                                });
                            }}
                          >
                            Add To Cart
                          </AphButton>
                        ) : (
                          <AphButton
                            onClick={() => {
                              /**Gtm code start  */
                              window.gep &&
                                window.gep(
                                  'Pharmacy',
                                  'Remove From Cart',
                                  hotSeller.packageName,
                                  hotSeller.diagnostics ? hotSeller.diagnostics.rate : 0
                                );
                              /**Gtm code End  */
                              removeCartItem &&
                                removeCartItem(
                                  hotSeller.diagnostics ? hotSeller.diagnostics.id : '',
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
    </div>
  );
};
