import { styles } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView.styles';
import { DiagnosisCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosisCard';
import { DiagnosicsCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosticsCard';
import { SymptonsCard } from '@aph/mobile-doctors/src/components/ConsultRoom/SymptonsCard';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AddConditionPopUp } from '@aph/mobile-doctors/src/components/ui/AddConditionPopUp';
import { AddIconLabel } from '@aph/mobile-doctors/src/components/ui/AddIconLabel';
import { AddInstructionPopUp } from '@aph/mobile-doctors/src/components/ui/AddInstructionPopUp';
import { AddMedicinePopUp } from '@aph/mobile-doctors/src/components/ui/AddMedicinePopUp';
import { AddSymptomPopUp } from '@aph/mobile-doctors/src/components/ui/AddSymptomPopUp';
import { AddTestPopup } from '@aph/mobile-doctors/src/components/ui/AddTestPopup';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import {
  AddPlus,
  Audio,
  CheckboxSelected,
  CheckboxUnSelected,
  ClosePopup,
  DiagonisisRemove,
  DropdownGreen,
  Edit,
  End,
  FileBig,
  Green,
  GreenOnline,
  GreenRemove,
  InpersonIcon,
  InpersonWhiteIcon,
  PhysicalIcon,
  RoundCallIcon,
  RoundVideoIcon,
  Start,
  ToogleOff,
  ToogleOn,
  UserPlaceHolder,
  Video,
  InfoGreen,
  Dropdown,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { MaterialMenu, OptionsObject } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import { SelectableButton } from '@aph/mobile-doctors/src/components/ui/SelectableButton';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-doctors/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  END_APPOINTMENT_SESSION,
  UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/EndAppointmentSession';
import {
  GetCaseSheet_getCaseSheet,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_healthVault,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_caseSheetDetails_removedMedicinePrescription,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteAdviceList';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import { GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteTestList';
import {
  APPOINTMENT_TYPE,
  Gender,
  ModifyCaseSheetInput,
  REQUEST_ROLES,
  STATUS,
  BOOKINGSOURCE,
  DEVICETYPE,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  UpdatePatientPrescriptionSentStatus,
  UpdatePatientPrescriptionSentStatusVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdatePatientPrescriptionSentStatus';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { getPrismUrls } from '@aph/mobile-doctors/src/helpers/clientCalls';
import {
  g,
  medicineDescription,
  messageCodes,
  isValidSearch,
} from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { FastImageLoading } from '@aph/mobile-doctors/src/components/ui/FastImageLoading';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  NavigationParams,
  NavigationRoute,
  NavigationScreenProp,
  NavigationScreenProps,
} from 'react-navigation';
import { ReferralSelectPopup } from '@aph/mobile-doctors/src/components/ConsultRoom/ReferralSelectPopup';
import firebase from 'react-native-firebase';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { AddMedicinePrescriptionPopUp } from '@aph/mobile-doctors/src/components/ui/AddMedicinePrescriptionPopUp';
import {
  postWebEngageEvent,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-doctors/src/helpers/WebEngageHelper';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');

interface DataPair {
  key: string;
  value: string;
}

export interface CaseSheetViewProps extends NavigationScreenProps {
  caseSheetVersion: number;
  inCall: boolean;
  onStartConsult: (successCallback?: () => void) => void;
  onEndConsult: () => void;
  onStopConsult: () => void;
  startConsult: boolean;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  overlayDisplay: (renderDisplay: React.ReactNode) => void;
  messagePublish?: (message: any) => void;
  favList:
    | (GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList | null)[]
    | null
    | undefined;
  favMed:
    | (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[]
    | null
    | undefined;
  favTest:
    | (GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList | null)[]
    | null
    | undefined;

  caseSheet: GetCaseSheet_getCaseSheet | null | undefined;
  caseSheetEdit: boolean;
  setCaseSheetEdit: Dispatch<React.SetStateAction<boolean>>;
  showEditPreviewButtons: boolean;
  setShowEditPreviewButtons: Dispatch<React.SetStateAction<boolean>>;
  getdetails: () => void;
  saveDetails: (
    showLoading: boolean,
    inputdata?: ModifyCaseSheetInput,
    callBack?: () => void
  ) => void;
  symptonsData: (GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null;
  setSymptonsData: React.Dispatch<
    React.SetStateAction<(GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null>
  >;
  pastList: (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null;
  setPastList: React.Dispatch<
    React.SetStateAction<(GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null>
  >;
  lifeStyleData:
    | (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle | null)[]
    | null
    | undefined;
  setLifeStyleData: React.Dispatch<
    React.SetStateAction<
      | (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle | null)[]
      | null
      | undefined
    >
  >;
  medicalHistory:
    | GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory
    | null
    | undefined;
  setMedicalHistory: React.Dispatch<
    React.SetStateAction<
      | GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory
      | null
      | undefined
    >
  >;
  familyValues: string;
  setFamilyValues: React.Dispatch<React.SetStateAction<string>>;
  patientDetails: GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails | null | undefined;
  setPatientDetails: React.Dispatch<
    React.SetStateAction<
      GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails | null | undefined
    >
  >;
  healthWalletArrayData:
    | (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_healthVault | null)[]
    | null;
  setHealthWalletArrayData: React.Dispatch<
    React.SetStateAction<
      (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_healthVault | null)[] | null
    >
  >;
  tests: {
    itemname: string;
    testInstruction?: string;
    isSelected: boolean;
  }[];
  setTests: React.Dispatch<
    React.SetStateAction<
      {
        itemname: string;
        testInstruction?: string;
        isSelected: boolean;
      }[]
    >
  >;
  addedAdvices: DataPair[];
  setAddedAdvices: React.Dispatch<React.SetStateAction<DataPair[]>>;
  juniordoctornotes: string | null;
  setJuniorDoctorNotes: React.Dispatch<React.SetStateAction<string | null>>;
  diagnosisData: (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null;
  setDiagnosisData: React.Dispatch<
    React.SetStateAction<(GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null>
  >;
  medicinePrescriptionData:
    | (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[]
    | null
    | undefined;
  setMedicinePrescriptionData: React.Dispatch<
    React.SetStateAction<
      (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null | undefined
    >
  >;
  selectedMedicinesId: string[];
  setSelectedMedicinesId: React.Dispatch<React.SetStateAction<string[]>>;
  existingMedicineId: string[];
  removedMedicinePrescriptionData:
    | (GetCaseSheet_getCaseSheet_caseSheetDetails_removedMedicinePrescription | null)[]
    | null;
  setRemovedMedicinePrescriptionData: React.Dispatch<
    React.SetStateAction<
      (GetCaseSheet_getCaseSheet_caseSheetDetails_removedMedicinePrescription | null)[] | null
    >
  >;
  followupChatDays: OptionsObject;
  setFollowupChatDays: React.Dispatch<React.SetStateAction<OptionsObject>>;
  doctorNotes: string;
  setDoctorNotes: React.Dispatch<React.SetStateAction<string>>;
  displayId: string;
  setDisplayId: React.Dispatch<React.SetStateAction<string>>;
  prescriptionPdf: string;
  setPrescriptionPdf: React.Dispatch<React.SetStateAction<string>>;
  openFiles: (
    url?: string | undefined,
    type?: 'pdf' | 'image' | 'other' | undefined,
    isChatRoom?: boolean | undefined
  ) => void;
  chatFiles?: any[];
  selectedReferral: OptionsObject;
  setSelectedReferral: React.Dispatch<React.SetStateAction<OptionsObject>>;
  referralReason: string;
  setReferralReason: React.Dispatch<React.SetStateAction<string>>;
}

export const CaseSheetView: React.FC<CaseSheetViewProps> = (props) => {
  const Appintmentdatetimeconsultpage = props.navigation.getParam('Appintmentdatetime');

  const AppId = props.navigation.getParam('AppId');
  const [stastus, setStatus] = useState<STATUS | undefined>(
    props.navigation.getParam('AppointmentStatus')
  );

  const [showButtons, setShowButtons] = useState(props.startConsult || false);
  const [show, setShow] = useState(false);
  const [vitalsShow, setVitalsShow] = useState(false);
  const [juniorshow, setJuniorShow] = useState(false);
  const [patientHistoryshow, setpatientHistoryshow] = useState(false);
  const [patientHealthWallet, setPatientHealthWallet] = useState(false);
  const [showdiagonisticPrescription, setshowdiagonisticPrescription] = useState(false);
  const [medicinePrescription, setMedicinePrescription] = useState(false);
  const [adviceInstructions, setAdviceInstructions] = useState(false);
  const [referral, setReferral] = useState(false);
  const [followup, setFollowUp] = useState(false);

  const [diagnosisView, setDiagnosisView] = useState(false);

  // This is dependent : 1728 // const [consultationPayType, setConsultationPayType] = useState<'PAID' | 'FREE' | ''>('');

  const [folloUpNotes, setFolloUpNotes] = useState<string>('');

  const { showAphAlert, setLoading, loading, hideAphAlert } = useUIElements();
  const { doctorDetails, specialties } = useAuth();

  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [yesorno, setyesorno] = useState<boolean>(false);
  const client = useApolloClient();

  const {
    onEndConsult,
    saveDetails,
    caseSheet,
    caseSheetEdit,
    setCaseSheetEdit,
    showEditPreviewButtons,
    setShowEditPreviewButtons,
    symptonsData,
    setSymptonsData,
    pastList,
    lifeStyleData,
    setLifeStyleData,
    medicalHistory,
    setMedicalHistory,
    familyValues,
    setFamilyValues,
    patientDetails,
    healthWalletArrayData,
    tests,
    setTests,
    addedAdvices,
    setAddedAdvices,
    juniordoctornotes,
    diagnosisData,
    setDiagnosisData,
    medicinePrescriptionData,
    setMedicinePrescriptionData,
    selectedMedicinesId,
    setSelectedMedicinesId,
    followupChatDays,
    setFollowupChatDays,
    doctorNotes,
    setDoctorNotes,
    displayId,
    prescriptionPdf,
    setPrescriptionPdf,
    chatFiles,
    openFiles,
    selectedReferral,
    setSelectedReferral,
    referralReason,
    setReferralReason,
    inCall,
    caseSheetVersion,
    existingMedicineId,
    removedMedicinePrescriptionData,
    setRemovedMedicinePrescriptionData,
  } = props;

  const basicAppointmentData = {
    'Doctor name': g(doctorDetails, 'fullName') || '',
    'Patient name': `${g(caseSheet, 'caseSheetDetails', 'patientDetails', 'firstName')} ${g(
      caseSheet,
      'caseSheetDetails',
      'patientDetails',
      'lastName'
    )}`.trim(),
    'Patient mobile number':
      g(caseSheet, 'caseSheetDetails', 'patientDetails', 'mobileNumber') || '',
    'Doctor Mobile number': g(doctorDetails, 'mobileNumber') || '',
    'Appointment Date time':
      g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentDateTime') || '',
    'Appointment display ID': g(caseSheet, 'caseSheetDetails', 'appointment', 'displayId') || '',
    'Appointment ID': AppId || g(caseSheet, 'caseSheetDetails', 'appointment', 'id') || '',
  };

  const sendToPatientAction = (callBack?: () => void) => {
    setLoading && setLoading(true);
    client
      .mutate<UpdatePatientPrescriptionSentStatus, UpdatePatientPrescriptionSentStatusVariables>({
        mutation: UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS,
        variables: {
          caseSheetId: g(props.caseSheet, 'caseSheetDetails', 'id') || '',
          sentToPatient: true,
        },
      })
      .then((_data) => {
        if (g(_data, 'data', 'updatePatientPrescriptionSentStatus', 'success')) {
          setPrescriptionPdf(
            `${AppConfig.Configuration.DOCUMENT_BASE_URL}${g(
              _data,
              'data',
              'updatePatientPrescriptionSentStatus',
              'blobName'
            )}`
          );
          setLoading && setLoading(false);
          followUpMessage(
            `${AppConfig.Configuration.DOCUMENT_BASE_URL}${g(
              _data,
              'data',
              'updatePatientPrescriptionSentStatus',
              'blobName'
            )}`
          );
          showAphAlert &&
            showAphAlert({
              title: 'Hi',
              description: 'Prescription has been sent to patient successfully',
              onPressOk: () => {
                props.navigation.popToTop();
                hideAphAlert && hideAphAlert();
              },
              unDismissable: true,
            });
          callBack && callBack();
        }
        firebase.analytics().logEvent('Doctor_send_prescription', {
          doctorName: doctorDetails ? doctorDetails.fullName : 'doctor',
          patientName: patientDetails
            ? `${patientDetails.firstName} ${patientDetails.lastName}`
            : 'patient',
          caseSheet: caseSheet,
        });
      })
      .catch((e) => {
        setLoading && setLoading(false);
        showAphAlert &&
          showAphAlert({
            title: strings.common.uh_oh,
            description: strings.common.oops_msg,
          });
      });
  };

  useEffect(() => {
    if (
      g(props.caseSheet, 'caseSheetDetails', 'appointment', 'status') === STATUS.COMPLETED &&
      !g(props.caseSheet, 'caseSheetDetails', 'sentToPatient')
    ) {
      setShowEditPreviewButtons(true);
      // prescriptionView();
    }
    if (g(props.caseSheet, 'caseSheetDetails', 'sentToPatient')) {
      setShowEditPreviewButtons(false);
    }
    setStatus(g(props.caseSheet, 'caseSheetDetails', 'appointment', 'status'));
  }, [props.caseSheet]);

  const followUpMessage = (pdf?: string) => {
    const followupObj = {
      appointmentId: AppId,
      folloupDateTime: '',
      doctorId: g(props.caseSheet, 'caseSheetDetails', 'doctorId'),
      caseSheetId: g(props.caseSheet, 'caseSheetDetails', 'id'),
      doctorInfo: doctorDetails,
      pdfUrl: pdf || prescriptionPdf,
      isResend: pdf === undefined,
    };
    postWebEngageEvent(
      caseSheetVersion > 1
        ? WebEngageEventName.DOCTOR_ISSUE_NEW_PRESCRIPTION
        : pdf
        ? WebEngageEventName.DOCTOR_SEND_PRESCRIPTION
        : WebEngageEventName.DOCTOR_RESEND_PRESCRIPTION,
      {
        ...basicAppointmentData,
        'Blob URL': pdf || prescriptionPdf,
      } as WebEngageEvents[WebEngageEventName.DOCTOR_SEND_PRESCRIPTION]
    );

    props.messagePublish &&
      props.messagePublish({
        id: followupObj.doctorId,
        message: messageCodes.followupconsult,
        transferInfo: followupObj,
        messageDate: new Date(),
        sentBy: REQUEST_ROLES.DOCTOR,
      });
  };
  const prescriptionView = () => {
    if (patientDetails) {
      props.navigation.navigate(AppRoutes.PreviewPrescription, {
        caseSheet: caseSheet,
        medication: medicalHistory,
        complaints: symptonsData,
        diagnosis: diagnosisData,
        medicine:
          (medicinePrescriptionData &&
            medicinePrescriptionData.filter(
              (med) =>
                selectedMedicinesId.findIndex((i) => i === (med && (med.externalId || med.id))) >= 0
            )) ||
          [],
        removedMedicine: removedMedicinePrescriptionData,
        tests: tests
          .filter((i) => i.isSelected)
          .map((i) => ({ itemname: i.itemname, testInstruction: i.testInstruction })),
        advice: addedAdvices.map((i) => ({ instruction: i.value })),
        followUp: {
          doFollowUp: followupChatDays.key > 0,
          followUpDays: followupChatDays.key,
        },
        referralData: {
          referTo: selectedReferral.key !== '-1' ? selectedReferral.value.toString() : null,
          referReason: selectedReferral.key !== '-1' ? referralReason : null,
        },
        onEditPress: () => {
          props.setCaseSheetEdit(true);
          setShowEditPreviewButtons(true);
          props.navigation.pop();
        },
        onSendPress: () => {
          setShowButtons(true);
          saveDetails(true, undefined, () => {
            sendToPatientAction(() => {
              props.onStopConsult();
            });
          });
        },
      });
    }
  };

  const endConsult = () => {
    setLoading && setLoading(true);
    client
      .mutate<EndAppointmentSession, EndAppointmentSessionVariables>({
        mutation: END_APPOINTMENT_SESSION,
        variables: {
          endAppointmentSessionInput: {
            appointmentId: AppId,
            status: STATUS.COMPLETED,
            callSource: BOOKINGSOURCE.MOBILE,
            deviceType: Platform.OS === 'ios' ? DEVICETYPE.IOS : DEVICETYPE.ANDROID,
            appVersion:
              Platform.OS === 'ios'
                ? AppConfig.Configuration.iOS_Version
                : AppConfig.Configuration.Android_Version,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setCaseSheetEdit(false);
        setLoading && setLoading(false);
        props.overlayDisplay(null);
        prescriptionView();
        setShowEditPreviewButtons(true);
        onEndConsult();
        // endCallNotification();
        const text = {
          id: g(props.caseSheet, 'caseSheetDetails', 'doctorId'),
          message: messageCodes.appointmentComplete,
          isTyping: true,
          messageDate: new Date(),
          sentBy: REQUEST_ROLES.DOCTOR,
        };
        props.messagePublish && props.messagePublish(text);
      })
      .catch((e) => {
        setLoading && setLoading(false);
        props.overlayDisplay(null);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        showAphAlert &&
          showAphAlert({
            title: strings.common.uh_oh,
            description: strings.common.oops_msg,
          });
      });
  };

  const [enableConsultButton, setEnableConsultButton] = useState(false);

  useEffect(() => {
    const enableStates = ['NEW', 'TRANSFER', 'RESCHEDULE'];
    const appointmentState = g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentState');
    if (enableStates.includes(appointmentState || '')) {
      setEnableConsultButton(true);
    } else {
      setEnableConsultButton(false);
    }
  }, []);

  const renderButtonsView = () => {
    return (
      <StickyBottomComponent
        style={{ backgroundColor: '#f0f4f5', justifyContent: 'center', paddingTop: 0 }}
      >
        <View>
          {!showButtons ? (
            <View style={styles.footerButtonsContainersave}>
              <Button
                title={strings.buttons.start_consult}
                disabled={!enableConsultButton}
                buttonIcon={
                  <Start style={{ right: 10, opacity: enableConsultButton ? 1 : 0.25 }} />
                }
                onPress={() => {
                  props.onStartConsult(() => {
                    setShowButtons(true);
                  });
                }}
              />
            </View>
          ) : (
            <View style={styles.footerButtonsContainer}>
              <Button
                onPress={() => {
                  setShowButtons(true);
                  saveDetails(true);
                }}
                title={strings.buttons.save}
                titleTextStyle={styles.buttonTextStyle}
                variant="white"
                style={[styles.buttonsaveStyle, { marginRight: 16 }]}
              />
              <Button
                title={strings.buttons.end_consult}
                buttonIcon={<End />}
                onPress={() => {
                  if (
                    selectedReferral.key === '-1' ||
                    (selectedReferral.key !== '-1' && referralReason)
                  ) {
                    setyesorno(true);
                  } else {
                    showAphAlert &&
                      showAphAlert({
                        title: strings.common.alert,
                        description: strings.alerts.missing_referral_description,
                      });
                  }
                }}
                style={styles.buttonendStyle}
              />
            </View>
          )}
        </View>
      </StickyBottomComponent>
    );
  };

  const renderCompletedButtons = () => {
    if (!g(props.caseSheet, 'caseSheetDetails', 'sentToPatient')) {
      return (
        <StickyBottomComponent
          style={{
            backgroundColor: '#f0f4f5',
            paddingTop: 0,
          }}
        >
          <View style={styles.footerButtonsContainer}>
            <Button
              onPress={() => {
                props.setCaseSheetEdit(true);
                setShowEditPreviewButtons(true);
              }}
              title={'EDIT CASE SHEET'}
              titleTextStyle={styles.buttonTextStyle}
              variant="white"
              style={[styles.buttonsaveStyle, { marginRight: 16 }]}
            />
            <Button
              title={'SEND TO PATIENT'}
              onPress={() => {
                sendToPatientAction();
              }}
              style={styles.buttonendStyle}
            />
          </View>
        </StickyBottomComponent>
      );
    } else {
      return (
        <StickyBottomComponent
          style={{
            backgroundColor: '#f0f4f5',
            justifyContent: 'center',
            paddingTop: 0,
          }}
        >
          <View style={styles.footerButtonsContainersave}>
            <Button
              title={'RESEND PRESCRIPTION'}
              onPress={() => {
                followUpMessage();
                showAphAlert &&
                  showAphAlert({
                    title: 'Hi',
                    description: 'Prescription has been sent to patient successfully',
                    onPressOk: () => {
                      props.navigation.popToTop();
                      hideAphAlert && hideAphAlert();
                    },
                    unDismissable: true,
                  });
              }}
              variant="white"
            />
          </View>
        </StickyBottomComponent>
      );
    }
  };

  const renderEditPreviewButtons = () => {
    return (
      <StickyBottomComponent
        style={{ backgroundColor: '#f0f4f5', justifyContent: 'center', paddingTop: 0 }}
      >
        <View style={styles.footerButtonsContainer}>
          <Button
            title={caseSheetEdit ? 'SAVE' : 'EDIT CASE SHEET'}
            onPress={() => {
              if (caseSheetEdit) {
                if (
                  selectedReferral.key === '-1' ||
                  (selectedReferral.key !== '-1' && referralReason)
                ) {
                  setShowButtons(true);
                  saveDetails(true, undefined, () => {
                    props.setCaseSheetEdit(false);
                    setLoading && setLoading(false);
                  });
                } else {
                  showAphAlert &&
                    showAphAlert({
                      title: strings.common.alert,
                      description: strings.alerts.missing_referral_description,
                    });
                }
              } else {
                props.setCaseSheetEdit(true);
                setShowEditPreviewButtons(true);
              }
            }}
            titleTextStyle={styles.buttonTextStyle}
            variant="white"
            style={[styles.buttonsaveStyle, { marginRight: 16 }]}
          />
          <Button
            title={'PREVIEW PRESCRIPTION'}
            onPress={() => {
              if (
                selectedReferral.key === '-1' ||
                (selectedReferral.key !== '-1' && referralReason)
              ) {
                setShowButtons(true);
                saveDetails(false);
                prescriptionView();
              } else {
                showAphAlert &&
                  showAphAlert({
                    title: strings.common.alert,
                    description: strings.alerts.missing_referral_description,
                  });
              }
            }}
            style={styles.buttonendStyle}
          />
        </View>
      </StickyBottomComponent>
    );
  };

  const renderSymptonsView = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.chief_complaints}
          collapse={show}
          onPress={() => setShow(!show)}
        >
          {symptonsData == null || (symptonsData && symptonsData.length == 0) ? (
            <Text style={[styles.symptomsText, { textAlign: 'center' }]}>
              {strings.common.no_data}
            </Text>
          ) : (
            symptonsData.map(
              (showdata: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null) => {
                if (showdata) {
                  return (
                    <View>
                      <View
                        style={{
                          marginLeft: 20,
                          marginRight: 20,
                          marginBottom: 12,
                        }}
                      >
                        <SymptonsCard
                          diseaseName={showdata.symptom}
                          onPressIcon={() =>
                            caseSheetEdit &&
                            setSymptonsData([
                              ...symptonsData.filter((i) => i && i.symptom !== showdata.symptom),
                            ])
                          }
                          onPressEditIcon={() =>
                            caseSheetEdit &&
                            props.overlayDisplay(
                              <AddSymptomPopUp
                                data={showdata}
                                onDone={(data) => {
                                  setSymptonsData([
                                    ...(symptonsData || []).filter(
                                      (i) => i && i.symptom !== showdata.symptom
                                    ),
                                    data,
                                  ]);
                                }}
                                onClose={() => props.overlayDisplay(null)}
                              />
                            )
                          }
                          icon={caseSheetEdit && <GreenRemove style={{ height: 20, width: 20 }} />}
                          days={
                            showdata.since
                              ? `${strings.common.since} : ${showdata.since}`
                              : undefined
                          }
                          howoften={
                            showdata.howOften
                              ? `${strings.common.how_often}: ${showdata.howOften}`
                              : undefined
                          }
                          seviarity={
                            showdata.severity
                              ? `${strings.common.severity} :${showdata.severity}`
                              : undefined
                          }
                          editIcon={caseSheetEdit && <Edit style={{ height: 20, width: 20 }} />}
                          details={
                            showdata.details
                              ? `${strings.common.details} :${showdata.details}`
                              : undefined
                          }
                        />
                      </View>
                    </View>
                  );
                }
              }
            )
          )}
          {caseSheetEdit && (
            <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
              <AddPlus />
              <TouchableOpacity
                onPress={() =>
                  props.overlayDisplay(
                    <AddSymptomPopUp
                      onDone={(data) => {
                        if (
                          (symptonsData || []).findIndex((i) => i && i.symptom === data.symptom) < 0
                        ) {
                          setSymptonsData([...(symptonsData || []), data]);
                        } else {
                          Alert.alert('', strings.alerts.already_exists);
                        }
                      }}
                      onClose={() => props.overlayDisplay(null)}
                    />
                  )
                }
              >
                <Text style={styles.addDoctorText}>{strings.buttons.add_symptom}</Text>
              </TouchableOpacity>
            </View>
          )}
        </CollapseCard>
      </View>
    );
  };
  const [keyBoardVisible, setKeyBoardVisible] = useState<boolean>(false);
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyBoardVisible(true);
      }
    );
    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyBoardVisible(false);
      }
    );
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const renderFields = (
    heading: string,
    data: string,
    onChange: (text: string) => void,
    placeHolder?: string,
    multiline?: boolean,
    placeholderTextColor?: string,
    styles?: StyleProp<ViewStyle>
  ) => {
    return (
      <View>
        <Text style={theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6))}>
          {heading}
        </Text>
        <View
          style={[
            {
              minHeight: 44,
              marginTop: 8,
              marginBottom: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              borderWidth: 1,
              borderRadius: 5,
              borderColor: theme.colors.darkBlueColor(0.15),
            },
            styles,
          ]}
        >
          <TextInput
            style={{
              minHeight: 44,
              justifyContent: 'center',
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 12,
              paddingRight: 12,
              ...theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(1)),
            }}
            value={data}
            multiline={multiline}
            placeholder={placeHolder || ''}
            placeholderTextColor={placeholderTextColor || theme.colors.darkBlueColor(1)}
            textAlignVertical={multiline ? 'top' : undefined}
            selectionColor={theme.colors.INPUT_CURSOR_COLOR}
            onChange={(text) => onChange && caseSheetEdit && onChange(text.nativeEvent.text)}
            editable={caseSheetEdit}
            scrollEnabled={Platform.OS === 'android' ? keyBoardVisible : false}
          />
        </View>
      </View>
    );
  };

  const renderVitals = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.vitals}
          collapse={vitalsShow}
          onPress={() => setVitalsShow(!vitalsShow)}
        >
          <View style={{ marginHorizontal: 16 }}>
            {renderFields(
              strings.case_sheet.height,
              (medicalHistory && medicalHistory.height) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  height: text,
                } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
              }
            )}
            {renderFields(
              strings.case_sheet.weight,
              medicalHistory
                ? (medicalHistory.weight || '').toLowerCase() === 'no idea'
                  ? ''
                  : ((medicalHistory.weight || '').match(/^[0-9]+\.{0,1}[0-9]{0,3}$/) || [''])[0]
                : '',
              (text) => {
                if (/^[0-9]+\.{0,1}[0-9]{0,3}$/.test(text) || text === '') {
                  setMedicalHistory({
                    ...medicalHistory,
                    weight: text,
                  } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
                }
              },
              medicalHistory
                ? (medicalHistory.weight || '').toLowerCase() === 'no idea'
                  ? 'No Idea'
                  : ((medicalHistory.weight || '').match(/^[0-9]+\.{0,1}[0-9]{0,3}$/) || [
                      '',
                    ])[0] === ''
                  ? 'No Idea'
                  : ''
                : ''
            )}
            {renderFields(
              strings.case_sheet.bp,
              (medicalHistory && medicalHistory.bp) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  bp: text,
                } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
              }
            )}
            {renderFields(
              strings.case_sheet.temperature,
              (medicalHistory && medicalHistory.temperature) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  temperature: text,
                } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
              }
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderPatientHistoryLifestyle = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.patient_history_lifestyle}
          collapse={patientHistoryshow}
          onPress={() => setpatientHistoryshow(!patientHistoryshow)}
        >
          <View style={{ marginHorizontal: 16 }}>
            {renderFields(
              strings.case_sheet.medical_history,
              (medicalHistory && medicalHistory.pastMedicalHistory) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  pastMedicalHistory: text,
                } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
              },
              '',
              true
            )}
            {renderFields(
              strings.case_sheet.medication_history,
              (medicalHistory && medicalHistory.medicationHistory) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  medicationHistory: text,
                } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
              },
              '',
              true
            )}
            {renderFields(
              strings.case_sheet.surgical_history,
              (medicalHistory && medicalHistory.pastSurgicalHistory) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  pastSurgicalHistory: text,
                } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
              },
              '',
              true
            )}
            {renderFields(
              strings.case_sheet.drug_allergies,
              (medicalHistory && medicalHistory.drugAllergies) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  drugAllergies: text,
                } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
              },
              '',
              true
            )}
            {renderFields(
              strings.case_sheet.diet_allergies,
              (medicalHistory && medicalHistory.dietAllergies) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  dietAllergies: text,
                } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
              },
              '',
              true
            )}
            {renderFields(
              strings.case_sheet.lifestyle_habits,
              lifeStyleData && lifeStyleData[0] ? lifeStyleData[0].description || '' : '',
              (text) => {
                setLifeStyleData([
                  {
                    description: text,
                    occupationHistory:
                      (lifeStyleData && (lifeStyleData[0] || {}).occupationHistory) || null,
                  },
                ] as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle[]);
              },
              '',
              true
            )}
            {renderFields(
              strings.case_sheet.occupational_history,
              lifeStyleData && lifeStyleData[0] ? lifeStyleData[0].occupationHistory || '' : '',
              (text) => {
                setLifeStyleData([
                  {
                    description: (lifeStyleData && (lifeStyleData[0] || {}).description) || null,
                    occupationHistory: text,
                  },
                ] as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle[]);
              },
              '',
              true
            )}
            {(patientDetails &&
              ((patientDetails.gender &&
                [Gender.FEMALE, Gender.OTHER].includes(patientDetails.gender)) ||
                !patientDetails.gender)) ||
            !patientDetails
              ? renderFields(
                  strings.case_sheet.menstrual_history,
                  (medicalHistory && medicalHistory.menstrualHistory) || '',
                  (text) => {
                    setMedicalHistory({
                      ...medicalHistory,
                      menstrualHistory: text,
                    } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
                  },
                  '',
                  true
                )
              : null}
            {renderFields(
              strings.case_sheet.family_medical_history,
              familyValues,
              (text) => {
                setFamilyValues(text);
              },
              '',
              true
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };
  const renderNotes = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.notes}
          collapse={juniorshow}
          onPress={() => setJuniorShow(!juniorshow)}
        >
          <View style={styles.headerView}>
            {renderHeaderText(strings.case_sheet.jrDoctorNotes)}
          </View>
          <View style={[styles.symptomsInputView, { borderRadius: 5 }]}>
            <Text
              style={[
                styles.symptomsText,
                { marginRight: 12, ...theme.fonts.IBMPlexSansRegular(14) },
              ]}
            >
              {juniordoctornotes}
            </Text>
          </View>
          <View style={{ marginHorizontal: 16 }}>
            {renderFields(
              strings.case_sheet.diagnosticTestResults,
              (medicalHistory && medicalHistory.diagnosticTestResult) || '',
              (text) => {
                if (isValidSearch(text)) {
                  setMedicalHistory({
                    ...medicalHistory,
                    diagnosticTestResult: text,
                  } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
                }
              },
              strings.case_sheet.typeDiagnosticTestResults,
              true,
              theme.colors.placeholderTextColor,
              styles.activeBorderColor
            )}
            {renderFields(
              strings.case_sheet.clinicalNotes,
              (medicalHistory && medicalHistory.clinicalObservationNotes) || '',
              (text) => {
                if (isValidSearch(text)) {
                  setMedicalHistory({
                    ...medicalHistory,
                    clinicalObservationNotes: text,
                  } as GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory);
                }
              },
              strings.case_sheet.typeClinicalNotes,
              true,
              theme.colors.placeholderTextColor,
              styles.activeBorderColor
            )}
            {renderFields(
              strings.case_sheet.personal_note,
              doctorNotes,
              (text) => {
                if (isValidSearch(text)) {
                  setDoctorNotes(text);
                }
              },
              strings.case_sheet.typeYourNotes,
              true,
              theme.colors.placeholderTextColor,
              styles.activeBorderColor
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderDiagonisticPrescription = () => {
    return (
      <CollapseCard
        heading={strings.case_sheet.test_prescription}
        collapse={showdiagonisticPrescription}
        onPress={() => setshowdiagonisticPrescription(!showdiagonisticPrescription)}
      >
        <Text style={[styles.familyText, { marginBottom: 12 }]}>{strings.case_sheet.tests}</Text>
        {tests.length ? (
          tests.map((item, index) => {
            return (
              <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 16 }}>
                <DiagnosicsCard
                  diseaseName={item.itemname}
                  subText={item.testInstruction}
                  containerStyle={{
                    backgroundColor: !item.isSelected ? theme.colors.WHITE : '#F9F9F9',
                  }}
                  onPress={() => {
                    props.overlayDisplay(renderAddTestPopup(item));
                  }}
                  icon={
                    <TouchableOpacity
                      onPress={() => {
                        if (caseSheetEdit) {
                          const itemLocation = tests.findIndex((i) => i.itemname === item.itemname);
                          const modifiedArray = tests.filter((i) => i.itemname !== item.itemname);
                          modifiedArray.splice(
                            itemLocation > -1 ? itemLocation : tests.length - 1,
                            0,
                            {
                              itemname: item.itemname,
                              testInstruction: item.testInstruction || '',
                              isSelected: !item.isSelected,
                            }
                          );
                          setTests(modifiedArray);
                        }
                      }}
                    >
                      {item.isSelected ? (
                        <CheckboxSelected
                          style={{ alignSelf: 'flex-start', height: 20, width: 20 }}
                        />
                      ) : (
                        <CheckboxUnSelected
                          style={{ alignSelf: 'flex-start', height: 20, width: 20 }}
                        />
                      )}
                    </TouchableOpacity>
                  }
                />
              </View>
            );
          })
        ) : (
          <Text style={[styles.symptomsText, { textAlign: 'center' }]}>
            {strings.common.no_data}
          </Text>
        )}

        {props.favTest && props.favTest.length ? (
          <Text style={[styles.familyText, { marginBottom: 12 }]}>
            {strings.smartPrescr.fav_test}
          </Text>
        ) : null}
        {props.favTest && props.favTest.length
          ? props.favTest.map((showdata, i) => {
              if (showdata)
                return (
                  <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 16 }}>
                    <DiagnosicsCard
                      diseaseName={showdata.itemname}
                      icon={
                        caseSheetEdit && (
                          <TouchableOpacity
                            onPress={() => {
                              if (tests.findIndex((i) => i.itemname === showdata.itemname) > -1) {
                                setTests([
                                  ...tests.map((i) =>
                                    i.itemname === showdata.itemname
                                      ? {
                                          itemname: i.itemname,
                                          testInstruction: i.testInstruction || '',
                                          isSelected: true,
                                        }
                                      : i
                                  ),
                                ]);
                              } else {
                                setTests([
                                  ...tests,
                                  {
                                    ...showdata,
                                    testInstruction: '',
                                    isSelected: true,
                                  },
                                ]);
                              }
                            }}
                          >
                            <Green />
                          </TouchableOpacity>
                        )
                      }
                    />
                  </View>
                );
            })
          : null}
        {caseSheetEdit && (
          <AddIconLabel
            label={strings.buttons.add_tests}
            onPress={() => props.overlayDisplay(renderAddTestPopup())}
            style={{ marginBottom: 19, marginLeft: 16, marginTop: 0 }}
          />
        )}
      </CollapseCard>
    );
  };

  const renderMedicineDetails = (
    item:
      | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
      | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList,
    removedItem?: boolean
  ) => {
    return (
      <View style={{ flex: 0.95 }}>
        <Text
          style={{
            ...theme.viewStyles.text('SB', 14, '#02475b', 1, undefined, 0.02),
            textDecorationLine: removedItem ? 'line-through' : 'none',
            marginBottom: removedItem ? 4 : 0,
          }}
        >
          {item.medicineName}
        </Text>
        {item.includeGenericNameInPrescription && item.genericName ? (
          <Text style={theme.viewStyles.text('S', 12, '#02475b', 1, undefined, 0.02)}>
            {`Contains ${item.genericName}`}
          </Text>
        ) : null}
        {removedItem ? (
          <Text style={theme.viewStyles.text('S', 12, theme.colors.DARK_RED, 1, undefined, 0.02)}>
            {strings.case_sheet.med_remove}
          </Text>
        ) : null}
        <Text
          style={{
            marginTop: 4,
            ...theme.viewStyles.text('S', 12, '#02475b', 1, 14, 0.02),
          }}
        >
          {medicineDescription(item)}
        </Text>
      </View>
    );
  };

  const renderMedicinePrescription = () => {
    return (
      <CollapseCard
        heading={strings.case_sheet.medicine_prescription}
        collapse={medicinePrescription}
        onPress={() => setMedicinePrescription(!medicinePrescription)}
      >
        <View style={{ marginHorizontal: 20, marginBottom: 19 }}>
          {renderHeaderText(strings.common.medicines)}
          {medicinePrescriptionData &&
          medicinePrescriptionData.length == 0 &&
          removedMedicinePrescriptionData &&
          removedMedicinePrescriptionData.length == 0
            ? renderInfoText(strings.case_sheet.no_medicine_Added)
            : null}
          {medicinePrescriptionData && medicinePrescriptionData.length > 0
            ? medicinePrescriptionData.map((showdata, index) => {
                if (showdata) {
                  const isSelected =
                    selectedMedicinesId.findIndex(
                      (j) => j === (showdata.externalId || showdata.id)
                    ) >= 0;
                  const isExisting =
                    existingMedicineId.findIndex(
                      (j) => j === (showdata.externalId || showdata.id)
                    ) >= 0;
                  return (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        caseSheetEdit &&
                          props.overlayDisplay(
                            <AddMedicinePopUp
                              allowedDosages={g(caseSheet, 'allowedDosages')}
                              data={showdata}
                              onClose={() => props.overlayDisplay(null)}
                              onAddnew={(data) => {
                                setMedicinePrescriptionData([
                                  ...(medicinePrescriptionData.filter(
                                    (
                                      j: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null
                                    ) =>
                                      ((j || {}).externalId || (j || {}).id) !==
                                      (data.externalId || data.id)
                                  ) || []),
                                  data as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                                ]);
                                setSelectedMedicinesId(
                                  [
                                    ...selectedMedicinesId.filter(
                                      (j) => j !== (data.externalId || data.id)
                                    ),
                                    data.externalId || data.id || '',
                                  ].filter((j) => j !== '')
                                );
                              }}
                            />
                          );
                      }}
                    >
                      <View
                        style={[
                          styles.dataCardsStyle,
                          !isSelected ? { backgroundColor: theme.colors.WHITE } : {},
                        ]}
                      >
                        {renderMedicineDetails(showdata)}
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => {
                            if (caseSheetEdit) {
                              if (!isSelected) {
                                setSelectedMedicinesId(
                                  [
                                    ...selectedMedicinesId,
                                    showdata.externalId || showdata.id || '',
                                  ].filter((j) => j !== '')
                                );
                              } else {
                                setSelectedMedicinesId([
                                  ...selectedMedicinesId.filter(
                                    (j) => j != (showdata.externalId || showdata.id)
                                  ),
                                ]);
                                if (isExisting && caseSheetVersion > 1) {
                                  setMedicinePrescriptionData([
                                    ...(medicinePrescriptionData.filter(
                                      (
                                        j: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null
                                      ) =>
                                        ((j || {}).externalId || (j || {}).id) !==
                                        (showdata.externalId || showdata.id)
                                    ) || []),
                                  ]);
                                  setRemovedMedicinePrescriptionData([
                                    showdata,
                                    ...(removedMedicinePrescriptionData || []),
                                  ]);
                                }
                              }
                            }
                          }}
                        >
                          {isSelected ? (
                            <CheckboxSelected
                              style={{ alignSelf: 'flex-start', height: 20, width: 20 }}
                            />
                          ) : (
                            <CheckboxUnSelected
                              style={{ alignSelf: 'flex-start', height: 20, width: 20 }}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                } else {
                  return null;
                }
              })
            : null}
          {removedMedicinePrescriptionData && removedMedicinePrescriptionData.length > 0
            ? removedMedicinePrescriptionData.map((showdata, index) => {
                if (showdata) {
                  const isSelected =
                    selectedMedicinesId.findIndex(
                      (j) => j === (showdata.externalId || showdata.id)
                    ) >= 0;
                  return (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        if (caseSheetEdit) {
                          props.overlayDisplay(
                            <AddMedicinePopUp
                              allowedDosages={g(caseSheet, 'allowedDosages')}
                              data={showdata}
                              onClose={() => props.overlayDisplay(null)}
                              onAddnew={(data) => {
                                setMedicinePrescriptionData([
                                  ...((medicinePrescriptionData || []).filter(
                                    (
                                      j: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null
                                    ) =>
                                      ((j || {}).externalId || (j || {}).id) !==
                                      (data.externalId || data.id)
                                  ) || []),
                                  data as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                                ]);
                                setSelectedMedicinesId(
                                  [
                                    ...selectedMedicinesId.filter(
                                      (j) => j !== (data.externalId || data.id)
                                    ),
                                    data.externalId || data.id || '',
                                  ].filter((j) => j !== '')
                                );
                                setRemovedMedicinePrescriptionData([
                                  ...((removedMedicinePrescriptionData || []).filter(
                                    (
                                      j: GetCaseSheet_getCaseSheet_caseSheetDetails_removedMedicinePrescription | null
                                    ) =>
                                      ((j || {}).externalId || (j || {}).id) !==
                                      (data.externalId || data.id)
                                  ) || []),
                                ]);
                              }}
                            />
                          );
                        }
                      }}
                    >
                      <View style={styles.dataCardsStyle}>
                        {renderMedicineDetails(showdata, true)}
                        {isSelected ? (
                          <CheckboxSelected
                            style={{ alignSelf: 'flex-start', height: 20, width: 20 }}
                          />
                        ) : (
                          <CheckboxUnSelected
                            style={{ alignSelf: 'flex-start', height: 20, width: 20 }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                } else {
                  return null;
                }
              })
            : null}
          {props.favMed
            ? props.favMed.length > 0 && renderHeaderText(strings.smartPrescr.fav_med)
            : null}
          {props.favMed
            ? props.favMed.map(
                (
                  med: GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null
                ) => {
                  if (med) {
                    return (
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                          caseSheetEdit &&
                            props.overlayDisplay(
                              <AddMedicinePopUp
                                allowedDosages={g(caseSheet, 'allowedDosages')}
                                data={med}
                                onClose={() => props.overlayDisplay(null)}
                                onAddnew={(data) => {
                                  if (medicinePrescriptionData) {
                                    setMedicinePrescriptionData([
                                      ...(medicinePrescriptionData.filter(
                                        (
                                          i: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null
                                        ) =>
                                          ((i || {}).externalId || (i || {}).id) !==
                                          (data.externalId || data.medicineName)
                                      ) || []),
                                      {
                                        ...data,
                                        externalId: data.externalId || data.medicineName,
                                      } as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                                    ]);
                                  } else {
                                    setMedicinePrescriptionData([
                                      {
                                        ...data,
                                        externalId: data.externalId || data.medicineName,
                                      } as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                                    ]);
                                  }
                                  setSelectedMedicinesId(
                                    [
                                      ...selectedMedicinesId.filter(
                                        (i) => i !== (data.externalId || data.medicineName)
                                      ),
                                      data.externalId || data.medicineName || '',
                                    ].filter((i) => i !== '')
                                  );
                                }}
                              />
                            );
                        }}
                      >
                        <View style={[styles.dataCardsStyle, { marginVertical: 4 }]}>
                          {renderMedicineDetails(med)}
                          {caseSheetEdit && (
                            <Green style={{ alignSelf: 'flex-start', height: 20, width: 20 }} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  }
                }
              )
            : null}
          {caseSheetEdit && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <AddIconLabel
                label={strings.smartPrescr.add_medicine}
                onPress={() =>
                  props.overlayDisplay(
                    <AddMedicinePopUp
                      allowedDosages={g(caseSheet, 'allowedDosages')}
                      onClose={() => props.overlayDisplay(null)}
                      onAddnew={(data) => {
                        if (
                          (medicinePrescriptionData &&
                            medicinePrescriptionData.findIndex(
                              (
                                i: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null
                              ) => ((i || {}).externalId || (i || {}).id) === data.externalId
                            ) < 0) ||
                          medicinePrescriptionData === null ||
                          medicinePrescriptionData === undefined
                        ) {
                          setMedicinePrescriptionData([
                            ...(medicinePrescriptionData || []),
                            data as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                          ]);
                          setSelectedMedicinesId(
                            [
                              ...selectedMedicinesId.filter(
                                (i) => i !== data.externalId || data.id
                              ),
                              data.externalId || data.id || '',
                            ].filter((i) => i !== '')
                          );
                        } else {
                          Alert.alert('', strings.alerts.already_exists);
                        }
                      }}
                    />
                  )
                }
                style={{ marginBottom: 0, marginTop: 5, marginLeft: 0 }}
              />
              {pastList && pastList.length > 0 ? (
                <AddIconLabel
                  label={'PREVIOUS Rx'}
                  onPress={() => {
                    props.overlayDisplay(
                      <AddMedicinePrescriptionPopUp
                        prescriptionData={pastList.sort(
                          (a, b) =>
                            moment(a ? a.sdConsultationDate || a.appointmentDateTime : new Date())
                              .toDate()
                              .getTime() -
                            moment(b ? b.sdConsultationDate || b.appointmentDateTime : new Date())
                              .toDate()
                              .getTime()
                        )}
                        onClose={() => {
                          props.overlayDisplay(null);
                        }}
                        onProceed={(medicineData) => {
                          const tmpNewMedicine: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] = [];
                          const tempSelectedId: string[] = [];
                          const tempRemoveSelectedId: string[] = [];
                          medicineData.forEach((data) => {
                            if (data) {
                              tmpNewMedicine.push(data);
                              if (
                                selectedMedicinesId.findIndex(
                                  (i) => i === (data.externalId || data.id || '')
                                ) > -1
                              ) {
                                tempSelectedId.push(data.externalId || data.id || '');
                                tempRemoveSelectedId.push(data.externalId || data.id || '');
                              } else {
                                tempSelectedId.push(data.externalId || data.id || '');
                              }
                            }
                          });
                          setMedicinePrescriptionData([
                            ...(medicinePrescriptionData
                              ? medicinePrescriptionData.filter(
                                  (item) =>
                                    !tempRemoveSelectedId.includes(
                                      (item || {}).externalId || (item || {}).id || ''
                                    ) &&
                                    !tempSelectedId.includes(
                                      (item || {}).externalId || (item || {}).id || ''
                                    )
                                )
                              : []),
                            ...tmpNewMedicine,
                          ]);
                          setSelectedMedicinesId(
                            [
                              ...selectedMedicinesId.filter(
                                (i) => !tempRemoveSelectedId.includes(i)
                              ),
                              ...tempSelectedId,
                            ].filter((i) => i !== '')
                          );
                        }}
                      />
                    );
                  }}
                  style={{ marginBottom: 0, marginTop: 5, marginLeft: 0 }}
                />
              ) : null}
            </View>
          )}
        </View>
      </CollapseCard>
    );
  };

  const defaultChatDays = g(doctorDetails, 'chatDays');
  const daysOptionArray: OptionsObject[] = Array(31)
    .fill(0)
    .map((_, i) => {
      if (defaultChatDays && i < defaultChatDays) return { key: -1, value: -1 };
      else return { key: i, value: i < 10 ? (i == 0 ? '0' : '0' + i.toString()) : i.toString() };
    })
    .filter((i) => i.key !== -1);

  const renderFollowUpView = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.follow_up}
          collapse={followup}
          onPress={() => setFollowUp(!followup)}
        >
          <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
            {renderHeaderText('Set your patient follow up chat days limit.')}
            <View style={styles.rowContainer}>
              <View style={{ width: '40%' }}>
                <MaterialMenu
                  options={daysOptionArray}
                  selectedText={followupChatDays.key}
                  onPress={(selectedOption) => {
                    setFollowupChatDays(selectedOption);
                  }}
                  menuContainerStyle={styles.materialMenuContainer}
                  itemContainer={styles.materialMenuItemContainer}
                  itemTextStyle={styles.materialMenuItemText}
                  selectedTextStyle={styles.materialMenuSelectedItemText}
                  disable={!caseSheetEdit || caseSheetVersion > 1}
                >
                  <View style={styles.materialMenuViewContainer}>
                    <View style={styles.materialMenuTextContainer}>
                      <Text style={styles.materialMenuViewText}>
                        {Number(followupChatDays.value) < 10 && Number(followupChatDays.value) > 0
                          ? '0' + Number(followupChatDays.value).toString()
                          : followupChatDays.value}
                      </Text>
                      <View style={styles.materialMenuDropContainer}>
                        <Dropdown />
                      </View>
                    </View>
                  </View>
                </MaterialMenu>
              </View>
              {renderInfoText(followupChatDays.key == 1 ? 'Day' : 'Days')}
            </View>
            <View style={styles.rowContainer}>
              <InfoGreen />
              <Text style={styles.infoTextStyle}>
                {string.case_sheet.followup_instruction.replace('{0}', defaultChatDays)}
              </Text>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderDiagnosisView = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.diagnosis}
          collapse={diagnosisView}
          onPress={() => setDiagnosisView(!diagnosisView)}
        >
          <View style={{ marginHorizontal: 16, marginBottom: 19 }}>
            {renderHeaderText(strings.case_sheet.diagonsed_medical_condi)}
            <View
              style={{
                flexDirection: 'row',
                // justifyContent: 'space-between',
                marginBottom: 6,
                flexWrap: 'wrap',
              }}
            >
              {diagnosisData == null || (diagnosisData && diagnosisData.length == 0)
                ? renderInfoText(strings.common.no_data)
                : diagnosisData.map(
                    (showdata: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null, i) => {
                      if (showdata) {
                        return (
                          <DiagnosisCard
                            diseaseName={showdata.name || ''}
                            onPressIcon={() =>
                              caseSheetEdit &&
                              setDiagnosisData(
                                diagnosisData.filter(
                                  (
                                    i: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null
                                  ) => (i || {}).name != showdata.name
                                )
                              )
                            }
                            icon={<DiagonisisRemove />}
                          />
                        );
                      }
                    }
                  )}
            </View>
            {caseSheetEdit && (
              <AddIconLabel
                label={strings.consult.add_condition}
                onPress={() => {
                  props.overlayDisplay(
                    <AddConditionPopUp
                      onClose={() => {
                        props.overlayDisplay(null);
                      }}
                      onDone={(val) => {
                        const newValues: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[] = [];
                        val.forEach((item) => {
                          if (
                            diagnosisData &&
                            diagnosisData.findIndex((i) => item.name === (i && i.name)) < 0
                          ) {
                            newValues.push(item);
                          } else if (diagnosisData === null) {
                            newValues.push(item);
                          }
                        });
                        setDiagnosisData([...(diagnosisData || []), ...newValues]);
                      }}
                    />
                  );
                }}
                style={{ marginBottom: 0, marginLeft: 0, marginTop: 0 }}
              />
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderHeaderText = (header: string) => {
    return (
      <Text
        style={[
          theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6)),
          { marginVertical: 4 },
        ]}
      >
        {header}
      </Text>
    );
  };
  const renderInfoText = (text: string) => {
    return (
      <Text
        style={[
          theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(1)),
          { marginLeft: 8, marginVertical: 4 },
        ]}
      >
        {text}
      </Text>
    );
  };

  const renderLeftTimeLineView = (showTop: boolean, showBottom: boolean) => {
    return (
      <View style={styles.leftTimeLineContainer}>
        <View
          style={[
            styles.verticalLine,
            {
              backgroundColor: showTop ? theme.colors.SHARP_BLUE : '#f7f7f7',
            },
          ]}
        />
        <View
          style={{
            height: 12,
            width: 12,
            backgroundColor: theme.colors.LIGHT_BLUE,
            borderRadius: 6,
          }}
        />
        <View
          style={[
            styles.verticalLine,
            {
              backgroundColor: showBottom ? theme.colors.SHARP_BLUE : '#f7f7f7',
            },
          ]}
        />
      </View>
    );
  };

  const renderPastConsults = () => {
    return (
      <View>
        {pastList && pastList.length > 0
          ? pastList.map((i, index, array) => {
              if (i)
                return (
                  <>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        // justifyContent: 'center',
                        // alignItems: 'center',
                      }}
                    >
                      {renderLeftTimeLineView(index !== 0, index !== array.length - 1)}
                      <TouchableOpacity
                        activeOpacity={1}
                        style={{
                          borderWidth: 1,
                          borderColor: theme.colors.darkBlueColor(0.2),
                          flexDirection: 'row',
                          borderRadius: 10,
                          backgroundColor: theme.colors.WHITE,
                          height: 50,
                          alignItems: 'center',
                          paddingRight: 10,
                          paddingLeft: 18,
                          marginVertical: 4.5,
                          marginRight: 20,
                          flex: 1,
                          justifyContent: 'space-between',
                        }}
                        onPress={() => {
                          if (!inCall) {
                            props.navigation.navigate(AppRoutes.CaseSheetDetails, {
                              consultDetails: i,
                              patientDetails: props.patientDetails,
                            });
                          } else {
                            showAphAlert &&
                              showAphAlert({
                                title: strings.common.alert,
                                description: strings.alerts.disable_Casesheet_view,
                              });
                          }
                        }}
                      >
                        <Text
                          style={theme.viewStyles.text(
                            'M',
                            12,
                            theme.colors.darkBlueColor(0.6),
                            1,
                            12
                          )}
                        >
                          {moment(i.sdConsultationDate || i.appointmentDateTime).format(
                            'D MMM YYYY, hh:MM A'
                          )}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ marginRight: 24 }}>
                            {i.appointmentType === APPOINTMENT_TYPE.ONLINE ? <Video /> : <Audio />}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </>
                );
            })
          : renderInfoText('There are no past appointments.')}
      </View>
    );
  };
  const renderRecordImages = (files: { url: string | null; name: string }[], isImage: boolean) => {
    return (
      <View style={styles.healthvaultMainContainer}>
        <ScrollView bounces={false} horizontal showsHorizontalScrollIndicator={false}>
          {files.map((file, index) => {
            if (file.url) {
              return (
                <View style={styles.healthvaultImageContainer} key={index}>
                  {isImage ? (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        openFiles(file.url || '', 'image', false);
                      }}
                    >
                      <View style={{ maxWidth: 100 }}>
                        <Text style={styles.imageHeadingText} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <FastImage
                          source={{ uri: file.url }}
                          style={styles.healthvaultImage}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        openFiles(file.url || '', 'pdf', false);
                      }}
                    >
                      <View style={{ maxWidth: 100 }}>
                        <Text style={styles.imageHeadingText} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <FileBig style={styles.healthvaultImage} />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              );
            } else {
              return null;
            }
          })}
        </ScrollView>
      </View>
    );
  };
  const [patientImages, setPatientImages] = useState<{ url: string | null; name: string }[]>([]);
  const [records, setRecords] = useState<{ url: string | null; name: string }[]>([]);

  useEffect(() => {
    const images =
      (healthWalletArrayData &&
        healthWalletArrayData.map((i) => {
          return { url: i && i.imageUrls, name: 'Image.jpeg' };
        })) ||
      [];
    const record =
      (healthWalletArrayData &&
        healthWalletArrayData.map((i) => {
          return { url: i && i.reportUrls, name: 'Document.pdf' };
        })) ||
      [];

    if (chatFiles) {
      const onlyImageUrl: { url: string | null; name: string }[] = chatFiles
        .filter(
          (i) =>
            i.fileType === 'image' &&
            i.id === (g(patientDetails, 'id') || g(caseSheet, 'patientDetails', 'id'))
        )
        .map((i) => {
          return {
            url: i.url,
            name:
              i.fileName ||
              `Image_${moment(Number(i.timetoken) / 10000).format('DD_MM_YYYY')}.jpeg`,
          };
        });
      const onlyPdfUrl: { url: string | null; name: string }[] = chatFiles
        .filter(
          (i) =>
            i.fileType === 'pdf' &&
            i.id === (g(patientDetails, 'id') || g(caseSheet, 'patientDetails', 'id'))
        )
        .map((i) => {
          return {
            url: i.url,
            name:
              i.fileName ||
              `Document_${moment(Number(i.timetoken) / 10000).format('DD_MM_YYYY')}.pdf`,
          };
        });
      images.push(...onlyImageUrl);
      record.push(...onlyPdfUrl);
      setPatientImages(images);
      setRecords(record);
    } else {
      setPatientImages(images);
      setRecords(record);
    }
  }, [healthWalletArrayData, chatFiles]);

  const renderPatientHealthWallet = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.patient_health_vault}
          collapse={patientHealthWallet}
          onPress={() => setPatientHealthWallet(!patientHealthWallet)}
        >
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            {renderHeaderText(strings.case_sheet.photos_uploaded_by_patient)}
            {patientImages.length > 0
              ? renderRecordImages(patientImages, true)
              : renderInfoText(strings.common.no_data)}
            {renderHeaderText(strings.case_sheet.reports)}
            {records.length > 0
              ? renderRecordImages(records, false)
              : renderInfoText(strings.common.no_data)}
            {renderHeaderText(strings.case_sheet.past_consultations)}
            {renderPastConsults()}
          </View>
        </CollapseCard>
      </View>
    );
  };
  const CallPopUp = () => {
    return (
      <View
        style={{
          flex: 1,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: width,
          backgroundColor: 'transparent',
          position: 'absolute',
          elevation: 2000,
        }}
      >
        <View
          style={{
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: width,
            backgroundColor: 'black',
            position: 'absolute',
            opacity: 0.41,
          }}
        ></View>
        <View
          style={{
            marginHorizontal: 40,
            marginTop: 112,
            height: 289,
            borderRadius: 10,
            backgroundColor: 'white',
          }}
        >
          <TouchableOpacity onPress={() => setShowPopUp(false)} style={{ height: 40 }}>
            <ClosePopup
              style={{ width: 24, height: 24, top: 16, position: 'absolute', right: 16 }}
            />
          </TouchableOpacity>

          <Text
            style={{
              marginHorizontal: 20,
              marginTop: 21,
              color: '#02475b',
              ...theme.fonts.IBMPlexSansSemiBold(20),
            }}
          >
            {strings.case_sheet.how_do_you_talk}
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 32,
                backgroundColor: '#fc9916',
                height: 40,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <RoundCallIcon />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  {strings.buttons.audio_call}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 12,
                backgroundColor: '#fc9916',
                height: 40,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <RoundVideoIcon />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  {strings.buttons.video_call}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderyesorno = () => {
    return (
      <View
        style={{
          flex: 1,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: width,
          backgroundColor: 'transparent',
          position: 'absolute',
          elevation: 2000,
        }}
      >
        <View
          style={{
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: width,
            backgroundColor: 'black',
            position: 'absolute',
            opacity: 0.41,
          }}
        ></View>
        <View
          style={{
            marginHorizontal: 40,
            marginTop: 112,
            minHeight: 289,
            borderRadius: 10,
            backgroundColor: 'white',
            paddingBottom: 10,
          }}
        >
          <TouchableOpacity onPress={() => setyesorno(false)} style={{ height: 40 }}>
            <ClosePopup
              style={{ width: 24, height: 24, top: 16, position: 'absolute', right: 16 }}
            />
          </TouchableOpacity>

          <Text
            style={{
              marginHorizontal: 20,
              marginTop: 21,
              color: '#02475b',
              ...theme.fonts.IBMPlexSansSemiBold(20),
            }}
          >
            {'Are you sure you want to end your consult? '}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setyesorno(false);
              setLoading && setLoading(true);
              setShowButtons(true);
              saveDetails(true);
              endConsult();
            }}
          >
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 32,
                backgroundColor: '#fc9916',
                height: 40,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  {'YES'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setyesorno(false);
            }}
          >
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 12,
                backgroundColor: '#fc9916',
                height: 40,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  {'NO'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text
            style={{
              color: '#02475b',
              ...theme.fonts.IBMPlexSansSemiBold(12),
              textAlign: 'center',
              margin: 5,
            }}
          >
            After ending the consult you will get the option to preview/edit case sheet and send
            prescription to the patient
          </Text>
        </View>
      </View>
    );
  };
  const selectedAdviceAction = (advice: DataPair, action: 'a' | 'd') => {
    if (action === 'a') {
      if (
        addedAdvices.findIndex((item) => item.value.toLowerCase() === advice.value.toLowerCase()) <
        0
      ) {
        setAddedAdvices([...addedAdvices, advice]);
      } else {
        showAphAlert &&
          showAphAlert({
            title: strings.common.alert,
            description: strings.case_sheet.advice_exists,
          });
      }
    } else if (action === 'd') {
      if (addedAdvices.findIndex((item) => item.key === advice.key) >= 0) {
        setAddedAdvices([...addedAdvices.filter((i) => i.key != advice.key)]);
      }
    }
  };

  const renderAdviceInstruction = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.advice_instructions}
          collapse={adviceInstructions}
          onPress={() => setAdviceInstructions(!adviceInstructions)}
        >
          <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
            {renderHeaderText(strings.case_sheet.instructions_to_patient)}
            {addedAdvices.length > 0
              ? addedAdvices.map((item) => (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => caseSheetEdit && selectedAdviceAction(item, 'd')}
                  >
                    <View style={styles.dataCardsStyle}>
                      <Text
                        style={{
                          ...theme.viewStyles.text('SB', 14, '#02475b', 1, undefined, 0.02),
                          flex: 0.95,
                        }}
                      >
                        {item.value}
                      </Text>
                      <CheckboxSelected
                        style={{ alignSelf: 'flex-start', height: 20, width: 20 }}
                      />
                    </View>
                  </TouchableOpacity>
                ))
              : renderInfoText(strings.case_sheet.no_advice_selected)}
            {props.favList && props.favList.length > 0
              ? renderHeaderText(strings.case_sheet.fav_diagnostics)
              : null}
            {props.favList &&
              props.favList.map(
                (item) =>
                  item && (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        caseSheetEdit
                          ? selectedAdviceAction({ key: item.id, value: item.instruction }, 'a')
                          : null;
                      }}
                    >
                      <View style={styles.dataCardsStyle}>
                        <Text
                          style={{
                            ...theme.viewStyles.text('SB', 14, '#02475b', 1, undefined, 0.02),
                            flex: 1,
                          }}
                        >
                          {item.instruction}
                        </Text>
                        {caseSheetEdit && (
                          <Green style={{ alignSelf: 'flex-start', height: 20, width: 20 }} />
                        )}
                      </View>
                    </TouchableOpacity>
                  )
              )}
            {caseSheetEdit && (
              <AddIconLabel
                label={strings.buttons.add_instructions}
                onPress={() => {
                  props.overlayDisplay(
                    <AddInstructionPopUp
                      onClose={() => {
                        props.overlayDisplay(null);
                      }}
                      onDone={(val) => {
                        selectedAdviceAction({ key: val, value: val }, 'a');
                      }}
                    />
                  );
                }}
                style={{ marginTop: 5, marginBottom: 0, marginLeft: 0 }}
              />
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderAddTestPopup = (selectedTest?: {
    itemname: string;
    testInstruction?: string;
    isSelected: boolean;
  }) => {
    return (
      <AddTestPopup
        searchTestVal={selectedTest ? selectedTest.itemname : undefined}
        instructionVal={selectedTest ? selectedTest.testInstruction : undefined}
        onClose={() => {
          props.overlayDisplay(null);
        }}
        onPressDone={(searchTestVal, tempTestArray, instruction) => {
          const tempTest = tests.filter((i) =>
            selectedTest ? i.itemname !== selectedTest.itemname : true
          );
          const newData = tempTestArray.length
            ? tempTestArray.map((ele) => {
                const existingElement = tempTest.findIndex(
                  (i) => i.itemname.toLowerCase() === ele.itemName.toLowerCase()
                );
                if (existingElement > -1) {
                  tempTest[existingElement].isSelected = true;
                  tempTest[existingElement].testInstruction = instruction;
                  return { itemname: '', testInstruction: instruction || '', isSelected: false };
                } else {
                  return {
                    itemname: ele.itemName || '',
                    testInstruction: instruction || '',
                    isSelected: true,
                  };
                }
              })
            : [{ itemname: searchTestVal, testInstruction: instruction || '', isSelected: true }];
          setTests([...tempTest, ...newData.filter((i) => i.itemname !== '')]);
          props.overlayDisplay(null);
        }}
        hasInstructions={true}
      />
    );
  };

  const renderBasicProfileDetails = (displayId: string, Appintmentdatetimeconsultpage: string) => {
    return (
      <View style={{ backgroundColor: '#f7f7f7', paddingBottom: 11 }}>
        {profileRow(displayId, Appintmentdatetimeconsultpage)}
      </View>
    );
  };

  const profileRow = (displayId: string, Appintmentdatetimeconsultpage: string) => {
    if (patientDetails) {
      const age = moment().diff(patientDetails && patientDetails.dateOfBirth, 'years', true) || -1;
      return (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.nameText}>
              {`${(patientDetails.firstName || '').trim()} ${(
                patientDetails.lastName || ''
              ).trim()}`}
            </Text>
            <View style={styles.line}></View>
            <Text style={styles.agetext}>
              {age > -1 ? Math.floor(age).toString() : '-'}
              {patientDetails.gender ? `, ${patientDetails.gender.charAt(0)}` : ''}
              {patientDetails.patientAddress &&
              patientDetails.patientAddress[0] &&
              patientDetails.patientAddress[0].city
                ? `, ${patientDetails.patientAddress[0].city.split(',')[0]}`
                : ''}
            </Text>
          </View>
          {patientDetails && patientDetails.uhid != '' ? (
            <Text style={styles.uhidText}>
              {strings.case_sheet.uhid} : {patientDetails.uhid}{' '}
            </Text>
          ) : null}

          <View style={styles.understatusline} />
          <View>
            {registerDetails(strings.case_sheet.appt_id + ' : ', displayId)}
            {registerDetailsAppDate(strings.case_sheet.appt_date, Appintmentdatetimeconsultpage)}
          </View>
        </View>
      );
    }
  };

  const registerDetails = (ApptId: string, displayId: string) => {
    if (!displayId) return null;
    return (
      <View style={{ flexDirection: 'row', marginLeft: 20, marginBottom: 8 }}>
        <Text style={styles.appid}>{ApptId}</Text>
        <Text style={styles.appdate}>{displayId}</Text>
      </View>
    );
  };
  const registerDetailsAppDate = (ApptId: string, appIdDate: string) => {
    if (!appIdDate) return null;
    return (
      <View style={{ flexDirection: 'row', marginLeft: 20, alignItems: 'center' }}>
        <Text style={styles.appid}>{ApptId}</Text>
        <Text style={styles.appdate}>{moment(appIdDate).format('DD/MM/YYYY')}</Text>
        <Text
          style={{
            ...styles.appid,
            color: 'rgba(2, 71, 91, 0.6)',
            marginHorizontal: 5,
          }}
        >
          |
        </Text>
        <Text style={styles.appdate}>{moment(appIdDate).format('HH:mm A')}</Text>
      </View>
    );
  };

  const renderPatientImage = () => {
    return (
      <View style={{ marginBottom: 20 }}>
        {patientDetails && patientDetails.photoUrl ? (
          <FastImageLoading
            uri={(patientDetails && patientDetails.photoUrl) || ''}
            imageStyle={{ height: width, width: width, backgroundColor: theme.colors.WHITE }}
            resizeMode={'contain'}
          />
        ) : (
          <UserPlaceHolder
            style={{
              height: 150,
              width: width,
              alignItems: 'center',
              backgroundColor: 'white',
            }}
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  const [specialtiesData, setSpecialtiesData] = useState<OptionsObject[]>([
    { key: '-1', value: strings.case_sheet.select_Speciality },
  ]);
  useEffect(() => {
    if (specialties) {
      setSpecialtiesData([
        ...specialties.map((i) => {
          return { key: i.id, value: i.specialistSingularTerm || i.name };
        }),
      ]);
    }
  }, [specialties]);

  const renderReferral = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.referral_headding}
          collapse={referral}
          onPress={() => setReferral(!referral)}
        >
          <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
            {renderHeaderText(strings.case_sheet.referral_drop_selection_header)}
            <View style={styles.menuContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  caseSheetEdit &&
                    props.overlayDisplay(
                      <ReferralSelectPopup
                        data={specialtiesData}
                        selected={selectedReferral}
                        onSelect={(item) => setSelectedReferral(item)}
                        onClose={() => props.overlayDisplay(null)}
                      />
                    );
                }}
              >
                <View style={styles.MtextView}>
                  <Text style={styles.dropValueText}>
                    {selectedReferral && selectedReferral.value}
                  </Text>
                  <View style={styles.dropDownGreenView}>
                    <DropdownGreen />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            {/* </MaterialMenu> */}
            {renderFields(
              'Reason',
              referralReason,
              (text) => {
                if (isValidSearch(text)) {
                  setReferralReason(text);
                }
              },
              '',
              true
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.casesheetView}>
      <View style={styles.casesheetView}>
        <KeyboardAwareScrollView
          scrollEnabled={true}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          style={{ flex: 1 }}
          extraHeight={Platform.OS === 'android' ? 20 : isIphoneX() ? 200 : 160}
          bounces={false}
        >
          <ScrollView
            bounces={false}
            contentContainerStyle={{ marginBottom: keyBoardVisible ? 0 : 80 }}
          >
            <View style={{ height: 20, backgroundColor: '#f0f4f5' }} />
            {renderPatientImage()}
            {renderBasicProfileDetails(displayId, Appintmentdatetimeconsultpage)}
            {renderSymptonsView()}
            {renderVitals()}
            {renderPatientHistoryLifestyle()}
            {renderPatientHealthWallet()}
            {renderNotes()}
            {renderDiagnosisView()}
            {renderMedicinePrescription()}
            {renderDiagonisticPrescription()}
            {renderFollowUpView()}
            {renderAdviceInstruction()}
            {renderReferral()}
            {showPopUp && CallPopUp()}
          </ScrollView>
        </KeyboardAwareScrollView>
        {!keyBoardVisible
          ? showEditPreviewButtons
            ? renderEditPreviewButtons()
            : stastus == STATUS.COMPLETED
            ? renderCompletedButtons()
            : renderButtonsView()
          : null}
      </View>
      {yesorno && renderyesorno()}
    </SafeAreaView>
  );
};
