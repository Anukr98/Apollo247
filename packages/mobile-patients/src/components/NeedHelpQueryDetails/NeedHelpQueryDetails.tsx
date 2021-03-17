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
  RETURN_PHARMA_ORDER,
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
import {
  returnPharmaOrder,
  returnPharmaOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/returnPharmaOrder';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Overlay } from 'react-native-elements';
import {
  CrossPopup,
  Up,
  DropdownGreen,
  CrossYellow,
  FileBig,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import moment from 'moment';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { postWebEngageEvent, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
const { width } = Dimensions.get('window');
import { NeedHelpEmailPopup } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder/NeedHelpEmailPopup';

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
    medicineOrderStatusDate?: any;
    fromOrderFlow?: boolean;
  }> {}

export const NeedHelpQueryDetails: React.FC<Props> = ({ navigation }) => {
  const pageTitle = navigation.getParam('pageTitle') || string.help.toUpperCase();
  const queryCategory = navigation.getParam('queryCategory') || '';
  const [email, setEmail] = useState(navigation.getParam('email') || '');
  const breadCrumb = navigation.getParam('breadCrumb') || [];
  const orderId = navigation.getParam('orderId') || '';
  const isOrderRelatedIssue = navigation.getParam('isOrderRelatedIssue') || false;
  const isFromOrderFlow = navigation.getParam('fromOrderFlow') || false;
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(false);
  const [isEmail, setIsEmail] = useState<boolean>(false);
  const medicineOrderStatus = navigation.getParam('medicineOrderStatus');
  const medicineOrderStatusDate = navigation.getParam('medicineOrderStatusDate');
  const { getFilteredReasons, saveNeedHelpQuery } = Helpers;
  const [queryReasons, setQueryReasons] = useState(
    getFilteredReasons(queryCategory, isOrderRelatedIssue)
  );
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const {
    needHelpToContactInMessage,
    needHelpReturnPharmaOrderSuccessMessage,
  } = useAppCommonData();
  const isConsult = navigation.getParam('isConsult') || false;
  const [queryIndex, setQueryIndex] = useState<number>();
  const [comments, setComments] = useState<string>('');
  const [showReturnPopup, setShowReturnPopup] = useState<boolean>(false);
  const [showReturnUI, setShowReturnUI] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [returnOrderImages, setReturnOrderImages] = useState<any>([]);
  const [selectedReturnOrderSubReason, setSelectedReturnOrderSubReason] = useState<string>('');
  const returnOrderSubReasons = AppConfig.Configuration.RETURN_ORDER_SUB_REASON;
  let fin = '';

  useEffect(() => {
    const queryReasonsIndex = queryReasons?.findIndex((item) => item === string.common.return_text);
    if (medicineOrderStatusDate) {
      const showReturnOrder =
        moment(new Date()).diff(moment(medicineOrderStatusDate), 'hours') <= 48;
      if (!(medicineOrderStatus === MEDICINE_ORDER_STATUS.DELIVERED && showReturnOrder)) {
        const updatedQueryReasons: string[] = queryReasons;
        updatedQueryReasons?.splice(queryReasonsIndex, 1);
        setQueryReasons(updatedQueryReasons);
      }
    }
  }, []);

  useEffect(() => {
    if (isEmail) {
      if (showReturnUI) {
        onSubmitReturnPharmaOrder();
      } else {
        onSubmit();
      }
      setShowEmailPopup(false);
    }
  }, [isEmail]);

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

  const returnOrderWebEngageEvents = (webEngageEventName: WebEngageEventName) => {
    const eventAttributes = {
      'Order ID': orderId,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(webEngageEventName, eventAttributes);
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
      setIsEmail(false);
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

  const onSubmitShowEmailPopup = async () => {
    if (isFromOrderFlow) {
      setShowEmailPopup(true);
    } else if (showReturnUI) {
      onSubmitReturnPharmaOrder();
    } else {
      onSubmit();
    }
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
                  title={string.common.continue}
                  onPress={() => {
                    returnOrderWebEngageEvents(WebEngageEventName.RETURN_REQUEST_START);
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

  const closeReturnView = () => {
    setShowReturnUI(false);
    setSelectedReturnOrderSubReason('');
    setReturnOrderImages([]);
    setComments('');
  };

  const onSuccessReturnPharmaOrder = () => {
    showAphAlert!({
      title: string.common.hiWithSmiley,
      description: needHelpReturnPharmaOrderSuccessMessage || string.return_order_submit_message,
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

  const onSubmitReturnPharmaOrder = async () => {
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
      const variables: returnPharmaOrderVariables = {
        returnPharmaOrderInput: {
          category: queryCategory,
          reason: queryReasons[queryIndex!],
          comments: comments,
          patientId: currentPatient?.id,
          email: email,
          orderId: queryOrderId,
          orderType,
          orderFiles: getAddedReturnOrderImages(),
          subReason: selectedReturnOrderSubReason,
        },
      };
      const response = await client.mutate<returnPharmaOrder, returnPharmaOrderVariables>({
        mutation: RETURN_PHARMA_ORDER,
        variables,
      });
      setLoading!(false);
      setIsEmail(false);
      const return_order_status = g(response, 'data', 'returnPharmaOrder', 'status');
      if (return_order_status === 'success') {
        returnOrderWebEngageEvents(WebEngageEventName.RETURN_REQUEST_SUBMITTED);
        onSuccessReturnPharmaOrder();
        setShowReturnPopup(false);
        closeReturnView();
        if (orderType && queryOrderId) {
          saveNeedHelpQuery({ orderId: `${queryOrderId}`, orderType, createdDate: new Date() });
        }
      } else {
        closeReturnView();
        onError();
      }
    } catch (error) {
      console.log('RETURN_PHARMA_ORDER error', error);
      closeReturnView();
      setLoading!(false);
      onError();
    }
  };

  const renderReturnOrderView = () => {
    const submit_request =
      selectedReturnOrderSubReason && returnOrderImages?.length > 0 ? false : true;
    return (
      <View style={[styles.returnPopupMainViewStyle, styles.returnOrderMainViewStyle]}>
        <View style={[styles.returnPolicyViewStyle, styles.returnOrderViewStyle]}>
          <Text style={[styles.flatListItem, styles.returnTextStyle]}>
            {string.common.return_text}
          </Text>
          <TouchableOpacity
            style={styles.upIconViewStyle}
            activeOpacity={1}
            onPress={closeReturnView}
          >
            <Up />
          </TouchableOpacity>
        </View>
        <View style={{ paddingTop: 4, paddingHorizontal: 16 }}>
          <Text style={[styles.uploadImageTextStyle, { marginTop: 6, marginBottom: 12 }]}>
            {string.common.why_return_order_text}
            <Text style={{ color: theme.colors.INPUT_FAILURE_TEXT }}>{'*'}</Text>
          </Text>
          {renderReturnOrderSubReasonView()}
          <Text style={styles.uploadImageTextStyle}>
            {string.common.upload_image_text}
            <Text style={{ color: theme.colors.INPUT_FAILURE_TEXT }}>{'*'}</Text>
          </Text>
          <Text style={styles.fileSizeText}>{string.common.upload_image_file_size_text}</Text>
          {returnOrderImages?.length > 0 ? renderUploadImagesList() : renderUploadButton()}
          <TextInputComponent
            label={string.common.add_comment_text}
            noInput={true}
            conatinerstyles={{ paddingBottom: 0, marginTop: 5 }}
          />
          <TextInputComponent
            value={comments}
            onChangeText={setComments}
            placeholder={string.common.return_order_comment_text}
            conatinerstyles={[styles.textInputContainer, { marginTop: 0 }]}
          />
          <Button
            title={string.common.submit_request}
            onPress={onSubmitShowEmailPopup}
            disabled={submit_request}
            style={[
              styles.returnPolicyButtonStyle,
              { width: '100%', marginTop: 20, paddingBottom: 0 },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderUploadButton = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.uploadButtonStyle}
        onPress={() => setUploadVisible(true)}
      >
        <Text style={styles.uploadButtonTextStyle}>{string.common.upload}</Text>
      </TouchableOpacity>
    );
  };

  const getAddedReturnOrderImages = () => {
    let imagesArray = [] as any;
    returnOrderImages?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.fileType = item?.fileType;
      imageObj.base64FileInput = item?.base64;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };

  const renderImagesRow = (data: any, i: number) => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(data?.base64);
    const fileType = data?.fileType;
    const onPressRemoveIcon = () => {
      const imageCOPY = [...returnOrderImages];
      imageCOPY.splice(i, 1);
      setReturnOrderImages(imageCOPY);
    };
    return (
      <View style={[styles.addMoreImageViewStyle, { marginRight: 5 }]}>
        <TouchableOpacity onPress={onPressRemoveIcon} style={styles.imageRemoveViewStyle}>
          <CrossYellow style={{ width: 12, height: 12 }} />
        </TouchableOpacity>
        <View style={styles.imageViewStyle}>
          {fileType === 'pdf' || fileType === 'application/pdf' ? (
            <FileBig style={styles.imageStyle} />
          ) : (
            <Image style={styles.imageStyle} source={{ uri: fin }} />
          )}
        </View>
      </View>
    );
  };

  const renderUploadImagesList = () => {
    return (
      <View>
        <View style={styles.imageListViewStyle}>
          <FlatList
            bounces={false}
            data={returnOrderImages}
            collapsable
            onEndReachedThreshold={0.5}
            horizontal
            renderItem={({ item, index }) => renderImagesRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
        <Text style={styles.uploadMoreTextStyle} onPress={() => setUploadVisible(true)}>
          {string.common.upload_more}
        </Text>
      </View>
    );
  };

  const renderUploadImagePopup = () => {
    return (
      <UploadPrescriprionPopup
        type={'Non-cart'}
        isVisible={uploadVisible}
        uploadImage
        heading={string.common.upload_image_text}
        hideTAndCs
        optionTexts={{
          camera: 'CHOOSE FROM CAMERA',
          gallery: 'CHOOSE FROM GALLERY',
        }}
        onClickClose={() => {
          setUploadVisible(false);
        }}
        onResponse={(type, response) => {
          if (response?.length == 0) return;
          setReturnOrderImages([...returnOrderImages, ...response]);
          setUploadVisible(false);
        }}
      />
    );
  };

  const renderReturnOrderSubReasonView = () => {
    const returnOrderSubReasonData = returnOrderSubReasons.map((i) => {
      return { key: i.subReasonID, value: i.subReason };
    });

    return (
      <MaterialMenu
        options={returnOrderSubReasonData}
        selectedText={selectedReturnOrderSubReason}
        menuContainerStyle={styles.menuContainerStyle}
        itemContainer={styles.itemContainerStyle}
        itemTextStyle={styles.itemTextStyle}
        selectedTextStyle={styles.selectedTextStyle}
        bottomPadding={{ paddingBottom: 20 }}
        onPress={(selectedSubReason) =>
          setSelectedReturnOrderSubReason(selectedSubReason.value.toString())
        }
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                styles.placeholderTextStyle,
                !selectedReturnOrderSubReason && styles.placeholderStyle,
              ]}
              numberOfLines={1}
            >
              {selectedReturnOrderSubReason
                ? selectedReturnOrderSubReason
                : string.common.select_returning_reason}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderEmailPopup = () => {
    return showEmailPopup ? (
      <NeedHelpEmailPopup
        onRequestClose={() => setShowEmailPopup(false)}
        onPressSendORConfirm={(textEmail) => {
          setEmail(textEmail);
          setIsEmail(true);
        }}
      />
    ) : null;
  };

  return (
    <SafeAreaView style={container}>
      {renderUploadImagePopup()}
      {renderHeader()}
      {renderBreadCrumb()}
      {renderHeading()}
      {showReturnUI ? renderReturnOrderView() : renderReasons()}
      {renderReturnPopup()}
      {renderEmailPopup()}
    </SafeAreaView>
  );
};

const { text, container, card, cardViewStyle } = theme.viewStyles;
const { APP_YELLOW, SHERPA_BLUE, APP_GREEN, WHITE, LIGHT_ORANGE, LIGHT_BLUE } = theme.colors;
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
    ...theme.viewStyles.text('M', 16, LIGHT_BLUE, 1, 21),
    textAlign: 'center',
  },
  returnPolicyMessageViewStyle: { backgroundColor: theme.colors.CARD_BG },
  returnPolicyMessageTextViewStyle: { paddingTop: 17, paddingHorizontal: 15, paddingBottom: 37 },
  returnPolicyMessage1TextStyle: {
    ...text('M', 12, LIGHT_BLUE, 1, 16),
  },
  returnPolicyMessage2TextStyle: {
    ...text('M', 12, LIGHT_BLUE, 1, 19),
    marginTop: 7,
  },
  returnPolicyButtonStyle: { width: '50%', alignSelf: 'center', marginBottom: 16 },
  returnOrderMainViewStyle: {
    backgroundColor: '#F6F8F5',
    margin: 20,
    marginTop: 10,
  },
  returnOrderViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  returnTextStyle: { paddingLeft: 16, paddingVertical: 18, flex: 1 },
  upIconViewStyle: { paddingHorizontal: 14, paddingVertical: 18 },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...text('M', 18, SHERPA_BLUE),
  },
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginTop: 0,
    marginLeft: width / 2 - 95,
  },
  itemContainerStyle: {
    height: 44.8,
    marginHorizontal: 12,
    width: width / 2,
  },
  itemTextStyle: { ...text('M', 16, SHERPA_BLUE), paddingHorizontal: 0 },
  selectedTextStyle: {
    ...text('M', 16, APP_GREEN),
    alignSelf: 'flex-start',
  },
  uploadImageTextStyle: { ...text('M', 14, LIGHT_BLUE, 1, 18), marginTop: 24 },
  fileSizeText: { ...text('R', 11, SHERPA_BLUE, 1, 14), marginTop: 3 },
  uploadButtonStyle: {
    ...cardViewStyle,
    paddingTop: 4,
    backgroundColor: WHITE,
    alignSelf: 'flex-start',
    paddingBottom: 6,
    paddingHorizontal: 14,
    borderRadius: 3,
    borderWidth: 0.5,
    marginBottom: 5,
    borderColor: LIGHT_ORANGE,
    marginTop: 19,
  },
  uploadButtonTextStyle: {
    ...text('B', 13, LIGHT_ORANGE, 1, 17),
  },
  imageListViewStyle: {
    marginTop: 14,
    marginBottom: 0,
    flexDirection: 'row',
  },
  addMoreImageViewStyle: { width: 72, height: 82, paddingTop: 10 },
  imageViewStyle: {
    height: 66,
    width: 50,
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 5,
    borderColor: LIGHT_ORANGE,
  },
  imageStyle: { height: 66, width: 50 },
  imageRemoveViewStyle: {
    position: 'absolute',
    right: 2,
    zIndex: 99,
    top: 0,
    padding: 10,
    paddingTop: 0,
  },
  uploadMoreTextStyle: {
    ...text('B', 13, LIGHT_ORANGE, 1, 17),
    alignSelf: 'flex-end',
  },
});
