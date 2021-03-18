import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import { NeedHelpEmailPopup } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder/NeedHelpEmailPopup';
import { Helpers } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_MEDICINE_ORDER_OMS_DETAILS_SHIPMENT,
  SEND_HELP_EMAIL,
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
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { FlatList, ListRenderItemInfo, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';

export interface Props
  extends NavigationScreenProps<{
    queries: NeedHelpHelpers.HelpSectionQuery[];
    queryIdLevel1: number;
    queryIdLevel2: number;
    email: string;
    orderId?: string;
    isOrderRelatedIssue?: boolean;
    medicineOrderStatus?: MEDICINE_ORDER_STATUS;
    isConsult?: boolean;
    medicineOrderStatusDate?: any;
  }> {}

export const NeedHelpQueryDetails: React.FC<Props> = ({ navigation }) => {
  const _queries = navigation.getParam('queries');
  const queryIdLevel1 = navigation.getParam('queryIdLevel1') || NaN;
  const queryIdLevel2 = navigation.getParam('queryIdLevel2') || NaN;
  const [email, setEmail] = useState(navigation.getParam('email') || '');
  const orderId = navigation.getParam('orderId') || '';
  const isOrderRelatedIssue = navigation.getParam('isOrderRelatedIssue') || false;
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(false);
  const medicineOrderStatus = navigation.getParam('medicineOrderStatus');
  const { saveNeedHelpQuery, getQueryData, getQueryDataByOrderStatus } = Helpers;
  const [queries, setQueries] = useState<NeedHelpHelpers.HelpSectionQuery[]>(_queries || []);
  const subQueriesData = getQueryData(queries, queryIdLevel1, queryIdLevel2);
  const subQueries = (subQueriesData?.queries as NeedHelpHelpers.HelpSectionQuery[]) || [];
  const headingTitle = queries?.find((q) => q.id === queryIdLevel1)?.title || 'Query';

  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { needHelpToContactInMessage } = useAppCommonData();
  const isConsult = navigation.getParam('isConsult') || false;
  const [selectedQueryId, setSelectedQueryId] = useState<number>();
  const [comments, setComments] = useState<string>('');
  const apolloClient = useApolloClient();
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

  const onSuccess = () => {
    showAphAlert!({
      title: string.common.hiWithSmiley,
      description: needHelpToContactInMessage || string.needHelpSubmitMessage,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();
        navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
          })
        );
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
        parentQuery?.id == 1
          ? ORDER_TYPE.PHARMACY
          : parentQuery?.id == 2
          ? ORDER_TYPE.CONSULT
          : null;
      const variables: SendHelpEmailVariables = {
        helpEmailInput: {
          category: parentQuery?.title,
          reason: subQueries?.find(({ id }) => id === selectedQueryId)?.title,
          comments: comments,
          patientId: currentPatient?.id,
          email: email,
          orderId: queryOrderId,
          orderType,
        },
      };

      await client.query<SendHelpEmail, SendHelpEmailVariables>({
        query: SEND_HELP_EMAIL,
        variables,
      });
      setLoading!(false);
      onSuccess();
      if (orderType && queryOrderId) {
        saveNeedHelpQuery({ orderId: `${queryOrderId}`, orderType, createdDate: new Date() });
      }
    } catch (error) {
      setLoading!(false);
      onError();
    }
  };

  const renderTextInputAndCTAs = () => {
    const isDeliveryStatusQuery = queryIdLevel1 === 1 && !queryIdLevel2 && selectedQueryId === 8;

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
      const isReturnQuery = queryIdLevel1 === 1 && !queryIdLevel2 && item?.id === 1;
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
        setSelectedQueryId(undefined);
        setComments('');
      } else if (isReturnQuery) {
        navigation.navigate(AppRoutes.OrderDetailsScene, {
          orderAutoId: orderId,
          isReturnOrder: true,
          queryIdLevel1,
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

  const renderReasons = () => {
    if (!subQueries?.length) {
      return null;
    }
    const data = getQueryDataByOrderStatus(
      subQueriesData,
      isOrderRelatedIssue,
      medicineOrderStatus
    );
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, i) => `${i}`}
        bounces={false}
        ItemSeparatorComponent={renderDivider}
        contentContainerStyle={styles.flatListContainer}
      />
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
        onPressSendORConfirm={(textEmail) => {
          setEmail(textEmail);
          setShowEmailPopup(false);
          onSubmit(textEmail);
        }}
      />
    ) : null;
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderBreadCrumb()}
      {renderHeading()}
      {renderSubHeading()}
      {renderReasons()}
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
    marginTop: 5,
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
    ...text('B', 13, APP_YELLOW),
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 12,
    marginHorizontal: 5,
  },
});
