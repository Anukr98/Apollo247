import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  ApploLogo,
  Chat,
  ClosePopup,
  Notification,
  RoundIcon,
  Selected,
  UnSelected,
  Up,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { PatientCard } from '@aph/mobile-doctors/src/components/ui/PatientCard';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { GET_PATIENT_LOG } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  getPatientLog,
  getPatientLog_getPatientLog_patientLog,
} from '@aph/mobile-doctors/src/graphql/types/getPatientLog';
import { patientLogSort, patientLogType } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';

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
  const tabsData = [
    { title: 'All', key: patientLogType.All },
    { title: 'Follow up', key: patientLogType.FOLLOW_UP },
    { title: 'Regular', key: patientLogType.REGULAR },
  ];
  const sortingList = [
    {
      title: 'Most Recent',
      key: patientLogSort.MOST_RECENT,
    },
    {
      title: 'Number of Consults',
      key: patientLogSort.NUMBER_OF_CONSULTS,
    },
    {
      title: 'Patient Name: A to Z',
      key: patientLogSort.PATIENT_NAME_A_TO_Z,
    },
    {
      title: 'Patient Name: Z to A',
      key: patientLogSort.PATIENT_NAME_Z_TO_A,
    },
  ];

  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);
  const [showSorting, setshowSorting] = useState(false);
  const [selectedSorting, setselectedSorting] = useState(sortingList[0].key);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [loadMoreSpinner, setloadMoreSpinner] = useState<boolean>(false);
  const [allData, setAllData] = useState<(getPatientLog_getPatientLog_patientLog | null)[] | null>(
    []
  );
  const [offset, setoffset] = useState<number>(0);
  const [totalResultCount, settotalResultCount] = useState<number>();

  const [SelectableValue, setSelectableValue] = useState(patientLogType.All);
  // const [patientLogSortData, setPatientLogSortData] = useState(patientLogSort.PATIENT_NAME_A_TO_Z);
  const [showNeedHelp, setshowNeedHelp] = useState(false);

  const client = useApolloClient();
  const { doctorDetails } = useAuth();

  useEffect(() => {
    ShowAllTypeData(patientLogType.All, sortingList[0].key);
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
            onPress: () => setshowNeedHelp(true), //props.navigation.push(AppRoutes.NeedHelpAppointment),
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
                const selectedValue =
                  title === tabsData[0].title
                    ? patientLogType.All
                    : title === tabsData[1].title
                    ? patientLogType.FOLLOW_UP
                    : patientLogType.REGULAR;
                setSelectableValue(selectedValue);
                ShowAllTypeData(selectedValue, selectedSorting);
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
        >{`hello dr. ${(doctorDetails ? doctorDetails.firstName : '').toLowerCase()} :)`}</Text>
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

  const ShowAllTypeData = (
    SelectableValue: patientLogType,
    patientLogSortData: patientLogSort,
    offset = 0
  ) => {
    console.log('patientLogSortData', patientLogSortData, SelectableValue, offset);
    if (offset !== totalResultCount) {
      !offset && setshowSpinner(true);
      offset && setloadMoreSpinner(true);
      client
        .query<getPatientLog>({
          query: GET_PATIENT_LOG,
          variables: {
            limit: 6,
            offset: offset,
            sortBy: patientLogSortData,
            type: SelectableValue,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          if (data.getPatientLog) {
            console.log('getPatientLog', data!);
            setAllData(
              offset === 0
                ? data.getPatientLog.patientLog
                : JSON.parse(JSON.stringify(allData)).concat(data.getPatientLog.patientLog)
            );
            setoffset(
              data.getPatientLog.patientLog && allData
                ? data.getPatientLog.patientLog.length + allData.length
                : allData!.length
            );
            settotalResultCount(data.getPatientLog.totalResultCount || 0);
            !offset ? setshowSpinner(false) : setloadMoreSpinner(false);
          }
        })
        .catch((e) => {
          setshowSpinner(false);
          const error = JSON.parse(JSON.stringify(e));
          CommonBugFender('PatientLog', error);
          console.log('Error occured while fetching patient log', error);
        });
    }
  };

  const renderItemComponent = (
    item: getPatientLog_getPatientLog_patientLog | null,
    index: number
  ) => {
    return (
      item &&
      item.appointmentids && (
        <PatientCard
          containerStyle={index === 0 ? { marginTop: 30 } : {}}
          doctorname={item.patientInfo!.firstName}
          icon={
            <View style={{ marginRight: 12 }}>
              <Chat />
            </View>
          }
          consults={item.consultscount}
          lastconsult={moment(item.appointmentdatetime).format('DD/MM/YYYY')}
          //typeValue={item.type}
          onPress={() =>
            props.navigation.push(AppRoutes.PatientDetailsPage, {
              patientId:
                item.appointmentids && item.appointmentids.length ? item.appointmentids[0] : '',
              PatientInfo: item.patientInfo,
            })
          }
        />
      )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[theme.viewStyles.container]}>
        {/* <ScrollView
          bounces={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          stickyHeaderIndices={[1]}
        > */}

        {/* <View style={{ paddingTop: 14 }}> */}

        <FlatList
          contentContainerStyle={{ paddingBottom: 20 }}
          removeClippedSubviews={false}
          bounces={false}
          data={allData}
          onEndReachedThreshold={0.5}
          onEndReached={(info) => {
            console.log('onEndReached', info);
            ShowAllTypeData(SelectableValue, selectedSorting, offset);
          }}
          stickyHeaderIndices={[0]}
          renderItem={({ item, index }) => renderItemComponent(item, index)}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={
            <>
              {renderMainHeader()}
              <View style={{ marginBottom: 0 }}>{renderDoctorGreeting()}</View>
              {renderTabs()}
              {allData && allData.length == 0 && !showSpinner && (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      marginTop: 50,
                      flex: 1,
                      color: '#01475b',
                      ...theme.fonts.IBMPlexSansMedium(14),
                      textAlign: 'center',
                    }}
                  >
                    No Data
                  </Text>
                </View>
              )}
            </>
          }
          ListFooterComponent={
            loadMoreSpinner ? (
              <View style={{ marginVertical: 20 }}>
                <ActivityIndicator animating={true} size="small" color="green" />
              </View>
            ) : null
          }
          // numColumns={1}
          // keyboardShouldPersistTaps="always"
          // keyboardDismissMode="on-drag"
        />
        {/* </View> */}
        {/* </ScrollView> */}
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
                      theme.colors.SHARP_BLUE,
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
                  {sortingList.map((obj) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      style={{ flexDirection: 'row', marginVertical: 11 }}
                      onPress={() => {
                        setshowSorting(false);
                        setselectedSorting(obj.key);
                        ShowAllTypeData(SelectableValue, obj.key);
                      }}
                    >
                      {selectedSorting === obj.key ? <Selected /> : <UnSelected />}
                      <Text
                        style={[
                          {
                            marginLeft: 20,
                            ...theme.viewStyles.text('S', 14, 'rgba(2, 71, 91, 0.3)'),
                          },
                          selectedSorting === obj.key
                            ? { ...theme.viewStyles.text('SB', 14, theme.colors.APP_GREEN) }
                            : {},
                        ]}
                      >
                        {obj.title}
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
      {showNeedHelp && <NeedHelpCard onPress={() => setshowNeedHelp(false)} />}
    </View>
  );
};
