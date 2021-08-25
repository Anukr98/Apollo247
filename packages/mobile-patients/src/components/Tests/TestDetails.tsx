import {
  TestBreadcrumbLink,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CircleLogo,
  ClockIcon,
  ExpressSlotClock,
  InfoIconRed,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';

import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticTestDetails,
  TestPackage,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import stripHtml from 'string-strip-html';
import {
  g,
  nameFormater,
  isSmallDevice,
  isEmptyObject,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
} from '@aph/mobile-patients/src/graphql/profiles';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  DiagnosticData,
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import { CircleHeading } from '@aph/mobile-patients/src/components/ui/CircleHeading';
import {
  getPricesForItem,
  sourceHeaders,
  convertNumberToDecimal,
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import {
  DiagnosticAddToCartEvent,
  DiagnosticDetailsViewed,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { TestListingHeader } from '@aph/mobile-patients/src/components/Tests/components/TestListingHeader';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { FAQComponent } from '@aph/mobile-patients/src/components/SubscriptionMembership/Components/FAQComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import PackageCard from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
import ItemCard from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import {
  findDiagnosticsWidgetsPricing,
  findDiagnosticsWidgetsPricingVariables,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsWidgetsPricing';
import HTML from 'react-native-render-html';
import _ from 'lodash';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  getDiagnosticExpressSlots,
  getReportTAT,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import moment from 'moment';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
export interface TestPackageForDetails extends TestPackage {
  collectionType: TEST_COLLECTION_TYPE;
  preparation: string;
  source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE;
  type: string;
  specialPrice?: string | number;
  circleRate?: string | number;
  circleSpecialPrice?: string | number;
  discountPrice?: string | number;
  discountSpecialPrice?: string | number;
  packageMrp?: string | number;
  mrpToDisplay?: string | number;
  inclusions?: any;
}

const gender: any = {
  B: 'MALE AND FEMALE',
  M: 'MALE',
  F: 'FEMALE',
};

export interface TestOverview {
  value: string;
  summary: string;
  format?: string;
}

export interface CMSTestInclusions {
  sampleTypeName: string;
  inclusionName: string;
}
export interface CMSTestDetails {
  TestObservation: any;
  diagnosticItemName: string;
  diagnosticFAQs: any;
  diagnosticItemImageUrl: string;
  diagnosticUrlAlias: string;
  diagnosticGender: string;
  diagnosticAge: string;
  diagnosticReportCustomerText: string;
  diagnosticReportGenerationTime: string;
  diagnosticPretestingRequirement: string;
  diagnosticOverview: any;
  diagnosticInclusionName: any;
  diagnosticWidgetsData: any;
}

export interface TestDetailsProps
  extends NavigationScreenProps<{
    testDetails?: TestPackageForDetails;
    itemId?: string;
    source?: string;
    comingFrom?: string;
    itemName?: string;
    movedFrom?: string;
    cityId?: string;
    changeCTA?: boolean;
    stateId?: string;
  }> {}

export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    isDiagnosticCircleSubscription,
    testDetailsBreadCrumbs,
    setTestDetailsBreadCrumbs,
    modifiedOrderItemIds,
    modifiedOrder,
    setModifyHcCharges,
    setModifiedOrderItemIds,
    setHcCharges,
    setModifiedOrder,
    setModifiedPatientCart,
    setDistanceCharges,
    setDeliveryAddressId,
    addresses,
    deliveryAddressId,
    deliveryAddressCityId,
    deliveryAddressStateId,
    diagnosticSlot,
  } = useDiagnosticsCart();
  const { pharmacyCircleAttributes } = useShoppingCart();

  const {
    diagnosticServiceabilityData,
    isDiagnosticLocationServiceable,
    diagnosticLocation,
  } = useAppCommonData();

  const testDetails = props.navigation.getParam('testDetails', {} as TestPackageForDetails);
  const testName = props.navigation.getParam('itemName');
  const changeCTA = props.navigation.getParam('changeCTA');

  const { setLoading: setLoadingContext, showAphAlert, hideAphAlert } = useUIElements();

  const addressCityId = props.navigation.getParam('cityId');
  const movedFrom = props.navigation.getParam('comingFrom');
  const isDeep = props.navigation.getParam('movedFrom');
  const itemId =
    movedFrom == AppRoutes.TestsCart ? testDetails?.ItemID : props.navigation.getParam('itemId');

  const isAlreadyPartOfOrder =
    !!modifiedOrderItemIds &&
    modifiedOrderItemIds?.length &&
    modifiedOrderItemIds?.find((id: number) => Number(id) == Number(itemId));

  //if passed from cartPage
  const cityIdToUse = !!addressCityId
    ? Number(addressCityId)
    : Number(
        diagnosticServiceabilityData?.cityId! || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
      );

  const [cmsTestDetails, setCmsTestDetails] = useState((([] as unknown) as CMSTestDetails) || []);
  const [testInfo, setTestInfo] = useState(movedFrom == 'TestsCart' ? testDetails : ({} as any));
  const [moreInclusions, setMoreInclusions] = useState(false);
  const [readMore, setReadMore] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [widgetsData, setWidgetsData] = useState([] as any);
  const [expressSlotMsg, setExpressSlotMsg] = useState<string>('');
  const [reportTat, setReportTat] = useState<string>('');
  const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
  const [priceHeight, setPriceHeight] = useState<number>(0);

  const isModify = !!modifiedOrder && !isEmptyObject(modifiedOrder);

  const itemName =
    (!!testDetails && testDetails?.ItemName) ||
    testName ||
    cmsTestDetails?.diagnosticItemName ||
    testInfo?.ItemName ||
    '';

  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

  const isAddedToCart = !!cartItems?.find((item) => item.id == testInfo?.ItemID);
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const priceViewRef = React.useRef<View>(null);

  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsWidgetsPricing, findDiagnosticsWidgetsPricingVariables>({
      query: GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
      context: {
        sourceHeaders,
      },
      variables: {
        cityID: Number(cityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
        itemIDs: listOfId,
      },
      fetchPolicy: 'no-cache',
    });

  useEffect(() => {
    getExpressSlots(diagnosticServiceabilityData!, diagnosticLocation!);
  }, []);

  /**
   * fetching the details wrt itemId
   */
  useEffect(() => {
    if (itemId) {
      fetchTestDetails_CMS(itemId, null);
      loadTestDetails(itemId);
      fetchReportTat(itemId);
    } else if (testName) {
      fetchTestDetails_CMS(99999, testName);
    } else {
      setErrorState(true);
    }
  }, [itemId]);

  const fetchTestDetails_CMS = async (itemId: string | number, itemName: string | null) => {
    setLoadingContext?.(true);
    const res: any = await getDiagnosticTestDetails(
      'diagnostic-details',
      Number(itemId),
      !!itemName ? itemName : cmsTestDetails?.diagnosticUrlAlias,
      cityIdToUse
    );
    if (res?.data?.success) {
      const result = g(res, 'data', 'data');
      !!itemName && loadTestDetails(result?.diagnosticItemID);
      setCmsTestDetails(result);
      setLoadingContext?.(false);

      !!result?.diagnosticWidgetsData &&
        result?.diagnosticWidgetsData?.length > 0 &&
        fetchWidgetPrices(result?.diagnosticWidgetsData, cityIdToUse);
    } else {
      setLoadingContext?.(false);
      setErrorState(true);
      setCmsTestDetails([]);
    }
  };

  const loadTestDetails = async (itemId: string | number) => {
    let listOfIds = [];
    listOfIds = [Number(itemId)];

    try {
      setLoadingContext?.(true);
      const {
        data: { findDiagnosticsByItemIDsAndCityID },
      } = await client.query<
        findDiagnosticsByItemIDsAndCityID,
        findDiagnosticsByItemIDsAndCityIDVariables
      >({
        query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
        context: {
          sourceHeaders,
        },
        variables: {
          cityID: cityIdToUse,
          itemIDs: listOfIds,
        },
        fetchPolicy: 'no-cache',
      });
      const {
        rate,
        gender,
        itemName,
        collectionType,
        fromAgeInDays,
        toAgeInDays,
        testPreparationData,
        packageCalculatedMrp,
        diagnosticPricing,
        inclusions,
        testDescription,
        itemType,
      } = g(findDiagnosticsByItemIDsAndCityID, 'diagnostics', '0' as any)!;

      const getDiagnosticPricingForItem = diagnosticPricing;
      const packageMrpForItem = packageCalculatedMrp!;
      const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);

      if (!pricesForItem?.itemActive) {
        return !isAddedToCart;
      }
      const specialPrice = pricesForItem?.specialPrice!;
      const price = pricesForItem?.price!;
      const circlePrice = pricesForItem?.circlePrice!;
      const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
      const discountPrice = pricesForItem?.discountPrice!;
      const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
      const mrpToDisplay = pricesForItem?.mrpToDisplay;

      const partialTestDetails = {
        Rate: price,
        Gender: gender,
        ItemID: `${itemId}`,
        ItemName: itemName,
        collectionType: collectionType!,
        mou: inclusions == null ? 1 : inclusions.length,
        testDescription: testDescription,
        type: itemType,
        FromAgeInDays: fromAgeInDays,
        ToAgeInDays: toAgeInDays,
        preparation: testPreparationData,
        packageMrp: packageCalculatedMrp,
        specialPrice: specialPrice,
        circleRate: circlePrice,
        circleSpecialPrice: circleSpecialPrice,
        discountPrice: discountPrice,
        discountSpecialPrice: discountSpecialPrice,
        mrpToDisplay: mrpToDisplay,
        inclusions: inclusions == null ? Number([itemId]) : inclusions,
        specialDiscountDiffPrice: pricesForItem?.specialDiscountDiffPrice,
        circleDiscountDiffPrice: pricesForItem?.circleDiscountDiffPrice,
        promoteCircle: pricesForItem?.promoteCircle,
        promoteDiscount: pricesForItem?.promoteDiscount,
        groupPlan: pricesForItem?.planToConsider,
      };

      setTestInfo({ ...(partialTestDetails || []) });
    } catch (error) {
      setErrorState(true);
    } finally {
      setLoadingContext?.(false);
    }
  };

  const fetchWidgetPrices = async (widgetsData: any, cityId: string | number) => {
    const itemIds = widgetsData?.map((item: any) =>
      item?.diagnosticWidgetData?.map((data: any, index: number) => Number(data?.itemId))
    );
    //restriction less than 12.
    try {
      const res = Promise.all(
        itemIds?.map((item: any) =>
          fetchPricesForCityId(Number(cityId!), item?.length > 12 ? item?.slice(0, 12) : item)
        )
      );

      const response = (await res)?.map((item: any) =>
        g(item, 'data', 'findDiagnosticsWidgetsPricing', 'diagnostics')
      );
      let newWidgetsData = [...widgetsData];

      for (let i = 0; i < widgetsData?.length; i++) {
        for (let j = 0; j < widgetsData?.[i]?.diagnosticWidgetData?.length; j++) {
          const findIndex = widgetsData?.[i]?.diagnosticWidgetData?.findIndex(
            (item: any) => item?.itemId == Number(response?.[i]?.[j]?.itemId)
          );
          if (findIndex !== -1) {
            (newWidgetsData[i].diagnosticWidgetData[findIndex].packageCalculatedMrp =
              response?.[i]?.[j]?.packageCalculatedMrp),
              (newWidgetsData[i].diagnosticWidgetData[findIndex].diagnosticPricing =
                response?.[i]?.[j]?.diagnosticPricing);
          }
        }
      }
      setWidgetsData(newWidgetsData);
      setLoadingContext?.(false);
    } catch (error) {
      CommonBugFender('errorInFetchPricing api__TestDetails', error);
      setLoadingContext?.(false);
    }
  };

  async function getExpressSlots(
    serviceabilityObject: DiagnosticData,
    selectedAddress: LocationData
  ) {
    var getLat = selectedAddress?.latitude!;
    var getLng = selectedAddress?.longitude!;
    var getZipcode = selectedAddress?.pincode!;
    var getServiceablityObject = {
      cityID: Number(serviceabilityObject?.cityId),
      stateID: Number(serviceabilityObject?.stateId),
    };
    if (movedFrom === AppRoutes.TestsCart) {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      getLat = addresses?.[selectedAddressIndex]?.latitude!;
      getLng = addresses?.[selectedAddressIndex]?.longitude!;
      getZipcode = addresses?.[selectedAddressIndex]?.zipcode!;
      getServiceablityObject = {
        cityID: Number(deliveryAddressCityId),
        stateID: Number(deliveryAddressStateId),
      };
    }

    try {
      const res = await getDiagnosticExpressSlots(
        client,
        getLat,
        getLng,
        String(getZipcode),
        getServiceablityObject
      );
      if (res?.data?.getUpcomingSlotInfo) {
        const getResponse = res?.data?.getUpcomingSlotInfo;
        if (getResponse?.status) {
          setExpressSlotMsg(getResponse?.slotInfo);
        } else {
          setExpressSlotMsg('');
        }
      } else {
        setExpressSlotMsg('');
      }
    } catch (error) {
      CommonBugFender('getExpressSlots_TestDetails', error);
      setExpressSlotMsg('');
    }
  }

  async function fetchReportTat(itemId: string | number) {
    const selectedAddressIndex = addresses?.findIndex(
      (address) => address?.id == deliveryAddressId
    );
    const itemIds = [Number(itemId)];
    const id = cityIdToUse;
    const pincode =
      movedFrom === AppRoutes.TestsCart
        ? addresses?.[selectedAddressIndex]?.zipcode!
        : diagnosticLocation?.pincode! || '500030';
    const formattedDate = moment(diagnosticSlot?.date).format('YYYY/MM/DD');
    const dateTimeInUTC = moment(formattedDate + ' ' + diagnosticSlot?.slotStartTime).toISOString();
    try {
      const result = await getReportTAT(
        client,
        !!diagnosticSlot && !isEmptyObject(diagnosticSlot) ? dateTimeInUTC : null,
        id,
        Number(pincode),
        itemIds
      );
      if (result?.data?.getConfigurableReportTAT) {
        const getMaxReportTat = result?.data?.getConfigurableReportTAT?.maxReportTAT;
        setReportTat(getMaxReportTat);
      } else {
        setReportTat('');
      }
    } catch (error) {
      CommonBugFender('fetchReportTat_TestDetails', error);
      setReportTat('');
    }
  }

  const homeBreadCrumb: TestBreadcrumbLink = {
    title: 'Home',
    onPress: () => {
      isModify ? showDiscardPopUp() : props.navigation.navigate('TESTS');
    },
  };

  function showDiscardPopUp() {
    showAphAlert?.({
      title: string.common.hiWithSmiley,
      description: string.diagnostics.modifyDiscardText,
      unDismissable: true,
      CTAs: [
        {
          text: 'DISCARD',
          onPress: () => {
            hideAphAlert?.();
            clearModifyDetails();
          },
          type: 'orange-button',
        },
        {
          text: 'CANCEL',
          onPress: () => {
            hideAphAlert?.();
          },
          type: 'orange-button',
        },
      ],
    });
    return true;
  }

  function clearModifyDetails() {
    setModifiedOrder?.(null);
    setModifyHcCharges?.(0);
    setModifiedOrderItemIds?.([]);
    setHcCharges?.(0);
    setDistanceCharges?.(0);
    setModifiedPatientCart?.([]);
    setDeliveryAddressId?.('');
    //go back to homepage
    props.navigation.navigate('TESTS');
  }

  useEffect(() => {
    let breadcrumb: TestBreadcrumbLink[] = [homeBreadCrumb];
    if (!!movedFrom) {
      if (movedFrom == AppRoutes.Tests || movedFrom == AppRoutes.TestDetails) {
      }
      if (movedFrom == AppRoutes.SearchTestScene || movedFrom == AppRoutes.TestListing) {
        breadcrumb.push({
          title: movedFrom == AppRoutes.SearchTestScene ? 'Test Search' : 'Test Listing',
          onPress: () => {
            movedFrom == AppRoutes.SearchTestScene
              ? props.navigation.navigate(AppRoutes.SearchTestScene)
              : props.navigation.navigate(AppRoutes.TestListing);
          },
        });
      }
      if (movedFrom === AppRoutes.TestsCart) {
        breadcrumb.push({
          title: 'Cart',
          onPress: () => {
            navigateToScreenWithEmptyStack(props.navigation, AppRoutes.AddPatients);
          },
        });
      }
      breadcrumb.push({
        title: !!itemName ? nameFormater(itemName!, 'title') : itemName,
        onPress: () => {},
      });
      setTestDetailsBreadCrumbs && setTestDetailsBreadCrumbs(breadcrumb);
    }
  }, [movedFrom, itemName]);

  useEffect(() => {
    if (testInfo?.Rate) {
      DiagnosticDetailsViewed(
        isDeep == 'deeplink'
          ? 'Deeplink'
          : movedFrom == AppRoutes.SearchTestScene
          ? 'Popular search'
          : testInfo?.source! || testDetails?.source,
        itemName,
        testInfo?.type! || testDetails?.type,
        testInfo?.ItemID || itemId,
        currentPatient,
        testInfo?.Rate || testDetails?.Rate,
        pharmacyCircleAttributes
      );
    }
  }, [testInfo]);

  function createSampleType(data: any) {
    const array = data?.map(
      (item: CMSTestInclusions) => nameFormater(item?.sampleTypeName),
      'title'
    );
    const sampleTypeArray = [...new Set(array)];
    return sampleTypeArray;
  }

  const renderDescriptionCard = () => {
    const sampleType =
      !!cmsTestDetails && cmsTestDetails?.diagnosticInclusionName?.length > 0
        ? createSampleType(cmsTestDetails?.diagnosticInclusionName)
        : [];
    const sampleString = sampleType?.length > 0 ? sampleType?.join(', ') : false;
    const showAge = (!!cmsTestDetails && cmsTestDetails?.diagnosticAge) || 'For all age group';
    const showGender =
      (!!cmsTestDetails && cmsTestDetails?.diagnosticGender) ||
      (!_.isEmpty(testInfo) && `FOR ${gender?.[testInfo?.Gender]}`) ||
      'Both';
    const showDescription =
      (!!cmsTestDetails &&
        cmsTestDetails?.diagnosticOverview?.length > 0 &&
        cmsTestDetails?.diagnosticOverview?.[0]?.value) ||
      (!_.isEmpty(testInfo) && testInfo?.testDescription);
    return (
      <>
        {sampleType || showAge || showGender || showDescription ? (
          <View style={styles.descriptionCardOuterView}>
            {/**
             * if package then package otherwise, test.
             * age if not coming from cms -> db
             * gender if not coming from cms -> db
             * sample type cms -> db
             */}
            <Text style={styles.packageDescriptionHeading}>Package Description</Text>
            {!!sampleString ? renderDetails('Sample type', sampleString) : null}
            {!!showGender ? renderDetails('Gender', nameFormater(showGender, 'title')) : null}
            {!!showAge ? renderDetails('Age group', showAge) : null}
            {!!showDescription ? renderDescription(showDescription) : null}
          </View>
        ) : null}
      </>
    );
  };

  const renderDetails = (key: string, value: string) => {
    return (
      <View style={{ flexDirection: 'row', marginTop: 5, width: '90%' }}>
        <Text style={styles.packageDescriptionText}>{key} : </Text>
        <Text
          style={[
            styles.packageDescriptionText,
            {
              width: '83%',
            },
          ]}
        >
          {value}
        </Text>
      </View>
    );
  };

  function onPressReadMore() {
    setReadMore(!readMore);
  }

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

  const renderDescription = (showDescription: string) => {
    const formattedText = filterDiagnosticHTMLContent(showDescription);
    return (
      <>
        <View style={[styles.overViewContainer, { width: readMore ? '85%' : '100%' }]}>
          {readMore ? (
            <Text style={styles.packageDescriptionText} numberOfLines={2}>
              {stripHtml(showDescription)}
            </Text>
          ) : (
            <HTML html={formattedText} baseFontStyle={styles.packageDescriptionText} />
          )}
        </View>
        <TouchableOpacity
          onPress={() => onPressReadMore()}
          activeOpacity={1}
          style={styles.readMoreTouch}
        >
          <Text style={styles.readMoreText}> {!readMore ? 'READ LESS' : 'READ MORE'}</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderItemCard = () => {
    return (
      <View style={styles.descriptionCardOuterView}>
        {renderCardTopView()}
        {renderPriceView(false)}
      </View>
    );
  };

  function _setPriceLayoutPosition(layout: any, event: any) {
    setPriceHeight(layout?.height);
  }

  const renderPriceView = (isBottom: boolean) => {
    //if coming from anywhere other than cart page
    //check other conidtions
    const slashedPrice =
      !!testInfo?.packageMrp && testInfo?.packageMrp > testInfo?.Rate
        ? testInfo?.packageMrp
        : testInfo?.Rate;

    //1. circle sub + promote circle -> circleSpecialPrice
    //2. circle sub + discount -> dicount Price
    //3. circle sub + none -> special price | price
    //4. non-circle + promote circle -> special price | price
    //5. non-circle + promte disocunt -> discount price
    //6. non-circle + none -> special price | price

    let priceToShow;
    if (isDiagnosticCircleSubscription) {
      if (testInfo?.promoteCircle) {
        priceToShow = testInfo?.circleSpecialPrice;
      } else if (testInfo?.promoteDiscount) {
        priceToShow = testInfo?.discountSpecialPrice;
      } else {
        priceToShow = testInfo?.specialPrice || testInfo?.Rate;
      }
    } else {
      if (testInfo?.promoteDiscount) {
        priceToShow = testInfo?.discountSpecialPrice;
      } else {
        priceToShow = testInfo?.specialPrice || testInfo?.Rate;
      }
    }
    return (
      <View>
        {!isBottom
          ? renderTopPriceView(slashedPrice, priceToShow)
          : renderBottomPriceView(slashedPrice, priceToShow)}
      </View>
    );
  };

  const renderTopPriceView = (slashedPrice: number, priceToShow: number) => {
    return (
      <View
        ref={priceViewRef}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          _setPriceLayoutPosition(layout, event);
        }}
      >
        {renderSeparator()}
        <View style={{ marginTop: '2%' }}>
          {renderSlashedView(slashedPrice, priceToShow)}
          {!_.isEmpty(testInfo) && renderMainPriceView(priceToShow, true)}
        </View>
      </View>
    );
  };

  const renderBottomPriceView = (slashedPrice: number, priceToShow: number) => {
    return (
      <View>
        {renderSlashedView(slashedPrice, priceToShow)}
        {!_.isEmpty(testInfo) && renderMainPriceView(priceToShow, false)}
      </View>
    );
  };

  const renderSlashedView = (slashedPrice: number, priceToShow: number) => {
    return (
      <View>
        {(!isDiagnosticCircleSubscription &&
          testInfo?.promoteCircle &&
          priceToShow == slashedPrice) ||
        priceToShow == slashedPrice ? null : (
          <Text style={styles.slashedPriceText}>
            {string.common.Rs} {convertNumberToDecimal(slashedPrice)}
          </Text>
        )}
      </View>
    );
  };

  const renderMainPriceView = (priceToShow: number, showSavings: boolean) => {
    return (
      <View style={styles.flexRowView}>
        {!!priceToShow && (
          <Text style={styles.mainPriceText}>
            {string.common.Rs} {convertNumberToDecimal(priceToShow)}
          </Text>
        )}
        {showSavings ? renderDiscountView() : null}
      </View>
    );
  };

  const renderDiscountView = () => {
    const circleSpecialPrice = testInfo?.circleSpecialPrice!;
    const circleDiscountSaving = testInfo?.circleDiscountDiffPrice;
    const specialDiscountSaving = testInfo?.specialDiscountDiffPrice;
    const groupPlan = testInfo?.groupPlan?.groupPlan;

    return (
      <View>
        {isDiagnosticCircleSubscription &&
        circleDiscountSaving > 0 &&
        !testInfo?.promoteDiscount &&
        groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={styles.rowStyle}>
            <CircleLogo style={styles.circleLogoIcon} />
            {renderSavingView(
              'Savings',
              circleDiscountSaving,
              { marginHorizontal: '1%' },
              styles.savingsText
            )}
          </View>
        ) : testInfo?.promoteDiscount &&
          specialDiscountSaving > 0 &&
          !testInfo?.promoteCircle &&
          groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={styles.rowStyle}>
            <SpecialDiscountText isImage={true} text={'TEST 247'} />
            {renderSavingView(
              'Savings',
              specialDiscountSaving,
              { marginHorizontal: '2%' },
              styles.savingsText
            )}
          </View>
        ) : circleDiscountSaving > 0 && groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={[styles.rowStyle, { alignSelf: 'flex-end' }]}>
            <CircleHeading isSubscribed={false} />
            {renderSavingView(
              '',
              circleSpecialPrice,
              {
                marginHorizontal: '1%',
              },
              styles.savingsText
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const renderSavingView = (
    text: string,
    price: number | string,
    mainViewStyle: any,
    textStyle: any
  ) => {
    return (
      <View style={mainViewStyle}>
        <Text style={textStyle}>
          {text} {string.common.Rs} {convertNumberToDecimal(price)}
        </Text>
      </View>
    );
  };

  /**
   * if not coming from the config report tat, then if not by drupal then show from local db.
   */
  const renderCardMidView = () => {
    const showReportTat =
      reportTat != ''
        ? reportTat
        : !!cmsTestDetails?.diagnosticReportGenerationTime ||
          !cmsTestDetails?.diagnosticReportCustomerText;
    return (
      <>
        {!!showReportTat && showReportTat != '' ? (
          <>
            <View style={styles.midCardView}>
              <ClockIcon style={styles.clockIconStyle} />
              <View style={styles.midCardTextView}>
                <Text style={styles.reportTimeText}>Get Reports by</Text>
                <Text style={styles.reportTime}>
                  {reportTat != ''
                    ? moment(reportTat)?.format('dddd, DD MMMM')
                    : cmsTestDetails?.diagnosticReportCustomerText
                    ? cmsTestDetails?.diagnosticReportCustomerText
                    : cmsTestDetails?.diagnosticReportGenerationTime}
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
  const renderCardBottomView = () => {
    return (
      <>
        {renderSeparator()}
        <View style={styles.bottomCardView}>
          <InfoIconRed style={styles.infoIconStyle} />
          <Text style={styles.preTestingText}>
            {cmsTestDetails?.diagnosticPretestingRequirement}
          </Text>
        </View>
        {renderSeparator()}
      </>
    );
  };

  const renderSeparator = (space?: boolean) => {
    return <Spearator style={{ marginTop: space ? 10 : 0 }} />;
  };

  const renderCardTopView = () => {
    const isInclusionPrsent =
      !!cmsTestDetails?.diagnosticInclusionName &&
      cmsTestDetails?.diagnosticInclusionName?.length > 0;
    const inclusions = isInclusionPrsent && cmsTestDetails?.diagnosticInclusionName;

    const filterParamters = cmsTestDetails?.diagnosticInclusionName?.filter(
      (item: any) => !!item?.TestObservation && item?.TestObservation != ''
    );

    const getMandatoryParamter =
      !!filterParamters &&
      filterParamters?.length > 0 &&
      filterParamters?.map((inclusion: any) =>
        !!inclusion?.TestObservation
          ? inclusion?.TestObservation?.filter((item: any) => item?.mandatoryValue === '1')
          : []
      );

    const getMandatoryParameterCount =
      !!getMandatoryParamter &&
      getMandatoryParamter?.reduce((prevVal: any, curr: any) => prevVal + curr?.length, 0);

    return (
      <>
        <View style={{ width: '75%' }}>
          <Text style={styles.itemNameText}>
            {testName ||
              testDetails?.ItemName ||
              cmsTestDetails?.diagnosticItemName ||
              testInfo?.itemName}
          </Text>
        </View>
        {renderSeparator(true)}
        {renderCardMidView()}
        {!!cmsTestDetails?.diagnosticPretestingRequirement
          ? renderCardBottomView()
          : renderSeparator()}
        <View style={styles.inclusionsView}>
          {isInclusionPrsent ? (
            <Text style={styles.testIncludedText}>
              Total tests included :{' '}
              {getMandatoryParameterCount || cmsTestDetails?.diagnosticInclusionName?.length}
            </Text>
          ) : null}
          {isInclusionPrsent &&
            !moreInclusions &&
            inclusions?.map((item: any, index: number) =>
              index < 4 ? (
                <>
                  <View style={styles.rowStyle}>
                    <Text style={styles.inclusionsBullet}>{'\u2B24'}</Text>
                    <Text style={styles.inclusionsItemText}>
                      {!!item?.inclusionName ? nameFormater(item?.inclusionName!, 'title') : ''}{' '}
                      {index == 3 &&
                        inclusions?.length - 4 > 0 &&
                        item?.TestObservation?.length == 0 &&
                        renderShowMore(inclusions, item?.inclusionName)}
                    </Text>
                  </View>
                  {renderParamterData(item, inclusions, index, true)}
                </>
              ) : null
            )}
          {isInclusionPrsent &&
            moreInclusions &&
            inclusions?.map((item: any, index: number) => (
              <>
                <View style={styles.rowStyle}>
                  <Text style={styles.inclusionsBullet}>{'\u2B24'}</Text>
                  <Text style={styles.inclusionsItemText}>
                    {!!item?.inclusionName ? nameFormater(item?.inclusionName!, 'title') : ''}{' '}
                  </Text>
                </View>
                {renderParamterData(item, inclusions, index, false)}
              </>
            ))}
          {isInclusionPrsent && moreInclusions && (
            <Text onPress={() => setMoreInclusions(!moreInclusions)} style={styles.showLessText}>
              SHOW LESS
            </Text>
          )}
        </View>
      </>
    );
  };

  const renderShowMore = (inclusions: any, name: string) => {
    return (
      <Text
        onPress={() => setMoreInclusions(!moreInclusions)}
        style={[
          styles.moreText,
          {
            ...theme.viewStyles.text(
              'SB',
              isSmallDevice ? (name?.length > 25 ? 10 : 12) : name?.length > 25 ? 11 : 13,
              theme.colors.APP_YELLOW,
              1,
              15
            ),
          },
        ]}
      >
        {'   '}
        {!moreInclusions && `+${inclusions?.length - 4} MORE`}
      </Text>
    );
  };

  const renderParamterData = (item: any, inclusions: any, index: number, showOption: boolean) => {
    const getMandatoryParameters =
      item?.TestObservation?.length > 0 &&
      item?.TestObservation != '' &&
      item?.TestObservation?.filter((obs: any) => obs?.mandatoryValue === '1');
    return (
      <>
        {!!getMandatoryParameters && getMandatoryParameters?.length > 0 ? (
          getMandatoryParameters.map((para: any, pIndex: number, array: any) => (
            <View style={[styles.rowStyle, { marginHorizontal: '10%', width: '88%' }]}>
              <Text style={[styles.inclusionsBullet, { fontSize: 4 }]}>{'\u2B24'}</Text>
              <Text style={styles.parameterText}>
                {!!para?.observationName ? nameFormater(para?.observationName!, 'title') : ''}{' '}
                {index == 3 &&
                  inclusions?.length - 4 > 0 &&
                  array?.length - 1 == pIndex &&
                  renderShowMore(inclusions, para?.observationName)}
              </Text>
            </View>
          ))
        ) : (
          <>
            {index == 3 && inclusions?.length - 4 > 0 && !moreInclusions
              ? renderShowMore(inclusions, 'test')
              : null}
          </>
        )}
      </>
    );
  };

  const renderBreadCrumb = () => {
    return (
      <View style={{ marginLeft: 20 }}>
        <Breadcrumb links={testDetailsBreadCrumbs!} containerStyle={styles.breadCrumbContainer} />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <TestListingHeader
        navigation={props.navigation}
        headerText={nameFormater(
          !!modifiedOrder && !isEmptyObject(modifiedOrder) ? 'MODIFY ORDER' : 'TEST PACKAGE DETAIL',
          'upper'
        )}
        movedFrom={'testDetails'}
      />
    );
  };

  const renderFAQView = () => {
    return (
      <FAQComponent
        headingText={'Frequently Asked Questions'}
        headingStyle={styles.faqHeadingText}
        headerSeparatorStyle={{ marginVertical: 10 }}
        containerStyle={{ marginLeft: 20, marginRight: 25 }}
        data={cmsTestDetails?.diagnosticFAQs}
        arrowStyle={{ tintColor: theme.colors.APP_YELLOW }}
        horizontalLine={styles.faqLine}
      />
    );
  };

  const renderWidgetsView = () => {
    const sortWidgets =
      !!widgetsData &&
      widgetsData?.length > 0 &&
      widgetsData?.sort(
        (a: any, b: any) =>
          Number(a.diagnosticwidgetsRankOrder) - Number(b.diagnosticwidgetsRankOrder)
      );

    return !!sortWidgets && sortWidgets.map((item: any) => renderWidgets(item));
  };

  const renderWidgets = (data: any) => {
    if (data?.diagnosticWidgetType == 'Package') {
      return renderPackageWidget(data);
    } else {
      return renderTestWidgets(data);
    }
  };

  const renderPackageWidget = (data: any) => {
    const isPricesAvailable =
      !!data &&
      data?.diagnosticWidgetData?.length > 0 &&
      data?.diagnosticWidgetData?.find((item: any) => item?.diagnosticPricing);
    return (
      <View>
        {isPricesAvailable ? (
          <>
            <SectionHeader
              leftText={nameFormater(data?.diagnosticWidgetTitle, 'title')}
              leftTextStyle={styles.widgetHeading}
            />

            <PackageCard
              data={data}
              diagnosticWidgetData={data?.diagnosticWidgetData}
              isCircleSubscribed={isDiagnosticCircleSubscription}
              isServiceable={isDiagnosticLocationServiceable}
              isVertical={false}
              navigation={props.navigation}
              source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.DETAILS}
              sourceScreen={AppRoutes.TestDetails}
            />
          </>
        ) : null}
      </View>
    );
  };

  const renderTestWidgets = (data: any) => {
    const isPricesAvailable =
      !!data &&
      data?.diagnosticWidgetData?.length > 0 &&
      data?.diagnosticWidgetData?.find((item: any) => item?.diagnosticPricing);

    return (
      <View>
        {!!isPricesAvailable ? (
          <>
            <SectionHeader
              leftText={nameFormater(data?.diagnosticWidgetTitle, 'title')}
              leftTextStyle={styles.widgetHeading}
            />

            <ItemCard
              data={data}
              diagnosticWidgetData={data?.diagnosticWidgetData}
              isCircleSubscribed={isDiagnosticCircleSubscription}
              isServiceable={isDiagnosticLocationServiceable}
              isVertical={false}
              isPriceAvailable={isPricesAvailable}
              navigation={props.navigation}
              source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.DETAILS}
              sourceScreen={AppRoutes.TestDetails}
            />
          </>
        ) : null}
      </View>
    );
  };

  function onPressAddToCart() {
    const specialPrice = testInfo?.specialPrice!;
    const price = testInfo?.Rate!;
    const circlePrice = testInfo?.circlePrice! || testInfo?.circleRate!;
    const circleSpecialPrice = testInfo?.circleSpecialPrice!;
    const discountPrice = testInfo?.discountPrice!;
    const discountSpecialPrice = testInfo?.discountSpecialPrice!;
    const planToConsider = testInfo?.planToConsider;
    const discountToDisplay = testInfo?.discountToDisplay;
    const mrpToDisplay = testInfo?.mrpToDisplay;

    DiagnosticAddToCartEvent(
      cmsTestDetails?.diagnosticItemName || testInfo?.itemName,
      itemId!,
      mrpToDisplay,
      discountToDisplay,
      DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.DETAILS
    );
    const testInclusions =
      testInfo?.inclusions == null
        ? [Number(itemId)]
        : testInfo?.inclusions?.length > 0
        ? testInfo?.inclusions
        : [Number(testInfo?.inclusions)];

    const addedItems = {
      id: `${itemId}`,
      mou: 1,
      name: cmsTestDetails?.diagnosticItemName || testInfo?.ItemName,
      price: price,
      specialPrice: specialPrice! | price,
      circlePrice: circlePrice,
      circleSpecialPrice: circleSpecialPrice,
      discountPrice: discountPrice,
      discountSpecialPrice: discountSpecialPrice,
      thumbnail: cmsTestDetails?.diagnosticItemImageUrl,
      collectionMethod: TEST_COLLECTION_TYPE.HC,
      groupPlan: testInfo?.promoteCircle
        ? DIAGNOSTIC_GROUP_PLAN.CIRCLE
        : testInfo?.promoteDiscount
        ? DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
        : DIAGNOSTIC_GROUP_PLAN.ALL,
      packageMrp: Number(testInfo?.packageMrp!),
      inclusions: testInclusions,
      isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
    };

    isModify &&
      setModifiedPatientCart?.([
        {
          patientId: modifiedOrder?.patientId,
          cartItems: cartItems?.concat(addedItems),
        },
      ]);
    addCartItem?.(addedItems);

    if (movedFrom === AppRoutes.CartPage && changeCTA) {
      isModify
        ? props.navigation.navigate(AppRoutes.CartPage, {
            orderDetails: modifiedOrder,
          })
        : props.navigation.navigate(AppRoutes.AddPatients);
    }
  }

  function onPressRemoveFromCart() {
    if (diagnosticServiceabilityData?.city != '') {
      return;
    }
    removeCartItem!(`${itemId}`);
  }

  const renderExpressSlots = () => {
    return (
      <View style={styles.outerExpressView}>
        <View style={styles.innerExpressView}>
          <ExpressSlotClock style={styles.expressSlotIcon} />
          <Text style={styles.expressSlotText}>{expressSlotMsg}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{
        ...theme.viewStyles.container,
      }}
    >
      {!errorState ? (
        <>
          {renderHeader()}
          {expressSlotMsg != '' ? renderExpressSlots() : null}
          {renderBreadCrumb()}
          <ScrollView
            bounces={false}
            keyboardDismissMode="on-drag"
            style={{ marginBottom: 60 }}
            ref={scrollViewRef}
            scrollEventThrottle={16}
            onScroll={(event) => {
              // show price if price is scrolled off the screen
              priceViewRef?.current &&
                priceViewRef?.current?.measure(
                  (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                    setShowBottomBar(pagey - screenHeight / 10 < priceHeight);
                  }
                );
            }}
          >
            {!_.isEmpty(testInfo) && !!cmsTestDetails && renderItemCard()}
            {renderDescriptionCard()}
            {!!cmsTestDetails?.diagnosticFAQs && cmsTestDetails?.diagnosticFAQs?.length > 0
              ? renderFAQView()
              : null}
            {!!cmsTestDetails?.diagnosticWidgetsData &&
            cmsTestDetails?.diagnosticWidgetsData?.length > 0
              ? renderWidgetsView()
              : null}
          </ScrollView>
          <StickyBottomComponent>
            {showBottomBar && renderPriceView(true)}
            <Button
              title={
                isAlreadyPartOfOrder
                  ? 'ALREADY ADDED'
                  : movedFrom === AppRoutes.CartPage && changeCTA
                  ? 'ADD & PROCEED TO CART'
                  : isAddedToCart
                  ? 'PROCEED TO CART'
                  : 'ADD TO CART'
              }
              onPress={() =>
                isAlreadyPartOfOrder
                  ? props.navigation.navigate(AppRoutes.CartPage, {
                      orderDetails: modifiedOrder,
                    })
                  : movedFrom === AppRoutes.CartPage && changeCTA
                  ? onPressAddToCart()
                  : isAddedToCart
                  ? isModify
                    ? props.navigation.navigate(AppRoutes.CartPage, {
                        orderDetails: modifiedOrder,
                      })
                    : props.navigation.navigate(AppRoutes.AddPatients)
                  : onPressAddToCart()
              }
              style={showBottomBar ? { width: '70%' } : {}}
            />
          </StickyBottomComponent>
        </>
      ) : (
        <>
          {renderHeader()}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Card
              cardContainer={{ marginTop: 0 }}
              heading={string.common.uhOh}
              description={'Test Details are not Available!'}
              descriptionTextStyle={{ fontSize: 14 }}
              headingTextStyle={{ fontSize: 14 }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: theme.colors.WHITE,
    height: 'auto',
    paddingHorizontal: 20,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  personDetailStyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.25,
    marginTop: 4,
  },
  pendingIconStyle: { height: 15, width: 15, resizeMode: 'contain' },
  notificationCard: {
    ...theme.viewStyles.cardViewStyle,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
  },
  descriptionCardOuterView: {
    width: screenWidth * 0.9,
    ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
    padding: 16,
    elevation: 10,
    margin: 16,
    flex: 1,
  },
  packageDescriptionHeading: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 16.5 : 18, theme.colors.SHERPA_BLUE, 1, 25),
    textAlign: 'left',
    marginBottom: '2%',
  },
  packageDescriptionText: {
    ...theme.viewStyles.text('L', 13, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  overViewContainer: {
    marginTop: 10,
  },
  readMoreTouch: { alignSelf: 'flex-end', marginTop: 10 },
  readMoreText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 14 : 15, theme.colors.APP_YELLOW, 1, 20),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  flexRowView: { flexDirection: 'row', justifyContent: 'space-between' },
  rowStyle: { flexDirection: 'row' },
  slashedPriceText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE),
    lineHeight: 21,
    textAlign: 'left',
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.SHERPA_BLUE),
    lineHeight: 21,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  circleLogoIcon: {
    height: 20,
    width: isSmallDevice ? 32 : 36,
    resizeMode: 'contain',
  },
  savingsText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10.5 : 11, theme.colors.APP_GREEN),
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'center',
  },
  midCardView: { flexDirection: 'row', height: 60, width: '90%' },
  clockIconStyle: {
    height: 17,
    width: 17,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    marginVertical: '4%',
  },
  midCardTextView: {
    flexDirection: 'column',
    marginHorizontal: '3%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  reportTimeText: {
    ...theme.viewStyles.text('M', 11, theme.colors.SHERPA_BLUE, 0.5, 13),
    textAlign: 'left',
    letterSpacing: 0.25,
  },
  reportTime: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 16),
    textAlign: 'left',
    letterSpacing: 0.25,
    marginVertical: 4,
  },
  bottomCardView: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  infoIconStyle: { height: 17, width: 17, resizeMode: 'contain' },
  preTestingText: {
    ...theme.viewStyles.text('M', 11, '#FF637B', 1, 15),
    textAlign: 'left',
    letterSpacing: 0.25,
    marginHorizontal: '3%',
  },
  itemNameText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 16.5 : 18, theme.colors.SHERPA_BLUE, 1, 25),
    textAlign: 'left',
  },
  inclusionsView: { width: '100%', marginVertical: '4%' },
  testIncludedText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 0.5, 18),
    textAlign: 'left',
    marginTop: '1%',
    letterSpacing: 0.25,
    marginBottom: '3%',
  },
  inclusionsBullet: {
    color: '#007C9D',
    fontSize: 6,
    textAlign: 'center',
    paddingTop: 3,
  },
  inclusionsItemText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 11.5 : 12, '#007C9D', 1, 17),
    letterSpacing: 0,
    marginBottom: '1.5%',
    marginHorizontal: '3%',
  },
  parameterText: {
    ...theme.viewStyles.text('R', isSmallDevice ? 10.5 : 11, '#007C9D', 1, 15),
    letterSpacing: 0,
    marginBottom: '1.5%',
    marginHorizontal: '3%',
  },
  moreText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12 : 13, theme.colors.APP_YELLOW, 1, 15),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  showLessText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 12 : 13, theme.colors.APP_YELLOW, 1, 15),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
    marginTop: '2%',
    marginLeft: '5%',
  },
  breadCrumbContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  faqHeadingText: {
    ...theme.viewStyles.text('SB', 16, '#02475B', 1, 20, 0.35),
    marginTop: 10,
  },
  widgetHeading: {
    ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
  },
  faqLine: {
    marginVertical: 8,
    borderTopColor: '#02475B',
    opacity: 0.3,
    borderTopWidth: 1,
  },
  outerExpressView: { backgroundColor: theme.colors.APP_GREEN, marginBottom: 2 },
  innerExpressView: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    width: '97%',
  },
  expressSlotIcon: { width: 37, height: 37, resizeMode: 'contain' },
  expressSlotText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.WHITE, 1, 18),
    marginLeft: 16,
  },
});
