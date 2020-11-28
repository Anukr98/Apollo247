import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ImageBackground,
  Text,
  StyleSheet,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import {
  useAppCommonData,
  bannerType,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import Carousel from 'react-native-snap-carousel';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { theme } from '@aph/mobile-patients/src/theme/theme';
const { width } = Dimensions.get('window');
import { CircleLogoWhite, CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CircleMembershipActivation } from '@aph/mobile-patients/src/components/ui/CircleMembershipActivation';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PLAN_DETAILS_BY_PLAN_ID } from '@aph/mobile-patients/src/graphql/profiles';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

interface CarouselProps extends NavigationScreenProps {
  setShowHdfcConnectPopup?: ((showPopup: boolean, benefitId: string) => void) | null;
  circleActivated?: boolean;
  planActivationCallback?: (() => void) | null;
  circlePlanValidity?: string;
}
export const CarouselBanners: React.FC<CarouselProps> = (props) => {
  const {
    setShowHdfcConnectPopup,
    circleActivated,
    planActivationCallback,
    circlePlanValidity,
  } = props;
  const [slideIndex, setSlideIndex] = useState(0);
  const { currentPatient } = useAllCurrentPatients();
  const hdfc_values = string.Hdfc_values;
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { bannerData, hdfcUserSubscriptions } = useAppCommonData();
  const [showCircleActivation, setShowCircleActivation] = useState<boolean>(
    circleActivated || false
  );
  const planPurchased = useRef<boolean | undefined>(circleActivated);
  const { setCirclePlanSelected, defaultCirclePlan, selectDefaultPlan } = useShoppingCart();
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(false);
  const [membershipPlans, setMembershipPlans] = useState<any>([]);
  const client = useApolloClient();

  useEffect(() => {
    fetchCarePlans();
  }, []);

  const fetchCarePlans = async () => {
    try {
      const res = await client.query<GetPlanDetailsByPlanId>({
        query: GET_PLAN_DETAILS_BY_PLAN_ID,
        fetchPolicy: 'no-cache',
        variables: {
          plan_id: AppConfig.Configuration.CIRCLE_PLAN_ID,
        },
      });
      const membershipPlans = res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary;
      if (membershipPlans) {
        setMembershipPlans(membershipPlans);
        selectDefaultPlan && selectDefaultPlan(membershipPlans);
      }
    } catch (error) {
      CommonBugFender('CircleMembershipPlans_GetPlanDetailsByPlanId', error);
    }
  };

  const getMobileURL = (url: string) => {
    const ext = url?.includes('.jpg') ? '.jpg' : url?.includes('.jpeg') ? 'jpeg' : '.png';
    const txt = url.split(ext)[0];
    const path = txt.split('/');
    path.pop();
    const name = url.split(ext)[0].split('/')[txt.split('/').length - 1];
    const mPath = path.join('/').concat('/mweb_'.concat(name).concat(ext));
    return mPath;
  };

  const renderHdfcSliderItem = ({ item }) => {
    const { cta_action } = item;

    const bannerUri = getMobileURL(item.banner);
    let imageHeight = 144;
    Image.getSize(
      bannerUri,
      (width, height) => {
        imageHeight = height;
      },
      (error) => {
        console.log(error);
      }
    );
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          handleOnBannerClick(cta_action.type, cta_action.meta.action, cta_action.meta.message)
        }
        style={styles.hdfcBanner}
      >
        <ImageBackground
          style={{
            height: imageHeight,
            width: '100%',
          }}
          source={{
            uri: bannerUri,
          }}
          resizeMode={'cover'}
        >
          <View style={styles.bannerContainer}>
            <View style={styles.row}>
              <Text style={styles.bannerTitle}>{item?.banner_template_info?.headerText}</Text>
            </View>
          </View>
          {item?.banner_template_info?.Button ? (
            <View style={styles.bottomView}>{renderUpgradeBtn(item)}</View>
          ) : null}
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderUpgradeBtn = (item: bannerType) => {
    const { cta_action } = item;

    return (
      <TouchableOpacity
        style={styles.upgradeBtnView}
        onPress={() =>
          handleOnBannerClick(cta_action?.type, cta_action?.meta?.action, cta_action?.meta?.message)
        }
      >
        <View style={[styles.row, { marginTop: 6 }]}>
          <Text style={styles.upgradeText}>{item?.banner_template_info?.Button}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleOnBannerClick = (type: any, action: any, message: any) => {
    const subscription_name = hdfcUserSubscriptions.name;
    const eventAttributes: WebEngageEvents[WebEngageEventName.HDFC_HOMEPAGE_CAROUSEL_CLICKED] = {
      'Patient UHID': g(currentPatient, 'uhid'),
      'Customer ID': g(currentPatient, 'id'),
      'Patient Name': g(currentPatient, 'firstName'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Date of Birth': g(currentPatient, 'dateOfBirth'),
      Email: g(currentPatient, 'emailAddress'),
      HDFCMembershipLevel: subscription_name.substring(0, subscription_name.indexOf('+')),
      'Partner ID': g(currentPatient, 'partnerId'),
      HDFCMembershipState: !!g(hdfcUserSubscriptions, 'isActive') ? 'Active' : 'Inactive',
    };
    postWebEngageEvent(WebEngageEventName.HDFC_HOMEPAGE_CAROUSEL_CLICKED, eventAttributes);
    if (action == hdfc_values.UPGRADE_CIRCLE) {
      planPurchased.current = false;
      setCirclePlanSelected && setCirclePlanSelected(null);
      if (type == hdfc_values.ONE_TOUCH) {
        setShowCircleActivation(true);
      } else {
        setShowCirclePlans(true);
      }
    }
    if (type == hdfc_values.REDIRECT) {
      if (action == hdfc_values.SPECIALITY_LISTING) {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      } else if (action == hdfc_values.PHARMACY_LANDING) {
        props.navigation.navigate('MEDICINES');
      } else if (action == hdfc_values.PHR) {
        props.navigation.navigate('HEALTH RECORDS');
      } else if (action == hdfc_values.DOC_LISTING_WITH_PAYROLL_DOCS_SELECTED) {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      } else if (action == hdfc_values.DIAGNOSTICS_LANDING) {
        props.navigation.navigate('TESTS');
      } else if (action == hdfc_values.MEMBERSHIP_DETAIL) {
        props.navigation.navigate(AppRoutes.MembershipDetails, {
          membershipType: g(hdfcUserSubscriptions, 'name'),
          isActive: g(hdfcUserSubscriptions, 'isActive'),
        });
      } else if ((action = hdfc_values.DIETECIAN_LANDING)) {
        props.navigation.navigate('DoctorSearchListing', {
          specialities: hdfc_values.DIETICS_SPECIALITY_NAME,
        });
      } else {
        props.navigation.navigate(AppRoutes.ConsultRoom);
      }
    } else if (type == hdfc_values.CALL_API) {
      if (action == hdfc_values.CALL_EXOTEL_API) {
        const benefits = g(hdfcUserSubscriptions, 'benefits');
        const currentBenefit = benefits.filter((value) => {
          return g(value, 'benefitCtaAction', 'type') === type;
        });
        const availableCount = currentBenefit.length ? currentBenefit[0].availableCount : 0;
        const benefit_id = currentBenefit.length ? currentBenefit[0]._id : '';
        if (availableCount > 0) {
          setShowHdfcConnectPopup && setShowHdfcConnectPopup(true, benefit_id);
        } else {
          renderAlert(
            'Hey, looks like you have exhausted the monthly usage limit for this benefit. If you feel this is an error, please raise a ticket on the Help section.'
          );
        }
      }
    } else if (type == hdfc_values.WHATSAPP_OPEN_CHAT) {
      Linking.openURL(`whatsapp://send?text=${message}&phone=91${action}`);
    } else {
      props.navigation.navigate(AppRoutes.ConsultRoom);
    }
  };

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: 'Hi',
      description: message,
      onPressOk: () => {
        hideAphAlert!();
      },
    });
  };

  const renderCircleMembershipActivated = () => (
    <CircleMembershipActivation
      visible={showCircleActivation}
      closeModal={(planActivated) => {
        setShowCircleActivation(false);
        if (planActivated) {
          planActivationCallback && planActivationCallback();
        }
      }}
      defaultCirclePlan={defaultCirclePlan}
      navigation={props.navigation}
      circlePaymentDone={planPurchased.current}
      circlePlanValidity={circlePlanValidity}
    />
  );

  const renderCircleSubscriptionPlans = () => {
    return (
      <CircleMembershipPlans
        navigation={props.navigation}
        isModal={true}
        closeModal={() => setShowCirclePlans(false)}
        buyNow={true}
        membershipPlans={membershipPlans}
      />
    );
  };

  const showBanner = bannerData && bannerData.length ? true : false;
  if (showBanner) {
    return (
      <View style={{ marginTop: 5, flex: 1 }}>
        {renderCircleMembershipActivated()}
        {showCirclePlans && renderCircleSubscriptionPlans()}
        <Carousel
          onSnapToItem={setSlideIndex}
          data={bannerData}
          renderItem={renderHdfcSliderItem}
          sliderWidth={width}
          itemWidth={width}
          loop={true}
          autoplay={false}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            position: 'absolute',
            bottom: 10,
            alignSelf: 'center',
          }}
        >
          {bannerData?.map((_, index) =>
            index == slideIndex ? renderDot(true) : renderDot(false)
          )}
        </View>
      </View>
    );
  }
  return <View />;
};

