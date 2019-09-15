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
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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
  const [tabs, setTabs] = useState(strings.health_records_home.tabs);
  const [selectedTab, setselectedTab] = useState<string>(`${tabs[0].title} - ${tabs[0].count}`);

  const [FilterData, setFilterData] = useState<filterDataType[]>(filterData);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentPatient } = useAllCurrentPatients();
  const [pastarrya, setPastarrya] = useState<[]>([]);
  const [arrayValues, setarrayValues] = useState<any>();
  const [medicalRecords, setmedicalRecords] = useState<
    (getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords | null)[] | null | undefined
  >([]);
  const client = useApolloClient();

  useEffect(() => {
    //console.log("currentPatient && currentPatient.id ? currentPatient.id : ''", currentPatient!.id);
    setLoading(true);
    client
      .query<getPatientPastConsultsAndPrescriptions>({
        query: GET_PAST_CONSULTS_PRESCRIPTIONS,
        fetchPolicy: 'no-cache',
        variables: {
          consultsAndOrdersInput: {
            patient: currentPatient && currentPatient.id ? currentPatient.id : '',
            //filter: ['PHYSICAL'],
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
        console.log(consults.length + medOrders.length, 'ok');

        setTabs([
          ...tabs.map((item) =>
            item.title == tabs[0].title
              ? { ...item, count: `${consults.length + medOrders.length}` }
              : item
          ),
        ]);
        setselectedTab(`${tabs[0].title} - ${consults.length + medOrders.length}`);

        medOrders.forEach((c) => {
          consultsAndMedOrders[c!.quoteDateTime] = {
            ...consultsAndMedOrders[c!.quoteDateTime],
            ...c,
          };
        });

        // console.log({ consultsAndMedOrders });
        setarrayValues(Object.keys(consultsAndMedOrders).map((i) => consultsAndMedOrders[i]));
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Heath records', error);
      });
  }, []);

  const fetchData = () => {
    client
      .query<getPatientMedicalRecords>({
        query: GET_MEDICAL_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        const records = g(data, 'getPatientMedicalRecords', 'medicalRecords');
        // console.log('getPatientMedicalRecords', data, records);
        setmedicalRecords(records);
        setTabs([
          ...tabs.map((item) =>
            item.title == tabs[1].title
              ? { ...item, count: `${data.getPatientMedicalRecords!.medicalRecords!.length}` }
              : item
          ),
        ]);
      })
      .catch((error) => {
        console.log('Error occured', { error });
      });
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      //console.log('didFocus', payload);
      //console.log('api call back', payload);
      fetchData();
    });
  }, [props.navigation, fetchData]);

  const renderDeleteMedicalOrder = (MedicaId: string) => {
    client
      .mutate<deletePatientMedicalRecord, deletePatientMedicalRecordVariables>({
        mutation: DELETE_PATIENT_MEDICAL_RECORD,
        variables: { recordId: MedicaId },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        //console.log('renderDeleteMedicalOrder', _data);
        // console.log('Before', medicalRecords);
        const newRecords = medicalRecords!.filter((record: any) => record!.id != MedicaId);
        // console.log('After', { newRecords });
        setmedicalRecords(newRecords);
        setTabs([
          ...tabs.map((item) =>
            item.title == tabs[1].title ? { ...item, count: `${newRecords.length}` } : item
          ),
        ]);
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
                style={{ marginTop: 20 }}
                onPress={() => props.navigation.replace(AppRoutes.ConsultRoom)}
              >
                <ApolloLogo />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                <NotificationIcon />
              </View>
            </View>
          </UserIntro>
        </View>
        <View>
          <TabsComponent
            style={{
              marginTop: 226,
              backgroundColor: theme.colors.CARD_BG,
              ...theme.viewStyles.shadowStyle,
            }}
            height={44}
            data={tabs.map((item) => ({ title: `${item.title} - ${item.count}` }))}
            onChange={(selectedTab: string) => setselectedTab(selectedTab)}
            selectedTab={`${
              tabs.find(
                (item) =>
                  selectedTab.indexOf(item.title) > -1 || item.title.indexOf(selectedTab) > -1
              )!.title
            } - ${
              tabs.find(
                (item) =>
                  selectedTab.indexOf(item.title) > -1 || item.title.indexOf(selectedTab) > -1
              )!.count
            }`}
          />
        </View>
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
        {/* <TouchableOpacity activeOpacity={1} onPress={() => setDisplayFilter(true)}>
          <Filter />
        </TouchableOpacity> */}
      </View>
    );
  };

  const renderConsults = () => {
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
                marginBottom: 25,
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
              arrayValues.map((item: any) => {
                return (
                  <HealthConsultView
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
          {selectedTab === `${tabs[0].title} - ${tabs[0].count}` ? (
            renderConsults()
          ) : (
            <MedicalRecords
              navigation={props.navigation}
              onTabCount={(count) => {
                // console.log({ count });
                setTabs([
                  ...tabs.map((item) =>
                    item.title == tabs[1].title ? { ...item, count: `${count}` } : item
                  ),
                ]);
              }}
              MedicalRecordData={medicalRecords}
              renderDeleteMedicalOrder={renderDeleteMedicalOrder}
            />
          )}
        </ScrollView>
      </SafeAreaView>
      {displayFilter && (
        <FilterScene
          onClickClose={(data: filterDataType[]) => {
            // console.log('filterDataType', data[0].selectedOptions);
            setDisplayFilter(false);
            setFilterData(data);
          }}
          setData={(data) => {
            setFilterData(data);
          }}
          filterLength={() => {}}
          data={FilterData}
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
