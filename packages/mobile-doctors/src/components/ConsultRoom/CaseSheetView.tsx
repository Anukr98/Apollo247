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
  PlaceHolderDoctor,
  PlaceHolderDoctors,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { ConsultRoomScreen } from '@aph/mobile-doctors/src/components/ConsultRoom/ConsultRoomScreen';
import moment from 'moment';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { Slider } from 'react-native-elements';
import { NavigationScreenProps, NavigationParams } from 'react-navigation';
import { NavigationScreenProp } from 'react-navigation';
import { NavigationRoute } from 'react-navigation';

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
    borderWidth: 1,
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
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.6)',
    marginLeft: 15,
    marginTop: 4,
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
    borderWidth: 1,
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
  },
  inputBorderView: {
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    padding: 20,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 30,
  },
  notes: {
    ...theme.fonts.IBMPlexSansMedium(17),
    color: '#0087ba',
  },
  symptomsInputView: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30c1a3',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: 'rgba(216, 216, 216, 0.08)',
  },
  symptomsText: {
    marginTop: 12,
    marginLeft: 12,
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 16,
  },

  familyText: {
    marginTop: 12,
    marginLeft: 16,
    color: '#232643',
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.03,
    marginBottom: 12,
  },
  familyInputView: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30c1a3',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: 'rgba(216, 216, 216, 0.08)',
  },
  medicalView: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30c1a3',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: 'rgba(216, 216, 216, 0.08)',
  },
  AllergiesInputView: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30c1a3',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: 'rgba(216, 216, 216, 0.08)',
  },
  otherInstructionsInput: {
    borderRadius: 36,
    borderWidth: 1,
    marginTop: 10,
    backgroundColor: '#f7f7f7',
    borderColor: 'rgba(247, 247, 247, 0.2)',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
  },

  showunselectedview: {
    borderColor: '#00b38e',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 20,
  },
  showunselectedtext: {
    marginTop: 3,
    marginBottom: 2,
    marginLeft: 3,
  },
  otherMainView: {
    height: 2,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    opacity: 0.2,
    marginBottom: 23,
  },
  favView: {
    marginTop: 0,
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    flex: 1,
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
    ...theme.fonts.IBMPlexSansMedium(16),
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
        <Text style={styles.uhidText}>UHID :{PatientInfoData.uhid} </Text>
      ) : null}

      <View style={styles.understatusline} />
      <View>
        {registerDetails('Appt ID:', AppId)}
        {registerDetails(
          'Appt Date:',
          moment(Appintmentdatetimeconsultpage).format('DD/MM/YYYY | HH:mm A')
        )}
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

