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
} from '@aph/mobile-doctors/src/components/ui/Icons';
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
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails,
  GetCaseSheet_getCaseSheet_patientDetails_familyHistory,
  GetCaseSheet_getCaseSheet_patientDetails_healthVault,
  GetCaseSheet_getCaseSheet_patientDetails_lifeStyle,
  GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteAdviceList';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import { GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteTestList';
import {
  APPOINTMENT_TYPE,
  ModifyCaseSheetInput,
  REQUEST_ROLES,
  STATUS,
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
} from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  NavigationParams,
  NavigationRoute,
  NavigationScreenProp,
  NavigationScreenProps,
} from 'react-navigation';

const { width } = Dimensions.get('window');

interface DataPair {
  key: string;
  value: string;
}

export interface CaseSheetViewProps extends NavigationScreenProps {
  onStartConsult: () => void;
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
  lifeStyleData: (GetCaseSheet_getCaseSheet_patientDetails_lifeStyle | null)[] | null | undefined;
  setLifeStyleData: React.Dispatch<
    React.SetStateAction<
      (GetCaseSheet_getCaseSheet_patientDetails_lifeStyle | null)[] | null | undefined
    >
  >;
  medicalHistory: GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory | null | undefined;
  setMedicalHistory: React.Dispatch<
    React.SetStateAction<
      GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory | null | undefined
    >
  >;
  familyValues: string;
  setFamilyValues: React.Dispatch<React.SetStateAction<string>>;
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null | undefined;
  setPatientDetails: React.Dispatch<
    React.SetStateAction<GetCaseSheet_getCaseSheet_patientDetails | null | undefined>
  >;
  healthWalletArrayData: (GetCaseSheet_getCaseSheet_patientDetails_healthVault | null)[] | null;
  setHealthWalletArrayData: React.Dispatch<
    React.SetStateAction<(GetCaseSheet_getCaseSheet_patientDetails_healthVault | null)[] | null>
  >;
  tests: {
    itemname: string;
    isSelected: boolean;
  }[];
  setTests: React.Dispatch<
    React.SetStateAction<
      {
        itemname: string;
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
  switchValue: boolean | null;
  setSwitchValue: React.Dispatch<React.SetStateAction<boolean | null>>;
  followupDays: string | number | undefined;
  setFollowupDays: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  followUpConsultationType: APPOINTMENT_TYPE | undefined;
  setFollowUpConsultationType: React.Dispatch<React.SetStateAction<APPOINTMENT_TYPE | undefined>>;
  doctorNotes: string;
  setDoctorNotes: React.Dispatch<React.SetStateAction<string>>;
  displayId: string;
  setDisplayId: React.Dispatch<React.SetStateAction<string>>;
  prescriptionPdf: string;
  setPrescriptionPdf: React.Dispatch<React.SetStateAction<string>>;
  chatFiles?: {
    prismId: string | null;
    url: string;
  }[];
  setShowPDF: Dispatch<SetStateAction<boolean>>;
  setPatientImageshow: Dispatch<SetStateAction<boolean>>;
  setUrl: Dispatch<SetStateAction<string>>;
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
  const [followup, setFollowUp] = useState(false);

  const [diagnosisView, setDiagnosisView] = useState(false);

  // This is dependent : 1728 // const [consultationPayType, setConsultationPayType] = useState<'PAID' | 'FREE' | ''>('');

  const [folloUpNotes, setFolloUpNotes] = useState<string>('');

  const [ShowAddTestPopup, setShowAddTestPopup] = useState<boolean>(false);

  const { showAphAlert, setLoading, loading, hideAphAlert } = useUIElements();
  const { doctorDetails } = useAuth();

  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [yesorno, setyesorno] = useState<boolean>(false);
  const client = useApolloClient();

  const {
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
    setJuniorDoctorNotes,
    diagnosisData,
    setDiagnosisData,
    medicinePrescriptionData,
    setMedicinePrescriptionData,
    selectedMedicinesId,
    setSelectedMedicinesId,
    switchValue,
    setSwitchValue,
    followupDays,
    setFollowupDays,
    followUpConsultationType,
    setFollowUpConsultationType,
    doctorNotes,
    setDoctorNotes,
    displayId,
    prescriptionPdf,
    setPrescriptionPdf,
    chatFiles,
    setShowPDF,
    setPatientImageshow,
    setUrl,
  } = props;

  const sendToPatientAction = () => {
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
        }
      })
      .catch((e) => {
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
      folloupDateTime: followup
        ? moment(
            g(props.caseSheet, 'caseSheetDetails', 'appointment', 'appointmentDateTime') ||
              new Date()
          )
            .add(Number(followupDays), 'd')
            .format('YYYY-MM-DD')
        : '',
      doctorId: g(props.caseSheet, 'caseSheetDetails', 'doctorId'),
      caseSheetId: g(props.caseSheet, 'caseSheetDetails', 'id'),
      doctorInfo: doctorDetails,
      pdfUrl: pdf || prescriptionPdf,
    };
    console.log(followupObj, 'followupObj');

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
      const age = moment().diff(patientDetails && patientDetails.dateOfBirth, 'years', true) || -1;
      props.navigation.navigate(AppRoutes.PreviewPrescription, {
        appointmentDetails: {
          patient: `${(patientDetails.firstName || '').trim()} ${(
            patientDetails.lastName || ''
          ).trim()} | ${patientDetails.gender || '-'} | ${
            age > -1 ? Math.round(age).toString() : '-'
          }`,
          vitals: medicalHistory
            ? `Weight: ${medicalHistory.weight || '-'} | Height: ${medicalHistory.height ||
                '-'} | BP: ${medicalHistory.bp ||
                '-'} | Temperature: ${medicalHistory.temperature || '-'} `
            : '',
          uhid: patientDetails.uhid,
          appId: displayId,
          date: moment(Appintmentdatetimeconsultpage).format('DD/MM/YYYY'),
          type: g(props.caseSheet, 'caseSheetDetails', 'appointment', 'appointmentType'),
        },
        complaints: symptonsData,
        diagnosis: diagnosisData,
        medicine: medicinePrescriptionData,
        tests: tests.filter((i) => i.isSelected).map((i) => i.itemname),
        advice: addedAdvices.map((i) => i.value),
        // followUp: null,
        onEditPress: () => {
          props.setCaseSheetEdit(true);
          setShowEditPreviewButtons(true);
          props.navigation.pop();
        },
        onSendPress: () => {
          props.onStopConsult();
          setShowButtons(true);
          saveDetails(true, undefined, sendToPatientAction);
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
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        console.log(_data, 'EndAppointmentSession');
        setCaseSheetEdit(false);
        setLoading && setLoading(false);
        props.overlayDisplay(null);
        prescriptionView();
        setShowEditPreviewButtons(true);
        // endCallNotification();
        const text = {
          id: g(props.caseSheet, 'caseSheetDetails', 'doctorId'),
          message: '^^#appointmentComplete',
          isTyping: true,
          messageDate: new Date(),
          sentBy: REQUEST_ROLES.DOCTOR,
        };
        props.messagePublish && props.messagePublish(text);
      })
      .catch((e) => {
        setLoading && setLoading(false);
        props.overlayDisplay(null);
        console.log('Error occured while End casesheet', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while End casesheet', errorMessage, error);
        showAphAlert &&
          showAphAlert({
            title: strings.common.uh_oh,
            description: strings.common.oops_msg,
          });
      });
  };

  const [enableConsultButton, setEnableConsultButton] = useState(false);

  useEffect(() => {
    // Start timer if consult is about to start within next 10 minutes so that if the user
    // is in the same screen for next 10 minutes we can keep on checking and enable consult button, no need to refresh the page
    // StartConsult Button will be disabled for previous (completed) appointments.

    // const _now = moment(new Date());
    // const _consultStartTime = moment
    //   .utc(Appintmentdatetimeconsultpage)
    //   .clone()
    //   .local();
    // const _consultEndTime = _consultStartTime.clone().add(15, 'minutes');
    // const _consultSubtractTime = _consultStartTime.clone().subtract(15, 'minutes');

    // const isConsultInBetween = _now.isBetween(_consultSubtractTime, _consultEndTime);
    // const diffBwConsultStartAndNowInMins = moment
    //   .duration(moment(_consultSubtractTime).diff(_now))
    //   .asMinutes();
    // const isAboutToStartWithinTenMinutes =
    //   diffBwConsultStartAndNowInMins > 0 && diffBwConsultStartAndNowInMins < 25;

    // if (isConsultInBetween) {
    //   setEnableConsultButton(true);
    // } else if (isAboutToStartWithinTenMinutes) {
    //   // Start timer here and clear when consult time starts
    //   console.log('timer started');
    //   const consultDisableInterval = setInterval(() => {
    //     if (moment(new Date()).isBetween(_consultStartTime, _consultEndTime)) {
    //       setEnableConsultButton(true);
    //       clearInterval(consultDisableInterval);
    //       console.log('timer cleared');
    //     }
    //   }, 1000);
    // }

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
      <StickyBottomComponent style={{ backgroundColor: '#f0f4f5', justifyContent: 'center' }}>
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
                  setShowButtons(true);
                  props.onStartConsult();
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
                  setyesorno(true);
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
            paddingBottom: 16,
          }}
        >
          <View style={styles.footerButtonsContainersave}>
            <Button
              title={'RESEND PRESCRIPTION'}
              onPress={() => {
                sendToPatientAction();
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
      <StickyBottomComponent style={{ backgroundColor: '#f0f4f5', justifyContent: 'center' }}>
        <View style={styles.footerButtonsContainer}>
          <Button
            title={caseSheetEdit ? 'SAVE' : 'EDIT CASE SHEET'}
            onPress={() => {
              if (caseSheetEdit) {
                setShowButtons(true);
                saveDetails(true, undefined, () => {
                  props.setCaseSheetEdit(false);
                  setLoading && setLoading(false);
                });
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
              setShowButtons(true);
              saveDetails(false);
              prescriptionView();
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
                        console.log(data, 'newdata');
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

  const renderFields = (
    heading: string,
    data: string,
    onChange?: (text: string) => void,
    multiline?: boolean
  ) => {
    return (
      <View>
        <Text style={theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6))}>
          {heading}
        </Text>
        <View
          style={{
            minHeight: 44,
            marginTop: 8,
            marginBottom: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderWidth: 1,
            borderRadius: 5,
            borderColor: theme.colors.darkBlueColor(0.15),
          }}
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
            textAlignVertical={multiline ? 'top' : undefined}
            selectionColor={theme.colors.INPUT_CURSOR_COLOR}
            onChange={(text) => onChange && onChange(text.nativeEvent.text)}
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
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
              }
            )}
            {renderFields(
              strings.case_sheet.weight,
              (medicalHistory && medicalHistory.weight) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  weight: text,
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
              }
            )}
            {renderFields(
              strings.case_sheet.bp,
              (medicalHistory && medicalHistory.bp) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  bp: text,
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
              }
            )}
            {renderFields(
              strings.case_sheet.temperature,
              (medicalHistory && medicalHistory.temperature) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  temperature: text,
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
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
              strings.case_sheet.medication_history,
              (medicalHistory && medicalHistory.pastMedicalHistory) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  pastMedicalHistory: text,
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
              },
              true
            )}
            {renderFields(
              strings.case_sheet.drug_allergies,
              (medicalHistory && medicalHistory.drugAllergies) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  drugAllergies: text,
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
              },
              true
            )}
            {renderFields(
              strings.case_sheet.diet_allergies,
              (medicalHistory && medicalHistory.dietAllergies) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  dietAllergies: text,
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
              },
              true
            )}
            {renderFields(
              strings.case_sheet.lifestyle_habits,
              (lifeStyleData && lifeStyleData.map((i) => i && i.description).join('\n')) || '',
              (text) => {
                const _lifeStyleData = text.split('\n').map((i) => {
                  if (i) {
                    return {
                      description: i,
                    };
                  }
                });
                setLifeStyleData(
                  _lifeStyleData as GetCaseSheet_getCaseSheet_patientDetails_lifeStyle[]
                );
              },
              true
            )}
            {renderFields(
              strings.case_sheet.menstrual_history,
              (medicalHistory && medicalHistory.menstrualHistory) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  menstrualHistory: text,
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
              },
              true
            )}
            {renderFields(
              strings.case_sheet.family_medical_history,
              familyValues,
              (text) => {
                setFamilyValues(text);
              },
              true
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };
  const renderJuniorDoctorNotes = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.jr_doctor_notes}
          collapse={juniorshow}
          onPress={() => setJuniorShow(!juniorshow)}
        >
          <View style={styles.symptomsInputView}>
            <TextInput
              style={[styles.symptomsText, { marginRight: 12 }]}
              multiline={true}
              onChangeText={(juniordoctornotes) =>
                caseSheetEdit && false && setJuniorDoctorNotes(juniordoctornotes)
              }
              editable={false}
            >
              {juniordoctornotes}
            </TextInput>
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
                  containerStyle={{
                    backgroundColor: !item.isSelected ? theme.colors.WHITE : '#F9F9F9',
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
                                      ? { itemname: i.itemname, isSelected: true }
                                      : i
                                  ),
                                ]);
                              } else {
                                setTests([...tests, { ...showdata, isSelected: true }]);
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
            onPress={() => setShowAddTestPopup(true)}
            style={{ marginBottom: 19, marginLeft: 16, marginTop: 0 }}
          />
        )}
      </CollapseCard>
    );
  };

  const renderMedicineDetails = (
    item:
      | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
      | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
  ) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 14, '#02475b', 1, undefined, 0.02),
          flex: 0.95,
        }}
      >
        {item.medicineName + '\n'}
        <Text
          style={{
            ...theme.viewStyles.text('S', 12, '#02475b', 1, 14, 0.02),
          }}
        >
          {medicineDescription(item)}
        </Text>
      </Text>
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
          {medicinePrescriptionData == null || medicinePrescriptionData.length == 0
            ? renderInfoText(strings.case_sheet.no_medicine_Added)
            : medicinePrescriptionData.map((showdata, i) => {
                if (showdata) {
                  const isSelected =
                    selectedMedicinesId.findIndex(
                      (i) => i === (showdata.externalId || showdata.id)
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
                                      i: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null
                                    ) =>
                                      ((i || {}).externalId || (i || {}).id) !==
                                      (data.externalId || data.id)
                                  ) || []),
                                  data as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                                ]);
                                setSelectedMedicinesId(
                                  [
                                    ...selectedMedicinesId.filter(
                                      (i) => i !== (data.externalId || data.id)
                                    ),
                                    data.externalId || data.id || '',
                                  ].filter((i) => i !== '')
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
                                  ].filter((i) => i !== '')
                                );
                              } else {
                                setSelectedMedicinesId([
                                  ...selectedMedicinesId.filter(
                                    (i) => i != (showdata.externalId || showdata.id)
                                  ),
                                ]);
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
              })}

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
                                  console.log(medicinePrescriptionData, selectedMedicinesId);
                                  if (medicinePrescriptionData) {
                                    setMedicinePrescriptionData([
                                      ...(medicinePrescriptionData.filter(
                                        (
                                          i: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null
                                        ) =>
                                          ((i || {}).externalId || (i || {}).id) !==
                                          (data.externalId || data.id)
                                      ) || []),
                                      data as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                                    ]);
                                  } else {
                                    setMedicinePrescriptionData([
                                      data as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                                    ]);
                                  }
                                  setSelectedMedicinesId(
                                    [
                                      ...selectedMedicinesId.filter(
                                        (i) => i !== (data.externalId || data.id)
                                      ),
                                      data.externalId || data.id || '',
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
                            ...selectedMedicinesId.filter((i) => i !== data.externalId || data.id),
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
          )}
        </View>
      </CollapseCard>
    );
  };

  //It will be used in future
  const renderFollowUpView = () => {
    return (
      <View>
        <CollapseCard
          heading={strings.case_sheet.follow_up}
          collapse={followup}
          onPress={() => setFollowUp(!followup)}
        >
          <View style={{ marginHorizontal: 16 }}>
            {switchValue && (
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, '#02474b', 1, undefined, 0.02),
                  marginRight: 20,
                  marginBottom: 10,
                }}
              >
                {strings.case_sheet.first_follow_up_descr}
              </Text>
            )}
            <View
              style={{
                marginBottom: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.medicineText}>
                {strings.case_sheet.do_you_recommend_followup}
              </Text>
              {!switchValue ? (
                <View>
                  <TouchableOpacity onPress={() => caseSheetEdit && setSwitchValue(!switchValue)}>
                    <View>
                      <ToogleOff />
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TouchableOpacity onPress={() => caseSheetEdit && setSwitchValue(!switchValue)}>
                    <View>
                      <ToogleOn />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {switchValue ? (
              <View>
                <View style={styles.medicineunderline}></View>
                <View style={{ marginBottom: 20, marginRight: 25 }}>
                  <Text style={[styles.medicineText, { marginBottom: 7 }]}>
                    {strings.case_sheet.follow_up_after}
                  </Text>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput
                        autoCorrect={false}
                        keyboardType={'number-pad'}
                        multiline={false}
                        maxLength={4}
                        style={styles.inputSingleView}
                        value={followupDays ? followupDays.toString() : ''}
                        blurOnSubmit={false}
                        // returnKeyType="send"
                        onChangeText={(value) => {
                          setFollowupDays(parseInt(value, 10) || '');
                        }}
                      />
                      <Text
                        style={{
                          ...theme.viewStyles.text('M', 14, '#02475b', 1, undefined, 0.02),
                          marginBottom: 7,
                          marginLeft: 8,
                        }}
                      >
                        {strings.common.days}
                      </Text>
                    </View>
                  </View>
                </View>
                <TextInput
                  placeholder={strings.common.add_instructions_here}
                  style={[styles.inputView, { marginBottom: 18 }]}
                  multiline={true}
                  textAlignVertical={'top'}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  value={folloUpNotes}
                  onChangeText={(value) => setFolloUpNotes(value)}
                  autoCorrect={true}
                />
                {/* <View style={{ marginBottom: 20, zIndex: -1 }}>
                  <Text
                    style={{
                      color: 'rgba(2, 71, 91, 0.6)',
                      ...theme.fonts.IBMPlexSansMedium(14),
                      marginBottom: 12,
                    }}
                  >
                    Recommended Consult Type
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <View>
                      <SelectableButton
                        containerStyle={{
                          marginRight: 20,
                          borderColor: '#00b38e',
                          borderWidth: 1,
                          minWidth: '40%',
                          borderRadius: 5,
                        }}
                        onChange={() => {
                          setConsultationPayType('PAID');
                        }}
                        title="Paid"
                        isChecked={consultationPayType == 'PAID'}
                      />
                    </View>
                    <View>
                      <SelectableButton
                        containerStyle={{
                          marginRight: 20,
                          borderColor: '#00b38e',
                          borderWidth: 1,
                          minWidth: '40%',
                          borderRadius: 5,
                        }}
                        onChange={() => {
                          setConsultationPayType('FREE');
                        }}
                        title="Free"
                        isChecked={consultationPayType == 'FREE'}
                      />
                    </View>
                  </View>
                </View> */}
                <View style={{ borderColor: '#00b38e', marginBottom: 12, zIndex: -1 }}>
                  <Text
                    style={{
                      color: 'rgba(2, 71, 91, 0.6)',
                      ...theme.fonts.IBMPlexSansMedium(14),
                      marginBottom: 12,
                    }}
                  >
                    {strings.case_sheet.recommend_consult_type}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <View>
                      <SelectableButton
                        containerStyle={{
                          marginRight: 20,
                          borderColor: '#00b38e',
                          borderWidth: 1,
                          minWidth: '40%',
                          borderRadius: 5,
                        }}
                        onChange={() => {
                          if (followUpConsultationType === APPOINTMENT_TYPE.ONLINE) {
                            setFollowUpConsultationType(undefined);
                          } else if (followUpConsultationType === APPOINTMENT_TYPE.PHYSICAL) {
                            setFollowUpConsultationType(APPOINTMENT_TYPE.BOTH);
                          } else if (followUpConsultationType === APPOINTMENT_TYPE.BOTH) {
                            setFollowUpConsultationType(APPOINTMENT_TYPE.PHYSICAL);
                          } else {
                            setFollowUpConsultationType(APPOINTMENT_TYPE.ONLINE);
                          }
                        }}
                        title={strings.case_sheet.online}
                        isChecked={
                          followUpConsultationType === APPOINTMENT_TYPE.ONLINE ||
                          followUpConsultationType === APPOINTMENT_TYPE.BOTH
                        }
                        icon={
                          followUpConsultationType === APPOINTMENT_TYPE.ONLINE ||
                          followUpConsultationType === APPOINTMENT_TYPE.BOTH ? (
                            <PhysicalIcon />
                          ) : (
                            <GreenOnline />
                          )
                        }
                      />
                    </View>
                    <View>
                      <SelectableButton
                        containerStyle={{
                          marginRight: 20,
                          borderColor: '#00b38e',
                          borderWidth: 1,
                          minWidth: '40%',
                          borderRadius: 5,
                        }}
                        onChange={() => {
                          if (followUpConsultationType === APPOINTMENT_TYPE.ONLINE) {
                            setFollowUpConsultationType(APPOINTMENT_TYPE.BOTH);
                          } else if (followUpConsultationType === APPOINTMENT_TYPE.PHYSICAL) {
                            setFollowUpConsultationType(undefined);
                          } else if (followUpConsultationType === APPOINTMENT_TYPE.BOTH) {
                            setFollowUpConsultationType(APPOINTMENT_TYPE.ONLINE);
                          } else {
                            setFollowUpConsultationType(APPOINTMENT_TYPE.PHYSICAL);
                          }
                        }}
                        title={strings.case_sheet.in_person}
                        isChecked={
                          followUpConsultationType === APPOINTMENT_TYPE.PHYSICAL ||
                          followUpConsultationType === APPOINTMENT_TYPE.BOTH
                        }
                        icon={
                          followUpConsultationType === APPOINTMENT_TYPE.PHYSICAL ||
                          followUpConsultationType === APPOINTMENT_TYPE.BOTH ? (
                            <InpersonWhiteIcon />
                          ) : (
                            <InpersonIcon />
                          )
                        }
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : null}
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

  // const removeInstrution = (item: string | null) => {
  //   console.log('item', item);
  //   const list = otherInstructionsData.filter(
  //     (other: GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions) =>
  //       other.instruction != item
  //   );
  //   setOtherInstructionsData(list);
  // };
  // const renderOtherInstructionsView = () => {
  //   return (
  //     <View style={{ zIndex: -1 }}>
  //       <CollapseCard
  //         heading={strings.common.other_instructions}
  //         collapse={otherInstructions}
  //         onPress={() => setOtherInstructions(!otherInstructions)}
  //       >
  //         <Text style={[styles.familyText, { marginBottom: 12 }]}>
  //           {strings.case_sheet.instructions_to_patient}
  //         </Text>
  //         {otherInstructionsData == null ? (
  //           <Text style={[styles.symptomsText, { textAlign: 'center' }]}>
  //             {strings.common.no_data}
  //           </Text>
  //         ) : (
  //           otherInstructionsData.map(
  //             (showdata: GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions, i: any) => {
  //               return (
  //                 <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
  //                   <DiagnosicsCard
  //                     diseaseName={showdata.instruction}
  //                     icon={
  //                       <TouchableOpacity onPress={() => removeInstrution(showdata.instruction)}>
  //                         {<DiagonisisRemove />}
  //                       </TouchableOpacity>
  //                     }
  //                   />
  //                 </View>
  //               );
  //             }
  //           )
  //         )}
  //         {otherInstructionsadd ? (
  //           <View>
  //             <Text style={[styles.familyText, { marginBottom: 12 }]}>
  //               {strings.common.add_instructions}
  //             </Text>
  //             <View
  //               style={{
  //                 flexDirection: 'row',
  //                 justifyContent: 'center',
  //                 alignItems: 'center',
  //                 backgroundColor: '#fff',
  //                 borderWidth: 1,
  //                 borderColor: '#30c1a3',
  //                 borderRadius: 10,
  //                 marginBottom: 16,
  //                 marginLeft: 20,
  //                 marginRight: 20,
  //               }}
  //             >
  //               <TextInput
  //                 style={{
  //                   flex: 1,
  //                   ...theme.fonts.IBMPlexSansMedium(14),
  //                   paddingLeft: 12,
  //                   marginTop: 12,
  //                   marginLeft: 0,
  //                   color: '#01475b',
  //                   marginBottom: 16,
  //                 }}
  //                 placeholder={strings.common.enter_instructions_here}
  //                 underlineColorAndroid="transparent"
  //                 multiline={true}
  //                 placeholderTextColor="rgba(2, 71, 91, 0.4)"
  //                 value={othervalue}
  //                 maxLength={100}
  //                 onChangeText={(othervalue) => setOthervalue(othervalue)}
  //               />
  //               <TouchableOpacity
  //                 onPress={() => {
  //                   if (othervalue == '' || othervalue.trim() == '') {
  //                     Alert.alert(strings.alerts.please_add_other_instructions);
  //                   } else if (
  //                     otherInstructionsData.find((item: any) => item.instruction == othervalue)
  //                   ) {
  //                     Alert.alert(strings.alerts.instruction_already_added);
  //                   } else {
  //                     setOtherInstructionsData([
  //                       ...otherInstructionsData,
  //                       {
  //                         instruction: othervalue,
  //                       },
  //                     ]);

  //                     setOtherInstructionsAdd(!otherInstructionsadd);
  //                     setOthervalue('');
  //                     // renderOtherInstructionsView();
  //                   }
  //                 }}
  //               >
  //                 <View style={{ alignItems: 'flex-end', margin: 8 }}>
  //                   <Green />
  //                 </View>
  //               </TouchableOpacity>
  //             </View>
  //           </View>
  //         ) : (
  //           caseSheetEdit && (
  //             <AddIconLabel
  //               label={strings.buttons.add_instructions}
  //               onPress={() => setOtherInstructionsAdd(!otherInstructionsadd)}
  //               style={{ marginLeft: 16, marginTop: 0, marginBottom: 19 }}
  //             />
  //           )
  //         )}
  //       </CollapseCard>
  //     </View>
  //   );
  // };
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
        {pastList &&
          pastList.map((i, index, array) => {
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
                      // onPress={() =>
                      //   props.navigation.navigate(AppRoutes.CaseSheetDetails, {
                      //     consultDetails: i,
                      //     patientDetails: props.patientDetails,
                      //   })
                      // }
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
                        {moment(i.appointmentDateTime).format('D MMMM, HH:MM A')}
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
          })}
      </View>
    );
  };
  const renderRecordImages = (urls: (string | null)[]) => {
    return (
      <View style={styles.healthvaultMainContainer}>
        {urls.map((url) => {
          if (url) {
            return (
              <View style={styles.healthvaultImageContainer}>
                {url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      setUrl(url);
                      setPatientImageshow(true);
                    }}
                  >
                    <Image source={{ uri: url }} style={styles.healthvaultImage} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      setUrl(url);
                      if (url.match(/\.(pdf)$/)) {
                        setShowPDF(true);
                      } else {
                        Linking.openURL(url);
                      }
                    }}
                  >
                    <FileBig style={styles.healthvaultImage} />
                  </TouchableOpacity>
                )}
              </View>
            );
          } else {
            return null;
          }
        })}
      </View>
    );
  };
  const [patientImages, setPatientImages] = useState<(string | null)[]>([]);
  const [records, setRecords] = useState<(string | null)[]>([]);
  const sortPDF = (urls: (string | null)[], ispdf: boolean) => {
    return urls.map((url) => {
      if (ispdf && url && url.match(/\.(pdf)$/)) {
        return url;
      } else if (!ispdf && url && !url.match(/\.(pdf)$/)) {
        return url;
      } else {
        return null;
      }
    });
  };
  useEffect(() => {
    const images =
      (healthWalletArrayData && healthWalletArrayData.map((i) => i && i.imageUrls)) || [];
    const records =
      (healthWalletArrayData && healthWalletArrayData.map((i) => i && i.reportUrls)) || [];
    if (chatFiles) {
      const prismIds: string[] = chatFiles.map((i) => i.prismId || '').filter((i) => i !== '');
      const onlyUrl: string[] = chatFiles
        .filter((i) => i.prismId === null || i.prismId === '')
        .map((i) => i.url);
      images.push(...sortPDF(onlyUrl, false));
      records.push(...sortPDF(onlyUrl, true));
      if (prismIds.length > 0) {
        getPrismUrls(
          client,
          (doctorDetails && doctorDetails.id) || (patientDetails && patientDetails.id) || '',
          prismIds
        )
          .then((data) => {
            if (data && data.urls) {
              images.push(...sortPDF(data.urls, false));
              records.push(...sortPDF(data.urls, true));
            }
            setPatientImages(images);
            setRecords(records);
          })
          .catch((e) => {
            setPatientImages(images);
            setRecords(records);
          });
      } else {
        setPatientImages(images);
        setRecords(records);
      }
    } else {
      setPatientImages(images);
      setRecords(records);
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
          <View style={{ marginHorizontal: 16 }}>
            {renderHeaderText(strings.case_sheet.photos_uploaded_by_patient)}
            {patientImages.length > 0
              ? renderRecordImages(patientImages)
              : renderInfoText(strings.common.no_data)}
            {renderHeaderText(strings.case_sheet.reports)}
            {records.length > 0
              ? renderRecordImages(records)
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

  const renderAddTestPopup = () => {
    return (
      <AddTestPopup
        // searchTestVal={searchTestVal}
        onClose={() => {
          setShowAddTestPopup(false);
        }}
        onPressDone={(searchTestVal, tempTestArray) => {
          const tempTest = tests;
          const newData = tempTestArray.length
            ? tempTestArray.map((ele) => {
                const existingElement = tests.findIndex((i) => i.itemname === ele.itemname);
                if (existingElement > -1) {
                  tempTest[existingElement].isSelected = true;
                  return { itemname: '', isSelected: false };
                } else {
                  return { itemname: ele.itemname || '', isSelected: true };
                }
              })
            : [{ itemname: searchTestVal, isSelected: true }];

          setTests([...tempTest, ...newData.filter((i) => i.itemname !== '')]);
          setShowAddTestPopup(!ShowAddTestPopup);
        }}
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
              {age > -1 ? Math.round(age).toString() : '-'}
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
          <Image
            source={{
              uri: (patientDetails && patientDetails.photoUrl) || '',
            }}
            style={{ height: width, width: width }}
            resizeMode={'contain'}
            placeholderStyle={{
              height: width,
              width: width,
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            PlaceholderContent={
              loading ? <></> : <Spinner style={{ backgroundColor: 'transparent' }} />
            }
          />
        ) : (
          <UserPlaceHolder
            style={{
              height: 150,
              width: width,
              alignItems: 'center',
              backgroundColor: 'white',
              resizeMode: 'contain',
            }}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.casesheetView}>
      <View style={styles.casesheetView}>
        <KeyboardAwareScrollView style={{ flex: 1 }} bounces={false}>
          <ScrollView bounces={false} style={{ zIndex: 1 }}>
            <View style={{ height: 20, backgroundColor: '#f0f4f5' }}></View>
            {renderPatientImage()}
            {renderBasicProfileDetails(displayId, Appintmentdatetimeconsultpage)}
            {renderSymptonsView()}
            {renderVitals()}
            {renderPatientHistoryLifestyle()}
            {renderPatientHealthWallet()}
            {renderJuniorDoctorNotes()}
            {renderDiagnosisView()}
            {renderMedicinePrescription()}
            {renderDiagonisticPrescription()}
            {renderAdviceInstruction()}
            {/* {renderFollowUpView()} */}

            <View style={{ zIndex: -1 }}>
              {/* {renderOtherInstructionsView()} */}
              <View style={styles.underlineend} />

              <View style={styles.inputBorderView}>
                <View style={{ margin: 16 }}>
                  <Text style={styles.notes}>{strings.case_sheet.personal_note}</Text>
                  <TextInput
                    placeholder={strings.case_sheet.note_placeholder}
                    textAlignVertical={'top'}
                    placeholderTextColor={theme.colors.placeholderTextColor}
                    style={styles.inputView}
                    multiline={true}
                    value={doctorNotes}
                    onChangeText={(value) => caseSheetEdit && setDoctorNotes(value)}
                    autoCorrect={true}
                  />
                </View>
              </View>
            </View>

            {showPopUp && CallPopUp()}
            {ShowAddTestPopup && renderAddTestPopup()}

            <View style={{ height: 80 }} />
          </ScrollView>
        </KeyboardAwareScrollView>
        {showEditPreviewButtons
          ? renderEditPreviewButtons()
          : stastus == STATUS.COMPLETED
          ? renderCompletedButtons()
          : renderButtonsView()}
      </View>
      {yesorno && renderyesorno()}
    </SafeAreaView>
  );
};
