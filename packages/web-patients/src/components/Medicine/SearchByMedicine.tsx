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

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
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
        paddingRight: 20,
        paddingTop: 14,
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
    customScroll: {
      paddingLeft: 20,
      paddingRight: 17,
      paddingBottom: 10,
    },
  };
});

export const SearchByMedicine: React.FC = (props) => {
  const classes = useStyles({});
  const [priceFilter, setPriceFilter] = useState();
  const [filterData, setFilterData] = useState();
  const [catageryFilterData, setCatageryFilterData] = useState<MedicineProduct[] | null>([]);
  const [medicineList, setMedicineList] = useState<MedicineProduct[] | null>(null);
  const [medicineListFiltered, setMedicineListFiltered] = useState<MedicineProduct[] | null>(null);

  const getTitle = () => {
    return _replace(_lowerCase(params.searchMedicineType), '-', ' ');
  };
  type Params = { searchMedicineType: string; searchText: string };

  const apiDetails = {
    url: `${process.env.PHARMACY_MED_PROD_URL}/categoryproducts_api.php`,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };
  const apiDetailsText = {
    url: process.env.PHARMACY_MED_SEARCH_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  };
  const params = useParams<Params>();
  const paramSearchText = params.searchText;

  useEffect(() => {
    if (
      !medicineListFiltered ||
      (medicineListFiltered && medicineListFiltered.length < 1 && Number(paramSearchText) > 0)
    ) {
      axios
        .post(
          apiDetails.url,
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
        .then((res) => {
          if (res && res.data && res.data.products) {
            setMedicineList(res.data.products);
            setMedicineListFiltered(res.data.products);
          }
        })
        .catch((e) => {});
    } else if (!medicineListFiltered || (medicineListFiltered && medicineListFiltered.length < 1)) {
      onSearchMedicine();
    }
  }, [medicineListFiltered]);
  const onSearchMedicine = async () => {
    await axios
      .post(
        apiDetailsText.url,
        {
          params: paramSearchText,
        },
        {
          headers: {
            Authorization: apiDetailsText.authToken,
          },
        }
      )
      .then(({ data }) => {
        setMedicineList(data.products);
        setMedicineListFiltered(data.products);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    if (priceFilter && (priceFilter.fromPrice || priceFilter.toPrice)) {
      if (priceFilter.fromPrice && priceFilter.toPrice) {
        let filterArray: MedicineProduct[] = [];
        medicineListFiltered &&
          medicineListFiltered.map((value) => {
            if (Number(priceFilter.fromPrice) <= value.price) {
              if (value.price <= Number(priceFilter.toPrice)) {
                filterArray.push(value);
              }
            }
          });
        setMedicineList(filterArray);
        setCatageryFilterData(filterArray);
      } else if (priceFilter.fromPrice) {
        let filterArray: MedicineProduct[] = [];
        medicineListFiltered &&
          medicineListFiltered.map((value) => {
            if (Number(priceFilter.fromPrice) <= value.price) {
              filterArray.push(value);
            }
          });
        setMedicineList(filterArray);
        setCatageryFilterData(filterArray);
      } else if (priceFilter.toPrice) {
        let filterArray: MedicineProduct[] = [];
        medicineListFiltered &&
          medicineListFiltered.map((value) => {
            if (value.price <= Number(priceFilter.toPrice)) {
              filterArray.push(value);
            }
          });
        setMedicineList(filterArray);
        setCatageryFilterData(filterArray);
      }
      if (filterData && filterData.length > 0) {
        if (filterData[0] !== '') {
          let filterArray: MedicineProduct[] = [];
          if (catageryFilterData && catageryFilterData.length > 0) {
            filterData &&
              filterData.map((filter: string) => {
                catageryFilterData &&
                  catageryFilterData.map((value) => {
                    if (value.category_id === filter) {
                      filterArray.push(value);
                    }
                  });
              });
            setMedicineList(filterArray);
          }
        }
      }
    } else if (filterData && filterData.length > 0) {
      if (filterData[0] !== '') {
        let filterArray: MedicineProduct[] = [];
        filterData &&
          filterData.map((filter: string) => {
            medicineListFiltered &&
              medicineListFiltered.map((value) => {
                if (value.category_id === filter) {
                  filterArray.push(value);
                }
              });
          });
        setMedicineList(filterArray);
      } else {
        setMedicineListFiltered([]);
      }
    } else {
      setMedicineListFiltered([]);
    }
  }, [priceFilter, filterData]);

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.searchByBrandPage}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => (window.location.href = clientRoutes.medicines())}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            {getTitle()}({medicineList && medicineList.length})
          </div>
          <div className={classes.brandListingSection}>
            <MedicineFilter
              setMedicineList={setMedicineList}
              setPriceFilter={setPriceFilter}
              setFilterData={setFilterData}
            />
            <div className={classes.searchSection}>
              <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 195px'}>
                <div className={classes.customScroll}>
                  <MedicinesCartContext.Consumer>
                    {() =>
                      params.searchMedicineType === '' ? (
                        <MedicineCard medicineList={medicineList} />
                      ) : (
                        <MedicineListscard medicineList={medicineList} />
                      )
                    }
                  </MedicinesCartContext.Consumer>
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
