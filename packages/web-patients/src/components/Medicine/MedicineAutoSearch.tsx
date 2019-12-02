import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper } from '@material-ui/core';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

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
          display: 'flex',
          alignItems: 'center',
          padding: '12px 12px',
          borderBottom: '0.5px solid rgba(2,71,91,0.1)',
          cursor: 'pointer',
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
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.medicineSearchForm}>
        <AphTextField
          placeholder="Search meds, brands and more"
          className={classes.searchInput}
        />
        <AphButton className={classes.searchBtn}>
          <img src={require('images/ic_send.svg')} alt="" />
        </AphButton>
      </div>
      <Paper className={classes.autoSearchPopover}>
        <Scrollbars autoHide={true} style={{ height: 'calc(45vh' }}>
          <div className={classes.searchList}>
            <ul>
              <li>
                <div className={classes.medicineImg}>
                  <img src={require('images/img_product.png')} alt="" />
                </div>
                <div className={classes.medicineInfo}>
                  <div className={classes.medicineName}>Crocin Advance</div>
                  <div className={classes.medicinePrice}>Rs. 14.95</div>
                </div>
              </li>
              <li className={classes.itemSelected}>
                <div className={classes.medicineImg}>
                  <img src={require('images/img_product.png')} alt="" />
                </div>
                <div className={classes.medicineInfo}>
                  <div className={classes.medicineName}>Crocin Pain Releif</div>
                  <div className={classes.medicinePrice}>Rs. 14.95</div>
                </div>
              </li>
              <li>
                <div className={classes.medicineImg}>
                  <img src={require('images/ic_tablets_rx.svg')} alt="" />
                </div>
                <div className={classes.medicineInfo}>
                  <div className={classes.medicineName}>Crocin Cold &amp; Flu</div>
                  <div className={classes.noStock}>Out Of Stock</div>
                </div>
              </li>
              <li>
                <div className={classes.medicineImg}>
                  <img src={require('images/ic_tablets.svg')} alt="" />
                </div>
                <div className={classes.medicineInfo}>
                  <div className={classes.medicineName}>Crocin 650mg</div>
                  <div className={classes.medicinePrice}>Rs. 14.95</div>
                </div>
              </li>
            </ul>
          </div>
        </Scrollbars>
      </Paper>
    </div>
  );
};
