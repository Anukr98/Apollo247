import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useParams } from 'hooks/routerHooks';
import axios from 'axios';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      paddingTop: 10,
      width: 328,
      borderRadius: 5,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
        paddingTop: 0,
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
        width: '100%',
        height: 'auto',
      },
    },
    filterSection: {
      padding: '20px 5px 0 10px',
      paddingTop: 15,
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        top: -52,
        zIndex: 999,
        backgroundColor: '#f0f1ec',
        width: '100%',
        padding: 0,
        display: 'none',
      },
    },
    customScroll: {
      width: '100%',
      paddingLeft: 10,
      paddingRight: 15,
      paddingBottom: 10,
      [theme.breakpoints.down('xs')]: {
        padding: '0 0 10px 0',
      },
    },
    searchInput: {
      paddingLeft: 20,
      paddingRight: 20,
      position: 'relative',
      '& input': {
        paddingRight: 30,
      },
    },
    refreshBtn: {
      position: 'absolute',
      right: 20,
      top: 6,
      boxShadow: 'none',
      padding: 0,
      minWidth: 'auto',
    },
    filterBox: {
      borderRadius: 5,
      backgroundColor: '#f7f8f5',
      padding: 10,
      marginTop: 5,
      [theme.breakpoints.down('xs')]: {
        marginBottom: 10,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    filterType: {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 500,
      paddingBottom: 5,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
    },
    calendarIcon: {
      marginLeft: 'auto',
      cursor: 'pointer',
      '& img': {
        maxWidth: 20,
        verticalAlign: 'bottom',
      },
    },
    boxContent: {
      paddingTop: 5,
      '& button:last-child': {
        marginRight: 0,
      },
    },
    button: {
      marginRight: 5,
      marginTop: 5,
      minWidth: 'auto',
      color: '#00b38e !important',
      letterSpacing: -0.27,
      borderRadius: 10,
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white + '!important',
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white + '!important',
      },
    },
    filterBy: {
      display: 'flex',
      color: '#02475b',
      fontSize: 12,
      alignItems: 'center',
      paddingTop: 5,
      '& >div': {
        backgroundColor: theme.palette.common.white,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        borderRadius: 10,
        padding: '5px 10px',
        paddingTop: 0,
        '& input': {
          fontSize: 12,
          padding: '5px 0',
        },
      },
      '& span': {
        paddingLeft: 10,
        paddingRight: 10,
      },
    },
    filterHeader: {
      backgroundColor: '#fff',
      padding: 16,
      fontSize: 13,
      fontWeight: 500,
      alignItems: 'center',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: 5,
      display: 'none',
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
    filterScroll: {
      height: 'calc(100vh - 330px) !important',
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 370px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        height: 'calc(100vh - 155px) !important',
        marginBottom: 90,
      },
    },

    bottomActions: {
      padding: '10px 20px 20px 20px',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
        zIndex: 999,
        display: 'none',
      },
    },
  });
});
type priceFilter = { fromPrice: string; toPrice: string };
type discountFilter = { fromDiscount: string; toDiscount: string };

interface MedicineFilterProps {
  setMedicineList?: (medicineList: MedicineProduct[] | null) => void;
  setPriceFilter?: (priceFilter: priceFilter) => void;
  setFilterData?: (filterData: []) => void;
  setDiscountFilter?: (discountFilter: discountFilter) => void;
}

type Params = { searchMedicineType: string; searchText: string };

