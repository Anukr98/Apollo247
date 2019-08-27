import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { AphTrackSlider } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      display: 'flex',
      alignItems: 'center',
    },
    orderListing: {
      paddingLeft: 10,
    },
    orderedItem: {
      display: 'flex',
      alignItems: 'center',
      width: '35%',
    },
    itemImg: {
      paddingRight: 20,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    itemSection: {
      paddingRight: 20,
    },
    itemName: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    deliveryType: {
      fontSize: 10,
      fontWeight: 500,
      color: '#658f9b',
      marginLeft: -1,
      marginRight: -1,
      '& span': {
        paddingRight: 10,
        paddingLeft: 10,
        borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      },
      '& span:first-child': {
        paddingLeft: 1,
        borderLeft: 0,
      },
    },
    customScroll: {
      paddingLeft: 10,
      paddingRight: 15,
    },
    orderStatusGroup: {
      marginLeft: 'auto',
      paddingLeft: 20,
      width: '25%',
    },
    orderStatus: {
      fontSize: 12,
      fontWeight: 600,
      color: '#02475b',
    },
    statusInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
    },
    orderTrackSlider: {
      paddingLeft: 20,
      paddingRight: 20,
      width: '40%',
    },
  };
});

function valuetext(value: number) {
  return `${value}`;
}

export const OrderCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.orderListing}>
      <div className={classes.customScroll}>
        <div className={classes.root}>
          <div className={classes.orderedItem}>
            <div className={classes.itemImg}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.itemSection}>
              <div className={classes.itemName}>Medicines</div>
              <div className={classes.deliveryType}>
                <span>Home Delivery</span>
                <span>#A2472707936</span>
              </div>
            </div>
          </div>
          <div className={classes.orderTrackSlider}>
            <AphTrackSlider
              color="primary"
              defaultValue={20}
              getAriaValueText={valuetext}
              min={0}
              max={360}
              valueLabelDisplay="off"
            />
          </div>
          <div className={classes.orderStatusGroup}>
            <div className={classes.orderStatus}>Order Placed</div>
            <div className={classes.statusInfo}>9 Aug 19, 12:00 pm</div>
          </div>
        </div>
      </div>
    </div>
  );
};
