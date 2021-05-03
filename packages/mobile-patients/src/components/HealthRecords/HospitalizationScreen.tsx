import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SectionList,
  BackHandler,
  Keyboard,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_hospitalizations_response as HospitalizationType } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V2';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  g,
  postWebEngageEvent,
  initialSortByDays,
  editDeleteData,
  handleGraphQlError,
  phrSortWithDate,
  postWebEngagePHR,
  isValidSearch,
  getPhrHighlightText,
  phrSearchWebEngageEvents,
  postWebEngageIfNewSession,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  deletePatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  getPrismAuthTokenVariables,
  getPrismAuthToken,
} from '@aph/mobile-patients/src/graphql/types/getPrismAuthToken';
import { searchPHRApiWithAuthToken } from '@aph/mobile-patients/src/helpers/apiCalls';
import { SearchHealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/SearchHealthRecordCard';
import { GET_PRISM_AUTH_TOKEN } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  PhrSearchIcon,
  SearchDarkPhrIcon,
  HospitalPhrSearchIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

const styles = StyleSheet.create({
  searchFilterViewStyle: {
    marginHorizontal: 20,
    marginVertical: 22,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  itemTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
    paddingHorizontal: 0,
  },
  selectedTextStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
  },
  sectionHeaderTitleStyle: {
    ...theme.viewStyles.text('SB', 18, theme.colors.LIGHT_BLUE, 1, 23.4),
    marginBottom: 3,
  },
  searchBarMainViewStyle: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 22,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  searchBarViewStyle: {
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    padding: 10,
    flex: 1,
    alignItems: 'center',
    borderRadius: 5,
  },
  cancelTextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SKY_BLUE, 1, 15.6),
    marginLeft: 18,
  },
  textInputStyle: {
    ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE, 1, 18),
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 1,
  },
  loaderViewStyle: { justifyContent: 'center', flex: 1, alignItems: 'center' },
  loaderStyle: { height: 100, backgroundColor: 'transparent', alignSelf: 'center' },
  healthRecordTypeTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SILVER_LIGHT, 1, 21),
    marginHorizontal: 13,
  },
  healthRecordTypeViewStyle: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchListHeaderViewStyle: { marginHorizontal: 17, marginVertical: 15 },
  searchListHeaderTextStyle: { ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 21) },
  phrNodataMainViewStyle: { marginTop: 59, backgroundColor: 'transparent' },
  searchBarMainView: { flexDirection: 'row', alignItems: 'center' },
});

export interface HospitalizationScreenProps
  extends NavigationScreenProps<{
    onPressBack: () => void;
    authToken: string;
  }> {}

