import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import { AphButton, AphCustomDropdown } from '@aph/web-ui-components';
import { array } from 'prop-types';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { MedicineProductsResponse, MedicineProduct } from './../../helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
    },
    medicineStripDisabled: {
      backgroundColor: '#f7f8f5',
    },
    medicineStripWrap: {
      display: 'flex',
    },
    medicineInformation: {
      paddingRight: 10,
      display: 'flex',
      alignItems: 'center',
    },
    cartRight: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
    },
    medicineIcon: {
      paddingRight: 10,
      '& img': {
        maxWidth: 35,
        verticalAlign: 'middle',
      },
    },
    medicineName: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
    },
    tabInfo: {
      fontSize: 10,
      color: '#02475b',
      fontWeight: 500,
      paddingTop: 2,
      opacity: 0.6,
    },
    noStock: {
      fontSize: 10,
      color: '#890000',
      fontWeight: 500,
      paddingTop: 2,
    },
    medicinePrice: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 12,
      paddingBottom: 11,
      '& span': {
        fontWeight: 500,
      },
    },
    addToCart: {
      paddingLeft: 20,
      paddingTop: 8,
      paddingBottom: 8,
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    medicinePack: {
      fontSize: 13,
      fontWeight: 600,
      color: '#02475b',
      letterSpacing: 0.33,
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 4,
      paddingBottom: 4,
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'uppercase',
      paddingTop: 7,
      paddingBottom: 6,
      paddingLeft: 4,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
  };
});
export interface MedicineListingCardProps {
  medList: Array<[]>;
}

export const MedicineListingCard: React.FC<MedicineListingCardProps> = (props) => {
  const classes = useStyles({});
  const [medicineQty, setMedicineQty] = React.useState<number>(1);
  const { addCartItem, cartItems, cartTotal, removeCartItem, updateCartItemQty } = useShoppingCart();
  const options = Array.from(Array(20), (_, x) => x);

  const [selectedPackedQty, setSelectedPackedQty] = React.useState(1);
  const [isQuantityShow, setIsQuantityShow] = React.useState<boolean>(false);
  const [searchMedicines, setSearchMedicines] = useState<MedicineProduct[]>([]);

  const apiDetails = {
    url: process.env.PHARMACY_MED_SEARCH_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  // const [index,setIndex]=useState(0);
  const [selectedValue, setSelectedValue] = useState<number[]>();
  const addArray = (idx: number, medList: []) => {
    var a: any = [];
    if (selectedValue && selectedValue.length > 0) {
      a = selectedValue;
    }
    a.push(idx);
    setSelectedValue(a);
    setSearchMedicines(medList);
    console.log(selectedValue);
  };

  return (
    <div className={classes.root}>
      {/** medice card normal state */}
      {props.medList &&
        props.medList.map((med: any, idx: number) => (
          <div className={classes.medicineStrip}>
            <div className={classes.medicineStripWrap}>
              <Link to={clientRoutes.medicineDetails(med.sku)}>
                <div className={classes.medicineInformation}>
                  <div className={classes.medicineIcon}>
                    <img src={`${apiDetails.imageUrl}${med.image}`} alt="" />
                  </div>
                  <div className={classes.medicineName}>
                    {med.name}
                    {med.mou ? (
                      <div className={classes.tabInfo}>Pack of {med.mou}</div>
                    ) : (
                        <div className={classes.noStock}>Out Of Stock</div>
                      )}
                  </div>
                </div>
              </Link>
              <div className={classes.cartRight}>
                {isQuantityShow && selectedValue && selectedValue.includes(idx) && (
                  <>
                    <div className={classes.medicinePack}>
                      QTY :
                      <AphCustomDropdown
                        classes={{ selectMenu: classes.selectMenuItem }}
                        value={selectedPackedQty}
                        onChange={(e: React.ChangeEvent<{ value: any }>) =>
                          setSelectedPackedQty(parseInt(e.target.value))
                        }
                      >
                        {options.map((option) => (
                          <MenuItem
                            classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
                            value={option}
                          >
                            {option}
                          </MenuItem>
                        ))}
                      </AphCustomDropdown>
                    </div>
                    <div className={classes.medicinePrice}> Rs.{med.price}</div>
                  </>
                )}
                <div className={classes.addToCart}>
                  {isQuantityShow && selectedValue && selectedValue.includes(idx) ? (
                    ''
                  ) : (
                      <AphButton>
                        <img
                          src={require('images/ic_plus.svg')}
                          onClick={() => {
                            setIsQuantityShow(true);
                            addArray(idx, med);
                            addCartItem(med);
                          }}
                          alt="Add Item"
                          title="Add item to Cart"
                        />
                      </AphButton>
                    )}

                  {isQuantityShow && selectedValue && selectedValue.includes(idx) && (
                    <AphButton>
                      <img
                        src={require('images/ic_cross_onorange_small.svg')}
                        alt="Remove Item"
                        title="Remove item from Cart"
                        onClick={() => {
                          setSelectedValue(selectedValue.filter((item) => item !== idx));
                          removeCartItem(med.id);

                        }}
                      />
                    </AphButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};