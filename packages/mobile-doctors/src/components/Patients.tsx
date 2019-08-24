import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  ApploLogo,
  Chat,
  Notification,
  RoundIcon,
  Up,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { PatientCard } from '@aph/mobile-doctors/src/components/ui/PatientCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MaterialTabs from 'react-native-material-tabs';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { _doctors } from '@aph/mobile-doctors/src/helpers/APIDummyData';

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
  },
});
export interface PatientsProps extends NavigationScreenProps {}

export const Patients: React.FC<PatientsProps> = (props) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
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
  const renderTabPage = () => {
    return (
      <>
        <View style={[styles.shadowview]}>
          <MaterialTabs
            items={['All', 'Follow up', 'Regular']}
            selectedIndex={activeTabIndex}
            onChange={(index) => setActiveTabIndex(index)}
            barColor="#ffffff"
            indicatorColor="#00b38e"
            activeTextColor="#02475b"
            inactiveTextColor={'rgba(2, 71, 91, 0.6)'}
            activeTextStyle={{ ...theme.fonts.IBMPlexSansBold(14), color: '#02475b' }}
            uppercase={false}
          ></MaterialTabs>
        </View>
        <View style={{ flex: 1 }}>
          {activeTabIndex == 0 ? (
            <ScrollView bounces={false}>
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
            <View>
              {activeTabIndex == 1 ? (
                <ScrollView bounces={false}>
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
                <View>
                  {activeTabIndex == 2 ? (
                    <ScrollView bounces={false}>
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
                  ) : null}
                </View>
              )}
            </View>
          )}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[theme.viewStyles.container]}>
      {renderMainHeader()}
      <View style={{ marginBottom: 0 }}>{renderDoctorGreeting()}</View>
      {renderTabPage()}
    </SafeAreaView>
  );
};
