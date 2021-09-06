// Bar Chart
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useLayoutEffect, useState } from 'react';
import {
  processColor,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CombinedChart } from 'react-native-charts-wrapper';
import { Overlay } from 'react-native-elements';
import {
  ArrowRight,
  CrossPopup,
  RedArrow,
  RedDownArrow,
} from '@aph/mobile-patients/src/components/ui/Icons';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';
import SwitchSelector from 'react-native-switch-selector';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { colors } from '@aph/mobile-patients/src/theme/colors';

const styles = StyleSheet.create({
  container: {
    height: '75%',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    width: '97%',
    left: 10,
    marginTop: 10,
  },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
    marginTop: 120,
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: 'transparent',
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  phrUploadOptionsViewStyle: {
    backgroundColor: 'white',
    paddingHorizontal: 29,
    borderRadius: 10,
    paddingVertical: 34,
  },
  healthInsightsContainer: {
    ...theme.viewStyles.text('SB', 18, 'black', 1, 20.8),
    bottom: 10,
  },
  barChartMainContainer: {
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  paramNameTextContainer: {
    ...theme.viewStyles.text('SB', 16, '#1180BF', 1, 20.8),
    left: 15,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    width: '95%',
    overflow: 'hidden',
  },
  dateContainer: {
    ...theme.viewStyles.text('R', 12, 'grey', 1, 20.8),
    left: 15,
    marginTop: 5,
    bottom: 10,
  },
  serviceNameContainer: {
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
    backgroundColor: '#FAFAFA',
    marginBottom: -5,
  },
  serviceNameSubContainer: {
    justifyContent: 'space-between',
    flexDirection: 'column',
    height: 80,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 5,
    marginTop: 20,
    width: '95%',
    left: 7,
  },
  arrowIcon: {
    alignItems: 'flex-end',
    top: 15,
    height: 1,
  },
  serviceNameTextContainer: {
    flexDirection: 'row',
    left: 10,
  },
  paramName: {
    ...theme.viewStyles.text('R', 13, 'grey', 1, 19, 0.35),
    left: 15,
    top: 5,
  },
  axisValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    left: 10,
    top: 10,
  },
  axisValueTextContainer: {
    fontSize: 20,
    lineHeight: 30,
    ...theme.viewStyles.text('SB', 16, '#1180BF', 1, 19, 0.35),
  },
  redValueDecider: {
    fontSize: 20,
    lineHeight: 30,
    left: 30,
    top: 3,
    ...theme.viewStyles.text('R', 16, 'red', 1, 19, 0.35),
  },
  powerTenTextContainer: {
    fontSize: 10,
    lineHeight: 18,
    color: '#1180BF',
    bottom: 5,
  },
  miscInfoContainer: {
    ...theme.viewStyles.text('R', 11, 'grey', 1, 20.8),
    textAlignVertical: 'auto',
  },
  crossIcon: {
    marginRight: 1,
    width: 28,
    height: 28,
  },
  crossIconContainer: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  siteNameStyling: {
    left: 10,
    top: 13,
    ...theme.viewStyles.text('R', 14, '#FCB716', 1, 19, 0.35),
  },
  iconStyling: {
    left: 20,
    width: 20,
    height: 20,
  },
  mclStyling: {
    left: 4,
    fontSize: 14,
    color: '#1180BF',
  },
  serviceName: {
    ...theme.viewStyles.text('R', 16, '#01475B', 1, 19, 0.35),
    top: 5,
  },
  miscStyling: {
    marginTop: 20,
    marginBottom: 10,
    width: '90%',
    left: 13,
  },
});

export interface CombinedBarChartProps {
  isVisible?: boolean;
  date?: string;
  onClickClose?: () => void;
  title?: string;
  resultsData?: [];
  resultString?: string;
  rangeData?: [];
  rangeString?: string;
  rangeDate?: [];
  dateString?: string;
  minLine?: number;
  maxLine?: number;
  lineData?: [];
  testReport?: string;
  allTestReports?: [];
  onSendTestReport?: (selectedItem: any) => void;
  siteName: string;
}

interface SelectedTestReport {
  billNo: string;
  consultID: string;
  date: string;
  fileUrl: string;
  id: string;
  identifier: string;
  labTestName: string;
  labTestResults: [];
  labTestSource: string;
  observation: any;
  packageId: string;
  packageName: string;
  siteDisplayName: string;
  tag: string;
  testResultFiles: [];
  testSequence: string;
  labTestRefferedBy: string;
  additionalNotes: any;
}

