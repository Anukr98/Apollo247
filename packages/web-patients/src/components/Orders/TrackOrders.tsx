import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { OrderStatusCard } from 'components/Orders/OrderStatusCard';
import { CancelOrder } from 'components/Orders/CancelOrder';
import { ReturnOrder } from 'components/Orders/ReturnOrder';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 15,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      marginLeft: 20,
      marginRight: 20,
    },
    headerActions: {
      marginLeft: 'auto',
      marginBottom: -6,
    },
    tabGroup: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
    },
    tabBtn: {
      width: '50%',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      padding: '8px 0',
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      textTransform: 'none',
      borderBottom: '4px solid transparent',
      borderRadius: 0,
      minWidth: 'auto',
      opacity: 0.6,
    },
    btnActive: {
      borderBottom: '4px solid #00b38e',
      color: '#02475b',
      opacity: 1,
    },
    moreBtn: {
      border: 0,
      boxShadow: 'none',
      padding: 0,
      minWidth: 'auto',
    },
    orderId: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
    },
    orderTrackCrads: {
      margin: 20,
      marginTop: 10,
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
    },
    customScroll: {
      padding: 20,
      paddingLeft: 10,
    },
    menuPopover: {
      minWidth: 160,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.4)',
      backgroundColor: theme.palette.common.white,
    },
    menuBtnGroup: {
      padding: '5px 16px',
      '& button': {
        boxShadow: 'none',
        borderRadius: 0,
        backgroundColor: 'transparent',
        fontSize: 18,
        fontWeight: 500,
        color: '#01475b',
        padding: '5px 0',
        display: 'block',
        textTransform: 'none',
        borderBottom: '0.5px solid rgba(1,71,91,0.3)',
        width: '100%',
        textAlign: 'left',
        '&:last-child': {
          borderBottom: 0,
        },
      },
    },
  };
});

export const TrackOrders: React.FC = (props) => {
  const classes = useStyles();
  const currentPath = window.location.pathname;
  const [moreActionsDialog, setMoreActionsDialog] = React.useState<null | HTMLElement>(null);
  const [isCancelOrderDialogOpen, setIsCancelOrderDialogOpen] = React.useState<boolean>(false);
  const [isReturnOrderDialogOpen, setIsReturnOrderDialogOpen] = React.useState<boolean>(false);
  const moreActionsopen = Boolean(moreActionsDialog);

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setMoreActionsDialog(event.currentTarget);
  }

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        <div className={classes.orderId}>
          <span>ORDER #A2472707936</span>
        </div>
        <div className={classes.headerActions}>
          <AphButton onClick={handleClick} className={classes.moreBtn}>
            <img src={require('images/ic_more.svg')} alt="" />
          </AphButton>
          <Popover
            anchorEl={moreActionsDialog}
            keepMounted
            open={moreActionsopen}
            onClick={() => setMoreActionsDialog(null)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            classes={{ paper: classes.menuPopover }}
          >
            <div className={classes.menuBtnGroup}>
              <AphButton onClick={() => setIsCancelOrderDialogOpen(true)}>Cancel Order</AphButton>
              <AphButton onClick={() => setIsReturnOrderDialogOpen(true)}>Return Order</AphButton>
            </div>
          </Popover>
        </div>
      </div>
      <div className={classes.orderTrackCrads}>
        <div className={classes.tabGroup}>
          <AphButton className={`${classes.tabBtn} ${classes.btnActive}`}>Track Order</AphButton>
          <AphButton className={`${classes.tabBtn}`}>Order Summary</AphButton>
        </div>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 276px)'}>
          <div className={classes.customScroll}>
            <OrderStatusCard />
          </div>
        </Scrollbars>
      </div>
      <AphDialog open={isCancelOrderDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsCancelOrderDialogOpen(false)} />
        <AphDialogTitle>Cancel Order</AphDialogTitle>
        <CancelOrder />
      </AphDialog>
      <AphDialog open={isReturnOrderDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsReturnOrderDialogOpen(false)} />
        <AphDialogTitle>Return Order</AphDialogTitle>
        <ReturnOrder />
      </AphDialog>
    </div>
  );
};
