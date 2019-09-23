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
} from '@aph/mobile-patients/src/graphql/profiles';
import { getPatientPastConsultsAndPrescriptions } from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState, useCallback } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
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

  const fetchData = useCallback(() => {
    client
      .query<getPatientMedicalRecords>({
        query: GET_MEDICAL_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        setLoading(false);
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
        setLoading(false);
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
      fetchData();
      setLoading(true);
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
          height: 280,
          // justifyContent: 'space-between',
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
              height: 236,
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
            marginTop: 226,
            backgroundColor: theme.colors.CARD_BG,
            ...theme.viewStyles.shadowStyle,
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
        {renderFilter()}

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
                      });
                    }}
                    PastData={item}
                    navigation={props.navigation}
                  />
                );
              })}
          </View>
        )}
      </View>
    );
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
