import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return {
    orderStatusGroup: {
      marginLeft: 12,
    },
    cardGroup: {
      paddingLeft: 34,
      paddingBottom: 8,
      position: 'relative',
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 4,
        top: 0,
        left: 0,
        height: '100%',
        backgroundColor: '#00b38e',
        opacity: 0.2,
        borderRadius: 2,
      },
      '&:last-child': {
        '&:before': {
          display: 'none',
        },
      },
      '&:after': {
        position: 'absolute',
        content: '""',
        width: 8,
        height: 8,
        top: 0,
        left: -2,
        borderRadius: '50%',
        backgroundColor: '#01475b',
      },
    },
    statusCard: {
      backgroundColor: '#eff0eb',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      padding: 16,
    },
    statusInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      letterSpacing: 0.04,
      paddingTop: 8,
      marginTop: 5,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      '& span': {
        opacity: 0.6,
      },
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
    orderStatusActive: {
      backgroundColor: theme.palette.common.white,
      '& span': {
        opacity: 1,
      },
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 28,
        height: 28,
        top: -4,
        left: -12,
        backgroundImage: 'url(' + require('images/ic_tracker_done.svg') + ')',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        borderRadius: 2,
        zIndex: 2,
      },
    },
    orderStatusCompleted: {
      '&:after': {
        position: 'absolute',
        content: '""',
        width: 4,
        top: 0,
        left: 0,
        height: '100%',
        backgroundColor: '#0087ba',
        zIndex: 1,
      },
    },
  };
});

export const OrderStatusCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item sm={12}>
        <div className={classes.orderStatusGroup}>
          <div className={classes.cardGroup}>
            <div
              className={`${classes.statusCard} ${classes.orderStatusActive} ${classes.orderStatusCompleted}`}
            >
              Order Placed
              <div className={classes.statusInfo}>
                <span>9 Aug 2019</span>
                <span>12:00 pm</span>
              </div>
            </div>
          </div>
          <div className={classes.cardGroup}>
            <div className={`${classes.statusCard} ${classes.orderStatusActive}`}>
              Order Verified
              <div className={classes.statusInfo}>
                <span>9 Aug 2019</span>
                <span>12:33 pm</span>
              </div>
            </div>
          </div>
          <div className={classes.cardGroup}>
            <div className={`${classes.statusCard}`}>Out For Delivery</div>
          </div>
          <div className={classes.cardGroup}>
            <div className={`${classes.statusCard}`}>
              Order Delivered
              <div className={classes.statusInfo}>
                <span>To Be Delivered Within — 2hrs</span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </Grid>
    </Grid>
  );
};
