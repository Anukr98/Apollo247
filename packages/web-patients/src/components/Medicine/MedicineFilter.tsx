import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import { AphButton, AphTextField, AphSelect } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useParams } from 'hooks/routerHooks';
import axios from 'axios';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      paddingTop: 10,
      width: 328,
      borderRadius: 5,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 991,
        top: 50,
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
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 12,
      fontWeight: 600,
      paddingBottom: 7,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& ul': {
        padding: '10px 20px',
        '& li': {
          fontSize: 16,
          fontWeight: 500,
          color: '#01475b',
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
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
        padding: '5px 10px 5px 10px',
        paddingTop: 0,
        '& input': {
          fontSize: 12,
          padding: '5px 0',
        },
        '&:before': {
          display: 'none',
        },
        '&:after': {
          display: 'none',
        },
        '& svg': {
          top: 'calc(50% - 12px) !important',
          right: 5,
        },
      },
      '& span': {
        paddingLeft: 10,
        paddingRight: 10,
      },
    },
    padNone: {
      '& >div': {
        paddingBottom: 0,
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
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
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
    bottomActionsOpen: {
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    priceGroup: {
      position: 'relative',
      '& input': {
        paddingLeft: '20px !important',
      },
    },
    priceLabel: {
      position: 'absolute',
      left: 0,
      top: 3,
      color: '#02475b',
      fontWeight: 500,
      fontSize: 12,
    },
    helpText: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    searchInputDisabled: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    filterSectionOpen: {
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
  });
});
type priceFilter = { fromPrice: string; toPrice: string };
type discountFilter = { fromDiscount: string; toDiscount: string };

interface MedicineFilterProps {
  medicineList?: any;
  setMedicineList?: (medicineList: MedicineProduct[] | null) => void;
  setPriceFilter?: (priceFilter: priceFilter) => void;
  setFilterData?: (filterData: []) => void;
  setDiscountFilter?: (discountFilter: discountFilter) => void;
  setSortBy?: (sortValue: string) => void;
  disableFilters: boolean;
  manageFilter: (disableFilters: boolean) => void;
  showResponsiveFilter: boolean;
  setShowResponsiveFilter: (showResponsiveFilter: boolean) => void;
}

type Params = { searchMedicineType: string; searchText: string };

export type SortByOptions = 'A-Z' | 'Z-A' | 'Price-H-L' | 'Price-L-H' | '';

const sortingOptions = ['A-Z', 'Z-A', 'Price-H-L', 'Price-L-H'];

export const MedicineFilter: React.FC<MedicineFilterProps> = (props: any) => {
  const classes = useStyles({});
  const apiDetails = {
    url: process.env.PHARMACY_MED_SEARCH_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  };
  const [selectedCatagerys, setSelectedCatagerys] = useState(['']);
  const [selected, setSelected] = useState<boolean>(false);
  const pastSearchValue = localStorage.getItem('searchText');
  const params = useParams<Params>();
  const locationUrl = window.location.href;
  const [subtxt, setSubtxt] = useState<string>(
    pastSearchValue && pastSearchValue.length > 0
      ? pastSearchValue
      : params.searchMedicineType === 'search-medicines'
      ? params.searchText
      : ''
  );
  const [dataValue, setDataValue] = useState<any>([]);
  const [fromPrice, setFromPrice] = useState();
  const [toPrice, setToPrice] = useState();
  const [fromDiscount, setFromDiscount] = useState<string>('0');
  const [toDiscount, setToDiscount] = useState<string>('100');
  const [sortValue, setSortValue] = useState<string>('');

  useEffect(() => {
    if (subtxt.length > 0) {
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
        setDataValue(data.products);
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

    props.setSortBy(sortValue);
    props.setPriceFilter(obj);
    props.setDiscountFilter(discountObj);
  };

  useEffect(() => {
    if (selected) {
      setSelectedCatagerys(selectedCatagerys);
      setSelected(false);
    }
  }, [selected]);

  let showError = false;
  if (subtxt.length > 2 && !dataValue) showError = true;

  return (
    <div className={classes.root}>
      <div
        className={`${classes.searchInput} ${
          !props.disableFilters ? classes.searchInputDisabled : ''
        }`}
      >
        <AphTextField
          placeholder="Search med, brands and more"
          onChange={(e) => {
            localStorage.setItem('searchText', e.target.value);
            setSubtxt(e.target.value);
          }}
          value={subtxt.replace(/\s+/gi, ' ').trimLeft()}
          error={showError}
        />
      </div>
      {showError ? (
        <FormHelperText className={classes.helpText} component="div" error={showError}>
          Sorry, we couldn't find what you are looking for :(
        </FormHelperText>
      ) : (
        ''
      )}
      <div
        className={`${classes.filterSection} ${
          props.showResponsiveFilter ? classes.filterSectionOpen : ''
        }`}
      >
        <div className={classes.filterHeader}>
          <AphButton
            onClick={() => {
              props.setShowResponsiveFilter(false);
            }}
          >
            <img src={require('images/ic_cross.svg')} alt="" />
          </AphButton>
          <span>FILTERS</span>
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
                  <div className={classes.priceGroup}>
                    <AphTextField
                      value={fromPrice}
                      onChange={(e) => {
                        setFromPrice(e.target.value);
                      }}
                    />
                    <span className={classes.priceLabel}>Rs.</span>
                  </div>
                  <span>TO</span>
                  <div className={classes.priceGroup}>
                    <AphTextField
                      value={toPrice}
                      onChange={(e) => {
                        setToPrice(e.target.value);
                      }}
                    />
                    <span className={classes.priceLabel}>Rs.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Sort by</div>
              <div className={classes.boxContent}>
                <div className={`${classes.filterBy} ${classes.padNone}`}>
                  <AphSelect
                    value={sortValue !== '' ? sortValue : 'Select sort by'}
                    onChange={(e) => setSortValue(e.target.value as SortByOptions)}
                    classes={{
                      root: classes.selectMenuRoot,
                      selectMenu: classes.selectMenuItem,
                    }}
                    MenuProps={{
                      classes: { paper: classes.menuPopover },
                      anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                    }}
                  >
                    {sortingOptions.map((option) => {
                      return (
                        <MenuItem
                          value={option}
                          classes={{ selected: classes.menuSelected }}
                          key={option}
                        >
                          {option}
                        </MenuItem>
                      );
                    })}
                  </AphSelect>
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div
        className={`${classes.bottomActions} ${
          props.showResponsiveFilter ? classes.bottomActionsOpen : ''
        }`}
      >
        <AphButton
          color="primary"
          disabled={
            (toPrice && fromPrice && Number(fromPrice) > Number(toPrice)) ||
            (fromDiscount && toDiscount && Number(fromDiscount) > Number(toDiscount))
          }
          fullWidth
          onClick={(e) => {
            filterByPriceAndCategory();
            props.setShowResponsiveFilter(false);
          }}
        >
          Apply Filters
        </AphButton>
      </div>
    </div>
  );
};

// const getDescription = (value: SortByOptions) => {
//   switch (value) {
//     case 'A-Z':
//       return 'Products Name A-Z';
//     case 'Z-A':
//       return 'Products Name Z-A';
//     case 'Price-H-L':
//       return 'Price: High To Low';
//     case 'Price-L-H':
//       return 'Price: Low To High';
//     default:
//       return 'Please Select';
//   }
// };
