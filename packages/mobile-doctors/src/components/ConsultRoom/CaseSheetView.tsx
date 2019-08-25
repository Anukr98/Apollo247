import { getSysmptonsList, setSysmptonsList } from '@aph/mobile-doctors/src/components/ApiCall';
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
} from 'react-native';
import { Slider, Overlay } from 'react-native-elements';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import {
  NavigationParams,
  NavigationRoute,
  NavigationScreenProp,
  NavigationScreenProps,
} from 'react-navigation';

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
    ...theme.fonts.IBMPlexSansMedium(16),
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
    marginLeft: 5,
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

  const [value, setValue] = useState<string>('');

  const [familyValues, setFamilyValues] = useState<string>(
    'Father: Cardiac patient\nMother: Severe diabetes\nMarried, No kids'
  );

  const [allergiesData, setAllergiesData] = useState<string>('Paracetamol, Dairy, Dust');
  const [lifeStyleData, setLifeStyleData] = useState<string>(
    'Patient doesn’t smoke\nRecovered from chickenpox 6 months\nago'
  );
  const [juniordoctornotes, setJuniorDoctorNotes] = useState<string>(
    'Fever, Cough and Cold, Nausea'
  );
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

  useEffect(() => {
    const didBlurSubscription = props.navigation.addListener('didFocus', (payload) => {
      console.debug('didFocus', payload);
      setSymptonsData(getSysmptonsList());
    });
    () => didBlurSubscription.remove();
  }, []);
  useEffect(() => {
    const data = [
      {
        id: '1',
        firstName: 'FEVER ',
        secondName: '2days ',
        thirdName: 'Night',
        fourthName: 'High',
      },
      {
        id: '2',
        firstName: 'COLD ',
        secondName: '2days ',
        thirdName: 'Night',
        fourthName: 'High',
      },
    ];
    setSymptonsData(data);
    setSysmptonsList(data);
  }, []);

  const startDate = moment(date).format('YYYY-MM-DD');
  console.log(
    'Appintmentdatetimeconsultpagecase',
    moment(Appintmentdatetimeconsultpage).format('YYYY-MM-DD')
  );
  console.log('startDatecase', startDate);
  const appointments = [
    {
      id: '1',
      firstName: 'Viral Fever',
    },
    {
      id: '2',
      firstName: 'Throat Infection',
    },
  ];

  const diagnosis = [
    {
      id: '1',
      firstName: 'Diagnostic ABC',
    },
    {
      id: '2',
      firstName: 'Diagnostic DEF',
    },
  ];

  const instructions = [
    {
      id: '1',
      firstName: 'Drink plenty of water',
    },
  ];

  const medicineList = [
    {
      id: '1',
      firstName: 'Acetaminophen 1.5% w/w ',
      secondName: '1 tab, Once a day (night) for 1 week',
      isActive: true,
    },
    {
      id: '2',
      firstName: 'Dextromethorphan (generic)',
      secondName: '4 times a day (morning, afternoon, evening, night) for 5 days after food',
      isActive: false,
    },
  ];
  const patientlist = [
    {
      id: '1',
      firstName: 'image001.jpg ',
      secondName: '5 MB  |  5 Aug 2019, 11.05 AM ',
    },
    {
      id: '2',
      firstName: 'image003.jpg ',
      secondName: '5 MB  |  5 Aug 2019, 11.05 AM ',
    },
  ];

  useEffect(() => {
    setShowButtons(props.startConsult);
  }, []);

  const renderButtonsView = () => {
    return (
      <View style={{ backgroundColor: '#f0f4f5' }}>
        {showButtons == false ? (
          <View style={styles.footerButtonsContainersave}>
            <Button
              title="START CONSULT"
              disabled={props.startConsult}
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
              onPress={() => setShowButtons(false)}
              title="SAVE"
              titleTextStyle={styles.buttonTextStyle}
              variant="white"
              style={[styles.buttonsaveStyle, { marginRight: 16 }]}
            />
            <Button
              title="END CONSULT"
              buttonIcon={<End />}
              onPress={() => {
                setShowButtons(false);
                props.onStopConsult();
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
          <TextInput
            style={styles.symptomsText}
            multiline={true}
            onChangeText={(familyValues) => setFamilyValues(familyValues)}
          >
            {familyValues}
          </TextInput>
        </View>
      </View>
    );
  };

  const renderAllergiesView = () => {
    return (
      <View>
        <Text style={styles.familyText}>Allergies</Text>
        <View style={styles.AllergiesInputView}>
          <TextInput
            style={styles.symptomsText}
            multiline={true}
            onChangeText={(allergiesData) => setAllergiesData(allergiesData)}
          >
            {allergiesData}
          </TextInput>
        </View>
      </View>
    );
  };
  const renderLifeStylesHabits = () => {
    return (
      <View>
        <Text style={styles.familyText}>Lifestyle & Habits</Text>
        <View style={styles.familyInputView}>
          <TextInput
            style={styles.symptomsText}
            multiline={true}
            onChangeText={(lifeStyleData) => setLifeStyleData(lifeStyleData)}
          >
            {lifeStyleData}
          </TextInput>
        </View>
      </View>
    );
  };
  const renderSymptonsView = () => {
    return (
      <View>
        <CollapseCard heading="Symptoms" collapse={show} onPress={() => setShow(!show)}>
          {symptonsData.map((showdata: any) => {
            return (
              <View>
                <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                  <SymptonsCard
                    diseaseName={showdata.firstName}
                    icon={<DiagonisisRemove />}
                    days={showdata.secondName}
                    howoften={showdata.thirdName}
                    seviarity={showdata.fourthName}
                  />
                </View>
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
            <AddPlus />
            <TouchableOpacity onPress={() => props.navigation.push(AppRoutes.AddSymptons)}>
              <Text style={styles.addDoctorText}>ADD SYMPTONS</Text>
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
              style={styles.symptomsText}
              multiline={true}
              onChangeText={(juniordoctornotes) => setJuniorDoctorNotes(juniordoctornotes)}
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
        heading="Diagonistic Prescription"
        collapse={diagonisticPrescription}
        onPress={() => setdiagonisticPrescription(!diagonisticPrescription)}
      >
        <Text style={[styles.familyText, { marginBottom: 12 }]}>Diagnostics</Text>
        {diagnosis.map((showdata, i) => {
          return (
            <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 16 }}>
              <DiagnosicsCard diseaseName={showdata.firstName} icon={<DiagonisisRemove />} />
            </View>
          );
        })}

        <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
          <AddPlus />
          <TouchableOpacity onPress={() => props.navigation.push(AppRoutes.AddDiagnostics)}>
            <Text style={styles.addDoctorText}>ADD DIAGNOSTICS</Text>
          </TouchableOpacity>
        </View>
      </CollapseCard>
    );
  };
  const renderMedicinePrescription = () => {
    return (
      <CollapseCard
        heading="Medicine Prescription"
        collapse={medicinePrescription}
        onPress={() => setMedicinePrescription(!medicinePrescription)}
      >
        <Text style={[styles.familyText, { marginBottom: 12 }]}>Medicines</Text>
        {medicineList.map((showdata, i) => {
          return (
            <View>
              <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                {showdata.isActive ? (
                  <MedicalCard
                    diseaseName={showdata.firstName}
                    icon={<DiagonisisRemove />}
                    tabDesc={showdata.secondName}
                    containerStyle={{
                      borderRadius: 5,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      borderColor: '#00b38e',
                    }}
                    onPress={() => {
                      props.navigation.push(AppRoutes.MedicineUpdate);
                    }}
                  />
                ) : (
                  <MedicalCard
                    diseaseName={showdata.firstName}
                    icon={<DiagonisisRemove />}
                    tabDesc={showdata.secondName}
                  />
                )}
              </View>
            </View>
          );
        })}
        <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
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
                      isChecked={true}
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

  const renderDiagnosisView = () => {
    return (
      <View>
        <CollapseCard
          heading="Diagnosis"
          collapse={diagnosisView}
          onPress={() => setDiagnosisView(!diagnosisView)}
        >
          <Text style={styles.familyText}>Diagnosed Medical Condition</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: 16,
              marginRight: 16,
              marginBottom: 19,
            }}
          >
            {appointments.map((showdata, i) => {
              return (
                <View>
                  <DiagnosisCard diseaseName={showdata.firstName} icon={<DiagonisisRemove />} />
                </View>
              );
            })}
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
  const renderOtherInstructionsView = () => {
    return (
      <View style={{ zIndex: -1 }}>
        <CollapseCard
          heading="Other Instructions"
          collapse={otherInstructions}
          onPress={() => setOtherInstructions(!otherInstructions)}
        >
          <Text style={[styles.familyText, { marginBottom: 12 }]}>Instructions to the patient</Text>
          {instructions.map((showdata, i) => {
            return (
              <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                <DiagnosicsCard diseaseName={showdata.firstName} icon={<DiagonisisRemove />} />
              </View>
            );
          })}
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
                />
                <View style={{ alignItems: 'flex-end', margin: 8 }}>
                  <AddPlus />
                </View>
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
          {patientlist.map((showdata, i) => {
            return (
              <View style={{ marginLeft: 16, marginRight: 20, marginBottom: 0 }}>
                <HealthCard
                  icon={
                    <View style={{ height: 90, width: 90 }}>
                      <SampleImage />
                    </View>
                  }
                  diseaseName={showdata.firstName}
                  description={showdata.secondName}
                />
              </View>
            );
          })}
          <Text style={[styles.familyText, { marginBottom: 12 }]}>Reports</Text>
          {patientlist.map((showdata, i) => {
            return (
              <View style={{ marginLeft: 16, marginRight: 20, marginBottom: 0 }}>
                <HealthCard
                  icon={
                    <View style={{ height: 90, width: 90 }}>
                      <SampleImage />
                    </View>
                  }
                  diseaseName={showdata.firstName}
                  description={showdata.secondName}
                />
              </View>
            );
          })}
          <Text style={[styles.familyText, { marginBottom: 12 }]}>Past Consultations</Text>
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
          {moment(Appintmentdatetimeconsultpage).format('YYYY-MM-DD') == startDate
            ? renderButtonsView()
            : null}
        </View>
      </ScrollView>
    </View>
  );
};
