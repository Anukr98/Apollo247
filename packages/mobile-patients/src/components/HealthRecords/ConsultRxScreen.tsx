import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  SectionList,
  Dimensions,
  BackHandler,
  TextInput,
  Keyboard,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  Filter,
  SearchDarkPhrIcon,
  PhrSearchIcon,
  PrescriptionPhrSearchIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CHECK_IF_FOLLOWUP_BOOKED,
  GET_PRISM_AUTH_TOKEN,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { checkIfFollowUpBooked } from '@aph/mobile-patients/src/graphql/types/checkIfFollowUpBooked';
import { getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription } from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import {
  g,
  handleGraphQlError,
  postWebEngageEvent,
  addTestsToCart,
  doRequestAndAccessLocation,
  initialSortByDays,
  editDeleteData,
  getSourceName,
  phrSortByDate,
  postCleverTapPHR,
  isValidSearch,
  getPhrHighlightText,
  phrSearchCleverTapEvents,
  postCleverTapEvent,
  postCleverTapIfNewSession,
  removeObjectProperty,
  getIsMedicine,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  EPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosticPrescription } from '@aph/mobile-patients/src/graphql/types/getSDLatestCompletedCaseSheet';
import {
  MEDICINE_UNIT,
  MEDICINE_CONSUMPTION_DURATION,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  useDiagnosticsCart,
  DiagnosticsCartItem,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  getMedicineDetailsApi,
  searchPHRApiWithAuthToken,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  getPrismAuthTokenVariables,
  getPrismAuthToken,
} from '@aph/mobile-patients/src/graphql/types/getPrismAuthToken';
import {
  useAppCommonData,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  deletePatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V2';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import moment from 'moment';
import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { SearchHealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/SearchHealthRecordCard';
import { DiagnosticAddToCartEvent } from '@aph/mobile-patients/src/components/Tests/Events';
import { DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE } from '@aph/mobile-patients/src/utils/commonUtils';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  searchFilterViewStyle: {
    marginHorizontal: 20,
    marginVertical: 22,
    marginBottom: 3,
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
  doctorConsultPHRTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SKY_BLUE, 1, 14),
    marginLeft: 20,
    marginBottom: 10,
    marginRight: 32,
    marginTop: 2,
  },
});

export enum FILTER_TYPE {
  SORT_BY = 'Sort by',
  NAME = 'Name',
  DATE = 'Date',
  DOCTOR_NAME = 'Doctor Name',
}

type FilterArray = {
  key: FILTER_TYPE;
  title: string;
};

const ConsultRxFilterArray: FilterArray[] = [
  { key: FILTER_TYPE.SORT_BY, title: FILTER_TYPE.SORT_BY },
  { key: FILTER_TYPE.NAME, title: FILTER_TYPE.NAME },
  { key: FILTER_TYPE.DATE, title: FILTER_TYPE.DATE },
  { key: FILTER_TYPE.DOCTOR_NAME, title: FILTER_TYPE.DOCTOR_NAME },
];

export interface ConsultRxScreenProps
  extends NavigationScreenProps<{
    consultArray: any[];
    prescriptionArray: any[];
    onPressBack: () => void;
    authToken: string;
    callPrescriptionsApi: () => void;
  }> {}

