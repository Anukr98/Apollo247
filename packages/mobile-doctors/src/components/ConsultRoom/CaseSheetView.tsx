import { Diagnosis } from '@aph/mobile-doctors/src/components/ConsultRoom/Diagnosis';
import { PatientHealthVault } from '@aph/mobile-doctors/src/components/ConsultRoom/PatientHealthVault';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { ChipViewCard } from '@aph/mobile-doctors/src/components/ui/ChipViewCard';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import {
  Down,
  Notification,
  PatientPlaceHolderImage,
  Up,
  Start,
  Add,
  DiagonisisRemove,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { ConsultRoomScreen } from '@aph/mobile-doctors/src/components/ConsultRoom/ConsultRoomScreen';
import moment from 'moment';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { Slider } from 'react-native-elements';
import { NavigationScreenProps, NavigationParams } from 'react-navigation';
import { NavigationScreenProp } from 'react-navigation';
import { NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';

import { DiagnosicsCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosticsCard';
import { SelectableButton } from '@aph/mobile-doctors/src/components/ui/SelectableButton';
import { Switch } from 'react-native-switch';
import { MedicalCard } from '@aph/mobile-doctors/src/components/ConsultRoom/MedicalCard';

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
        height: 2,
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
        height: 2,
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
    marginBottom: 7,
  },
  medicineTextInputView: {
    borderWidth: 1,
    borderColor: '#30c1a3',
    marginRight: 16,
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    paddingBottom: 4,
  },
  medicineunderline: {
    height: 2,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    opacity: 0.2,
    marginBottom: 13,
  },
  dosage: {
    color: 'rgba(2, 71, 91, 0.6)',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 10,
  },
  countText: { marginLeft: 10, ...theme.fonts.IBMPlexSansMedium(16), color: '#02475b' },
  timeofthedayText: {
    color: 'rgba(2, 71, 91, 0.6)',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 10,
  },
  foodmedicineview: {
    flexDirection: 'row',
    marginBottom: 24,
    flex: 1,
    marginRight: 16,
  },
  daysview: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginRight: 16,
    marginBottom: 16,
  },
  addDoctorText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0,
    color: '#fc9916',
    marginTop: 2,
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
  PatientInfoData: object,
  AppId: string,
  Appintmentdatetimeconsultpage: string
) => {
  // if (!firstName) return null;
  console.log('ranith', PatientInfoData);
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
  PatientInfoData: object,
  AppId: String,
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
  const [symptonsValue, setSymptonsValue] = useState<string>('Fever, Cough and Cold, Nausea');

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

  const [medinceName, setMedinceName] = useState<string>('Ibuprofen, 200mg');
  const [showButtons, setShowButtons] = useState(false);
  const [show, setShow] = useState(false);
  const [juniorshow, setJuniorShow] = useState(false);
  const [patientHistoryshow, setpatientHistoryshow] = useState(false);
  const [otherInstructions, setOtherInstructions] = useState(false);
  const [diagonisticPrescription, setdiagonisticPrescription] = useState(false);
  const [medicinePrescription, setMedicinePrescription] = useState(false);
  const [followup, setFollowUp] = useState(false);
  const [count, setCount] = useState(0);
  const [diagnosisvalues, setDiagnosisvalues] = useState<string>('');
  const [otherinstrutionsValue, setOtherinstrutionsValue] = useState<string>('');
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(2);
  const [stepValue, setStepValue] = useState(3);
  const [diagnosisView, setDiagnosisView] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
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

  const favdiagnosis = [
    {
      id: '1',
      firstName: 'Diagnostic XYZ',
    },
    {
      id: '2',
      firstName: 'Diagnostic TUV',
    },
  ];

  const instructions = [
    {
      id: '1',
      firstName: 'Drink plenty of water',
    },
  ];
  const instructionsfav = [
    {
      id: '1',
      firstName: 'Use sunscreen every day',
    },
    {
      id: '2',
      firstName: 'Avoid outside food for a few days',
    },
    {
      id: '3',
      firstName: 'Avoid stepping out with wet hair',
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
              buttonIcon={<Notification />}
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
          <View style={styles.symptomsInputView}>
            <TextInput
              style={styles.symptomsText}
              multiline={true}
              onChangeText={(symptonsValue) => setSymptonsValue(symptonsValue)}
            >
              {symptonsValue}
            </TextInput>
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
          console.log('showsara', showdata);
          return (
            <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 16 }}>
              <DiagnosicsCard diseaseName={showdata.firstName} icon={<DiagonisisRemove />} />
            </View>
          );
        })}
        <Text style={[styles.familyText, { marginBottom: 12 }]}>Favorite Diagnostics</Text>

        {favdiagnosis.map((showdata, i) => {
          console.log('showsara', showdata);
          return (
            <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 16 }}>
              <DiagnosicsCard diseaseName={showdata.firstName} icon={<DiagonisisRemove />} />
            </View>
          );
        })}
        <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
          <Add />
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
          console.log('showsara', showdata);
          return (
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
                />
              ) : (
                <MedicalCard
                  diseaseName={showdata.firstName}
                  icon={<DiagonisisRemove />}
                  tabDesc={showdata.secondName}
                />
              )}
            </View>
          );
        })}
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
          <View
            style={{
              marginLeft: 16,
              marginBottom: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.medicineText}>Do you recommend a follow up?</Text>
            <View style={{ marginRight: 20 }}>
              {/* <Switch onValueChange={() => setSwitchValue(!switchValue)} value={switchValue} /> */}
              <Switch
                value={switchValue}
                onValueChange={(switchValue) => setSwitchValue(switchValue)}
                // disabled={false}
                activeText={'On'}
                inActiveText={'Off'}
                circleSize={20}
                barHeight={18}
                circleBorderWidth={3}
                backgroundActive={'#00b38e'}
                backgroundInactive={'rgba(2, 71, 91, 0.2)'}
                circleActiveColor={'#ffffff'}
                circleInActiveColor={'#ffffff'}
                changeValueImmediately={true}
                //renderInsideCircle={() => <CustomComponent />} // custom component to render inside the Switch circle (Text, Image, etc.)
                //changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                innerCircleStyle={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: 'rgba(2, 71, 91, 0.2)',
                  shadowColor: '#000000',
                  borderWidth: 0.5,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowRadius: 10,
                  shadowOpacity: 0.2,
                  elevation: 5,
                }} // style for inner animated circle for what you (may) be rendering inside the circle
                outerCircleStyle={{}} // style for outer animated circle
                renderActiveText={false}
                renderInActiveText={false}
                switchLeftPx={2} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                switchRightPx={2} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                switchWidthMultiplier={2} // multipled by the `circleSize` prop to calculate total width of the Switch
              />
            </View>
          </View>
          {switchValue ? (
            <View>
              <View style={styles.medicineunderline}></View>
              <View style={{ marginLeft: 16, marginBottom: 20, marginRight: 25 }}>
                <Text style={styles.medicineText}>Follow Up After:</Text>
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
              <View style={styles.medicineunderline}></View>
              <View style={{ marginLeft: 16, marginBottom: 20 }}>
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
              console.log('showsara', showdata);
              return (
                <ChipViewCard
                  text={showdata.firstName}
                  selected={true}
                  icon={<DiagonisisRemove />}
                  textSelectedStyle={{ marginTop: 3, marginBottom: 2, marginLeft: 3 }}
                />
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
            <Add />
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
      <View>
        <CollapseCard
          heading="Other Instructions"
          collapse={otherInstructions}
          onPress={() => setOtherInstructions(!otherInstructions)}
        >
          <Text style={[styles.familyText, { marginBottom: 12 }]}>Instructions to the patient</Text>
          {instructions.map((showdata, i) => {
            console.log('showsara', showdata);
            return (
              <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                <DiagnosicsCard diseaseName={showdata.firstName} icon={<DiagonisisRemove />} />
              </View>
            );
          })}
          <Text style={[styles.familyText, { marginBottom: 12 }]}>Favorite Diagnostics</Text>

          {instructionsfav.map((showdata, i) => {
            console.log('showsara', showdata);
            return (
              <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 12 }}>
                <DiagnosicsCard diseaseName={showdata.firstName} icon={<DiagonisisRemove />} />
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', marginBottom: 19, marginLeft: 16 }}>
            <Add />
            <TouchableOpacity>
              <Text style={styles.addDoctorText}>ADD INSTRUCTIONS</Text>
            </TouchableOpacity>
          </View>
        </CollapseCard>
      </View>
    );
  };
  return (
    <View style={styles.casesheetView}>
      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        {renderPatientImage()}
        {renderBasicProfileDetails(PatientInfoData, AppId, Appintmentdatetimeconsultpage)}
        {renderSymptonsView()}
        {renderPatientHistoryLifestyle()}
        <PatientHealthVault />
        {renderJuniorDoctorNotes()}
        {renderDiagnosisView()}
        {renderMedicinePrescription()}
        {renderDiagonisticPrescription()}
        {renderFollowUpView()}
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
        {moment(Appintmentdatetimeconsultpage).format('YYYY-MM-DD') > startDate ||
        moment(Appintmentdatetimeconsultpage).format('YYYY-MM-DD') == startDate
          ? renderButtonsView()
          : null}
      </ScrollView>
    </View>
  );
};
