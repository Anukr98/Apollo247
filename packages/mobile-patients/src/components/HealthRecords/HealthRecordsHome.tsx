import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { AddFilePopup } from '@aph/mobile-patients/src/components/HealthRecords/AddFilePopup';
import { HealthConsultView } from '@aph/mobile-patients/src/components/HealthRecords/HealthConsultView';
import { MedicalRecords } from '@aph/mobile-patients/src/components/HealthRecords/MedicalRecords';
// import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  AddFileIcon,
  FileBig,
  Filter,
  NotificationIcon,
  NoData,
  DropdownGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { UserIntro } from '@aph/mobile-patients/src/components/ui/UserIntro';
import {
  GET_PAST_CONSULTS_PRESCRIPTIONS,
  GET_MEDICAL_RECORD,
  DELETE_PATIENT_MEDICAL_RECORD,
  CHECK_IF_FOLLOWUP_BOOKED,
  GET_MEDICAL_PRISM_RECORD,
} from '@aph/mobile-patients/src/graphql/profiles';
import { getPatientPastConsultsAndPrescriptions } from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState, useCallback } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  AsyncStorage,
  Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps, StackActions, NavigationActions, FlatList } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords,
} from '@aph/mobile-patients/src/graphql/types/getPatientMedicalRecords';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  deletePatientMedicalRecord,
  deletePatientMedicalRecordVariables,
} from '@aph/mobile-patients/src/graphql/types/deletePatientMedicalRecord';
import { checkIfFollowUpBooked } from '@aph/mobile-patients/src/graphql/types/checkIfFollowUpBooked';
import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { AddProfile } from '@aph/mobile-patients/src/components/ui/AddProfile';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { useUIElements } from '../UIElementsProvider';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations,
} from '../../graphql/types/getPatientPrismMedicalRecords';

