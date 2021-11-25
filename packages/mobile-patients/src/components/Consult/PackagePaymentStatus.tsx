import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Alert,
  Text,
  TouchableOpacity,
  Dimensions,
  Clipboard,
  PermissionsAndroid,
  Platform,
  TextInput,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  bookFreeAppointmentForPharmacy,
  bookFreeAppointmentForPharmacyVariables,
} from '@aph/mobile-patients/src/graphql/types/bookFreeAppointmentForPharmacy';
import { RenderPdf } from '@aph/mobile-patients/src/components/ui/RenderPdf';
import { AppRoutes, getCurrentRoute } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  g,
  postCleverTapEvent,
  navigateToHome,
  navigateToSpecialtyPage,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { sendSubscriptionInvoiceEmail } from '@aph/mobile-patients/src/helpers/apiCalls';

import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';
import moment from 'moment';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import { NavigationScreenProps } from 'react-navigation';
import HTML from 'react-native-render-html';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string, { Payment, NewPaymentStatuses } from '@aph/mobile-patients/src/strings/strings.json';
import PaymentStatusConstants from '@aph/mobile-patients/src/components/MyPayments/constants';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  BOOK_PACKAGE_CONSULT,
  GET_PACKAGE_PURCHASE_INFO,
  GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
  GET_APPOINTMENT_DATA,
  CONSULT_ORDER_INVOICE,
} from '@aph/mobile-patients/src/graphql/profiles';

