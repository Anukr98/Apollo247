import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { AddFilePopup } from '@aph/mobile-patients/src/components/HealthRecords/AddFilePopup';
import { HealthConsultView } from '@aph/mobile-patients/src/components/HealthRecords/HealthConsultView';
import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  AddFileIcon,
  Filter,
  NotificationIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { UserIntro } from '@aph/mobile-patients/src/components/ui/UserIntro';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import moment from 'moment';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { MedicalRecords } from '@aph/mobile-patients/src/components/HealthRecords/MedicalRecords';

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

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [FilterData, setFilterData] = useState<filterDataType[]>(filterData);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentPatient } = useAllCurrentPatients();
  const [pastarrya, setPastarrya] = useState<[]>([]);
  const [arrayValues, setarrayValues] = useState<any>();
  const client = useApolloClient();

  useEffect(() => {
    setLoading(true);
    client
      .query<getPatientPastConsultsAndPrescriptions>({
        query: GET_PAST_CONSULTS_PRESCRIPTIONS,
        fetchPolicy: 'no-cache',
        variables: {
          consultsAndOrdersInput: {
            patient: currentPatient && currentPatient.id ? currentPatient.id : '',
          },
        },
      })
      .then((_data) => {
        console.log('getPatientPastConsultsAndPrescriptions', _data!);

        interface consultsAndMedOrdersType
          extends getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults,
            getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders {
          // __typename: string
        }

        const formatDate = (date: string) =>
          moment(date)
            .clone()
            .format('YYYY-MM-DD');

        const consults = _data.data.getPatientPastConsultsAndPrescriptions!.consults || [];
        const medOrders = _data.data.getPatientPastConsultsAndPrescriptions!.medicineOrders || [];
        const consultsAndMedOrders: { [key: string]: consultsAndMedOrdersType } = {};

        consults.forEach((c) => {
          consultsAndMedOrders[c!.appointmentDateTime] = {
            ...consultsAndMedOrders[c!.appointmentDateTime],
            ...c,
          };
        });
        console.log({ consultsAndMedOrders });

        medOrders.forEach((c) => {
          consultsAndMedOrders[c!.quoteDateTime] = {
            ...consultsAndMedOrders[c!.quoteDateTime],
            ...c,
          };
        });

        console.log({ consultsAndMedOrders });
        setarrayValues(Object.keys(consultsAndMedOrders).map((i) => consultsAndMedOrders[i]));
        setLoading(false);
        // setPastarrya(_data.data.getPatientPastConsultsAndPrescriptions!.consults);
        // console.log('arraypas', pastarrya);
        // const array: { [key: string]: Object[] } = {};
        // if (
        //   _data.data &&
        //   _data.data.getPatientPastConsultsAndPrescriptions &&
        //   _data.data.getPatientPastConsultsAndPrescriptions
        // ) {
        //   _data.data.getPatientPastConsultsAndPrescriptions.consults &&
        //     _data.data.getPatientPastConsultsAndPrescriptions.consults.forEach((item) => {
        //       if (item) array[moment(item.appointmentDateTime).format('YYYY-MM-DD')] = [];
        //     });
        //   _data.data.getPatientPastConsultsAndPrescriptions.medicineOrders &&
        //     _data.data.getPatientPastConsultsAndPrescriptions.medicineOrders.forEach((item) => {
        //       if (item) array[moment(item.quoteDateTime).format('YYYY-MM-DD')] = [];
        //     });
        //   _data.data.getPatientPastConsultsAndPrescriptions.consults &&
        //     _data.data.getPatientPastConsultsAndPrescriptions.consults.forEach((item) => {
        //       if (item)
        //         array[moment(item.appointmentDateTime).format('YYYY-MM-DD')] = [
        //           ...array[moment(item.appointmentDateTime).format('YYYY-MM-DD')],
        //           item,
        //         ];
        //     });
        //   _data.data.getPatientPastConsultsAndPrescriptions.medicineOrders &&
        //     _data.data.getPatientPastConsultsAndPrescriptions.medicineOrders.forEach((item) => {
        //       if (item)
        //         array[moment(item.quoteDateTime).format('YYYY-MM-DD')] = [
        //           ...array[moment(item.quoteDateTime).format('YYYY-MM-DD')],
        //           item,
        //         ];
        //     });
        // }
        // console.log(array, 'arrayold');
        // const values = Object.values(array);
        // console.log(values, 'values');

        // if (array !== arrayValues && values.length) setarrayValues(values[1]);
        // console.log(arrayValues, 'setarrayValues');
        // console.log(values, 'array');
        // setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Heath records', error);
      });
  }, []);

  // const { data, error } = useQuery<getPatientPastConsultsAndPrescriptions>(
  //   GET_PAST_CONSULTS_PRESCRIPTIONS,
  //   {
  //     fetchPolicy: 'no-cache',
  //     variables: {
  //       consultsAndOrdersInput: {
  //         patient: currentPatient && currentPatient.id ? currentPatient.id : '',
  //       },
  //     },
  //   }
  // );
  // if (error) {
  //   console.log('error', JSON.stringify(error));
  // } else {
  //   console.log('getPatientPastConsultsAndPrescriptions', data);
  //   const array: { [key: string]: Object[] } = {};
  //   if (
  //     data &&
  //     data.getPatientPastConsultsAndPrescriptions &&
  //     data.getPatientPastConsultsAndPrescriptions
  //   ) {
  //     data.getPatientPastConsultsAndPrescriptions.consults &&
  //       data.getPatientPastConsultsAndPrescriptions.consults.forEach((item) => {
  //         if (item) array[moment(item.appointmentDateTime).format('YYYY-MM-DD')] = [];
  //       });
  //     data.getPatientPastConsultsAndPrescriptions.medicineOrders &&
  //       data.getPatientPastConsultsAndPrescriptions.medicineOrders.forEach((item) => {
  //         if (item) array[moment(item.quoteDateTime).format('YYYY-MM-DD')] = [];
  //       });
  //     data.getPatientPastConsultsAndPrescriptions.consults &&
  //       data.getPatientPastConsultsAndPrescriptions.consults.forEach((item) => {
  //         if (item)
  //           array[moment(item.appointmentDateTime).format('YYYY-MM-DD')] = [
  //             ...array[moment(item.appointmentDateTime).format('YYYY-MM-DD')],
  //             item,
  //           ];
  //       });
  //     data.getPatientPastConsultsAndPrescriptions.medicineOrders &&
  //       data.getPatientPastConsultsAndPrescriptions.medicineOrders.forEach((item) => {
  //         if (item)
  //           array[moment(item.quoteDateTime).format('YYYY-MM-DD')] = [
  //             ...array[moment(item.quoteDateTime).format('YYYY-MM-DD')],
  //             item,
  //           ];
  //       });
  //   }
  //   console.log(array, 'array');
  // }

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
              <View style={{ marginTop: 20 }}>
                <ApolloLogo />
              </View>
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                <NotificationIcon />
              </View>
            </View>
          </UserIntro>
        </View>
        <View>
          <TabsComponent
            style={{
              height: 43,
              marginTop: 236,
              backgroundColor: theme.colors.CARD_BG,
              ...theme.viewStyles.shadowStyle,
            }}
            textStyle={{
              paddingTop: 12,
            }}
            data={tabs}
            onChange={(selectedTab: string) => setselectedTab(selectedTab)}
            selectedTab={selectedTab}
          />
        </View>
      </View>
    );
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
              <View style={{ marginTop: 20 }}>
                <ApolloLogo />
              </View>
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                <NotificationIcon />
              </View>
            </View>
          </UserIntro>
        </View>
        <View>
          <TabsComponent
            style={{
              height: 43,
              marginTop: 236,
              backgroundColor: theme.colors.CARD_BG,
              ...theme.viewStyles.shadowStyle,
            }}
            textStyle={{
              paddingTop: 12,
            }}
            data={tabs}
            onChange={(selectedTab: string) => setselectedTab(selectedTab)}
            selectedTab={selectedTab}
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
        <TouchableOpacity activeOpacity={1} onPress={() => setDisplayFilter(true)}>
          <Filter />
        </TouchableOpacity>
      </View>
    );
  };

  const renderConsults = () => {
    console.log('arrayValues', arrayValues);
    return (
      <View>
        {renderFilter()}

        {arrayValues &&
          arrayValues.map((item: any) => {
            // console.log('item', item);

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
            <MedicalRecords navigation={props.navigation} />
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
          }}
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
