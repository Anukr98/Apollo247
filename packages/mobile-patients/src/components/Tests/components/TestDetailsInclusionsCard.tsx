import { Down, TestsIcon, Up } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import _ from 'lodash';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
const screenWidth = Dimensions.get('window').width;

interface TestDetailsInclusionsCardProps {
  containerStyle: StyleProp<ViewStyle>;
  getMandatoryParameterCount: number;
  nonInclusionParamters: any;
  diagnosticInclusionName: any;
  inclusions: any;
  onPressInclusion: (item: any, index: number) => void;
  parameterExpandedArray: any[];
}

export const TestDetailsInclusionsCard: React.FC<TestDetailsInclusionsCardProps> = (props) => {
  const {
    containerStyle,
    getMandatoryParameterCount,
    nonInclusionParamters,
    diagnosticInclusionName,
    inclusions,
    parameterExpandedArray,
  } = props;

  const renderTotalTestHeading = () => {
    return (
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TestsIcon style={styles.infoIconStyle} />
        <Text style={[styles.itemNameText, { marginHorizontal: 6 }]}>
          {nameFormater(string.diagnosticsDetails.totalTests, 'title')} (
          {getMandatoryParameterCount + nonInclusionParamters?.length ||
            diagnosticInclusionName?.length}
          )
        </Text>
      </View>
    );
  };

  const renderInclusions = () => {
    return (
      <>
        {inclusions?.map((item: any, index: number) => {
          const getMandatoryParameters = item?.TestObservation?.filter(
            (val: any) => val?.mandatoryValue == '1'
          );
          const isParameterPresent = !!getMandatoryParameters && getMandatoryParameters?.length > 0;
          return (
            <>
              <TouchableOpacity
                onPress={() => (isParameterPresent ? props.onPressInclusion(item, index) : null)}
                style={{ marginBottom: '1.5%' }}
              >
                <View style={[styles.rowStyle, { justifyContent: 'space-between' }]}>
                  <Text style={styles.inclusionsItemText}>
                    {!!item?.inclusionName ? nameFormater(item?.inclusionName!, 'title') : ''}{' '}
                  </Text>
                  {isParameterPresent ? (
                    parameterExpandedArray?.includes(index) ? (
                      <Up />
                    ) : (
                      <Down />
                    )
                  ) : null}
                </View>
                {isParameterPresent ? (
                  <View style={{ marginHorizontal: '3%' }}>
                    <Text
                      style={{ ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 0.8, 18) }}
                    >
                      {getMandatoryParameters?.length}{' '}
                      {getMandatoryParameters?.length > 1 ? 'tests' : 'test'} included
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
              {isParameterPresent && parameterExpandedArray?.includes(index)
                ? renderParamterData(item)
                : null}
              {inclusions?.length - 1 == index ? null : renderSeparator(0, true, 12)}
            </>
          );
        })}
      </>
    );
  };

  const renderSeparator = (topMargin: number, isFullWidth: boolean, bottomMargin: number) => {
    return (
      <Spearator
        style={[
          isFullWidth && styles.fullSepratorStyle,
          { marginTop: topMargin, marginBottom: bottomMargin, opacity: 0.09 },
        ]}
      />
    );
  };

  const renderParamterData = (item: any) => {
    const getMandatoryParameters =
      item?.TestObservation?.length > 0 &&
      item?.TestObservation != '' &&
      item?.TestObservation?.filter((obs: any) => obs?.mandatoryValue === '1');

    return (
      <>
        {!!getMandatoryParameters && getMandatoryParameters?.length > 0
          ? getMandatoryParameters.map((para: any) => (
              <View style={[styles.rowStyle, { marginHorizontal: '10%', width: '88%' }]}>
                <Text style={[styles.inclusionsBullet]}>{'\u2B24'} </Text>
                <Text style={styles.parameterText}>
                  {!!para?.observationName ? nameFormater(para?.observationName!, 'title') : ''}{' '}
                </Text>
              </View>
            ))
          : null}
      </>
    );
  };

  return (
    <View style={containerStyle}>
      <View style={styles.inclusionsView}>
        {renderTotalTestHeading()}
        {renderInclusions()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inclusionsView: { width: '100%' },
  inclusionsBullet: {
    color: colors.TURQUOISE_LIGHT_BLUE,
    fontSize: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  inclusionsItemText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 12 : 13, colors.TURQUOISE_LIGHT_BLUE, 1, 20),
    marginHorizontal: '3%',
  },
  parameterText: {
    ...theme.viewStyles.text('R', isSmallDevice ? 10.5 : 11, colors.SHERPA_BLUE, 1, 16),
    marginBottom: '1.5%',
    marginHorizontal: '3%',
  },
  infoIconStyle: { height: 16, width: 16, resizeMode: 'contain' },
  itemNameText: {
    ...theme.viewStyles.text('SB', 16, theme.colors.SHERPA_BLUE, 1, 21),
    textAlign: 'left',
  },
  rowStyle: { flexDirection: 'row' },
  fullSepratorStyle: {
    marginLeft: -16,
    width: screenWidth - 32,
  },
});
