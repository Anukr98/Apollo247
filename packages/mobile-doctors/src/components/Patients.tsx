import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  ApploLogo,
  Chat,
  Notification,
  RoundIcon,
  Up,
  Selected,
  UnSelected,
  ClosePopup,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { PatientCard } from '@aph/mobile-doctors/src/components/ui/PatientCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';

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
    marginBottom: 12,
  },
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  subViewPopup: {
    marginTop: 150,
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
});
export interface PatientsProps extends NavigationScreenProps {}

export const Patients: React.FC<PatientsProps> = (props) => {
  const tabsData = [{ title: 'All' }, { title: 'Follow up' }, { title: 'Regular' }];
  const sortingList = [
    'Most Recent',
    'Number of Consults',
    'Patient Name: A to Z',
    'Patient Name: Z to A',
  ];

  const [activeTabIndex, setActiveTabIndex] = useState(true);
  const [regular, setRegular] = useState(false);
  const [followup, setFollowup] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);
  const [showSorting, setshowSorting] = useState(false);
  const [selectedSorting, setselectedSorting] = useState(sortingList[0]);

  const _data = [
    { id: 1, name: 'Dr. Sanjeev Shah', speciality: '2 Consults', type: true, revenue: '1000' },
    {
      id: 2,
      name: 'Dr. Sheetal Sharma Sheetal Sharma',
      speciality: '2 Consults',
      type: false,
      revenue: '6000',
    },
    { id: 3, name: 'Dr. Alok Mehta', speciality: '3 Consults', type: false, revenue: '3000' },
    { id: 4, name: 'Dr. Rahul Sharma', speciality: '1 Consults', type: true, revenue: '1000' },
    { id: 5, name: 'Dr. Smita Rao', speciality: '2 Consults', type: false, revenue: '2000' },
    { id: 6, name: 'Dr. Ajay Khanna', speciality: '2 Consults', type: true, revenue: '1000' },
    { id: 7, name: 'Dr. Ranjith Kumar', speciality: '2 Consults', type: false, revenue: '3000' },
    { id: 8, name: 'Dr. Sai Rao', speciality: '2 Consults', type: true, revenue: '1000' },
    { id: 9, name: 'Dr. Muqeet ', speciality: '2 Consults', type: true, revenue: '6000' },
    { id: 10, name: 'Dr. Kumar ', speciality: '1 Consults', type: true, revenue: '2000' },
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

  const renderTabs = () => {
    return (
      <View style={styles.shadowview}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.colors.WHITE,
          }}
        >
          <View style={{ flex: 1 }}>
            <TabsComponent
              // style={styles.tabsContainer}
              onChange={(title) => {
                setSelectedTab(title);
              }}
              data={tabsData}
              selectedTab={selectedTab}
            />
          </View>

          <View
            style={{
              width: 60,
              height: 20,
              borderLeftWidth: 0.5,
              borderColor: 'rgba(2, 71, 91, 0.6)',
              //marginLeft: 15,
              marginVertical: 12,
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={() => setshowSorting(true)}>
              <Up />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[theme.viewStyles.container]}>
        {renderMainHeader()}
        {/* <View style={styles.shadowview}>
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
      </View> */}
        <View style={{ flex: 1 }}>
          <ScrollView
            bounces={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            stickyHeaderIndices={[1]}
          >
            <View style={{ marginBottom: 0 }}>{renderDoctorGreeting()}</View>
            {renderTabs()}
            <View style={{ paddingTop: 14 }}>
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
                    revenue={_doctor.revenue}
                    onPress={() => props.navigation.push(AppRoutes.PatientDetailsPage)}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      {showSorting && (
        <View style={styles.showPopUp}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.container}
            onPress={() => setshowSorting(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.subViewPopup} onPress={() => {}}>
              <View style={{ marginHorizontal: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 23,
                    borderBottomWidth: 0.5,
                    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={theme.viewStyles.text(
                      'SB',
                      14,
                      theme.colors.darkBlueColor,
                      1,
                      undefined,
                      0.54
                    )}
                  >
                    SORT BY
                  </Text>
                  <TouchableOpacity activeOpacity={1} onPress={() => setshowSorting(false)}>
                    <ClosePopup style={{ height: 24, width: 24 }} />
                  </TouchableOpacity>
                </View>
                <View style={{ marginVertical: 9 }}>
                  {sortingList.map((title) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      style={{ flexDirection: 'row', marginVertical: 11 }}
                      onPress={() => setselectedSorting(title)}
                    >
                      {selectedSorting === title ? <Selected /> : <UnSelected />}
                      <Text
                        style={[
                          {
                            marginLeft: 20,
                            ...theme.viewStyles.text('S', 14, 'rgba(2, 71, 91, 0.3)'),
                          },
                          selectedSorting === title
                            ? { ...theme.viewStyles.text('SB', 14, theme.colors.APP_GREEN) }
                            : {},
                        ]}
                      >
                        {title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
