import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';
import { MedicineProductsResponse, MedicineProduct } from './../../helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px 15px 20px',
        position: 'fixed',
        width: '100%',
        top: 74,
        zIndex: 999,
        background: '#fff',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
    },
    medicineSearchForm: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px 10px 12px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    searchInput: {
      '& input': {
        [theme.breakpoints.down('xs')]: {
          backgroundColor: '#f7f8f5',
          padding: '15px 33px 15px 12px',
          borderBottom: '2px solid transparent',
          '&:focus': {
            backgroundColor: '#fff',
            borderBottom: '2px solid #00b38e',
            paddingLeft: 0,
          },
        },
      },
      '& >div': {
        '&:after': {
          display: 'none',
        },
        '&:before': {
          display: 'none',
        },
      },
    },
    searchBtn: {
      marginLeft: 'auto',
      padding: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent !important',
      minWidth: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: -30,
      },
    },
    autoSearchPopover: {
      position: 'absolute',
      top: 53,
      left: 0,
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      width: '100%',
      zIndex: 9,
    },
    searchList: {
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          listStyleType: 'none',
          borderBottom: '0.5px solid rgba(2,71,91,0.1)',
          cursor: 'pointer',
          '& a': {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 12px',
          },
          '&:last-child': {
            borderBottom: 0,
          },
        },
      },
    },
    medicineImg: {
      paddingRight: 16,
      '& img': {
        maxWidth: 40,
      },
    },
    medicineInfo: {
      padding: 0,
    },
    medicineName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
    },
    medicinePrice: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
    noStock: {
      fontSize: 12,
      color: '#890000',
      fontWeight: 500,
    },
    itemSelected: {
      backgroundColor: '#f7f8f5',
    },
    searchBtnDisabled: {
      opacity: 0.5,
      '& img': {
        filter: 'grayscale(100%)',
      },
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
  };
});

export const MedicineAutoSearch: React.FC = (props) => {
  const classes = useStyles({});
  const apiDetails = {
    url: process.env.PHARMACY_MED_SEARCH_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  const [searchMedicines, setSearchMedicines] = useState<MedicineProduct[]>([]);
  const [searchText, setSearchText] = useState('');

  let cancelSearchSuggestionsApi: any;
  const [loading, setLoading] = useState(false);
  const onSearchMedicine = async (value: string) => {
    setLoading(true);
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
        setSearchMedicines(data.products);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    if (searchText.length < 3) {
      setLoading(false);
    }
  }, [searchText]);
  return (
    <div className={classes.root}>
      <div className={classes.medicineSearchForm}>
        <AphTextField
          placeholder="Search meds, brands and more"
          className={classes.searchInput}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (e.target.value.length > 2) {
              onSearchMedicine(e.target.value);
            } else {
              setSearchMedicines([]);
            }
          }}
        />
        <AphButton
          disabled={searchText.length < 3}
          className={classes.searchBtn}
          onClick={() =>
            (window.location.href = clientRoutes.searchByMedicine('search-medicines', searchText))
          }
          classes={{
            disabled: classes.searchBtnDisabled,
          }}
        >
          <img src={require('images/ic_send.svg')} alt="" />
        </AphButton>
      </div>
      <Paper className={classes.autoSearchPopover}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'45vh'}>
          {loading && (
            <div className={classes.progressLoader}>
              <CircularProgress size={30} />
            </div>
          )}
          {searchMedicines && searchMedicines.length > 0 && (
            <div className={classes.searchList}>
              <ul>
                {searchMedicines.map((medicine) => (
                  <li key={medicine.id}>
                    <Link to={clientRoutes.medicineDetails(medicine.sku)}>
                      <div className={classes.medicineImg}>
                        {medicine.is_prescription_required ? (
                          <img src={require('images/ic_tablets_rx.svg')} alt="" />
                        ) : (
                          <img src={`${apiDetails.imageUrl}${medicine.image}`} alt="" />
                        )}
                      </div>
                      <div className={classes.medicineInfo}>
                        <div className={classes.medicineName}>{medicine.name}</div>
                        {medicine.is_in_stock ? (
                          <div className={classes.medicinePrice}>{`Rs. ${medicine.price}`}</div>
                        ) : (
                          <div className={classes.noStock}>Out Of Stock</div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Scrollbars>
      </Paper>
    </div>
  );
};
