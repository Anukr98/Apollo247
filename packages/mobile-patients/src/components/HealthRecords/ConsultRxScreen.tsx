import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AccountCircleDarkIcon, More, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { HealthConsultView } from '@aph/mobile-patients/src/components/HealthRecords/HealthConsultView';
import {
  g,
  handleGraphQlError,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import moment from 'moment';

const styles = StyleSheet.create({
  searchFilterViewStyle: {
    marginHorizontal: 20,
    marginVertical: 22,
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
});

export enum FILTER_TYPE {
  SORT_BY = 'Sort by',
  NAME = 'Name',
  DATE = 'Date',
  DOCTOR_NAME = 'Doctor Name',
}

type FilterArray = {
  key: FILTER_TYPE;
  title: string;
};

const TestFilterArray: FilterArray[] = [
  { key: FILTER_TYPE.SORT_BY, title: FILTER_TYPE.SORT_BY },
  { key: FILTER_TYPE.NAME, title: FILTER_TYPE.NAME },
  { key: FILTER_TYPE.DATE, title: FILTER_TYPE.DATE },
  { key: FILTER_TYPE.DOCTOR_NAME, title: FILTER_TYPE.DOCTOR_NAME },
];

export interface ConsultRxScreenProps extends NavigationScreenProps {
  consultRxData: any;
}

export const ConsultRxScreen: React.FC<ConsultRxScreenProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [filterApplied, setFilterApplied] = useState<FILTER_TYPE | string>('');
  const [consultRxData, setConsultRxData] = useState(
    props.navigation?.getParam('consultRxData') || []
  );
  console.log('consultRxData', consultRxData);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);

  const doctorType = (item: any) => {
    return (
      item.caseSheet &&
      item.caseSheet.find((obj: any) => {
        return obj.doctorType !== 'JUNIOR';
      })
    );
  };

  const renderProfileImage = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.goBack()}>
        {currentPatient?.photoUrl?.match(
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
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <Header
        title={'CONSULT & RX'}
        leftIcon={'backArrow'}
        rightComponent={renderProfileImage()}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => {
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderSearchAndFilterView = () => {
    const testFilterData = TestFilterArray.map((i) => {
      return { key: i.key, value: i.title };
    });
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, '#02475B', 1, 30) }}>
          {'Consult & Rx'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialMenu
            options={testFilterData}
            selectedText={filterApplied}
            menuContainerStyle={styles.menuContainerStyle}
            itemContainer={{ height: 44.8, marginHorizontal: 12, width: 260 / 2 }}
            itemTextStyle={styles.itemTextStyle}
            firstOptionText={true}
            selectedTextStyle={styles.selectedTextStyle}
            bottomPadding={{ paddingBottom: 20 }}
            onPress={(selectedFilter) => {
              if (selectedFilter.key !== FILTER_TYPE.SORT_BY) {
                setFilterApplied(selectedFilter.key);
              }
            }}
          >
            <Filter style={{ width: 24, height: 24 }} />
          </MaterialMenu>
        </View>
      </View>
    );
  };

  const renderConsult = (item: any, index: number) => {
    return (
      <HealthConsultView
        key={index}
        onPressOrder={() => {
          CommonLogEvent('HEALTH_RECORD_HOME', 'Display order popup');
          setdisplayOrderPopup(true);
        }}
        onClickCard={() => {
          if (item.data.doctorInfo) {
            // postConsultCardClickEvent(item.data.id);
            props.navigation.navigate(AppRoutes.ConsultDetails, {
              CaseSheet: item.data.id,
              DoctorInfo: item.data.doctorInfo,
              FollowUp: item.data.isFollowUp,
              appointmentType: item.data.appointmentType,
              DisplayId: item.data.displayId,
              BlobName: g(doctorType(item.data), 'blobName'),
            });
          } else if (item.data.date) {
            props.navigation.navigate(AppRoutes.RecordDetails, {
              data: item.data,
            });
          }
        }}
        PastData={item.data}
        navigation={props.navigation}
        onFollowUpClick={() => {
          if (item.data.doctorInfo) {
            // onFollowUpClick(item.data);
          }
        }}
      />
    );
  };

  const renderConsultRxItems = (item: any, index: number) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={{ ...theme.viewStyles.cardViewStyle, marginHorizontal: 20, marginBottom: 16 }}
      >
        <View style={{ marginVertical: 12, marginLeft: 13, marginRight: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text
                numberOfLines={1}
                style={{ ...theme.viewStyles.text('M', 16, '#02475B', 1, 20.8) }}
              >
                {item.data?.prescriptionName}
              </Text>
              <Text
                numberOfLines={1}
                style={{ ...theme.viewStyles.text('R', 10, '#67909C', 1, 13) }}
              >
                {item.data?.prescribedBy}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ ...theme.viewStyles.text('R', 10, '#67909C', 1, 13) }}>
                {moment(item.data?.date).format('DD MMM')}
              </Text>
              <More />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyConsult = () => {
    return <View />;
  };

  const renderConsults = () => {
    return (
      <View style={{ marginBottom: 30 }}>
        <FlatList
          bounces={false}
          data={consultRxData || []}
          renderItem={({ item, index }) => renderConsultRxItems(item, index)}
          ListEmptyComponent={renderEmptyConsult()}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {renderSearchAndFilterView()}
        {renderConsults()}
      </SafeAreaView>
    </View>
  );
};
