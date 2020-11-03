import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, SectionList } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
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

export interface HospitalizationScreenProps
  extends NavigationScreenProps<{
    hospitalizationData: any;
    onPressBack: () => void;
  }> {}

export const HospitalizationScreen: React.FC<HospitalizationScreenProps> = (props) => {
  const hospitalizationData = props.navigation?.getParam('hospitalizationData') || [];
  const [localHospitalizationData, setLocalHospitalizationData] = useState<Array<{
    key: string;
    data: any[];
  }> | null>(null);
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    if (hospitalizationData) {
      let finalData: { key: string; data: any[] }[] = [];
      finalData = initialSortByDays(hospitalizationData, finalData);
      setLocalHospitalizationData(finalData);
    }
  }, [hospitalizationData]);

  const initialSortByDays = (
    filteredData: any[],
    toBeFinalData: { key: string; data: any[] }[]
  ) => {
    let finalData = toBeFinalData;
    filteredData.forEach((dataObject: any) => {
      const past1yrData = moment().subtract(12, 'months');
      const isPast1yrData = moment(dataObject?.data?.date).diff(past1yrData, 'hours') > 0;
      if (isPast1yrData) {
        const dateExistsAt = foundDataIndex('Past 12 months', finalData);
        finalData = sortByDays('Past 12 months', finalData, dateExistsAt, dataObject);
      } else {
        const past5yrsDay = past1yrData.subtract(5, 'years');
        const isPast5yrsData = moment(dataObject?.data?.date).diff(past5yrsDay, 'hours') > 0;
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

  const foundDataIndex = (key: string, finalData: { key: string; data: any[] }[]) => {
    return finalData.findIndex((data: { key: string; data: any[] }) => data?.key === key);
  };

  const sortByDays = (
    key: string,
    finalData: { key: string; data: any[] }[],
    dateExistsAt: number,
    dataObject: any
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
        title={'HOSPITALIZATION'}
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
          {'Hospitalization'}
        </Text>
      </View>
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle = section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const onHealthCardItemPress = (selectedItem: any) => {
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      hospitalization: true,
    });
  };

  const renderHospitalizationItems = (item: any, index: number) => {
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
    const prescriptionName = 'Dr. ' + item?.doctorName;
    const dateText =
      item?.dateOfHospitalization && item?.date
        ? `From ${moment(item?.dateOfHospitalization).format('DD MMM, YYYY')} to ${moment(
            item?.date
          ).format('DD MMM, YYYY')}`
        : moment(item?.date).format('DD MMM YYYY');
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

  const renderHospitalizationData = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localHospitalizationData || []}
        renderItem={({ item, index }) => renderHospitalizationItems(item, index)}
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
            const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
              Source: 'Hospitalization',
            };
            postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'Hospitalization',
              recordType: MedicalRecordType.HOSPITALIZATION,
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
          {hospitalizationData?.length > 0 ? renderSearchAndFilterView() : null}
          {renderHospitalizationData()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
