import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import { useApolloClient } from 'react-apollo-hooks';
import { CHECK_IF_FOLLOWUP_BOOKED } from '@aph/mobile-patients/src/graphql/profiles';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
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
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
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
import { getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import moment from 'moment';
import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';

const { width, height } = Dimensions.get('window');

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
  const { locationDetails, setLocationDetails } = useAppCommonData();
  const {
    addMultipleCartItems: addMultipleTestCartItems,
    addMultipleEPrescriptions: addMultipleTestEPrescriptions,
  } = useDiagnosticsCart();
  const [prescriptions, setPrescriptions] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response | null)[]
    | null
    | undefined
  >(props.navigation?.getParam('prescriptionArray') || []);
  const [consultArray, setConsultArray] = useState<any>(
    props.navigation?.getParam('consultArray') || []
  );
  const [callApi, setCallApi] = useState(false);
  const [callPhrMainApi, setCallPhrMainApi] = useState(false);

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
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });

    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });

    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

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
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id)
      .then((data: any) => {
        const prescriptionsData = g(
          data,
          'getPatientPrismMedicalRecords',
          'prescriptions',
          'response'
        );
        setPrescriptions(prescriptionsData);
        setShowSpinner(false);
        setCallPhrMainApi(true);
      })
      .catch((error) => {
        setShowSpinner(false);
        console.log('error getPatientPrismMedicalRecordsApi', error);
        currentPatient && handleGraphQlError(error);
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

  const renderSearchAndFilterView = () => {
    const testFilterData = ConsultRxFilterArray.map((i) => {
      return { key: i.key, value: i.title };
    });
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, theme.colors.LIGHT_BLUE, 1, 30) }}>
          {'Doctor Consultations'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            <View style={{ paddingLeft: 16 }}>
              <Filter style={{ width: 24, height: 24 }} />
            </View>
          </MaterialMenu>
        </View>
      </View>
    );
  };

  const postOrderMedsAndTestsEvent = (id: any) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHR_ORDER_MEDS_TESTS] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Consult ID': g(id, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.PHR_ORDER_MEDS_TESTS, eventAttributes);
  };

  const onOrderTestMedPress = async (selectedItem: any) => {
    postOrderMedsAndTestsEvent(selectedItem?.id);
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
                isMedicine: (medicineDetails?.type_id || '').toLowerCase() == 'pharma',
                thumbnail: medicineDetails?.thumbnail || medicineDetails?.image,
                isInStock: !!medicineDetails?.is_in_stock,
                productType: medicineDetails?.type_id,
              } as ShoppingCartItem;
            });
            const medicines = medicineAll.filter((item: any) => !!item);

            addMultipleCartItems!(medicines as ShoppingCartItem[]);

            const totalItems = (item.medicinePrescription || []).length;
            const outOfStockItems = medicines.filter((item) => !item?.isInStock).length;
            const outOfStockMeds = medicines
              .filter((item) => !item?.isInStock)
              .map((item) => `${item?.name}`)
              .join(', ');

            if (outOfStockItems > 0) {
              const alertMsg =
                totalItems == outOfStockItems
                  ? 'Unfortunately, we do not have any medicines available right now.'
                  : `Out of ${totalItems} medicines, you are trying to order, following medicine(s) are out of stock.\n\n${outOfStockMeds}\n`;
            }

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
          })
          .catch((e) => {
            CommonBugFender('HealthConsultView_getMedicineDetailsApi', e);
            console.log({ e });
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
        CommonBugFender('HealthRecordsHome_onFollowUpClick', error);
        console.log('Error occured', { error });
      });
  };

  const postConsultCardClickEvent = (consultId: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHR_CONSULT_CARD_CLICK] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Consult ID': consultId,
    };
    postWebEngageEvent(WebEngageEventName.PHR_CONSULT_CARD_CLICK, eventAttributes);
  };

  const onHealthCardItemPress = (selectedItem: any) => {
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
        : getPresctionDate(item?.data?.appointmentDateTime);
    const soureName =
      item?.data?.prescriptionName || item?.data?.date
        ? getSourceName(item?.data?.source || '-')
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
        editDeleteData={editDeleteData()}
        showUpdateDeleteOption={showEditDeleteOption}
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
        onOrderTestAndMedicinePress={(selectedItem) => onOrderTestMedPress(selectedItem)}
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
        ListEmptyComponent={<PhrNoDataComponent />}
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
          title={`ADD DATA`}
          onPress={() => {
            setCallApi(false);
            const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
              Source: 'Consult & RX',
            };
            postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
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

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {consultRxMainData?.length > 0 ? renderSearchAndFilterView() : null}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderConsults()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
