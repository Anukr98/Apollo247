import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { FilterHealthRecordScene } from '@aph/mobile-patients/src/components/FilterHealthRecordScene';
import { HealthConsultView } from '@aph/mobile-patients/src/components/HealthRecords/HealthConsultView';
import { MedicalRecords } from '@aph/mobile-patients/src/components/HealthRecords/MedicalRecords';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
// import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  DropdownGreen,
  Filter,
  LinkedUhidIcon,
  NoData,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  CommonBugFender,
  CommonLogEvent,
  isIphone5s,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CHECK_IF_FOLLOWUP_BOOKED,
  DELETE_PATIENT_MEDICAL_RECORD,
  GET_MEDICAL_PRISM_RECORD,
  GET_MEDICAL_RECORD,
  GET_PAST_CONSULTS_PRESCRIPTIONS,
  SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS,
  UPLOAD_DOCUMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import { checkIfFollowUpBooked } from '@aph/mobile-patients/src/graphql/types/checkIfFollowUpBooked';
import {
  deletePatientMedicalRecord,
  deletePatientMedicalRecordVariables,
} from '@aph/mobile-patients/src/graphql/types/deletePatientMedicalRecord';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords,
} from '@aph/mobile-patients/src/graphql/types/getPatientMedicalRecords';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults as ConsultsType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders as medicineOrders,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { savePrescriptionMedicineOrderOMSVariables } from '@aph/mobile-patients/src/graphql/types/savePrescriptionMedicineOrderOMS';
import {
  g,
  handleGraphQlError,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import WebEngage from 'react-native-webengage';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response,
} from '../../graphql/types/getPatientPrismMedicalRecords';
import {
  BOOKING_SOURCE,
  DEVICE_TYPE,
  MEDICINE_DELIVERY_TYPE,
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
} from '../../graphql/types/globalTypes';
import { uploadDocument, uploadDocumentVariables } from '../../graphql/types/uploadDocument';
import { useShoppingCart } from '../ShoppingCartProvider';
import { TabHeader } from '../ui/TabHeader';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  filterViewStyle: {
    height: 60,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  hiTextStyle: {
    marginLeft: 20,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  nameTextContainerStyle: {
    maxWidth: '75%',
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    //marginTop: 5,
    marginHorizontal: 5,
    marginBottom: 6,
    marginRight: -5,
  },
  descriptionTextStyle: {
    marginTop: 8,
    marginBottom: 16,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  notifyUsersTextStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#0087BA',
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
});

const filterData: filterDataType[] = [
  {
    label: 'See Only',
    options: ['Online Consults', 'Clinic Visits', 'Prescriptions'],
    selectedOptions: [],
  },
];
type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};
type PickerImage = any;

export interface HealthRecordsHomeProps extends NavigationScreenProps {}

