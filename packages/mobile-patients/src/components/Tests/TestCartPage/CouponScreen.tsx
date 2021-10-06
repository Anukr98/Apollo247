import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Dimensions } from 'react-native';
import { nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { fetchDiagnosticCoupons } from '@aph/mobile-patients/src/helpers/apiCalls';

import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';

const screenHeight = Dimensions.get('window').height;

export interface CouponScreenProps extends NavigationScreenProps {}

export const CouponScreen: React.FC<CouponScreenProps> = (props) => {
  const { showAphAlert, setLoading, loading } = useUIElements();
  const [couponsList, setCouponsList] = useState([] as any);
  const [couponListError, setCouponListError] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>('');
  const [couponText, setCouponText] = useState<string>('');

  const isEnableApplyBtn = couponText.length >= 4;

  useEffect(() => {
    getDiagnosticCoupons();
  }, []);

  async function getDiagnosticCoupons() {
    setLoading?.(true);
    try {
      const result = await fetchDiagnosticCoupons('Diag');
      console.log({ result });
      if (!!result?.data?.response && result?.data?.response?.length > 0) {
        const getCoupons = result?.data?.response;
        setLoading?.(false);
        setCouponsList(getCoupons);
      } else {
        setCouponsList([]);
        setCouponListError(true);
      }
    } catch (error) {
      setCouponsList([]);
      renderErrorInFetching();
      console.log({ error });
      CommonBugFender('getDiagnosticCoupons_CouponScreen', error);
    }
  }

  const renderNoCouponsFound = () => {
    return (
      <View style={styles.cardStyle}>
        <View>
          {!loading && couponsList?.length == 0 && (
            <Text style={styles.noCouponsAvailText}>{string.diagnosticsCoupons.noCouponsText}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderErrorInFetching = () => {
    setLoading?.(false);
    props.navigation.goBack();
    showAphAlert?.({
      title: string.common.uhOh,
      description: string.diagnosticsCoupons.couponFetchError,
    });
  };

  function handleBack() {
    props.navigation.goBack();
    return true;
  }

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'APPLY COUPON'}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };

  const renderCouponTextBox = () => {
    const rightIconView = () => {
      return (
        !couponError && (
          <View
            style={[
              styles.rightView,
              {
                opacity: isEnableApplyBtn ? 1 : 0.5,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              disabled={!isEnableApplyBtn}
              onPress={() => {
                // applyCoupon(couponText, cartItems);
              }}
            >
              <Text style={styles.applyText}>
                {nameFormater(string.diagnosticsCoupons.apply, 'upper')}
              </Text>
            </TouchableOpacity>
          </View>
        )
      );
    };

    return (
      <View style={styles.textInputContainer}>
        <View style={{ flexDirection: 'row' }}>
          <TextInputComponent
            value={couponText}
            onChangeText={(text) => {
              if (/^\S*$/.test(text)) {
                couponError && setCouponError('');
                setCouponText(text);
              }
            }}
            textInputprops={{
              ...(couponError ? { selectionColor: colors.INPUT_BORDER_FAILURE } : {}),
              maxLength: 20,
              autoCapitalize: 'characters',
            }}
            inputStyle={[
              styles.searchValueStyle,
              couponError ? { borderBottomColor: colors.INPUT_BORDER_FAILURE } : {},
            ]}
            conatinerstyles={{ paddingBottom: 0 }}
            placeholder={string.diagnosticsCoupons.couponPlcaholder}
          />
          {rightIconView()}
        </View>

        {renderCouponError(couponError)}
      </View>
    );
  };

  const renderCouponError = (error: string) => {
    return !!error ? (
      <Text style={styles.inputValidationStyle}>
        {error || string.diagnosticsCoupons.invalidCouponCode}
      </Text>
    ) : null;
  };

  const renderCouponView = (item: any, index: number) => {
    return (
      <View style={styles.couponOuterView}>
        <View style={styles.couponCodeView}>
          <Text style={styles.couponCodeText}>{item?.coupon}</Text>
        </View>
        <TouchableOpacity onPress={() => console.log('apply')}>
          <Text style={styles.applyText}>
            {nameFormater(string.diagnosticsCoupons.apply, 'upper')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCouponHeadingView = (item: any, index: number) => {
    return (
      <>
        {!!item?.textOffer && item?.textOffer != '' ? (
          <View style={styles.headingView}>
            <Text style={styles.headingText}>{item?.textOffer}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderCouponDescriptionView = (item: any, index: number) => {
    return (
      <>
        {!!item?.message && item?.message != '' ? (
          <View style={styles.descView}>
            <Text style={styles.descText}>
              {item?.message} <Text style={styles.tncText}>TnC Apply</Text>
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderCouponItems = ({ item, index }) => {
    return (
      <View style={{ padding: 16 }}>
        {renderCouponView(item, index)}
        <View style={{ width: '85%' }}>
          {renderCouponHeadingView(item, index)}
          {renderCouponDescriptionView(item, index)}
        </View>
      </View>
    );
  };

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  const renderSeparator = () => {
    return <Spearator />;
  };

  const renderApplicableCouponsList = () => {
    return (
      <View style={{ backgroundColor: colors.WHITE, maxHeight: screenHeight / 1.45 }}>
        <FlatList
          keyExtractor={keyExtractor}
          bounces={false}
          data={couponsList}
          renderItem={renderCouponItems}
          ListEmptyComponent={renderNoCouponsFound}
          ItemSeparatorComponent={renderSeparator}
        />
      </View>
    );
  };

  const renderMainView = () => {
    return (
      <View>
        {renderLabel(nameFormater(string.diagnosticsCoupons.applyCouponText, 'title'))}
        {renderCouponTextBox()}
        {renderLabel(string.diagnosticsCoupons.couponForYou)}
        {renderApplicableCouponsList()}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderMainView()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
    marginRight: 16,
  },
  labelTextStyle: {
    ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 20),
    marginBottom: 6,
    marginLeft: 16,
  },
  couponCodeView: {
    padding: 14,
    paddingTop: 4,
    paddingBottom: 4,
    borderColor: colors.CONSULT_SUCCESS_TEXT,
    backgroundColor: colors.TEST_CARD_BUTTOM_BG,
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: 'dashed',
  },
  couponCodeText: {
    ...theme.viewStyles.text('M', 16, colors.CONSULT_SUCCESS_TEXT, 1, 24),
  },
  headingView: {
    marginTop: 12,
  },
  headingText: {
    ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 20),
  },
  descView: {
    marginTop: 6,
  },
  descText: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.4, 20),
  },
  tncText: {
    ...theme.viewStyles.text('M', 12, colors.APP_YELLOW, 1, 20),
  },
  applyText: {
    ...theme.viewStyles.text('SB', 14, colors.TANGERINE_YELLOW, 1, 19),
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    marginVertical: 8,
  },
  noCouponsAvailText: {
    ...theme.viewStyles.text('M', 13, theme.colors.FILTER_CARD_LABEL),
    margin: 20,
    textAlign: 'center',
    opacity: 0.3,
  },
  textInputContainer: {
    backgroundColor: theme.colors.WHITE,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  couponInputStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE),
  },
  inputValidationStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.INPUT_FAILURE_TEXT),
    lineHeight: 24,
    paddingTop: 2,
    letterSpacing: 0.04,
  },
  searchValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
    backgroundColor: '#F7F8F5',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
    width: '100%',
    height: 48,
    paddingLeft: 10,
  },
  rightView: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    right: 0,
    height: 48,
    paddingRight: 16,
  },
  couponOuterView: { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
});