const { width, height } = Dimensions.get('window');

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

  const [pastarrya, setPastarrya] = useState<[]>([]);
  const [arrayValues, setarrayValues] = useState<any>();
  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [isfollowcount, setIsfollowucount] = useState<number>(0);
  const { allCurrentPatients, setCurrentPatientId, currentPatient } = useAllCurrentPatients();
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();

  useEffect(() => {
    currentPatient && setProfile(currentPatient!);
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const fetchPastData = (filters: filterDataType[] = []) => {
    const filterArray = [];
    const selectedOptions =
      filters.length > 0 && filters[0].selectedOptions ? filters[0].selectedOptions : [];
    if (selectedOptions.includes('Online Consults')) filterArray.push('ONLINE');
    if (selectedOptions.includes('Clinic Visits')) filterArray.push('PHYSICAL');
    if (selectedOptions.includes('Prescriptions')) filterArray.push('PRESCRIPTION');

    setLoading && setLoading(true);
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
        const formatDate = (date: string) =>
          moment(date)
            .clone()
            .format('YYYY-MM-DD');

        const consults = _data.data.getPatientPastConsultsAndPrescriptions!.consults || [];
        const medOrders = _data.data.getPatientPastConsultsAndPrescriptions!.medicineOrders || [];
        const consultsAndMedOrders: { [key: string]: any } = {};

        const ok = consults.forEach((c) => {
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
          );

        // console.log('sort', array);
        setarrayValues(array);
        //setarrayValues(Object.keys(consultsAndMedOrders).map((i) => consultsAndMedOrders[i]));

        setLoading && setLoading(false);
      })
      .catch((e) => {
        setLoading && setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Heath records', error);
        //Alert.alert('Error', error);
      });
  };

  const fetchData = useCallback(
    (loading: boolean = false) => {
      loading && setLoading && setLoading(true);
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
          loading && setLoading && setLoading(false);
          const records = g(data, 'getPatientMedicalRecords', 'medicalRecords');
          setmedicalRecords(records);
        })
        .catch((error) => {
          loading && setLoading && setLoading(false);
          console.log('Error occured', { error });
          //Alert.alert('Error', error.message);
        });
    },
    [currentPatient]
  );

  const fetchTestData = useCallback(
    (loading: boolean = false) => {
      loading && setLoading && setLoading(true);
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
          loading && setLoading && setLoading(false);
          const labTestsData = g(data, 'getPatientPrismMedicalRecords', 'labTests');
          const healthChecksData = g(data, 'getPatientPrismMedicalRecords', 'healthChecks');
          const hospitalizationsData = g(data, 'getPatientPrismMedicalRecords', 'hospitalizations');
          setlabTests(labTestsData);
          sethealthChecks(healthChecksData);
          sethospitalizations(hospitalizationsData);
        })
        .catch((error) => {
          loading && setLoading && setLoading(false);
          console.log('Error occured', { error });
          //Alert.alert('Error', error.message);
        });
    },
    [currentPatient]
  );

  useEffect(() => {
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
        const newRecords = medicalRecords!.filter((record: any) => record!.id != MedicaId);
        setmedicalRecords(newRecords);
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while render Delete MedicalOrder', errorMessage, error);
        Alert.alert('Error', errorMessage);
      });
  };
  const renderTopView = () => {
    return (
      <View
        style={{
          //height: 250,
          // justifyContent: 'space-between',
          //...theme.viewStyles.shadowStyle,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            paddingTop: 16,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.WHITE,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            // onPress={() => props.navigation.popToTop()}
            onPress={() => {
              props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
                })
              );
            }}
          >
            <ApolloLogo />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <NotificationIcon />
          </View>
        </View>
        <View>
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
                <View>
                  <Text style={styles.nameTextStyle}>
                    {(currentPatient && currentPatient!.firstName!.toLowerCase()) || ''}
                  </Text>
                  <View style={styles.seperatorStyle} />
                </View>
                <View style={{ paddingTop: 15 }}>
                  <DropdownGreen />
                </View>
              </View>
            }
            selectedProfile={profile}
            setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
            unsetloaderDisplay={true}
          ></ProfileList>
          {/* <MaterialMenu
            onPress={(item) => {
              const val = (allCurrentPatients || []).find(
                (_item) => _item.firstName == item.value.toString()
              );
              setCurrentPatientId!(val!.id);
              AsyncStorage.setItem('selectUserId', val!.id);
            }}
            options={
              allCurrentPatients &&
              allCurrentPatients!.map((item) => {
                return { key: item.id, value: item.firstName };
              })
            }
            menuContainerStyle={{
              alignItems: 'flex-end',
              marginTop: 16,
              marginLeft: width / 2 - 95,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                paddingRight: 8,
                borderRightWidth: 0.5,
                borderRightColor: 'rgba(2, 71, 91, 0.2)',
              }}
            >
              <Text style={styles.hiTextStyle}>hi</Text>
              <View>
                <Text style={styles.nameTextStyle}>{userName}</Text>
                <View style={styles.seperatorStyle} />
              </View>
              <View style={{ paddingTop: 15 }}>
                <DropdownGreen />
              </View>
            </View>
          </MaterialMenu> */}
        </View>
        {/* <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <UserIntro
            description={strings.health_records_home.description}
            style={{
              height: 190, //236,
            }}
          >
            <View
              style={{
                height: 83,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: 20,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={{ marginTop: 20 }}
                onPress={() => {
                  CommonLogEvent('HEALTH_RECORD_HOME', 'Navigate back to consult room'),
                    props.navigation.replace(AppRoutes.ConsultRoom);
                }}
              >
                <ApolloLogo />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                <NotificationIcon />
              </View>
            </View>
          </UserIntro>
        </View> */}
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
      </View>
    );
  };

  const renderFilter = () => {
    return (
      <View style={styles.filterViewStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => (
            CommonLogEvent('HEALTH_RECORD_HOME', 'Navigate to add record'),
            props.navigation.navigate(AppRoutes.AddRecord)
          )}
        >
          <AddFileIcon />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => setDisplayFilter(true)}>
          <Filter />
        </TouchableOpacity>
      </View>
    );
  };

  const renderConsult = (item: any, index: number) => {
    let dataval =
      item.caseSheet &&
      item.caseSheet.find((obj: any) => {
        return (
          obj.doctorType === 'STAR_APOLLO' ||
          obj.doctorType === 'APOLLO' ||
          obj.doctorType === 'PAYROLL'
        );
      });

    return (
      <HealthConsultView
        key={index}
        onPressOrder={() => {
          CommonLogEvent('HEALTH_RECORD_HOME', 'Display order popup'), setdisplayOrderPopup(true);
        }}
        onClickCard={() => {
          props.navigation.navigate(AppRoutes.ConsultDetails, {
            CaseSheet: item.id,
            DoctorInfo: item.doctorInfo,
            FollowUp: item.isFollowUp,
            appointmentType: item.appointmentType,
            DisplayId: item.displayId,
            BlobName: g(dataval, 'blobName'),
          });
        }}
        PastData={item}
        navigation={props.navigation}
        onFollowUpClick={() => onFollowUpClick(item)}
      />
    );
  };

  const renderEmptyConsult = () => {
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
          You don’t have any records with us right now. {'\n'}Add a record to keep everything handy
          in one place!
        </Text>
        <View style={{ marginLeft: 60, marginRight: 60, marginBottom: 20 }}>
          <Button
            title="ADD RECORD"
            onPress={() => props.navigation.navigate(AppRoutes.AddRecord)}
          />
        </View>
      </View>
    );
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
    let dataval =
      item.caseSheet &&
      item.caseSheet.find((obj: any) => {
        return (
          obj.doctorType === 'STAR_APOLLO' ||
          obj.doctorType === 'APOLLO' ||
          obj.doctorType === 'PAYROLL'
        );
      });

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

        setIsfollowucount(data.checkIfFollowUpBooked);
        setdisplayoverlay(true);
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
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderTopView()}
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
        <AddFilePopup
          onClickClose={() => {
            setdisplayOrderPopup(false);
          }}
          getData={(data: (PickerImage | PickerImage[])[]) => {}}
        />
      )}
      {/* {displayAddProfile && (
        <AddProfile
          setdisplayoverlay={setDisplayAddProfile}
          setProfile={(profile) => {
            setProfile(profile);
          }}
        />
      )} */}
    </View>
  );
};
