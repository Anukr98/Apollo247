import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  CircleLogo,
  CoinSavingsIcon,
  MinusPatientCircleIcon,
  OrderPlacedCheckedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Overlay } from 'react-native-elements';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { GET_PLAN_DETAILS_BY_PLAN_ID } from '@aph/mobile-patients/src/graphql/profiles';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useApolloClient } from 'react-apollo-hooks';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import HTML from 'react-native-render-html';
const { SHERPA_BLUE, APP_YELLOW, WHITE, APP_GREEN, CLEAR } = theme.colors;

interface CirclePlansListOverlayProps {
  title: string;
  upperLeftText: string;
  upperMiddleText: string;
  upperRightText: string;
  circleSaving: string | number;
  effectivePriceText: string;
  effectivePrice: string | number;
  membershipPlans?: any;
  facts: string;
  choosenPlan: (plan: any) => void;
  onPressClose: () => void;
  onPressViewAll: () => void;
  planToHighLight: any;
}

export const CirclePlansListOverlay: React.FC<CirclePlansListOverlayProps> = (props) => {
  const {
    title,
    upperLeftText,
    upperMiddleText,
    upperRightText,
    circleSaving,
    effectivePrice,
    effectivePriceText,
    membershipPlans,
    facts,
    planToHighLight,
    choosenPlan,
    onPressClose,
    onPressViewAll,
  } = props;
  const client = useApolloClient();
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;

  const [selectedPlan, setSelectedPlan] = useState<any>(planToHighLight);
  const [circleMembershipPlan, setCircleMembershipPlan] = useState<any>([]);

  useEffect(() => {
    if (!props.membershipPlans || props.membershipPlans?.length === 0) {
      fetchCirclePlans();
    } else {
      setCircleMembershipPlan(membershipPlans);
      //set the default plan as the selected plan
      const defaultPlan = membershipPlans?.filter((item: any) => item?.defaultPack === true);
      !!selectedPlan
        ? null
        : !!defaultPlan && defaultPlan?.length > 0 && setSelectedPlan(defaultPlan?.[0]);
    }
  }, []);

  const fetchCirclePlans = async () => {
    try {
      const res = await client.query<GetPlanDetailsByPlanId>({
        query: GET_PLAN_DETAILS_BY_PLAN_ID,
        fetchPolicy: 'no-cache',
        variables: {
          plan_id: planId,
        },
      });
      const circlePlans = res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary;
      setCircleMembershipPlan(circlePlans);
    } catch (error) {
      CommonBugFender('CirclePlansListOverlay_CareSelectPlans_GetPlanDetailsByPlanId', error);
    }
  };

  function _setSelectedPlan(item: any) {
    setSelectedPlan(item);
  }

  function onPressDone() {
    onPressClose();
    choosenPlan(selectedPlan);
  }

  const renderMembershipPlans = ({ item, index }) => {
    const price = item?.currentSellingPrice;
    const durationInMonth = item?.durationInMonth;
    const shouldHighlight = item?.currentSellingPrice === selectedPlan?.currentSellingPrice;
    const defaultPlan = item?.defaultPack;
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={[
          styles.listTouch,
          {
            borderColor: shouldHighlight ? colors.APP_GREEN : '#D4D4D4',
          },
        ]}
        onPress={() => _setSelectedPlan(item)}
      >
        <View style={styles.outerMostView}>
          <Text style={styles.mainPriceText}>
            {string.common.Rs}
            {price}
          </Text>
          <Text style={[styles.savingHeadingText, { marginHorizontal: 8 }]}>
            for {durationInMonth} months
          </Text>
          {!!defaultPlan ? renderPopularTag() : null}
        </View>
        {shouldHighlight ? (
          <OrderPlacedCheckedIcon style={styles.checkedIcon} />
        ) : (
          <MinusPatientCircleIcon style={styles.checkedIcon} />
        )}
      </TouchableOpacity>
    );
  };

  const renderPopularTag = () => {
    return (
      <View style={styles.popularItemView}>
        <Text style={styles.popularText}>Popular</Text>
      </View>
    );
  };

  const renderViewAllBenefits = () => {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={onPressViewAll} style={styles.viewAllTouch}>
        <Text style={styles.yellowText}>VIEW ALL BENEFITS</Text>
      </TouchableOpacity>
    );
  };

  const renderHeadingView = () => {
    return (
      <View style={styles.outerView}>
        <Text style={styles.titleTextStyle}>{title}</Text>
        <CircleLogo style={styles.circleIcon} />
      </View>
    );
  };

  const renderSavingsView = () => {
    const totalPrice =
      Number(effectivePrice) + Number(!!selectedPlan ? selectedPlan?.currentSellingPrice : 0);
    return (
      <View style={{ flexDirection: 'row' }}>
        <CoinSavingsIcon style={styles.coinSavingIconStyle} />
        <View style={{ marginHorizontal: 8 }}>
          {!!circleSaving && circleSaving > 0 && (
            <Text style={styles.savingHeadingText}>
              {upperLeftText}{' '}
              <Text style={{ color: APP_GREEN }}>
                {upperMiddleText} {string.common.Rs}
                {circleSaving}
              </Text>{' '}
              {upperRightText}
            </Text>
          )}
          <Text style={[styles.savingHeadingText, { marginTop: 2 }]}>
            {effectivePriceText}{' '}
            <Text style={{ color: APP_GREEN }}>
              {string.common.Rs}
              {totalPrice}
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  const renderList = () => {
    return (
      <View style={styles.listCardStyle}>
        <FlatList
          bounces={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          keyExtractor={(_, index) => index.toString()}
          data={circleMembershipPlan || []}
          renderItem={renderMembershipPlans}
        />
      </View>
    );
  };

  const renderCircleFacts = () => {
    return (
      <View style={styles.factsView}>
        <HTML html={facts} baseFontStyle={styles.factsStyle} />
      </View>
    );
  };

  const renderButtonsView = () => {
    return (
      <View style={styles.rowStyle}>
        {renderViewAllBenefits()}
        <Button
          title={'SELECT PLAN'}
          onPress={() => onPressDone()}
          style={styles.doneButtonViewStyle}
        />
      </View>
    );
  };

  return (
    <Overlay
      isVisible
      onRequestClose={onPressClose}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.overlayStyle}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity activeOpacity={0.5} style={{ flex: 1 }} onPress={onPressClose} />
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            <View style={styles.mainViewStyle}>
              {renderHeadingView()}
              {renderSavingsView()}
              {renderList()}
              {renderCircleFacts()}
              {renderButtonsView()}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Overlay>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: CLEAR,
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: CLEAR,
  },
  mainViewStyle: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  outerView: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleTextStyle: {
    ...text('B', 16, SHERPA_BLUE, 1, 24),
  },
  mainPriceText: {
    ...text('SB', 20, SHERPA_BLUE, 1, 20),
  },
  savingHeadingText: {
    ...text('M', 12, SHERPA_BLUE, 1, 18),
  },
  listCardStyle: {
    height: 200,
    marginTop: 16,
    marginBottom: 30,
  },
  doneButtonViewStyle: {
    width: '50%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  circleIcon: { height: 47, width: 47, resizeMode: 'contain' },
  coinSavingIconStyle: { height: 20, width: 20, resizeMode: 'contain' },
  checkedIcon: { height: 20, width: 20, resizeMode: 'contain' },
  listTouch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 17,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 5,
    borderWidth: 1.5,
    marginBottom: 12,
    alignItems: 'center',
  },
  outerMostView: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  yellowText: {
    ...text('B', 13, APP_YELLOW, 1, 24),
  },
  viewAllTouch: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '40%',
    height: 50,
  },
  popularItemView: {
    backgroundColor: '#0B92DE',
    height: 20,
    width: 50,
    borderRadius: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  popularText: {
    ...theme.viewStyles.text('SB', 10, 'white'),
    textAlign: 'center',
  },
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factsView: {
    backgroundColor: '#E4F7FF',
    padding: 14,
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  factsStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 16,
    fontSize: 11,
  },
});
