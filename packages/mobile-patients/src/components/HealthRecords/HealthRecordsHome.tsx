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
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CHECK_IF_FOLLOWUP_BOOKED,
  DELETE_PATIENT_MEDICAL_RECORD,
  GET_MEDICAL_PRISM_RECORD,
  GET_MEDICAL_RECORD,
  GET_PAST_CONSULTS_PRESCRIPTIONS,
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
import { g, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
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

const styles = StyleSheet.create({
  filterViewStyle: {
    height: 60,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
        console.log('Error occured', { error });
        handleGraphQlError(error);
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
        handleGraphQlError(e);
      });
  };

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log(`scrollOffset, ${event.nativeEvent.contentOffset.y}`);
    setScrollOffset(event.nativeEvent.contentOffset.y);
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
        <Text style={styles.descriptionTextStyle}>
          {'Find all your health record & prescription in one place.'}
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
          //marginTop: Platform.OS === 'ios' ? 205 : 216, //226,
          backgroundColor: theme.colors.CARD_BG,
          shadowRadius: 2,
        }}
        height={44}
        data={tabs}
        onChange={(selectedTab: string) => setselectedTab(selectedTab)}
        selectedTab={selectedTab}
      />
    );
  };

  const renderFilter = () => {
    return (
      <View style={styles.filterViewStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            CommonLogEvent('HEALTH_RECORD_HOME', 'Navigate to add record');
            props.navigation.navigate(AppRoutes.AddRecord);
          }}
        >
          <Text style={theme.viewStyles.text('B', 12, '#fc9916', 1, 20)}>
            {'UPLOAD PRESCRIPTION'}
          </Text>
        </TouchableOpacity>
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

  const renderConsult = (item: any, index: number) => {
    return (
      <HealthConsultView
        key={index}
        onPressOrder={() => {
          CommonLogEvent('HEALTH_RECORD_HOME', 'Display order popup');
          setdisplayOrderPopup(true);
        }}
        onClickCard={() => {
          props.navigation.navigate(AppRoutes.ConsultDetails, {
            CaseSheet: item.id,
            DoctorInfo: item.doctorInfo,
            FollowUp: item.isFollowUp,
            appointmentType: item.appointmentType,
            DisplayId: item.displayId,
            BlobName: g(doctorType(item), 'blobName'),
          });
        }}
        PastData={item}
        navigation={props.navigation}
        onFollowUpClick={() => onFollowUpClick(item)}
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
              onPress={() => props.navigation.navigate(AppRoutes.AddRecord)}
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
        console.log('Error occured', { error });
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
        >
          {renderProfileChangeView()}
          {renderTabSwitch()}
          {!loading ? (
            selectedTab === tabs[0].title ? (
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
            )
          ) : null}
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
        <AddFilePopup
          onClickClose={() => {
            setdisplayOrderPopup(false);
          }}
          getData={(data: (PickerImage | PickerImage[])[]) => {}}
        />
      )}
    </View>
  );
};