export const ConsultRxScreen: React.FC<ConsultRxScreenProps> = (props) => {
  const [consultRxMainData, setConsultRxMainData] = useState<any>([]);
  const { currentPatient } = useAllCurrentPatients();
  const [filterApplied, setFilterApplied] = useState<FILTER_TYPE | string>('');
  const client = useApolloClient();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [localConsultRxData, setLocalConsultRxData] = useState<Array<{
    key: string;
    data: any[];
  }> | null>(null);
  const { setLoading: setGlobalLoading } = useUIElements();
  const { addMultipleCartItems, setEPrescriptions, ePrescriptions } = useShoppingCart();
  const { locationDetails, setLocationDetails, phrSession, setPhrSession } = useAppCommonData();
  const {
    addMultipleCartItems: addMultipleTestCartItems,
    addMultipleEPrescriptions: addMultipleTestEPrescriptions,
  } = useDiagnosticsCart();
  const [prescriptions, setPrescriptions] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response | null)[]
    | null
    | undefined
  >(props.navigation?.getParam('prescriptionArray') || []);
  const [consultArray, setConsultArray] = useState<any>(
    props.navigation?.getParam('consultArray') || []
  );
  const [callApi, setCallApi] = useState(false);
  const [callPhrMainApi, setCallPhrMainApi] = useState(false);
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

  const doctorType = (item: any) => {
    return item?.caseSheet?.find((obj: any) => {
      return obj.doctorType !== 'JUNIOR';
    });
  };

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    gotoPHRHomeScreen();
    return true;
  };

  useEffect(() => {
    if (consultArray?.length > 0 || (prescriptions && prescriptions?.length > 0)) {
      let mergeArray: { type: string; data: any }[] = [];
      consultArray?.forEach((item: any) => {
        item['myPrescriptionName'] = 'Prescription';
        mergeArray.push({ type: 'pastConsults', data: item });
      });
      prescriptions?.forEach((c) => {
        mergeArray.push({ type: 'prescriptions', data: c });
      });
      setConsultRxMainData(phrSortByDate(mergeArray));
    }
  }, [consultArray, prescriptions]);

  useEffect(() => {
    if (callApi) {
      getLatestPrescriptionRecords();
    }
  }, [callApi]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [callApi, callPhrMainApi]);

  useEffect(() => {
    const filteredData = sortByTypeRecords(filterApplied);
    if (filteredData) {
      let finalData: { key: string; data: any[] }[] = [];
      if (filterApplied) {
        const filterAppliedString =
          filterApplied === FILTER_TYPE.DATE
            ? 'date'
            : filterApplied === FILTER_TYPE.DOCTOR_NAME
            ? 'prescribedBy'
            : 'prescriptionName';
        filteredData.forEach((dataObject: any) => {
          const dataObjectArray: any[] = [];
          const dateExistsAt = finalData.findIndex((data: { key: string; data: any[] }) => {
            if (filterApplied === FILTER_TYPE.DOCTOR_NAME) {
              return (
                data.key ===
                (dataObject.data?.patientId
                  ? dataObject.data?.doctorInfo?.displayName || '-'
                  : dataObject.data?.prescribedBy || '-')
              );
            } else if (filterApplied === FILTER_TYPE.NAME) {
              return (
                data.key ===
                (dataObject.data?.patientId
                  ? dataObject.data?.myPrescriptionName
                  : dataObject.data?.prescriptionName)
              );
            } else if (filterApplied === FILTER_TYPE.DATE) {
              return (
                data.key ===
                (dataObject.data?.patientId
                  ? moment(new Date(dataObject.data?.appointmentDateTime)).format('DD MMM YYYY')
                  : moment(new Date(dataObject.data?.date)).format('DD MMM YYYY'))
              );
            }
          });
          if (dateExistsAt === -1 || finalData.length === 0) {
            dataObjectArray.push(dataObject);
            const obj = {
              key: dataObject.data?.patientId
                ? filterApplied === FILTER_TYPE.DATE
                  ? moment(new Date(dataObject.data?.appointmentDateTime)).format('DD MMM YYYY')
                  : filterApplied === FILTER_TYPE.DOCTOR_NAME
                  ? (dataObject.data?.doctorInfo && dataObject.data?.doctorInfo?.displayName) || '-'
                  : dataObject.data?.myPrescriptionName
                : filterApplied === FILTER_TYPE.DATE
                ? moment(new Date(dataObject.data[filterAppliedString])).format('DD MMM YYYY')
                : dataObject.data[filterAppliedString],
              data: dataObjectArray,
            };
            finalData.push(obj);
          } else {
            const array = finalData[dateExistsAt].data;
            array.push(dataObject);
            finalData[dateExistsAt].data = array;
          }
        });
      } else {
        // render when no filter is applied
        finalData = initialSortByDays('consults', filteredData, finalData);
      }
      setLocalConsultRxData(finalData);
    }
  }, [filterApplied, consultRxMainData]);

  const getLatestPrescriptionRecords = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [MedicalRecordType.PRESCRIPTION])
      .then((data: any) => {
        const prescriptionsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'prescriptions',
          'response'
        );
        setPrescriptions(prescriptionsData);
        setShowSpinner(false);
        setCallPhrMainApi(true);
      })
      .catch((error) => {
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

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
        CommonBugFender('DoctorConsultation_GET_PRISM_AUTH_TOKEN', e);
      });
  };

  const sortByTypeRecords = (type: FILTER_TYPE | string) => {
    return consultRxMainData?.sort(({ data: data1 }, { data: data2 }) => {
      const filteredData1 =
        type === FILTER_TYPE.NAME
          ? data1?.patientId
            ? _.lowerCase(data1?.myPrescriptionName)
            : _.lowerCase(data1?.prescriptionName)
          : type === FILTER_TYPE.DOCTOR_NAME
          ? data1?.patientId
            ? _.lowerCase(data1?.doctorInfo?.displayName)
            : _.lowerCase(data1?.prescribedBy)
          : data1?.patientId
          ? moment(data1?.appointmentDateTime)
              .toDate()
              .getTime()
          : moment(data1?.date)
              .toDate()
              .getTime();
      const filteredData2 =
        type === FILTER_TYPE.NAME
          ? data2?.patientId
            ? _.lowerCase(data2?.myPrescriptionName)
            : _.lowerCase(data2?.prescriptionName)
          : type === FILTER_TYPE.DOCTOR_NAME
          ? data2?.patientId
            ? _.lowerCase(data2?.doctorInfo?.displayName)
            : _.lowerCase(data2?.prescribedBy)
          : data2?.patientId
          ? moment(data2?.appointmentDateTime)
              .toDate()
              .getTime()
          : moment(data2?.date)
              .toDate()
              .getTime();
      if (type === FILTER_TYPE.DATE || !type) {
        return filteredData1 > filteredData2 ? -1 : filteredData1 < filteredData2 ? 1 : 0;
      }
      return filteredData2 > filteredData1 ? -1 : filteredData2 < filteredData1 ? 1 : 0;
    });
  };

  const gotoPHRHomeScreen = () => {
    if (!callApi && !callPhrMainApi) {
      props.navigation.state.params?.onPressBack();
    } else {
      props.navigation.state.params?.onPressBack();
      props.navigation.state.params?.callPrescriptionsApi();
    }
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
        title={'DOCTOR CONSULTATIONS'}
        leftIcon={'backArrow'}
        rightComponent={renderProfileImage()}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={gotoPHRHomeScreen}
      />
    );
  };

  const onSearchHealthRecords = (_searchText: string) => {
    setSearchLoading(true);
    searchPHRApiWithAuthToken(_searchText, prismAuthToken, 'Prescription')
      .then(({ data }) => {
        setHealthRecordSearchResults([]);
        if (data?.response) {
          const recordData = data.response;
          const finalData: any[] = [];
          recordData.forEach((recordData: any) => {
            const { healthrecordType } = recordData;
            if (healthrecordType === 'PRESCRIPTION') {
              finalData.push({ healthkey: MedicalRecordType.PRESCRIPTION, value: recordData });
            }
          });
          setHealthRecordSearchResults(finalData);
          setSearchLoading(false);
          phrSearchCleverTapEvents(
            CleverTapEventName.PHR_NO_USERS_SEARCHED_LOCAL.replace(
              '{0}',
              'Doctor Consultations'
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
        CommonBugFender('DoctorConsultation__searchPHRApiWithAuthToken', error);
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

  const renderSearchBar = () => {
    return (
      <View style={styles.searchBarMainView}>
        <View style={styles.searchBarMainViewStyle}>
          <View style={styles.searchBarViewStyle}>
            <PhrSearchIcon style={{ width: 20, height: 20 }} />
            <TextInput
              placeholder={'Search doctor consulations'}
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
          {searchText?.length > 2 ? null : renderFilterView()}
        </View>
      </View>
    );
  };

  const renderSearchAndFilterView = () => {
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, theme.colors.LIGHT_BLUE, 1, 30) }}>
          {'Doctor Consultations'}
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
          {renderFilterView()}
        </View>
      </View>
    );
  };

  const renderFilterView = () => {
    const testFilterData = ConsultRxFilterArray.map((i) => {
      return { key: i.key, value: i.title };
    });
    return (
      <MaterialMenu
        options={testFilterData}
        selectedText={filterApplied}
        menuContainerStyle={styles.menuContainerStyle}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: 260 / 2 }}
        itemTextStyle={styles.itemTextStyle}
        firstOptionText={true}
        selectedTextStyle={styles.selectedTextStyle}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        bottomPadding={{ paddingBottom: 0 }}
        onPress={(selectedFilter) => {
          if (selectedFilter.key !== FILTER_TYPE.SORT_BY) {
            setFilterApplied(selectedFilter.key);
          }
        }}
      >
        <View style={{ paddingLeft: 11 }}>
          <Filter style={{ width: 24, height: 24 }} />
        </View>
      </MaterialMenu>
    );
  };

  const postOrderMedsAndTestsEvent = (id: any, caseSheetDetails: any) => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.PHR_ORDER_MEDS_TESTS] = {
      ...caseSheetDetails,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Consult ID': g(id, 'id'),
    };
    postWebEngageEvent(CleverTapEventName.PHR_ORDER_MEDS_TESTS, eventAttributes);
    postCleverTapEvent(CleverTapEventName.PHR_ORDER_MEDS_TESTS, eventAttributes);
  };

  function postDiagnosticAddToCart(itemId: string, itemName: string) {
    DiagnosticAddToCartEvent(itemName, itemId, 0, 0, DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PHR);
  }

  const onOrderTestMedPress = async (selectedItem: any, caseSheetDetails: any) => {
    postOrderMedsAndTestsEvent(selectedItem?.id, caseSheetDetails);
    let item =
      selectedItem?.caseSheet &&
      selectedItem?.caseSheet.find((obj: any) => {
        return obj.doctorType !== 'JUNIOR';
      });

    if (item == undefined) {
      Alert.alert('Uh oh.. :(', 'No medicines or tests found.');
      CommonLogEvent('HEALTH_CONSULT_VIEW', 'No medicines prescribed');
    } else {
      if (item.medicinePrescription || item.diagnosticPrescription) {
        //write here stock condition

        setGlobalLoading!(true);

        let location: LocationData | null = null;

        const medPrescription = ((item.medicinePrescription ||
          []) as getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription[]).filter(
          (item) => item?.id
        );
        const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(item?.blobName!);
        const getDaysCount = (type: MEDICINE_CONSUMPTION_DURATION) => {
          return type == MEDICINE_CONSUMPTION_DURATION.MONTHS
            ? 30
            : type == MEDICINE_CONSUMPTION_DURATION.WEEKS
            ? 7
            : 1;
        };

        const testPrescription = (item.diagnosticPrescription ||
          []) as getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosticPrescription[];

        const presToAdd = {
          id: item.id,
          date: moment(g(selectedItem, 'appointmentDateTime')).format('DD MMM YYYY'),
          doctorName: g(selectedItem, 'doctorInfo', 'displayName') || '',
          forPatient: currentPatient?.firstName || '',
          medicines: [].map((item: any) => item?.name).join(', '),
          uploadedUrl: docUrl,
        } as EPrescription;

        Promise.all(medPrescription.map((item: any) => getMedicineDetailsApi(item?.id!)))
          .then(async (result) => {
            const medicineAll = result.map(({ data: { productdp } }, index) => {
              const medicineDetails = (productdp && productdp[0]) || {};
              if (medicineDetails.id == 0) {
                return null;
              }

              const _qty =
                medPrescription[index]?.medicineUnit == MEDICINE_UNIT.CAPSULE ||
                medPrescription[index]?.medicineUnit == MEDICINE_UNIT.TABLET
                  ? ((medPrescription[index]?.medicineTimings || []).length || 1) *
                    getDaysCount(medPrescription[index]?.medicineConsumptionDurationUnit!) *
                    parseInt(medPrescription[index]?.medicineConsumptionDurationInDays || '1', 10)
                  : 1;
              const qty = Math.ceil(_qty / parseInt(medicineDetails.mou || '1'));

              return {
                id: medicineDetails?.sku,
                mou: medicineDetails?.mou,
                name: medicineDetails?.name,
                price: medicineDetails?.price,
                specialPrice: medicineDetails?.special_price
                  ? typeof medicineDetails?.special_price == 'string'
                    ? parseInt(medicineDetails?.special_price)
                    : medicineDetails?.special_price
                  : undefined,
                quantity: qty,
                prescriptionRequired: medicineDetails?.is_prescription_required == '1',
                isMedicine: getIsMedicine(medicineDetails?.type_id?.toLowerCase()) || '0',
                thumbnail: medicineDetails?.thumbnail || medicineDetails?.image,
                isInStock: !!medicineDetails?.is_in_stock,
                productType: medicineDetails?.type_id,
              } as ShoppingCartItem;
            });
            const medicines = medicineAll.filter((item: any) => !!item);

            addMultipleCartItems!(medicines as ShoppingCartItem[]);

            const rxMedicinesCount =
              medicines.length == 0
                ? 0
                : medicines.filter((item: any) => item?.prescriptionRequired).length;

            if (rxMedicinesCount) {
              setEPrescriptions!([
                ...ePrescriptions.filter((item) => item?.id != presToAdd.id),
                {
                  ...presToAdd,
                  medicines: medicines.map((item: any) => item?.name).join(', '),
                },
              ]);
            }
            // Adding tests to DiagnosticsCart
            if (!locationDetails) {
              try {
                location = await doRequestAndAccessLocation();
                location && setLocationDetails!(location);
              } catch (error) {
                setGlobalLoading!(false);
                Alert.alert(
                  'Uh oh.. :(',
                  'Unable to get location. We need your location in order to add tests to your cart.'
                );
                return;
              }
            }
            if (!testPrescription.length) {
              setGlobalLoading!(false);
              return Promise.resolve([]);
            } else {
              return addTestsToCart(
                testPrescription,
                client,
                g(locationDetails || location, 'city') || ''
              );
            }
          })
          .then((tests) => {
            const getItemNames = tests?.map((item) => item?.name)?.join(', ');
            const getItemIds = tests?.map((item) => Number(item?.id))?.join(', ');
            if (testPrescription.length) {
              addMultipleTestCartItems!(tests! || []);
              // Adding ePrescriptions to DiagnosticsCart
              if ((tests! || []).length)
                addMultipleTestEPrescriptions!([
                  {
                    ...presToAdd,
                    medicines: (tests as DiagnosticsCartItem[])
                      .map((item) => item?.name)
                      .join(', '),
                  },
                ]);
            }
            postDiagnosticAddToCart(getItemNames!, getItemIds!);
          })
          .catch((e) => {
            CommonBugFender('DoctorConsultation_getMedicineDetailsApi', e);
            handleGraphQlError(e);
          })
          .finally(() => {
            setGlobalLoading!(false);
            props.navigation.navigate(AppRoutes.MedAndTestCart);
          });
      } else {
        Alert.alert('No Medicines');
      }
    }
  };

  const onFollowUpButtonPress = (selectedItem: any) => {
    let dataval = doctorType(selectedItem);

    client
      .query<checkIfFollowUpBooked>({
        query: CHECK_IF_FOLLOWUP_BOOKED,
        variables: {
          appointmentId: selectedItem.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        props.navigation.push(AppRoutes.ConsultDetails, {
          CaseSheet: selectedItem.id,
          DoctorInfo: selectedItem.doctorInfo,
          FollowUp: dataval.followUp,
          appointmentType: selectedItem.appointmentType,
          DisplayId: selectedItem.displayId,
          Displayoverlay: true,
          isFollowcount: data.checkIfFollowUpBooked,
          BlobName: dataval.blobName,
        });
      })
      .catch((error) => {
        CommonBugFender('DoctorConsultation_onFollowUpClick', error);
      });
  };

  const postConsultCardClickEvent = (consultId: string) => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.PHR_CONSULT_CARD_CLICK] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Consult ID': consultId,
    };
    postWebEngageEvent(CleverTapEventName.PHR_CONSULT_CARD_CLICK, eventAttributes);
    postCleverTapEvent(CleverTapEventName.PHR_CONSULT_CARD_CLICK, eventAttributes);
  };

  const onHealthCardItemPress = (selectedItem: any) => {
    const eventInputData = removeObjectProperty(selectedItem, 'prescriptionFiles');
    postCleverTapIfNewSession(
      'Doctor Consults',
      currentPatient,
      eventInputData,
      phrSession,
      setPhrSession
    );
    if (selectedItem?.patientId) {
      postConsultCardClickEvent(selectedItem?.id);
      props.navigation.navigate(AppRoutes.ConsultDetails, {
        CaseSheet: selectedItem?.id,
        DoctorInfo: selectedItem?.doctorInfo,
        FollowUp: selectedItem?.isFollowUp,
        appointmentType: selectedItem?.appointmentType,
        DisplayId: selectedItem?.displayId,
        BlobName: g(doctorType(selectedItem), 'blobName'),
      });
    } else {
      props.navigation.navigate(AppRoutes.HealthRecordDetails, {
        data: selectedItem,
        prescriptions: true,
      });
    }
  };

  const onPressDeletePrismMedicalRecords = (selectedItem: any) => {
    setShowSpinner(true);
    deletePatientPrismMedicalRecords(
      client,
      selectedItem?.id,
      currentPatient?.id || '',
      MedicalRecordType.PRESCRIPTION
    )
      .then((status) => {
        if (status) {
          getLatestPrescriptionRecords();
          const eventInputData = removeObjectProperty(selectedItem, 'prescriptionFiles');
          postCleverTapPHR(
            currentPatient,
            CleverTapEventName.PHR_DELETE_DOCTOR_CONSULTATION,
            'Doctor Consultation',
            eventInputData
          );
        } else {
          setShowSpinner(false);
        }
      })
      .catch((error) => {
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const onPressEditPrismMedicalRecords = (selectedItem: any) => {
    setCallApi(false);
    props.navigation.navigate(AppRoutes.AddRecord, {
      navigatedFrom: 'Consult & RX',
      recordType: MedicalRecordType.PRESCRIPTION,
      selectedRecordID: selectedItem?.id,
      selectedRecord: selectedItem,
      onRecordAdded: onRecordAdded,
    });
  };

  const renderConsultRxItems = (item: any, index: number) => {
    const getPresctionDate = (date: string) => {
      let prev_date = new Date();
      prev_date.setDate(prev_date.getDate() - 1);
      if (moment(new Date()).format('DD/MM/YYYY') === moment(new Date(date)).format('DD/MM/YYYY')) {
        return 'Today';
      } else if (
        moment(prev_date).format('DD/MM/YYYY') === moment(new Date(date)).format('DD/MM/YYYY')
      ) {
        return 'Yesterday';
      }
      return moment(new Date(date)).format('DD MMM');
    };
    let prescriptionGeneratedDate = '';
    const getPrescriptionGeneratedDate = () => {
      item?.data?.caseSheet?.map((dateItem: any) => {
        if (dateItem?.prescriptionGeneratedDate) {
          if (!prescriptionGeneratedDate) {
            prescriptionGeneratedDate = dateItem?.prescriptionGeneratedDate;
            return;
          }
        }
      });
      return prescriptionGeneratedDate || item?.data?.appointmentDateTime;
    };
    const prescriptionName = item?.data?.prescriptionName || 'Prescription';
    const doctorName = item?.data?.prescriptionName
      ? item?.data?.prescribedBy && item?.data?.prescribedBy !== item?.data?.prescriptionName
        ? 'with Dr. ' + item?.data?.prescribedBy
        : ''
      : item?.data?.doctorInfo?.firstName
      ? 'with Dr. ' +
        (item?.data?.doctorInfo?.firstName + ' ' || '') +
        (item?.data?.doctorInfo?.lastName || '')
      : '';
    const dateText =
      item?.data?.prescriptionName || item?.data?.date
        ? getPresctionDate(item?.data?.date)
        : getPresctionDate(getPrescriptionGeneratedDate());
    const soureName =
      item?.data?.prescriptionName || item?.data?.date
        ? getSourceName(item?.data?.source) || '-'
        : g(item?.data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name') || '-';
    const selfUpload = item?.data?.prescriptionName || item?.data?.date ? true : false;
    const caseSheetDetails =
      item?.data?.caseSheet?.length > 0 &&
      item?.data?.caseSheet?.find((caseSheet: any) => caseSheet?.doctorType !== 'JUNIOR');
    const caseSheetFollowUp =
      caseSheetDetails && caseSheetDetails.followUp ? caseSheetDetails.followUp : false;
    const showEditDeleteOption =
      soureName === string.common.clicnical_document_text || soureName === '-' ? true : false;
    return (
      <HealthRecordCard
        item={item?.data}
        index={index}
        editDeleteData={editDeleteData(MedicalRecordType.PRESCRIPTION)}
        showUpdateDeleteOption={item?.data?.patientId ? false : showEditDeleteOption}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
        prescriptionName={prescriptionName}
        doctorName={doctorName}
        onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
        onDeletePress={(selectedItem) => onPressDeletePrismMedicalRecords(selectedItem)}
        dateText={dateText}
        selfUpload={selfUpload}
        sourceName={soureName || ''}
        showFollowUp={caseSheetFollowUp}
        onFollowUpPress={(selectedItem) => onFollowUpButtonPress(selectedItem)}
        onOrderTestAndMedicinePress={(selectedItem) =>
          onOrderTestMedPress(selectedItem, caseSheetDetails)
        }
        deleteRecordText={'prescription'}
      />
    );
  };

  const renderSectionHeader = (section: any) => {
    return <Text style={styles.sectionHeaderTitleStyle}>{section.key}</Text>;
  };

  const renderConsults = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localConsultRxData || []}
        renderItem={({ item, index }) => renderConsultRxItems(item, index)}
        ListEmptyComponent={renderEmptyList()}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
      />
    );
  };

  const renderSearchLoader = () => {
    return (
      <View style={styles.loaderViewStyle}>
        <Spinner style={styles.loaderStyle} />
      </View>
    );
  };

  const renderEmptyList = () => {
    if (consultRxMainData?.length != 0) {
      return null;
    } else {
      return <PhrNoDataComponent />;
    }
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

  const renderHealthRecordSearchItem = (item: any, index: number) => {
    const healthCardTopView = () => {
      return (
        <View style={styles.healthRecordTypeViewStyle}>
          <PrescriptionPhrSearchIcon style={{ width: 12, height: 13 }} />
          <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
            {'Doctor Consultations'}
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

  const onClickSearchHealthCard = (item: any) => {
    const { healthrecordId } = item?.value;
    const prescription_item = item?.value?.healthRecord
      ? JSON.parse(item?.value?.healthRecord || '{}')
      : {};
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      healthrecordId: healthrecordId,
      healthRecordType: MedicalRecordType.PRESCRIPTION,
      prescriptions: true,
      prescriptionSource: prescription_item?.source,
    });
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

  const onRecordAdded = () => {
    setCallApi(true);
  };

  const renderAddButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={string.common.addPrescriptionText}
          onPress={() => {
            setCallApi(false);
            const eventAttributes: CleverTapEvents[CleverTapEventName.ADD_RECORD] = {
              Source: 'Doctor Consultation',
            };
            postWebEngageEvent(CleverTapEventName.ADD_RECORD, eventAttributes);
            postCleverTapEvent(CleverTapEventName.ADD_RECORD, eventAttributes);
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'Consult & RX',
              recordType: MedicalRecordType.PRESCRIPTION,
              onRecordAdded: onRecordAdded,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderConsultMainView = () => {
    return (
      <>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderConsults()}
        </ScrollView>
        {renderAddButton()}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {consultRxMainData?.length > 0
          ? showSearchBar
            ? renderSearchBar()
            : renderSearchAndFilterView()
          : null}
        <Text style={styles.doctorConsultPHRTextStyle}>{string.common.doctorConsultPHRText}</Text>
        {searchText?.length > 2 ? renderHealthRecordSearchResults() : renderConsultMainView()}
      </SafeAreaView>
    </View>
  );
};
