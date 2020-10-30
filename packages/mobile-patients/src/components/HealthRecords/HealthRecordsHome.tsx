import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  AccountCircleDarkIcon,
  BloodIcon,
  HeightIcon,
  WeightIcon,
  ArrowRight,
  HealthConditionPhrIcon,
  LabTestIcon,
  ClinicalDocumentPhrIcon,
  PrescriptionPhrIcon,
  BillPhrIcon,
  InsurancePhrIcon,
  HospitalPhrIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_MEDICAL_PRISM_RECORD,
  GET_PAST_CONSULTS_PRESCRIPTIONS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults as ConsultsType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders as medicineOrders,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
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
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TextInput, Image } from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import _ from 'lodash';
import { ListItem } from 'react-native-elements';

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
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
  selectedMemberTextStyle: {
    ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, '#FC9916', 1, 24),
    marginLeft: 8,
  },
  userHeightTextStyle: {
    ...theme.viewStyles.text('SB', 16, '#02475B', 1, 20.8),
    paddingLeft: 10,
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  userBloodTextStyle: {
    ...theme.viewStyles.text('R', 12, '#00B38E', 1, 16),
  },
  profileDetailsMainViewStyle: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingTop: 26,
    paddingHorizontal: 18,
    paddingBottom: 70,
  },
  profileDetailsCardView: {
    ...theme.viewStyles.cardViewStyle,
    width: '100%',
    position: 'absolute',
    alignSelf: 'center',
    bottom: -22,
  },
  profileDetailsViewStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 18,
    marginLeft: 22,
    marginRight: 25,
  },
  heightWeightViewStyle: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  separatorLineStyle: {
    width: 0.5,
    backgroundColor: 'rgba(2,71,91,0.2)',
    marginHorizontal: 10,
    marginBottom: 0,
  },
  listItemTitleStyle: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 21),
    paddingHorizontal: 6,
    paddingLeft: 14,
  },
  listItemViewStyle: {
    paddingLeft: 0,
    paddingRight: 3,
    marginTop: 7,
    borderBottomColor: 'rgba(2,71,91,0.2)',
    borderBottomWidth: 0.5,
  },
  listItemCardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 11,
    paddingLeft: 18,
    paddingRight: 25,
  },
  clinicalDocumentViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 11,
    paddingLeft: 18,
    paddingRight: 25,
    marginBottom: 50,
    marginHorizontal: 20,
  },
});

export interface HealthRecordsHomeProps extends NavigationScreenProps {}

