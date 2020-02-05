import {
  getDiagnosticPrescriptionDataList,
  getDiagonsisList,
  getMedicineList,
  getSysmptonsList,
  removeDiagnosticPrescriptionDataList,
  setDiagnosticPrescriptionDataList,
  setDiagonsisList,
  setMedicineList,
  setSysmptonsList,
} from '@aph/mobile-doctors/src/components/ApiCall';
import { CaseSheetAPI } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetAPI';
import { DiagnosisCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosisCard';
import { DiagnosicsCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosticsCard';
import { SymptonsCard } from '@aph/mobile-doctors/src/components/ConsultRoom/SymptonsCard';
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
  CheckboxSelected,
  CheckboxUnSelected,
  ClosePopup,
  DiagonisisRemove,
  Edit,
  End,
  Green,
  GreenOnline,
  GreenRemove,
  InpersonIcon,
  PatientPlaceHolderImage,
  PhysicalIcon,
  RoundCallIcon,
  RoundVideoIcon,
  Selected,
  Start,
  ToogleOff,
  ToogleOn,
  GreenOnline,
  AddIcon,
  PlusOrange,
  CheckboxSelected,
  CheckboxUnSelected,
  Edit,
  UnSelected,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { PastConsultCard } from '@aph/mobile-doctors/src/components/ui/PastConsultCard';
import { SelectableButton } from '@aph/mobile-doctors/src/components/ui/SelectableButton';
import { CaseSheetContext } from '@aph/mobile-doctors/src/context/CaseSheetContext';
import {
  CREATEAPPOINTMENTSESSION,
  END_APPOINTMENT_SESSION,
  GET_CASESHEET,
  GET_DOCTOR_FAVOURITE_TEST_LIST,
  MODIFY_CASESHEET,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/CreateAppointmentSession';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/EndAppointmentSession';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory,
  GetCaseSheet_getCaseSheet_patientDetails_familyHistory,
  GetCaseSheet_getCaseSheet_patientDetails_lifeStyle,
  GetCaseSheet_getCaseSheet_patientDetails_healthVault,
  GetCaseSheet_getCaseSheet_pastAppointments,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import {
  REQUEST_ROLES,
  STATUS,
  MEDICINE_UNIT,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  UpdateCaseSheet,
  UpdateCaseSheetVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdateCaseSheet';
import { PatientInfoData } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { medUsageType, nameFormater } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  NavigationParams,
  NavigationRoute,
  NavigationScreenProp,
  NavigationScreenProps,
} from 'react-navigation';
import { CaseSheetAPI } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetAPI';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import { AddMedicinePopUp } from '@aph/mobile-doctors/src/components/ui/AddMedicinePopUp';
import { nameFormater, medUsageType } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { AddInstructionPopUp } from '@aph/mobile-doctors/src/components/ui/AddInstructionPopUp';
import { AddConditionPopUp } from '@aph/mobile-doctors/src/components/ui/AddConditionPopUp';
import { AddSymptomPopUp } from '@aph/mobile-doctors/src/components/ui/AddSymptomPopUp';
const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  casesheetView: {
    // height: screenHeight,
    flex: 1,
    width: '100%',
    backgroundColor: '#f7f7f7',
  },
  nameText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(20),
    marginLeft: 20,
    // marginBottom: 8,
  },
  agetext: {
    color: 'rgba(2, 71, 91, 0.8)',
    ...theme.fonts.IBMPlexSansMedium(16),
    marginLeft: 15,
    // marginTop: 4,
  },
  understatusline: {
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: 'rgba(2, 71, 91, 0.4)',
    ...ifIphoneX(
      {
        height: 1,
      },
      {
        height: 1,
      }
    ),
    marginLeft: 20,
    marginRight: 54,
    marginBottom: 16,
  },
  line: {
    height: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(2, 71, 91, 0.6)',
    marginLeft: 15,
    // marginTop: 10,
  },
  uhidText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: 'rgba(2, 71, 91, 0.6)',
    marginLeft: 20,
    marginBottom: 11.5,
  },
  appid: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    // marginBottom: 8,
  },
  appdate: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#02475b',
  },
  contentContainer: {
    // paddingVertical: 20,
  },
  underlineend: {
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#02475b',
    opacity: 0.4,
    ...ifIphoneX(
      {
        height: 1,
      },
      {
        height: 1,
      }
    ),
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 12,
    marginTop: 5,
  },

  buttonStyle: {
    width: '50%',
    flex: 1,

    marginBottom: 20,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonendStyle: {
    width: '45%',
    height: 40,
    backgroundColor: '#890000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.4,
    elevation: 2,
  },
  buttonsaveStyle: {
    width: '35%',
    height: 40,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
  },
  footerButtonsContainer: {
    // zIndex: -1,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  footerButtonsContainersave: {
    zIndex: -1,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '50%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  inputView: {
    borderWidth: 2,
    borderRadius: 10,
    height: 80,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingTop: 12,
    borderColor: theme.colors.APP_GREEN,
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
  },
  inputSingleView: {
    borderBottomWidth: 2,
    width: width / 2.75,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 2,
    paddingTop: 0,
    borderColor: theme.colors.APP_GREEN,
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
  },
  inputBorderView: {
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    //padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 30,
  },
  notes: {
    ...theme.fonts.IBMPlexSansMedium(17),
    color: '#0087ba',
    marginBottom: 10,
  },
  symptomsInputView: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  symptomsText: {
    marginTop: 12,
    marginLeft: 12,
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 16,
  },

  familyText: {
    //marginTop: 12,
    marginLeft: 16,
    color: '#02475b',
    opacity: 0.6,
    ...theme.fonts.IBMPlexSansMedium(14),
    letterSpacing: 0.03,
    marginBottom: 12,
  },
  familyInputView: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderStyle: 'solid',
    borderColor: 'rgba(2, 71, 91, 0.15)',
  },

  AllergiesInputView: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderStyle: 'solid',
    borderColor: 'rgba(2, 71, 91, 0.15)',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
  },

  medicineText: {
    color: 'rgba(2, 71, 91, 0.6)',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 0,
  },

  medicineunderline: {
    height: 2,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    opacity: 0.2,
    marginBottom: 13,
  },
  addDoctorText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0,
    color: '#fc9916',
    marginTop: 2,
    marginLeft: 7,
  },
  normalSliderText: {
    textAlign: 'center',
    color: '#00b38e',
    ...theme.fonts.IBMPlexSansSemiBold(16),
  },
  sliderText: {
    textAlign: 'center',
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(12),
    opacity: 0.6,
  },
  calenderView: {
    //position: 'absolute',
    //zIndex: 2,

    width: '90%',
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowRadius: 10,
    shadowOpacity: 0.2,
    //elevation: 15,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        // zIndex: 1,
        // top: -32,
        position: 'absolute',
      },
      android: {
        zIndex: 200,
        elevation: Platform.OS === 'android' ? 250 : 0,
        // position: 'absolute',
      },
    }),
  },
  dataCardsStyle: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginVertical: 6,
    borderColor: 'rgba(2, 71, 91, 0.2)',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
  },
});

