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
  ClosePopup,
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
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';

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

  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);
  const [showSorting, setshowSorting] = useState(false);
  const [selectedSorting, setselectedSorting] = useState(sortingList[0]);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
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
              onChange={(title) => {
                setSelectedTab(title);
                ShowAllTypeData(
                  title === tabsData[0].title
                    ? patientLogType.All
                    : title === tabsData[1].title
                    ? patientLogType.FOLLOW_UP
                    : patientLogType.REGULAR,
                  patientLogSortData
                );
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

  const ShowAllTypeData = (SelectableValue: patientLogType, patientLogSortData: patientLogSort) => {
    console.log('patientLogSortData', patientLogSortData);
    setshowSpinner(true);
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
        setshowSpinner(false);
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
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[theme.viewStyles.container]}>
        {renderMainHeader()}

        <ScrollView
          bounces={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          stickyHeaderIndices={[1]}
        >
          <View style={{ marginBottom: 0 }}>{renderDoctorGreeting()}</View>
          {renderTabs()}
          <View style={{ paddingTop: 14 }}>
            {allData.length == 0 && !showSpinner ? (
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
                    doctorname={_doctor!.patientInfo!.firstName}
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
                        Appointments: _doctor!.appointmentids[0],
                      })
                    }
                  />
                );
              })
            )}
          </View>
        </ScrollView>
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
      {showSpinner && <Spinner />}
    </View>
  );
};
