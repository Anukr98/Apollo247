import {
  AgeGroupIcon,
  GenderIcon,
  SampleTypeIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import _ from 'lodash';
import stripHtml from 'string-strip-html';
import HTML from 'react-native-render-html';
import { CMSTestInclusions } from '@aph/mobile-patients/src/components/Tests/TestDetails';

const gender: any = {
  B: 'MALE AND FEMALE',
  M: 'MALE',
  F: 'FEMALE',
};

interface TestDetailsAboutCardProps {
  containerStyle: StyleProp<ViewStyle>;
  showDescription: string;
  readMore: boolean;
  onPressReadMore: () => void;
  inclusionName: any;
  diagnosticAge: string;
  diagnosticGender: string;
  testInfo: any;
}

export const TestDetailsAboutCard: React.FC<TestDetailsAboutCardProps> = (props) => {
  const {
    containerStyle,
    showDescription,
    readMore,
    inclusionName,
    diagnosticAge,
    diagnosticGender,
    testInfo,
  } = props;

  function filterDiagnosticHTMLContent(content: string = '') {
    return content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;rn/g, '>')
      .replace(/&gt;r/g, '>')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, '\n')
      .replace(/\.t/g, '.');
  }

  function createSampleType(data: any) {
    const array = data?.map(
      (item: CMSTestInclusions) => nameFormater(item?.sampleTypeName),
      'title'
    );
    const sampleTypeArray = [...new Set(array)]?.filter((item) => item);
    return sampleTypeArray;
  }

  const renderDescription = (showDescription: string) => {
    const formattedText = filterDiagnosticHTMLContent(showDescription);
    return (
      <>
        <View style={[styles.overViewContainer, { width: readMore ? '85%' : '100%' }]}>
          {readMore ? (
            <Text style={styles.packageDescriptionText} numberOfLines={3}>
              {stripHtml(showDescription)}
            </Text>
          ) : (
            <HTML html={formattedText} baseFontStyle={styles.packageDescriptionText} />
          )}
        </View>
        {!readMore && renderSkuSpecificDetails()}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => props.onPressReadMore()}
          style={styles.readMoreTouch}
        >
          <Text style={styles.readMoreText}>
            {!readMore ? string.diagnosticsDetails.seeLess : string.diagnosticsDetails.seeMore}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderSkuSpecificDetails = () => {
    const sampleType =
      !!inclusionName && inclusionName?.length > 0 ? createSampleType(inclusionName) : [];
    const sampleString = sampleType?.length > 0 ? sampleType?.join(', ') : '';
    const showAge = (!!diagnosticAge && diagnosticAge) || 'For all age group';
    const showGender =
      (!!diagnosticGender && diagnosticGender) ||
      (!_.isEmpty(testInfo) && `FOR ${gender?.[testInfo?.Gender]}`) ||
      'Both';
    const isSamplePresent = !!sampleString && sampleString != '';
    return (
      <View style={[styles.skuSpecificView, { justifyContent: 'space-evenly' }]}>
        {isSamplePresent
          ? renderDetails(
              0,
              string.diagnosticsDetails.sample,
              sampleString,
              <SampleTypeIcon style={styles.aboutIcons} />
            )
          : null}
        {!!showGender
          ? renderDetails(
              1,
              string.diagnosticsDetails.gender,
              nameFormater(showGender, 'title'),
              <GenderIcon style={styles.aboutIcons} />
            )
          : null}
        {!!showAge
          ? renderDetails(
              2,
              string.diagnosticsDetails.ageGroup,
              showAge,
              <AgeGroupIcon style={styles.aboutIcons} />
            )
          : null}
      </View>
    );
  };

  const renderDetails = (index: number, key: string, value: string, Icon: any) => {
    return (
      <View style={[styles.detailsView, { marginLeft: index == 0 ? 0 : 4 }]}>
        {Icon}
        <View style={{ marginHorizontal: 8 }}>
          <Text style={styles.packageDescriptionText}>{key} </Text>
          <Text style={styles.skuSpecificValues}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={containerStyle}>
      {/**
       * if package then package otherwise, test.
       * age if not coming from cms -> db
       * gender if not coming from cms -> db
       * sample type cms -> db
       */}
      <Text style={styles.packageDescriptionHeading}>{string.diagnosticsDetails.about}</Text>
      {!!showDescription ? renderDescription(showDescription) : null}
      {!!showDescription ? null : renderSkuSpecificDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  packageDescriptionHeading: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 16.5 : 18, theme.colors.SHERPA_BLUE, 1, 25),
    textAlign: 'left',
    marginBottom: '2%',
  },
  packageDescriptionText: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 0.8, 17),
    letterSpacing: 0.25,
  },
  overViewContainer: {
    marginTop: 4,
  },
  readMoreTouch: { alignSelf: 'flex-end', marginTop: 10 },
  readMoreText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 14 : 15, theme.colors.APP_YELLOW, 1, 20),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  aboutIcons: { height: 18, width: 18, resizeMode: 'contain' },
  skuSpecificView: {
    flexDirection: 'row',
    marginLeft: 8,
    marginTop: 16,
  },
  skuSpecificValues: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 16),
    letterSpacing: 0.25,
  },
  detailsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
