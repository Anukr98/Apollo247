import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageBackground,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PLAN_DETAILS_BY_PLAN_ID } from '@aph/mobile-patients/src/graphql/profiles';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import ContentLoader from 'react-native-easy-content-loader';
import { CircleLogo, BlueTick, CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import { Overlay } from 'react-native-elements';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

const { width } = Dimensions.get('window');
interface CircleMembershipPlansProps extends NavigationScreenProps {
  style?: StyleProp<ViewStyle>;
  onSelectMembershipPlan?: (plan?: any) => void;
  isConsultJourney?: boolean;
  isDiagnosticJourney?: boolean;
  careDiscountPrice?: number;
  isModal?: boolean;
  closeModal?: (() => void) | null;
  membershipPlans?: any;
  doctorFees?: number;
  onEndApiCall?: (() => void) | null;
  buyNow?: boolean;
}

export const CircleMembershipPlans: React.FC<CircleMembershipPlansProps> = (props) => {
  const [membershipPlans, setMembershipPlans] = useState<any>(props.membershipPlans || []);
  const [loading, setLoading] = useState<boolean>(true);
  const {
    isConsultJourney,
    isDiagnosticJourney,
    careDiscountPrice,
    onSelectMembershipPlan,
    isModal,
    closeModal,
    doctorFees,
    onEndApiCall,
    buyNow,
  } = props;
  const client = useApolloClient();
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const {
    circlePlanSelected,
    setCirclePlanSelected,
    setDefaultCirclePlan,
    defaultCirclePlan,
    selectDefaultPlan,
    cartTotal,
    cartTotalCashback,
    setIsCircleSubscription,
    setCircleMembershipCharges,
    setAutoCirlcePlanAdded,
    autoCirlcePlanAdded,
    circleMembershipCharges,
  } = useShoppingCart();
  const { setIsDiagnosticCircleSubscription } = useDiagnosticsCart();

  const isCartTotalLimit = cartTotal > 400;
  const planDimension = isModal ? 100 : 120;
  const defaultPlanDimension = 130;
  const isIos = Platform.OS === 'ios';

  useEffect(() => {
    if (!props.membershipPlans || props.membershipPlans?.length === 0) {
      fetchCarePlans();
    } else {
      setLoading(false);
      onEndApiCall && onEndApiCall();
    }
  }, []);

  const fetchCarePlans = async () => {
    try {
      const res = await client.query<GetPlanDetailsByPlanId>({
        query: GET_PLAN_DETAILS_BY_PLAN_ID,
        fetchPolicy: 'no-cache',
        variables: {
          plan_id: planId,
        },
      });
      const circlePlans = res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary;
      if (circlePlans) {
        setMembershipPlans(circlePlans);
        if ((doctorFees && doctorFees >= 400) || isCartTotalLimit || isModal) {
          autoSelectDefaultPlan(circlePlans);
          if (!circlePlanSelected) {
            selectDefaultPlan && selectDefaultPlan(circlePlans);
            setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(true);
          } else {
            setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
          }
        } else {
          if (isConsultJourney || isDiagnosticJourney || !circleMembershipCharges) {
            setDefaultCirclePlan && setDefaultCirclePlan(null);
            defaultCirclePlan && setCirclePlanSelected && setCirclePlanSelected(null);
            setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
          } else {
            // pharma journey and circle membership charges
            const planSelected = circlePlans.filter((value) => value?.currentSellingPrice == circleMembershipCharges);
            setCirclePlanSelected && setCirclePlanSelected(planSelected[0]);
            setIsCircleSubscription && setIsCircleSubscription(true);
            onSelectMembershipPlan && onSelectMembershipPlan(planSelected[0]);
            setDefaultCirclePlan && setDefaultCirclePlan(null);
            setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
          }
        }
      }
      setLoading(false);
      onEndApiCall && onEndApiCall();
    } catch (error) {
      setLoading(false);
      onEndApiCall && onEndApiCall();
      CommonBugFender('CareSelectPlans_GetPlanDetailsByPlanId', error);
    }
  };
  const onPressMembershipPlans = (index: number) => {
    const membershipPlan = membershipPlans?.[index];
    setCirclePlanSelected && setCirclePlanSelected(membershipPlan);
    AsyncStorage.setItem('circlePlanSelected', JSON.stringify(membershipPlan));
    if (isConsultJourney) {
      onSelectMembershipPlan && onSelectMembershipPlan();
    } else {
      setIsCircleSubscription && setIsCircleSubscription(true);
      setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(true);
      setCircleMembershipCharges && setCircleMembershipCharges(membershipPlan?.currentSellingPrice);
      onSelectMembershipPlan && onSelectMembershipPlan(membershipPlan);
    }
    setDefaultCirclePlan && setDefaultCirclePlan(null);
    setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
  };

  const renderCareSubscribeCard = (value: any, index: number) => {
    const duration = value?.durationInMonth;
    const isPlanActive =
      circlePlanSelected?.subPlanId === value?.subPlanId ||
      (isModal && defaultCirclePlan?.subPlanId === value?.subPlanId);
    const iconDimension = isPlanActive ? defaultPlanDimension : planDimension;
    return (
      <View style={{ paddingBottom: 62 }}>
        <TouchableOpacity
          key={index}
          activeOpacity={1}
          onPress={() => onPressMembershipPlans(index)}
          style={[styles.subscriptionCard, { marginLeft: index === 0 ? 10 : 0 }]}
        >
          <ImageBackground
            source={{ uri: value?.icon }}
            style={[
              styles.planContainer,
              {
                width: iconDimension,
                height: iconDimension,
              },
            ]}
          >
            <Text
              style={[
                styles.duration,
                {
                  left:
                    `${duration}`.length === 1
                      ? !isIos
                        ? isPlanActive
                          ? 6
                          : isModal
                          ? 5
                          : 6
                        : isPlanActive
                        ? 7
                        : isModal
                        ? 6
                        : 7
                      : isPlanActive
                      ? 5
                      : isModal
                      ? 3
                      : 4,
                  top: `${duration}`.length === 1 ? iconDimension / 2 - 3 : iconDimension / 2 + 3,
                  transform:
                    `${duration}`.length === 1 ? [{ rotate: '-80deg' }] : [{ rotate: '-100deg' }],
                  color: value?.defaultPack ? 'white' : theme.colors.APP_YELLOW,
                  fontSize: isPlanActive ? 16 : 14,
                },
              ]}
            >
              {duration}
            </Text>
            <Text
              style={[
                styles.price,
                {
                  marginTop: isPlanActive ? iconDimension / 2 - 12 : iconDimension / 2 - 8,
                  fontSize: isPlanActive ? 22 : 16,
                  color: value?.defaultPack ? 'white' : theme.colors.SEARCH_UNDERLINE_COLOR,
                },
              ]}
            >
              {string.common.Rs}
              {value?.currentSellingPrice}
            </Text>
          </ImageBackground>
        </TouchableOpacity>
        {value?.saved_extra_on_lower_plan && (
          <Text
            style={[
              styles.savingsText,
              {
                top: iconDimension + 24,
              },
            ]}
          >
            Save {value?.saved_extra_on_lower_plan} extra
          </Text>
        )}
        <TouchableOpacity
          onPress={() => onPressMembershipPlans(index)}
          style={[
            styles.radioBtn,
            {
              marginRight: index === 0 ? 0 : 12,
              top: value?.saved_extra_on_lower_plan ? iconDimension + 35 : iconDimension + 20,
              borderWidth: isPlanActive ? 3 : 1,
            },
          ]}
        />
      </View>
    );
  };

  const renderSubscribeCareContainer = () => (
    <View>
      {isModal ? (
        <Overlay
          onRequestClose={() => closeModal && closeModal()}
          isVisible={isModal}
          windowBackgroundColor={'rgba(0, 0, 0, 0.31)'}
          overlayStyle={styles.overlayStyle}
        >
          <View>
            {renderCloseIcon()}
            {renderSubscriptionPlans()}
          </View>
        </Overlay>
      ) : (
        renderSubscriptionPlans()
      )}
    </View>
  );

  const renderCloseIcon = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setCirclePlanSelected && setCirclePlanSelected(null);
          setIsCircleSubscription && setIsCircleSubscription(false);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
          setCircleMembershipCharges && setCircleMembershipCharges(0);
          AsyncStorage.removeItem('circlePlanSelected');
          selectDefaultPlan && selectDefaultPlan(membershipPlans);
          closeModal && closeModal();
        }}
        style={styles.closeIcon}
      >
        <CrossPopup style={styles.crossIconStyle} />
      </TouchableOpacity>
    );
  };

  const renderSubscriptionPlans = () => {
    return (
      <View style={styles.subscriptionContainer}>
        <ContentLoader loading={loading} active containerStyles={{ marginTop: 10 }}>
          {isModal && renderHeaderTitle()}
          <View style={isModal ? styles.careBannerView : {}}>
            <View style={styles.careTextContainer}>
              <CircleLogo style={styles.circleLogo} />
              {isConsultJourney ? (
                autoCirlcePlanAdded ? (
                  <Text style={styles.getCareText}>
                    Get{' '}
                    <Text style={theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE)}>
                      {string.common.Rs}
                      {careDiscountPrice} off{' '}
                    </Text>{' '}
                    on this Consult with CIRCLE membership and a lot more benefits....
                  </Text>
                ) : (
                  <Text style={styles.getCareText}>
                    {string.circleDoctors.consultCircleOfferDescription}
                  </Text>
                )
              ) : isModal ? (
                <Text style={[styles.getCareText, { fontSize: 10.6 }]}>
                  {isConsultJourney
                    ? string.circleDoctors.getCircleMembershipOffersDescription
                    : string.circlePharmacy.modalDescription}
                </Text>
              ) : (
                <Text style={styles.getCareText}>
                  {isCartTotalLimit
                    ? string.circlePharmacy.enabledCircleMembership
                    : string.circlePharmacy.enableCircleToGetBestOffers}
                </Text>
              )}
            </View>
            <ScrollView
              style={{ marginTop: 4 }}
              contentContainerStyle={{
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
              horizontal={true}
              bounces={false}
              showsHorizontalScrollIndicator={false}
            >
              {membershipPlans?.map((value: any, index: number) =>
                renderCareSubscribeCard(value, index)
              )}
            </ScrollView>
            {!isModal &&
              isConsultJourney &&
              !autoCirlcePlanAdded &&
              renderCircleDiscountOnConsult()}
            {!isModal && !isConsultJourney && renderCircleDiscountOnPharmacy()}
            {!isModal && renderKnowMore('flex-end')}
          </View>
          {isModal && renderKnowMore('center')}
          {isModal && renderAddToCart()}
          {isModal && renderCircleFacts()}
        </ContentLoader>
      </View>
    );
  };

  const renderCircleDiscountOnConsult = () => {
    return (
      <View style={styles.circleDiscountContainer}>
        <BlueTick style={styles.tickIcon} />
        <Text style={[styles.getCareText, { marginRight: 0 }]}>
          Get{' '}
          <Text style={theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE)}>
            {string.common.Rs}
            {careDiscountPrice} off{' '}
          </Text>{' '}
          on this Consult
        </Text>
      </View>
    );
  };

  const renderKnowMore = (alignSelf: 'flex-end' | 'center') => {
    return (
      <View
        style={[
          styles.bottomBtnContainer,
          { alignSelf: alignSelf, marginTop: autoCirlcePlanAdded ? 0 : 12 },
        ]}
      >
        <TouchableOpacity
          style={styles.knowMoreBtn}
          onPress={() => {
            openCircleWebView();
            closeModal && closeModal();
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW) }}>
            KNOW MORE
          </Text>
        </TouchableOpacity>
        {!isModal && defaultCirclePlan && <View style={styles.seperatorLine} />}
        {!isModal && defaultCirclePlan ? (
          <TouchableOpacity style={styles.knowMoreBtn} onPress={() => removeAutoAddedPlan()}>
            <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.BORDER_BOTTOM_COLOR) }}>
              REMOVE
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderCircleDiscountOnPharmacy = () => {
    return (
      <View
        style={{
          marginLeft: 30,
          marginTop: 10,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <BlueTick style={styles.blueTickIcon} />
          <Text style={theme.viewStyles.text('SB', 13, '#02475B')}>
            {string.circlePharmacy.instantCashback}
          </Text>
          <Text
            style={theme.viewStyles.text('R', 13, '#02475B')}
          >{` of ₹${cartTotalCashback} on this order`}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <BlueTick style={styles.blueTickIcon} />
          <Text style={theme.viewStyles.text('SB', 13, '#02475B')}>
            {string.circlePharmacy.freeDelivery}
          </Text>
          <Text style={theme.viewStyles.text('R', 13, '#02475B')}>{` on every order`}</Text>
        </View>
      </View>
    );
  };

  const openCircleWebView = () => {
    console.log(isDiagnosticJourney);
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: isConsultJourney
        ? AppConfig.Configuration.CIRCLE_CONSULT_URL
        : isDiagnosticJourney
        ? AppConfig.Configuration.CIRCLE_TEST_URL
        : AppConfig.Configuration.CIRLCE_PHARMA_URL,
    });
  };

  const removeAutoAddedPlan = () => {
    setCirclePlanSelected && setCirclePlanSelected(null);
    setDefaultCirclePlan && setDefaultCirclePlan(null);
    setIsCircleSubscription && setIsCircleSubscription(false);
    setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
    setCircleMembershipCharges && setCircleMembershipCharges(0);
    AsyncStorage.removeItem('circlePlanSelected');
    setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
  };

  const renderAddToCart = () => {
    return (
      <Button
        title={buyNow ? string.circleDoctors.buyNow : string.circleDoctors.addToCart}
        style={styles.buyNowBtn}
        onPress={() => {
          setDefaultCirclePlan && setDefaultCirclePlan(null);
          autoSelectDefaultPlan(membershipPlans);
          closeModal && closeModal();
          if (buyNow) {
            props.navigation.navigate(AppRoutes.CircleSubscription);
          } else {
            setDefaultCirclePlan && setDefaultCirclePlan(null);
          }
        }}
      />
    );
  };

  const autoSelectDefaultPlan = (plans: any) => {
    if (!circlePlanSelected) {
      const defaultPlan = plans?.filter((item: any) => item.defaultPack === true);
      if (defaultPlan?.length > 0) {
        setCirclePlanSelected && setCirclePlanSelected(defaultPlan[0]);
        setCircleMembershipCharges &&
          setCircleMembershipCharges(defaultPlan[0]?.currentSellingPrice);
      }
    }
  };

  const renderCircleFacts = () => {
    return (
      <View>
        <Text style={styles.circleFactText}>
          #CircleFact:{' '}
          <Text style={theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR)}>
            On an average Circle members{'\n'}
          </Text>
          save upto ₹400 every month
        </Text>
      </View>
    );
  };
  const renderHeaderTitle = () => {
    return (
      <View style={styles.headerContiner}>
        <Text style={styles.headerText}>{string.circleDoctors.circleMembershipPlans}</Text>
      </View>
    );
  };

  const renderCarePlanAdded = () => (
    <View style={styles.planAddedContainer}>
      <View style={styles.spaceRow}>
        <View style={styles.rowCenter}>
          <CircleLogo style={styles.careLogo} />
          <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE) }}>
            Plan added to cart!
          </Text>
        </View>
        <View style={styles.rowCenter}>
          <Text style={{ ...theme.viewStyles.text('SB', 17, theme.colors.SEARCH_UNDERLINE_COLOR) }}>
            {string.common.Rs}
            {circlePlanSelected?.currentSellingPrice}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={{ marginTop: 7 }}
        onPress={() => {
          setCirclePlanSelected && setCirclePlanSelected(null);
          setIsCircleSubscription && setIsCircleSubscription(false);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
          setCircleMembershipCharges && setCircleMembershipCharges(0);
          AsyncStorage.removeItem('circlePlanSelected');
        }}
      >
        <Text style={styles.removeTxt}>REMOVE</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={isModal ? {} : [styles.careBannerView, props.style]}>
      {circlePlanSelected && !isModal && !autoCirlcePlanAdded && !loading && !defaultCirclePlan
        ? renderCarePlanAdded()
        : renderSubscribeCareContainer()}
    </View>
  );
};

