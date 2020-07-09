import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { useNotification } from '@aph/mobile-doctors/src/components/Notification/NotificationContext';
import { styles } from '@aph/mobile-doctors/src/components/Patients.styles';
import { CommonNotificationHeader } from '@aph/mobile-doctors/src/components/ui/CommonNotificationHeader';
import {
  BackArrowOrange,
  ChatOrange,
  ChatWhite,
  ClosePopup,
  SearchIcon,
  Selected,
  UnSelected,
  Up,
  SearchBackground,
  EmptySearch,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { PatientCard } from '@aph/mobile-doctors/src/components/ui/PatientCard';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { GET_PATIENT_LOG } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  getPatientLog,
  getPatientLogVariables,
  getPatientLog_getPatientLog_patientLog,
} from '@aph/mobile-doctors/src/graphql/types/getPatientLog';
import { patientLogSort, patientLogType } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { callPermissions, isValidSearch } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';

export interface PatientsProps extends NavigationScreenProps {}

export const Patients: React.FC<PatientsProps> = (props) => {
  const { markAsRead, fetchNotifications } = useNotification();
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
  const [flatListReady, setflatListReady] = useState<boolean>(false);

  const [SelectableValue, setSelectableValue] = useState(patientLogType.All);
  const [showNeedHelp, setshowNeedHelp] = useState(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchSpinner, setSearchSpinner] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const client = useApolloClient();
  const { doctorDetails } = useAuth();
  const { showAphAlert } = useUIElements();
  useEffect(() => {
    ShowAllTypeData(patientLogType.All, sortingList[0].key);
    const _didFocusSubscription = props.navigation.addListener('didFocus', async () => {
      const searchValue = await AsyncStorage.getItem('patientSearchValue');
      ShowAllTypeData(patientLogType.All, sortingList[0].key, 0, searchValue || '');
    });
    const _willFocusSubscription = props.navigation.addListener('willFocus', async () => {
      const searchValue = (await AsyncStorage.getItem('patientSearchValue')) || '';
      if (searchValue === '') {
        setShowSearch(false);
        setshowSpinner(true);
      }
    });
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willFocusSubscription && _willFocusSubscription.remove();
    };
  }, []);

  const _scrolled = () => {
    setflatListReady(true);
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
                ShowAllTypeData(selectedValue, selectedSorting, 0, searchInput);
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

  const searchAPI = async (name?: string) => {
    ShowAllTypeData(SelectableValue, selectedSorting, 0, name || name === '' ? name : searchInput);
  };
  const renderSearchInput = () => {
    return (
      <View style={{ flex: 1, marginTop: 7 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowSearch(false);
            if (searchInput !== '') {
              setshowSpinner(true);
              ShowAllTypeData(SelectableValue, selectedSorting);
            }
            setSearchInput('');
            AsyncStorage.removeItem('patientSearchValue');
          }}
        >
          <BackArrowOrange />
        </TouchableOpacity>
        <View style={styles.textInputContainer}>
          <TextInput
            autoCorrect={false}
            value={searchInput}
            placeholder={'Search by patient name'}
            style={searchInput === '' ? styles.textInputEmptyStyle : styles.textInputStyle}
            placeholderTextColor={theme.colors.darkBlueColor(0.4)}
            onChange={(value) => {
              if (isValidSearch(value.nativeEvent.text)) {
                setSearchInput(value.nativeEvent.text);
                AsyncStorage.setItem('patientSearchValue', value.nativeEvent.text);
                if (value.nativeEvent.text.length > 2) {
                  searchAPI(value.nativeEvent.text);
                }
              }
            }}
            selectionColor={theme.colors.APP_GREEN}
            underlineColorAndroid={theme.colors.TRANSPARENT}
            scrollEnabled={true}
          />
        </View>
      </View>
    );
  };
  const renderDoctorGreeting = () => {
    return (
      <View style={styles.doctorGreetingContainer}>
        <View style={{ flex: 1 }}>
          {!showSearch ? (
            <View>
              <View style={styles.doctornameContainer}>
                <Text style={styles.doctorname}>{`${strings.case_sheet.hello_dr} `}</Text>
                <Text style={styles.doctorname1} numberOfLines={1}>
                  {doctorDetails ? doctorDetails.displayName : ''}
                </Text>
                <Text style={styles.doctorname}>{` :)`}</Text>
              </View>
              <Text style={theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE, 1, 24)}>
                {strings.case_sheet.here_are_all_patients}
              </Text>
            </View>
          ) : (
            renderSearchInput()
          )}
        </View>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (showSearch) {
              if (searchInput.length > 2) {
                searchAPI();
              } else {
                showAphAlert &&
                  showAphAlert({
                    title: strings.common.alert,
                    description: strings.patientsSearch.searchCharLimit,
                  });
              }
            } else {
              setShowSearch(true);
            }
          }}
        >
          <View>
            <SearchIcon />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const ShowAllTypeData = (
    type: patientLogType,
    patientLogSortData: patientLogSort,
    offsetCount = 0,
    name?: string
  ) => {
    if (offsetCount !== totalResultCount || totalResultCount <= 0) {
      if (!showSearch) {
        !offsetCount && setshowSpinner(true);
        offsetCount && setloadMoreSpinner(true);
      } else {
        setSearchSpinner(true);
      }

      client
        .query<getPatientLog, getPatientLogVariables>({
          query: GET_PATIENT_LOG,
          variables: {
            limit: 6,
            offset: offsetCount,
            sortBy: patientLogSortData,
            type: type,
            doctorId: doctorDetails ? doctorDetails.id : null,
            patientName: name ? name : null,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          if (data.getPatientLog) {
            console.log('getPatientLog', data!);
            setAllData(
              offsetCount === 0
                ? data.getPatientLog.patientLog
                : JSON.parse(JSON.stringify(allData)).concat(data.getPatientLog.patientLog)
            );
            setoffset(
              data.getPatientLog.patientLog && allData
                ? data.getPatientLog.patientLog.length + allData.length
                : allData!.length
            );
            settotalResultCount(data.getPatientLog.totalResultCount || 0);
            !offsetCount ? setshowSpinner(false) : setloadMoreSpinner(false);
            setSearchSpinner(false);
          }
        })
        .catch((e) => {
          setshowSpinner(false);
          setSearchSpinner(false);
          const error = JSON.parse(JSON.stringify(e));
          CommonBugFender('PatientLog', error);
          console.log('Error occured while fetching patient log', error);
        });
    }
  };
  const renderSearchText = () => {
    return searchInput && showSearch ? (
      <View style={styles.searchResultTextContainer}>
        <Text style={styles.searchResultText}>
          {strings.patientsSearch.searchResult.replace('{0}', searchInput)}
        </Text>
      </View>
    ) : null;
  };
  const renderItemComponent = (
    item: getPatientLog_getPatientLog_patientLog | null,
    index: number
  ) => {
    const appointmentid =
      (item && (item.appointmentids && item.appointmentids.length > 0 && item.appointmentids[0])) ||
      '';
    const unReadCount =
      item && item.unreadMessagesCount
        ? item.unreadMessagesCount
            .map((i) => {
              return i && i.count && i.appointmentId === appointmentid ? i.count : 0;
            })
            .reduce((a, b) => a + b, 0)
        : 0;
    return item &&
      item.appointmentids &&
      !searchSpinner &&
      !(searchInput.length < 3 && showSearch) ? (
      <View>
        {index === 0 ? renderSearchText() : null}
        <PatientCard
          photoUrl={item.patientInfo ? item.patientInfo.photoUrl || '' : ''}
          containerStyle={
            index === 0 ? (showSearch && searchInput ? { marginTop: 10 } : { marginTop: 30 }) : {}
          }
          doctorname={item.patientInfo!.firstName}
          icon={
            moment(new Date(item.appointmentdatetime))
              .add(6, 'days')
              .startOf('day')
              .isSameOrAfter(moment(new Date()).startOf('day')) && (
              <View style={{ marginRight: 12 }}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    callPermissions(() => {
                      props.navigation.push(AppRoutes.ConsultRoomScreen, {
                        DoctorId: (doctorDetails && doctorDetails.id) || '',
                        PatientId: item.patientid,
                        PatientConsultTime: null,
                        AppId: appointmentid,
                        Appintmentdatetime: item.appointmentdatetime, //getDateFormat(i.appointmentDateTime),
                        // AppointmentStatus: i.status,
                        // AppoinementData: i,
                        activeTabIndex: 1,
                      });
                      if (unReadCount > 0) {
                        markAsRead(appointmentid, (success) => {
                          fetchNotifications();
                        });
                      }
                    });
                  }}
                >
                  {unReadCount > 0 ? (
                    <View style={styles.replyChatCta}>
                      <ChatWhite style={styles.chaticonStyle} />
                      <Text style={styles.replyText}>REPLY</Text>
                    </View>
                  ) : (
                    <View style={styles.chatCta}>
                      <ChatOrange style={styles.chaticonStyle} />
                      <Text style={styles.chatText}>CHAT</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )
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
      </View>
    ) : null;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[theme.viewStyles.container]}>
        <FlatList
          onScroll={_scrolled}
          contentContainerStyle={{ paddingBottom: 20 }}
          removeClippedSubviews={false}
          bounces={false}
          data={allData}
          onEndReachedThreshold={0.5}
          onEndReached={(info) => {
            console.log('onEndReached', info, flatListReady, 'flatListReady');
            flatListReady && ShowAllTypeData(SelectableValue, selectedSorting, offset, searchInput);
          }}
          stickyHeaderIndices={[0]}
          renderItem={({ item, index }) => renderItemComponent(item, index)}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={
            <>
              <CommonNotificationHeader navigation={props.navigation} />
              <View style={{ marginBottom: 0 }}>{renderDoctorGreeting()}</View>
              {renderTabs()}
              {allData && allData.length == 0 && !showSpinner && !showSearch ? (
                <View style={styles.listTextContainer}>
                  <Text style={styles.searchTextStyle}>{strings.common.no_data}</Text>
                </View>
              ) : allData &&
                allData.length == 0 &&
                showSearch &&
                !searchSpinner &&
                searchInput.length > 2 ? (
                <View style={styles.listTextContainer}>
                  <Text style={styles.noRecordText1}>
                    {strings.patientsSearch.noPatientText1}
                    <Text style={styles.noRecordText2}>{` “${searchInput}”. `}</Text>
                    {strings.patientsSearch.noPatientText2}
                  </Text>
                  <View style={styles.searchBackgroundContainer}>
                    <EmptySearch />
                  </View>
                </View>
              ) : null}
              {showSearch && searchSpinner ? (
                <View style={styles.listTextContainer}>
                  <ActivityIndicator animating={true} size="large" color="green" />
                </View>
              ) : null}
              {showSearch && !searchSpinner && searchInput.length < 3 ? (
                <View style={styles.searchTextBodyContainer}>
                  <Text style={styles.searchTextStyle}>{strings.patientsSearch.searchBody}</Text>
                  <View style={styles.searchBackgroundContainer}>
                    <SearchBackground />
                  </View>
                </View>
              ) : null}
            </>
          }
          ListFooterComponent={
            loadMoreSpinner ? (
              <View style={{ marginVertical: 20 }}>
                <ActivityIndicator animating={true} size="small" color="green" />
              </View>
            ) : null
          }
        />
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
                    {strings.case_sheet.sort_by}
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
                        ShowAllTypeData(SelectableValue, obj.key, 0, searchInput);
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
