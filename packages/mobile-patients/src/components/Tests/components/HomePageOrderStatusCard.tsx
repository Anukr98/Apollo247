import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  AppointmentIcon,
  InfoIconRed,
  MedicalHistoryIcon,
  SampleTestTubesIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  DIAGNOSITC_PHELBO_TRACKING_STATUS,
  DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { Overlay } from 'react-native-elements';
const { width: winWidth } = Dimensions.get('window');

const AFTER_COLLECTION_STATUS = DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY.concat(
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY
);

interface HomePageOrderStatusCardProps {
  orderId: string | number;
  status: DIAGNOSTIC_ORDER_STATUS;
  reportTat: string;
  patientName?: string;
  appointmentTime?: string;
  onPressBookNow?: () => void;
  testPreparationData?: any;
}

export const HomePageOrderStatusCard: React.FC<HomePageOrderStatusCardProps> = (props) => {
  const { orderId, status, reportTat, patientName, appointmentTime, testPreparationData } = props;
  const [showPreparationModal, setShowPreparationModal] = useState<boolean>(false);

  function getOrderStatusContent(status: DIAGNOSTIC_ORDER_STATUS) {
    var heading, image, content, options;
    if (DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY.includes(status)) {
      heading = string.diagnostics.sampleSubmitted;
      image = <SampleTestTubesIcon style={styles.iconStyle} />;
      content = string.diagnostics.sampleSubmittedContent?.replace(
        '{{reportTat}}',
        reportTat! || '12-24 hr'
      );
      options = string.diagnostics.sampleCollectedText;
    } else if (DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY.includes(status)) {
      heading =
        status === DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED
          ? string.diagnostics.partialReportsReady
          : string.diagnostics.reportGenrated;
      image = <MedicalHistoryIcon style={styles.iconStyle} />;
      content =
        status === DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED
          ? string.diagnostics.partialReportContent?.replace(
              '{{reportTat}}',
              reportTat! || '12-24 hr'
            )
          : string.diagnostics.viewReportContent;
      options = string.diagnostics.viewReportText;
    } else {
      heading = string.diagnostics.bookingFor;
      image = <AppointmentIcon style={styles.iconStyle} />;
      content = string.diagnostics.collectionAppointmentContent?.replace(
        '{{collectionTime}}',
        appointmentTime!
      );
      options = DIAGNOSITC_PHELBO_TRACKING_STATUS.includes(status)
        ? status === DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED
          ? string.diagnostics.sampleCollectedText
          : string.diagnostics.trackPhleboText
        : string.diagnostics.collectionText;
    }
    return {
      heading,
      image,
      content,
      options,
    };
  }

  const { heading, image, content, options } = getOrderStatusContent(status);
  const prepData =
    !!testPreparationData &&
    testPreparationData?.length > 0 &&
    !AFTER_COLLECTION_STATUS.includes(status);
  const prepDataLength = !!testPreparationData && testPreparationData?.length - 1;

  function onPressCloseOverlay() {
    setShowPreparationModal(false);
  }

  const renderPreparationModal = () => {
    return (
      <Overlay
        onRequestClose={() => onPressCloseOverlay()}
        isVisible={showPreparationModal}
        onBackdropPress={() => onPressCloseOverlay()}
        windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        transparent
        overlayStyle={styles.overlayStyle}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => onPressCloseOverlay()}>
            <View style={styles.overlayTouch}>
              <TouchableOpacity>
                <SafeAreaView style={styles.overlaySafeArea}>
                  <View style={styles.overlayContainer}>
                    <Text style={styles.prepHeading}>SPECIAL PREPARATIONS</Text>
                    {testPreparationData?.map((item: string) => {
                      return renderPrepData(item);
                    })}
                  </View>
                </SafeAreaView>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Overlay>
    );
  };

  const renderPrepData = (text: string, numberOfLines?: number) => {
    return (
      <View style={[styles.innerPrepContainer, { marginVertical: !!numberOfLines ? 0 : 5 }]}>
        <InfoIconRed style={styles.infoIconStyle} />
        <Text numberOfLines={!!numberOfLines ? numberOfLines : 3} style={styles.prepDataStyle}>
          {nameFormater(text, 'title')}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container} key={orderId.toString()}>
      <View style={[styles.rowStyles]}>
        <Text style={[styles.heading1]}>
          {nameFormater(patientName!, 'title')} : #{orderId}
        </Text>
        {image}
      </View>
      <Text style={styles.statusHeading}>{nameFormater(heading, 'upper')} !</Text>
      <View
        style={[
          styles.contentContainer,
          { minHeight: AFTER_COLLECTION_STATUS.includes(status) ? 60 : 40 },
        ]}
      >
        <Text style={styles.content1}>{content}</Text>
      </View>
      {prepData ? (
        <View>
          <View style={styles.prepDataContainer}>
            {renderPrepData(testPreparationData?.[0], 1)}
            {!!prepDataLength && prepDataLength > 0 && (
              <TouchableOpacity onPress={() => setShowPreparationModal(!showPreparationModal)}>
                <Text style={styles.moreText}>+{prepDataLength} more</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : !AFTER_COLLECTION_STATUS.includes(status) ? (
        <View style={styles.prepDataContainer}>
          <Text style={styles.content1}>{string.diagnostics.noPrepRequiredText}</Text>
        </View>
      ) : (
        <View style={{ marginVertical: 3 }} />
      )}

      <View style={styles.buttonView}>
        <TouchableOpacity onPress={props.onPressBookNow}>
          <Text style={styles.bookNowText}>{nameFormater(options, 'upper')}</Text>
        </TouchableOpacity>
      </View>

      {renderPreparationModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    margin: 16,
    minHeight: 175,
    width: winWidth - 32,
  },
  rowStyles: { flexDirection: 'row', justifyContent: 'space-between' },
  heading1: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1, 18),
    width: '87%',
    alignSelf: 'center',
  },
  statusHeading: {
    ...theme.viewStyles.text('SB', 15, colors.SHERPA_BLUE, 1, 20),
    width: '87%',
    justifyContent: 'center',
  },
  content: {
    ...theme.viewStyles.text('R', 15, colors.SHERPA_BLUE, 1, 20),
    marginTop: 6,
  },
  content1: {
    ...theme.viewStyles.text('R', 13, colors.SHERPA_BLUE, 1, 18),
    marginTop: 6,
  },
  buttonView: { alignSelf: 'flex-end', marginTop: 15 },
  bookNowText: {
    ...theme.viewStyles.text('B', 15, theme.colors.APP_YELLOW, 1, 20),
    textAlign: 'right',
  },
  iconStyle: { height: 35, width: 35, resizeMode: 'contain' },
  prepDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  innerPrepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconStyle: { resizeMode: 'contain', height: 18, width: 18 },
  prepDataStyle: {
    ...theme.viewStyles.text('R', 11, '#FF637B', 1, 14),
    marginHorizontal: 10,
  },
  contentContainer: {
    justifyContent: 'center',
  },
  moreText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12 : 13, theme.colors.APP_YELLOW, 1, 15),
    letterSpacing: 0.25,
  },
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: colors.CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  overlayTouch: {
    width: '100%',
    backgroundColor: colors.CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  overlaySafeArea: { flex: 1, backgroundColor: colors.CLEAR },
  overlayContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'transparent',
    padding: 16,
  },
  prepHeading: {
    ...theme.viewStyles.text('M', 15, colors.SHERPA_BLUE, 1, 20),
    justifyContent: 'center',
    marginBottom: 10,
  },
});
