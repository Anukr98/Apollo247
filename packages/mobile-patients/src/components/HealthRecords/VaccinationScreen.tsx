import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SectionList,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  g,
  initialSortByDays,
  handleGraphQlError,
  editDeleteData,
  postCleverTapPHR,
  postCleverTapIfNewSession,
  postWebEngagePHR,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  deletePatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  postWebEngageEvent,
  postWebEngageIfNewSession,
  removeObjectProperty,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

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
  searchBarMainViewStyle: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 22,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  searchBarViewStyle: {
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    padding: 10,
    flex: 1,
    alignItems: 'center',
    borderRadius: 5,
  },
  cancelTextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SKY_BLUE, 1, 15.6),
    marginLeft: 18,
  },
  textInputStyle: {
    ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE, 1, 18),
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 1,
  },
  loaderViewStyle: { justifyContent: 'center', flex: 1, alignItems: 'center' },
  loaderStyle: { height: 100, backgroundColor: 'transparent', alignSelf: 'center' },
  healthRecordTypeTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SILVER_LIGHT, 1, 21),
    marginHorizontal: 13,
  },
  healthRecordTypeViewStyle: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchListHeaderViewStyle: { marginHorizontal: 17, marginVertical: 15 },
  searchListHeaderTextStyle: { ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 21) },
  phrNodataMainViewStyle: { marginTop: 59, backgroundColor: 'transparent' },
  searchBarMainView: { flexDirection: 'row', alignItems: 'center' },
  doctorTestReportPHRTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SKY_BLUE, 1, 14),
    marginLeft: 20,
    marginBottom: 10,
    marginRight: 32,
    marginTop: 2,
  },
});

export interface VaccinationScreenProps extends NavigationScreenProps<{}> {}

export const VaccinationScreen: React.FC<VaccinationScreenProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { phrSession, setPhrSession } = useAppCommonData();
  const client = useApolloClient();
  const [callApi, setCallApi] = useState(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [localVaccinationData, setLocalVaccinationData] = useState<Array<{
    key: string;
    data: any[];
  }> | null>(null);
  const [callApiErr, setCallApiErr] = useState(false);

  const gotoPHRHomeScreen = () => {
    props.navigation.goBack();
  };

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    gotoPHRHomeScreen();
    return true;
  };

  const getLatestLabAndHealthCheckRecords = () => {
    setShowSpinner(true);
    let finalData: { key: string; data: any[] }[] = [];
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [MedicalRecordType.IMMUNIZATION])
      .then((data: any) => {
        const immunizations = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'immunizations',
          'response'
        );
        if (!!immunizations) {
          finalData = initialSortByDays('immunization', immunizations, finalData);
          setLocalVaccinationData(finalData);
        }
        setShowSpinner(false);
      })
      .catch((error) => {
        setShowSpinner(false);
        setCallApiErr(true);
        CommonBugFender('VaccinationScreen_getPatientPrismMedicalRecordsApi', error);
        currentPatient && handleGraphQlError(error);
      });
  };

  useEffect(() => {
    getLatestLabAndHealthCheckRecords();
  }, [callApi]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

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
        title={'VACCINATION'}
        leftIcon={'backArrow'}
        rightComponent={renderProfileImage()}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={gotoPHRHomeScreen}
      />
    );
  };

  const onPressEditPrismMedicalRecords = (selectedItem: any) => {
    setCallApi(false);
    props.navigation.navigate(AppRoutes.AddVaccinationRecord, {
      navigatedFrom: 'Vaccination Screen',
      recordType: MedicalRecordType.IMMUNIZATION,
      selectedRecordID: selectedItem?.id,
      selectedRecord: selectedItem,
      update: true,
      onRecordAdded: onRecordAdded,
    });
  };

  const onPressDeletePrismMedicalRecords = (selectedItem: any) => {
    setShowSpinner(true);
    deletePatientPrismMedicalRecords(
      client,
      selectedItem?.id,
      currentPatient?.id || '',
      MedicalRecordType.IMMUNIZATION
    )
      .then((status) => {
        if (status) {
          const eventInputData = removeObjectProperty(selectedItem, 'immunizations');
          postCleverTapPHR(
            currentPatient,
            CleverTapEventName.PHR_DELETE_VACCINATION_REPORT,
            'Vaccination Screen',
            eventInputData
          );
          getLatestLabAndHealthCheckRecords();
        } else {
          setShowSpinner(false);
        }
      })
      .catch((error) => {
        CommonBugFender('TestReportScreen_deletePatientPrismMedicalRecords', error);
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const onHealthCardItemPress = (selectedItem: any) => {
    props.navigation.navigate(AppRoutes.VaccinationDoseScreen, {
      data: selectedItem,
    });
  };

  const renderTestReportsItems = (item: any, index: number) => {
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
    const soureName = item?.source === '247self' ? 'Self upload' : item?.hospitalName;
    const dateText = getPresctionDate(item?.dateOfImmunization || item?.followUpDate);
    const doseType = item?.batchno === '1' ? 'Dose 1' : 'Dose 2';
    const sourceType = true;
    const showEditDeleteOption =
      soureName === string.common.clicnical_document_text || soureName === '247self' ? true : false;
    const hideEditDeleteOption = item?.data?.healthCheckName && showEditDeleteOption ? true : false;
    return (
      <HealthRecordCard
        item={item}
        index={index}
        editDeleteData={editDeleteData(MedicalRecordType.IMMUNIZATION)}
        showUpdateDeleteOption={showEditDeleteOption}
        hideUpdateDeleteOption={hideEditDeleteOption}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
        onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
        onDeletePress={(selectItem) => onPressDeletePrismMedicalRecords(selectItem)}
        prescriptionName={doseType}
        doctorName={item?.vaccineName}
        dateText={dateText}
        selfUpload={sourceType}
        sourceName={soureName || 'N/A'}
        deleteRecordText={'test results'}
      />
    );
  };

  const renderTestReports = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localVaccinationData || []}
        renderItem={({ item, index }) => renderTestReportsItems(item, index)}
        ListEmptyComponent={renderEmptyList()}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
      />
    );
  };

  const renderEmptyList = () => {
    if (showSpinner) {
      return null;
    } else {
      return <PhrNoDataComponent />;
    }
  };

  const onRecordAdded = () => {
    setCallApi(true);
  };

  const renderAddVaccination = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={'ADD VACCINATION'}
          onPress={() => {
            const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
              Source: 'Vaccination',
            };
            postWebEngageEvent(WebEngageEventName.ADD_VACCINATION_RECORD, eventAttributes);
            setCallApi(false);
            props.navigation.navigate(AppRoutes.AddVaccinationRecord, {
              navigatedFrom: 'Vaccination ',
              recordType: MedicalRecordType.IMMUNIZATION,
              onRecordAdded: onRecordAdded,
              update: false,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderHeaderTitle = () => {
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, theme.colors.LIGHT_BLUE, 1, 30) }}>
          {'Vaccination'}
        </Text>
      </View>
    );
  };

  const renderTestReportsMainView = () => {
    return (
      <>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderTestReports()}
        </ScrollView>
        {renderAddVaccination()}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {!showSpinner && !callApiErr ? renderHeaderTitle() : null}
        {renderTestReportsMainView()}
      </SafeAreaView>
    </View>
  );
};
