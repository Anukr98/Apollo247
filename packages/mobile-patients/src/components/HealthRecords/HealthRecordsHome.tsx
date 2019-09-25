import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { AddFilePopup } from '@aph/mobile-patients/src/components/HealthRecords/AddFilePopup';
import { HealthConsultView } from '@aph/mobile-patients/src/components/HealthRecords/HealthConsultView';
import { MedicalRecords } from '@aph/mobile-patients/src/components/HealthRecords/MedicalRecords';
import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  AddFileIcon,
  FileBig,
  Filter,
  NotificationIcon,
  NoData,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { UserIntro } from '@aph/mobile-patients/src/components/ui/UserIntro';
import {
  GET_PAST_CONSULTS_PRESCRIPTIONS,
  GET_MEDICAL_RECORD,
  DELETE_PATIENT_MEDICAL_RECORD,
  CHECK_IF_FOLLOWUP_BOOKED,
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
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { Button } from '../ui/Button';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords,
} from '../../graphql/types/getPatientMedicalRecords';
import { g } from '../../helpers/helperFunctions';
import {
  deletePatientMedicalRecord,
  deletePatientMedicalRecordVariables,
} from '../../graphql/types/deletePatientMedicalRecord';
import { checkIfFollowUpBooked } from '../../graphql/types/checkIfFollowUpBooked';
import { OverlayRescheduleView } from '../Consult/OverlayRescheduleView';

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

export interface HealthRecordsHomeProps extends NavigationScreenProps {}

