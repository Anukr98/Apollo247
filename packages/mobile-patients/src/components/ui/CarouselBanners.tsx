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
import {
  g,
  postWebEngageEvent,
  setCircleMembershipType,
  getHealthCredits,
  persistHealthCredits,
  CircleEventSource,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
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
import {
  GET_PLAN_DETAILS_BY_PLAN_ID,
  GET_ONEAPOLLO_USER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { HdfcConnectPopup } from '@aph/mobile-patients/src/components/SubscriptionMembership/HdfcConnectPopup';
import { Overlay } from 'react-native-elements';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';
import { fireCirclePurchaseEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';

interface CarouselProps extends NavigationScreenProps {
  circleActivated?: boolean;
  planActivationCallback?: (() => void) | null;
  circlePlanValidity?: string;
  from: string;
  source?: 'Pharma' | 'Product Detail' | 'Pharma Cart' | 'Diagnostic' | 'Consult';
  successCallback: () => void;
  circleEventSource?: CircleEventSource;
}
export const CarouselBanners: React.FC<CarouselProps> = (props) => {
  const {
    circleActivated,
    planActivationCallback,
    from,
    source,
    successCallback,
    circleEventSource,
  } = props;
  const [slideIndex, setSlideIndex] = useState(0);
  const { currentPatient } = useAllCurrentPatients();
  const hdfc_values = string.Hdfc_values;
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { bannerData, hdfcUserSubscriptions, circleSubscription, hdfcStatus } = useAppCommonData();
  const [showCircleActivation, setShowCircleActivation] = useState<boolean>(
    circleActivated || false
  );
  const planPurchased = useRef<boolean | undefined>(circleActivated);
  const { setCirclePlanSelected, circleSubscriptionId, circlePlanValidity } = useShoppingCart();
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(false);
  const [membershipPlans, setMembershipPlans] = useState<any>([]);
  const [defaultCirclePlan, setDefaultCirclePlan] = useState<any>(null);
  const [showHdfcConnectPopup, setShowHdfcConnectPopup] = useState<boolean>(false);
  const [benefitId, setbenefitId] = useState<string>('');
  const [healthCredits, setHealthCredits] = useState(0);
  const planValidity = useRef<string>('');
  const client = useApolloClient();

  useEffect(() => {
    fetchCarePlans();
  }, []);

  useEffect(() => {
    if (currentPatient?.id) {
      getOneApolloUserDetails();
    }
  }, [currentPatient]);

  const getOneApolloUserDetails = async () => {
    var cachedHealthCredit: any = await getHealthCredits();
    if (cachedHealthCredit != null) {
      setHealthCredits(cachedHealthCredit.healthCredit);
      return; // no need to call api
    }

    client
      .query({
        query: GET_ONEAPOLLO_USER,
        variables: {
          patientId: g(currentPatient, 'id'),
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        setHealthCredits(res?.data?.getOneApolloUser?.availableHC);
        persistHealthCredits(res?.data?.getOneApolloUser?.availableHC);
      })
      .catch((error) => {
        CommonBugFender('fetchingOneApolloUser', error);
      });
  };

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
        const defaultPlan = membershipPlans?.filter((item: any) => item.defaultPack === true);
        if (defaultPlan?.length > 0) {
          setDefaultCirclePlan(defaultPlan[0]);
        }
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

  const fireCircleEvent = (type: string, action: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMA_PRODUCT_UPGRADE_TO_CIRCLE] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Circle Member': circleSubscriptionId ? 'Yes' : 'No',
      type: type,
      action: action,
      from: from || 'HomePage',
    };
    source == 'Pharma' &&
      postWebEngageEvent(WebEngageEventName.PHARMA_CIRCLE_BANNER_CLICKED, eventAttributes);
    source == 'Product Detail' &&
      postWebEngageEvent(WebEngageEventName.PHARMA_PRODUCT_UPGRADE_TO_CIRCLE, eventAttributes);
    source == 'Diagnostic' &&
      postWebEngageEvent(WebEngageEventName.DIAGNOSTICS_CIRCLE_BANNER_CLICKED, eventAttributes);
    source == undefined &&
      postWebEngageEvent(WebEngageEventName.NON_CIRCLE_HOMEPAGE_BANNER_CLICKED, eventAttributes);
  };

  const fireBannerCovidClickedWebengageEvent = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.COVID_BANNER_CLICKED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
    };
    postWebEngageEvent(WebEngageEventName.COVID_BANNER_CLICKED, eventAttributes);
  };

  const fireBannerClickedWebengageEvent = (from: string, type?: string, action?: string) => {
    const circleMembershipType = setCircleMembershipType(
      circlePlanValidity?.startDate!,
      circlePlanValidity?.endDate!
    );
    const eventAttributes: WebEngageEvents[WebEngageEventName.NON_CIRCLE_HOMEPAGE_BANNER_CLICKED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Circle Member': circleSubscriptionId ? 'Yes' : 'No',
      'Membership Type': circleMembershipType,
      'Circle Membership Start Date': circlePlanValidity?.startDate,
      'Circle Membership End Date': circlePlanValidity?.endDate,
      type: type,
      action: action,
      from: from || 'HomePage',
    };
    if (from == hdfc_values.MEMBERSHIP_DETAIL_CIRCLE) {
      postWebEngageEvent(WebEngageEventName.MEMBERSHIP_DETAILS_BANNER_CLICKED, eventAttributes);
    } else {
      postWebEngageEvent(WebEngageEventName.HOMEPAGE_DOC_ON_CALL_BANNER_CLICKED, eventAttributes);
    }
  };

  const renderHdfcSliderItem = ({ item }) => {
    const { cta_action } = item;
    const fineText = item?.banner_template_info?.fineText;
    const bannerUri = getMobileURL(item.banner);
    const isDynamicBanner = item?.banner_template_info?.headerText1;
    const headerText1 = item?.banner_template_info?.headerText1;
    const headerText2 = item?.banner_template_info?.headerText2;
    const headerText3 = item?.banner_template_info?.headerText3;
    const subHeaderText1 = item?.banner_template_info?.subHeaderText1;
    const subHeaderText2 = item?.banner_template_info?.subHeaderText2;
    const btnTxt = item?.banner_template_info?.Button;
    let imageHeight = 180;

    if (!subHeaderText2 || !btnTxt || !headerText3) {
      imageHeight = 160;
      Image.getSize(
        bannerUri,
        (width, height) => {
          imageHeight = height;
        },
        (error) => {}
      );
    } else {
      imageHeight = 180;
    }

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          handleOnBannerClick(
            cta_action?.type,
            cta_action?.meta.action,
            cta_action?.meta.message,
            cta_action?.url,
            cta_action?.meta
          )
        }
        style={[
          styles.hdfcBanner,
          {
            height: imageHeight,
          },
        ]}
      >
        <ImageBackground
          style={{
            aspectRatio: 16 / 7,
          }}
          source={{
            uri: bannerUri,
          }}
          resizeMode={'cover'}
          borderRadius={10}
        >
          <View style={styles.bannerContainer}>
            {headerText1 ? renderBannerText(headerText1) : null}
            {headerText2 ? renderBannerText(headerText2) : null}
            {headerText3 ? renderBannerText(headerText3) : null}
            {subHeaderText1 ? renderBannerText(subHeaderText1, true, true) : null}
            {subHeaderText2 ? renderBannerText(subHeaderText2, true) : null}
          </View>
          <View style={styles.bottomView}>
            {renderUpgradeBtn(item)}
            {fineText ? <Text style={styles.regularText}>{fineText}</Text> : null}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderUpgradeBtn = (item: bannerType) => {
    const { cta_action } = item;
    const btnTxt = item?.banner_template_info?.Button;
    const btnSubTxt = item?.banner_template_info?.ButtonSubText;
    if (btnTxt || btnSubTxt) {
      return (
        <TouchableOpacity
          style={styles.upgradeBtnView}
          onPress={() =>
            handleOnBannerClick(
              cta_action?.type,
              cta_action?.meta?.action,
              cta_action?.meta?.message,
              cta_action?.url,
              cta_action?.meta
            )
          }
        >
          {btnTxt && renderBannerButtonText(btnTxt, cta_action, false)}
          {btnSubTxt && renderBannerButtonText(btnSubTxt, cta_action, true)}
        </TouchableOpacity>
      );
    }
  };

  const renderBannerText = (str: string, isSubHeader?: boolean, isFirstSubHeader?: boolean) => {
    if (str?.includes('<circle>')) {
      const arrayOfStrings = str.split(' ');
      var headerText = arrayOfStrings.map((str, i) => {
        if (str == '<circle>') {
          return (
            <CircleLogoWhite
              style={
                isSubHeader
                  ? [styles.smallCircleLogo, { marginTop: isFirstSubHeader ? 10 : 0 }]
                  : styles.circleLogo
              }
            />
          );
        } else {
          return (
            <Text
              style={
                isSubHeader
                  ? [styles.bannerSubTitle, { marginTop: isFirstSubHeader ? 10 : 0 }]
                  : styles.bannerTitle
              }
            >
              {str}{' '}
            </Text>
          );
        }
      });
      return <View style={styles.row}>{headerText}</View>;
    }
    return (
      <Text
        style={
          isSubHeader
            ? [styles.bannerSubTitle, { marginTop: isFirstSubHeader ? 5 : 0 }]
            : styles.bannerTitle
        }
      >
        {str}{' '}
      </Text>
    );
  };

  const renderBannerButtonText = (str: string, action: any, containsSubText: boolean) => {
    const textColor = containsSubText ? theme.colors.LIGHT_BLUE : theme.colors.APP_YELLOW;
    if (str?.includes('<circle>')) {
      const arrayOfStrings = str.split(' ');
      var headerText = arrayOfStrings.map((str, i) => {
        if (str == '<circle>') {
          return <CircleLogo style={styles.smallCircleLogo} />;
        } else {
          return (
            <Text
              style={
                action?.type === hdfc_values.CALL_API
                  ? theme.viewStyles.text('SB', 12, textColor)
                  : theme.viewStyles.text('SB', containsSubText ? 8 : 9, textColor)
              }
            >
              {str}{' '}
            </Text>
          );
        }
      });

      return <View style={styles.row}>{headerText}</View>;
    }
    return (
      <Text
        style={
          action?.type === hdfc_values.CALL_API
            ? theme.viewStyles.text('SB', 12, textColor)
            : theme.viewStyles.text('SB', containsSubText ? 8 : 9, textColor)
        }
      >
        {str}{' '}
      </Text>
    );
  };

  const handleOnBannerClick = (type: any, action: any, message: any, url: string, meta: any) => {
    //if any only hdfc
    // if (from === string.banner_context.HOME && action != hdfc_values.UPGRADE_CIRCLE) {
    if (
      from === string.banner_context.HOME &&
      type == hdfc_values.REDIRECT &&
      action == hdfc_values.MEMBERSHIP_DETAIL
    ) {
      const subscription_name = hdfcUserSubscriptions?.name;
      const eventAttributes: WebEngageEvents[WebEngageEventName.HDFC_HOMEPAGE_CAROUSEL_CLICKED] = {
        'Patient UHID': g(currentPatient, 'uhid'),
        'Customer ID': g(currentPatient, 'id'),
        'Patient Name': g(currentPatient, 'firstName'),
        'Mobile Number': g(currentPatient, 'mobileNumber'),
        'Date of Birth': g(currentPatient, 'dateOfBirth'),
        Email: g(currentPatient, 'emailAddress'),
        HDFCMembershipLevel: subscription_name?.substring(0, subscription_name?.indexOf('+')),
        'Partner ID': g(currentPatient, 'partnerId'),
        HDFCMembershipState: !!g(hdfcUserSubscriptions, 'isActive') ? 'Active' : 'Inactive',
      };
      postWebEngageEvent(WebEngageEventName.HDFC_HOMEPAGE_CAROUSEL_CLICKED, eventAttributes);
    }
    //for only circle
    if (action == hdfc_values.UPGRADE_CIRCLE) {
      type == hdfc_values.ONE_TOUCH ? null : fireCircleEvent(type, action);
      planPurchased.current = false;
      setCirclePlanSelected && setCirclePlanSelected(null);
      setShowCirclePlans(true);
    } else if (action == hdfc_values.SPECIALITY_LISTING) {
      fireBannerCovidClickedWebengageEvent();
      if (type) {
        props.navigation.navigate('DoctorSearchListing', {
          specialities: [type],
        });
      } else {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      }
    } else {
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
          if (hdfcUserSubscriptions != null && hdfcStatus == 'active') {
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: g(hdfcUserSubscriptions, 'name'),
              isActive: g(hdfcUserSubscriptions, 'isActive'),
              circleEventSource,
            });
          } else {
            const openUrl = AppConfig.Configuration.HDFC_HEALTHY_LIFE_URL;
            props.navigation.navigate(AppRoutes.CovidScan, {
              covidUrl: openUrl,
            });
          }
        } else if (action == hdfc_values.DIETECIAN_LANDING) {
          props.navigation.navigate('DoctorSearchListing', {
            specialities: hdfc_values.DIETICS_SPECIALITY_NAME,
          });
        } else if (action == hdfc_values.MEMBERSHIP_DETAIL_CIRCLE) {
          fireBannerClickedWebengageEvent(hdfc_values.MEMBERSHIP_DETAIL_CIRCLE);
          props.navigation.navigate(AppRoutes.MembershipDetails, {
            membershipType: Circle.planName,
            comingFrom: `${from || 'HomePage'} banners`,
            circleEventSource,
          });
        } else if (
          (action === hdfc_values.MEDICINE_LISTING ||
            meta?.app_action === hdfc_values.MEDICINE_LISTING) &&
          !!meta?.category_id &&
          !!meta?.category_name
        ) {
          props.navigation.navigate(AppRoutes.MedicineListing, {
            category_id: meta?.category_id,
            title: meta?.category_name,
          });
        } else {
          props.navigation.navigate(AppRoutes.ConsultRoom);
        }
      } else if (type == hdfc_values.CALL_API) {
        if (action == hdfc_values.CALL_EXOTEL_API) {
          fireBannerClickedWebengageEvent(hdfc_values.CALL_EXOTEL_API);
          const benefits = g(circleSubscription, 'benefits');
          const currentBenefit = benefits?.filter((value) => {
            return g(value, 'benefitCtaAction', 'type') === type;
          });
          const availableCount = currentBenefit?.length ? currentBenefit?.[0].availableCount : 0;
          const benefit_id = currentBenefit?.length ? currentBenefit?.[0]._id : '';
          setbenefitId(benefit_id);
          if (availableCount > 0) {
            setShowHdfcConnectPopup(true);
          } else {
            renderAlert(
              'Hey, looks like you have exhausted the monthly usage limit for this benefit. If you feel this is an error, please raise a ticket on the Help section.'
            );
          }
        }
      } else if (type == hdfc_values.WHATSAPP_OPEN_CHAT) {
        Linking.openURL(`whatsapp://send?text=${message}&phone=91${action}`);
      } else if (action == hdfc_values.ABSOLUTE_URL) {
        if (type == hdfc_values.WEB_VIEW) {
          props.navigation.navigate(AppRoutes.CommonWebView, {
            url,
          });
        } else {
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: url.split('/').reverse()[0],
          });
        }
      } else {
        props.navigation.navigate(AppRoutes.ConsultRoom);
      }
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
      circlePlanValidity={planValidity.current || props.circlePlanValidity}
      from={from}
      source={source}
      circleEventSource={'Landing Home Page banners'}
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
        source={source}
        from={from}
        healthCredits={healthCredits}
        onPurchaseWithHCCallback={(res: any) => {
          fireCirclePurchaseEvent(
            currentPatient,
            res?.data?.CreateUserSubscription?.response?.end_date
          );
          planPurchased.current = true;
          planValidity.current = res?.data?.CreateUserSubscription?.response?.end_date;
          setShowCircleActivation(true);
        }}
        circleEventSource={circleEventSource}
      />
    );
  };

  const showBanner = bannerData && bannerData.length ? true : false;
  const datatoshow = bannerData?.filter((i) => i?.banner_display_type === 'banner');
  if (showBanner) {
    return (
      <View style={{ marginTop: 5, flex: 1 }}>
        {showCircleActivation && renderCircleMembershipActivated()}
        {showCirclePlans && renderCircleSubscriptionPlans()}
        <Carousel
          onSnapToItem={setSlideIndex}
          data={datatoshow}
          renderItem={renderHdfcSliderItem}
          sliderWidth={width}
          itemWidth={width}
          loop={true}
          autoplay={true}
          loopClonesPerSide={datatoshow?.length || 0}
        />
        {datatoshow && datatoshow?.length > 1 ? (
          <View style={styles.sliderDotsContainer}>
            {datatoshow?.map((_, index) =>
              index == slideIndex ? renderDot(true) : renderDot(false)
            )}
          </View>
        ) : null}
        <Overlay
          isVisible={showHdfcConnectPopup}
          windowBackgroundColor={'rgba(0, 0, 0, 0.31)'}
          overlayStyle={styles.overlayStyle}
          onRequestClose={() => setShowHdfcConnectPopup(false)}
        >
          <HdfcConnectPopup
            onClose={() => setShowHdfcConnectPopup(false)}
            benefitId={benefitId || ''}
            successCallback={() => successCallback()}
            userSubscriptionId={circleSubscriptionId}
          />
        </Overlay>
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
    backgroundColor: theme.colors.CLEAR,
    marginTop: 10,
    marginHorizontal: 28,
    marginBottom: 15,
    padding: 0,
    width: width - 40,
    alignSelf: 'center',
  },
  bannerContainer: {
    margin: 15,
  },
  bannerTitle: {
    ...theme.viewStyles.text('M', 16, theme.colors.WHITE),
  },
  bannerSubTitle: {
    ...theme.viewStyles.text('M', 10, theme.colors.LIGHT_BLUE),
  },
  sliderDots: {
    height: 6,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 14,
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
    bottom: 15,
    left: 13,
  },
  upgradeBtnView: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
    justifyContent: 'center',
    minHeight: 35,
  },
  upgradeText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.APP_YELLOW),
  },
  smallCircleLogo: {
    width: 40,
    height: 20,
  },
  regularText: {
    ...theme.viewStyles.text('R', 8, theme.colors.LIGHT_BLUE),
    left: 12,
    marginTop: 2,
  },
  sliderDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  overlayStyle: {
    width: width,
    height: 'auto',
    padding: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    flex: 1,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
});