import { PAYMENT_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SuccessIcon,
  FailedIcon,
  PendingIcon,
  LocationOn,
  RightArrowBlue,
  Copy,
  TickIcon,
  PdfGray,
  EmailGray,
  Pdf,
  SearchSendIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { ScrollView } from 'react-native-gesture-handler';
import {
  useAppCommonData,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';

import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import { useApolloClient } from 'react-apollo-hooks';

import {
  getPackagePurchaseInfo,
  getPackagePurchaseInfoVariables,
} from '../../graphql/types/getPackagePurchaseInfo';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

interface PackagePaymentStatusProps extends NavigationScreenProps {}

export const PackagePaymentStatus: React.FC<PackagePaymentStatusProps> = (props) => {
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const fireLocationEvent = useRef<boolean>(false);
  const userChangedLocation = useRef<boolean>(false);
  const [locationSearchList, setlocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );
  const [showLocationPopup, setShowLocationPopup] = useState<boolean>(false);
  const { locationDetails } = useAppCommonData();
  const client = useApolloClient();
  const { success, failure, pending } = NewPaymentStatuses;

  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const [paymentStatus, setPaymentStatus] = useState<string>(
    props.navigation.getParam('paymentStatus')
  );
  const [paymentOrderId, setPaymentOrderId] = useState<any>(
    props.navigation.getParam('paymentId') || ''
  );
  const oneTapPatient = props.navigation.getParam('oneTapPatient');
  const [oneTapSpecialityName, setOneTapSpecialityName] = useState<string>('');
  const [oneTapBenefitId, setOneTapBenefitId] = useState<string>('');
  const [oneTapSubscriptionId, setOneTapSubscriptionId] = useState<string>('');

  const [orderId, setOrderId] = useState<any>('');
  const [planName, setPlanName] = useState<string>('');
  const [planDescription, setPlanDescription] = useState<string>('');
  const [planValidity, setPlanValidity] = useState<any>();
  const [planId, setPlanId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  const [invoiceUrl, setInvoiceUrl] = useState<string>('');
  const [showEmailInput, setshowEmailInput] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(currentPatient?.emailAddress || '');
  const [emailSent, setEmailSent] = useState<boolean>(false);

  useEffect(() => {
    fetchOrderStatus();

    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    navigateToSpecialtyPage(props.navigation);
    return true;
  };

  const renderPaymentCard = () => {
    return (
      <View style={styles.paymentStatusCard}>
        <Text style={styles.orderIdTitle}>
          {string.consultPackages.orderId} {orderId}
        </Text>
        <Text style={styles.refNumberTitle}>{string.consultPackages.referenceNumber}</Text>
        <View style={styles.statusView}>
          <Text style={styles.refNumber}>{paymentOrderId}</Text>
          <TouchableOpacity
            onPress={() => {
              try {
                Clipboard.setString(paymentOrderId);

                showAphAlert!({
                  title: 'Copied! ',
                  description: 'Order Id  ' + paymentOrderId + ' copied to clipboard.',
                  onPressOk: () => {
                    hideAphAlert!();
                  },
                });
              } catch (error) {}
            }}
          >
            <Copy style={styles.copyLogo} />
          </TouchableOpacity>
        </View>
        <View style={styles.invoiceBtnView}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => {
              if (invoiceUrl) {
                requestStoragePermission();
              } else {
                showAphAlert!({
                  title: 'Uh oh.. :(',
                  description:
                    'Seems like the invoice is not generated and avialable to download.Press okay to recheck and download.',
                  onPressOk: () => {
                    hideAphAlert!();
                    fetchOrderStatus();
                  },
                });
              }
            }}
          >
            <PdfGray style={styles.viewIcon} />
            <Text style={styles.invoiceBtn}>{string.consultPackages.viewInvoice}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => {
              if (invoiceUrl) {
                setshowEmailInput(!showEmailInput);
              } else {
                showAphAlert!({
                  title: 'Uh oh.. :(',
                  description:
                    'Seems like the invoice is not generated and avialable to send.Press okay to recheck.',
                  onPressOk: () => {
                    hideAphAlert!();
                    fetchOrderStatus();
                  },
                });
              }
            }}
          >
            <EmailGray style={styles.emailIcon} />
            {/* <Text style={styles.invoiceBtn}>{string.consultPackages.emailInvoice}</Text> */}
            {textComponent(
              string.consultPackages.emailInvoice,
              undefined,
              !showEmailInput ? theme.colors.TANGERINE_YELLOW : theme.colors.TEXT_LIGHT_YELLOW,
              false
            )}
          </TouchableOpacity>
        </View>
        {renderEmailInputContainer()}
        <View style={styles.cardSeparator} />
        {renderPackageCard()}
      </View>
    );
  };

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const rightIconView = () => {
    return (
      <View style={{ paddingBottom: 0, opacity: isSatisfyingEmailRegex(email.trim()) ? 1 : 0.5 }}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={!isSatisfyingEmailRegex(email.trim())}
          onPress={() => {
            emailInvoice();
          }}
        >
          <SearchSendIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderInputEmail = () => {
    return (
      <View style={styles.inputContainer}>
        <View style={{ flex: 0.85 }}>
          <TextInput
            value={`${email ? email : ''}`}
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

  const renderEmailInputContainer = () => {
    return showEmailInput ? <View>{!emailSent ? renderInputEmail() : renderSentMsg()}</View> : null;
  };

  const textComponent = (
    message: string,
    numOfLines: number | undefined,
    color: string,
    needStyle: boolean
  ) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('M', 12, color, 1, 20),
          marginLeft: 10,
        }}
        numberOfLines={numOfLines}
      >
        {message}
      </Text>
    );
  };

  const getPaymentStatus = () => {
    const { SUCCESS, FAILED } = PaymentStatusConstants;
    const { status } = {
      status:
        paymentStatus == PAYMENT_STATUS.TXN_SUCCESS
          ? SUCCESS
          : paymentStatus == PAYMENT_STATUS.TXN_FAILURE
          ? FAILED
          : undefined,
    };
    const { paymentFailed, paymentPending, paymentSuccessful } = LocalStrings;
    const { SUCCESS_TEXT, PENDING_TEXT, FAILURE_TEXT } = colors;
    switch (status) {
      case SUCCESS:
        return {
          icon: (
            <SuccessIcon
              style={{ height: 48, width: 48, alignSelf: 'center', marginVertical: 32 }}
            />
          ),
          text: paymentSuccessful,
          textColor: SUCCESS_TEXT,
          description:
            'The health package has been purchased successfully! You can go ahead and book your first consultation. We’ll assign a doctor as per availability.',
        };
      case FAILED:
        return {
          icon: (
            <FailedIcon
              style={{ height: 48, width: 48, alignSelf: 'center', marginVertical: 32 }}
            />
          ),
          text: paymentFailed,
          textColor: FAILURE_TEXT,
          description: 'Failed to purchase the health package! ',
        };
      default:
        return {
          icon: (
            <PendingIcon
              style={{ height: 48, width: 48, alignSelf: 'center', marginVertical: 32 }}
            />
          ),
          text: paymentPending,
          textColor: PENDING_TEXT,
          description:
            'The payment is in progress to purchase the health package. It may take around 10 minutes to confirm your payment. We apologize to you for the inconvenience caused. You can click REFRESH to see the update.',
        };
    }
  };

  const renderConsultInfo = () => {
    return (
      <View style={styles.consultInfoView}>
        <Text style={theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE)}>
          {string.consultPayment.knowConsultation}
        </Text>
        <Text style={styles.callReceiveText}>{string.consultPayment.receiveCallText}</Text>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>1</Text>
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
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>2</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.consultation}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.dashLine} />
          <Text style={styles.consultInfoText}>{string.consultPayment.stepTwo}</Text>
        </View>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>3</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.postConsultation}
          </Text>
        </View>
        <View style={styles.lastStepView}>
          <Text style={styles.consultInfoText}>{string.consultPayment.stepThree}</Text>
        </View>
        <Text style={styles.guidelineText}>{string.consultPayment.detailedGuidelines}</Text>
        <TouchableOpacity onPress={() => setShowPDF(true)} style={styles.pdfView}>
          <Pdf style={styles.pdfIcon} />
          <Text style={theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.viewGuideline}
            <Text style={theme.viewStyles.text('R', 12, theme.colors.SLATE_GRAY)}>
              {string.consultPayment.download}
            </Text>
          </Text>
          <View style={styles.arrowIconView}>
            <RightArrowBlue style={{ height: 12, width: 6 }} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPackageCard = () => {
    const validityDate = moment(planValidity).format('DD MMM YYYY');
    return (
      <View style={styles.packageCard}>
        <Text style={styles.packageDetailTitle}>Package Details</Text>
        <Text style={styles.packageDetailText}>{planName}</Text>
        <HTML
          html={planDescription || ''}
          baseFontStyle={styles.packageDescriptionText}
          ignoredStyles={[
            'line-height',
            'margin-bottom',
            'color',
            'text-align',
            'font-size',
            'font-family',
          ]}
        />
        <Text style={styles.validityText}>{`Valid till ${validityDate}`}</Text>
      </View>
    );
  };

  const renderSavedLocation = () => {
    return (
      <View style={styles.savedLocationView}>
        <Text style={styles.currentLocationTitle}>Your current location</Text>
        <View style={styles.line} />
        <View style={styles.spaceRow}>
          <View style={styles.rowCenter}>
            <LocationOn />
            <Text style={styles.savedLocationText}>
              {locationDetails?.city}{' '}
              {locationDetails?.pincode ? `, ${locationDetails?.pincode}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              fireLocationEvent.current = true;
              userChangedLocation.current = true;
              setlocationSearchList([]);
              setShowLocationPopup(true);
            }}
          >
            <Text style={styles.changeLocationBtnTxt}>CHANGE LOCATION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const logBookConsultCleverTapEvent = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'New user': !currentPatient?.isConsulted,
      'Selling Source': 'direct',
      'Plan Name': planName,
      'Plan Price': paymentAmount,
    };

    postCleverTapEvent(CleverTapEventName.CONSULT_PACKAGE_BOOK_CONSULT_CLICKED, eventAttributes);
  };

  const renderPaymentStatusHeader = () => {
    const { icon, text, textColor, description } = getPaymentStatus();

    return (
      <View>
        <LinearGradient
          style={styles.paymenStatusHeader}
          start={{ x: 0, y: -0.5 }}
          end={{ x: 0, y: 1 }}
          colors={['#D5F5FF', colors.DEFAULT_BACKGROUND_COLOR]}
        >
          {icon}
          <Text style={styles.paymentSuccessfullText}>{text}</Text>
          <Text style={styles.orderPlacedText}>Your order of ₹{paymentAmount} is placed</Text>
          <Text style={[styles.purchaseStatusText, { color: textColor }]}>{description}</Text>

          {!paymentStatus ||
          (paymentStatus != PAYMENT_STATUS.TXN_SUCCESS &&
            paymentStatus != PAYMENT_STATUS.TXN_FAILURE) ? (
            <TouchableOpacity
              onPress={() => {
                fetchOrderStatus();
              }}
            >
              <Text
                style={[
                  styles.purchaseStatusText,
                  {
                    color: textColor,
                    textDecorationLine: 'underline',
                    marginTop: 5,
                    alignSelf: 'center',
                  },
                ]}
              >
                REFRESH
              </Text>
            </TouchableOpacity>
          ) : null}
        </LinearGradient>
      </View>
    );
  };

  const getOrderInfo = () => {
    return client.query<getPackagePurchaseInfo, getPackagePurchaseInfoVariables>({
      query: GET_PACKAGE_PURCHASE_INFO,
      variables: {
        order_id: paymentOrderId,
      },
      fetchPolicy: 'no-cache',
    });
  };

  const fetchOrderStatus = async () => {
    try {
      setShowSpinner?.(true);

      const response = await getOrderInfo();

      if (response?.data?.getOrderInternal) {
        const txnStatus =
          response?.data?.getOrderInternal?.payment_status || PAYMENT_STATUS.PENDING;
        setPaymentStatus(txnStatus);
        setPaymentAmount(response?.data?.getOrderInternal?.total_amount || 0);
        setOrderId(
          currentPatient?.mobileNumber +
            '-' +
            response?.data?.getOrderInternal?.SubscriptionOrderDetails?.group_sub_plan?.plan_id ||
            ''
        );
        setPlanName(
          response?.data?.getOrderInternal?.SubscriptionOrderDetails?.group_sub_plan?.name || '-'
        );
        setPlanDescription(
          response?.data?.getOrderInternal?.SubscriptionOrderDetails?.group_plan?.meta
            ?.description || '-'
        );
        setPlanId(
          response?.data?.getOrderInternal?.SubscriptionOrderDetails?.group_sub_plan?.plan_id || ''
        );
        setPlanValidity(response?.data?.getOrderInternal?.SubscriptionOrderDetails?.end_date);

        setInvoiceUrl(
          response?.data?.getOrderInternal?.SubscriptionOrderDetails?.payment_reference?.invoice_url
        );
      } else {
        renderErrorPopup(string.common.tryAgainLater);
      }

      setShowSpinner?.(false);
    } catch (error) {
      setShowSpinner?.(false);
      CommonBugFender('fetchingTxnStutus', error);
      renderErrorPopup(string.common.tryAgainLater);
    }
  };

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
      onPressOk: () => {
        hideAphAlert!();
        props.navigation.goBack();
      },
    });

  const emailInvoice = () => {
    setShowSpinner?.(true);

    sendSubscriptionInvoiceEmail(currentPatient?.mobileNumber, email, invoiceUrl)
      .then((res) => {
        setEmailSent(true);
      })
      .catch((error) => {
        CommonBugFender('Error while sending invoice on mail', error);

        showAphAlert!({
          title: 'Uh oh.. :(',
          description: string.common.somethingWentWrong,
        });
      })
      .finally(() => {
        setShowSpinner?.(false);
        setTimeout(() => {
          setEmailSent(false);
          setshowEmailInput(false);
        }, 5000);
      });
  };

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
        downloadInvoice(invoiceUrl);
      }
    } catch (error) {
      CommonBugFender('PaymentStatusScreen_requestReadSmsPermission_try', error);
    }
  };

  const downloadInvoice = (invoiceUrl: string) => {
    setShowSpinner?.(true);
    let dirs = RNFetchBlob.fs.dirs;
    let fileName: string =
      'Apollo_Package_Consult_Invoice' + moment().format('MMM_D_YYYY_HH_mm') + '.pdf';
    const downloadPath =
      Platform.OS === 'ios'
        ? (dirs.DocumentDir || dirs.MainBundleDir) +
          '/' +
          (fileName || 'Apollo_Package_Consult_Invoice.pdf')
        : dirs.DownloadDir + '/' + (fileName || 'Apollo_Package_Consult_Invoice.pdf');
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
      .fetch('GET', String(invoiceUrl), {
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
      })
      .finally(() => {
        setShowSpinner?.(false);
      });
  };

  const fetchOneTapPlanFromSubscriptionBenefits = () => {
    setShowSpinner?.(true);

    const mobile_number = g(currentPatient, 'mobileNumber');

    mobile_number &&
      client
        .query<
          GetAllUserSubscriptionsWithPlanBenefitsV2,
          GetAllUserSubscriptionsWithPlanBenefitsV2Variables
        >({
          query: GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
          variables: { mobile_number },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const groupPlans = g(
            data,
            'data',
            'GetAllUserSubscriptionsWithPlanBenefitsV2',
            'response'
          );

          if (groupPlans) {
            Object.keys(groupPlans).forEach((plan_name) => {
              if (plan_name === 'APOLLO') {
                let desiredPlan = groupPlans[plan_name]?.find(
                  (plan: any) =>
                    plan.plan_vertical === 'Consult' &&
                    (plan.status === 'active' || plan.status === 'deferred_active') &&
                    plan.sub_plan_id === planId
                );

                if (desiredPlan) {
                  let benefit = desiredPlan?.benefits[0];
                  bookConsult(
                    oneTapPatient,
                    benefit?.attribute,
                    benefit?._id,
                    desiredPlan?.subscription_id,
                    desiredPlan?.subscription_details
                  );
                } else {
                  showAphAlert!({
                    title: 'Uh oh.. :(',
                    description: "Seems like the plan dosen't exists anymore.",
                    onPressOk: () => {
                      // props.navigation.goBack();
                      hideAphAlert!();
                    },
                  });
                }
              }
            });
          }
        })
        .catch((error) => {
          showAphAlert!({
            title: 'Uh oh.. :(',
            description: "Couldn't load the plan details. Please check internet connection.",
            onPressOk: () => {
              props.navigation.goBack();
              hideAphAlert!();
            },
          });
        })
        .finally(() => {
          //setLoading(false);
          setShowSpinner?.(false);
        });
  };

  const bookConsult = async (
    oneTapPatient: any,
    specialityName: string,
    benefitId: string,
    subscriptionId: string,
    subscriptionDetails: any
  ) => {
    const subscriptionDetailsInput = {
      specialtyName: specialityName,
      benefitId: benefitId,
      userSubscriptionId: subscriptionId,

      planId: subscriptionDetails?.plan_id,
      subPlanId: subscriptionDetails?.sub_plan_id,
      paymentOrderId: subscriptionDetails?.order_id,
      subscriptionSubPlanId: subscriptionDetails?._id,
    };

    const inputVariable = {
      patientId: oneTapPatient?.id,
      subscriptionDetailsInput: subscriptionDetailsInput,
    };

    setLoading?.(true);
    try {
      const data = await client.mutate<
        bookFreeAppointmentForPharmacy,
        bookFreeAppointmentForPharmacyVariables
      >({
        mutation: BOOK_PACKAGE_CONSULT,
        variables: inputVariable,
        context: { headers: { 'x-api-key': AppConfig.Configuration.Consult_Free_Book_Key } },
      });

      const { isError, doctorName, appointmentId, error } =
        data?.data?.bookFreeAppointmentForPharmacy || {};
      if (!isError) {
        handleOrderSuccess(doctorName!, appointmentId!);
      } else {
        setLoading?.(false);
        showAphAlert?.({
          title: 'Error',
          description: error || '',
        });
      }
    } catch (error) {
      setLoading?.(false);
      showAphAlert?.({
        title: 'Error',
        description: string.common.somethingWentWrong,
      });
    }
  };

  const handleOrderSuccess = (doctorName: string, appointmentId: string) => {
    client
      .query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        try {
          const appointmentData = _data?.data?.getAppointmentData?.appointmentsHistory;
          if (!!appointmentData && !!appointmentData?.[0]?.doctorInfo) {
            const params = {
              isFreeConsult: true,
              doctorName: doctorName,
              appointmentData: appointmentData?.[0],
              skipAutoQuestions: false,
            };
            homeScreenParamsOnPop.current = params;
            navigateToHome(props.navigation, params);
          }
        } catch (error) {
          props.navigation.navigate('APPOINTMENTS');
        }
      })
      .catch((e) => {
        props.navigation.navigate('APPOINTMENTS');
      })
      .finally(() => setLoading?.(false));
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {/* {renderHeader()} */}
      <View style={styles.container}>
        <ScrollView>
          {renderPaymentStatusHeader()}

          {renderPaymentCard()}

          {renderConsultInfo()}

          {locationDetails && renderSavedLocation()}

          <View style={styles.consultGuideLinesContainer}>
            <Text style={styles.consultBookText}>{string.consultPackages.consultGuildeline}</Text>
          </View>
        </ScrollView>
        <Button
          style={styles.viewPackageBtn}
          disabled={paymentStatus == PAYMENT_STATUS.TXN_SUCCESS ? false : true}
          onPress={() => {
            if (paymentStatus == PAYMENT_STATUS.TXN_SUCCESS) {
              if (oneTapPatient) {
                fetchOneTapPlanFromSubscriptionBenefits();
              } else {
                props.navigation.navigate(AppRoutes.ConsultPackagePostPurchase, {
                  planId: planId,
                  onSubscriptionCancelled: () => {
                    props.navigation.goBack();
                  },
                });
              }
            } else {
              showAphAlert?.({
                title: 'Oops!',
                description: string.consultPackages.paymentPendingBooking,
              });
            }
            logBookConsultCleverTapEvent();
          }}
          title={
            oneTapPatient ? string.consultPackages.consultNow : string.consultPackages.viewPackage
          }
        />
      </View>
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
      {showSpinner ? <Spinner /> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.CARD_BG,
  },
  paymenStatusHeader: {
    height: 270,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    paddingVertical: 6,
    marginTop: 5,
    borderColor: theme.colors.LIGHT_GRAY_2,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: '#6D7278',
    borderBottomWidth: 0,
    justifyContent: 'center',
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
  consultGuideLinesContainer: {
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: theme.colors.WHITE,
    borderColor: '#D4D4D4',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerContainer: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  paymentSuccessfullText: {
    marginBottom: 4,
    textAlign: 'center',
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE, undefined, 17),
  },
  orderPlacedText: {
    textAlign: 'center',
    ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE, undefined, 17),
  },
  paymentStatusCard: {
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: theme.colors.WHITE,
    borderColor: '#D4D4D4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    height: 20,
    width: 20,
    marginStart: 8,
  },
  statusText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SUCCESS, undefined, 17),
    marginStart: 8,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: theme.colors.BLACK_COLOR,
    opacity: 0.2,
    marginVertical: 8,
    marginHorizontal: -13,
  },
  orderIdTitle: {
    ...theme.viewStyles.text('R', 11, theme.colors.LIGHT_BLUE, 0.7),
  },
  refNumberTitle: {
    ...theme.viewStyles.text('R', 11, theme.colors.LIGHT_BLUE, 0.7),
    marginTop: 6,
  },
  refNumber: {
    ...theme.viewStyles.text('R', 11, theme.colors.LIGHT_BLUE, 0.7),
    marginTop: 6,
  },
  copyLogo: {
    marginLeft: 6,
    width: 9,
    height: 10,
    opacity: 0.7,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceBtnView: {
    flexDirection: 'row',
    paddingTop: 6,
  },
  invoiceBtn: {
    ...theme.viewStyles.text('M', 12, theme.colors.TANGERINE_YELLOW, undefined, 24),
    marginEnd: 30,
    marginLeft: 10,
  },
  packageDetailsText: {
    ...theme.viewStyles.text('B', 13, theme.colors.SHERPA_BLUE, undefined, 17),
    paddingStart: 20,
    paddingBottom: 4,
  },
  separator: {
    height: 1,
    borderRadius: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginHorizontal: 20,
    opacity: 0.21,
  },
  packageCard: {},
  packageDetailTitle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, undefined),
  },
  packageDetailText: {
    ...theme.viewStyles.text('M', 13, theme.colors.APP_GREEN, undefined, 17),
    paddingVertical: 6,
  },
  packageDescriptionText: {
    ...theme.viewStyles.text('R', 13, theme.colors.SHADE_CYAN_BLUE),
  },
  validityText: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHADE_CYAN_BLUE, undefined, 17),
    marginTop: 6,
  },
  purchaseStatusText: {
    marginTop: 16,
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE, undefined, 17),
    paddingHorizontal: 20,
    textAlign: 'center',
    alignSelf: 'flex-end',
  },
  consultBookText: {
    ...theme.viewStyles.text('M', 12, theme.colors.SLATE_GRAY, undefined),
  },
  viewPackageBtn: {
    width: 240,
    height: 40,
    alignSelf: 'center',
    marginVertical: 16,
    marginHorizontal: 10,
  },
  priceText: {
    textAlign: 'right',
    flex: 1,
    ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, undefined, 20),
  },
  consultInfoView: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 4,
    padding: 12,
    borderColor: '#D4D4D4',
    borderWidth: 1,
  },
  callReceiveText: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 16),
    paddingTop: 9,
    paddingBottom: 15,
  },

  consultStepView: {
    width: 114,
    backgroundColor: theme.colors.AQUA_BLUE,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 5,
  },
  stepNumberContainer: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 6,
  },
  infoContainer: {
    marginStart: 10,
    flexDirection: 'row',
  },
  dashLine: {
    width: 1,
    height: 56,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.LIGHT_BLUE,
    marginEnd: 16,
  },
  consultInfoText: {
    paddingTop: 4,
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE),
  },

  lastStepView: {
    marginStart: 26,
    marginBottom: 14,
  },
  guidelineText: {
    ...theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY),
    marginStart: 5,
    marginBottom: 5,
  },
  pdfView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    flex: 1,
    borderRadius: 6,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  pdfIcon: {
    width: 22,
    height: 26,
    marginStart: 9,
    marginEnd: 13,
  },
  arrowIconView: {
    flex: 1,
    alignItems: 'flex-end',
    marginEnd: 16,
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
  emailIcon: {
    width: 17,
    height: 13,
  },
  viewIcon: {
    width: 16,
    height: 10,
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
});
