import {
  getSysmptonsList,
  setSysmptonsList,
  getDiagonsisList,
  setDiagonsisList,
  getDiagnosticPrescriptionDataList,
  setDiagnosticPrescriptionDataList,
  getMedicineList,
  setMedicineList,
  removeSysmptonsList,
  removeDiagnosticPrescriptionDataList,
  removeDiagonsisList,
} from '@aph/mobile-doctors/src/components/ApiCall';
import { DiagnosisCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosisCard';
import { DiagnosicsCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosticsCard';
import { HealthCard } from '@aph/mobile-doctors/src/components/ConsultRoom/HealthCard';
import { MedicalCard } from '@aph/mobile-doctors/src/components/ConsultRoom/MedicalCard';
import { SymptonsCard } from '@aph/mobile-doctors/src/components/ConsultRoom/SymptonsCard';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-doctors/src/components/ui/CalendarView';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import {
  AddPlus,
  CalendarIcon,
  DiagonisisRemove,
  End,
  PatientPlaceHolderImage,
  SampleImage,
  Start,
  ToogleOff,
  ToogleOn,
  UnSelected,
  Selected,
  GreenRemove,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { SelectableButton } from '@aph/mobile-doctors/src/components/ui/SelectableButton';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { PatientInfoData } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Slider } from 'react-native-elements';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import {
  NavigationParams,
  NavigationRoute,
  NavigationScreenProp,
  NavigationScreenProps,
} from 'react-navigation';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CREATEAPPOINTMENTSESSION,
  GET_CASESHEET,
  UPDATE_CASESHEET,
  END_APPOINTMENT_SESSION,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/CreateAppointmentSession';
import { REQUEST_ROLES, STATUS } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { GetCaseSheet } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';

import {
  UpdateCaseSheet,
  UpdateCaseSheetVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdateCaseSheet';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/EndAppointmentSession';

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
    marginBottom: 8,
  },
  agetext: {
    color: 'rgba(2, 71, 91, 0.8)',
    ...theme.fonts.IBMPlexSansMedium(16),
    marginLeft: 15,
    marginTop: 4,
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
    marginTop: 10,
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
    marginBottom: 8,
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
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30c1a3',
    marginTop: 10,
    color: '#01475b',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
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
    marginLeft: 20,
    marginTop: 16,
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

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.nameText}>{PatientInfoData.firstName}</Text>
        <View style={styles.line}></View>
        <Text style={styles.agetext}>{PatientInfoData.gender}</Text>
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
    <View style={{ flexDirection: 'row', marginLeft: 20 }}>
      <Text style={styles.appid}>{ApptId}</Text>
      <Text style={styles.appdate}>{appIdDate}</Text>
    </View>
  );
};
const registerDetailsAppDate = (ApptId: string, appIdDate: string) => {
  if (!appIdDate) return null;
  return (
    <View style={{ flexDirection: 'row', marginLeft: 20 }}>
      <Text style={styles.appid}>{ApptId}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.appdate}>{moment(appIdDate).format('DD/MM/YYYY')}</Text>
        <View
          style={{
            height: 14,
            borderWidth: 1,
            borderColor: 'rgba(2, 71, 91, 0.6)',
            marginTop: 4,
            marginLeft: 5,
            marginRight: 5,
          }}
        ></View>
        <Text style={styles.appdate}>{moment(appIdDate).format('HH:mm A')}</Text>
      </View>
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
    <View style={{ backgroundColor: '#f7f7f7' }}>
      {profileRow(PatientInfoData, AppId, Appintmentdatetimeconsultpage)}
    </View>
  );
};