const styles = StyleSheet.create({
  careBannerView: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 0,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  careTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  getCareText: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE),
    flexWrap: 'wrap',
    marginRight: 60,
  },
  subscriptionCard: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 80,
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 12,
  },
  optionButton: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
  },
  banner: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: theme.colors.APP_YELLOW,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 21,
    justifyContent: 'center',
  },
  bannerText: {
    ...theme.viewStyles.text('M', 10, '#FFFFFF'),
    paddingHorizontal: 8,
  },
  price: {
    ...theme.viewStyles.text('SB', 20, theme.colors.SEARCH_UNDERLINE_COLOR),
    alignSelf: 'center',
  },
  oldPrice: {
    ...theme.viewStyles.text('R', 14, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
  },
  limitedPriceBanner: {
    backgroundColor: theme.colors.BUTTON_BG,
    paddingHorizontal: 5,
    marginLeft: 8,
    borderRadius: 1,
    height: 16,
    justifyContent: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    marginTop: 17,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spaceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  careLogo: {
    width: 45,
    height: 27,
    marginRight: 3,
  },
  careLogoTextStyle: {
    textTransform: 'lowercase',
    ...theme.fonts.IBMPlexSansMedium(9.5),
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slashedPrice: {
    ...theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
  },
  removeTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.BORDER_BOTTOM_COLOR),
    textAlign: 'right',
  },
  circleLogo: {
    width: 45,
    height: 27,
    marginRight: 5,
  },
  box: {
    height: 100,
    width: 100,
    borderRadius: 5,
    marginVertical: 40,
    backgroundColor: '#61dafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
    ...theme.viewStyles.text('M', 16, theme.colors.APP_YELLOW),
  },
  planContainer: {
    alignSelf: 'center',
  },
  radioBtn: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    alignSelf: 'center',
    marginTop: 16,
    position: 'absolute',
  },
  savingsText: {
    ...theme.viewStyles.text('M', 8, theme.colors.SHERPA_BLUE),
    alignSelf: 'center',
    position: 'absolute',
  },
  knowMoreBtn: {
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  planAddedContainer: {
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  overlayStyle: {
    padding: 0,
    width: width - 36,
    height: 'auto',
    backgroundColor: 'transparent',
    elevation: 0,
    flex: 1,
    justifyContent: 'center',
  },
  closeIcon: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
    position: 'absolute',
    top: -45,
  },
  crossIconStyle: {
    width: 28,
    height: 28,
  },
  headerContiner: {
    ...theme.viewStyles.cardViewStyle,
    justifyContent: 'center',
    height: 45,
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 10,
  },
  headerText: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
  },
  buyNowBtn: {
    marginTop: 2,
    width: 212,
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    alignSelf: 'center',
  },
  circleFactText: {
    ...theme.viewStyles.text('SB', 10, theme.colors.BORDER_BOTTOM_COLOR),
    flexWrap: 'wrap',
    textAlign: 'center',
    marginTop: 8,
  },
  tickIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  circleDiscountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  seperatorLine: {
    width: 0.5,
    height: 15,
    backgroundColor: theme.colors.BORDER_BOTTOM_COLOR,
  },
  bottomBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  blueTickIcon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
    marginRight: 8,
  },
  subscriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingBottom: 20,
  },
});
