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
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import { getPrescriptionDate } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances_response as MedicalInsuranceType } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
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

export interface InsuranceScreenProps
  extends NavigationScreenProps<{
    medicalInsuranceData: MedicalInsuranceType[];
    onPressBack: () => void;
  }> {}

export const InsuranceScreen: React.FC<InsuranceScreenProps> = (props) => {
  const medicalInsuranceData = props.navigation.getParam('medicalInsuranceData') || [];
  const { currentPatient } = useAllCurrentPatients();
  const [localMedicalInsuranceData, setLocalInsuranceBillsData] = useState<Array<{
    key: string;
    data: MedicalInsuranceType[];
  }> | null>(null);

  useEffect(() => {
    if (medicalInsuranceData) {
      let finalData: { key: string; data: MedicalInsuranceType[] }[] = [];
      finalData = initialSortByDays(medicalInsuranceData, finalData);
      setLocalInsuranceBillsData(finalData);
    }
  }, [medicalInsuranceData]);

  const initialSortByDays = (
    filteredData: MedicalInsuranceType[],
    toBeFinalData: { key: string; data: MedicalInsuranceType[] }[]
  ) => {
    let finalData = toBeFinalData;
    filteredData.forEach((dataObject: MedicalInsuranceType) => {
      const past1yrData = moment().subtract(12, 'months');
      const isPast1yrData = moment(dataObject?.startDateTime).diff(past1yrData, 'hours') > 0;
      if (isPast1yrData) {
        const dateExistsAt = foundDataIndex('Past 12 months', finalData);
        finalData = sortByDays('Past 12 months', finalData, dateExistsAt, dataObject);
      } else {
        const past5yrsDay = past1yrData.subtract(5, 'years');
        const isPast5yrsData = moment(dataObject?.startDateTime).diff(past5yrsDay, 'hours') > 0;
        if (isPast5yrsData) {
          const dateExistsAt = foundDataIndex('Past 5 years', finalData);
          finalData = sortByDays('Past 5 years', finalData, dateExistsAt, dataObject);
        } else {
          const dateExistsAt = foundDataIndex('Other Days', finalData);
          finalData = sortByDays('Other Days', finalData, dateExistsAt, dataObject);
        }
      }
    });
    return finalData;
  };

  const foundDataIndex = (
    key: string,
    finalData: { key: string; data: MedicalInsuranceType[] }[]
  ) => {
    return finalData.findIndex(
      (data: { key: string; data: MedicalInsuranceType[] }) => data?.key === key
    );
  };

  const sortByDays = (
    key: string,
    finalData: { key: string; data: MedicalInsuranceType[] }[],
    dateExistsAt: number,
    dataObject: MedicalInsuranceType
  ) => {
    const dataArray = finalData;
    if (dataArray.length === 0 || dateExistsAt === -1) {
      dataArray.push({ key, data: [dataObject] });
    } else {
      const array = dataArray[dateExistsAt].data;
      array.push(dataObject);
      dataArray[dateExistsAt].data = array;
    }
    return dataArray;
  };

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
        title={'INSURANCE'}
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
        <Text style={{ ...theme.viewStyles.text('SB', 23, '#02475B', 1, 30) }}>{'Insurance'}</Text>
      </View>
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const onHealthCardItemPress = (selectedItem: MedicalInsuranceType) => {
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      medicalInsurance: true,
    });
  };

  const renderMedicalInsuranceItems = (item: MedicalInsuranceType, index: number) => {
    const getSourceName = (source: string) => {
      if (source === 'self' || source === '247self') {
        return 'Patient Uploaded';
      }
      return source;
    };
    const prescriptionName = item?.insuranceCompany || '';
    const dateText = getPrescriptionDate(item?.startDateTime);
    const soureName = getSourceName(item?.source || '-');
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
      />
    );
  };

  const renderMedicalInsuranceData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localMedicalInsuranceData || []}
        renderItem={({ item, index }) => renderMedicalInsuranceItems(item, index)}
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
              navigatedFrom: 'MedicalInsurance',
              recordType: MedicalRecordType.MEDICALINSURANCE,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {medicalInsuranceData?.length > 0 ? renderSearchAndFilterView() : null}
          {renderMedicalInsuranceData()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
