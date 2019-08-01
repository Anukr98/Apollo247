import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingBottom: 10,
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
    },
    medicineStripWrap: {
      display: 'flex',
      alignItems: 'center',
    },
    medicineInformation: {
      paddingRight: 10,
      display: 'flex',
      alignItems: 'center',
    },
    medicineIcon: {
      paddingRight: 20,
      '& img': {
        maxWidth: 24,
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
      color: '#658f9b',
      fontWeight: 500,
      paddingTop: 2,
    },
    medicinePrice: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingLeft: 14,
      paddingRight: 14,
      paddingTop: 11,
      paddingBottom: 11,
      '& span': {
        fontWeight: 500,
      },
    },
    medicineCount: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingLeft: 14,
      paddingRight: 14,
      fontSize: 12,
      color: '#02475b',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      '& span': {
        paddingLeft: 10,
        paddingRight: 10,
        textTransform: 'uppercase',
      },
    },
    addToCart: {
      paddingLeft: 14,
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      '& button': {
        borderRadius: 10,
      },
    },
    minusIcon: {
      cursor: 'pointer',
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    plusIcon: {
      cursor: 'pointer',
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    helpText: {
      marginLeft: 'auto',
      paddingRight: 10,
      cursor: 'pointer',
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    subscriptionLink: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderTop: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingTop: 10,
      marginTop: 10,
      textAlign: 'right',
      '& label': {
        margin: 0,
        '& span:last-child': {
          fontSize: 12,
          fontWeight: 500,
          color: '#02475b',
          paddingRight: 20,
        },
      },
    },
  };
});

export const MedicineStripCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Metformin 500mg <div className={classes.tabInfo}>Tablet / Type 2 Diabetes</div>
            </div>
          </div>
          <div className={classes.helpText}>
            <img src={require('images/ic_info.svg')} alt="" />
          </div>
          <div className={classes.medicinePrice}>
            Rs. 120 <span>/strip</span>
          </div>
          <div className={classes.medicineCount}>
            <div className={classes.minusIcon}>
              <img src={require('images/ic_minus.svg')} alt="" />
            </div>
            <span>1 Strip</span>
            <div className={classes.plusIcon}>
              <img src={require('images/ic_plus.svg')} alt="" />
            </div>
          </div>
          <div className={classes.addToCart}>
            <AphButton color="primary">Add to cart</AphButton>
          </div>
        </div>
        <div className={classes.subscriptionLink}>
          <FormControlLabel
            control={<AphCheckbox color="primary" />}
            label="Need to take this regularly?"
            labelPlacement="start"
          />
        </div>
      </div>
    </div>
  );
};
