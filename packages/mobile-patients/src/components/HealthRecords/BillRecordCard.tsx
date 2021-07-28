// Health Card
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  HospitalUploadPhrIcon,
  ArrowRight,
  Highlighter,
} from '@aph/mobile-patients/src/components/ui/Icons';
import moment from 'moment';

const styles = StyleSheet.create({
  itemTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
    paddingHorizontal: 0,
  },
  cardMainContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 0,
    marginBottom: 16,
  },
  highlighterStyling: {
    position: 'absolute',
    width: '10%',
    height: 20,
    right: -38,
    top: -14,
  },
  billNoTxt: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  marginLine: {
    borderBottomColor: '#C4C4C4',
    borderBottomWidth: 1,
    width: '95%',
    marginTop: 10,
  },
  arrowIcon: {
    position: 'absolute',
    right: 5,
    justifyContent: 'center',
    alignContent: 'center',
  },
  elementContainer: {
    borderBottomColor: '#ededed',
    borderBottomWidth: 1,
    width: '95%',
    marginTop: 10,
    bottom: 7,
  },
  subContainer: {
    marginVertical: 12,
    marginLeft: 13,
    marginRight: 11,
    marginBottom: 10,
  },
  hospitalContainer: {
    flexDirection: 'row',
    position: 'relative',
    bottom: 0,
    left: 5,
  },
  hospitalIcon: {
    height: 14,
    width: 14,
    marginRight: 8,
    top: 3,
  },
});

export interface BillRecordCardProps {
  item: any;
  onHealthCardPress: (selectedItem: any) => void;
  onDownloadLabTestReports: (selectedItem: any) => void;
  index?: number;
  testReportItems?: any;
}

export const BillRecordCard: React.FC<BillRecordCardProps> = (props) => {
  const { item, onHealthCardPress, onDownloadLabTestReports, testReportItems } = props;

  const renderElements = () => {
    console.log(testReportItems?.length, 'testReportItems?.length');
    return testReportItems?.map((items: any) => {
      return (
        <>
          <View style={{ flexDirection: 'column', bottom: 5, marginTop: 15 }}>
            <TouchableOpacity onPress={() => onHealthCardPress(items.data)}>
              <Text
                numberOfLines={1}
                style={{ ...theme.viewStyles.text('M', 14, '#01475B', 1, 20.8), width: '85%' }}
              >
                {items?.data?.labTestName}
              </Text>
              <Text style={{ ...theme.viewStyles.text('R', 12, '#01475B', 1, 20.8) }}>
                {items?.data?.labTestRefferedBy === 'null' ||
                items?.data?.labTestRefferedBy === null ||
                !items?.data?.labTestRefferedBy
                  ? 'N/A'
                  : `${'DR.' + items?.data?.labTestRefferedBy}`}
              </Text>
              <View style={styles.arrowIcon}>
                <ArrowRight style={{ height: 35, width: 35 }} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.elementContainer}></View>
        </>
      );
    });
  };

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
  const dateForBillNo = getPresctionDate(item[0]?.data?.date);
  return (
    <View style={styles.cardMainContainerStyle}>
      <View style={styles.subContainer}>
        <View style={styles.highlighterStyling}>
          <Highlighter size={'sm'} style={{ width: 10, height: 10 }} />
        </View>
        <View style={styles.billNoTxt}>
          <Text style={{ ...theme.viewStyles.text('R', 10, '#67909C', 1, 13) }}>
            {dateForBillNo}
          </Text>
        </View>
        <View style={{ flexDirection: 'column' }}>
          <Text
            style={{ ...theme.viewStyles.text('R', 12, '#0087BA', 1, 13) }}
          >{`Bill No:${item[0]?.data?.billNo}`}</Text>
          <View style={styles.marginLine} />
        </View>
        {renderElements()}
        <View style={styles.hospitalContainer}>
          <HospitalUploadPhrIcon style={styles.hospitalIcon} />
          <Text
            numberOfLines={1}
            style={{ ...theme.viewStyles.text('R', 12, '#67909C', 1, 20.8), width: '60%' }}
          >
            {item[0]?.data?.siteDisplayName || 'N/A'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onDownloadLabTestReports && onDownloadLabTestReports(testReportItems)}
          style={{ position: 'absolute', right: 5, bottom: 0 }}
        >
          <Text
            style={{
              ...theme.viewStyles.text('B', 14, '#FCB716', 1, 20.8),
            }}
          >
            {'DOWNLOAD'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
