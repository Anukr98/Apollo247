import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';
import { Brand } from './../../helpers/MedicineApiCalls';

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
export interface filter {
  key: string;
  value: Brand;
}

export const ViewAllBrands: React.FC = (props) => {
  const apiDetails = {
    url: process.env.ALL_BRANDS,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };
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
  const [selectedAlphabates, setSelectedAlphabates] = useState('a');
  const alphabetFilter = alphabets.map((letter, index) => (
    <li key={index}>
      <a href={'#' + letter} onClick={() => setSelectedAlphabates(letter)}>
        {letter}
      </a>
    </li>
  ));
  const [data, setData] = useState<Brand[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState<filter[] | null>([]);

  const getAllBrands = async () => {
    await axios
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
      .then((res: any) => {
        if (res && res.data && res.data.brands) setData(res.data.brands);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };
  useEffect(() => {
    if (apiDetails.url != null) {
      getAllBrands();
    }
  }, []);

  useEffect(() => {
    let filterData: filter[] = [];
    if (data && data.length > 0) {
      data.map((val: Brand, index: number) => {
        console.log(val.title.substring(0, 1), selectedAlphabates.toLocaleUpperCase());
        var obj = {
          key: val.title.substring(0, 1),
          value: val,
        };
        filterData.push(obj);
      });
      console.log(filterData);
    }
    setShowData(filterData);
    if (showData && showData.length > 0) {
      console.log(grouped.get('A'));
    }
  }, [selectedAlphabates, data]);
  const groupBy = (list: any, keyGetter: any) => {
    const map = new Map();
    list &&
      list.forEach((item: any) => {
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
  const grouped = groupBy(showData, (brand: any) => brand.key);
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
                    {selectedAlphabates.toLocaleUpperCase()}
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('A').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="b" className={classes.brandType}>
                    B
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('B').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="c" className={classes.brandType}>
                    C
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('C').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="d" className={classes.brandType}>
                    D
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('D').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={classes.brandRow}>
                  <div id="e" className={classes.brandType}>
                    E
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('E').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="f" className={classes.brandType}>
                    F
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('F').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={classes.brandRow}>
                  <div id="g" className={classes.brandType}>
                    G
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('G').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="h" className={classes.brandType}>
                    H
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('H').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="i" className={classes.brandType}>
                    I
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('I').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="j" className={classes.brandType}>
                    J
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('J').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={classes.brandRow}>
                  <div id="k" className={classes.brandType}>
                    K
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('K').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={classes.brandRow}>
                  <div id="l" className={classes.brandType}>
                    L
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('L').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={classes.brandRow}>
                  <div id="m" className={classes.brandType}>
                    M
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('M').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="n" className={classes.brandType}>
                    N
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('N').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={classes.brandRow}>
                  <div id="o" className={classes.brandType}>
                    O
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('O').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="p" className={classes.brandType}>
                    P
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('P').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="q" className={classes.brandType}>
                    Q
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('Q').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="r" className={classes.brandType}>
                    R
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('R').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="s" className={classes.brandType}>
                    S
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('S').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="t" className={classes.brandType}>
                    T
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('T').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="u" className={classes.brandType}>
                    U
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        (grouped.get('U') &&
                          grouped.get('U').length > 0 &&
                          grouped.get('U').map((brand: any) => (
                            <li>
                              <Link to={clientRoutes.medicineSearchByBrand()}>
                                {brand.value.title}
                              </Link>
                            </li>
                          )))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="v" className={classes.brandType}>
                    V
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('V').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className={classes.brandRow}>
                  <div id="w" className={classes.brandType}>
                    W
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        (grouped.get('W') &&
                          grouped.get('W').length > 0 &&
                          grouped.get('W').map((brand: any) => (
                            <li>
                              <Link to={clientRoutes.medicineSearchByBrand()}>
                                {brand.value.title}
                              </Link>
                            </li>
                          )))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="x" className={classes.brandType}>
                    X
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        (grouped.get('X') &&
                          grouped.get('X').length > 0 &&
                          grouped.get('X').map((brand: any) => (
                            <li>
                              <Link to={clientRoutes.medicineSearchByBrand()}>
                                {brand.value.title}
                              </Link>
                            </li>
                          )))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="y" className={classes.brandType}>
                    Y
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('Y').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className={classes.brandRow}>
                  <div id="z" className={classes.brandType}>
                    Z
                  </div>
                  <div className={classes.brandList}>
                    <ul>
                      {showData &&
                        showData.length > 0 &&
                        grouped.get('Z').map((brand: any) => (
                          <li>
                            <Link to={clientRoutes.medicineSearchByBrand()}>
                              {brand.value.title}
                            </Link>
                          </li>
                        ))}
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