export const HealthRecordsHome: React.FC<HealthRecordsHomeProps> = (props) => {
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

  const [consultsData, setConsultsData] = useState<(ConsultsType | null)[] | null>(null);
  const [medicineOrders, setMedicineOrders] = useState<(medicineOrders | null)[] | null>(null);
  const [combination, setCombination] = useState<{ type: string; data: any }[]>();
  const { loading, setLoading } = useUIElements();
  const [prismdataLoader, setPrismdataLoader] = useState<boolean>(false);
  const [pastDataLoader, setPastDataLoader] = useState<boolean>(false);
  const [arrayValues, setarrayValues] = useState<any>();
  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [callApi, setCallApi] = useState(true);

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
    if (selectedOptions.includes('Online')) filterArray.push('ONLINE');
    if (selectedOptions.includes('Physical')) filterArray.push('PHYSICAL');
    if (selectedOptions.includes('All Consults')) {
      !filterArray.includes('ONLINE') && filterArray.push('ONLINE');
      !filterArray.includes('PHYSICAL') && filterArray.push('PHYSICAL');
    }
    setPastDataLoader(true);
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
      return date1 > date2 ? -1 : date1 < date2 ? 1 : data2.id - data1.id;
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
      if (callApi) {
        fetchPastData();
        fetchTestData();
      }
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation, currentPatient, callApi]);

  useEffect(() => {
    if (consultsData && medicineOrders && prescriptions) {
      let mergeArray: { type: string; data: any }[] = [];
      arrayValues?.forEach((item: any) => {
        item['myPrescriptionName'] = 'Prescription';
        mergeArray.push({ type: 'pastConsults', data: item });
      });
      prescriptions?.forEach((c) => {
        mergeArray.push({ type: 'prescriptions', data: c });
      });
      setCombination(sortByDate(mergeArray));
    }
  }, [arrayValues, prescriptions]);

  const tabsClickedWebEngageEvent = (webEngageEventName: WebEngageEventName) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.MEDICAL_RECORDS] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(webEngageEventName, eventAttributes);
  };

  const renderProfileImage = () => {
    return currentPatient?.photoUrl?.match(
      /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/
    ) ? (
      <Image
        source={{ uri: currentPatient?.photoUrl }}
        style={{ height: 30, width: 30, borderRadius: 15, marginTop: 8 }}
      />
    ) : (
      <AccountCircleDarkIcon
        style={{
          height: 36,
          width: 36,
          borderRadius: 18,
          marginTop: 5,
        }}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        title={'HEALTH RECORDS'}
        leftIcon={'homeIcon'}
        rightComponent={
          <ProfileList
            showProfilePic={true}
            navigation={props.navigation}
            saveUserChange={true}
            childView={renderProfileImage()}
            listContainerStyle={{ marginLeft: 6, marginTop: 44 }}
            selectedProfile={profile}
            setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
            unsetloaderDisplay={true}
          ></ProfileList>
        }
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => {
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
            })
          );
        }}
      />
    );
  };

  const renderProfileDetailsView = () => {
    const separatorLineView = () => {
      return <View style={styles.separatorLineStyle} />;
    };

    const patientTextView = (text: string) => {
      return (
        <Text numberOfLines={1} style={styles.userHeightTextStyle}>
          {text}
        </Text>
      );
    };

    return (
      <View style={styles.profileDetailsMainViewStyle}>
        <View style={{ flexDirection: 'row' }}>
          {renderProfileImage()}
          <View style={{ marginLeft: 8 }}>
            <Text
              style={{ ...theme.viewStyles.text('SB', 36, '#02475B', 1, 47) }}
              numberOfLines={1}
            >
              {'hi ' + (currentPatient && currentPatient!.firstName!.toLowerCase() + '!') || ''}
            </Text>
            <View>
              <Text style={{ ...theme.viewStyles.text('R', 18, '#67919D', 1, 21) }}>
                {moment(currentPatient?.dateOfBirth).format('DD MMM YYYY')}
                {'    |    '}
                {_.capitalize(currentPatient?.gender) || ''}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.profileDetailsCardView}>
          <View style={styles.profileDetailsViewStyle}>
            <View style={{ flex: 1 }}>
              <View style={{ paddingLeft: 30 }}>
                <Text style={styles.userBloodTextStyle}>{'Height'}</Text>
              </View>
              <View style={styles.heightWeightViewStyle}>
                <HeightIcon style={{ width: 14, height: 22.14 }} />
                {currentPatient?.patientMedicalHistory?.height &&
                currentPatient?.patientMedicalHistory?.height !== 'No Idea' &&
                currentPatient?.patientMedicalHistory?.height !== 'Not Recorded' ? (
                  patientTextView(currentPatient?.patientMedicalHistory?.height || '')
                ) : (
                  <TextInput
                    placeholder={'-'}
                    style={styles.userHeightTextStyle}
                    numberOfLines={1}
                    underlineColorAndroid={'transparent'}
                  />
                )}
              </View>
            </View>
            {separatorLineView()}
            <View style={{ flex: 1 }}>
              <View style={{ paddingLeft: 25 }}>
                <Text style={styles.userBloodTextStyle}>{'Weight'}</Text>
              </View>
              <View style={styles.heightWeightViewStyle}>
                <WeightIcon style={{ width: 14, height: 14, paddingBottom: 8 }} />
                {currentPatient?.patientMedicalHistory?.weight &&
                currentPatient?.patientMedicalHistory?.weight !== 'No Idea' &&
                currentPatient?.patientMedicalHistory?.weight !== 'Not Recorded' ? (
                  patientTextView(
                    currentPatient?.patientMedicalHistory?.weight
                      ? currentPatient?.patientMedicalHistory?.weight + ' kg'
                      : ''
                  )
                ) : (
                  <TextInput
                    placeholder={'-'}
                    style={styles.userHeightTextStyle}
                    underlineColorAndroid={'transparent'}
                  />
                )}
              </View>
            </View>
            {separatorLineView()}
            <View style={{ flex: 1 }}>
              <View style={{ paddingLeft: 23 }}>
                <Text style={styles.userBloodTextStyle}>{'Blood'}</Text>
              </View>
              <View style={styles.heightWeightViewStyle}>
                <BloodIcon style={{ width: 14, height: 15.58 }} />
                {false ? (
                  <TextInput
                    placeholder={'-'}
                    style={styles.userHeightTextStyle}
                    underlineColorAndroid={'transparent'}
                  />
                ) : (
                  patientTextView('B+')
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const onBackArrowPressed = () => {
    setCallApi(false);
  };

  const renderListItemView = (title: string, id: number) => {
    const renderLeftAvatar = () => {
      switch (id) {
        case 1:
          return <PrescriptionPhrIcon style={{ height: 23, width: 20 }} />;
        case 2:
          return <LabTestIcon style={{ height: 21.3, width: 20 }} />;
        case 3:
          return <HospitalPhrIcon style={{ height: 23.3, width: 20 }} />;
        case 4:
          return <HealthConditionPhrIcon style={{ height: 24.94, width: 20 }} />;
        case 5:
          return <BillPhrIcon style={{ height: 18.63, width: 24 }} />;
        case 6:
          return <InsurancePhrIcon style={{ height: 16.71, width: 20 }} />;
        case 7:
          return <ClinicalDocumentPhrIcon style={{ height: 27.92, width: 20 }} />;
      }
    };

    const onPressListItem = () => {
      switch (id) {
        case 1:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_VIEW_PRESCRIPTIONS);
          props.navigation.navigate(AppRoutes.ConsultRxScreen, {
            consultRxData: combination,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 2:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_VIEW_LAB_TESTS);
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_VIEW_HEALTH_CHECKS);
          props.navigation.navigate(AppRoutes.TestReportScreen);
          break;
        case 3:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_VIEW_HOSPITALIZATIONS);
          props.navigation.navigate(AppRoutes.HospitalizationScreen);
          break;
        case 4:
          props.navigation.navigate(AppRoutes.HealthConditionScreen);
          break;
        case 5:
          props.navigation.navigate(AppRoutes.BillScreen);
          break;
        case 6:
          props.navigation.navigate(AppRoutes.InsuranceScreen);
          break;
        case 7:
          props.navigation.navigate(AppRoutes.ClinicalDocumentScreen);
          break;
      }
    };

    return (
      <ListItem
        title={title}
        titleProps={{ numberOfLines: 1 }}
        titleStyle={styles.listItemTitleStyle}
        pad={0}
        containerStyle={[
          styles.listItemViewStyle,
          (id === 7 || id === 4 || id === 6) && { borderBottomWidth: 0 },
        ]}
        underlayColor={'#FFFFFF'}
        activeOpacity={1}
        onPress={onPressListItem}
        leftAvatar={renderLeftAvatar()}
        rightAvatar={<ArrowRight style={{ height: 24, width: 24 }} />}
      />
    );
  };

  const renderHealthCategoriesView = () => {
    return (
      <View style={{ marginTop: 54, marginHorizontal: 20, marginBottom: 25 }}>
        <Text style={{ ...theme.viewStyles.text('B', 18, '#02475B', 1, 21) }}>
          {'Health Categories'}
        </Text>
        <View style={styles.listItemCardStyle}>
          {renderListItemView('Doctor Consultations', 1)}
          {renderListItemView('Test Reports', 2)}
          {renderListItemView('Hospitalization', 3)}
          {renderListItemView('Health Conditions', 4)}
        </View>
      </View>
    );
  };

  const renderBillsInsuranceView = () => {
    return (
      <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
        <Text style={{ ...theme.viewStyles.text('B', 18, '#02475B', 1, 21) }}>
          {'More From Health'}
        </Text>
        <View style={styles.listItemCardStyle}>
          {renderListItemView('Bills', 5)}
          {renderListItemView('Insurance', 6)}
        </View>
      </View>
    );
  };

  const renderClinicalDocumentsView = () => {
    return (
      <View style={styles.clinicalDocumentViewStyle}>
        {renderListItemView('Clinical Documents', 7)}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderProfileDetailsView()}
          {renderHealthCategoriesView()}
          {renderBillsInsuranceView()}
          {renderClinicalDocumentsView()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