export interface CaseSheetViewProps extends NavigationScreenProps {
  onStartConsult: () => void;
  onStopConsult: () => void;
  startConsult: boolean;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const CaseSheetView: React.FC<CaseSheetViewProps> = (props) => {
  const PatientInfoData = props.navigation.getParam('PatientInfoAll');
  const Appintmentdatetimeconsultpage = props.navigation.getParam('Appintmentdatetime');
  const AppId = props.navigation.getParam('AppId');
  const stastus = props.navigation.getParam('AppointmentStatus');

  const [value, setValue] = useState<string>('');
  const [othervalue, setOthervalue] = useState<string>('');
  const [familyValues, setFamilyValues] = useState<any>([]);

  const [allergiesData, setAllergiesData] = useState<string>('');
  const [lifeStyleData, setLifeStyleData] = useState<any>([]);
  const [juniordoctornotes, setJuniorDoctorNotes] = useState<string>('');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [showButtons, setShowButtons] = useState(false);
  const [show, setShow] = useState(false);
  const [juniorshow, setJuniorShow] = useState(false);
  const [patientHistoryshow, setpatientHistoryshow] = useState(false);
  const [otherInstructions, setOtherInstructions] = useState(false);
  const [patientHealthWallet, setPatientHealthWallet] = useState(false);
  const [diagonisticPrescription, setdiagonisticPrescription] = useState(false);
  const [medicinePrescription, setMedicinePrescription] = useState(false);
  const [followup, setFollowUp] = useState(false);
  const [otherInstructionsadd, setOtherInstructionsAdd] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(2);
  const [stepValue, setStepValue] = useState(3);
  const [diagnosisView, setDiagnosisView] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [selectDate, setSelectDate] = useState<string>('dd/mm/yyyy');
  const [calenderShow, setCalenderShow] = useState(false);
  const [type, setType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.MONTH);
  const [symptonsData, setSymptonsData] = useState<any>([]);
  const [diagnosisData, setDiagnosisData] = useState<any>([]);
  const [diagnosticPrescriptionData, setDiagnosticPrescription] = useState<any>([]);
  const [otherInstructionsData, setOtherInstructionsData] = useState<any>([]);
  const [medicinePrescriptionData, setMedicinePrescriptionData] = useState<any>([]);
  const [getcasesheetId, setGetCaseshhetId] = useState<string>('');

  const [pickData, setPickData] = useState<{ [id: string]: boolean }>({});
  const [healthWalletArrayData, setHealthWalletArrayData] = useState<any>([]);
  const [pastList, setPastList] = useState<any>([]);

  const [consultationType, setConsultationType] = useState({
    ONLINE: { title: 'Online', isSelected: false },
    PHYSICAL: { title: 'Physical', isSelected: false },
  });

  const [showstyles, setShowStyles] = useState<any>([
    {
      marginLeft: 16,
      marginRight: 20,
      ...theme.fonts.IBMPlexSansMedium(18),
      width: '90%',
      borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
      borderBottomWidth: 2,
      marginBottom: 32,
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const client = useApolloClient();

  useEffect(() => {
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
  }, []);

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
        // setGetSysmptonsListData(_data.data.getJuniorDoctorCaseSheet!.caseSheetDetails!.symptoms);
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

        setHealthWalletArrayData(_data.data.getCaseSheet!.patientDetails!.healthVault);
        setPastList(_data.data.getCaseSheet!.pastAppointments!);
        setLoading(false);
        setSysmptonsList(_data.data.getCaseSheet!.caseSheetDetails!.symptoms!);
        setDiagonsisList(_data.data.getCaseSheet!.caseSheetDetails!.diagnosis!);
        setDiagnosticPrescriptionDataList(
          _data.data.getCaseSheet!.caseSheetDetails!.diagnosticPrescription!
        );
        setMedicineList(_data.data.getCaseSheet!.caseSheetDetails!.medicinePrescription!);
        const def = _data.data.getCaseSheet!.caseSheetDetails!.consultType!;
        setConsultationType({
          ...consultationType,
          [def]: {
            isSelected: !!def,
            title: consultationType[def].title,
          },
        });
      })
      .catch((e) => {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Doctor GetJuniorDoctorCaseSheet', error);
      });
  }, []);

  useEffect(() => {
    const didBlurSubscription = props.navigation.addListener('didFocus', (payload) => {
      console.log('didFocus', payload);
      setSymptonsData(getSysmptonsList());
      setDiagnosisData(getDiagonsisList());
      setDiagnosticPrescription(getDiagnosticPrescriptionDataList());
      setMedicinePrescriptionData(getMedicineList());
    });
    () => didBlurSubscription.remove();
  }, []);

  const startDate = moment(date).format('YYYY-MM-DD');

  useEffect(() => {
    setShowButtons(props.startConsult);
  }, []);

