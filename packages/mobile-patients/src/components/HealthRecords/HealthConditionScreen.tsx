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
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  PhrAllergyIcon,
  PhrMedicalIcon,
  PhrMedicationIcon,
  PhrRestrictionIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  g,
  getPrescriptionDate,
  initialSortByDays,
  editDeleteData,
  getSourceName,
  handleGraphQlError,
  phrSortWithDate,
  postWebEngagePHR,
  postWebEngageEvent,
  HEALTH_CONDITIONS_TITLE,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  deletePatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useApolloClient } from 'react-apollo-hooks';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions_response as MedicalConditionType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medications_response as MedicationType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthRestrictions_response as HealthRestrictionType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies_response as AllergyType,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

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
    ...theme.viewStyles.text('SB', 18, '#02475B', 1, 23.4),
    marginBottom: 3,
  },
});

export interface HealthConditionScreenProps
  extends NavigationScreenProps<{
    allergyArray: AllergyType[];
    medicalConditionArray: MedicalConditionType[];
    medicationArray: MedicationType[];
    healthRestrictionArray: HealthRestrictionType[];
    onPressBack: () => void;
  }> {}

export const HealthConditionScreen: React.FC<HealthConditionScreenProps> = (props) => {
  const [healthConditionMainData, setHealthConditionMainData] = useState<any>([]);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [localHealthRecordData, setLocalHealthRecordData] = useState<Array<{
    key: string;
    data: any[];
  }> | null>(null);

  const [medicalConditions, setMedicalConditions] = useState<
    (MedicalConditionType | null)[] | null | undefined
  >(props.navigation?.getParam('medicalConditionArray') || []);
  const [medicalHealthRestrictions, setMedicalHealthRestrictions] = useState<
    (HealthRestrictionType | null)[] | null | undefined
  >(props.navigation?.getParam('healthRestrictionArray') || []);
  const [medicalMedications, setMedicalMedications] = useState<
    (MedicationType | null)[] | null | undefined
  >(props.navigation?.getParam('medicationArray') || []);
  const [medicalAllergies, setMedicalAllergies] = useState<
    (AllergyType | null)[] | null | undefined
  >(props.navigation?.getParam('allergyArray') || []);

  const [callApi, setCallApi] = useState(false);
  const [callPhrMainApi, setCallPhrMainApi] = useState(false);

  useEffect(() => {
    const healthConditionsArray: any[] = [];
    medicalMedications?.forEach((medicationRecord: any) => {
      medicationRecord && healthConditionsArray.push(medicationRecord);
    });
    medicalConditions?.forEach((medicalConditionsRecord: any) => {
      medicalConditionsRecord && healthConditionsArray.push(medicalConditionsRecord);
    });
    medicalHealthRestrictions?.forEach((healthRestrictionRecord: any) => {
      healthRestrictionRecord && healthConditionsArray.push(healthRestrictionRecord);
    });
    medicalAllergies?.forEach((allergyRecord: any) => {
      allergyRecord && healthConditionsArray.push(allergyRecord);
    });
    const sortedData = phrSortWithDate(healthConditionsArray);
    setHealthConditionMainData(sortedData);
  }, [medicalConditions, medicalHealthRestrictions, medicalMedications, medicalAllergies]);

  useEffect(() => {
    let finalData: { key: string; data: any[] }[] = [];
    finalData = initialSortByDays('health-conditions', healthConditionMainData, finalData);
    setLocalHealthRecordData(finalData);
  }, [healthConditionMainData]);

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    gotoPHRHomeScreen();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [callApi, callPhrMainApi]);

  useEffect(() => {
    if (callApi) {
      getLatestHealthConditionRecords();
    }
  }, [callApi]);

  const gotoPHRHomeScreen = () => {
    if (!callApi && !callPhrMainApi) {
      props.navigation.state.params?.onPressBack();
    }
    props.navigation.goBack();
  };

  const getLatestHealthConditionRecords = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id)
      .then((data: any) => {
        const medicalCondition = g(
          data,
          'getPatientPrismMedicalRecords',
          'medicalConditions',
          'response'
        );
        const medicalHealthRestriction = g(
          data,
          'getPatientPrismMedicalRecords',
          'healthRestrictions',
          'response'
        );
        const medicalMedication = g(
          data,
          'getPatientPrismMedicalRecords',
          'medications',
          'response'
        );
        const medicalAllergie = g(data, 'getPatientPrismMedicalRecords', 'allergies', 'response');
        setMedicalConditions(medicalCondition);
        setMedicalHealthRestrictions(medicalHealthRestriction);
        setMedicalMedications(medicalMedication);
        setMedicalAllergies(medicalAllergie);
        setShowSpinner(false);
        setCallPhrMainApi(true);
      })
      .catch((error) => {
        setShowSpinner(false);
        console.log('error getPatientPrismMedicalRecordsApi', error);
        currentPatient && handleGraphQlError(error);
      });
  };

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
        title={'HEALTH CONDITIONS'}
        leftIcon={'backArrow'}
        rightComponent={renderProfileImage()}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={gotoPHRHomeScreen}
      />
    );
  };

  const renderSearchAndFilterView = () => {
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, '#02475B', 1, 30) }}>
          {'Health Conditions'}
        </Text>
      </View>
    );
  };

  const onHealthCardItemPress = (selectedItem: any) => {
    const headerTitle = selectedItem?.allergyName
      ? HEALTH_CONDITIONS_TITLE.ALLERGY
      : selectedItem?.medicineName
      ? HEALTH_CONDITIONS_TITLE.MEDICATION
      : selectedItem?.restrictionName
      ? HEALTH_CONDITIONS_TITLE.HEALTH_RESTRICTION
      : selectedItem?.medicalConditionName
      ? HEALTH_CONDITIONS_TITLE.MEDICAL_CONDITION
      : '';
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      healthCondition: true,
      healthHeaderTitle: headerTitle,
    });
  };

  const healthConditionDeleteWebEngageEvents = (recordType: MedicalRecordType) => {
    if (recordType === MedicalRecordType.ALLERGY) {
      postWebEngagePHR('Health Condition', WebEngageEventName.PHR_DELETE_ALLERGY);
    } else if (recordType === MedicalRecordType.MEDICATION) {
      postWebEngagePHR('Health Condition', WebEngageEventName.PHR_DELETE_MEDICATION);
    } else if (recordType === MedicalRecordType.HEALTHRESTRICTION) {
      postWebEngagePHR('Health Condition', WebEngageEventName.PHR_DELETE_HEALTH_RESTRICTIONS);
    } else if (recordType === MedicalRecordType.MEDICALCONDITION) {
      postWebEngagePHR('Health Condition', WebEngageEventName.PHR_DELETE_MEDICAL_CONDITION);
    }
  };

  const onPressDeletePrismMedicalRecords = (selectedItem: any) => {
    const recordType: MedicalRecordType = selectedItem?.allergyName
      ? MedicalRecordType.ALLERGY
      : selectedItem?.medicineName
      ? MedicalRecordType.MEDICATION
      : selectedItem?.restrictionName
      ? MedicalRecordType.HEALTHRESTRICTION
      : MedicalRecordType.MEDICALCONDITION;
    setShowSpinner(true);
    deletePatientPrismMedicalRecords(client, selectedItem?.id, currentPatient?.id || '', recordType)
      .then((status) => {
        if (status) {
          getLatestHealthConditionRecords();
          healthConditionDeleteWebEngageEvents(recordType);
        } else {
          setShowSpinner(false);
        }
      })
      .catch((error) => {
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const onPressEditPrismMedicalRecords = (selectedItem: any) => {
    const recordType: MedicalRecordType = selectedItem?.allergyName
      ? MedicalRecordType.ALLERGY
      : selectedItem?.medicineName
      ? MedicalRecordType.MEDICATION
      : selectedItem?.restrictionName
      ? MedicalRecordType.HEALTHRESTRICTION
      : MedicalRecordType.MEDICALCONDITION;
    setCallApi(false);
    props.navigation.navigate(AppRoutes.AddRecord, {
      navigatedFrom: 'HealthCondition',
      recordType: recordType,
      selectedRecordID: selectedItem?.id,
      selectedRecord: selectedItem,
      onRecordAdded: onRecordAdded,
    });
  };

  const renderHealthConditionItems = (item: any, index: number) => {
    const renderHealthConditionTopView = () => {
      const getHealthConditionTypeIcon = () => {
        return item?.allergyName ? (
          <PhrAllergyIcon style={{ width: 11.85, height: 13.14, marginRight: 10.5 }} />
        ) : item?.medicineName ? (
          <PhrMedicationIcon style={{ width: 12.82, height: 13.14, marginRight: 9.8 }} />
        ) : item?.restrictionName ? (
          <PhrRestrictionIcon style={{ width: 14, height: 14, marginRight: 9 }} />
        ) : item?.medicalConditionName ? (
          <PhrMedicalIcon style={{ width: 14, height: 14.03, marginRight: 8 }} />
        ) : null;
      };
      const getHealthConditionTypeTitle = item?.allergyName
        ? 'Allergies'
        : item?.medicineName
        ? 'Medications'
        : item?.restrictionName
        ? 'Health Restrictions'
        : item?.medicalConditionName
        ? 'Medical Conditions'
        : '';
      return (
        <View style={{ marginBottom: 5, flexDirection: 'row', alignItems: 'center' }}>
          {getHealthConditionTypeIcon()}
          <Text style={{ ...theme.viewStyles.text('M', 12, '#00B38E', 1, 15.6) }}>
            {getHealthConditionTypeTitle}
          </Text>
        </View>
      );
    };
    const prescriptionName =
      item?.allergyName ||
      item?.medicineName ||
      item?.restrictionName ||
      item?.medicalConditionName ||
      '';
    const dateText = getPrescriptionDate(item?.startDateTime);
    const soureName = getSourceName(item?.source) || '-';
    const selfUpload = true;
    const showEditDeleteOption =
      soureName === string.common.clicnical_document_text || soureName === '-' ? true : false;
    return (
      <HealthRecordCard
        item={item}
        index={index}
        editDeleteData={editDeleteData()}
        showUpdateDeleteOption={showEditDeleteOption}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
        onDeletePress={(selectedItem) => onPressDeletePrismMedicalRecords(selectedItem)}
        onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
        prescriptionName={prescriptionName}
        dateText={dateText}
        selfUpload={selfUpload}
        sourceName={soureName || ''}
        healthConditionCard
        healthCondtionCardTopView={renderHealthConditionTopView()}
      />
    );
  };

  const renderHealthCondtionsData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localHealthRecordData || []}
        renderItem={({ item, index }) => renderHealthConditionItems(item, index)}
        ListEmptyComponent={<PhrNoDataComponent />}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
      />
    );
  };

  const onRecordAdded = () => {
    setCallApi(true);
  };

  const renderAddButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={`ADD DATA`}
          onPress={() => {
            setCallApi(false);
            const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
              Source: 'Health Condition',
            };
            postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'HealthCondition',
              recordType: MedicalRecordType.MEDICALCONDITION,
              onRecordAdded: onRecordAdded,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {healthConditionMainData?.length > 0 ? renderSearchAndFilterView() : null}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderHealthCondtionsData()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
