import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { AddFilePopup } from '@aph/mobile-patients/src/components/HealthRecords/AddFilePopup';
import { HealthConsultView } from '@aph/mobile-patients/src/components/HealthRecords/HealthConsultView';
import { MedicalRecords } from '@aph/mobile-patients/src/components/HealthRecords/MedicalRecords';
// import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  AddFileIcon,
  DropdownGreen,
  Filter,
  NoData,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CHECK_IF_FOLLOWUP_BOOKED,
  DELETE_PATIENT_MEDICAL_RECORD,
  GET_MEDICAL_PRISM_RECORD,
  GET_MEDICAL_RECORD,
  GET_PAST_CONSULTS_PRESCRIPTIONS,
  UPLOAD_DOCUMENT,
  SAVE_PRESCRIPTION_MEDICINE_ORDER,
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
import { getPatientPastConsultsAndPrescriptions } from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import {
  g,
  handleGraphQlError,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests,
} from '../../graphql/types/getPatientPrismMedicalRecords';
import { TabHeader } from '../ui/TabHeader';
import { useUIElements } from '../UIElementsProvider';
import { UploadPrescription } from '../Medicines/UploadPrescription';
import {
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
  MEDICINE_DELIVERY_TYPE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
} from '../../graphql/types/globalTypes';
import { uploadDocument, uploadDocumentVariables } from '../../graphql/types/uploadDocument';
import { useShoppingCart } from '../ShoppingCartProvider';
import { SavePrescriptionMedicineOrderVariables } from '../../graphql/types/SavePrescriptionMedicineOrder';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import WebEngage from 'react-native-webengage';