const renderPatientImage = () => {
  return (
    <View style={{ marginBottom: 20 }}>
      <PatientPlaceHolderImage />
    </View>
  );
};
const profileRow = (
  PatientInfoData: PatientInfoData,
  AppId: string,
  Appintmentdatetimeconsultpage: string
) => {
  // if (!firstName) return null;
  const dateOfBirth = moment(PatientInfoData.dateOfBirth).format('YYYY');
  const todayYear = moment(new Date()).format('YYYY');
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={styles.nameText}>{PatientInfoData.firstName}</Text>
        <View style={styles.line}></View>
        <Text style={styles.agetext}>
          {todayYear - dateOfBirth}
          {PatientInfoData.gender ? `, ${PatientInfoData.gender.charAt(0)} ` : ''}
          {PatientInfoData.addressList && PatientInfoData.addressList.length > 0
            ? `, ${PatientInfoData.addressList[0].city}`
            : ''}
        </Text>
      </View>
      {PatientInfoData.uhid != '' ? (
        <Text style={styles.uhidText}>UHID : {PatientInfoData.uhid} </Text>
      ) : null}

      <View style={styles.understatusline} />
      <View>
        {registerDetails('Appt ID: ', AppId.slice(-5))}
        {registerDetailsAppDate('Appt Date: ', Appintmentdatetimeconsultpage)}
      </View>
    </View>
  );
};

const registerDetails = (ApptId: string, appIdDate: string) => {
  if (!appIdDate) return null;
  return (
    <View style={{ flexDirection: 'row', marginLeft: 20, marginBottom: 8 }}>
      <Text style={styles.appid}>{ApptId}</Text>
      <Text style={styles.appdate}>{appIdDate}</Text>
    </View>
  );
};
const registerDetailsAppDate = (ApptId: string, appIdDate: string) => {
  if (!appIdDate) return null;
  return (
    <View style={{ flexDirection: 'row', marginLeft: 20, alignItems: 'center' }}>
      <Text style={styles.appid}>{ApptId}</Text>
      <Text style={styles.appdate}>{moment(appIdDate).format('DD/MM/YYYY')}</Text>
      <View
        style={{
          height: 12,
          borderWidth: 1,
          borderColor: 'rgba(2, 71, 91, 0.6)',
          marginHorizontal: 5,
        }}
      ></View>
      <Text style={styles.appdate}>{moment(appIdDate).format('HH:mm A')}</Text>
    </View>
  );
};
// moment(Appintmentdatetimeconsultpage).format('DD/MM/YYYY | HH:mm A');
const renderBasicProfileDetails = (
  PatientInfoData: PatientInfoData,
  AppId: string,
  Appintmentdatetimeconsultpage: string
) => {
  return (
    <View style={{ backgroundColor: '#f7f7f7', paddingBottom: 11 }}>
      {profileRow(PatientInfoData, AppId, Appintmentdatetimeconsultpage)}
    </View>
  );
};

interface dataPair {
  key: string;
  value: string;
}

export interface CaseSheetViewProps extends NavigationScreenProps {
  onStartConsult: () => void;
  onStopConsult: () => void;
  startConsult: boolean;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  overlayDisplay: (renderDisplay: React.ReactNode) => void;
}

