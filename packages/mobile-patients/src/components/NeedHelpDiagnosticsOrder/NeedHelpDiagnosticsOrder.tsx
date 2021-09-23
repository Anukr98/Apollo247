import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import { NeedHelpEmailPopup } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder/NeedHelpEmailPopup';
import { Events, Helpers } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AphListItem } from '@aph/mobile-patients/src/components/ui/AphListItem';
import { createAddressObject, sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_DIAGNOSTIC_ORDERS_LIST_BY_MOBILE,
  GET_MEDICINE_ORDER_OMS_DETAILS_SHIPMENT,
  SEND_HELP_EMAIL,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetMedicineOrderShipmentDetails,
  GetMedicineOrderShipmentDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderShipmentDetails';
import {
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  DIAGNOSTIC_ORDER_STATUS,
  Gender,
  MEDICINE_ORDER_STATUS,
  ORDER_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SendHelpEmail,
  SendHelpEmailVariables,
} from '@aph/mobile-patients/src/graphql/types/SendHelpEmail';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  getPatientNameById,
  nameFormater,
  navigateToHome,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  AppConfig,
  BLACK_LIST_CANCEL_STATUS_ARRAY,
  BLACK_LIST_RESCHEDULE_STATUS_ARRAY,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { Down, DownO, InfoIconRed, ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Divider } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import {
  getDiagnosticOrdersListByMobile,
  getDiagnosticOrdersListByMobileVariables,
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList as orderListByMobile } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { OrderTestCard } from '@aph/mobile-patients/src/components/Tests/components/OrderTestCard';
type orderList = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList;
const screenheight = Dimensions.get('window').height;

export interface Props
  extends NavigationScreenProps<{
    queries: NeedHelpHelpers.HelpSectionQuery[];
    queryIdLevel1: string;
    queryIdLevel2: string;
    email: string;
    orderId?: string;
    isOrderRelatedIssue?: boolean;
    medicineOrderStatus?: MEDICINE_ORDER_STATUS;
    isConsult?: boolean;
    medicineOrderStatusDate?: any;
    sourcePage: WebEngageEvents[WebEngageEventName.HELP_TICKET_SUBMITTED]['Source_Page'];
  }> {}

export const NeedHelpDiagnosticsOrder: React.FC<Props> = ({ navigation }) => {
  const sourcePage = navigation.getParam('sourcePage') || 'My Account';
  const _queries = navigation.getParam('queries');
  const queryIdLevel1 = navigation.getParam('queryIdLevel1') || '';
  const queryIdLevel2 = navigation.getParam('queryIdLevel2') || '';
  const medicineOrderStatusDate = navigation.getParam('medicineOrderStatusDate');
  const [email, setEmail] = useState(navigation.getParam('email') || '');
  const orderId = navigation.getParam('orderId') || '';
  const isOrderRelatedIssue = navigation.getParam('isOrderRelatedIssue') || false;
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(email ? false : true);
  const [requestEmailWithoutAction, setRequestEmailWithoutAction] = useState<boolean>(true);
  const [onPressIssue, setOnPressIssue] = useState<string>('');
  const [currentOffset, setCurrentOffset] = useState<number>(1);
  const [orderListData, setOrderListData] = useState<(orderListByMobile | null)[] | null>([]);
  const [resultList, setResultList] = useState<(orderListByMobile | null)[] | null>([]);
  const medicineOrderStatus = navigation.getParam('medicineOrderStatus');
  const { saveNeedHelpQuery, getQueryData, getQueryDataByOrderStatus } = Helpers;
  const [queries, setQueries] = useState<NeedHelpHelpers.HelpSectionQuery[]>(_queries || []);
  const subQueriesData = getQueryData(queries, queryIdLevel1, queryIdLevel2);
  const subQueries = (subQueriesData?.queries as NeedHelpHelpers.HelpSectionQuery[]) || [];
  const headingTitle = queries?.find((q) => q.id === queryIdLevel1)?.title || 'Query';
  const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;

  const client = useApolloClient();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { needHelpToContactInMessage, needHelpTicketReferenceText } = useAppCommonData();
  const isConsult = navigation.getParam('isConsult') || false;
  const [selectedQueryId, setSelectedQueryId] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const apolloClient = useApolloClient();
  const [isPrevious, setIsPrevious] = useState<boolean>(false);
  const [filteredOrderList, setFilteredOrderList] = useState<(orderListByMobile | null)[] | null>(
    []
  );

  const [orders, setOrders] = useState<any>([]);
  const { getHelpSectionQueries } = NeedHelpHelpers;

  useEffect(() => {
    if (!_queries) {
      fetchQueries();
    }
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading?.(true);
      const queries = await getHelpSectionQueries(apolloClient);
      setQueries(queries);
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
    }
  };

  const getOrderDetails = async (orderId: string) => {
    const variables: GetMedicineOrderShipmentDetailsVariables = {
      patientId: currentPatient?.id,
      orderAutoId: Number(orderId),
    };
    const { data } = await client.query<
      GetMedicineOrderShipmentDetails,
      GetMedicineOrderShipmentDetailsVariables
    >({
      query: GET_MEDICINE_ORDER_OMS_DETAILS_SHIPMENT,
      variables,
    });
    return data?.getMedicineOrderOMSDetailsWithAddress?.medicineOrderDetails;
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    fetchOrders();
  }, [currentOffset]);
  useEffect(() => {
    setOrders(resultList);
  }, [resultList]);
  const fetchOrders = async () => {
    try {
      setLoading?.(true);
      client
        .query<getDiagnosticOrdersListByMobile, getDiagnosticOrdersListByMobileVariables>({
          query: GET_DIAGNOSTIC_ORDERS_LIST_BY_MOBILE,
          context: {
            sourceHeaders,
          },
          variables: {
            mobileNumber: currentPatient && currentPatient.mobileNumber,
            paginated: true,
            limit: 10,
            offset: currentOffset,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const ordersList = data?.data?.getDiagnosticOrdersListByMobile?.ordersList || [];
          setOrderListData(ordersList);
          if (currentOffset == 1) {
            setResultList(ordersList);
          } else {
            setResultList(resultList?.concat(ordersList));
          }
          const finalList = currentOffset == 1 ? ordersList : resultList?.concat(ordersList);
          const filteredOrderList =
            finalList ||
            []?.filter((item: orderListByMobile) => {
              if (
                item?.diagnosticOrderLineItems?.length &&
                item?.diagnosticOrderLineItems?.length > 0
              ) {
                return item;
              }
            });
          setLoading?.(false);
        })
        .catch((error) => {
          setLoading?.(false);
          CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchOrders`, error);
        });
    } catch (error) {
      setLoading?.(false);
      CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchOrders`, error);
    }
  };

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);
  const renderOrder = (order: orderList, index: number) => {
    if (order?.diagnosticOrderLineItems?.length == 0) {
      return <View style={{ paddingTop: 4 }} />;
    }
    const getUTCDateTime = order?.slotDateTimeInUTC;

    const currentStatus = order?.orderStatus;
    const isPastOrder = moment(getUTCDateTime).diff(moment(), 'minutes') < 0;
    /**
     * show cancel & reschdule if status is something like this.
     */
    const isCancelValid = order?.diagnosticOrdersStatus?.find((item) =>
      BLACK_LIST_CANCEL_STATUS_ARRAY.includes(item?.orderStatus!)
    );
    const isCancelValidAtOrderLevel = BLACK_LIST_CANCEL_STATUS_ARRAY.includes(order?.orderStatus!);
    // const showCancel = isCancelValid == undefined && !isPastOrder ? true : false;
    const showCancel = isCancelValid == undefined && !isCancelValidAtOrderLevel ? true : false;
    const isRescheduleValid = order?.diagnosticOrdersStatus?.find((item: any) =>
      BLACK_LIST_RESCHEDULE_STATUS_ARRAY.includes(item?.orderStatus)
    );
    const isRescheduleValidAtOrderLevel = BLACK_LIST_RESCHEDULE_STATUS_ARRAY.includes(
      order?.orderStatus!
    );
    // const showReschedule = isRescheduleValid == undefined && !isPastOrder ? true : false;
    const showReschedule =
      isRescheduleValid == undefined && !isRescheduleValidAtOrderLevel ? true : false;

    //show the reschedule option :-

    const showReport = false;

    //show extra view if array contains SAMPLE_REJECTED_IN_LAB, 2nd reqd.
    const showExtraInfo = false;

    const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
      return moment((slot?.split('-')[0] || '').trim(), 'hh:mm');
    };

    return (
      <OrderTestCard
        orderId={order?.displayId}
        key={order?.id}
        isHelp={true}
        createdOn={order?.createdDate}
        orderLevelStatus={order?.orderStatus}
        orderAttributesObj={order?.attributesObj}
        patientName={
          !!order?.patientObj
            ? `${order?.patientObj?.firstName} ${order?.patientObj?.lastName}`
            : getPatientNameById(allCurrentPatients, order?.patientId)
        }
        gender={
          !!order?.patientObj?.gender
            ? order?.patientObj?.gender === Gender.MALE
              ? 'Mr.'
              : 'Ms.'
            : ''
        }
        showAddTest={false}
        ordersData={order?.diagnosticOrderLineItems!}
        showPretesting={false}
        dateTime={!!order?.slotDateTimeInUTC ? order?.slotDateTimeInUTC : order?.diagnosticDate}
        slotTime={
          !!order?.slotDateTimeInUTC
            ? order?.slotDateTimeInUTC
            : getSlotStartTime(order?.slotTimings)
        }
        isPrepaid={order?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT}
        isCancelled={currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        cancelledReason={
          currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED &&
          order?.diagnosticOrderCancellation != null
            ? order?.diagnosticOrderCancellation
            : null
        }
        showRescheduleCancel={
          showReschedule && order?.orderStatus != DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED
        }
        showReportOption={
          showReport || order?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED
        }
        showAdditonalView={false}
        additonalRejectedInfo={[]}
        price={order?.totalPrice}
        onPressCard={() => {
          onPressHelp(order);
        }}
        onPressAddTest={() => {}}
        onPressReschedule={() => {}}
        onPressViewDetails={() => {
          onPressHelp(order);
        }}
        onPressViewReport={() => {}}
        phelboObject={order?.phleboDetailsObj}
        onPressRatingStar={(star) => {}}
        onPressCallOption={(name, number) => {}}
        style={[
          { marginHorizontal: 20 },
          index < orders?.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
      />
    );
  };
  const onPressHelp = (item: any) => {
    const currentStatusDate = item?.medicineOrdersStatus?.find(
      (i) => i?.orderStatus === item?.currentStatus
    )?.statusDate;
    navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
      isOrderRelatedIssue: true,
      medicineOrderStatus: item.currentStatus,
      medicineOrderStatusDate: currentStatusDate,
      orderId: item?.displayId,
      queryIdLevel1,
      queries,
      email,
      sourcePage,
    });
  };
  const renderLoadMore = () => {
    return (
      <TouchableOpacity
        style={styles.loadMoreView}
        onPress={() => {
          setCurrentOffset(currentOffset + 1);
        }}
      >
        <Text style={styles.textLoadMore}>{nameFormater('load more', 'upper')}</Text>
        <DownO size="sm_l" style={styles.downArrow} />
      </TouchableOpacity>
    );
  };

  const renderFirstOrder = () => {
    return (
      <FlatList
        keyExtractor={keyExtractor}
        bounces={false}
        data={orders.slice(0, 1)}
        extraData={orders}
        style={{ marginTop: 10 }}
        renderItem={({ item, index }) => (
          <View>
            {renderOrder(item, index)}
            {renderPreviousOrderTab()}
          </View>
        )}
        // initialNumToRender={10}
        ListEmptyComponent={<></>}
        ListFooterComponent={
          <>
            {orders?.length > 0 ? <Spearator /> : null}
            <Text style={styles.subHeading}>
              If your order transaction failed report issue in this section:
            </Text>
            {renderNotOrderRelated()}
          </>
        }
      />
    );
  };

  const renderNonOrderReason = () => {
    if (!subQueries?.length) {
      return null;
    }
    let data = getQueryDataByOrderStatus(subQueriesData, isOrderRelatedIssue, medicineOrderStatus);
    const showReturnOrder =
      MEDICINE_ORDER_STATUS.DELIVERED &&
      !!medicineOrderStatusDate &&
      moment(new Date()).diff(moment(medicineOrderStatusDate), 'hours') <= 48;

    if (!showReturnOrder) {
      data = data.filter((item) => item.id !== helpSectionQueryId.returnOrder);
    }
    return (
      <View style={styles.flatListContainer}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(_, i) => `${i}`}
          bounces={false}
          ItemSeparatorComponent={renderDivider}
        />
      </View>
    );
  };

  const renderHeader = () => {
    const onPressBack = () => navigation.goBack();
    const pageTitle = string.help.toUpperCase();
    return <Header title={pageTitle} leftIcon="backArrow" onPressLeftIcon={onPressBack} />;
  };

  const renderBreadCrumb = () => {
    const breadCrumb = [
      {
        title: string.needHelp,
      },
      {
        title: headingTitle,
      },
    ];
    return <Breadcrumb links={breadCrumb} containerStyle={styles.breadcrumb} />;
  };

  const onSuccess = (res: any) => {
    let ticketId = res?.data?.sendHelpEmail.split(':')[1] || 0;
    let ticketType = res?.data?.sendHelpEmail.split(':')[2] || '';

    let referenceNumberText = '';
    if (ticketType && ticketType === 'fd') {
      referenceNumberText = ticketId
        ? needHelpTicketReferenceText.replace('#ticketNumber', '#' + ticketId)
        : '';
    }

    showAphAlert!({
      title: string.common.hiWithSmiley,
      description:
        (needHelpToContactInMessage || string.needHelpSubmitMessage) + '. ' + referenceNumberText,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();

        navigateToHome(navigation);
      },
    });
  };

  const onError = () => {
    showAphAlert!({
      title: string.common.uhOh,
      description: string.genericError,
    });
  };

  const onSubmit = async (email: string) => {
    try {
      setLoading!(true);
      const queryOrderId = Number(orderId) || null;
      const parentQuery = queries?.find(({ id }) => id === queryIdLevel1);
      const orderType =
        parentQuery?.id == helpSectionQueryId.pharmacy
          ? ORDER_TYPE.PHARMACY
          : parentQuery?.id == helpSectionQueryId.consult
          ? ORDER_TYPE.CONSULT
          : null;
      const reason = subQueries?.find(({ id }) => id === selectedQueryId)?.title;
      const variables: SendHelpEmailVariables = {
        helpEmailInput: {
          category: parentQuery?.title,
          reason,
          comments: comments,
          patientId: currentPatient?.id,
          email: email,
          orderId: queryOrderId,
          orderType,
        },
      };

      let response = await client.query<SendHelpEmail, SendHelpEmailVariables>({
        query: SEND_HELP_EMAIL,
        variables,
      });

      setLoading!(false);
      onSuccess(response);
      if (orderType && queryOrderId) {
        saveNeedHelpQuery({ orderId: `${queryOrderId}`, orderType, createdDate: new Date() });
      }
      Events.helpTicketSubmitted({
        BU: parentQuery?.title!,
        Order_Status: medicineOrderStatus,
        Reason: reason!,
        Source_Page: sourcePage,
      });
    } catch (error) {
      setLoading!(false);
      onError();
    }
  };

  const renderTextInputAndCTAs = () => {
    const isDeliveryStatusQuery = selectedQueryId === helpSectionQueryId.deliveryStatus;

    return [
      <TextInputComponent
        value={comments}
        onChangeText={setComments}
        placeholder={string.pleaseProvideMoreDetails}
        conatinerstyles={styles.textInputContainer}
        autoFocus={true}
      />,
      isDeliveryStatusQuery ? renderShipmentQueryCTAs() : renderSubmitCTA(),
    ];
  };

  const renderShipmentQueryCTAs = () => {
    const onPress = async () => {
      try {
        setLoading!(true);
        const url = AppConfig.Configuration.MED_TRACK_SHIPMENT_URL;
        const orderDetails = await getOrderDetails(orderId);
        const shipmentNumber = orderDetails?.medicineOrderShipments?.[0]?.trackingNo;
        const shipmentProvider = orderDetails?.medicineOrderShipments?.[0]?.trackingProvider;
        const isTrackingAvailable = !!shipmentNumber && shipmentProvider === 'Delhivery Express';

        setLoading!(false);
        if (isTrackingAvailable) {
          navigation.navigate(AppRoutes.CommonWebView, {
            url: url.replace('{{shipmentNumber}}', shipmentNumber!),
            isGoBack: true,
          });
        } else {
          showAphAlert!({
            title: string.common.uhOh,
            description: 'Tracking details are only available for delivery via Courier.',
          });
        }
      } catch (error) {
        setLoading!(false);
        onError();
        CommonBugFender(
          `${AppRoutes.NeedHelpQueryDetails}_onPress_${string.trackYourShipment}`,
          error
        );
      }
    };

    return (
      <View style={styles.shipmentContainer}>
        <Text onPress={onPress} style={styles.submit}>
          {string.trackYourShipment}
        </Text>
        <Text
          onPress={onSubmitShowEmailPopup}
          style={[styles.submit, { opacity: comments ? 1 : 0.5 }]}
        >
          {string.reportIssue}
        </Text>
      </View>
    );
  };

  const renderSubmitCTA = () => {
    return (
      <Text
        onPress={onSubmitShowEmailPopup}
        style={[styles.submit, { opacity: comments ? 1 : 0.5 }]}
      >
        {string.submit.toUpperCase()}
      </Text>
    );
  };

  const onSubmitShowEmailPopup = async () => {
    if (!email) {
      setShowEmailPopup(true);
    } else {
      onSubmit(email);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<NeedHelpHelpers.HelpSectionQuery>) => {
    const onPress = () => {
      const isReturnQuery = item?.id === helpSectionQueryId.returnOrder;
      if (item?.queries?.length) {
        navigation.push(AppRoutes.NeedHelpQueryDetails, {
          queryIdLevel2: item?.id,
          queryIdLevel1,
          queries,
          email,
          orderId,
          isOrderRelatedIssue,
          medicineOrderStatus,
          isConsult,
        });
        setSelectedQueryId('');
        setComments('');
      } else if (item?.content?.text) {
        navigation.navigate(AppRoutes.NeedHelpContentView, {
          queryIdLevel1,
          queryIdLevel2: item?.id,
          queries,
          email,
          orderId,
        });
      } else if (isReturnQuery) {
        navigation.navigate(AppRoutes.ReturnMedicineOrder, {
          orderId: orderId,
          queryIdLevel1,
          queryIdLevel2: item?.id,
          queries,
          email,
        });
      } else {
        setSelectedQueryId(item.id!);
        setComments('');
      }
    };
    return (
      <>
        <Text onPress={onPress} style={styles.flatListItem}>
          {item?.title}
        </Text>
        {item?.id === selectedQueryId ? renderTextInputAndCTAs() : null}
      </>
    );
  };

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  const renderHeading = () => {
    const title = headingTitle;
    const text = orderId
      ? `HELP WITH ${isConsult ? 'APPOINTMENT' : 'ORDER'} #${orderId}`
      : orders?.length > 0
      ? 'RECENT ORDERS'
      : `HELP WITH ${title?.toUpperCase()}`;
    return <Text style={styles.heading}>{text}</Text>;
  };

  const renderSubHeading = () => {
    const text = 'SELECT YOUR ISSUE';
    return <Text style={styles.subHeading}>{text}</Text>;
  };
  const renderPreviousOrderTab = () => {
    return orders.length > 1 ? (
      !isPrevious ? (
        <AphListItem title={string.chooseFromPreviousOrders} onPress={() => setIsPrevious(true)} />
      ) : (
        <FlatList
          keyExtractor={keyExtractor}
          bounces={false}
          data={orders.slice(1, orders.length)}
          extraData={orders}
          renderItem={({ item, index }) => renderOrder(item, index)}
          initialNumToRender={10}
          ListEmptyComponent={<></>}
          ListHeaderComponent={
            <Text style={[styles.heading, { marginTop: 5 }]}>{'PREVIOUS ORDERS'}</Text>
          }
          ListFooterComponent={
            (orderListData?.length && orderListData?.length < 10) || !orderListData?.length
              ? null
              : renderLoadMore()
          }
        />
      )
    ) : null;
  };
  const renderNotOrderRelated = () => {
    const onPress = () => {
      navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
        queryIdLevel1,
        queries,
        email,
        sourcePage,
        pathFollowed: string.otherIssueNotMyOrders + ' - ',
      });
    };
    return <AphListItem title={string.otherIssueNotMyOrders} onPress={onPress} />;
  };

  const renderEmailPopup = () => {
    return showEmailPopup ? (
      <NeedHelpEmailPopup
        onRequestClose={() => setShowEmailPopup(false)}
        onBackdropPress={() => setShowEmailPopup(false)}
        onPressSendORConfirm={(textEmail) => {
          setEmail(textEmail);
          setShowEmailPopup(false);

          if (!requestEmailWithoutAction) {
            onSubmitShowEmailPopup();
          }

          setRequestEmailWithoutAction(false);
        }}
      />
    ) : null;
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderBreadCrumb()}
      {renderHeading()}
      {orders?.length > 0 ? (
        renderFirstOrder()
      ) : (
        <>
          {orders?.length > 0 ? <Spearator /> : null}
          <Text style={styles.subHeading}>
            If your order transaction failed report issue in this section:
          </Text>
          {renderNotOrderRelated()}
        </>
      )}
      {renderEmailPopup()}
    </SafeAreaView>
  );
};

const { text, container, card } = theme.viewStyles;
const { APP_YELLOW, LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  flatListContainer: {
    ...card(),
    marginTop: 10,
    marginBottom: 150,
  },
  flatListItem: {
    ...text('M', 14, LIGHT_BLUE),
  },
  breadcrumb: {
    marginHorizontal: 20,
  },
  loadMoreView: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  textLoadMore: {
    ...theme.viewStyles.text('SB', 15, '#FC9916'),
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  downArrow: {
    alignSelf: 'flex-end',
  },
  divider: { marginVertical: 10 },
  heading: {
    ...text('M', 12, LIGHT_BLUE),
    marginHorizontal: 20,
  },
  bottomTab: {
    ...text('M', 14, LIGHT_BLUE),
    marginHorizontal: 20,
  },
  subHeading: {
    ...text('R', 11, LIGHT_BLUE, 1),
    marginHorizontal: 20,
    marginTop: 10,
  },
  textInputContainer: {
    marginTop: 15,
  },
  shipmentContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  submit: {
    ...text('B', 14, APP_YELLOW),
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 12,
    marginHorizontal: 5,
  },
});
