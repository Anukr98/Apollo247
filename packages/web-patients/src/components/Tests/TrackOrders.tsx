import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, Typography, Tabs, Tab } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { OrderStatusCard } from 'components/Orders/OrderStatusCard';
import { CancelOrder } from 'components/Orders/CancelOrder';
import { ReturnOrder } from 'components/Orders/ReturnOrder';
import { OrdersSummary } from 'components/Orders/OrderSummary';
import { useMutation } from 'react-apollo-hooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { GET_MEDICINE_ORDER_DETAILS } from 'graphql/profiles';
import { GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails as orederDetails } from 'graphql/types/GetMedicineOrderDetails';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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
    headerBackArrow: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        display: 'flex',
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
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

type TrackOrdersProps = {
  orderAutoId: number;
};

export const TrackOrders: React.FC<TrackOrdersProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const [tabValue, setTabValue] = useState<number>(0);
  const [moreActionsDialog, setMoreActionsDialog] = React.useState<null | HTMLElement>(null);
  const [isCancelOrderDialogOpen, setIsCancelOrderDialogOpen] = useState<boolean>(false);
  const [isReturnOrderDialogOpen, setIsReturnOrderDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const moreActionsopen = Boolean(moreActionsDialog);
  const [noOrderDetails, setNoOrderDetails] = useState<boolean>(false);
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:990px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreActionsDialog(event.currentTarget);
  };
  const [orderDetailsData, setOrderDetailsData] = useState<orederDetails | null>(null);
  const orderDetails = useMutation(GET_MEDICINE_ORDER_DETAILS);

  useEffect(() => {
    if (props.orderAutoId) {
      setIsLoading(true);
      orderDetails({
        variables: {
          patientId: currentPatient && currentPatient.id,
          orderAutoId:
            typeof props.orderAutoId == 'string' ? parseInt(props.orderAutoId) : props.orderAutoId,
        },
      })
        .then((res: any) => {
          if (
            res &&
            res.data &&
            res.data.getMedicineOrderDetails &&
            res.data.getMedicineOrderDetails.MedicineOrderDetails
          ) {
            const medicineOrderDetails = res.data.getMedicineOrderDetails.MedicineOrderDetails;
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
  }, [props.orderAutoId]);

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        <div className={classes.headerBackArrow}>
          <AphButton>
            <img src={require('images/ic_back.svg')} />
          </AphButton>
        </div>
        {props.orderAutoId !== 0 && props.orderAutoId > 0 && (
          <>
            <div className={classes.orderId}>
              <span>ORDER #{props.orderAutoId}</span>
            </div>
            <div className={classes.headerActions}>
              <AphButton
                disabled={!props.orderAutoId}
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

                  <AphButton onClick={() => setIsReturnOrderDialogOpen(true)}>
                    Return Order
                  </AphButton>
                </div>
              </Popover>
            </div>
          </>
        )}
      </div>
      <div className={classes.orderTrackCrads}>
        <Tabs
          value={tabValue}
          classes={{
            root: classes.tabsRoot,
            indicator: classes.tabsIndicator,
          }}
          onChange={(e, newValue) => {
            setTabValue(newValue);
          }}
        >
          <Tab
            classes={{
              root: classes.tabRoot,
              selected: classes.tabSelected,
            }}
            label="Track Order"
            title={'Open track orders'}
          />
          <Tab
            classes={{
              root: classes.tabRoot,
              selected: classes.tabSelected,
            }}
            label="Order Summary"
            title={'Open order summary'}
          />
        </Tabs>
        {tabValue === 0 && (
          <TabContainer>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMax={
                isMediumScreen
                  ? 'calc(100vh - 276px)'
                  : isSmallScreen
                  ? 'calc(100vh - 96px)'
                  : 'calc(100vh - 250px)'
              }
            >
              <div className={classes.customScroll}>
                {noOrderDetails ? (
                  'No Order is Found'
                ) : (
                  <OrderStatusCard orderDetailsData={orderDetailsData} isLoading={isLoading} />
                )}
              </div>
            </Scrollbars>
          </TabContainer>
        )}
        {tabValue === 1 && (
          <TabContainer>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMax={
                isMediumScreen
                  ? 'calc(100vh - 276px)'
                  : isSmallScreen
                  ? 'calc(100vh - 96px)'
                  : 'calc(100vh - 250px)'
              }
            >
              <div className={classes.customScroll}>
                {noOrderDetails ? (
                  'No Order is Found'
                ) : (
                  <OrdersSummary orderDetailsData={orderDetailsData} isLoading={isLoading} />
                )}
              </div>
            </Scrollbars>
          </TabContainer>
        )}
      </div>
      <AphDialog open={isCancelOrderDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsCancelOrderDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Cancel Order</AphDialogTitle>
        <CancelOrder
          setIsCancelOrderDialogOpen={setIsCancelOrderDialogOpen}
          orderAutoId={props.orderAutoId}
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
    </div>
  );
};