export const CaseSheetView: React.FC<CaseSheetViewProps> = (props) => {
  const PatientInfoData = props.navigation.getParam('PatientInfoAll');
  const Appintmentdatetimeconsultpage = props.navigation.getParam('Appintmentdatetime');
  const AppId = props.navigation.getParam('AppId');
  const stastus = props.navigation.getParam('AppointmentStatus');
  //const isDelegateLogin = props.navigation.getParam('DelegateNumberLoginSuccess');
  const [value, setValue] = useState<string>('');
  const [othervalue, setOthervalue] = useState<string>('');
  const [familyValues, setFamilyValues] = useState<
    (GetCaseSheet_getCaseSheet_patientDetails_familyHistory | null)[] | null
  >([]);

  const [allergiesData, setAllergiesData] = useState<string>('');
  const [lifeStyleData, setLifeStyleData] = useState<
    (GetCaseSheet_getCaseSheet_patientDetails_lifeStyle | null)[] | null
  >();
  const [juniordoctornotes, setJuniorDoctorNotes] = useState<string>('');
  const [showButtons, setShowButtons] = useState(false);
  const [show, setShow] = useState(false);
  const [vitalsShow, setVitalsShow] = useState(false);
  const [juniorshow, setJuniorShow] = useState(false);
  const [patientHistoryshow, setpatientHistoryshow] = useState(false);
  const [otherInstructions, setOtherInstructions] = useState(false);
  const [patientHealthWallet, setPatientHealthWallet] = useState(false);
  const [showdiagonisticPrescription, setshowdiagonisticPrescription] = useState(false);
  const [medicinePrescription, setMedicinePrescription] = useState(false);
  const [adviceInstructions, setAdviceInstructions] = useState(false);
  const [followup, setFollowUp] = useState(false);
  const [otherInstructionsadd, setOtherInstructionsAdd] = useState(false);
  const [switchValue, setSwitchValue] = useState(true);
  const [sliderValue, setSliderValue] = useState(2);
  const [diagnosisView, setDiagnosisView] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [selectDate, setSelectDate] = useState<string>('mm/dd/yyyy');
  const [symptonsData, setSymptonsData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null
  >([]);
  const [diagnosisData, setDiagnosisData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null
  >([]);
  const [diagnosticPrescriptionData, setDiagnosticPrescription] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription | null)[] | null
  >(null);
  const [otherInstructionsData, setOtherInstructionsData] = useState<any>([]);
  const [medicinePrescriptionData, setMedicinePrescriptionData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null
  >();
  const [selectedMedicinesId, setSelectedMedicinesId] = useState<string[]>([]);
  const [getcasesheetId, setGetCaseshhetId] = useState<string>('');
  const [
    medicalHistory,
    setMedicalHistory,
  ] = useState<GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory | null>();
  const [healthWalletArrayData, setHealthWalletArrayData] = useState<
    (GetCaseSheet_getCaseSheet_patientDetails_healthVault | null)[] | null
  >([]);
  const [pastList, setPastList] = useState<
    (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null
  >([]);
  const { isDelegateLogin, setIsDelegateLogin } = useAuth();

  const [consultationType, setConsultationType] = useState<'ONLINE' | 'PHYSICAL' | ''>('');
  const [consultationPayType, setConsultationPayType] = useState<'PAID' | 'FREE' | ''>('');
  const [followupDays, setFollowupDays] = useState<number | string>();
  const [folloUpNotes, setFolloUpNotes] = useState<string>('');

  const [addedAdvices, setAddedAdvices] = useState<dataPair[]>([]);
  const [favAdvices, setFavAdvices] = useState<dataPair[]>([]);
  const [ShowAddTestPopup, setShowAddTestPopup] = useState<boolean>(false);
  const [tests, setTests] = useState<{ itemname: string; isSelected: boolean }[]>([]);
  const [favTests, setfavTests] = useState<
    (GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList | null)[]
  >([]);

  const { setCaseSheetEdit, caseSheetEdit } = useContext(CaseSheetContext);

  let Delegate = '';

  const [loading, setLoading] = useState<boolean>(false);
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const client = useApolloClient();
  const {
    favList,
    favListError,
    favlistLoading,
    favMed,
    favMedLoading,
    favMidError,
  } = CaseSheetAPI();

  useEffect(() => {
    if (favList) {
      let data: dataPair[] = [];
      favList.getDoctorFavouriteAdviceList &&
        favList.getDoctorFavouriteAdviceList.adviceList &&
        favList.getDoctorFavouriteAdviceList.adviceList.forEach((item) => {
          if (item) data.push({ key: item.id, value: item.instruction });
        });
      data && setFavAdvices(data);
    }
  }, [favList]);
  useEffect(() => {
    // client2
    //   .mutate<CreateAppointmentSession, CreateAppointmentSessionVariables>({
    //     mutation: CREATEAPPOINTMENTSESSION,
    //     variables: {
    //       createAppointmentSessionInput: {
    //         appointmentId: AppId,
    //         requestRole: REQUEST_ROLES.DOCTOR,
    //       },
    //     },
    //   })
    //   .then((_data: any) => {
    //     console.log('creat', _data);
    //     setGetCaseshhetId(_data.data.createAppointmentSession.caseSheetId);
    //   })
    //   .catch((e: any) => {
    //     console.log('Error occured while create session', e);
    //   });
    GetFavouriteTestList();
  }, []);

  const GetFavouriteTestList = () => {
    client
      .query<GetDoctorFavouriteTestList>({
        query: GET_DOCTOR_FAVOURITE_TEST_LIST,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data && data.getDoctorFavouriteTestList && data.getDoctorFavouriteTestList.testList) {
          const TestList = data.getDoctorFavouriteTestList!.testList;
          console.log('TestList :', TestList);
          setfavTests(TestList);
        }

        setLoading(false);
      })
      .catch((e) => {
        console.log('Error occured while fetching Tests List', e);
      });
  };

  useEffect(() => {
    setLoading(true);
    client
      .query<GetCaseSheet>({
        query: GET_CASESHEET,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: AppId },
      })
      .then((_data) => {
        const result = _data.data.getCaseSheet;
        console.log('GET_JUNIOR_DOCTOR_CASESHEET', result);
        console.log('healthvallet', _data.data.getCaseSheet!.patientDetails!.healthVault!);
        setSymptonsData(_data.data.getCaseSheet!.caseSheetDetails!.symptoms);
        setMedicalHistory(_data.data.getCaseSheet!.patientDetails!.patientMedicalHistory);
        setFamilyValues(_data.data.getCaseSheet!.patientDetails!.familyHistory);
        setAllergiesData(_data.data.getCaseSheet!.patientDetails!.allergies!);
        setLifeStyleData(_data.data.getCaseSheet!.patientDetails!.lifeStyle);
        setJuniorDoctorNotes(_data.data.getCaseSheet!.caseSheetDetails!.notes!);
        setDiagnosisData(_data.data.getCaseSheet!.caseSheetDetails!.diagnosis);
        setOtherInstructionsData(
          _data.data.getCaseSheet!.caseSheetDetails!.otherInstructions || []
        );
        setDiagnosticPrescription(
          _data.data.getCaseSheet!.caseSheetDetails!.diagnosticPrescription
        );
        setMedicinePrescriptionData(
          _data.data.getCaseSheet!.caseSheetDetails!.medicinePrescription
        );
        setSwitchValue(_data.data.getCaseSheet!.caseSheetDetails!.followUp!);
        if (_data.data.getCaseSheet!.caseSheetDetails!.followUpAfterInDays! == null) {
          setSliderValue(2);
        } else {
          setSliderValue(parseInt(_data.data.getCaseSheet!.caseSheetDetails!.followUpAfterInDays!));
        }

        setValue(_data.data.getCaseSheet!.caseSheetDetails!.notes!);
        if (_data.data.getCaseSheet!.caseSheetDetails!.followUpDate! == null) {
          setSelectDate('dd/mm/yyyy');
        } else {
          const val = moment(
            parseInt(_data.data.getCaseSheet!.caseSheetDetails!.followUpDate!)
          ).format('DD/MM/YYYY');
          setSelectDate(val);
        }

        setHealthWalletArrayData(_data.data.getCaseSheet!.patientDetails!.healthVault);
        setPastList(_data.data.getCaseSheet!.pastAppointments!);
        const consultType = _data.data.getCaseSheet!.caseSheetDetails!.consultType! || '';
        setConsultationType(consultType as typeof consultationType);
        setLoading(false);
        try {
          setSysmptonsList(
            (_data.data.getCaseSheet!.caseSheetDetails!.symptoms! ||
              []) as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[]
          );
          setDiagonsisList(
            (_data.data.getCaseSheet!.caseSheetDetails!.diagnosis! ||
              []) as GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[]
          );
          setDiagnosticPrescriptionDataList(
            (_data.data.getCaseSheet!.caseSheetDetails!.diagnosticPrescription! ||
              []) as GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[]
          );
          setMedicineList(
            (_data.data.getCaseSheet!.caseSheetDetails!.medicinePrescription! ||
              []) as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[]
          );
        } catch (error) {
          console.log({ error });
        }
      })
      .catch((e) => {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Doctor GetJuniorDoctorCaseSheet', error);
      });
  }, []);

  const startDate = moment(date).format('YYYY-MM-DD');

  useEffect(() => {
    setShowButtons(props.startConsult);
  }, []);

  const saveDetails = () => {
    setLoading(true);
    setShowButtons(true);
    console.log('symptonsData', JSON.stringify(JSON.stringify(getSysmptonsList())));
    console.log('junior notes', value);
    console.log('diagonisis', JSON.stringify(JSON.stringify(getDiagonsisList())));
    console.log('dia', JSON.stringify(JSON.stringify(getDiagnosticPrescriptionDataList())));
    console.log('med', JSON.stringify(JSON.stringify(getMedicineList())));
    console.log('get', getcasesheetId);
    console.log('other', JSON.stringify(JSON.stringify(otherInstructionsData)));
    console.log('switchValue', switchValue);

    let followUpAfterInDays = '';
    if (sliderValue == 2) {
      followUpAfterInDays = '2';
    } else if (sliderValue == 5) {
      followUpAfterInDays = '5';
    } else if (sliderValue == 8) {
      followUpAfterInDays = '7';
    } else {
      followUpAfterInDays = '12';
    }
    console.log('followUpAfterInDays', followUpAfterInDays);
    let followUpDateValue = '';
    if (selectDate == 'mm/dd/yyyy') {
      followUpDateValue = '';
    } else {
      followUpDateValue = moment(new Date(selectDate)).format('YYYY-MM-DD HH:mm:ss');
    }
    console.log('selectDate', selectDate.replace(/\//g, '-'));
    console.log('followUpDateValue2', selectDate.replace(/\//g, '-'));
    console.log(
      'followUpDate',
      moment(new Date(selectDate.replace(/\//g, '-'))).format('YYYY-MM-DD HH:mm:ss')
    );
    console.log('followUpDateValue', followUpDateValue);

    const input = {
      symptoms: JSON.stringify(getSysmptonsList()),
      notes: value,
      diagnosis: JSON.stringify(getDiagonsisList()), //'[{"name":"Dr. CTDO 12.5/20MG TABLET","__typename":"Diagnosis"}]',
      diagnosticPrescription: JSON.stringify(tests), //'[{"name":"Mayuri","__typename":"DiagnosticPrescription"}]',
      followUp: switchValue,
      followUpDate: followUpDateValue,
      followUpAfterInDays: followUpAfterInDays, //sliderValue.toString().concat('days'),
      otherInstructions: JSON.stringify(otherInstructionsData), //'[{"instruction":"Drink Plenty of Water"},{"instruction":"Use sunscreen every day"}]',
      medicinePrescription: JSON.stringify(getMedicineList()), //'[{"medicineName":"CTDO 6.25/40MG TABLET","medicineDosage":"2tablets","medicineToBeTaken":["BEFORE_FOOD"],"medicineInstructions":"Ccc","medicineTimings":["MORNING"],"medicineConsumptionDurationInDays":"Gg"}]',
      id: getcasesheetId,
      lifeStyle: lifeStyleData,
      familyHistory: familyValues,
      dietAllergies: medicalHistory ? medicalHistory.dietAllergies : '',
      drugAllergies: medicalHistory ? medicalHistory.drugAllergies : '',
      height: medicalHistory ? medicalHistory.height : '',
      menstrualHistory: medicalHistory ? medicalHistory.menstrualHistory : '',
      pastMedicalHistory: medicalHistory ? medicalHistory.pastMedicalHistory : '',
      pastSurgicalHistory: medicalHistory ? medicalHistory.pastSurgicalHistory : '',
      temperature: medicalHistory ? medicalHistory.temperature : '',
      weight: medicalHistory ? medicalHistory.weight : '',
      bp: medicalHistory ? medicalHistory.bp : '',
    };
    console.log('input', input);

    client
      .mutate<UpdateCaseSheet, UpdateCaseSheetVariables>({
        mutation: MODIFY_CASESHEET,
        variables: {
          UpdateCaseSheetInput: input,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setLoading(false);
        console.log('_data', _data);
        const result = _data.data!.updateCaseSheet;
        console.log('UpdateCaseSheetData', result);
        Alert.alert('UpdateCaseSheet', 'SuccessFully Updated');
      })
      .catch((e) => {
        setLoading(false);
        console.log('Error occured while update casesheet', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while adding Doctor', errorMessage, error);
        Alert.alert('Error', errorMessage);
      });
  };
  const endConsult = () => {
    setLoading(true);
    saveDetails();
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
        setLoading(false);
        setShowPopUp(true);
        console.log('_data', _data);

        //setShowButtons(false);
        // props.onStopConsult();
      })
      .catch((e) => {
        setLoading(false);
        setShowPopUp(false);
        console.log('Error occured while End casesheet', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while End casesheet', errorMessage, error);
        Alert.alert('Error', errorMessage);
      });
  };

  const [enableConsultButton, setEnableConsultButton] = useState(false);

  useEffect(() => {
    // Start timer if consult is about to start within next 10 minutes so that if the user
    // is in the same screen for next 10 minutes we can keep on checking and enable consult button, no need to refresh the page
    // StartConsult Button will be disabled for previous (completed) appointments.
    const _now = moment(new Date());
    const _consultStartTime = moment
      .utc(Appintmentdatetimeconsultpage)
      .clone()
      .local();
    const _consultEndTime = _consultStartTime.clone().add(15, 'minutes');
    const _consultSubtractTime = _consultStartTime.clone().subtract(15, 'minutes');

    const isConsultInBetween = _now.isBetween(_consultSubtractTime, _consultEndTime);
    const diffBwConsultStartAndNowInMins = moment
      .duration(moment(_consultSubtractTime).diff(_now))
      .asMinutes();
    const isAboutToStartWithinTenMinutes =
      diffBwConsultStartAndNowInMins > 0 && diffBwConsultStartAndNowInMins < 25;

    if (isConsultInBetween) {
      setEnableConsultButton(true);
    } else if (isAboutToStartWithinTenMinutes) {
      // Start timer here and clear when consult time starts
      console.log('timer started');
      const consultDisableInterval = setInterval(() => {
        if (moment(new Date()).isBetween(_consultStartTime, _consultEndTime)) {
          setEnableConsultButton(true);
          clearInterval(consultDisableInterval);
          console.log('timer cleared');
        }
      }, 1000);
    }
  }, []);

  const renderButtonsView = () => {
    //console.log({ Appintmentdatetimeconsultpage });
    return (
      <View style={{ backgroundColor: '#f0f4f5' }}>
        {showButtons == false ? (
          <View style={styles.footerButtonsContainersave}>
            <Button
              title="START CONSULT"
              disabled={!enableConsultButton}
              buttonIcon={<Start />}
              onPress={() => {
                setCaseSheetEdit(true);
                client
                  .mutate<CreateAppointmentSession, CreateAppointmentSessionVariables>({
                    mutation: CREATEAPPOINTMENTSESSION,
                    variables: {
                      createAppointmentSessionInput: {
                        appointmentId: AppId,
                        requestRole: REQUEST_ROLES.DOCTOR,
                      },
                    },
                  })
                  .then((_data: any) => {
                    console.log('creat', _data);
                    setGetCaseshhetId(_data.data.createAppointmentSession.caseSheetId);
                  })
                  .catch((e: any) => {
                    console.log('Error occured while create session', e);
                  });
                setShowButtons(true);
                props.onStartConsult();
              }}
              style={styles.buttonStyle}
            />
          </View>
        ) : (
          <View style={styles.footerButtonsContainer}>
            <Button
              onPress={() => saveDetails()}
              title="SAVE"
              titleTextStyle={styles.buttonTextStyle}
              variant="white"
              style={[styles.buttonsaveStyle, { marginRight: 16 }]}
            />
            <Button
              title="END CONSULT"
              buttonIcon={<End />}
              onPress={() => {
                endConsult();
              }}
              style={styles.buttonendStyle}
            />
          </View>
        )}
      </View>
    );
  };

  const renderSymptonsView = () => {
    return (
      <View>
        <CollapseCard heading="Chief Complaints" collapse={show} onPress={() => setShow(!show)}>
          {symptonsData == null || symptonsData.length == 0 ? (
            <Text style={[styles.symptomsText, { textAlign: 'center' }]}>No data</Text>
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
                            setSymptonsData([
                              ...symptonsData.filter((i) => i && i.symptom !== showdata.symptom),
                            ])
                          }
                          onPressEditIcon={() =>
                            props.overlayDisplay(
                              <AddSymptomPopUp
                                data={showdata}
                                onDone={(data) => {
                                  if (
                                    (symptonsData || []).findIndex(
                                      (i) => i && i.symptom === data.symptom
                                    ) < 0
                                  ) {
                                    setSymptonsData([
                                      ...(symptonsData || []).filter(
                                        (i) => i && i.symptom !== showdata.symptom
                                      ),
                                      data,
                                    ]);
                                  } else {
                                    Alert.alert('', 'Already Exists');
                                  }
                                }}
                                onClose={() => props.overlayDisplay(null)}
                              />
                            )
                          }
                          icon={<GreenRemove style={{ height: 20, width: 20 }} />}
                          days={showdata.since ? `Since : ${showdata.since}` : undefined}
                          howoften={
                            showdata.howOften ? `How Often : ${showdata.howOften}` : undefined
                          }
                          seviarity={
                            showdata.severity ? `Severity :${showdata.severity}` : undefined
                          }
                          editIcon={<Edit style={{ height: 20, width: 20 }} />}
                          details={showdata.details ? `Details :${showdata.details}` : undefined}
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
                          Alert.alert('', 'Already Exists');
                        }
                      }}
                      onClose={() => props.overlayDisplay(null)}
                    />
                  )
                }
              >
                <Text style={styles.addDoctorText}>ADD SYMPTOM</Text>
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
          heading="Vitals"
          collapse={vitalsShow}
          onPress={() => setVitalsShow(!vitalsShow)}
        >
          <View style={{ marginHorizontal: 16 }}>
            {renderFields('Height', (medicalHistory && medicalHistory.height) || '', (text) => {
              setMedicalHistory({
                ...medicalHistory,
                height: text,
              } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
            })}
            {renderFields(
              'Weight (kgs)',
              (medicalHistory && medicalHistory.weight) || '',
              (text) => {
                setMedicalHistory({
                  ...medicalHistory,
                  weight: text,
                } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
              }
            )}
            {renderFields('BP (mm Hg)', (medicalHistory && medicalHistory.bp) || '', (text) => {
              setMedicalHistory({
                ...medicalHistory,
                bp: text,
              } as GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory);
            })}
            {renderFields(
              'Temperature (°F)',
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

  const getFamilyHistory = () => {
    if (familyValues) {
      let familyHistory: string = '';
      familyValues.forEach((i) => {
        if (i) {
          familyHistory += i.relation
            ? i.relation + ': ' + i.description + '\n'
            : i.description + '\n';
        }
      });
      return familyHistory.slice(0, -1);
    } else {
      return '';
    }
  };

  const setFamilyHistory = (text: string) => {
    let eachMember = text.split('\n');
    let famHist: GetCaseSheet_getCaseSheet_patientDetails_familyHistory[] = [];
    eachMember.forEach((item) => {
      let history = item.split(':');
      if (history.length > 1) {
        famHist.push({
          relation: history[0].trim(),
          description: history[1].trim(),
        } as GetCaseSheet_getCaseSheet_patientDetails_familyHistory);
      } else {
        famHist.push({
          relation: null,
          description: history[0].trim(),
        } as GetCaseSheet_getCaseSheet_patientDetails_familyHistory);
      }
    });
    setFamilyValues(famHist);
  };

  const renderPatientHistoryLifestyle = () => {
    return (
      <View>
        <CollapseCard
          heading="Patient History & Lifestyle"
          collapse={patientHistoryshow}
          onPress={() => setpatientHistoryshow(!patientHistoryshow)}
        >
          <View style={{ marginHorizontal: 16 }}>
            {renderFields(
              'Medication History*',
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
              'Drug Allergies',
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
              'Diet Allergies/Restrictions',
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
              'Lifestyle and Habits',
              (lifeStyleData && lifeStyleData.map((i) => i && i.description).join(',')) || '',
              (text) => {
                setLifeStyleData([
                  { description: text } as GetCaseSheet_getCaseSheet_patientDetails_lifeStyle,
                ]);
              },
              true
            )}
            {renderFields(
              'Menstrual History',
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
              'Family Medical History',
              getFamilyHistory(),
              (text) => {
                setFamilyHistory(text);
              },
              true
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };
  const renderJuniorDoctorNotes = () => {
    if (Delegate) return null;
    return (
      <View>
        <CollapseCard
          heading="Junior Doctor’s Notes"
          collapse={juniorshow}
          onPress={() => setJuniorShow(!juniorshow)}
        >
          <View style={styles.symptomsInputView}>
            <TextInput
              style={[styles.symptomsText, { marginRight: 12 }]}
              multiline={true}
              onChangeText={(juniordoctornotes) => setJuniorDoctorNotes(juniordoctornotes)}
              editable={false}
            >
              {juniordoctornotes}
            </TextInput>
          </View>
        </CollapseCard>
      </View>
    );
  };
  const removeDiagnosticPresecription = (item: any, i) => {
    removeDiagnosticPrescriptionDataList(item);
    setDiagnosticPrescription(getDiagnosticPrescriptionDataList());
    // setDiagnosticPrescription(JSON.parse(JSON.stringify(diagnosticPrescriptionData)).slice(i, 1));
    setTests([...tests, { ...item, isSelected: true }]);
  };

  const renderDiagonisticPrescription = () => {
    return (
      <CollapseCard
        heading="Test Prescription"
        onPress={() => setshowdiagonisticPrescription(!showdiagonisticPrescription)}
      >
        <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 16 }}>
          <DiagnosicsCard
            diseaseName={item.itemname}
            icon={
              <TouchableOpacity
                onPress={() => {
                  // setTests(JSON.parse(JSON.stringify(tests)).slice(index, 1));
                  // setDiagnosticPrescription([
                  //   ...diagnosticPrescriptionData,
                  //   {
                  //     itemname: name,
                  //   },
                  // ] as any);
                  // addDiagnosticPrescriptionDataList({ itemname: name });
                  const testsData = JSON.parse(JSON.stringify(tests));
                  testsData[index] = {
                    ...testsData[index],
                    isSelected: testsData[index].isSelected ? false : true,
                  };
                  setTests(testsData);
                }}
              >
                {isDelegateLogin ? null : item.isSelected ? <Selected /> : <UnSelected />}
              </TouchableOpacity>
            }
          />
        </View>
        ); }) ) : (<Text style={[styles.symptomsText, { textAlign: 'center' }]}>No data</Text>
        )}
        {/* {diagnosticPrescriptionData == null ? (
          <Text style={[styles.symptomsText, { textAlign: 'center' }]}>No data</Text>
        ) : ( */}
        <Text style={[styles.familyText, { marginBottom: 12 }]}>Favorite Tests</Text>
        {favTests &&
          favTests.length &&
          favTests.map((showdata, i) => {
            if (showdata)
              return (
                <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 16 }}>
                  <DiagnosicsCard
                    diseaseName={showdata.itemname}
                    icon={
                      <TouchableOpacity
                        onPress={() => {
                          // removeDiagnosticPresecription(showdata, i);
                          setTests([...tests, { ...showdata, isSelected: true }]);
                        }}
                      >
                        {isDelegateLogin ? null : <Green />}
                      </TouchableOpacity>
                    }
                  />
                </View>
              );
          })}
        {caseSheetEdit && (
          <AddIconLabel
            label="ADD TESTS"
            onPress={
              () => setShowAddTestPopup(true) //props.navigation.push(AppRoutes.AddDiagnostics)
            }
            style={{ marginBottom: 19, marginLeft: 16, marginTop: 0 }}
          />
        )}
      </CollapseCard>
    );
  };

  const renderMedicineDetails = (item: any) => {
    const type = medUsageType(item.medicineUnit);
    const unit =
      item.medicineUnit === MEDICINE_UNIT.OTHERS ? 'other' : item.medicineUnit.toLowerCase();
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
          {type + ' '}
          {item.medicineDosage ? (type === 'Take' ? item.medicineDosage : '') + ' ' : ''}
          {item.medicineUnit ? (type === 'Take' ? unit + '(s) ' : unit + ' ') : ''}
          {item.medicineFrequency ? nameFormater(item.medicineFrequency).toLowerCase() + ' ' : ''}
          {item.medicineConsumptionDurationInDays
            ? 'for ' +
              item.medicineConsumptionDurationInDays +
              ' ' +
              item.medicineConsumptionDurationUnit.slice(0, -1).toLowerCase() +
              '(s) '
            : ''}
          {item.medicineToBeTaken.length
            ? item.medicineToBeTaken.map((i: any) => nameFormater(i).toLowerCase()).join(', ') + ' '
            : ''}
          {item.medicineTimings.length
            ? 'in the ' +
              (item.medicineTimings.length > 1
                ? item.medicineTimings
                    .slice(0, -1)
                    .map((i: any) => nameFormater(i).toLowerCase())
                    .join(', ') +
                  ' and ' +
                  nameFormater(
                    item.medicineTimings[item.medicineTimings.length - 1]
                  ).toLowerCase() +
                  ' '
                : item.medicineTimings.map((i: any) => nameFormater(i).toLowerCase()).join(', ') +
                  ' ')
            : ''}
          {'\n' + item.medicineInstructions}
        </Text>
      </Text>
    );
  };

  const renderMedicinePrescription = () => {
    return (
      <CollapseCard
        heading="Medicine Prescription"
        collapse={medicinePrescription}
        onPress={() => setMedicinePrescription(!medicinePrescription)}
      >
        <View style={{ marginHorizontal: 20, marginBottom: 19 }}>
          {renderHeaderText('Medicines')}
          {medicinePrescriptionData == null || medicinePrescriptionData.length == 0
            ? renderInfoText('No Medicine Added')
            : medicinePrescriptionData.map((showdata: any, i) => {
                const isSelected =
                  selectedMedicinesId.findIndex(
                    (i) => i === (showdata.externalId || showdata.id)
                  ) >= 0;
                return (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      props.overlayDisplay(
                        <AddMedicinePopUp
                          data={showdata}
                          onClose={() => props.overlayDisplay(null)}
                          onAddnew={(data) => {
                            console.log(medicinePrescriptionData, selectedMedicinesId);

                            setMedicinePrescriptionData([
                              ...(medicinePrescriptionData.filter(
                                (i: any) => (i.externalId || i.id) !== (data.externalId || data.id)
                              ) || []),
                              data as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                            ]);
                            setSelectedMedicinesId(
                              [
                                ...selectedMedicinesId.filter(
                                  (i) => i !== (data.externalId || data.id)
                                ),
                                data.externalId || '',
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
                          if (!isSelected) {
                            setSelectedMedicinesId([
                              ...selectedMedicinesId,
                              showdata.externalId || showdata.id,
                            ]);
                          } else {
                            setSelectedMedicinesId([
                              ...selectedMedicinesId.filter(
                                (i) => i != (showdata.externalId || showdata.id)
                              ),
                            ]);
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
              })}

          {favMed ? favMed.length > 0 && renderHeaderText('Favorite Medicines') : null}
          {favMed
            ? favMed.map(
                (
                  med: GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null
                ) => {
                  if (med) {
                    return (
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                          console.log(
                            selectedMedicinesId.findIndex((i) => i === med.externalId),
                            medicinePrescriptionData &&
                              medicinePrescriptionData.findIndex(
                                (i: any) => i.id === med.externalId
                              ),
                            'tnei'
                          );
                          const compareId = med.externalId || med.id;
                          if (selectedMedicinesId.findIndex((i) => i === compareId) < 0) {
                            if (
                              (medicinePrescriptionData &&
                                medicinePrescriptionData.findIndex(
                                  (i: any) => (i.externalId || i.id) === compareId
                                ) < 0) ||
                              medicinePrescriptionData === null ||
                              medicinePrescriptionData === undefined
                            ) {
                              setMedicinePrescriptionData([
                                ...(medicinePrescriptionData || []),
                                {
                                  id: med.id,
                                  externalId: med.externalId,
                                  medicineName: med.medicineName,
                                  medicineDosage: med.medicineDosage,
                                  medicineToBeTaken: med.medicineToBeTaken,
                                  medicineInstructions: med.medicineInstructions,
                                  medicineTimings: med.medicineTimings,
                                  medicineUnit: med.medicineUnit,
                                  medicineConsumptionDurationInDays:
                                    med.medicineConsumptionDurationInDays,
                                  medicineConsumptionDuration: med.medicineConsumptionDuration,
                                  medicineFrequency: med.medicineFrequency,
                                  medicineConsumptionDurationUnit:
                                    med.medicineConsumptionDurationUnit,
                                } as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                              ]);
                            }
                            setSelectedMedicinesId(
                              [...selectedMedicinesId, compareId || ''].filter((i) => i !== '')
                            );
                          }
                        }}
                      >
                        <View style={[styles.dataCardsStyle, { marginVertical: 4 }]}>
                          {renderMedicineDetails(med)}
                          <Green style={{ alignSelf: 'flex-start', height: 20, width: 20 }} />
                        </View>
                      </TouchableOpacity>
                    );
                  }
                }
              )
            : null}
          {caseSheetEdit && (
            <AddIconLabel
              label="ADD MEDICINE"
              onPress={() =>
                props.overlayDisplay(
                  <AddMedicinePopUp
                    onClose={() => props.overlayDisplay(null)}
                    onAddnew={(data) => {
                      if (
                        (medicinePrescriptionData &&
                          medicinePrescriptionData.findIndex(
                            (i: any) => (i.externalId || i.id) === data.externalId
                          ) < 0) ||
                        medicinePrescriptionData === null ||
                        medicinePrescriptionData === undefined
                      ) {
                        setMedicinePrescriptionData([
                          ...(medicinePrescriptionData || []),
                          data as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
                        ]);
                        setSelectedMedicinesId(
                          [...selectedMedicinesId, data.externalId || ''].filter((i) => i !== '')
                        );
                      } else {
                        Alert.alert('', 'Already Exists');
                      }
                    }}
                  />
                )
              }
              style={{ marginBottom: 19, marginTop: 12 }}
            />
          )}
        </View>
      </CollapseCard>
    );
  };

  const renderFollowUpView = () => {
    return (
      <View>
        <CollapseCard
          heading="Follow Up"
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
                (The first follow up for the patient will be free for upto 7 days)
              </Text>
            )}
            <View
              style={{
                marginBottom: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.medicineText}>Do you recommend a follow up?</Text>
              {!switchValue ? (
                <View>
                  <TouchableOpacity onPress={() => setSwitchValue(!switchValue)}>
                    <View>
                      <ToogleOff />
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TouchableOpacity onPress={() => setSwitchValue(!switchValue)}>
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
                  <Text style={[styles.medicineText, { marginBottom: 7 }]}>Follow Up After</Text>
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
                          setFollowupDays(parseInt(value) || '');
                        }}
                      />
                      <Text
                        style={{
                          ...theme.viewStyles.text('M', 14, '#02475b', 1, undefined, 0.02),
                          marginBottom: 7,
                          marginLeft: 8,
                        }}
                      >
                        Days
                      </Text>
                    </View>
                  </View>
                </View>
                <TextInput
                  placeholder={'Add instructions here..'}
                  style={styles.inputView}
                  multiline={true}
                  textAlignVertical={'top'}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  value={folloUpNotes}
                  onChangeText={(value) => setFolloUpNotes(value)}
                  autoCorrect={true}
                />
                <View style={{ marginBottom: 20, zIndex: -1 }}>
                  <Text
                    style={{
                      color: 'rgba(2, 71, 91, 0.6)',
                      ...theme.fonts.IBMPlexSansMedium(14),
                      marginBottom: 12,
                      marginTop: 18,
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
                </View>
                <View style={{ borderColor: '#00b38e', marginBottom: 12, zIndex: -1 }}>
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
                          setConsultationType('ONLINE');
                        }}
                        title="Online"
                        isChecked={consultationType == 'ONLINE'}
                        icon={consultationType == 'ONLINE' ? <PhysicalIcon /> : <GreenOnline />}
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
                          setConsultationType('PHYSICAL');
                        }}
                        title="In-person"
                        isChecked={consultationType == 'PHYSICAL'}
                        icon={consultationType == 'PHYSICAL' ? <InpersonIcon /> : <InpersonIcon />}
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
          heading="Diagnosis"
          collapse={diagnosisView}
          onPress={() => setDiagnosisView(!diagnosisView)}
        >
          <View style={{ marginHorizontal: 16, marginBottom: 19 }}>
            {renderHeaderText('Diagnosed Medical Condition')}
            <View
              style={{
                flexDirection: 'row',
                // justifyContent: 'space-between',
                marginBottom: 6,
                flexWrap: 'wrap',
              }}
            >
              {diagnosisData == null || diagnosisData.length == 0
                ? renderInfoText('No Data')
                : diagnosisData.map((showdata: any, i) => {
                    return (
                      <DiagnosisCard
                        diseaseName={showdata.name}
                        onPressIcon={() =>
                          setDiagnosisData(
                            diagnosisData.filter((i: any) => i.name != showdata.name)
                          )
                        }
                        icon={<DiagonisisRemove />}
                      />
                    );
                  })}
            </View>
            {caseSheetEdit && (
              <AddIconLabel
                label="ADD CONDITION"
                onPress={() => {
                  props.overlayDisplay(
                    <AddConditionPopUp
                      onClose={() => {
                        props.overlayDisplay(null);
                      }}
                      onDone={(val) => {
                        let newValues: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[] = [];
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
                style={{ marginBottom: 19, marginLeft: 16, marginTop: 0 }}
              />
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const removeInstrution = (item: string | null) => {
    console.log('item', item);
    const list = otherInstructionsData.filter(
      (other: GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions) =>
        other.instruction != item
    );
    setOtherInstructionsData(list);
  };
  const renderOtherInstructionsView = () => {
    return (
      <View style={{ zIndex: -1 }}>
        <CollapseCard
          heading="Other Instructions"
          collapse={otherInstructions}
          onPress={() => setOtherInstructions(!otherInstructions)}
        >
          <Text style={[styles.familyText, { marginBottom: 12 }]}>Instructions to the patient</Text>
          {otherInstructionsData == null ? (
            <Text style={[styles.symptomsText, { textAlign: 'center' }]}>No Data</Text>
          ) : (
            otherInstructionsData.map(
              (showdata: GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions, i: any) => {
                return (
                  <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                    <DiagnosicsCard
                      diseaseName={showdata.instruction}
                      icon={
                        <TouchableOpacity onPress={() => removeInstrution(showdata.instruction)}>
                          {isDelegateLogin ? null : <DiagonisisRemove />}
                        </TouchableOpacity>
                      }
                    />
                  </View>
                );
              }
            )
          )}
          {otherInstructionsadd ? (
            <View>
              <Text style={[styles.familyText, { marginBottom: 12 }]}>Add Instruction</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#30c1a3',
                  borderRadius: 10,
                  marginBottom: 16,
                  marginLeft: 20,
                  marginRight: 20,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    ...theme.fonts.IBMPlexSansMedium(14),
                    paddingLeft: 12,
                    marginTop: 12,
                    marginLeft: 0,
                    color: '#01475b',
                    marginBottom: 16,
                  }}
                  placeholder="Enter instruction here.."
                  underlineColorAndroid="transparent"
                  multiline={true}
                  placeholderTextColor="rgba(2, 71, 91, 0.4)"
                  value={othervalue}
                  maxLength={100}
                  onChangeText={(othervalue) => setOthervalue(othervalue)}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (othervalue == '' || othervalue.trim() == '') {
                      Alert.alert('Please add other instructions');
                    } else if (
                      otherInstructionsData.find((item: any) => item.instruction == othervalue)
                    ) {
                      Alert.alert('This instruction already added');
                    } else {
                      setOtherInstructionsData([
                        ...otherInstructionsData,
                        {
                          instruction: othervalue,
                        },
                      ]);

                      setOtherInstructionsAdd(!otherInstructionsadd);
                      setOthervalue('');
                      renderOtherInstructionsView();
                    }
                  }}
                >
                  <View style={{ alignItems: 'flex-end', margin: 8 }}>
                    <Green />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            caseSheetEdit && (
              <AddIconLabel
                label="ADD INSTRUCTIONS"
                onPress={() => setOtherInstructionsAdd(!otherInstructionsadd)}
                style={{ marginLeft: 16, marginTop: 0, marginBottom: 19 }}
              />
            )
          )}
        </CollapseCard>
      </View>
    );
  };
  const renderPastAppData = (apmnt: any) => {
    return (
      <View>
        {apmnt == [] ? (
          <Text style={styles.symptomsText}>No Data</Text>
        ) : (
          <View>
            <Text>{apmnt.status}</Text>
          </View>
        )}
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
  const renderPatientHealthWallet = () => {
    const patientImages =
      (healthWalletArrayData && healthWalletArrayData.filter((i) => i && i.imageUrls)) || [];
    const records =
      (healthWalletArrayData && healthWalletArrayData.filter((i) => i && i.reportUrls)) || [];
    return (
      <View>
        <CollapseCard
          heading="Patient Health Vault"
          collapse={patientHealthWallet}
          onPress={() => setPatientHealthWallet(!patientHealthWallet)}
        >
          <View style={{ marginHorizontal: 16 }}>
            {renderHeaderText('Photos uploaded by the Patient')}
            {patientImages.length > 0 ? <View></View> : renderInfoText('No Data')}
            {renderHeaderText('Reports')}
            {records.length > 0 ? <View></View> : renderInfoText('No Data')}
            {renderHeaderText('Past Consultations')}
            {/* {pastList &&
              pastList.map((apmnt: any, i) => {
                return <View style={{ marginBottom: 0 }}>{renderPastAppData(apmnt)}</View>;
              })} */}
            <PastConsultCard
              data={pastList}
              navigation={props.navigation}
              patientDetails={PatientInfoData}
            />
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
            How do you want to talk to the patient?
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
                <RoundCallIcon style={{ width: 24, height: 24 }} />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  AUDIO CALL
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
                <RoundVideoIcon style={{ width: 24, height: 24 }} />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  VIDEO CALL
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const selectedAdviceAction = (advice: dataPair, action: 'a' | 'd') => {
    if (action === 'a') {
      if (addedAdvices.findIndex((item) => item.key === advice.key) < 0) {
        setAddedAdvices([...addedAdvices, advice]);
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
          heading="Advice/Instructions"
          collapse={adviceInstructions}
          onPress={() => setAdviceInstructions(!adviceInstructions)}
        >
          <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
            {renderHeaderText('Instructions to the patient')}
            {addedAdvices.length > 0
              ? addedAdvices.map((item) => (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => selectedAdviceAction(item, 'd')}
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
              : renderInfoText('No Advice/Instructions selected')}
            {favAdvices.length && renderHeaderText('Favorite Diagnostics')}
            {favAdvices.map((item) => (
              <TouchableOpacity
                activeOpacity={1}
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
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <PlusOrange />
                  <Text style={{ ...theme.viewStyles.text('SB', 14, '#fc9916'), marginLeft: 4 }}>
                    ADD INSTRUCTIONS
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {caseSheetEdit && (
              <AddIconLabel
                label="ADD INSTRUCTIONS"
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
                style={{ marginTop: 10 }}
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
          const newData = tempTestArray.length
            ? tempTestArray.map((ele: any) => {
                return { itemname: ele.itemname, isSelected: true };
              })
            : [{ itemname: searchTestVal, isSelected: true }];

          setTests([...tests, ...newData]);
          setShowAddTestPopup(!ShowAddTestPopup);
        }}
      />
    );
  };

  return (
    <View style={styles.casesheetView}>
      <KeyboardAwareScrollView style={{ flex: 1 }} bounces={false}>
        <ScrollView bounces={false} style={{ zIndex: 1 }}>
          <View style={{ height: 20, backgroundColor: '#f0f4f5' }}></View>
          {renderPatientImage()}
          {renderBasicProfileDetails(PatientInfoData, AppId, Appintmentdatetimeconsultpage)}
          {renderSymptonsView()}
          {renderVitals()}
          {renderPatientHistoryLifestyle()}
          {renderPatientHealthWallet()}

          {isDelegateLogin ? null : renderJuniorDoctorNotes()}
          {renderDiagnosisView()}
          {renderMedicinePrescription()}
          {renderDiagonisticPrescription()}
          {/* {renderTestPrescription()} */}
          {renderAdviceInstruction()}
          {renderFollowUpView()}

          <View style={{ zIndex: -1 }}>
            {/* {renderOtherInstructionsView()} */}
            <View style={styles.underlineend} />

            <View style={styles.inputBorderView}>
              <View style={{ margin: 16 }}>
                <Text style={styles.notes}>Personal Notes</Text>
                <TextInput
                  placeholder={'What you enter here won’t be shown to the patient..'}
                  textAlignVertical={'top'}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  style={styles.inputView}
                  multiline={true}
                  value={value}
                  onChangeText={(value) => setValue(value)}
                  autoCorrect={true}
                />
              </View>
            </View>
            {loading ? <Loader flex1 /> : null}
            {/* {renderButtonsView()} */}
            {moment(Appintmentdatetimeconsultpage).format('YYYY-MM-DD') == startDate ||
            stastus == 'IN_PROGRESS'
              ? renderButtonsView()
              : null}
          </View>
          {showPopUp && CallPopUp()}
          {ShowAddTestPopup && renderAddTestPopup()}
        </ScrollView>
      </KeyboardAwareScrollView>
    </View>
  );
};
