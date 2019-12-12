import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import {
  AphTrackSlider,
  AphOnHoldSlider,
  AphDelayedSlider,
  AphDeliveredSlider,
} from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      display: 'flex',
      alignItems: 'center',
      marginBottom: 10,
      cursor: 'pointer',
      border: 'solid 1px transparent',
      position: 'relative',
    },
    cardSelected: {
      border: 'solid 1px #00b38e',
      '&:before, &:after': {
        left: '100%',
        top: '50%',
        border: 'solid transparent',
        content: '""',
        height: 0,
        width: 0,
        position: 'absolute',
      },
      '&:after': {
        borderColor: 'rgba(255, 255, 255, 0)',
        borderLeftColor: '#fff',
        borderWidth: 7,
        marginTop: -7,
      },
      '&:before': {
        borderColor: 'rgba(0, 179, 142, 0)',
        borderLeftColor: '#00b38e',
        borderWidth: 8,
        marginTop: -8,
      },
    },
    orderListing: {
      paddingLeft: 10,
    },
    orderedItem: {
      display: 'flex',
      alignItems: 'center',
      width: '40%',
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
      lineHeight: '20px',
    },
    statusInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      lineHeight: '20px',
    },
    orderTrackSlider: {
      paddingLeft: 20,
      paddingRight: 20,
      width: '40%',
    },
    orderError: {
      color: '#890000',
    },
    returnAccepted: {
      backgroundColor: '#f0f1ec',
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
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 200px)'}>
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
                defaultValue={80}
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
          <div className={`${classes.root} ${classes.cardSelected}`}>
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
              <AphOnHoldSlider
                color="primary"
                defaultValue={150}
                getAriaValueText={valuetext}
                min={0}
                max={360}
                valueLabelDisplay="off"
              />
            </div>
            <div className={classes.orderStatusGroup}>
              <div className={classes.orderStatus}>On Hold</div>
              <div className={classes.statusInfo}>9 Aug 19, 12:00 pm</div>
            </div>
          </div>
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
              <AphDelayedSlider
                color="primary"
                defaultValue={200}
                getAriaValueText={valuetext}
                min={0}
                max={360}
                valueLabelDisplay="off"
              />
            </div>
            <div className={classes.orderStatusGroup}>
              <div className={classes.orderStatus}>Order Delayed</div>
              <div className={classes.statusInfo}>9 Aug 19, 12:00 pm</div>
            </div>
          </div>
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
              <AphDeliveredSlider
                color="primary"
                defaultValue={360}
                getAriaValueText={valuetext}
                min={0}
                max={360}
                valueLabelDisplay="off"
              />
            </div>
            <div className={classes.orderStatusGroup}>
              <div className={classes.orderStatus}>Order Delivered</div>
              <div className={classes.statusInfo}>9 Aug 19, 12:00 pm</div>
            </div>
          </div>
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
                getAriaValueText={valuetext}
                disabled
                min={0}
                max={360}
                valueLabelDisplay="off"
              />
            </div>
            <div className={classes.orderStatusGroup}>
              <div className={`${classes.orderStatus} ${classes.orderError}`}>Return Rejected</div>
              <div className={classes.statusInfo}>9 Aug 19, 12:00 pm</div>
            </div>
          </div>
          <div className={`${classes.root} ${classes.returnAccepted}`}>
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
                getAriaValueText={valuetext}
                disabled
                min={0}
                max={360}
                valueLabelDisplay="off"
              />
            </div>
            <div className={classes.orderStatusGroup}>
              <div className={`${classes.orderStatus}`}>Return Accepted</div>
              <div className={classes.statusInfo}>9 Aug 19, 12:00 pm</div>
            </div>
          </div>
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
                getAriaValueText={valuetext}
                disabled
                min={0}
                max={360}
                valueLabelDisplay="off"
              />
            </div>
            <div className={classes.orderStatusGroup}>
              <div className={`${classes.orderStatus} ${classes.orderError}`}>Order Canceled</div>
              <div className={classes.statusInfo}>9 Aug 19, 12:00 pm</div>
            </div>
          </div>
        </div>
      </Scrollbars>
    </div>
  );
};
