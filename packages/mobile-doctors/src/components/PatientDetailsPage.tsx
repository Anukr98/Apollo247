import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import {
  BackArrow,
  PastAppointmentIcon,
  PatientPlaceHolderImage,
  UpComingIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { GET_CASESHEET } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetCaseSheet } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { Appointments } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  shadowview: {
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 10,
    backgroundColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
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
  leftTimeLineContainer: {
    // marginBottom: -40,
    marginRight: 0,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    flex: 1,
    width: 2,
    marginLeft: 0,
  },
});
export interface PatientsProps
  extends NavigationScreenProps<{
    Appointments: string;
  }> {}

export const PatientDetailsPage: React.FC<PatientsProps> = (props) => {
  const client = useApolloClient();
  console.log('Appointments', props.navigation.getParam('Appointments'));
  const [patientHistoryshow, setpatientHistoryshow] = useState(false);

  const [familyValues, setFamilyValues] = useState<any>([]);
  const [lifeStyleData, setLifeStyleData] = useState<any>([]);
  const [allergiesData, setAllergiesData] = useState<string>('');
  const [pastList, setPastList] = useState<any>([]);
  const _data = [
    { id: 'missed', name: 'Dr. Sanjeev Shah', speciality: '2 Consults', type: true },
    { id: 'missed', name: 'Dr. Sheetal Sharma', speciality: '2 Consults', type: false },
    { id: 'missed', name: 'Dr. Alok Mehta', speciality: '3 Consults', type: false },
  ];

  useEffect(() => {
    client
      .query<GetCaseSheet>({
        query: GET_CASESHEET,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: props.navigation.getParam('Appointments') },
      })
      .then((_data) => {
        const result = _data.data.getCaseSheet;
        setFamilyValues(_data.data.getCaseSheet!.patientDetails!.familyHistory!);
        setAllergiesData(_data.data.getCaseSheet!.patientDetails!.allergies!);
        setLifeStyleData(_data.data.getCaseSheet!.patientDetails!.lifeStyle);
        setPastList(_data.data.getCaseSheet!.pastAppointments!);
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Doctor GetJuniorDoctorCaseSheet', error);
      });
  }, []);
  const renderFamilyDetails = () => {
    return (
      <View>
        <Text style={styles.familyText}>Family History</Text>
        <View style={styles.familyInputView}>
          <TextInput
            style={styles.symptomsText}
            multiline={true}
            editable={false}
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
            editable={false}
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
            editable={false}
            onChangeText={(lifeStyleData) => setLifeStyleData(lifeStyleData)}
          >
            {lifeStyleData}
          </TextInput>
        </View>
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
  const renderLeftTimeLineView = (
    status: Appointments['timeslottype'],
    showTop: boolean,
    showBottom: boolean
  ) => {
    return (
      <View style={styles.leftTimeLineContainer}>
        <View
          style={[
            styles.verticalLine,
            {
              backgroundColor: showTop ? '#02475b' : '#ffffff',
              //marginLeft: 15,
            },
          ]}
        />
        {getStatusCircle(status)}
        <View
          style={[
            styles.verticalLine,
            {
              backgroundColor: showBottom ? '#02475b' : '#ffffff',
              //marginLeft: 15,
            },
          ]}
        />
      </View>
    );
  };
  const getStatusCircle = (status: Appointments['timeslottype']) =>
    status == 'past' ? (
      <PastAppointmentIcon />
    ) : status == 'missed' ? (
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 12 / 2,
          backgroundColor: '#02475b',
        }}
      ></View>
    ) : status == 'next' ? (
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 12 / 2,
          backgroundColor: '#02475b',
        }}
      ></View>
    ) : (
      <UpComingIcon />
    );
  const renderPastAppData = (apmnt: any) => {
    return (
      <View>
        {apmnt == [] ? (
          <Text style={styles.symptomsText}>No Data</Text>
        ) : (
          apmnt.caseSheet.map((_caseSheet: any, i) => {
            return (
              <View style={{ marginLeft: 16 }}>
                {_caseSheet.symptoms == null || [] ? (
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
  return (
    <SafeAreaView style={[theme.viewStyles.container]}>
      <ScrollView bounces={false}>
        <PatientPlaceHolderImage />

        <View style={{ top: -150, marginLeft: 20 }}>
          <TouchableOpacity onPress={() => props.navigation.pop()}>
            <BackArrow />
          </TouchableOpacity>
        </View>
        <View style={[styles.shadowview, { marginTop: -20 }]}>
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansSemiBold(18),
                color: '#02475b',
                marginLeft: 20,
                marginBottom: 8,
                marginRight: 15,
              }}
            >
              Seema Singh
            </Text>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(16),
                color: 'rgba(2, 71, 91, 0.8)',
                marginLeft: 14,
                marginBottom: 8,
              }}
            >
              56, F, Mumbai
            </Text>
          </View>
          <View
            style={{
              borderRadius: 5,
              backgroundColor: '#f0f4f5',
              flexDirection: 'row',
              marginLeft: 20,
              marginBottom: 16,
              marginRight: 20,
              marginTop: 20,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ marginTop: 15, marginLeft: 5, marginRight: 5, marginBottom: 15 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(20),
                  color: '#0087ba',
                  letterSpacing: 0.09,
                }}
              >
                Rs. 2000
              </Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: '#02475b',
                  letterSpacing: 0.02,
                  textAlign: 'center',
                }}
              >
                Revenue
              </Text>
            </View>
            <View style={{ marginTop: 15, marginLeft: 5, marginRight: 5, marginBottom: 15 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(20),
                  color: '#0087ba',
                  letterSpacing: 0.09,
                  textAlign: 'center',
                }}
              >
                2
              </Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: '#02475b',
                  letterSpacing: 0.02,
                }}
              >
                Consults
              </Text>
            </View>
            <View style={{ marginTop: 15, marginLeft: 5, marginRight: 5, marginBottom: 15 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(20),
                  color: '#0087ba',
                  letterSpacing: 0.09,
                  textAlign: 'center',
                }}
              >
                2
              </Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: '#02475b',
                  letterSpacing: 0.02,
                }}
              >
                Prescriptions
              </Text>
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: '#ffffff', margin: 20, borderRadius: 10 }}>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(17),
              lineHeight: 24,
              color: '#01475b',
              margin: 16,
            }}
          >
            Past Consultations
          </Text>
          <ScrollView bounces={false}>
            {pastList.map((apmnt: any, i) => {
              return (
                <View style={{ marginLeft: 16, marginRight: 20, marginBottom: 0 }}>
                  {renderPastAppData(apmnt)}
                </View>
              );
            })}
            {/* {_data!.map((_doctor, i, array) => {
              return (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {renderLeftTimeLineView(
                    _doctor.id,
                    i == 0 ? true : true,
                    i == array.length - 1 ? false : true
                  )}

                  <PastConsultCard doctorname={_doctor.name} />
                </View>
              );
            })} */}
          </ScrollView>
        </View>
        {renderPatientHistoryLifestyle()}
      </ScrollView>
    </SafeAreaView>
  );
};
