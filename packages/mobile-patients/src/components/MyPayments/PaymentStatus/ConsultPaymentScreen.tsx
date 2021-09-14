import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ConsultFailure,
  ConsultPending,
  ConsultSuccess,
  Copy,
  CircleLogo,
  LocationOn,
  Remove,
  PdfGray,
  EmailGray,
  Pdf,
  RightArrowBlue,
  ConsultRefund,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CONSULT_ORDER_INVOICE,
} from '@aph/mobile-patients/src/graphql/profiles';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string, { Payment, NewPaymentStatuses } from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import React, { useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { NavigationScreenProps} from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { NotificationPermissionAlert } from '@aph/mobile-patients/src/components/ui/NotificationPermissionAlert';
import { Snackbar } from 'react-native-paper';
import { SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddedCirclePlanWithValidity } from '@aph/mobile-patients/src/components/ui/AddedCirclePlanWithValidity';
import { paymentTransactionStatus_paymentTransactionStatus_appointment_amountBreakup } from '@aph/mobile-patients/src/graphql/types/paymentTransactionStatus';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import moment from 'moment';
import {
  convertNumberToDecimal,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { RenderPdf } from '@aph/mobile-patients/src/components/ui/RenderPdf';
import PaymentStatusConstants from '@aph/mobile-patients/src/components/MyPayments/constants';
import FooterButton from '@aph/mobile-patients/src/components/MyPayments/PaymentStatus/components/FooterButton';

export interface ConsultPaymentScreenProps extends NavigationScreenProps {}

export const ConsultPaymentScreen: React.FC<ConsultPaymentScreenProps> = (props) => {
  const itemDetails = props.navigation.getParam('item');
  const paymentType = props.navigation.getParam('paymentFor');
  const patientId = props.navigation.getParam('patientId');
  const { SUCCESS, FAILED, REFUND } = PaymentStatusConstants;

  const client = useApolloClient();
  const { success, failure, pending } = NewPaymentStatuses;
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [notificationAlert, setNotificationAlert] = useState(false);
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [showEmailInput, setshowEmailInput] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(currentPatient?.emailAddress || '');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [circlePlanDetails, setCirclePlanDetails] = useState();
  const [showPDF, setShowPDF] = useState<boolean>(false);

  const [
    amountBreakup,
    setAmountBreakup,
  ] = useState<paymentTransactionStatus_paymentTransactionStatus_appointment_amountBreakup | null>();
  const circleSavings =
    amountBreakup?.actual_price && amountBreakup?.slashed_price
      ? amountBreakup?.actual_price - amountBreakup?.slashed_price
      : 0;

  const { circleSubscriptionId, circlePlanSelected } = useShoppingCart();
  const copyToClipboard = (refId: string) => {
    Clipboard.setString(refId);
    setSnackbarState(true);
  };
  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const requestStoragePermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (resuts) {
        downloadInvoice();
      }
    } catch (error) {
      CommonBugFender('PaymentStatusScreen_requestReadSmsPermission_try', error);
    }
  };

  const handleBack = () => {
    return true;
  };

  const statusIcon = () => {
    if (status === success) {
      return <ConsultSuccess style={styles.statusIconStyles} />;
    } else if (status === failure) {
      return <ConsultFailure style={styles.statusIconStyles} />;
    } else if(status == REFUND){
      return <ConsultRefund style={styles.refundIconStyles} />;
    } else {
      return <ConsultPending style={styles.statusIconStyles} />;
    }
  };

  const statusItemValues = () => {
    let status = 'PENDING';
    let refId = '';
    let price = 0;
    const {
        appointmentPayments,
        PaymentOrders,
        actualAmount,
        displayId,
        discountedAmount,
        appointmentRefunds,
      } = itemDetails;
      const { refund } = PaymentOrders;
      const refundInfo = refund?.length ? refund : appointmentRefunds;
      const paymentInfo = PaymentOrders?.paymentStatus ? PaymentOrders : appointmentPayments[0];
      if (!paymentInfo) {
        status = 'PENDING';
      } else if (refundInfo.length) {
        const { paymentRefId, amountPaid } = paymentInfo;
        refId = paymentRefId;
        price = amountPaid;
        status = REFUND;
      } else {
        const { paymentStatus, paymentRefId, amountPaid } = paymentInfo;
        status = paymentStatus;
        refId = paymentRefId;
        price = amountPaid;
      }
      return {
        status: status,
        refId: refId,
        price: `${string.common.Rs} ` + String(price),
        orderId: displayId,
      };
  };
  const { refId, price, orderId, status } = statusItemValues();
  
  const textComponent = (
    message: string,
    numOfLines: number | undefined,
    color: string,
    needStyle: boolean
  ) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 13, color, 1, 20),
          marginHorizontal: needStyle ? 0.1 * windowWidth : undefined,
        }}
        numberOfLines={numOfLines}
      >
        {message}
      </Text>
    );
  };

  const statusText = () => {
    let message = ' Payment Pending';
    let textColor = theme.colors.PENDING_TEXT;
    if (status === success) {
      message = ' Payment Successful';
      textColor = theme.colors.CONSULT_SUCCESS_TEXT;
    } else if (status === failure) {
      message = ' Payment Failed';
      textColor = theme.colors.FAILURE_TEXT;
    } else if (status == REFUND) {
      message = ' Refund Processed'
      textColor = theme.colors.DEEP_RED;
    }
    return textComponent(message, undefined, textColor, false);
  };

  const priceText = () => {
    let textColor = theme.colors.PENDING_TEXT;
    if (status === success) {
      textColor = theme.colors.CONSULT_SUCCESS_TEXT;
    } else if (status === failure) {
      textColor = theme.colors.FAILURE_TEXT;
    } else if (status == REFUND) {
      textColor = theme.colors.DEEP_RED;
    }
    return textComponent(price, undefined, textColor, false);
  };

  const renderViewInvoice = () => {
    if (status == success || status == REFUND) {
      return (
        <View style={styles.viewInvoice}>
          <TouchableOpacity
           style={styles.viewInvoiceContainer}
           onPress={() => requestStoragePermission()}
          >
            <PdfGray style={styles.viewIcon} />
            {textComponent('VIEW INVOICE', undefined, theme.colors.TANGERINE_YELLOW, false)}
          </TouchableOpacity>
          <TouchableOpacity
           style={styles.emailInvoiceView}
           onPress={() => setshowEmailInput(!showEmailInput)}
           >
            <EmailGray style={styles.emailIcon} />
            {textComponent(
              'EMAIL INVOICE',
              undefined,
              !showEmailInput ? theme.colors.TANGERINE_YELLOW : theme.colors.TEXT_LIGHT_YELLOW,
              false
            )}
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderEmailInputContainer = () => {
    return showEmailInput ? <View>{!emailSent ? renderInputEmail() : renderSentMsg()}</View> : null;
  };

  const renderInputEmail = () => {
    return (
      <View style={styles.inputContainer}>
        <View style={{ flex: 0.85 }}>
          <TextInput
            value={`${email}`}
            onChangeText={(email) => setEmail(email)}
            style={styles.inputStyle}
          />
        </View>
        <View style={styles.rightIcon}>{rightIconView()}</View>
      </View>
    );
  };

  const renderSentMsg = () => {
    const length = email?.length || 0;
    return (
      <View
        style={{ ...styles.inputContainer, justifyContent: length > 20 ? 'center' : undefined }}
      >
        <Text
          style={{
            lineHeight: length > 20 ? 18 : 30,
            textAlign: length > 20 ? 'center' : 'auto',
            ...styles.sentMsg,
          }}
        >
          {length < 21
            ? `Invoice has been sent to ${email}!`
            : `Invoice has been sent to ${'\n'} ${email}!`}
        </Text>
      </View>
    );
  };

  const rightIconView = () => {
    return (
      <View style={{ paddingBottom: 0, opacity: isSatisfyingEmailRegex(email.trim()) ? 1 : 0.5 }}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={!isSatisfyingEmailRegex(email.trim())}
          onPress={() => {
            emailInvoice();
            setEmailSent(true);
          }}
        >
          <SearchSendIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const emailInvoice = () => {
    client
      .query({
        query: CONSULT_ORDER_INVOICE,
        variables: {
          patientId: currentPatient.id,
          appointmentId: itemDetails?.id,
          emailId: email,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {})
      .catch((error) => {
        CommonBugFender('Error while sending invoice on mail', error);
      })
      .finally(() => {});
  };

  const downloadInvoice = () => {
      console.log({
        patientId: patientId,
        appointmentId: orderId,
      });
      
    client
      .query({
        query: CONSULT_ORDER_INVOICE,
        variables: {
          patientId: patientId,
          appointmentId: itemDetails?.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const { data } = res;
        const { getOrderInvoice } = data;
        let dirs = RNFetchBlob.fs.dirs;
        let fileName: string = 'Apollo_Consult_Invoice' + moment().format('MMM_D_YYYY_HH_mm') + '.pdf';
        const downloadPath =
          Platform.OS === 'ios'
            ? (dirs.DocumentDir || dirs.MainBundleDir) +
              '/' +
              (fileName || 'Apollo_Consult_Invoice.pdf')
            : dirs.DownloadDir + '/' + (fileName || 'Apollo_Consult_Invoice.pdf');
        RNFetchBlob.config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            title: fileName,
            useDownloadManager: true,
            notification: true,
            path: downloadPath,
            mime: mimeType(downloadPath),
            description: 'File downloaded by download manager.',
          },
        })
          .fetch('GET', String(getOrderInvoice), {
            //some headers ..
          })
          .then((res) => {
            if (Platform.OS === 'android') {
              Alert.alert('Download Complete');
            }
            Platform.OS === 'ios'
              ? RNFetchBlob.ios.previewDocument(res.path())
              : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
          })
          .catch((err) => {
            CommonBugFender('ConsultView_downloadInvoice', err);
          });
      })
      .catch((error) => {
        renderErrorPopup(`Something went wrong, please try again after sometime`);
        CommonBugFender('fetchingConsultInvoice', error);
      });
  };
  const renderStatusCard = () => {
    const orderIdText = 'Order ID: ' + String(orderId);
    const {appointmentType, appointmentDateTime, doctor} = itemDetails || {};
    return (
      <View style={styles.statusCardStyle}>
        <View style={[
          styles.statusCardSubContainerStyle,
          (status == pending || status == failure) &&
          {
            ...styles.failureCardStyle,
            borderColor: status == failure ? theme.colors.APP_RED : theme.colors.PENDING_TEXT
          }]}>
          <View style={styles.centerHorizontal}>
            {statusIcon()}
            <View style={styles.statusView}>
              {statusText()}
              {priceText()}
            </View>
          </View>
          <View style={styles.orderIdStyles}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY, 1, 20)}>
              {orderIdText}
            </Text>
          </View>
        </View>
        {(status == success || status == REFUND) &&
          <TouchableOpacity
            style={styles.refStyles}
            onPress={() => copyToClipboard(refId)}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY, 1, 20)}>
              {'Payment Ref. Number - ' + refId}
            </Text>
            <Copy style={styles.iconStyle} />
          </TouchableOpacity>}
        <View>
          {renderViewInvoice()} 
          {renderEmailInputContainer()}
          <Snackbar
            style={styles.snackbarView}
            visible={snackbarState}
            onDismiss={() => {
              setSnackbarState(false);
            }}
            duration={1000}
          >
            Copied
          </Snackbar>
        </View>
        <View style={styles.separator} />
        <View style={styles.appointmentView}>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.BLACK_COLOR, 1, 20)}>
            {string.consultPayment.appointmentDetails}
          </Text>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.CONSULT_SUCCESS_TEXT, 1, 20)}>
            {appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1).toLowerCase()
            + ' Consultation,' + getDate(appointmentDateTime)}
          </Text>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.BLACK_COLOR, 1, 20)}>
            {doctor?.name}
          </Text>
        </View>
      </View>
    );
  };

  const renderNote = () => {
    let noteText = '';
    if (status === failure) {
      noteText =
        'Note : In case your account has been debited, you should get the refund in 1-7 working days.';
    } else if (status == pending) {
      noteText =
        'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.';
    }
    return textComponent(noteText, undefined, theme.colors.SHADE_GREY, true);
  };

  const renderAddedCirclePlanWithValidity = () => {
    return (
      <AddedCirclePlanWithValidity
        circleSavings={circleSavings}
        circlePlanDetails={circlePlanDetails}
        isConsult={true}
      />
    );
  };

  const renderCircleSavingsOnPurchase = () => {
    return (
      <View style={styles.circleSavingsContainer}>
        <View style={styles.rowCenter}>
          <CircleLogo style={styles.circleLogo} />
          <Text
            style={{
              ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 1, 12),
              marginTop: 5,
            }}
          >
            You{' '}
            <Text style={theme.viewStyles.text('SB', 12, theme.colors.SEARCH_UNDERLINE_COLOR)}>
              saved {string.common.Rs}
              {convertNumberToDecimal(circleSavings)}{' '}
            </Text>
            on your purchase
          </Text>
        </View>
      </View>
    );
  };

  const renderConsultInfo = () => {
    return (
      <View style={styles.consultInfoView}>
        <Text style={theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE)}>
          {string.consultPayment.knowConsultation}
        </Text>
        <Text style={styles.callReceiveText}>
          {string.consultPayment.receiveCallText}
        </Text>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>
              1
            </Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.beforeConsultation}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.dashLine} />
          <Text style={styles.consultInfoText}>
            {string.consultPayment.stepOne}
            <Text style={theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY)}>
              {string.consultPayment.stepOneSubheading}
            </Text>
          </Text>
        </View>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>
              2
            </Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.consultation}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.dashLine} />
          <Text style={styles.consultInfoText}>
            {string.consultPayment.stepTwo}
          </Text>
        </View>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>
              3
            </Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.postConsultation}
          </Text>
        </View>
        <View style={styles.lastStepView}>
          <Text style={styles.consultInfoText}>
            {string.consultPayment.stepThree}
          </Text>
        </View>
        <Text style={styles.guidelineText}>
          {string.consultPayment.detailedGuidelines}
        </Text>
        <TouchableOpacity
          onPress={() => setShowPDF(true)} 
          style={styles.pdfView}>
          <Pdf style={styles.pdfIcon}/>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.viewGuideline}
            <Text style={theme.viewStyles.text('R', 12, theme.colors.SLATE_GRAY)}>
              {string.consultPayment.download}
            </Text>
          </Text>
          <View style={styles.arrowIconView}>
            <RightArrowBlue style={{height: 12, width: 6}} />
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  const renderMedicineNote = () => {
    return (
      <View style={styles.medicineNoteView}>
        <Text style={theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY)}>
          {string.consultPayment.medicineNote}
        </Text>
      </View>
    )
  }
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />
        <View style={styles.container}>
            <ScrollView style={styles.container}>
              {renderStatusCard()}
              {renderConsultInfo()}
              {circleSavings > 0 && !circleSubscriptionId
                ? renderAddedCirclePlanWithValidity()
                : null}
              {circleSavings > 0 && !!circleSubscriptionId ? renderCircleSavingsOnPurchase() : null}
              {renderNote()}
              {renderMedicineNote()}
            </ScrollView>
            <View style={{backgroundColor: theme.colors.WHITE}}>
            <FooterButton
              item={itemDetails}
              paymentFor={paymentType}
              navigationProps={props.navigation}
            />
            </View>
          </View>
        {notificationAlert && (
          <NotificationPermissionAlert
            onPressOutside={() => setNotificationAlert(false)}
            onButtonPress={() => {
              setNotificationAlert(false);
              Linking.openSettings();
            }}
          />
        )}
        {showPDF && (
          <RenderPdf
            uri={'https://newassets-test.apollo247.com/files/Mobile_View_Infographic.pdf'}
            title={'Consultation guideline'}
            isPopup={true}
            setDisplayPdf={() => {
              setShowPDF(false);
            }}
            navigation={props.navigation}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  Payment: {
    fontSize: 14,
    color: theme.colors.ASTRONAUT_BLUE,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
  statusIconStyles: {
    width: 40,
    height: 40,
  },
  statusCardStyle: {
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    paddingBottom: 15,
    backgroundColor: theme.colors.WHITE
  },
  statusCardSubContainerStyle: {
    padding: 12,
  },
  centerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentCardStyle: {
    marginVertical: 0.03 * windowWidth,
    paddingLeft: 0.06 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  appointmentHeaderStyle: {
    backgroundColor: '#eee',
    height: 0.04 * windowHeight,
    justifyContent: 'center',
    marginHorizontal: 0.06 * windowWidth,
    borderBottomWidth: 0.8,
    borderBottomColor: '#ddd',
  },
  buttonStyle: {
    height: 40,
    backgroundColor: theme.colors.TANGERINE_YELLOW,
    marginVertical: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refStyles: {
    flexDirection: 'row',
    marginHorizontal: 12,
    flexWrap: 'wrap'
  },
  iconStyle: {
    marginLeft: 6,
    marginTop: 5,
    width: 9,
    height: 10,
  },
  inputStyle: {
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansMedium(11),
    color: '#6D7278',
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  viewInvoice: {
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  rightIcon: {
    flex: 0.15,
    alignItems: 'flex-end',
  },
  sentMsg: {
    color: theme.colors.CONSULT_SUCCESS_TEXT,
    marginVertical: 4,
    ...theme.fonts.IBMPlexSansMedium(11),
  },
  orderIdStyles: {
    marginTop: 12,
  },
  paymentRef: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  circleSavingsContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    borderRadius: 5,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleLogo: {
    width: 45,
    height: 27,
    marginRight: 5,
  },
  savedLocationView: {
    marginHorizontal: 0.06 * windowWidth,
    marginBottom: 20,
    paddingBottom: 10,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 10,
  },
  line: {
    width: '100%',
    height: 0.8,
    backgroundColor: '#ddd',
  },
  currentLocationTitle: {
    ...theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE),
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  savedLocationText: {
    marginLeft: 6,
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE),
    width: windowWidth - 230,
  },
  changeLocationBtnTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.TANGERINE_YELLOW),
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    paddingHorizontal: 12,
  },
  locationMainView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 15,
    elevation: 15,
  },
  currentLocationText: {
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  currentLocationView: {
    ...theme.viewStyles.cardViewStyle,
    width: 235,
    padding: 16,
    marginTop: 40,
  },
  locationIconView: {
    marginLeft: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 10,
  },
  searchedLocationItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    paddingVertical: 7,
  },
  citiesText: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  locationInput: {
    flexDirection: 'row',
    marginTop: 5,
  },
  consultInfoView: {
    marginHorizontal: 0.06 * windowWidth,
    marginBottom: 20,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 10,
    padding: 12,
  },
  callReceiveText: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 16),
    paddingTop: 9,
    paddingBottom: 15,
  },
  separator: {
    height: 1,
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR
  },
  appointmentView: {
    marginTop: 8, 
    marginStart: 12
  },
  statusView: {
    paddingStart: 18
  },
  consultStepView: {
    width: 114, 
    backgroundColor: theme.colors.AQUA_BLUE, 
    borderRadius: 6, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginStart: 5
  },
  stepNumberContainer: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.LIGHT_BLUE, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginEnd: 6
  },
  infoContainer: {
    marginStart: 10, 
    flexDirection: 'row'
  },
  dashLine: {
    width: 1, 
    height: 56, 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: theme.colors.LIGHT_BLUE, 
    marginEnd: 16
  },
  consultInfoText: {
    paddingTop: 4, 
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)
  },
  lastStepView: {
    marginStart: 26, 
    marginBottom: 14
  },
  guidelineText: {
    ...theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY), 
    marginStart: 5, 
    marginBottom: 5
  },
  pdfView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR, 
    flex: 1, 
    borderRadius: 6, 
    flexDirection: 'row', 
    paddingVertical: 8, 
    alignItems: 'center'
  },
  pdfIcon: {
    width: 22,
    height: 26,
    marginStart: 9, 
    marginEnd: 13
  },
  arrowIconView: {
    flex: 1, 
    alignItems: 'flex-end', 
    marginEnd: 16
  },
  snackbarView: { 
    position: 'absolute', 
    zIndex: 1001, 
    bottom: -10 
  },
  viewInvoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewIcon: {
    width: 16, 
    height: 10, 
    marginEnd: 4
  },
  emailIcon: {
    width: 17, 
    height: 13, 
    marginEnd: 4
  },
  emailInvoiceView: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginStart: 20
  },
  locationSubView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refundIconStyles: {
    width: 36,
    height: 40,
  },
  medicineNoteView: {
    backgroundColor: theme.colors.WHITE,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  failureCardStyle: {
    borderWidth: 1.5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  }
});
