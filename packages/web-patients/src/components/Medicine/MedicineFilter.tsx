import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';
import { MedicineProductsResponse, MedicineProduct } from './../../helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      paddingTop: 10,
      width: 328,
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        top: 46,
        zIndex: 1,
        borderRadius: 0,
        paddingTop: 0,
        width: '100%',
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    filterSection: {
      padding: '20px 5px 0 10px',
      paddingTop: 15,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    customScroll: {
      width: '100%',
      paddingLeft: 10,
      paddingRight: 15,
      paddingBottom: 10,
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
    bottomActions: {
      padding: 20,
      paddingTop: 10,
    },
  });
});

interface MedicineFilterProps {
  medicineFiltercall: (value: any) => void;
}

export const MedicineFilter: React.FC<MedicineFilterProps> = (props: any) => {
  const classes = useStyles();
  const apiDetails = {
    url: process.env.PHARMACY_MED_SEARCH_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  const [searchMedicines, setSearchMedicines] = useState<MedicineProduct[]>([]);
  const [subtxt, setSubtxt] = useState();
  useEffect(() => {
    onSearchMedicine(sessionStorage.getItem('medicineSearch')!);
    setSubtxt(sessionStorage.getItem('medicineSearch'));
  }, []);

  const onSearchMedicine = async (value: string) => {
    console.log('In search');

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
          // cancelToken: new CancelToken(function executor(c) {
          //   // An executor function receives a cancel function as a parameter
          //   cancelSearchSuggestionsApi = c;
          // })
        }
      )
      .then(({ data }) => {
        setSearchMedicines(data.products);
        props.medicineFiltercall(data.products);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div className={classes.root}>
      <div className={classes.searchInput}>
        <AphTextField placeholder="Search med, brands and more"
          onChange={(e) => {
            setSubtxt(e.target.value);
            sessionStorage.setItem('medicineSearch', e.target.value);
          }}
          value={subtxt} />
        <AphButton className={classes.refreshBtn}>
          <img src={require('images/ic_refresh.svg')} alt="" />
        </AphButton>
      </div>
      <div className={`${classes.filterSection}`}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 325px'}>
          <div className={classes.customScroll}>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Categories</div>
              <div className={classes.boxContent}>
                <AphButton
                  color="secondary"
                  size="small"
                  className={`${classes.button} ${classes.buttonActive}`}
                >
                  All
                </AphButton>
                <AphButton color="secondary" size="small" className={`${classes.button}`}>
                  Personal Care
                </AphButton>
                <AphButton color="secondary" size="small" className={`${classes.button}`}>
                  Mom &amp; Baby
                </AphButton>
                <AphButton color="secondary" size="small" className={`${classes.button}`}>
                  Nutrition
                </AphButton>
                <AphButton color="secondary" size="small" className={`${classes.button}`}>
                  Healthcare
                </AphButton>
                <AphButton color="secondary" size="small" className={`${classes.button}`}>
                  Special Offers
                </AphButton>
                <AphButton color="secondary" size="small" className={`${classes.button}`}>
                  Holland &amp; Barrett
                </AphButton>
                <AphButton color="secondary" size="small" className={`${classes.button}`}>
                  Apollo Products
                </AphButton>
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Discount</div>
              <div className={classes.boxContent}>
                <div className={classes.filterBy}>
                  <AphTextField placeholder="0%" /> <span>TO</span>{' '}
                  <AphTextField placeholder="100%" />
                </div>
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Price</div>
              <div className={classes.boxContent}>
                <div className={classes.filterBy}>
                  <AphTextField placeholder="RS.500" /> <span>TO</span>{' '}
                  <AphTextField placeholder="RS.3000" />
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.bottomActions}>
        <AphButton
          color="primary"
          fullWidth
          onClick={(e) => {
            if (subtxt.length > 2) {
              onSearchMedicine(subtxt);
            } else {
              setSearchMedicines([]);
            }
          }}
        >
          Apply Filters
        </AphButton>
      </div>
    </div>
  );
};