  const saveDetails = () => {
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
      followUpAfterInDays = 'custom';
    }
    console.log('followUpAfterInDays', followUpAfterInDays);
    client
      .mutate<UpdateCaseSheet, UpdateCaseSheetVariables>({
        mutation: UPDATE_CASESHEET,
        variables: {
          UpdateCaseSheetInput: {
            symptoms: JSON.stringify(getSysmptonsList()),
            notes: value,
            diagnosis: JSON.stringify(getDiagonsisList()), //'[{"name":"Dr. CTDO 12.5/20MG TABLET","__typename":"Diagnosis"}]',
            diagnosticPrescription: JSON.stringify(getDiagnosticPrescriptionDataList()), //'[{"name":"Mayuri","__typename":"DiagnosticPrescription"}]',
            followUp: switchValue,
            followUpDate: null,
            followUpAfterInDays: followUpAfterInDays, //sliderValue.toString().concat('days'),
            otherInstructions: JSON.stringify(otherInstructionsData), //'[{"instruction":"Drink Plenty of Water"},{"instruction":"Use sunscreen every day"}]',
            medicinePrescription: JSON.stringify(getMedicineList()), //'[{"medicineName":"CTDO 6.25/40MG TABLET","medicineDosage":"2tablets","medicineToBeTaken":["BEFORE_FOOD"],"medicineInstructions":"Ccc","medicineTimings":["MORNING"],"medicineConsumptionDurationInDays":"Gg"}]',
            id: getcasesheetId,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        console.log('_data', _data);
        const result = _data.data!.updateCaseSheet;
        console.log('UpdateCaseSheetData', result);
        Alert.alert('UpdateCaseSheet', 'SuccessFully Updated');
      })
      .catch((e) => {
        console.log('Error occured while update casesheet', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while adding Doctor', errorMessage, error);
        Alert.alert('Error', errorMessage);
      });
  };
  const endConsult = () => {
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
        console.log('_data', _data);
        setShowButtons(false);
        props.onStopConsult();
      })
      .catch((e) => {
        console.log('Error occured while End casesheet', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while End casesheet', errorMessage, error);
        Alert.alert('Error', errorMessage);
      });
  };
  const renderButtonsView = () => {
    return (
      <View style={{ backgroundColor: '#f0f4f5' }}>
        {showButtons == false ? (
          <View style={styles.footerButtonsContainersave}>
            <Button
              title="START CONSULT"
              //disabled={props.startConsult}
              buttonIcon={<Start />}
              onPress={() => {
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

  const renderFamilyDetails = () => {
    return (
      <View>
        <Text style={styles.familyText}>Family History</Text>
        <View style={styles.familyInputView}>
          {/* <TextInput
            style={styles.symptomsText}
            multiline={true}
            onChangeText={(familyValues) => setFamilyValues(familyValues)}
          >
            {familyValues}
          </TextInput> */}
          {familyValues.length == 0 ? (
            <Text style={styles.symptomsText}>No Data</Text>
          ) : (
            familyValues.map((showdata: any) => {
              return (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.symptomsText}>{showdata.relation}: </Text>
                  <Text style={styles.symptomsText}>{showdata.description}</Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    );
  };

  const renderAllergiesView = () => {
    return (
      <View>
        <Text style={styles.familyText}>Allergies</Text>
        <View style={styles.AllergiesInputView}>
          {/* <TextInput
            style={styles.symptomsText}
            multiline={true}
            editable={false}
            onChangeText={(allergiesData) => setAllergiesData(allergiesData)}
          >
            {allergiesData}
          </TextInput> */}
          {allergiesData == null ? (
            <Text style={styles.symptomsText}>No Data</Text>
          ) : (
            <Text style={styles.symptomsText}>{allergiesData}</Text>
          )}
        </View>
      </View>
    );
  };
  const renderLifeStylesHabits = () => {
    return (
      <View>
        <Text style={styles.familyText}>Lifestyle & Habits</Text>
        <View style={styles.familyInputView}>
          {/* <TextInput
            style={styles.symptomsText}
            multiline={true}
            onChangeText={(lifeStyleData) => setLifeStyleData(lifeStyleData)}
          >
            {lifeStyleData}
          </TextInput> */}
          {lifeStyleData.length == 0 ? (
            <Text style={styles.symptomsText}>No Data</Text>
          ) : (
            lifeStyleData.map((showdata: any) => {
              return (
                <View>
                  <Text style={styles.symptomsText}>{showdata.description}</Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    );
  };
  const removeSymptonData = (item: any) => {
    removeSysmptonsList(item);
    setSymptonsData(getSysmptonsList());
  };
  const renderSymptonsView = () => {
    return (
      <View>
        <CollapseCard heading="Symptoms" collapse={show} onPress={() => setShow(!show)}>
          {symptonsData == null ? (
            <Text style={styles.symptomsText}>No data</Text>
          ) : (
            symptonsData.map((showdata: any) => {
              return (
                <View>
                  <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                    <SymptonsCard
                      diseaseName={showdata.symptom}
                      icon={
                        <TouchableOpacity onPress={() => removeSymptonData(showdata.symptom)}>
                          <GreenRemove />
                        </TouchableOpacity>
                      }
                      days={`Since : ${showdata.since}`}
                      howoften={`How Often : ${
                        showdata.howOften == null ? 'N/A' : showdata.howOften
                      }`}
                      seviarity={`Severity : ${showdata.severity}`}
                    />
                  </View>
                </View>
              );
            })
          )}
          <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
            <AddPlus />
            <TouchableOpacity onPress={() => props.navigation.push(AppRoutes.AddSymptons)}>
              <Text style={styles.addDoctorText}>ADD SYMPTON</Text>
            </TouchableOpacity>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderPatientHistoryLifestyle = () => {
    return (
      <View>
        <CollapseCard
          heading="Patient History & Lifestyle"
          collapse={patientHistoryshow}
          onPress={() => setpatientHistoryshow(!patientHistoryshow)}
        >
          {renderFamilyDetails()}
          {renderAllergiesView()}
          {renderLifeStylesHabits()}
        </CollapseCard>
      </View>
    );
  };
  const renderJuniorDoctorNotes = () => {
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
  const removeDiagnosticPresecription = (item: any) => {
    console.log(item, 'item');
    removeDiagnosticPrescriptionDataList(item);
    setDiagnosticPrescription(getDiagnosticPrescriptionDataList());
  };
  const renderDiagonisticPrescription = () => {
    return (
      <CollapseCard
        heading="Diagonistic Prescription"
        collapse={diagonisticPrescription}
        onPress={() => setdiagonisticPrescription(!diagonisticPrescription)}
      >
        <Text style={[styles.familyText, { marginBottom: 12 }]}>Diagnostics</Text>
        {diagnosticPrescriptionData == null ? (
          <Text>Nodata</Text>
        ) : (
          diagnosticPrescriptionData.map((showdata: any) => {
            return (
              <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 16 }}>
                <DiagnosicsCard
                  diseaseName={showdata.name}
                  icon={
                    <TouchableOpacity onPress={() => removeDiagnosticPresecription(showdata.name)}>
                      <DiagonisisRemove />
                    </TouchableOpacity>
                  }
                />
              </View>
            );
          })
        )}
        <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
          <AddPlus />
          <TouchableOpacity onPress={() => props.navigation.push(AppRoutes.AddDiagnostics)}>
            <Text style={styles.addDoctorText}>ADD DIAGNOSTICS</Text>
          </TouchableOpacity>
        </View>
      </CollapseCard>
    );
  };
  const passData = (
    id: any,
    name: string,
    dosage: string,
    medicineToBeTaken: any,
    medicineInstructions: string,
    medicineTimings: any,
    medicineConsumptionDurationInDays: string
  ) => {
    console.log('pasdat', name);
    setPickData({ ...pickData!, [id]: !pickData[id] });
    props.navigation.push(AppRoutes.MedicineUpdate, {
      Name: name,
      Dosage: dosage,
      MedicineToBeTaken: medicineToBeTaken,
      MedicineInstructions: medicineInstructions,
      MedicineTimings: medicineTimings,
      MedicineConsumptionDurationInDays: medicineConsumptionDurationInDays,
    });
  };
  const renderMedicinePrescription = () => {
    return (
      <CollapseCard
        heading="Medicine Prescription"
        collapse={medicinePrescription}
        onPress={() => setMedicinePrescription(!medicinePrescription)}
      >
        <Text style={[styles.familyText, { marginBottom: 12 }]}>Medicines</Text>
        {medicinePrescriptionData == null || medicinePrescriptionData.length == 0 ? (
          <Text style={styles.symptomsText}>No Data</Text>
        ) : (
          medicinePrescriptionData.map((showdata: any, i) => {
            return (
              <View>
                <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                  <MedicalCard
                    diseaseName={showdata.medicineName}
                    icon={
                      <TouchableOpacity
                        onPress={() =>
                          passData(
                            showdata.id,
                            showdata.medicineName,
                            showdata.medicineDosage,
                            showdata.medicineToBeTaken,
                            showdata.medicineInstructions,
                            showdata.medicineTimings,
                            showdata.medicineConsumptionDurationInDays
                          )
                        }
                      >
                        <View>{!pickData[showdata.id] ? <Selected /> : <Selected />}</View>
                      </TouchableOpacity>
                    }
                    tabDesc={showdata.medicineInstructions}
                    containerStyle={{
                      borderRadius: 5,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      borderColor: '#00b38e',
                    }}
                  />
                </View>
              </View>
            );
          })
        )}
        <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 20 }}>
          <AddPlus />
          <TouchableOpacity onPress={() => props.navigation.push(AppRoutes.AddMedicine)}>
            <Text style={styles.addDoctorText}>ADD MEDICINE</Text>
          </TouchableOpacity>
        </View>
      </CollapseCard>
    );
  };
  const renderCalenderView = () => {
    return (
      <View style={styles.calenderView}>
        <CalendarView
          date={date}
          onPressDate={(date) => {
            console.log('android cale', moment(date).format('DD/MM/YYYY'), 'DD/MM/YYYY');
            setSelectDate(moment(date).format('DD/MM/YYYY'));
            setCalenderShow(!calenderShow);
            setShowStyles({
              marginLeft: 16,
              marginRight: 20,
              ...theme.fonts.IBMPlexSansMedium(18),
              width: '90%',
              borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
              borderBottomWidth: 2,
              marginBottom: 32,
            });
          }}
          calendarType={type}
          onCalendarTypeChanged={(type) => {
            setType(type);
          }}
          minDate={new Date()}
        />
      </View>
    );
  };
  const showCalender = () => {
    setCalenderShow(!calenderShow);
    setShowStyles({
      marginLeft: 16,
      marginRight: 20,
      ...theme.fonts.IBMPlexSansMedium(18),
      width: '90%',
      borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
      borderBottomWidth: 2,
      marginBottom: 0,
    });
  };
  const renderFollowUpView = () => {
    return (
      <View>
        <CollapseCard
          heading="Follow Up"
          collapse={followup}
          onPress={() => setFollowUp(!followup)}
        >
          <View
            style={{
              marginLeft: 16,
              marginBottom: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.medicineText}>Do you recommend a follow up?</Text>
            {!switchValue ? (
              <View style={{ marginRight: 20 }}>
                <TouchableOpacity onPress={() => setSwitchValue(!switchValue)}>
                  <View>
                    <ToogleOff />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginRight: 20 }}>
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
              <View style={{ marginLeft: 16, marginBottom: 20, marginRight: 25 }}>
                <Text style={[styles.medicineText, { marginBottom: 7 }]}>Follow Up After:</Text>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Slider
                    value={sliderValue}
                    step={stepValue}
                    onValueChange={(sliderValue) => setSliderValue(sliderValue)}
                    minimumValue={2}
                    maximumValue={12}
                    thumbTouchSize={{ width: 20, height: 20 }}
                  />

                  <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
                    <Text style={sliderValue == 2 ? styles.normalSliderText : styles.sliderText}>
                      2{'\n'}days
                    </Text>

                    <Text style={sliderValue == 5 ? styles.normalSliderText : styles.sliderText}>
                      5{'\n'}days
                    </Text>
                    <Text style={sliderValue == 8 ? styles.normalSliderText : styles.sliderText}>
                      7{'\n'}days
                    </Text>
                    <Text
                      style={
                        sliderValue == 11 || sliderValue == 12
                          ? styles.normalSliderText
                          : styles.sliderText
                      }
                    >
                      custom
                    </Text>
                  </View>
                </View>
              </View>
              {sliderValue > 10 ? (
                <View>
                  <View style={showstyles}>
                    <Text
                      style={{
                        color: 'rgba(2, 71, 91, 0.6)',
                        ...theme.fonts.IBMPlexSansMedium(14),
                        marginBottom: 12,
                      }}
                    >
                      Follow Up on
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {selectDate == 'dd/mm/yyyy' ? (
                        <Text
                          style={{
                            color: 'rgba(2, 71, 91, 0.6)',
                            ...theme.fonts.IBMPlexSansMedium(18),
                          }}
                        >
                          {selectDate}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            color: '#01475b',
                            ...theme.fonts.IBMPlexSansMedium(18),
                          }}
                        >
                          {selectDate}
                        </Text>
                      )}
                      <TouchableOpacity onPress={() => showCalender()}>
                        <View style={{ marginTop: 4 }}>
                          <CalendarIcon />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ elevation: 1000 }}>
                    {calenderShow ? (
                      <View
                        style={{
                          borderRadius: 10,
                          shadowColor: '#000000',
                          shadowOffset: {
                            width: 0,
                            height: 5,
                          },
                          shadowRadius: 10,
                          shadowOpacity: 0.2,
                          elevation: 10000,
                          zIndex: 100,
                        }}
                      >
                        {renderCalenderView()}
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
              <View style={{ marginLeft: 16, marginBottom: 20, zIndex: -1 }}>
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
                      containerStyle={{ marginRight: 20 }}
                      onChange={(isChecked) => {
                        // if (!isChecked && !consultationType.online) {
                        //   return;
                        // } else {
                        //   setConsultationType({ ...consultationType, physical: isChecked });
                        // }
                      }}
                      title="Online"
                      isChecked={consultationType.online}
                      icon={<DiagonisisRemove />}
                    />
                  </View>
                  <View>
                    <SelectableButton
                      containerStyle={{ marginRight: 20, borderColor: '#00b38e', borderWidth: 1 }}
                      onChange={(isChecked) => {
                        // if (!isChecked && !consultationType.online) {
                        //   return;
                        // } else {
                        //   setConsultationType({ ...consultationType, physical: isChecked });
                        // }
                      }}
                      title="In-person"
                      isChecked={false}
                      icon={<DiagonisisRemove />}
                    />
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </CollapseCard>
      </View>
    );
  };
  const removeDiagonsisValue = (item) => {
    console.log(item, 'item');
    removeDiagonsisList(item);
    setDiagnosisData(getDiagonsisList());
  };
  const renderDiagnosisView = () => {
    return (
      <View>
        <CollapseCard
          heading="Diagnosis"
          collapse={diagnosisView}
          onPress={() => setDiagnosisView(!diagnosisView)}
        >
          <Text style={[styles.familyText, { marginBottom: 0 }]}>Diagnosed Medical Condition</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: 16,
              marginRight: 16,
              marginBottom: 19,
              flexWrap: 'wrap',
            }}
          >
            {diagnosisData == null ? (
              <Text style={styles.symptomsText}>NO Data</Text>
            ) : (
              diagnosisData.map((showdata: any, i) => {
                return (
                  <DiagnosisCard
                    diseaseName={showdata.name}
                    icon={
                      <TouchableOpacity onPress={() => removeDiagonsisValue(showdata.name)}>
                        <DiagonisisRemove />
                      </TouchableOpacity>
                    }
                  />
                );
              })
            )}
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
            <AddPlus />
            <TouchableOpacity onPress={() => props.navigation.push(AppRoutes.AddCondition)}>
              <Text style={styles.addDoctorText}>ADD CONDITION</Text>
            </TouchableOpacity>
          </View>
        </CollapseCard>
      </View>
    );
  };
  const removeInstrution = (item) => {
    console.log('item', item);
    const list = otherInstructionsData.filter((other) => other.instruction != item);
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
            <Text style={styles.symptomsText}>No Data</Text>
          ) : (
            otherInstructionsData.map((showdata: any, i) => {
              return (
                <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                  <DiagnosicsCard
                    diseaseName={showdata.instruction}
                    icon={
                      <TouchableOpacity onPress={() => removeInstrution(showdata.instruction)}>
                        <DiagonisisRemove />
                      </TouchableOpacity>
                    }
                  />
                </View>
              );
            })
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
                  onChangeText={(othervalue) => setOthervalue(othervalue)}
                />
                <TouchableOpacity
                  onPress={() => {
                    setOtherInstructionsData([
                      ...otherInstructionsData,
                      {
                        instruction: othervalue,
                      },
                    ]);
                    setOtherInstructionsAdd(!otherInstructionsadd);
                    renderOtherInstructionsView();
                  }}
                >
                  <View style={{ alignItems: 'flex-end', margin: 8 }}>
                    <AddPlus />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
              <AddPlus />
              <TouchableOpacity onPress={() => setOtherInstructionsAdd(!otherInstructionsadd)}>
                <Text style={styles.addDoctorText}>ADD INSTRUCTIONS</Text>
              </TouchableOpacity>
            </View>
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
          apmnt.caseSheet.map((_caseSheet: any, i) => {
            return (
              <View style={{ marginLeft: 16 }}>
                {_caseSheet.symptoms == null ? (
                  <Text style={styles.symptomsText}>No Data</Text>
                ) : (
                  _caseSheet.symptoms.map((symptoms: any, i) => {
                    return (
                      <View
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 5,
                          borderStyle: 'solid',
                          borderWidth: 1,
                          borderColor: 'rgba(2, 71, 91, 0.15)',
                          marginBottom: 16,
                        }}
                      >
                        <View style={{ backgroundColor: 'white', flexDirection: 'row' }}>
                          <Text
                            style={{
                              color: '#0087ba',
                              ...theme.fonts.IBMPlexSansMedium(14),
                              marginLeft: 14,
                              marginBottom: 8,
                              marginTop: 12,
                              marginRight: 14,
                            }}
                          >
                            {symptoms.symptom}
                            {symptoms.howOften} {symptoms.since} {symptoms.severity}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: 'IBMPlexSans',
                              fontSize: 10,
                              fontWeight: '500',
                              fontStyle: 'normal',
                              lineHeight: 12,
                              letterSpacing: 0,
                              color: 'rgba(2, 71, 91, 0.6)',
                              marginLeft: 14,
                              marginBottom: 8,
                            }}
                          >
                            {moment
                              .unix(apmnt.appointmentDateTime / 1000)
                              .format('DD MMM  hh:mm a')}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })
        )}
      </View>
    );
  };
  const renderPatientHealthWallet = () => {
    return (
      <View>
        <CollapseCard
          heading="Patient Health Vault"
          collapse={patientHealthWallet}
          onPress={() => setPatientHealthWallet(!patientHealthWallet)}
        >
          <Text style={[styles.familyText, { marginBottom: 12 }]}>
            Photos uploaded by the Patient
          </Text>
          {healthWalletArrayData.length == 0 ? (
            <Text style={styles.symptomsText}>No Data</Text>
          ) : (
            healthWalletArrayData.map((showdata: any, i) => {
              return (
                <View style={{ marginLeft: 16, marginRight: 20, marginBottom: 0 }}>
                  {/* <HealthCard icon={showdata.imageUrls} /> */}
                  <Image style={{ width: 90, height: 90 }} source={{ uri: showdata.imageUrls }} />
                </View>
              );
            })
          )}

          <Text style={[styles.familyText, { marginBottom: 12, marginTop: 16 }]}>
            Past Consultations
          </Text>

          {pastList.map((apmnt: any, i) => {
            return (
              <View style={{ marginLeft: 16, marginRight: 20, marginBottom: 0 }}>
                {renderPastAppData(apmnt)}
              </View>
            );
          })}
        </CollapseCard>
      </View>
    );
  };
  return (
    <View style={styles.casesheetView}>
      <ScrollView bounces={false} style={{ zIndex: 1 }}>
        {renderPatientImage()}
        {renderBasicProfileDetails(PatientInfoData, AppId, Appintmentdatetimeconsultpage)}
        {renderSymptonsView()}
        {renderPatientHistoryLifestyle()}
        {renderPatientHealthWallet()}
        {renderJuniorDoctorNotes()}
        {renderDiagnosisView()}
        {renderMedicinePrescription()}
        {renderDiagonisticPrescription()}
        {renderFollowUpView()}

        <View style={{ zIndex: -1 }}>
          {renderOtherInstructionsView()}
          <View style={styles.underlineend} />
          <View style={styles.inputBorderView}>
            <Text style={styles.notes}>Personal Notes</Text>
            <TextInputComponent
              placeholder={string.LocalStrings.placeholder_message}
              inputStyle={styles.inputView}
              multiline={true}
              value={value}
              onChangeText={(value) => setValue(value)}
              autoCorrect={true}
            />
          </View>
          {/* {renderButtonsView()} */}
          {moment(Appintmentdatetimeconsultpage).format('YYYY-MM-DD') == startDate ||
          stastus == 'IN_PROGRESS'
            ? renderButtonsView()
            : null}
        </View>
      </ScrollView>
    </View>
  );
};
