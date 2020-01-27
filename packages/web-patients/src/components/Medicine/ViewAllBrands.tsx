import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';
import { Brand } from './../../helpers/MedicineApiCalls';

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
export interface filter {
  key: String;
  value: Brand;
}

export const ViewAllBrands: React.FC = (props) => {
  const apiDetails = {
    url: `${
      process.env.NODE_ENV === 'production'
        ? process.env.PHARMACY_MED_PROD_URL
        : process.env.PHARMACY_MED_UAT_URL
    }/allbrands_api.php`,
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
            {isLoading ? (
              <CircularProgress size={40} />
            ) : (
              <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 212px)'}>
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
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </Scrollbars>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