export const HealthRecordsHome: React.FC<HealthRecordsHomeProps> = (props) => {
  const tabs = strings.health_records_home.tabs;

  const [medicalRecords, setmedicalRecords] = useState<
    (getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords | null)[] | null | undefined
  >([]);

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [FilterData, setFilterData] = useState<filterDataType[]>(filterData);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentPatient } = useAllCurrentPatients();
  const [pastarrya, setPastarrya] = useState<[]>([]);
  const [arrayValues, setarrayValues] = useState<any>();
  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [bookFollowUp, setBookFollowUp] = useState<boolean>(true);
  const [isfollowcount, setIsfollowucount] = useState<number>(0);
  const [rescheduleType, setRescheduleType] = useState<rescheduleType>();

  const [doctorId, setDoctorId] = useState<any>();
  const [doctorInfo, setDoctorInfo] = useState<any>();
  const [appointmentFollowUpId, setAppointmentFollowUpId] = useState<any>();
  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
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
    console.log(filterArray, 'filterArray', filters, 'filters', selectedOptions);

    setLoading(true);
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
        console.log('getPatientPastConsultsAndPrescriptions', _data!);

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

        // setTabs([
        //   ...tabs.map((item) =>
        //     item.title == tabs[0].title
        //       ? { ...item, count: `${consults.length + medOrders.length}` }
        //       : item
        //   ),
        // ]);
        setselectedTab(`${tabs[0].title}`);

        medOrders.forEach((c) => {
          consultsAndMedOrders[c!.quoteDateTime] = {
            ...consultsAndMedOrders[c!.quoteDateTime],
            ...c,
          };
        });
        setarrayValues(Object.keys(consultsAndMedOrders).map((i) => consultsAndMedOrders[i]));
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Heath records', error);
      });
  };

  const fetchData = useCallback((loading: boolean = false) => {
    loading && setLoading(true);
    client
      .query<getPatientMedicalRecords>({
        query: GET_MEDICAL_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        loading && setLoading(false);
        const records = g(data, 'getPatientMedicalRecords', 'medicalRecords');
        console.log('records occured', { records });
        setmedicalRecords(records);
        // setTabs([
        //   ...tabs.map((item) =>
        //     item.title == tabs[1].title
        //       ? { ...item, count: `${data.getPatientMedicalRecords!.medicalRecords!.length}` }
        //       : item
        //   ),
        // ]);
      })
      .catch((error) => {
        loading && setLoading(false);
        console.log('Error occured', { error });
      });
  }, []);

  useEffect(() => {
    fetchPastData();
    fetchData();
  }, []);

  // useEffect(() => {
  //   fetchData();
  // }, []);
  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      fetchPastData();
      fetchData(true);
      setDisplayFilter(false);
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation, fetchData]);

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
          height: 250,
          // justifyContent: 'space-between',
          ...theme.viewStyles.shadowStyle,
        }}
      >
        <View
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
        </View>
        <TabsComponent
          style={{
            marginTop: Platform.OS === 'ios' ? 205 : 216, //226,
            backgroundColor: theme.colors.CARD_BG,
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
          onPress={() => props.navigation.navigate(AppRoutes.AddRecord)}
        >
          <AddFileIcon />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => setDisplayFilter(true)}>
          <Filter />
        </TouchableOpacity>
      </View>
    );
  };

  // const consultionType = (id: string, filter: ConsultMode) => {
  //   doctorsAvailability;
  //   let filterType = false;
  //   doctorsAvailability &&
  //     doctorsAvailability.forEach((element) => {
  //       if (
  //         element &&
  //         element.doctorId === id &&
  //         element.availableModes &&
  //         element.availableModes.includes(filter)
  //       ) {
  //         filterType = true;
  //       }
  //     });
  //   return filterType;
  // };

  const renderConsults = () => {
    console.log('arrayValues', arrayValues);

    // const arrayValuesFilter =
    //   filterData[0].selectedOptions && filterData[0].selectedOptions.length
    //     ? arrayValues.filter(
    //         (item: any) => {
    //           return consultionType(item.appointmentType);
    //         }
    //         // item && item.appointmentType && filterData[0].selectedOptions.split(' ') ===
    //       )
    //     : arrayValues;
    // console.log(arrayValuesFilter, 'arrayValues', arrayValues);
    return (
      <View>
        {arrayValues && arrayValues.length !== 0 && renderFilter()}

        {arrayValues == 0 ? (
          <View style={{ justifyContent: 'center', flexDirection: 'column' }}>
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
        ) : (
          <View>
            {arrayValues &&
              arrayValues.map((item: any, i: number) => {
                //console.log('item', item);
                return (
                  <HealthConsultView
                    key={i}
                    onPressOrder={() => {
                      setdisplayOrderPopup(true);
                    }}
                    onClickCard={() => {
                      props.navigation.navigate(AppRoutes.ConsultDetails, {
                        CaseSheet: item.id,
                        DoctorInfo: item.doctorInfo,
                        FollowUp: item.isFollowUp,
                        appointmentType: item.appointmentType,
                        DisplayId: item.displayId,
                      });
                    }}
                    PastData={item}
                    navigation={props.navigation}
                    onFollowUpClick={() => onFollowUpClick(item)}
                  />
                );
              })}
          </View>
        )}
      </View>
    );
  };

  const onFollowUpClick = (item: any) => {
    let dataval =
      item.caseSheet &&
      item.caseSheet.find((obj: any) => {
        console.log('doctorType', obj);

        return (
          obj.doctorType === 'STAR_APOLLO' ||
          obj.doctorType === 'APOLLO' ||
          obj.doctorType === 'PAYROLL'
        );
      });
    console.log('dataval,', dataval.followUp);
    console.log('ite,', item);
    console.log('onFollowUpClick', item.doctorInfo);
    // setDoctorId(item.doctorInfo.id);
    // setDoctorInfo(item.doctorInfo);
    // setBookFollowUp(dataval.followUp);
    // setAppointmentFollowUpId(item.id);
    // console.log('appointmentid', appointmentFollowUpId);
    // console.log('patientid', item.patientId);
    // console.log('follwup', bookFollowUp);
    // console.log('doctorInfo', doctorInfo);
    client
      .query<checkIfFollowUpBooked>({
        query: CHECK_IF_FOLLOWUP_BOOKED,
        variables: {
          appointmentId: item.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        console.log('checkIfFollowUpBooked', data);
        console.log('checkIfFollowUpBookedcount', data.checkIfFollowUpBooked);
        setIsfollowucount(data.checkIfFollowUpBooked);
        console.log('setIsfollowucount', data.checkIfFollowUpBooked);
        setdisplayoverlay(true);
        props.navigation.push(AppRoutes.ConsultDetails, {
          CaseSheet: item.id,
          DoctorInfo: item.doctorInfo,
          FollowUp: dataval.followUp,
          appointmentType: item.appointmentType,
          DisplayId: item.displayId,
          Displayoverlay: true,
          isFollowcount: data.checkIfFollowUpBooked,
        });
      })
      .catch((error) => {
        console.log('Error occured', { error });
      });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* {displayoverlay && doctorInfo && (
        <OverlayRescheduleView
          setdisplayoverlay={() => setdisplayoverlay(false)}
          navigation={props.navigation}
          doctor={doctorInfo ? doctorInfo : null}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={doctorInfo && doctorInfo.doctorHospital ? doctorInfo.doctorHospital : []}
          doctorId={doctorId}
          renderTab={'Consult Online'}
          rescheduleCount={rescheduleType!}
          appointmentId={appointmentFollowUpId}
          bookFollowUp={bookFollowUp}
          data={doctorInfo && doctorInfo}
          KeyFollow={'Followup'}
          isfollowupcount={isfollowcount}
        />
      )} */}

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
              setLoading(false);
            }, 500);
          }}
        />
      )}
      {displayOrderPopup && (
        <AddFilePopup
          onClickClose={() => {
            setdisplayOrderPopup(false);
          }}
          getData={(data: (PickerImage | PickerImage[])[]) => {
            console.log(data);
          }}
        />
      )}
      {loading && <Spinner />}
    </View>
  );
};