const styles = StyleSheet.create({
  filterViewStyle: {
    height: 60,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // justifyContent: 'space-between',
  },
  hiTextStyle: {
    marginLeft: 20,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  nameTextContainerStyle: {
    maxWidth: '65%',
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
  },
  descriptionTextStyle: {
    marginTop: 8,
    marginBottom: 16,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
    paddingHorizontal: 20,
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

  const [medicalRecords, setmedicalRecords] = useState<
    (getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords | null)[] | null | undefined
  >([]);
  const [labTests, setlabTests] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests | null)[]
    | null
    | undefined
  >([]);
  const [healthChecks, sethealthChecks] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks | null)[]
    | null
    | undefined
  >([]);
  const [hospitalizations, sethospitalizations] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations | null)[]
    | null
    | undefined
  >([]);

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [FilterData, setFilterData] = useState<filterDataType[]>(filterData);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  // const [loading, setLoading && setLoading] = useState<boolean>(true);
  const { loading, setLoading } = useUIElements();
  const [prismdataLoader, setPrismdataLoader] = useState<boolean>(false);
  const [medicalRecordsLoader, setMedicalRecordsLoader] = useState<boolean>(false);
  const [pastDataLoader, setPastDataLoader] = useState<boolean>(false);
  const [arrayValues, setarrayValues] = useState<any>();
  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();
  const { showAphAlert } = useUIElements();
  const { deliveryAddressId, storeId } = useShoppingCart();
  const webengage = new WebEngage();

  useEffect(() => {
    currentPatient && setProfile(currentPatient!);
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);
  useEffect(() => {
    if (prismdataLoader || medicalRecordsLoader || pastDataLoader) {
      !loading && setLoading!(true);
    } else {
      loading && setLoading!(false);
    }
  }, [prismdataLoader, medicalRecordsLoader, pastDataLoader]);

  const fetchPastData = (filters: filterDataType[] = []) => {
    const filterArray = [];
    const selectedOptions =
      filters.length > 0 && filters[0].selectedOptions ? filters[0].selectedOptions : [];
    if (selectedOptions.includes('Online Consults')) filterArray.push('ONLINE');
    if (selectedOptions.includes('Clinic Visits')) filterArray.push('PHYSICAL');
    if (selectedOptions.includes('Prescriptions')) filterArray.push('PRESCRIPTION');

    // setPastDataLoader(true);
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
        console.log('data', _data);
        // const formatDate = (date: string) =>
        //   moment(date)
        //     .clone()
        //     .format('YYYY-MM-DD');

        const consults = _data.data.getPatientPastConsultsAndPrescriptions!.consults || [];
        const medOrders = _data.data.getPatientPastConsultsAndPrescriptions!.medicineOrders || [];
        const consultsAndMedOrders: { [key: string]: any } = {};

        consults.forEach((c) => {
          consultsAndMedOrders[c!.bookingDate] = {
            ...consultsAndMedOrders[c!.bookingDate],
            ...c,
          };
        });
        //setselectedTab(`${tabs[0].title}`);

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
        //setarrayValues(Object.keys(consultsAndMedOrders).map((i) => consultsAndMedOrders[i]));
      })
      .catch((e) => {
        CommonBugFender('HealthRecordsHome_fetchPastData', e);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Heath records', error);
        //Alert.alert('Error', error);
      })
      .finally(() => setPastDataLoader(false));
  };

  const fetchData = useCallback(() => {
    // setMedicalRecordsLoader(true);
    client
      .query<getPatientMedicalRecords>({
        query: GET_MEDICAL_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        console.log('data', data);
        const records = g(data, 'getPatientMedicalRecords', 'medicalRecords');
        setmedicalRecords(records);
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_fetchData', error);
        console.log('Error occured', { error });
        //Alert.alert('Error', error.message);
      })
      .finally(() => setMedicalRecordsLoader(false));
  }, [currentPatient]);

  const fetchTestData = useCallback(() => {
    // setPrismdataLoader(true);
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
        const labTestsData = g(data, 'getPatientPrismMedicalRecords', 'labTests');
        const healthChecksData = g(data, 'getPatientPrismMedicalRecords', 'healthChecks');
        const hospitalizationsData = g(data, 'getPatientPrismMedicalRecords', 'hospitalizations');
        setlabTests(labTestsData);
        sethealthChecks(healthChecksData);
        sethospitalizations(hospitalizationsData);
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
    setMedicalRecordsLoader(true);
    setPrismdataLoader(true);
    fetchPastData();
    fetchData();
    fetchTestData();
  }, [currentPatient]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      fetchPastData();
      fetchData();
      fetchTestData();
      setDisplayFilter(false);
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation, currentPatient]);

  const renderDeleteMedicalOrder = (MedicaId: string) => {
    client
      .mutate<deletePatientMedicalRecord, deletePatientMedicalRecordVariables>({
        mutation: DELETE_PATIENT_MEDICAL_RECORD,
        variables: { recordId: MedicaId },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const newRecords = medicalRecords!.filter((record: any) => record.id != MedicaId);
        setmedicalRecords(newRecords);
      })
      .catch((e) => {
        console.log('Error occured while render Delete MedicalOrder', { e });
        currentPatient && handleGraphQlError(e);
      });
  };

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log(`scrollOffset, ${event.nativeEvent.contentOffset.y}`);
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
                <Text style={styles.nameTextStyle} numberOfLines={1}>
                  {(currentPatient && currentPatient.firstName!.toLowerCase()) || ''}
                </Text>
                <View style={styles.seperatorStyle} />
              </View>
              <View style={{ paddingTop: 15 }}>
                <DropdownGreen />
              </View>
            </View>
          }
          selectedProfile={profile}
          setDisplayAddProfile={() => {}}
          unsetloaderDisplay={true}
        ></ProfileList>
        <Text style={styles.descriptionTextStyle}>{strings.health_records_home.description}</Text>
      </View>
    );
  };

  const renderTabSwitch = () => {
    return (
      <TabsComponent
        style={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
          //marginTop: Platform.OS === 'ios' ? 205 : 216, //226,
          backgroundColor: theme.colors.CARD_BG,
          shadowRadius: 2,
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
        {/* <TouchableOpacity JIRA Ticket APP-982
          activeOpacity={1}
          onPress={() => {
            CommonLogEvent('HEALTH_RECORD_HOME', 'Navigate to add record');
            setdisplayOrderPopup(true);

            const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION] = {
              'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
              'Patient UHID': g(currentPatient, 'uhid'),
              Relation: g(currentPatient, 'relation'),
              'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
              'Patient Gender': g(currentPatient, 'gender'),
              'Mobile Number': g(currentPatient, 'mobileNumber'),
              'Customer ID': g(currentPatient, 'id'),
            };
            postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION, eventAttributes);
            // props.navigation.navigate(AppRoutes.AddRecord);
          }}
        >
          <Text style={theme.viewStyles.text('B', 12, '#fc9916', 1, 20)}>
            {'UPLOAD PRESCRIPTION'}
          </Text>
        </TouchableOpacity> */}
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
          if (item.doctorInfo) {
            postConsultCardClickEvent(item.id);
            props.navigation.navigate(AppRoutes.ConsultDetails, {
              CaseSheet: item.id,
              DoctorInfo: item.doctorInfo,
              FollowUp: item.isFollowUp,
              appointmentType: item.appointmentType,
              DisplayId: item.displayId,
              BlobName: g(doctorType(item), 'blobName'),
            });
          }
        }}
        PastData={item}
        navigation={props.navigation}
        onFollowUpClick={() => {
          if (item.doctorInfo) {
            onFollowUpClick(item);
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
        {arrayValues && arrayValues.length !== 0 && renderFilter()}
        <FlatList
          data={arrayValues}
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

  const submitPrescriptionMedicineOrder = (variables: SavePrescriptionMedicineOrderVariables) => {
    setLoading!(true);
    client
      .mutate({
        mutation: SAVE_PRESCRIPTION_MEDICINE_ORDER,
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
            const prescriptionMedicineInput: SavePrescriptionMedicineOrderVariables = {
              prescriptionMedicineInput: {
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
          {selectedTab === tabs[0].title ? (
            renderConsults()
          ) : (
            <MedicalRecords
              navigation={props.navigation}
              MedicalRecordData={medicalRecords}
              renderDeleteMedicalOrder={renderDeleteMedicalOrder}
              labTestsData={labTests}
              healthChecksData={healthChecks}
              hospitalizationsData={hospitalizations}
            />
          )}
        </ScrollView>
      </SafeAreaView>
      {displayFilter && (
        <FilterScene
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
              // props.navigation.navigate(AppRoutes.UploadPrescription, {
              //   phyPrescriptionsProp: response,
              // });
            }
          }}
        />
        // <AddFilePopup
        //   onClickClose={() => {
        //     setdisplayOrderPopup(false);
        //   }}
        //   getData={(data: (PickerImage | PickerImage[])[]) => {
        //     UploadPrescriptionData(data);
        //   }}
        // />
      )}
    </View>
  );
};
