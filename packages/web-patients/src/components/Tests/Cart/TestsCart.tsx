import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  FormControlLabel,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
} from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { useDiagnosticsCart, Clinic } from 'components/Tests/DiagnosticsCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { ApplyCoupon } from 'components/Cart/ApplyCoupon';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { NavigationBottom } from 'components/NavigationBottom';
import { TestsListingCard } from 'components/Tests/Cart/TestsListingCard';
import { TestsFor } from 'components/Tests/Cart/TestsFor';
import { AppointmentsSlot } from 'components/Tests/Cart/AppointmentsSlot';
import { ClinicHours } from 'components/Tests/Cart/ClinicHours';
import { HomeVisit } from 'components/Tests/Cart/HomeVisit';
import { ClinicVisit } from 'components/Tests/Cart/ClinicVisit';
import {
  SaveDiagnosticOrder,
  SaveDiagnosticOrderVariables,
} from 'graphql/types/SaveDiagnosticOrder';
import {
  DiagnosticLineItem,
  DiagnosticOrderInput,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  BOOKINGSOURCE,
} from 'graphql/types/globalTypes';
import {
  getDiagnosticsCites,
  getDiagnosticsCitesVariables,
} from 'graphql/types/getDiagnosticsCites';
import { SAVE_DIAGNOSTIC_ORDER, GET_DIAGNOSTICS_CITES } from 'graphql/profiles';
import { useMutation } from 'react-apollo-hooks';
import moment from 'moment';
import {
  AphButton,
  AphRadio,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
} from '@aph/web-ui-components';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useLocationDetails } from 'components/LocationProvider';
import { useApolloClient } from 'react-apollo-hooks';
import { Alerts } from 'components/Alerts/Alerts';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 10,
      [theme.breakpoints.up('sm')]: {
        paddingRight: 20,
        paddingTop: 20,
        PaddingLeft: 3,
        display: 'flex',
        paddingBottom: 20,
      },
    },
    checkoutType: {
      padding: '10px 18px',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      marginTop: 20,
      '& ul': {
        padding: 0,
        margin: 0,
      },
      '& li': {
        listStyleType: 'none',
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
        paddingBottom: 10,
        '&:last-child': {
          paddingBottom: 0,
        },
      },
    },
    radioLabel: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      alignItems: 'center',
      '& span:last-child': {
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    rightSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      padding: '20px 5px',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: 0,
        paddingBottom: 10,
      },
    },
    medicineSection: {
      paddingLeft: 15,
      paddingRight: 15,
    },
    sectionGroup: {
      marginBottom: 10,
    },
    serviceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 44,
      paddingbottom: 10,
    },
    serviceImg: {
      marginRight: 20,
      '& img': {
        maxWidth: 49,
        verticalAlign: 'middle',
      },
    },
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    serviceinfoText: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: 0.04,
      opacity: 0.6,
      lineHeight: 1.67,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.2)',
      paddingTop: 10,
      paddingBottom: 10,
      display: 'inline-block',
      width: '100%',
    },
    marginNone: {
      marginBottom: 5,
    },
    bottomImgGroup: {
      marginTop: 40,
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
    medicineListGroup: {
      paddingRight: 15,
      paddingLeft: 20,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    count: {
      paddingLeft: 10,
    },
    pastSearches: {
      paddingBottom: 10,
    },
    topHeader: {
      paddingTop: 0,
      textTransform: 'uppercase',
    },
    addItemBtn: {
      padding: 0,
      color: '#fc9916',
      boxShadow: 'none',
      fontWeight: 'bold',
      paddingLeft: 20,
      marginLeft: 'auto',
    },
    deliveryAddress: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      display: 'inline-block',
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
    },
    tabsRoot: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      padding: '11px 10px',
      color: '#01475b',
      opacity: 0.6,
      minWidth: '50%',
      textTransform: 'none',
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 5,
    },
    rootTabContainer: {
      padding: 0,
    },
    priceSection: {
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      padding: 10,
      paddingbottom: 8,
      color: '#01475b',
      fontSize: 14,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
    },
    topSection: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 5,
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: 5,
    },
    bottomSection: {
      paddingTop: 5,
    },
    priceCol: {
      marginLeft: 'auto',
      fontWeight: 'bold',
    },
    totalPrice: {
      marginLeft: 'auto',
      fontWeight: 'bold',
    },
    checkoutBtn: {
      padding: 15,
      paddingTop: 10,
      paddingBottom: 0,
      [theme.breakpoints.down('xs')]: {
        padding: 20,
        position: 'fixed',
        width: '100%',
        left: 0,
        bottom: 0,
        backgroundColor: '#dcdfce',
        zIndex: 991,
      },
    },
    dialogContent: {
      paddingTop: 6,
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      '& button': {
        borderRadius: 10,
      },
    },
    customScrollBar: {
      paddingRight: 20,
      paddingLeft: 20,
      paddingBottom: 20,
    },
    shadowHide: {
      overflow: 'hidden',
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
    uploadPrescription: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: '10px 15px',
      marginBottom: 20,
    },
    prescriptionRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      '& >span': {
        paddingRight: 20,
      },
      '& button': {
        marginLeft: 'auto',
      },
    },
    consultDoctor: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      marginTop: 10,
      '& >span': {
        paddingRight: 20,
      },
    },
    consultDoctoLink: {
      marginLeft: 'auto',
      fontSize: 13,
      fontWeight: 'bold',
      color: '#fc9916',
      textTransform: 'uppercase',
    },
    uploadedPreList: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      marginBottom: 20,
    },
    uploadMore: {
      textAlign: 'right',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        fontWeight: 'bold',
        color: '#fc9916',
        padding: 0,
      },
    },
    presUploadBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 'auto',
      fontWeight: 'bold',
      color: '#fc9916',
      minWidth: 155,
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    uppercase: {
      textTransform: 'uppercase',
    },
    followUpWrapper: {
      backgroundColor: '#fff',
      margin: '0 0 0 8px',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      width: '100%',
      padding: 10,
    },
    fileInfo: {
      display: 'flex',
      margin: '10px 0 0 0',
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
    },
    patientHistory: {
      opacity: 0.6,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
      '& span': {
        margin: '0 5px 0 0',
      },
    },
    ePrescriptionTitle: {
      zIndex: 9999,
    },
    cartItemsScroll: {
      [theme.breakpoints.up(768)]: {
        maxHeight: 'calc(100vh - 208px)',
      },
      [theme.breakpoints.up(900)]: {
        maxHeight: 'calc(100vh - 148px)',
      },
      [theme.breakpoints.down('xs')]: {
        maxHeight: '100%',
        '& >div:nth-child(2)': {
          display: 'none',
        },
        '& >div:nth-child(3)': {
          display: 'none',
        },
      },
    },
    paymentsScroll: {
      [theme.breakpoints.up(768)]: {
        height: 'calc(100vh - 299px) !important',
      },
      [theme.breakpoints.up(900)]: {
        height: 'calc(100vh - 239px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        height: '100% !important',
        '& >div:nth-child(2)': {
          display: 'none',
        },
        '& >div:nth-child(3)': {
          display: 'none',
        },
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const TestsCart: React.FC = (props) => {
  const classes = useStyles({});
  const {
    cartTotal,
    diagnosticsCartItems,
    deliveryAddressId,
    diagnosticSlot,
    clinicId,
    clearCartInfo,
  } = useDiagnosticsCart();
  const { state, city, setCityId, setStateId, stateId, cityId } = useLocationDetails();
  const client = useApolloClient();

  const [tabValue, setTabValue] = useState<number>(0);

  const [isApplyCouponDialogOpen, setIsApplyCouponDialogOpen] = React.useState<boolean>(false);
  const [couponCode, setCouponCode] = React.useState<string>('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('COD');
  const [mutationLoading, setMutationLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedAddressData, setSelectedAddressData] = React.useState<any | null>(null);
  const [isSlotSet, setIsSlotSet] = React.useState<boolean>(false);

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const deliveryMode = tabValue === 0 ? 'HOME' : 'Clinic';
  const disablePayButton = paymentMethod === '';
  const { currentPatient } = useAllCurrentPatients();

  // business rule defined if the total is greater than 200 no delivery charges.
  // if the total is less than 200 +20 is added.
  const discountAmount = couponCode !== '' ? parseFloat(((cartTotal * 10) / 100).toFixed(2)) : 0;
  const grossValue = cartTotal - discountAmount;
  const deliveryCharges = grossValue > 200 || grossValue <= 0 || tabValue === 1 ? 0 : 20;
  const totalAmount = (grossValue + deliveryCharges).toFixed(2);
  const showGross = deliveryCharges < 0 || discountAmount > 0;

  const isPaymentButtonEnable = diagnosticsCartItems && diagnosticsCartItems.length > 0;
  const saveDiagnosticOrder = useMutation<SaveDiagnosticOrder, SaveDiagnosticOrderVariables>(
    SAVE_DIAGNOSTIC_ORDER
  );

  const slotStartTime = diagnosticSlot ? diagnosticSlot.slotStartTime : '';
  const slotEndTime = diagnosticSlot ? diagnosticSlot.slotEndTime : '';
  const employeeSlotId = diagnosticSlot ? diagnosticSlot.employeeSlotId : 0;
  const diagnosticEmployeeCode = diagnosticSlot ? diagnosticSlot.diagnosticEmployeeCode : '';
  const diagnosticBranchCode = diagnosticSlot ? diagnosticSlot.diagnosticBranchCode : '';
  const date = diagnosticSlot
    ? moment(diagnosticSlot.date).format('YYYY-MM-DD')
    : moment().format('YYYY-MM-DD');

  useEffect(() => {
    client
      .query<getDiagnosticsCites, getDiagnosticsCitesVariables>({
        query: GET_DIAGNOSTICS_CITES,
        variables: {
          cityName: city || '',
          patientId: (currentPatient && currentPatient.id) || '',
        },
      })
      .then(({ data }) => {
        if (data && data.getDiagnosticsCites && data.getDiagnosticsCites.diagnosticsCities) {
          const citiesList = data.getDiagnosticsCites.diagnosticsCities;
          const requredCityDetails =
            city &&
            citiesList.length > 0 &&
            citiesList.find((cityData) => cityData && cityData.cityname === city);
          if (requredCityDetails) {
            setCityId(requredCityDetails.cityid);
            setStateId(requredCityDetails.stateid);
          }
        }
      })
      .catch((e) => {
        console.log(e);
      });
  });

  const paymentOrderTest = () => {
    const slotTimings = (slotStartTime && slotEndTime
      ? `${slotStartTime}-${slotEndTime}`
      : ''
    ).replace(' ', '');

    const orderInfo: DiagnosticOrderInput = {
      // <- for home collection order
      diagnosticBranchCode: deliveryMode === 'HOME' ? diagnosticBranchCode : '',
      diagnosticEmployeeCode: deliveryMode === 'HOME' ? diagnosticEmployeeCode : '',
      employeeSlotId: deliveryMode === 'HOME' ? employeeSlotId : 0,
      slotTimings: slotTimings,
      patientAddressId: deliveryAddressId!,
      // for home collection order ->
      // <- for clinic order
      centerName: deliveryMode !== 'HOME' && selectedClinic ? selectedClinic.CentreName : '',
      centerCode: deliveryMode !== 'HOME' && selectedClinic ? selectedClinic.CentreCode : '',
      centerCity: deliveryMode !== 'HOME' && selectedClinic ? selectedClinic.City : '',
      centerState: deliveryMode !== 'HOME' && selectedClinic ? selectedClinic.State : '',
      centerLocality: deliveryMode !== 'HOME' && selectedClinic ? selectedClinic.Locality : '',
      // for clinic order ->
      city: city || '',
      state: state || '',
      stateId: stateId ? stateId.toString() : '',
      cityId: cityId ? cityId.toString() : '',
      diagnosticDate: date,
      prescriptionUrl: '',
      paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD,
      bookingSource: screen.width < 768 ? BOOKINGSOURCE.MOBILE : BOOKINGSOURCE.WEB,
      totalPrice: parseFloat(cartTotal.toFixed(2)),
      patientId: (currentPatient && currentPatient.id) || '',
      items: diagnosticsCartItems.map(
        (item) =>
          ({
            itemId: typeof item.itemId == 'string' ? parseInt(item.itemId) : item.itemId,
            price: (item.specialPrice as number) || item.price,
            quantity: 1,
          } as DiagnosticLineItem)
      ),
    };
    saveDiagnosticOrder({
      variables: { diagnosticOrderInput: orderInfo },
      fetchPolicy: 'no-cache',
    })
      .then((data: any) => {
        if (
          data &&
          data.data.SaveDiagnosticOrder &&
          data.data.SaveDiagnosticOrder.displayId &&
          data.data.SaveDiagnosticOrder.displayId.length > 0
        ) {
          clearCartInfo && clearCartInfo();
          const { displayId } = data.data.SaveDiagnosticOrder;
          setTimeout(() => {
            window.location.href = `${clientRoutes.tests()}?orderid=${displayId}&orderstatus=success`;
          }, 3000);
        } else {
          window.location.href = `${clientRoutes.tests()}?orderid=0&orderstatus=failure`;
        }
      })
      .catch((e) => {
        console.log(e);
        setMutationLoading(false);
        setIsAlertOpen(true);
        setAlertMessage('Error while placing order.');
      });
  };

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars
          className={classes.cartItemsScroll}
          autoHide={true}
          renderView={(props) =>
            isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
          }
        >
          <div className={classes.medicineListGroup}>
            <div className={classes.sectionHeader}>
              <span>Tests In Your Cart</span>
              <span className={classes.count}>
                (
                {diagnosticsCartItems.length > 0
                  ? String(diagnosticsCartItems.length).padStart(2, '0')
                  : 0}
                )
              </span>
              <AphButton
                className={classes.addItemBtn}
                onClick={() => {
                  window.location.href = clientRoutes.tests();
                }}
                title={'Add items to cart'}
              >
                Add Items
              </AphButton>
            </div>
            <TestsListingCard />
            <TestsFor />
          </div>
        </Scrollbars>
      </div>
      <div className={classes.rightSection}>
        <Scrollbars
          autoHide={true}
          className={classes.paymentsScroll}
          renderView={(props) =>
            isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
          }
        >
          <div className={classes.medicineSection}>
            <div className={`${classes.sectionHeader} ${classes.topHeader}`}>
              <span>Where to collect sample tests from?</span>
            </div>
            <div className={classes.sectionGroup}>
              <div className={classes.deliveryAddress}>
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
                    label="Home Visit"
                    title={'Choose home visit'}
                  />
                  <Tab
                    classes={{
                      root: classes.tabRoot,
                      selected: classes.tabSelected,
                    }}
                    label="Clinic Visit"
                    title={'Choose store pick up'}
                  />
                </Tabs>
                {tabValue === 0 && (
                  <TabContainer>
                    <HomeVisit
                      selectedAddressData={selectedAddressData}
                      setSelectedAddressData={setSelectedAddressData}
                    />
                  </TabContainer>
                )}
                {tabValue === 1 && (
                  <TabContainer>
                    <ClinicVisit
                      selectedClinic={selectedClinic}
                      setSelectedClinic={setSelectedClinic}
                    />
                  </TabContainer>
                )}
              </div>
            </div>
            {tabValue === 0 ? (
              deliveryAddressId ? (
                <AppointmentsSlot setIsSlotSet={setIsSlotSet} />
              ) : null
            ) : (
              <ClinicHours />
            )}
            {diagnosticsCartItems && diagnosticsCartItems.length > 0 && (
              <>
                <div className={`${classes.sectionHeader} ${classes.uppercase}`}>
                  <span>Total Charges</span>
                </div>
                <div className={`${classes.sectionGroup}`}>
                  <div className={classes.priceSection}>
                    <div className={classes.topSection}>
                      <div className={classes.priceRow}>
                        <span>Subtotal</span>
                        <span className={classes.priceCol}>Rs. {cartTotal.toFixed(2)}</span>
                      </div>
                      {/* <div className={classes.priceRow}>
                        <span>Delivery Charges</span>
                        <span className={classes.priceCol}>
                          {deliveryCharges > 0 ? `+ Rs. ${deliveryCharges}` : '+ Rs. 0'}
                        </span>
                      </div> */}
                    </div>
                    <div className={classes.bottomSection}>
                      <div className={classes.priceRow}>
                        <span>To Pay</span>
                        <span className={classes.totalPrice}>
                          {showGross ? `(${cartTotal.toFixed(2)})` : ''} Rs. {cartTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Scrollbars>
        <div className={classes.checkoutBtn}>
          <AphButton
            onClick={() => {
              if (diagnosticsCartItems && diagnosticsCartItems.length > 0) {
                setCheckoutDialogOpen(true);
              }
            }}
            color="primary"
            fullWidth
            disabled={
              !isPaymentButtonEnable ||
              (deliveryMode === 'Clinic' && !clinicId) ||
              (deliveryMode === 'HOME' && (!deliveryAddressId || !isSlotSet))
            }
            className={
              !isPaymentButtonEnable ||
              mutationLoading ||
              (deliveryMode === 'Clinic' && !clinicId) ||
              (deliveryMode === 'HOME' && (!deliveryAddressId || !isSlotSet))
                ? classes.buttonDisable
                : ''
            }
            title={'Proceed to pay bill'}
          >
            {`Proceed to pay — RS. ${cartTotal.toFixed(2)}`}
          </AphButton>
        </div>
      </div>

      <AphDialog open={checkoutDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setCheckoutDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Checkout</AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <div>
                  <div className={classes.sectionHeader}>Pick a payment mode</div>
                  <div className={classes.checkoutType}>
                    <ul>
                      <li>
                        <FormControlLabel
                          className={classes.radioLabel}
                          value="COD"
                          checked={true}
                          control={<AphRadio color="primary" />}
                          label="Cash On Delivery"
                          onChange={() => {
                            setPaymentMethod('COD');
                          }}
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton
              onClick={(e) => {
                /**Gtm code start  */
                window.gep && window.gep('Pharmacy','Order','Payment-COD',cartTotal.toFixed(2))
                /**Gtm code End  */
                setMutationLoading(true);
                paymentOrderTest();
              }}
              color="primary"
              fullWidth
              disabled={disablePayButton}
              className={paymentMethod === '' || mutationLoading ? classes.buttonDisable : ''}
            >
              {mutationLoading ? (
                <CircularProgress size={22} color="secondary" />
              ) : (
                `Pay - RS. ${cartTotal.toFixed(2)}`
              )}
            </AphButton>
          </div>
        </div>
      </AphDialog>

      <AphDialog open={isApplyCouponDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsApplyCouponDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Apply Coupon</AphDialogTitle>
        <ApplyCoupon
          setCouponCode={setCouponCode}
          couponCode={couponCode}
          close={(isApplyCouponDialogOpen: boolean) => {
            setIsApplyCouponDialogOpen(isApplyCouponDialogOpen);
          }}
          cartValue={cartTotal}
        />
      </AphDialog>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
      <NavigationBottom />
    </div>
  );
};
