import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  Breadcrumb,
  Props as BreadcrumbProps,
} from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Helpers } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
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
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Overlay } from 'react-native-elements';
import { CrossPopup, Up } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface Props
  extends NavigationScreenProps<{
    pageTitle?: string;
    breadCrumb: BreadcrumbProps['links'];
    queryCategory: string;
    email: string;
    orderId?: string;
    isOrderRelatedIssue?: boolean;
    medicineOrderStatus?: MEDICINE_ORDER_STATUS;
    isConsult?: boolean;
  }> {}

export const NeedHelpQueryDetails: React.FC<Props> = ({ navigation }) => {
  const pageTitle = navigation.getParam('pageTitle') || string.help.toUpperCase();
  const queryCategory = navigation.getParam('queryCategory') || '';
  const email = navigation.getParam('email') || '';
  const breadCrumb = navigation.getParam('breadCrumb') || [];
  const orderId = navigation.getParam('orderId') || '';
  const isOrderRelatedIssue = navigation.getParam('isOrderRelatedIssue') || false;
  const medicineOrderStatus = navigation.getParam('medicineOrderStatus');
  const { getFilteredReasons, saveNeedHelpQuery } = Helpers;
  const queryReasons = getFilteredReasons(queryCategory, isOrderRelatedIssue);
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { needHelpToContactInMessage } = useAppCommonData();
  const isConsult = navigation.getParam('isConsult') || false;
  const [queryIndex, setQueryIndex] = useState<number>();
  const [comments, setComments] = useState<string>('');
  const [showReturnPopup, setShowReturnPopup] = useState<boolean>(false);
  const [showReturnUI, setShowReturnUI] = useState<boolean>(false);

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
    return <Header title={pageTitle} leftIcon="backArrow" onPressLeftIcon={onPressBack} />;
  };

  const renderBreadCrumb = () => {
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

  const onSubmit = async () => {
    try {
      setLoading!(true);
      const needHelp = AppConfig.Configuration.NEED_HELP;
      const category = needHelp.find(({ category }) => category === queryCategory);
      const queryOrderId = Number(orderId) || null;
      const orderType =
        category?.id == 'pharmacy'
          ? ORDER_TYPE.PHARMACY
          : category?.id == 'virtualOnlineConsult'
          ? ORDER_TYPE.CONSULT
          : null;
      const variables: SendHelpEmailVariables = {
        helpEmailInput: {
          category: queryCategory,
          reason: queryReasons[queryIndex!],
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

  const renderTextInputAndCTAs = (index: number) => {
    const isOrderShipped = medicineOrderStatus === MEDICINE_ORDER_STATUS.SHIPPED;
    const isDeliveryStatusQuery =
      queryReasons[index] === 'I would like to know the Delivery status of my order.';

    return [
      <TextInputComponent
        value={comments}
        onChangeText={setComments}
        placeholder={string.pleaseProvideMoreDetails}
        conatinerstyles={styles.textInputContainer}
        autoFocus={true}
      />,
      isOrderShipped && isDeliveryStatusQuery ? renderShipmentQueryCTAs() : renderSubmitCTA(),
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
      }
    };

    return (
      <View style={styles.shipmentContainer}>
        <Text onPress={onPress} style={styles.submit}>
          {string.trackYourShipment}
        </Text>
        <Text onPress={onSubmit} style={[styles.submit, { opacity: comments ? 1 : 0.5 }]}>
          {string.reportIssue}
        </Text>
      </View>
    );
  };

  const renderSubmitCTA = () => {
    return (
      <Text onPress={onSubmit} style={[styles.submit, { opacity: comments ? 1 : 0.5 }]}>
        {string.submit.toUpperCase()}
      </Text>
    );
  };

  const renderItem = ({ index, item }: ListRenderItemInfo<string>) => {
    const isReturnQuery = queryReasons[index] === string.common.return_text;
    const onPress = () => {
      if (isReturnQuery) {
        setShowReturnPopup(true);
      }
      setQueryIndex(index);
      setComments('');
    };
    return (
      <>
        <Text onPress={onPress} style={styles.flatListItem}>
          {item}
        </Text>
        {!isReturnQuery && index === queryIndex ? renderTextInputAndCTAs(index) : null}
      </>
    );
  };

  const renderReasons = () => {
    return (
      <FlatList
        data={queryReasons}
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
    const text = orderId
      ? `HELP WITH ${isConsult ? 'APPOINTMENT' : 'ORDER'} #${orderId}`
      : `HELP WITH ${queryCategory.toUpperCase()}`;
    return <Text style={styles.heading}>{text}</Text>;
  };

  const renderCloseIcon = () => {
    return (
      <View style={styles.closeIconViewStyle}>
        <TouchableOpacity
          onPress={() => {
            setShowReturnPopup(false);
          }}
        >
          <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderReturnPopup = () => {
    return (
      <Overlay
        onRequestClose={() => setShowReturnPopup(false)}
        isVisible={showReturnPopup}
        windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        overlayStyle={styles.overlayStyle}
      >
        <View style={styles.overlayViewStyle}>
          <View style={styles.overlaySafeAreaViewStyle}>
            {renderCloseIcon()}
            <View style={styles.returnPopupMainViewStyle}>
              <View style={styles.returnPolicyViewStyle}>
                <Text style={styles.returnPolicyTextStyle}>{string.common.return_policy_text}</Text>
              </View>
              <View style={styles.returnPolicyMessageViewStyle}>
                <View style={styles.returnPolicyMessageTextViewStyle}>
                  <Text style={styles.returnPolicyMessage1TextStyle}>
                    {string.common.return_policy_message1}
                  </Text>
                  <Text style={styles.returnPolicyMessage2TextStyle}>
                    {string.common.return_policy_message2}
                  </Text>
                </View>
                <Button
                  title={'CONTINUE'}
                  onPress={() => {
                    setShowReturnPopup(false);
                    setShowReturnUI(true);
                  }}
                  style={styles.returnPolicyButtonStyle}
                />
              </View>
            </View>
          </View>
        </View>
      </Overlay>
    );
  };

  const renderReturnOrderView = () => {
    return (
      <View style={[styles.returnPopupMainViewStyle, styles.returnOrderMainViewStyle]}>
        <View style={[styles.returnPolicyViewStyle, styles.returnOrderViewStyle]}>
          <Text style={[styles.flatListItem, styles.returnTextStyle]}>
            {string.common.return_text}
          </Text>
          <TouchableOpacity
            style={styles.upIconViewStyle}
            activeOpacity={1}
            onPress={() => setShowReturnUI(false)}
          >
            <Up />
          </TouchableOpacity>
        </View>
        <View style={{ paddingTop: 4, paddingHorizontal: 16 }}>
          <TextInputComponent label={string.common.why_return_order_text} noInput={true} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderBreadCrumb()}
      {renderHeading()}
      {showReturnUI ? renderReturnOrderView() : renderReasons()}
      {renderReturnPopup()}
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
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
  },
  closeIconViewStyle: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  returnPopupMainViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.CARD_BG,
    overflow: 'hidden',
  },
  returnPolicyViewStyle: {
    paddingVertical: 18,
    ...theme.viewStyles.cardViewStyle,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    marginBottom: 10,
    shadowOpacity: 0.2,
  },
  returnPolicyTextStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 21),
    textAlign: 'center',
  },
  returnPolicyMessageViewStyle: { backgroundColor: theme.colors.CARD_BG },
  returnPolicyMessageTextViewStyle: { paddingTop: 17, paddingHorizontal: 15, paddingBottom: 37 },
  returnPolicyMessage1TextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 1, 16),
  },
  returnPolicyMessage2TextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 1, 19),
    marginTop: 7,
  },
  returnPolicyButtonStyle: { width: '50%', alignSelf: 'center', marginBottom: 16 },
  returnOrderMainViewStyle: {
    backgroundColor: '#F6F8F5',
    margin: 20,
    marginTop: 10,
    paddingBottom: 100,
  },
  returnOrderViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  returnTextStyle: { paddingLeft: 16, paddingVertical: 18, flex: 1 },
  upIconViewStyle: { paddingHorizontal: 14, paddingVertical: 18 },
});
