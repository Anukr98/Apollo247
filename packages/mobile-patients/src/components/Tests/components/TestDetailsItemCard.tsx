import { ClockIcon, InfoIconRed } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Dimensions, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import _ from 'lodash';
import { TestDetailsPriceView } from '@aph/mobile-patients/src/components/Tests/components/TestDetailsPriceView';

const screenWidth = Dimensions.get('window').width;

interface TestDetailsItemCardProps {
  containerStyle: StyleProp<ViewStyle>;
  itemName: string;
  aliasName: string | null;
  reportTat: string;
  diagnosticReportGenerationTime: string | null;
  diagnosticReportCustomerText: string | null;
  pretestingRequirement: string | null;
  slashedPrice: number;
  priceToShow: number;
  setPriceLayoutPosition: (layout: any, event: any, ref: any) => void;
  testInfo?: any;
  isCircleSubscribed: boolean;
}

export const TestDetailsItemCard: React.FC<TestDetailsItemCardProps> = (props) => {
  const {
    containerStyle,
    itemName,
    aliasName,
    reportTat,
    diagnosticReportGenerationTime,
    diagnosticReportCustomerText,
    pretestingRequirement,
    slashedPrice,
    priceToShow,
    testInfo,
    isCircleSubscribed,
  } = props;

  var priceViewRef = React.useRef<View>(null);

  const renderCardTopView = () => {
    return (
      <>
        <View style={{ width: '75%' }}>
          <Text style={styles.itemNameText}>{itemName}</Text>
          {renderAliasName()}
        </View>
        {renderReportsView()}
        {!!pretestingRequirement ? renderPreprationDataView() : null}
      </>
    );
  };

  const renderAliasName = () => {
    const isAliasPresent = !!aliasName && aliasName != '';
    return (
      <View style={{ marginTop: 4 }}>
        {isAliasPresent ? (
          <Text style={styles.italicStyle}>
            {string.diagnostics.alsoKnownAs} {aliasName}
          </Text>
        ) : null}
      </View>
    );
  };

  /**
   * if not coming from the config report tat, else from drupal else from local db.
   */
  const renderReportsView = () => {
    const showReportTat =
      reportTat != ''
        ? reportTat
        : !!diagnosticReportGenerationTime || !diagnosticReportCustomerText;
    const heading =
      !!reportTat &&
      reportTat
        ?.split(' ')
        ?.slice(0, 2)
        ?.join(' ');
    const configurableTat =
      !!reportTat &&
      reportTat
        ?.split(' ')
        ?.slice(2)
        ?.join(' ');
    return (
      <>
        {!!showReportTat && showReportTat != '' ? (
          <>
            <View style={styles.midCardView}>
              <ClockIcon style={styles.clockIconStyle} />
              <View style={styles.midCardTextView}>
                <Text style={styles.reportTimeText}>
                  {!!heading ? `${heading.includes(':') ? heading : `${heading}:`} ` : 'Reports '}
                </Text>
                <Text style={styles.reportTime}>
                  {!!configurableTat
                    ? nameFormater(configurableTat, 'default')
                    : diagnosticReportCustomerText
                    ? diagnosticReportCustomerText
                    : diagnosticReportGenerationTime}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </>
    );
  };

  /**
   * if not by drupal then show from local db.
   */
  const renderPreprationDataView = () => {
    return (
      <View style={styles.bottomCardView}>
        <InfoIconRed style={styles.infoIconStyle} />
        <Text style={styles.preTestingText}>{pretestingRequirement}</Text>
      </View>
    );
  };

  const renderPriceView = (isBottom: boolean) => {
    return renderTopPriceView(slashedPrice, priceToShow);
  };

  const renderTopPriceView = (slashedPrice: number, priceToShow: number) => {
    return (
      <View
        ref={priceViewRef}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          props.setPriceLayoutPosition(layout, event, priceViewRef);
        }}
      >
        {renderSeparator(16, true, 4)}
        {renderPriceViewComponent()}
      </View>
    );
  };

  const renderPriceViewComponent = () => {
    return (
      <View style={{ marginTop: '2%' }}>
        <TestDetailsPriceView
          testInfo={testInfo}
          isCircleSubscribed={isCircleSubscribed}
          slashedPrice={slashedPrice}
          priceToShow={priceToShow}
          isTop={true}
        />
      </View>
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

  return (
    <View style={containerStyle}>
      {renderCardTopView()}
      {renderPriceView(false)}
    </View>
  );
};

const styles = StyleSheet.create({
  itemNameText: {
    ...theme.viewStyles.text('SB', 16, theme.colors.SHERPA_BLUE, 1, 21),
    textAlign: 'left',
  },
  italicStyle: {
    fontStyle: 'italic',
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 15.6,
    fontSize: 12,
  },
  midCardView: { flexDirection: 'row', width: '90%' },
  clockIconStyle: {
    height: 16,
    width: 16,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    marginVertical: '4%',
  },
  midCardTextView: {
    marginHorizontal: '3%',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  reportTimeText: {
    ...theme.viewStyles.text('M', 11, theme.colors.SHERPA_BLUE, 0.5, 16),
    textAlign: 'left',
    letterSpacing: 0.25,
  },
  reportTime: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 16),
    textAlign: 'left',
    letterSpacing: 0.25,
  },
  bottomCardView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconStyle: { height: 16, width: 16, resizeMode: 'contain' },
  preTestingText: {
    ...theme.viewStyles.text('M', 12, colors.INFO_RED_COLOR, 1, 16),
    textAlign: 'left',
    marginHorizontal: '3%',
  },
  fullSepratorStyle: {
    marginLeft: -16,
    width: screenWidth - 32,
  },
});
