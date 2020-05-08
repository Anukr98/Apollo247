import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';
import { Brand } from './../../helpers/MedicineApiCalls';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from 'helpers/onePrimaryUser';
import { Help } from 'components/Help/Help';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    viewAllBrands: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        zIndex: 999,
        top: 0,
        width: '100%',
      },
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
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
        position: 'fixed',
      },
    },
    headerTitle: {
      [theme.breakpoints.down('xs')]: {
        flex: 1,
        textAlign: 'center',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      zIndex: 2,
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
      },
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
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
        margin: 0,
        marginTop: 55,
        position: 'relative',
        paddingLeft: 14,
        zIndex: 999,
      },
      '& ul': {
        margin: 0,
        padding: 0,
        display: 'flex',
        textAlign: 'center',
        listStyleType: 'none',
        '& li': {
          flexGrow: 1,
          [theme.breakpoints.down('xs')]: {
            minWidth: 50,
          },
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
    backHeader: {
      backgroundColor: '#fff',
      padding: 16,
      fontSize: 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& button': {
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
      '& >span': {
        width: 'calc(100% - 48px)',
        textAlign: 'center',
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
    },
    loader: {
      textAlign: 'center',
      margin: '10px auto',
      display: 'block',
    },
    scrollbar: {
      [theme.breakpoints.down(900)]: {
        maxHeight: 'calc(100vh - 149px) !important',
        '& > div': {
          maxHeight: 'calc(100vh - 149px) !important',
        },
      },
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
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
      },
    },
    brandType: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      width: 80,
      padding: 4,
      [theme.breakpoints.down('xs')]: {
        opacity: 0,
        width: 'auto',
        fontSize: 0,
      },
    },
    brandList: {
      fontSize: 16,
      color: '#01475b',
      width: 'calc(100% - 80px)',
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        flexGrow: 1,
        alignItems: 'center',
      },
      '& ul': {
        margin: 0,
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        [theme.breakpoints.down('xs')]: {
          display: 'block',
        },
        '& li': {
          width: '25%',
          listStyleType: 'none',
          padding: 4,
          [theme.breakpoints.down('xs')]: {
            width: '100%',
            borderBottom: '0.5px solid rgba(2,71,91,0.3)',
            marginTop: 15,
            display: 'flex',
            '& a': {
              textTransform: 'lowercase',
              width: '100%',
              '&:first-letter': {
                textTransform: 'capitalize',
              },
            },
          },
        },
      },
    },
    arrowIcon: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        marginLeft: 'auto',
        float: 'right',
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
  };
});
export interface filter {
  key: String;
  value: Brand;
}

export const ViewAllBrands: React.FC = (props) => {
  const apiDetails = {
    url: process.env.PHARMACY_MED_ALL_BRAND_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };
  const classes = useStyles({});

  const alphabets: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const [selectedAlphabates, setSelectedAlphabates] = useState('a');
  const alphabetFilter = alphabets.map((letter, index) => (
    <li key={index}>
      <a href={'#' + letter} onClick={() => setSelectedAlphabates(letter)}>
        {letter}
      </a>
    </li>
  ));
  const [data, setData] = useState<Brand[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showData, setShowData] = useState<filter[] | []>([]);
  const onePrimaryUser = hasOnePrimaryUser();

  useEffect(() => {
    if (!data) {
      setIsLoading(true);
      axios
        .post(
          apiDetails.url!,
          {},
          {
            headers: {
              Authorization: apiDetails.authToken,
              Accept: '*/*',
            },
          }
        )
        .then((res) => {
          if (res && res.data && res.data.brands) setData(res.data.brands);
          setIsLoading(false);
        })
        .catch((e) => {
          setIsLoading(false);
        });
    }
  }, [data]);

  useEffect(() => {
    let filterData: filter[] = [];
    if (data && data.length > 0) {
      data.map((val: Brand, index: number) => {
        var obj = {
          key: val.title.substring(0, 1),
          value: val,
        };
        filterData.push(obj);
      });
    }
    setShowData(filterData);
    if (showData && showData.length > 0) {
    }
  }, [selectedAlphabates, data]);

  const groupBy = (list: filter[], keyGetter: (brand: filter) => String) => {
    const map = new Map();
    list &&
      list.forEach((item: filter) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
          map.set(key, [item]);
        } else {
          collection.push(item);
        }
      });
    return map;
  };
  const grouped = groupBy(showData, (brand: filter) => brand.key);
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.viewAllBrands}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => (window.location.href = clientRoutes.medicines())}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            <div className={classes.headerTitle}>Shop By Brand</div>
          </div>
          <div className={classes.filterHeader}>
            <Scrollbars autoHide={true} autoHeight>
              <ul>{alphabetFilter}</ul>
            </Scrollbars>
          </div>
          <Scrollbars
            className={classes.scrollbar}
            autoHide={true}
            autoHeight
            autoHeightMax={'calc(100vh - 250px)'}
          >
            <div className={classes.filterSection}>
              {isLoading ? (
                <CircularProgress className={classes.loader} size={40} />
              ) : (
                <div className={classes.customScroll}>
                  {alphabets.map((alpha: string, index: number) => (
                    <div key={index} className={classes.brandRow}>
                      <div id={alpha} className={classes.brandType}>
                        {alpha.toUpperCase()}
                      </div>
                      <div className={classes.brandList}>
                        <ul>
                          {showData &&
                            showData.length > 0 &&
                            grouped.get(alpha.toUpperCase()) &&
                            grouped.get(alpha.toUpperCase()).length > 0 &&
                            grouped.get(alpha.toUpperCase()).map((brand: filter) => (
                              <li>
                                <Link
                                  to={clientRoutes.searchByMedicine(
                                    'search-by-brand',
                                    brand.value.category_id
                                  )}
                                >
                                  {brand.value.title}
                                  <img
                                    className={classes.arrowIcon}
                                    src={require('images/ic_arrow_right.svg')}
                                    alt=""
                                  />
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>
      <div className={classes.footerLinks}>
        {onePrimaryUser ? <Help /> : <ManageProfile />}
        <BottomLinks />
      </div>
      <NavigationBottom />
    </div>
  );
};
