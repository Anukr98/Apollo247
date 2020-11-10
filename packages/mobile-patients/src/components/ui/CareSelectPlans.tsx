import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageBackground,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ScrollView } from 'react-native-gesture-handler';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PLAN_DETAILS_BY_PLAN_ID } from '@aph/mobile-patients/src/graphql/profiles';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import ContentLoader from 'react-native-easy-content-loader';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
const planDimension = 120;

interface CareSelectPlansProps {
  onPressKnowMore: () => void;
  style?: StyleProp<ViewStyle>;
  onSelectMembershipPlan: (plan: any) => void;
  isConsultJourney?: boolean;
  careDiscountPrice?: number;
}

export const CareSelectPlans: React.FC<CareSelectPlansProps> = (props) => {
  const [membershipPlans, setMembershipPlans] = useState<any>([]);
  const [planSelected, setPlanSelected] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const { onPressKnowMore, isConsultJourney, careDiscountPrice } = props;
  const client = useApolloClient();
  const planId = AppConfig.Configuration.CARE_PLAN_ID;

  useEffect(() => {
    fetchCarePlans();
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
      if (res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary) {
        setMembershipPlans(res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      CommonBugFender('CareSelectPlans_GetPlanDetailsByPlanId', error);
    }
  };

  const onPressMembershipPlans = (index: number) => {
    setPlanSelected(membershipPlans?.[index]);
    props.onSelectMembershipPlan(membershipPlans?.[index]);
  };

  const renderCareSubscribeCard = (value: any, index: number) => {
    const duration = value?.durationInMonth;
    return (
      <View style={{ paddingBottom: 30 }}>
        <TouchableOpacity
          key={index}
          onPress={() => onPressMembershipPlans(index)}
          style={[styles.subscriptionCard, { marginLeft: index === 0 ? 10 : 0 }]}
        >
          <ImageBackground source={{ uri: value?.icon }} style={styles.planContainer}>
            <Text
              style={[
                styles.duration,
                {
                  left: `${duration}`.length === 1 ? 7 : 3,
                  top: `${duration}`.length === 1 ? planDimension / 2 - 4 : planDimension / 2 + 2,
                  transform:
                    `${duration}`.length === 1 ? [{ rotate: '-80deg' }] : [{ rotate: '-100deg' }],
                },
              ]}
            >
              {duration}
            </Text>
            <Text style={styles.price}>
              {string.common.Rs}
              {value?.currentSellingPrice}
            </Text>
          </ImageBackground>
        </TouchableOpacity>
        {value?.saved_extra_on_lower_plan && (
          <Text style={styles.savingsText}>Save {value?.saved_extra_on_lower_plan}% extra</Text>
        )}
        <TouchableOpacity onPress={() => onPressMembershipPlans(index)} style={styles.radioBtn} />
      </View>
    );
  };

  const renderSubscribeCareContainer = () => (
    <ContentLoader loading={loading} active containerStyles={{ marginTop: 5 }}>
      <View style={styles.careTextContainer}>
        <CircleLogo style={styles.circleLogo} />
        {isConsultJourney ? (
          <Text style={styles.getCareText}>
            Get{' '}
            <Text style={theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE)}>
              {string.common.Rs}
              {careDiscountPrice} off{' '}
            </Text>
            on this Consult with CARE membership and a lot more benefits....
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
        horizontal={true}
        bounces={false}
        showsHorizontalScrollIndicator={false}
      >
        {membershipPlans?.map((value: any, index: number) => renderCareSubscribeCard(value, index))}
      </ScrollView>
      <TouchableOpacity style={styles.knowMoreBtn} onPress={onPressKnowMore}>
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW),
            textAlign: 'right',
          }}
        >
          KNOW MORE
        </Text>
      </TouchableOpacity>
    </ContentLoader>
  );

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
            {planSelected?.currentSellingPrice}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={{ marginTop: 7 }}
        onPress={() => {
          setPlanSelected('');
          props.onSelectMembershipPlan('');
        }}
      >
        <Text style={styles.removeTxt}>REMOVE</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.careBannerView, props.style]}>
      {planSelected ? renderCarePlanAdded() : renderSubscribeCareContainer()}
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
    ...theme.viewStyles.text('R', 13, theme.colors.LIGHT_BLUE),
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
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    alignSelf: 'center',
    marginTop: 4,
    position: 'absolute',
    top: planDimension + 38,
  },
  savingsText: {
    ...theme.viewStyles.text('M', 8, theme.colors.SHERPA_BLUE),
    alignSelf: 'center',
    marginTop: 12,
  },
  knowMoreBtn: {
    marginTop: 15,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  planAddedContainer: {
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
});
