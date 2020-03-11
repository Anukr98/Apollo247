import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { clientRoutes } from 'helpers/clientRoutes';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineFilter } from 'components/Medicine/MedicineFilter';
import { MedicineListscard } from 'components/Medicine/MedicineListscard';
import { MedicinesCartContext } from 'components/MedicinesCartProvider';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';
import { useParams } from 'hooks/routerHooks';
import axios from 'axios';
import _lowerCase from 'lodash/lowerCase';
import _replace from 'lodash/replace';
import { MedicineCard } from 'components/Medicine/MedicineCard';
import { AphButton } from '@aph/web-ui-components';
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
    searchByBrandPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 999,
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
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: 'space-between',
      },
    },
    brandListingSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingTop: 20,
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
      [theme.breakpoints.down('xs')]: {
        marginRight: 10,
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
    customScroll: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 10,
    },
    filterBtn: {
      boxShadow: 'none',
      padding: 0,
      minWidth: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    scrollBar: {
      height: 'calc(100vh - 195px) !important',
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 245px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        height: 'calc(100vh - 190px) !important',
      },
    },
  };
});

const apiDetails = {
  url: process.env.PHARMACY_MED_CATEGORY_LIST,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
};
const apiDetailsText = {
  url: process.env.PHARMACY_MED_SEARCH_URL,
};
type Params = { searchMedicineType: string; searchText: string };

