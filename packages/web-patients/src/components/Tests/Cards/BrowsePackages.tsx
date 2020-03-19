import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Slider from 'react-slick';
import { AphButton } from '@aph/web-ui-components';

import { getDiagnosticsData_getDiagnosticsData_diagnosticOrgans } from 'graphql/types/getDiagnosticsData';

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
    cardLink: {
      position: 'relative',
      display: 'block',
    },
    cardWrap: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: '14px 12px 14px 15px',
      [theme.breakpoints.down('xs')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    testDetails: {
      display: 'flex',
    },
    testName: {
      fontSize: 16,
      fontWeight: 600,
      color: '02475b',
      marginBottom: 8,
    },
    testsIncluded: {
      fontSize: 10,
      fontWeight: 600,
      color: '02475b',
      marginBottom: 16,
    },
    testsCondition: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
    },
    cardIcon: {
      // width: '100%',
    },
    bottomSection: {
      borderTop: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      marginTop: 12,
      paddingTop: 12,
      display: 'flex',
      alignItems: 'center',
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
      marginLeft: 'auto',
      '& button': {
        color: '#fc9916',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: 'auto',
      },
    },
  };
});

interface BrowsePackagesProps {
  data: (getDiagnosticsData_getDiagnosticsData_diagnosticOrgans | null)[] | null;
}

export const BrowsePackages: React.FC<BrowsePackagesProps> = (props) => {
  const classes = useStyles({});
  const { data } = props;
  const sliderSettings = {
    infinite: data && data.length > 3 ? true : false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <img src={require('images/ic_arrow_right.svg')} alt="" />,
    prevArrow: <img src={require('images/ic_arrow_left.svg')} alt="" />,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: data && data.length > 3 ? true : false,
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
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          nextArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
          prevArrow: <img src={require('images/ic_white_arrow_right.svg')} alt="" />,
        },
      },
    ],
  };

  return (
    <div className={classes.root}>
      <Slider {...sliderSettings}>
        {data &&
          data.map(
            (
              diagnosticOrgans: getDiagnosticsData_getDiagnosticsData_diagnosticOrgans | null,
              index
            ) =>
              diagnosticOrgans && (
                <div key={index} className={classes.card}>
                  <Link
                    className={classes.cardLink}
                    to={clientRoutes.searchByTest(
                      diagnosticOrgans.diagnostics
                        ? diagnosticOrgans.diagnostics.itemId.toString()
                        : ''
                    )}
                  >
                    <div className={classes.cardWrap}>
                      <div className={classes.testDetails}>
                        <div>
                          <div className={classes.testName}>{diagnosticOrgans.organName} </div>
                          {/* <div className={classes.testsIncluded}>66 TESTS INCLUDED</div>
                      <div className={classes.testsCondition}>
                        Ideal for individuals between 20-40 years.
                      </div> */}
                        </div>
                        <div className={classes.cardIcon}>
                          {diagnosticOrgans.organImage ? (
                            <img src={diagnosticOrgans.organImage} alt="" />
                          ) : (
                            <img src={require('images/shopby/ic_stomach.svg')} alt="" />
                          )}
                        </div>
                      </div>
                      <div className={classes.bottomSection}>
                        {diagnosticOrgans && diagnosticOrgans.diagnostics && (
                          <div className={classes.priceGroup}>
                            <span className={classes.regularPrice}>
                              ({diagnosticOrgans.diagnostics.rate})
                            </span>
                            <span>Rs. {diagnosticOrgans.diagnostics.rate} </span>
                          </div>
                        )}
                        <div className={classes.addToCart}>
                          <AphButton>Book Now</AphButton>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
          )}
      </Slider>
    </div>
  );
};
