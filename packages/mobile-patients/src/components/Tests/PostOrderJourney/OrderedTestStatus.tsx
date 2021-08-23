import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState, useEffect, useCallback } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import _ from 'lodash';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import {
  DIAGNOSTIC_ORDER_STATUS,
  MedicalRecordType,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { TestOrderCard } from '@aph/mobile-patients/src/components/ui/TestOrderCard';
import {
  downloadDocument,
  g,
  getTestOrderStatusText,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WhatsAppIcon,
  CopyBlue,
  DownloadNew,
  ShareBlue,
  ViewIcon,
  Cross,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  AppConfig,
  DIAGNOSTIC_ORDER_FAILED_STATUS,
  DIAGNOSTIC_JUSPAY_REFUND_STATUS,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';
import { getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_labResults_response } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V3';
import { RefundCard } from '@aph/mobile-patients/src/components/Tests/components/RefundCard';
import { DiagnosticViewReportClicked } from '@aph/mobile-patients/src/components/Tests/Events';
import { TestViewReportOverlay } from '@aph/mobile-patients/src/components/Tests/components/TestViewReportOverlay';
export interface TestStatusObject {
  id: string;
  displayId: string;
  slotTimings: string;
  patientName: string;
  showDateTime: string;
  currentStatus: string;
  itemId: string;
  packageId: string | null;
  itemName: string;
  packageName: string;
  statusDate: string;
  testPreparationData: string;
}

export interface OrderedTestStatusProps extends NavigationScreenProps {}

export const OrderedTestStatus: React.FC<OrderedTestStatusProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const orderSelected = props.navigation.getParam('selectedOrder');
  const individualItemStatus = props.navigation.getParam('itemLevelStatus');
  const getRefundArray = props.navigation.getParam('refundStatusArr');

  const [isViewReport, setIsViewReport] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<any>('');
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const isPrepaid = orderSelected?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;

  const [individualTestData, setIndividualTestData] = useState<any>([]);
  const [labResults, setLabResults] = useState<
    | (getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_labResults_response | null)[]
    | null
    | undefined
  >([]);
  const [refundStatusArr, setRefundStatusArr] = useState<any>(getRefundArray);

  const statusNotToShowOnUi = [
    DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
    DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED,
  ];

  const client = useApolloClient();

  const error = props.navigation.getParam('error');

  useEffect(() => {
    setLoading!(true);
    createTestCardObject(individualItemStatus);
  }, []);

  const fetchTestReportResult = useCallback((order: any) => {
    setLoading?.(true);
    const getVisitId = orderSelected?.visitNo;
    getPatientPrismMedicalRecordsApi(
      client,
      currentPatient?.id,
      [MedicalRecordType.TEST_REPORT],
      'Diagnostics'
    )
      .then((data: any) => {
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'labResults',
          'response'
        );
        setLabResults(labResultsData);
        let resultForVisitNo = labResultsData?.filter(
          (item: any) => item?.identifier == getVisitId
        );
        let itemNameResult =
          resultForVisitNo?.length > 0 &&
          resultForVisitNo?.find((item: any) => item?.labTestName == order?.itemName);

        !!itemNameResult
          ? props.navigation.navigate(AppRoutes.HealthRecordDetails, {
              data: itemNameResult,
              labResults: true,
            })
          : renderReportError(string.diagnostics.responseUnavailableForReport);
      })
      .catch((error) => {
        CommonBugFender('OrderedTestStatus_fetchTestReportsData', error);
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setLoading!(false));
  }, []);

  const createTestCardObject = (data: any) => {
    let objArray: TestStatusObject[] = [];
    Object.keys(data).forEach((key) => {
      //not doing anything if null
      if (key == 'null') {
      } else {
        const getSelectedObj =
          key != 'null' &&
          orderSelected?.diagnosticOrderLineItems?.filter(
            (item: any) => item?.itemId?.toString() == key
          );
        let sortedSelectedObj: any;
        var lengthOfObject = data?.[key]?.length - 1;
        sortedSelectedObj = key != null && data?.[key]?.[lengthOfObject];
        var previousStatus = key != null && data?.[key]?.[lengthOfObject - 1];
        const getUTCDateTime = orderSelected?.slotDateTimeInUTC;
        const dt = moment(
          getUTCDateTime != null ? getUTCDateTime : orderSelected?.diagnosticDate!
        ).format(`D MMM YYYY`);
        const tm =
          getUTCDateTime != null
            ? moment(getUTCDateTime).format('hh:mm A')
            : orderSelected?.slotTimings;

        objArray.push({
          id: sortedSelectedObj?.id,
          displayId: orderSelected?.displayId!,
          slotTimings: tm,
          patientName: currentPatient?.firstName,
          showDateTime: dt,
          itemId: key,
          currentStatus:
            refundStatusArr?.length > 0
              ? refundStatusArr?.status
              : statusNotToShowOnUi.includes(sortedSelectedObj?.orderStatus) && !!previousStatus
              ? previousStatus?.orderStatus
              : sortedSelectedObj?.orderStatus,
          packageId: sortedSelectedObj?.packageId,
          itemName: sortedSelectedObj?.itemName,
          packageName: sortedSelectedObj?.packageName,
          statusDate: sortedSelectedObj?.statusDate,
          testPreparationData: '',
        });
      }
      setLoading?.(false);
      setIndividualTestData(objArray);
    });
  };

  const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
    return moment((slot?.split('-')[0] || '').trim(), 'hh:mm').format('hh:mm A');
  };

  const getFormattedTime = (time: string) => {
    return moment(time)?.format('hh:mm A');
  };

  const renderOrder = (order: any, index: number) => {
    const isHomeVisit = !!order?.slotTimings;

    const dt = moment(order?.statusDate).format(`D MMM YYYY`); //status date
    const tm = getSlotStartTime(order?.statusDate); //status time

    //here schedule for date should be time when you selected slot for pickup requested.
    const getScheduleDate = moment(order?.showDateTime).format(`D MMM YYYY`);
    const getScheduleTime = order?.slotTimings;
    const scheduledDtTm = `${getScheduleDate}${isHomeVisit ? `, ${getScheduleTime}` : ''}`;

    const statusTime = getFormattedTime(order?.statusDate);
    const dtTm = `${dt}${isHomeVisit ? `, ${statusTime}` : ''}`;
    const currentStatus =
      isPrepaid && refundStatusArr?.length > 0
        ? orderSelected?.orderStatus
        : DIAGNOSTIC_ORDER_FAILED_STATUS.includes(orderSelected?.orderStatus)
        ? orderSelected?.orderStatus
        : order?.currentStatus;
    const shouldShowCancel = DIAGNOSTIC_JUSPAY_REFUND_STATUS.includes(currentStatus)
      ? orderSelected?.orderStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED
      : currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED ||
        orderSelected?.orderStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED;
    return (
      <TestOrderCard
        key={`${order?.id}`}
        orderId={`${order?.displayId}`}
        showStatus={true}
        patientName={order?.patientName}
        isComingFrom={'individualTest'}
        showDateTime={true}
        showRescheduleCancel={false}
        isTypeOfPackage={order?.packageName != null ? true : false}
        ordersData={order}
        dateTime={
          order.currentStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
            ? `Completed On: ${dtTm}`
            : order?.currentStatus == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED
            ? orderSelected?.isRescheduled == true
              ? `Rescheduled For: ${scheduledDtTm}`
              : `Scheduled For: ${scheduledDtTm}`
            : `Scheduled For: ${dtTm}`
        }
        statusDesc={isHomeVisit ? 'Home Visit' : 'Clinic Visit'}
        isCancelled={shouldShowCancel}
        showViewReport={currentStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED}
        showRefund={refundStatusArr?.length > 0}
        refundStatus={refundStatusArr?.[0]?.status}
        onPress={() => {
          props.navigation.navigate(AppRoutes.TestOrderDetails, {
            orderId: orderSelected?.id,
            selectedTest: order,
            selectedOrder: orderSelected,
            individualTestStatus: individualItemStatus,
            comingFrom: AppRoutes.OrderedTestStatus,
            refundStatusArr: refundStatusArr,
          });
        }}
        status={currentStatus}
        statusText={getTestOrderStatusText(currentStatus)}
        style={[
          { marginHorizontal: 20 },
          index < individualTestData.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        showTestPreparation={order?.testPreparationData != ''} //call the service
        onOptionPress={() => {
          props.navigation.navigate(AppRoutes.TestOrderDetails, {
            orderId: orderSelected?.id,
            selectedTest: order,
            selectedOrder: orderSelected,
            individualTestStatus: individualItemStatus,
            comingFrom: AppRoutes.OrderedTestStatus,
            refundStatusArr: refundStatusArr,
          });
        }}
        onPressViewReport={() => _navigateToPHR(order)}
      />
    );
  };

  function _navigateToPHR(order: any) {
    const visitId = orderSelected?.visitNo;
    DiagnosticViewReportClicked();
    if (visitId) {
      setActiveOrder(order);
      fetchTestReportResult(order);
    } else {
      props.navigation.navigate(AppRoutes.HealthRecordsHome);
    }
  }

  const renderReportError = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const renderOrders = () => {
    return (
      <FlatList
        bounces={false}
        data={individualTestData}
        renderItem={({ item, index }) => renderOrder(item, index)}
        ListEmptyComponent={renderNoOrders()}
      />
    );
  };

  const renderNoOrders = () => {
    if (!loading && !error && individualTestData?.length == 0) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={string.common.uhOh}
          description={'We are unable to fetch details.. Please try again later'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        ></Card>
      );
    }
  };

  const renderError = () => {
    if (error) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={string.common.uhOh}
          description={'Something went wrong.'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
    }
  };

  const renderRefund = () => {
    if (refundStatusArr?.length > 0) {
      return <RefundCard refundArray={refundStatusArr} />;
    }
  };

  /**
   * hide for the time being
   */
  const renderChatWithUs = () => {
    return (
      <View style={{ justifyContent: 'center', alignSelf: 'center' }}>
        <View style={styles.chatWithUsView}>
          <TouchableOpacity
            style={styles.chatWithUsTouch}
            onPress={() => {
              Linking.openURL(
                AppConfig.Configuration.MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK
              ).catch((err) => CommonBugFender(`${AppRoutes.YourOrdersTest}_ChatWithUs`, err));
            }}
          >
            <WhatsAppIcon style={styles.whatsappIconStyle} />
            <Text style={styles.chatWithUsText}>{string.OrderSummery.chatWithUs}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: '34%' }}>
          <Text
            style={{
              textAlign: 'center',
              ...theme.fonts.IBMPlexSansRegular(13),
              color: colors.SHERPA_BLUE,
            }}
          >
            {string.reachUsOut}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={string.orders.urOrders}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} scrollEventThrottle={1}>
          {renderError()}
          {renderOrders()}
          {renderRefund()}
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  chatWithUsView: { paddingBottom: 10, paddingTop: 5 },
  chatWithUsTouch: { flexDirection: 'row', justifyContent: 'flex-end' },
  whatsappIconStyle: { height: 24, width: 24, resizeMode: 'contain' },
  chatWithUsText: {
    textAlign: 'center',
    paddingRight: 0,
    marginHorizontal: 5,
    ...theme.viewStyles.text('B', 14, colors.APP_YELLOW),
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  cancelReasonHeadingView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.WHITE,
    padding: 18,
    marginBottom: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: 'row',
  },
  cancelReasonHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'center',
    marginHorizontal: '20%',
  },
  cancelReasonContentHeading: {
    marginBottom: 12,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  cancelReasonContentView: { flexDirection: 'row', alignItems: 'center' },
  cancelReasonContentText: {
    flex: 0.9,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  reasonCancelDropDownExtraView: {
    marginTop: 5,
    backgroundColor: '#00b38e',
    height: 2,
  },
  cancelReasonSubmitButton: { margin: 16, marginTop: 32, width: 'auto' },
  reasonCancelOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    flex: 1,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  reasonCancelCrossTouch: { marginTop: 80, alignSelf: 'flex-end' },
  reasonCancelView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  modalMainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
    flexDirection: 'column',
  },
  reportModalView: {
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  reportModalOptionsView: {
    backgroundColor: 'white',
    width: '100%',
  },
  itemView: {
    backgroundColor: 'white',
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignContent: 'center',
    borderBottomColor: '#e8e8e8',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE),
  },
  copyTextStyle: {
    marginHorizontal: 10,
    textAlign: 'left',
    ...theme.viewStyles.text('SB', 14, theme.colors.APP_GREEN),
  },
});
