import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import { AphButton, AphCustomDropdown } from '@aph/web-ui-components';

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

export const MedicineListingCard: React.FC = (props) => {
  const classes = useStyles();
  const [selectedPackedQty] = React.useState(1);

  return (
    <div className={classes.root}>
      {/** medice card normal state */}
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/img_product.png')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Crocin Advance <div className={classes.tabInfo}>Pack Of 15</div>
            </div>
          </div>
          <div className={classes.cartRight}>
            <div className={classes.addToCart}>
              <AphButton>
                <img src={require('images/ic_plus.svg')} alt="Add Item" title="Add item to Cart" />
              </AphButton>
            </div>
          </div>
        </div>
      </div>
      {/** medice card with prescription required */}
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/img_product.png')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Crocin Pain Relief <div className={classes.tabInfo}>Pack Of 15</div>
            </div>
          </div>
          <div className={classes.cartRight}>
            <div className={classes.addToCart}>
              <AphButton>
                <img src={require('images/ic_plus.svg')} alt="Add Item" title="Add item to Cart" />
              </AphButton>
            </div>
          </div>
        </div>
      </div>
      {/** medice card with prescription required and no product image */}
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/ic_tablets_rx.svg')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Crocin 650mg <div className={classes.tabInfo}>Pack Of 10</div>
            </div>
          </div>
          <div className={classes.cartRight}>
            <div className={classes.addToCart}>
              <AphButton>
                <img src={require('images/ic_plus.svg')} alt="Add Item" title="Add item to Cart" />
              </AphButton>
            </div>
          </div>
        </div>
      </div>
      {/** out of stock medicine card */}
      <div className={`${classes.medicineStrip} ${classes.medicineStripDisabled}`}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Crocin 650mg <div className={classes.noStock}>Out Of Stock</div>
            </div>
          </div>
        </div>
      </div>
      {/** medice card section start */}
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/img_product.png')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Crocin Advance <div className={classes.tabInfo}>Pack Of 10</div>
            </div>
          </div>
          <div className={classes.cartRight}>
            <div className={classes.medicinePack}>
              QTY :
              <AphCustomDropdown
                classes={{ selectMenu: classes.selectMenuItem }}
                value={selectedPackedQty}
              >
                <MenuItem
                  classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
                  value={1}
                >
                  1
                </MenuItem>
                <MenuItem
                  classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
                  value={2}
                >
                  2
                </MenuItem>
                <MenuItem
                  classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
                  value={3}
                >
                  3
                </MenuItem>
              </AphCustomDropdown>
            </div>
            <div className={classes.medicinePrice}>Rs. 120</div>
            <div className={classes.addToCart}>
              <AphButton>
                <img
                  src={require('images/ic_cross_onorange_small.svg')}
                  alt="Remove Item"
                  title="Remove item from Cart"
                />
              </AphButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
