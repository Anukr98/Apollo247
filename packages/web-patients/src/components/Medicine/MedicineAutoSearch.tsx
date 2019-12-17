import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper } from '@material-ui/core';
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
    },
    medicineSearchForm: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px 10px 12px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
    },
    searchInput: {
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

  let cancelSearchSuggestionsApi: any;

  const onSearchMedicine = async (value: string) => {
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
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div className={classes.root}>
      <div className={classes.medicineSearchForm}>
        <AphTextField
          placeholder="Search meds, brands and more"
          className={classes.searchInput}
          onChange={(e) => {
            if (e.target.value.length > 2) {
              onSearchMedicine(e.target.value);
            } else {
              setSearchMedicines([]);
            }
          }}
        />
        <AphButton
          className={classes.searchBtn}
          onClick={() => (window.location.href = clientRoutes.searchByMedicine())}
        >
          <img src={require('images/ic_send.svg')} alt="" />
        </AphButton>
      </div>
      {searchMedicines.length > 0 && (
        <Paper className={classes.autoSearchPopover}>
          <Scrollbars autoHide={true} style={{ height: 'calc(45vh' }}>
            <div className={classes.searchList}>
              <ul>
                {searchMedicines.map((medicine) => (
                  <li>
                    <Link to={clientRoutes.medicineDetails(medicine.sku)}>
                      <div className={classes.medicineImg}>
                        <img src={`${apiDetails.imageUrl}${medicine.image}`} alt="" />
                      </div>
                      <div className={classes.medicineInfo}>
                        <div className={classes.medicineName}>{medicine.name}</div>
                        <div className={classes.medicinePrice}>{`Rs. ${medicine.price}`}</div>
                      </div>
                    </Link>
                  </li>
                ))}
                {/* <li className={classes.itemSelected}>
                  <Link to={clientRoutes.medicineDetails()}>
                    <div className={classes.medicineImg}>
                      <img src={require("images/img_product.png")} alt="" />
                    </div>
                    <div className={classes.medicineInfo}>
                      <div className={classes.medicineName}>
                        Crocin Pain Releif
                      </div>
                      <div className={classes.medicinePrice}>Rs. 14.95</div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to={clientRoutes.medicineDetails()}>
                    <div className={classes.medicineImg}>
                      <img src={require("images/ic_tablets_rx.svg")} alt="" />
                    </div>
                    <div className={classes.medicineInfo}>
                      <div className={classes.medicineName}>
                        Crocin Cold &amp; Flu
                      </div>
                      <div className={classes.noStock}>Out Of Stock</div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to={clientRoutes.medicineDetails()}>
                    <div className={classes.medicineImg}>
                      <img src={require("images/ic_tablets.svg")} alt="" />
                    </div>
                    <div className={classes.medicineInfo}>
                      <div className={classes.medicineName}>Crocin 650mg</div>
                      <div className={classes.medicinePrice}>Rs. 14.95</div>
                    </div>
                  </Link>
                </li>
               */}
              </ul>
            </div>
          </Scrollbars>
        </Paper>
      )}
    </div>
  );
};