export const SearchByMedicine: React.FC = (props) => {
  const classes = useStyles({});
  const [priceFilter, setPriceFilter] = useState();
  const [discountFilter, setDiscountFilter] = useState();
  const [filterData, setFilterData] = useState();
  const [medicineList, setMedicineList] = useState<MedicineProduct[] | null>(null);
  const [medicineListFiltered, setMedicineListFiltered] = useState<MedicineProduct[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('');

  const getTitle = () => {
    let title = params.searchMedicineType;
    if (params.searchMedicineType.includes('-')) {
      title = _replace(title, '-', ' ');
    }
    if (params.searchMedicineType.includes('_')) {
      title = _replace(title, '_', ' & ');
    }
    return title;
  };

  const params = useParams<Params>();
  const paramSearchText = params.searchText;

  const onSearchMedicine = async () => {
    setIsLoading(true);
    await axios
      .post(
        apiDetailsText.url,
        {
          params: paramSearchText,
        },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        setMedicineList(data.products);
        setMedicineListFiltered(data.products);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!medicineList && Number(paramSearchText) > 0) {
      setIsLoading(true);
      axios
        .post(
          apiDetails.url || '',
          {
            category_id: paramSearchText,
            page_id: 1,
          },
          {
            headers: {
              Authorization: apiDetails.authToken,
              Accept: '*/*',
            },
          }
        )
        .then(({ data }) => {
          if (data && data.products) {
            setMedicineList(data.products);
            setIsLoading(false);
          }
        })
        .catch((e) => {
          setIsLoading(false);
        });
    } else if (!medicineList && paramSearchText.length > 0) {
      onSearchMedicine();
    } else {
      setMedicineListFiltered(medicineList);
    }
  }, [medicineList]);

  const getSpecialPrice = (special_price?: string | number) =>
    special_price
      ? typeof special_price == 'string'
        ? parseInt(special_price)
        : special_price
      : null;

  useEffect(() => {
    let priceFilterArray: MedicineProduct[] | null = null;
    if (
      priceFilter &&
      !priceFilter.fromPrice &&
      !priceFilter.toPrice &&
      filterData &&
      filterData[0] === '' &&
      discountFilter &&
      discountFilter.fromDiscount === 0 &&
      discountFilter.toDiscount === 100 &&
      sortBy === ''
    ) {
      setMedicineListFiltered(medicineList);
      return;
    } else if (priceFilter && (priceFilter.fromPrice || priceFilter.toPrice)) {
      if (priceFilter.fromPrice && priceFilter.toPrice) {
        priceFilterArray =
          medicineList &&
          medicineList.filter((value) => {
            if (Number(priceFilter.fromPrice) <= value.price) {
              if (value.price <= Number(priceFilter.toPrice)) {
                return value;
              }
            }
          });
      } else if (priceFilter.fromPrice) {
        priceFilterArray =
          medicineList &&
          medicineList.filter((value) => {
            if (Number(priceFilter.fromPrice) <= value.price) {
              return value;
            }
          });
      } else if (priceFilter.toPrice) {
        priceFilterArray =
          medicineList &&
          medicineList.filter((value) => {
            if (value.price <= Number(priceFilter.toPrice)) {
              return value;
            }
          });
      }
    } else if (priceFilter && !priceFilter.fromPrice && !priceFilter.toPrice) {
      priceFilterArray = medicineList && medicineList.length > 0 ? medicineList : [];
    }

    //Sort By
    if (sortBy.length > 0) {
      const filteredArray = !priceFilterArray ? medicineList || [] : priceFilterArray;
      if (sortBy === 'Price-L-H') {
        priceFilterArray = filteredArray.sort((med1: MedicineProduct, med2: MedicineProduct) => {
          return (
            getSpecialPrice(med1.special_price || med1.price)! -
            getSpecialPrice(med2.special_price || med2.price)!
          );
        });
      } else if (sortBy === 'Price-H-L') {
        priceFilterArray = filteredArray.sort((med1: MedicineProduct, med2: MedicineProduct) => {
          return (
            getSpecialPrice(med2.special_price || med2.price)! -
            getSpecialPrice(med1.special_price || med1.price)!
          );
        });
      } else if (sortBy === 'A-Z') {
        priceFilterArray = filteredArray.sort((med1: MedicineProduct, med2: MedicineProduct) =>
          med1.name < med2.name ? -1 : med1.name > med2.name ? 1 : 0
        );
      } else if (sortBy === 'Z-A') {
        priceFilterArray = filteredArray.sort((med1: MedicineProduct, med2: MedicineProduct) =>
          med1.name > med2.name ? -1 : med1.name < med2.name ? 1 : 0
        );
      }
    }

    if (discountFilter && discountFilter.fromDiscount >= 0 && discountFilter.toDiscount <= 100) {
      const filteredArray = !priceFilterArray ? medicineList || [] : priceFilterArray;
      priceFilterArray = filteredArray.filter((item) => {
        if (item.special_price) {
          const specialPrice = getSpecialPrice(item.special_price);
          const discountPercentage = ((item.price - specialPrice!) / item.price) * 100;

          return discountPercentage >= (discountFilter.fromDiscount || 0) &&
            discountPercentage <= discountFilter.toDiscount
            ? true
            : false;
        }
      });
    }
    if (filterData && filterData.length > 0 && filterData[0] !== '') {
      const categoryFilterArray: MedicineProduct[] = [];
      const filteredArray = !priceFilterArray ? medicineList || [] : priceFilterArray;
      filterData &&
        filterData.map((filter: string) => {
          filteredArray.length > 0 &&
            filteredArray.map((value) => {
              if (value.category_id === filter) {
                categoryFilterArray.push(value);
              }
            });
        });
      priceFilterArray = categoryFilterArray;
    }
    setMedicineListFiltered(priceFilterArray);
  }, [priceFilter, filterData, discountFilter, sortBy]);

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.searchByBrandPage}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => window.history.back()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            <div>
              {getTitle()} ({medicineListFiltered && medicineListFiltered.length})
            </div>
            <AphButton className={classes.filterBtn}>
              <img src={require('images/ic_filter.svg')} alt="" />
            </AphButton>
          </div>
          <div className={classes.brandListingSection}>
            <MedicineFilter
              setMedicineList={setMedicineList}
              setPriceFilter={setPriceFilter}
              setDiscountFilter={setDiscountFilter}
              setFilterData={setFilterData}
              setSortBy={setSortBy}
            />
            <div className={classes.searchSection}>
              <Scrollbars className={classes.scrollBar} autoHide={true}>
                <div className={classes.customScroll}>
                  <MedicinesCartContext.Consumer>
                    {() =>
                      params.searchMedicineType === 'search-by-brand' ? (
                        <MedicineCard medicineList={medicineListFiltered} isLoading={isLoading} />
                      ) : (
                        <MedicineListscard
                          medicineList={medicineListFiltered}
                          isLoading={isLoading}
                        />
                      )
                    }
                  </MedicinesCartContext.Consumer>
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </div>
      <NavigationBottom />
    </div>
  );
};
