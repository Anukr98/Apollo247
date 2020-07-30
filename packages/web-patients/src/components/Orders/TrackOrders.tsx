import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, Typography, Tabs, Tab } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { OrderStatusCard } from 'components/Orders/OrderStatusCard';
import { CancelOrder } from 'components/Orders/CancelOrder';
import { ReturnOrder } from 'components/Orders/ReturnOrder';
import { OrdersSummary } from 'components/Orders/OrderSummary';
import { OrdersStorePickupSummary } from 'components/Orders/OrdersStorePickupSummary';
import { useMutation } from 'react-apollo-hooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { GET_MEDICINE_ORDER_OMS_DETAILS } from 'graphql/medicines';
import { getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails as OrderDetails } from 'graphql/types/getMedicineOrderOMSDetails';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { MEDICINE_ORDER_STATUS, MEDICINE_ORDER_TYPE } from 'graphql/types/globalTypes';
import { CancelOrderNotification } from 'components/Orders/CancelOrderNotification';

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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        margin: 0,
        padding: 15,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    headerActions: {
      marginLeft: 'auto',
      marginBottom: -6,
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
      [theme.breakpoints.down('xs')]: {
        margin: 0,
      },
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
    tabsRoot: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      minHeight: 44,
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      padding: 10,
      color: '#01475b',
      opacity: 0.6,
      minWidth: '50%',
      textTransform: 'none',
      minHeight: 44,
    },
    tabSelected: {
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    rootTabContainer: {
      padding: 0,
    },
    headerBackArrow: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        display: 'flex',
        zIndex: 2,
        alignItems: 'center',
      },
      '& button': {
        display: 'none',
        boxShadow: 'none',
        minWidth: 'auto',
        MozBoxShadow: 'none',
        padding: 0,
        marginRight: 15,
        '& img': {
          verticalAlign: 'middle',
        },
        [theme.breakpoints.down('xs')]: {
          display: 'block',
        },
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

type TrackOrdersProps = {
  orderAutoId: number;
  billNumber: string;
  setShowMobileDetails?: (showMobileDetails: boolean) => void;
};

export const TrackOrders: React.FC<TrackOrdersProps> = (props) => {
  const classes = useStyles({});
  const { orderAutoId, billNumber } = props;
  const { currentPatient } = useAllCurrentPatients();
  const urlParams = new URLSearchParams(window.location.search);
  const [tabValue, setTabValue] = useState<number>(
    urlParams.get('v') && String(urlParams.get('v')) && String(urlParams.get('v')) === 'invoice'
      ? 1
      : 0
  );
  const [moreActionsDialog, setMoreActionsDialog] = useState<null | HTMLElement>(null);
  const [isCancelOrderDialogOpen, setIsCancelOrderDialogOpen] = useState<boolean>(false);
  const [isReturnOrderDialogOpen, setIsReturnOrderDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const moreActionsopen = Boolean(moreActionsDialog);
  const [noOrderDetails, setNoOrderDetails] = useState<boolean>(false);
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const mascotRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [cancelOrderReasonText, setCancelOrderReasonText] = useState<string>('');
  // const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:990px)');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreActionsDialog(event.currentTarget);
  };
  const [orderDetailsData, setOrderDetailsData] = useState<OrderDetails | null>(null);
  const orderDetails = useMutation(GET_MEDICINE_ORDER_OMS_DETAILS);

  useEffect(() => {
    if (orderAutoId || billNumber) {
      setIsLoading(true);
      orderDetails({
        variables: {
          patientId: currentPatient && currentPatient.id,
          orderAutoId: typeof orderAutoId == 'string' ? parseInt(orderAutoId) : orderAutoId,
          billNumber,
        },
      })
        .then(({ data }: any) => {
          if (
            data &&
            data.getMedicineOrderOMSDetails &&
            data.getMedicineOrderOMSDetails.medicineOrderDetails
          ) {
            const medicineOrderDetails = data.getMedicineOrderOMSDetails.medicineOrderDetails;
            if (medicineOrderDetails) {
              setOrderDetailsData(medicineOrderDetails);
              setNoOrderDetails(false);
            } else {
              setNoOrderDetails(true);
            }
            setIsLoading(false);
          }
        })
        .catch((e) => {
          setIsLoading(false);
          console.log(e);
        });
    }
  }, [orderAutoId, billNumber]);

  const orderPayment =
    orderDetailsData &&
    orderDetailsData.medicineOrderPayments &&
    orderDetailsData.medicineOrderPayments.length > 0 &&
    orderDetailsData.medicineOrderPayments[0];
  const orderShipments =
    orderDetailsData &&
    orderDetailsData.medicineOrderShipments &&
    orderDetailsData.medicineOrderShipments[0];

  const isShipmentListHasBilledState = () => {
    if (orderShipments && orderShipments.medicineOrdersStatus) {
      const isBilled = orderShipments.medicineOrdersStatus.findIndex(
        (statusDetails) => statusDetails.orderStatus === MEDICINE_ORDER_STATUS.ORDER_BILLED
      );
      return isBilled !== -1 ? true : false;
    }
  };

  const isOrderBilled = isShipmentListHasBilledState();

  let disableCancel =
    orderDetailsData && orderDetailsData.currentStatus
      ? orderDetailsData.currentStatus !== MEDICINE_ORDER_STATUS.ORDER_PLACED &&
        orderDetailsData.currentStatus !== MEDICINE_ORDER_STATUS.ORDER_VERIFIED
      : false;

  const isNonCartOrder =
    orderDetailsData && orderDetailsData.orderType
      ? orderDetailsData.orderType === MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION
      : false;

  useEffect(() => {
    if (((isNonCartOrder && !isOrderBilled) || billNumber) && tabValue === 1) {
      setTabValue(0);
    }
  }, [isNonCartOrder, isOrderBilled, tabValue, billNumber]);

  return (
    <div className={classes.root}>
      {orderDetailsData && orderDetailsData.currentStatus !== MEDICINE_ORDER_STATUS.QUOTE && (
        <>
          <div className={classes.sectionHeader}>
            <div className={classes.headerBackArrow}>
              <AphButton
                onClick={() => {
                  if (isSmallScreen && props.setShowMobileDetails) {
                    props.setShowMobileDetails(false);
                  }
                }}
              >
                <img src={require('images/ic_back.svg')} />
              </AphButton>
            </div>
            {orderAutoId !== 0 && orderAutoId > 0 && (
              <>
                {(orderPayment && orderPayment.paymentType === 'COD') ||
                (orderPayment && orderPayment.paymentType === 'CASHLESS') ? (
                  <div className={classes.orderId}>
                    <span>ORDER #{orderAutoId}</span>
                  </div>
                ) : (
                  ''
                )}
                <div className={classes.headerActions}>
                  <AphButton
                    disabled={!orderAutoId || disableCancel}
                    onClick={handleClick}
                    className={classes.moreBtn}
                  >
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
                      <AphButton onClick={() => setIsCancelOrderDialogOpen(true)}>
                        Cancel Order
                      </AphButton>
                      {/* 
                  <AphButton onClick={() => setIsReturnOrderDialogOpen(true)}>
                    Return Order
                  </AphButton> */}
                    </div>
                  </Popover>
                </div>
              </>
            )}
          </div>
          <div className={classes.orderTrackCrads}>
            <Tabs
              value={tabValue}
              centered
              classes={{
                root: classes.tabsRoot,
                indicator: classes.tabsIndicator,
              }}
              onChange={(e, newValue) => {
                setTabValue(newValue);
              }}
            >
              {orderAutoId && (
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Track Order"
                  title={'Open track orders'}
                />
              )}
              {((isNonCartOrder && isOrderBilled) || !isNonCartOrder) && (
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Order Summary"
                  title={'Open order summary'}
                />
              )}
            </Tabs>
            {/*  */}

            <TabContainer>
              {noOrderDetails
                ? 'No Order is Found'
                : tabValue === 0 &&
                  orderAutoId && (
                    <Scrollbars
                      autoHide={true}
                      autoHeight
                      autoHeightMax={isSmallScreen ? 'calc(100vh - 96px)' : 'auto'}
                    >
                      <OrderStatusCard orderDetailsData={orderDetailsData} isLoading={isLoading} />
                    </Scrollbars>
                  )}
            </TabContainer>
            <TabContainer>
              {noOrderDetails
                ? 'No Order is Found'
                : orderAutoId
                ? ((isNonCartOrder && isOrderBilled) || !isNonCartOrder) &&
                  tabValue === 1 && (
                    <Scrollbars
                      autoHide={true}
                      autoHeight
                      autoHeightMax={isSmallScreen ? 'calc(100vh - 96px)' : 'auto'}
                    >
                      <div className={classes.customScroll}>
                        <OrdersSummary
                          orderDetailsData={orderDetailsData}
                          isShipmentListHasBilledState={isShipmentListHasBilledState}
                          isLoading={isLoading}
                        />
                      </div>
                    </Scrollbars>
                  )
                : billNumber && (
                    <Scrollbars
                      autoHide={true}
                      autoHeight
                      autoHeightMax={isSmallScreen ? 'calc(100vh - 96px)' : 'auto'}
                    >
                      <div className={classes.customScroll}>
                        <OrdersStorePickupSummary
                          orderDetailsData={orderDetailsData}
                          isLoading={isLoading}
                        />
                      </div>
                    </Scrollbars>
                  )}
            </TabContainer>
          </div>
        </>
      )}
      <AphDialog open={isCancelOrderDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsCancelOrderDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Cancel Order</AphDialogTitle>
        <CancelOrder
          setIsCancelOrderDialogOpen={(isDialogOpened: boolean) =>
            setIsCancelOrderDialogOpen(isDialogOpened)
          }
          orderAutoId={props.orderAutoId}
          setIsPopoverOpen={(isPopoverOpened: boolean) => setIsPopoverOpen(isPopoverOpened)}
          setCancelOrderReasonText={(reasonText: string) => {
            setCancelOrderReasonText(reasonText);
          }}
        />
      </AphDialog>
      <AphDialog open={isReturnOrderDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsReturnOrderDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Return Order</AphDialogTitle>
        <ReturnOrder
          setIsReturnOrderDialogOpen={setIsReturnOrderDialogOpen}
          orderAutoId={props.orderAutoId}
        />
      </AphDialog>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <CancelOrderNotification
              setIsCancelOrderDialogOpen={setIsCancelOrderDialogOpen}
              setIsPopoverOpen={setIsPopoverOpen}
            />
          </div>
        </div>
      </Popover>
    </div>
  );
};