const renderDot = (active: boolean) => (
  <View
    style={[
      styles.sliderDots,
      {
        backgroundColor: active
          ? theme.colors.TURQUOISE_LIGHT_BLUE
          : theme.colors.CAROUSEL_INACTIVE_DOT,
        width: active ? 13 : 6,
      },
    ]}
  />
);

const styles = StyleSheet.create({
  hdfcBanner: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.CLEAR,
    borderRadius: 12,
    elevation: 15,
    marginTop: 10,
    marginHorizontal: 28,
    marginBottom: 30,
    padding: 0,
    height: 140,
    width: 330,
    alignSelf: 'center',
  },
  bannerContainer: {
    margin: 15,
  },
  bannerTitle: {
    ...theme.viewStyles.text('M', 16, theme.colors.WHITE),
    maxWidth: '60%',
  },
  sliderDots: {
    height: 6,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 8,
    justifyContent: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleLogo: {
    width: 50,
    height: 30,
    marginRight: 4,
  },
  bottomView: {
    position: 'absolute',
    bottom: 10,
    left: 13,
  },
  upgradeBtnView: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingBottom: 5,
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
  },
  upgradeText: {
    ...theme.viewStyles.text('SB', 9, theme.colors.APP_YELLOW, 1),
  },
  smallCircleLogo: {
    width: 40,
    height: 20,
  },
});
