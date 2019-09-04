import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  ApploLogo,
  Chat,
  Notification,
  RoundIcon,
  Up,
  Cancel,
  Selected,
  UnSelected,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { PatientCard } from '@aph/mobile-doctors/src/components/ui/PatientCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  getPatientLog,
  getPatientLog_getPatientLog,
} from '@aph/mobile-doctors/src/graphql/types/getPatientLog';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PATIENT_LOG } from '@aph/mobile-doctors/src/graphql/profiles';
import { patientLogType, patientLogSort } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import moment, { duration } from 'moment';
import console = require('console');

const styles = StyleSheet.create({
  shadowview: {
    height: 44,
    width: '100%',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 10,
    backgroundColor: 'white',
  },
  common: {
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: 'rgba(2, 71, 91, 0.6)',
    marginLeft: 16,
  },
  commonview: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  selectText: {
    marginLeft: 16,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#00b38e',
  },
});
export interface PatientsProps extends NavigationScreenProps {}

export const Patients: React.FC<PatientsProps> = (props) => {
  const client = useApolloClient();
  const [activeTabIndex, setActiveTabIndex] = useState(true);
  const [regular, setRegular] = useState(false);
  const [followup, setFollowup] = useState(false);
  const [allData, setAllData] = useState<any>([]);
  const [filterdata, setFilterData] = useState(false);
  const [selectedId, setSelectedId] = useState(true);

  const [SelectableValue, setSelectableValue] = useState(patientLogType.All);
  const [patientLogSortData, setPatientLogSortData] = useState(patientLogSort.PATIENT_NAME_A_TO_Z);

  useEffect(() => {
    ShowAllTypeData(SelectableValue, patientLogSortData);
  }, []);
  const renderMainHeader = () => {
    return (
      <Header
        leftIcons={[
          {
            icon: <ApploLogo />,
          },
        ]}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => props.navigation.push(AppRoutes.NeedHelpAppointment),
          },
          {
            icon: <Notification />,
            onPress: () => props.navigation.push(AppRoutes.NotificationScreen),
          },
        ]}
      />
    );
  };

  const renderDoctorGreeting = () => {
    return (
      <View style={{ backgroundColor: '#ffffff' }}>
        <Text
          style={{
            ...theme.fonts.IBMPlexSansSemiBold(28),
            color: '#02475b',
            marginLeft: 20,
            marginBottom: 2,
          }}
        >{`hello dr. rao :)`}</Text>
        <Text
          style={{
            ...theme.fonts.IBMPlexSansMedium(16),
            color: '#0087ba',
            marginLeft: 20,
            marginBottom: 14,
            lineHeight: 24,
          }}
        >{`here are all your patients `}</Text>
      </View>
    );
  };

  const showRegularData = () => {
    ShowAllTypeData(patientLogType.REGULAR, patientLogSortData);
    setRegular(true);
    setActiveTabIndex(false);
    setFollowup(false);
  };
  const showFollowUp = () => {
    ShowAllTypeData(patientLogType.FOLLOW_UP, patientLogSortData);
    setRegular(false);
    setActiveTabIndex(false);
    setFollowup(true);
  };
  const showAllData = () => {
    ShowAllTypeData(patientLogType.All, patientLogSortData);
    setActiveTabIndex(true);
    setRegular(false);
    setFollowup(false);
  };
  const ShowAllTypeData = (SelectableValue: patientLogType, patientLogSortData: patientLogSort) => {
    console.log('patientLogSortData', patientLogSortData);
    client
      .query<getPatientLog>({
        query: GET_PATIENT_LOG,
        variables: {
          limit: 10,
          offset: 0,
          sortBy: patientLogSortData,
          type: SelectableValue,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        console.log('getPatientLog', _data!);
        setAllData(_data.data.getPatientLog);
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Doctor profile', error);
      });
  };
  const showDataSort = () => {
    setSelectedId(!selectedId);
    setPatientLogSortData(patientLogSort.MOST_RECENT);
  };
  return (
    <SafeAreaView style={[theme.viewStyles.container]}>
      {renderMainHeader()}
      <View style={{ marginBottom: 0 }}>{renderDoctorGreeting()}</View>

      <View style={styles.shadowview}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => showAllData()}>
            {!activeTabIndex ? (
              <Text
                style={{
                  textAlign: 'left',
                  ...theme.fonts.IBMPlexSansSemiBold(14),
                  color: '#02475b',
                  marginTop: 8,
                  marginBottom: 12,
                  marginLeft: 24,
                  opacity: 0.6,
                }}
              >
                All
              </Text>
            ) : (
              <View>
                <Text
                  style={{
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansSemiBold(14),
                    color: '#02475b',
                    marginTop: 8,
                    marginBottom: 12,
                    marginLeft: 24,
                  }}
                >
                  All
                </Text>
                <View
                  style={{
                    borderColor: '#00b38e',
                    borderWidth: 2,
                    width: 80,
                    marginTop: 2,
                  }}
                ></View>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => showRegularData()}>
            {!regular ? (
              <Text
                style={{
                  textAlign: 'left',
                  ...theme.fonts.IBMPlexSansSemiBold(14),
                  color: '#02475b',
                  marginTop: 8,
                  marginBottom: 12,
                  marginLeft: 24,
                  opacity: 0.6,
                }}
              >
                Regular
              </Text>
            ) : (
              <View>
                <Text
                  style={{
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansSemiBold(14),
                    color: '#02475b',
                    marginTop: 8,
                    marginBottom: 12,
                    marginLeft: 48,
                  }}
                >
                  Regular
                </Text>
                <View
                  style={{
                    borderColor: '#00b38e',
                    borderWidth: 2,
                    width: 80,
                    marginTop: 2,
                    marginLeft: 30,
                  }}
                ></View>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => showFollowUp()}>
            {!followup ? (
              <Text
                style={{
                  textAlign: 'left',
                  ...theme.fonts.IBMPlexSansSemiBold(14),
                  color: '#02475b',
                  marginTop: 8,
                  marginBottom: 12,
                  marginLeft: 24,
                  marginRight: 24,
                  opacity: 0.6,
                }}
              >
                FollowUp
              </Text>
            ) : (
              <View>
                <Text
                  style={{
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansSemiBold(14),
                    color: '#02475b',
                    marginTop: 8,
                    marginBottom: 12,
                    marginLeft: 48,
                  }}
                >
                  FollowUp
                </Text>
                <View
                  style={{
                    borderColor: '#00b38e',
                    borderWidth: 2,
                    width: 80,
                    marginTop: 2,
                    marginLeft: 30,
                  }}
                ></View>
              </View>
            )}
          </TouchableOpacity>
          <View
            style={{
              height: 20,
              borderWidth: 0.5,
              borderColor: 'rgba(2, 71, 91, 0.6)',
              //marginLeft: 15,
              marginTop: 10,
            }}
          ></View>
          <View style={{ marginRight: 24 }}>
            <TouchableOpacity onPress={() => setFilterData(!filterdata)}>
              <Up />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {activeTabIndex ? (
          <ScrollView bounces={false} style={{ flex: 1 }}>
            {allData.length == 0 ? (
              <Text
                style={{
                  flex: 1,
                  color: '#01475b',
                  ...theme.fonts.IBMPlexSansMedium(14),
                }}
              >
                No Data
              </Text>
            ) : (
              allData!.map((_doctor: getPatientLog_getPatientLog) => {
                const dataeval = moment(_doctor.appointmentdatetime).format('DD/MM/YYYY');
                return (
                  <PatientCard
                    doctorname={_doctor.patientInfo!.firstName}
                    icon={
                      <View style={{ marginRight: 12 }}>
                        <Chat />
                      </View>
                    }
                    consults={_doctor.consultscount! + `Consults`}
                    lastconsult={dataeval}
                    onPress={() =>
                      props.navigation.push(AppRoutes.PatientDetailsPage, {
                        Appointments: _doctor.appointmentids![0],
                        PatientInfo: _doctor.patientInfo,
                        ConsultsCount: _doctor.consultscount,
                      })
                    }
                  />
                );
              })
            )}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            {regular ? (
              <ScrollView bounces={false} style={{ flex: 1 }}>
                {allData.length == 0 ? (
                  <Text
                    style={{
                      flex: 1,
                      color: '#01475b',
                      ...theme.fonts.IBMPlexSansMedium(14),
                    }}
                  >
                    No Data
                  </Text>
                ) : (
                  allData!.map((_doctor: getPatientLog_getPatientLog) => {
                    const dataeval = moment(_doctor.appointmentdatetime).format('DD/MM/YYYY');
                    return (
                      <PatientCard
                        doctorname={_doctor.patientInfo!.firstName}
                        icon={
                          <View style={{ marginRight: 12 }}>
                            <Chat />
                          </View>
                        }
                        consults={_doctor.consultscount! + `Consults`}
                        lastconsult={dataeval}
                        //typeValue={_doctor.type}
                        onPress={() =>
                          props.navigation.push(AppRoutes.PatientDetailsPage, {
                            Appointments: _doctor.appointmentids![0],
                            PatientInfo: _doctor.patientInfo,
                            ConsultsCount: _doctor.consultscount,
                          })
                        }
                      />
                    );
                  })
                )}
              </ScrollView>
            ) : (
              <View style={{ flex: 1 }}>
                {followup ? (
                  <View style={{ flex: 1 }}>
                    <ScrollView bounces={false} style={{ flex: 1 }}>
                      {allData.length == 0 ? (
                        <Text
                          style={{
                            flex: 1,
                            color: '#01475b',
                            ...theme.fonts.IBMPlexSansMedium(14),
                          }}
                        >
                          No Data
                        </Text>
                      ) : (
                        allData!.map((_doctor: getPatientLog_getPatientLog) => {
                          const dataeval = moment(_doctor.appointmentdatetime).format('DD/MM/YYYY');
                          return (
                            <PatientCard
                              doctorname={_doctor.patientInfo!.firstName}
                              icon={
                                <View style={{ marginRight: 12 }}>
                                  <Chat />
                                </View>
                              }
                              consults={_doctor.consultscount! + `Consults`}
                              lastconsult={dataeval}
                              //typeValue={_doctor.type}
                              onPress={() =>
                                props.navigation.push(AppRoutes.PatientDetailsPage, {
                                  Appointments: _doctor.appointmentids![0],
                                  PatientInfo: _doctor.patientInfo,
                                  ConsultsCount: _doctor.consultscount,
                                })
                              }
                            />
                          );
                        })
                      )}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        )}
        {filterdata ? (
          <View
            style={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: theme.colors.CARD_BG,
              padding: 20,
              marginBottom: 0,
              shadowColor: '#808080',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(14), color: '#01475b' }}>
                {' '}
                Sort By
              </Text>
              <TouchableOpacity onPress={() => setFilterData(false)}>
                <Cancel />
              </TouchableOpacity>
            </View>
            <View
              style={{
                borderStyle: 'solid',
                borderWidth: 0.5,
                borderColor: 'rgba(2, 71, 91, 0.4)',
                height: 1,
                marginBottom: 16,
                marginTop: 16,
              }}
            ></View>

            <View>
              {selectedId ? (
                <TouchableOpacity onPress={() => showDataSort()}>
                  <View style={styles.commonview}>
                    <Selected />
                    <Text style={styles.selectText}>Most Recent</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => showDataSort()}>
                  <View style={styles.commonview}>
                    <UnSelected />
                    <Text style={styles.common}>Most Recent</Text>
                  </View>
                </TouchableOpacity>
              )}
              <View style={styles.commonview}>
                <UnSelected />
                <Text style={styles.common}>Number of Consults</Text>
              </View>
              <View style={styles.commonview}>
                <UnSelected />
                <Text style={styles.common}>Patient Name: A to Z</Text>
              </View>
              <View style={styles.commonview}>
                <UnSelected />
                <Text style={styles.common}>Patient Name: Z to A</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};
