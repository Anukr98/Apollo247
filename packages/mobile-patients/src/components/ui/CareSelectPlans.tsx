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
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PLAN_DETAILS_BY_PLAN_ID } from '@aph/mobile-patients/src/graphql/profiles';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import ContentLoader from 'react-native-easy-content-loader';
import { CircleLogo, CrossPopup, BlueTick } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import { Overlay } from 'react-native-elements';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

const { width } = Dimensions.get('window');
const planDimension = 120;
const defaultPlanDimension = 160;

interface CareSelectPlansProps extends NavigationScreenProps {
  style?: StyleProp<ViewStyle>;
  onSelectMembershipPlan?: () => void | null;
  isConsultJourney?: boolean;
  careDiscountPrice?: number;
  isModal?: boolean;
  closeModal?: (() => void) | null;
  membershipPlans?: any;
  doctorFees?: number;
}

export const CareSelectPlans: React.FC<CareSelectPlansProps> = (props) => {
  const [membershipPlans, setMembershipPlans] = useState<any>(props.membershipPlans || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoPlanAdded, setAutoPlanAdded] = useState<boolean>(false);
  const {
    isConsultJourney,
    careDiscountPrice,
    onSelectMembershipPlan,
    isModal,
    closeModal,
    doctorFees,
  } = props;
  const client = useApolloClient();
  const planId = AppConfig.Configuration.CARE_PLAN_ID;
  const {
    circlePlanSelected,
    setCirclePlanSelected,
    setDefaultCirclePlan,
    defaultCirclePlan,
    selectDefaultPlan,
  } = useShoppingCart();

  useEffect(() => {
    if (!props.membershipPlans || props.membershipPlans?.length === 0) {
      fetchCarePlans();
    } else {
      setLoading(false);
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
        if (doctorFees && doctorFees >= 400) {
          autoSelectDefaultPlan(circlePlans);
          if (!circlePlanSelected) {
            setAutoPlanAdded(true);
          }
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      CommonBugFender('CareSelectPlans_GetPlanDetailsByPlanId', error);
    }
  };

  const onPressMembershipPlans = (index: number) => {
    setCirclePlanSelected && setCirclePlanSelected(membershipPlans?.[index]);
    AsyncStorage.setItem('circlePlanSelected', JSON.stringify(membershipPlans?.[index]));
    onSelectMembershipPlan && onSelectMembershipPlan();
    setDefaultCirclePlan && setDefaultCirclePlan(null);
    setAutoPlanAdded(false);
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
                  left: `${duration}`.length === 1 ? (isPlanActive ? 8 : 7) : isPlanActive ? 5 : 3,
                  top: `${duration}`.length === 1 ? iconDimension / 2 - 3 : iconDimension / 2 + 3,
                  transform:
                    `${duration}`.length === 1 ? [{ rotate: '-80deg' }] : [{ rotate: '-100deg' }],
                  color: value?.defaultPack ? 'white' : theme.colors.APP_YELLOW,
                  fontSize: isPlanActive ? 18 : 14,
                },
              ]}
            >
              {duration}
            </Text>
            <Text
              style={[
                styles.price,
                {
                  marginTop: iconDimension / 2 - 10,
                  fontSize: isPlanActive ? 24 : 18,
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
            Save {value?.saved_extra_on_lower_plan}% extra
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
      <View style={styles.closeIcon}>
        <TouchableOpacity
          onPress={() => {
            setCirclePlanSelected && setCirclePlanSelected(null);
            AsyncStorage.removeItem('circlePlanSelected');
            selectDefaultPlan && selectDefaultPlan(membershipPlans);
            closeModal && closeModal();
          }}
        >
          <CrossPopup style={styles.crossIconStyle} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSubscriptionPlans = () => {
    return (
      <ContentLoader loading={loading} active containerStyles={{ marginTop: 10 }}>
        {isModal && renderHeaderTitle()}
        <View style={isModal ? styles.careBannerView : {}}>
          <View style={styles.careTextContainer}>
            <CircleLogo style={styles.circleLogo} />
            {isConsultJourney ? (
              autoPlanAdded ? (
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
                {string.circleDoctors.getCircleMembershipOffersDescription}
              </Text>
            ) : (
              <Text style={styles.getCareText}>
                Get{' '}
                <Text style={theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE)}>
                  {string.common.Rs}5.40 Cashback
                </Text>{' '}
                and{' '}
                <Text style={theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE)}>
                  Free delivery
                </Text>{' '}
                on your CURRENT order with CARE
              </Text>
            )}
          </View>
          <ScrollView
            style={{ marginTop: 4 }}
            contentContainerStyle={{ alignItems: 'center' }}
            horizontal={true}
            bounces={false}
            showsHorizontalScrollIndicator={false}
          >
            {membershipPlans?.map((value: any, index: number) =>
              renderCareSubscribeCard(value, index)
            )}
          </ScrollView>
          {!isModal && isConsultJourney && !autoPlanAdded && renderCircleDiscountOnConsult()}
          {!isModal && renderKnowMore('flex-end')}
        </View>
        {isModal && renderKnowMore('center')}
        {isModal && renderAddToCart()}
        {isModal && renderCircleFacts()}
      </ContentLoader>
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
          { alignSelf: alignSelf, marginTop: autoPlanAdded ? 0 : 10 },
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
        {autoPlanAdded && <View style={styles.seperatorLine} />}
        {autoPlanAdded ? (
          <TouchableOpacity style={styles.knowMoreBtn} onPress={() => removeAutoAddedPlan()}>
            <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.BORDER_BOTTOM_COLOR) }}>
              REMOVE
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const openCircleWebView = () => {
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRCLE_CONSULT_URL,
    });
  };

  const removeAutoAddedPlan = () => {
    setCirclePlanSelected && setCirclePlanSelected(null);
    AsyncStorage.removeItem('circlePlanSelected');
    setAutoPlanAdded(false);
  };

  const renderAddToCart = () => {
    return (
      <Button
        title={string.circleDoctors.addToCart}
        style={styles.buyNowBtn}
        onPress={() => {
          setDefaultCirclePlan && setDefaultCirclePlan(null);
          autoSelectDefaultPlan(membershipPlans);
          closeModal && closeModal();
        }}
      />
    );
  };

  const autoSelectDefaultPlan = (plans: any) => {
    if (!circlePlanSelected) {
      const defaultPlan = plans?.filter((item: any) => item.defaultPack === true);
      if (defaultPlan?.length > 0) {
        setCirclePlanSelected && setCirclePlanSelected(defaultPlan[0]);
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
          AsyncStorage.removeItem('circlePlanSelected');
        }}
      >
        <Text style={styles.removeTxt}>REMOVE</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={isModal ? {} : [styles.careBannerView, props.style]}>
      {circlePlanSelected && !isModal && !autoPlanAdded && !loading
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
    marginTop: planDimension / 2 - 10,
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
    width: 50,
    height: 32,
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
    width: 50,
    height: 32,
    marginRight: 4,
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
    top: planDimension / 2 - 2,
    transform: [{ rotate: '-90deg' }],
    ...theme.viewStyles.text('M', 16, theme.colors.APP_YELLOW),
  },
  planContainer: {
    width: planDimension,
    height: planDimension,
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
    borderRadius: 10,
    backgroundColor: 'white',
    width: width - 36,
    height: 'auto',
    padding: 0,
    paddingBottom: 20,
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
    marginTop: 6,
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
});
