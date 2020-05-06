import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import SampleStyles from '@aph/mobile-doctors/src/components/Sample.styles';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  ApploLogo,
  Chat,
  Notification,
  RoundIcon,
  Up,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { PatientCard } from '@aph/mobile-doctors/src/components/ui/PatientCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { CommonNotificationHeader } from '@aph/mobile-doctors/src/components/ui/CommonNotificationHeader';

const styles = SampleStyles;

export interface PatientsProps extends NavigationScreenProps {}

export const Sample: React.FC<PatientsProps> = (props) => {
  const [activeTabIndex, setActiveTabIndex] = useState(true);
  const [regular, setRegular] = useState(false);
  const [followup, setFollowup] = useState(false);
  const [showNeedHelp, setshowNeedHelp] = useState(false);

  const _data = [
    { id: 1, name: 'Dr. Sanjeev Shah', speciality: '2 Consults', type: true },
    { id: 2, name: 'Dr. Sheetal Sharma', speciality: '2 Consults', type: false },
    { id: 3, name: 'Dr. Alok Mehta', speciality: '3 Consults', type: false },
    { id: 4, name: 'Dr. Rahul Sharma', speciality: '1 Consults', type: true },
    { id: 5, name: 'Dr. Smita Rao', speciality: '2 Consults', type: false },
    { id: 6, name: 'Dr. Ajay Khanna', speciality: '2 Consults', type: true },
    { id: 7, name: 'Dr. Ranjith Kumar', speciality: '2 Consults', type: false },
    { id: 8, name: 'Dr. Sai Rao', speciality: '2 Consults', type: true },
    { id: 9, name: 'Dr. Muqeet ', speciality: '2 Consults', type: true },
    { id: 10, name: 'Dr. Kumar ', speciality: '1 Consults', type: true },
  ];

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
    setRegular(true);
    setActiveTabIndex(false);
    setFollowup(false);
  };
  const showFollowUp = () => {
    setRegular(false);
    setActiveTabIndex(false);
    setFollowup(true);
  };
  const showAllData = () => {
    setActiveTabIndex(true);
    setRegular(false);
    setFollowup(false);
  };

  return (
    <SafeAreaView style={[theme.viewStyles.container]}>
      <CommonNotificationHeader navigation={props.navigation} />
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
                    marginLeft: 24,
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
                    marginLeft: 15,
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
                    marginLeft: 24,
                    marginRight: 24,
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
                    marginLeft: 15,
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
            <Up />
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {activeTabIndex ? (
          <ScrollView bounces={false} style={{ flex: 1 }}>
            {_data!.map((_doctor, i, array) => {
              return (
                <PatientCard
                  doctorname={_doctor.name}
                  icon={
                    <View style={{ marginRight: 12 }}>
                      <Chat />
                    </View>
                  }
                  consults={_doctor.speciality}
                  lastconsult="Last Consult: 17/07/2019 "
                  typeValue={_doctor.type}
                />
              );
            })}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            {regular ? (
              <ScrollView bounces={false} style={{ flex: 1 }}>
                {_data!.map((_doctor, i, array) => {
                  return (
                    <PatientCard
                      doctorname={_doctor.name}
                      icon={
                        <View style={{ marginRight: 12 }}>
                          <Chat />
                        </View>
                      }
                      consults={_doctor.speciality}
                      lastconsult="Last Consult: 17/07/2019 "
                      typeValue={_doctor.type}
                    />
                  );
                })}
              </ScrollView>
            ) : (
              <View style={{ flex: 1 }}>
                {followup ? (
                  <View style={{ flex: 1 }}>
                    <ScrollView bounces={false} style={{ flex: 1 }}>
                      {_data!.map((_doctor, i, array) => {
                        return (
                          <PatientCard
                            doctorname={_doctor.name}
                            icon={
                              <View style={{ marginRight: 12 }}>
                                <Chat />
                              </View>
                            }
                            consults={_doctor.speciality}
                            lastconsult="Last Consult: 17/07/2019 "
                            typeValue={_doctor.type}
                          />
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        )}
      </View>
      {showNeedHelp && <NeedHelpCard onPress={() => setshowNeedHelp(false)} />}
    </SafeAreaView>
  );
};
