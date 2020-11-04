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
import { getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills_response as MedicalBillsType } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
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

export interface BillScreenProps
  extends NavigationScreenProps<{
    medicalBillsData: MedicalBillsType[];
    onPressBack: () => void;
  }> {}

export const BillScreen: React.FC<BillScreenProps> = (props) => {
  const medicalBillsData = props.navigation?.getParam('medicalBillsData') || [];
  const { currentPatient } = useAllCurrentPatients();
  const [localMedicalBillsData, setLocalMedicalBillsData] = useState<Array<{
    key: string;
    data: MedicalBillsType[];
  }> | null>(null);

  useEffect(() => {
    if (medicalBillsData) {
      let finalData: { key: string; data: MedicalBillsType[] }[] = [];
      finalData = initialSortByDays(medicalBillsData, finalData);
      setLocalMedicalBillsData(finalData);
    }
  }, [medicalBillsData]);

  const initialSortByDays = (
    filteredData: MedicalBillsType[],
    toBeFinalData: { key: string; data: MedicalBillsType[] }[]
  ) => {
    let finalData = toBeFinalData;
    filteredData.forEach((dataObject: MedicalBillsType) => {
      const startDate = moment().set({
        hour: 23,
        minute: 59,
      });
      const past7thDay = startDate.subtract(7, 'day');
      const past7daysData = moment(dataObject?.billDateTime).diff(past7thDay, 'days') > 0;
      if (past7daysData) {
        const dateExistsAt = foundDataIndex('Past 7 days', finalData);
        finalData = sortByDays('Past 7 days', finalData, dateExistsAt, dataObject);
      } else {
        const past6thmonthDay = past7thDay.subtract(6, 'months');
        const past6monthsData = moment(dataObject?.billDateTime).diff(past6thmonthDay, 'days') > 0;
        if (past6monthsData) {
          const dateExistsAt = foundDataIndex('Past 6 months', finalData);
          finalData = sortByDays('Past 6 months', finalData, dateExistsAt, dataObject);
        } else {
          const dateExistsAt = foundDataIndex('Other Days', finalData);
          finalData = sortByDays('Other Days', finalData, dateExistsAt, dataObject);
        }
      }
    });
    return finalData;
  };

  const foundDataIndex = (key: string, finalData: { key: string; data: MedicalBillsType[] }[]) => {
    return finalData.findIndex(
      (data: { key: string; data: MedicalBillsType[] }) => data?.key === key
    );
  };

  const sortByDays = (
    key: string,
    finalData: { key: string; data: MedicalBillsType[] }[],
    dateExistsAt: number,
    dataObject: MedicalBillsType
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
        title={'BILLS'}
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
        <Text style={{ ...theme.viewStyles.text('SB', 23, '#02475B', 1, 30) }}>{'Bills'}</Text>
      </View>
    );
  };

  const onHealthCardItemPress = (selectedItem: MedicalBillsType) => {
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      medicalBill: true,
    });
  };

  const renderMedicalBillItems = (item: MedicalBillsType, index: number) => {
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
    const prescriptionName = item?.hospitalName || '';
    const dateText = getPrescriptionDate(item?.billDateTime);
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

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const renderMedicalBillsData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localMedicalBillsData || []}
        renderItem={({ item, index }) => renderMedicalBillItems(item, index)}
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
              navigatedFrom: 'MedicalBill',
              recordType: MedicalRecordType.MEDICALBILL,
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
          {medicalBillsData?.length > 0 ? renderSearchAndFilterView() : null}
          {renderMedicalBillsData()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
