import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, SectionList } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
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
  getPrescriptionDate,
  initialSortByDays,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';
import _ from 'lodash';

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
    healthConditionData: any[];
    onPressBack: () => void;
  }> {}

export const HealthConditionScreen: React.FC<HealthConditionScreenProps> = (props) => {
  const healthConditionData = props.navigation?.getParam('healthConditionData') || [];
  const { currentPatient } = useAllCurrentPatients();
  const [localHealthRecordData, setLocalHealthRecordData] = useState<Array<{
    key: string;
    data: any[];
  }> | null>(null);

  useEffect(() => {
    if (healthConditionData) {
      let finalData: { key: string; data: any[] }[] = [];
      finalData = initialSortByDays('health-conditions', healthConditionData, finalData);
      setLocalHealthRecordData(finalData);
    }
  }, [healthConditionData]);

  const gotoPHRHomeScreen = () => {
    props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
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
      ? 'ALLERGIES DETAIL'
      : selectedItem?.medicineName
      ? 'MEDICATION'
      : selectedItem?.restrictionName
      ? 'RESTRICTION'
      : selectedItem?.medicalConditionName
      ? 'MEDICAL CONDITION'
      : '';
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      healthCondition: true,
      healthHeaderTitle: headerTitle,
    });
  };

  const renderHealthConditionItems = (item: any, index: number) => {
    // For Next Phase
    // const editDeleteData = ConsultRxEditDeleteArray.map((i) => {
    //   return { key: i.key, value: i.title };
    // });
    const getSourceName = (source: string) => {
      if (source === 'self' || source === '247self') {
        return 'Clinical Document';
      }
      return source;
    };
    const renderHealthConditionTopView = () => {
      const getHealthConditionTypeIcon = () => {
        return item?.allergyName ? (
          <PhrAllergyIcon style={{ width: 11.85, height: 13.14, marginRight: 10.5 }} />
        ) : item?.medicineName ? (
          <PhrMedicationIcon style={{ width: 12.82, height: 13.14, marginRight: 9.8 }} />
        ) : item?.restrictionName ? (
          <PhrMedicalIcon style={{ width: 14, height: 14.03, marginRight: 8 }} />
        ) : item?.medicalConditionName ? (
          <PhrRestrictionIcon style={{ width: 14, height: 14, marginRight: 9 }} />
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
    const soureName = getSourceName(item?.source);
    const selfUpload = true;
    return (
      <HealthRecordCard
        item={item}
        index={index}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
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

  const renderAddButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={`ADD DATA`}
          onPress={() => {
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'HealthCondition',
              recordType: MedicalRecordType.MEDICALCONDITION,
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
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {healthConditionData?.length > 0 ? renderSearchAndFilterView() : null}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderHealthCondtionsData()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