export const HospitalizationScreen: React.FC<HospitalizationScreenProps> = (props) => {
  const [hospitalizationMainData, setHospitalizationMainData] = useState<any>([]);
  const [localHospitalizationData, setLocalHospitalizationData] = useState<Array<{
    key: string;
    data: HospitalizationType[];
  }> | null>(null);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [callApi, setCallApi] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [isSearchFocus, SetIsSearchFocus] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchInputFocus, setSearchInputFocus] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const _searchInputRef = useRef(null);
  const [healthRecordSearchResults, setHealthRecordSearchResults] = useState<any>([]);
  const [prismAuthToken, setPrismAuthToken] = useState<string>(
    props.navigation?.getParam('authToken') || ''
  );
  const [searchQuery, setSearchQuery] = useState({});
  const { phrSession, setPhrSession } = useAppCommonData();

  useEffect(() => {
    getLatestHospitalizationRecords();
  }, []);

  useEffect(() => {
    let finalData: { key: string; data: HospitalizationType[] }[] = [];
    finalData = initialSortByDays('hospitalizations', hospitalizationMainData, finalData);
    setLocalHospitalizationData(finalData);
  }, [hospitalizationMainData]);

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    gotoPHRHomeScreen();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [callApi]);

  const getAuthToken = async () => {
    client
      .query<getPrismAuthToken, getPrismAuthTokenVariables>({
        query: GET_PRISM_AUTH_TOKEN,
        fetchPolicy: 'no-cache',
        variables: {
          uhid: currentPatient?.uhid || '',
        },
      })
      .then(({ data }) => {
        const prism_auth_token = g(data, 'getPrismAuthToken', 'response');
        if (prism_auth_token) {
          setPrismAuthToken(prism_auth_token);
        }
      })
      .catch((e) => {
        CommonBugFender('HospitalizationScreen_GET_PRISM_AUTH_TOKEN', e);
      });
  };

  const onSearchHealthRecords = (_searchText: string) => {
    setSearchLoading(true);
    searchPHRApiWithAuthToken(_searchText, prismAuthToken, 'Hospitalization')
      .then(({ data }) => {
        setHealthRecordSearchResults([]);
        if (data?.response) {
          const recordData = data.response;
          const finalData: any[] = [];
          recordData.forEach((_recordData: any) => {
            const { healthrecordType } = _recordData;
            if (healthrecordType === 'HOSPITALIZATION') {
              finalData.push({ healthkey: MedicalRecordType.HOSPITALIZATION, value: _recordData });
            }
          });
          setHealthRecordSearchResults(finalData);
          setSearchLoading(false);
          phrSearchWebEngageEvents(
            WebEngageEventName.PHR_NO_USERS_SEARCHED_LOCAL.replace(
              '{0}',
              'Hospitalizations'
            ) as WebEngageEventName,
            currentPatient,
            _searchText
          );
        } else {
          getAuthToken();
          setSearchLoading(false);
        }
      })
      .catch((error) => {
        CommonBugFender('HospitalizationScreen_searchPHRApiWithAuthToken', error);
        getAuthToken();
        setSearchLoading(false);
      });
  };

  const onSearchTextChange = (value: string) => {
    SetIsSearchFocus(true);
    if (isValidSearch(value)) {
      setSearchText(value);
      if (!(value && value.length > 2)) {
        setHealthRecordSearchResults([]);
        return;
      }
      setSearchLoading(true);
      const search = _.debounce(onSearchHealthRecords, 500);
      setSearchQuery((prevSearch: any) => {
        if (prevSearch.cancel) {
          prevSearch.cancel();
        }
        return search;
      });
      search(value);
    }
  };

  const onCancelTextClick = () => {
    if (_searchInputRef.current) {
      setSearchText('');
      SetIsSearchFocus(false);
      setShowSearchBar(false);
      _searchInputRef?.current?.clear();
      setHealthRecordSearchResults([]);
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    if (callApi) {
      getLatestHospitalizationRecords();
    }
  }, [callApi]);

  const gotoPHRHomeScreen = () => {
    props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };

  const renderProfileImage = () => {
    return (
      <ProfileImageComponent
        onPressProfileImage={gotoPHRHomeScreen}
        currentPatient={currentPatient}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        title={apiError ? undefined : 'HOSPITALIZATION'}
        leftIcon={'backArrow'}
        rightComponent={apiError ? undefined : renderProfileImage()}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={gotoPHRHomeScreen}
      />
    );
  };

  const renderSearchAndFilterView = () => {
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, theme.colors.LIGHT_BLUE, 1, 30) }}>
          {'Hospitalization'}
        </Text>
        <View style={styles.searchBarMainView}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setShowSearchBar(true);
              setSearchInputFocus(true);
            }}
            style={{ paddingLeft: 11 }}
          >
            <SearchDarkPhrIcon style={{ width: 17.49, height: 17.49 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const onHealthCardItemPress = (selectedItem: HospitalizationType) => {
    postWebEngageIfNewSession(
      'Hospitalization',
      currentPatient,
      selectedItem,
      phrSession,
      setPhrSession
    );
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      hospitalization: true,
    });
  };

  const getLatestHospitalizationRecords = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [
      MedicalRecordType.HOSPITALIZATION,
    ])
      .then((data: any) => {
        const hospitalizationsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'hospitalizations',
          'response'
        );
        setHospitalizationMainData(phrSortWithDate(hospitalizationsData));
        setShowSpinner(false);
      })
      .catch((error) => {
        CommonBugFender('HospitalizationScreen_getPatientPrismMedicalRecordsApi', error);
        setShowSpinner(false);
        setApiError(true);
        currentPatient && handleGraphQlError(error);
      });
  };

  const onPressDeletePrismMedicalRecords = (selectedItem: any) => {
    setShowSpinner(true);
    deletePatientPrismMedicalRecords(
      client,
      selectedItem?.id,
      currentPatient?.id || '',
      MedicalRecordType.HOSPITALIZATION
    )
      .then((status) => {
        if (status) {
          getLatestHospitalizationRecords();
          postWebEngagePHR(
            currentPatient,
            WebEngageEventName.PHR_DELETE_HOSPITALIZATIONS,
            'Hospitalization',
            selectedItem
          );
        } else {
          setShowSpinner(false);
        }
      })
      .catch((error) => {
        CommonBugFender('HospitalizationScreen_deletePatientPrismMedicalRecords', error);
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const onPressEditPrismMedicalRecords = (selectedItem: any) => {
    setCallApi(false);
    props.navigation.navigate(AppRoutes.AddRecord, {
      navigatedFrom: 'Hospitalization',
      recordType: MedicalRecordType.HOSPITALIZATION,
      selectedRecordID: selectedItem?.id,
      selectedRecord: selectedItem,
      onRecordAdded: onRecordAdded,
    });
  };

  const renderHospitalizationItems = (item: HospitalizationType, index: number) => {
    const getSourceName = (source: string) => {
      return source === 'self' || source === '247self'
        ? string.common.clicnical_document_text
        : source;
    };
    const prescriptionName = 'Dr. ' + item?.doctorName;
    const dateText =
      item?.dateOfHospitalization && item?.date
        ? `${moment(item?.dateOfHospitalization).format('DD MMM, YYYY')} - ${moment(
            item?.date
          ).format('DD MMM, YYYY')}`
        : moment(item?.date).format('DD MMM YYYY');
    const soureName = getSourceName(item?.source!) || '-';
    const selfUpload = true;
    const showEditDeleteOption =
      getSourceName(item?.source!) === string.common.clicnical_document_text ||
      getSourceName(item?.source!) === '-'
        ? true
        : false;
    return (
      <HealthRecordCard
        item={item}
        index={index}
        editDeleteData={editDeleteData(MedicalRecordType.HOSPITALIZATION)}
        showUpdateDeleteOption={showEditDeleteOption}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
        onDeletePress={(selectedItem) => onPressDeletePrismMedicalRecords(selectedItem)}
        onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
        prescriptionName={prescriptionName}
        dateText={dateText}
        selfUpload={selfUpload}
        sourceName={soureName || ''}
        deleteRecordText={'discharge summary'}
      />
    );
  };

  const renderSearchBar = () => {
    return (
      <View style={styles.searchBarMainView}>
        <View style={styles.searchBarMainViewStyle}>
          <View style={styles.searchBarViewStyle}>
            <PhrSearchIcon style={{ width: 20, height: 20 }} />
            <TextInput
              placeholder={'Search hospitalization'}
              autoCapitalize={'none'}
              autoFocus={searchInputFocus}
              style={styles.textInputStyle}
              selectionColor={theme.colors.TURQUOISE_LIGHT_BLUE}
              numberOfLines={1}
              ref={_searchInputRef}
              onFocus={() => SetIsSearchFocus(true)}
              value={searchText}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(value) => onSearchTextChange(value)}
            />
          </View>
          {isSearchFocus ? (
            <Text style={styles.cancelTextStyle} onPress={onCancelTextClick}>
              {'Cancel'}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderSearchLoader = () => {
    return (
      <View style={styles.loaderViewStyle}>
        <Spinner style={styles.loaderStyle} />
      </View>
    );
  };

  const searchListHeaderView = () => {
    const search_result_text =
      healthRecordSearchResults?.length === 1
        ? `${healthRecordSearchResults?.length} search result for \‘${searchText}\’`
        : `${healthRecordSearchResults?.length} search results for \‘${searchText}\’`;
    return (
      <View style={styles.searchListHeaderViewStyle}>
        <Text style={styles.searchListHeaderTextStyle}>{search_result_text}</Text>
      </View>
    );
  };

  const onClickSearchHealthCard = (item: any) => {
    const { healthrecordId } = item?.value;
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      healthrecordId: healthrecordId,
      healthRecordType: MedicalRecordType.HOSPITALIZATION,
      hospitalization: true,
    });
  };

  const renderHealthRecordSearchItem = (item: any, index: number) => {
    const healthCardTopView = () => {
      return (
        <View style={styles.healthRecordTypeViewStyle}>
          <HospitalPhrSearchIcon style={{ width: 13, height: 15.17 }} />
          <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
            {'Hospitalizations'}
          </Text>
        </View>
      );
    };
    const dateText = `${moment(item?.value?.date).format('DD MMM YYYY')} - `;
    const healthMoreText = getPhrHighlightText(item?.value?.highlight || '');
    return (
      <SearchHealthRecordCard
        dateText={dateText}
        healthRecordTitle={item?.value?.title}
        healthRecordMoreText={healthMoreText}
        searchHealthCardTopView={healthCardTopView()}
        item={item}
        index={index}
        onSearchHealthCardPress={(item) => onClickSearchHealthCard(item)}
      />
    );
  };

  const renderHealthRecordSearchResults = () => {
    return searchLoading ? (
      renderSearchLoader()
    ) : (
      <FlatList
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        data={healthRecordSearchResults}
        ListEmptyComponent={
          <PhrNoDataComponent mainViewStyle={styles.phrNodataMainViewStyle} phrSearchList />
        }
        ListHeaderComponent={searchListHeaderView}
        renderItem={({ item, index }) => renderHealthRecordSearchItem(item, index)}
      />
    );
  };

  const emptyListView = () => {
    return apiError ? (
      <PhrNoDataComponent noDataText={string.common.phr_api_error_text} phrErrorIcon />
    ) : (
      <PhrNoDataComponent />
    );
  };

  const renderHospitalizationData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localHospitalizationData || []}
        renderItem={({ item, index }) => renderHospitalizationItems(item, index)}
        ListEmptyComponent={emptyListView}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
      />
    );
  };

  const onRecordAdded = () => {
    setCallApi(true);
  };

  const renderAddButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={string.common.addDischargeSummaryText}
          onPress={() => {
            setCallApi(false);
            const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
              Source: 'Hospitalization',
            };
            postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'Hospitalization',
              recordType: MedicalRecordType.HOSPITALIZATION,
              onRecordAdded: onRecordAdded,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderHospitalizationMainView = () => {
    return (
      <>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderHospitalizationData()}
        </ScrollView>
        {!apiError && renderAddButton()}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {hospitalizationMainData?.length > 0
          ? showSearchBar
            ? renderSearchBar()
            : renderSearchAndFilterView()
          : null}
        {searchText?.length > 2
          ? renderHealthRecordSearchResults()
          : renderHospitalizationMainView()}
      </SafeAreaView>
    </View>
  );
};
