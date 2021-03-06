import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { JoinWaitingRoomView } from '@aph/mobile-patients/src/components/Consult/JoinWaitingRoomView';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker, { Image as ImageCropPickerResponse } from 'react-native-image-crop-picker';
import {
  ChatCallIcon,
  ChatSend,
  CrossPopup,
  DoctorImage,
  DoctorPlaceholderImage,
  FileBig,
  Loader,
  Mascot,
  MissedCallIcon,
  UploadHealthRecords,
  FreeArrowIcon,
  CallCollapseIcon,
  CallCameraIcon,
  AudioActiveIcon,
  AudioInactiveIcon,
  VideoActiveIcon,
  VideoInactiveIcon,
  WhiteCallIcon,
  UserThumbnailIcon,
  CopyIcon,
  ExternalMeetingVideoCall,
  MedicalAssessment,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  CommonBugFender,
  CommonLogEvent,
  DeviceHelper,
  isIos,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  BOOK_APPOINTMENT_RESCHEDULE,
  BOOK_APPOINTMENT_TRANSFER,
  UPDATE_APPOINTMENT_SESSION,
  ADD_CHAT_DOCUMENTS,
  UPLOAD_MEDIA_DOCUMENT_V2,
  SEND_PATIENT_WAIT_NOTIFICATION,
  UPDATE_HEALTH_RECORD_NUDGE_STATUS,
  GET_APPOINTMENT_DATA,
  GET_DOCTOR_DETAILS_BY_ID,
  CALL_CONNECTION_UPDATES,
  POST_WEB_ENGAGE,
  CREATE_VONAGE_SESSION_TOKEN,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  bookRescheduleAppointment,
  bookRescheduleAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookRescheduleAppointment';
import {
  bookTransferAppointment,
  bookTransferAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookTransferAppointment';
import {
  updateHealthRecordNudgeStatus,
  updateHealthRecordNudgeStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/updateHealthRecordNudgeStatus';
import {
  checkCallConnection,
  checkCallConnectionVariables,
} from '@aph/mobile-patients/src/graphql/types/checkCallConnection';
import {
  addChatDocument,
  addChatDocumentVariables,
} from '@aph/mobile-patients/src/graphql/types/addChatDocument';
import {
  getAppointmentData,
  getAppointmentDataVariables,
  getAppointmentData_getAppointmentData_appointmentsHistory,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import { getPatinetAppointments_getPatinetAppointments_patinetAppointments } from '@aph/mobile-patients/src/graphql/types/getPatinetAppointments';
import {
  APPOINTMENT_STATE,
  APPOINTMENT_TYPE,
  BookTransferAppointmentInput,
  ConsultQueueInput,
  FEEDBACKTYPE,
  MessageInput,
  notificationEventName,
  notificationStatus,
  notificationType,
  REQUEST_ROLES,
  MediaPrescriptionUploadRequest,
  STATUS,
  TRANSFER_INITIATED_TYPE,
  mediaPrescriptionSource,
  MediaPrescriptionFileProperties,
  Gender,
  USER_STATUS,
  CheckCallConnectionInput,
  WebEngageEvent,
  ConsultMode,
  PatientConsultEventToDoctorInput,
  APPOINTMENT_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  updateAppointmentSession,
  updateAppointmentSessionVariables,
} from '@aph/mobile-patients/src/graphql/types/updateAppointmentSession';
import {
  addToConsultQueue,
  addToConsultQueueWithAutomatedQuestions,
  checkIfRescheduleAppointment,
  getAppointmentDataDetails,
  getNextAvailableSlots,
  getPrismUrls,
  insertMessage,
  getPastAppoinmentCount,
  updateExternalConnect,
  getSecretaryDetailsByDoctor,
  getParticipantsLiveStatus,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { stat } from 'react-native-fs';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
  DIAGNOSTICS_ITEM_TYPE,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import Pubnub, { HereNowResponse } from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  AppState,
  AppStateStatus,
  Dimensions,
  FlatList,
  Image as ImageReact,
  Keyboard,
  KeyboardEvent,
  Linking,
  NativeModules,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Clipboard,
  BackHandler,
} from 'react-native';
import CryptoJS from 'crypto-js';
import { Image } from 'react-native-elements';
import KeepAwake from 'react-native-keep-awake';
import SoftInputMode from 'react-native-set-soft-input-mode';
import { WebView } from 'react-native-webview';
import { NavigationScreenProps } from 'react-navigation';
import {
  callPermissions,
  g,
  postWebEngageEvent,
  nameFormater,
  followUpChatDaysCaseSheet,
  addTestsToCart,
  doRequestAndAccessLocation,
  handleGraphQlError,
  formatToCartItem,
  getPrescriptionItemQuantity,
  postCleverTapEvent,
  getNetStatus,
  postAppointmentCleverTapEvents,
  fileToBase64,
  formatUrl,
  updateCallKitNotificationReceivedStatus,
} from '../../helpers/helperFunctions';
import { mimeType } from '../../helpers/mimeType';
import { FeedbackPopup } from '../FeedbackPopup';
import { RenderPdf } from '../ui/RenderPdf';
import { useUIElements } from '../UIElementsProvider';
import { ChatQuestions } from './ChatQuestions';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { CustomAlert } from '../ui/CustomAlert';
import { Snackbar } from 'react-native-paper';
import BackgroundTimer from 'react-native-background-timer';
import { MAX_FILE_SIZE, UploadPrescriprionPopup } from '../Medicines/UploadPrescriprionPopup';
import { ChatRoom_NotRecorded_Value } from '@aph/mobile-patients/src/strings/strings.json';
import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import RNCallKeep from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';
import { convertMinsToHrsMins } from '@aph/mobile-patients/src/utils/dateUtil';
import { getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription } from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import {
  EPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';

import { getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosticPrescription } from '@aph/mobile-patients/src/graphql/types/getSDLatestCompletedCaseSheet';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { ConsultProgressBar } from '@aph/mobile-patients/src/components/ConsultRoom/Components/ConsultProgressBar';
import { getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { RescheduleCancelPopup } from '@aph/mobile-patients/src/components/Consult/RescheduleCancelPopup';
import { CancelAppointmentPopup } from '@aph/mobile-patients/src/components/Consult/CancelAppointmentPopup';
import { CancelReasonPopup } from '@aph/mobile-patients/src/components/Consult/CancelReasonPopup';
import { CheckReschedulePopup } from '@aph/mobile-patients/src/components/Consult/CheckReschedulePopup';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { FollowUpChatGuideLines } from '@aph/mobile-patients/src/components/Consult/Components/FollowUpChatGuideLines';
import { ChatDisablePrompt } from '@aph/mobile-patients/src/components/Consult/Components/ChatDisablePrompt';
import { DiagnosticAddToCartEvent } from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE } from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import {
  postDoctorConsultEvent,
  postDoctorConsultEventVariables,
} from '../../graphql/types/postDoctorConsultEvent';
import { postCleverTapUploadPrescriptionEvents } from '@aph/mobile-patients/src/components/UploadPrescription/Events';
import Pdf from 'react-native-pdf';
import {
  createVonageSessionToken,
  createVonageSessionTokenVariables,
} from '../../graphql/types/createVonageSessionToken';
import { ChatBotPopup } from '@aph/mobile-patients/src/components/Consult/Components/ChatBotPopup';
import useOpenTokSpeedTest from '@aph/mobile-patients/src/helpers/useOpenTokSpeedTest';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

interface OpentokStreamObject {
  connection: {
    connectionId: string;
    creationTime: string;
    data: string;
  };
  connectionId: string;
  creationTime: string;
  hasAudio: boolean;
  hasVideo: boolean;
  height: number;
  name: string;
  sessionId: string;
  streamId: string;
  videoType: 'camera' | 'screen';
  width: number;
}

type OptntokChangeProp = {
  changedProperty: string;
  newValue: string;
  oldValue: boolean;
  stream: OpentokStreamObject;
};

type OpentokError = {
  code: string | number;
  message: string;
};

const { ExportDeviceToken } = NativeModules;
const { height, width } = Dimensions.get('window');

const timer: number = 900;
let timerId: any;
let reconnectTimerId: any;
let appointmentDiffMinTimerId: any;
var networkCheckInterval: any = [];
let notificationTimerId: any;
let notificationIntervalId: any;
let notify_async_key = 'notify_async';
let joinTimerId: any;
let diffInHours: number;
let rescheduleInitiatedBy: string;
let callhandelBack: boolean = true;
// let jdCount: any = 1;          // For now jd is assigned from backend
let isJdAllowed: boolean = true;
let abondmentStarted = false;
let jdAssigned: boolean = false;
const bottomBtnContainerWidth = 267;
const maxRetryAttempt: number = 15;
let currentRetryAttempt: number = 1;
let savedTime: any;
let currentTime: any;

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

const { text } = theme.viewStyles;
const { LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  rescheduleTextStyles: {
    ...theme.viewStyles.yellowTextStyle,
    marginVertical: 10,
    textAlign: 'center',
  },
  claimStyles: {
    flex: 0.5,
    marginLeft: 5,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
  rescheduletyles: {
    flex: 0.5,
    marginRight: 5,
    marginLeft: 8,
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
  gotItStyles: {
    height: 60,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  mainView: {
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 10,
    ...theme.viewStyles.shadowStyle,
  },
  displayId: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
    paddingBottom: 4,
    letterSpacing: 0.33,
  },
  separatorStyle: {
    backgroundColor: '#02475b',
    opacity: 0.2,
    height: 0.5,
  },
  networkTestIcon: {
    marginRight: -20,
    height: 20,
    width: 25,
    alignSelf: 'flex-end',
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 5,
    paddingHorizontal: 20,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: theme.colors.LIGHT_BLUE,
  },
  doctorSpecialityStyle: {
    paddingTop: 0,
    paddingBottom: 12,
    ...theme.fonts.IBMPlexSansRegular(11),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 15,
  },
  timeStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SKY_BLUE,
    marginBottom: 11,
    paddingHorizontal: 20,
  },
  imageView: {
    width: 80,
    height: 80,
    marginLeft: 20,
    borderRadius: 40,
    backgroundColor: theme.colors.CARD_BG,
    ...theme.viewStyles.shadowStyle,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  chatDisabledContainer: {
    marginVertical: 20,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
  },
  chatDisabledHeader: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHERPA_BLUE),
    textAlign: 'center',
    marginBottom: 10,
  },
  callHeaderView: {
    ...theme.viewStyles.shadowStyle,
    justifyContent: 'center',
    marginBottom: 15,
  },
  joinRoomDescriptionText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(13),
    width: '45%',
  },
  callHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joinBtn: {
    width: 73,
    height: 40,
  },
  centerTxt: {
    ...text('M', 15, LIGHT_BLUE),
    textAlign: 'center',
    marginTop: 15,
  },
  textInputContainerStyles: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingBottom: 15,
  },
  inputMainContainer: {
    width: width,
    minHeight: 66,
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
  },
  inputStyles: {
    marginLeft: 20,
    marginTop: 5,
    width: width - 130,
    ...theme.fonts.IBMPlexSansMedium(16),
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  sendButtonStyles: {
    width: 50,
    height: 50,
    position: 'absolute',
    right: 5,
    bottom: 30,
  },
  uploadButtonStyles: {
    width: 65,
    height: 60,
    position: 'absolute',
    zIndex: 3,
    left: 5,
    bottom: 20,
    alignItems: 'center',
    paddingVertical: 5,
  },
  MsgCont: {
    backgroundColor: 'transparent',
    width: 282,
    borderRadius: 10,
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  iconCont: {
    width: 32,
    height: 32,
    bottom: 0,
    position: 'absolute',
    left: 0,
  },
  iconStyle: {
    width: 32,
    height: 32,
    bottom: 0,
    position: 'absolute',
    left: 0,
  },
  MsgTextCont: {
    width: 244,
    backgroundColor: '#fff',
    marginLeft: 38,
    borderRadius: 10,
    marginBottom: 4,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  MsgText: {
    marginTop: 12,
    lineHeight: 22,
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(15),
    marginBottom: 5,
  },
  stickyButtonCont: {
    paddingHorizontal: 0,
    marginBottom: 4,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
  buttonStyle: {
    marginVertical: 5,
    backgroundColor: '#fff',
    ...theme.viewStyles.cardViewStyle,
  },
  timeStamp: {
    color: theme.colors.BORDER_BOTTOM_COLOR,
    marginLeft: 27,
    textAlign: 'right',
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 24,
    letterSpacing: 0.04,
    marginTop: 5,
  },
  joinBtnTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW),
  },
  headerShadowView: {
    borderBottomWidth: 0,
    zIndex: 100,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  headerView: {
    borderBottomWidth: 0,
    zIndex: 100,
    borderRadius: 0,
  },
  calenderIcon: {
    width: 20,
    height: 22,
  },
  callBottomButtonsStyle: {
    ...theme.viewStyles.cardViewStyle,
    position: 'absolute',
    left: width / 2 - bottomBtnContainerWidth / 2,
    bottom: 20,
    width: bottomBtnContainerWidth,
    zIndex: 1000,
    backgroundColor: theme.colors.CALL_LIGHT_GRAY,
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 7,
  },
  disconnectViewStyle: {
    backgroundColor: theme.colors.APP_RED,
    height: '100%',
    width: bottomBtnContainerWidth / 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  endCallIcon: {
    width: 32,
    height: 12,
  },
  cameraIcon: {
    width: 32,
    height: 28,
  },
  muteActiveIcon: {
    width: 23,
    height: 32,
  },
  muteInactiveIcon: {
    width: 28,
    height: 31,
  },
  videoActiveIcon: {
    width: 32,
    height: 22,
  },
  videoInactiveIcon: {
    width: 30,
    height: 30,
  },
  btnActionContainer: {
    width: bottomBtnContainerWidth / 4,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToReturnToCallView: {
    ...theme.viewStyles.cardViewStyle,
    width: width,
    height: 44,
    backgroundColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 0,
    zIndex: 1,
  },
  tapText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.WHITE),
  },
  disableVideoSubscriber: {
    ...theme.viewStyles.cardViewStyle,
    position: 'absolute',
    right: 20,
    width: 95,
    height: 120,
    zIndex: 1000,
    borderRadius: 12,
    backgroundColor: '#e1e1e1',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledVideoAudioText: {
    ...theme.viewStyles.text('SB', 10, theme.colors.APP_RED),
    textAlign: 'center',
  },
  audioDisableContainer: {
    width: 85,
    alignSelf: 'center',
    backgroundColor: theme.colors.CALL_BG_GRAY,
    borderRadius: 4,
    paddingVertical: 2,
    marginTop: 'auto',
  },
  userThumbnailView: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    top: height / 2 - 81,
    width: width,
  },
  userThumbnailIcon: {
    width: 90,
    height: 132,
  },
  connectingText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SEARCH_UNDERLINE_COLOR),
    textAlign: 'center',
    bottom: 115,
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  connectingDoctorName: {
    position: 'absolute',
    marginHorizontal: 20,
    width: width - 40,
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(20),
    textAlign: 'center',
    left: 0,
    zIndex: 1001,
  },
  connectingTextStyle: {
    ...theme.viewStyles.text('SB', 12, theme.colors.SEARCH_UNDERLINE_COLOR),
    marginTop: 10,
    position: 'absolute',
    zIndex: 1,
    textAlign: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  subscriberConnectedView: {
    left: 0,
    right: 0,
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  connectedDoctorName: {
    ...theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE),
    textAlign: 'center',
  },
  subscriberConnectedInnerView: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.CAROUSEL_INACTIVE_DOT,
    borderRadius: 8,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorStatusContainer: {
    bottom: 115,
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  doctorStatusInnerContainer: {
    backgroundColor: theme.colors.CALL_BG_GRAY,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  headerText: {
    marginHorizontal: 5,
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 17,
    color: '#01475B',
    marginBottom: 10,
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  externalMeetingLinkContainer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    maxWidth: '85%',
  },

  externalMeetingLinkImage: {
    alignSelf: 'center',
    width: 78,
    height: 58,
    marginTop: 15,
    marginBottom: 11,
  },
  externalMeetingLinkTextContainer: {
    backgroundColor: theme.colors.WHITE,
    marginLeft: 38,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },

  externalMeetingLinkText: {
    ...theme.viewStyles.text('M', 15, theme.colors.WHITE),
    textAlign: 'center',
  },
  externalMeetingLinkSubText: {
    ...theme.viewStyles.text('M', 15, theme.colors.WHITE),
    textAlign: 'center',
    marginVertical: 12,
  },
  externalMeetingLinkCTAWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  externalMeetingLinkMeetingCTAContainer: {
    backgroundColor: theme.colors.WHITE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  exeternalMeetingLinkMeetingCTAText: {
    ...theme.viewStyles.text('M', 11, theme.colors.APP_YELLOW),
    textTransform: 'uppercase',
  },
  externalMeetingLinkTnC: {
    ...theme.viewStyles.text('M', 8, theme.colors.WHITE),
    marginVertical: 9,
  },
  publisherStyles: {
    position: 'absolute',
    top: 44,
    right: 20,
    width: 1,
    height: 1,
    zIndex: 1000,
  },
  callingView: {
    position: 'absolute',
    left: 0,
    width: width,
    height: 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  manageCTAView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtn: {
    width: 68,
    height: 24,
    borderRadius: 5,
    right: 0,
  },
  messageContainer: {
    backgroundColor: '#0087ba',
    marginLeft: 38,
    borderRadius: 10,
  },
  messageText: {
    color: '#ffffff',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 16,
    ...theme.fonts.IBMPlexSansMedium(15),
    textAlign: 'left',
  },
  messageTimeText: {
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 4,
    textAlign: 'right',
    ...theme.fonts.IBMPlexSansMedium(10),
  },
  transparentView: { backgroundColor: 'transparent', height: 4, width: 20 },
  rescheduleView: {
    backgroundColor: theme.colors.WHITE,
    width: 244,
    height: 354,
    borderRadius: 10,
    marginBottom: 4,
    marginLeft: 38,
    ...theme.viewStyles.shadowStyle,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  rescheduleBtn: {
    flex: 0.6,
    marginLeft: 16,
    marginRight: 5,
    backgroundColor: theme.colors.WHITE,
    borderWidth: 2,
    borderColor: theme.colors.LIGHT_ORANGE,
  },
  followUpView: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginVertical: 2,
    alignSelf: 'flex-start',
  },
  prescriptionView: {
    width: 244,
    backgroundColor: theme.colors.CHAT_TILE_BG,
    marginLeft: 38,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
    height: 230,
  },
  prescriptionText: {
    marginStart: 10,
    marginVertical: 12,
    color: theme.colors.WHITE,
    lineHeight: 22,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  pdfView: {
    width: 220,
    height: 110,
    alignSelf: 'center',
  },
  pdfThumbnail: {
    width: 216,
    height: 115,
  },
  stickyBottomView: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    paddingTop: 3,
  },
  prescTimeText: {
    color: theme.colors.BORDER_BOTTOM_COLOR,
    textAlign: 'right',
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 24,
    letterSpacing: 0.04,
  },
  autoGenText: {
    ...theme.viewStyles.text('M', 10, theme.colors.LIGHT_BLUE),
    paddingStart: 16,
    paddingTop: 6,
  },
  messageView: {
    width: 244,
    backgroundColor: theme.colors.WHITE,
    marginLeft: 38,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  drUnavailableText: {
    lineHeight: 22,
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(15),
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  slotChangeView: {
    width: 244,
    height: 235,
    backgroundColor: theme.colors.WHITE,
    marginLeft: 38,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  slotChangeText: {
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 22,
    ...theme.fonts.IBMPlexSansMedium(15),
    textAlign: 'left',
    marginHorizontal: 16,
    marginTop: 12,
  },
  slotDisableBtn: {
    backgroundColor: theme.colors.WHITE,
    opacity: 0.4,
  },
  changeSlotBtn: {
    flex: 0.6,
    marginLeft: 16,
    marginRight: 5,
    backgroundColor: theme.colors.WHITE,
    borderWidth: 2,
    borderColor: theme.colors.LIGHT_ORANGE,
  },
  messageParentView: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  msgImageView: {
    backgroundColor: 'transparent',
    width: 122,
    height: 122,
    borderRadius: 10,
    marginVertical: 2,
    marginBottom: 4,
    flex: 1,
    marginLeft: 38,
  },
  imgPlaceholder: {
    height: 122,
    width: 122,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  msgImage: {
    resizeMode: 'stretch',
    width: 122,
    height: 122,
  },
  chatTimeText: {
    color: theme.colors.BORDER_BOTTOM_COLOR,
    paddingStart: 16,
    paddingVertical: 4,
    textAlign: 'right',
    ...theme.fonts.IBMPlexSansMedium(10),
  },
  pdfContainer: {
    backgroundColor: theme.colors.WHITE,
    width: 220,
    height: 120,
    borderWidth: 2,
    borderColor: theme.colors.CHAT_BLUE_BORDER,
    marginVertical: 2,
    alignSelf: 'flex-end',
    marginBottom: 4,
    flex: 1,
  },
  pdfInfoView: {
    backgroundColor: theme.colors.DIM_BLACK,
    marginVertical: 3,
    height: 28,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfLogo: {
    height: 20,
    width: 15,
    marginHorizontal: 4,
  },
  apptCompleteView: {
    backgroundColor: theme.colors.WHITE,
    marginLeft: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  presGuideText: {
    color: theme.colors.LIGHT_BLUE,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 16,
    ...theme.fonts.IBMPlexSansMedium(15),
    textAlign: 'left',
  },
  exotelCallView: {
    backgroundColor: theme.colors.WHITE,
    marginLeft: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  msgSubView: {
    backgroundColor: 'white',
    marginLeft: 38,
    borderRadius: 10,
    paddingBottom: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  msgText: {
    color: theme.colors.LIGHT_BLUE,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 3,
    ...theme.fonts.IBMPlexSansMedium(16),
    textAlign: 'left',
  },
  textMsgTime: {
    color: 'rgba(2,71,91,0.6)',
    paddingStart: 36,
    paddingVertical: 4,
    textAlign: 'right',
    ...theme.fonts.IBMPlexSansMedium(10),
  },
  callView: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginVertical: 2,
    alignSelf: 'flex-start',
  },
  callSubView: {
    borderRadius: 10,
    marginVertical: 2,
    paddingVertical: 4,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    marginLeft: 40,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
  },
  callLogo: {
    width: 20,
    height: 20,
  },
  doctorTypingText: {
    width: 250,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: theme.colors.CHAT_BLUE_BORDER,
    paddingVertical: 8,
    paddingStart: 10,
    marginStart: 16,
    justifyContent: 'center',
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 1, 16),
    bottom: Platform.OS == 'android' ? 60 : 100,
    position: 'absolute',
  },
  listView: {
    flex: 1,
    marginBottom: 65,
    backgroundColor: theme.colors.WHITE,
  },
  rescheduleText: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(15),
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  dateSeparator: {
    alignSelf: 'center',
    borderRadius: 10,
    borderColor: theme.colors.PORCELAIN_GRAY,
    borderWidth: 1,
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  automatedMsgView: {
    backgroundColor: theme.colors.WHITE,
    marginLeft: 38,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: theme.colors.PORCELAIN_GRAY,
    width: 244,
  },
  callEndView: {
    borderRadius: 10,
    marginVertical: 2,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: theme.colors.PORCELAIN_GRAY,
    alignItems: 'center',
    paddingStart: 18,
  },
  patientImgView: {
    backgroundColor: 'transparent',
    width: 122,
    height: 122,
    borderRadius: 10,
    marginVertical: 2,
    alignSelf: 'flex-end',
    marginBottom: 4,
    flex: 1,
  },
  patientMsgText: {
    color: theme.colors.WHITE,
    paddingTop: 8,
    paddingBottom: 3,
    paddingHorizontal: 16,
    textAlign: 'left',
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  patientMsgView: {
    backgroundColor: theme.colors.CHAT_TILE_BG,
    borderRadius: 10,
    marginVertical: 2,
    alignSelf: 'flex-end',
    borderColor: theme.colors.CHAT_BLUE_BORDER,
    borderWidth: 2,
    paddingBottom: 6,
  },
  separator: {
    backgroundColor: 'transparent',
    height: 4,
    width: 20,
  },
  assessmentView: {
    padding: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: theme.colors.WHITE,
  },
  symptomName: {
    backgroundColor: theme.colors.MERCURY_GRAY,
    ...theme.viewStyles.text('B', 14, theme.colors.LIGHT_BLUE, 1, 16),
    paddingVertical: 10,
    paddingStart: 14,
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  symptomDetail: {
    backgroundColor: theme.colors.WHITE,
    ...theme.viewStyles.text('B', 14, theme.colors.LIGHT_BLUE, 1, 16),
    paddingVertical: 4,
    paddingStart: 14,
    flexWrap: 'wrap',
  },
  assignmentParentView: {
    width: 300,
    marginStart: 40,
    borderWidth: 1.5,
    borderColor: theme.colors.PORCELAIN_GRAY,
    borderRadius: 10,
    marginVertical: 20,
  },
  proceedBtn: {
    width: 75,
    height: 30,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  assessmentHeading: {
    ...theme.viewStyles.text('M', 14, theme.colors.TUNDORA_GRAY, 1, 16),
  },
  assessmentIcon: { height: 35, width: 35, marginStart: 18, marginTop: 12 },
  startAssessmentView: {
    borderRadius: 10,
    borderTopLeftRadius: 0,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    marginTop: 40,
    marginEnd: 30,
    borderColor: theme.colors.CHAT_TILE_BG,
    backgroundColor: theme.colors.CHAT_TILE_BG,
  },
  symptomValue: {
    ...theme.viewStyles.text('R', 14, theme.colors.LIGHT_BLUE, 1, 16),
  },
  sympDetailView: {
    flexDirection: 'column',
    paddingStart: 20,
    paddingBottom: 6,
  },
  symParentText: { paddingStart: 14, paddingVertical: 4 },
  assessmentText: {
    ...theme.viewStyles.text('M', 15, theme.colors.WHITE, 1, 16),
    width: 250,
    marginBottom: 16,
  },
  assessmentParentView: { flexDirection: 'row', marginBottom: 60, marginStart: 54 },
  snackBar: {
    marginBottom: 100,
    zIndex: 1001,
    backgroundColor: theme.colors.RED,
  },
});

const urlRegEx = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jfif|jpeg|JPEG)/;

export interface ChatRoomProps extends NavigationScreenProps {}
export const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [startCallConnectionUpdateBT, setStartCallConnectionUpdateBT] = useState<number>(0);
  const fromIncomingCall = props.navigation.state.params!.isCall;
  const { isIphoneX } = DeviceHelper();
  const [contentHeight, setContentHeight] = useState(40);
  const [callMinimize, setCallMinimize] = useState<boolean>(false);
  const followChatLimit = AppConfig.Configuration.FollowUp_Chat_Limit || 4;
  const [availableMessages, setavailableMessages] = useState(followChatLimit);
  const [currentCaseSheet, setcurrentCaseSheet] = useState<any>([]);
  const [loginToken, setLoginToken] = useState<string | null>('');
  const [userMobileNumber, setUserMobileNumber] = useState<string | null>('');
  const [displayChatQuestions, setDisplayChatQuestions] = useState<boolean>(false);
  let appointmentData: any = props.navigation.getParam('data');
  const caseSheet = followUpChatDaysCaseSheet(appointmentData.caseSheet);
  const followUpChatDaysCurrentCaseSheet = followUpChatDaysCaseSheet(currentCaseSheet);
  const caseSheetChatDays = g(caseSheet, '0' as any, 'followUpAfterInDays');

  const currentCaseSheetChatDays = g(
    followUpChatDaysCurrentCaseSheet,
    '0' as any,
    'followUpAfterInDays'
  );
  const followupDays = caseSheetChatDays || currentCaseSheetChatDays;
  const followUpAfterInDays = caseSheetChatDays ? Number(caseSheetChatDays) : 7;
  const fromSearchAppointmentScreen =
    props.navigation.getParam('fromSearchAppointmentScreen') || false;
  const disableChat =
    props.navigation.getParam('disableChat') ||
    moment(new Date(appointmentData.appointmentDateTime))
      .add(followUpAfterInDays, 'days')
      .isSameOrBefore(moment(new Date())) ||
    (followUpAfterInDays == 0 && appointmentData?.status == APPOINTMENT_STATUS.COMPLETED);
  const isInFuture = moment(props.navigation.state.params!.data.appointmentDateTime).isAfter(
    moment(new Date())
  );

  const callType = props.navigation.state.params!.callType
    ? props.navigation.state.params!.callType
    : '';

  const prescription = props.navigation.state.params!.prescription
    ? props.navigation.state.params!.prescription
    : '';

  const isVoipCall = props.navigation.state.params!.isVoipCall;

  const flatListRef = useRef<FlatList<never> | undefined | null>();
  const otSessionRef = React.createRef();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(
    isIphoneX() ? height - 166 : Platform.OS === 'ios' ? height - 141 : height - 141
  );
  const status = useRef<STATUS>(appointmentData.status);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [cameraPosition, setCameraPosition] = useState<string>('front');
  const [isPublishAudio, setIsPublishAudio] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [PipView, setPipView] = useState<boolean>(false);
  const [isCall, setIsCall] = useState<boolean>(false);
  const [onSubscribe, setOnSubscribe] = useState<boolean>(false);
  const isAudio = useRef<boolean>(false);
  const callKitAppointmentId = useRef<string>('');
  const [isAudioCall, setIsAudioCall] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showCallAbandmentPopup, setShowCallAbandmentPopup] = useState(false);
  const [showConnectAlertPopup, setShowConnectAlertPopup] = useState(false);
  const [isConsultedWithDoctorBefore, setConsultedWithDoctorBefore] = useState(false);
  const MedicinePrescriptions = currentCaseSheet?.filter(
    (item: any) => item?.medicinePrescription !== null
  );
  const TestPrescriptions = currentCaseSheet?.filter(
    (item: any) => item?.diagnosticPrescription !== null
  );
  const {
    setDoctorJoinedChat,
    doctorJoinedChat,
    locationDetails,
    setLocationDetails,
    diagnosticLocation,
    pharmacyLocation,
  } = useAppCommonData(); //setting in context since we are updating this in NotificationListener
  const {
    addMultipleCartItems: addMultipleTestCartItems,
    addMultipleEPrescriptions: addMultipleTestEPrescriptions,
  } = useDiagnosticsCart();
  const { circleSubPlanId, circleSubscriptionId } = useShoppingCart();
  const { uploadEPrescriptionsToServerCart } = useServerCart();
  const [name, setname] = useState<string>('');
  const [showRescheduleCancel, setShowRescheduleCancel] = useState<boolean>(false);
  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);
  const [showReschedulePopup, setShowReschedulePopup] = useState<boolean>(false);
  const [isCancelVisible, setCancelVisible] = useState<boolean>(false);
  const [talkStyles, setTalkStyles] = useState<object>({
    flex: 1,
    backgroundColor: theme.colors.CALL_BG_GRAY,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  });
  const [subscriberStyles, setSubscriberStyles] = useState<object>({
    width,
    height,
  });
  const [publisherStyles, setPublisherStyles] = useState<object>({
    position: 'absolute',
    top: isIphoneX() ? 70 : 44,
    right: 20,
    width: 95,
    height: 120,
    zIndex: 1000,
    borderRadius: 12,
    ...theme.viewStyles.cardViewStyle,
  });

  const disAllowReschedule =
    g(appointmentData, 'appointmentState') != APPOINTMENT_STATE.AWAITING_RESCHEDULE;

  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [consultStarted, setConsultStarted] = useState<boolean>(true);
  const [callTimer, setCallTimer] = useState<number>(0);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [hideStatusBar, setHideStatusBar] = useState<boolean>(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [chatReceived, setChatReceived] = useState(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const [doctorJoined, setDoctorJoined] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);
  const [userName, setuserName] = useState<string>('');
  const [convertVideo, setConvertVideo] = useState<boolean>(false);
  const [transferAccept, setTransferAccept] = useState<boolean>(false);
  const [transferDcotorName, setTransferDcotorName] = useState<string>('');
  const [bottompopup, setBottompopup] = useState<boolean>(false);
  const [wrongFormat, setwrongFormat] = useState<boolean>(false);
  const [checkReschudule, setCheckReschudule] = useState<boolean>(false);
  const [newRescheduleCount, setNewRescheduleCount] = useState<rescheduleType>();
  const [nextSlotAvailable, setNextSlotAvailable] = useState<string>('');
  const [transferData, setTransferData] = useState<any>([]);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [doctorScheduleId, setDoctorScheduleId] = useState<string>('');
  const callStatus = useRef<string>('');
  const callToastStatus = useRef<string>('');
  const isCallReconnecting = useRef<boolean>(false);
  const maxCallRetryAttempt: number = AppConfig.Configuration.MaxCallRetryAttempt;
  const currentCallRetryAttempt = useRef<number>(1);
  const isErrorToast = useRef<boolean>(false);
  const jrDoctorJoined = useRef<boolean>(false); // using ref to get the current updated values on event listeners
  const [displayUploadHealthRecords, setDisplayUploadHealthRecords] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<ConsultQueueInput>();
  const [isSendAnswers, setisSendAnswers] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [sucesspopup, setSucessPopup] = useState<boolean>(false);
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [fileNamePDF, setFileNamePDF] = useState<string>('');
  const [textChange, setTextChange] = useState(false);
  const [callerAudio, setCallerAudio] = useState<boolean>(true);
  const [callerVideo, setCallerVideo] = useState<boolean>(true);
  const [startAssessment, setStartAssessment] = useState<boolean>(false);
  const [downgradeToAudio, setDowngradeToAudio] = React.useState<boolean>(false);
  const patientJoinedCall = useRef<boolean>(false); // using ref to get the current values on listener events
  const subscriberConnected = useRef<boolean>(false);
  const [secretaryData, setSecretaryData] = useState<any>([]);
  const [callDuration, setCallDuration] = useState<number>(0);
  const hasDrJoined = useRef<boolean>(false);
  hasDrJoined.current = doctorJoinedChat;
  const isConsultStarted = useRef<boolean>(false);
  const makeUpdateAppointmentCall = useRef<boolean>(true);
  const isPaused = subscriberConnected.current
    ? !callerAudio && !callerVideo
      ? 'audio/video'
      : !callerVideo
      ? 'video'
      : !callerAudio
      ? 'audio'
      : ''
    : '';

  const doctorProfileUrl = appointmentData?.doctorInfo?.photoUrl;
  const showDoctorProfile = !subscriberConnected.current || !callerVideo;
  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const acceptedCallMsg = '^^callme`accept^^';
  const endCallMsg = '^^callme`stop^^';
  const startConsultMsg = '^^#startconsult';
  const stopConsultMsg = '^^#stopconsult';
  const doctorTypingOn = 'doctor_typing_on';
  const patientTypingOn = 'patient_typing_on';
  const covertVideoMsg = '^^convert`video^^';
  const covertAudioMsg = '^^convert`audio^^';
  const transferConsultMsg = '^^#transferconsult';
  const rescheduleConsultMsg = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';
  const imageconsult = '^^#DocumentUpload';
  const startConsultjr = '^^#startconsultJr';
  const consultPatientStartedMsg = '^^#PatientConsultStarted';
  const firstMessage = '^^#firstMessage';
  const secondMessage = '^^#secondMessage';
  const languageQue = '^^#languageQue';
  const jdThankyou = '^^#jdThankyou';
  const cancelConsultInitiated = '^^#cancelConsultInitiated';
  const stopConsultJr = '^^#stopconsultJr';
  const callAbandonment = '^^#callAbandonment';
  const appointmentComplete = '^^#appointmentComplete';
  const doctorAutoResponse = '^^#doctorAutoResponse';
  const leaveChatRoom = '^^#leaveChatRoom';
  const patientJoinedMeetingRoom = '^^#patientJoinedMeetingRoom';
  const patientRejectedCall = '^^#PATIENT_REJECTED_CALL';
  const exotelCall = '^^#exotelCall';
  const vitalsCompletedByPatient = '^^#vitalsCompletedByPatient'; // ignore msg used by p-web
  const doctorWillConnectShortly = '^^#DoctorWillConnectShortly';
  const rescheduleOrCancelAppointment = '^^#RescheduleOrCancelAppointment';
  const appointmentStartsInFifteenMin = '^^#appointmentStartsInFifteenMin';
  const appointmentStartsInTenMin = '^^#appointmentStartsInTenMin';
  const sectionHeader = '^^#sectionHeader';
  const followUpChatGuideLines = '^^#followUpChatGuideLines';
  const externalMeetingLink = '^^#externalMeetingLink';
  const jdAutoAssign = '^^#JdInfoMsg';
  const delayedConsultReminder = '^^#DelayReminder';

  const disconnecting = 'Disconnecting...';
  const callConnected = 'Call Connected';
  const connectingCall = 'Connecting Call...';
  const patientId = appointmentData.patientId;
  const doctorId = appointmentData.doctorInfo.id;
  const channel = useRef<string>(`${patientId}-${doctorId}`);
  const { id: apptId } = appointmentData || {};

  let intervalId: any;
  let stoppedTimer: number;
  let thirtySecondTimer: any;
  let minuteTimer: any;

  const { getPatientApiCall } = useAuth();
  const { currentPatient, currentPatientWithHistory } = useAllCurrentPatients();

  const [patientImageshow, setPatientImageshow] = useState<boolean>(false);
  const [showweb, setShowWeb] = useState<boolean>(false);
  const [url, setUrl] = useState('');
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [handlerMessage, setHandlerMessage] = useState('');
  const skipAutoQuestions = useRef<boolean | null | undefined>(null);
  const isProgressBarVisible = useRef<boolean>(true);
  const currentProgressBarPosition = useRef<number>(0);
  const showProgressBarOnHeader = useRef<boolean>(false);
  const isJdAllowedToAssign = useRef<boolean | null | undefined>(null);
  const [appointmentDiffMin, setAppointmentDiffMin] = useState<number>(0);

  const [phoneNumber, setPhoneNumber] = useState<string | null>('');
  const [doctorTyping, setDoctorTyping] = useState<boolean>(false);
  const canPublishTyping = useRef<boolean>(true);
  const typingThrottleTime = 200; //0.2 seconds
  const typingClearTime = 1000; //1 seconds
  const clearTimerId = useRef<NodeJS.Timeout>();
  const { unstable } = useOpenTokSpeedTest();
  const { returnAuthToken } = useAuth();
  let cancelAppointmentTitle = `${string.common.cancelAppointmentBody} ${
    appointmentData?.appointmentType === APPOINTMENT_TYPE.PHYSICAL ? 'Physical' : 'Online'
  } Appointment ${appointmentData?.displayId}. A full refund will be issued.`;
  const isAppointmentStartsInFifteenMin = appointmentDiffMin <= 15 && appointmentDiffMin > 0;
  const isAppointmentExceedsTenMin = appointmentDiffMin <= 0 && appointmentDiffMin > -10;
  type messageType = 'PDF' | 'Text' | 'Image';

  useEffect(() => {
    handleExternalFileShareUpload();

    BackHandler.addEventListener('hardwareBackPress', handleBack);
    AsyncStorage.getItem('phoneNumber').then(setPhoneNumber);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    if (unstable) {
      setSnackbarState(true);
      setHandlerMessage(
        showVideo ? string.vonageToast.unstableVideo : string.vonageToast.unstableAudio
      );
    }
  }, [unstable]);

  const handleExternalFileShareUpload = () => {
    try {
      const sharedFiles = props.navigation.getParam('sharedFilesList');

      if (sharedFiles && sharedFiles.length > 0) {
        let uploadFileTaskPromiseArray: any[] = [];

        sharedFiles.map((file: any) => {
          const taskPromise = new Promise((resolve, reject) => {
            let conetentUri = file.contentUri;
            let fileNameAndExtension = file.fileName;

            let obtainedfFileType = fileNameAndExtension.substring(
              fileNameAndExtension.lastIndexOf('.') + 1
            );

            if (conetentUri.startsWith('content://')) {
              const RNFS = require('react-native-fs');

              const destPath = `${RNFS.TemporaryDirectoryPath}/${fileNameAndExtension}`;
              RNFS.copyFile(conetentUri, destPath)
                .then((path: any) => {
                  RNFetchBlob.fs
                    .stat(destPath)
                    .then((stats) => {
                      let fileSize = stats?.size;
                      if (fileSize > MAX_FILE_SIZE) {
                        Alert.alert(
                          strings.common.uhOh,
                          `Invalid File Size. File size must be less than 25 MB.`
                        );
                        reject(undefined);
                        return;
                      }

                      fileToBase64(destPath).then((fileBase64) => {
                        const random8DigitNumber = Math.floor(Math.random() * 90000) + 20000000;

                        let uploadFileItem = {
                          base64: fileBase64,
                          fileType: obtainedfFileType,
                          title: obtainedfFileType.toUpperCase() + '_' + random8DigitNumber,
                        };

                        resolve(uploadFileItem);
                      });
                    })
                    .catch((err) => {
                      reject(undefined);
                    });
                })
                .catch((err) => {
                  reject(undefined);
                });
            }
          });
          uploadFileTaskPromiseArray.push(taskPromise);
        });

        Promise.all(uploadFileTaskPromiseArray)
          .then((results) => {
            uploadDocument(results, 'Gallery');
          })
          .catch((err) => {});
      }
    } catch (err) {
      Alert.alert(strings.common.uhOh, `Something went wrong.`);
    }
  };

  const onCall = useRef<boolean>(false);

  const handleBack = () => {
    if (onCall.current) {
      minimiseCall();
      return true;
    } else {
      props.navigation.goBack();
      return true;
    }
  };

  useEffect(() => {
    currentCaseSheet && followupDays && analyzeMessages(messages);
  }, [currentCaseSheet]);

  useEffect(() => {
    onCall.current = isCall || isAudioCall;
  }, [isCall, isAudioCall]);

  const minimiseCall = () => {
    setCallMinimize(true);
    setTalkStyles({
      height: 0,
      width: 0,
    });

    setSubscriberStyles({
      width: 0,
      height: 0,
    });

    setPublisherStyles({
      width: 0,
      height: 0,
    });

    setPipView(true);
    setChatReceived(false);
    setHideStatusBar(false);
  };

  const postAppointmentWEGEvent = (
    type:
      | WebEngageEventName.COMPLETED_AUTOMATED_QUESTIONS
      | WebEngageEventName.JD_COMPLETED
      | WebEngageEventName.PRESCRIPTION_RECEIVED
      | WebEngageEventName.SD_CONSULTATION_STARTED
      | WebEngageEventName.SD_VIDEO_CALL_STARTED
      | WebEngageEventName.DOWNLOAD_PRESCRIPTION
      | WebEngageEventName.VIEW_PRESCRIPTION_IN_CONSULT_DETAILS
      | WebEngageEventName.PATIENT_JOINED_CONSULT
      | WebEngageEventName.PATIENT_ENDED_CONSULT,
    data:
      | getAppointmentData_getAppointmentData_appointmentsHistory
      | getPatinetAppointments_getPatinetAppointments_patinetAppointments = appointmentData
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.COMPLETED_AUTOMATED_QUESTIONS]
      | WebEngageEvents[WebEngageEventName.JD_COMPLETED]
      | WebEngageEvents[WebEngageEventName.PRESCRIPTION_RECEIVED]
      | WebEngageEvents[WebEngageEventName.SD_CONSULTATION_STARTED]
      | WebEngageEvents[WebEngageEventName.SD_VIDEO_CALL_STARTED]
      | WebEngageEvents[WebEngageEventName.DOWNLOAD_PRESCRIPTION]
      | WebEngageEvents[WebEngageEventName.VIEW_PRESCRIPTION_IN_CONSULT_DETAILS]
      | WebEngageEvents[WebEngageEventName.PATIENT_JOINED_CONSULT]
      | WebEngageEvents[WebEngageEventName.PATIENT_ENDED_CONSULT] = {
      'Doctor Name': g(data, 'doctorInfo', 'displayName')!,
      'Speciality ID': g(data, 'doctorInfo', 'specialty', 'id')!,
      'Speciality Name': g(data, 'doctorInfo', 'specialty', 'name')!,
      'Doctor Category': g(data, 'doctorInfo', 'doctorType')!,
      'Consult Date Time': moment(g(data, 'appointmentDateTime')).toDate(),
      'Consult Mode': g(data, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Hospital Name': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')!,
      'Hospital City': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'city')!,
      'Consult ID': g(data, 'id')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
    };
    if (type == WebEngageEventName.DOWNLOAD_PRESCRIPTION) {
      (eventAttributes as WebEngageEvents[WebEngageEventName.DOWNLOAD_PRESCRIPTION])[
        'Download Screen'
      ] = 'Chat';
    }

    if (type == WebEngageEventName.PRESCRIPTION_RECEIVED) {
      const location = locationDetails?.city || '';

      (eventAttributes as WebEngageEvents[WebEngageEventName.PRESCRIPTION_RECEIVED])[
        'City'
      ] = location;
    }
    if (type == WebEngageEventName.PATIENT_ENDED_CONSULT) {
      const event = eventAttributes as WebEngageEvents[WebEngageEventName.PATIENT_ENDED_CONSULT];
      event['Doctor ID'] = g(appointmentData, 'doctorInfo', 'id')!;
      event['Doctor Number'] = g(appointmentData, 'doctorInfo', 'mobileNumber');
      event['Doctor Facility ID'] = g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'id'
      );
      event['Doctor Facility'] = g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'name'
      );
      event['Appointment ID'] = g(appointmentData, 'id');
      event['Appointment Display ID'] = g(appointmentData, 'displayId');
      event['Patient Number'] = g(appointmentData, 'patientName');
      event['Session ID'] = sessionId;
      event['Call ID'] = token;
      event['Did doctor Join'] = 'string';
    }
    postCleverTapEvent(type, eventAttributes);
    postWebEngageEvent(type, eventAttributes);
  };

  const consultWebEngageEvents = (
    type:
      | WebEngageEventName.UPLOAD_RECORDS_CLICK_CHATROOM
      | WebEngageEventName.TAKE_PHOTO_CLICK_CHATROOM
      | WebEngageEventName.GALLERY_UPLOAD_PHOTO_CLICK_CHATROOM
      | WebEngageEventName.UPLOAD_PHR_CLICK_CHATROOM
      | CleverTapEventName.CONSULT_REPORT_UPLOAD_IN_CHATROOM,
    Source?: string
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.UPLOAD_RECORDS_CLICK_CHATROOM]
      | WebEngageEvents[WebEngageEventName.TAKE_PHOTO_CLICK_CHATROOM]
      | WebEngageEvents[WebEngageEventName.GALLERY_UPLOAD_PHOTO_CLICK_CHATROOM]
      | WebEngageEvents[WebEngageEventName.UPLOAD_PHR_CLICK_CHATROOM]
      | CleverTapEvents[CleverTapEventName.CONSULT_REPORT_UPLOAD_IN_CHATROOM] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Doctor Name': g(appointmentData, 'doctorInfo', 'displayName')!,
      'Doctor ID': doctorId,
      'Speciality name': g(appointmentData, 'doctorInfo', 'specialty', 'name')!,
      'Speciality ID': g(appointmentData, 'doctorInfo', 'specialty', 'id')!,
      'Hospital Name': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'name'
      )!,
      'Hospital City': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'city'
      )!,
      ...(Source && { Source: Source }),
    };
    postWebEngageEvent(type, eventAttributes);
    if (Source) {
      postCleverTapEvent(type, eventAttributes);
    }
  };

  const openTokWebEngageEvents = (
    type:
      | WebEngageEventName.DOCTOR_SUBSCRIBER_DISCONNECTED
      | WebEngageEventName.DOCTOR_SUBSCRIBER_CONNECTED
      | WebEngageEventName.DOCTOR_SUBSCRIBER_VIDEO_DISABLED
      | WebEngageEventName.DOCTOR_SUBSCRIBER_VIDEO_ENABLED
      | WebEngageEventName.PATIENT_PUBLISHER_STREAM_CREATED
      | WebEngageEventName.PATIENT_PUBLISHER_STREAM_DESTROYED
      | WebEngageEventName.PATIENT_SESSION_CONNECTION_CREATED
      | WebEngageEventName.PATIENT_SESSION_CONNECTION_DESTROYED
      | WebEngageEventName.PATIENT_SESSION_CONNECTED
      | WebEngageEventName.PATIENT_SESSION_DISCONNECTED
      | WebEngageEventName.PATIENT_SESSION_RECONNECTED
      | WebEngageEventName.PATIENT_SESSION_RECONNECTING
      | WebEngageEventName.PATIENT_SESSION_STREAM_CREATED
      | WebEngageEventName.PATIENT_SESSION_STREAM_DESTROYED
      | WebEngageEventName.PATIENT_SESSION_STREAM_PROPERTY_CHANGED,
    data: string
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.DOCTOR_SUBSCRIBER_DISCONNECTED]
      | WebEngageEvents[WebEngageEventName.DOCTOR_SUBSCRIBER_CONNECTED]
      | WebEngageEvents[WebEngageEventName.DOCTOR_SUBSCRIBER_VIDEO_DISABLED]
      | WebEngageEvents[WebEngageEventName.DOCTOR_SUBSCRIBER_VIDEO_ENABLED]
      | WebEngageEvents[WebEngageEventName.PATIENT_PUBLISHER_STREAM_CREATED]
      | WebEngageEvents[WebEngageEventName.PATIENT_PUBLISHER_STREAM_DESTROYED]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_CONNECTION_CREATED]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_CONNECTION_DESTROYED]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_CONNECTED]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_DISCONNECTED]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_RECONNECTED]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_RECONNECTING]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_STREAM_CREATED]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_STREAM_DESTROYED]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_STREAM_PROPERTY_CHANGED] = {
      'Doctor ID': doctorId,
      'Patient ID': patientId,
      'Appointment ID': apptId,
      event: data,
    };
    postWebEngageEvent(type, eventAttributes);
  };

  const openTokErrorWebEngageEvents = (
    type:
      | WebEngageEventName.DOCTOR_SUBSCRIBER_ERROR
      | WebEngageEventName.DOCTOR_SUBSCRIBER_OTRNERROR
      | WebEngageEventName.PATIENT_PUBLISHER_ERROR
      | WebEngageEventName.PATIENT_PUBLISHER_OTRNERROR
      | WebEngageEventName.PATIENT_SESSION_ERROR
      | WebEngageEventName.PATIENT_SESSION_OTRNERROR,
    data: string
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.DOCTOR_SUBSCRIBER_ERROR]
      | WebEngageEvents[WebEngageEventName.DOCTOR_SUBSCRIBER_OTRNERROR]
      | WebEngageEvents[WebEngageEventName.PATIENT_PUBLISHER_ERROR]
      | WebEngageEvents[WebEngageEventName.PATIENT_PUBLISHER_OTRNERROR]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_ERROR]
      | WebEngageEvents[WebEngageEventName.PATIENT_SESSION_OTRNERROR] = {
      'Doctor ID': doctorId,
      'Patient ID': patientId,
      'Appointment ID': apptId,
      error: data,
      'Session ID': sessionId,
    };
    postWebEngageEvent(type, eventAttributes);
  };

  const postConsultCardEvents = (
    type:
      | WebEngageEventName.CHAT_WITH_DOCTOR
      | WebEngageEventName.PATIENT_SENT_CHAT_MESSAGE_POST_CONSULT,
    chatFormat: messageType
  ) => {
    try {
      const eventAttributes:
        | WebEngageEvents[WebEngageEventName.CHAT_WITH_DOCTOR]
        | WebEngageEvents[WebEngageEventName.PATIENT_SENT_CHAT_MESSAGE_POST_CONSULT] = {
        'Doctor Name': g(appointmentData, 'doctorInfo', 'displayName')!,
        'Speciality ID': g(appointmentData, 'doctorInfo', 'specialty', 'id')!,
        'Speciality Name': g(appointmentData, 'doctorInfo', 'specialty', 'name')!,
        'Doctor Category': g(appointmentData, 'doctorInfo', 'doctorType')!,
        'Consult Date Time': moment(g(appointmentData, 'appointmentDateTime')).toDate(),
        'Consult Mode':
          g(appointmentData, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
        'Hospital Name': g(
          appointmentData,
          'doctorInfo',
          'doctorHospital',
          '0' as any,
          'facility',
          'name'
        )!,
        'Hospital City': g(
          appointmentData,
          'doctorInfo',
          'doctorHospital',
          '0' as any,
          'facility',
          'city'
        )!,
        'Consult ID': g(appointmentData, 'id')!,
        'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        Relation: g(currentPatient, 'relation'),
        'Patient Age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Patient Gender': g(currentPatient, 'gender'),
        'Customer ID': g(currentPatient, 'id'),
        'Secretary Name': g(secretaryData, 'name'),
        'Secretary Mobile Number': g(secretaryData, 'mobileNumber'),
        'Doctor Mobile Number': g(appointmentData, 'doctorInfo', 'mobileNumber')!,
        'Doctor ID': g(appointmentData, 'doctorInfo', 'id')!,
        'Display ID': g(appointmentData, 'displayId')!,
        'Chat Format': chatFormat,
      };
      postWebEngageEvent(type, eventAttributes);
      postCleverTapEvent(type, eventAttributes);
    } catch (error) {}
  };

  const fireWebengageEventForCallAnswer = (
    eventName:
      | WebEngageEventName.PATIENT_ANSWERED_CALL
      | WebEngageEventName.PATIENT_DECLINED_CALL
      | WebEngageEventName.PATIENT_MISSED_CALL
      | WebEngageEventName.CALL_DROPPED_UNKNOWN_REASON
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.PATIENT_ANSWERED_CALL]
      | WebEngageEvents[WebEngageEventName.PATIENT_DECLINED_CALL]
      | WebEngageEvents[WebEngageEventName.PATIENT_MISSED_CALL]
      | WebEngageEvents[WebEngageEventName.CALL_DROPPED_UNKNOWN_REASON] = {
      'Patient User ID': g(currentPatient, 'id'),
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient mobile number': g(currentPatient, 'mobileNumber'),
      'Appointment Date time': moment(g(appointmentData, 'appointmentDateTime')).toDate(),
      'Appointment display ID': g(appointmentData, 'displayId')!,
      'Appointment ID': g(appointmentData, 'id')!,
      'Doctor Name': g(appointmentData, 'doctorInfo', 'displayName')!,
      'Speciality Name': g(appointmentData, 'doctorInfo', 'specialty', 'name')!,
      'Speciality ID': g(appointmentData, 'doctorInfo', 'specialty', 'id')!,
      'Doctor Type': g(appointmentData, 'doctorInfo', 'doctorType')!,
      'Mode of Call': isAudioCall ? 'Audio' : 'Video',
      Platform: 'App',
      'Doctor ID': g(appointmentData, 'doctorInfo', 'id'),
      'Doctor Number': g(appointmentData, 'doctorInfo', 'mobileNumber'),
      'Doctor Facility ID': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'id'
      ),
      'Doctor Facility': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'name'
      ),
      'Session ID': sessionId,
      'Call ID': token,
    };
    postCleverTapEvent(eventName, eventAttributes);
    postWebEngageEvent(eventName, eventAttributes);
  };

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    const saveSessionValues = async () => {
      returnAuthToken?.().then(setLoginToken);
      setUserMobileNumber(currentPatient?.mobileNumber);
    };
    saveSessionValues();
    if (Platform.OS === 'android') {
      handleAndroidCallAcceptListeners();
    } else if (Platform.OS === 'ios') {
      handleCallkitEventListeners();
      handleVoipEventListeners();
    }
  }, []);

  useEffect(() => {
    !isVoipCall && !fromIncomingCall && fetchAppointmentData();
    checkAutoTriggerMessagePostAppointmentTime();
    return function cleanup() {
      BackgroundTimer.clearInterval(appointmentDiffMinTimerId);
    };
  }, []);

  const playJoinSound = () => {
    try {
      maxVolume();
      if (joinAudioTrack) {
        joinAudioTrack.play();
      }
    } catch (e) {
      CommonBugFender('playing_callertune__failed', e);
    }
  };

  const playDisconnectSound = () => {
    try {
      maxVolume();
      if (disconnectAudioTrack) {
        disconnectAudioTrack.play();
        AsyncStorage.setItem('leftSoundPlayed', 'true');
      }
    } catch (e) {
      CommonBugFender('playing_callertune__failed', e);
    }
  };

  const stopSound = () => {
    callStatus.current = '';
    callToastStatus.current = '';
    isErrorToast.current = false;
    try {
      setPrevVolume();
      if (joinAudioTrack) {
        joinAudioTrack.stop();
      }
      if (disconnectAudioTrack) {
        disconnectAudioTrack.stop();
      }
    } catch (e) {
      CommonBugFender('playing_callertune__failed', e);
    }
  };

  const checkAutoTriggerMessagePostAppointmentTime = () => {
    const diffMin = Math.ceil(
      moment(appointmentData?.appointmentDateTime).diff(moment(), 'minutes', true)
    );
    setAppointmentDiffMin(diffMin);
    if (diffMin <= 30 && diffMin >= -15) {
      appointmentDiffMinTimerId = BackgroundTimer.setInterval(() => {
        const updatedDiffMin = Math.ceil(
          moment(appointmentData?.appointmentDateTime).diff(moment(), 'minutes', true)
        );
        setAppointmentDiffMin(updatedDiffMin);
        if (updatedDiffMin === -5) {
          const doctorConnectShortly = insertText.filter((obj: any) => {
            return obj.message === doctorWillConnectShortly;
          });
          if (doctorConnectShortly?.length === 0) {
            doctorWillConnectShortlyAutomatedText();
          }
        }
        if (updatedDiffMin === -15) {
          const rescheduleOrCancelAppointmnt = insertText.filter((obj: any) => {
            return obj.message === rescheduleOrCancelAppointment;
          });
          if (rescheduleOrCancelAppointmnt?.length === 0) {
            // rescheduleOrCancelAppointmentAutomatedText();
          }
          BackgroundTimer.clearInterval(appointmentDiffMinTimerId);
        }
      }, 40000);
    }
  };

  useEffect(() => {
    if (!currentPatientWithHistory) {
      getPatientApiCallWithHistory();
    }
  }, [currentPatientWithHistory, displayChatQuestions]);

  useEffect(() => {
    if (!disableChat && status.current !== STATUS.COMPLETED && isInFuture && !fromIncomingCall) {
      callPermissions(() => {}, 'Consult Chat Screen', currentPatient);
    }
  }, []);

  useEffect(() => {
    if (isVoipCall || fromIncomingCall) {
      joinCallHandler();
    }

    if (fromIncomingCall === true) {
      fireWebengageEventForCallAnswer(WebEngageEventName.PATIENT_ANSWERED_CALL);
    } else {
      fireWebengageEventForCallAnswer(WebEngageEventName.PATIENT_DECLINED_CALL);
    }
    updateNumberOfParticipants();
    fetchDoctorDetails();
    isProgressBarVisible.current = appointmentData.status !== STATUS.COMPLETED;
  }, []);

  useEffect(() => {
    messages?.length && analyzeMessages(messages);
  }, [messages]);
  const [guidelinesAdded, setguidelinesAdded] = useState<boolean>(false);

  function analyzeMessages(messages: any) {
    const prescUploadIndex = messages
      .reverse()
      .findIndex(
        (item: any) =>
          item?.id == doctorId &&
          item?.message == followupconsult &&
          item?.transferInfo?.appointmentId == apptId
      );
    messages.reverse();
    const guideLinesIndex = messages
      .reverse()
      .findIndex((item: any) => item?.id == doctorId && item?.message == followUpChatGuideLines);
    messages.reverse();
    if (prescUploadIndex == -1) {
      return;
    } else if (prescUploadIndex != -1 && guideLinesIndex == -1) {
      sendFollowUpChatGuideLines();
      return;
    }
    const lastDocMsgIndex = messages
      .reverse()
      .findIndex((item: any) => item?.id == doctorId && !item?.automatedText);
    messages.reverse();
    let msgsByPatient = 0;
    if (lastDocMsgIndex && lastDocMsgIndex < prescUploadIndex) {
      const latestFollowUpChat = messages.slice(-lastDocMsgIndex);
      msgsByPatient = latestFollowUpChat.filter(
        (item: any) => item?.id == patientId && item?.message != imageconsult
      )?.length;
    } else if (lastDocMsgIndex == 0 || guideLinesIndex == 0) {
      msgsByPatient = 0;
    } else {
      const latestFollowUpChat = messages.slice(-guideLinesIndex);
      msgsByPatient = latestFollowUpChat.filter(
        (item: any) => item?.id == patientId && item?.message != imageconsult
      )?.length;
    }
    msgsByPatient >= 0 && msgsByPatient <= followChatLimit
      ? setavailableMessages(followChatLimit - msgsByPatient)
      : msgsByPatient > followChatLimit
      ? setavailableMessages(0)
      : setavailableMessages(followChatLimit);
  }

  const fetchDoctorDetails = async () => {
    const input = {
      id: doctorId,
    };
    const res = await client.query<getDoctorDetailsById>({
      query: GET_DOCTOR_DETAILS_BY_ID,
      variables: input,
      fetchPolicy: 'no-cache',
    });
    const skipQuestions = res?.data?.getDoctorDetailsById?.skipAutoQuestions;
    isJdAllowedToAssign.current = res?.data?.getDoctorDetailsById?.isJdAllowed;
    skipAutoQuestions.current = skipQuestions;
    checkVitalQuestionsStatus();
    getHistory(0);
  };

  const checkVitalQuestionsStatus = () => {
    const isConsultPending = appointmentData?.status == 'PENDING';
    if (appointmentData.isAutomatedQuestionsComplete) {
      requestToJrDoctor();
      if (
        !disableChat &&
        status.current !== STATUS.COMPLETED &&
        !appointmentData.hideHealthRecordNudge &&
        !isVoipCall &&
        !fromIncomingCall
      ) {
        showAndUpdateNudgeScreenVisibility();
      }
    } else {
      const displayQuestion = isConsultPending ? (skipAutoQuestions.current ? false : true) : false;
      setDisplayChatQuestions(displayQuestion);
    }
  };

  const getPatientApiCallWithHistory = async () => {
    if (!disableChat && status.current !== STATUS.COMPLETED && displayChatQuestions) {
      getPatientApiCall(true);
    }
  };

  const updateNumberOfParticipants = async (status: USER_STATUS = USER_STATUS.ENTERING) => {
    /**
     * This relation is for patient and senior doctor only(not for JD)
     */
    const res: any = await getParticipantsLiveStatus(client, apptId, status);
    if (res?.data?.setAndGetNumberOfParticipants?.NUMBER_OF_PARTIPANTS) {
      const totalParticipants: number = res.data.setAndGetNumberOfParticipants.NUMBER_OF_PARTIPANTS;
      if (totalParticipants > 1) {
        jrDoctorJoined.current = false;
        setDoctorJoined(true);
        setDoctorJoinedChat && setDoctorJoinedChat(true);
        setTextChange(true);
        isConsultStarted.current = true;
        setTimeout(() => {
          setDoctorJoined(false);
        }, 10000);
      } else {
        setTextChange(false);

        AsyncStorage.getItem('startCallConnectionUpdateBT').then((data) => {
          BackgroundTimer.clearInterval(Number.parseInt(data || '0'));
        });
        BackgroundTimer.clearInterval(startCallConnectionUpdateBT);
      }
    }
  };

  useEffect(() => {
    const userName =
      currentPatient && currentPatient.firstName ? currentPatient.firstName.split(' ')[0] : '';
    setuserName(userName);
    setUserAnswers({ appointmentId: apptId });
    if (!disableChat && status.current !== STATUS.COMPLETED) {
      getAppointmentCount();
    }
    getSecretaryData();
  }, []);

  useEffect(() => {
    Platform.OS === 'android' && SoftInputMode.set(SoftInputMode.ADJUST_RESIZE);
    KeepAwake.activate();
    AppState.addEventListener('change', _handleAppStateChange);
  }, []);

  const handleCallkitEventListeners = () => {
    RNCallKeep.addEventListener('answerCall', onAnswerCallAction);
  };

  const handleVoipEventListeners = () => {
    VoipPushNotification.addEventListener('notification', (notification) => {
      // on receive voip push
      const payload = notification && notification.getData();
      if (payload && payload.appointmentId) {
        updateCallKitNotificationReceivedStatus(payload.appointmentId);
        isAudio.current = notification.getData().isVideo ? false : true;
        callKitAppointmentId.current = payload.appointmentId;
      }
    });
  };

  const onAnswerCallAction = () => {
    if (callKitAppointmentId.current === apptId) {
      joinCallHandler();
    } else {
      navigateToAnotherAppointment(
        callKitAppointmentId.current,
        isAudio.current ? 'AUDIO' : 'VIDEO'
      );
    }
  };

  const navigateToAnotherAppointment = async (appointmentId: string, callType: string) => {
    try {
      setLoading!(true);
      const response = await client.query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: { appointmentId },
        fetchPolicy: 'no-cache',
      });
      const appointmentData = response.data?.getAppointmentData?.appointmentsHistory?.[0];
      if (appointmentData?.doctorInfo) {
        setLoading!(false);
        props.navigation.goBack();
        props.navigation.navigate(AppRoutes.ChatRoom, {
          data: appointmentData,
          isCall: true,
          callType,
          prescription: '',
        });
      } else {
        throw new Error('Doctor info is required to process the request.');
      }
    } catch (error) {
      setLoading!(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: string.appointmentDataError,
        CTAs: [
          { text: 'CANCEL', onPress: () => hideAphAlert!(), type: 'white-button' },
          {
            text: 'RETRY',
            onPress: () => {
              hideAphAlert!();
              navigateToAnotherAppointment(appointmentId, callType);
            },
            type: 'orange-button',
          },
        ],
      });
      CommonBugFender(`${AppRoutes.ChatRoom}_Navigate_To_Another_Appointment`, error);
    }
  };

  const handleAndroidCallAcceptListeners = () => {
    Linking.addEventListener('url', (event) => {
      try {
        const deeplinkBaseUrl = 'apollopatients://DoctorCall?';
        const index = event.url.indexOf(deeplinkBaseUrl);
        const isDoctorCall = index > -1;
        const params = event.url?.substring(index + deeplinkBaseUrl.length)?.split('+');
        const appointmentId = params[0];
        const callType = params[1];
        isAudio.current = callType === 'AUDIO';
        if (isDoctorCall) {
          if (appointmentId === apptId) {
            joinCallHandler();
          } else {
            navigateToAnotherAppointment(appointmentId, callType);
          }
        }
      } catch (e) {}
    });
  };

  useEffect(() => {
    if (callType && !fromIncomingCall) {
      AsyncStorage.setItem('callDisconnected', 'false');

      callPermissions(
        () => {
          if (callType === 'VIDEO') {
            isVoipCall || fromIncomingCall ? setOnSubscribe(false) : setOnSubscribe(true);
            isAudio.current = false;
          } else if (callType === 'AUDIO') {
            isVoipCall || fromIncomingCall ? setOnSubscribe(false) : setOnSubscribe(true);
            isAudio.current = true;
            callhandelBack = false;
          }
        },
        'Consult Chat Screen',
        currentPatient
      );
    }
    if (prescription) {
      // write code for opening prescripiton
    }
  }, []);

  const client = useApolloClient();

  const checkNetworkStatus = () => {
    currentTime = new Date().getTime() / 1000; // in seconds
    if (!savedTime || currentTime - savedTime >= 4) {
      /**
       *  In order to work retry logic correctly, we are checking time diff because in few of the cases this
       *  is getting called twice because of event listeners.
       * */
      if (isCallReconnecting.current) {
        if (currentCallRetryAttempt.current < maxCallRetryAttempt) {
          currentCallRetryAttempt.current++;
          // retrying
          getNetStatus()
            .then((status) => {
              if (status) {
                clearNetworkCheckInterval();
                joinCallHandler();
              }
            })
            .catch((e) => {
              CommonBugFender('ChatRoom_checkNetworkStatus', e);
            });
        } else {
          //retry time out
          hideCallUI();
          if (isAudio.current) {
            handleEndAudioCall(false, false);
          } else {
            handleEndCall(false, false);
          }
          clearNetworkCheckInterval();
        }
      } else {
        clearNetworkCheckInterval();
      }
    }
    savedTime = currentTime;
  };

  const clearNetworkCheckInterval = () => {
    networkCheckInterval?.map((intervalId: any) => {
      BackgroundTimer.clearInterval(intervalId);
      networkCheckInterval = [];
    });
  };

  const hideCallUI = () => {
    const zeroDimension = {
      height: 0,
      width: 0,
    };
    setTalkStyles(zeroDimension);
    setSubscriberStyles(zeroDimension);
    setPublisherStyles(zeroDimension);
    setPipView(true);
    setChatReceived(false);
    setHideStatusBar(false);
    resetCurrentRetryAttempt();
  };

  const getSecretaryData = () => {
    getSecretaryDetailsByDoctor(client, doctorId)
      .then((apiResponse: any) => {
        const secretaryDetails = g(apiResponse, 'data', 'data', 'getSecretaryDetailsByDoctorId');
        setSecretaryData(secretaryDetails);
      })
      .catch((error) => {});
  };

  const getAppointmentCount = async () => {
    try {
      const ids = await AsyncStorage.getItem('APPOINTMENTS_CONSULTED_WITH_DOCTOR_BEFORE');
      const appointmentIds: string[] = JSON.parse(ids || '[]');
      if (appointmentIds.find((id) => id == apptId)) {
        return;
      }
      getPastAppoinmentCount(client, doctorId, patientId, channel.current).then((data: any) => {
        const yesCount = g(data, 'data', 'data', 'getPastAppointmentsCount', 'yesCount');
        if (yesCount && yesCount > 0) {
          setShowConnectAlertPopup(false);
          setConsultedWithDoctorBefore(true);
        } else {
          setShowConnectAlertPopup(true);
        }
      });
    } catch (error) {}
  };

  const getUpdateExternalConnect = (connected: boolean) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULTED_WITH_DOCTOR_BEFORE] = {
      ...currentPatient,
      ConsultedBefore: connected ? 'Yes' : 'No',
    };
    postWebEngageEvent(WebEngageEventName.CONSULTED_WITH_DOCTOR_BEFORE, eventAttributes);
    setConsultedWithDoctorBefore(connected);
    setLoading(true);

    updateExternalConnect(client, doctorId, patientId, connected, apptId)
      .then((data) => {
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const InsertMessageToDoctor = (message: string) => {
    SendAutoMatedMessageToDoctorAPI();

    const ciphertext = CryptoJS.AES.encrypt(
      message,
      AppConfig.Configuration.CRYPTO_SECRET_KEY
    ).toString();

    const messageInput: MessageInput = {
      fromId: patientId,
      toId: doctorId,
      eventName: notificationEventName.APPOINTMENT,
      eventId: apptId,
      message: ciphertext,
      status: notificationStatus.UNREAD,
      type: notificationType.CHAT,
    };

    insertMessage(client, messageInput)
      .then((data) => {})
      .catch((error) => {});
  };

  const SendAutoMatedMessageToDoctorAPI = async () => {
    try {
      const saveAppointment = [
        {
          appointmentId: appointmentData.id,
          date: moment().format('YYYY-MM-DD'),
          sendDate: new Date(),
        },
      ];

      const storedAppointmentData = (await AsyncStorage.getItem('saveAppointment')) || '';
      const saveAppointmentData = storedAppointmentData ? JSON.parse(storedAppointmentData) : '';

      if (saveAppointmentData) {
        const result = saveAppointmentData.filter((obj: any) => {
          return obj.appointmentId === appointmentData.id;
        });
        if (result.length > 0) {
          if (result[0].appointmentId === appointmentData.id) {
            const index = saveAppointmentData.findIndex(
              (project: any) => project.appointmentId === appointmentData.id
            );

            const diff = moment.duration(
              moment(saveAppointmentData[index].sendDate).diff(new Date())
            );
            const diffInMins = diff.asMinutes();
            if (diffInMins <= -30) {
              sendDcotorChatMessage();
              saveAppointmentData[index].sendDate = new Date();
              saveAppointmentData[index].date = moment().format('YYYY-MM-DD');
            } else {
              sendAutoMsg();
            }

            AsyncStorage.setItem('saveAppointment', JSON.stringify(saveAppointmentData));
          }
        } else {
          sendDcotorChatMessage();
          saveAppointmentData.push(saveAppointment[0]);
          AsyncStorage.setItem('saveAppointment', JSON.stringify(saveAppointmentData));
        }
      } else {
        sendDcotorChatMessage();
        AsyncStorage.setItem('saveAppointment', JSON.stringify(saveAppointment));
      }
    } catch (error) {}
  };

  const sendAutoMsg = () => {
    const prescUploadIndex = messages
      .reverse()
      .findIndex((item: any) => item?.id == doctorId && item?.message == followupconsult);
    messages.reverse();
    const guideLinesIndex = messages
      .reverse()
      .findIndex((item: any) => item?.id == doctorId && item?.message == followUpChatGuideLines);
    messages.reverse();
    if (prescUploadIndex == -1) {
      return;
    }
    const lastDocMsgIndex = messages
      .reverse()
      .findIndex((item: any) => item?.id == doctorId && item?.sentBy == 'DOCTOR');
    messages.reverse();
    if (guideLinesIndex && prescUploadIndex && lastDocMsgIndex == 0) {
      sendDcotorChatMessage();
    }
  };

  const sendDcotorChatMessage = () => {
    const automatedText = `We have notified the query you raised to ${appointmentData.doctorInfo.displayName}. You will get a response from the doctor at the earliest.`;
    sendMessage(sectionHeader, doctorId, automatedText);
  };

  const setSendAnswers = (val: number) => {
    const s = isSendAnswers;
    s[val] = true;
    setisSendAnswers(s);
  };

  const sendAnswerMessage = (text: { id: string; message: string }) => {
    pubnub.publish(
      {
        channel: channel.current,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
  };
  const setAnswerData = (value: { k: string; v: string[] }[], isQuestionaireComplete?: boolean) => {
    const data = userAnswers || ({} as ConsultQueueInput);
    value.forEach((item) => {
      switch (item.k) {
        case 'gender':
          data.gender = (nameFormater(item.v[0] || '', 'upper') as Gender) || null;
          try {
            const text = {
              id: patientId,
              message: 'Gender:\n' + nameFormater(data.gender || 'Unspecified', 'title'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[9] && sendAnswerMessage(text);
            setSendAnswers(9);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers11_try', error);
          }
          break;
        case 'age':
          data.age = Number(item.v[0]) || null;
          try {
            const text = {
              id: patientId,
              message: 'Age:\n' + (data.age || 'No Idea'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[10] && sendAnswerMessage(text);
            setSendAnswers(10);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers12_try', error);
          }
          break;
        case 'height':
          data.height = item.v[0] !== '' ? item.v.join(' ') : ChatRoom_NotRecorded_Value;
          try {
            const text = {
              id: patientId,
              message: 'Height:\n' + data.height,
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[0] && sendAnswerMessage(text);
            setSendAnswers(0);
            setSendAnswers(6); // this is added here since family history is hidded in questions
            if (currentPatient && currentPatient.gender) {
              setSendAnswers(9);
            }
            if (currentPatient && currentPatient.dateOfBirth) {
              setSendAnswers(10);
            }
          } catch (error) {
            CommonBugFender('ChatRoom_Answers0_try', error);
          }
          break;
        case 'weight':
          data.weight = item.v[0] || ChatRoom_NotRecorded_Value;
          try {
            const text = {
              id: patientId,
              message: 'Weight:\n' + data.weight,
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[1] && sendAnswerMessage(text);
            setSendAnswers(1);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers1_try', error);
          }
          break;
        case 'drug':
          if (item.v[0] === 'No') {
            data.drugAllergies = 'No';
            try {
              const text = {
                id: patientId,
                message: 'Medicine Allergy:\n' + 'No',
                messageDate: new Date(),
              };
              setMessageText('');
              !isSendAnswers[2] && sendAnswerMessage(text);
              setSendAnswers(2);
            } catch (error) {
              CommonBugFender('ChatRoom_Answers2_try', error);
            }
          }
          break;
        case 'drugAllergies':
          data.drugAllergies = item.v[0] || '';
          try {
            const text = {
              id: patientId,
              message: 'Medicine Allergy:\n' + (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[2] && sendAnswerMessage(text);
            setSendAnswers(2);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers3_try', error);
          }
          break;
        case 'dite':
          if (item.v[0] === 'No') {
            data.dietAllergies = 'No';
            try {
              const text = {
                id: patientId,
                message: 'Food Allergy:\n' + data.dietAllergies,
                messageDate: new Date(),
              };
              setMessageText('');
              !isSendAnswers[3] && sendAnswerMessage(text);
              setSendAnswers(3);
            } catch (error) {
              CommonBugFender('ChatRoom_Answers4_try', error);
            }
          }
          break;
        case 'dietAllergies':
          data.dietAllergies = item.v[0] || '';
          try {
            const text = {
              id: patientId,
              message: 'Food Allergy:\n' + (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[3] && sendAnswerMessage(text);
            setSendAnswers(3);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers5_try', error);
          }
          break;
        case 'temperature':
          data.temperature = item.v[0] || ChatRoom_NotRecorded_Value;
          try {
            const text = {
              id: patientId,
              message: 'Temperature:\n' + data.temperature,
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[4] && sendAnswerMessage(text);
            setSendAnswers(4);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers6_try', error);
          }
          break;
        case 'bp':
          data.bp = item.v[1] || item.v[0] || ChatRoom_NotRecorded_Value;
          try {
            const text = {
              id: patientId,
              message: 'Blood Pressure:\n' + data.bp,
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[5] && sendAnswerMessage(text);
            setSendAnswers(5);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers7_try', error);
          }
          break;
        case 'familyHistory':
          data.familyHistory = item.v[0] || '';
          try {
            const text = {
              id: patientId,
              message:
                'Family members suffering suffer from ??? COPD, Cancer, Hypertension or Diabetes:\n' +
                (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[6] && sendAnswerMessage(text);
            setSendAnswers(6);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers8_try', error);
          }
          break;
        case 'lifeStyleSmoke':
          data.lifeStyle = data.lifeStyle
            ? data.lifeStyle.includes('Smoke')
              ? data.lifeStyle
              : 'Smoke: ' + (item.v[0] || '') + '\n' + data.lifeStyle
            : 'Smoke: ' + (item.v[0] || '');
          try {
            const text = {
              id: patientId,
              message: 'Smoke:\n' + (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[7] && sendAnswerMessage(text);
            setSendAnswers(7);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers9_try', error);
          }
          break;
        case 'lifeStyleDrink':
          data.lifeStyle = data.lifeStyle
            ? data.lifeStyle.includes('Drink')
              ? data.lifeStyle
              : data.lifeStyle + '\nDrink: ' + (item.v[0] || '')
            : 'Drink: ' + (item.v[0] || '');
          try {
            const text = {
              id: patientId,
              message: 'Drink: \n' + (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[8] && sendAnswerMessage(text);
            setSendAnswers(8);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers10_try', error);
          }
          break;
      }
    });
    setUserAnswers(data);
    if (isQuestionaireComplete) {
      if (isJdAllowedToAssign.current) {
        doctorWillJoinAutomatedText();
      }
      describeYourMedicalConditionAutomatedText();
    }

    if (isSendAnswers.find((item) => item === false) === undefined) {
      requestToJrDoctor();
    }
  };

  const doctorWillJoinAutomatedText = () => {
    setTimeout(() => {
      const successSteps = [
        `A doctor from ${appointmentData.doctorInfo.displayName}'s team will connect with you to gather details about your health and symptoms. We request your cooperation`,
      ];
      pubnub.publish(
        {
          channel: channel.current,
          message: {
            message: consultPatientStartedMsg,
            automatedText: successSteps,
            id: doctorId,
            isTyping: true,
            messageDate: new Date(),
          },
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {}
      );
    }, 2000);
  };

  const describeYourMedicalConditionAutomatedText = (time?: number) => {
    setTimeout(
      () => {
        const successSteps = [
          'Please describe your medical condition and upload pictures/reports if required. The same will be available for your reference in the health records section',
        ];
        pubnub.publish(
          {
            channel: channel.current,
            message: {
              message: consultPatientStartedMsg,
              automatedText: successSteps,
              id: doctorId,
              isTyping: true,
              messageDate: new Date(),
            },
            storeInHistory: true,
            sendByPost: true,
          },
          (status, response) => {}
        );
      },
      time ? time : 7000
    );
  };

  const showAndUpdateNudgeScreenVisibility = async () => {
    setDisplayUploadHealthRecords(true);
    const input = {
      appointmentId: appointmentData.id,
      hideHealthRecordNudge: true,
    };
    try {
      await client.mutate<updateHealthRecordNudgeStatus, updateHealthRecordNudgeStatusVariables>({
        mutation: UPDATE_HEALTH_RECORD_NUDGE_STATUS,
        variables: input,
      });
    } catch (error) {
      CommonBugFender('ChatRoom_updateHealthRecordNudgeStatus', error);
    }
  };

  const updateStatusOfCall = async (input: CheckCallConnectionInput) => {
    let data;
    try {
      data = await client.mutate<checkCallConnection, checkCallConnectionVariables>({
        mutation: CALL_CONNECTION_UPDATES,
        variables: { CheckCallConnectionInput: input },
      });
    } catch (error) {
      CommonBugFender('ChatRoom_updateCallConnectionStatus', error);
      //console.log(error, JSON.stringify(data));
    }
  };

  const requestToJrDoctor = async () => {
    //new code
    if (userAnswers) {
      addToConsultQueueWithAutomatedQuestions(client, userAnswers)
        .then(({ data }: any) => {
          getPatientApiCall();
          getPatientApiCallWithHistory();
          postAppointmentWEGEvent(WebEngageEventName.COMPLETED_AUTOMATED_QUESTIONS);
          // jdCount = parseInt(
          //   data.data.addToConsultQueueWithAutomatedQuestions.totalJuniorDoctorsOnline,
          //   10
          // );
          isJdAllowed = data.data.addToConsultQueueWithAutomatedQuestions.isJdAllowed;
          jdAssigned = data.data.addToConsultQueueWithAutomatedQuestions.isJdAssigned;
        })
        .catch((e) => {
          CommonBugFender('ChatRoom_addToConsultQueueWithAutomatedQuestions', e);
        })
        .finally(() => startJoinTimer(0));
    }
  };

  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      if (onSubscribe) {
        props.navigation.setParams({ callType: isAudio.current ? 'AUDIO' : 'VIDEO' });
      }
    } else if (nextAppState === 'active') {
      const permissionSettings: string | null = await AsyncStorage.getItem('permissionHandler');
      if (permissionSettings && permissionSettings === 'true') {
        callPermissions(
          () => {
            if (callType) {
              if (callType === 'VIDEO') {
                setOnSubscribe(true);
                isAudio.current = false;
              } else if (callType === 'AUDIO') {
                setOnSubscribe(true);
                isAudio.current = true;
                callhandelBack = false;
              }
              !jrDoctorJoined.current && setDoctorJoinedChat && setDoctorJoinedChat(true);
            } else {
              if (onSubscribe) {
                setOnSubscribe(false);
                setCallAccepted(true);
                setHideStatusBar(true);
                setChatReceived(false);
                Keyboard.dismiss();
                setConvertVideo(false);
                setDowngradeToAudio(false);
                setCallerAudio(true);
                setCallerVideo(true);
                changeVideoStyles();
                setDropdownVisible(false);
                if (token) {
                  PublishAudioVideo();
                } else {
                  makeUpdateAppointmentCall.current = true;
                  APICallAgain(true);
                }
              }
            }
          },
          'Consult Chat Screen',
          currentPatient
        );
        AsyncStorage.removeItem('permissionHandler');
      }
    }
  };

  const updateSessionAPI = () => {
    if (!apiCalled) {
      const input = {
        appointmentId: appointmentData.id,
        requestRole: 'PATIENT',
      };

      CheckDoctorPresentInChat();

      setTimeout(() => {
        setApiCalled(true);
      }, 1000);

      client
        .mutate<updateAppointmentSession, updateAppointmentSessionVariables>({
          mutation: UPDATE_APPOINTMENT_SESSION,
          variables: {
            UpdateAppointmentSessionInput: input,
          },
        })
        .then((sessionInfo: any) => {
          setsessionId(sessionInfo.data.updateAppointmentSession.sessionId);
          settoken(sessionInfo.data.updateAppointmentSession.appointmentToken);
        })
        .catch((e) => {
          CommonBugFender('ChatRoom_updateSessionAPI', e);
        });
    }
  };

  const getAppointmentSessionInfo = () => {
    const input = {
      appointmentId: appointmentData.id,
    };
    client
      .mutate<createVonageSessionToken, createVonageSessionTokenVariables>({
        mutation: CREATE_VONAGE_SESSION_TOKEN,
        variables: input,
      })
      .then((response: any) => {
        startNetworkConnectivityTest(
          response?.data?.createVonageSessionToken.token,
          response?.data?.createVonageSessionToken.sessionId
        );
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_updateSessionAPI', e);
      });
  };

  const CheckDoctorPresentInChat = () => {
    if (status.current === STATUS.COMPLETED) return; // no need to show join button if consultation has been completed

    updateNumberOfParticipants(USER_STATUS.ENTERING);
    pubnub
      .hereNow({
        channels: [channel.current],
        includeUUIDs: true,
      })
      .then((response: HereNowResponse) => {
        const data: any =
          response.channels &&
          response.channels[appointmentData.id] &&
          response.channels[appointmentData.id].occupants;
        const occupancyJrDoctor =
          data &&
          data.length > 0 &&
          data.filter((obj: any) => {
            return obj.uuid === 'JUNIOR' || obj.uuid.indexOf('JUNIOR_') > -1;
          });
        if (occupancyJrDoctor && occupancyJrDoctor.length >= 1) {
          jrDoctorJoined.current = true;
        }
      })
      .catch((error) => {});
  };

  const startInterval = (timer: number) => {
    setConsultStarted(true);
    intervalId = BackgroundTimer.setInterval(() => {
      timer = timer - 1;
      stoppedTimer = timer;
      setRemainingTime(timer);

      if (timer == 0) {
        setRemainingTime(0);
        BackgroundTimer.clearInterval(intervalId);
      }
    }, 1000);
  };

  const startTimer = (timer: number) => {
    timerId = BackgroundTimer.setInterval(() => {
      timer = timer + 1;
      stoppedTimer = timer;
      setCallTimer(timer);
      setCallDuration(timer);

      if (timer == 0) {
        setCallTimer(0);
        BackgroundTimer.clearInterval(timerId);
      }
    }, 1000);
  };

  const stopTimer = () => {
    setCallTimer(0);
    timerId && BackgroundTimer.clearInterval(timerId);
  };

  const startJoinTimer = (timer: number) => {
    joinTimerId = BackgroundTimer.setInterval(() => {
      timer = timer + 1;
      stoppedTimer = timer;
      if (timer === 30) {
        thirtySecondCall();
      } else if (timer === 90) {
        minuteCaller();
      } else if (timer > 100) {
        stopJoinTimer();
      }
      if (timer == 0) {
        BackgroundTimer.clearInterval(joinTimerId);
      }
    }, 1000);
  };

  const stopJoinTimer = () => {
    joinTimerId && BackgroundTimer.clearInterval(joinTimerId);
  };

  const stopInterval = () => {
    if (intervalId) {
      setConsultStarted(false);

      const stopTimer = 900 - stoppedTimer;
      setRemainingTime(stopTimer);
      intervalId && BackgroundTimer.clearInterval(intervalId);
    }
  };
  const setSnackBar = () => {
    setSnackbarState(true);
    setHandlerMessage(string.vonageToast.wentWrong);
  };
  const setSessionReconnectMsg = () => {
    setSnackbarState(true);
    setHandlerMessage(string.vonageToast.reconnect);
  };
  const publisherEventHandlers = {
    streamCreated: (event: string) => {
      postOpentokEvent('Publisher Stream Created', event);
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_PUBLISHER_STREAM_CREATED,
        JSON.stringify(event)
      );
      stopTimer();
      startTimer(0);

      startCallConnectionUpdateFx();
    },
    streamDestroyed: (event: string) => {
      postOpentokEvent('Publisher Stream Destroyed', event);
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_PUBLISHER_STREAM_DESTROYED,
        JSON.stringify(event)
      );
      patientJoinedCall.current = false;
      // subscriberConnected.current = false;
      endVoipCall();
      AsyncStorage.getItem('startCallConnectionUpdateBT').then((data) => {
        BackgroundTimer.clearInterval(Number.parseInt(data || '0'));
      });
      BackgroundTimer.clearInterval(startCallConnectionUpdateBT);
    },
    error: (error: string) => {
      postOpentokError('Publisher Error', error);
      openTokErrorWebEngageEvents(
        WebEngageEventName.PATIENT_PUBLISHER_ERROR,
        JSON.stringify(error)
      );
      setCallMinimize(false);
      AsyncStorage.setItem('callDisconnected', 'true');
      setSnackBar();
    },
    otrnError: (error: string) => {
      postOpentokError('Publisher OTRN Error', error);
      openTokErrorWebEngageEvents(
        WebEngageEventName.PATIENT_PUBLISHER_OTRNERROR,
        JSON.stringify(error)
      );
      setCallMinimize(false);
      AsyncStorage.setItem('callDisconnected', 'true');
      setSnackBar();
    },
  };

  const subscriberEventHandlers = {
    error: (error: string) => {
      postOpentokError('Subscriber Error', error);
      setSnackBar();
      openTokErrorWebEngageEvents(
        WebEngageEventName.DOCTOR_SUBSCRIBER_ERROR,
        JSON.stringify(error)
      );
    },
    connected: (event: string) => {
      postOpentokEvent('Subscriber Connected', event);
      openTokWebEngageEvents(WebEngageEventName.DOCTOR_SUBSCRIBER_CONNECTED, JSON.stringify(event));
      setSnackbarState(false);
      playJoinSound();
      callToastStatus.current = callConnected;

      //Intentionally commentted
      // if (!subscriberConnected.current) {
      //   playJoinSound();
      //   callToastStatus.current = callConnected;
      // }
      subscriberConnected.current = true;
      setTimeout(() => {
        callToastStatus.current = '';
      }, 3000);
    },
    disconnected: (event: string) => {
      postOpentokEvent('Subscriber Disonnected', event);
      callEndWebengageEvent('Network');
      openTokWebEngageEvents(
        WebEngageEventName.DOCTOR_SUBSCRIBER_DISCONNECTED,
        JSON.stringify(event)
      );
      patientJoinedCall.current = false;
      subscriberConnected.current = false;
      endVoipCall();
      AsyncStorage.getItem('startCallConnectionUpdateBT').then((data) => {
        BackgroundTimer.clearInterval(Number.parseInt(data || '0'));
      });
      BackgroundTimer.clearInterval(startCallConnectionUpdateBT);
    },
    otrnError: (error: string) => {
      postOpentokError('Subscriber OTRN Error', error);
      openTokErrorWebEngageEvents(
        WebEngageEventName.DOCTOR_SUBSCRIBER_OTRNERROR,
        JSON.stringify(error)
      );
      setSnackBar();
    },
    videoDisabled: (error: any) => {
      postOpentokEvent('Subscriber Video Disabled', error);
      openTokWebEngageEvents(
        WebEngageEventName.DOCTOR_SUBSCRIBER_VIDEO_DISABLED,
        JSON.stringify(error)
      );
      if (error.reason === 'quality') {
        setSnackbarState(true);
        setHandlerMessage(string.vonageToast.audioFallback);
        setDowngradeToAudio(true);
      }
    },
    videoEnabled: (error: any) => {
      postOpentokEvent('Subscriber Video Enabled', error);
      openTokWebEngageEvents(
        WebEngageEventName.DOCTOR_SUBSCRIBER_VIDEO_ENABLED,
        JSON.stringify(error)
      );
      setDowngradeToAudio(false);
      if (error.reason === 'quality') {
        setSnackbarState(false);
      }
    },
    videoDisableWarning: (error: string) => {
      postOpentokEvent('Subscriber Video Disable Warning', error);
      callToastStatus.current = string.vonageToast.fallbackWarning;
    },
    videoDisableWarningLifted: (error: string) => {
      postOpentokEvent('Subscriber Video Disable Warning Lifted', error);
      callToastStatus.current = '';
      setDowngradeToAudio(false);
    },
  };

  const sessionEventHandlers = {
    error: (error: OpentokError) => {
      postOpentokError('Session Error', error);
      setCallMinimize(false);
      AsyncStorage.setItem('callDisconnected', 'true');
      if (
        [
          'ConnectionDropped',
          'ConnectionFailed',
          'ConnectionRefused',
          'SessionStateFailed',
          'SessionConnectionTimeout',
          1022,
          1006,
          1023,
          1020,
          1021,
        ].includes(error.code)
      ) {
        openTokErrorWebEngageEvents(
          WebEngageEventName.PATIENT_SESSION_ERROR,
          JSON.stringify(error)
        );
        fireWebengageEventForCallAnswer(WebEngageEventName.CALL_DROPPED_UNKNOWN_REASON);
        callEndWebengageEvent('Network');
        setTimeout(() => {
          setSnackbarState(true);
          setHandlerMessage(string.vonageToast.callDisconnected);
        }, 2050);
      } else {
        setSnackBar();
      }
    },
    connectionCreated: (event: string) => {
      postOpentokEvent('Session Connection Created', event);
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_SESSION_CONNECTION_CREATED,
        JSON.stringify(event)
      );
      resetCurrentRetryAttempt();
      setSnackbarState(false);
    },
    connectionDestroyed: (event: string) => {
      postOpentokEvent('Session Connection Destroyed', event);
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_SESSION_CONNECTION_DESTROYED,
        JSON.stringify(event)
      );
      setTimeout(() => {
        AsyncStorage.getItem('callDisconnected').then((data) => {
          if (!JSON.parse(data || 'false')) {
            callEndWebengageEvent('Network');
          }
        });
      }, 2000);
    },
    sessionConnected: (event: string) => {
      postOpentokEvent('Session Connected', event);
      openTokWebEngageEvents(WebEngageEventName.PATIENT_SESSION_CONNECTED, JSON.stringify(event));
      setSnackbarState(false);
      KeepAwake.activate();
    },
    sessionDisconnected: (event: string) => {
      postOpentokEvent('Session Disconnected', event);
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_SESSION_DISCONNECTED,
        JSON.stringify(event)
      );
      endVoipCall();
      eventsAfterConnectionDestroyed();
    },
    sessionReconnected: (event: string) => {
      postOpentokEvent('Session Reconnected', event);
      openTokWebEngageEvents(WebEngageEventName.PATIENT_SESSION_RECONNECTED, JSON.stringify(event));
      setSnackbarState(false);
      resetCurrentRetryAttempt();
      callToastStatus.current = 'Reconnected';
      callStatus.current = 'Connected';
      subscriberConnected.current = true;
      setTimeout(() => {
        callToastStatus.current = '';
      }, 2000);
      KeepAwake.activate();
    },
    sessionReconnecting: (event: string) => {
      postOpentokEvent('Session Reconnecting', event);
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_SESSION_RECONNECTING,
        JSON.stringify(event)
      );
      isCallReconnecting.current = true;
      callStatus.current = 'Reconnecting...';
      callToastStatus.current = 'Reconnecting Call...';
      setSessionReconnectMsg();
      KeepAwake.activate();
    },
    streamCreated: (event: string) => {
      postOpentokEvent('Session Stream Created', event);
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_SESSION_STREAM_CREATED,
        JSON.stringify(event)
      );
    },
    streamDestroyed: (event: string) => {
      postOpentokEvent('Session Stream Destroyed', event);
      callEndWebengageEvent(
        g(appointmentData, 'doctorInfo', 'doctorType') === 'JUNIOR'
          ? 'Junior Doctor'
          : 'Senior Doctor'
      );
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_SESSION_STREAM_DESTROYED,
        JSON.stringify(event)
      );
    },
    streamPropertyChanged: (event: OptntokChangeProp) => {
      postOpentokEvent('Session Stream Property Changed', event);
      callEndWebengageEvent('Network');
      openTokWebEngageEvents(
        WebEngageEventName.PATIENT_SESSION_STREAM_PROPERTY_CHANGED,
        JSON.stringify(event)
      );
      if (event.stream.name !== (g(currentPatient, 'firstName') || 'patient')) {
        const hasAudio = event?.stream?.hasAudio;
        const hasVideo = event?.stream?.hasVideo;
        setCallerAudio(hasAudio);
        setCallerVideo(hasVideo);
        hasVideo && setDowngradeToAudio(false);
      }
    },
    otrnError: (error: string) => {
      postOpentokError('Session OTRN Error', error);
      openTokErrorWebEngageEvents(
        WebEngageEventName.PATIENT_SESSION_OTRNERROR,
        JSON.stringify(error)
      );
      AsyncStorage.getItem('callDisconnected').then((data) => {
        if (!JSON.parse(data || 'false')) {
          setSnackBar();
        }
      });
      setCallMinimize(false);
      AsyncStorage.setItem('callDisconnected', 'true');
    },
  };

  const postOpentokError = (errorName: string, errorData: any) => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.OPENTOK_ERROR_RECEIVED] = {
      'Doctor ID': g(appointmentData, 'doctorInfo', 'id')!,
      'Doctor Name': g(appointmentData, 'doctorInfo', 'displayName'),
      'Doctor Number': g(appointmentData, 'doctorInfo', 'mobileNumber'),
      'Doctor Type': g(appointmentData, 'doctorInfo', 'doctorType'),
      'Doctor Speciality ID': g(appointmentData, 'doctorInfo', 'specialty', 'id'),
      'Doctor Speciality': g(appointmentData, 'doctorInfo', 'specialty', 'name'),
      'Doctor Facility ID': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'id'
      ),
      'Doctor Facility': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'name'
      ),
      'Appointment ID': g(appointmentData, 'id'),
      'Appointment Display ID': g(appointmentData, 'displayId'),
      'Patient Name': g(appointmentData, 'patientName'),
      'Patient Number': g(appointmentData, 'patientName'),
      'Session ID': sessionId,
      'Call ID': token,
      'Error Name': errorName,
      'Error Data': JSON.stringify(errorData),
      reason: errorData?.reason || '',
    };
    postCleverTapEvent(CleverTapEventName.OPENTOK_ERROR_RECEIVED, eventAttributes);
  };

  const postOpentokEvent = (eventName: string, eventData: any) => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.OPENTOK_EVENT_RECEIVED] = {
      'Doctor ID': g(appointmentData, 'doctorInfo', 'id')!,
      'Doctor Name': g(appointmentData, 'doctorInfo', 'displayName'),
      'Doctor Number': g(appointmentData, 'doctorInfo', 'mobileNumber'),
      'Doctor Type': g(appointmentData, 'doctorInfo', 'doctorType'),
      'Doctor Speciality ID': g(appointmentData, 'doctorInfo', 'specialty', 'id'),
      'Doctor Speciality': g(appointmentData, 'doctorInfo', 'specialty', 'name'),
      'Doctor Facility ID': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'id'
      ),
      'Doctor Facility': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'name'
      ),
      'Appointment ID': g(appointmentData, 'id'),
      'Appointment Display ID': g(appointmentData, 'displayId'),
      'Patient Name': g(appointmentData, 'patientName'),
      'Patient Number': g(appointmentData, 'patientName'),
      'Session ID': sessionId,
      'Call ID': token,
      'Event Name': eventName,
      'Event Data': JSON.stringify(eventData),
      reason: eventData?.reason || '',
    };
    postCleverTapEvent(CleverTapEventName.OPENTOK_EVENT_RECEIVED, eventAttributes);
  };

  const resetCurrentRetryAttempt = () => {
    isCallReconnecting.current = false;
    currentCallRetryAttempt.current = 1;
  };

  const callEndWebengageEvent = (
    source: WebEngageEvents[WebEngageEventName.CALL_ENDED]['Ended by'],
    data:
      | getAppointmentData_getAppointmentData_appointmentsHistory
      | getPatinetAppointments_getPatinetAppointments_patinetAppointments = appointmentData
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CALL_ENDED] = {
      'Doctor Name': g(data, 'doctorInfo', 'displayName')!,
      'Speciality ID': g(data, 'doctorInfo', 'specialty', 'id')!,
      'Speciality Name': g(data, 'doctorInfo', 'specialty', 'name')!,
      'Consult Date Time': moment(g(data, 'appointmentDateTime')).toDate(),
      'Consult ID': g(data, 'id')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Display ID': g(data, 'displayId')!,
      'Ended by': source,
      'Call Duration': callDuration,
    };
    postWebEngageEvent(WebEngageEventName.CALL_ENDED, eventAttributes);
  };

  const eventsAfterConnectionDestroyed = () => {
    setTimeout(() => {
      setIsCall(false);
      setIsAudioCall(false);
      stopTimer();
      setCallAccepted(false);
      setHideStatusBar(false);
      setConvertVideo(false);
      setDowngradeToAudio(false);
      KeepAwake.activate();
      setIsPublishAudio(true);
      setShowVideo(true);
      setCameraPosition('front');
      setChatReceived(false);
      setCallerAudio(true);
      setCallerVideo(true);
      if (isCallReconnecting.current) {
        networkCheckInterval.push(
          BackgroundTimer.setInterval(() => {
            checkNetworkStatus();
          }, 5000)
        );
      }
    }, 2000);
  };

  const config: Pubnub.PubnubConfig = {
    origin: 'apollo.pubnubapi.com',
    subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
    publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
    ssl: true,
    uuid: `PATIENT_${patientId}`,
    restore: true,
    keepAlive: true,
    heartbeatInterval: 20,
  };
  const pubnub = new Pubnub(config);
  useEffect(() => {
    const launchDate = AppConfig.Configuration.LONG_CHAT_LAUNCH_DATE;
    const apptDateTime = appointmentData?.appointmentDateTime;
    if (moment(launchDate, 'DD/MM/YYYY') > moment.utc(apptDateTime)) {
      channel.current = appointmentData?.id;
    }
    console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
    console.disableYellowBox = true;
    pubnub.subscribe({
      channels: [channel.current],
    });

    pubnub.addListener({
      status: (statusEvent) => {
        if (statusEvent.category === Pubnub.CATEGORIES.PNConnectedCategory) {
        } else if (statusEvent.operation === Pubnub.OPERATIONS.PNAccessManagerAudit) {
        }
      },
      signal: (payload) => {
        if (payload.message == doctorTypingOn) {
          setDoctorTyping(true);
          clearTimerId.current && clearTimeout(clearTimerId.current);
          clearTimerId.current = setTimeout(() => {
            setDoctorTyping(false);
          }, typingClearTime);
        }
      },
      message: (message) => {
        const messageType = message?.message?.message;

        if (messageType == followupconsult) {
          // setStatus(STATUS.COMPLETED);  //Uncomment it if you are not getting the automated message
          sendFollowUpChatGuideLines();
          postAppointmentWEGEvent(WebEngageEventName.PRESCRIPTION_RECEIVED);
        } else if (messageType == stopConsultJr) {
          postAppointmentWEGEvent(WebEngageEventName.JD_COMPLETED);
        } else if (messageType == startConsultMsg) {
          postAppointmentWEGEvent(WebEngageEventName.SD_CONSULTATION_STARTED);
        } else if (messageType == videoCallMsg && name == 'DOCTOR') {
          postAppointmentWEGEvent(WebEngageEventName.SD_VIDEO_CALL_STARTED);
        }

        messageType === startConsultMsg && setname('DOCTOR');
        messageType === startConsultjr && setname('JUNIOR');
        pubNubMessages(message);
      },
    });

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel.current] });
      pubnub.stop();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      KeepAwake.deactivate();
      Platform.OS === 'android' && SoftInputMode.set(SoftInputMode.ADJUST_PAN);
      minuteTimer && clearTimeout(minuteTimer);
      thirtySecondTimer && clearTimeout(thirtySecondTimer);
      timerId && BackgroundTimer.clearInterval(timerId);
      intervalId && BackgroundTimer.clearInterval(intervalId);
      clearNetworkCheckInterval();
      abondmentStarted = false;
      stopJoinTimer();
      updateNumberOfParticipants(USER_STATUS.LEAVING);
      try {
        AppState.removeEventListener('change', _handleAppStateChange);
      } catch (error) {
        CommonBugFender('ChatRoom_cleanup_try', error);
      }
    };
  }, []);

  const sendFollowUpChatGuideLines = () => {
    if (guidelinesAdded || !followupDays || (followupDays && Number(followupDays) === 0)) {
      return;
    }
    setguidelinesAdded(true);
    const headerText = `If you have further queries related to your consultation, you may reach out to ${
      appointmentData?.doctorInfo?.displayName
    } via texts for the next ${Number(followupDays)} day${Number(followupDays) > 1 ? 's' : ''}.`;
    sendMessage(sectionHeader, doctorId, headerText);
    setTimeout(() => {
      sendMessage(followUpChatGuideLines, doctorId);
    }, 1000);
  };

  const sendMessage = (message: string, id: string, automatedText?: string) => {
    pubnub.publish(
      {
        channel: channel.current,
        message: {
          message: message,
          automatedText: automatedText,
          id: id,
          isTyping: true,
          messageDate: new Date(),
        },
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
  };

  const HereNowPubnub = (message: string) => {
    if (status.current !== STATUS.COMPLETED) return;

    pubnub
      .hereNow({
        channels: [channel.current],
        includeUUIDs: true,
      })
      .then((response: HereNowResponse) => {
        
        //Error prone
        // const data: any = response.channels[appointmentData.id].occupants;

        //Not required anymore
        // const data: any = response.channels[channel.current].occupants;
        // const occupancyDoctor = data.filter((obj: any) => {
        //   return obj.uuid === 'DOCTOR' || obj.uuid.indexOf('DOCTOR_') > -1;
        // });

        InsertMessageToDoctor(message);

      })
      .catch((error) => {
        CommonBugFender('ChatRoom_PUBNUB_PRESENCE', error);
      });
  };

  const [showDoctorNoShowAlert, setShowDoctorNoShowAlert] = useState<boolean>(false);

  const APIForUpdateAppointmentData = (toStopTimer: boolean) => {
    getAppointmentDataDetails(client, appointmentData.id)
      .then(({ data }: any) => {
        try {
          const appointmentSeniorDoctorStarted =
            data.data.getAppointmentData.appointmentsHistory[0].isSeniorConsultStarted;

          appointmentData = data.data.getAppointmentData.appointmentsHistory[0];
          status.current = data.data.getAppointmentData.appointmentsHistory[0].status;
        } catch (error) {
          CommonBugFender('ChatRoom_APIForUpdateAppointmentData_try', error);
        }
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_APIForUpdateAppointmentData', e);
        abondmentStarted = false;
      });
  };

  let insertText: object[] = [];
  const newmessage: {
    message: string;
    duration: string;
  }[] = [];

  const getHistory = (timetoken: number) => {
    setLoading(true);
    pubnub.history(
      {
        channel: channel.current,
        reverse: true,
        count: 100000,
        stringifiedTimeToken: true,
        start: timetoken,
      },
      (status, res) => {
        try {
          const end: any = res.endTimeToken ? res.endTimeToken : 1;

          const msgs = res.messages;
          res.messages.forEach((element, index) => {
            let item = element.entry;
            if (item.prismId) {
              getPrismUrls(client, patientId, item.prismId)
                .then((data: any) => {
                  item.url = (data && data.urls[0]) || item.url;
                })
                .catch((e) => {
                  CommonBugFender('ChatRoom_getPrismUrls', e);
                });
            }
            newmessage[newmessage.length] = item;
          });
          setLoading(false);

          if (messages.length !== newmessage.length) {
            const lastMessage = newmessage[newmessage.length - 1];
            if (lastMessage.message === startConsultMsg) {
              jrDoctorJoined.current = false;
              updateSessionAPI();
              checkingAppointmentDates();
            }
            if (lastMessage.message === startConsultjr) {
              jrDoctorJoined.current = true;
              updateSessionAPI();
              checkingAppointmentDates();
            }

            if (
              (lastMessage.message === 'Audio call ended' ||
                lastMessage.message === 'Video call ended') &&
              lastMessage.duration === '00 : 00'
            ) {
              fireWebengageEventForCallAnswer(WebEngageEventName.PATIENT_MISSED_CALL);
            }

            if (msgs.length == 100) {
              getHistory(end);
              return;
            }

            insertText = newmessage;
            setMessages(newmessage as []);
            checkAutomatedPatientText();
            checkForRescheduleMessage(newmessage);

            setTimeout(() => {
              flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: true });
            }, 1000);
          } else {
            checkAutomatedPatientText();
          }
        } catch (error) {
          CommonBugFender('ChatRoom_getHistory_try', error);
          setLoading(false);
        }
      }
    );
  };

  const checkAutomatedPatientText = () => {
    const result = insertText.filter((obj: any) => {
      return obj.message === consultPatientStartedMsg;
    });
    const startConsultResult = insertText.filter((obj: any) => {
      return obj.message === startConsultMsg;
    });
    if (result.length === 0 && startConsultResult.length === 0) {
      automatedTextFromPatient();
    }
    const diffMin = Math.ceil(
      moment(appointmentData?.appointmentDateTime).diff(moment(), 'minutes', true)
    );
    const doctorConnectShortly = insertText.filter((obj: any) => {
      return obj.message === doctorWillConnectShortly;
    });
    const rescheduleOrCancelAppointmnt = insertText.filter((obj: any) => {
      return obj.message === rescheduleOrCancelAppointment;
    });
    if (doctorConnectShortly?.length === 0 && diffMin <= -5) {
      doctorWillConnectShortlyAutomatedText();
    }
    if (rescheduleOrCancelAppointmnt?.length === 0 && diffMin <= -15) {
      // rescheduleOrCancelAppointmentAutomatedText();
    }
  };

  const automatedTextFromPatient = () => {
    const chatDays = appointmentData?.doctorInfo?.chatDays;
    let step5;

    if (chatDays > 0) {
      step5 = `Follow up via text (valid for ${chatDays} ${chatDays === 1 ? 'day' : 'days'})`;
    } else {
      step5 = `No follow Up via text is provided`;
    }
    let successSteps = [
      'Please follow these simple steps for your appointment: \n',
      '1. Answer a few questions about your medical history\n',
      '2. Be present here in the consult room at the time of appointment \n',
      '3. Wait for the doctor to connect with you via audio/video call\n',
    ];
    if (appointmentData.isAutomatedQuestionsComplete || skipAutoQuestions.current) {
      successSteps = [
        'Please follow these simple steps for your appointment: \n',
        '1. Be present here in the consult room at the time of appointment \n',
        '2. Wait for the doctor to connect with you via audio/video call  \n',
      ];
    }
    pubnub.publish(
      {
        channel: channel.current,
        message: {
          message: consultPatientStartedMsg,
          automatedText: successSteps,
          id: doctorId,
          isTyping: true,
          messageDate: new Date(),
        },
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
    if (skipAutoQuestions.current) {
      if (isJdAllowedToAssign.current) {
        doctorWillJoinAutomatedText();
      }
      describeYourMedicalConditionAutomatedText();
    } else {
      if (appointmentData.isAutomatedQuestionsComplete) {
        const result = insertText.filter((obj: any) => {
          return obj.message === consultPatientStartedMsg;
        });
        const startConsultResult = insertText.filter((obj: any) => {
          return obj.message === startConsultMsg;
        });
        const diffMin = Math.ceil(
          moment(appointmentData?.appointmentDateTime).diff(moment(), 'minutes', true)
        );
        if (result.length === 0 && startConsultResult.length === 0 && diffMin > 0 && diffMin < 30) {
          describeYourMedicalConditionAutomatedText(5000);
        }
      }
    }
  };

  const doctorWillConnectShortlyAutomatedText = () => {
    setTimeout(() => {
      if (
        hasDrJoined.current ||
        status.current === STATUS.COMPLETED ||
        status.current === STATUS.IN_PROGRESS ||
        isConsultStarted.current
      ) {
        return;
      }
      const automatedText = [
        'Please wait while the doctor connects with you shortly. Thanks for your patience.',
      ];
      pubnub.publish(
        {
          channel: channel.current,
          message: {
            message: doctorWillConnectShortly,
            automatedText: automatedText,
            id: doctorId,
            isTyping: true,
            messageDate: new Date(),
          },
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {}
      );
    }, 2000);
  };

  const rescheduleOrCancelAppointmentAutomatedText = () => {
    setTimeout(() => {
      if (
        hasDrJoined.current ||
        status.current === STATUS.COMPLETED ||
        status.current === STATUS.IN_PROGRESS ||
        isConsultStarted.current
      ) {
        return;
      }
      const automatedText = [
        'We are sorry to keep you waiting. You can  reschedule/cancel this appointment by clicking on the icon at the top right of this screen.',
      ];
      pubnub.publish(
        {
          channel: channel.current,
          message: {
            message: rescheduleOrCancelAppointment,
            automatedText: automatedText,
            id: doctorId,
            isTyping: true,
            messageDate: new Date(),
          },
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {}
      );
    }, 4000);
  };

  const thirtySecondCall = () => {
    if (jrDoctorJoined.current == false) {
      const result = insertText.filter((obj: any) => {
        return obj.message === firstMessage;
      });

      const startConsultResult = insertText.filter((obj: any) => {
        return obj.message === startConsultMsg;
      });

      const startConsultjrResult = insertText.filter((obj: any) => {
        return obj.message === startConsultjr;
      });

      const jdThankyouResult = insertText.filter((obj: any) => {
        return obj.message === jdThankyou;
      });

      const stopConsultjrResult = insertText.filter((obj: any) => {
        return obj.message === stopConsultJr;
      });

      const languageQueueResult = insertText.filter((obj: any) => {
        return obj.message === languageQue;
      });

      if (
        result.length === 0 &&
        startConsultResult.length === 0 &&
        startConsultjrResult.length === 0 &&
        jdThankyouResult.length === 0 &&
        stopConsultjrResult.length === 0 &&
        languageQueueResult.length === 0 &&
        !appointmentData.isAutomatedQuestionsComplete &&
        // jdCount > 0 &&
        isJdAllowed === true
      ) {
        pubnub.publish(
          {
            channel: channel.current,
            message: {
              message: firstMessage,
              automatedText: strings.common.jdAssignedMessage.replace(
                /0/gi,
                appointmentData.doctorInfo.displayName
              ),
              id: doctorId,
              isTyping: true,
              messageDate: new Date(),
            },
            storeInHistory: true,
            sendByPost: true,
          },
          (status, response) => {}
        );
      } else {
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
      }
    } else {
      thirtySecondTimer && clearTimeout(thirtySecondTimer);
    }
  };

  const minuteCaller = () => {
    if (jrDoctorJoined.current == false) {
      const result = insertText.filter((obj: any) => {
        return obj.message === secondMessage;
      });

      const startConsultResult = insertText.filter((obj: any) => {
        return obj.message === startConsultMsg;
      });

      const startConsultjrResult = insertText.filter((obj: any) => {
        return obj.message === startConsultjr;
      });

      const jdThankyouResult = insertText.filter((obj: any) => {
        return obj.message === jdThankyou;
      });

      const stopConsultjrResult = insertText.filter((obj: any) => {
        return obj.message === stopConsultJr;
      });

      const languageQueueResult = insertText.filter((obj: any) => {
        return obj.message === languageQue;
      });

      if (
        result.length === 0 &&
        startConsultResult.length === 0 &&
        startConsultjrResult.length === 0 &&
        jdThankyouResult.length === 0 &&
        stopConsultjrResult.length === 0 &&
        languageQueueResult.length === 0 &&
        !appointmentData.isAutomatedQuestionsComplete &&
        // jdCount > 0 &&
        isJdAllowed === true &&
        !!(textChange && !jrDoctorJoined.current) &&
        status.current !== STATUS.COMPLETED &&
        jdAssigned
      ) {
        pubnub.publish(
          {
            channel: channel.current,
            message: {
              message: secondMessage,
              automatedText: `Sorry, but all the members in ${appointmentData.doctorInfo.displayName}???s team are busy right now. We will send you a notification as soon as they are available for collecting your details`,
              id: doctorId,
              isTyping: true,
              messageDate: new Date(),
            },
            storeInHistory: true,
            sendByPost: true,
          },
          (status, response) => {}
        );
      } else {
        minuteTimer && clearTimeout(minuteTimer);
      }
    } else {
      minuteTimer && clearTimeout(minuteTimer);
    }
  };

  const checkWhatsappNotificationAPI = async () => {
    const stopCallingNoticationApi =
      (await AsyncStorage.getItem(notify_async_key + appointmentData.id)) || '';
    if (
      status.current === STATUS.PENDING &&
      stopCallingNoticationApi != appointmentData.id + appointmentData.appointmentDateTime
    ) {
      notificationIntervalId = BackgroundTimer.setInterval(() => {
        const diffMin = moment(appointmentData.appointmentDateTime).diff(moment(), 'minutes', true);
        if (!doctorJoined && diffMin <= 0) {
          BackgroundTimer.clearInterval(notificationIntervalId);
          notificationTimerId = BackgroundTimer.setTimeout(() => {
            setLoading(true);
            client
              .mutate({
                mutation: SEND_PATIENT_WAIT_NOTIFICATION,
                fetchPolicy: 'no-cache',
                variables: {
                  appointmentId: appointmentData.id,
                },
              })
              .then((data) => {
                setLoading(false);
                const notifi_status = g(data.data!, 'sendPatientWaitNotification', 'status');
                if (notifi_status) {
                  AsyncStorage.setItem(
                    notify_async_key + appointmentData.id,
                    appointmentData.id + appointmentData.appointmentDateTime
                  );
                  BackgroundTimer.clearTimeout(notificationTimerId);
                }
              })
              .catch((e) => {
                BackgroundTimer.clearTimeout(notificationTimerId);
                CommonBugFender('ChatRoom_getPrismUrls_uploadDocument', e);
              })
              .finally(() => {
                setLoading(false);
              });
          }, 180000);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    checkWhatsappNotificationAPI();
    return function cleanup() {
      notificationTimerId && BackgroundTimer.clearTimeout(notificationTimerId);
      notificationIntervalId && BackgroundTimer.clearInterval(notificationIntervalId);
    };
  }, []);

  const checkingAppointmentDates = () => {
    try {
      const currentTime = moment(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(
        'YYYY-MM-DD HH:mm:ss'
      );

      const appointmentTime = moment
        .utc(appointmentData.appointmentDateTime)
        .format('YYYY-MM-DD HH:mm:ss');

      const diff = moment.duration(moment(appointmentTime).diff(currentTime));
      diffInHours = diff.asMinutes();
      if (diffInHours > 0) {
      } else {
        diffInHours = diffInHours * 60;
        const startingTime = 900 + diffInHours;
        if (startingTime > 0) {
          startInterval(startingTime);
        }
      }
    } catch (error) {
      CommonBugFender('ChatRoom_checkingAppointmentDates_try', error);
    }
  };

  const [callEndEventDebounce, setCallEndEventDebounce] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const {
    showAphAlert,
    setPrevVolume,
    maxVolume,
    hideAphAlert,
    joinAudioTrack,
    disconnectAudioTrack,
  } = useUIElements();
  const pubNubMessages = (message: Pubnub.MessageEvent) => {
    if (message.message.isTyping) {
      if (message.message.message === audioCallMsg && !patientJoinedCall.current) {
        // if patient has not joined meeting room
        isAudio.current = true;
        setOnSubscribe(true);
        callhandelBack = false;
        // stopCallAbondmentTimer();
        !jrDoctorJoined.current && setDoctorJoinedChat && setDoctorJoinedChat(true);
      } else if (message.message.message === videoCallMsg && !patientJoinedCall.current) {
        // if patient has not joined meeting room
        setOnSubscribe(true);
        callhandelBack = false;
        isAudio.current = false;
        // stopCallAbondmentTimer();
        !jrDoctorJoined.current && setDoctorJoinedChat && setDoctorJoinedChat(true);
      } else if (message.message.message === startConsultMsg) {
        jrDoctorJoined.current = false;
        stopInterval();
        startInterval(timer);
        updateSessionAPI();
        checkingAppointmentDates();
        addMessages(message);
        setDisplayChatQuestions(false);
      } else if (message.message.message === stopConsultJr) {
        stopInterval();
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
        minuteTimer && clearTimeout(minuteTimer);
        setConvertVideo(false);
        setDowngradeToAudio(false);
        addMessages(message);
        //setShowFeedback(true);
        // ************* SHOW FEEDBACK POUP ************* \\
      } else if (message.message.message === stopConsultMsg) {
        stopInterval();
        setConvertVideo(false);
        setDowngradeToAudio(false);
        setShowFeedback(true);
        abondmentStarted = false;
        APIForUpdateAppointmentData(true);
        setTextChange(false);
        try {
          Keyboard.dismiss();
        } catch (error) {}

        // ************* SHOW FEEDBACK POUP ************* \\
      } else if (
        message.message.message === 'Audio call ended' ||
        message.message.message === 'Video call ended'
      ) {
        if (message?.message?.id !== currentPatient?.id) {
          // call has been ended by doctor

          AsyncStorage.getItem('startCallConnectionUpdateBT').then((data) => {
            BackgroundTimer.clearInterval(Number.parseInt(data || '0'));
          });

          // Disconnecting the call as doctor disconnected --------- */
          callStatus.current = disconnecting;
          callToastStatus.current = 'Call has been ended by doctor.';
          isErrorToast.current = true;
          setTimeout(() => {
            hideCallUI();
          }, 2000);

          if (isAudio.current) {
            handleEndAudioCall();
          } else {
            handleEndCall();
          }
          ////------------ */
        }
        //resetCurrentRetryAttempt();
        setTimeout(() => {
          //Intentionally commentted
          // setCallMinimize(false);
          // AsyncStorage.setItem('callDisconnected', 'true');
          // setOnSubscribe(false);
          // callhandelBack = true;
          // setIsCall(false);
          // setIsAudioCall(false);
          addMessages(message);
        }, 2000);
      } else if (message.message.message === covertVideoMsg) {
        setConvertVideo(true);
        // setDowngradeToAudio(false);
      } else if (message.message.message === covertAudioMsg) {
        setConvertVideo(false);
        // setDowngradeToAudio(false);
      } else if (message.message.message === consultPatientStartedMsg) {
        addMessages(message);
      } else if (message.message.message === startConsultjr) {
        jrDoctorJoined.current = true;
        updateSessionAPI();
        checkingAppointmentDates();
        stopJoinTimer();
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
        minuteTimer && clearTimeout(minuteTimer);
        addMessages(message);
      } else if (message.message.message === doctorAutoResponse) {
        addMessages(message);
      } else if (message.message.message === imageconsult) {
        addMessages(message);
      } else if (message.message.message === firstMessage) {
        addMessages(message);
      } else if (message.message.message === secondMessage) {
        addMessages(message);
      } else if (message.message.message === languageQue) {
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
        minuteTimer && clearTimeout(minuteTimer);
        addMessages(message);
      } else if (message.message.message === jdThankyou) {
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
        minuteTimer && clearTimeout(minuteTimer);
        addMessages(message);
      } else if (message.message.message === cancelConsultInitiated) {
        setShowPopup(true);
      } else if (message.message.message === rescheduleConsultMsg) {
        checkForRescheduleMessage(message.message);
        addMessages(message);
      } else if (message.message.message === callAbandonment) {
        setShowCallAbandmentPopup(true);
      } else if (message.message.message === appointmentComplete) {
        setTextChange(false);
        // setStatus(STATUS.COMPLETED);
        status.current = STATUS.COMPLETED;
        APIForUpdateAppointmentData(true);
        setDoctorJoinedChat && setDoctorJoinedChat(false);
        setDoctorJoined(false);
      } else if (message.message.message === leaveChatRoom) {
        setTextChange(false);
        setDoctorJoinedChat && setDoctorJoinedChat(false);
        setDoctorJoined(false);
      } else if (message.message.message === endCallMsg) {
        AsyncStorage.getItem('startCallConnectionUpdateBT').then((data) => {
          BackgroundTimer.clearInterval(Number.parseInt(data || '0'));
        });
        BackgroundTimer.clearInterval(startCallConnectionUpdateBT);

        //Intentionally commented
        //resetCurrentRetryAttempt();
        // callStatus.current = disconnecting;
        // callToastStatus.current = '';
        // subscriberConnected.current = false;
        setTimeout(() => {
          try {
            const event = _.debounce(() => {
              callEndWebengageEvent('Doctor');
            }, 300);
            setCallEndEventDebounce((prevEvent: any) => {
              if (prevEvent.cancel) {
                prevEvent.cancel();
              }
              return event;
            });
            event();
          } catch (error) {}
          //Intentionally commentted
          // setCallMinimize(false);
          // AsyncStorage.setItem('callDisconnected', 'true');
          // AsyncStorage.getItem('leftSoundPlayed').then((data) => {
          //   if (!JSON.parse(data || 'false')) {
          //     stopSound();
          //     playDisconnectSound();
          //   }
          // });
        }, 2000);
      } else if (message.message.message === exotelCall) {
        addMessages(message);
      } else {
        addMessages(message);
      }
    } else {
      addMessages(message);
    }
  };

  const fetchAppointmentData = async () => {
    try {
      const response = await client.query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: { appointmentId: apptId },
        fetchPolicy: 'no-cache',
      });
      setcurrentCaseSheet(response.data?.getAppointmentData?.appointmentsHistory?.[0]?.caseSheet);
    } catch (error) {
      CommonBugFender(`${AppRoutes.ChatRoom}_fetchAppointmentData`, error);
    }
  };

  const addMessages = (message: Pubnub.MessageEvent) => {
    insertText[insertText.length] = message.message;
    setMessages(() => [...(insertText as [])]);
    if (!isCall || !isAudioCall) {
      setChatReceived(true);
    }

    setTimeout(() => {
      flatListRef.current! &&
        flatListRef.current!.scrollToEnd({
          animated: false,
        });
    }, 300);
  };

  const checkForRescheduleMessage = (newmessage: any) => {
    try {
      let result;

      if (newmessage.length > 1) {
        result = newmessage.filter((obj: any) => {
          return obj.message === rescheduleConsultMsg;
        });
      } else {
        result = newmessage;
      }

      if (result) {
        NextAvailableSlot(result[0] ? result[0] : result, 'Transfer', false);
      }
    } catch (error) {
      CommonBugFender('ChatRoom_checkForRescheduleMessage_try', error);
    }
  };

  const keyboardDidShow = (e: KeyboardEvent) => {
    setHeightList(
      isIphoneX()
        ? height - e.endCoordinates.height - 166
        : Platform.OS === 'ios'
        ? height - e.endCoordinates.height - 141
        : height - e.endCoordinates.height - 141
    );

    setTimeout(() => {
      flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: false });
    }, 500);
  };

  const keyboardDidHide = () => {
    setHeightList(isIphoneX() ? height - 166 : Platform.OS === 'ios' ? height - 141 : height - 141);
  };

  const send = (textMessage: string) => {
    try {
      const text = {
        id: patientId,
        message: textMessage,
        messageDate: new Date(),
      };

      setMessageText('');

      pubnub.publish(
        {
          channel: channel.current,
          message: text,
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {
          if (status.statusCode == 200) {
            HereNowPubnub(textMessage);
            // InsertMessageToDoctor(textMessage);
          }
        }
      );
      postChatWebEngEvent('Text', text.message);
    } catch (error) {
      CommonBugFender('ChatRoom_send_try', error);
    }
  };

  const postChatWebEngEvent = (msgType: messageType, message: string) => {
    if (status.current !== STATUS.COMPLETED) {
      postConsultCardEvents(WebEngageEventName.CHAT_WITH_DOCTOR, msgType);
    } else {
      postBackendWebEngage(msgType, message);
      postConsultCardEvents(WebEngageEventName.PATIENT_SENT_CHAT_MESSAGE_POST_CONSULT, msgType);
    }
  };

  const postBackendWebEngage = async (msgType: messageType, message: string) => {
    client
      .mutate<postDoctorConsultEvent, postDoctorConsultEventVariables>({
        mutation: POST_WEB_ENGAGE,
        variables: {
          doctorConsultEventInput: {
            mobileNumber: g(appointmentData, 'doctorInfo', 'mobileNumber'),
            eventName: WebEngageEvent.CONSULT_PATIENT_SENT_MESSAGE,
            consultID: g(appointmentData, 'id')!,
            displayId: String(g(appointmentData, 'displayId')!),
            consultMode: ConsultMode.ONLINE,
            doctorFullName: g(appointmentData, 'doctorInfo', 'displayName')!,
            message,
            chatFormat: msgType,
            source: 'APP',
          },
        },
      })
      .then(() => {})
      .catch((error) => {
        CommonBugFender('postConsultEventToDoctor', error);
      });
  };

  let leftComponent = 0;
  let rightComponent = 0;

  const transferReschedule = (rowData: any, index: number) => {
    return (
      <>
        {rowData.message === transferConsultMsg ? (
          <View
            style={{
              backgroundColor: 'transparent',
              width: 282,
              borderRadius: 10,
              marginVertical: 2,
              alignSelf: 'center',
            }}
          >
            {leftComponent === 1 && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                }}
              >
                <Mascot
                  style={{
                    width: 32,
                    height: 32,
                    bottom: 0,
                    position: 'absolute',
                    left: 0,
                  }}
                />
              </View>
            )}
            <View style={styles.rescheduleView}>
              <Text style={styles.rescheduleText}>Your appointment has been transferred to ???</Text>
              <View style={{ marginVertical: 12, marginHorizontal: 16 }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    marginTop: 24,
                    marginHorizontal: 0,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      color: '#02475b',
                      ...theme.fonts.IBMPlexSansMedium(18),
                      marginLeft: 12,
                      marginTop: 28,
                    }}
                  >
                    Dr. {rowData.transferInfo.doctorName}
                  </Text>
                  <Text
                    style={{
                      color: '#0087ba',
                      ...theme.fonts.IBMPlexSansSemiBold(12),
                      marginLeft: 12,
                      marginTop: 4,
                      letterSpacing: 0.3,
                    }}
                  >
                    {rowData.transferInfo.specilty} | {rowData.transferInfo.experience} YR
                    {Number(rowData.transferInfo.experience) > 1 ? 'S' : ''}
                  </Text>
                  <View
                    style={{
                      marginHorizontal: 12,
                      marginTop: 12,
                      backgroundColor: '#02475b',
                      opacity: 0.3,
                      height: 1,
                    }}
                  />
                  <Text
                    style={{
                      marginHorizontal: 12,
                      marginTop: 11,
                      ...theme.fonts.IBMPlexSansMedium(14),
                      lineHeight: 20,
                      color: '#02475b',
                    }}
                  >
                    {moment
                      .utc(rowData.transferInfo.transferDateTime)
                      .local()
                      .format('Do MMMM, dddd \nhh:mm A')}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      CommonLogEvent(AppRoutes.ChatRoom, 'navigate to choose doctor');
                      props.navigation.navigate(AppRoutes.ChooseDoctor, {
                        data: rowData.transferInfo,
                        patientId: patientId,
                      });
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'left',
                        color: '#fc9916',
                        ...theme.fonts.IBMPlexSansBold(13),
                        lineHeight: 24,
                        marginHorizontal: 12,
                        marginTop: 16,
                        marginBottom: 12,
                      }}
                    >
                      CHOOSE ANOTHER DOCTOR
                    </Text>
                  </TouchableOpacity>
                </View>
                {rowData.transferInfo.photoUrl && rowData.transferInfo.photoUrl.match(urlRegEx) ? (
                  <Image
                    source={{ uri: rowData.transferInfo.photoUrl }}
                    style={{
                      position: 'absolute',
                      width: 48,
                      height: 48,
                      top: 0,
                      right: 12,
                    }}
                  />
                ) : (
                  <DoctorImage
                    style={{
                      position: 'absolute',
                      width: 48,
                      height: 48,
                      top: 0,
                      right: 12,
                    }}
                  />
                )}
              </View>
              <StickyBottomComponent
                style={{
                  paddingHorizontal: 0,
                  backgroundColor: 'transparent',
                  shadowColor: 'transparent',
                }}
              >
                <Button
                  title={'RESCHEDULE'}
                  style={styles.rescheduleBtn}
                  titleTextStyle={{ color: theme.colors.LIGHT_BLUE }}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Chat reschedule clicked');

                    try {
                      NextAvailableSlot(rowData, 'Transfer', false);
                      setTransferData(rowData.transferInfo);
                      setTimeout(() => {
                        flatListRef.current! &&
                          flatListRef.current!.scrollToEnd({ animated: true });
                      }, 200);
                    } catch (error) {
                      CommonBugFender('ChatRoom_RESCHEDULE_try', error);
                    }
                  }}
                />

                <Button
                  title={'ACCEPT'}
                  style={{ flex: 0.4, marginRight: 16, marginLeft: 5 }}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Chat accept transfer clicked');

                    try {
                      const datettimeval = rowData.transferInfo.transferDateTime;
                      const transferdataid = rowData.transferInfo.transferId;

                      const appointmentTransferInput: BookTransferAppointmentInput = {
                        patientId: patientId,
                        doctorId: rowData.transferInfo.doctorId,
                        appointmentDateTime: datettimeval, //rowData.transferInfo.transferDateTime, //appointmentDate,
                        existingAppointmentId: apptId,
                        transferId: transferdataid, //rowData.transferInfo.transferId,
                      };
                      transferAppointmentAPI(rowData, appointmentTransferInput);
                    } catch (error) {
                      CommonBugFender('ChatRoom_ACCEPT_try', error);
                    }
                  }}
                />
              </StickyBottomComponent>
            </View>
            {checkReschudule && reschduleLoadView(rowData, index, 'Transfer')}
          </View>
        ) : (
          <>
            {rowData.message === rescheduleConsultMsg ? (
              <View>{checkReschudule && reschduleLoadView(rowData, index, 'Reschedule')}</View>
            ) : (
              <View>
                {followUpView(rowData, index, 'Followup')}
                {orderMedicine(rowData, index)}
              </View>
            )}
          </>
        )}
      </>
    );
  };

  const followUpView = (rowData: any, index: number, type: string) => {
    return (
      <>
        <View style={styles.followUpView}>
          {leftComponent === 1 && (
            <View
              style={{
                width: 32,
                height: 32,
                bottom: 0,
                position: 'absolute',
                left: 0,
              }}
            >
              <Mascot
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                }}
              />
            </View>
          )}
          <View style={styles.prescriptionView}>
            <Text style={styles.prescriptionText}>{string.appointments.presShared}</Text>
            <Pdf source={{ uri: rowData?.transferInfo?.pdfUrl }} style={styles.pdfView} />
            <StickyBottomComponent
              style={{
                paddingHorizontal: 0,
                marginBottom: 4,
                backgroundColor: 'transparent',
                shadowColor: 'transparent',
              }}
            >
              <Button
                title={'VIEW PRESCRIPTION'}
                style={{ flex: 1, marginRight: 16, marginLeft: 16, marginTop: 5 }}
                onPress={() => {
                  try {
                    postAppointmentWEGEvent(
                      WebEngageEventName.VIEW_PRESCRIPTION_IN_CONSULT_DETAILS
                    );
                    CommonLogEvent(AppRoutes.ChatRoom, 'Navigate to consult details');

                    props.navigation.navigate(AppRoutes.ConsultDetails, {
                      CaseSheet: rowData.transferInfo.appointmentId,
                      DoctorInfo: rowData.transferInfo.doctorInfo,
                      PatientId: appointmentData.patientId,
                      appointmentType: appointmentData.appointmentType,
                      DisplayId: '',
                      BlobName:
                        rowData.transferInfo &&
                        rowData.transferInfo.pdfUrl &&
                        rowData.transferInfo.pdfUrl.split('/').pop(),
                    });
                  } catch (error) {
                    CommonBugFender('ChatRoom_VIEW_try', error);
                  }
                }}
              />
            </StickyBottomComponent>
          </View>
          <Text style={styles.prescTimeText}>{convertChatTime(rowData)}</Text>
        </View>
      </>
    );
  };

  const UserInfo = {
    'Patient UHID': currentPatient?.uhid,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
  };

  const onAddToCart = async () => {
    const prrescriptions = caseSheet?.[0]?.medicinePrescription || MedicinePrescriptions || [];
    const medPrescription = prrescriptions.filter((item: any) => item!.id);
    const isCartOrder = medPrescription?.length === prrescriptions.length;
    const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(
      caseSheet?.[0]?.blobName! || currentCaseSheet?.[0]?.blobName!
    );
    const presToAdd = {
      id: appointmentData?.id,
      appointmentId: appointmentData?.id,
      date: moment(appointmentData?.appointmentDateTime).format('DD MMM YYYY'),
      doctorName: appointmentData?.doctorInfo?.displayName || '',
      forPatient: currentPatient?.firstName || '',
      medicines: (medPrescription || []).map((item: any) => item!.medicineName).join(', '),
      uploadedUrl: docUrl,
    } as EPrescription;
    postWebEngageEvent(WebEngageEventName.ORDER_MEDICINES_IN_CONSULT_ROOM, {
      ...UserInfo,
      'Order Type': isCartOrder ? 'Cart' : 'Non-Cart',
    });

    if (isCartOrder) {
      try {
        setLoading(true);
        let cartItemsToAdd: any[] = [];
        medPrescription?.forEach((item) => {
          cartItemsToAdd.push({
            medicineSKU: item?.id,
            quantity: 1,
          });
        });
        uploadEPrescriptionsToServerCart([presToAdd], cartItemsToAdd);
        setLoading(false);
        postCleverTapUploadPrescriptionEvents('Consult Room', 'Cart');
        props.navigation.push(AppRoutes.ServerCart);
      } catch (error) {
        setLoading(false);
        showAphAlert?.({
          title: string.common.uhOh,
          description: string.common.somethingWentWrong,
        });
        CommonBugFender(`${AppRoutes.ChatRoom}_onAddToCart`, error);
      }
      return;
    }
    uploadEPrescriptionsToServerCart([presToAdd]);
    postCleverTapUploadPrescriptionEvents('Consult Room', 'Non-Cart');
    props.navigation.navigate(AppRoutes.UploadPrescription, {
      ePrescriptionsProp: [presToAdd],
      type: 'E-Prescription',
    });
    postWebEngageEvent(WebEngageEventName.ORDER_MEDICINES_IN_CONSULT_ROOM, {
      ...UserInfo,
      'Order Type': isCartOrder ? 'Cart' : 'Non-Cart',
    });
    postCleverTapEvent(CleverTapEventName.CONSULT_ORDER_MEDICINES_IN_CHATROOM_CLICKED, {
      ...UserInfo,
      'Order Type': isCartOrder ? 'Cart' : 'Non-Cart',
      'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}` || '',
      'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
    });
  };

  function postDiagnosticAddToCart(itemId: string, itemName: string, inclusions: any) {
    const itemType =
      !!inclusions &&
      inclusions?.map((item: any) =>
        item?.count > 1 ? DIAGNOSTICS_ITEM_TYPE.PACKAGE : DIAGNOSTICS_ITEM_TYPE.TEST
      );
    DiagnosticAddToCartEvent(
      itemName,
      itemId,
      0, //add price
      0, //add price
      DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.CONSULT_ROOM,
      itemType?.join(', '),
      undefined,
      currentPatient,
      !!circleSubscriptionId
    );
  }

  const onAddTestsToCart = async () => {
    postWebEngageEvent(WebEngageEventName.BOOK_TESTS_IN_CONSULT_ROOM, UserInfo);
    postCleverTapEvent(CleverTapEventName.CONSULT_BOOK_TESTS_IN_CHATROOM, UserInfo);
    let location: LocationData | null = null;
    setLoading && setLoading(true);

    if (!locationDetails) {
      try {
        location = await doRequestAndAccessLocation();
        location && setLocationDetails!(location);
      } catch (error) {
        setLoading && setLoading(false);
        Alert.alert(
          'Uh oh.. :(',
          'Unable to get location. We need your location in order to add tests to your cart.'
        );
        return;
      }
    }

    const testPrescription = (caseSheet?.[0]?.diagnosticPrescription! ||
      TestPrescriptions?.[0]?.diagnosticPrescription ||
      []) as getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosticPrescription[];
    const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(
      caseSheet?.[0]?.blobName! || currentCaseSheet?.[0]?.blobName!
    );

    if (!testPrescription?.length) {
      Alert.alert('Uh oh.. :(', 'No items are available in your location for now.');
      setLoading && setLoading(false);
      return;
    }
    const presToAdd = {
      id: caseSheet?.[0]?.id || currentCaseSheet?.[0].id,
      date: moment(appointmentData?.appointmentDateTime).format('DD MMM YYYY'),
      doctorName: appointmentData?.doctorInfo?.displayName || '',
      forPatient: (currentPatient && currentPatient.firstName) || '',
      medicines: '',
      uploadedUrl: docUrl,
    } as EPrescription;
    // Adding tests to DiagnosticsCart
    addTestsToCart(
      testPrescription,
      client,
      g(diagnosticLocation || pharmacyLocation || locationDetails || location, 'pincode') || ''
    )
      .then((tests: DiagnosticsCartItem[]) => {
        // Adding ePrescriptions to DiagnosticsCart
        const unAvailableItemsArray = testPrescription?.filter(
          (item) => !tests?.find((val) => val?.name!.toLowerCase() == item?.itemname!.toLowerCase())
        );
        const unAvailableItems = unAvailableItemsArray?.map((item) => item?.itemname)?.join(', ');
        const getItemNames = tests?.map((item) => item?.name)?.join(', ');
        const getItemIds = tests?.map((item) => Number(item?.id))?.join(', ');
        const getInclusionCount = tests?.map((item) => Number(item?.inclusions));
        if (tests?.length) {
          addMultipleTestCartItems?.(tests);
          addMultipleTestEPrescriptions?.([
            {
              ...presToAdd,
              medicines: (tests as DiagnosticsCartItem[])?.map((item) => item?.name)?.join(', '),
            },
          ]);
        }
        if (testPrescription?.length == unAvailableItemsArray?.length) {
          showAphAlert?.({
            title: string.common.uhOh,
            description: string.common.noDiagnosticsAvailable,
            onPressOk: () => {
              _navigateToTestCart();
            },
            onPressOutside: () => {
              _navigateToTestCart();
            },
          });
        } else {
          //in case of if any unavailable items or all are present
          const lengthOfAvailableItems = tests?.length;
          const testAdded = tests?.map((item) => nameFormater(item?.name), 'title').join('\n');
          showAphAlert?.({
            title:
              !!lengthOfAvailableItems && lengthOfAvailableItems > 0
                ? `${lengthOfAvailableItems} ${
                    lengthOfAvailableItems > 1 ? 'items' : 'item'
                  } added to your cart`
                : string.common.uhOh,
            description: unAvailableItems
              ? `Below items are added to your cart: \n${testAdded} \nSearch for the remaining diagnositc tests and add to the cart.`
              : `Below items are added to your cart: \n${testAdded}`,
            onPressOk: () => {
              _navigateToTestCart();
            },
            onPressOutside: () => {
              _navigateToTestCart();
            },
          });
        }
        postDiagnosticAddToCart(getItemIds, getItemNames, getInclusionCount);
        setLoading?.(false);
      })
      .catch((e) => {
        setLoading?.(false);
        handleGraphQlError(e);
      });
  };

  function _navigateToTestCart() {
    hideAphAlert?.();
    props.navigation.push(AppRoutes.AddPatients, { comingFrom: AppRoutes.ConsultDetails });
  }

  const orderMedicine = (rowData: any, index: number) => {
    return (
      <>
        <View style={styles.MsgCont}>
          {leftComponent === 1 && (
            <View style={styles.iconCont}>
              <Mascot style={styles.iconStyle} />
            </View>
          )}
          <View style={styles.MsgTextCont}>
            <Text style={{ ...styles.autoGenText, paddingStart: 0 }}>
              {string.appointments.autoGenerated}
            </Text>
            <Text style={styles.MsgText}>
              {
                'Order Medicines in one click and get free home delivery in 2-4 hours. We also have home sample collections for diagnostic tests.'
              }
            </Text>
            {(caseSheet?.[0]?.medicinePrescription || MedicinePrescriptions?.length > 0) && (
              <Button
                title={'ORDER MEDICINES'}
                titleTextStyle={{ color: '#FC9916' }}
                style={styles.buttonStyle}
                onPress={() => onAddToCart()}
              />
            )}
            {(caseSheet?.[0]?.diagnosticPrescription || TestPrescriptions?.length > 0) && (
              <Button
                title={'BOOK DIAGNOSTIC TESTS'}
                titleTextStyle={{ color: '#FC9916' }}
                style={{ ...styles.buttonStyle, marginBottom: 0 }}
                onPress={() => onAddTestsToCart()}
              />
            )}
          </View>
          <Text style={styles.timeStamp}>{convertChatTime(rowData)}</Text>
        </View>
      </>
    );
  };

  const reschduleLoadView = (rowData: any, index: number, type: string) => {
    return (
      <>
        <View
          style={{
            backgroundColor: 'transparent',
            width: 282,
            borderRadius: 10,
            marginVertical: 2,
            alignSelf: 'flex-start',
          }}
        >
          {leftComponent === 1 && (
            <View
              style={{
                width: 32,
                height: 32,
                bottom: 0,
                position: 'absolute',
                left: 0,
              }}
            >
              <Mascot
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                }}
              />
            </View>
          )}
          <View style={styles.messageView}>
            <Text style={styles.drUnavailableText}>
              {
                "We're sorry that doctor is not available and you have to reschedule this appointment, however you can reschedule it for free."
              }
            </Text>
            <Text
              style={{
                color: '#ffffff',
                marginLeft: 27,
                textAlign: 'right',
                ...theme.fonts.IBMPlexSansMedium(10),
                lineHeight: 24,
                letterSpacing: 0.04,
                marginTop: 0,
                marginRight: 16,
              }}
            >
              {convertChatTime(rowData)}
            </Text>
          </View>
          <View style={styles.slotChangeView}>
            <Text style={styles.slotChangeText}>
              {appointmentData.doctorInfo.displayName} has suggested the below slot for rescheduling
              this appointment
            </Text>
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 9,
                opacity: 0.5,
                height: 2,
                borderStyle: 'dashed',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: '#ffffff',
                overflow: 'hidden',
              }}
            />
            <Text
              style={{
                marginHorizontal: 16,
                marginTop: 9,
                lineHeight: 22,
                ...theme.fonts.IBMPlexSansSemiBold(15),
                color: 'white',
              }}
            >
              {moment(
                type === 'Followup'
                  ? rowData.transferInfo.folloupDateTime
                  : rowData.transferInfo.transferDateTime
              ).format('Do MMMM, dddd \nhh:mm A')}
            </Text>
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 10,
                opacity: 0.5,
                height: 2,
                borderStyle: 'dashed',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: '#ffffff',
                overflow: 'hidden',
              }}
            />
            <StickyBottomComponent style={styles.stickyBottomView}>
              <Button
                title={'CHANGE SLOT'}
                disabledStyle={styles.slotDisableBtn}
                style={styles.changeSlotBtn}
                titleTextStyle={{ color: theme.colors.LIGHT_BLUE }}
                disabled={status != APPOINTMENT_STATE.AWAITING_RESCHEDULE}
                onPress={() => {
                  if (type === 'Followup' || type === 'Reschedule') {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Display Overlay');
                    rescheduleInitiatedBy = REQUEST_ROLES.PATIENT;
                    setTransferData(rowData.transferInfo);
                    setdisplayoverlay(true);
                  }
                }}
              />
              <Button
                disabled={status != APPOINTMENT_STATE.AWAITING_RESCHEDULE}
                title={'ACCEPT'}
                style={{
                  flex: 0.4,
                  marginRight: 16,
                  marginLeft: 5,
                }}
                onPress={() => {
                  try {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Accept button clicked');

                    if (type === 'Followup') {
                      const bookRescheduleInput = {
                        appointmentId: rowData.transferInfo.appointmentId,
                        doctorId: rowData.transferInfo.transferDateTime
                          ? rowData.transferInfo.doctorInfo.id
                          : rowData.transferInfo.doctorId,
                        newDateTimeslot: rowData.transferInfo.folloupDateTime,
                        initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
                        initiatedId: patientId,
                        patientId: patientId,
                        rescheduledId: '',
                      };
                      rescheduleAPI(rowData, bookRescheduleInput);
                    } else if (type === 'Reschedule') {
                      const bookRescheduleInput = {
                        appointmentId: rowData.transferInfo.appointmentId,
                        doctorId: rowData.transferInfo.transferDateTime
                          ? rowData.transferInfo.doctorInfo.id
                          : rowData.transferInfo.doctorId,
                        newDateTimeslot: rowData.transferInfo.transferDateTime,
                        initiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
                        initiatedId: patientId,
                        patientId: patientId,
                        rescheduledId: rowData.transferInfo.reschduleId,
                      };
                      rescheduleAPI(rowData, bookRescheduleInput);
                    } else {
                      const datettimeval = rowData.transferInfo.transferDateTime;
                      const transferdataid = rowData.transferInfo.transferId;

                      const appointmentTransferInput: BookTransferAppointmentInput = {
                        patientId: patientId,
                        doctorId: rowData.transferInfo.doctorId,
                        appointmentDateTime: datettimeval, //rowData.transferInfo.transferDateTime, //appointmentDate,
                        existingAppointmentId: apptId,
                        transferId: transferdataid, //rowData.transferInfo.transferId,
                      };
                      transferAppointmentAPI(rowData, appointmentTransferInput);
                    }
                  } catch (error) {
                    CommonBugFender('ChatRoom_ACCEPT2_try', error);
                  }
                }}
              />
            </StickyBottomComponent>
            <Text
              style={{
                color: '#ffffff',
                marginLeft: 27,
                textAlign: 'right',
                ...theme.fonts.IBMPlexSansMedium(10),
                lineHeight: 24,
                letterSpacing: 0.04,
                marginTop: 55,
                marginRight: 16,
              }}
            >
              {convertChatTime(rowData)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  const openImageZoomViewer = (imageUrl: string, imageName: string) => {
    props.navigation.navigate(AppRoutes.ImageSliderScreen, {
      images: [imageUrl],
      heading: imageName,
    });
  };

  const openPopUp = (rowData: any) => {
    setLoading(true);
    if (rowData.url.match(/\.(pdf)$/) || rowData.fileType === 'pdf') {
      if (rowData.prismId) {
        getPrismUrls(client, patientId, rowData.prismId)
          .then((data: any) => {
            setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch((e) => {
            CommonBugFender('ChatRoom_OPEN_PDF', e);
            setUrl(rowData.url);
          })
          .finally(() => {
            setLoading(false);
            setFileNamePDF(rowData.fileName || '');
            setShowPDF(true);
          });
      } else {
        setUrl(rowData.url);
        setFileNamePDF(rowData.fileName || '');
        setLoading(false);
        setShowPDF(true);
      }
    } else if (rowData.url.match(/\.(jpeg|jpg|gif|png|jfif)$/) || rowData.fileType === 'image') {
      if (rowData.prismId) {
        getPrismUrls(client, patientId, rowData.prismId)
          .then((data: any) => {
            openImageZoomViewer((data && data.urls[0]) || rowData.url, rowData.fileName || 'Image');
            setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch((e) => {
            CommonBugFender('ChatRoom_OPEN_IMAGE', e);
            openImageZoomViewer(rowData.url, rowData.fileName || 'Image');
            setUrl(rowData.url);
          })
          .finally(() => {
            setLoading(false);
            setPatientImageshow(false);
          });
      } else {
        openImageZoomViewer(rowData.url, rowData.fileName || 'Image');
        setUrl(rowData.url);
        setLoading(false);
        setPatientImageshow(false);
      }
    } else {
      if (rowData.prismId) {
        getPrismUrls(client, patientId, rowData.prismId)
          .then((data: any) => {
            openImageZoomViewer(rowData.url, rowData.fileName || 'Image');
            setUrl(rowData.url);
            setLoading(false);
            setPatientImageshow(false);
          })
          .catch(() => {
            openImageZoomViewer(rowData.url, rowData.fileName || 'Image');
            setUrl(rowData.url);
            setLoading(false);
            setPatientImageshow(false);
          })
          .finally(() => {
            setLoading(false);
            setPatientImageshow(true);
          });
      } else {
        openImageZoomViewer(rowData.url, rowData.fileName || 'Image');
        setUrl(rowData.url);
        setLoading(false);
        setPatientImageshow(false);
      }
    }
  };

  const sectionHeaderView = (rowData: any) => {
    return (
      <View>
        <Text style={styles.headerText}>{rowData.automatedText}</Text>
      </View>
    );
  };

  const messageView = (rowData: any, index: number) => {
    return (
      <View style={styles.messageParentView}>
        {leftComponent === 1 && (
          <View
            style={{
              width: 32,
              height: 32,
              bottom: 0,
              position: 'absolute',
              left: 0,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {appointmentData.doctorInfo.thumbnailUrl &&
            appointmentData.doctorInfo.thumbnailUrl.match(urlRegEx) ? (
              <Image
                source={{ uri: appointmentData.doctorInfo.thumbnailUrl }}
                resizeMode={'contain'}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                }}
              />
            ) : (
              <DoctorPlaceholderImage
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                }}
              />
            )}
          </View>
        )}
        <View>
          {rowData.message === imageconsult ? (
            <View>
              {rowData.url.match(/\.(jpeg|jpg|gif|png|jfif)$/) || rowData.fileType === 'image' ? (
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    openPopUp(rowData);
                  }}
                >
                  <View style={styles.msgImageView}>
                    <Image
                      placeholderStyle={styles.imgPlaceholder}
                      PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
                      source={{ uri: rowData.url }}
                      style={styles.msgImage}
                    />
                  </View>
                  <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    openPopUp(rowData);
                  }}
                >
                  <View style={styles.pdfContainer}>
                    <Pdf source={{ uri: rowData.url }} style={styles.pdfThumbnail} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : rowData.message === appointmentComplete ? (
            <>
              <View style={styles.apptCompleteView}>
                <Text style={styles.presGuideText}>
                  {strings.common.consultCompleteMessage.replace(
                    '{0}',
                    appointmentData.doctorInfo.displayName
                  )}
                </Text>
              </View>
              <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
            </>
          ) : rowData.message === startConsultjr ? (
            <View style={styles.apptCompleteView}>
              <Text style={styles.autoGenText}>{string.appointments.byJrDoctor}</Text>
              {rowData.automatedText ? (
                <>
                  <Text style={styles.presGuideText}>{rowData.automatedText}</Text>
                  <View style={styles.separator} />
                  <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
                </>
              ) : null}
            </View>
          ) : rowData.message === startConsultMsg ? (
            <>
              <View style={styles.apptCompleteView}>
                <Text style={styles.autoGenText}>{string.appointments.autoGenerated}</Text>
                {rowData.automatedText ? (
                  <>
                    <Text style={styles.presGuideText}>{rowData.automatedText}</Text>
                  </>
                ) : null}
              </View>
              <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
            </>
          ) : rowData.message === stopConsultJr ? (
            <View style={styles.apptCompleteView}>
              <Text style={styles.autoGenText}>{string.appointments.byJrDoctor}</Text>
              {rowData.automatedText ? (
                <>
                  <Text style={styles.presGuideText}>{rowData.automatedText}</Text>
                  <Text
                    style={{
                      color: '#ffffff',
                      paddingHorizontal: 16,
                      paddingVertical: 4,
                      textAlign: 'right',
                      ...theme.fonts.IBMPlexSansMedium(10),
                    }}
                  >
                    {convertChatTime(rowData)}
                  </Text>
                  <View style={styles.separator} />
                </>
              ) : null}
            </View>
          ) : rowData.automatedText === delayedConsultReminder ? (
            <View style={styles.messageContainer}>
              {rowData.message ? (
                <>
                  <Text style={styles.messageText}>
                    {openDialerFromString(rowData.message, rowData?.metaData)}
                  </Text>
                  <Text style={styles.messageTimeText}>{convertChatTime(rowData)}</Text>
                  <View style={styles.transparentView} />
                </>
              ) : null}
            </View>
          ) : rowData.message === exotelCall ? (
            <View style={styles.exotelCallView}>
              <>
                <Text style={styles.presGuideText} selectable={true}>
                  {doctorName +
                    strings.common.exotelMessage +
                    rowData.exotelNumber +
                    strings.common.requestMessage}
                </Text>
                <Text
                  style={{
                    color: '#ffffff',
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
                <View style={styles.separator} />
              </>
            </View>
          ) : (
            <View>
              <View style={styles.msgSubView}>
                <Text style={styles.msgText}>{rowData.message}</Text>
              </View>
              <View style={styles.separator} />
              <Text style={styles.textMsgTime}>{convertChatTime(rowData)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const audioVideo = (rowData: any, index: number) => {
    return (
      <>
        {rowData.duration === '00 : 00' ? (
          <View
            style={{
              backgroundColor: 'transparent',
              width: 282,
              borderRadius: 10,
              marginVertical: 2,
              alignSelf: 'flex-start',
              paddingVertical: 17,
            }}
          >
            {leftComponent === 1 && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {appointmentData.doctorInfo.thumbnailUrl &&
                appointmentData.doctorInfo.thumbnailUrl.match(urlRegEx) ? (
                  <Image
                    source={{ uri: appointmentData.doctorInfo.thumbnailUrl }}
                    resizeMode={'contain'}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                    }}
                  />
                ) : (
                  <DoctorPlaceholderImage
                    style={{
                      width: 32,
                      height: 32,
                      bottom: 0,
                      position: 'absolute',
                      left: 0,
                    }}
                  />
                )}
              </View>
            )}
            <View
              style={{
                marginLeft: 40,
                borderRadius: 10,
                height: 29,
                width: 244,
              }}
            >
              <View
                style={{
                  backgroundColor: '#e50000',
                  opacity: 0.04,
                  width: 244,
                  borderRadius: 10,
                  height: 29,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'transparent',
                  alignItems: 'center',
                }}
              >
                <MissedCallIcon style={{ width: 16, height: 16, marginLeft: 16, marginTop: 3 }} />
                {rowData.message === 'Audio call ended' ? (
                  <Text
                    style={{
                      color: '#890000',
                      marginLeft: 27,
                      textAlign: 'left',
                      ...theme.fonts.IBMPlexSansMedium(12),
                      lineHeight: 24,
                      letterSpacing: 0.04,
                      marginTop: 2,
                    }}
                  >
                    You missed a voice call
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: '#890000',
                      marginLeft: 27,
                      textAlign: 'left',
                      ...theme.fonts.IBMPlexSansMedium(12),
                      lineHeight: 24,
                      letterSpacing: 0.04,
                      marginTop: 2,
                    }}
                  >
                    You missed a video call
                  </Text>
                )}
              </View>
              <Text
                style={{
                  color: '#890000',
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  textAlign: 'right',
                  ...theme.fonts.IBMPlexSansMedium(10),
                }}
              >
                {convertChatTime(rowData)}
              </Text>
              <View style={{ backgroundColor: 'transparent', height: 5, width: 20 }} />
            </View>
          </View>
        ) : (
          <View style={styles.callView}>
            {leftComponent === 1 && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {appointmentData.doctorInfo.thumbnailUrl &&
                appointmentData.doctorInfo.thumbnailUrl.match(urlRegEx) ? (
                  <Image
                    source={{ uri: appointmentData.doctorInfo.thumbnailUrl }}
                    resizeMode={'contain'}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                    }}
                  />
                ) : (
                  <DoctorPlaceholderImage
                    style={{
                      width: 32,
                      height: 32,
                      bottom: 0,
                      position: 'absolute',
                      left: 0,
                    }}
                  />
                )}
              </View>
            )}
            <View style={styles.callSubView}>
              <ChatCallIcon style={styles.callLogo} />
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    color: '#01475b',
                    marginLeft: 0,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(14),
                  }}
                >
                  {rowData.message}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    marginTop: 2,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  Duration - {rowData.duration}
                </Text>
              </View>
              <View style={styles.separator} />
            </View>
            <Text style={{ ...styles.chatTimeText, paddingRight: 0 }}>
              {convertChatTime(rowData)}
            </Text>
          </View>
        )}
      </>
    );
  };

  const patientAutomatedMessage = (rowData: any, index: number) => {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          borderRadius: 10,
          marginVertical: 2,
          alignSelf: 'flex-start',
        }}
      >
        {leftComponent === 1 && (
          <View
            style={{
              width: 32,
              height: 32,
              bottom: 0,
              position: 'absolute',
              left: 0,
            }}
          >
            <Mascot
              style={{
                width: 32,
                height: 32,
                bottom: 0,
                position: 'absolute',
                left: 0,
              }}
            />
          </View>
        )}
        <View style={{ ...styles.apptCompleteView, marginBottom: 0 }}>
          <Text style={styles.autoGenText}>{string.appointments.autoGenerated}</Text>
          {rowData.automatedText ? (
            <View>
              <Text style={styles.presGuideText}>{rowData.automatedText}</Text>
              <View style={styles.separator} />
            </View>
          ) : null}
        </View>
        <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
      </View>
    );
  };

  const openDialerEvent = (el: string, metaData: { [key: string]: string } | undefined) => {
    if (metaData) {
      const mobileKey = Object.keys(metaData).find((key) => metaData[key] === el);
      if (mobileKey) {
        const eventAttributes = {
          'Doctor Name': g(appointmentData, 'doctorInfo', 'displayName')!,
          'Doctor Number': g(appointmentData, 'doctorInfo', 'mobileNumber')!,
          'Doctor ID': doctorId,
          'Display Speciality Name': g(appointmentData, 'doctorInfo', 'specialty', 'name')!,
          'Display ID': g(appointmentData, 'displayId')!,
          'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
          'Patient Phone Number': g(currentPatient, 'mobileNumber'),
          'Phone number clicked':
            mobileKey === 'secretaryMobileNumber' ? 'Secretary' : 'Support Team',
        };
        postCleverTapEvent(CleverTapEventName.CONSULT_DELAYED_MESSAGE_CLICKED, eventAttributes);
      }
    }
    Linking.openURL('tel:' + el);
  };
  // Function to open Dialer From String
  const openDialerFromString = (str: string, metaData: { [key: string]: string } | undefined) => {
    let regex = /(?:[-+()]*\d){10,13}/gm;
    let arr = str.split(' ');
    return (
      <Text>
        {arr.map((el: string) => {
          if (el.match(regex)) {
            const number = el.match(regex);
            if (number && number[0]) {
              return <Text onPress={() => openDialerEvent(number[0], metaData)}>{el}</Text>;
            }
          }
          return el === '\n' ? el : el ? el.trim() + ' ' : null;
        })}
      </Text>
    );
  };

  const doctorAutomatedMessage = (rowData: any, index: number) => {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          borderRadius: 10,
          marginVertical: 2,
          alignSelf: 'flex-start',
        }}
      >
        {leftComponent === 1 && (
          <View
            style={{
              width: 32,
              height: 32,
              bottom: 0,
              position: 'absolute',
              left: 0,
            }}
          >
            <Mascot
              style={{
                width: 32,
                height: 32,
                bottom: 0,
                position: 'absolute',
                left: 0,
              }}
            />
          </View>
        )}
        <View style={styles.automatedMsgView}>
          <Text style={styles.autoGenText}>{string.appointments.autoGenerated}</Text>
          {rowData.automatedText ? (
            <>
              <Text style={styles.presGuideText}>{rowData.automatedText}</Text>

              <View style={styles.separator} />
            </>
          ) : null}
        </View>
        <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
      </View>
    );
  };

  const symptomTextRow = (heading: string, value: string) => {
    return (
      <Text style={styles.symParentText}>
        <Text style={styles.symptomDetail}>{heading}</Text>
        <Text style={styles.symptomValue}>{value}</Text>
      </Text>
    );
  };

  const renderChatRow = (
    rowData: {
      id: string;
      message: string;
      duration: string;
      fileType: string;
      transferInfo: any;
      prismId: any;
      url: any;
      fileName?: string;
      messageDate: Date;
      automatedText?: string;
      isVisible?: boolean;
    },
    index: number
  ) => {
    // starts with ^^# (display only known automated messages)
    const automatedCodesToRender = [
      transferConsultMsg,
      followupconsult,
      rescheduleConsultMsg,
      consultPatientStartedMsg,
      doctorAutoResponse,
      firstMessage,
      secondMessage,
      languageQue,
      jdThankyou,
      doctorWillConnectShortly,
      rescheduleOrCancelAppointment,
      appointmentStartsInFifteenMin,
      appointmentStartsInTenMin,
      sectionHeader,
      followUpChatGuideLines,
      externalMeetingLink,
      imageconsult,
      appointmentComplete,
      startConsultjr,
      startConsultMsg,
      stopConsultJr,
      exotelCall,
    ];

    // starts with ^^
    const callRelatedCodes = [
      videoCallMsg,
      audioCallMsg,
      acceptedCallMsg,
      endCallMsg,
      covertAudioMsg,
      covertVideoMsg,
    ];

    if (
      !rowData?.message ||
      patientRejectedCall === (rowData as any) ||
      callRelatedCodes.includes(rowData?.message) ||
      (!automatedCodesToRender.includes(rowData?.message) && rowData?.message?.startsWith('^^#')) ||
      (rowData?.automatedText === consultPatientStartedMsg && rowData?.message == 'welcome') ||
      (rowData?.automatedText === jdAutoAssign && !rowData?.isVisible)
    ) {
      return null;
    }

    if (rowData.id !== patientId) {
      leftComponent++;
      rightComponent = 0;
      return (
        <View style={{ marginHorizontal: 20, paddingTop: 8 }}>
          {!moment(rowData?.messageDate).isSame(messages[index - 1]?.messageDate, 'day') && (
            <View style={styles.dateSeparator}>
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, theme.colors.SLATE_GRAY),
                }}
              >
                {moment(rowData?.messageDate).format('DD MMM, YYYY h:mm A')}
              </Text>
            </View>
          )}
          {leftComponent === 1 && (
            <View
              style={{
                backgroundColor: 'transparent',
                width: width,
              }}
            />
          )}
          {rowData.message === 'Audio call ended' || rowData.message === 'Video call ended' ? (
            <>{audioVideo(rowData, index)}</>
          ) : (
            <>
              {rowData.message === transferConsultMsg ||
              rowData.message === followupconsult ||
              rowData.message === rescheduleConsultMsg ? (
                <>{transferReschedule(rowData, index)}</>
              ) : (
                <>
                  {rowData.message === consultPatientStartedMsg ||
                  rowData.message === doctorAutoResponse ? (
                    <>{patientAutomatedMessage(rowData, index)}</>
                  ) : rowData.message === firstMessage ||
                    rowData.message === secondMessage ||
                    rowData.message === languageQue ||
                    rowData.message === jdThankyou ||
                    rowData.message === doctorWillConnectShortly ||
                    rowData.message === rescheduleOrCancelAppointment ||
                    rowData.message === appointmentStartsInFifteenMin ||
                    rowData.message === appointmentStartsInTenMin ? (
                    <>{doctorAutomatedMessage(rowData, index)}</>
                  ) : rowData.message === sectionHeader ? (
                    <>{sectionHeaderView(rowData)}</>
                  ) : rowData.message === followUpChatGuideLines ? (
                    <>
                      <FollowUpChatGuideLines followChatLimit={followChatLimit} />
                    </>
                  ) : rowData.message === externalMeetingLink ? (
                    renderExternalMeetingLink(rowData)
                  ) : (
                    <>{messageView(rowData, index)}</>
                  )}
                </>
              )}
            </>
          )}
        </View>
      );
    } else {
      leftComponent = 0;
      rightComponent++;
      if (rowData?.automatedText == jdAutoAssign) {
        const finalSummary = JSON.parse(rowData?.message);
        const { age, Height, Weight, medicineAllergies, foodAllergies } =
          finalSummary?.[0]?.staticQuestions || {};
        return (
          <View style={styles.assignmentParentView}>
            <View style={styles.assessmentView}>
              <Text style={styles.assessmentHeading}>{string.common.assessmentSummary}</Text>
            </View>
            {finalSummary?.[0]?.staticQuestions && (
              <>
                {symptomTextRow('Age: ', age || '')}
                {symptomTextRow('Height: ', Height || '')}
                {symptomTextRow('Weight: ', Weight || '')}
                {!!medicineAllergies && symptomTextRow('Medicine Allergies: ', medicineAllergies)}
                {!!foodAllergies && symptomTextRow('Food Allergies: ', foodAllergies)}
              </>
            )}
            {finalSummary?.[0]?.dynamicQuestions?.map((item: any) => {
              return (
                <View>
                  <Text style={styles.symptomName}>{item?.symptom || ''}</Text>
                  {!!item?.since && symptomTextRow('Duration: ', item.since)}
                  {!!item?.severity && symptomTextRow('Severity: ', item.severity)}
                  {!!item?.howOften && symptomTextRow('HowOften: ', item.howOften)}

                  {!!item?.details &&
                    !!Object.keys(item.details).length &&
                    Object.entries(item?.details).map(([key, value]: any) => {
                      return (
                        <View>
                          <Text style={styles.symptomDetail}>{`${key}: `}</Text>
                          {Array.isArray(value) && (
                            <View style={styles.sympDetailView}>
                              {value?.map((detailsItem: any, j: number) => {
                                return (
                                  <Text style={{ ...styles.symptomValue, paddingVertical: 2 }}>
                                    {'\u2022 ' + detailsItem}
                                  </Text>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      );
                    })}
                </View>
              );
            })}
          </View>
        );
      }

      return (
        <View style={{ marginHorizontal: 20 }}>
          {!moment(rowData?.messageDate).isSame(messages[index - 1]?.messageDate, 'day') && (
            <View style={styles.dateSeparator}>
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, theme.colors.SLATE_GRAY),
                }}
              >
                {moment(rowData?.messageDate).format('DD MMM, YYYY h:mm A')}
              </Text>
            </View>
          )}
          {rightComponent == 1 ? (
            <View
              style={{
                backgroundColor: 'transparent',
                width: width,
                marginVertical: 8,
              }}
            />
          ) : null}
          {rowData.message === 'Audio call ended' || rowData.message === 'Video call ended' ? (
            <View style={styles.callEndView}>
              <ChatCallIcon style={styles.callLogo} />
              <View>
                <Text
                  style={{
                    color: '#01475b',
                    marginLeft: 12,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(14),
                  }}
                >
                  {rowData.message}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    marginTop: 2,
                    marginLeft: 14,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  Duration - {rowData.duration}
                </Text>
                <Text
                  style={{
                    color: 'rgba(2,71,91,0.6)',
                    paddingLeft: 16,
                    paddingVertical: 4,
                    paddingRight: 4,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
              </View>
              <View style={styles.separator} />
            </View>
          ) : (
            <View>
              {rowData.message === imageconsult ? (
                <View>
                  {rowData.url.match(/\.(jpeg|jpg|gif|png|jfif)$/) ||
                  rowData.fileType === 'image' ? (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => {
                        openPopUp(rowData);
                      }}
                    >
                      <View style={styles.patientImgView}>
                        <Image
                          placeholderStyle={styles.imgPlaceholder}
                          PlaceholderContent={
                            <Spinner style={{ backgroundColor: 'transparent' }} />
                          }
                          source={{ uri: rowData.url }}
                          style={styles.msgImage}
                        />
                      </View>
                      <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => {
                        openPopUp(rowData);
                      }}
                    >
                      <View style={styles.pdfContainer}>
                        <Pdf source={{ uri: rowData.url }} style={styles.pdfThumbnail} />
                      </View>
                      <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <>
                  <View style={styles.patientMsgView}>
                    <Text style={styles.patientMsgText}>{rowData.message}</Text>
                  </View>
                  <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
                </>
              )}
            </View>
          )}
        </View>
      );
    }
  };

  const renderExternalMeetingLink = (rowData: any) => {
    return (
      <View style={styles.externalMeetingLinkContainer}>
        <View style={styles.externalMeetingLinkTextContainer}>
          <ExternalMeetingVideoCall style={styles.externalMeetingLinkImage} />
          <Text style={styles.externalMeetingLinkText}>
            {strings.externalMeetingLink.click_to_open.replace(
              'XYZ',
              g(appointmentData, 'doctorInfo', 'displayName')
            )}
          </Text>

          <View style={styles.externalMeetingLinkCTAWrapper}>
            <TouchableOpacity
              activeOpacity={0.5}
              style={[styles.externalMeetingLinkMeetingCTAContainer, { flex: 0.9 }]}
              onPress={() => onMeetingLinkClicked(rowData)}
            >
              <Text style={styles.exeternalMeetingLinkMeetingCTAText}>{rowData.url}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              style={{ flex: 0.1 }}
              onPress={() => onLinkCopyClicked(rowData)}
            >
              <CopyIcon />
            </TouchableOpacity>
          </View>
          <Text style={styles.externalMeetingLinkTnC}>{strings.externalMeetingLink.tnc}</Text>
        </View>
      </View>
    );
  };

  const onMeetingLinkClicked = (rowData: any) => {
    try {
      Linking.openURL(rowData.url);

      postWebEngageEvent(WebEngageEventName.PATIENT_EXTERNAL_MEETING_LINK_CLICKED, {
        'Doctor name': appointmentData?.doctorInfo?.displayName,
        'Patient name': `${appointmentData?.patientInfo?.firstName} ${appointmentData?.patientInfo?.lastName}`,
        'Patient ID': appointmentData?.patientInfo?.id,
        'Doctor ID': appointmentData?.doctorInfo?.id,
        'Appointment ID': appointmentData?.id,
        'Link URL': rowData.url || '',
        'Doctor number': appointmentData?.doctorInfo?.mobileNumber,
        'Patient number': appointmentData?.patientInfo?.mobileNumber,
        'Solution Used': 'Zoom',
      } as WebEngageEvents[WebEngageEventName.PATIENT_EXTERNAL_MEETING_LINK_CLICKED]);
    } catch (error) {
      CommonBugFender('ChatRoom_rederExternalMeetingLink_onMeetingLinkClickedd', error);
    }
  };

  const onLinkCopyClicked = (rowData: any) => {
    try {
      Clipboard.setString(rowData.url);
      setHandlerMessage(strings.externalMeetingLink.copied_to_clipboard + ' ' + rowData.url);
      setSnackbarState(true);
    } catch (error) {
      CommonBugFender('ChatRoom_rederExternalMeetingLink_onLinkCopyClicked', error);
    }
  };

  const convertChatTime = (timeStamp: any) => {
    let utcString;
    if (timeStamp.messageDate) {
      const dateValidate = moment(moment().format('YYYY-MM-DD')).diff(
        moment(timeStamp.messageDate).format('YYYY-MM-DD')
      );
      utcString = moment
        .utc(timeStamp.messageDate)
        .local()
        .format('DD MMM, YYYY h:mm A');
    }
    return utcString ? utcString : '--';
  };

  const transferAppointmentAPI = (
    rowData: any,
    appointmentTransferInput: BookTransferAppointmentInput
  ) => {
    setLoading(true);

    client
      .mutate<bookTransferAppointment, bookTransferAppointmentVariables>({
        mutation: BOOK_APPOINTMENT_TRANSFER,
        variables: {
          BookTransferAppointmentInput: appointmentTransferInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        setLoading(false);

        setTransferAccept(true),
          setTransferDcotorName(rowData.transferInfo.doctorName),
          setTimeout(() => {
            setTransferAccept(false);
          }, 1000);
        AsyncStorage.setItem('showTransferPopup', 'true');
        const params = {
          TransferData: rowData?.transferInfo,
          TranferDateTime: data?.data?.bookTransferAppointment?.appointment?.appointmentDateTime,
        };
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar, params);
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_transferAppointmentAPI', e);
        setLoading(false);
        setBottompopup(true);
      });
  };

  const checkIfReschduleApi = (
    rowData: any,
    Value: string,
    isAutomatic: boolean,
    nextSlotAvailable: string
  ) => {
    try {
      let checkAppointmentId;
      let checkAppointmentDate;

      if (isAutomatic) {
        checkAppointmentId = apptId;

        checkAppointmentDate = nextSlotAvailable;
      } else {
        checkAppointmentId = rowData.transferInfo.appointmentId;

        checkAppointmentDate =
          Value === 'Followup'
            ? rowData.transferInfo.folloupDateTime
            : rowData.transferInfo.transferDateTime;
      }

      setLoading(true);
      checkIfRescheduleAppointment(client, checkAppointmentId, checkAppointmentDate)
        .then((_data: any) => {
          setLoading(false);
          try {
            const result = _data.data.data.checkIfReschedule;
            const data: rescheduleType = {
              rescheduleCount: result.rescheduleCount + 1,
              appointmentState: result.appointmentState,
              isCancel: result.isCancel,
              isFollowUp: result.isFollowUp,
              isPaid: result.isPaid,
            };
            setNewRescheduleCount(data);
            setCheckReschudule(true);
            setTimeout(() => {
              flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: true });
            }, 500);
          } catch (error) {
            CommonBugFender('ChatRoom_checkIfRescheduleAppointment_try', error);
          }
        })
        .catch((e: any) => {
          CommonBugFender('ChatRoom_checkIfRescheduleAppointment', e);
          setLoading(false);
          const error = JSON.parse(JSON.stringify(e));
        })
        .finally(() => {
          if (isAutomatic) {
            rescheduleInitiatedBy = REQUEST_ROLES.DOCTOR;
            setdisplayoverlay(true);
          } else {
            rescheduleInitiatedBy = REQUEST_ROLES.PATIENT;
          }
        });
    } catch (error) {
      CommonBugFender('ChatRoom_checkIfReschduleApi_try', error);
    }
  };

  const NextAvailableSlot = (rowData: any, Value: string, isAutomatic: boolean) => {
    try {
      if (rowData.length > 0) setLoading(true);
      let todayDate;
      let slotDoctorId;

      if (isAutomatic) {
        todayDate = moment
          .utc(appointmentData.appointmentDateTime)
          .local()
          .format('YYYY-MM-DD');
        slotDoctorId = appointmentData.doctorId;
      } else {
        todayDate = moment
          .utc(
            Value === 'Followup'
              ? rowData.transferInfo.folloupDateTime
              : rowData.transferInfo && rowData.transferInfo.transferDateTime
          )
          .local()
          .format('YYYY-MM-DD');
        slotDoctorId =
          Value === 'Followup' ? rowData.transferInfo.doctorId : rowData.transferInfo.doctorInfo.id;
      }

      setDoctorScheduleId(slotDoctorId);

      getNextAvailableSlots(client, slotDoctorId, todayDate)
        .then(({ data }: any) => {
          setLoading(false);
          try {
            setNextSlotAvailable(data[0].availableSlot);
            checkIfReschduleApi(rowData, Value, isAutomatic, data[0].availableSlot);
          } catch (error) {
            CommonBugFender('ChatRoom_getNextAvailableSlots_try', error);
            setNextSlotAvailable('');
          }
        })
        .catch((e) => {
          CommonBugFender('ChatRoom_getNextAvailableSlots', e);
          setLoading(false);
        })
        .finally(() => {});
    } catch (error) {
      CommonBugFender('ChatRoom_NextAvailableSlot_try', error);
    }
  };

  const rescheduleAPI = (rowData: any, bookRescheduleInput: any) => {
    setLoading(true);

    client
      .mutate<bookRescheduleAppointment, bookRescheduleAppointmentVariables>({
        mutation: BOOK_APPOINTMENT_RESCHEDULE,
        variables: {
          bookRescheduleAppointmentInput: bookRescheduleInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        setLoading(false);
        AsyncStorage.setItem('showSchduledPopup', 'true');
        const params = {
          Data: data?.data?.bookRescheduleAppointment?.appointmentDetails,
          DoctorName: props.navigation.state.params?.data?.doctorInfo?.displayName,
        };
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar, params);
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_rescheduleAPI', e);
        setLoading(false);
        setBottompopup(true);
      });
  };

  const renderChatHeader = () => {
    let time = '';
    const appointmentTime = appointmentData.appointmentDateTime;
    const diffMin = Math.ceil(moment(appointmentTime).diff(moment(), 'minutes', true));
    const diffHours = Math.floor(moment(appointmentTime).diff(moment(), 'hours', true));
    const diffDays = Math.round(moment(appointmentTime).diff(moment(), 'days', true));
    const isPrescriptionReady = messages?.filter(
      (item) => item?.message === followupconsult && item?.transferInfo?.appointmentId == apptId
    );
    // checkAutomatedPatientText();
    if (textChange && !jrDoctorJoined.current) {
      // Consult in Progress
      currentProgressBarPosition.current = 1;
    } else {
      if (status.current === STATUS.PRESCRIPTION_PENDING) {
        currentProgressBarPosition.current = 2;
      } else if (status.current === STATUS.COMPLETED) {
        if (!isProgressBarVisible.current) {
          time = `Consult is completed`;
        }
      } else if (appointmentDiffMin <= 0) {
        time = `Joining soon. Please wait!`;
      } else if (appointmentDiffMin > 0 && appointmentDiffMin < 60 && diffHours <= 1) {
        time = `Expected to join in ${appointmentDiffMin} minute${
          appointmentDiffMin === 1 ? '' : 's'
        }`;
      } else if (diffHours >= 0 && diffHours < 24 && diffDays <= 1) {
        time = `Expected to join in ${convertMinsToHrsMins(appointmentDiffMin)}`;
      } else {
        time = `Consult on ${moment(appointmentTime).format('DD/MM')} at ${moment(
          appointmentTime
        ).format('h:mm A')}`;
      }
    }
    if (isPrescriptionReady?.length > 0) {
      currentProgressBarPosition.current = 3;
    }
    showProgressBarOnHeader.current =
      !doctorJoinedChat &&
      !time &&
      !(currentProgressBarPosition.current === 0 || !isProgressBarVisible.current);
    if (!showProgressBarOnHeader.current) {
      return (
        <View style={styles.mainView}>
          {currentProgressBarPosition.current === 0 || !isProgressBarVisible.current ? (
            <Text style={[styles.doctorNameStyle, { paddingBottom: time ? 5 : 11 }]}>
              {appointmentData.doctorInfo.displayName}
            </Text>
          ) : (
            <></>
          )}
          {time ? <Text style={styles.timeStyle}>{time}</Text> : <View />}
          {!showProgressBarOnHeader.current &&
            isProgressBarVisible.current &&
            renderProgressBar(currentProgressBarPosition.current)}
          {doctorJoinedChat && renderJoinCallHeader()}
        </View>
      );
    }
    return <></>;
  };

  const isFilesUploadedByPatient = messages?.find((m) => m.message === imageconsult);
  const isVitalsCompleted =
    !displayChatQuestions || messages?.find((m) => m.message === vitalsCompletedByPatient);
  const isDoctorAttemptedCall = messages?.find((m) => m.message === endCallMsg);
  const isDrCheckingRecords =
    !isDoctorAttemptedCall &&
    (isFilesUploadedByPatient || isVitalsCompleted || isConsultedWithDoctorBefore);
  const avgTimeForDoctorToJoinInMinutes = 5;

  const renderJoinCallHeader = () => {
    const doctor = appointmentData?.doctorInfo?.displayName;
    const text = isDrCheckingRecords
      ? `${doctor} is online and going through your records!`
      : `${doctor} is Online!`;
    const ctaHeading = isDrCheckingRecords ? 'JOIN CALL ROOM' : 'JOIN CALL';

    return (
      !loading && (
        <JoinWaitingRoomView
          onPress={() => onPressJoinBtn()}
          title={text}
          rightBtnTitle={ctaHeading}
          onPressJoin={() => onPressJoinBtn()}
        />
      )
    );
  };

  const startCallConnectionUpdateFx = () => {
    const startCallConnectionUpdateBT = BackgroundTimer.setInterval(() => {
      updateStatusOfCall({ appointmentId: appointmentData.id, patientId: patientId });
    }, 30000);
    setStartCallConnectionUpdateBT(startCallConnectionUpdateBT);
    AsyncStorage.setItem('startCallConnectionUpdateBT', startCallConnectionUpdateBT.toString());
  };

  const onPressJoinBtn = () => {
    patientJoinedCall.current = true;
    joinCallHandler();
    postAppointmentWEGEvent(WebEngageEventName.PATIENT_JOINED_CONSULT);
  };

  const joinCallHandler = () => {
    callPermissions(
      () => {
        AsyncStorage.setItem('leftSoundPlayed', 'false');
        callStatus.current = '';
        callToastStatus.current = '';
        setLoading(true);
        setCallAccepted(true);
        setHideStatusBar(true);
        setChatReceived(false);
        Keyboard.dismiss();
        changeVideoStyles();
        setDropdownVisible(false);
        setCallerVideo(true);
        makeUpdateAppointmentCall.current = true;
        APICallAgain(true);
      },
      'Consult Chat Screen',
      currentPatient
    );
    //startCallConnectionUpdate();
  };

  const chatDisabled = () => {
    return (
      <View style={styles.chatDisabledContainer}>
        <Text style={styles.chatDisabledHeader}>
          {strings.consultType.chatDisabledHeader.replace(
            '{0}',
            appointmentData.doctorInfo.displayName
          )}
        </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            fireWebengageEvent(appointmentData);
            appointmentData?.doctorInfo?.allowBookingRequest
              ? props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
                  doctorId: doctorId,
                  cleverTapAppointmentAttributes: {
                    source: 'Appointment CTA',
                    appointmentCTA: 'Inside consult room',
                  },
                })
              : props.navigation.navigate(AppRoutes.DoctorDetails, {
                  doctorId: doctorId,
                  cleverTapAppointmentAttributes: {
                    source: 'Appointment CTA',
                    appointmentCTA: 'Inside consult room',
                  },
                });
          }}
        >
          <Text style={theme.viewStyles.text('B', 13, theme.colors.APP_YELLOW)}>
            {appointmentData?.doctorInfo?.allowBookingRequest
              ? 'REQUEST APPOINTMENT'
              : strings.common.book_apointment}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const fireWebengageEvent = (
    item: getPatinetAppointments_getPatinetAppointments_patinetAppointments
  ) => {
    const medicinePrescription = g(item, 'caseSheet', '0' as any, 'medicinePrescription');
    const getMedicines = (
      medicines: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription | null)[]
    ) =>
      medicines
        ? medicines
            .filter((i) => i?.medicineName)
            .map((i) => i?.medicineName)
            .join(', ')
        : null;
    const followUpMedicineNameText = getMedicines(medicinePrescription!);
    const eventAttributesFollowUp:
      | WebEngageEvents[WebEngageEventName.BOOK_AGAIN_CANCELLED_APPOINTMENT]
      | WebEngageEvents[WebEngageEventName.PAST_APPOINTMENT_BOOK_FOLLOW_UP_CLICKED] = {
      'Customer ID': g(currentPatient, 'id'),
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Doctor ID': g(item, 'doctorId') || '',
      'Doctor Name': g(item, 'doctorInfo', 'displayName') || '',
      'Doctor Category': g(item, 'doctorInfo', 'doctorType'),
      'Doctor City': g(item, 'doctorInfo', 'city') || '',
      'Speciality ID': g(item, 'doctorInfo', 'specialty', 'id') || '',
      'Speciality Name': g(item, 'doctorInfo', 'specialty', 'name') || '',
      'Consult ID': g(item, 'id') || '',
      'Consult Date Time': moment(g(item, 'appointmentDateTime')).toDate(),
      'Consult Mode': g(item, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      isConsultStarted: !!g(item, 'isConsultStarted'),
      Prescription: followUpMedicineNameText || '',
      Source: 'Inside consult room',
    };

    postWebEngageEvent(WebEngageEventName.BOOK_APPOINTMENT_CHAT_ROOM, eventAttributesFollowUp);
    const cleverTapEventAttributesFollowUp: CleverTapEvents[CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED] = {
      'Customer ID': g(currentPatient, 'id'),
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Doctor ID': g(item, 'doctorId') || undefined,
      'Doctor name': g(item, 'doctorInfo', 'displayName') || undefined,
      'Doctor city': g(item, 'doctorInfo', 'city') || undefined,
      'Speciality ID': g(item, 'doctorInfo', 'specialty', 'id') || undefined,
      'Speciality name': g(item, 'doctorInfo', 'specialty', 'name') || undefined,
      'Doctor category': g(item, 'doctorInfo', 'doctorType')! || undefined,
      'Consult ID': g(item, 'id') || '',
      'Appointment datetime': moment(g(item, 'appointmentDateTime')).toDate(),
      'Consult Mode': g(item, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Is consult started': !!g(item, 'isConsultStarted'),
      Prescription: followUpMedicineNameText || '',
      Source: 'Inside Consult Room',
      'Mobile number': currentPatient?.mobileNumber || '',
      'Circle Member': !!circleSubscriptionId,
      'Circle Plan type': circleSubPlanId,
    };
    postCleverTapEvent(
      CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED,
      cleverTapEventAttributesFollowUp
    );
  };
  const renderStartAssessment = () => {
    return (
      <View style={styles.assessmentParentView}>
        <View style={styles.startAssessmentView}>
          <Text
            style={styles.assessmentText}
          >{`Hi, We request you to fill the following medical assessment, before ${appointmentData?.doctorInfo.displayName} speaks with you.`}</Text>
          <Button
            title={string.vaccineBooking.proceed}
            style={styles.proceedBtn}
            titleTextStyle={theme.viewStyles.text('SB', 12, theme.colors.WHITE)}
            onPress={() => {
              setStartAssessment(true);
              chatInitializedEvent();
            }}
          />
        </View>
      </View>
    );
  };
  const chatInitializedEvent = () => {
    let eventAttributes = {
      'Appointment Date Time': moment(g(appointmentData, 'appointmentDateTime')).toDate(),
      'Event date-time': new Date(),
      'Display ID': appointmentData?.displayId || '',
      'Consult Mode': appointmentData?.appointmentType || '',
      'Doctor Category': appointmentData?.doctorInfo?.doctorType || '',
      'Doctor Name': appointmentData?.doctorInfo?.displayName || '',
      'Hospital City': appointmentData?.doctorInfo?.doctorHospital?.[0]?.facility?.city || '',
      'Hospital Name ': appointmentData?.doctorInfo?.doctorHospital?.[0]?.facility?.name || '',
      Relation: appointmentData?.patientInfo?.relation || '',
      'Specialty ID': appointmentData?.doctorInfo?.specialty?.id || '',
      'Specialty Name': appointmentData?.doctorInfo?.specialty?.name || '',
      'Doctor Id': appointmentData?.doctorInfo?.id || '',
      platForm: Platform.OS,
    };

    postCleverTapEvent(CleverTapEventName.VITAL_QUESTION_ASSESSMENT_STARTED, eventAttributes);
  };

  const renderChatView = () => {
    return (
      <View style={{ width: width, height: heightList, marginTop: 0, flex: 1 }}>
        <FlatList
          style={styles.listView}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          ref={(ref) => (flatListRef.current = ref)}
          contentContainerStyle={{
            marginTop: 0,
          }}
          bounces={false}
          data={messages}
          onEndReachedThreshold={0.2}
          renderItem={({ item, index }) => renderChatRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={messages ? messages.length : 0}
          ListFooterComponent={() => {
            if (displayChatQuestions) {
              return renderStartAssessment();
            } else if (disableChat) {
              return chatDisabled();
            } else {
              return <View style={{ height: 150 }}></View>;
            }
          }}
        />
      </View>
    );
  };

  const drDisplayName = appointmentData.doctorInfo.displayName;
  const drName = drDisplayName?.includes('Dr') ? drDisplayName : `Dr ${drDisplayName}`;
  const doctorName = name == 'JUNIOR' ? drName + '`s' + ' team doctor ' : drName;

  const VideoCall = () => {
    return (
      <View style={[talkStyles, { zIndex: 1001 }]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <OTSession
            // apiKey={'46401302'}
            apiKey={AppConfig.Configuration.PRO_TOKBOX_KEY}
            sessionId={sessionId}
            token={token}
            eventHandlers={sessionEventHandlers}
            ref={otSessionRef}
            options={{
              androidZOrder: 'onTop', // Android only - valid options are 'mediaOverlay' or 'onTop'
              androidOnTop: 'publisher', // Android only - valid options are 'publisher' or 'subscriber'
              useTextureViews: true, // Android only - default is false
              isCamera2Capable: true, // Android only - default is false
            }}
          >
            {renderOTPublisher()}
            <OTSubscriber
              style={
                showDoctorProfile
                  ? { width: 0, height: 0 }
                  : !downgradeToAudio
                  ? subscriberStyles
                  : {
                      width: 1,
                      height: 1,
                    }
              }
              // subscribeToSelf={true}
              eventHandlers={subscriberEventHandlers}
              properties={{
                subscribeToAudio: true,
                subscribeToVideo: !downgradeToAudio ? true : false,
                audioVolume: 100,
              }}
            />
          </OTSession>
          {callingScreenUI()}
        </View>
      </View>
    );
  };

  const callingScreenUI = () => {
    return (
      <>
        {!PipView && (
          <>
            <View style={[styles.callingView, { top: isIphoneX() ? 24 : 0 }]}>
              <Text style={{ color: 'transparent', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
                Time Left {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
                {seconds.toString().length < 2 ? '0' + seconds : seconds}
              </Text>
            </View>
            {!subscriberConnected.current && (
              <Text
                numberOfLines={1}
                style={[styles.connectingDoctorName, { marginTop: isIphoneX() ? 64 : 44 }]}
              >
                {doctorName}
              </Text>
            )}
          </>
        )}
        {!isPublishAudio && showVideo && renderShowNoAudioView()}
        {subscriberConnected.current && renderSubscriberConnectedInfo()}

        {showDoctorProfile &&
          !subscriberConnected.current &&
          !patientJoinedCall.current &&
          renderTextConnecting()}
        {!subscriberConnected.current || isPaused !== '' || callToastStatus.current
          ? renderToastMessages()
          : null}
        {!showVideo && renderDisableVideoSubscriber()}
        {showDoctorProfile && renderNoSubscriberConnectedThumbnail()}
        {!PipView && renderChatNotificationIcon()}
        {!PipView && renderBottomButtons()}
        <Snackbar
          style={styles.snackBar}
          visible={snackbarState}
          onDismiss={() => {
            setSnackbarState(false);
          }}
          duration={50000}
        >
          {handlerMessage}
        </Snackbar>
      </>
    );
  };

  const renderOTPublisher = () => {
    return (
      <OTPublisher
        style={!showVideo ? {} : !downgradeToAudio ? publisherStyles : styles.publisherStyles}
        properties={{
          cameraPosition: cameraPosition,
          publishVideo: !downgradeToAudio ? showVideo : false,
          publishAudio: isPublishAudio,
          audioVolume: 100,
          name: g(currentPatient, 'firstName') || 'patient',
          resolution: '640x480', // setting this resolution to avoid over heating of device
          audioBitrate: 30000,
          frameRate: 15,
        }}
        eventHandlers={publisherEventHandlers}
      />
    );
  };

  const renderShowNoAudioView = () => {
    return (
      <View
        style={[
          styles.disableVideoSubscriber,
          {
            backgroundColor: showVideo ? 'clear' : '#e1e1e1',
            top: isIphoneX() ? 64 : 44,
          },
        ]}
      >
        <View style={styles.audioDisableContainer}>
          <Text style={styles.disabledVideoAudioText}>Your audio is off</Text>
        </View>
      </View>
    );
  };
  const renderTextConnecting = () => {
    return (
      <Text
        style={[
          styles.connectingTextStyle,
          {
            marginTop: isIphoneX() ? 100 : 80,
          },
        ]}
      >
        {callStatus.current ? callStatus.current : 'Connecting...'}
      </Text>
    );
  };

  const renderSubscriberConnectedInfo = () => {
    return (
      <View style={[styles.subscriberConnectedView, { marginTop: isIphoneX() ? 64 : 44 }]}>
        <View style={styles.subscriberConnectedInnerView}>
          <Text style={styles.connectedDoctorName}>{doctorName}</Text>
          <Text style={styles.connectedDoctorName}>
            {callStatus.current ? callStatus.current : 'Connected'} {'  '}
            {!callStatus.current ? callTimerStarted : ''}
          </Text>
        </View>
      </View>
    );
  };

  const renderDisableVideoSubscriber = () => {
    const title =
      !showVideo && !isPublishAudio
        ? 'Your audio & video are off'
        : !showVideo
        ? 'Your video is off'
        : 'Your audio is off';

    return (
      <View style={[styles.disableVideoSubscriber, { top: isIphoneX() ? 64 : 44 }]}>
        <Text style={styles.disabledVideoAudioText}>{title}</Text>
      </View>
    );
  };

  const renderNoSubscriberConnectedThumbnail = () => {
    return (
      <View style={styles.userThumbnailView}>
        {doctorProfileUrl ? (
          <Image
            source={{ uri: doctorProfileUrl }}
            style={styles.userThumbnailIcon}
            resizeMode={'contain'}
          />
        ) : (
          <UserThumbnailIcon style={styles.userThumbnailIcon} />
        )}
        {patientJoinedCall.current && !subscriberConnected.current && (
          <Text style={styles.centerTxt}>
            {callTimer > avgTimeForDoctorToJoinInMinutes * 60
              ? 'Unfortunately, it appears that\nthe doctor is still busy.\nYou will receive a call shortly!'
              : isDrCheckingRecords
              ? `${doctorName} is going through your details.\nOn average, it takes ${avgTimeForDoctorToJoinInMinutes} minutes!`
              : `${doctorName} is yet to Join!`}
          </Text>
        )}
      </View>
    );
  };

  const callTimerStarted = moment.utc(callTimer * 1000).format('mm : ss');

  const renderToastMessages = () => {
    if (
      (callStatus.current === disconnecting && callToastStatus.current === '') ||
      (patientJoinedCall.current && !subscriberConnected.current)
    ) {
      return;
    }
    return (
      <View style={styles.doctorStatusContainer}>
        <View style={styles.doctorStatusInnerContainer}>
          <Text
            style={{
              ...theme.viewStyles.text(
                'M',
                14,
                isErrorToast.current ? theme.colors.APP_RED : theme.colors.LIGHT_BLUE
              ),
              textAlign: 'center',
            }}
          >
            {callToastStatus.current
              ? callToastStatus.current
              : !subscriberConnected.current
              ? connectingCall
              : isPaused !== ''
              ? showMessage(isPaused)
              : ''}
          </Text>
        </View>
      </View>
    );
  };

  const showMessage = (isPaused: any) => {
    if (downgradeToAudio) {
      return `Falling back to audio due to bad network!!`;
    }
    return `${doctorName} has turned off the ${isPaused}`;
  };

  const endVoipCall = () => {
    if (isIos()) {
      RNCallKeep.endAllCalls();
    }
    AsyncStorage.getItem('startCallConnectionUpdateBT').then((data) => {
      BackgroundTimer.clearInterval(Number.parseInt(data || '0'));
    });
    BackgroundTimer.clearInterval(startCallConnectionUpdateBT);
  };

  const changeVideoStyles = () => {
    setTalkStyles({
      flex: 1,
      backgroundColor: theme.colors.CALL_BG_GRAY,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    });
    setSubscriberStyles({
      width,
      height,
    });
    setPublisherStyles({
      position: 'absolute',
      top: isIphoneX() ? 70 : 44,
      right: 20,
      width: 95,
      height: 120,
      zIndex: 1000,
      borderRadius: 12,
      ...theme.viewStyles.cardViewStyle,
    });
    setPipView(false);
    setChatReceived(false);
    Keyboard.dismiss();
    setDropdownVisible(false);
  };

  const renderChatNotificationIcon = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: isIphoneX() ? 64 : 44,
          left: 20,
          right: 0,
          zIndex: 1006,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            setCallMinimize(true);
            setTalkStyles({
              height: 0,
              width: 0,
            });

            setSubscriberStyles({
              width: 0,
              height: 0,
            });

            setPublisherStyles({
              width: 0,
              height: 0,
            });

            setPipView(true);
            setChatReceived(false);
            setHideStatusBar(false);
          }}
        >
          <CallCollapseIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderBottomButtons = () => {
    return (
      <View style={styles.callBottomButtonsStyle}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.btnActionContainer}
          onPress={() => {
            cameraPosition === 'front' ? setCameraPosition('back') : setCameraPosition('front');
          }}
        >
          <CallCameraIcon style={styles.cameraIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.btnActionContainer}
          onPress={() => {
            isPublishAudio === true ? setIsPublishAudio(false) : setIsPublishAudio(true);
          }}
        >
          {isPublishAudio === true ? (
            <AudioActiveIcon style={styles.muteActiveIcon} />
          ) : (
            <AudioInactiveIcon style={styles.muteInactiveIcon} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.btnActionContainer}
          onPress={() => {
            setShowVideo(!showVideo);
          }}
        >
          {showVideo ? (
            <VideoActiveIcon style={styles.videoActiveIcon} />
          ) : (
            <VideoInactiveIcon style={styles.videoInactiveIcon} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.disconnectViewStyle}
          onPress={() => {
            callStatus.current = disconnecting;
            callToastStatus.current = 'You Disconnected the call';
            isErrorToast.current = true;
            setTimeout(() => {
              hideCallUI();
            }, 2000);

            if (isAudio.current) {
              handleEndAudioCall();
            } else {
              handleEndCall();
            }
          }}
        >
          <WhiteCallIcon style={styles.endCallIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  //Intentionally commentted
  // useEffect(() => {
  //   if (
  //     patientJoinedCall.current &&
  //     !subscriberConnected.current &&
  //     callTimer === avgTimeForDoctorToJoinInMinutes * 60
  //   ) {
  //     callStatus.current = ' ';
  //     callToastStatus.current = disconnecting;
  //     isErrorToast.current = true;
  //     setTimeout(() => {
  //       if (isAudio.current) {
  //         handleEndAudioCall();
  //       } else {
  //         console.log('check onPress useEffect callTimer -- ');
  //         handleEndCall();
  //       }
  //     }, 1000);
  //   }
  // }, [callTimer]);

  const handleEndCall = (playSound: boolean = true, publishPubnub: boolean = true) => {
    AsyncStorage.getItem('startCallConnectionUpdateBT').then((data) => {
      BackgroundTimer.clearInterval(Number.parseInt(data || '0'));
    });
    BackgroundTimer.clearInterval(startCallConnectionUpdateBT);

    APICallAgain(false);
    resetCurrentRetryAttempt();
    setTimeout(() => {
      makeUpdateAppointmentCall.current = false;
      setCallMinimize(false);
      AsyncStorage.setItem('callDisconnected', 'true');
      stopSound();
      playSound && playDisconnectSound();
      setIsCall(false);
      setIsPublishAudio(true);
      setShowVideo(true);
      setCameraPosition('front');
      stopTimer();
      setHideStatusBar(false);
      setChatReceived(false);
      postAppointmentWEGEvent(WebEngageEventName.PATIENT_ENDED_CONSULT);
      callEndWebengageEvent('Patient');
      if (publishPubnub && patientId == currentPatient?.id) {
        pubnub.publish(
          {
            message: {
              isTyping: true,
              message: 'Video call ended',
              duration: callTimerStarted,
              id: patientId,
              messageDate: new Date(),
            },
            channel: channel.current,
            storeInHistory: true,
          },
          (status, response) => {}
        );

        pubnub.publish(
          {
            message: {
              isTyping: true,
              message: endCallMsg,
              id: patientId,
              messageDate: new Date(),
            },
            channel: channel.current,
            storeInHistory: true,
          },
          (status, response) => {}
        );
      }
    }, 2000);
  };

  const handleEndAudioCall = (playSound: boolean = true, publishPubnub: boolean = true) => {
    AsyncStorage.getItem('startCallConnectionUpdateBT').then((data) => {
      BackgroundTimer.clearInterval(Number.parseInt(data || '0'));
    });
    BackgroundTimer.clearInterval(startCallConnectionUpdateBT);

    BackgroundTimer.clearInterval(startCallConnectionUpdateBT);
    APICallAgain(false);
    resetCurrentRetryAttempt();
    setTimeout(() => {
      makeUpdateAppointmentCall.current = false;
      setCallMinimize(false);
      AsyncStorage.setItem('callDisconnected', 'true');
      stopSound();
      playSound && playDisconnectSound();
      setIsAudioCall(false);
      stopTimer();
      setHideStatusBar(false);
      setIsPublishAudio(true);
      setShowVideo(true);
      setCameraPosition('front');
      postAppointmentWEGEvent(WebEngageEventName.PATIENT_ENDED_CONSULT);
      callEndWebengageEvent('Patient');

      if (publishPubnub && patientId == currentPatient?.id) {
        pubnub.publish(
          {
            message: {
              isTyping: true,
              message: 'Audio call ended',
              duration: callTimerStarted,
              id: patientId,
              messageDate: new Date(),
            },
            channel: channel.current,
            storeInHistory: true,
          },
          (status, response) => {}
        );

        pubnub.publish(
          {
            message: {
              isTyping: true,
              message: endCallMsg,
              id: patientId,
              messageDate: new Date(),
            },
            channel: channel.current,
            storeInHistory: true,
          },
          (status, response) => {}
        );
      }
    }, 2000);
  };

  const APICallAgain = (isUserJoining?: boolean) => {
    if (!makeUpdateAppointmentCall.current) {
      return;
    }
    const input = {
      appointmentId: appointmentData.id,
      requestRole: 'PATIENT',
      isUserJoining,
    };

    client
      .mutate<updateAppointmentSession, updateAppointmentSessionVariables>({
        mutation: UPDATE_APPOINTMENT_SESSION,
        variables: {
          UpdateAppointmentSessionInput: input,
        },
      })
      .then((sessionInfo: any) => {
        setsessionId(sessionInfo.data.updateAppointmentSession.sessionId);
        settoken(sessionInfo.data.updateAppointmentSession.appointmentToken);

        isUserJoining && PublishAudioVideo();
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_APICallAgain', e);
      });
  };

  const PublishAudioVideo = () => {
    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: !patientJoinedCall.current ? acceptedCallMsg : patientJoinedMeetingRoom,
          messageDate: new Date(),
          platform: 'mobile',
        },
        channel: channel.current,
        storeInHistory: false,
      },
      (status, response) => {}
    );
    AsyncStorage.setItem('callDisconnected', 'false');
    if (isAudio.current && !patientJoinedCall.current) {
      setShowVideo(false);
      setCallerVideo(false);
      setIsAudioCall(true);
    } else {
      setShowVideo(true);
      setIsCall(true);
    }
    setLoading(false);
  };

  const options = {
    quality: 0.1,
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const callUploadMediaDocumentApiV2 = (inputData: MediaPrescriptionUploadRequest) =>
    client.mutate({
      mutation: UPLOAD_MEDIA_DOCUMENT_V2,
      fetchPolicy: 'no-cache',
      variables: {
        MediaPrescriptionUploadRequest: inputData,
        uhid: g(currentPatient, 'uhid'),
        appointmentId: appointmentData.id,
      },
    });

  const uploadDocument = async (
    resource: any,
    base66?: any,
    type?: any,
    selectedOptionType?: 'Camera' | 'Gallery'
  ) => {
    CommonLogEvent(AppRoutes.ChatRoom, 'Upload document');
    setLoading(true);
    consultWebEngageEvents(
      CleverTapEventName.CONSULT_REPORT_UPLOAD_IN_CHATROOM,
      selectedOptionType
    );
    for (let i = 0; i < resource?.length; i++) {
      const item = resource[i];

      if (
        item.fileType == 'jpg' ||
        item.fileType == 'jpeg' ||
        item.fileType == 'pdf' ||
        item.fileType == 'png'
      ) {
        const formattedDate = moment(new Date()).format('YYYY-MM-DD');
        const prescriptionFile: MediaPrescriptionFileProperties = {
          fileName: item.title + '.' + item.fileType,
          mimeType: mimeType(item.title + '.' + item.fileType),
          content: item.base64,
        };
        const inputData: MediaPrescriptionUploadRequest = {
          prescribedBy: appointmentData.doctorInfo.displayName,
          dateOfPrescription: formattedDate,
          startDate: null,
          endDate: null,
          prescriptionSource: mediaPrescriptionSource.SELF,
          prescriptionFiles: [prescriptionFile],
        };
        try {
          const response = await callUploadMediaDocumentApiV2(inputData);

          if (
            response?.data?.uploadMediaDocumentV2 &&
            Array.isArray(response.data.uploadMediaDocumentV2) &&
            response.data.uploadMediaDocumentV2.length &&
            response.data.uploadMediaDocumentV2[0]?.fileUrl
          ) {
            const fileType = item.fileType == 'pdf' ? 'pdf' : 'image';
            const text = {
              id: patientId,
              message: imageconsult,
              fileType,
              fileName: item.title + '.' + item.fileType,
              url: response.data.uploadMediaDocumentV2[0].fileUrl || '',
              messageDate: new Date(),
            };
            pubnub.publish(
              {
                channel: channel.current,
                message: text,
                storeInHistory: true,
                sendByPost: true,
              },
              (status, response) => {
                if (status.statusCode == 200) {
                  HereNowPubnub('ImageUploaded');
                }
              }
            );
            postChatWebEngEvent(fileType == 'pdf' ? 'PDF' : 'Image', text.message);
            KeepAwake.activate();
          } else {
            Alert.alert('Upload document failed');
            CommonLogEvent('ChatRoom_callUploadMediaDocumentApiV2_Failed', response);
          }
        } catch (e) {
          // adding retry
          currentRetryAttempt <= maxRetryAttempt && uploadDocument([resource[i]]);
          currentRetryAttempt++;
          CommonBugFender('ChatRoom_uploadDocument', e);
          setLoading(false);
          KeepAwake.activate();
        }
      } else {
        setwrongFormat(true);
        setLoading(false);
      }
    }
    setLoading(false);
  };

  const uploadPrescriptionPopup = () => {
    return (
      <UploadPrescriprionPopup
        type={'Consult Flow'}
        heading="Attach File(s)"
        instructionHeading="Instructions For Uploading Files"
        instructions={[
          'Take clear Picture of your entire file.',
          'Doctor details & date of the test should be clearly visible.',
          'Only JPG / PNG / PDF type files up to 25 MB are allowed',
        ]}
        isVisible={isDropdownVisible}
        disabledOption={'NONE'}
        blockCamera={isCall}
        blockCameraMessage={strings.alerts.Open_camera_in_video_call}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE FROM\nDEVICE',
          prescription: 'UPLOAD\nFROM PHR',
        }}
        hideTAndCs={true}
        onClickClose={() => setDropdownVisible(false)}
        onResponse={(selectedType, response, type) => {
          setDropdownVisible(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            if (type !== undefined) {
              if (type === 'Camera') {
                consultWebEngageEvents(WebEngageEventName.TAKE_PHOTO_CLICK_CHATROOM);
              }
              if (type === 'Gallery') {
                consultWebEngageEvents(WebEngageEventName.GALLERY_UPLOAD_PHOTO_CLICK_CHATROOM);
              }
            }

            uploadDocument(response, response[0].base64, response[0].fileType, type);
            //updatePhysicalPrescriptions(response);
          } else {
            setSelectPrescriptionVisible(true);
            consultWebEngageEvents(WebEngageEventName.UPLOAD_PHR_CLICK_CHATROOM);
          }
        }}
      />
    );
  };

  const callAddChatDocumentApi = async (
    _prismFileId: string,
    _fileUrl: string,
    _fileName: string
  ) => {
    try {
      const response = await client.mutate<addChatDocument, addChatDocumentVariables>({
        mutation: ADD_CHAT_DOCUMENTS,
        fetchPolicy: 'no-cache',
        variables: {
          prismFileId: _prismFileId,
          documentPath: _fileUrl,
          appointmentId: appointmentData?.id,
          fileName: _fileName || '',
        },
      });
      const prismFieldId = g(response, 'data', 'addChatDocument', 'prismFileId');
      const documentPath = g(response, 'data', 'addChatDocument', 'documentPath');
      const text = {
        id: patientId,
        message: imageconsult,
        fileType: _fileName
          ? _fileName?.toLowerCase()?.endsWith('.pdf')
            ? 'pdf'
            : 'image'
          : (documentPath ? documentPath : _fileUrl).match(/\.(pdf)$/)
          ? 'pdf'
          : 'image',
        fileName: _fileName,
        prismId: (prismFieldId ? prismFieldId : _prismFileId) || '',
        url: documentPath ? documentPath : _fileUrl,
        messageDate: new Date(),
      };
      pubnub.publish(
        {
          channel: channel.current,
          message: text,
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {}
      );
      KeepAwake.activate();
    } catch (e) {
      setLoading(false);
      CommonBugFender('ChatRoom_callAddChatDocumentApi_ADD_CHAT_DOCUMENTSt', e);
    }
  };

  const renderPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        showLabResults
        navigation={props.navigation}
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          } else {
            setLoading(true);
            consultWebEngageEvents(
              CleverTapEventName.CONSULT_REPORT_UPLOAD_IN_CHATROOM,
              'PHR Section'
            );
            selectedEPres.forEach(async (item) => {
              CommonLogEvent('ChatRoom_ADD_CHAT_DOCUMENTSt', item);
              const _uploadedUrl = item.uploadedUrl ? item.uploadedUrl : '';
              const uploadedUrlArray = item?.uploadedUrlArray || [];
              const prism = item?.prismPrescriptionFileId ? item?.prismPrescriptionFileId : '';
              if (uploadedUrlArray?.length) {
                try {
                  const uploadedUrlArrayResponse = await Promise.all(
                    uploadedUrlArray?.map(async (_item) => {
                      await callAddChatDocumentApi(prism, _item?.file_Url, _item?.fileName);
                    })
                  );
                } catch (e) {
                  setLoading(false);
                  CommonBugFender('ChatRoom_renderPrescriptionModal_ADD_CHAT_DOCUMENTSt', e);
                }
              } else if (_uploadedUrl) {
                const fileName = item?.fileName || '';
                const splitArr = _uploadedUrl.split('.');
                const fileType = splitArr[splitArr.length - 1];
                if (fileType) {
                  postChatWebEngEvent(fileType == 'pdf' ? 'PDF' : 'Image', '');
                }
                await callAddChatDocumentApi(prism, _uploadedUrl, fileName);
              }
              // });
              item.message &&
                pubnub.publish(
                  {
                    channel: channel.current,
                    message: {
                      id: patientId,
                      message: item.message,
                      type: 'PHR',
                      messageDate: new Date(),
                    },
                    storeInHistory: true,
                    sendByPost: true,
                  },
                  (status, response) => {
                    if (status.statusCode == 200) {
                      HereNowPubnub('EprescriptionUploaded');
                    }
                  }
                );
              setLoading(false);
            });
          }
        }}
        isVisible={true}
      />
    );
  };
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const closeviews = () => {
    setPatientImageshow(false);
    setShowWeb(false);
  };
  const renderCloseIcon = () => {
    return (
      <View
        style={{
          alignSelf: 'flex-end',
          backgroundColor: 'transparent',
          marginRight: 16,
          marginTop: 30,
        }}
      >
        <TouchableOpacity activeOpacity={0.5} onPress={() => closeviews()}>
          <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };
  const imageOpen = () => {
    return (
      <View
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'black',
            opacity: 0.6,
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
        {renderCloseIcon()}
        <ImageReact
          style={{
            flex: 1,
            resizeMode: 'contain',
            marginTop: 20,
            marginHorizontal: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
          source={{ uri: url }}
        />
      </View>
    );
  };
  const showWeimageOpen = () => {
    let uri = formatUrl(`${url}`, loginToken, userMobileNumber);

    return (
      <View
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'black',
            opacity: 0.6,
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
        {renderCloseIcon()}
        <WebView
          style={{
            // flex: 1,
            //resizeMode: 'stretch',
            marginTop: 20,
            marginHorizontal: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
          source={{ uri }}
        />
      </View>
    );
  };

  const postRatingGivenWEGEvent = (
    rating: string,
    reason: string,
    data:
      | getAppointmentData_getAppointmentData_appointmentsHistory
      | getPatinetAppointments_getPatinetAppointments_patinetAppointments = appointmentData
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.CONSULT_FEEDBACK_GIVEN]
      | CleverTapEvents[CleverTapEventName.CONSULT_FEEDBACK_GIVEN] = {
      'Doctor Name': g(data, 'doctorInfo', 'displayName')!,
      'Speciality ID': g(data, 'doctorInfo', 'specialty', 'id')!,
      'Speciality name': g(data, 'doctorInfo', 'specialty', 'name')!,
      'Doctor category': g(data, 'doctorInfo', 'doctorType')!,
      'Appointment datetime': moment(g(data, 'appointmentDateTime')).toDate(),
      'Consult mode': g(data, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Hospital name': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')!,
      'Hospital city': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'city')!,
      'Consult ID': g(data, 'id')!,
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      Rating: rating,
      'Rating reason': reason,
    };
    postWebEngageEvent(WebEngageEventName.CONSULT_FEEDBACK_GIVEN, eventAttributes);
    postCleverTapEvent(CleverTapEventName.CONSULT_FEEDBACK_GIVEN, eventAttributes);
  };

  const postAppointmentWEGEvents = (
    type:
      | WebEngageEventName.RESCHEDULE_CLICKED
      | WebEngageEventName.CANCEL_CONSULTATION_CLICKED
      | WebEngageEventName.CONTINUE_CONSULTATION_CLICKED
      | WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER
      | WebEngageEventName.CONSULTATION_RESCHEDULED_BY_CUSTOMER
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.RESCHEDULE_CLICKED]
      | WebEngageEvents[WebEngageEventName.CANCEL_CONSULTATION_CLICKED]
      | WebEngageEvents[WebEngageEventName.CONTINUE_CONSULTATION_CLICKED]
      | WebEngageEvents[WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER]
      | WebEngageEvents[WebEngageEventName.CONSULTATION_RESCHEDULED_BY_CUSTOMER] = {
      'Doctor Name': g(appointmentData, 'doctorInfo', 'displayName')!,
      'Speciality ID': g(appointmentData, 'doctorInfo', 'specialty', 'id')!,
      'Speciality Name': g(appointmentData, 'doctorInfo', 'specialty', 'name')!,
      'Doctor Category': g(appointmentData, 'doctorInfo', 'doctorType')!,
      'Consult Date Time': moment(g(appointmentData, 'appointmentDateTime')).toDate(),
      'Consult Mode':
        g(appointmentData, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Hospital Name': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'name'
      )!,
      'Hospital City': g(
        appointmentData,
        'doctorInfo',
        'doctorHospital',
        '0' as any,
        'facility',
        'city'
      )!,
      'Consult ID': g(appointmentData, 'id')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      'Secretary Name': g(secretaryData, 'name'),
      'Secretary Mobile Number': g(secretaryData, 'mobileNumber'),
      'Doctor Mobile Number': g(appointmentData, 'doctorInfo', 'mobileNumber')!,
    };
    postWebEngageEvent(type, eventAttributes);
  };

  const renderProgressBar = (position: number) => {
    return (
      <ConsultProgressBar
        style={{ marginTop: position === 0 ? 0 : 5 }}
        currentPosition={position}
      />
    );
  };

  const onPressCalender = () => {
    console.log('check  onPressCalender--- ');

    setShowRescheduleCancel(true);
    if (isAppointmentStartsInFifteenMin) {
      autoTriggerFifteenMinToAppointmentTimeMsg();
    }
    if (isAppointmentExceedsTenMin) {
      autoTriggerTenMinToAppointmentTimeMsg();
    }
  };

  const autoTriggerTenMinToAppointmentTimeMsg = () => {
    const checkMsgResult = messages.filter((obj: any) => {
      return obj.message === appointmentStartsInTenMin;
    });
    if (checkMsgResult?.length === 0) {
      const postTenMinAppointmentTime = moment(appointmentData?.appointmentDateTime)
        .add(10, 'minutes')
        .toDate();

      const automatedText = [
        `You are requested to wait till ${moment(postTenMinAppointmentTime).format(
          'h:mm a'
        )} for the doctor to start the consult.`,
      ];
      pubnub.publish(
        {
          channel: channel.current,
          message: {
            message: appointmentStartsInTenMin,
            automatedText: automatedText,
            id: doctorId,
            isTyping: true,
            messageDate: new Date(),
          },
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {}
      );
    }
  };

  const autoTriggerFifteenMinToAppointmentTimeMsg = () => {
    const checkMsgResult = messages.filter((obj: any) => {
      return obj.message === appointmentStartsInFifteenMin;
    });
    if (checkMsgResult?.length === 0) {
      const automatedText = [
        `Since your appointment with ${appointmentData?.doctorInfo?.displayName} is expected to start in less than 15 minutes you are requested to wait in the consult room. Please bear with us in case of slight delay.`,
      ];
      pubnub.publish(
        {
          channel: channel.current,
          message: {
            message: appointmentStartsInFifteenMin,
            automatedText: automatedText,
            id: doctorId,
            isTyping: true,
            messageDate: new Date(),
          },
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {}
      );
    }
  };

  const renderTapToReturnToCallView = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.tapToReturnToCallView}
        onPress={() => {
          setCallMinimize(false);
          changeVideoStyles();
          setHideStatusBar(true);
        }}
      >
        <Text style={styles.tapText}>Tap to return to call</Text>
      </TouchableOpacity>
    );
  };

  const renderReconnectingView = () => {
    return (
      <View style={[talkStyles, { zIndex: 1001 }]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>{callingScreenUI()}</View>
      </View>
    );
  };

  const renderManageCTA = (isDisabled: boolean = false) => {
    return (
      <View style={styles.manageCTAView}>
        <Button
          disabled={isDisabled}
          title={'MANAGE'}
          style={styles.manageBtn}
          titleTextStyle={theme.viewStyles.text('SB', 12, theme.colors.WHITE)}
          onPress={() => onPressCalender()}
        />
      </View>
    );
  };

  const publishTypingEvent = () => {
    if (canPublishTyping.current) {
      pubnub.signal({
        channel: channel.current,
        message: patientTypingOn,
      });
      canPublishTyping.current = false;
      setTimeout(() => {
        canPublishTyping.current = true;
      }, typingThrottleTime);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
      <ChatBotPopup
        visiblity={startAssessment}
        appointmentId={apptId}
        onCloseClicked={(data) => {
          setTimeout(() => {
            pubnub.publish(
              {
                channel: channel.current,
                message: {
                  message: JSON.stringify(data),
                  automatedText: jdAutoAssign,
                  id: patientId,
                  isVisible: true,
                  messageDate: new Date(),
                  cardType: 'patient',
                },
                storeInHistory: true,
                sendByPost: true,
              },
              (status, response) => {}
            );
            setDisplayChatQuestions(false);
            setStartAssessment(false);
          }, 1000);
        }}
      />
      <StatusBar hidden={hideStatusBar} />
      {isCancelVisible && (
        <CancelReasonPopup
          isCancelVisible={isCancelVisible}
          closePopup={() => setCancelVisible(false)}
          data={appointmentData}
          cancelSuccessCallback={() => {
            postAppointmentWEGEvents(WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER);
            postAppointmentCleverTapEvents(
              CleverTapEventName.CONSULT_CANCELLED_BY_PATIENT,
              appointmentData,
              currentPatient,
              secretaryData
            );
          }}
          navigation={props.navigation}
        />
      )}
      {Platform.OS === 'ios' ? (
        <View
          style={{
            width: width,
            height: 24,
            backgroundColor: '#f0f1ec',
            zIndex: 100,
            elevation: 1000,
          }}
        />
      ) : null}
      {displayUploadHealthRecords ? (
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1001,
            backgroundColor: '#000',
            opacity: 0.85,
            justifyContent: 'flex-end',
          }}
          onPress={() => {
            setDisplayUploadHealthRecords(false);
            AsyncStorage.setItem(appointmentData.id, appointmentData.id);
          }}
        >
          <View
            style={{
              left: 35,
            }}
          >
            <Text
              style={{
                ...theme.viewStyles.text('M', 15, '#fff', 1, undefined, -0.07),
                paddingRight: 61,
              }}
            >
              {'Upload and share your health records with doctor here.'}
            </Text>
            <FreeArrowIcon style={{ width: 33, height: 33, marginTop: 4, marginBottom: -6 }} />
          </View>
          <View
            style={{
              width: width,
              height: 66,
              backgroundColor: 'transparent',
              bottom: 0,
              top: isIphoneX() ? 2 : 0,
              paddingBottom: isIphoneX() ? 100 : 0,
            }}
          >
            <View style={{ flexDirection: 'row', width: width }}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={{
                  width: 58,
                  height: 50,
                  marginLeft: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                }}
                onPress={async () => {
                  CommonLogEvent(AppRoutes.ChatRoom, 'Upload document clicked.');
                  setDropdownVisible(!isDropdownVisible);
                  setDisplayUploadHealthRecords(false);
                  AsyncStorage.setItem(appointmentData.id, appointmentData.id);
                }}
              >
                <UploadHealthRecords
                  style={{ width: 21, height: 21, backgroundColor: 'transparent' }}
                />
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 7, '#fff', 1, undefined, -0.03),
                    marginTop: 2,
                    textAlign: 'center',
                  }}
                >
                  {'Upload Records'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
          backgroundColor: theme.colors.WHITE,
        }}
      >
        <Header
          title={'CONSULT ROOM'}
          leftIcon="backArrow"
          container={showProgressBarOnHeader.current ? styles.headerView : styles.headerShadowView}
          onPressLeftIcon={() => {
            props.navigation.goBack();
            if (!fromSearchAppointmentScreen && callhandelBack) {
              setDoctorJoinedChat && setDoctorJoinedChat(false);
            }
          }}
          rightIcon={
            <TouchableOpacity
              activeOpacity={0.5}
              disabled={doctorJoinedChat || status.current === STATUS.COMPLETED}
              onPress={() => onPressCalender()}
            >
              {doctorJoinedChat || status.current === STATUS.COMPLETED
                ? renderManageCTA(true)
                : renderManageCTA()}
            </TouchableOpacity>
          }
        />
        {showProgressBarOnHeader.current ? (
          <View
            style={{ backgroundColor: 'white', ...theme.viewStyles.cardViewStyle, borderRadius: 0 }}
          >
            {isProgressBarVisible.current && renderProgressBar(currentProgressBarPosition.current)}
          </View>
        ) : null}
        {renderChatHeader()}
        {callMinimize && renderTapToReturnToCallView()}
        {doctorJoined ? (
          <View
            style={{
              width: width,
              height: 44,
              flexDirection: 'row',
              alignItems: 'center',
              ...theme.viewStyles.cardViewStyle,
              borderRadius: 0,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 2,
              elevation: 17,
              zIndex: 100,
              backgroundColor: '#ff748e',
              position: 'absolute',
              top: isIphoneX() ? 74 : Platform.OS === 'ios' ? 54 : 54,
            }}
          >
            <Text
              style={{
                color: 'white',
                ...theme.fonts.IBMPlexSansMedium(13),
                marginLeft: 20,
              }}
            >
              {jrDoctorJoined.current
                ? `${appointmentData.doctorInfo.displayName}'s team doctor has joined`
                : `${appointmentData.doctorInfo.displayName} has joined!`}
            </Text>
          </View>
        ) : null}
        {renderChatView()}
        {Platform.OS == 'ios' ? (
          <>
            <TouchableOpacity
              activeOpacity={0.5}
              style={[styles.uploadButtonStyles, { opacity: disableChat ? 0.5 : 1 }]}
              onPress={async () => {
                if (!disableChat) {
                  CommonLogEvent(AppRoutes.ChatRoom, 'Upload document clicked.');
                  setDropdownVisible(!isDropdownVisible);
                }
              }}
            >
              <UploadHealthRecords
                style={{ width: 21, height: 21, backgroundColor: 'transparent' }}
              />
              <Text
                style={{
                  ...theme.viewStyles.text('M', 7, '#01475b', 1, undefined, -0.03),
                  marginTop: 2,
                  textAlign: 'center',
                }}
              >
                {'Upload Records'}
              </Text>
            </TouchableOpacity>
            {availableMessages == 0 && <ChatDisablePrompt followChatLimit={followChatLimit} />}
            <View
              style={[
                styles.inputMainContainer,
                { opacity: disableChat || availableMessages == 0 ? 0.5 : 1 },
              ]}
            >
              <View style={styles.textInputContainerStyles}>
                <TextInput
                  autoCorrect={false}
                  placeholder="Type here???"
                  multiline={true}
                  style={[styles.inputStyles, { height: Math.max(40, contentHeight) }]}
                  onContentSizeChange={(event) => {
                    setContentHeight(event.nativeEvent.contentSize.height);
                  }}
                  numberOfLines={6}
                  value={messageText}
                  blurOnSubmit={false}
                  // returnKeyType="send"
                  onChangeText={(value) => {
                    publishTypingEvent();
                    setMessageText(value);
                    setDropdownVisible(false);
                  }}
                  onFocus={() => setDropdownVisible(false)}
                  editable={!disableChat && availableMessages != 0}
                />
                <View
                  style={{
                    marginLeft: 20,
                    marginTop: 0,
                    height: 2,
                    width: width - 130,
                    backgroundColor: '#00b38e',
                  }}
                />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.5}
              style={[styles.sendButtonStyles, { opacity: disableChat ? 0.5 : 1 }]}
              onPress={async () => {
                if (!disableChat) {
                  const textMessage = messageText.trim();

                  if (textMessage.length == 0) {
                    Alert.alert('Apollo', 'Please write something to send message.');
                    CommonLogEvent(AppRoutes.ChatRoom, 'Please write something to send message.');
                    return;
                  }
                  CommonLogEvent(AppRoutes.ChatRoom, 'Message sent clicked');

                  send(textMessage);
                  setContentHeight(40);
                }
              }}
            >
              <ChatSend style={{ width: 24, height: 24, marginTop: 8, marginLeft: 14 }} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {availableMessages == 0 && <ChatDisablePrompt followChatLimit={followChatLimit} />}
            <TouchableOpacity
              activeOpacity={0.5}
              style={[styles.uploadButtonStyles, { bottom: 0, opacity: disableChat ? 0.5 : 1 }]}
              onPress={async () => {
                if (!disableChat) {
                  consultWebEngageEvents(WebEngageEventName.UPLOAD_RECORDS_CLICK_CHATROOM);
                  CommonLogEvent(AppRoutes.ChatRoom, 'Upload document clicked.');
                  setDropdownVisible(!isDropdownVisible);
                }
              }}
            >
              <UploadHealthRecords
                style={{ width: 21, height: 21, backgroundColor: 'transparent' }}
              />
              <Text
                style={{
                  ...theme.viewStyles.text('M', 7, '#01475b', 1, undefined, -0.03),
                  marginTop: 2,
                  textAlign: 'center',
                }}
              >
                {'Upload Records'}
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.inputMainContainer,
                { bottom: 0, opacity: disableChat || availableMessages == 0 ? 0.5 : 1 },
              ]}
            >
              <View style={styles.textInputContainerStyles}>
                <TextInput
                  autoCorrect={false}
                  placeholder="Type here???"
                  multiline={true}
                  style={[styles.inputStyles, { height: Math.max(40, contentHeight) }]}
                  onContentSizeChange={(event) => {
                    setContentHeight(event.nativeEvent.contentSize.height);
                  }}
                  numberOfLines={6}
                  value={messageText}
                  blurOnSubmit={false}
                  // returnKeyType="send"
                  onChangeText={(value) => {
                    publishTypingEvent();
                    setMessageText(value);
                    setDropdownVisible(false);
                  }}
                  onFocus={() => setDropdownVisible(false)}
                  editable={!disableChat && availableMessages != 0}
                />
                <View
                  style={{
                    marginLeft: 20,
                    marginTop: 0,
                    height: 2,
                    width: width - 130,
                    backgroundColor: '#00b38e',
                  }}
                />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.5}
              style={[styles.sendButtonStyles, { bottom: 0, opacity: disableChat ? 0.5 : 1 }]}
              onPress={async () => {
                if (!disableChat) {
                  const textMessage = messageText.trim();
                  if (textMessage.length == 0) {
                    Alert.alert('Apollo', 'Please write something to send message.');
                    CommonLogEvent(AppRoutes.ChatRoom, 'Please write something to send message.');
                    return;
                  }
                  CommonLogEvent(AppRoutes.ChatRoom, 'Message sent clicked');

                  send(textMessage);
                  setContentHeight(40);
                }
              }}
            >
              <ChatSend style={{ width: 24, height: 24, marginTop: 8, marginLeft: 14 }} />
            </TouchableOpacity>
          </>
        )}
        {doctorTyping && (
          <Text style={styles.doctorTypingText}>{string.appointments.doctorTyping}</Text>
        )}
        {doctorTyping && (
          <Text style={styles.doctorTypingText}>{string.appointments.doctorTyping}</Text>
        )}
      </SafeAreaView>
      {showRescheduleCancel && (
        <RescheduleCancelPopup
          onPressCancelAppointment={() => {
            CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'CancelAppointment Clicked');
            setShowCancelPopup(true);
            setShowRescheduleCancel(false);
          }}
          onPressRescheduleAppointment={() => {
            postAppointmentWEGEvents(WebEngageEventName.RESCHEDULE_CLICKED);
            postAppointmentCleverTapEvents(
              CleverTapEventName.CONSULT_RESCHEDULE_CLICKED,
              appointmentData,
              currentPatient,
              secretaryData
            );
            appointmentData?.doctorInfo?.allowBookingRequest
              ? props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
                  doctorId: doctorId,
                  cleverTapAppointmentAttributes: {
                    source: 'Appointment CTA',
                    appointmentCTA: 'Inside consult room',
                  },
                })
              : setShowReschedulePopup(true);
            setShowRescheduleCancel(false);
          }}
          closeModal={() => setShowRescheduleCancel(false)}
          appointmentDiffMin={appointmentDiffMin}
          showNetworkTestCTA={true}
          appointmentDateTime={appointmentData?.appointmentDateTime}
          isAppointmentStartsInFifteenMin={isAppointmentStartsInFifteenMin}
          isAppointmentExceedsTenMin={isAppointmentExceedsTenMin}
        />
      )}
      {showCancelPopup && (
        <CancelAppointmentPopup
          data={appointmentData}
          navigation={props.navigation}
          title={cancelAppointmentTitle}
          customTitle={string.common.cancelAppointmentTitleHeading}
          onPressBack={() => setShowCancelPopup(false)}
          onPressReschedule={() => {
            postAppointmentWEGEvents(WebEngageEventName.RESCHEDULE_CLICKED);
            postAppointmentCleverTapEvents(
              CleverTapEventName.CONSULT_RESCHEDULE_CLICKED,
              appointmentData,
              currentPatient,
              secretaryData
            );
            CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'RESCHEDULE_INSTEAD_Clicked');
            setShowCancelPopup(false);
            appointmentData?.doctorInfo?.allowBookingRequest
              ? props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
                  doctorId: doctorId,
                  cleverTapAppointmentAttributes: {
                    source: 'Appointment CTA',
                    appointmentCTA: 'Inside consult room',
                  },
                })
              : setShowReschedulePopup(true);
          }}
          onPressCancel={() => {
            postAppointmentWEGEvents(WebEngageEventName.CANCEL_CONSULTATION_CLICKED);
            postAppointmentCleverTapEvents(
              CleverTapEventName.CONSULT_CANCEL_CLICKED_BY_PATIENT,
              appointmentData,
              currentPatient,
              secretaryData,
              {
                circleSubscriptionId: circleSubscriptionId,
                circleSubPlanId: circleSubPlanId,
              }
            );
            CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'CANCEL CONSULT_CLICKED');
            setShowCancelPopup(false);
            setCancelVisible(true); //to show the reasons for cancelling the consultation
          }}
        />
      )}
      {showReschedulePopup && (
        <CheckReschedulePopup
          data={appointmentData}
          navigation={props.navigation}
          secretaryData={secretaryData}
          closeModal={() => setShowReschedulePopup(false)}
          cancelSuccessCallback={() => {
            postAppointmentWEGEvents(WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER);
            postAppointmentCleverTapEvents(
              CleverTapEventName.CONSULT_CANCELLED_BY_PATIENT,
              appointmentData,
              currentPatient,
              secretaryData
            );
            setShowCancelPopup(false);
          }}
          rescheduleSuccessCallback={() => {
            postAppointmentWEGEvents(WebEngageEventName.CONSULTATION_RESCHEDULED_BY_CUSTOMER);
            postAppointmentCleverTapEvents(
              CleverTapEventName.CONSULT_RESCHEDULED_BY_THE_PATIENT,
              appointmentData,
              currentPatient,
              secretaryData
            );
          }}
        />
      )}
      {(isCall || isAudioCall) && VideoCall()}
      {isCallReconnecting.current && renderReconnectingView()}
      {/* {isAudioCall && AudioCall()} */}
      {transferAccept && (
        <BottomPopUp
          title={'Please wait :)'}
          description={`We???re taking you to Dr. ${transferDcotorName}'s consult room.`}
        >
          <Loader
            style={{
              marginTop: 19,
              marginBottom: 21,
              marginLeft: width - 96,
              width: 76,
              height: 26,
              resizeMode: 'contain',
            }}
          />
        </BottomPopUp>
      )}
      {bottompopup && (
        <BottomPopUp
          title={'Hi:)'}
          description="Opps ! The selected slot is unavailable. Please choose a different one"
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={0.5}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottompopup(false);
                navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {wrongFormat && (
        <BottomPopUp
          title={'Hi:)'}
          description="Opps ! The selected jpg format is unsupport. Please choose a different one"
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={0.5}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setwrongFormat(false);
                setDropdownVisible(false);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showDoctorNoShowAlert && (
        <BottomPopUp
          title={`Hi ${userName},`}
          description={`Due to an emergency, ${appointmentData.doctorInfo.displayName} had to reschedule your appointment to the next available slot. Confirm Slot`}
        >
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 20,
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginVertical: 18,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.claimStyles}
              onPress={() => {
                setShowDoctorNoShowAlert(false);
              }}
            >
              <Text style={styles.rescheduleTextStyles}>{'CLAIM REFUND'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.rescheduletyles}
              onPress={() => {
                NextAvailableSlot(appointmentData, 'Transfer', true);
                setShowDoctorNoShowAlert(false);
              }}
            >
              <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>{'RESCHEDULE'}</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showPopup && (
        <BottomPopUp
          title={`Hi ${userName}`}
          description={`we???re really sorry. ${appointmentData.doctorInfo.displayName} will not be able to make it for this appointment. Any payment that you have made for this consultation would be refunded in 2-4 working days. We request you to please book appointment with any of our other Apollo certified doctors`}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={0.5}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottompopup(false);
                navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showCallAbandmentPopup && (
        <BottomPopUp
          title={`Hi ${userName}`}
          description={`we???re really sorry. ${appointmentData.doctorInfo.displayName} has to reschedule your call due to some technical issues. Please reschedule the appointment.`}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={0.5}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottompopup(false);
                navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {sucesspopup && (
        <BottomPopUp title={`Hi, ${userName} :)`} description={'Appointment sucessfully cancelled'}>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 20,
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <View style={{ height: 60 }}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.gotItStyles}
                onPress={() => {
                  setSucessPopup(false);
                  navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
                }}
              >
                <Text style={styles.gotItTextStyles}>{'OK, GOT IT'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomPopUp>
      )}
      {displayoverlay && transferData && (
        <OverlayRescheduleView
          setdisplayoverlay={() => setdisplayoverlay(false)}
          navigation={props.navigation}
          doctor={transferData ? transferData.doctorInfo : appointmentData.doctorInfo}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={
            transferData
              ? transferData.doctorInfo.doctorHospital
              : appointmentData.doctorInfo.doctorHospital
          }
          doctorId={doctorScheduleId}
          renderTab={
            appointmentData.appointmentType === 'ONLINE' ? 'Consult Online' : 'Visit Clinic'
          }
          rescheduleCount={newRescheduleCount && newRescheduleCount}
          appointmentId={
            transferData
              ? transferData.appointmentId
                ? transferData.appointmentId
                : transferData.id
              : appointmentData.id
          }
          secretaryData={secretaryData}
          data={transferData ? transferData : appointmentData}
          bookFollowUp={false}
          KeyFollow={'RESCHEDULE'}
          isfollowupcount={0}
          isInitiatedByDoctor={rescheduleInitiatedBy === REQUEST_ROLES.DOCTOR ? true : false}
        />
      )}
      {uploadPrescriptionPopup()}
      {isSelectPrescriptionVisible && renderPrescriptionModal()}
      {patientImageshow && imageOpen()}
      {showweb && showWeimageOpen()}
      <FeedbackPopup
        onComplete={(ratingStatus, ratingOption) => {
          fetchAppointmentData();
          postRatingGivenWEGEvent(ratingStatus!, ratingOption);
          setShowFeedback(false);
          showAphAlert!({
            title: 'Thanks :)',
            description: 'Your feedback has been submitted. Thanks for your time.',
          });
        }}
        transactionId={apptId}
        title="We value your feedback! :)"
        description="How was your overall experience with the following consultation ???"
        info={{
          title: `${g(appointmentData, 'doctorInfo', 'displayName') || ''}`,
          description: `Today, ${moment(appointmentData.appointmentDateTime).format('hh:mm A')}`,
          photoUrl: `${g(appointmentData, 'doctorInfo', 'photoUrl') || ''}`,
        }}
        type={FEEDBACKTYPE.CONSULT}
        isVisible={showFeedback}
        containerStyle={{ paddingTop: 100 }}
      />
      {loading && <Spinner />}
      {showPDF && (
        <RenderPdf
          uri={url}
          title={fileNamePDF || 'Document.pdf'}
          isPopup={true}
          setDisplayPdf={() => {
            setShowPDF(false);
            setUrl('');
          }}
          navigation={props.navigation}
        />
      )}
      {showConnectAlertPopup && !callAccepted && (
        <CustomAlert
          description={`Have you consulted with ${appointmentData.doctorInfo.displayName} before?`}
          onNoPress={() => {
            setShowConnectAlertPopup(false);
            getUpdateExternalConnect(false);
          }}
          onYesPress={() => {
            setShowConnectAlertPopup(false);
            getUpdateExternalConnect(true);
          }}
        />
      )}
    </View>
  );
};
