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
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
        paddingTop: 0,
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
        width: '100%',
        height: 'auto',
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
    button: {
      marginRight: 5,
      marginTop: 5,
      minWidth: 'auto',
      color: '#00b38e !important',
      letterSpacing: -0.27,
      borderRadius: 10,
    },
    bottomActions: {
      padding: '10px 20px 0 20px',
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
  });
});
type priceFilter = { fromPrice: string; toPrice: string };
type discountFilter = { fromDiscount: string; toDiscount: string };

interface TestFilterProps {
  setMedicineList?: (medicineList: MedicineProduct[] | null) => void;
  setPriceFilter?: (priceFilter: priceFilter) => void;
  setFilterData?: (filterData: []) => void;
  setDiscountFilter?: (discountFilter: discountFilter) => void;
}

type Params = { searchMedicineType: string; searchText: string };

export const TestFilter: React.FC<TestFilterProps> = (props: any) => {
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
          placeholder="Search tests"
          onChange={(e) => {
            setSubtxt(e.target.value);
          }}
          value={subtxt}
        />
        <AphButton className={classes.refreshBtn}>
          <img src={require('images/ic_refresh.svg')} alt="" />
        </AphButton>
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
