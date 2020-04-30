import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import {
  GetDiagnosticOrderDetails,
  GetDiagnosticOrderDetailsVariables,
  GetDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList as orderDetails,
  GetDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems as orderLineItems,
} from 'graphql/types/GetDiagnosticOrderDetails';

import moment from 'moment';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_DIAGNOSTIC_ORDER_LIST_DETAILS } from 'graphql/profiles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useParams } from 'hooks/routerHooks';
import { useApolloClient } from 'react-apollo-hooks';
import { Alerts } from 'components/Alerts/Alerts';

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      width: '100%',
      maxWidth: 1064,
      margin: 'auto',
      backgroundColor: '#f7f8f5',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        top: 0,
        zIndex: 99,
        height: '100%',
      },
    },
    contentWrapper: {
      maxWidth: 820,
      margin: 'auto',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    content: {
      padding: 30,
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      marginBottom: 24,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 20,
        borderRadius: 0,
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 999,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        padding: '15px',
        textAlign: 'center',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      zIndex: 2,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    detailsHeader: {
      flex: 1,
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    heading: {
      fontSize: 17,
      fontWeight: 500,
      color: '#02475b',
      textAlign: 'center',
      borderBottom: '0.5px solid rgba(2,71,91,0.1)',
      paddingBottom: 13,
      paddingTop: 30,
      marginBottom: 30,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 10,
      },
    },
    orderDetails: {
      display: 'flex',
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 15,
      fontSize: 14,
      '& div:first-child': {
        color: '#658f9b',
      },
      '& div:last-child': {
        marginLeft: 'auto',
      },
    },
    orderTime: {
      display: 'flex',
      fontWeight: 500,
      color: '#658f9b',
      paddingBottom: 15,
      fontSize: 14,
    },
    timeAndDate: {
      color: '#02475b',
      display: 'flex',
      marginLeft: 'auto',
    },
    orderDate: {
      marginRight: 4,
    },
    consultRow: {
      padding: '15px 0 30px 0',
      marginBottom: 30,
      marginTop: 11,
      borderTop: '2px solid #02475b',
      borderBottom: '2px solid #02475b',
      [theme.breakpoints.down('xs')]: {
        paddingRight: 0,
      },
    },
    consultDetails: {
      display: 'flex',
      fontWeight: 500,
      color: '#02475b',
      marginTop: 15,
      fontSize: 11,
      textTransform: 'uppercase',
    },
    priceDetails: {
      marginLeft: 'auto',
      display: 'flex',
      '& div:first-child': {
        marginRight: 23,
        minWidth: 50,
        textAlign: 'center',
      },
    },
    chargesDiv: {
      textAlign: 'left',
      minWidth: 85,
    },
    testsDetailedRow: {
      fontSize: 15,
      fontWeight: 600,
      color: '#02475b',
      marginTop: 18,
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    totalCharges: {
      backgroundColor: '#f7f8f5',
      display: 'flex',
      margin: '0 -30px',
      padding: '20px 30px 20px 30px',
      fontSize: 15,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      '& div:last-child': {
        marginLeft: 'auto',
        minWidth: 85,
      },
      [theme.breakpoints.down('xs')]: {
        paddingRight: 30,
      },
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
  };
});
type Params = { id: string };

export const OrderSummary: React.FC = () => {
  const classes = useStyles({});
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const params = useParams<Params>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const client = useApolloClient();
  const [diagnosisDataError, setDiagnosisDataError] = useState<boolean>(false);
  const [diagnosticOrderDetail, setDiagnosticOrderDetail] = useState<(orderDetails | null) | null>(
    null
  );
  const [orderLineItem, setOrderLineItem] = useState<(orderLineItems | null)[] | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  useEffect(() => {
    if (!diagnosticOrderDetail) {
      setIsLoading(true);
      client
        .query<GetDiagnosticOrderDetails, GetDiagnosticOrderDetailsVariables>({
          query: GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
          variables: { diagnosticOrderId: params.id },
          fetchPolicy: 'cache-first',
        })
        .then(({ data }) => {
          if (data && data.getDiagnosticOrderDetails.ordersList) {
            setDiagnosticOrderDetail(data.getDiagnosticOrderDetails.ordersList);
            const details = data.getDiagnosticOrderDetails.ordersList.diagnosticOrderLineItems;
            if (details && details.length > 0) {
              setOrderLineItem(details);
            } else {
              setOrderLineItem([]);
            }
            setDiagnosisDataError(false);
          }
        })
        .catch((e) => {
          setIsAlertOpen(true);
          setAlertMessage('something went wrong');
          console.log(e);
          setDiagnosisDataError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const getFormattedDateTime = (time: string) => {
    return moment(time).format('D MMM YYYY | hh:mm A');
  };
  const formatSlot = (slot: string /*07:00-07:30 */) => {
    return slot
      .split('-')
      .map((item) => moment(item.trim(), 'hh:mm').format('hh:mm A'))
      .join(' - ');
  };

  let totalPrice = 0;
  if (orderLineItem && orderLineItem.length > 0) {
    for (let i = 0; i < orderLineItem.length; i++) {
      if (orderLineItem) {
        const itemPrice = orderLineItem && orderLineItem[i]! && orderLineItem[i]!!.price;
        totalPrice = totalPrice + itemPrice!;
      }
    }
  }

  return (
    <div>
      <Header />
      {diagnosticOrderDetail ? (
        <div className={classes.container}>
          <div className={classes.contentWrapper}>
            <div className={classes.heading}>
              ORDER #{diagnosticOrderDetail && diagnosticOrderDetail.displayId}
            </div>
            <div className={classes.breadcrumbs}>
              <Link to={clientRoutes.testOrders()}>
                <div className={classes.backArrow}>
                  <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                  <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
                </div>
              </Link>
              <div className={classes.detailsHeader}>
                ORDER #{diagnosticOrderDetail && diagnosticOrderDetail.displayId}
              </div>
            </div>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMin={isSmallScreen ? 'calc(100vh - 90px)' : 'calc(100vh - 210px)'}
            >
              <div className={classes.content}>
                <div className={classes.orderDetails}>
                  <div>Order ID</div>
                  <div>#{diagnosticOrderDetail && diagnosticOrderDetail.displayId}</div>
                </div>
                <div className={classes.orderTime}>
                  <div>Date/Time</div>
                  <div className={classes.timeAndDate}>
                    <div className={classes.orderDate}>
                      {getFormattedDateTime(
                        diagnosticOrderDetail && diagnosticOrderDetail.createdDate
                      )}
                    </div>
                  </div>
                </div>
                {!!diagnosticOrderDetail.slotTimings && (
                  <div className={classes.orderTime}>
                    <div>Pickup Date</div>
                    <div className={classes.timeAndDate}>
                      <div className={classes.orderDate}>
                        {' '}
                        {`${moment(
                          diagnosticOrderDetail && diagnosticOrderDetail.diagnosticDate
                        ).format(`D MMM YYYY`)}`}
                      </div>
                    </div>
                  </div>
                )}
                {!!diagnosticOrderDetail.slotTimings && (
                  <div className={classes.orderTime}>
                    <div>Pickup Time</div>
                    <div className={classes.timeAndDate}>
                      <div className={classes.orderDate}>{`${formatSlot(
                        diagnosticOrderDetail && diagnosticOrderDetail.slotTimings
                      )}`}</div>
                    </div>
                  </div>
                )}
                <div className={classes.consultRow}>
                  <div className={classes.consultDetails}>
                    <div>Consult Details</div>
                    <div className={classes.priceDetails}>
                      <div>Qty</div>
                      <div className={classes.chargesDiv}>Charges</div>
                    </div>
                  </div>
                  {orderLineItem &&
                    orderLineItem.length > 0 &&
                    orderLineItem.map(
                      (item) =>
                        item && (
                          <div className={`${classes.consultDetails} ${classes.testsDetailedRow}`}>
                            <div>{item.diagnostics ? item.diagnostics.itemName : ''}</div>
                            <div className={classes.priceDetails}>
                              <div>{item.quantity ? item.quantity : 0}</div>
                              <div className={classes.chargesDiv}>
                                Rs. {item.price ? item.price : ''}
                              </div>
                            </div>
                          </div>
                        )
                    )}
                </div>
                <div className={classes.totalCharges}>
                  <div>Total</div>
                  <div>Rs. {totalPrice}</div>
                </div>
              </div>
            </Scrollbars>
          </div>
        </div>
      ) : (
        isLoading && (
          <div className={classes.progressLoader}>
            <CircularProgress size={30} />
          </div>
        )
      )}
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