export const HealthRecordsHome: React.FC<HealthRecordsHomeProps> = (props) => {
  const tabs = strings.health_records_home.tabs;

  const [healthChecksNew, setHealthChecksNew] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response | null)[]
    | null
    | undefined
  >([]);
  const [hospitalizationsNew, setHospitalizationsNew] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response | null)[]
    | null
    | undefined
  >([]);
  const [labResults, setLabResults] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response | null)[]
    | null
    | undefined
  >([]);
  const [prescriptions, setPrescriptions] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response | null)[]
    | null
    | undefined
  >([]);

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [FilterData, setFilterData] = useState<filterDataType[]>(filterData);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [consultsData, setConsultsData] = useState<(ConsultsType | null)[] | null>(null);
  const [medicineOrders, setMedicineOrders] = useState<(medicineOrders | null)[] | null>(null);
  const [combination, setCombination] = useState<{ type: string; data: any }[]>();
  // const [loading, setLoading && setLoading] = useState<boolean>(true);
  const { loading, setLoading } = useUIElements();
  const [prismdataLoader, setPrismdataLoader] = useState<boolean>(false);
  const [pastDataLoader, setPastDataLoader] = useState<boolean>(false);
  const [arrayValues, setarrayValues] = useState<any>();
  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();
  const { showAphAlert } = useUIElements();
  const { deliveryAddressId, storeId } = useShoppingCart();

  useEffect(() => {
    currentPatient && setProfile(currentPatient!);
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);
  useEffect(() => {
    if (prismdataLoader || pastDataLoader) {
      !loading && setLoading!(true);
    } else {
      loading && setLoading!(false);
    }
  }, [prismdataLoader, pastDataLoader]);

  const fetchPastData = (filters: filterDataType[] = []) => {
    const filterArray = [];
    const selectedOptions =
      filters.length > 0 && filters[0].selectedOptions ? filters[0].selectedOptions : [];
    if (selectedOptions.includes('Online Consults')) filterArray.push('ONLINE');
    if (selectedOptions.includes('Clinic Visits')) filterArray.push('PHYSICAL');
    if (selectedOptions.includes('Prescriptions')) filterArray.push('PRESCRIPTION');

    client
      .query<getPatientPastConsultsAndPrescriptions>({
        query: GET_PAST_CONSULTS_PRESCRIPTIONS,
        fetchPolicy: 'no-cache',
        variables: {
          consultsAndOrdersInput: {
            patient: currentPatient && currentPatient.id ? currentPatient.id : '',
            filter: filterArray,
          },
        },
      })
      .then((_data) => {
        const consults = _data.data.getPatientPastConsultsAndPrescriptions!.consults || [];
        const medOrders = _data.data.getPatientPastConsultsAndPrescriptions!.medicineOrders || [];
        const consultsAndMedOrders: { [key: string]: any } = {};
        setConsultsData(consults);
        setMedicineOrders(medOrders);
        consults.forEach((c) => {
          consultsAndMedOrders[c!.bookingDate] = {
            ...consultsAndMedOrders[c!.bookingDate],
            ...c,
          };
        });

        medOrders.forEach((c) => {
          consultsAndMedOrders[c!.quoteDateTime] = {
            ...consultsAndMedOrders[c!.quoteDateTime],
            ...c,
          };
        });
        const array = Object.keys(consultsAndMedOrders)
          .map((i) => consultsAndMedOrders[i])
          .sort(
            (a: any, b: any) =>
              moment(b.bookingDate || b.quoteDateTime)
                .toDate()
                .getTime() -
              moment(a.bookingDate || a.quoteDateTime)
                .toDate()
                .getTime()
          )
          .filter(
            (i) =>
              (!i.patientId && (i.prescriptionImageUrl || i.prismPrescriptionFileId)) || i.patientId
          );
        console.log('sort', array);
        setarrayValues(array);
      })
      .catch((e) => {
        CommonBugFender('HealthRecordsHome_fetchPastData', e);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Heath records', error);
      })
      .finally(() => setPastDataLoader(false));
  };

  const sortByDate = (array: { type: string; data: any }[]) => {
    return array.sort(({ data: data1 }, { data: data2 }) => {
      let date1 = new Date(data1.date || data1.bookingDate || data1.quoteDateTime);
      let date2 = new Date(data2.date || data2.bookingDate || data2.quoteDateTime);
      return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
    });
  };

  const fetchTestData = useCallback(() => {
    client
      .query<getPatientPrismMedicalRecords>({
        query: GET_MEDICAL_PRISM_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        console.log('data', data);
        const labResultsData = g(data, 'getPatientPrismMedicalRecords', 'labResults', 'response');
        const prescriptionsData = g(
          data,
          'getPatientPrismMedicalRecords',
          'prescriptions',
          'response'
        );
        const healthChecksNewData = g(
          data,
          'getPatientPrismMedicalRecords',
          'healthChecksNew',
          'response'
        );
        const hospitalizationsNewData = g(
          data,
          'getPatientPrismMedicalRecords',
          'hospitalizationsNew',
          'response'
        );
        setLabResults(labResultsData);
        setPrescriptions(prescriptionsData);
        setHealthChecksNew(healthChecksNewData);
        setHospitalizationsNew(hospitalizationsNewData);
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_fetchTestData', error);
        console.log('Error occured', { error });
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setPrismdataLoader(false));
  }, [currentPatient]);

  useEffect(() => {
    setPastDataLoader(true);
    setPrismdataLoader(true);
    fetchPastData();
    fetchTestData();
  }, [currentPatient]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      fetchPastData();
      fetchTestData();
      setDisplayFilter(false);
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation, currentPatient]);

  useEffect(() => {
    if (consultsData && medicineOrders && prescriptions) {
      let mergeArray: { type: string; data: any }[] = [];
      arrayValues!.forEach((item: any) => {
        mergeArray.push({ type: 'pastConsults', data: item });
      });
      prescriptions!.forEach((c) => {
        mergeArray.push({ type: 'prescriptions', data: c });
      });
      setCombination(sortByDate(mergeArray));
    }
  }, [arrayValues, prescriptions]);

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    if (!(offset > 1 && scrollOffset > 1)) {
      setScrollOffset(event.nativeEvent.contentOffset.y);
    }
  };

  const renderTopView = () => {
    const containerStyle: ViewStyle =
      scrollOffset > 1
        ? {
            shadowColor: '#808080',
            shadowOffset: { width: 0, height: 0 },
            zIndex: 1,
            shadowOpacity: 0.4,
            shadowRadius: 5,
            elevation: 5,
          }
        : {};
    return <TabHeader containerStyle={containerStyle} navigation={props.navigation} />;
  };

  const renderProfileChangeView = () => {
    return (
      <View style={{ backgroundColor: theme.colors.WHITE }}>
        <ProfileList
          navigation={props.navigation}
          saveUserChange={true}
          childView={
            <View
              style={{
                flexDirection: 'row',
                paddingRight: 8,
                borderRightWidth: 0,
                borderRightColor: 'rgba(2, 71, 91, 0.2)',
                backgroundColor: theme.colors.WHITE,
                paddingBottom: 8,
              }}
            >
              <Text style={styles.hiTextStyle}>{'hi'}</Text>
              <View style={styles.nameTextContainerStyle}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <Text
                    style={[
                      styles.nameTextStyle,
                      { maxWidth: Platform.OS === 'ios' ? '85%' : '75%' },
                    ]}
                    numberOfLines={1}
                  >
                    {(currentPatient && currentPatient!.firstName!.toLowerCase()) || ''}
                  </Text>
                  {currentPatient && g(currentPatient, 'isUhidPrimary') ? (
                    <LinkedUhidIcon
                      style={{
                        width: 22,
                        height: 20,
                        marginLeft: 5,
                        marginTop: Platform.OS === 'ios' ? 16 : 20,
                      }}
                      resizeMode={'contain'}
                    />
                  ) : null}
                  <View style={{ paddingTop: 15, marginLeft: 6 }}>
                    <DropdownGreen />
                  </View>
                </View>
                {currentPatient && <View style={styles.seperatorStyle} />}
              </View>
            </View>
          }
          selectedProfile={profile}
          setDisplayAddProfile={() => {}}
          unsetloaderDisplay={true}
        ></ProfileList>
        <Text style={styles.descriptionTextStyle}>{strings.health_records_home.description}</Text>
        <Text style={styles.notifyUsersTextStyle}>
          {strings.health_records_home.add_note_to_notify_users}
        </Text>
      </View>
    );
  };

  const renderTabSwitch = () => {
    return (
      <TabsComponent
        style={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
          backgroundColor: theme.colors.CARD_BG,
          shadowRadius: 2,
        }}
        titleStyle={{
          fontSize: isIphone5s() ? 10 : 12,
        }}
        selectedTitleStyle={{
          fontSize: isIphone5s() ? 10 : 12,
        }}
        height={44}
        data={tabs}
        onChange={(selectedTab: string) => {
          setselectedTab(selectedTab);
          if (selectedTab === tabs[0].title) {
            const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_RX] = {
              'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
              'Patient UHID': g(currentPatient, 'uhid'),
              Relation: g(currentPatient, 'relation'),
              'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
              'Patient Gender': g(currentPatient, 'gender'),
              'Mobile Number': g(currentPatient, 'mobileNumber'),
              'Customer ID': g(currentPatient, 'id'),
            };
            postWebEngageEvent(WebEngageEventName.CONSULT_RX, eventAttributes);
          } else {
            const eventAttributes: WebEngageEvents[WebEngageEventName.MEDICAL_RECORDS] = {
              'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
              'Patient UHID': g(currentPatient, 'uhid'),
              Relation: g(currentPatient, 'relation'),
              'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
              'Patient Gender': g(currentPatient, 'gender'),
              'Mobile Number': g(currentPatient, 'mobileNumber'),
              'Customer ID': g(currentPatient, 'id'),
            };
            postWebEngageEvent(WebEngageEventName.MEDICAL_RECORDS, eventAttributes);
          }
        }}
        selectedTab={selectedTab}
      />
    );
  };

  const renderFilter = () => {
    return (
      <View style={styles.filterViewStyle}>
        <TouchableOpacity activeOpacity={1} onPress={() => setDisplayFilter(true)}>
          <Filter />
        </TouchableOpacity>
      </View>
    );
  };

  const doctorType = (item: any) => {
    return (
      item.caseSheet &&
      item.caseSheet.find((obj: any) => {
        return (
          obj.doctorType === 'STAR_APOLLO' ||
          obj.doctorType === 'APOLLO' ||
          obj.doctorType === 'PAYROLL'
        );
      })
    );
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

  const renderConsult = (item: any, index: number) => {
    return (
      <HealthConsultView
        key={index}
        onPressOrder={() => {
          CommonLogEvent('HEALTH_RECORD_HOME', 'Display order popup');
          setdisplayOrderPopup(true);
        }}
        onClickCard={() => {
          if (item.data.doctorInfo) {
            postConsultCardClickEvent(item.data.id);
            props.navigation.navigate(AppRoutes.ConsultDetails, {
              CaseSheet: item.data.id,
              DoctorInfo: item.data.doctorInfo,
              FollowUp: item.data.isFollowUp,
              appointmentType: item.data.appointmentType,
              DisplayId: item.data.displayId,
              BlobName: g(doctorType(item.data), 'blobName'),
            });
          } else if (item.data.date) {
            props.navigation.navigate(AppRoutes.RecordDetails, {
              data: item.data,
            });
          }
        }}
        PastData={item.data}
        navigation={props.navigation}
        onFollowUpClick={() => {
          if (item.data.doctorInfo) {
            onFollowUpClick(item.data);
          }
        }}
      />
    );
  };
  const renderEmptyConsult = () => {
    if (!loading) {
      return (
        <View style={{ justifyContent: 'center', flexDirection: 'column' }}>
          {renderFilter()}
          <View
            style={{
              marginTop: 38,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <NoData />
          </View>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(12),
              color: '#02475b',
              marginBottom: 25,
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            You don’t have any records with us right now. {'\n'}Add a record to keep everything
            handy in one place!
          </Text>
          <View style={{ marginLeft: 60, marginRight: 60, marginBottom: 20 }}>
            <Button
              title="ADD RECORD"
              onPress={() => {
                const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
                  Source: 'Consult & RX',
                };
                postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
                props.navigation.navigate(AppRoutes.AddRecord, {
                  navigatedFrom: 'Consult & RX',
                });
              }}
            />
          </View>
        </View>
      );
    }
  };

  const renderConsults = () => {
    return (
      <View>
        {combination && combination.length !== 0 && renderFilter()}
        <FlatList
          data={combination || []}
          renderItem={({ item, index }) => renderConsult(item, index)}
          ListEmptyComponent={renderEmptyConsult()}
        />
      </View>
    );
  };

  const onFollowUpClick = (item: any) => {
    let dataval = doctorType(item);

    client
      .query<checkIfFollowUpBooked>({
        query: CHECK_IF_FOLLOWUP_BOOKED,
        variables: {
          appointmentId: item.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        console.log('CHECK_IF_FOLLOWUP_BOOKED', data);
        props.navigation.push(AppRoutes.ConsultDetails, {
          CaseSheet: item.id,
          DoctorInfo: item.doctorInfo,
          FollowUp: dataval.followUp,
          appointmentType: item.appointmentType,
          DisplayId: item.displayId,
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
  const renderErrorAlert = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: desc,
      unDismissable: true,
    });

  const renderSuccessPopup = () => {
    fetchPastData();
    showAphAlert!({
      title: 'Hi:)',
      description: 'Your prescriptions have been submitted successfully.',
      unDismissable: true,
    });
  };

  const submitPrescriptionMedicineOrder = (
    variables: savePrescriptionMedicineOrderOMSVariables
  ) => {
    setLoading!(true);
    client
      .mutate({
        mutation: SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS,
        variables,
      })
      .then(({ data }) => {
        console.log({ data });
        setLoading!(false);
        setdisplayOrderPopup(false);
        const { errorCode } = g(data, 'SavePrescriptionMedicineOrder')! || {};

        if (errorCode) {
          renderErrorAlert(`Something went wrong, unable to place order.`);
          return;
        }
        props.navigation.goBack();
        renderSuccessPopup();
      })
      .catch((e) => {
        console.log({ e });
        renderErrorAlert(`Something went wrong, please try later.`);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const UploadPrescriptionData = (uploadata: any) => {
    console.log(uploadata, 'jbhj');
    uploadata.map((item: any) => {
      const variables = {
        UploadDocumentInput: {
          base64FileInput: item.base64,
          category: PRISM_DOCUMENT_CATEGORY.HealthChecks,
          fileType:
            item.fileType == 'jpg'
              ? UPLOAD_FILE_TYPES.JPEG
              : item.fileType == 'png'
              ? UPLOAD_FILE_TYPES.PNG
              : item.fileType == 'pdf'
              ? UPLOAD_FILE_TYPES.PDF
              : UPLOAD_FILE_TYPES.JPEG,
          patientId: g(currentPatient, 'id')!,
        },
      };
      console.log(JSON.stringify(variables));
      setLoading!(true);
      client
        .mutate<uploadDocument, uploadDocumentVariables>({
          mutation: UPLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables,
        })
        .then((data) => {
          console.log(data, 'uploadata');
          setLoading!(false);
          setdisplayOrderPopup(false);
          const fieldId = data && data.data!.uploadDocument.fileId;
          if (fieldId) {
            const prescriptionMedicineInput: savePrescriptionMedicineOrderOMSVariables = {
              prescriptionMedicineOMSInput: {
                patientId: (currentPatient && currentPatient.id) || '',
                medicineDeliveryType: deliveryAddressId
                  ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
                  : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
                shopId: storeId || '0',
                appointmentId: '',
                patinetAddressId: deliveryAddressId || '',
                prescriptionImageUrl: data.data!.uploadDocument.filePath || '',
                prismPrescriptionFileId: data.data!.uploadDocument.fileId || '',
                isEprescription: 0, // if atleat one prescription is E-Prescription then pass it as one.
                bookingSource: BOOKING_SOURCE.MOBILE,
                deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
              },
            };
            console.log({ prescriptionMedicineInput });
            console.log(JSON.stringify(prescriptionMedicineInput));
            submitPrescriptionMedicineOrder(prescriptionMedicineInput);
          }
        })
        .catch((error) => {
          console.log(error, 'error');
        });
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderTopView()}
        <ScrollView
          style={{ flex: 1 }}
          bounces={false}
          stickyHeaderIndices={[1]}
          onScroll={handleScroll}
          scrollEventThrottle={20}
        >
          {renderProfileChangeView()}
          {renderTabSwitch()}
          {selectedTab === tabs[0].title && renderConsults()}
          {selectedTab === tabs[1].title && (
            <MedicalRecords navigation={props.navigation} labResultsData={labResults} />
          )}
        </ScrollView>
      </SafeAreaView>
      {displayFilter && (
        <FilterHealthRecordScene
          onClickClose={(data: filterDataType[]) => {
            setDisplayFilter(false);
            setFilterData(data);
          }}
          setData={(data) => {
            setFilterData(data);
            fetchPastData(data);
          }}
          data={JSON.parse(JSON.stringify(FilterData))}
          filterLength={() => {
            setTimeout(() => {
              setLoading && setLoading(false);
            }, 500);
          }}
        />
      )}
      {displayOrderPopup && (
        <UploadPrescriprionPopup
          isVisible={displayOrderPopup}
          disabledOption="NONE"
          type="nonCartFlow"
          heading={'Upload Prescription(s)'}
          instructionHeading={'Instructions For Uploading Prescriptions'}
          instructions={[
            'Take clear picture of your entire prescription.',
            'Doctor details & date of the prescription should be clearly visible.',
            'Medicines will be dispensed as per prescription.',
          ]}
          optionTexts={{
            camera: 'TAKE A PHOTO',
            gallery: 'CHOOSE\nFROM GALLERY',
          }}
          onClickClose={() => setdisplayOrderPopup(false)}
          onResponse={(selectedType, response) => {
            setdisplayOrderPopup(false);
            if (selectedType == 'CAMERA_AND_GALLERY') {
              if (response.length == 0) return;
              UploadPrescriptionData(response);
            }
          }}
        />
      )}
    </View>
  );
};
