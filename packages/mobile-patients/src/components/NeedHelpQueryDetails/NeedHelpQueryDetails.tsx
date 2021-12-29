import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import { NeedHelpEmailPopup } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder/NeedHelpEmailPopup';
import { Events, Helpers } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  ArrowRight,
  CrossPopup,
  DropdownGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  GET_MEDICINE_ORDER_OMS_DETAILS_SHIPMENT,
  SEND_HELP_EMAIL,
  CREATE_HELP_TICKET,
  GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS,
  CANCEL_MEDICINE_ORDER_OMS,
  GET_MEDICINE_ORDER_CANCEL_REASONS,
  GET_MEDICINE_ORDER_CANCEL_REASONS_V2,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetMedicineOrderShipmentDetails,
  GetMedicineOrderShipmentDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderShipmentDetails';
import {
  MEDICINE_ORDER_STATUS,
  ORDER_TYPE,
  GetMedicineOrderCancelReasonsV2Input,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SendHelpEmail,
  SendHelpEmailVariables,
} from '@aph/mobile-patients/src/graphql/types/SendHelpEmail';
import {
  aphConsole,
  handleGraphQlError,
  navigateToHome,
  g,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Alert,
  Linking,
} from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import { TouchableOpacity } from 'react-native';
import { RefundDetails } from '@aph/mobile-patients/src/components/RefundDetails';
import {
  getMedicineOrderOMSDetailsWithAddress,
  getMedicineOrderOMSDetailsWithAddressVariables,
  getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails,
  getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetailsWithAddress';
import { needHelpCleverTapEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import {
  TicketNumberMutation,
  TicketNumberMutationVariables,
} from '@aph/mobile-patients/src/graphql/types/TicketNumberMutation';
import { GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons_cancellationReasons } from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderCancelReasons';
import {
  CancelMedicineOrderOMS,
  CancelMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/CancelMedicineOrderOMS';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { OrderCancelComponent } from '@aph/mobile-patients/src/components/ui/OrderCancelComponent';
import {
  getMedicineOrderCancelReasonsV2,
  getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderCancelReasonsV2';

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
    pathFollowed: string;
    refund: any[];
    payment: any[];
    additionalInfo: boolean;
    etd: any;
    billNumber: any;
    refetchOrders: () => void;
  }> {}

export const NeedHelpQueryDetails: React.FC<Props> = ({ navigation }) => {
  const sourcePage = navigation.getParam('sourcePage') || 'My Account';
  const _queries = navigation.getParam('queries');
  const queryIdLevel1 = navigation.getParam('queryIdLevel1') || '';
  const queryIdLevel2 = navigation.getParam('queryIdLevel2') || '';
  const pathFollowed = navigation.getParam('pathFollowed') || '';
  const medicineOrderStatusDate = navigation.getParam('medicineOrderStatusDate');
  const [email, setEmail] = useState(navigation.getParam('email') || '');
  const orderId = navigation.getParam('orderId') || '';
  const refund = navigation.getParam('refund') || [];
  const payment = navigation.getParam('payment') || [];
  const [fetchRefund, setFetchRefund] = useState<any[]>([]);
  const [fetchPayment, setFetchPayment] = useState<any[]>([]);
  const isOrderRelatedIssue = navigation.getParam('isOrderRelatedIssue') || false;
  const additionalInfo = navigation.getParam('additionalInfo') || false;
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(email ? false : true);
  const [requestEmailWithoutAction, setRequestEmailWithoutAction] = useState<boolean>(true);
  const [medicineOrderStatus, setMedicineOrderStatus] = useState<MEDICINE_ORDER_STATUS>(
    navigation.getParam('medicineOrderStatus')!
  );
  const { saveNeedHelpQuery, getQueryData, getQueryDataByOrderStatus } = Helpers;
  const [queries, setQueries] = useState<NeedHelpHelpers.HelpSectionQuery[]>(_queries || []);
  const subQueriesData = getQueryData(queries, queryIdLevel1, queryIdLevel2);
  const subQueries = (subQueriesData?.queries as NeedHelpHelpers.HelpSectionQuery[]) || [];
  const headingTitle = queries?.find((q) => q.id === queryIdLevel1)?.title || 'Query';
  const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;

  const client = useApolloClient();
  const { currentPatient, allCurrentPatients, profileAllPatients } = useAllCurrentPatients();
  const { circlePlanValidity, circleSubscriptionId } = useShoppingCart();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { needHelpToContactInMessage, needHelpTicketReferenceText } = useAppCommonData();
  const isConsult = navigation.getParam('isConsult') || false;
  const [selectedQueryId, setSelectedQueryId] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [orderDelayed, setOrderDelayed] = React.useState<boolean>(false);
  const [tatBreach, setTatBreach] = React.useState<Boolean>(true);
  const [raiseOrderDelayQuery, setRaiseOrderDelayQuery] = React.useState<boolean>(false);
  const [etd, setEtd] = React.useState<string>(navigation.getParam('etd'));
  const [isCancelVisible, setCancelVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [selectedSubReason, setSelectedSubReason] = useState('');
  const [showReasons, setShowReasons] = useState<boolean>(false);
  const [newCancellationReasonsBucket, setNewCancellationReasonsBucket] = useState<
    getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets[]
  >([]);
  const [selectedReasonBucket, setSelectedReasonBucket] = useState<
    getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets[]
  >([]);
  const apolloClient = useApolloClient();
  const [click, setClick] = useState<string>('');
  const [showSpinner, setShowSpinner] = useState(false);
  const billNumber = navigation.getParam('billNumber');
  const refetchOrders = navigation.getParam('refetchOrders');

  const { getHelpSectionQueries } = NeedHelpHelpers;

  const orderDelayId = '2ccddab4-1d4c-4e69-a277-b29c39d41358'; //id for order delay title
  const orderCancelId = '093b687f-fad1-4b55-b53f-be2312987142'; //id for order cancel title
  const [cancellationAllowed, setCancellationAllowed] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [subheading, setSubheading] = useState<string>('');
  const [cancellationRequestRaised, setCancellationRequestRaised] = useState<boolean>(false);
  const [cancellationRequestRejected, setCancellationrequestRejected] = useState<boolean>(false);
  const [flatlistData, setFlatlistData] = useState<any[]>([]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (
        medicineOrderStatus === MEDICINE_ORDER_STATUS.CANCELLED ||
        medicineOrderStatus === MEDICINE_ORDER_STATUS.CANCEL_REQUEST
      ) {
        navigation.navigate(AppRoutes.OrderDetailsScene, {
          orderAutoId: orderId,
          status: medicineOrderStatus,
        });
      }
      if (click?.length > 0) {
        setClick('');
        setSubheading('');
        return true;
      } else navigation.goBack();
    });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', () => {
        if (
          medicineOrderStatus === MEDICINE_ORDER_STATUS.CANCELLED ||
          medicineOrderStatus === MEDICINE_ORDER_STATUS.CANCEL_REQUEST
        ) {
          navigation.navigate(AppRoutes.OrderDetailsScene, {
            orderAutoId: orderId,
            status: medicineOrderStatus,
          });
        }
        if (click?.length > 0) {
          setClick('');
          setSubheading('');
          return true;
        } else navigation.goBack();
      });
    };
  }, [click, medicineOrderStatus]);

  useEffect(() => {
    if (cancellationAllowed && !cancellationRequestRaised && click === orderCancelId) {
      getCancellationReasonsBuckets();
    }
  }, [click]);

  useEffect(() => {
    if (!_queries) {
      fetchQueries();
    }
    if (queryIdLevel1 == helpSectionQueryId.pharmacy) {
      getOMSDetails();
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

  const getOMSDetails = async () => {
    const vars: getMedicineOrderOMSDetailsWithAddressVariables = {
      patientId: currentPatient && currentPatient.id,
      orderAutoId: Number(orderId),
      billNumber: '',
    };

    const { data } = await client.query<
      getMedicineOrderOMSDetailsWithAddress,
      getMedicineOrderOMSDetailsWithAddressVariables
    >({
      query: GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS,
      variables: vars,
      fetchPolicy: 'no-cache',
    });
    setCancellationAllowed(
      data?.getMedicineOrderOMSDetailsWithAddress?.orderCancellationAllowedDetails
        ?.cancellationAllowed
    );
    setCancellationRequestRaised(
      data?.getMedicineOrderOMSDetailsWithAddress?.orderCancellationAllowedDetails
        ?.cancellationRequestRaised!
    );
    setCancellationrequestRejected(
      data?.getMedicineOrderOMSDetailsWithAddress?.orderCancellationAllowedDetails
        ?.cancellationRequestRejected!
    );
    setMessage(
      data?.getMedicineOrderOMSDetailsWithAddress?.orderCancellationAllowedDetails?.message || ''
    );
    setTatBreach(data?.getMedicineOrderOMSDetailsWithAddress?.tatBreached);
    const order = data?.getMedicineOrderOMSDetailsWithAddress?.medicineOrderDetails;
    const paymentDetails = order?.medicineOrderPayments || [];
    const RefundTypes = ['REFUND_REQUEST_RAISED', 'REFUND_SUCCESSFUL'];
    const refundDetails =
      order?.medicineOrderRefunds?.filter(
        (item) => RefundTypes.indexOf(item?.refundStatus!) != -1
      ) || [];
    setFetchRefund(refundDetails);
    setFetchPayment(paymentDetails);
  };
  const vars: getMedicineOrderOMSDetailsWithAddressVariables = {
    patientId: currentPatient && currentPatient.id,
    orderAutoId: billNumber ? 0 : Number(orderId),
    billNumber: billNumber || '',
  };

  const { data, loading, refetch } = useQuery<
    getMedicineOrderOMSDetailsWithAddress,
    getMedicineOrderOMSDetailsWithAddressVariables
  >(GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS, {
    variables: vars,
    fetchPolicy: 'no-cache',
  });

  const getCancellationReasonsBuckets = () => {
    const vars: GetMedicineOrderCancelReasonsV2Input = {
      orderId: Number(orderId),
    };
    setShowSpinner(true);
    client
      .query<getMedicineOrderCancelReasonsV2>({
        query: GET_MEDICINE_ORDER_CANCEL_REASONS_V2,
        variables: {
          getMedicineOrderCancelReasonsV2Input: vars,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        if (
          data?.data?.getMedicineOrderCancelReasonsV2 &&
          data?.data?.getMedicineOrderCancelReasonsV2?.cancellationReasonBuckets &&
          data?.data?.getMedicineOrderCancelReasonsV2?.cancellationReasonBuckets.length > 0
        ) {
          const cancellationArray: any = [];
          data?.data?.getMedicineOrderCancelReasonsV2?.cancellationReasonBuckets.forEach(
            (cancellationReasons) => {
              if (
                cancellationReasons &&
                cancellationReasons?.reasons &&
                cancellationReasons?.reasons?.length
              ) {
                cancellationArray.push(cancellationReasons);
              }
            }
          );
          setNewCancellationReasonsBucket(cancellationArray);
          setCancelVisible(true);
          setShowReasons(true);
        }
      })
      .catch((error) => {
        setClick('');
        handleGraphQlError(error);
      })
      .finally(() => {
        setShowSpinner(false);
      });
  };

  const onPressConfirmCancelOrder = () => {
    setShowSpinner(true);
    const variables: CancelMedicineOrderOMSVariables = {
      medicineOrderCancelOMSInput: {
        orderNo: typeof orderId == 'string' ? parseInt(orderId, 10) : orderId,
        cancelReasonCode:
          selectedReasonBucket &&
          selectedReasonBucket?.[0]?.reasons?.find(
            (item) => selectedSubReason === item?.description
          )?.reasonCode,
        cancelReasonText: comment,
      },
    };

    client
      .mutate<CancelMedicineOrderOMS, CancelMedicineOrderOMSVariables>({
        mutation: CANCEL_MEDICINE_ORDER_OMS,
        variables,
      })
      .then(({ data }) => {
        aphConsole.log({
          s: data,
        });
        const setInitialSate = () => {
          setShowSpinner(false);
          setCancelVisible(false);
          setComment('');
          setSelectedReason('');
          setSelectedSubReason('');
          setClick('');
          setSubheading('');
        };
        const requestStatus = g(data, 'cancelMedicineOrderOMS', 'orderStatus');
        if (
          requestStatus == MEDICINE_ORDER_STATUS.CANCEL_REQUEST ||
          requestStatus == MEDICINE_ORDER_STATUS.CANCELLED
        ) {
          const data = getQueryDataByOrderStatus(
            subQueriesData,
            isOrderRelatedIssue,
            requestStatus
          );
          setMedicineOrderStatus(requestStatus);
          setFlatlistData(data);
          showAphAlert &&
            showAphAlert({
              title: 'Hi :)',
              description:
                requestStatus == MEDICINE_ORDER_STATUS.CANCELLED
                  ? string.orderDetailScreen.cancelled
                  : requestStatus == MEDICINE_ORDER_STATUS.CANCEL_REQUEST
                  ? string.orderDetailScreen.cancellationRequest
                  : '',
            });
          refetch()
            .then(() => {
              setInitialSate();
            })
            .catch((e) => {
              CommonBugFender('OrderDetailsScene_refetch', e);
              setInitialSate();
            });
          refetchOrders && refetchOrders();
        } else {
          Alert.alert('Error', g(data, 'cancelMedicineOrderOMS', 'orderStatus')!);
        }
      })
      .catch((e) => {
        CommonBugFender('OrderDetailsScene_onPressConfirmCancelOrder_SAVE_ORDER_CANCEL_STATUS', e);
        setShowSpinner(false);
        handleGraphQlError(e);
        setClick('');
      });
  };

  const renderReturnOrderOverlay = () => {
    return (
      <OrderCancelComponent
        showReasons={showReasons}
        setShowReasons={setShowReasons}
        selectedReason={selectedReason}
        setSelectedReason={setSelectedReason}
        selectedSubReason={selectedSubReason}
        setSelectedSubReason={setSelectedSubReason}
        comment={comment}
        setComment={setComment}
        isCancelVisible={isCancelVisible}
        setCancelVisible={setCancelVisible}
        showSpinner={showSpinner}
        onPressConfirmCancelOrder={onPressConfirmCancelOrder}
        newCancellationReasonsBucket={newCancellationReasonsBucket}
        selectedReasonBucket={selectedReasonBucket}
        setSelectedReasonBucket={setSelectedReasonBucket}
        setClick={setClick}
        setSubheading={setSubheading}
      />
    );
  };

  const cleverTapEvent = (eventName: CleverTapEventName, extraAttributes?: Object) => {
    needHelpCleverTapEvent(
      eventName,
      allCurrentPatients,
      currentPatient,
      circlePlanValidity,
      circleSubscriptionId,
      queryIdLevel2 ? 'C2 help Screen' : 'C1 help Screen',
      extraAttributes
    );
  };
  const renderHeader = () => {
    const onPressBack = () => {
      setSubheading('');
      if (
        medicineOrderStatus === MEDICINE_ORDER_STATUS.CANCELLED ||
        medicineOrderStatus === MEDICINE_ORDER_STATUS.CANCEL_REQUEST
      ) {
        return navigation.navigate(AppRoutes.OrderDetailsScene, {
          orderAutoId: orderId,
          status: medicineOrderStatus,
        });
      }
      if (click?.length > 0) {
        return setClick('');
      }
      navigation.goBack();
      cleverTapEvent(
        queryIdLevel2 ? CleverTapEventName.BACK_NAV_ON_C2_HELP : CleverTapEventName.BACK_NAV_ON_C1,
        { 'BU/Module name': headingTitle }
      );
    };
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

  const onSuccess = (response: any) => {
    cleverTapEvent(
      queryIdLevel2
        ? CleverTapEventName.TICKET_ACKNOWLEDGEMENT_ON_C2_HELP_DISPLAYED
        : CleverTapEventName.TICKET_ACKNOWLEDGEMENT_ON_C1_HELP_DISPLAYED,
      { 'BU/Module name': headingTitle }
    );

    let ticket = response?.data?.createHelpTicket?.ticket;
    let ticketNumber = ticket?.ticketNumber;
    let referenceNumberText = ticketNumber
      ? needHelpTicketReferenceText.replace('#ticketNumber', '#' + ticketNumber)
      : '';

    showAphAlert!({
      title: string.common.hiWithSmiley,
      description:
        (needHelpToContactInMessage || string.needHelpSubmitMessage) + '. ' + referenceNumberText,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();

        navigation.navigate(AppRoutes.HelpChatScreen, {
          ticket: ticket,
          level: queryIdLevel2 ? 3 : queryIdLevel1 ? 2 : 1,
        });
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
          : parentQuery?.id == helpSectionQueryId.diagnostic
          ? ORDER_TYPE.DIAGNOSTICS
          : null;
      const reason =
        subQueries?.length > 0
          ? subQueries?.find(({ id }) => id === selectedQueryId)?.title
          : subQueriesData?.title;
      const variables: TicketNumberMutationVariables = {
        createHelpTicketHelpEmailInput: {
          category: parentQuery?.title,
          reason: reason,
          comments: comments,
          patientId: currentPatient?.id,
          email: email,
          orderId: queryOrderId,
          orderType,
        },
      };

      let res = await client.mutate<TicketNumberMutation, TicketNumberMutationVariables>({
        mutation: CREATE_HELP_TICKET,
        variables,
      });

      setLoading!(false);
      onSuccess(res);
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

  const renderTextInputAndCTAs = (title?: string) => {
    const isDeliveryStatusQuery = selectedQueryId === helpSectionQueryId.deliveryStatus;

    return [
      <TextInputComponent
        value={comments}
        onChangeText={setComments}
        placeholder={string.pleaseProvideMoreDetails}
        conatinerstyles={styles.textInputContainer}
        autoFocus={true}
        onBlur={() => {
          let eventAtttr: { [key: string]: any } = {
            'Input text': comments,
            'BU/Module name': headingTitle,
          };
          if (queryIdLevel2) {
            eventAtttr['C2 Name'] = title;
          } else {
            eventAtttr['C1 Name'] = title;
          }
          cleverTapEvent(
            queryIdLevel2
              ? CleverTapEventName.DETAILS_INPUT_ON_C2_HELP
              : CleverTapEventName.DETAILS_INPUTBOX_ON_C1_HELP,
            eventAtttr
          );
        }}
      />,
      isDeliveryStatusQuery ? renderShipmentQueryCTAs() : renderSubmitCTA(title),
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

  const renderSubmitCTA = (title?: string) => {
    return (
      <Text
        onPress={() => onSubmitShowEmailPopup(title)}
        style={[styles.submit, { opacity: comments ? 1 : 0.5 }]}
      >
        {string.submit.toUpperCase()}
      </Text>
    );
  };

  const onSubmitShowEmailPopup = async (title?: string) => {
    let eventAtttr: { [key: string]: any } = {
      'Input text': comments,
      'BU/Module name': headingTitle,
    };
    if (queryIdLevel2) {
      eventAtttr['C2 Name'] = title;
    } else {
      eventAtttr['C1 Name'] = title;
    }
    cleverTapEvent(
      queryIdLevel2
        ? CleverTapEventName.SUBMIT_CTA_ON_C2_HELP
        : CleverTapEventName.SUBMIT_CTA_ON_C1_HELP,
      eventAtttr
    );
    if (!email) {
      setShowEmailPopup(true);
    } else {
      onSubmit(email);
    }
  };

  const renderRefund = () => {
    return (
      <View>
        <RefundDetails
          refunds={refund || fetchRefund}
          paymentDetails={payment || fetchPayment}
          navigaitonProps={navigation}
        />

        <View style={styles.flatListContainer}>
          <TouchableOpacity
            style={styles.titleView}
            onPress={() => {
              setSelectedQueryId(navigation.state.params?.queryIdLevel2 || '');
              setComments('');
            }}
          >
            <Text style={styles.flatListItem}>My issue is still not resolved</Text>
            <ArrowRight style={{ height: 18, width: 18 }} />
          </TouchableOpacity>

          {selectedQueryId && selectedQueryId?.length > 0 ? renderTextInputAndCTAs() : null}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<NeedHelpHelpers.HelpSectionQuery>) => {
    const onPress = () => {
      const isReturnQuery = item?.id === helpSectionQueryId.returnOrder;
      setClick(item?.id!);
      setSubheading(item?.title!);
      if (item?.id === orderCancelId && !raiseOrderDelayQuery && cancellationAllowed) {
        setClick(orderCancelId);
        setSelectedQueryId('');
        setComments('');
        return;
      }
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
          pathFollowed: item?.title,
        });
      } else if (isReturnQuery) {
        navigation.navigate(AppRoutes.ReturnMedicineOrder, {
          orderId: orderId,
          queryIdLevel1,
          queryIdLevel2: item?.id,
          queries,
          email,
        });
      } else if (
        item?.id === helpSectionQueryId.refund &&
        (refund.length > 0 || fetchRefund.length > 0) &&
        !additionalInfo
      ) {
        navigation.push(AppRoutes.NeedHelpQueryDetails, {
          queryIdLevel2: item?.id,
          queryIdLevel1,
          queries,
          email,
          orderId,
          isOrderRelatedIssue,
          medicineOrderStatus,
          isConsult,
          additionalInfo: true,
          refund: refund.length <= 0 ? fetchRefund : refund,
          payment: payment.length <= 0 ? fetchPayment : payment,
        });
      } else {
        setSelectedQueryId(item.id!);
        setRaiseOrderDelayQuery(false);
        setComments('');
      }
      !raiseOrderDelayQuery && item?.id === orderDelayId && setOrderDelayed(true);
    };
    return (
      <>
        <Text onPress={onPress} style={styles.flatListItem}>
          {item?.title}
        </Text>
        {item?.id === selectedQueryId
          ? item?.id === orderDelayId
            ? null
            : renderTextInputAndCTAs()
          : null}
        {item?.id === orderDelayId &&
          item?.id === selectedQueryId &&
          raiseOrderDelayQuery &&
          renderTextInputAndCTAs()}
      </>
    );
  };

  const capitalizeStatusMessage = (str: string) => {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return `"${splitStr.join(' ')}"`;
  };

  const renderReasons = () => {
    if (!subQueries?.length) {
      return null;
    }
    let data = getQueryDataByOrderStatus(subQueriesData, isOrderRelatedIssue, medicineOrderStatus);
    const showReturnOrder =
      MEDICINE_ORDER_STATUS.DELIVERED &&
      !!medicineOrderStatusDate &&
      moment(new Date()).diff(moment(medicineOrderStatusDate), 'hours') <= 48;

    if (!showReturnOrder) {
      data = data.filter((item) => item?.id !== helpSectionQueryId.returnOrder);
    }

    const showMessage = (tat: boolean) => {
      if (tat) {
        const str = string.needHelpQueryDetails.tatBreachedTrue;
        const newStr = str.replace(
          '{{medicineOrderStatus}}',
          capitalizeStatusMessage(medicineOrderStatus?.replace('_', ' ') || '')
        );
        return newStr;
      } else {
        const str = string.needHelpQueryDetails.tatBreachedFalse;
        const newStr = str.replace(
          '{{medicineOrderStatus}}',
          capitalizeStatusMessage(medicineOrderStatus?.replace('_', ' ') || '')
        );
        const finalStringToBeSend = newStr.replace('{{etd}}', etd);
        return finalStringToBeSend;
      }
    };

    const renderCancelOrder = () => {
      if (!cancellationAllowed) {
        return (
          <>
            <View style={styles.flatListContainer2}>
              <Text style={styles.flatListItem}>
                {message ? message : string.needHelpQueryDetails.message}
              </Text>
            </View>
          </>
        );
      }
    };

    const renderOrderStatus = () =>
      tatBreach ? (
        <>
          <View style={styles.flatListContainer2}>
            <Text style={styles.flatListItem}>{showMessage(true)}</Text>
            <TouchableOpacity
              style={styles.trackStyle}
              onPress={() => {
                navigation.navigate(AppRoutes.OrderDetailsScene, {
                  orderAutoId: orderId,
                });
              }}
            >
              <Text style={styles.trackText}>TRACK ORDER</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flatListContainer2}>
            <TouchableOpacity
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              onPress={() => {
                setRaiseOrderDelayQuery(true);
                setOrderDelayed(false);
                setComments('');
              }}
            >
              <Text style={styles.txtBold}>My issue is still not resolved</Text>
              <ArrowRight style={{ height: 18, width: 18 }} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.flatListContainer2}>
            <Text style={styles.flatListItem}>{showMessage(false)}</Text>
            <TouchableOpacity
              style={styles.trackStyle}
              onPress={() => {
                navigation.navigate(AppRoutes.OrderDetailsScene, {
                  orderAutoId: orderId,
                });
              }}
            >
              <Text style={styles.trackText}>TRACK ORDER</Text>
            </TouchableOpacity>
          </View>
        </>
      );

    return (
      <>
        <>{renderReturnOrderOverlay()}</>
        {(loading || showSpinner) && <Spinner style={{ zIndex: 200 }} />}
        <SafeAreaView>
          {orderDelayed && click === orderDelayId ? (
            <>{renderOrderStatus()}</>
          ) : (
            !isCancelVisible && (
              <View style={styles.flatListContainer}>
                <FlatList
                  data={flatlistData?.length > 0 ? flatlistData : data}
                  renderItem={renderItem}
                  keyExtractor={(_, i) => `${i}`}
                  bounces={false}
                  ItemSeparatorComponent={renderDivider}
                />
              </View>
            )
          )}
        </SafeAreaView>
      </>
    );
  };

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  const renderHeading = () => {
    const title = headingTitle;
    if (click) {
      return;
    }
    const text = orderId
      ? `HELP WITH ${isConsult ? 'APPOINTMENT' : 'ORDER'} #${orderId}`
      : `HELP WITH ${title?.toUpperCase()}`;
    return <Text style={styles.heading}>{text}</Text>;
  };

  const renderSubHeading = () => {
    const text = 'SELECT YOUR ISSUE';
    if (subheading) {
      return (
        <Text style={[styles.subHeading, styles.txtBold, styles.subHeadingText]}>
          {cancellationAllowed && click === orderCancelId && !cancellationRequestRaised
            ? null
            : subheading}
        </Text>
      );
    }
    return <Text style={styles.subHeading}>{text}</Text>;
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
      {!additionalInfo ? renderSubHeading() : null}
      {!additionalInfo ? renderReasons() : null}
      {!additionalInfo ? renderEmailPopup() : null}
      {additionalInfo ? renderRefund() : null}
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
  flatListContainer2: {
    ...card(),
    marginTop: 10,
    marginBottom: 10,
  },
  flatListItem: {
    ...text('M', 14, LIGHT_BLUE, undefined, 22),
  },
  breadcrumb: {
    marginHorizontal: 20,
  },
  divider: { marginVertical: 10 },
  heading: {
    ...text('M', 12, LIGHT_BLUE),
    marginHorizontal: 20,
  },
  subHeading: {
    ...text('R', 11, LIGHT_BLUE, 1),
    marginHorizontal: 20,
    marginTop: 10,
  },
  subHeadingText: {
    marginTop: 0,
    marginBottom: 7,
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
  trackText: {
    alignSelf: 'flex-end',
    ...text('M', 14, APP_YELLOW),
  },
  trackStyle: { marginTop: 24 },
  txtBold: {
    ...text('M', 14, LIGHT_BLUE, undefined, 19),
    fontWeight: 'bold',
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  cancel: {
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
  cancelView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  contentView: {
    marginBottom: 12,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  headingView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.WHITE,
    padding: 18,
    marginBottom: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
