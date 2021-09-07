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
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  GET_MEDICINE_ORDER_OMS_DETAILS_SHIPMENT,
  SEND_HELP_EMAIL,
  GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetMedicineOrderShipmentDetails,
  GetMedicineOrderShipmentDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderShipmentDetails';
import {
  MEDICINE_ORDER_STATUS,
  ORDER_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SendHelpEmail,
  SendHelpEmailVariables,
} from '@aph/mobile-patients/src/graphql/types/SendHelpEmail';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
import { useApolloClient } from 'react-apollo-hooks';
import { FlatList, ListRenderItemInfo, SafeAreaView, StyleSheet, Text, View } from 'react-native';
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
  const medicineOrderStatus = navigation.getParam('medicineOrderStatus');
  const { saveNeedHelpQuery, getQueryData, getQueryDataByOrderStatus } = Helpers;
  const [queries, setQueries] = useState<NeedHelpHelpers.HelpSectionQuery[]>(_queries || []);
  const subQueriesData = getQueryData(queries, queryIdLevel1, queryIdLevel2);
  const subQueries = (subQueriesData?.queries as NeedHelpHelpers.HelpSectionQuery[]) || [];
  const headingTitle = queries?.find((q) => q.id === queryIdLevel1)?.title || 'Query';
  const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;

  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { needHelpToContactInMessage } = useAppCommonData();
  const isConsult = navigation.getParam('isConsult') || false;
  const [selectedQueryId, setSelectedQueryId] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const apolloClient = useApolloClient();
  const { getHelpSectionQueries } = NeedHelpHelpers;

  useEffect(() => {
    if (!_queries) {
      fetchQueries();
    }
    if (
      queryIdLevel1 == helpSectionQueryId.pharmacy &&
      navigation.getParam('refund') === undefined
    ) {
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

  const onSuccess = (response: any) => {
    showAphAlert!({
      title: string.common.hiWithSmiley,
      description: needHelpToContactInMessage || string.needHelpSubmitMessage,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();
        openHelpChatScreen(response);
      },
    });
  };

  const openHelpChatScreen = (response: any) => {
    let ticketId = response?.data?.sendHelpEmail.split(':')[1] || 0;
    let ticket = {
      closedTime: null,
      createdTime: '',
      customFields: {
        Business: '',
        __typename: '',
      },
      id: ticketId,
      modifiedTime: '2021-08-26T11:30:46.000Z',
      status: '',
      statusType: 'Open',
      subject: '',
      ticketNumber: '',
    };

    if (ticketId) {
      navigation.navigate(AppRoutes.HelpChatScreen, {
        ticketId: ticketId,
        ticket: ticket,
      });
    }
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
      const reason = subQueries?.find(({ id }) => id === selectedQueryId)?.title;
      const variables: SendHelpEmailVariables = {
        helpEmailInput: {
          category: parentQuery?.title,
          reason: reason,
          comments: comments,
          patientId: currentPatient?.id,
          email: email,
          orderId: queryOrderId,
          orderType,
        },
      };

      let res = await client.query<SendHelpEmail, SendHelpEmailVariables>({
        query: SEND_HELP_EMAIL,
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
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
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

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  const renderHeading = () => {
    const title = headingTitle;
    const text = orderId
      ? `HELP WITH ${isConsult ? 'APPOINTMENT' : 'ORDER'} #${orderId}`
      : `HELP WITH ${title?.toUpperCase()}`;
    return <Text style={styles.heading}>{text}</Text>;
  };

  const renderSubHeading = () => {
    const text = 'SELECT YOUR ISSUE';
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
  flatListItem: {
    ...text('M', 14, LIGHT_BLUE),
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
