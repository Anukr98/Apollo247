import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import { AphButton, AphTextField, AphCustomDropdown } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      width: 328,
      borderRadius: 5,
    },
    medicineSection: {
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
    sectionTitle: {
      fontSize: 12,
      fontWeight: 600,
      color: '#02475b',
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    bottomActions: {
      padding: 20,
      paddingTop: 10,
      display: 'flex',
      '& button': {
        width: '50%',
        borderRadius: 10,
        '&:first-child': {
          marginRight: 8,
          color: '#fc9916',
          backgroundColor: theme.palette.common.white,
        },
        '&:last-child': {
          marginLeft: 8,
        },
      },
    },
    substitutes: {
      backgroundColor: '#f7f8f5',
      padding: 10,
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginBottom: 16,
    },
    deliveryInfo: {
      backgroundColor: '#f7f8f5',
      padding: 10,
      borderRadius: 5,
      paddingTop: 1,
      '& input': {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    deliveryTimeGroup: {
      position: 'relative',
    },
    checkBtn: {
      color: '#fc9916',
      boxShadow: 'none',
      minWidth: 'auto',
      padding: 0,
      position: 'absolute',
      right: 0,
      top: 6,
      fontSize: 13,
      fontWeight: 'bold',
    },
    checkBtnDisabled: {
      opacity: 0.5,
      color: '#fc9916 !important',
    },
    deliveryTimeInfo: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
      paddingTop: 10,
      '& span:last-child': {
        fontWeight: 'bold',
        marginLeft: 'auto',
      },
    },
    priceGroup: {
      padding: '10px 20px',
    },
    priceWrap: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: '6px 10px',
      display: 'flex',
      alignItems: 'center',
    },
    medicinePrice: {
      fontSize: 14,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      width: '50%',
      textAlign: 'right',
    },
    leftGroup: {
      width: '50%',
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 14,
      fontWeight: 500,
    },
    medicinePack: {
      color: '#02475b',
      letterSpacing: 0.33,
    },
    medicineNoStock: {
      color: '#890000',
      lineHeight: '32px',
      fontWeight: 'bold',
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
  });
});

export const MedicineInformation: React.FC = (props) => {
  const classes = useStyles();
  const [medicineQty] = React.useState(1);

  return (
    <div className={classes.root}>
      <div className={`${classes.medicineSection}`}>
        <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 350px' }}>
          <div className={classes.customScroll}>
            <div className={classes.sectionTitle}>Substitute Drugs</div>
            <div className={classes.substitutes}>Pick from 9 available substitutes</div>
            <div className={classes.sectionTitle}>Check Delivery Time</div>
            <div className={classes.deliveryInfo}>
              <div className={classes.deliveryTimeGroup}>
                <AphTextField placeholder="Enter Pin Code" />
                <AphButton
                  disabled
                  classes={{
                    root: classes.checkBtn,
                    disabled: classes.checkBtnDisabled,
                  }}
                >
                  Check
                </AphButton>
              </div>
              <div className={classes.deliveryTimeInfo}>
                <span>Delivery Time</span>
                <span>By 9th Oct 2019</span>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.priceGroup}>
        <div className={classes.priceWrap}>
          <div className={classes.leftGroup}>
            <div className={classes.medicinePack}>
              QTY :
              <AphCustomDropdown
                classes={{ selectMenu: classes.selectMenuItem }}
                value={medicineQty}
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
            <div className={classes.medicineNoStock}>Out Of Stock</div>
          </div>
          <div className={classes.medicinePrice}>Rs. 120</div>
        </div>
      </div>
      <div className={classes.bottomActions}>
        <AphButton>Add To Cart</AphButton>
        <AphButton color="primary">Buy Now</AphButton>
      </div>
    </div>
  );
};
