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
import {
  PhrAllergyIcon,
  PhrMedicalIcon,
  PhrMedicationIcon,
  PhrRestrictionIcon,
  PhrFamilyHistoryIcon,
  PhrSearchIcon,
  SearchDarkPhrIcon,
  HealthConditionPhrSearchIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  g,
  getPrescriptionDate,
  initialSortByDays,
  editDeleteData,
  getSourceName,
  handleGraphQlError,
  phrSortWithDate,
  postCleverTapPHR,
  postWebEngageEvent,
  HEALTH_CONDITIONS_TITLE,
  isValidSearch,
  getPhrHighlightText,
  phrSearchCleverTapEvents,
  postCleverTapIfNewSession,
  removeObjectProperty,
  postCleverTapEvent,
  phrSortByDate,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  deletePatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useApolloClient } from 'react-apollo-hooks';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_medicalConditions_response as MedicalConditionType,
  getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_medications_response as MedicationType,
  getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_healthRestrictions_response as HealthRestrictionType,
  getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_allergies_response as AllergyType,
  getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_familyHistory_response as FamilyHistoryType,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V3';
import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import {
  getPrismAuthTokenVariables,
  getPrismAuthToken,
} from '@aph/mobile-patients/src/graphql/types/getPrismAuthToken';
import { searchPHRApiWithAuthToken } from '@aph/mobile-patients/src/helpers/apiCalls';
import { SearchHealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/SearchHealthRecordCard';
import { GET_PRISM_AUTH_TOKEN } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import moment from 'moment';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import ListEmptyComponent from '@aph/mobile-patients/src/components/HealthRecords/Components/ListEmptyComponent';

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
    ...theme.viewStyles.text('SB', 18, '#02475B', 1, 23.4),
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

export interface HealthConditionScreenProps
  extends NavigationScreenProps<{
    onPressBack: () => void;
    authToken: string;
  }> {}

export const HealthConditionScreen: React.FC<HealthConditionScreenProps> = (props) => {
  const [healthConditionMainData, setHealthConditionMainData] = useState<any>([]);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [localHealthRecordData, setLocalHealthRecordData] = useState<Array<{
    key: string;
    data: any[];
  }> | null>(null);

  const [medicalConditions, setMedicalConditions] = useState<
    (MedicalConditionType | null)[] | null | undefined
  >([]);
  const [medicalHealthRestrictions, setMedicalHealthRestrictions] = useState<
    (HealthRestrictionType | null)[] | null | undefined
  >([]);
  const [medicalMedications, setMedicalMedications] = useState<
    (MedicationType | null)[] | null | undefined
  >([]);
  const [medicalAllergies, setMedicalAllergies] = useState<
    (AllergyType | null)[] | null | undefined
  >([]);
  const [familyHistory, setFamilyHistory] = useState<
    (FamilyHistoryType | null)[] | null | undefined
  >([]);

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
    const healthConditionsArray: any[] = [];
    let mergeArray: { type: string; data: any }[] = [];
    medicalMedications?.forEach((c: any) => {
      mergeArray.push({ type: 'medicalConditions', data: c });
    });
    medicalConditions?.forEach((c: any) => {
      mergeArray.push({ type: 'medications', data: c });
      // medicalConditionsRecord && healthConditionsArray.push(medicalConditionsRecord);
    });
    medicalHealthRestrictions?.forEach((c: any) => {
      mergeArray.push({ type: 'healthRestrictions', data: c });
      // healthRestrictionRecord && healthConditionsArray.push(healthRestrictionRecord);
    });
    medicalAllergies?.forEach((c: any) => {
      mergeArray.push({ type: 'allergies', data: c });
      // allergyRecord && healthConditionsArray.push(allergyRecord);
    });
    familyHistory?.forEach((c: any) => {
      mergeArray.push({ type: 'familyHistory', data: c });
      // familyHistoryRecord && healthConditionsArray.push(familyHistoryRecord);
    });
    const sortedData = phrSortByDate(mergeArray);
    setHealthConditionMainData(sortedData);
  }, [
    medicalConditions,
    medicalHealthRestrictions,
    medicalMedications,
    medicalAllergies,
    familyHistory,
  ]);

  useEffect(() => {
    getLatestHealthConditionRecords();
  }, []);

  useEffect(() => {
    let finalData: { key: string; data: any[] }[] = [];
    finalData = initialSortByDays('health-conditions', healthConditionMainData, finalData);
    setLocalHealthRecordData(finalData);
  }, [healthConditionMainData]);

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
        CommonBugFender('HealthConditionScreen_GET_PRISM_AUTH_TOKEN', e);
      });
  };

  const onSearchHealthRecords = (_searchText: string) => {
    setSearchLoading(true);
    searchPHRApiWithAuthToken(_searchText, prismAuthToken, 'HealthConditions')
      .then(({ data }) => {
        setHealthRecordSearchResults([]);
        if (data?.response) {
          const recordData = data.response;
          const finalData: any[] = [];
          recordData.forEach((_recordData: any) => {
            const { healthrecordType } = _recordData;
            switch (healthrecordType) {
              case 'ALLERGY':
                finalData.push({ healthkey: MedicalRecordType.ALLERGY, value: _recordData });
                break;
              case 'MEDICATION':
                finalData.push({ healthkey: MedicalRecordType.MEDICATION, value: _recordData });
                break;
              case 'MEDICALCONDITION':
                finalData.push({
                  healthkey: MedicalRecordType.MEDICALCONDITION,
                  value: _recordData,
                });
                break;
              case 'RESTRICTION':
                finalData.push({
                  healthkey: MedicalRecordType.HEALTHRESTRICTION,
                  value: _recordData,
                });
                break;
              case 'FAMILYHISTORY':
                finalData.push({ healthkey: MedicalRecordType.FAMILY_HISTORY, value: _recordData });
                break;
            }
          });
          setHealthRecordSearchResults(finalData);
          setSearchLoading(false);
          phrSearchCleverTapEvents(
            CleverTapEventName.PHR_NO_USERS_SEARCHED_LOCAL.replace(
              '{0}',
              'HealthConditions'
            ) as CleverTapEventName,
            currentPatient,
            _searchText
          );
        } else {
          getAuthToken();
          setSearchLoading(false);
        }
      })
      .catch((error) => {
        CommonBugFender('HealthConditionScreen_searchPHRApiWithAuthToken', error);
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
      getLatestHealthConditionRecords();
    }
  }, [callApi]);

  const gotoPHRHomeScreen = () => {
    props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };

  const getLatestHealthConditionRecords = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [
      MedicalRecordType.ALLERGY,
      MedicalRecordType.MEDICATION,
      MedicalRecordType.HEALTHRESTRICTION,
      MedicalRecordType.MEDICALCONDITION,
      MedicalRecordType.FAMILY_HISTORY,
    ])
      .then((data: any) => {
        const medicalCondition = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'medicalConditions',
          'response'
        );
        const medicalHealthRestriction = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'healthRestrictions',
          'response'
        );
        const medicalMedication = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'medications',
          'response'
        );
        const medicalAllergie = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'allergies',
          'response'
        );
        const medicalFamilyHistory = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'familyHistory',
          'response'
        );
        setMedicalConditions(medicalCondition);
        setMedicalHealthRestrictions(medicalHealthRestriction);
        setMedicalMedications(medicalMedication);
        setMedicalAllergies(medicalAllergie);
        setFamilyHistory(medicalFamilyHistory);
        setShowSpinner(false);
      })
      .catch((error) => {
        CommonBugFender('HealthConditionScreen_getPatientPrismMedicalRecordsApi', error);
        setShowSpinner(false);
        setApiError(true);
        currentPatient && handleGraphQlError(error);
      });
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
        title={apiError ? undefined : 'HEALTH CONDITIONS'}
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
        <Text style={{ ...theme.viewStyles.text('SB', 23, '#02475B', 1, 30) }}>
          {'Health Conditions'}
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

  const postWebEngageEventsOnRecordPress = (headerTitle: string, selectedItem: any) => {
    let eventInputData = {};
    switch (headerTitle) {
      case HEALTH_CONDITIONS_TITLE.ALLERGY:
        eventInputData = removeObjectProperty(selectedItem, 'attachmentList');
        postCleverTapIfNewSession(
          'Allergies',
          currentPatient,
          eventInputData,
          phrSession,
          setPhrSession
        );
        break;
      case HEALTH_CONDITIONS_TITLE.MEDICATION:
        postCleverTapIfNewSession(
          'Medications',
          currentPatient,
          selectedItem,
          phrSession,
          setPhrSession
        );
        break;
      case HEALTH_CONDITIONS_TITLE.HEALTH_RESTRICTION:
        postCleverTapIfNewSession(
          'Restrictions',
          currentPatient,
          selectedItem,
          phrSession,
          setPhrSession
        );
        break;
      case HEALTH_CONDITIONS_TITLE.MEDICAL_CONDITION:
        eventInputData = removeObjectProperty(selectedItem, 'medicationFiles');
        postCleverTapIfNewSession(
          'MedicalCondition',
          currentPatient,
          eventInputData,
          phrSession,
          setPhrSession
        );
        break;
      case HEALTH_CONDITIONS_TITLE.FAMILY_HISTORY:
        eventInputData = removeObjectProperty(selectedItem, 'familyHistoryFiles');
        postCleverTapIfNewSession(
          'Family History',
          currentPatient,
          eventInputData,
          phrSession,
          setPhrSession
        );
        break;
    }
  };

  const onHealthCardItemPress = (selectedItem: any) => {
    const headerTitle = selectedItem?.allergyName
      ? HEALTH_CONDITIONS_TITLE.ALLERGY
      : selectedItem?.medicineName
      ? HEALTH_CONDITIONS_TITLE.MEDICATION
      : selectedItem?.restrictionName
      ? HEALTH_CONDITIONS_TITLE.HEALTH_RESTRICTION
      : selectedItem?.medicalConditionName
      ? HEALTH_CONDITIONS_TITLE.MEDICAL_CONDITION
      : selectedItem?.diseaseName
      ? HEALTH_CONDITIONS_TITLE.FAMILY_HISTORY
      : '';
    postWebEngageEventsOnRecordPress(headerTitle, selectedItem);
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      healthCondition: true,
      healthHeaderTitle: headerTitle,
    });
  };

  const healthConditionDeleteWebEngageEvents = (
    recordType: MedicalRecordType,
    selectedItem: any
  ) => {
    if (recordType === MedicalRecordType.ALLERGY) {
      const eventInputData = removeObjectProperty(selectedItem, 'attachmentList');
      postCleverTapPHR(
        currentPatient,
        CleverTapEventName.PHR_DELETE_ALLERGY,
        'Allergy',
        eventInputData
      );
    } else if (recordType === MedicalRecordType.MEDICATION) {
      postCleverTapPHR(
        currentPatient,
        CleverTapEventName.PHR_DELETE_MEDICATION,
        'Medication',
        selectedItem
      );
    } else if (recordType === MedicalRecordType.HEALTHRESTRICTION) {
      postCleverTapPHR(
        currentPatient,
        CleverTapEventName.PHR_DELETE_HEALTH_RESTRICTIONS,
        'Health Restriction',
        selectedItem
      );
    } else if (recordType === MedicalRecordType.MEDICALCONDITION) {
      const eventInputData = removeObjectProperty(selectedItem, 'medicationFiles');
      postCleverTapPHR(
        currentPatient,
        CleverTapEventName.PHR_DELETE_MEDICAL_CONDITION,
        'Medical Condition',
        eventInputData
      );
    } else if (recordType === MedicalRecordType.FAMILY_HISTORY) {
      const eventInputData = removeObjectProperty(selectedItem, 'familyHistoryFiles');
      postCleverTapPHR(
        currentPatient,
        CleverTapEventName.PHR_DELETE_FAMILY_HISTORY,
        'Family History',
        eventInputData
      );
    }
  };

  const onPressDeletePrismMedicalRecords = (selectedItem: any) => {
    const recordType: MedicalRecordType = selectedItem?.allergyName
      ? MedicalRecordType.ALLERGY
      : selectedItem?.medicineName
      ? MedicalRecordType.MEDICATION
      : selectedItem?.restrictionName
      ? MedicalRecordType.HEALTHRESTRICTION
      : selectedItem?.diseaseName
      ? MedicalRecordType.FAMILY_HISTORY
      : MedicalRecordType.MEDICALCONDITION;
    setShowSpinner(true);
    deletePatientPrismMedicalRecords(client, selectedItem?.id, currentPatient?.id || '', recordType)
      .then((status) => {
        if (status) {
          getLatestHealthConditionRecords();
          healthConditionDeleteWebEngageEvents(recordType, selectedItem);
        } else {
          setShowSpinner(false);
        }
      })
      .catch((error) => {
        CommonBugFender('HealthConditionScreen_deletePatientPrismMedicalRecords', error);
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const onPressEditPrismMedicalRecords = (selectedItem: any) => {
    const recordType: MedicalRecordType = selectedItem?.allergyName
      ? MedicalRecordType.ALLERGY
      : selectedItem?.medicineName
      ? MedicalRecordType.MEDICATION
      : selectedItem?.restrictionName
      ? MedicalRecordType.HEALTHRESTRICTION
      : selectedItem?.diseaseName
      ? MedicalRecordType.FAMILY_HISTORY
      : MedicalRecordType.MEDICALCONDITION;
    setCallApi(false);
    props.navigation.navigate(AppRoutes.AddRecord, {
      navigatedFrom: 'HealthCondition',
      recordType: recordType,
      selectedRecordID: selectedItem?.id,
      selectedRecord: selectedItem,
      onRecordAdded: onRecordAdded,
    });
  };

  const renderHealthConditionItems = (item: any, index: number) => {
    console.log(item, 'renderHealthConditionItems');
    const renderHealthConditionTopView = () => {
      const getHealthConditionTypeIcon = () => {
        return item?.data?.allergyName ? (
          <PhrAllergyIcon style={{ width: 11.85, height: 13.14, marginRight: 10.5 }} />
        ) : item?.data?.medicineName ? (
          <PhrMedicationIcon style={{ width: 12.82, height: 13.14, marginRight: 9.8 }} />
        ) : item?.data?.restrictionName ? (
          <PhrRestrictionIcon style={{ width: 14, height: 14, marginRight: 9 }} />
        ) : item?.data?.medicalConditionName ? (
          <PhrMedicalIcon style={{ width: 14, height: 14.03, marginRight: 8 }} />
        ) : item?.data?.diseaseName ? (
          <PhrFamilyHistoryIcon style={{ width: 14, height: 17.14, marginRight: 9 }} />
        ) : null;
      };
      const getHealthConditionTypeTitle = item?.data?.allergyName
        ? 'Allergies'
        : item?.data?.medicineName
        ? 'Medications'
        : item?.data?.restrictionName
        ? 'Health Restrictions'
        : item?.data?.medicalConditionName
        ? 'Medical Conditions'
        : item?.data?.diseaseName
        ? 'Family History'
        : '';
      return (
        <View style={{ marginBottom: 5, flexDirection: 'row', alignItems: 'center' }}>
          {getHealthConditionTypeIcon()}
          <Text style={{ ...theme.viewStyles.text('M', 12, '#00B38E', 1, 15.6) }}>
            {getHealthConditionTypeTitle}
          </Text>
        </View>
      );
    };
    const prescriptionName =
      item?.data?.allergyName ||
      item?.data?.medicineName ||
      item?.data?.restrictionName ||
      item?.data?.medicalConditionName ||
      item?.data?.diseaseName ||
      '';
    const dateText = getPrescriptionDate(item?.data?.startDateTime || item?.data?.recordDateTime);
    const soureName = getSourceName(item?.data?.source) || '-';
    const selfUpload = true;
    const showEditDeleteOption =
      soureName === string.common.clicnical_document_text || soureName === '-' ? true : false;
    const familyMember = _.capitalize(item?.data?.familyMember) || '';
    const realItem = item?.data;
    return (
      <HealthRecordCard
        item={realItem}
        index={index}
        editDeleteData={editDeleteData(MedicalRecordType.ALLERGY)}
        showUpdateDeleteOption={showEditDeleteOption}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
        onDeletePress={(selectedItem) => onPressDeletePrismMedicalRecords(selectedItem)}
        onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
        prescriptionName={prescriptionName}
        dateText={dateText}
        selfUpload={selfUpload}
        familyMember={familyMember}
        sourceName={soureName || ''}
        healthConditionCard
        healthCondtionCardTopView={renderHealthConditionTopView()}
        deleteRecordText={'health condition'}
      />
    );
  };

  const renderHealthCondtionsData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localHealthRecordData || []}
        renderItem={({ item, index }) => renderHealthConditionItems(item, index)}
        ListEmptyComponent={ListEmptyComponent.getEmptyListComponent(showSpinner, apiError)}
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
          title={string.common.addHealthConditionText}
          onPress={() => {
            setCallApi(false);
            const eventAttributes: CleverTapEvents[CleverTapEventName.ADD_RECORD] = {
              Source: 'Health Condition',
            };
            postWebEngageEvent(CleverTapEventName.ADD_RECORD, eventAttributes);
            postCleverTapEvent(CleverTapEventName.ADD_RECORD, eventAttributes);
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'HealthCondition',
              recordType: MedicalRecordType.MEDICALCONDITION,
              onRecordAdded: onRecordAdded,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const renderSearchBar = () => {
    return (
      <View style={styles.searchBarMainView}>
        <View style={styles.searchBarMainViewStyle}>
          <View style={styles.searchBarViewStyle}>
            <PhrSearchIcon style={{ width: 20, height: 20 }} />
            <TextInput
              placeholder={'Search health conditions'}
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
    switch (item?.healthkey) {
      case MedicalRecordType.ALLERGY:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.ALLERGY,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.ALLERGY,
        });
      case MedicalRecordType.MEDICATION:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.MEDICATION,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.MEDICATION,
        });
      case MedicalRecordType.HEALTHRESTRICTION:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.HEALTHRESTRICTION,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.HEALTH_RESTRICTION,
        });
      case MedicalRecordType.MEDICALCONDITION:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.MEDICALCONDITION,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.MEDICAL_CONDITION,
        });
      case MedicalRecordType.FAMILY_HISTORY:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.FAMILY_HISTORY,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.FAMILY_HISTORY,
        });
    }
  };

  const renderHealthRecordSearchItem = (item: any, index: number) => {
    const healthCardTopView = () => {
      switch (item?.healthkey) {
        case MedicalRecordType.ALLERGY:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Allergies'}
              </Text>
            </View>
          );
        case MedicalRecordType.MEDICATION:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Medications'}
              </Text>
            </View>
          );
        case MedicalRecordType.HEALTHRESTRICTION:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Health Restrictions'}
              </Text>
            </View>
          );
        case MedicalRecordType.MEDICALCONDITION:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Medical Conditions'}
              </Text>
            </View>
          );
        case MedicalRecordType.FAMILY_HISTORY:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Family History'}
              </Text>
            </View>
          );
      }
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

  const renderHealthConditionMainView = () => {
    return (
      <>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderHealthCondtionsData()}
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
        {healthConditionMainData?.length > 0
          ? showSearchBar
            ? renderSearchBar()
            : renderSearchAndFilterView()
          : null}
        {searchText?.length > 2
          ? renderHealthRecordSearchResults()
          : renderHealthConditionMainView()}
      </SafeAreaView>
    </View>
  );
};