export const MedicineFilter: React.FC<MedicineFilterProps> = (props: any) => {
  const classes = useStyles({});
  const apiDetails = {
    url: process.env.PHARMACY_MED_SEARCH_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  };
  const [selectedCatagerys, setSelectedCatagerys] = useState(['']);
  const [selected, setSelected] = useState<boolean>(false);

  const params = useParams<Params>();
  const locationUrl = window.location.href;
  const [subtxt, setSubtxt] = useState<string>(
    params.searchMedicineType === 'search-medicines' ? params.searchText : ''
  );
  const [fromPrice, setFromPrice] = useState();
  const [toPrice, setToPrice] = useState();
  const [fromDiscount, setFromDiscount] = useState<string>('0');
  const [toDiscount, setToDiscount] = useState<string>('100');

  useEffect(() => {
    if (subtxt.length > 0 && subtxt !== params.searchText) {
      onSearchMedicine(subtxt);
    }
  }, [subtxt]);

  const onSearchMedicine = async (value: string | null) => {
    await axios
      .post(
        apiDetails.url,
        {
          params: value,
        },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        props.setMedicineList && props.setMedicineList(data.products);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const filterByCatagery = (value: string) => {
    let categoryList = selectedCatagerys;
    if (categoryList.includes(value)) {
      categoryList = categoryList.filter((category) => category !== value);
    } else {
      categoryList = value === '' ? [] : categoryList.filter((category) => category !== '');
      categoryList.push(value);
    }
    setSelectedCatagerys(categoryList);
    setSelected(true);
  };

  const filterByPriceAndCategory = () => {
    const obj = {
      fromPrice: fromPrice,
      toPrice: toPrice,
    };

    const discountObj = {
      fromDiscount: fromDiscount.length > 0 ? parseFloat(fromDiscount) : 0,
      toDiscount: toDiscount.length > 0 ? parseFloat(toDiscount) : 100,
    };
    if (!window.location.href.includes('search-by-brand')) {
      props.setFilterData(selectedCatagerys);
    }

    props.setPriceFilter(obj);
    props.setDiscountFilter(discountObj);
  };

  useEffect(() => {
    if (selected) {
      setSelectedCatagerys(selectedCatagerys);
      setSelected(false);
    }
  }, [selected]);

  return (
    <div className={classes.root}>
      <div className={classes.searchInput}>
        <AphTextField
          placeholder="Search med, brands and more"
          onChange={(e) => {
            setSubtxt(e.target.value);
          }}
          value={subtxt}
        />
      </div>
      <div className={`${classes.filterSection}`}>
        <div className={classes.filterHeader}>
          <AphButton>
            <img src={require('images/ic_cross.svg')} alt="" />
          </AphButton>
          <span>FILTERS</span>
          <AphButton>
            <img src={require('images/ic_refresh.svg')} alt="" />
          </AphButton>
        </div>
        <Scrollbars className={classes.filterScroll} autoHide={true}>
          <div className={classes.customScroll}>
            {locationUrl && locationUrl.includes('search-medicines') && (
              <div className={classes.filterBox}>
                <span>
                  <div className={classes.filterType}>Categories</div>

                  <div className={classes.boxContent}>
                    <AphButton
                      color="secondary"
                      size="small"
                      className={`${classes.button} ${
                        selectedCatagerys.includes('') ? classes.buttonActive : ''
                      }`}
                      onClick={(e) => {
                        filterByCatagery('');
                      }}
                    >
                      All
                    </AphButton>
                    <AphButton
                      color="secondary"
                      size="small"
                      className={`${classes.button} ${
                        selectedCatagerys.includes('14') ? classes.buttonActive : ''
                      }`}
                      onClick={(e) => {
                        filterByCatagery('14');
                      }}
                    >
                      Personal Care
                    </AphButton>
                    <AphButton
                      color="secondary"
                      size="small"
                      className={`${classes.button} ${
                        selectedCatagerys.includes('24') ? classes.buttonActive : ''
                      }`}
                      onClick={(e) => {
                        filterByCatagery('24');
                      }}
                    >
                      Mom &amp; Baby
                    </AphButton>
                    <AphButton
                      color="secondary"
                      size="small"
                      className={`${classes.button} ${
                        selectedCatagerys.includes('6') ? classes.buttonActive : ''
                      }`}
                      onClick={(e) => {
                        filterByCatagery('6');
                      }}
                    >
                      Nutrition
                    </AphButton>
                    <AphButton
                      color="secondary"
                      size="small"
                      className={`${classes.button} ${
                        selectedCatagerys.includes('71') ? classes.buttonActive : ''
                      }`}
                      onClick={(e) => {
                        filterByCatagery('71');
                      }}
                    >
                      Healthcare
                    </AphButton>
                    <AphButton
                      color="secondary"
                      size="small"
                      className={`${classes.button} ${
                        selectedCatagerys.includes('234') ? classes.buttonActive : ''
                      }`}
                      onClick={(e) => {
                        filterByCatagery('234');
                      }}
                    >
                      Special Offers
                    </AphButton>
                    <AphButton
                      color="secondary"
                      size="small"
                      className={`${classes.button} ${
                        selectedCatagerys.includes('97') ? classes.buttonActive : ''
                      }`}
                      onClick={(e) => {
                        filterByCatagery('97');
                      }}
                    >
                      Holland &amp; Barrett
                    </AphButton>
                    <AphButton
                      color="secondary"
                      size="small"
                      className={`${classes.button} ${
                        selectedCatagerys.includes('680') ? classes.buttonActive : ''
                      }`}
                      onClick={(e) => {
                        filterByCatagery('680');
                      }}
                    >
                      Apollo Products
                    </AphButton>
                  </div>
                </span>
              </div>
            )}
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Discount</div>
              <div className={classes.boxContent}>
                <div className={classes.filterBy}>
                  <AphTextField
                    placeholder="0%"
                    value={fromDiscount}
                    onChange={(e) => setFromDiscount(e.target.value)}
                  />{' '}
                  <span>TO</span>{' '}
                  <AphTextField
                    placeholder="100%"
                    value={toDiscount}
                    onChange={(e) => setToDiscount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Price</div>
              <div className={classes.boxContent}>
                <div className={classes.filterBy}>
                  <AphTextField
                    placeholder="RS.500"
                    value={fromPrice}
                    onChange={(e) => {
                      setFromPrice(e.target.value);
                    }}
                  />{' '}
                  <span>TO</span>{' '}
                  <AphTextField
                    placeholder="RS.3000"
                    value={toPrice}
                    onChange={(e) => {
                      setToPrice(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.bottomActions}>
        <AphButton
          color="primary"
          disabled={toPrice && fromPrice && Number(fromPrice) > Number(toPrice)}
          fullWidth
          onClick={(e) => filterByPriceAndCategory()}
        >
          Apply Filters
        </AphButton>
      </div>
    </div>
  );
};