const renderPhotosUploadedPatient = () => {
  return (
    <View>
      <Text style={styles.familyText}>Photos uploaded by the Patient</Text>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 10,
          backgroundColor: '#d8d8d8',
          marginLeft: 16,
          marginBottom: 16,
        }}
      ></View>
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
  console.log('Appintmentdatetimeconsultpagecase', Appintmentdatetimeconsultpage);
  const [value, setValue] = useState<string>('');
  const [symptonsValue, setSymptonsValue] = useState<string>('Fever, Cough and Cold, Nausea');
  const [familyValues, setFamilyValues] = useState<string>(
    'Father: Cardiac patient\nMother: Severe diabetes\nMarried, No kids'
  );
  const [medicalRecordValues, setMedicalRecordValues] = useState<string>(
    'New Patient No\nPrescriptions uploaded'
  );
  const [allergiesData, setAllergiesData] = useState<string>('Paracetamol, Dairy, Dust');
  const [lifeStyleData, setLifeStyleData] = useState<string>(
    'Patient doesn’t smoke\nRecovered from chickenpox 6 months\nago'
  );
  const [medinceName, setMedinceName] = useState<string>('Ibuprofen, 200mg');
  const [showButtons, setShowButtons] = useState(false);
  const [show, setShow] = useState(false);
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
  const renderMedicalRecordsDetails = () => {
    return (
      <View>
        <Text style={styles.familyText}>Medical Records</Text>
        <View style={styles.medicalView}>
          <TextInput
            style={styles.symptomsText}
            multiline={true}
            onChangeText={(medicalRecordValues) => setMedicalRecordValues(medicalRecordValues)}
          >
            {medicalRecordValues}
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
          {renderMedicalRecordsDetails()}
          {renderAllergiesView()}
          {renderLifeStylesHabits()}
          {renderPhotosUploadedPatient()}
        </CollapseCard>
      </View>
    );
  };

  const renderOtherInstructionsView = () => {
    return (
      <View>
        <CollapseCard
          heading="OtherInstructions"
          collapse={otherInstructions}
          onPress={() => setOtherInstructions(!otherInstructions)}
        >
          <View style={styles.otherMainView}></View>
          <View style={{ marginLeft: 16, marginBottom: 30 }}>
            <Text style={{ color: 'rgba(2, 71, 91, 0.6)', ...theme.fonts.IBMPlexSansMedium(12) }}>
              {' '}
              Already added:
            </Text>
            <View style={{ marginTop: 7, flexDirection: 'row' }}>
              <ChipViewCard
                text="Wear Sunglasses"
                selected={true}
                icon={<Up />}
                textSelectedStyle={{ marginTop: 3, marginBottom: 2, marginLeft: 3 }}
              />
            </View>
          </View>
          <View style={{ marginLeft: 16, marginBottom: 30, marginRight: 20 }}>
            <Text style={{ color: 'rgba(2, 71, 91, 0.6)', ...theme.fonts.IBMPlexSansMedium(12) }}>
              Special Instructions (If any):
            </Text>
            <TextInputComponent
              placeholder="Start Typing"
              multiline={true}
              value={otherinstrutionsValue}
              onChangeText={(otherinstrutionsValue) =>
                setOtherinstrutionsValue(otherinstrutionsValue)
              }
              autoCorrect={true}
              conatinerstyles={[styles.otherInstructionsInput]}
            />
          </View>
          <View style={{ marginLeft: 16, marginBottom: 30 }}>
            <Text style={{ color: 'rgba(2, 71, 91, 0.6)', ...theme.fonts.IBMPlexSansMedium(12) }}>
              {' '}
              Favorites:
            </Text>
            <View style={styles.favView}>
              <ChipViewCard
                text="Exercise Regularly"
                selected={false}
                icon={<Up />}
                containerUnSelectedStyle={styles.showunselectedview}
                textUnSelectedStyle={styles.showunselectedtext}
              />

              <View style={{ flex: 2, padding: 4 }}>
                <ChipViewCard
                  text="Avoid Oils"
                  selected={false}
                  icon={<Up />}
                  containerUnSelectedStyle={styles.showunselectedview}
                  textUnSelectedStyle={styles.showunselectedtext}
                />
              </View>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };
  const renderDiagonisticPrescription = () => {
    return (
      <CollapseCard
        heading="DiagonisticPrescription"
        collapse={diagonisticPrescription}
        onPress={() => setdiagonisticPrescription(!diagonisticPrescription)}
      >
        <View style={styles.otherMainView}></View>
        <View style={{ marginLeft: 16, marginBottom: 30 }}>
          <Text style={{ color: 'rgba(2, 71, 91, 0.6)', ...theme.fonts.IBMPlexSansMedium(12) }}>
            {' '}
            Already added:
          </Text>
          <View style={{ marginTop: 7, flexDirection: 'row' }}>
            <ChipViewCard
              text="MRI"
              selected={true}
              icon={<Up />}
              textSelectedStyle={{ marginTop: 3, marginBottom: 2, marginLeft: 3 }}
            />
          </View>
        </View>
        <View style={{ marginLeft: 16, marginBottom: 30, marginRight: 20 }}>
          <Text style={{ color: 'rgba(2, 71, 91, 0.6)', ...theme.fonts.IBMPlexSansMedium(12) }}>
            Diagnostic Name
          </Text>
          <TextInputComponent
            placeholder="Enter here..."
            multiline={true}
            value={diagnosisvalues}
            onChangeText={(diagnosisvalues) => setDiagnosisvalues(diagnosisvalues)}
            autoCorrect={true}
            conatinerstyles={[styles.otherInstructionsInput]}
          />
        </View>
        <View style={{ marginLeft: 16, marginBottom: 20 }}>
          <Text style={{ color: 'rgba(2, 71, 91, 0.6)', ...theme.fonts.IBMPlexSansMedium(12) }}>
            Favorites:
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginBottom: 20,
              flex: 2,
              marginRight: 16,
              marginTop: 7,
            }}
          >
            <View style={{ flex: 1 }}>
              <ChipViewCard
                text="Urine Test"
                selected={true}
                icon={<Up />}
                textUnSelectedStyle={{ ...theme.fonts.IBMPlexSansMedium(13) }}
              />
            </View>
            <View style={{ flex: 0.1 }} />
            <View style={{ flex: 1 }}>
              <ChipViewCard
                text="Full Check up"
                selected={false}
                icon={<Up />}
                textUnSelectedStyle={{ ...theme.fonts.IBMPlexSansMedium(13) }}
              />
            </View>
          </View>
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
        <View style={styles.medicineunderline}></View>
        <View style={{ marginLeft: 16, marginBottom: 20 }}>
          <Text style={styles.medicineText}>Medicine Name</Text>
          <View style={styles.medicineTextInputView}>
            <TextInput
              style={{
                color: '#01475b',
                ...theme.fonts.IBMPlexSansMedium(14),
              }}
              onChangeText={(medinceName) => setMedinceName(medinceName)}
              value={medinceName}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        <View style={{ marginLeft: 16 }}>
          <Text style={styles.dosage}>Dosage</Text>
          <View style={{ flexDirection: 'row', marginBottom: 24 }}>
            <TouchableOpacity onPress={() => setCount(count - 1)}>
              <View>
                <Up />
              </View>
            </TouchableOpacity>
            <Text style={styles.countText}>
              {count} tablet{count > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={() => setCount(count + 1)}>
              <View style={{ marginLeft: 10 }}>
                <Down />
              </View>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.timeofthedayText}>Time of the Day</Text>
            <View style={styles.daysview}>
              <ChipViewCard text="Morning" selected={true} container={{ marginBottom: 8 }} />
              <ChipViewCard text="Noon" selected={false} container={{ marginBottom: 8 }} />
              <ChipViewCard text="Evening" selected={false} container={{ marginBottom: 8 }} />
              <ChipViewCard text="Night" selected={true} container={{ marginBottom: 8 }} />
            </View>
          </View>
          <View>
            <Text style={styles.timeofthedayText}>To be taken</Text>
            <View style={styles.foodmedicineview}>
              <ChipViewCard text="After Food" selected={true} />
              <View style={{ flex: 0.1 }} />
              <ChipViewCard text=" BeforeFood" selected={false} />
            </View>
          </View>
          <View
            style={{
              height: 2,
              opacity: 0.3,
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: '#979797',
              marginRight: 16,
              marginBottom: 23,
            }}
          ></View>
          <View style={{ flexDirection: 'row', marginBottom: 23 }}>
            <Add />
            <TouchableOpacity>
              <Text style={styles.addDoctorText}>Add Medicine</Text>
            </TouchableOpacity>
          </View>
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
          <View style={styles.medicineunderline}></View>
          <View style={{ marginLeft: 16, marginBottom: 20 }}>
            <Text style={styles.medicineText}>Do you recommend a follow up?</Text>
            <Switch onValueChange={() => setSwitchValue(!switchValue)} value={switchValue} />
          </View>
          <View style={styles.medicineunderline}></View>
          <View style={{ marginLeft: 16, marginBottom: 20, marginRight: 25 }}>
            <Text style={styles.medicineText}>Follow Up After:</Text>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Slider
                value={sliderValue}
                step={stepValue}
                onValueChange={(sliderValue) => setSliderValue(sliderValue)}
                minimumValue={2}
                maximumValue={10}
              />

              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
                <Text style={sliderValue == 2 ? styles.normalSliderText : styles.sliderText}>
                  2{'\n'}days
                </Text>

                <Text style={sliderValue == 5 ? styles.normalSliderText : styles.sliderText}>
                  5{'\n'}days
                </Text>
                <Text style={sliderValue == 7 ? styles.normalSliderText : styles.sliderText}>
                  7{'\n'}days
                </Text>
                <Text style={sliderValue > 8 ? styles.normalSliderText : styles.sliderText}>
                  more
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.medicineunderline}></View>
          <View style={{ marginLeft: 16, marginBottom: 20 }}>
            <Text style={styles.medicineText}>Consult Type Recommended:</Text>
            <View style={{ flexDirection: 'row' }}>
              <View>
                <PlaceHolderDoctor />
              </View>
              <View>
                <PlaceHolderDoctors />
              </View>
            </View>
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
        <Diagnosis />
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
        {renderButtonsView()}
      </ScrollView>
    </View>
  );
};
