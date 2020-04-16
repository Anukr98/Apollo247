import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import { clientRoutes } from 'helpers/clientRoutes';
import { useParams } from 'hooks/routerHooks';
import { SAVE_ORDER_CANCEL_STATUS } from 'graphql/profiles';
import { useMutation } from 'react-apollo-hooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    orderPlaced: {
      borderRadius: 10,
      backgroundColor: '#f7f8f5',
      padding: 16,
      marginBottom: 20,
    },
    bottomActions: {
      paddingTop: 15,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        fontWeight: 'bold',
        color: '#fc9916',
        padding: 0,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    trackBtn: {
      marginLeft: 'auto',
    },
    orderHeader: {
      display: 'flex',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 8,
      alignItems: 'center',
    },
    medicineName: {
      fontSize: 17,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      alignItems: 'center',
    },
    medicineIcon: {
      paddingRight: 16,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    invoiceNo: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginLeft: 'auto',
    },
    orderBody: {
      fontSize: 12,
      opacity: 0.6,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 10,
      paddingTop: 5,
    },
    remindMe: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 10,
      paddingTop: 5,
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
    actions: {
      padding: '0 0 20px 0',
      display: 'flex',
    },
    button: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 'auto',
      fontWeight: 'bold',
      color: '#fc9916',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

interface OrderPlacedProps {
  setShowOrderPopup: (showOrderPopup: boolean) => void;
}

export const OrderPlaced: React.FC<OrderPlacedProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<{
    orderAutoId: string;
    orderStatus: string;
  }>();

  const cancelOrder = useMutation(SAVE_ORDER_CANCEL_STATUS);

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        {params.orderStatus === 'success' && (
          <>
            <Typography variant="h2">yay!</Typography>
            <p>
              Your orders have been placed successfully.We will confirm the order in a few minutes
            </p>
            <div className={classes.orderPlaced}>
              <div className={classes.orderHeader}>
                <div className={classes.medicineName}>
                  <span className={classes.medicineIcon}>
                    <img src={require('images/ic_tablets.svg')} alt="" />
                  </span>
                  <span>Medicines</span>
                </div>
                <div className={classes.invoiceNo}>#{params.orderAutoId}</div>
              </div>
              <div className={classes.bottomActions}>
                <AphButton
                  onClick={() => {
                    localStorage.removeItem('orderStatus');
                    window.location.href = `${clientRoutes.yourOrders()}?v=invoice`;
                  }}
                >
                  View Invoice
                </AphButton>
                <AphButton
                  className={classes.trackBtn}
                  onClick={() => {
                    localStorage.removeItem('orderStatus');
                    window.location.href = clientRoutes.yourOrders();
                  }}
                  title={'Open track orders'}
                >
                  Track Order
                </AphButton>
              </div>
            </div>
          </>
        )}
        {params.orderStatus === 'failed' && (
          <>
            <Typography variant="h2">uh oh.. :(</Typography>
            <p>Your payment wasn’t successful due to bad network connectivity. Please try again.</p>
            <div className={classes.actions}>
              <AphButton
                onClick={() => {
                  props.setShowOrderPopup(false);
                  cancelOrder({
                    variables: {
                      orderCancelInput: {
                        orderNo:
                          typeof params.orderAutoId === 'string'
                            ? parseInt(params.orderAutoId)
                            : params.orderAutoId,
                        remarksCode: '',
                      },
                    },
                  });
                }}
                color="primary"
                classes={{ root: classes.button }}
              >
                OK, GOT IT
              </AphButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
