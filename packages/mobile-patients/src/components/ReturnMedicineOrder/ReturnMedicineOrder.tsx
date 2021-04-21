import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import { NeedHelpEmailPopup } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder/NeedHelpEmailPopup';
import { Helpers as NeedHelpQueryDetailsHelpers } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CrossPopup,
  CrossYellow,
  DropdownGreen,
  FileBig,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { RETURN_PHARMA_ORDER } from '@aph/mobile-patients/src/graphql/profiles';
import { ORDER_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  returnPharmaOrder,
  returnPharmaOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/returnPharmaOrder';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';

const { width } = Dimensions.get('window');

export interface Props
  extends NavigationScreenProps<{
    queryIdLevel1: string;
    queryIdLevel2: string;
    queries?: NeedHelpHelpers.HelpSectionQuery[];
    email?: string;
    orderId?: number;
  }> {}

export const ReturnMedicineOrder: React.FC<Props> = ({ navigation }) => {
  const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
  const queries = navigation.getParam('queries');
  const queryIdLevel1 = navigation.getParam('queryIdLevel1') || helpSectionQueryId.pharmacy;
  const queryIdLevel2 = navigation.getParam('queryIdLevel2') || helpSectionQueryId.returnOrder;
  const orderId = navigation.getParam('orderId');

  const [email, setEmail] = useState(navigation.getParam('email') || '');
  const [comments, setComments] = useState<string>('');
  const [showReturnPopup, setShowReturnPopup] = useState<boolean>(true);
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [returnOrderImages, setReturnOrderImages] = useState<any>([]);
  const [selectedSubReason, setSelectedSubReason] = useState<string>('');

  const apolloClient = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { needHelpReturnPharmaOrderSuccessMessage } = useAppCommonData();
  const { getHelpSectionQueries } = NeedHelpHelpers;
  const { saveNeedHelpQuery, getQueryData } = NeedHelpQueryDetailsHelpers;
  const returnOrderSubReasons = AppConfig.Configuration.RETURN_ORDER_SUB_REASON;
  let fin = '';

  const returnOrderWebEngageEvents = (webEngageEventName: WebEngageEventName) => {
    const eventAttributes = {
      'Order ID': orderId,
      'Patient Name': `${currentPatient?.firstName} ${currentPatient?.lastName}`,
      'Patient UHID': currentPatient?.uhid,
      Relation: currentPatient?.relation,
      'Patient Age': Math.round(moment().diff(currentPatient?.dateOfBirth, 'years', true)),
      'Patient Gender': currentPatient?.gender,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
    };
    postWebEngageEvent(webEngageEventName, eventAttributes);
  };

  const renderCloseIcon = () => {
    return (
      <View style={styles.closeIconViewStyle}>
        <TouchableOpacity
          onPress={() => {
            setShowReturnPopup(false);
          }}
        >
          <CrossPopup style={styles.crossPopup} />
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

  const onError = () => {
    showAphAlert!({
      title: string.common.uhOh,
      description: string.genericError,
    });
  };

  const onSubmitReturnOrder = async (email: string) => {
    try {
      setLoading!(true);
      const queryOrderId = Number(orderId) || null;
      let _queries = queries;
      if (!_queries) {
        _queries = await getHelpSectionQueries(apolloClient);
      }
      const parentQuery = _queries?.find(({ id }) => id === queryIdLevel1);
      const subQueriesData = getQueryData(_queries, queryIdLevel1, queryIdLevel2);
      const variables: returnPharmaOrderVariables = {
        returnPharmaOrderInput: {
          category: parentQuery?.title,
          reason: subQueriesData?.title,
          comments: comments,
          patientId: currentPatient?.id,
          email: email,
          orderId: queryOrderId,
          orderType: ORDER_TYPE.PHARMACY,
          orderFiles: getAddedReturnOrderImages(),
          subReason: selectedSubReason,
        },
      };
      const response = await apolloClient.mutate<returnPharmaOrder, returnPharmaOrderVariables>({
        mutation: RETURN_PHARMA_ORDER,
        variables,
      });
      setLoading!(false);
      const return_order_status = response?.data?.returnPharmaOrder?.status;
      if (return_order_status === 'success') {
        returnOrderWebEngageEvents(WebEngageEventName.RETURN_REQUEST_SUBMITTED);
        onSuccessReturnPharmaOrder();
        setShowReturnPopup(false);
        if (queryOrderId) {
          saveNeedHelpQuery({
            orderId: `${queryOrderId}`,
            orderType: ORDER_TYPE.PHARMACY,
            createdDate: new Date(),
          });
        }
      } else {
        onError();
      }
    } catch (error) {
      CommonBugFender('onSubmitReturnPharmaOrder', error);
      setLoading!(false);
      onError();
    }
  };

  const onSubmitEmail = async () => {
    if (!email) {
      setShowEmailPopup(true);
    } else {
      onSubmitReturnOrder(email);
    }
  };

  const renderReturnOrderView = () => {
    const submit_request = selectedSubReason && returnOrderImages?.length > 0 ? false : true;
    return (
      <View style={[styles.container]}>
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
          onPress={onSubmitEmail}
          disabled={submit_request}
          style={[
            styles.returnPolicyButtonStyle,
            { width: '100%', marginTop: 20, paddingBottom: 0 },
          ]}
        />
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
    const array = returnOrderImages?.map((item: any) => ({
      fileType: item?.fileType,
      base64FileInput: item?.base64,
    }));
    return array || [];
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
          <CrossYellow style={styles.crossYellow} />
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
        selectedText={selectedSubReason}
        menuContainerStyle={styles.menuContainerStyle}
        itemContainer={styles.itemContainerStyle}
        itemTextStyle={styles.itemTextStyle}
        selectedTextStyle={styles.selectedTextStyle}
        bottomPadding={{ paddingBottom: 20 }}
        onPress={(selectedSubReason) => setSelectedSubReason(selectedSubReason.value.toString())}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[styles.placeholderTextStyle, !selectedSubReason && styles.placeholderStyle]}
              numberOfLines={1}
            >
              {selectedSubReason ? selectedSubReason : string.common.select_returning_reason}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderHeader = () => {
    const onPressBack = () => navigation.goBack();
    const pageTitle = 'RETURN ORDER';
    return <Header title={pageTitle} leftIcon="backArrow" onPressLeftIcon={onPressBack} />;
  };

  const renderEmailPopup = () => {
    return showEmailPopup ? (
      <NeedHelpEmailPopup
        onRequestClose={() => setShowEmailPopup(false)}
        onPressSendORConfirm={(textEmail) => {
          setEmail(textEmail);
          setShowEmailPopup(false);
          onSubmitReturnOrder(textEmail);
        }}
      />
    ) : null;
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderUploadImagePopup()}
      {renderReturnOrderView()}
      {renderReturnPopup()}
      {renderEmailPopup()}
    </SafeAreaView>
  );
};

const { text, container, card, cardViewStyle } = theme.viewStyles;
const { APP_YELLOW, SHERPA_BLUE, APP_GREEN, WHITE, LIGHT_ORANGE, LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  container: {
    margin: 15,
    backgroundColor: '#F7F8F5',
    borderRadius: 10,
    padding: 10,
  },

  textInputContainer: {
    marginTop: 15,
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
  crossPopup: {
    marginRight: 1,
    width: 28,
    height: 28,
  },
  crossYellow: { width: 12, height: 12 },
});
