import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 88,
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    viewAllBrands: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    filterHeader: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      marginLeft: 20,
      marginRight: 20,
      '& ul': {
        margin: 0,
        padding: 0,
        display: 'flex',
        textAlign: 'center',
        listStyleType: 'none',
        '& li': {
          flexGrow: 1,
          '& a': {
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(2,71,91,0.6)',
            padding: '16px 5px',
            textTransform: 'uppercase',
            display: 'block',
            borderBottom: '4px solid transparent',
          },
        },
      },
    },
    filterActive: {
      '& a': {
        borderBottom: '4px solid #00b38e !important',
        color: 'rgba(2,71,91,1) !important',
      },
    },
    filterSection: {
      paddingLeft: 20,
      paddingRight: 5,
    },
    customScroll: {
      paddingRight: 15,
      paddingBottom: 10,
    },
    brandRow: {
      paddingTop: 8,
      paddingBottom: 8,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    brandType: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      width: 80,
      padding: 4,
    },
    brandList: {
      fontSize: 16,
      color: '#01475b',
      width: 'calc(100% - 80px)',
      fontWeight: 500,
      '& ul': {
        margin: 0,
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        '& li': {
          width: '25%',
          listStyleType: 'none',
          padding: 4,
        },
      },
    },
  };
});

export const ViewAllBrands: React.FC = (props) => {
  const classes = useStyles();
  const alphabets = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  const alphabetFilter = alphabets.map((letter, index) => (
    <li key={index}>
      <a href={'#' + letter}>{letter}</a>
    </li>
  ));
  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.viewAllBrands}>
          <div className={classes.breadcrumbs}>
            <Link to={clientRoutes.medicines()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            Shop By Brand
          </div>
          <div className={classes.filterHeader}>
            <ul>{alphabetFilter}</ul>
          </div>
          <div className={classes.filterSection}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 212px)'}>
              <div className={classes.customScroll}>
                <div className={classes.brandRow}>
                  <div id="a" className={classes.brandType}>
                    A
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>A-Derma</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>A-Derma</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>A-Derma</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>A-Derma</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Accucheck</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Accucheck</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Accucheck</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Accucheck</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Acnestar</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Acnestar</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Acnestar</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Acnestar</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Acti Life</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Acti Life</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Acti Life</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Acti Life</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Adidas</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Adidas</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Adidas</Link>
                      </li>
                      <li>
                        <Link to={clientRoutes.medicineSearchByBrand()}>Adidas</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="b" className={classes.brandType}>
                    B
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="c" className={classes.brandType}>
                    C
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="d" className={classes.brandType}>
                    D
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">A-Derma</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Accucheck</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acnestar</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Acti Life</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                      <li>
                        <Link to="">Adidas</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  );
};