export const CombinedBarChart: React.FC<CombinedBarChartProps> = (props) => {
  const [showLabel, setShowLabel] = useState<boolean>(false);
  const [yAxisValue, setyAxisValue] = useState<string>('');
  const [xAxisValue, setxAxisValue] = useState<number>();
  const [valueFormatter, setValueFormatter] = useState<[]>([]);

  useLayoutEffect(() => {
    let exerciseLog = props?.rangeDate?.map((x) => new Date(x));
    let format = exerciseLog?.map((x) => moment(x).format('hA'));
    setValueFormatter(format);
  }, []);

  const handleSelect = (event: any) => {
    let entry = event.nativeEvent;
    if (entry.y === undefined) {
      setShowLabel(false);
    } else {
      setShowLabel(true);
      setyAxisValue(entry.y);
      setxAxisValue(entry.x);
    }
  };

  const xAxis = {
    valueFormatter: valueFormatter,
    drawLabels: true,
    granularityEnabled: true,
    granularity: 1,
    drawLimitLinesBehindData: false,
    drawGridLines: false,
    position: 'BOTTOM',
    limitLine: 20,
    fontFamily: 'IBMPlexSans-Medium',
    axisLineColor: processColor('#02475B'),
    textColor: processColor('#01475B'),
    wordWrapEnabled: false,
    avoidFirstLastClipping: false,
    axisMinimum: -0.4,
    axisMaximum: props?.lineData?.length,
    textSize: 9,
    labelCount: 20,
  };

  const yAxis = {
    left: {
      axisLineColor: processColor('#01475B'),
      labelCount: 6,
      labelCountForce: true,
      fontFamily: 'IBMPlexSans-Light',
      limitLine: 30,
      axisMinimum: 0,
      granularityEnabled: true,
      drawGridLines: false,
      granularity: 1,
      textColor: processColor('#01475B'),
      limitLines: [
        {
          limit: props.minLine,
          lineColor: processColor('#BF2600'),
          lineDashPhase: 1,
          lineWidth: 1.5,
          valueFont: 9,
          lineDashLengths: [1, 5],
        },
        {
          limit: props.maxLine + 10,
          lineColor: processColor('#BF2600'),
          lineDashPhase: 1,
          lineWidth: 1.5,
          valueFont: 9,
          lineDashLengths: [1, 5],
        },
      ],
    },
    right: {
      enabled: true,
      drawLabels: false,
      limitLine: 30,
      axisLineColor: processColor('white'),
      drawGridLines: false,
      fontFamily: 'IBMPlexSans-Light',
      granularityEnabled: true,
      granularity: 1,
    },
  };

  const options = [
    { label: 'D', value: 'Day' },
    { label: 'W', value: 'Week' },
    { label: 'M', value: 'Month' },
    { label: 'Y', value: 'Year' },
  ];

  const marker = {
    enabled: true,
    markerColor: processColor('white'),
    textColor: processColor('#1180BF'),
    markerFontSize: 15,
    textSize: 14,
  };

  const data = {
    barData: {
      dataSets: [
        {
          values: props.resultsData,
          label: '',
          config: {
            color: processColor('#FCB716'),
            fontFamily: 'IBMPlexSans-Light',
            axisDependency: 'left',
            drawValues: false,
            highlightEnabled: true,
          },
        },
      ],
      config: {
        barWidth: 0.1,
        valueTextColor: processColor('red'),
      },
    },
    lineData: {
      dataSets: [
        {
          values: props.resultsData,
          label: '',
          config: {
            drawValues: false,
            drawCircles: false,
            lineWidth: 2,
            axisDependency: 'LEFT',
            color: processColor('#1180BF'),
          },
        },
      ],
    },
  };

  const renderCloseIcon = () => {
    return (
      <View style={styles.crossIconContainer}>
        <TouchableOpacity onPress={() => props.onClickClose()}>
          <CrossPopup style={styles.crossIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderServiceName = () => {
    let reportObj = {} as SelectedTestReport;
    var goal = Number(yAxisValue);
    goal = goal.toFixed(2);
    var convertGoal = Number(goal);
    var lineContainer = props?.lineData;
    var num: any;
    var checkMinus: any;
    const lineData = lineContainer.map((i) => Number(i));
    var index = lineData.indexOf(convertGoal);
    const mergeArray: [] = [];
    const mergeLabTestFiles: [] = [];
    if (index !== 0 && goal !== 0) {
      num = goal - props?.lineData[index - 1];
      num = num.toFixed(2);
    }
    var checkNumber = isNaN(num);
    if (num !== undefined && !checkNumber) {
      checkMinus = num?.includes('-');
    }

    return (
      <View style={styles.serviceNameSubContainer}>
        <TouchableOpacity
          onPress={() => {
            if (!!showLabel) {
              props.allTestReports?.map((item: any) => {
                if (item.data.labTestName === props.testReport) {
                  item.data.labTestResults.map((items: any) => {
                    const checktype = Number(items.resultDate);
                    if (checktype === props?.rangeDate[xAxisValue]) {
                      mergeArray.push(items);
                      if (item?.data?.testResultFiles?.length > 0) {
                        item?.data?.testResultFiles?.map((testFileItems: any) => {
                          mergeLabTestFiles.push(testFileItems);
                        });
                      }
                      reportObj.billNo = item.data.billNo;
                      reportObj.date = item.data.date;
                      reportObj.fileUrl = item.data.fileUrl;
                      reportObj.id = item.data.id;
                      reportObj.identifier = item.data.identifier;
                      reportObj.labTestName = item.data.labTestName;
                      reportObj.labTestRefferedBy = item.data.labTestRefferedBy;
                      reportObj.labTestSource = item.data.labTestSource;
                      reportObj.packageId = item.data.packageId;
                      reportObj.packageName = item.data.packageName;
                      reportObj.siteDisplayName = item.data.siteDisplayName;
                      reportObj.testSequence = item.data.testSequence;
                      reportObj.additionalNotes = item.data.additionalNotes;
                    }
                  });
                }
              });
              reportObj.labTestResults = mergeArray;
              reportObj.testResultFiles = mergeLabTestFiles;
              props.onSendTestReport(reportObj);
            } else {
              Alert.alert('OOPS!!', 'Please select any one of the bar charts');
            }
          }}
        >
          <View style={styles.arrowIcon}>
            <ArrowRight />
          </View>
          <View style={styles.serviceNameTextContainer}>
            <Text style={styles.serviceName}>{'Service name'}</Text>
            <Text style={styles.paramName}>{`${'\u25CF '}` + ' Parameter name'}</Text>
          </View>
          <View style={styles.axisValueContainer}>
            <Text style={styles.axisValueTextContainer}>{!!goal ? goal + '*10' : '' + '*10'}</Text>
            <Text style={styles.powerTenTextContainer}>6</Text>
            <Text style={styles.mclStyling}>mcl</Text>
            {!!checkMinus || num === undefined ? (
              <RedDownArrow size="sm" style={styles.iconStyling} />
            ) : (
              <RedArrow size="sm" style={styles.iconStyling} />
            )}
            <Text style={styles.redValueDecider}>{checkNumber === false ? num : 'N/A'}</Text>
          </View>
          <Text style={styles.siteNameStyling}>{props.siteName}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const onClickValueFormatterChange = (value: any) => {
    let exerciseLog = props?.rangeDate?.map((x) => new Date(x));
    switch (value) {
      case 'Year':
        let yearFormat = exerciseLog?.map((x) => moment(x).format(`MMM'YY`));
        setValueFormatter(yearFormat);
        break;
      case 'Week':
        let weekFormat = exerciseLog?.map((x) => moment(x).format(`DD MMM`));
        setValueFormatter(weekFormat);
        break;
      case 'Day':
        let dayFormat = exerciseLog?.map((x) => moment(x).format(`hA`));
        setValueFormatter(dayFormat);
        break;
      case 'Month':
        let monthFormat = exerciseLog?.map((x) => moment(x).format(`DD`));
        setValueFormatter(monthFormat);
        break;
      default:
        break;
    }
  };

  const renderBarChartView = () => {
    return (
      <View style={styles.phrUploadOptionsViewStyle}>
        <Text style={styles.healthInsightsContainer}>{'HEALTH INSIGHTS'}</Text>
        <SwitchSelector
          options={options}
          initial={0}
          buttonColor={colors.WHITE}
          backgroundColor={'#E5E5E5'}
          selectedColor={'#02475B'}
          textColor={'#02475B'}
          borderRadius={3}
          bold={true}
          style={{ marginTop: 10 }}
          hasPadding
          height={20}
          onPress={(value) => onClickValueFormatterChange(value)}
        />

        <View style={styles.barChartMainContainer}>
          <View style={{ height: 290 }}>
            <Text numberOfLines={1} style={styles.paramNameTextContainer}>
              {props.title}
            </Text>
            <Text style={styles.dateContainer}>
              {`\u25CF ${moment(props.date).format(string.common.date_placeholder_text)}`}
            </Text>
            <CombinedChart
              drawBorders={false}
              gridBackgroundColor={processColor('#FCB716')}
              doubleTapToZoomEnabled={false}
              data={data}
              xAxis={xAxis}
              yAxis={yAxis}
              onSelect={(event) => handleSelect(event)}
              highlightPerDragEnabled={false}
              highlightFullBarEnabled={false}
              zoom={{ scaleX: 0.0, scaleY: 0.0, xValue: 9999, yValue: 1, axisDependency: 'RIGHT' }}
              chartDescription={{ text: '' }}
              marker={marker}
              style={styles.container}
              drawOrder={['BAR', 'LINE']}
              animation={{
                durationX: 0,
                durationY: 1500,
                easingY: 'EaseInOutQuart',
              }}
              legend={{ form: 'EMPTY' }}
            />
            <View style={styles.serviceNameContainer} />
          </View>
          {renderServiceName()}
          <View style={styles.miscStyling}>
            <Text style={styles.miscInfoContainer}>
              {
                'Note: Loinc code for this is ABP1234. The parameter value and test combo plotted represent the same loinc code'
              }
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Overlay
        onRequestClose={() => props.onClickClose()}
        isVisible={props.isVisible}
        windowBackgroundColor={'rgba(0, 0, 0, 0.2)'}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        transparent
        overlayStyle={styles.phrOverlayStyle}
      >
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            {renderCloseIcon()}
            {renderBarChartView()}
          </SafeAreaView>
        </View>
      </Overlay>
    </View>
  );
};
